import { provinces } from './regions';

/** Campaigns run in four provinces of central Sumatra. Keep in sync with server/utils/region.js. */
export interface Area {
  id: string; // province id from @svg-maps/indonesia
  name: string;
  short: string;
  lat: number;
  lon: number;
  aliases: string[];
}

export const areas: Area[] = [
  { id: 'id-kr', name: 'Kepulauan Riau', short: 'Kepri', lat: 1.0, lon: 104.2, aliases: ['kepulauan riau', 'kepri', 'batam', 'batu aji', 'sekupang', 'nongsa', 'tanjungpinang', 'tanjung pinang', 'bintan', 'tanjunguban', 'tanjung uban', 'kijang', 'lagoi', 'karimun', 'tanjung balai karimun', 'tanjungbalai karimun', 'meral', 'lingga', 'daik', 'dabo singkep', 'singkep', 'natuna', 'ranai', 'anambas', 'tarempa'] },
  { id: 'id-ri', name: 'Riau', short: 'Riau', lat: 0.55, lon: 101.8, aliases: ['riau', 'pekanbaru', 'dumai', 'kampar', 'siak', 'bengkalis', 'indragiri', 'rengat', 'tembilahan', 'rokan', 'pelalawan', 'pangkalan kerinci', 'kuantan singingi', 'teluk kuantan', 'meranti', 'selatpanjang', 'duri', 'bangkinang'] },
  { id: 'id-sb', name: 'Sumatera Barat', short: 'Sumbar', lat: -0.85, lon: 100.4, aliases: ['sumatera barat', 'sumbar', 'padang', 'bukittinggi', 'payakumbuh', 'padang panjang', 'pariaman', 'solok', 'sawahlunto', 'agam', 'pesisir selatan', 'tanah datar', 'batusangkar', 'lima puluh kota', 'limapuluh kota', 'mentawai', 'dharmasraya', 'pasaman', 'painan'] },
  { id: 'id-ja', name: 'Jambi', short: 'Jambi', lat: -1.6, lon: 102.5, aliases: ['jambi', 'sungai penuh', 'batanghari', 'muaro jambi', 'kerinci', 'merangin', 'bangko', 'sarolangun', 'tebo', 'muara tebo', 'bungo', 'muara bungo', 'tanjung jabung', 'kuala tungkal', 'muara sabak'] },
];

export const areaById = (id?: string) => areas.find((a) => a.id === id);

/** Match a free-text city or province to one of the four areas, or undefined when it is outside them. */
export function areaOf(text?: string | null): Area | undefined {
  const c = (text ?? '').toLowerCase().trim();
  if (!c) return undefined;
  const parts = c.split(/[,/]/).map((p) => p.replace(/^(kota|kab\.?|kabupaten|provinsi)\s+/i, '').trim()).filter(Boolean);
  for (const part of [...parts].reverse().concat(parts)) {
    const hit = areas.find((a) => a.id === part || a.aliases.some((x) => part === x || part.includes(x)));
    if (hit) return hit;
  }
  return undefined;
}

// Same projection as the Karhutla map (about 17.22 px per degree against @svg-maps/indonesia geometry).
const PPD = 17.22;
export const projectArea = (lat: number, lon: number): [number, number] => [0.26 + (lon - 95.0) * PPD, 266.0 + (-8.06 - lat) * PPD];

/** Crop of the national map that frames the four provinces, from Sumatera Barat to Natuna. */
export const areaViewBox = '50 35 200 160';
export const areaIds = areas.map((a) => a.id);
export const areaShapes = provinces.filter((p) => areaIds.includes(p.id));
export const areaNeighbours = provinces.filter((p) => ['id-ac', 'id-su', 'id-be', 'id-ss', 'id-bb', 'id-kb', 'id-la'].includes(p.id));
