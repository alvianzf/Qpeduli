const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { isStaff } = require("../middleware/roleMiddleware");
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { addKarma } = require("../utils/karma");
const { kycBlock } = require("../utils/kyc");
const { kepriArea, KEPRI_ONLY_MESSAGE } = require("../utils/region");
const { uploader, storeEvidence, MAX_FILES } = require("../utils/evidence");

const router = express.Router();

const userSelect = {
  id: true,
  username: true,
  name: true,
  city: true,
  avatarColor: true,
  avatarUrl: true,
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

const IMG_PREFIX = "/api/v1/uploads/community/";
const cleanImages = (arr) => (Array.isArray(arr) ? arr.filter((u) => typeof u === "string" && u.startsWith(IMG_PREFIX) && !u.includes("..")).slice(0, 4) : []);
const cleanImage = (u) => (typeof u === "string" && u.startsWith(IMG_PREFIX) && !u.includes("..") ? u : null);

// Love (+1) / heartbreak (-1) tallies for a set of threads or comments, plus the viewer's own reaction.
async function reactionMap(type, ids, viewerId) {
  const map = {};
  for (const id of ids) map[id] = { love: 0, broken: 0, score: 0, mine: 0 };
  if (!ids.length) return map;
  const rows = await prisma.reaction.groupBy({ by: ["targetId", "value"], where: { targetType: type, targetId: { in: ids } }, _count: true });
  for (const r of rows) {
    const m = map[r.targetId];
    if (r.value > 0) m.love = r._count;
    else m.broken = r._count;
    m.score = m.love - m.broken;
  }
  if (viewerId) {
    const mine = await prisma.reaction.findMany({ where: { userId: viewerId, targetType: type, targetId: { in: ids } }, select: { targetId: true, value: true } });
    for (const r of mine) map[r.targetId].mine = r.value;
  }
  return map;
}

// Can this user moderate content in this category?
async function canModerate(user, categoryId) {
  if (!user) return false;
  if (isStaff(user)) return true;
  if (user.role !== "MODERATOR") return false;
  return !!(await prisma.moderatorAssignment.findFirst({ where: { userId: user.id, categoryId } }));
}

async function shapeThreads(threads, viewer) {
  const tIds = threads.map((t) => t.id);
  const cIds = threads.flatMap((t) => (t.comments || []).map((c) => c.id));
  const [tr, cr] = await Promise.all([reactionMap("THREAD", tIds, viewer?.id), reactionMap("COMMENT", cIds, viewer?.id)]);
  const modCache = {};
  const out = [];
  for (const t of threads) {
    if (modCache[t.categoryId] === undefined) modCache[t.categoryId] = await canModerate(viewer, t.categoryId);
    const mod = modCache[t.categoryId];
    out.push({
      ...t,
      reactions: tr[t.id],
      canModerate: mod,
      comments: (t.comments || []).map((c) => ({
        ...c,
        reactions: cr[c.id],
        removed: !!c.removedAt,
        content: c.removedAt && !mod ? "" : c.content,
        imageUrl: c.removedAt && !mod ? null : c.imageUrl,
      })),
    });
  }
  return out;
}

router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const { category, filter } = req.query;
    const where = { removedAt: null };
    if (category) where.category = { slug: category };
    if (filter === "aksi") where.isAksiSosial = true;
    if (filter === "diskusi") where.isAksiSosial = false;

    const threads = await prisma.thread.findMany({ where, include: threadInclude, orderBy: { createdAt: "desc" } });
    res.json(await shapeThreads(threads, req.user));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.thread.findUnique({ where: { id }, select: { id: true, removedAt: true, categoryId: true } });
    if (!existing) return res.status(404).json({ error: "Thread tidak ditemukan." });
    if (existing.removedAt && !(await canModerate(req.user, existing.categoryId))) return res.status(404).json({ error: "Thread tidak ditemukan." });
    const thread = await prisma.thread.update({ where: { id }, data: { views: { increment: 1 } }, include: threadInclude });
    res.json((await shapeThreads([thread], req.user))[0]);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authMiddleware,
  [
    body("categoryId").isInt().withMessage("Pilih komunitas."),
    body("title").isLength({ min: 5 }).withMessage("Judul minimal 5 karakter."),
    body("content").isLength({ min: 10 }).withMessage("Isi thread minimal 10 karakter."),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { categoryId, title, content, images } = req.body;
      // Threads are always plain discussions. A thread starter asks for a campaign afterwards,
      // with proof, through POST /threads/:id/campaign-request.
      const thread = await prisma.thread.create({
        data: { categoryId: Number(categoryId), authorId: req.user.id, title, content, isAksiSosial: false, images: cleanImages(images) },
        include: threadInclude,
      });
      res.status(201).json((await shapeThreads([thread], req.user))[0]);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/:id/comments",
  authMiddleware,
  [body("content").optional({ nullable: true }).isString().isLength({ max: 2000 })],
  validate,
  async (req, res, next) => {
    try {
      const threadId = Number(req.params.id);
      const content = String(req.body.content || "").trim();
      const imageUrl = cleanImage(req.body.imageUrl);
      if (!content && !imageUrl) return res.status(400).json({ error: "Komentar tidak boleh kosong." });
      const thread = await prisma.thread.findUnique({ where: { id: threadId }, select: { id: true, removedAt: true } });
      if (!thread || thread.removedAt) return res.status(404).json({ error: "Thread tidak ditemukan." });
      const comment = await prisma.comment.create({
        data: { threadId, authorId: req.user.id, content, imageUrl },
        include: { author: { select: userSelect } },
      });
      await addKarma(req.user.id, 1, "Memberi komentar");
      res.status(201).json({ ...comment, reactions: { love: 0, broken: 0, score: 0, mine: 0 }, removed: false });
    } catch (err) {
      next(err);
    }
  },
);

// ---- Reputation: love or heartbreak on a thread / comment -------------------------------------------
const reactValid = [body("value").isIn([1, -1, 0]).withMessage("Reaksi tidak valid.")];

async function react(req, res, next, type, id, authorId, removed) {
  try {
    if (removed) return res.status(404).json({ error: "Konten tidak ditemukan." });
    if (authorId === req.user.id) return res.status(400).json({ error: "Kamu tidak bisa menilai kontenmu sendiri." });
    const value = Number(req.body.value);
    const key = { userId_targetType_targetId: { userId: req.user.id, targetType: type, targetId: id } };
    if (value === 0) await prisma.reaction.delete({ where: key }).catch(() => {});
    else await prisma.reaction.upsert({ where: key, update: { value }, create: { userId: req.user.id, targetType: type, targetId: id, value } });
    res.json((await reactionMap(type, [id], req.user.id))[id]);
  } catch (err) {
    next(err);
  }
}

router.post("/:id/react", authMiddleware, reactValid, validate, async (req, res, next) => {
  const t = await prisma.thread.findUnique({ where: { id: Number(req.params.id) }, select: { id: true, authorId: true, removedAt: true } });
  if (!t) return res.status(404).json({ error: "Thread tidak ditemukan." });
  react(req, res, next, "THREAD", t.id, t.authorId, !!t.removedAt);
});

router.post("/comments/:commentId/react", authMiddleware, reactValid, validate, async (req, res, next) => {
  const c = await prisma.comment.findUnique({ where: { id: Number(req.params.commentId) }, select: { id: true, authorId: true, removedAt: true } });
  if (!c) return res.status(404).json({ error: "Komentar tidak ditemukan." });
  react(req, res, next, "COMMENT", c.id, c.authorId, !!c.removedAt);
});

// ---- Flags: anyone signed in can report; moderators decide -------------------------------------------
const flagValid = [body("reason").trim().isLength({ min: 3, max: 300 }).withMessage("Tulis alasan laporanmu (min. 3 karakter).")];

async function flag(req, res, next, type, id, authorId) {
  try {
    if (authorId === req.user.id) return res.status(400).json({ error: "Kamu tidak bisa melaporkan kontenmu sendiri." });
    const dup = await prisma.flag.findFirst({ where: { targetType: type, targetId: id, reporterId: req.user.id, status: "OPEN" } });
    if (dup) return res.status(409).json({ error: "Kamu sudah melaporkan ini. Moderator akan meninjaunya." });
    await prisma.flag.create({ data: { targetType: type, targetId: id, reporterId: req.user.id, reason: req.body.reason.trim() } });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

router.post("/:id/flag", authMiddleware, flagValid, validate, async (req, res, next) => {
  const t = await prisma.thread.findUnique({ where: { id: Number(req.params.id) }, select: { id: true, authorId: true } });
  if (!t) return res.status(404).json({ error: "Thread tidak ditemukan." });
  flag(req, res, next, "THREAD", t.id, t.authorId);
});

router.post("/comments/:commentId/flag", authMiddleware, flagValid, validate, async (req, res, next) => {
  const c = await prisma.comment.findUnique({ where: { id: Number(req.params.commentId) }, select: { id: true, authorId: true } });
  if (!c) return res.status(404).json({ error: "Komentar tidak ditemukan." });
  flag(req, res, next, "COMMENT", c.id, c.authorId);
});

// ---- Upgrade a thread to a campaign (starter requests, moderators/admins approve) --------------------
router.get("/:id/campaign-request", authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const t = await prisma.thread.findUnique({ where: { id }, select: { authorId: true } });
    if (!t) return res.status(404).json({ error: "Thread tidak ditemukan." });
    if (t.authorId !== req.user.id && !isStaff(req.user)) return res.json({ request: null });
    const r = await prisma.campaignRequest.findFirst({ where: { threadId: id }, orderBy: { createdAt: "desc" } });
    res.json({
      request: r && {
        id: r.id, status: r.status, target: Number(r.target), deadline: r.deadline, city: r.city, message: r.message, reviewNote: r.reviewNote, reviewedBy: r.reviewedBy, createdAt: r.createdAt,
        evidence: (Array.isArray(r.evidence) ? r.evidence : []).map((f, i) => ({ index: i, name: f.name, mime: f.mime, size: f.size })),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/campaign-request",
  authMiddleware,
  (req, res, next) => {
    uploader(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "Setiap berkas maksimal 8 MB." : err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT" ? `Maksimal ${MAX_FILES} berkas.` : "Unggahan gagal." });
      next();
    });
  },
  [
    body("target").isFloat({ min: 100000 }).withMessage("Target dana minimal Rp100.000."),
    body("deadline").isISO8601().withMessage("Tenggat tidak valid."),
    body("city").notEmpty().withMessage("Pilih wilayah kampanye."),
    body("message").trim().isLength({ min: 50, max: 2000 }).withMessage("Jelaskan alasan dan rencana penggunaan dana (min. 50 karakter)."),
  ],
  validate,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const thread = await prisma.thread.findUnique({ where: { id }, include: { campaign: { select: { id: true } } } });
      if (!thread || thread.removedAt) return res.status(404).json({ error: "Thread tidak ditemukan." });
      if (thread.authorId !== req.user.id) return res.status(403).json({ error: "Hanya pembuat thread yang bisa mengajukan kampanye." });
      if (thread.campaign) return res.status(409).json({ error: "Thread ini sudah menjadi kampanye." });
      const pending = await prisma.campaignRequest.count({ where: { threadId: id, status: "PENDING" } });
      if (pending) return res.status(409).json({ error: "Permintaan sebelumnya masih ditinjau." });

      const blocked = await kycBlock(req.user);
      if (blocked) return res.status(403).json({ error: blocked });

      const area = kepriArea(req.body.city);
      if (!area) return res.status(400).json({ error: KEPRI_ONLY_MESSAGE });

      const deadline = new Date(req.body.deadline);
      if (!(deadline > new Date()) || deadline > new Date(Date.now() + 366 * 86400000)) return res.status(400).json({ error: "Tenggat harus di masa depan dan paling lama 1 tahun." });

      const files = req.files || [];
      if (!files.length) return res.status(400).json({ error: "Unggah minimal 1 bukti (foto atau dokumen) agar moderator bisa menilai." });
      const evidence = await storeEvidence(files, `req-${req.user.id}`);

      const r = await prisma.campaignRequest.create({
        data: { threadId: id, requesterId: req.user.id, target: req.body.target, deadline, city: area.name, message: req.body.message.trim(), evidence },
      });
      res.status(201).json({ id: r.id, status: r.status });
    } catch (err) {
      if (err.status === 400) return res.status(400).json({ error: err.message });
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
      const isAdmin = isStaff(req.user);
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
