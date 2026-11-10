const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole, roleChangeError, ROLES } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const { audit } = require("../utils/settings");

const router = express.Router();
router.use(authMiddleware, requireRole("ADMIN"));
router.use(require("./adminExtra"));

const personSelect = { id: true, username: true, name: true, city: true, role: true, isVerified: true };

router.get("/overview", async (req, res, next) => {
  try {
    const [pendingCampaigns, pendingDonations, activeCampaigns, users, collected, disbursed, confirmed, donors, funded] = await Promise.all([
      prisma.campaign.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.donation.count({ where: { status: "PENDING" } }),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
      prisma.user.count(),
      prisma.campaign.aggregate({ _sum: { collected: true } }),
      prisma.campaign.aggregate({ _sum: { disbursed: true } }),
      prisma.donation.aggregate({ where: { status: "CONFIRMED" }, _count: true, _avg: { amount: true } }),
      prisma.donation.groupBy({ by: ["donorId"], where: { status: "CONFIRMED", donorId: { not: null } }, _count: true }),
      prisma.$queryRaw`SELECT COUNT(*)::int AS n FROM campaigns WHERE collected >= target AND target > 0`,
    ]);
    res.json({
      pendingCampaigns,
      pendingDonations,
      activeCampaigns,
      users,
      totalCollected: collected._sum.collected || 0,
      totalDisbursed: disbursed._sum.disbursed || 0,
      confirmedDonations: confirmed._count,
      avgDonation: confirmed._avg.amount || 0,
      donors: donors.length,
      repeatDonors: donors.filter((d) => d._count >= 2).length,
      fundedCampaigns: funded[0] ? funded[0].n : 0,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/campaigns", async (req, res, next) => {
  try {
    const { status, kind } = req.query;
    const where = {};
    if (status) where.status = status;
    if (kind) where.kind = kind;
    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        thread: { select: { id: true, title: true } },
        owner: { select: personSelect },
        guarantor: { select: personSelect },
        milestones: { orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
});

router.get("/donations", async (req, res, next) => {
  try {
    const status = req.query.status || "PENDING";
    const donations = await prisma.donation.findMany({
      where: { status },
      include: {
        donor: { select: personSelect },
        reward: { select: { id: true, title: true } },
        campaign: { select: { id: true, kind: true, title: true, thread: { select: { title: true } } } },
      },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    res.json(donations);
  } catch (err) {
    next(err);
  }
});

router.post("/donations/:id/reject", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) return res.status(404).json({ error: "Donasi tidak ditemukan." });
    if (donation.status !== "PENDING") {
      return res.status(409).json({ error: "Hanya donasi yang menunggu yang bisa ditolak." });
    }
    const rejected = await prisma.donation.update({ where: { id }, data: { status: "FAILED" } });
    await audit(req, "donasi.tolak", `donasi #${id}`, `Rp${Number(donation.amount).toLocaleString("id-ID")}`);
    res.json(rejected);
  } catch (err) {
    next(err);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const users = await prisma.user.findMany({
      where: q
        ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { username: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
        : {},
      select: { ...personSelect, email: true, karma: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/users/:id",
  [body("role").optional().isIn(ROLES), body("isVerified").optional().isBoolean()],
  validate,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
      if (!target) return res.status(404).json({ error: "Pengguna tidak ditemukan." });
      if (req.body.role && req.body.role !== target.role) {
        const denied = roleChangeError(req.user, target, req.body.role);
        if (denied) return res.status(403).json({ error: denied });
      } else if (["ADMIN", "SUPERADMIN"].includes(target.role) && req.user.role !== "SUPERADMIN" && target.id !== req.user.id) {
        return res.status(403).json({ error: "Hanya superadmin yang bisa mengelola admin." });
      }
      const data = {};
      if (req.body.role) data.role = req.body.role;
      if (req.body.isVerified !== undefined) data.isVerified = Boolean(req.body.isVerified);
      const user = await prisma.user.update({ where: { id }, data, select: personSelect });
      await audit(req, "pengguna.ubah", `@${user.username}`, JSON.stringify(data));
      res.json(user);
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Pengguna tidak ditemukan." });
      next(err);
    }
  },
);

module.exports = router;
