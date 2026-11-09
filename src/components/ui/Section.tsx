import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from './Txt';

interface SectionProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  /** Pull the section up over the hero panel above it. Positioned so it paints above the hero. */
  overlap?: boolean;
  children: ReactNode;
}

/** Consistent vertical rhythm: 64px between sections on desktop, 48px on mobile. */
export default function Section({ title, subtitle, action, overlap = false, children }: SectionProps) {
  return (
    <Container
      maxWidth="lg"
      sx={{
        position: 'relative',
        zIndex: 1,
        mt: overlap ? { xs: -6, md: -7 } : { xs: 6, md: 8 },
      }}
    >
      {(title || action) && (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 3, mb: 3 }}>
          <Box sx={{ minWidth: 0 }}>
            {title && <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' } }}>{title}</Typography>}
            {subtitle && <Typography color="text.secondary" sx={{ mt: 0.75 }}>{subtitle}</Typography>}
          </Box>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Box>
      )}
      {children}
    </Container>
  );
}
