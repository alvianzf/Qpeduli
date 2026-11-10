const express = require("express");
const path = require("path");
const fs = require("fs");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { audit } = require("../utils/settings");
const { grantCreatorRole } = require("../utils/creator");
const { kycBlock } = require("../utils/kyc");
const { EVIDENCE_DIR } = require("../utils/evidence");

// Moderation: flags, removals, suspensions, bans (admin-approved) and campaign upgrade requests.
// Moderators act only inside the categories an admin assigned to them; admins act everywhere.
const router = express.Router();
router.use(authMiddleware);

const isAdmin = (u) => u.role === "ADMIN" || u.role === "SUPERADMIN";
const rank = (role) => ({ SUPERADMIN: 3, ADMIN: 2, MODERATOR: 1 }[role] || 0);

// req.scope: null = every category (admin), array = assigned category ids (moderator).
async function requireModerator(req, res, next) {
  try {
    if (isAdmin(req.user)) {
      req.scope = null;
      return next();
    }
    if (req.user.role !== "MODERATOR") return res.status(403).json({ error: "Khusus moderator dan admin." });
    const rows = await prisma.moderatorAssignment.findMany({ where: { userId: req.user.id }, select: { categoryId: true } });
    req.scope = rows.map((r) => r.categoryId);
    next();
  } catch (err) {
    next(err);
  }
}
const requireAdminRole = (req, res, next) => (isAdmin(req.user) ? next() : res.status(403).json({ error: "Khusus admin." }));
const inScope = (req, categoryId) => req.scope === null || req.scope.includes(categoryId);
const catFilter = (req) => (req.scope === null ? {} : { categoryId: { in: req.scope } });

router.get("/me", async (req, res, next) => {
  try {
    if (!isAdmin(req.user) && req.user.role !== "MODERATOR") return res.json({ moderator: false, categories: [] });
    const cats = isAdmin(req.user)
      ? await prisma.category.findMany({ select: { id: true, name: true, slug: true } })
      : (await prisma.moderatorAssignment.findMany({ where: { userId: req.user.id }, include: { category: { select: { id: true, name: true, slug: true } } } })).map((a) => a.category);
    res.json({ moderator: true, admin: isAdmin(req.user), categories: cats });
  } catch (err) {
    next(err);
  }
});

