import { useState } from 'react';
import Box from '@mui/material/Box';
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
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PeopleIcon from '@mui/icons-material/People';
import PaymentsIcon from '@mui/icons-material/Payments';
import CampaignIcon from '@mui/icons-material/Campaign';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FlagIcon from '@mui/icons-material/Flag';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import CardGrid from '../components/ui/CardGrid';
import AdminCard from './AdminCard';
import { SmallBox, InfoBox } from './Boxes';
import { lte } from './adminTheme';
import { AreaChart, Panel } from '../pages/AdminExtras';
import api from '../lib/api';
import { formatRupiah, timeAgo } from '../data/mockData';
import { useAdminOverview, useAdminList, useAdminAction, apiErrorMessage } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../feedback/FeedbackProvider';

const fmt = (n: number) => Math.round(n).toLocaleString('id-ID');
const title = (c: any) => c.title || c.thread?.title || `Kampanye #${c.id}`;
const kindLabel = (k: string) => (k === 'MODAL_USAHA' ? 'Modal Usaha' : 'Aksi Sosial');
const statusLabel: Record<string, string> = { PENDING_VERIFICATION: 'Menunggu', ACTIVE: 'Aktif', COMPLETED: 'Selesai' };
const statusColor: Record<string, 'warning' | 'success' | 'default'> = { PENDING_VERIFICATION: 'warning', ACTIVE: 'success', COMPLETED: 'default' };

function Loading() {
  return <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>;
}

