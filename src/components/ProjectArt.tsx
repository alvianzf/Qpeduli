import Box from '@mui/material/Box';
import { Sprout, Tree, Flower, Leaf } from './art/Nature';

const palettes = [
  ['#DDF1E3', '#BFE3C7'],
  ['#FBF0C8', '#F6DE95'],
  ['#D8EEF0', '#B5DDE3'],
  ['#F9E3D2', '#F2C7A5'],
];

/** Illustrated cover for a project (we have no photos yet): a soft scene picked by id. */
export default function ProjectArt({ seed, height = 140 }: { seed: string; height?: number }) {
  const n = Number(seed) || 0;
  const [a, b] = palettes[n % palettes.length];
  const Hero = [Sprout, Tree, Flower][n % 3];
  return (
    <Box
      aria-hidden
      sx={{
        height,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${a}, ${b})`,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <Leaf size={60} color="rgba(255,255,255,.55)" className="leaf-sway" style={{ position: 'absolute', left: 18, top: 14 }} />
      <Leaf size={40} color="rgba(255,255,255,.45)" className="leaf-sway" style={{ position: 'absolute', right: 26, top: 22, animationDelay: '-2s' }} />
      <Box className="float-slow" sx={{ mb: 1 }}>
        <Hero size={height * 0.7} />
      </Box>
    </Box>
  );
}
