import Box from '@mui/material/Box';
import { Leaf, HillsDivider } from './art/Nature';

/** Place as first child of a band that spreads `heroBase`; paints behind the band's content. */
export default function HeroDecor({ divider = true }: { divider?: boolean }) {
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
      <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 85% 15%, rgba(246,196,83,.35), transparent 38%), radial-gradient(circle at 10% 90%, rgba(143,208,168,.25), transparent 45%)' }} />
      <Leaf size={170} color="rgba(255,255,255,.10)" className="leaf-sway" style={{ position: 'absolute', right: '6%', top: 30 }} />
      <Leaf size={110} color="rgba(255,255,255,.08)" className="leaf-sway" style={{ position: 'absolute', right: '22%', bottom: 40, animationDelay: '-3s' }} />
      <Leaf size={130} color="rgba(255,255,255,.07)" className="leaf-sway" style={{ position: 'absolute', left: '-2%', top: '28%', animationDelay: '-5s' }} />
      {divider && (
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
          <HillsDivider fill="#EDF6EF" height={56} />
        </Box>
      )}
    </Box>
  );
}
