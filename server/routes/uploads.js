const express = require("express");
const path = require("path");
const { authMiddleware } = require("../middleware/authMiddleware");
const { memoryUpload, saveImage } = require("../utils/images");

// Images attached to community threads and comments. Public, served from /api/v1/uploads/community.
const router = express.Router();
const DIR = path.join(__dirname, "..", "uploads", "community");
const upload = memoryUpload(3 * 1024 * 1024);

router.post(
  "/image",
  authMiddleware,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "Gambar maksimal 3 MB." : "Unggahan gagal." });
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: "Pilih gambar terlebih dahulu." });
      const name = await saveImage(DIR, String(req.user.id), req.file.buffer);
      res.status(201).json({ url: `/api/v1/uploads/community/${name}` });
    } catch (err) {
      if (err.status === 400) return res.status(400).json({ error: err.message });
      next(err);
    }
  },
);

module.exports = router;