function DonationQueue() {
  const navigate = useNavigate();
  const { data: pending = [] } = useAdminList('donations', { status: 'PENDING' });
  return (
    <AdminCard
        accent={lte.orange}
        title="Antrean donasi"
        hint="Menunggu konfirmasi pembayaran"
        tools={<Button size="small" onClick={() => navigate('/admin/donasi')}>Kelola semua</Button>}
        flush
      >
        {pending.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>Tidak ada donasi yang menunggu.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow><TableCell>Referensi</TableCell><TableCell>Nominal</TableCell><TableCell>Kampanye</TableCell><TableCell>Waktu</TableCell></TableRow></TableHead>
              <TableBody>
                {pending.slice(0, 6).map((d: any) => (
                  <TableRow key={d.id} hover>
                    <TableCell>QP-{d.id}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{formatRupiah(Number(d.amount))}</TableCell>
                    <TableCell>{title(d.campaign)}</TableCell>
                    <TableCell>{timeAgo(d.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AdminCard>
  );
}

export function Dashboard() {
  const { data: ov } = useAdminOverview();
  const { user } = useAuth();
  const has = (p: string) => (user?.permissions ?? []).includes(p);
  const { data: an } = useQuery({ queryKey: ['admin', 'analytics', 30], queryFn: async () => (await api.get('/admin/analytics', { params: { days: 30 } })).data, enabled: has('analitik') });
  if (!ov) return <Loading />;
  return (
    <Stack spacing={3}>
      <CardGrid cols={{ xs: 1, sm: 2, md: 4 }}>
        <SmallBox color={lte.orange} icon={<VolunteerActivismIcon />} value={fmt(ov.pendingDonations)} label="Donasi menunggu konfirmasi" to="/admin/donasi" />
        <SmallBox color={lte.blue} icon={<FactCheckIcon />} value={fmt(ov.pendingCampaigns)} label="Kampanye menunggu verifikasi" to="/admin/verifikasi" />
        <SmallBox color={lte.cyan} icon={<PaymentsIcon />} value={formatRupiah(Number(ov.totalCollected))} label="Dana terkumpul" to="/admin/analitik" />
        <SmallBox color={lte.green} icon={<PeopleIcon />} value={fmt(ov.users)} label="Pengguna terdaftar" to="/admin/pengguna" />
      </CardGrid>

      <CardGrid cols={{ xs: 1, sm: 2, md: 4 }}>
        <InfoBox color={lte.blue} icon={<CampaignIcon />} label="Kampanye aktif" value={fmt(ov.activeCampaigns)} />
        <InfoBox color={lte.cyan} icon={<FavoriteIcon />} label="Donasi terkonfirmasi" value={`${fmt(ov.confirmedDonations ?? 0)} · rata-rata ${formatRupiah(Number(ov.avgDonation ?? 0))}`} />
        <InfoBox color={lte.green} icon={<AutorenewIcon />} label="Donatur (berulang)" value={`${fmt(ov.donors ?? 0)} (${fmt(ov.repeatDonors ?? 0)})`} />
        <InfoBox color={lte.orange} icon={<FlagIcon />} label="Kampanye terdanai · dana dicairkan" value={`${fmt(ov.fundedCampaigns ?? 0)} · ${formatRupiah(Number(ov.totalDisbursed))}`} />
      </CardGrid>

      {has('analitik') && <CardGrid cols={{ xs: 1, md: 2 }}>
        <Panel accent={lte.blue} title="Dana masuk, 30 hari" hint="Donasi terkonfirmasi per hari (Rp)">
          {an ? <AreaChart color="#4267B2" money points={an.donations.map((x: any) => ({ d: x.d, v: x.total }))} /> : <Loading />}
        </Panel>
        <Panel accent={lte.orange} title="Pengguna baru, 30 hari">
          {an ? <AreaChart color="#E65100" points={an.signups.map((x: any) => ({ d: x.d, v: x.n }))} /> : <Loading />}
        </Panel>
      </CardGrid>}

      {has('donasi') && <DonationQueue />}
    </Stack>
  );
}

export function Campaigns() {
  const [status, setStatus] = useState<'' | 'PENDING_VERIFICATION' | 'ACTIVE' | 'COMPLETED'>('');
  const [kind, setKind] = useState<'' | 'AKSI_SOSIAL' | 'MODAL_USAHA'>('');
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (kind) params.kind = kind;
  const { data = [], isLoading } = useAdminList('campaigns', params);
  const act = useAdminAction();
  const { toast, confirm } = useFeedback();
  const [error, setError] = useState('');
  const setCampaignStatus = async (id: number, next: string) => {
    setError('');
    const copy: Record<string, [string, string]> = { ACTIVE: ['Aktifkan kampanye?', 'Kampanye tampil dan menerima dukungan.'], COMPLETED: ['Selesaikan kampanye?', 'Kampanye ditandai selesai dan tidak menerima dukungan baru.'] };
    if (!(await confirm({ title: copy[next][0], text: copy[next][1], icon: 'question', confirmText: 'Ya, lanjutkan' }))) return;
    try {
      await act.mutateAsync({ method: 'patch', url: `/campaigns/${id}/status`, data: { status: next } });
      toast.success('Status kampanye diperbarui.');
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Gagal mengubah status.'));
    }
  };
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <ToggleButtonGroup exclusive size="small" value={status} onChange={(_, v) => setStatus(v ?? '')} aria-label="Status">
          <ToggleButton value="">Semua</ToggleButton>
          <ToggleButton value="PENDING_VERIFICATION">Menunggu</ToggleButton>
          <ToggleButton value="ACTIVE">Aktif</ToggleButton>
          <ToggleButton value="COMPLETED">Selesai</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup exclusive size="small" value={kind} onChange={(_, v) => setKind(v ?? '')} aria-label="Jenis">
          <ToggleButton value="">Semua jenis</ToggleButton>
          <ToggleButton value="AKSI_SOSIAL">Aksi Sosial</ToggleButton>
          <ToggleButton value="MODAL_USAHA">Modal Usaha</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <AdminCard flush title={`${data.length} kampanye`}>
        {isLoading ? <Loading /> : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow><TableCell>#</TableCell><TableCell>Kampanye</TableCell><TableCell>Jenis</TableCell><TableCell>Status</TableCell><TableCell sx={{ minWidth: 180 }}>Progres</TableCell><TableCell>Kota</TableCell><TableCell align="right">Aksi</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {data.map((c: any) => {
                  const pct = Number(c.target) ? Math.min(100, (Number(c.collected) / Number(c.target)) * 100) : 0;
                  return (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.id}</TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography noWrap fontWeight={600}>{title(c)}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.owner ? `${c.owner.name} · ` : ''}{timeAgo(c.createdAt)}</Typography>
                      </TableCell>
                      <TableCell>{kindLabel(c.kind)}</TableCell>
                      <TableCell><Chip size="small" color={statusColor[c.status]} label={statusLabel[c.status]} /></TableCell>
                      <TableCell>
                        <LinearProgress variant="determinate" value={pct} sx={{ height: 8 }} />
                        <Typography variant="caption" color="text.secondary">{formatRupiah(Number(c.collected))} / {formatRupiah(Number(c.target))} ({Math.round(pct)}%)</Typography>
                      </TableCell>
                      <TableCell>{c.city || '-'}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        {c.status === 'PENDING_VERIFICATION' && <Button size="small" variant="contained" disabled={act.isPending} onClick={() => setCampaignStatus(c.id, 'ACTIVE')}>Setujui</Button>}
                        {c.status === 'ACTIVE' && <Button size="small" variant="outlined" disabled={act.isPending} onClick={() => setCampaignStatus(c.id, 'COMPLETED')}>Selesaikan</Button>}
                        {c.status === 'COMPLETED' && <Button size="small" disabled={act.isPending} onClick={() => setCampaignStatus(c.id, 'ACTIVE')}>Aktifkan</Button>}
                        {c.kind === 'MODAL_USAHA' && <Button size="small" href={`/modal-usaha/${c.id}`} target="_blank">Lihat</Button>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AdminCard>
      <Box />
    </Stack>
  );
}
