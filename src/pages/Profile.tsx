import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ForumIcon from '@mui/icons-material/Forum';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Hero from '../components/ui/Hero';
import Section from '../components/ui/Section';
import GlossCard from '../components/ui/GlossCard';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import EmptyState from '../components/EmptyState';
import VerifiedBadge from '../components/VerifiedBadge';
import ThreadCard from '../components/ThreadCard';
import { formatRupiah } from '../data/mockData';
import { useUserProfile } from '../lib/queries';
import { useAuth } from '../context/AuthContext';

const nextLevelKarma = 2000;

export default function Profile() {
  const { username } = useParams();
  const { user: authUser } = useAuth();
  const { data: profile, isLoading } = useUserProfile(username);

  if (isLoading) return <Stack alignItems="center" sx={{ py: 12 }}><CircularProgress /></Stack>;
  if (!profile) {
    return <Section><EmptyState icon={<ForumIcon />} title="Pengguna tidak ditemukan" /></Section>;
  }

  const { user, threads, donations } = profile;
  const own = authUser?.username === user.username;
  const pct = Math.min(100, Math.round((user.karma / nextLevelKarma) * 100));
  const total = donations.reduce((a, b) => a + b.amount, 0);

  return (
    <Box>
      <Hero size="sm" title={<>&nbsp;</>} />
      <Section overlap>
        <GlossCard sx={{ p: { xs: 3, md: 4 }, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Avatar sx={{ bgcolor: user.avatarColor, width: 96, height: 96, fontSize: 36, fontWeight: 700, border: '4px solid #fff' }}>{user.avatarInitial}</Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5">{user.name}</Typography>
                {user.isKsatria && <VerifiedBadge />}
              </Stack>
              <Typography color="text.secondary" sx={{ mb: 1.5 }}>@{user.username}{user.city ? ` · ${user.city}` : ''}</Typography>
              {user.bio && <Typography variant="body2" sx={{ mb: 2, maxWidth: 480 }}>{user.bio}</Typography>}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {user.badges.map((b) => <Chip key={b} icon={<EmojiEventsIcon />} label={b} size="small" color="primary" variant="outlined" />)}
              </Stack>
            </Box>
            {own && <Button variant="outlined" startIcon={<EditIcon />}>Edit</Button>}
          </Stack>
        </GlossCard>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '340px minmax(0,1fr)' }, alignItems: 'start' }}>
          <Stack spacing={3}>
            <GlossCard sx={{ gap: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FavoriteIcon sx={{ color: '#EF4444' }} fontSize="small" />
                <Typography variant="subtitle2">Poin Kebaikan</Typography>
              </Stack>
              <Typography variant="h3" color="primary.dark">{user.karma.toLocaleString('id-ID')}</Typography>
              <Box>
                <LinearProgress variant="determinate" value={pct} sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">{pct}% menuju level berikutnya</Typography>
              </Box>
            </GlossCard>

            <GlossCard sx={{ gap: 2.5 }}>
              <Typography variant="subtitle2">Statistik</Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center"><ForumIcon fontSize="small" color="primary" /><Typography variant="body2">Thread</Typography></Stack>
                <Typography fontWeight={700}>{threads.length}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center"><VolunteerActivismIcon fontSize="small" color="primary" /><Typography variant="body2">Donasi</Typography></Stack>
                <Typography fontWeight={700}>{formatRupiah(total)}</Typography>
              </Stack>
            </GlossCard>

            <GlossCard sx={{ gap: 2 }}>
              <Typography variant="subtitle2">Riwayat donasi</Typography>
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
            </GlossCard>
          </Stack>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>Thread</Typography>
            {threads.length === 0 ? (
              <EmptyState icon={<ForumIcon />} title="Belum ada thread" />
            ) : (
              <Stack spacing={3}>{threads.map((t, i) => <ThreadCard thread={t} key={t.id} index={i} />)}</Stack>
            )}
          </Box>
        </Box>
      </Section>
    </Box>
  );
}
