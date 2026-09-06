require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("./index");

const categories = [
  { name: "Regional", slug: "regional", description: "Diskusi seputar isu & kegiatan di kotamu", icon: "LocationCity", color: "#2563EB" },
  { name: "Pendidikan", slug: "pendidikan", description: "Beasiswa, sekolah, literasi, dan masa depan anak bangsa", icon: "School", color: "#0EA5E9" },
  { name: "Kesehatan", slug: "kesehatan", description: "Bantuan medis, pengobatan, dan kesehatan masyarakat", icon: "LocalHospital", color: "#EF4444" },
  { name: "Bencana Alam", slug: "bencana-alam", description: "Tanggap darurat dan pemulihan pasca bencana", icon: "Landslide", color: "#F59E0B" },
  { name: "Hobi & Sosial", slug: "hobi-sosial", description: "Komunitas hobi yang berbagi lebih dari sekadar minat", icon: "Groups", color: "#8B5CF6" },
  { name: "Lingkungan", slug: "lingkungan", description: "Aksi hijau, konservasi, dan kebersihan lingkungan", icon: "Park", color: "#10B981" },
];

async function seedCategories() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log(`Seeded ${categories.length} categories.`);
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin Qpeduli";

  if (!email || !username || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_USERNAME / ADMIN_PASSWORD not set, skipping admin seed.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists, skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      username,
      name,
      passwordHash,
      role: "ADMIN",
      isVerified: true,
      avatarColor: "#2563EB",
    },
  });
  console.log("Admin user created.");
}

async function main() {
  await seedCategories();
  await seedAdmin();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
