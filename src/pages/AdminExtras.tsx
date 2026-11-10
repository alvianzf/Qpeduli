import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadIcon from '@mui/icons-material/Download';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import CardGrid from '../components/ui/CardGrid';
import GlossCard from '../components/ui/GlossCard';
import api, { apiErrorMessage } from '../lib/api';
import { formatRupiah } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const fmt = (n: number) => Math.round(n).toLocaleString('id-ID');
const shortDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
const compact = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(1)} M` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} jt` : n >= 1e3 ? `${(n / 1e3).toFixed(0)} rb` : String(Math.round(n)));

function Loading() {
  return <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>;
}

interface Point { d: string; v: number }

/** Dependency-free area chart with hover read-out. */
function AreaChart({ points, color, money }: { points: Point[]; color: string; money?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 180;
  const pad = { l: 44, r: 8, t: 10, b: 22 };
  const max = Math.max(1, ...points.map((p) => p.v));
  const x = (i: number) => pad.l + (i / Math.max(1, points.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1)} ${H - pad.b} L${x(0)} ${H - pad.b} Z`;
  const ticks = [0, 0.5, 1];
  const id = `g${color.replace('#', '')}`;
  const h = hover !== null ? points[hover] : null;
  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        component="svg"
        viewBox={`0 0 ${W} ${H}`}
        sx={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label="Grafik tren"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          setHover(Math.max(0, Math.min(points.length - 1, Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (points.length - 1)))));
        }}
      >
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(max * t)} y2={y(max * t)} stroke="#E1E8F2" />
            <text x={pad.l - 6} y={y(max * t) + 4} textAnchor="end" fontSize="10" fill="#64748B">{money ? compact(max * t) : fmt(max * t)}</text>
          </g>
        ))}
        <path d={area} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
        {[0, Math.floor((points.length - 1) / 2), points.length - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} fontSize="10" fill="#64748B">{points[i] ? shortDate(points[i].d) : ''}</text>
        ))}
        {h && hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke={color} strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(h.v)} r="4.5" fill="#fff" stroke={color} strokeWidth="2.5" />
          </g>
        )}
      </Box>
      {h && (
        <Box sx={{ position: 'absolute', top: 0, right: 8, px: 1.25, py: 0.5, borderRadius: '12px', bgcolor: 'rgba(15,23,42,0.9)', color: '#fff', fontSize: 12, pointerEvents: 'none' }}>
          {shortDate(h.d)}: <b>{money ? formatRupiah(h.v) : fmt(h.v)}</b>
        </Box>
      )}
    </Box>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <GlossCard sx={{ gap: 2 }}>
      <Box>
        <Typography variant="h6" sx={{ fontSize: '1.05rem' }}>{title}</Typography>
        {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
      </Box>
      {children}
    </GlossCard>
  );
}

function Bars({ rows }: { rows: { label: string; value: number; note?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <Typography variant="body2" color="text.secondary">Belum ada data.</Typography>;
  return (
    <Stack spacing={1.5}>
      {rows.map((r) => (
        <Box key={r.label}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>{r.label}</Typography>
            <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0 }}>{r.note ?? fmt(r.value)}</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={(r.value / max) * 100} sx={{ height: 8, borderRadius: 999, mt: 0.5 }} />
        </Box>
      ))}
    </Stack>
  );
}

const statusLabel: Record<string, string> = { PENDING_VERIFICATION: 'Menunggu verifikasi', ACTIVE: 'Aktif', COMPLETED: 'Selesai', PENDING: 'Menunggu', CONFIRMED: 'Terkonfirmasi', FAILED: 'Ditolak' };

export function Analytics() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'analytics', days], queryFn: async () => (await api.get('/admin/analytics', { params: { days } })).data });
  if (isLoading || !data) return <Loading />;
  const sum = (a: { n: number }[]) => a.reduce((s, x) => s + x.n, 0);
  const totalRaised = data.donations.reduce((s: number, x: any) => s + x.total, 0);
  const kinds = data.byKind as { kind: string; n: number; collected: number; target: number }[];
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap spacing={2}>
        <Typography variant="h6">Analitik {days} hari terakhir</Typography>
        <ToggleButtonGroup exclusive size="small" value={days} onChange={(_, v) => v && setDays(v)} aria-label="Rentang">
          <ToggleButton value={7}>7 hari</ToggleButton>
          <ToggleButton value={30}>30 hari</ToggleButton>
          <ToggleButton value={90}>90 hari</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <CardGrid cols={{ xs: 2, md: 4 }}>
        {[
          { label: 'Dana masuk (periode)', value: formatRupiah(totalRaised) },
          { label: 'Donasi terkonfirmasi', value: fmt(sum(data.donations)) },
          { label: 'Pengguna baru', value: fmt(sum(data.signups)) },
          { label: 'Tingkat konfirmasi', value: data.confirmRate === null ? '-' : `${Math.round(data.confirmRate * 100)}%` },
        ].map((c) => (
          <GlossCard key={c.label} sx={{ gap: 0.5 }}>
            <Typography variant="h5" color="primary.dark">{c.value}</Typography>
            <Typography variant="body2" color="text.secondary">{c.label}</Typography>
          </GlossCard>
        ))}
      </CardGrid>

      <CardGrid cols={{ xs: 1, md: 2 }}>
        <Panel title="Dana masuk per hari" hint="Donasi terkonfirmasi, dalam Rupiah">
          <AreaChart color="#4267B2" money points={data.donations.map((x: any) => ({ d: x.d, v: x.total }))} />
        </Panel>
        <Panel title="Jumlah donasi per hari" hint="Donasi terkonfirmasi">
          <AreaChart color="#FF5A00" points={data.donations.map((x: any) => ({ d: x.d, v: x.n }))} />
        </Panel>
        <Panel title="Pengguna baru per hari">
          <AreaChart color="#0AD1FF" points={data.signups.map((x: any) => ({ d: x.d, v: x.n }))} />
        </Panel>
        <Panel title="Kampanye baru per hari">
          <AreaChart color="#2F4F8A" points={data.campaigns.map((x: any) => ({ d: x.d, v: x.n }))} />
        </Panel>
      </CardGrid>

      <CardGrid cols={{ xs: 1, md: 3 }}>
        <Panel title="Kampanye teratas" hint="Berdasarkan dana terkumpul">
          <Bars rows={data.topCampaigns.map((c: any) => ({ label: c.title, value: c.collected, note: formatRupiah(c.collected) }))} />
        </Panel>
        <Panel title="Wilayah teratas" hint="Dana terkumpul per kota kampanye">
          <Bars rows={data.topCities.map((c: any) => ({ label: `${c.city} (${c.n})`, value: c.collected, note: formatRupiah(c.collected) }))} />
        </Panel>
        <Panel title="Aktivitas komunitas" hint="Thread per kategori">
          <Bars rows={data.categories.map((c: any) => ({ label: c.name, value: c.n }))} />
        </Panel>
      </CardGrid>

      <CardGrid cols={{ xs: 1, md: 3 }}>
        <Panel title="Jenis kampanye">
          <Stack spacing={1.5}>
            {kinds.map((k) => (
              <Box key={k.kind}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700}>{k.kind === 'MODAL_USAHA' ? 'Modal Usaha' : 'Aksi Sosial'} ({k.n})</Typography>
                  <Typography variant="body2">{formatRupiah(k.collected)} / {formatRupiah(k.target)}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={k.target ? Math.min(100, (k.collected / k.target) * 100) : 0} sx={{ height: 8, borderRadius: 999, mt: 0.5 }} />
              </Box>
            ))}
          </Stack>
        </Panel>
        <Panel title="Status kampanye">
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {data.byStatus.map((s: any) => <Chip key={s.status} label={`${statusLabel[s.status] || s.status}: ${s.n}`} />)}
          </Stack>
        </Panel>
        <Panel title="Status donasi">
          <Stack spacing={1}>
            {data.donationStatus.map((s: any) => (
              <Stack key={s.status} direction="row" justifyContent="space-between">
                <Typography variant="body2">{statusLabel[s.status] || s.status} ({s.n})</Typography>
                <Typography variant="body2" fontWeight={700}>{formatRupiah(s.total)}</Typography>
              </Stack>
            ))}
          </Stack>
        </Panel>
      </CardGrid>
    </Stack>
  );
}

const reports = [
  { type: 'donasi', title: 'Laporan donasi', desc: 'Semua donasi: referensi, status, nominal, kampanye dan donatur. Dasar rekonsiliasi dana.' },
  { type: 'kampanye', title: 'Laporan kampanye', desc: 'Target, terkumpul, dicairkan, donatur dan progres tahap per kampanye.' },
  { type: 'pengguna', title: 'Laporan pengguna', desc: 'Daftar pengguna dengan peran, verifikasi dan karma. Berisi data pribadi, simpan dengan aman.' },
];

export function Reports() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const download = async (type: string) => {
    setBusy(type);
    setError('');
    try {
      const res = await api.get(`/admin/reports/${type}`, { params: { from: from || undefined, to: to || undefined }, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(apiErrorMessage(e, 'Gagal mengunduh laporan.'));
    } finally {
      setBusy('');
    }
  };
  return (
    <Stack spacing={3}>
      <Alert severity="info">Laporan diunduh sebagai CSV (bisa dibuka di Excel atau Google Sheets). Setiap unduhan tercatat di log audit.</Alert>
      {error && <Alert severity="error">{error}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField label="Dari tanggal" type="date" value={from} onChange={(e) => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Sampai tanggal" type="date" value={to} onChange={(e) => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      </Stack>
      <CardGrid cols={{ xs: 1, md: 3 }}>
        {reports.map((r) => (
          <GlossCard key={r.type} sx={{ gap: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>{r.title}</Typography>
            <Typography variant="body2" color="text.secondary">{r.desc}</Typography>
            <Button sx={{ mt: 'auto', alignSelf: 'flex-start' }} variant="contained" startIcon={busy === r.type ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />} disabled={!!busy} onClick={() => download(r.type)}>Unduh CSV</Button>
          </GlossCard>
        ))}
      </CardGrid>
    </Stack>
  );
}

export function SettingsPanel() {
  const { user } = useAuth();
  const canEdit = user?.role === 'SUPERADMIN';
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin', 'settings'], queryFn: async () => (await api.get('/admin/settings')).data });
  const [form, setForm] = useState<any>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const save = useMutation({
    mutationFn: async (body: any) => (await api.put('/admin/settings', body)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin'] }); setMsg({ ok: true, text: 'Pengaturan tersimpan.' }); },
    onError: (e) => setMsg({ ok: false, text: apiErrorMessage(e, 'Gagal menyimpan.') }),
  });
  if (!data) return <Loading />;
  const v = form ?? data;
  const set = (k: string, val: unknown) => setForm({ ...v, [k]: val });
  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      {!canEdit && <Alert severity="info">Hanya superadmin yang bisa mengubah pengaturan platform.</Alert>}
      {msg && <Alert severity={msg.ok ? 'success' : 'error'}>{msg.text}</Alert>}
      <GlossCard sx={{ gap: 3 }}>
        <TextField
          label="Petunjuk pembayaran"
          helperText="Ditampilkan ke donatur setelah donasi dibuat: nama bank, nomor rekening, atas nama."
          multiline
          minRows={3}
          value={v.paymentInstructions}
          onChange={(e) => set('paymentInstructions', e.target.value)}
          disabled={!canEdit}
          fullWidth
        />
        <TextField
          label="Donasi minimal (Rp)"
          type="number"
          value={v.minDonation}
          onChange={(e) => set('minDonation', Number(e.target.value))}
          disabled={!canEdit}
        />
        <TextField
          label="Pengumuman platform"
          helperText="Catatan internal untuk tim, maksimal 280 karakter."
          value={v.announcement}
          onChange={(e) => set('announcement', e.target.value)}
          disabled={!canEdit}
          fullWidth
        />
        <FormControlLabel
          control={<Switch checked={v.registrationOpen} onChange={(e) => set('registrationOpen', e.target.checked)} disabled={!canEdit} />}
          label="Pendaftaran akun baru dibuka"
        />
        {canEdit && (
          <Button variant="contained" sx={{ alignSelf: 'flex-start' }} disabled={save.isPending || !form} onClick={() => { setMsg(null); save.mutate(form); }}>
            Simpan
          </Button>
        )}
      </GlossCard>
    </Stack>
  );
}

export function AuditLog() {
  const { data = [], isLoading } = useQuery<any[]>({ queryKey: ['admin', 'audit'], queryFn: async () => (await api.get('/admin/audit')).data });
  if (isLoading) return <Loading />;
  if (!data.length) return <Typography color="text.secondary">Belum ada aktivitas tercatat.</Typography>;
  return (
    <Stack spacing={1}>
      {data.map((a) => (
        <Card key={a.id} sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip size="small" color="primary" variant="outlined" label={a.action} />
                <Typography variant="body2" fontWeight={700}>{a.target}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">{a.actorName}{a.detail ? ` · ${a.detail}` : ''}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{new Date(a.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</Typography>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
