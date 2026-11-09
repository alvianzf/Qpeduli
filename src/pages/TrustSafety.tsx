import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedIcon from '@mui/icons-material/Verified';
import GroupsIcon from '@mui/icons-material/Groups';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Hero from '../components/ui/Hero';
import Section from '../components/ui/Section';
import CardGrid from '../components/ui/CardGrid';
import GlossCard from '../components/ui/GlossCard';
import IconTile from '../components/ui/IconTile';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';

const pillars = [
  { icon: <GroupsIcon />, title: 'Validasi komunitas', desc: 'Donatur dan anggota memeriksa setiap update lewat diskusi dan poin kebaikan.' },
  { icon: <AdminPanelSettingsIcon />, title: 'Persetujuan admin', desc: 'Admin meninjau dokumen pendukung sebelum tiap tahap dana dicairkan.' },
  { icon: <VerifiedIcon />, title: 'Penjamin terverifikasi', desc: 'Ksatria Komunitas menjamin kampanye dengan reputasinya sendiri.' },
  { icon: <AccountBalanceIcon />, title: 'Pencairan bertahap', desc: 'Dana tidak langsung ke pembuat kampanye, tetapi per milestone setelah verifikasi.' },
];

const steps = [
  'Donatur mengirim dana dan admin mengonfirmasi penerimaannya.',
  'Kampanye dipecah jadi milestone dengan nominal dan tujuan yang jelas.',
  'Tiap milestone butuh validasi komunitas dan tinjauan dokumen admin.',
  'Kampanye besar wajib punya penjamin Ksatria Komunitas.',
  'Setelah disetujui, hanya dana milestone itu yang dicairkan.',
  'Pembuat wajib memberi update transparan sebelum tahap berikutnya.',
];

const karmaRules = [
  { action: 'Berdonasi', points: '+1 s.d. +10' },
  { action: 'Memvalidasi update', points: '+2' },
  { action: 'Update progres (kreator)', points: '+5' },
  { action: 'Menjadi penjamin', points: '+20' },
  { action: 'Laporan palsu', points: 'Akun disuspend' },
];

const criteria = ['Lembaga resmi dengan legalitas jelas', 'Ketua komunitas aktif dengan rekam jejak baik', 'Tokoh masyarakat yang direkomendasikan komunitas'];

export default function TrustSafety() {
  return (
    <Box>
      <Hero
        eyebrow={<Chip icon={<ShieldIcon sx={{ color: '#fff !important' }} />} label="Keamanan" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />}
        title="Komunitas dan Admin Saling Mengawasi"
        subtitle="Pencairan dana tidak bergantung pada satu pihak: ada pengawasan komunitas, verifikasi admin, dan penjamin."
      />

      <Section overlap>
        <CardGrid cols={{ xs: 1, sm: 2, md: 4 }}>
          {pillars.map((p, i) => (
            <GlossCard key={p.title} delay={i * 0.06} sx={{ gap: 2 }}>
              <IconTile>{p.icon}</IconTile>
              <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>{p.title}</Typography>
              <Typography variant="body2" color="text.secondary">{p.desc}</Typography>
            </GlossCard>
          ))}
        </CardGrid>
      </Section>

      <Section>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'minmax(0,7fr) minmax(0,5fr)' }, alignItems: 'start' }}>
          <Stack spacing={3}>
            <GlossCard sx={{ p: { xs: 3, md: 4 }, gap: 3 }}>
              <Typography variant="h5">Alur pencairan</Typography>
              <Stack spacing={3}>
                {steps.map((s, i) => (
                  <Stack direction="row" spacing={2} key={s} alignItems="center">
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{i + 1}</Box>
                    <Typography variant="body2">{s}</Typography>
                  </Stack>
                ))}
              </Stack>
            </GlossCard>
            <GlossCard sx={{ p: { xs: 3, md: 4 }, gap: 2, background: 'linear-gradient(135deg, rgba(66,103,178,0.08), rgba(246,196,83,0.16))' }}>
              <Typography variant="h6">Kenapa hybrid?</Typography>
              <Typography variant="body2"><b>Murni komunitas</b> rentan kolusi akun untuk meloloskan kampanye palsu.</Typography>
              <Typography variant="body2"><b>Murni admin</b> lambat dan mengurangi rasa memiliki.</Typography>
              <Typography variant="body2"><b>Hybrid berbasis milestone</b> memberi kecepatan sekaligus lapisan pengaman.</Typography>
            </GlossCard>
          </Stack>

          <Stack spacing={3}>
            <GlossCard sx={{ p: { xs: 3, md: 4 }, gap: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconTile color="#EF4444"><FavoriteIcon /></IconTile>
                <Typography variant="h6">Poin Kebaikan</Typography>
              </Stack>
              <Stack spacing={2.5} divider={<Divider />}>
                {karmaRules.map((k) => (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" key={k.action} spacing={2}>
                    <Typography variant="body2">{k.action}</Typography>
                    <Chip label={k.points} size="small" color={k.points.startsWith('+') ? 'success' : 'error'} variant="outlined" />
                  </Stack>
                ))}
              </Stack>
            </GlossCard>
            <GlossCard sx={{ p: { xs: 3, md: 4 }, gap: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconTile><ShieldIcon /></IconTile>
                <Typography variant="h6">Ksatria Komunitas</Typography>
              </Stack>
              <Stack spacing={2}>
                {criteria.map((t) => (
                  <Stack direction="row" spacing={1.5} key={t} alignItems="center">
                    <CheckCircleOutlineIcon color="primary" fontSize="small" />
                    <Typography variant="body2">{t}</Typography>
                  </Stack>
                ))}
              </Stack>
            </GlossCard>
          </Stack>
        </Box>
      </Section>
    </Box>
  );
}