// Evidence download is open to the requester as well as reviewers, so it sits before the moderator-only guard.
router.get("/campaign-requests/:id/evidence/:index", async (req, res, next) => {
  try {
    const cr = await prisma.campaignRequest.findUnique({ where: { id: Number(req.params.id) }, include: { thread: { select: { categoryId: true } } } });
    if (!cr) return res.status(404).json({ error: "Tidak ditemukan." });
    let allowed = cr.requesterId === req.user.id || isAdmin(req.user);
    if (!allowed && req.user.role === "MODERATOR") {
      allowed = !!(await prisma.moderatorAssignment.findFirst({ where: { userId: req.user.id, categoryId: cr.thread.categoryId } }));
    }
    if (!allowed) return res.status(403).json({ error: "Tidak diizinkan." });
    const f = (Array.isArray(cr.evidence) ? cr.evidence : [])[Number(req.params.index)];
    if (!f) return res.status(404).json({ error: "Berkas tidak ditemukan." });
    const file = path.join(EVIDENCE_DIR, path.basename(f.file));
    if (!fs.existsSync(file)) return res.status(404).json({ error: "Berkas tidak ditemukan." });
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Type", f.mime);
    res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(f.name)}`);
    res.sendFile(file);
  } catch (err) {
    next(err);
  }
});

router.use(requireModerator);

router.get("/overview", async (req, res, next) => {
  try {
    const threadScope = catFilter(req);
    const [flags, requests, bans, suspensions] = await Promise.all([
      prisma.flag.findMany({ where: { status: "OPEN" }, select: { targetType: true, targetId: true } }),
      prisma.campaignRequest.count({ where: { status: "PENDING", thread: threadScope } }),
      isAdmin(req.user) ? prisma.sanction.count({ where: { status: "PENDING_APPROVAL" } }) : prisma.sanction.count({ where: { status: "PENDING_APPROVAL", createdById: req.user.id } }),
      prisma.sanction.count({ where: { type: "SUSPEND", status: "ACTIVE", until: { gt: new Date() } } }),
    ]);
    const open = (await flagTargets(flags.map((f) => ({ ...f })), req)).filter(Boolean).length;
    res.json({ openFlags: open, pendingRequests: requests, pendingBans: bans, activeSuspensions: suspensions });
  } catch (err) {
    next(err);
  }
});

// Resolves flag targets to {thread/comment, category} and drops those outside the moderator's scope.
async function flagTargets(flags, req) {
  const threadIds = flags.filter((f) => f.targetType === "THREAD").map((f) => f.targetId);
  const commentIds = flags.filter((f) => f.targetType === "COMMENT").map((f) => f.targetId);
  const [threads, comments] = await Promise.all([
    prisma.thread.findMany({ where: { id: { in: threadIds } }, include: { author: { select: { id: true, name: true, username: true } }, category: { select: { name: true } } } }),
    prisma.comment.findMany({ where: { id: { in: commentIds } }, include: { author: { select: { id: true, name: true, username: true } }, thread: { select: { id: true, title: true, categoryId: true, category: { select: { name: true } } } } } }),
  ]);
  return flags.map((f) => {
    if (f.targetType === "THREAD") {
      const t = threads.find((x) => x.id === f.targetId);
      if (!t || !inScope(req, t.categoryId)) return null;
      return { ...f, preview: { threadId: t.id, title: t.title, text: t.content.slice(0, 280), images: t.images, author: t.author, category: t.category.name, removed: !!t.removedAt } };
    }
    const c = comments.find((x) => x.id === f.targetId);
    if (!c || !inScope(req, c.thread.categoryId)) return null;
    return { ...f, preview: { threadId: c.thread.id, title: c.thread.title, text: c.content.slice(0, 280), images: c.imageUrl ? [c.imageUrl] : [], author: c.author, category: c.thread.category.name, removed: !!c.removedAt } };
  });
}

router.get("/flags", async (req, res, next) => {
  try {
    const status = ["OPEN", "RESOLVED", "DISMISSED"].includes(req.query.status) ? req.query.status : "OPEN";
    const flags = await prisma.flag.findMany({ where: { status }, include: { reporter: { select: { name: true, username: true } } }, orderBy: { createdAt: "desc" }, take: 200 });
    res.json((await flagTargets(flags, req)).filter(Boolean));
  } catch (err) {
    next(err);
  }
});

async function setRemoved(type, id, removedAt, reason) {
  if (type === "THREAD") return prisma.thread.update({ where: { id }, data: { removedAt, removedReason: reason } });
  return prisma.comment.update({ where: { id }, data: { removedAt, removedReason: reason } });
}
async function categoryOf(type, id) {
  if (type === "THREAD") return (await prisma.thread.findUnique({ where: { id }, select: { categoryId: true } }))?.categoryId;
  return (await prisma.comment.findUnique({ where: { id }, select: { thread: { select: { categoryId: true } } } }))?.thread.categoryId;
}

router.post("/flags/:id/resolve", [body("action").isIn(["remove", "dismiss"]), body("reason").optional().isString().isLength({ max: 300 })], validate, async (req, res, next) => {
  try {
    const flag = await prisma.flag.findUnique({ where: { id: Number(req.params.id) } });
    if (!flag) return res.status(404).json({ error: "Laporan tidak ditemukan." });
    const cat = await categoryOf(flag.targetType, flag.targetId);
    if (cat === undefined || !inScope(req, cat)) return res.status(403).json({ error: "Di luar komunitas yang kamu moderasi." });
    if (flag.status !== "OPEN") return res.status(409).json({ error: "Laporan ini sudah diproses." });
    const remove = req.body.action === "remove";
    if (remove) await setRemoved(flag.targetType, flag.targetId, new Date(), req.body.reason?.trim() || flag.reason);
    await prisma.flag.updateMany({
      where: { targetType: flag.targetType, targetId: flag.targetId, status: "OPEN" },
      data: { status: remove ? "RESOLVED" : "DISMISSED", resolvedBy: req.user.name, resolution: remove ? "Dihapus" : "Ditolak", resolvedAt: new Date() },
    });
    await audit(req, remove ? "moderasi.hapus" : "moderasi.tolak-laporan", `${flag.targetType.toLowerCase()} #${flag.targetId}`, req.body.reason || flag.reason);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

for (const [seg, type] of [["threads", "THREAD"], ["comments", "COMMENT"]]) {
  router.post(`/${seg}/:id/remove`, [body("reason").trim().isLength({ min: 3, max: 300 }).withMessage("Alasan wajib diisi.")], validate, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const cat = await categoryOf(type, id);
      if (cat === undefined) return res.status(404).json({ error: "Tidak ditemukan." });
      if (!inScope(req, cat)) return res.status(403).json({ error: "Di luar komunitas yang kamu moderasi." });
      await setRemoved(type, id, new Date(), req.body.reason.trim());
      await prisma.flag.updateMany({ where: { targetType: type, targetId: id, status: "OPEN" }, data: { status: "RESOLVED", resolvedBy: req.user.name, resolution: "Dihapus", resolvedAt: new Date() } });
      await audit(req, "moderasi.hapus", `${type.toLowerCase()} #${id}`, req.body.reason.trim());
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });
  router.post(`/${seg}/:id/restore`, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const cat = await categoryOf(type, id);
      if (cat === undefined) return res.status(404).json({ error: "Tidak ditemukan." });
      if (!inScope(req, cat)) return res.status(403).json({ error: "Di luar komunitas yang kamu moderasi." });
      await setRemoved(type, id, null, null);
      await audit(req, "moderasi.pulihkan", `${type.toLowerCase()} #${id}`);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });
}

