require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const { notFoundHandler, errorHandler } = require("./middleware/error-handler");
const routes = require("./routes");

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

app.use(logger("dev"));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }
      // In production, Nginx serves the frontend and API from the same origin
      // (qpeduli.com/api/v1), so cross-origin requests aren't expected there.
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: 31557600000 }));
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
