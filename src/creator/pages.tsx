import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import SavingsIcon from '@mui/icons-material/Savings';
import CampaignIcon from '@mui/icons-material/Campaign';
import PendingIcon from '@mui/icons-material/HourglassTop';
import DescriptionIcon from '@mui/icons-material/Description';
import ForumIcon from '@mui/icons-material/Forum';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import CardGrid from '../components/ui/CardGrid';
import EmptyState from '../components/EmptyState';
import CampaignComments from '../components/CampaignComments';
import AdminCard from '../admin/AdminCard';
import { SmallBox, InfoBox } from '../admin/Boxes';
import { creatorPalette as pal } from '../admin/adminTheme';
import api, { apiErrorMessage } from '../lib/api';
import { formatRupiah, timeAgo } from '../data/mockData';
import { useCreateThreadDialog } from '../context/CreateThreadContext';
import { useFeedback } from '../feedback/FeedbackProvider';

export interface MyCampaign {
  id: number;
  kind: 'AKSI_SOSIAL' | 'MODAL_USAHA';
  threadId: number | null;
  title: string;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'COMPLETED';
  city: string | null;
  target: number;
  collected: number;
  disbursed: number;
  available: number;
  donorCount: number;
  deadline: string;
  pendingDonations: number;
  confirmedDonations: number;
  comments: number;
  reports: number;
  milestones: { id: number; label: string; amount: number; released: boolean; releasedAt: string | null }[];
}

const kindLabel = (k: string) => (k === 'MODAL_USAHA' ? 'Modal Usaha' : 'Aksi Sosial');
const statusLabel = { PENDING_VERIFICATION: 'Menunggu verifikasi', ACTIVE: 'Aktif', COMPLETED: 'Selesai' } as const;
const statusColor = { PENDING_VERIFICATION: 'warning', ACTIVE: 'success', COMPLETED: 'default' } as const;
const fmt = (n: number) => Math.round(n).toLocaleString('id-ID');

function Loading() {
  return <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>;
}

function useMyCampaigns() {
  return useQuery<MyCampaign[]>({ queryKey: ['creator', 'campaigns'], queryFn: async () => (await api.get('/creator/campaigns')).data });
}

/** Shared "which campaign" picker; remembers the choice in the URL (?c=id). */
function useSelected(list: MyCampaign[] | undefined) {
  const [params, setParams] = useSearchParams();
  const fromUrl = Number(params.get('c'));
  const selected = useMemo(() => list?.find((c) => c.id === fromUrl) ?? list?.[0], [list, fromUrl]);
  const select = (id: number) => setParams({ c: String(id) }, { replace: true });
  return { selected, select };
}

function CampaignPicker({ list, value, onChange }: { list: MyCampaign[]; value?: number; onChange: (id: number) => void }) {
  if (list.length <= 1) return null;
  return (
    <Select size="small" value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} sx={{ minWidth: 260, bgcolor: '#fff' }}>
      {list.map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
    </Select>
  );
}

function NoCampaigns() {
  const { openCreateThread } = useCreateThreadDialog();
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={<CampaignIcon />}
      title="Belum ada kampanye"
      description="Mulai galang dana. Setelah kampanye dibuat, danamu, laporan, donatur dan komentar muncul di sini."
      action={
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateThread}>Buat aksi sosial</Button>
          <Button variant="outlined" onClick={() => navigate('/modal-usaha')}>Ajukan modal usaha</Button>
        </Stack>
      }
    />
  );
}

