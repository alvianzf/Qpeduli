import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from './ui/Txt';
import Stack from './ui/FlexStack';
import { alpha } from '@mui/material/styles';
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
    <Card sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
      <Stack alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(color, 0.1),
            color,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography fontWeight={700} sx={{ mb: 0.5 }}>{title}</Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
              {description}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
    </Card>
  );
}
