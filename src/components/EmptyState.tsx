import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from './ui/FlexStack';
import Typography from './ui/Txt';
import GlossCard from './ui/GlossCard';
import IconTile from './ui/IconTile';
import { brand } from '../theme/theme';

export default function EmptyState({
  icon,
  title,
  description,
  action,
  color = brand.primary,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  color?: string;
}) {
  return (
    <GlossCard sx={{ p: { xs: 4, md: 6 }, alignItems: 'center', textAlign: 'center' }}>
      <Stack alignItems="center" spacing={2.5}>
        <IconTile color={color}>{icon}</IconTile>
        <Box>
          <Typography variant="h6" sx={{ mb: 0.75 }}>{title}</Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mx: 'auto' }}>{description}</Typography>
          )}
        </Box>
        {action}
      </Stack>
    </GlossCard>
  );
}
