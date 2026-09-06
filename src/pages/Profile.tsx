import { useParams } from 'react-router-dom';
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
import CircularProgress from '@mui/material/CircularProgress';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ForumIcon from '@mui/icons-material/Forum';
import { formatRupiah } from '../data/mockData';
import { useUserProfile } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import VerifiedBadge from '../components/VerifiedBadge';
import ThreadCard from '../components/ThreadCard';

const nextLevelKarma = 2000;

export default function Profile() {
  const { username } = useParams();
  const { user: authUser } = useAuth();
  const { data: profile, isLoading } = useUserProfile(username);

  if (isLoading) {
    return (
      <Container sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={800}>Pengguna tidak ditemukan</Typography>
      </Container>
    );
  }

  const { user, threads: myThreads, donations } = profile;
  const isOwnProfile = authUser?.username === user.username;
  const pct = Math.min(100, Math.round((user.karma / nextLevelKarma) * 100));
  const totalDonasi = donations.reduce((a, b) => a + b.amount, 0);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      <Box sx={{ background: 'linear-gradient(180deg,#2F4F8A,#4267B2)', height: 160 }} />
      <Container maxWidth="lg" sx={{ mt: -10 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card sx={{ p: { xs: 2.5, md: 4 }, mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Avatar sx={{ bgcolor: user.avatarColor, width: 96, height: 96, fontSize: 36, fontWeight: 700, border: '4px solid #fff', boxShadow: '0 8px 24px rgba(47,79,138,0.2)' }}>
                {user.avatarInitial}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5" fontWeight={800}>{user.name}</Typography>
                  {user.isKsatria && <VerifiedBadge />}
                </Stack>
                <Typography color="text.secondary" sx={{ mb: 1 }}>@{user.username}{user.city ? ` · ${user.city}` : ''}</Typography>
                {user.bio && <Typography variant="body2" sx={{ mb: 1.5, maxWidth: 480 }}>{user.bio}</Typography>}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {user.badges.map((b) => (
                    <Chip key={b} icon={<EmojiEventsIcon sx={{ fontSize: '15px !important' }} />} label={b} size="small" color="primary" variant="outlined" />
                  ))}
                </Stack>
              </Box>
              {isOwnProfile && <Button variant="outlined" startIcon={<EditIcon />}>Edit Profil</Button>}
            </Stack>
          </Card>
        </motion.div>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>❤️ Poin Kebaikan</Typography>
                <Typography variant="h3" fontWeight={800} color="primary.dark">{user.karma.toLocaleString('id-ID')}</Typography>
                <Typography variant="caption" color="text.secondary">Menuju level "Penjaga Komunitas"</Typography>
                <LinearProgress variant="determinate" value={pct} sx={{ mt: 1.5, mb: 0.5 }} />
                <Typography variant="caption" color="text.secondary">{pct}% ({user.karma}/{nextLevelKarma})</Typography>
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
                      <Typography variant="body2">Total Donasi Terkonfirmasi</Typography>
                    </Stack>
                    <Typography fontWeight={700}>{formatRupiah(totalDonasi)}</Typography>
                  </Stack>
                </Stack>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>Riwayat Donasi</Typography>
                {donations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Belum ada donasi terkonfirmasi.</Typography>
                ) : (
                  <Stack spacing={2} divider={<Divider />}>
                    {donations.map((d, i) => (
                      <Box key={i}>
                        <Typography variant="body2" fontWeight={700} noWrap>{d.threadTitle}</Typography>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">{new Date(d.date).toLocaleDateString('id-ID')}</Typography>
                          <Typography variant="caption" fontWeight={700} color="primary.dark">{formatRupiah(d.amount)}</Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Thread Saya</Typography>
            {myThreads.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Belum ada thread.</Typography>
            ) : (
              <Stack spacing={2.5}>
                {myThreads.map((t, i) => <ThreadCard thread={t} key={t.id} index={i} />)}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
