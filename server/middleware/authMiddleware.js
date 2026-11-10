const { verifyToken } = require("../utils/jwt");
const prisma = require("../db");

// Verifies the JWT (Authorization: Bearer <token> or cookie) and attaches req.user.
async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const token = bearer || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Autentikasi dibutuhkan." });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id }, include: { customRole: true } });

    if (!user) {
      return res.status(401).json({ error: "Akun tidak ditemukan." });
    }

    if (user.bannedAt) {
      return res.status(403).json({ error: "Akun ini diblokir." });
    }
    if (user.suspendedUntil && user.suspendedUntil > new Date() && req.method !== "GET") {
      const until = user.suspendedUntil.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      return res.status(403).json({ error: `Akunmu ditangguhkan sampai ${until}. Kamu masih bisa membaca.` });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token tidak valid atau kedaluwarsa." });
  }
}

// Best-effort auth: attaches req.user if a valid token is present, but never rejects.
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const token = bearer || req.cookies?.token;
    if (!token) return next();

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id }, include: { customRole: true } });
    if (user) req.user = user;
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
}

module.exports = { authMiddleware, optionalAuth };
