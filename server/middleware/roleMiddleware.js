// RBAC. Role ladder: USER < KSATRIA_KOMUNITAS < ADMIN < SUPERADMIN.
// SUPERADMIN passes every requireRole check, and is the only role that can manage admins.
const isStaff = (user) => !!user && (user.role === "ADMIN" || user.role === "SUPERADMIN");

// Usage: requireRole('ADMIN') or requireRole('ADMIN', 'KSATRIA_KOMUNITAS'). Run after authMiddleware.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Autentikasi dibutuhkan." });
    }
    if (req.user.role !== "SUPERADMIN" && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Kamu tidak punya akses untuk aksi ini." });
    }
    next();
  };
}

const ROLES = ["USER", "KSATRIA_KOMUNITAS", "ADMIN", "SUPERADMIN"];

// Returns an error message if `actor` may not change a user from `target.role` to `newRole`, else null.
// Admins manage regular users only. Only a superadmin can touch admins/superadmins or grant those roles.
function roleChangeError(actor, target, newRole) {
  if (actor.id === target.id) return "Kamu tidak bisa mengubah peran milikmu sendiri.";
  if (actor.role === "SUPERADMIN") return null;
  const high = (r) => r === "ADMIN" || r === "SUPERADMIN";
  if (high(target.role) || high(newRole)) return "Hanya superadmin yang bisa mengelola admin.";
  return null;
}

module.exports = { requireRole, isStaff, roleChangeError, ROLES };
