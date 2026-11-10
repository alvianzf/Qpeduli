import type { ReactNode } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '../components/ui/Txt';
import { lte } from './adminTheme';

interface Props {
  title?: string;
  hint?: string;
  /** Right-aligned controls in the card header. */
  tools?: ReactNode;
  /** AdminLTE "card-outline" accent colour. */
  accent?: string;
  /** No body padding (tables). */
  flush?: boolean;
  children: ReactNode;
  sx?: SxProps<Theme>;
}

/** AdminLTE card: white, optional header with title and tools, optional coloured top rule. */
export default function AdminCard({ title, hint, tools, accent, flush, children, sx }: Props) {
  return (
    <Card sx={[{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, borderTop: accent ? `3px solid ${accent}` : undefined }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      {title && (
        <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${lte.border}`, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>{title}</Typography>
            {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
          </Box>
          {tools}
        </Box>
      )}
      <Box sx={{ p: flush ? 0 : 2, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</Box>
    </Card>
  );
}
