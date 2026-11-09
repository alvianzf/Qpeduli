import Chip from '@mui/material/Chip';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { alpha } from '@mui/material/styles';

export default function KarmaChip({ karma, size = 'small', compact = false }: { karma: number; size?: 'small' | 'medium'; compact?: boolean }) {
  return (
    <Chip
      icon={<FavoriteIcon sx={{ fontSize: 16, color: '#EF4444 !important' }} />}
      label={compact ? karma.toLocaleString('id-ID') : `${karma.toLocaleString('id-ID')} Poin Kebaikan`}
      size={size}
      sx={{
        bgcolor: alpha('#EF4444', 0.08),
        color: '#0F172A',
        fontWeight: 700,
        border: `1px solid ${alpha('#EF4444', 0.2)}`,
      }}
    />
  );
}
