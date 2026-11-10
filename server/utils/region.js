// Campaigns currently run only in four provinces of central Sumatra. Province ids match @svg-maps/indonesia
// and src/data/areas.ts: keep the two lists in sync.
const AREAS = [
  {
    id: "id-kr",
    name: "Kepulauan Riau",
    aliases: ["kepulauan riau", "kepri", "batam", "batu aji", "sekupang", "nongsa", "tanjungpinang", "tanjung pinang", "bintan", "tanjunguban", "tanjung uban", "kijang", "lagoi", "karimun", "tanjung balai karimun", "tanjungbalai karimun", "meral", "lingga", "daik", "dabo singkep", "singkep", "natuna", "ranai", "anambas", "kepulauan anambas", "tarempa"],
  },
  {
    id: "id-ri",
    name: "Riau",
    aliases: ["riau", "pekanbaru", "dumai", "kampar", "siak", "bengkalis", "indragiri", "rengat", "tembilahan", "rokan", "pelalawan", "pangkalan kerinci", "kuantan singingi", "teluk kuantan", "meranti", "selatpanjang", "duri", "bangkinang"],
  },
  {
    id: "id-sb",
    name: "Sumatera Barat",
    aliases: ["sumatera barat", "sumbar", "padang", "bukittinggi", "payakumbuh", "padang panjang", "pariaman", "solok", "sawahlunto", "agam", "pesisir selatan", "tanah datar", "batusangkar", "lima puluh kota", "limapuluh kota", "mentawai", "dharmasraya", "pasaman", "painan"],
  },
  {
    id: "id-ja",
    name: "Jambi",
    aliases: ["jambi", "sungai penuh", "batanghari", "muaro jambi", "kerinci", "merangin", "bangko", "sarolangun", "tebo", "muara tebo", "bungo", "muara bungo", "tanjung jabung", "kuala tungkal", "muara sabak"],
  },
];

// Returns the area a free-text city or province belongs to, or null when it is outside the four provinces.
function regionOf(text) {
  const c = String(text || "").toLowerCase().trim();
  if (!c) return null;
  const parts = c.split(/[,/]/).map((p) => p.replace(/^(kota|kab\.?|kabupaten|provinsi)\s+/i, "").trim()).filter(Boolean);
  for (const part of [...parts].reverse().concat(parts)) {
    const hit = AREAS.find((a) => a.aliases.some((x) => part === x || part.includes(x)));
    if (hit) return hit;
  }
  return null;
}

const REGION_ONLY_MESSAGE = "Saat ini kampanye hanya untuk wilayah Kepulauan Riau, Riau, Sumatera Barat, dan Jambi.";

module.exports = { AREAS, regionOf, REGION_ONLY_MESSAGE };
