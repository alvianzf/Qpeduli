const express = require("express");
const { grantCreatorRole } = require("../utils/creator");
const { kycBlock } = require("../utils/kyc");
const { kepriArea, KEPRI_ONLY_MESSAGE } = require("../utils/region");
const { isStaff } = require("../middleware/roleMiddleware");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { addKarma } = require("../utils/karma");

const router = express.Router();

const ownerSelect = {
  id: true,
  username: true,
  name: true,
  city: true,
  avatarColor: true,
  role: true,
  karma: true,
  isVerified: true,
  createdAt: true,
};

const include = {
  owner: { select: ownerSelect },
  guarantor: { select: ownerSelect },
  rewards: { orderBy: { order: "asc" } },
  milestones: { orderBy: { order: "asc" } },
  updates: { include: { author: { select: ownerSelect } }, orderBy: { createdAt: "asc" } },
};

// Public listing: only projects an admin/guarantor has activated (or finished).
router.get("/", async (req, res, next) => {
  try {
    const projects = await prisma.campaign.findMany({
      where: { kind: "MODAL_USAHA", status: { in: ["ACTIVE", "COMPLETED"] } },
      include,
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// Projects the signed-in user created, including ones still awaiting verification.
router.get("/mine", authMiddleware, async (req, res, next) => {
  try {
    const projects = await prisma.campaign.findMany({
      where: { kind: "MODAL_USAHA", ownerId: req.user.id },
      include,
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const project = await prisma.campaign.findFirst({
      where: { id: Number(req.params.id), kind: "MODAL_USAHA" },
      include,
    });
    if (!project) return res.status(404).json({ error: "Usaha tidak ditemukan." });

    const isPublic = project.status !== "PENDING_VERIFICATION";
    const canSee = req.user && (isStaff(req.user) || req.user.id === project.ownerId);
    if (!isPublic && !canSee) return res.status(404).json({ error: "Usaha tidak ditemukan." });

    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authMiddleware,
  [
    body("title").trim().isLength({ min: 5, max: 120 }).withMessage("Nama usaha minimal 5 karakter."),
    body("story").trim().isLength({ min: 30 }).withMessage("Ceritakan usahamu minimal 30 karakter."),
    body("target").isFloat({ gt: 0 }).withMessage("Target dana tidak valid."),
    body("deadline").isISO8601().withMessage("Batas waktu tidak valid."),
    body("rewards").optional().isArray({ max: 8 }),
    body("rewards.*.title").optional().trim().notEmpty().withMessage("Judul hadiah wajib diisi."),
    body("rewards.*.minAmount").optional().isFloat({ gt: 0 }).withMessage("Nominal hadiah tidak valid."),
    body("milestones").isArray({ min: 1, max: 8 }).withMessage("Tambahkan minimal satu tahap pencairan."),
    body("milestones.*.label").trim().notEmpty().withMessage("Nama tahap wajib diisi."),
    body("milestones.*.amount").isFloat({ gt: 0 }).withMessage("Nominal tahap tidak valid."),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { title, story, businessType, city, emoji, target, deadline, rewards = [], milestones = [] } = req.body;

      if (new Date(deadline) <= new Date()) {
        return res.status(400).json({ error: "Batas waktu harus di masa depan." });
      }
      const blocked = await kycBlock(req.user);
      if (blocked) return res.status(403).json({ error: blocked });
      const area = kepriArea(city || req.user.city);
      if (!area) return res.status(400).json({ error: KEPRI_ONLY_MESSAGE });
      const milestoneTotal = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
      if (Math.abs(milestoneTotal - Number(target)) > 1) {
        return res.status(400).json({ error: "Total semua tahap harus sama dengan target dana." });
      }

      const project = await prisma.campaign.create({
        data: {
          kind: "MODAL_USAHA",
          title,
          story,
          businessType: businessType || null,
          city: area.name,
          emoji: emoji || null,
          ownerId: req.user.id,
          target,
          deadline: new Date(deadline),
          rewards: {
            create: rewards.map((r, i) => ({
              title: r.title,
              description: r.description || null,
              minAmount: r.minAmount,
              stock: r.stock ? Number(r.stock) : null,
              order: i,
            })),
          },
          milestones: {
            create: milestones.map((m, i) => ({ label: m.label, amount: m.amount, order: i })),
          },
        },
        include,
      });

      await grantCreatorRole(req.user.id);
      res.status(201).json({
        ...project,
        message: "Usaha terkirim dan menunggu verifikasi sebelum tampil ke publik.",
      });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/:id/updates",
  authMiddleware,
  [body("title").trim().notEmpty(), body("content").trim().notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const project = await prisma.campaign.findFirst({
        where: { id: Number(req.params.id), kind: "MODAL_USAHA" },
      });
      if (!project) return res.status(404).json({ error: "Usaha tidak ditemukan." });
      if (project.ownerId !== req.user.id && !isStaff(req.user)) {
        return res.status(403).json({ error: "Hanya pemilik usaha yang bisa memberi update." });
      }

      const update = await prisma.campaignUpdate.create({
        data: {
          campaignId: project.id,
          authorId: req.user.id,
          title: req.body.title,
          content: req.body.content,
        },
        include: { author: { select: ownerSelect } },
      });
      await addKarma(req.user.id, 5, "Update progres usaha");
      res.status(201).json(update);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
