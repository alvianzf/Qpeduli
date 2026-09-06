const express = require("express");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator");
const prisma = require("../db");
const { signToken } = require("../utils/jwt");
const { authMiddleware } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { sendWelcomeEmail } = require("../utils/mailer");

const router = express.Router();

const AVATAR_COLORS = ["#2563EB", "#0EA5E9", "#6366F1", "#10B981", "#F59E0B", "#EC4899"];

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Email tidak valid."),
    body("username").isLength({ min: 3 }).withMessage("Username minimal 3 karakter."),
    body("name").notEmpty().withMessage("Nama wajib diisi."),
    body("password").isLength({ min: 6 }).withMessage("Kata sandi minimal 6 karakter."),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, username, name, password, city } = req.body;

      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });
      if (existing) {
        return res.status(409).json({ error: "Email atau username sudah terdaftar." });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

      const user = await prisma.user.create({
        data: { email, username, name, city, passwordHash, avatarColor },
      });

      const token = signToken(user);

      sendWelcomeEmail(user).catch((err) => console.error("Welcome email failed:", err.message));

      const { passwordHash: _, ...safeUser } = user;
      res.status(201).json({ user: safeUser, token });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/login",
  [
    body("identifier").notEmpty().withMessage("Email atau username wajib diisi."),
    body("password").notEmpty().withMessage("Kata sandi wajib diisi."),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { identifier, password } = req.body;

      const user = await prisma.user.findFirst({
        where: { OR: [{ email: identifier }, { username: identifier }] },
      });
      if (!user) {
        return res.status(401).json({ error: "Email/username atau kata sandi salah." });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Email/username atau kata sandi salah." });
      }

      const token = signToken(user);
      const { passwordHash: _, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/me", authMiddleware, (req, res) => {
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

module.exports = router;
