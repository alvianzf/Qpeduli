const express = require("express");
const path = require("path");
const fs = require("fs");
const { body } = require("express-validator");
const prisma = require("../db");
const { requirePerm } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const { audit } = require("../utils/settings");
const { PRIVATE_DIR } = require("./kyc");

// KYC review. Mounted in routes/admin.js (authMiddleware + requireConsole already ran).
const router = express.Router();

router.get("/kyc", requirePerm("kyc"), async (req, res, next) => {
  try {
    const status = ["PENDING", "APPROVED", "REJECTED"].includes(req.query.status) ? req.query.status : "PENDING";
    const rows = await prisma.kyc.findMany({
      where: { status },
      include: { user: { select: { id: true, name: true, username: true, email: true, createdAt: true } } },
      orderBy: { submittedAt: "asc" },
      take: 200,
    });
    res.json(rows.map((k) => ({
      id: k.id, status: k.status, fullName: k.fullName, idLast4: k.idLast4, phone: k.phone, address: k.address,
      submittedAt: k.submittedAt, reviewedAt: k.reviewedAt, reviewedBy: k.reviewedBy, reviewNote: k.reviewNote, user: k.user,
    })));
  } catch (err) {
    next(err);
  }
});

// Streams a private KYC photo to a reviewer. Every access is written to the audit log.
router.get("/kyc/:id/file/:kind", requirePerm("kyc"), async (req, res, next) => {
  try {
    const k = await prisma.kyc.findUnique({ where: { id: Number(req.params.id) }, include: { user: { select: { username: true } } } });
    const name = k && (req.params.kind === "ktp" ? k.idPhoto : req.params.kind === "selfie" ? k.selfie : null);
    if (!name) return res.status(404).json({ error: "Berkas tidak ditemukan." });
    const file = path.join(PRIVATE_DIR, path.basename(name));
    if (!fs.existsSync(file)) return res.status(404).json({ error: "Berkas tidak ditemukan." });
    await audit(req, "kyc.lihat", `@${k.user.username}`, req.params.kind);
    res.setHeader("Cache-Control", "private, no-store");
    res.sendFile(file);
  } catch (err) {
    next(err);
  }
});

router.post("/kyc/:id/approve", requirePerm("kyc"), async (req, res, next) => {
  try {
    const k = await prisma.kyc.findUnique({ where: { id: Number(req.params.id) }, include: { user: { select: { username: true } } } });
    if (!k) return res.status(404).json({ error: "Pengajuan tidak ditemukan." });
    if (k.status !== "PENDING") return res.status(409).json({ error: "Pengajuan ini sudah diproses." });
    if (k.userId === req.user.id) return res.status(403).json({ error: "Kamu tidak bisa menyetujui verifikasimu sendiri." });
    const updated = await prisma.kyc.update({ where: { id: k.id }, data: { status: "APPROVED", reviewedBy: req.user.name, reviewedAt: new Date(), reviewNote: null } });
    await audit(req, "kyc.setujui", `@${k.user.username}`, `ID ...${k.idLast4}`);
    res.json({ id: updated.id, status: updated.status });
  } catch (err) {
    next(err);
  }
});

router.post("/kyc/:id/reject", requirePerm("kyc"), [body("note").trim().isLength({ min: 5, max: 300 }).withMessage("Alasan penolakan wajib diisi (min. 5 karakter).")], validate, async (req, res, next) => {
  try {
    const k = await prisma.kyc.findUnique({ where: { id: Number(req.params.id) }, include: { user: { select: { username: true } } } });
    if (!k) return res.status(404).json({ error: "Pengajuan tidak ditemukan." });
    if (k.status !== "PENDING") return res.status(409).json({ error: "Pengajuan ini sudah diproses." });
    const updated = await prisma.kyc.update({ where: { id: k.id }, data: { status: "REJECTED", reviewedBy: req.user.name, reviewedAt: new Date(), reviewNote: req.body.note.trim() } });
    await audit(req, "kyc.tolak", `@${k.user.username}`, req.body.note.trim());
    res.json({ id: updated.id, status: updated.status });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
