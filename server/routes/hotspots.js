const express = require("express");
const https = require("https");

const router = express.Router();

// NASA FIRMS publishes near-real-time VIIRS active-fire detections as public CSV files per region
// (no API key). We pull the South-East Asia files, keep Indonesia's bounding box and cache for 10 minutes.
const BASE = "https://firms.modaps.eosdis.nasa.gov/data/active_fire";
const FEEDS = [
  (r) => `${BASE}/noaa-20-viirs-c2/csv/J1_VIIRS_C2_SouthEast_Asia_${r}.csv`,
  (r) => `${BASE}/noaa-21-viirs-c2/csv/J2_VIIRS_C2_SouthEast_Asia_${r}.csv`,
  (r) => `${BASE}/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_SouthEast_Asia_${r}.csv`,
];
const RANGES = new Set(["24h", "48h"]);
const TTL_MS = 10 * 60 * 1000;
const BBOX = { minLat: -11.5, maxLat: 6.5, minLon: 94.5, maxLon: 141.5 };

const cache = new Map(); // range -> { at, payload }

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "qpeduli-hotspots/1.0" }, timeout: 30000 }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
  });
}

function parse(csv) {
  const lines = csv.trim().split(/\r?\n/);
  const head = lines.shift().split(",");
  const ix = (n) => head.indexOf(n);
  const [iLat, iLon, iDate, iTime, iConf, iFrp] = ["latitude", "longitude", "acq_date", "acq_time", "confidence", "frp"].map(ix);
  const out = [];
  for (const line of lines) {
    const c = line.split(",");
    const lat = Number(c[iLat]);
    const lon = Number(c[iLon]);
    if (lat < BBOX.minLat || lat > BBOX.maxLat || lon < BBOX.minLon || lon > BBOX.maxLon) continue;
    const conf = (c[iConf] || "").toLowerCase();
    if (conf === "l" || conf === "low") continue; // drop low-confidence detections
    out.push([lat, lon, Number(c[iFrp]) || 0, conf === "h" || conf === "high" ? 2 : 1, c[iDate], c[iTime]]);
  }
  return out;
}

async function load(range) {
  const results = await Promise.allSettled(FEEDS.map((f) => fetchText(f(range))));
  const ok = results.filter((r) => r.status === "fulfilled");
  if (!ok.length) throw new Error("Semua sumber FIRMS tidak dapat dijangkau.");
  const points = ok.flatMap((r) => parse(r.value));
  return {
    source: "NASA FIRMS (VIIRS NOAA-20, NOAA-21, Suomi NPP)",
    range,
    fetchedAt: new Date().toISOString(),
    count: points.length,
    // [lat, lon, frp (MW), confidence 1=nominal 2=high, acq_date, acq_time(UTC HHMM)]
    points,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const range = RANGES.has(req.query.range) ? req.query.range : "24h";
    const hit = cache.get(range);
    if (hit && Date.now() - hit.at < TTL_MS) return res.json(hit.payload);
    try {
      const payload = await load(range);
      cache.set(range, { at: Date.now(), payload });
      res.json(payload);
    } catch (err) {
      // Upstream down: serve the last good copy rather than failing the page.
      if (hit) return res.json({ ...hit.payload, stale: true });
      res.status(502).json({ error: "Data titik panas belum tersedia. Coba lagi sebentar." });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
