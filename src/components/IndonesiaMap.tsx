import { useState } from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Typography from './ui/Txt';
import { provinces, mapViewBox } from '../data/regions';
import { brand } from '../theme/theme';

/** Clickable map of Indonesia. Provinces with campaigns are tinted by how many; click opens that region. */
export default function IndonesiaMap({ counts }: { counts: Record<string, number> }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...Object.values(counts));
  const hovered = provinces.find((p) => p.id === hover);

  const fill = (id: string) => {
    const n = counts[id] || 0;
    if (!n) return '#DBEAFE';
    const t = 0.35 + 0.65 * (n / max);
    return `rgba(66,103,178,${t})`;
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        component="svg"
        viewBox={mapViewBox}
        role="group"
        aria-label="Peta Indonesia"
        sx={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0 10px 18px rgba(47,79,138,0.25))' }}
      >
        {provinces.map((p) => (
          <path
            key={p.id}
            d={p.path}
            role="link"
            tabIndex={0}
            aria-label={`${p.name}: ${counts[p.id] || 0} kampanye`}
            fill={hover === p.id ? brand.cta : fill(p.id)}
            stroke="#fff"
            strokeWidth={0.8}
            style={{ cursor: 'pointer', transition: 'fill .15s ease', outline: 'none' }}
            onMouseEnter={() => setHover(p.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(p.id)}
            onBlur={() => setHover(null)}
            onClick={() => navigate(`/wilayah/${p.id}`)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/wilayah/${p.id}`); } }}
          />
        ))}
      </Box>
      <Box
        sx={{
          position: 'absolute', left: 8, bottom: 8, px: 2, py: 1, borderRadius: '12px',
          bgcolor: 'rgba(255,255,255,0.92)', border: '1px solid #fff', minWidth: 150, pointerEvents: 'none',
        }}
      >
        <Typography variant="subtitle2">{hovered ? hovered.name : 'Pilih wilayah'}</Typography>
        <Typography variant="caption" color="text.secondary">
          {hovered ? `${counts[hovered.id] || 0} kampanye` : 'Klik provinsi di peta'}
        </Typography>
      </Box>
    </Box>
  );
}
