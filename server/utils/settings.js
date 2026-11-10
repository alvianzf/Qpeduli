const prisma = require("../db");

// Platform settings editable from the admin panel. Stored as strings in the `settings` table.
const DEFAULTS = {
  paymentInstructions: process.env.PAYMENT_INSTRUCTIONS || "",
  minDonation: "10000",
  registrationOpen: "true",
  announcement: "",
};

async function getSettings() {
  let rows = [];
  try {
    rows = await prisma.setting.findMany();
  } catch (e) {
    // Table not migrated yet: fall back to defaults instead of breaking donations/registration.
  }
  const out = { ...DEFAULTS };
  for (const r of rows) out[r.key] = r.value;
  return {
    paymentInstructions: out.paymentInstructions,
    minDonation: Number(out.minDonation) || 0,
    registrationOpen: out.registrationOpen !== "false",
    announcement: out.announcement,
  };
}

async function audit(req, action, target, detail) {
  try {
    await prisma.auditLog.create({
      data: { actorId: req.user?.id ?? null, actorName: req.user ? `${req.user.name} (@${req.user.username})` : "sistem", action, target: target ?? null, detail: detail ?? null },
    });
  } catch (e) {
    // Auditing must never block the action itself.
  }
}

module.exports = { getSettings, audit, DEFAULTS };
