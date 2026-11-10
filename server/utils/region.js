// Campaigns currently run only in Kepulauan Riau (Kepri). Keep this list in sync with src/data/kepri.ts.
const KEPRI_AREAS = [
  { id: "batam", name: "Kota Batam", aliases: ["batam", "batu aji", "sekupang", "nongsa", "batam centre", "batam kota"] },
  { id: "tanjungpinang", name: "Kota Tanjungpinang", aliases: ["tanjungpinang", "tanjung pinang"] },
  { id: "bintan", name: "Kabupaten Bintan", aliases: ["bintan", "tanjunguban", "tanjung uban", "kijang", "lagoi"] },
  { id: "karimun", name: "Kabupaten Karimun", aliases: ["karimun", "tanjung balai karimun", "tanjungbalai karimun", "meral"] },
  { id: "lingga", name: "Kabupaten Lingga", aliases: ["lingga", "daik", "dabo singkep", "singkep"] },
  { id: "natuna", name: "Kabupaten Natuna", aliases: ["natuna", "ranai"] },
  { id: "anambas", name: "Kabupaten Kepulauan Anambas", aliases: ["anambas", "kepulauan anambas", "tarempa"] },
];

// Returns the Kepri area a free-text city belongs to, or null if it is outside Kepri.
function kepriArea(city) {
  const c = String(city || "").toLowerCase().trim();
  if (!c) return null;
  return KEPRI_AREAS.find((a) => a.id === c || a.name.toLowerCase() === c || a.aliases.some((x) => c === x || c.includes(x))) || null;
}

const KEPRI_ONLY_MESSAGE = "Saat ini kampanye hanya untuk wilayah Kepulauan Riau (Batam, Tanjungpinang, Bintan, Karimun, Lingga, Natuna, Anambas).";

module.exports = { KEPRI_AREAS, kepriArea, KEPRI_ONLY_MESSAGE };
