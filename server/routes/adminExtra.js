const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { requireRole } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const { getSettings, audit } = require("../utils/settings");

// Mounted inside routes/admin.js, so authMiddleware + requireRole("ADMIN") already ran.
const router = express.Router();

// ---- Analytics ---------------------------------------------------------------------------------
router.get("/analytics", async (req, res, next) => {
  try {
    const days = Math.min(365, Math.max(7, Number(req.query.days) || 30));
    const since = new Date(Date.now() - days * 86400000);
    const [daily, signups, newCampaigns, byKind, byStatus, topCampaigns, topCities, donationStatus, categories] = await Promise.all([
      prisma.$queryRaw`SELECT to_char(date_trunc('day', COALESCE("confirmedAt","createdAt")), 'YYYY-MM-DD') AS d, COUNT(*)::int AS n, COALESCE(SUM(amount),0)::float AS total
        FROM donations WHERE status='CONFIRMED' AND COALESCE("confirmedAt","createdAt") >= ${since} GROUP BY 1 ORDER BY 1`,
      prisma.$queryRaw`SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS d, COUNT(*)::int AS n FROM users WHERE "createdAt" >= ${since} GROUP BY 1 ORDER BY 1`,
      prisma.$queryRaw`SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS d, COUNT(*)::int AS n FROM campaigns WHERE "createdAt" >= ${since} GROUP BY 1 ORDER BY 1`,
      prisma.$queryRaw`SELECT kind::text AS kind, COUNT(*)::int AS n, COALESCE(SUM(collected),0)::float AS collected, COALESCE(SUM(target),0)::float AS target FROM campaigns GROUP BY kind`,
      prisma.campaign.groupBy({ by: ["status"], _count: true }),
      prisma.$queryRaw`SELECT c.id, COALESCE(c.title, t.title, 'Kampanye #' || c.id) AS title, c.kind::text AS kind, c.collected::float AS collected, c.target::float AS target, c."donorCount" AS donors
        FROM campaigns c LEFT JOIN threads t ON t.id = c."threadId" ORDER BY c.collected DESC LIMIT 5`,
      prisma.$queryRaw`SELECT COALESCE(NULLIF(TRIM(city),''),'Tidak diketahui') AS city, COUNT(*)::int AS n, COALESCE(SUM(collected),0)::float AS collected FROM campaigns GROUP BY 1 ORDER BY collected DESC LIMIT 8`,
      prisma.donation.groupBy({ by: ["status"], _count: true, _sum: { amount: true } }),
      prisma.$queryRaw`SELECT c.name, COUNT(t.id)::int AS n FROM categories c LEFT JOIN threads t ON t."categoryId" = c.id GROUP BY c.id, c.name ORDER BY n DESC`,
    ]);
    // Fill empty days so charts have a continuous axis.
    const fill = (rows) => {
      const map = Object.fromEntries(rows.map((r) => [r.d, r]));
      const out = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        out.push({ d, n: map[d]?.n || 0, total: map[d]?.total || 0 });
      }
      return out;
    };
    const confirmed = donationStatus.find((x) => x.status === "CONFIRMED");
    const failed = donationStatus.find((x) => x.status === "FAILED");
    const decided = (confirmed?._count || 0) + (failed?._count || 0);
    res.json({
      days,
      donations: fill(daily),
      signups: fill(signups),
      campaigns: fill(newCampaigns),
      byKind,
      byStatus: byStatus.map((x) => ({ status: x.status, n: x._count })),
      topCampaigns,
      topCities,
      donationStatus: donationStatus.map((x) => ({ status: x.status, n: x._count, total: Number(x._sum.amount || 0) })),
      confirmRate: decided ? (confirmed?._count || 0) / decided : null,
      categories,
    });
  } catch (err) {
    next(err);
  }
});

// ---- Reports (CSV) -----------------------------------------------------------------------------
const csvCell = (v) => {
  if (v === null || v === undefined) return "";
  let s = v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // neutralise spreadsheet formula injection
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const sendCsv = (res, name, header, rows) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send("﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n"));
};
const dateRange = (q) => {
  const from = q.from ? new Date(q.from) : null;
  const to = q.to ? new Date(`${q.to}T23:59:59.999Z`) : null;
  const w = {};
  if (from && !isNaN(from)) w.gte = from;
  if (to && !isNaN(to)) w.lte = to;
  return Object.keys(w).length ? { createdAt: w } : {};
};

