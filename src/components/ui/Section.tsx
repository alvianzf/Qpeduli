import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from './Txt';

interface SectionProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  /** Tuck the first section up over the hero's hills. */
  overlap?: boolean;
  children: ReactNode;
}

/** Wide centered block: 72px between blocks on desktop. Overlapping sections are positioned above the hero. */
export default function Section({ title, subtitle, action, overlap = false, children }: SectionProps) {
  return (
    <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, mt: overlap ? { xs: -6, md: -9 } : { xs: 6, md: 9 } }}>
      {(title || action) && (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 3, mb: 3 }}>
          <Box sx={{ minWidth: 0 }}>
            {title && <Typography variant="h3" sx={{ fontSize: { xs: '1.7rem', md: '2.3rem' } }}>{title}</Typography>}
            {subtitle && <Typography color="text.secondary" sx={{ mt: 0.75, fontSize: '1.05rem' }}>{subtitle}</Typography>}
          </Box>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Box>
      )}
      {children}
    </Container>
  );
}
