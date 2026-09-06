const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { threads: true } } },
      orderBy: { id: "asc" },
    });
    res.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        color: c.color,
        threadCount: c._count.threads,
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  [
    body("name").notEmpty(),
    body("slug").notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, slug, description, icon, color } = req.body;
      const category = await prisma.category.create({ data: { name, slug, description, icon, color } });
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
