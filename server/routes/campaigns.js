const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const { addKarma } = require("../utils/karma");

const router = express.Router();

router.post(
  "/:id/donate",
  optionalAuth,
  [body("amount").isFloat({ gt: 0 }).withMessage("Nominal donasi tidak valid.")],
  validate,
  async (req, res, next) => {
    try {
      const campaignId = Number(req.params.id);
      const { amount, anonymous } = req.body;

      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign) return res.status(404).json({ error: "Kampanye tidak ditemukan." });

      const donation = await prisma.donation.create({
        data: {
          campaignId,
          donorId: req.user ? req.user.id : null,
          amount,
          anonymous: Boolean(anonymous) || !req.user,
        },
      });

      res.status(201).json({
        donation,
        message: "Donasi tercatat, menunggu konfirmasi pembayaran oleh admin.",
      });
    } catch (err) {
      next(err);
    }
  },
);

// Admin confirms a donation was actually received (manual reconciliation until a
// payment gateway is wired up), then it counts toward the campaign total.
router.post(
  "/:id/donations/:donationId/confirm",
  authMiddleware,
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const campaignId = Number(req.params.id);
      const donationId = Number(req.params.donationId);

      const donation = await prisma.donation.findUnique({ where: { id: donationId } });
      if (!donation || donation.campaignId !== campaignId) {
        return res.status(404).json({ error: "Donasi tidak ditemukan." });
      }
      if (donation.status === "CONFIRMED") {
        return res.status(409).json({ error: "Donasi sudah dikonfirmasi." });
      }

      const [updatedDonation] = await prisma.$transaction([
        prisma.donation.update({
          where: { id: donationId },
          data: { status: "CONFIRMED", confirmedAt: new Date() },
        }),
        prisma.campaign.update({
          where: { id: campaignId },
          data: {
            collected: { increment: donation.amount },
            donorCount: { increment: 1 },
          },
        }),
      ]);

      if (donation.donorId) {
        const karmaPoints = Math.max(1, Math.min(10, Math.round(Number(donation.amount) / 100000)));
        await addKarma(donation.donorId, karmaPoints, "Donasi ke kampanye");
      }

      res.json(updatedDonation);
    } catch (err) {
      next(err);
    }
  },
);

router.post("/:id/guarantor", authMiddleware, requireRole("KSATRIA_KOMUNITAS", "ADMIN"), async (req, res, next) => {
  try {
    const campaignId = Number(req.params.id);
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return res.status(404).json({ error: "Kampanye tidak ditemukan." });
    if (campaign.guarantorId) return res.status(409).json({ error: "Kampanye ini sudah punya guarantor." });

    const guarantorId = req.body.guarantorId ? Number(req.body.guarantorId) : req.user.id;

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { guarantorId, status: "ACTIVE" },
      include: { guarantor: true },
    });

    await addKarma(guarantorId, 20, "Menjadi guarantor kampanye");
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/milestones/:milestoneId/release", authMiddleware, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const campaignId = Number(req.params.id);
    const milestoneId = Number(req.params.milestoneId);

    const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone || milestone.campaignId !== campaignId) {
      return res.status(404).json({ error: "Milestone tidak ditemukan." });
    }
    if (milestone.released) return res.status(409).json({ error: "Milestone sudah dicairkan." });

    const [updatedMilestone] = await prisma.$transaction([
      prisma.milestone.update({
        where: { id: milestoneId },
        data: { released: true, releasedAt: new Date() },
      }),
      prisma.campaign.update({
        where: { id: campaignId },
        data: { disbursed: { increment: milestone.amount } },
      }),
    ]);

    res.json(updatedMilestone);
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("ADMIN"),
  [body("status").isIn(["PENDING_VERIFICATION", "ACTIVE", "COMPLETED"])],
  validate,
  async (req, res, next) => {
    try {
      const campaignId = Number(req.params.id);
      const updated = await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: req.body.status },
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
