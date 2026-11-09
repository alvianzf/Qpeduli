import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '../components/ui/Txt';
import Grid from '../components/ui/FlexGrid';
import Card from '@mui/material/Card';
import Stack from '../components/ui/FlexStack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { Navigate } from 'react-router-dom';
import HeroDecor from '../components/HeroDecor';
import EmptyState from '../components/EmptyState';
import { Sprout } from '../components/art/Nature';
import { heroBase } from '../theme/theme';
import { formatRupiah, timeAgo } from '../data/mockData';
import { useAuth, type Role } from '../context/AuthContext';
import { useAdminOverview, useAdminList, useAdminAction, apiErrorMessage } from '../lib/queries';

function useRun() {
  const act = useAdminAction();
  const [error, setError] = useState('');
  const run = async (method: 'post' | 'patch', url: string, data?: unknown) => {
    setError('');
    try {
      await act.mutateAsync({ method, url, data });
    } catch (e) {
      setError(apiErrorMessage(e, 'Aksi gagal.'));
    }
  };
  return { run, busy: act.isPending, error };
}

const campaignTitle = (c: any) => c.title || c.thread?.title || `Kampanye #${c.id}`;
const kindLabel = (k: string) => (k === 'MODAL_USAHA' ? 'Modal Usaha' : 'Aksi Sosial');

function Loading() {
  return <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>;
}

