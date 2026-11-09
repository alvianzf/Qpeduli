import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from './FlexStack';
import Typography from './Txt';
import HeroDecor from '../HeroDecor';
import { heroBase } from '../../theme/theme';

interface HeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Large visual on the right on desktop (illustration, featured card). */
  aside?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Kept for compatibility. */
  overlap?: boolean;
  children?: ReactNode;
}

const pad = {
  sm: { pt: { xs: 5, md: 6 }, pb: { xs: 9, md: 10 } },
  md: { pt: { xs: 7, md: 9 }, pb: { xs: 11, md: 13 } },
  lg: { pt: { xs: 8, md: 12 }, pb: { xs: 13, md: 17 } },
};

/** Full-bleed translucent glossy hero with a big visual and rolling hills at its foot. */
export default function Hero({ eyebrow, title, subtitle, actions, aside, size = 'md', children }: HeroProps) {
  return (
    <Box sx={{ ...heroBase, ...pad[size], borderRadius: 0, border: 'none', borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
      <HeroDecor />
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: aside ? 'minmax(0,6fr) minmax(0,5fr)' : '1fr' },
            gap: { xs: 4, md: 8 },
            alignItems: 'center',
          }}
        >
          <Stack spacing={2.5} alignItems="flex-start">
            {eyebrow}
            <Typography variant="h1" sx={{ fontSize: { xs: '2.2rem', md: size === 'lg' ? '3.8rem' : '2.9rem' }, lineHeight: 1.08, maxWidth: 760 }}>
              {title}
            </Typography>
            {subtitle && <Typography sx={{ opacity: 0.92, fontSize: { xs: '1.05rem', md: '1.2rem' }, maxWidth: 580 }}>{subtitle}</Typography>}
            {actions && <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ pt: 1 }}>{actions}</Stack>}
            {children}
          </Stack>
          {aside && <Box sx={{ minWidth: 0 }}>{aside}</Box>}
        </Box>
      </Container>
    </Box>
  );
}
