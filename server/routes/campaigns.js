const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const { addKarma } = require("../utils/karma");

const { getSettings, audit } = require("../utils/settings");

const router = express.Router();

router.post(
  "/:id/donate",
  optionalAuth,
  [body("amount").isFloat({ gt: 0 }).withMessage("Nominal donasi tidak valid.")],
  validate,
  async (req, res, next) => {
    try {
      const campaignId = Number(req.params.id);
      const { amount, anonymous, rewardId } = req.body;
      const settings = await getSettings();
      if (Number(amount) < settings.minDonation) {
        return res.status(400).json({ error: `Donasi minimal Rp${settings.minDonation.toLocaleString("id-ID")}.` });
      }

      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign) return res.status(404).json({ error: "Kampanye tidak ditemukan." });
      if (campaign.kind === "MODAL_USAHA" && campaign.status !== "ACTIVE") {
        return res.status(409).json({ error: "Usaha ini belum menerima dukungan." });
      }

      let reward = null;
      if (rewardId) {
        reward = await prisma.reward.findUnique({ where: { id: Number(rewardId) } });
        if (!reward || reward.campaignId !== campaignId) {
          return res.status(400).json({ error: "Hadiah tidak valid." });
        }
        if (Number(amount) < Number(reward.minAmount)) {
          return res.status(400).json({ error: "Nominal kurang dari minimal untuk hadiah ini." });
        }
        if (reward.stock !== null) {
          const taken = await prisma.donation.count({
            where: { rewardId: reward.id, status: { not: "FAILED" } },
          });
          if (taken >= reward.stock) return res.status(409).json({ error: "Stok hadiah ini sudah habis." });
        }
      }

      // A 3-digit code added to the amount lets an admin match a bank transfer to a pledge.
      const base = Number(amount);
      let payAmount = base;
      for (let i = 0; i < 25; i += 1) {
        const candidate = base + 1 + Math.floor(Math.random() * 999);
        const clash = await prisma.donation.count({ where: { status: "PENDING", amount: candidate } });
        if (!clash) {
          payAmount = candidate;
          break;
        }
      }

      const donation = await prisma.donation.create({
        data: {
          campaignId,
          donorId: req.user ? req.user.id : null,
          rewardId: reward ? reward.id : null,
          amount: payAmount,
          anonymous: Boolean(anonymous) || !req.user,
        },
      });

      res.status(201).json({
        donation,
        payAmount,
        reference: `QP-${donation.id}`,
        instructions: settings.paymentInstructions || null,
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

      await audit(req, "donasi.konfirmasi", `donasi #${donationId}`, `Kampanye #${campaignId}, Rp${Number(donation.amount).toLocaleString("id-ID")}`);
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

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (Number(campaign.disbursed) + Number(milestone.amount) > Number(campaign.collected)) {
      return res.status(409).json({ error: "Dana terkumpul belum cukup untuk mencairkan milestone ini." });
    }

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

    await audit(req, "milestone.cair", `milestone #${milestoneId}`, `Kampanye #${campaignId}, Rp${Number(milestone.amount).toLocaleString("id-ID")}`);
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
      await audit(req, "kampanye.status", `kampanye #${campaignId}`, req.body.status);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
