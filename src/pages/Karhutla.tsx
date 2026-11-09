import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ForestIcon from '@mui/icons-material/Forest';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import GavelIcon from '@mui/icons-material/Gavel';
import ReportIcon from '@mui/icons-material/ReportProblem';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Hero from '../components/ui/Hero';
import Section from '../components/ui/Section';
import CardGrid from '../components/ui/CardGrid';
import GlossCard from '../components/ui/GlossCard';
import IconTile from '../components/ui/IconTile';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import KarhutlaMap from '../components/KarhutlaMap';
import { yearlyTotals, sources } from '../data/karhutla';

const fmt = (n: number) => Math.round(n).toLocaleString('id-ID');

const facts = [
  {
    icon: <ForestIcon />,
    title: 'Penyebab',
    points: [
      'Sebagian besar kebakaran dipicu manusia, terutama pembukaan lahan dengan membakar.',
      'Gambut yang dikeringkan lewat kanal mudah terbakar dan sulit dipadamkan, asapnya bisa berbulan-bulan.',
      'Kemarau panjang dan El Niño memperluas dan memperparah kebakaran.',
    ],
  },
  {
    icon: <HealthAndSafetyIcon />,
    title: 'Dampak',
    points: [
      'Kabut asap memicu ISPA dan paling berisiko bagi balita, ibu hamil, dan lansia.',
      'Bank Dunia menaksir kerugian ekonomi Rp221 triliun (1,9% PDB) pada 2015 dan sekitar US$5,2 miliar pada 2019.',
      'Hilangnya hutan dan gambut melepas karbon dalam jumlah besar dan merusak habitat.',
    ],
  },
  {
    icon: <GavelIcon />,
    title: 'Aturan',
    points: [
      'UU 32/2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup melarang pembukaan lahan dengan cara membakar.',
      'Ada pengecualian terbatas untuk kearifan lokal dengan syarat ketat, dan pelanggaran dapat dipidana.',
    ],
  },
];

const steps = [
  'Pantau titik panas terbaru di SiPongi atau NASA FIRMS.',
  'Lihat prakiraan cuaca dan kualitas udara sebelum beraktivitas di luar ruangan.',
  'Pakai masker N95 saat asap pekat, dan tetap di dalam ruangan bila bisa.',
  'Jangan membakar lahan atau sampah di area kering atau gambut.',
  'Lihat api atau asap? Hubungi 112 (darurat) atau 113 (pemadam kebakaran) dan sebut lokasinya.',
];

function YearBars() {
  const [year, setYear] = useState(2023);
  const max = Math.max(...yearlyTotals.map((y) => y.ha));
  const sel = yearlyTotals.find((y) => y.year === year)!;
  return (
    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'minmax(0,2fr) minmax(0,1fr)' } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 1, md: 2 }, height: 240 }} role="group" aria-label="Luas karhutla nasional per tahun">
        {yearlyTotals.map((y) => (
          <Box
            key={y.year}
            component="button"
            onClick={() => setYear(y.year)}
            onMouseEnter={() => setYear(y.year)}
            aria-pressed={year === y.year}
            aria-label={`${y.year}: ${fmt(y.ha)} hektare`}
            sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 0.75, border: 0, background: 'none', cursor: 'pointer', p: 0, font: 'inherit' }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{(y.ha / 1e6).toFixed(2).replace('.', ',')} jt</Typography>
            <Box sx={{ width: '100%', height: `${Math.max(4, (y.ha / max) * 78)}%`, borderRadius: '12px 12px 4px 4px', background: year === y.year ? 'linear-gradient(180deg,#FF7A33,#E65100)' : 'linear-gradient(180deg,#9DB6E3,#4267B2)', transition: 'all .2s ease' }} />
            <Typography variant="caption" sx={{ fontWeight: year === y.year ? 800 : 500 }}>{y.year}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 3, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.9)', border: '1px solid #E1E8F2' }}>
        <Typography variant="h4" color="primary.dark">{fmt(sel.ha)} ha</Typography>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Total nasional {sel.year}</Typography>
        <Typography variant="body2" color="text.secondary">{sel.note}</Typography>
      </Box>
    </Box>
  );
}

/** Information page, no fundraising: where fires burned, why, what it costs and what to do. */
export default function Karhutla() {
  return (
    <Box>
      <Hero
        size="md"
        eyebrow={<Chip icon={<LocalFireDepartmentIcon sx={{ color: '#fff !important' }} />} label="Karhutla" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />}
        title="Karhutla di Indonesia"
        subtitle="Peta, data, dan fakta kebakaran hutan dan lahan, dari sumber resmi dan lembaga yang kredibel."
        actions={<Button variant="contained" color="warning" endIcon={<OpenInNewIcon />} href="https://sipongi.menlhk.go.id" target="_blank" rel="noreferrer">Titik panas langsung</Button>}
      />

      <Section overlap title="Peta titik panas" subtitle="Deteksi satelit terbaru, dimuat langsung dari NASA FIRMS setiap halaman dibuka atau disegarkan.">
        <GlossCard sx={{ p: { xs: 2.5, md: 4 } }}>
          <KarhutlaMap />
        </GlossCard>
      </Section>

      <Section title="Dari tahun ke tahun" subtitle="Luas karhutla nasional. Pilih tahun untuk catatannya.">
        <GlossCard sx={{ p: { xs: 2.5, md: 4 } }}>
          <YearBars />
        </GlossCard>
      </Section>

      <Section title="Yang perlu kamu tahu">
        <CardGrid cols={{ xs: 1, md: 3 }}>
          {facts.map((f, i) => (
            <GlossCard key={f.title} delay={i * 0.06} sx={{ gap: 2 }}>
              <IconTile>{f.icon}</IconTile>
              <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>{f.title}</Typography>
              <Stack spacing={1.25}>
                {f.points.map((p) => <Typography key={p} variant="body2" color="text.secondary">{p}</Typography>)}
              </Stack>
            </GlossCard>
          ))}
        </CardGrid>
      </Section>

      <Section title="Apa yang bisa dilakukan">
        <GlossCard sx={{ p: { xs: 3, md: 4 }, gap: 2.5 }}>
          {steps.map((s, i) => (
            <Stack key={s} direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{i + 1}</Box>
              <Typography>{s}</Typography>
            </Stack>
          ))}
        </GlossCard>
      </Section>

      <Section title="Sumber dan catatan">
        <Alert icon={<ReportIcon />} severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
          Angka luas terbakar adalah rekap pada tanggal tertentu dan dapat berbeda antar lembaga dan metode. Titik panas berasal dari satelit VIIRS (NASA FIRMS) dan menandai anomali panas, bukan pasti kebakaran. Lapisan luas terbakar menampilkan 10 provinsi terluas 2023 menurut SiPongi. Untuk data terbaru dan lengkap, rujuk SiPongi dan NASA FIRMS.
        </Alert>
        <GlossCard sx={{ p: { xs: 3, md: 4 }, gap: 1.5 }}>
          {sources.map((s) => (
            <Link key={s.url} href={s.url} target="_blank" rel="noreferrer" underline="hover">{s.label}</Link>
          ))}
        </GlossCard>
      </Section>
    </Box>
  );
}
