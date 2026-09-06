import VerifiedIcon from '@mui/icons-material/Verified';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

export default function VerifiedBadge({ size = 18 }: { size?: number }) {
  return (
    <Tooltip title="Ksatria Komunitas — Terverifikasi sebagai penjamin (guarantor) kampanye">
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}>
        <VerifiedIcon sx={{ fontSize: size, color: '#2563EB' }} />
      </Box>
    </Tooltip>
  );
}
