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
  /** Right-hand column on desktop (illustration, featured card). */
  aside?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Space reserved at the bottom so the next <Section overlap> can tuck under the panel. */
  overlap?: boolean;
  children?: ReactNode;
}

const pad = {
  sm: { pt: { xs: 4, md: 5 }, pb: { xs: 4, md: 5 } },
  md: { pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 } },
  lg: { pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 } },
};

/** Floating, glossy, translucent hero panel. One layout for every page. */
export default function Hero({ eyebrow, title, subtitle, actions, aside, size = 'md', overlap = true, children }: HeroProps) {
  const extra = overlap ? { xs: 9, md: 11 } : undefined;
  return (
    <Box sx={{ ...heroBase, ...pad[size], ...(extra ? { pb: extra } : {}) }}>
      <HeroDecor />
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: aside ? 'minmax(0,7fr) minmax(0,5fr)' : '1fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'center',
          }}
        >
          <Stack spacing={2.5} alignItems="flex-start">
            {eyebrow}
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: size === 'lg' ? '3.1rem' : '2.5rem' }, lineHeight: 1.15, maxWidth: 720 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ opacity: 0.9, fontSize: { xs: '1rem', md: '1.1rem' }, maxWidth: 560 }}>{subtitle}</Typography>
            )}
            {actions && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap sx={{ pt: 1, width: { xs: '100%', sm: 'auto' } }}>
                {actions}
              </Stack>
            )}
            {children}
          </Stack>
          {aside && <Box sx={{ minWidth: 0 }}>{aside}</Box>}
        </Box>
      </Container>
    </Box>
  );
}
