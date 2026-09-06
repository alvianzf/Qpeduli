const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { addKarma } = require("../utils/karma");

const router = express.Router();

const userSelect = {
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

const threadInclude = {
  author: { select: userSelect },
  category: true,
  campaign: {
    include: {
      milestones: { orderBy: { order: "asc" } },
      updates: { include: { author: { select: userSelect } }, orderBy: { createdAt: "asc" } },
      guarantor: { select: userSelect },
    },
  },
  comments: { include: { author: { select: userSelect } }, orderBy: { createdAt: "asc" } },
  _count: { select: { comments: true } },
};

router.get("/", async (req, res, next) => {
  try {
    const { category, filter } = req.query;
    const where = {};
    if (category) where.category = { slug: category };
    if (filter === "aksi") where.isAksiSosial = true;
    if (filter === "diskusi") where.isAksiSosial = false;

    const threads = await prisma.thread.findMany({
      where,
      include: threadInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json(threads);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const thread = await prisma.thread.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: threadInclude,
    });
    res.json(thread);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Thread tidak ditemukan." });
    next(err);
  }
});

router.post(
  "/",
  authMiddleware,
  [
    body("categoryId").isInt().withMessage("Kategori wajib dipilih."),
    body("title").isLength({ min: 5 }).withMessage("Judul minimal 5 karakter."),
    body("content").isLength({ min: 10 }).withMessage("Isi thread minimal 10 karakter."),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { categoryId, title, content, isAksiSosial, campaign } = req.body;

      const thread = await prisma.thread.create({
        data: {
          categoryId: Number(categoryId),
          authorId: req.user.id,
          title,
          content,
          isAksiSosial: Boolean(isAksiSosial),
          ...(isAksiSosial && campaign
            ? {
                campaign: {
                  create: {
                    target: campaign.target,
                    deadline: new Date(campaign.deadline),
                    milestones: {
                      create: (campaign.milestones || []).map((m, i) => ({
                        label: m.label,
                        amount: m.amount,
                        order: i,
                      })),
                    },
                  },
                },
              }
            : {}),
        },
        include: threadInclude,
      });

      res.status(201).json(thread);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/:id/comments",
  authMiddleware,
  [body("content").isLength({ min: 1 }).withMessage("Komentar tidak boleh kosong.")],
  validate,
  async (req, res, next) => {
    try {
      const threadId = Number(req.params.id);
      const comment = await prisma.comment.create({
        data: { threadId, authorId: req.user.id, content: req.body.content },
        include: { author: { select: userSelect } },
      });
      await addKarma(req.user.id, 1, "Memberi komentar");
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/:id/updates",
  authMiddleware,
  [
    body("title").notEmpty(),
    body("content").notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const threadId = Number(req.params.id);
      const thread = await prisma.thread.findUnique({ where: { id: threadId }, include: { campaign: true } });
      if (!thread || !thread.campaign) return res.status(404).json({ error: "Kampanye tidak ditemukan." });

      const isOwner = thread.authorId === req.user.id;
      const isAdmin = req.user.role === "ADMIN";
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Hanya pembuat thread yang bisa memberi update." });
      }

      const update = await prisma.campaignUpdate.create({
        data: {
          campaignId: thread.campaign.id,
          authorId: req.user.id,
          title: req.body.title,
          content: req.body.content,
        },
        include: { author: { select: userSelect } },
      });

      await addKarma(req.user.id, 5, "Update progres kampanye");
      res.status(201).json(update);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