// ---- Sanctions ---------------------------------------------------------------------------------
async function sanctionTarget(req, res) {
  const id = Number(req.params.id);
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, username: true, role: true, bannedAt: true } });
  if (!target) return void res.status(404).json({ error: "Pengguna tidak ditemukan." });
  if (target.id === req.user.id) return void res.status(400).json({ error: "Kamu tidak bisa menjatuhkan sanksi ke dirimu sendiri." });
  if (rank(target.role) >= rank(req.user.role)) return void res.status(403).json({ error: "Kamu tidak bisa menjatuhkan sanksi ke peran setara atau lebih tinggi." });
  if (req.scope !== null) {
    const [t, c] = await Promise.all([
      prisma.thread.count({ where: { authorId: id, categoryId: { in: req.scope } } }),
      prisma.comment.count({ where: { authorId: id, thread: { categoryId: { in: req.scope } } } }),
    ]);
    if (t + c === 0) return void res.status(403).json({ error: "Pengguna ini belum aktif di komunitas yang kamu moderasi." });
  }
  return target;
}

router.post("/users/:id/suspend", [body("days").isInt({ min: 1, max: 30 }).withMessage("Lama penangguhan 1 sampai 30 hari."), body("reason").trim().isLength({ min: 3, max: 300 }).withMessage("Alasan wajib diisi.")], validate, async (req, res, next) => {
  try {
    const target = await sanctionTarget(req, res);
    if (!target) return;
    const until = new Date(Date.now() + Number(req.body.days) * 86400000);
    await prisma.$transaction([
      prisma.sanction.create({ data: { userId: target.id, type: "SUSPEND", reason: req.body.reason.trim(), until, status: "ACTIVE", createdBy: req.user.name, createdById: req.user.id } }),
      prisma.user.update({ where: { id: target.id }, data: { suspendedUntil: until } }),
    ]);
    await audit(req, "sanksi.tangguhkan", `@${target.username}`, `${req.body.days} hari: ${req.body.reason.trim()}`);
    res.status(201).json({ ok: true, until });
  } catch (err) {
    next(err);
  }
});

