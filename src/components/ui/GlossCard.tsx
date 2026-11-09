import type { ReactNode, KeyboardEvent } from 'react';
import Card from '@mui/material/Card';
import type { SxProps, Theme } from '@mui/material/styles';
import { motion } from 'framer-motion';

interface GlossCardProps {
  children: ReactNode;
  onClick?: () => void;
  /** Remove inner padding (for cards that start with an image). */
  flush?: boolean;
  delay?: number;
  sx?: SxProps<Theme>;
}

/**
 * The one card. 16px radius, 24px padding, column layout that fills its grid cell,
 * so a footer with `mt: 'auto'` always lands on the same line across a row.
 */
export default function GlossCard({ children, onClick, flush = false, delay = 0, sx }: GlossCardProps) {
  const interactive = Boolean(onClick);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay }}
      style={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}
    >
      <Card
        onClick={onClick}
        onKeyDown={interactive ? onKey : undefined}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'link' : undefined}
        sx={[
          {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            p: flush ? 0 : 3,
            transition: 'transform .2s ease, box-shadow .2s ease',
            ...(interactive && {
              cursor: 'pointer',
              '&:hover, &:focus-visible': { transform: 'translateY(-4px)', boxShadow: '0 18px 36px rgba(20,83,45,0.16)', outline: 'none' },
            }),
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        {children}
      </Card>
    </motion.div>
  );
}
