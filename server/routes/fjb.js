const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

const sellerSelect = { id: true, username: true, name: true, avatarColor: true, isVerified: true, role: true };

router.get("/", async (req, res, next) => {
  try {
    const items = await prisma.fjbItem.findMany({
      include: { seller: { select: sellerSelect }, campaign: { include: { thread: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authMiddleware,
  [
    body("title").notEmpty(),
    body("price").isFloat({ gt: 0 }),
    body("condition").isIn(["BARU", "SEPERTI_BARU", "BEKAS_LAYAK_PAKAI"]),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { title, price, condition, category, emoji, campaignId, description } = req.body;
      const item = await prisma.fjbItem.create({
        data: {
          title,
          price,
          condition,
          category,
          emoji,
          description,
          sellerId: req.user.id,
          campaignId: campaignId ? Number(campaignId) : null,
        },
        include: { seller: { select: sellerSelect } },
      });
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  },
);

router.patch("/:id/sold", authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.fjbItem.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ error: "Barang tidak ditemukan." });

    const isOwner = item.sellerId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Bukan barangmu." });

    const updated = await prisma.fjbItem.update({ where: { id }, data: { sold: true } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
