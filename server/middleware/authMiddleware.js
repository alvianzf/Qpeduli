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
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user) {
      return res.status(401).json({ error: "Akun tidak ditemukan." });
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
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (user) req.user = user;
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
}

module.exports = { authMiddleware, optionalAuth };
