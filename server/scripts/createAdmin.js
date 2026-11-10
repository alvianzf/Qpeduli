// Create or promote an admin account.
// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret [ADMIN_NAME="Super Admin"] node scripts/createAdmin.js
// Credentials come from the environment so they never land in the repo.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../db");

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD.");

  const name = process.env.ADMIN_NAME || "Super Admin";
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") || "admin";
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { passwordHash, role: process.env.ADMIN_ROLE === "ADMIN" ? "ADMIN" : "SUPERADMIN", isVerified: true } });
    console.log(`Updated ${email} (@${existing.username}) to ${process.env.ADMIN_ROLE === "ADMIN" ? "ADMIN" : "SUPERADMIN"} with the new password.`);
    return;
  }

  let username = base;
  for (let i = 1; await prisma.user.findUnique({ where: { username } }); i++) username = `${base}${i}`;
  await prisma.user.create({
    data: { email, username, name, passwordHash, role: process.env.ADMIN_ROLE === "ADMIN" ? "ADMIN" : "SUPERADMIN", isVerified: true, avatarColor: "#4267B2" },
  });
  console.log(`Created SUPERADMIN ${email} (@${username}).`);
}

main()
  .catch((e) => { console.error(e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
