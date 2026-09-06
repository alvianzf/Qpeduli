const express = require("express");
const prisma = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [totalUsers, totalThreads, activeCampaigns, disbursedAgg, cities] = await Promise.all([
      prisma.user.count(),
      prisma.thread.count(),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
      prisma.campaign.aggregate({ _sum: { disbursed: true } }),
      prisma.user.findMany({ where: { city: { not: null } }, distinct: ["city"], select: { city: true } }),
    ]);

    res.json({
      totalUsers,
      totalThreads,
      activeCampaigns,
      totalDisbursed: disbursedAgg._sum.disbursed || 0,
      citiesReached: cities.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
