import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '../components/ui/FlexGrid';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '../components/ui/Txt';
import Stack from '../components/ui/FlexStack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ForumIcon from '@mui/icons-material/Forum';
import { currentUser, threads, formatRupiah } from '../data/mockData';
import VerifiedBadge from '../components/VerifiedBadge';
import ThreadCard from '../components/ThreadCard';

const nextLevelKarma = 2000;

const donationHistory = [
  { thread: 'Bantu Biaya Operasi Jantung Adik Fira', amount: 500000, date: '2026-08-29' },
  { thread: 'Renovasi Panti Asuhan Nurul Iman', amount: 250000, date: '2026-08-23' },
  { thread: 'Tanam 5000 Mangrove Semarang', amount: 100000, date: '2026-08-15' },
];

export default function Profile() {
  const myThreads = threads.filter((t) => t.authorId === currentUser.id);
  const pct = Math.min(100, Math.round((currentUser.karma / nextLevelKarma) * 100));

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      <Box sx={{ background: 'linear-gradient(180deg,#123A8C,#1E5FE0)', height: 160 }} />
      <Container maxWidth="lg" sx={{ mt: -10 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card sx={{ p: { xs: 2.5, md: 4 }, mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Avatar sx={{ bgcolor: currentUser.avatarColor, width: 96, height: 96, fontSize: 36, fontWeight: 700, border: '4px solid #fff', boxShadow: '0 8px 24px rgba(18,58,140,0.2)' }}>
                {currentUser.avatarInitial}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5" fontWeight={800}>{currentUser.name}</Typography>
                  {currentUser.isKsatria && <VerifiedBadge />}
                </Stack>
                <Typography color="text.secondary" sx={{ mb: 1 }}>@{currentUser.username} · {currentUser.city}</Typography>
                <Typography variant="body2" sx={{ mb: 1.5, maxWidth: 480 }}>{currentUser.bio}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {currentUser.badges.map((b) => (
                    <Chip key={b} icon={<EmojiEventsIcon sx={{ fontSize: '15px !important' }} />} label={b} size="small" color="primary" variant="outlined" />
                  ))}
                </Stack>
              </Box>
              <Button variant="outlined" startIcon={<EditIcon />}>Edit Profil</Button>
            </Stack>
          </Card>
        </motion.div>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>❤️ Poin Kebaikan</Typography>
                <Typography variant="h3" fontWeight={800} color="primary.dark">{currentUser.karma.toLocaleString('id-ID')}</Typography>
                <Typography variant="caption" color="text.secondary">Menuju level "Penjaga Komunitas"</Typography>
                <LinearProgress variant="determinate" value={pct} sx={{ mt: 1.5, mb: 0.5 }} />
                <Typography variant="caption" color="text.secondary">{pct}% ({currentUser.karma}/{nextLevelKarma})</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Poin didapat dari donasi, validasi informasi, dan update rutin kampanye. Reputasi tinggi membuat kampanyemu lebih dipercaya.
                </Typography>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>Statistik</Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ForumIcon fontSize="small" color="primary" />
                      <Typography variant="body2">Thread Dibuat</Typography>
                    </Stack>
                    <Typography fontWeight={700}>{myThreads.length}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <VolunteerActivismIcon fontSize="small" color="primary" />
                      <Typography variant="body2">Total Donasi</Typography>
                    </Stack>
                    <Typography fontWeight={700}>{formatRupiah(donationHistory.reduce((a, b) => a + b.amount, 0))}</Typography>
                  </Stack>
                </Stack>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>Riwayat Donasi</Typography>
                <Stack spacing={2} divider={<Divider />}>
                  {donationHistory.map((d, i) => (
                    <Box key={i}>
                      <Typography variant="body2" fontWeight={700} noWrap>{d.thread}</Typography>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">{new Date(d.date).toLocaleDateString('id-ID')}</Typography>
                        <Typography variant="caption" fontWeight={700} color="primary.dark">{formatRupiah(d.amount)}</Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Thread Saya</Typography>
            <Stack spacing={2.5}>
              {myThreads.map((t, i) => <ThreadCard thread={t} key={t.id} index={i} />)}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
