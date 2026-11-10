const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { requireRole } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const { audit } = require("../utils/settings");

// Admins promote moderators and choose which communities (categories) each one moderates.
// Mounted in routes/admin.js (authMiddleware + requireConsole already ran).
const router = express.Router();
router.use("/moderators", requireRole("ADMIN"));

const shape = (u) => ({
  id: u.id,
  name: u.name,
  username: u.username,
  email: u.email,
  role: u.role,
  categoryIds: u.moderatedCategories.map((a) => a.categoryId),
});

router.get("/moderators", async (req, res, next) => {
  try {
    const [mods, categories] = await Promise.all([
      prisma.user.findMany({
        where: { OR: [{ role: "MODERATOR" }, { moderatedCategories: { some: {} } }] },
        select: { id: true, name: true, username: true, email: true, role: true, moderatedCategories: { select: { categoryId: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { id: "asc" } }),
    ]);
    res.json({ moderators: mods.map(shape), categories });
  } catch (err) {
    next(err);
  }
});

// Promote a member (or change an existing moderator's communities). No categories = back to a normal member.
router.put("/moderators/:userId", [body("categoryIds").isArray().withMessage("Pilih komunitas."), body("categoryIds.*").isInt()], validate, async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true, role: true } });
    if (!target) return res.status(404).json({ error: "Pengguna tidak ditemukan." });
    if (target.role === "ADMIN" || target.role === "SUPERADMIN") return res.status(400).json({ error: "Admin tidak perlu dijadikan moderator." });

    const ids = [...new Set(req.body.categoryIds.map(Number))];
    const valid = await prisma.category.findMany({ where: { id: { in: ids } }, select: { id: true } });
    const categoryIds = valid.map((c) => c.id);

    await prisma.$transaction([
      prisma.moderatorAssignment.deleteMany({ where: { userId } }),
      ...(categoryIds.length ? [prisma.moderatorAssignment.createMany({ data: categoryIds.map((categoryId) => ({ userId, categoryId })) })] : []),
      prisma.user.update({ where: { id: userId }, data: { role: categoryIds.length ? "MODERATOR" : target.role === "MODERATOR" ? "USER" : target.role } }),
    ]);
    await audit(req, categoryIds.length ? "moderator.atur" : "moderator.cabut", `@${target.username}`, categoryIds.join(", "));
    const fresh = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, username: true, email: true, role: true, moderatedCategories: { select: { categoryId: true } } } });
    res.json(shape(fresh));
  } catch (err) {
    next(err);
  }
});

router.delete("/moderators/:userId", async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true, role: true } });
    if (!target) return res.status(404).json({ error: "Pengguna tidak ditemukan." });
    await prisma.$transaction([
      prisma.moderatorAssignment.deleteMany({ where: { userId } }),
      prisma.user.update({ where: { id: userId }, data: { role: target.role === "MODERATOR" ? "USER" : target.role } }),
    ]);
    await audit(req, "moderator.cabut", `@${target.username}`);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