function Overview() {
  const { data } = useAdminOverview();
  if (!data) return <Loading />;
  const cards = [
    { label: 'Menunggu verifikasi', value: data.pendingCampaigns },
    { label: 'Donasi menunggu konfirmasi', value: data.pendingDonations },
    { label: 'Kampanye aktif', value: data.activeCampaigns },
    { label: 'Pengguna', value: data.users },
    { label: 'Dana terkumpul', value: formatRupiah(Number(data.totalCollected)) },
    { label: 'Dana dicairkan', value: formatRupiah(Number(data.totalDisbursed)) },
  ];
  return (
    <Grid container spacing={3}>
      {cards.map((c) => (
        <Grid size={{ xs: 6, md: 4 }} key={c.label}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h5" color="primary.dark">{c.value}</Typography>
            <Typography variant="body2" color="text.secondary">{c.label}</Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function Verification() {
  const { data = [], isLoading } = useAdminList('campaigns', { status: 'PENDING_VERIFICATION' });
  const { run, busy, error } = useRun();
  if (isLoading) return <Loading />;
  if (!data.length) return <EmptyState icon={<Sprout size={34} />} title="Tidak ada yang menunggu verifikasi" description="Pengajuan baru akan muncul di sini." />;
  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {data.map((c: any) => (
        <Card key={c.id} sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                <Chip size="small" label={kindLabel(c.kind)} color="primary" variant="outlined" />
                <Chip size="small" label={timeAgo(c.createdAt)} />
              </Stack>
              <Typography fontWeight={700}>{campaignTitle(c)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Target {formatRupiah(Number(c.target))}
                {c.owner ? ` · oleh ${c.owner.name} (@${c.owner.username})` : ''}
              </Typography>
              {c.story && (
                <Typography variant="body2" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.story}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button variant="contained" disabled={busy} onClick={() => run('patch', `/campaigns/${c.id}/status`, { status: 'ACTIVE' })}>
                Setujui
              </Button>
              {c.kind === 'MODAL_USAHA' && (
                <Button href={`/modal-usaha/${c.id}`} target="_blank">Lihat</Button>
              )}
            </Stack>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

function Donations() {
  const { data = [], isLoading } = useAdminList('donations', { status: 'PENDING' });
  const { run, busy, error } = useRun();
  if (isLoading) return <Loading />;
  if (!data.length) return <EmptyState icon={<Sprout size={34} />} title="Semua donasi sudah diproses" />;
  return (
    <Stack spacing={1.5}>
      <Alert severity="info">Konfirmasi hanya setelah dana benar-benar masuk ke rekening. Konfirmasi menambah total kampanye dan memberi poin kebaikan ke donatur.</Alert>
      {error && <Alert severity="error">{error}</Alert>}
      {data.map((d: any) => (
        <Card key={d.id} sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={800} color="primary.dark">{formatRupiah(Number(d.amount))}</Typography>
              <Typography variant="body2">{campaignTitle(d.campaign)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {d.donor ? `${d.donor.name} (@${d.donor.username})` : 'Tamu'}{d.anonymous ? ' · anonim' : ''} · {timeAgo(d.createdAt)}
                {d.reward ? ` · hadiah: ${d.reward.title}` : ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button variant="contained" disabled={busy} onClick={() => run('post', `/campaigns/${d.campaignId}/donations/${d.id}/confirm`)}>Konfirmasi</Button>
              <Button color="error" disabled={busy} onClick={() => run('post', `/admin/donations/${d.id}/reject`)}>Tolak</Button>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

function Disbursement() {
  const { data = [], isLoading } = useAdminList('campaigns', { status: 'ACTIVE' });
  const { run, busy, error } = useRun();
  if (isLoading) return <Loading />;
  const withMilestones = data.filter((c: any) => c.milestones.length);
  if (!withMilestones.length) return <EmptyState icon={<Sprout size={34} />} title="Belum ada milestone aktif" />;
  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {withMilestones.map((c: any) => {
        const available = Number(c.collected) - Number(c.disbursed);
        return (
          <Card key={c.id} sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
              <Chip size="small" label={kindLabel(c.kind)} color="primary" variant="outlined" />
            </Stack>
            <Typography fontWeight={700}>{campaignTitle(c)}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Terkumpul {formatRupiah(Number(c.collected))} · dicairkan {formatRupiah(Number(c.disbursed))} · tersedia {formatRupiah(available)}
            </Typography>
            <Stack spacing={1}>
              {c.milestones.map((m: any) => (
                <Stack key={m.id} direction="row" spacing={1.5} alignItems="center">
                  <Typography sx={{ flex: 1 }} variant="body2">{m.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{formatRupiah(Number(m.amount))}</Typography>
                  {m.released ? (
                    <Chip size="small" color="success" label="Cair" />
                  ) : (
                    <Button size="small" variant="outlined" disabled={busy || available < Number(m.amount)} onClick={() => run('post', `/campaigns/${c.id}/milestones/${m.id}/release`)}>
                      Cairkan
                    </Button>
                  )}
                </Stack>
              ))}
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}

function Users() {
  const [q, setQ] = useState('');
  const { data = [], isLoading } = useAdminList('users', q ? { q } : {});
  const { run, busy, error } = useRun();
  const { user: me } = useAuth();
  return (
    <Stack spacing={2}>
      <TextField label="Cari nama, username, atau email" value={q} onChange={(e) => setQ(e.target.value)} fullWidth />
      {error && <Alert severity="error">{error}</Alert>}
      {isLoading ? <Loading /> : data.map((u: any) => (
        <Card key={u.id} sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700}>{u.name} <Typography component="span" variant="body2" color="text.secondary">@{u.username}</Typography></Typography>
              <Typography variant="caption" color="text.secondary">{u.email} · {u.karma} poin</Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <FormControlLabel
                control={<Switch size="small" checked={u.isVerified} disabled={busy} onChange={(e) => run('patch', `/admin/users/${u.id}`, { isVerified: e.target.checked })} />}
                label={<Typography variant="caption">Terverifikasi</Typography>}
              />
              <Select
                size="small"
                value={u.role as Role}
                disabled={busy || u.id === me?.id}
                onChange={(e) => run('patch', `/admin/users/${u.id}`, { role: e.target.value })}
              >
                <MenuItem value="USER">Pengguna</MenuItem>
                <MenuItem value="KSATRIA_KOMUNITAS">Ksatria Komunitas</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

const tabs = ['Ringkasan', 'Verifikasi', 'Donasi', 'Pencairan', 'Pengguna'];

export default function Admin() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState(0);
  if (loading) return <Loading />;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />;

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      <Box sx={{ ...heroBase, pt: { xs: 5, md: 7 }, pb: { xs: 8, md: 10 } }}>
        <HeroDecor />
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>Panel Admin</Typography>
          <Typography sx={{ opacity: 0.85 }}>Verifikasi usaha, konfirmasi donasi, cairkan milestone, kelola peran.</Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ mt: -3, position: 'relative', zIndex: 1 }}>
        <Card sx={{ mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            {tabs.map((t) => <Tab key={t} label={t} />)}
          </Tabs>
        </Card>
        {tab === 0 && <Overview />}
        {tab === 1 && <Verification />}
        {tab === 2 && <Donations />}
        {tab === 3 && <Disbursement />}
        {tab === 4 && <Users />}
      </Container>
    </Box>
  );
}
