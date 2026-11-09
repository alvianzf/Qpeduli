import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
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
  /** Kept for compatibility; the banner no longer reserves overlap space. */
  overlap?: boolean;
  children?: ReactNode;
}

const pad = {
  sm: { p: { xs: 2.5, md: 3 } },
  md: { p: { xs: 3, md: 4 } },
  lg: { p: { xs: 3, md: 5 } },
};

/** Translucent glossy banner at the top of the content column: text left, actions under it, aside right. */
export default function Hero({ eyebrow, title, subtitle, actions, aside, size = 'md', children }: HeroProps) {
  return (
    <Box sx={{ ...heroBase, ...pad[size] }}>
      <HeroDecor />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: aside ? 'minmax(0,1fr) minmax(0,360px)' : '1fr' },
          gap: { xs: 3, md: 4 },
          alignItems: 'center',
        }}
      >
        <Stack spacing={1.5} alignItems="flex-start">
          {eyebrow}
          <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', md: size === 'lg' ? '2.4rem' : '2rem' }, lineHeight: 1.15, maxWidth: 640 }}>
            {title}
          </Typography>
          {subtitle && <Typography sx={{ opacity: 0.9, fontSize: { xs: '0.95rem', md: '1rem' }, maxWidth: 520 }}>{subtitle}</Typography>}
          {actions && (
            <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ pt: 0.5 }}>
              {actions}
            </Stack>
          )}
          {children}
        </Stack>
        {aside && <Box sx={{ minWidth: 0 }}>{aside}</Box>}
      </Box>
    </Box>
  );
}
