import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '../components/ui/Txt';
import Grid from '../components/ui/FlexGrid';
import Card from '@mui/material/Card';
import Stack from '../components/ui/FlexStack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { motion } from 'framer-motion';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedIcon from '@mui/icons-material/Verified';
import GroupsIcon from '@mui/icons-material/Groups';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { heroGradient } from '../theme/theme';

const pillars = [
  {
    icon: <GroupsIcon fontSize="large" />,
    title: 'Validasi Komunitas',
    desc: 'Setiap update progres kampanye dapat diverifikasi langsung oleh donatur & anggota komunitas melalui kolom diskusi dan Poin Kebaikan yang mereka berikan.',
  },
  {
    icon: <AdminPanelSettingsIcon fontSize="large" />,
    title: 'Persetujuan Admin',
    desc: 'Tim admin Qpeduli meninjau dokumen pendukung (kuitansi, foto, surat keterangan) sebelum tiap tahap dana benar-benar dicairkan.',
  },
  {
    icon: <VerifiedIcon fontSize="large" />,
    title: 'Guarantor Ksatria Komunitas',
    desc: 'Untuk kampanye besar, seorang "Ksatria Komunitas" (lembaga resmi/tokoh terverifikasi) menjadi penjamin yang ikut bertanggung jawab.',
  },
  {
    icon: <AccountBalanceIcon fontSize="large" />,
    title: 'Dana Ditahan di Eskrow',
    desc: 'Dana donasi tidak langsung ke pembuat kampanye — ditahan di rekening eskrow Qpeduli dan dicairkan bertahap per-milestone.',
  },
];

const steps = [
  'Donatur menyumbang → dana masuk ke rekening eskrow Qpeduli, bukan langsung ke pembuat kampanye.',
  'Kampanye dipecah menjadi milestone (tahapan) dengan nominal & tujuan yang jelas sejak awal.',
  'Setiap milestone butuh: (a) ambang validasi dari komunitas/donatur, dan (b) tinjauan dokumen oleh admin.',
  'Untuk kampanye di atas nominal tertentu, wajib ada guarantor Ksatria Komunitas yang ikut menjamin.',
  'Setelah disetujui, dana milestone tersebut baru dicairkan — bukan seluruh dana sekaligus.',
  'Pembuat kampanye wajib memberi update transparan (foto/laporan) sebelum milestone berikutnya dibuka.',
];

const karmaRules = [
  { action: 'Berdonasi ke sebuah kampanye', points: '+1 s.d. +10' },
  { action: 'Memvalidasi update / laporan kampanye', points: '+2' },
  { action: 'Rutin memberi update progres (sebagai kreator)', points: '+5' },
  { action: 'Menjadi guarantor kampanye yang berhasil', points: '+20' },
  { action: 'Laporan terbukti palsu / penyalahgunaan dana', points: '-Reputasi & suspend akun' },
];

export default function TrustSafety() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      <Box sx={{ background: heroGradient, color: '#fff', pt: { xs: 6, md: 9 }, pb: { xs: 8, md: 11 } }}>
        <Container maxWidth="lg">
          <Chip icon={<ShieldIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} />} label="Transparansi & Keamanan" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700, mb: 2 }} />
          <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.9rem', md: '2.6rem' }, mb: 1.5, maxWidth: 720 }}>
            Model Keamanan Hybrid: Komunitas & Admin Saling Mengawasi
          </Typography>
          <Typography sx={{ opacity: 0.88, maxWidth: 640 }}>
            Qpeduli tidak menyerahkan pencairan dana sepenuhnya ke satu pihak. Kami menggabungkan pengawasan komunitas yang transparan dengan verifikasi admin yang tegas — plus jaminan dari tokoh terverifikasi untuk kampanye besar.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -5, md: -6 } }}>
        <Grid container spacing={2.5}>
          {pillars.map((p, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={p.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ color: 'primary.main', mb: 1.5 }}>{p.icon}</Box>
                  <Typography fontWeight={800} sx={{ mb: 1 }}>{p.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.desc}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card sx={{ p: { xs: 3, md: 4 }, mt: 3 }}>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 2.5 }}>Alur Pencairan Dana Bertahap</Typography>
                <Stack spacing={2.5}>
                  {steps.map((s, i) => (
                    <Stack direction="row" spacing={2} key={i} alignItems="flex-start">
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0,
                      }}>
                        {i + 1}
                      </Box>
                      <Typography variant="body2" sx={{ pt: 0.4 }}>{s}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card sx={{ p: { xs: 3, md: 4 }, mt: 3, backgroundImage: 'linear-gradient(135deg, rgba(30,95,224,0.06), rgba(96,165,250,0.1))' }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>Kenapa Bukan Murni Komunitas atau Murni Admin?</Typography>
                <Stack spacing={1.5}>
                  <Typography variant="body2">
                    <b>Murni komunitas</b> rentan terhadap brigading atau kolusi sekelompok akun untuk meloloskan kampanye palsu.
                  </Typography>
                  <Typography variant="body2">
                    <b>Murni admin</b> menjadi bottleneck, lambat, dan mengurangi rasa memiliki serta transparansi yang justru jadi nilai jual komunitas ini.
                  </Typography>
                  <Typography variant="body2">
                    Model <b>hybrid berbasis milestone</b> memberi kecepatan sekaligus lapisan keamanan berlapis — mirip standar yang dipakai platform crowdfunding tepercaya di dunia.
                  </Typography>
                </Stack>
              </Card>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card sx={{ p: { xs: 3, md: 4 }, mt: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <FavoriteIcon sx={{ color: '#EF4444' }} />
                  <Typography variant="h6" fontWeight={800}>Sistem Poin Kebaikan</Typography>
                </Stack>
                <Stack spacing={1.5} divider={<Divider />}>
                  {karmaRules.map((k) => (
                    <Stack direction="row" justifyContent="space-between" key={k.action} spacing={2}>
                      <Typography variant="body2">{k.action}</Typography>
                      <Chip label={k.points} size="small" color={k.points.startsWith('-') ? 'error' : 'success'} variant="outlined" />
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card sx={{ p: { xs: 3, md: 4 }, mt: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <ShieldIcon color="primary" />
                  <Typography variant="h6" fontWeight={800}>Verifikasi Ksatria Komunitas</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {['Lembaga resmi (yayasan, panti, ormas) dengan legalitas jelas', 'Ketua komunitas regional aktif & memiliki rekam jejak baik', 'Tokoh masyarakat yang direkomendasikan komunitas'].map((t) => (
                    <Stack direction="row" spacing={1.5} key={t} alignItems="flex-start">
                      <CheckCircleOutlineIcon color="primary" fontSize="small" sx={{ mt: 0.3 }} />
                      <Typography variant="body2">{t}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