router.get("/reports/:type", async (req, res, next) => {
  try {
    const { type } = req.params;
    if (type === "donasi") {
      const rows = await prisma.donation.findMany({
        where: dateRange(req.query),
        include: { donor: { select: { name: true, email: true } }, campaign: { select: { id: true, title: true, kind: true, thread: { select: { title: true } } } } },
        orderBy: { createdAt: "desc" },
        take: 50000,
      });
      await audit(req, "laporan.unduh", "donasi", `${rows.length} baris`);
      return sendCsv(res, "laporan-donasi", ["ID", "Referensi", "Tanggal", "Dikonfirmasi", "Status", "Nominal", "Kampanye", "Jenis", "Donatur", "Email", "Anonim"],
        rows.map((d) => [d.id, `QP-${d.id}`, d.createdAt, d.confirmedAt, d.status, Number(d.amount), d.campaign.title || d.campaign.thread?.title || `#${d.campaign.id}`, d.campaign.kind, d.donor?.name || "Tamu", d.donor?.email || "", d.anonymous ? "ya" : "tidak"]));
    }
    if (type === "kampanye") {
      const rows = await prisma.campaign.findMany({
        where: dateRange(req.query),
        include: { thread: { select: { title: true } }, owner: { select: { name: true } }, milestones: true },
        orderBy: { createdAt: "desc" },
      });
      await audit(req, "laporan.unduh", "kampanye", `${rows.length} baris`);
      return sendCsv(res, "laporan-kampanye", ["ID", "Judul", "Jenis", "Status", "Kota", "Pemilik", "Target", "Terkumpul", "Dicairkan", "Donatur", "Tahap cair", "Tahap total", "Batas waktu", "Dibuat"],
        rows.map((c) => [c.id, c.title || c.thread?.title || "", c.kind, c.status, c.city || "", c.owner?.name || "", Number(c.target), Number(c.collected), Number(c.disbursed), c.donorCount, c.milestones.filter((m) => m.released).length, c.milestones.length, c.deadline, c.createdAt]));
    }
    if (type === "pengguna") {
      const rows = await prisma.user.findMany({ where: dateRange(req.query), orderBy: { createdAt: "desc" }, take: 50000 });
      await audit(req, "laporan.unduh", "pengguna", `${rows.length} baris`);
      return sendCsv(res, "laporan-pengguna", ["ID", "Nama", "Username", "Email", "Kota", "Peran", "Terverifikasi", "Karma", "Bergabung"],
        rows.map((u) => [u.id, u.name, u.username, u.email, u.city || "", u.role, u.isVerified ? "ya" : "tidak", u.karma, u.createdAt]));
    }
    res.status(404).json({ error: "Jenis laporan tidak dikenal." });
  } catch (err) {
    next(err);
  }
});

// ---- Settings (any admin reads, superadmin writes) ---------------------------------------------
router.get("/settings", async (req, res, next) => {
  try {
    res.json(await getSettings());
  } catch (err) {
    next(err);
  }
});

router.put(
  "/settings",
  requireRole("SUPERADMIN"),
  [
    body("paymentInstructions").optional().isString().isLength({ max: 1000 }),
    body("minDonation").optional().isInt({ min: 0, max: 100000000 }),
    body("registrationOpen").optional().isBoolean(),
    body("announcement").optional().isString().isLength({ max: 280 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const changed = [];
      for (const key of ["paymentInstructions", "minDonation", "registrationOpen", "announcement"]) {
        if (req.body[key] === undefined) continue;
        const value = String(req.body[key]);
        await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
        changed.push(key);
      }
      await audit(req, "pengaturan.ubah", "platform", changed.join(", "));
      res.json(await getSettings());
    } catch (err) {
      next(err);
    }
  },
);

// ---- Audit log (superadmin only) ---------------------------------------------------------------
router.get("/audit", requireRole("SUPERADMIN"), async (req, res, next) => {
  try {
    res.json(await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 }));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
