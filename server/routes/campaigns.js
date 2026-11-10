const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");
const { requireRole, requirePerm } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const { addKarma } = require("../utils/karma");
const { ownsCampaign } = require("../utils/creator");
const { isStaff } = require("../middleware/roleMiddleware");

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
  requirePerm("donasi"),
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

router.post("/:id/milestones/:milestoneId/release", authMiddleware, requirePerm("pencairan"), async (req, res, next) => {
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
  requirePerm("verifikasi", "kampanye"),
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

// ---- Campaign comments -------------------------------------------------------------------------
// Confirmed donors and the campaign's creator can comment. Donors choose to appear under their real
// name or anonymously; anonymous authors are hidden from everyone except staff.
async function viewerFlags(user, campaignId) {
  if (!user) return { isOwner: false, isDonor: false, staff: false };
  const [isOwner, donated] = await Promise.all([
    ownsCampaign(user.id, campaignId),
    prisma.donation.count({ where: { campaignId, donorId: user.id, status: "CONFIRMED" } }),
  ]);
  return { isOwner, isDonor: donated > 0, staff: isStaff(user) };
}

router.get("/:id/comments", optionalAuth, async (req, res, next) => {
  try {
    const campaignId = Number(req.params.id);
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { id: true } });
    if (!campaign) return res.status(404).json({ error: "Kampanye tidak ditemukan." });
    const flags = await viewerFlags(req.user, campaignId);
    const rows = await prisma.campaignComment.findMany({
      where: { campaignId },
      include: { author: { select: { id: true, name: true, username: true, avatarUrl: true, avatarColor: true, createdAt: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    const authorIds = [...new Set(rows.map((r) => r.authorId))];
    const donors = new Set((await prisma.donation.findMany({ where: { campaignId, status: "CONFIRMED", donorId: { in: authorIds } }, select: { donorId: true }, distinct: ["donorId"] })).map((d) => d.donorId));
    const ownerChecks = await Promise.all(authorIds.map(async (id) => [id, await ownsCampaign(id, campaignId)]));
    const owners = new Set(ownerChecks.filter(([, v]) => v).map(([id]) => id));
    res.json({
      canComment: flags.isOwner || flags.isDonor || flags.staff,
      viewer: { isOwner: flags.isOwner, isDonor: flags.isDonor },
      comments: rows.map((c) => {
        const hide = c.anonymous && !flags.staff;
        return {
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          anonymous: c.anonymous,
          isOwner: owners.has(c.authorId),
          isDonor: donors.has(c.authorId),
          mine: !!req.user && c.authorId === req.user.id,
          author: hide ? { name: "Donatur anonim", username: null, avatarUrl: null, avatarColor: "#64748B" } : c.author,
          realName: c.anonymous && flags.staff ? c.author.name : undefined,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/comments",
  authMiddleware,
  [body("content").trim().isLength({ min: 2, max: 1000 }).withMessage("Komentar 2 sampai 1000 karakter."), body("anonymous").optional().isBoolean()],
  validate,
  async (req, res, next) => {
    try {
      const campaignId = Number(req.params.id);
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { id: true } });
      if (!campaign) return res.status(404).json({ error: "Kampanye tidak ditemukan." });
      const flags = await viewerFlags(req.user, campaignId);
      if (!flags.isOwner && !flags.isDonor && !flags.staff) {
        return res.status(403).json({ error: "Hanya donatur yang sudah terkonfirmasi dan penggalang dana yang bisa berkomentar." });
      }
      // Only donors may hide their name; creators and staff always comment openly.
      const anonymous = Boolean(req.body.anonymous) && flags.isDonor && !flags.isOwner && !flags.staff;
      const created = await prisma.campaignComment.create({ data: { campaignId, authorId: req.user.id, content: req.body.content.trim(), anonymous } });
      res.status(201).json({ id: created.id, anonymous });
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/:id/comments/:commentId", authMiddleware, async (req, res, next) => {
  try {
    const comment = await prisma.campaignComment.findUnique({ where: { id: Number(req.params.commentId) } });
    if (!comment || comment.campaignId !== Number(req.params.id)) return res.status(404).json({ error: "Komentar tidak ditemukan." });
    if (comment.authorId !== req.user.id && !isStaff(req.user)) return res.status(403).json({ error: "Kamu tidak bisa menghapus komentar ini." });
    await prisma.campaignComment.delete({ where: { id: comment.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
