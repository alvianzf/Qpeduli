import type { ReactNode } from 'react';
import Box from '@mui/material/Box';

type Cols = number | { xs?: number; sm?: number; md?: number };

/**
 * CSS grid, so every card in a row is stretched to the same height by the browser.
 * Gap is always 24px.
 */
export default function CardGrid({ cols = { xs: 1, sm: 2, md: 3 }, children }: { cols?: Cols; children: ReactNode }) {
  const c = typeof cols === 'number' ? { xs: cols } : cols;
  const tpl = (n?: number) => (n ? `repeat(${n}, minmax(0, 1fr))` : undefined);
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        alignItems: 'stretch',
        gridTemplateColumns: { xs: tpl(c.xs ?? 1), sm: tpl(c.sm ?? c.xs ?? 1), md: tpl(c.md ?? c.sm ?? c.xs ?? 1) },
      }}
    >
      {children}
    </Box>
  );
}
