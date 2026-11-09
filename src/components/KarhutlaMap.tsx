import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from './ui/FlexStack';
import Typography from './ui/Txt';
import { provinces, mapViewBox } from '../data/regions';
import { burn2023, national2023 } from '../data/karhutla';
import { useHotspots, type HotspotRange } from '../lib/hotspots';

const byId = Object.fromEntries(burn2023.map((p) => [p.id, p]));
const maxHa = Math.max(...burn2023.map((p) => p.ha));
const fmt = (n: number) => Math.round(n).toLocaleString('id-ID');

// Calibrated against the map's own geometry (Aceh/Papua extremes, Bali, Rote): ~17.22 px per degree.
const PPD = 17.22;
const project = (lat: number, lon: number): [number, number] => [0.26 + (lon - 95.0) * PPD, 266.0 + (-8.06 - lat) * PPD];

const burnColor = (id: string) => {
  const p = byId[id];
  if (!p) return '#E5EAF2';
  const t = p.ha / maxHa;
  return `rgb(${Math.round(255 - 60 * t)},${Math.round(214 - 170 * t)},${Math.round(102 - 80 * t)})`;
};

type Mode = 'hotspot' | 'burn';

/** Interactive map. "Titik panas": live NASA FIRMS detections. "Luas 2023": burned area by province (SiPongi). */
export default function KarhutlaMap() {
  const [mode, setMode] = useState<Mode>('hotspot');
  const [range, setRange] = useState<HotspotRange>('24h');
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const { data, isLoading, isError, isFetching, refetch } = useHotspots(range);
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const [assigned, setAssigned] = useState<{ counts: Record<string, number>; high: string; norm: string; inside: number }>({ counts: {}, high: '', norm: '', inside: 0 });

  // Place each detection in a province using the browser's own geometry test, so dots only appear on Indonesian land.
  useEffect(() => {
    if (!data) return;
    const boxes = provinces.map((p) => ({ id: p.id, el: pathRefs.current[p.id], b: pathRefs.current[p.id]?.getBBox() })).filter((x) => x.el && x.b);
    const counts: Record<string, number> = {};
    let high = '';
    let norm = '';
    let inside = 0;
    for (const pt of data.points) {
      const [x, y] = project(pt[0], pt[1]);
      const hit = boxes.find(({ el, b }) => b && x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height && el!.isPointInFill(new DOMPoint(x, y)));
      if (!hit) continue;
      counts[hit.id] = (counts[hit.id] || 0) + 1;
      inside++;
      const d = `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
      if (pt[3] === 2) high += d;
      else norm += d;
    }
    setAssigned({ counts, high, norm, inside });
  }, [data]);

  const shown = pinned ?? active;
  const prov = provinces.find((p) => p.id === shown);
  const burn = shown ? byId[shown] : undefined;
  const updated = useMemo(() => (data ? new Date(data.fetchedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : ''), [data]);
  const top = useMemo(
    () => Object.entries(assigned.counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => ({ name: provinces.find((p) => p.id === id)?.name ?? id, n })),
    [assigned.counts],
  );

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
        <ToggleButtonGroup exclusive size="small" value={mode} onChange={(_, v) => v && setMode(v)} aria-label="Lapisan peta">
          <ToggleButton value="hotspot">Titik panas (langsung)</ToggleButton>
          <ToggleButton value="burn">Luas terbakar 2023</ToggleButton>
        </ToggleButtonGroup>
        {mode === 'hotspot' && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ToggleButtonGroup exclusive size="small" value={range} onChange={(_, v) => v && setRange(v)} aria-label="Rentang waktu">
              <ToggleButton value="24h">24 jam</ToggleButton>
              <ToggleButton value="48h">48 jam</ToggleButton>
            </ToggleButtonGroup>
            <Button size="small" startIcon={isFetching ? <CircularProgress size={14} /> : <RefreshIcon />} onClick={() => refetch()} disabled={isFetching}>Segarkan</Button>
          </Stack>
        )}
      </Stack>

      {mode === 'hotspot' && isError && <Alert severity="warning" sx={{ borderRadius: '12px' }}>Data titik panas belum bisa dimuat. Coba segarkan, atau buka SiPongi dan NASA FIRMS langsung.</Alert>}
      {mode === 'hotspot' && data?.stale && <Alert severity="info" sx={{ borderRadius: '12px' }}>Menampilkan data tersimpan terakhir karena sumber sedang tidak dapat dijangkau.</Alert>}

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'minmax(0,2fr) minmax(0,1fr)' }, alignItems: 'stretch' }}>
        <Box sx={{ minWidth: 0, position: 'relative' }}>
          <Box
            component="svg"
            viewBox={mapViewBox}
            role="group"
            aria-label="Peta karhutla Indonesia"
            sx={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0 8px 14px rgba(47,79,138,0.2))' }}
          >
            {provinces.map((p) => (
              <path
                key={p.id}
                ref={(el) => { pathRefs.current[p.id] = el; }}
                d={p.path}
                role="button"
                tabIndex={0}
                aria-pressed={pinned === p.id}
                aria-label={p.name}
                fill={mode === 'burn' ? burnColor(p.id) : shown === p.id ? '#C9D6F2' : '#E8EEF8'}
                stroke={shown === p.id ? '#0F172A' : '#fff'}
                strokeWidth={shown === p.id ? 1.6 : 0.8}
                style={{ cursor: 'pointer', transition: 'fill .15s ease', outline: 'none' }}
                onMouseEnter={() => setActive(p.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(p.id)}
                onBlur={() => setActive(null)}
                onClick={() => setPinned((cur) => (cur === p.id ? null : p.id))}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPinned((cur) => (cur === p.id ? null : p.id)); } }}
              />
            ))}
            {mode === 'hotspot' && (
              <g pointerEvents="none" strokeLinecap="round">
                <path d={assigned.norm} stroke="#FF7A33" strokeOpacity={0.75} strokeWidth={3.2} fill="none" />
                <path d={assigned.high} stroke="#C2200F" strokeOpacity={0.9} strokeWidth={3.6} fill="none" />
              </g>
            )}
          </Box>
          {mode === 'hotspot' && isLoading && (
            <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: '16px' }}>
              <CircularProgress />
              <Typography variant="caption">Memuat titik panas...</Typography>
            </Stack>
          )}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            {mode === 'hotspot' ? (
              <>
                <Chip size="small" label="Keyakinan tinggi" icon={<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#C2200F', ml: '8px !important' }} />} />
                <Chip size="small" label="Keyakinan nominal" icon={<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF7A33', ml: '8px !important' }} />} />
              </>
            ) : (
              <>
                <Typography variant="caption" color="text.secondary">Lebih sedikit</Typography>
                <Box sx={{ width: 160, height: 10, borderRadius: 999, background: 'linear-gradient(90deg, rgb(255,214,102), rgb(225,130,60), rgb(195,44,22))' }} />
                <Typography variant="caption" color="text.secondary">Lebih luas</Typography>
                <Chip size="small" label="Di luar 10 besar" sx={{ bgcolor: '#E5EAF2' }} />
              </>
            )}
          </Stack>
        </Box>

        <Box sx={{ p: 3, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.9)', border: '1px solid #E1E8F2', display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 240 }}>
          {mode === 'hotspot' ? (
            <>
              <Typography variant="overline" color="text.secondary">Titik panas {range === '24h' ? '24 jam' : '48 jam'} terakhir</Typography>
              <Typography variant="h3" color="error.main">{data ? fmt(assigned.inside) : '-'}</Typography>
              {prov ? (
                <>
                  <Typography variant="h6">{prov.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {fmt(assigned.counts[prov.id] || 0)} titik terdeteksi{burn ? `. Pada 2023 wilayah ini peringkat ${burn.rank} luas terbakar (${fmt(burn.ha)} ha).` : '.'}
                  </Typography>
                </>
              ) : top.length ? (
                <>
                  <Typography variant="subtitle2">Terbanyak</Typography>
                  {top.map((t) => (
                    <Stack key={t.name} direction="row" justifyContent="space-between">
                      <Typography variant="body2">{t.name}</Typography>
                      <Typography variant="body2" fontWeight={700}>{fmt(t.n)}</Typography>
                    </Stack>
                  ))}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">Arahkan atau ketuk provinsi untuk jumlah titik panasnya.</Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
                Titik panas bukan selalu kebakaran: ia menandai anomali panas dari satelit. {data ? `Diperbarui ${updated}. ` : ''}Sumber: {data?.source ?? 'NASA FIRMS'}.
              </Typography>
            </>
          ) : prov ? (
            <>
              <Typography variant="h5">{prov.name}</Typography>
              {burn ? (
                <>
                  <Chip size="small" color="warning" label={`Peringkat ${burn.rank} dari 10`} sx={{ alignSelf: 'flex-start' }} />
                  <Typography variant="h4" color="primary.dark">{fmt(burn.ha)} ha</Typography>
                  <Typography variant="body2" color="text.secondary">
                    terbakar sepanjang 2023, sekitar {((burn.ha / national2023) * 100).toFixed(1).replace('.', ',')}% dari total nasional.
                  </Typography>
                  {burn.note && <Typography variant="caption" color="text.secondary">{burn.note}</Typography>}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">Tidak termasuk 10 provinsi dengan karhutla terluas pada 2023 menurut SiPongi.</Typography>
              )}
            </>
          ) : (
            <>
              <Typography variant="h6">Pilih provinsi</Typography>
              <Typography variant="body2" color="text.secondary">Arahkan atau ketuk provinsi untuk luas lahan yang terbakar pada 2023.</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>Total nasional 2023: {fmt(national2023)} ha (SiPongi, KLHK).</Typography>
            </>
          )}
        </Box>
      </Box>
    </Stack>
  );
}
