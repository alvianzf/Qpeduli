import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';

// Each leaf rises from the bottom, sways side to side and turns slowly, then loops.
const drift = keyframes`
  0%   { transform: translate3d(0, 0, 0) rotate(var(--r0)); opacity: 0; }
  10%  { opacity: var(--o); }
  50%  { transform: translate3d(var(--sway), -55vh, 0) rotate(calc(var(--r0) + 90deg)); }
  90%  { opacity: var(--o); }
  100% { transform: translate3d(calc(var(--sway) * -0.6), -115vh, 0) rotate(calc(var(--r0) + 200deg)); opacity: 0; }
`;

const leaves = [
  { left: '6%', size: 26, dur: 17, delay: 0, sway: 26, r0: 10, o: 0.22, c: '#FFFFFF' },
  { left: '24%', size: 18, dur: 22, delay: 5, sway: -30, r0: 80, o: 0.16, c: '#CFE0FF' },
  { left: '42%', size: 32, dur: 19, delay: 9, sway: 22, r0: 150, o: 0.14, c: '#FFFFFF' },
  { left: '60%', size: 20, dur: 24, delay: 2, sway: -24, r0: 40, o: 0.2, c: '#9DB6E3' },
  { left: '78%', size: 28, dur: 18, delay: 12, sway: 30, r0: 200, o: 0.16, c: '#FFFFFF' },
  { left: '14%', size: 16, dur: 26, delay: 14, sway: 18, r0: 120, o: 0.18, c: '#CFE0FF' },
  { left: '52%', size: 22, dur: 21, delay: 16, sway: -28, r0: 300, o: 0.15, c: '#FFFFFF' },
  { left: '88%', size: 17, dur: 25, delay: 7, sway: -20, r0: 250, o: 0.2, c: '#9DB6E3' },
  { left: '34%', size: 14, dur: 28, delay: 20, sway: 24, r0: 60, o: 0.14, c: '#FFFFFF' },
];

/** Decorative drifting leaves behind the sidebar. Pure CSS animation, off when the user prefers reduced motion. */
export default function FloatingLeaves() {
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {leaves.map((l, i) => (
        <Box
          key={i}
          component="svg"
          viewBox="0 0 24 24"
          sx={{
            position: 'absolute',
            bottom: -40,
            left: l.left,
            width: l.size,
            height: l.size,
            '--r0': `${l.r0}deg`,
            '--sway': `${l.sway}px`,
            '--o': l.o,
            opacity: 0,
            animation: `${drift} ${l.dur}s linear ${l.delay}s infinite`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: l.o * 0.6, bottom: `${10 + i * 9}%` },
          }}
        >
          <path d="M12 1.5C6 5.5 3.5 11.5 6 21c8.5-1 14.5-7.5 14-17C17 3 14.5 1.8 12 1.5z" fill={l.c} />
          <path d="M6.5 20.5C10 14 13 9 17 5.5" stroke="rgba(47,79,138,0.55)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        </Box>
      ))}
    </Box>
  );
}
