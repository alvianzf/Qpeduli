// Burned-area figures are from SiPongi (KLHK), as reported by the press and data desks listed in `sources`.
// Totals are rekap snapshots: the same year can differ by source and cut-off date, so treat them as indicative.

export interface ProvinceBurn {
  /** Province id from the @svg-maps/indonesia package. */
  id: string;
  name: string;
  ha: number;
  rank: number;
  note?: string;
}

/** 2023, ten largest provinces by burned area (SiPongi, via Kompas.com, 27 Jun 2024). */
export const burn2023: ProvinceBurn[] = [
  { id: 'id-ks', name: 'Kalimantan Selatan', ha: 190394.58, rank: 1 },
  { id: 'id-kt', name: 'Kalimantan Tengah', ha: 165896.44, rank: 2 },
  { id: 'id-pa', name: 'Papua Selatan', ha: 150813.34, rank: 3, note: 'Provinsi baru hasil pemekaran Papua; di peta ditampilkan pada wilayah Papua.' },
  { id: 'id-ss', name: 'Sumatera Selatan', ha: 132082.86, rank: 4 },
  { id: 'id-kb', name: 'Kalimantan Barat', ha: 111848.43, rank: 5 },
  { id: 'id-nt', name: 'Nusa Tenggara Timur', ha: 102536.89, rank: 6 },
  { id: 'id-nb', name: 'Nusa Tenggara Barat', ha: 66716.43, rank: 7 },
  { id: 'id-ji', name: 'Jawa Timur', ha: 49498.32, rank: 8 },
  { id: 'id-ma', name: 'Maluku', ha: 45999.39, rank: 9 },
  { id: 'id-ki', name: 'Kalimantan Timur', ha: 39494.41, rank: 10 },
];

export const national2023 = 1161192.9;

export interface YearTotal {
  year: number;
  ha: number;
  note: string;
}

export const yearlyTotals: YearTotal[] = [
  { year: 2015, ha: 2610000, note: 'Tahun El Niño kuat. Bank Dunia menaksir kerugian Rp221 triliun (1,9% PDB).' },
  { year: 2019, ha: 1649258, note: 'Tahun El Niño. Bank Dunia menaksir kerugian sekitar US$5,2 miliar. Rekap tiap lembaga berbeda menurut tanggal.' },
  { year: 2020, ha: 296942, note: 'Turun tajam dari 2019.' },
  { year: 2021, ha: 358867, note: 'Naik tipis dari 2020.' },
  { year: 2022, ha: 204894, note: 'Terendah dalam rentang ini.' },
  { year: 2023, ha: 1161193, note: 'Sekitar lima kali lipat 2022, di tahun El Niño. Greenpeace Indonesia memperkirakan setidaknya 2,13 juta ha.' },
];

export const sources = [
  { label: 'SiPongi, KLHK: pemantauan titik panas dan luas karhutla', url: 'https://sipongi.menlhk.go.id' },
  { label: 'NASA FIRMS: peta titik panas dunia, hampir real-time', url: 'https://firms.modaps.eosdis.nasa.gov/map/' },
  { label: 'BMKG: prakiraan cuaca dan titik panas', url: 'https://www.bmkg.go.id' },
  { label: 'Kompas Lestari: 10 provinsi dengan karhutla terluas 2023', url: 'https://lestari.kompas.com/read/2024/06/27/140000086/10-provinsi-dengan-karhutla-terluas-sepanjang-2023' },
  { label: 'Katadata: luas kebakaran hutan melonjak 5 kali lipat pada 2023', url: 'https://databoks.katadata.co.id/lingkungan/statistik/66b5e6a2bfe4d/luas-kebakaran-hutan-indonesia-melonjak-5-kali-lipat-pada-2023' },
  { label: 'Katadata: Rp221 triliun kerugian akibat kebakaran hutan 2015 (Bank Dunia)', url: 'https://katadata.co.id/infografik/2015/12/17/rp-221-triliun-kerugian-akibat-kebakaran-hutan' },
  { label: 'Katadata: Bank Dunia, kerugian kebakaran hutan 2019', url: 'https://katadata.co.id/berita/nasional/5e9a4c49c9167/bank-dunia-kerugian-kebakaran-hutan-di-indonesia-rp-729-triliun' },
  { label: 'Greenpeace Indonesia: Bagai Api dalam Sekam, analisis data karhutla', url: 'https://www.greenpeace.org/indonesia/laporan/59567/karhutla-kronis/' },
];