/* ---------------------------------------------------------------- Dashboard */
export function CreatorDashboard() {
  const { data, isLoading } = useMyCampaigns();
  const navigate = useNavigate();
  if (isLoading) return <Loading />;
  if (!data?.length) return <NoCampaigns />;
  const sum = (f: (c: MyCampaign) => number) => data.reduce((s, c) => s + f(c), 0);
  return (
    <Stack spacing={3}>
      <CardGrid cols={{ xs: 1, sm: 2, md: 4 }}>
        <SmallBox color={pal.blue} icon={<PaymentsIcon />} value={formatRupiah(sum((c) => c.collected))} label="Dana terkumpul" to="/penggalang/dana" />
        <SmallBox color={pal.cyan} icon={<AccountBalanceWalletIcon />} value={formatRupiah(sum((c) => c.disbursed))} label="Sudah dicairkan" to="/penggalang/dana" />
        <SmallBox color={pal.green} icon={<SavingsIcon />} value={formatRupiah(sum((c) => c.available))} label="Menunggu pencairan" to="/penggalang/dana" />
        <SmallBox color={pal.orange} icon={<PeopleIcon />} value={fmt(sum((c) => c.donorCount))} label="Donatur" to="/penggalang/donatur" />
      </CardGrid>
      <CardGrid cols={{ xs: 1, sm: 2, md: 4 }}>
        <InfoBox color={pal.blue} icon={<CampaignIcon />} label="Kampanye aktif" value={fmt(data.filter((c) => c.status === 'ACTIVE').length)} />
        <InfoBox color={pal.cyan} icon={<PendingIcon />} label="Donasi menunggu konfirmasi" value={fmt(sum((c) => c.pendingDonations))} />
        <InfoBox color={pal.green} icon={<DescriptionIcon />} label="Laporan terkirim" value={fmt(sum((c) => c.reports))} />
        <InfoBox color={pal.orange} icon={<ForumIcon />} label="Komentar donatur" value={fmt(sum((c) => c.comments))} />
      </CardGrid>

      <AdminCard accent={pal.blue} title="Kampanye saya" tools={<Button size="small" variant="contained" sx={{ bgcolor: pal.blue, '&:hover': { bgcolor: pal.green } }} startIcon={<DescriptionIcon />} onClick={() => navigate('/penggalang/laporan/baru')}>Buat laporan</Button>} flush>
        <TableContainer>
          <Table size="small">
            <TableHead><TableRow><TableCell>Kampanye</TableCell><TableCell>Status</TableCell><TableCell sx={{ minWidth: 200 }}>Progres</TableCell><TableCell align="right">Aksi</TableCell></TableRow></TableHead>
            <TableBody>
              {data.map((c) => {
                const pct = c.target ? Math.min(100, (c.collected / c.target) * 100) : 0;
                return (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography noWrap fontWeight={600}>{c.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{kindLabel(c.kind)}{c.city ? ` · ${c.city}` : ''}</Typography>
                    </TableCell>
                    <TableCell><Chip size="small" color={statusColor[c.status]} label={statusLabel[c.status]} /></TableCell>
                    <TableCell>
                      <LinearProgress variant="determinate" value={pct} sx={{ height: 8, '& .MuiLinearProgress-bar': { bgcolor: pal.blue } }} />
                      <Typography variant="caption" color="text.secondary">{formatRupiah(c.collected)} / {formatRupiah(c.target)} ({Math.round(pct)}%)</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button size="small" onClick={() => navigate(`/penggalang/laporan/baru?c=${c.id}`)}>Lapor</Button>
                      <Button size="small" onClick={() => navigate(`/penggalang/dana?c=${c.id}`)}>Dana</Button>
                      <Button size="small" onClick={() => navigate(c.kind === 'MODAL_USAHA' ? `/modal-usaha/${c.id}` : `/thread/${c.threadId}`)}>Lihat</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </AdminCard>
    </Stack>
  );
}

/* --------------------------------------------------------------------- Dana */
export function CreatorFunds() {
  const { data, isLoading } = useMyCampaigns();
  const { selected: c, select } = useSelected(data);
  const { data: donations = [] } = useQuery<any[]>({ queryKey: ['creator', 'donations', c?.id], queryFn: async () => (await api.get(`/creator/campaigns/${c!.id}/donations`)).data, enabled: !!c });
  if (isLoading) return <Loading />;
  if (!data?.length || !c) return <NoCampaigns />;
  const pct = c.target ? Math.min(100, (c.collected / c.target) * 100) : 0;
  return (
    <Stack spacing={3}>
      <CampaignPicker list={data} value={c.id} onChange={select} />
      <CardGrid cols={{ xs: 1, sm: 2, md: 4 }}>
        <SmallBox color={pal.blue} icon={<PaymentsIcon />} value={formatRupiah(c.collected)} label={`Terkumpul dari ${formatRupiah(c.target)}`} />
        <SmallBox color={pal.cyan} icon={<AccountBalanceWalletIcon />} value={formatRupiah(c.disbursed)} label="Sudah dicairkan" />
        <SmallBox color={pal.green} icon={<SavingsIcon />} value={formatRupiah(c.available)} label="Menunggu pencairan" />
        <SmallBox color={pal.orange} icon={<PendingIcon />} value={fmt(c.pendingDonations)} label="Donasi menunggu konfirmasi" />
      </CardGrid>

      <AdminCard accent={pal.blue} title="Progres dana">
        <LinearProgress variant="determinate" value={pct} sx={{ height: 14, '& .MuiLinearProgress-bar': { bgcolor: pal.blue } }} />
        <Typography variant="body2" color="text.secondary">{Math.round(pct)}% dari target. Tenggat {new Date(c.deadline).toLocaleDateString('id-ID', { dateStyle: 'long' })}.</Typography>
      </AdminCard>

      <CardGrid cols={{ xs: 1, md: 2 }}>
        <AdminCard accent={pal.cyan} title="Tahap pencairan" hint="Admin mencairkan dana per tahap setelah dana terkumpul cukup" flush>
          {c.milestones.length === 0 ? <Typography color="text.secondary" sx={{ p: 2 }}>Kampanye ini tidak memakai tahap.</Typography> : (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell>Tahap</TableCell><TableCell align="right">Nominal</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                <TableBody>
                  {c.milestones.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.label}</TableCell>
                      <TableCell align="right">{formatRupiah(m.amount)}</TableCell>
                      <TableCell>{m.released ? <Chip size="small" color="success" label={`Cair ${m.releasedAt ? new Date(m.releasedAt).toLocaleDateString('id-ID') : ''}`} /> : <Chip size="small" label={c.available >= m.amount ? 'Siap dicairkan' : 'Belum cukup dana'} color={c.available >= m.amount ? 'warning' : 'default'} />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AdminCard>

        <AdminCard accent={pal.green} title={`Donasi terkonfirmasi (${donations.length})`} flush>
          {donations.length === 0 ? <Typography color="text.secondary" sx={{ p: 2 }}>Belum ada donasi terkonfirmasi.</Typography> : (
            <TableContainer sx={{ maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead><TableRow><TableCell>Donatur</TableCell><TableCell align="right">Nominal</TableCell><TableCell>Waktu</TableCell></TableRow></TableHead>
                <TableBody>
                  {donations.map((d) => (
                    <TableRow key={d.id}><TableCell>{d.donor}</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>{formatRupiah(d.amount)}</TableCell><TableCell>{timeAgo(d.at)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AdminCard>
      </CardGrid>
    </Stack>
  );
}

/* ------------------------------------------------------------------ Donatur */
export function CreatorDonors() {
  const { data, isLoading } = useMyCampaigns();
  const { selected: c, select } = useSelected(data);
  const { data: donations = [] } = useQuery<any[]>({ queryKey: ['creator', 'donations', c?.id], queryFn: async () => (await api.get(`/creator/campaigns/${c!.id}/donations`)).data, enabled: !!c });
  if (isLoading) return <Loading />;
  if (!data?.length || !c) return <NoCampaigns />;
  const total = donations.reduce((s, d) => s + d.amount, 0);
  return (
    <Stack spacing={3}>
      <CampaignPicker list={data} value={c.id} onChange={select} />
      <Alert severity="info">Donatur yang memilih anonim tetap tampil sebagai "Donatur anonim", juga bagimu.</Alert>
      <AdminCard accent={pal.blue} title={`${donations.length} donasi · ${formatRupiah(total)}`} flush>
        <TableContainer>
          <Table size="small">
            <TableHead><TableRow><TableCell>Donatur</TableCell><TableCell align="right">Nominal</TableCell><TableCell>Hadiah</TableCell><TableCell>Waktu</TableCell></TableRow></TableHead>
            <TableBody>
              {donations.map((d) => (
                <TableRow key={d.id} hover><TableCell>{d.donor}</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>{formatRupiah(d.amount)}</TableCell><TableCell>{d.reward ?? '-'}</TableCell><TableCell>{timeAgo(d.at)}</TableCell></TableRow>
              ))}
              {!donations.length && <TableRow><TableCell colSpan={4}><Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>Belum ada donasi terkonfirmasi.</Typography></TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      </AdminCard>
    </Stack>
  );
}

/* ----------------------------------------------------------------- Komentar */
export function CreatorComments() {
  const { data, isLoading } = useMyCampaigns();
  const { selected: c, select } = useSelected(data);
  if (isLoading) return <Loading />;
  if (!data?.length || !c) return <NoCampaigns />;
  return (
    <Stack spacing={3}>
      <CampaignPicker list={data} value={c.id} onChange={select} />
      <AdminCard accent={pal.blue} title={`Diskusi: ${c.title}`} hint="Donatur terkonfirmasi dan kamu bisa berkomentar. Donatur boleh anonim.">
        <CampaignComments key={c.id} campaignId={c.id} />
      </AdminCard>
    </Stack>
  );
}

/* ------------------------------------------------------------ Laporan (list) */
export function CreatorReports() {
  const { data, isLoading } = useMyCampaigns();
  const { selected: c, select } = useSelected(data);
  const navigate = useNavigate();
  const { data: reports = [] } = useQuery<any[]>({ queryKey: ['creator', 'reports', c?.id], queryFn: async () => (await api.get(`/creator/campaigns/${c!.id}/reports`)).data, enabled: !!c });
  if (isLoading) return <Loading />;
  if (!data?.length || !c) return <NoCampaigns />;
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
        <CampaignPicker list={data} value={c.id} onChange={select} />
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: pal.blue, '&:hover': { bgcolor: pal.green } }} onClick={() => navigate(`/penggalang/laporan/baru?c=${c.id}`)}>Buat laporan</Button>
      </Stack>
      {reports.length === 0 ? (
        <EmptyState icon={<DescriptionIcon />} title="Belum ada laporan" description="Laporan rutin membuat donatur percaya. Ceritakan kegiatan dan penggunaan dana." />
      ) : (
        <Stack spacing={2}>
          {reports.map((r) => (
            <AdminCard key={r.id} accent={r.isReport ? pal.blue : undefined} title={r.title} hint={`${new Date(r.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}${r.isReport ? ' · Laporan' : ' · Update'}`}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{r.content}</Typography>
              {r.spent !== null && <Chip size="small" sx={{ alignSelf: 'flex-start' }} label={`Dana terpakai ${formatRupiah(r.spent)}`} />}
            </AdminCard>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

/* ----------------------------------------------------------- Laporan wizard */
const steps = ['Kampanye', 'Kegiatan', 'Dana', 'Tinjau'];

export function ReportWizard() {
  const { data, isLoading } = useMyCampaigns();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast, confirm } = useFeedback();
  const [step, setStep] = useState(0);
  const [campaignId, setCampaignId] = useState<number | ''>('');
  const [milestoneId, setMilestoneId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [spent, setSpent] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (campaignId === '' && data?.length) setCampaignId(Number(params.get('c')) || data[0].id);
  }, [data, params, campaignId]);

  const campaign = data?.find((c) => c.id === campaignId);
  const send = useMutation({
    mutationFn: async () => (await api.post(`/creator/campaigns/${campaignId}/reports`, { title, content, spent: spent ? Number(spent) : null, milestoneId: milestoneId || null, nextSteps })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['creator'] }); toast.success('Laporan terkirim ke donatur.'); navigate(`/penggalang/laporan?c=${campaignId}`); },
    onError: (e) => setError(apiErrorMessage(e, 'Laporan gagal dikirim.')),
  });

  if (isLoading) return <Loading />;
  if (!data?.length || !campaign) return <NoCampaigns />;

  const spentNum = spent ? Number(spent) : 0;
  const valid = [
    true,
    title.trim().length >= 5 && content.trim().length >= 10,
    !spent || (spentNum >= 0 && spentNum <= campaign.collected),
    true,
  ];
  const next = () => { setError(''); setStep((s) => s + 1); };
  const submit = async () => {
    if (!(await confirm({ title: 'Kirim laporan?', text: 'Laporan akan tampil di halaman kampanye dan tidak bisa diubah.', icon: 'question', confirmText: 'Ya, kirim' }))) return;
    send.mutate();
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 820 }}>
      <Stepper activeStep={step} alternativeLabel sx={{ bgcolor: '#fff', p: 2, borderRadius: '4px', boxShadow: '0 0 1px rgba(0,0,0,.13), 0 1px 3px rgba(0,0,0,.2)', '& .Mui-active .MuiStepIcon-root, & .Mui-completed .MuiStepIcon-root': { color: pal.blue } }}>
        {steps.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
      </Stepper>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <AdminCard accent={pal.blue} title={`Langkah ${step + 1} dari ${steps.length}: ${steps[step]}`}>
        {step === 0 && (
          <Stack spacing={2.5}>
            <Select value={campaignId} onChange={(e) => { setCampaignId(Number(e.target.value)); setMilestoneId(''); }} fullWidth>
              {data.map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
            </Select>
            {campaign.milestones.length > 0 && (
              <Select<number | ''> displayEmpty value={milestoneId} onChange={(e) => setMilestoneId(e.target.value === '' ? '' : Number(e.target.value))} fullWidth>
                <MenuItem value="">Laporan umum (tidak terkait tahap)</MenuItem>
                {campaign.milestones.map((m) => <MenuItem key={m.id} value={m.id}>Tahap: {m.label}</MenuItem>)}
              </Select>
            )}
            <Typography variant="body2" color="text.secondary">Terkumpul {formatRupiah(campaign.collected)}, dicairkan {formatRupiah(campaign.disbursed)}.</Typography>
          </Stack>
        )}
        {step === 1 && (
          <Stack spacing={2.5}>
            <TextField label="Judul laporan" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth required helperText="Contoh: Laporan bulan Oktober, tahap 1 selesai" slotProps={{ htmlInput: { maxLength: 120 } }} />
            <TextField label="Apa yang sudah dikerjakan?" value={content} onChange={(e) => setContent(e.target.value)} multiline minRows={5} fullWidth required helperText={`${content.length}/2000. Ceritakan kegiatan, hasil, dan siapa yang terbantu.`} slotProps={{ htmlInput: { maxLength: 2000 } }} />
          </Stack>
        )}
        {step === 2 && (
          <Stack spacing={2.5}>
            <TextField label="Dana terpakai (Rp)" type="number" value={spent} onChange={(e) => setSpent(e.target.value)} fullWidth error={!valid[2]} helperText={!valid[2] ? `Tidak boleh melebihi dana terkumpul (${formatRupiah(campaign.collected)}).` : 'Opsional. Isi jika laporan ini mencakup penggunaan dana.'} />
            <TextField label="Langkah berikutnya" value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} multiline minRows={3} fullWidth helperText="Opsional. Rencana untuk periode berikutnya." slotProps={{ htmlInput: { maxLength: 1000 } }} />
          </Stack>
        )}
        {step === 3 && (
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">Periksa kembali sebelum dikirim.</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1, '& > :nth-of-type(odd)': { color: 'text.secondary' } }}>
              <Typography variant="body2">Kampanye</Typography><Typography variant="body2" fontWeight={600}>{campaign.title}</Typography>
              <Typography variant="body2">Tahap</Typography><Typography variant="body2">{campaign.milestones.find((m) => m.id === milestoneId)?.label ?? 'Umum'}</Typography>
              <Typography variant="body2">Judul</Typography><Typography variant="body2" fontWeight={600}>{title}</Typography>
              <Typography variant="body2">Kegiatan</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{content}</Typography>
              <Typography variant="body2">Dana terpakai</Typography><Typography variant="body2">{spent ? formatRupiah(spentNum) : '-'}</Typography>
              <Typography variant="body2">Langkah berikutnya</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{nextSteps || '-'}</Typography>
            </Box>
          </Stack>
        )}
      </AdminCard>

      <Stack direction="row" justifyContent="space-between">
        <Button disabled={step === 0 || send.isPending} onClick={() => setStep((s) => s - 1)}>Kembali</Button>
        {step < steps.length - 1 ? (
          <Button variant="contained" sx={{ bgcolor: pal.blue, '&:hover': { bgcolor: pal.green } }} disabled={!valid[step]} onClick={next}>Lanjut</Button>
        ) : (
          <Button variant="contained" color="warning" disabled={send.isPending} onClick={submit}>Kirim laporan</Button>
        )}
      </Stack>
    </Stack>
  );
}
