import map from '@svg-maps/indonesia';

export const provinces = map.locations as { id: string; name: string; path: string }[];
export const mapViewBox = map.viewBox as string;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

// Cities and regencies people are likely to type, keyed to a province id from the map package.
const cityProvince: Record<string, string> = {
  banda: 'id-ac', bandaaceh: 'id-ac', lhokseumawe: 'id-ac', medan: 'id-su', binjai: 'id-su', pematangsiantar: 'id-su', padang: 'id-sb', bukittinggi: 'id-sb',
  pekanbaru: 'id-ri', dumai: 'id-ri', batam: 'id-kr', tanjungpinang: 'id-kr', jambi: 'id-ja', palembang: 'id-ss', bengkulu: 'id-be',
  bandarlampung: 'id-la', lampung: 'id-la', pangkalpinang: 'id-bb', jakarta: 'id-jk', jakartaselatan: 'id-jk', jakartapusat: 'id-jk', jakartabarat: 'id-jk',
  jakartatimur: 'id-jk', jakartautara: 'id-jk', tangerang: 'id-bt', tangerangselatan: 'id-bt', serang: 'id-bt', cilegon: 'id-bt',
  bandung: 'id-jb', bogor: 'id-jb', depok: 'id-jb', bekasi: 'id-jb', cirebon: 'id-jb', sukabumi: 'id-jb', tasikmalaya: 'id-jb', garut: 'id-jb', karawang: 'id-jb',
  semarang: 'id-jt', solo: 'id-jt', surakarta: 'id-jt', magelang: 'id-jt', pekalongan: 'id-jt', tegal: 'id-jt', purwokerto: 'id-jt', kudus: 'id-jt',
  yogyakarta: 'id-yo', jogja: 'id-yo', sleman: 'id-yo', bantul: 'id-yo',
  surabaya: 'id-ji', malang: 'id-ji', sidoarjo: 'id-ji', kediri: 'id-ji', jember: 'id-ji', banyuwangi: 'id-ji', madiun: 'id-ji', mojokerto: 'id-ji',
  denpasar: 'id-ba', badung: 'id-ba', ubud: 'id-ba', gianyar: 'id-ba', singaraja: 'id-ba',
  mataram: 'id-nb', lombok: 'id-nb', sumbawa: 'id-nb', bima: 'id-nb', kupang: 'id-nt', labuanbajo: 'id-nt', maumere: 'id-nt',
  pontianak: 'id-kb', singkawang: 'id-kb', palangkaraya: 'id-kt', banjarmasin: 'id-ks', banjarbaru: 'id-ks',
  samarinda: 'id-ki', balikpapan: 'id-ki', bontang: 'id-ki', tarakan: 'id-ku',
  manado: 'id-sa', bitung: 'id-sa', gorontalo: 'id-go', palu: 'id-st', makassar: 'id-sn', parepare: 'id-sn', toraja: 'id-sn',
  kendari: 'id-sg', bau: 'id-sg', baubau: 'id-sg', mamuju: 'id-sr', ambon: 'id-ma', ternate: 'id-mu', tidore: 'id-mu',
  jayapura: 'id-pa', merauke: 'id-pa', timika: 'id-pa', sorong: 'id-pb', manokwari: 'id-pb',
};

const provinceAliases: Record<string, string> = {
  nad: 'id-ac', diy: 'id-yo', dki: 'id-jk', dkijakarta: 'id-jk', jabar: 'id-jb', jateng: 'id-jt', jatim: 'id-ji', sumut: 'id-su', sumbar: 'id-sb', sumsel: 'id-ss',
  kalbar: 'id-kb', kalteng: 'id-kt', kalsel: 'id-ks', kaltim: 'id-ki', kaltara: 'id-ku', sulut: 'id-sa', sulteng: 'id-st', sulsel: 'id-sn', sultra: 'id-sg',
  sulbar: 'id-sr', ntb: 'id-nb', ntt: 'id-nt', jakartaraya: 'id-jk',
};

/** Map a free-text city or province name to a province id, or undefined when we cannot tell. */
export function provinceOf(text?: string | null): string | undefined {
  if (!text) return undefined;
  const key = slug(text);
  if (!key) return undefined;
  const byName = provinces.find((p) => slug(p.name) === key);
  if (byName) return byName.id;
  if (provinceAliases[key]) return provinceAliases[key];
  if (cityProvince[key]) return cityProvince[key];
  // "Kota Bandung", "Kab. Malang, Jawa Timur": try each comma part and strip the prefix.
  for (const part of text.split(/[,/]/)) {
    const k = slug(part.replace(/^(kota|kab\.?|kabupaten)\s+/i, ''));
    if (cityProvince[k]) return cityProvince[k];
    const p = provinces.find((x) => slug(x.name) === k);
    if (p) return p.id;
  }
  return undefined;
}

export const provinceName = (id?: string) => provinces.find((p) => p.id === id)?.name;
