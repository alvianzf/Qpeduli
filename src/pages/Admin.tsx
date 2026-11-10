import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '../components/ui/Txt';
import Card from '@mui/material/Card';
import Stack from '../components/ui/FlexStack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AdminCard from '../admin/AdminCard';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import EmptyState from '../components/EmptyState';
import { Sprout } from '../components/art/Nature';
import { formatRupiah, timeAgo } from '../data/mockData';
import { useAuth, type Role } from '../context/AuthContext';
import { useAdminList, useAdminAction, apiErrorMessage } from '../lib/queries';

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

export function Verification() {
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

export function Donations() {
  const [status, setStatus] = useState<'PENDING' | 'CONFIRMED' | 'FAILED'>('PENDING');
  const { data = [], isLoading } = useAdminList('donations', { status });
  const { run, busy, error } = useRun();
  return (
    <Stack spacing={2}>
      <ToggleButtonGroup exclusive size="small" value={status} onChange={(_, v) => v && setStatus(v)} aria-label="Status donasi">
        <ToggleButton value="PENDING">Menunggu</ToggleButton>
        <ToggleButton value="CONFIRMED">Terkonfirmasi</ToggleButton>
        <ToggleButton value="FAILED">Ditolak</ToggleButton>
      </ToggleButtonGroup>
      {status === 'PENDING' && <Alert severity="info">Konfirmasi hanya setelah dana benar-benar masuk ke rekening. Cocokkan nominal unik dan referensi QP-ID. Konfirmasi menambah total kampanye dan memberi poin kebaikan ke donatur.</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {isLoading ? <Loading /> : !data.length ? (
        <EmptyState icon={<Sprout size={34} />} title="Tidak ada donasi di status ini" />
      ) : (
        <AdminCard flush>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Referensi</TableCell><TableCell>Nominal</TableCell><TableCell>Kampanye</TableCell><TableCell>Donatur</TableCell><TableCell>Waktu</TableCell>{status === 'PENDING' && <TableCell align="right">Aksi</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((d: any) => (
                  <TableRow key={d.id} hover>
                    <TableCell>QP-{d.id}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{formatRupiah(Number(d.amount))}</TableCell>
                    <TableCell>{campaignTitle(d.campaign)}{d.reward ? ` · ${d.reward.title}` : ''}</TableCell>
                    <TableCell>{d.donor ? `${d.donor.name} (@${d.donor.username})` : 'Tamu'}{d.anonymous ? ' · anonim' : ''}</TableCell>
                    <TableCell>{timeAgo(d.createdAt)}</TableCell>
                    {status === 'PENDING' && (
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Button size="small" variant="contained" disabled={busy} onClick={() => run('post', `/campaigns/${d.campaignId}/donations/${d.id}/confirm`)}>Konfirmasi</Button>{' '}
                        <Button size="small" color="error" disabled={busy} onClick={() => run('post', `/admin/donations/${d.id}/reject`)}>Tolak</Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AdminCard>
      )}
    </Stack>
  );
}

export function Disbursement() {
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

export function Users() {
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
                disabled={busy || u.id === me?.id || (me?.role !== 'SUPERADMIN' && (u.role === 'ADMIN' || u.role === 'SUPERADMIN'))}
                onChange={(e) => run('patch', `/admin/users/${u.id}`, { role: e.target.value })}
              >
                <MenuItem value="USER">Pengguna</MenuItem>
                <MenuItem value="KSATRIA_KOMUNITAS">Ksatria Komunitas</MenuItem>
                <MenuItem value="ADMIN" disabled={me?.role !== 'SUPERADMIN'}>Admin</MenuItem>
                <MenuItem value="SUPERADMIN" disabled={me?.role !== 'SUPERADMIN'}>Superadmin</MenuItem>
              </Select>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

