const crypto = require("crypto");
const prisma = require("../db");

// Identity verification is required before a user can start a campaign. Staff are exempt.
const isStaffRole = (user) => user.role === "ADMIN" || user.role === "SUPERADMIN";

async function kycStatusOf(user) {
  if (!user) return "NONE";
  const row = await prisma.kyc.findUnique({ where: { userId: user.id }, select: { status: true } });
  return row ? row.status : "NONE";
}

// Returns an error message when the user may not start a campaign yet, otherwise null.
async function kycBlock(user) {
  if (isStaffRole(user)) return null;
  const status = await kycStatusOf(user);
  if (status === "APPROVED") return null;
  if (status === "PENDING") return "Verifikasi identitasmu sedang ditinjau. Kamu bisa memulai kampanye setelah disetujui.";
  if (status === "REJECTED") return "Verifikasi identitasmu ditolak. Kirim ulang data yang benar dari menu Verifikasi identitas.";
  return "Verifikasi identitas (KYC) diperlukan sebelum memulai kampanye. Lengkapi dari menu Verifikasi identitas.";
}

// One-way fingerprint of an ID number, so the same person can't verify two accounts. The number itself is never stored.
const fingerprint = (idNumber) => crypto.createHmac("sha256", process.env.JWT_SECRET || "qpeduli").update(String(idNumber)).digest("hex");

module.exports = { kycStatusOf, kycBlock, fingerprint };
