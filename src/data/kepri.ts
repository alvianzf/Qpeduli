import { provinces } from './regions';

/** Campaigns currently run only in Kepulauan Riau. Keep in sync with server/utils/region.js. */
export interface KepriArea {
  id: string;
  name: string;
  short: string;
  lat: number;
  lon: number;
  aliases: string[];
}

export const kepriAreas: KepriArea[] = [
  { id: 'batam', name: 'Kota Batam', short: 'Batam', lat: 1.05, lon: 104.03, aliases: ['batam', 'batu aji', 'sekupang', 'nongsa', 'batam kota'] },
  { id: 'tanjungpinang', name: 'Kota Tanjungpinang', short: 'Tanjungpinang', lat: 0.92, lon: 104.45, aliases: ['tanjungpinang', 'tanjung pinang'] },
  { id: 'bintan', name: 'Kabupaten Bintan', short: 'Bintan', lat: 1.12, lon: 104.5, aliases: ['bintan', 'tanjunguban', 'tanjung uban', 'kijang', 'lagoi'] },
  { id: 'karimun', name: 'Kabupaten Karimun', short: 'Karimun', lat: 1.0, lon: 103.42, aliases: ['karimun', 'tanjung balai karimun', 'tanjungbalai karimun', 'meral'] },
  { id: 'lingga', name: 'Kabupaten Lingga', short: 'Lingga', lat: -0.2, lon: 104.6, aliases: ['lingga', 'daik', 'dabo singkep', 'singkep'] },
  { id: 'natuna', name: 'Kabupaten Natuna', short: 'Natuna', lat: 3.95, lon: 108.38, aliases: ['natuna', 'ranai'] },
  { id: 'anambas', name: 'Kabupaten Kepulauan Anambas', short: 'Anambas', lat: 3.2, lon: 106.25, aliases: ['anambas', 'kepulauan anambas', 'tarempa'] },
];

export const kepriArea = (id?: string) => kepriAreas.find((a) => a.id === id);

/** Match a free-text city to a Kepri area, or undefined when it is outside Kepulauan Riau. */
export function kepriAreaOf(text?: string | null): KepriArea | undefined {
  const c = (text ?? '').toLowerCase().trim();
  if (!c) return undefined;
  return kepriAreas.find((a) => a.id === c || a.name.toLowerCase() === c || a.aliases.some((x) => c === x || c.includes(x)));
}

// Same projection as the Karhutla map (about 17.22 px per degree against @svg-maps/indonesia geometry).
const PPD = 17.22;
export const projectKepri = (lat: number, lon: number): [number, number] => [0.26 + (lon - 95.0) * PPD, 266.0 + (-8.06 - lat) * PPD];

/** Crop of the national map that frames the whole province, from Karimun in the west to Natuna in the north-east. */
export const kepriViewBox = '128 34 132 132';

/** The province itself plus its neighbours, for context behind the markers. */
export const kepriShape = provinces.find((p) => p.id === 'id-kr');
export const kepriNeighbours = provinces.filter((p) => ['id-ri', 'id-ja', 'id-ss', 'id-kb', 'id-bb'].includes(p.id));
