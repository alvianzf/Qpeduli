const express = require("express");
const { body } = require("express-validator");
const prisma = require("../db");
const { requireRole, PERMISSIONS } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const { audit } = require("../utils/settings");

// Superadmin-only CRUD for custom roles. System roles (USER, KSATRIA_KOMUNITAS, ADMIN, SUPERADMIN) are fixed.
const router = express.Router();
router.use("/roles", requireRole("SUPERADMIN"));

const SYSTEM_ROLES = [
  { key: "USER", name: "Pengguna", description: "Anggota komunitas biasa." },
  { key: "KSATRIA_KOMUNITAS", name: "Ksatria Komunitas", description: "Anggota terverifikasi yang bisa menjadi penjamin kampanye." },
  { key: "ADMIN", name: "Admin", description: "Mengelola kampanye, donasi, pencairan dan pengguna biasa." },
  { key: "SUPERADMIN", name: "Superadmin", description: "Akses penuh, termasuk admin, peran, pengaturan dan log audit." },
];

const valid = [
  body("name").trim().isLength({ min: 2, max: 40 }).withMessage("Nama peran 2 sampai 40 karakter."),
  body("description").optional({ nullable: true }).isString().isLength({ max: 200 }),
  body("permissions").isArray().withMessage("Izin harus berupa daftar."),
  body("permissions.*").isIn(Object.keys(PERMISSIONS)).withMessage("Izin tidak dikenal."),
];

router.get("/roles", async (req, res, next) => {
  try {
    const [custom, counts] = await Promise.all([
      prisma.customRole.findMany({ orderBy: { id: "asc" }, include: { _count: { select: { users: true } } } }),
      prisma.user.groupBy({ by: ["role"], _count: true }),
    ]);
    res.json({
      permissions: Object.entries(PERMISSIONS).map(([key, label]) => ({ key, label })),
      system: SYSTEM_ROLES.map((r) => ({ ...r, users: counts.find((c) => c.role === r.key)?._count || 0 })),
      custom: custom.map((r) => ({ id: r.id, name: r.name, description: r.description, permissions: r.permissions, users: r._count.users, createdAt: r.createdAt })),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/roles", valid, validate, async (req, res, next) => {
  try {
    const role = await prisma.customRole.create({
      data: { name: req.body.name, description: req.body.description || null, permissions: [...new Set(req.body.permissions)] },
    });
    await audit(req, "peran.buat", role.name, role.permissions.join(", "));
    res.status(201).json(role);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "Nama peran sudah dipakai." });
    next(err);
  }
});

router.patch("/roles/:id", valid, validate, async (req, res, next) => {
  try {
    const role = await prisma.customRole.update({
      where: { id: Number(req.params.id) },
      data: { name: req.body.name, description: req.body.description || null, permissions: [...new Set(req.body.permissions)] },
    });
    await audit(req, "peran.ubah", role.name, role.permissions.join(", "));
    res.json(role);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "Nama peran sudah dipakai." });
    if (err.code === "P2025") return res.status(404).json({ error: "Peran tidak ditemukan." });
    next(err);
  }
});

router.delete("/roles/:id", async (req, res, next) => {
  try {
    const role = await prisma.customRole.delete({ where: { id: Number(req.params.id) } });
    await audit(req, "peran.hapus", role.name, "pengguna dengan peran ini kembali ke peran dasar");
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Peran tidak ditemukan." });
    next(err);
  }
});

module.exports = router;
