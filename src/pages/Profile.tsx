import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import CardGrid from '../components/ui/CardGrid';
import EmptyState from '../components/EmptyState';
import VerifiedBadge from '../components/VerifiedBadge';
import ThreadCard from '../components/ThreadCard';
import UserAvatar from '../components/UserAvatar';
import EditProfileDialog from '../components/EditProfileDialog';
import AdminCard from '../admin/AdminCard';
import { SmallBox } from '../admin/Boxes';
import { profilePalette as pal } from '../admin/adminTheme';
import { formatRupiah } from '../data/mockData';
import { useUserProfile } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { joinedLabel } from '../lib/joined';

const nextLevelKarma = 2000;

/** Profile content. Rendered inside the console shell (teal variant) when signed in. */
export default function Profile() {
  const { username } = useParams();
  const { user: authUser } = useAuth();
  const { data: profile, isLoading } = useUserProfile(username);
  const [editing, setEditing] = useState(false);

  if (isLoading) return <Stack alignItems="center" sx={{ py: 12 }}><CircularProgress /></Stack>;
  if (!profile) return <EmptyState icon={<ForumIcon />} title="Pengguna tidak ditemukan" />;

  const { user, threads, donations } = profile;
  const own = authUser?.username === user.username;
  const pct = Math.min(100, Math.round((user.karma / nextLevelKarma) * 100));
  const total = donations.reduce((a, b) => a + b.amount, 0);
  const avatarUrl = own ? authUser?.avatarUrl : user.avatarUrl;

  return (
    <Stack spacing={3}>
      <AdminCard accent={pal.blue}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <UserAvatar name={user.name} src={avatarUrl} color={user.avatarColor} size={96} sx={{ border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.2)' }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{user.name}</Typography>
              {user.isKsatria && <VerifiedBadge />}
            </Stack>
            <Typography color="text.secondary" sx={{ mb: 1.5 }}>@{user.username}{user.city ? ` · ${user.city}` : ''} · {joinedLabel(user.joinedAt)}</Typography>
            {user.bio ? <Typography variant="body2" sx={{ mb: 2, maxWidth: 560 }}>{user.bio}</Typography> : own && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Belum ada bio. Ceritakan sedikit tentang dirimu.</Typography>}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {user.badges.map((b) => <Chip key={b} icon={<EmojiEventsIcon />} label={b} size="small" sx={{ bgcolor: `${pal.blue}18`, color: pal.green }} />)}
            </Stack>
          </Box>
          {own && <Button variant="contained" sx={{ bgcolor: pal.blue, '&:hover': { bgcolor: pal.green } }} startIcon={<EditIcon />} onClick={() => setEditing(true)}>Edit profil</Button>}
        </Stack>
        {own && editing && authUser && (
          <EditProfileDialog open onClose={() => setEditing(false)} initial={{ name: user.name, city: user.city, bio: user.bio, username: user.username, avatarUrl: authUser.avatarUrl, avatarColor: user.avatarColor }} />
        )}
      </AdminCard>

      <CardGrid cols={{ xs: 1, sm: 2, md: 4 }}>
        <SmallBox color={pal.blue} icon={<FavoriteIcon />} value={user.karma.toLocaleString('id-ID')} label="Poin kebaikan" />
        <SmallBox color={pal.cyan} icon={<ForumIcon />} value={threads.length} label="Thread dibuat" />
        <SmallBox color={pal.green} icon={<VolunteerActivismIcon />} value={formatRupiah(total)} label="Total donasi" />
        <SmallBox color={pal.orange} icon={<TrendingUpIcon />} value={`${pct}%`} label="Menuju level berikutnya" />
      </CardGrid>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '340px minmax(0,1fr)' }, alignItems: 'start' }}>
        <Stack spacing={3}>
          <AdminCard title="Level kebaikan" accent={pal.cyan}>
            <Box>
              <LinearProgress variant="determinate" value={pct} sx={{ height: 10, mb: 1, '& .MuiLinearProgress-bar': { bgcolor: pal.blue } }} />
              <Typography variant="caption" color="text.secondary">{user.karma.toLocaleString('id-ID')} dari {nextLevelKarma.toLocaleString('id-ID')} poin</Typography>
            </Box>
          </AdminCard>

          <AdminCard title="Riwayat donasi" accent={pal.green}>
            {donations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Belum ada donasi terkonfirmasi.</Typography>
            ) : (
              <Stack spacing={2} divider={<Divider />}>
                {donations.map((d, i) => (
                  <Box key={i}>
                    <Typography variant="body2" fontWeight={700} noWrap>{d.threadTitle}</Typography>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">{new Date(d.date).toLocaleDateString('id-ID')}</Typography>
                      <Typography variant="caption" fontWeight={700} sx={{ color: pal.green }}>{formatRupiah(d.amount)}</Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </AdminCard>
        </Stack>

        <AdminCard title={`Thread (${threads.length})`} accent={pal.blue}>
          {threads.length === 0 ? (
            <EmptyState icon={<ForumIcon />} title="Belum ada thread" />
          ) : (
            <Stack spacing={3}>{threads.map((t, i) => <ThreadCard thread={t} key={t.id} index={i} />)}</Stack>
          )}
        </AdminCard>
      </Box>
    </Stack>
  );
}