router.post("/users/:id/ban", [body("reason").trim().isLength({ min: 5, max: 300 }).withMessage("Alasan blokir wajib diisi (min. 5 karakter).")], validate, async (req, res, next) => {
  try {
    const target = await sanctionTarget(req, res);
    if (!target) return;
    if (target.bannedAt) return res.status(409).json({ error: "Pengguna ini sudah diblokir." });
    const pending = await prisma.sanction.count({ where: { userId: target.id, type: "BAN", status: "PENDING_APPROVAL" } });
    if (pending) return res.status(409).json({ error: "Usulan blokir untuk pengguna ini sedang menunggu persetujuan admin." });
    const direct = isAdmin(req.user);
    await prisma.$transaction([
      prisma.sanction.create({ data: { userId: target.id, type: "BAN", reason: req.body.reason.trim(), status: direct ? "ACTIVE" : "PENDING_APPROVAL", createdBy: req.user.name, createdById: req.user.id, decidedBy: direct ? req.user.name : null, decidedAt: direct ? new Date() : null } }),
      ...(direct ? [prisma.user.update({ where: { id: target.id }, data: { bannedAt: new Date() } })] : []),
    ]);
    await audit(req, direct ? "sanksi.blokir" : "sanksi.usul-blokir", `@${target.username}`, req.body.reason.trim());
    res.status(201).json({ ok: true, pending: !direct });
  } catch (err) {
    next(err);
  }
});

router.get("/sanctions", async (req, res, next) => {
  try {
    const status = ["ACTIVE", "PENDING_APPROVAL", "REJECTED", "LIFTED"].includes(req.query.status) ? req.query.status : "PENDING_APPROVAL";
    const where = { status, ...(isAdmin(req.user) ? {} : { createdById: req.user.id }) };
    const rows = await prisma.sanction.findMany({ where, include: { user: { select: { id: true, name: true, username: true, role: true } } }, orderBy: { createdAt: "desc" }, take: 200 });
    const now = new Date();
    res.json(rows.map((s) => ({ ...s, effective: s.type === "SUSPEND" && s.status === "ACTIVE" && s.until < now ? "EXPIRED" : s.status })));
  } catch (err) {
    next(err);
  }
});

