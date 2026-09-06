const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/categories", require("./categories"));
router.use("/threads", require("./threads"));
router.use("/campaigns", require("./campaigns"));
router.use("/fjb", require("./fjb"));
router.use("/users", require("./users"));
router.use("/stats", require("./stats"));

router.get("/health", (req, res) => res.json({ ok: true, service: "qpeduli-backend" }));

module.exports = router;
