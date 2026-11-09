import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { brand } from '../../theme/theme';

/** 48px rounded tile; the same size everywhere so icons line up across cards. */
export default function IconTile({ children, color = brand.primary }: { children: ReactNode; color?: string }) {
  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        flexShrink: 0,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        bgcolor: alpha(color, 0.12),
        border: `1px solid ${alpha(color, 0.18)}`,
      }}
    >
      {children}
    </Box>
  );
}
