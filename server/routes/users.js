const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

const publicSelect = {
  id: true,
  username: true,
  name: true,
  city: true,
  bio: true,
  avatarColor: true,
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
  [body("bio").optional().isLength({ max: 300 })],
  validate,
  async (req, res, next) => {
    try {
      const { name, city, bio } = req.body;
      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: { name, city, bio },
        select: publicSelect,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// RBAC: only admins can grant Ksatria Komunitas verification or promote other admins.
router.patch(
  "/:id/role",
  authMiddleware,
  requireRole("ADMIN"),
  [body("role").isIn(["USER", "KSATRIA_KOMUNITAS", "ADMIN"])],
  validate,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const updated = await prisma.user.update({
        where: { id },
        data: {
          role: req.body.role,
          isVerified: req.body.role !== "USER" ? true : undefined,
        },
        select: publicSelect,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
