import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from './Txt';

interface SectionProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  /** Kept for compatibility: sections sit directly under the banner, so this only tightens the gap. */
  overlap?: boolean;
  children: ReactNode;
}

/** A block in the content column: 32px between blocks, 16px under the banner. */
export default function Section({ title, subtitle, action, overlap = false, children }: SectionProps) {
  return (
    <Box sx={{ position: 'relative', zIndex: 1, mt: overlap ? 2 : 4 }}>
      {(title || action) && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            {title && <Typography variant="h5" sx={{ fontSize: { xs: '1.2rem', md: '1.4rem' } }}>{title}</Typography>}
            {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
          </Box>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Box>
      )}
      {children}
    </Box>
  );
}
