import Box from '@mui/material/Box';
import { Cloud } from './art/Nature';

const clouds = [
  { top: '12vh', width: 300, dur: 70, delay: -10, opacity: 0.95 },
  { top: '34vh', width: 220, dur: 95, delay: -55, opacity: 0.85 },
  { top: '58vh', width: 260, dur: 120, delay: -30, opacity: 0.8 },
  { top: '24vh', width: 170, dur: 140, delay: -100, opacity: 0.75 },
  { top: '70vh', width: 190, dur: 160, delay: -120, opacity: 0.7 },
];

/** Fixed, non-interactive scenery behind the whole app: morphing light, sun, drifting clouds, swaying hills. */
export default function NatureBackground() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #A9C5F0 0%, #CFE0F7 38%, #E8F0FB 70%, #F3F7FC 100%)',
      }}
    >
      <div className="nb-blob a" />
      <div className="nb-blob b" />
      <div className="nb-blob c" />

      <svg style={{ position: 'absolute', top: '46vh', right: '-120px' }} width="460" height="460" viewBox="0 0 420 420">
        <defs>
          <radialGradient id="nb-sunglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF3B8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFF3B8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="nb-sun-glow" cx="210" cy="210" r="200" fill="url(#nb-sunglow)" />
        <g className="nb-sun-rays" opacity=".4">
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d="M210 210 L198 20 L222 20Z" fill="#F6C453" opacity=".5" transform={`rotate(${i * 22.5} 210 210)`} />
          ))}
        </g>
        <circle cx="210" cy="210" r="46" fill="#F6C453" opacity=".85" />
      </svg>

      {clouds.map((c, i) => (
        <Box
          key={i}
          className="nb-cloud"
          sx={{ top: c.top, filter: 'drop-shadow(0 8px 12px rgba(47,79,138,0.22))', animation: `nb-drift ${c.dur}s linear ${c.delay}s infinite` }}
        >
          <Cloud width={c.width} opacity={c.opacity} />
        </Box>
      ))}

      <Box sx={{ position: 'absolute', left: '-3%', right: '-3%', bottom: 0, height: { xs: '26vh', md: '34vh' } }}>
        <svg width="100%" height="100%" viewBox="0 0 1440 300" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          <path className="nb-hill h3" d="M0 140C180 70 340 70 520 120C700 170 860 150 1040 100C1220 50 1340 70 1440 110V300H0Z" fill="#9DB6E3" opacity=".85" />
          <path className="nb-hill h2" d="M0 190C200 130 380 140 560 180C740 220 920 200 1100 160C1250 126 1360 140 1440 160V300H0Z" fill="#5A7EC4" opacity=".7" />
          <path className="nb-hill h1" d="M0 240C220 200 420 210 640 236C860 262 1060 240 1240 214C1330 202 1400 206 1440 214V300H0Z" fill="#4267B2" opacity=".6" />
        </svg>
      </Box>
    </Box>
  );
}
