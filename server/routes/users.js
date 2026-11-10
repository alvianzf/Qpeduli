const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const { audit } = require("../utils/settings");
const { requireRole, roleChangeError, ROLES } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const AVATAR_DIR = path.join(__dirname, "..", "uploads", "avatars");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1 } });

// Identify the image by its first bytes rather than trusting the client's mimetype.
function sniffImage(buf) {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 12 && buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") return "webp";
  return null;
}
const removeAvatarFile = (url) => {
  if (!url || !url.startsWith("/api/v1/uploads/avatars/")) return;
  fs.promises.unlink(path.join(AVATAR_DIR, path.basename(url))).catch(() => {});
};

const router = express.Router();

const publicSelect = {
  id: true,
  username: true,
  name: true,
  city: true,
  bio: true,
  avatarColor: true,
  avatarUrl: true,
  role: true,
  karma: true,
  isVerified: true,
  createdAt: true,
};

router.get("/:username", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        ...publicSelect,
        threads: { orderBy: { createdAt: "desc" }, include: { category: true, campaign: true } },
        donations: { where: { status: "CONFIRMED" }, include: { campaign: { include: { thread: true } } } },
      },
    });
    if (!user) return res.status(404).json({ error: "Pengguna tidak ditemukan." });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/me",
  authMiddleware,
  [
    body("name").optional().trim().isLength({ min: 2, max: 60 }).withMessage("Nama 2 sampai 60 karakter."),
    body("city").optional({ nullable: true }).trim().isLength({ max: 60 }),
    body("bio").optional({ nullable: true }).isLength({ max: 300 }).withMessage("Bio maksimal 300 karakter."),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, city, bio } = req.body;
      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: { name, city: city || null, bio: bio || null },
        select: publicSelect,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

router.post("/me/avatar", authMiddleware, (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "Foto maksimal 2 MB." : "Unggahan gagal." });
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Pilih foto terlebih dahulu." });
    const ext = sniffImage(req.file.buffer);
    if (!ext) return res.status(400).json({ error: "Format foto harus JPG, PNG, atau WEBP." });
    await fs.promises.mkdir(AVATAR_DIR, { recursive: true });
    const name = `${req.user.id}-${Date.now()}.${ext}`;
    await fs.promises.writeFile(path.join(AVATAR_DIR, name), req.file.buffer);
    const old = req.user.avatarUrl;
    const updated = await prisma.user.update({ where: { id: req.user.id }, data: { avatarUrl: `/api/v1/uploads/avatars/${name}` }, select: publicSelect });
    removeAvatarFile(old);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/me/avatar", authMiddleware, async (req, res, next) => {
  try {
    const old = req.user.avatarUrl;
    const updated = await prisma.user.update({ where: { id: req.user.id }, data: { avatarUrl: null }, select: publicSelect });
    removeAvatarFile(old);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// RBAC: only admins can grant Ksatria Komunitas verification or promote other admins.
router.patch(
  "/:id/role",
  authMiddleware,
  requireRole("ADMIN"),
  [body("role").isIn(ROLES)],
  validate,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
      if (!target) return res.status(404).json({ error: "Pengguna tidak ditemukan." });
      const denied = roleChangeError(req.user, target, req.body.role);
      if (denied) return res.status(403).json({ error: denied });
      const updated = await prisma.user.update({
        where: { id },
        data: {
          role: req.body.role,
          isVerified: req.body.role !== "USER" ? true : undefined,
        },
        select: publicSelect,
      });
      await audit(req, "peran.ubah", `@${updated.username}`, `${target.role} -> ${req.body.role}`);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
