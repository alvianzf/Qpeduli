const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { addKarma } = require("../utils/karma");
const { ownedWhere, ownsCampaign } = require("../utils/creator");

// Creator console API: everything here is scoped to campaigns the signed-in user owns.
const router = express.Router();
router.use(authMiddleware);

const num = (v) => Number(v || 0);

router.get("/campaigns", async (req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: ownedWhere(req.user.id),
      include: { thread: { select: { id: true, title: true } }, milestones: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    const ids = campaigns.map((c) => c.id);
    const [byStatus, comments, reports] = await Promise.all([
      prisma.donation.groupBy({ by: ["campaignId", "status"], where: { campaignId: { in: ids } }, _count: true }),
      prisma.campaignComment.groupBy({ by: ["campaignId"], where: { campaignId: { in: ids } }, _count: true }),
      prisma.campaignUpdate.groupBy({ by: ["campaignId"], where: { campaignId: { in: ids }, isReport: true }, _count: true }),
    ]);
    const count = (rows, id, status) => rows.find((r) => r.campaignId === id && (!status || r.status === status))?._count || 0;
    res.json(
      campaigns.map((c) => ({
        id: c.id,
        kind: c.kind,
        title: c.title || c.thread?.title || `Kampanye #${c.id}`,
        threadId: c.threadId,
        status: c.status,
        city: c.city,
        target: num(c.target),
        collected: num(c.collected),
        disbursed: num(c.disbursed),
        available: num(c.collected) - num(c.disbursed),
        donorCount: c.donorCount,
        deadline: c.deadline,
        createdAt: c.createdAt,
        pendingDonations: count(byStatus, c.id, "PENDING"),
        confirmedDonations: count(byStatus, c.id, "CONFIRMED"),
        comments: count(comments, c.id),
        reports: count(reports, c.id),
        milestones: c.milestones.map((m) => ({ id: m.id, label: m.label, amount: num(m.amount), released: m.released, releasedAt: m.releasedAt })),
      })),
    );
  } catch (err) {
    next(err);
  }
});

// Confirmed donations. Donors who chose anonymity stay anonymous even to the creator.
router.get("/campaigns/:id/donations", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!(await ownsCampaign(req.user.id, id))) return res.status(404).json({ error: "Kampanye tidak ditemukan." });
    const rows = await prisma.donation.findMany({
      where: { campaignId: id, status: "CONFIRMED" },
      include: { donor: { select: { name: true, username: true } }, reward: { select: { title: true } } },
      orderBy: { confirmedAt: "desc" },
      take: 500,
    });
    res.json(
      rows.map((d) => ({
        id: d.id,
        amount: num(d.amount),
        at: d.confirmedAt || d.createdAt,
        donor: d.anonymous || !d.donor ? "Donatur anonim" : d.donor.name,
        username: d.anonymous || !d.donor ? null : d.donor.username,
        reward: d.reward?.title || null,
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.get("/campaigns/:id/reports", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!(await ownsCampaign(req.user.id, id))) return res.status(404).json({ error: "Kampanye tidak ditemukan." });
    const rows = await prisma.campaignUpdate.findMany({ where: { campaignId: id }, orderBy: { createdAt: "desc" } });
    res.json(rows.map((u) => ({ id: u.id, title: u.title, content: u.content, isReport: u.isReport, spent: u.spent === null ? null : num(u.spent), milestoneId: u.milestoneId, nextSteps: u.nextSteps, createdAt: u.createdAt })));
  } catch (err) {
    next(err);
  }
});

// Progress / use-of-funds report, submitted from the creator console wizard.
router.post(
  "/campaigns/:id/reports",
  [
    body("title").trim().isLength({ min: 5, max: 120 }).withMessage("Judul laporan 5 sampai 120 karakter."),
    body("content").trim().isLength({ min: 10, max: 2000 }).withMessage("Uraian kegiatan minimal 10 karakter."),
    body("spent").optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage("Dana terpakai tidak valid."),
    body("milestoneId").optional({ nullable: true, checkFalsy: true }).isInt(),
    body("nextSteps").optional({ nullable: true }).isString().isLength({ max: 1000 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const campaign = await prisma.campaign.findFirst({ where: { id, ...ownedWhere(req.user.id) }, include: { milestones: true } });
      if (!campaign) return res.status(404).json({ error: "Kampanye tidak ditemukan." });

      const spent = req.body.spent ? Number(req.body.spent) : null;
      if (spent !== null && spent > num(campaign.collected)) {
        return res.status(400).json({ error: "Dana terpakai tidak boleh melebihi dana terkumpul." });
      }
      let milestoneId = null;
      if (req.body.milestoneId) {
        const m = campaign.milestones.find((x) => x.id === Number(req.body.milestoneId));
        if (!m) return res.status(400).json({ error: "Tahap tidak valid untuk kampanye ini." });
        milestoneId = m.id;
      }
      const nextSteps = (req.body.nextSteps || "").trim() || null;

      // Compose a readable body so reports also read well on the public update feed.
      let content = req.body.content.trim();
      if (spent !== null) content += `\n\nDana terpakai: Rp${spent.toLocaleString("id-ID")}`;
      if (nextSteps) content += `\n\nLangkah berikutnya: ${nextSteps}`;

      const report = await prisma.campaignUpdate.create({
        data: { campaignId: id, authorId: req.user.id, title: req.body.title.trim(), content, isReport: true, spent, milestoneId, nextSteps },
      });
      await addKarma(req.user.id, 5, "Laporan penggunaan dana");
      res.status(201).json(report);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
