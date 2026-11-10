const prisma = require("../db");

// A campaign belongs to a user either directly (Modal Usaha: ownerId) or through the forum thread that hosts it (Aksi Sosial).
const ownedWhere = (userId) => ({ OR: [{ ownerId: userId }, { thread: { authorId: userId } }] });

async function ownsCampaign(userId, campaignId) {
  return !!(await prisma.campaign.findFirst({ where: { id: campaignId, ...ownedWhere(userId) }, select: { id: true } }));
}

// Anyone with the PENGGALANG role, or who owns at least one campaign, may use the creator console.
async function isCreator(user) {
  if (!user) return false;
  if (user.role === "PENGGALANG") return true;
  return (await prisma.campaign.count({ where: ownedWhere(user.id) })) > 0;
}

// First campaign promotes a plain member to PENGGALANG. Never downgrades staff or Ksatria.
async function grantCreatorRole(userId) {
  await prisma.user.updateMany({ where: { id: userId, role: "USER" }, data: { role: "PENGGALANG" } });
}

module.exports = { ownedWhere, ownsCampaign, isCreator, grantCreatorRole };
