const prisma = require("../db");

async function addKarma(userId, amount, reason) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { karma: { increment: amount } } }),
    prisma.karmaLog.create({ data: { userId, amount, reason } }),
  ]);
}

module.exports = { addKarma };
