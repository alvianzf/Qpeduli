import { useState } from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Typography from './ui/Txt';
import { areas, areaNeighbours, areaShapes, areaViewBox, projectArea } from '../data/areas';
import { brand } from '../theme/theme';

/** Clickable map of the four campaign provinces, with a marker sized by how many campaigns run in each. */
export default function AreaMap({ counts }: { counts: Record<string, number> }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...Object.values(counts));
  const hovered = areas.find((a) => a.id === hover);
  const open = (id: string) => navigate(`/wilayah/${id}`);

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        component="svg"
        viewBox={areaViewBox}
        role="group"
        aria-label="Peta wilayah kampanye"
        sx={{ width: '100%', maxHeight: 560, height: 'auto', display: 'block', borderRadius: '16px', bgcolor: '#E6F0FF', filter: 'drop-shadow(0 10px 18px rgba(47,79,138,0.18))' }}
      >
        {areaNeighbours.map((p) => <path key={p.id} d={p.path} fill="#F1F5F9" stroke="#CBD5E1" strokeWidth={0.5} />)}
        {areaShapes.map((p) => <path key={p.id} d={p.path} fill={hover === p.id ? '#9DB8EA' : '#BFD2F3'} stroke="#fff" strokeWidth={0.8} style={{ cursor: 'pointer' }} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} onClick={() => open(p.id)} />)}

        {areas.map((a) => {
          const [x, y] = projectArea(a.lat, a.lon);
          const n = counts[a.id] || 0;
          const r = 4.4 + 5.6 * (n / max);
          const active = hover === a.id;
          return (
            <g
              key={a.id}
              role="link"
              tabIndex={0}
              aria-label={`${a.name}: ${n} kampanye`}
              style={{ cursor: 'pointer', outline: 'none' }}
              onMouseEnter={() => setHover(a.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(a.id)}
              onBlur={() => setHover(null)}
              onClick={() => open(a.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(a.id); } }}
            >
              <circle cx={x} cy={y} r={r + 3} fill={active ? brand.cta : brand.primary} opacity={0.18} />
              <circle cx={x} cy={y} r={r} fill={active ? brand.cta : n ? brand.primary : '#7C93C4'} stroke="#fff" strokeWidth={1.2} />
              {n > 0 && <text x={x} y={y + 1.6} textAnchor="middle" fontSize={5.6} fontWeight={800} fill="#fff" pointerEvents="none">{n}</text>}
              <text x={x} y={y - r - 3.4} textAnchor="middle" fontSize={6} fontWeight={700} fill="#0F172A" stroke="#fff" strokeWidth={1.8} paintOrder="stroke" pointerEvents="none">{a.short}</text>
            </g>
          );
        })}
      </Box>

      <Box sx={{ position: 'absolute', left: 8, bottom: 8, px: 2, py: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.92)', border: '1px solid #fff', minWidth: 170, pointerEvents: 'none' }}>
        <Typography variant="subtitle2">{hovered ? hovered.name : 'Kepri, Riau, Sumbar, Jambi'}</Typography>
        <Typography variant="caption" color="text.secondary">
          {hovered ? `${counts[hovered.id] || 0} kampanye` : 'Klik provinsi untuk melihat kampanye'}
        </Typography>
      </Box>
    </Box>
  );
}