router.post("/sanctions/:id/approve", requireAdminRole, async (req, res, next) => {
  try {
    const s = await prisma.sanction.findUnique({ where: { id: Number(req.params.id) }, include: { user: { select: { username: true, role: true } } } });
    if (!s || s.type !== "BAN") return res.status(404).json({ error: "Usulan tidak ditemukan." });
    if (s.status !== "PENDING_APPROVAL") return res.status(409).json({ error: "Usulan ini sudah diproses." });
    if (rank(s.user.role) >= rank(req.user.role)) return res.status(403).json({ error: "Tidak bisa memblokir peran setara atau lebih tinggi." });
    await prisma.$transaction([
      prisma.sanction.update({ where: { id: s.id }, data: { status: "ACTIVE", decidedBy: req.user.name, decidedAt: new Date() } }),
      prisma.user.update({ where: { id: s.userId }, data: { bannedAt: new Date() } }),
    ]);
    await audit(req, "sanksi.setujui-blokir", `@${s.user.username}`, s.reason);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/sanctions/:id/reject", requireAdminRole, async (req, res, next) => {
  try {
    const s = await prisma.sanction.findUnique({ where: { id: Number(req.params.id) }, include: { user: { select: { username: true } } } });
    if (!s) return res.status(404).json({ error: "Usulan tidak ditemukan." });
    if (s.status !== "PENDING_APPROVAL") return res.status(409).json({ error: "Usulan ini sudah diproses." });
    await prisma.sanction.update({ where: { id: s.id }, data: { status: "REJECTED", decidedBy: req.user.name, decidedAt: new Date() } });
    await audit(req, "sanksi.tolak-blokir", `@${s.user.username}`);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Lifting: admins can lift anything; moderators only suspensions they imposed.
router.post("/sanctions/:id/lift", async (req, res, next) => {
  try {
    const s = await prisma.sanction.findUnique({ where: { id: Number(req.params.id) }, include: { user: { select: { username: true } } } });
    if (!s || s.status !== "ACTIVE") return res.status(404).json({ error: "Sanksi aktif tidak ditemukan." });
    if (!isAdmin(req.user) && !(s.type === "SUSPEND" && s.createdById === req.user.id)) return res.status(403).json({ error: "Kamu hanya bisa mencabut penangguhan yang kamu buat." });
    await prisma.$transaction([
      prisma.sanction.update({ where: { id: s.id }, data: { status: "LIFTED", decidedBy: req.user.name, decidedAt: new Date() } }),
      prisma.user.update({ where: { id: s.userId }, data: s.type === "BAN" ? { bannedAt: null } : { suspendedUntil: null } }),
    ]);
    await audit(req, "sanksi.cabut", `@${s.user.username}`, s.type);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---- Campaign upgrade requests ---------------------------------------------------------------------
const evidenceList = (e) => (Array.isArray(e) ? e : []).map((f, i) => ({ index: i, name: f.name, mime: f.mime, size: f.size }));

router.get("/campaign-requests", async (req, res, next) => {
  try {
    const status = ["PENDING", "APPROVED", "REJECTED"].includes(req.query.status) ? req.query.status : "PENDING";
    const rows = await prisma.campaignRequest.findMany({
      where: { status, thread: catFilter(req) },
      include: {
        thread: { select: { id: true, title: true, content: true, images: true, category: { select: { name: true } } } },
        requester: { select: { id: true, name: true, username: true, createdAt: true, kyc: { select: { status: true, fullName: true, idLast4: true } } } },
      },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    res.json(rows.map((r) => ({
      id: r.id, status: r.status, target: Number(r.target), deadline: r.deadline, message: r.message, createdAt: r.createdAt,
      reviewedBy: r.reviewedBy, reviewNote: r.reviewNote, evidence: evidenceList(r.evidence), thread: r.thread, requester: r.requester,
    })));
  } catch (err) {
    next(err);
  }
});

router.post("/campaign-requests/:id/approve", [body("note").optional().isString().isLength({ max: 300 })], validate, async (req, res, next) => {
  try {
    const r = await prisma.campaignRequest.findUnique({ where: { id: Number(req.params.id) }, include: { thread: { select: { id: true, categoryId: true, title: true, removedAt: true, campaign: { select: { id: true } } } }, requester: true } });
    if (!r) return res.status(404).json({ error: "Permintaan tidak ditemukan." });
    if (!inScope(req, r.thread.categoryId)) return res.status(403).json({ error: "Di luar komunitas yang kamu moderasi." });
    if (r.status !== "PENDING") return res.status(409).json({ error: "Permintaan ini sudah diproses." });
    if (r.thread.campaign) return res.status(409).json({ error: "Thread ini sudah menjadi kampanye." });
    if (r.thread.removedAt) return res.status(409).json({ error: "Thread ini sudah dihapus." });
    const blocked = await kycBlock(r.requester);
    if (blocked) return res.status(409).json({ error: "Penggalang belum lolos verifikasi identitas." });

    await prisma.$transaction([
      prisma.campaign.create({
        data: {
          threadId: r.threadId,
          kind: "AKSI_SOSIAL",
          city: r.city,
          target: r.target,
          deadline: r.deadline,
          status: "ACTIVE",
          milestones: { create: [{ label: "Pencairan penuh", amount: r.target, order: 0 }] },
        },
      }),
      prisma.thread.update({ where: { id: r.threadId }, data: { isAksiSosial: true } }),
      prisma.campaignRequest.update({ where: { id: r.id }, data: { status: "APPROVED", reviewedBy: req.user.name, reviewNote: req.body.note?.trim() || null, reviewedAt: new Date() } }),
    ]);
    await grantCreatorRole(r.requesterId);
    await audit(req, "kampanye.upgrade-setujui", `thread #${r.threadId}`, `@${r.requester.username}`);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/campaign-requests/:id/reject", [body("note").trim().isLength({ min: 5, max: 300 }).withMessage("Alasan penolakan wajib diisi (min. 5 karakter).")], validate, async (req, res, next) => {
  try {
    const r = await prisma.campaignRequest.findUnique({ where: { id: Number(req.params.id) }, include: { thread: { select: { categoryId: true } }, requester: { select: { username: true } } } });
    if (!r) return res.status(404).json({ error: "Permintaan tidak ditemukan." });
    if (!inScope(req, r.thread.categoryId)) return res.status(403).json({ error: "Di luar komunitas yang kamu moderasi." });
    if (r.status !== "PENDING") return res.status(409).json({ error: "Permintaan ini sudah diproses." });
    await prisma.campaignRequest.update({ where: { id: r.id }, data: { status: "REJECTED", reviewedBy: req.user.name, reviewNote: req.body.note.trim(), reviewedAt: new Date() } });
    await audit(req, "kampanye.upgrade-tolak", `thread #${r.threadId}`, req.body.note.trim());
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
