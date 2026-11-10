const express = require("express");
const path = require("path");
const fs = require("fs");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { memoryUpload, saveImage } = require("../utils/images");
const { fingerprint } = require("../utils/kyc");

// Member-facing KYC. Photos go to a PRIVATE directory (never statically served); only reviewers can read them.
const router = express.Router();
router.use(authMiddleware);

const PRIVATE_DIR = path.join(__dirname, "..", "private", "kyc");
const upload = memoryUpload(4 * 1024 * 1024, 2).fields([{ name: "idPhoto", maxCount: 1 }, { name: "selfie", maxCount: 1 }]);

const view = (k) =>
  k && {
    status: k.status,
    fullName: k.fullName,
    idLast4: k.idLast4,
    phone: k.phone,
    address: k.address,
    reviewNote: k.status === "REJECTED" ? k.reviewNote : null,
    submittedAt: k.submittedAt,
    reviewedAt: k.reviewedAt,
  };

router.get("/me", async (req, res, next) => {
  try {
    const k = await prisma.kyc.findUnique({ where: { userId: req.user.id } });
    res.json({ status: k ? k.status : "NONE", kyc: view(k) || null });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "Foto maksimal 4 MB." : "Unggahan gagal." });
      next();
    });
  },
  [
    body("fullName").trim().isLength({ min: 3, max: 100 }).withMessage("Nama lengkap sesuai KTP wajib diisi."),
    body("idNumber").matches(/^\d{16}$/).withMessage("NIK harus 16 digit angka."),
    body("phone").matches(/^(\+62|62|0)8\d{7,12}$/).withMessage("Nomor HP tidak valid (contoh 081234567890)."),
    body("address").trim().isLength({ min: 10, max: 300 }).withMessage("Alamat sesuai KTP minimal 10 karakter."),
    body("consent").equals("true").withMessage("Kamu perlu menyetujui pemrosesan data untuk verifikasi."),
  ],
  validate,
  async (req, res, next) => {
    try {
      const existing = await prisma.kyc.findUnique({ where: { userId: req.user.id } });
      if (existing && existing.status !== "REJECTED") {
        return res.status(409).json({ error: existing.status === "APPROVED" ? "Identitasmu sudah terverifikasi." : "Pengajuanmu sedang ditinjau." });
      }
      const idPhoto = req.files?.idPhoto?.[0];
      const selfie = req.files?.selfie?.[0];
      if (!idPhoto || !selfie) return res.status(400).json({ error: "Foto KTP dan swafoto sambil memegang KTP wajib diunggah." });

      const fp = fingerprint(req.body.idNumber);
      const dup = await prisma.kyc.findFirst({ where: { idFingerprint: fp, userId: { not: req.user.id }, status: { in: ["PENDING", "APPROVED"] } }, select: { id: true } });
      if (dup) return res.status(409).json({ error: "NIK ini sudah dipakai pada akun lain." });

      const idName = await saveImage(PRIVATE_DIR, `${req.user.id}-ktp`, idPhoto.buffer);
      const selfieName = await saveImage(PRIVATE_DIR, `${req.user.id}-selfie`, selfie.buffer);
      // Replace files from an earlier rejected attempt.
      for (const old of [existing?.idPhoto, existing?.selfie]) if (old) fs.promises.unlink(path.join(PRIVATE_DIR, old)).catch(() => {});

      const data = {
        fullName: req.body.fullName.trim(),
        idFingerprint: fp,
        idLast4: req.body.idNumber.slice(-4),
        phone: req.body.phone,
        address: req.body.address.trim(),
        idPhoto: idName,
        selfie: selfieName,
        status: "PENDING",
        reviewNote: null,
        reviewedBy: null,
        reviewedAt: null,
        submittedAt: new Date(),
      };
      const saved = existing
        ? await prisma.kyc.update({ where: { userId: req.user.id }, data })
        : await prisma.kyc.create({ data: { ...data, userId: req.user.id } });
      res.status(201).json({ status: saved.status, kyc: view(saved) });
    } catch (err) {
      if (err.status === 400) return res.status(400).json({ error: err.message });
      next(err);
    }
  },
);

module.exports = router;
module.exports.PRIVATE_DIR = PRIVATE_DIR;
