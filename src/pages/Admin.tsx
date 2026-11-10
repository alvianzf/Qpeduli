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
import { useFeedback, type ConfirmOptions } from '../feedback/FeedbackProvider';
import CircularProgress from '@mui/material/CircularProgress';
import EmptyState from '../components/EmptyState';
import { Sprout } from '../components/art/Nature';
import { formatRupiah, timeAgo } from '../data/mockData';
import { useAdminList, useAdminAction, apiErrorMessage } from '../lib/queries';

export interface RunOptions { confirm?: ConfirmOptions; success?: string }

export function useRun() {
  const act = useAdminAction();
  const { toast, confirm } = useFeedback();
  const run = async (method: 'post' | 'patch', url: string, data?: unknown, opts: RunOptions = {}) => {
    if (opts.confirm && !(await confirm(opts.confirm))) return false;
    try {
      await act.mutateAsync({ method, url, data });
      toast.success(opts.success ?? 'Berhasil disimpan.');
      return true;
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Aksi gagal.'));
      return false;
    }
  };
  return { run, busy: act.isPending, error: '' };
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
              <Button variant="contained" disabled={busy} onClick={() => run('patch', `/campaigns/${c.id}/status`, { status: 'ACTIVE' }, { confirm: { title: 'Setujui kampanye ini?', text: 'Kampanye akan tampil dan mulai menerima dukungan.', icon: 'question', confirmText: 'Ya, setujui' }, success: 'Kampanye disetujui.' })}>
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
                        <Button size="small" variant="contained" disabled={busy} onClick={() => run('post', `/campaigns/${d.campaignId}/donations/${d.id}/confirm`, undefined, { confirm: { title: 'Konfirmasi donasi?', text: `Pastikan ${formatRupiah(Number(d.amount))} sudah masuk ke rekening (ref QP-${d.id}).`, icon: 'question', confirmText: 'Ya, sudah masuk' }, success: 'Donasi dikonfirmasi.' })}>Konfirmasi</Button>{' '}
                        <Button size="small" color="error" disabled={busy} onClick={() => run('post', `/admin/donations/${d.id}/reject`, undefined, { confirm: { title: 'Tolak donasi ini?', text: 'Donasi ditandai gagal dan tidak dihitung ke kampanye.', icon: 'warning', danger: true, confirmText: 'Ya, tolak' }, success: 'Donasi ditolak.' })}>Tolak</Button>
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
                    <Button size="small" variant="outlined" disabled={busy || available < Number(m.amount)} onClick={() => run('post', `/campaigns/${c.id}/milestones/${m.id}/release`, undefined, { confirm: { title: 'Cairkan dana tahap ini?', text: `${formatRupiah(Number(m.amount))} untuk "${m.label}" akan ditandai cair.`, icon: 'warning', confirmText: 'Ya, cairkan' }, success: 'Dana dicairkan.' })}>
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
