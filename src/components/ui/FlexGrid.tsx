import { createContext, useContext, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SizeValue = number | Partial<Record<Breakpoint, number>>;

const GridSpacingContext = createContext(0);

export interface GridProps extends Omit<BoxProps, 'children'> {
  container?: boolean;
  spacing?: number;
  size?: SizeValue;
  children?: ReactNode;
}

/**
 * Plain-flexbox stand-in for MUI's Grid. MUI's CSS-variable-based sizing
 * (--Grid-parent-columns etc.) collapses to content width instead of the
 * viewport at narrow widths in this MUI version, causing horizontal overflow
 * on mobile. This mirrors the same container/size API without that mechanism.
 */
export default function Grid({ container, spacing, size, sx, children, ...rest }: GridProps) {
  const theme = useTheme();
  const parentSpacing = useContext(GridSpacingContext);
  const sxArray = Array.isArray(sx) ? sx : sx ? [sx] : [];

  if (container) {
    const spacingPx = theme.spacing(spacing ?? 0);
    return (
      <GridSpacingContext.Provider value={spacing ?? 0}>
        <Box
          sx={[
            {
              display: 'flex',
              flexWrap: 'wrap',
              width: `calc(100% + ${spacingPx})`,
              margin: `calc(-1 * ${spacingPx} / 2)`,
            },
            ...sxArray,
          ]}
          {...rest}
        >
          {children}
        </Box>
      </GridSpacingContext.Provider>
    );
  }

  const spacingPx = theme.spacing(parentSpacing);
  const sizes: Partial<Record<Breakpoint, number>> = typeof size === 'number' ? { xs: size } : size ?? {};
  const widthSx: Partial<Record<Breakpoint, string>> = {};
  (Object.keys(sizes) as Breakpoint[]).forEach((bp) => {
    const n = sizes[bp];
    if (n != null) widthSx[bp] = `${(n / 12) * 100}%`;
  });

  return (
    <Box
      sx={[
        {
          boxSizing: 'border-box',
          minWidth: 0,
          padding: `calc(${spacingPx} / 2)`,
          width: widthSx,
        },
        ...sxArray,
      ]}
      {...rest}
    >
      {children}
    </Box>
  );
}
