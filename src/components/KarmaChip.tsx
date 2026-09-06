import Chip from '@mui/material/Chip';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { alpha } from '@mui/material/styles';

export default function KarmaChip({ karma, size = 'small' }: { karma: number; size?: 'small' | 'medium' }) {
  return (
    <Chip
      icon={<FavoriteIcon sx={{ fontSize: 16, color: '#EF4444 !important' }} />}
      label={`${karma.toLocaleString('id-ID')} Poin Kebaikan`}
      size={size}
      sx={{
        bgcolor: alpha('#EF4444', 0.08),
        color: '#0B1E4D',
        fontWeight: 700,
        border: `1px solid ${alpha('#EF4444', 0.2)}`,
      }}
    />
  );
}
