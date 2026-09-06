// RBAC guard. Usage: requireRole('ADMIN') or requireRole('ADMIN', 'KSATRIA_KOMUNITAS').
// Must run after authMiddleware so req.user is populated.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Autentikasi dibutuhkan." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Kamu tidak punya akses untuk aksi ini." });
    }
    next();
  };
}

module.exports = { requireRole };
