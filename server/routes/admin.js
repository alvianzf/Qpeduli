const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();
router.use(authMiddleware, requireRole("ADMIN"));

const personSelect = { id: true, username: true, name: true, city: true, role: true, isVerified: true };

router.get("/overview", async (req, res, next) => {
  try {
    const [pendingCampaigns, pendingDonations, activeCampaigns, users, collected, disbursed] = await Promise.all([
      prisma.campaign.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.donation.count({ where: { status: "PENDING" } }),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
      prisma.user.count(),
      prisma.campaign.aggregate({ _sum: { collected: true } }),
      prisma.campaign.aggregate({ _sum: { disbursed: true } }),
    ]);
    res.json({
      pendingCampaigns,
      pendingDonations,
      activeCampaigns,
      users,
      totalCollected: collected._sum.collected || 0,
      totalDisbursed: disbursed._sum.disbursed || 0,
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
    res.json(await prisma.donation.update({ where: { id }, data: { status: "FAILED" } }));
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
  [body("role").optional().isIn(["USER", "KSATRIA_KOMUNITAS", "ADMIN"]), body("isVerified").optional().isBoolean()],
  validate,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (id === req.user.id && req.body.role && req.body.role !== "ADMIN") {
        return res.status(400).json({ error: "Kamu tidak bisa menurunkan peran admin milikmu sendiri." });
      }
      const data = {};
      if (req.body.role) data.role = req.body.role;
      if (req.body.isVerified !== undefined) data.isVerified = Boolean(req.body.isVerified);
      const user = await prisma.user.update({ where: { id }, data, select: personSelect });
      res.json(user);
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Pengguna tidak ditemukan." });
      next(err);
    }
  },
);

module.exports = router;
