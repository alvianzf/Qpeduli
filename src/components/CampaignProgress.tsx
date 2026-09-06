import Box from '@mui/material/Box';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { formatRupiah } from '../data/mockData';
import { brand } from '../theme/theme';
import type { Campaign } from '../types';

export default function CampaignProgress({ campaign, compact = false }: { campaign: Campaign; compact?: boolean }) {
  const pct = Math.min(100, Math.round((campaign.collected / campaign.target) * 100));
  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          height: compact ? 8 : 12,
          borderRadius: 999,
          overflow: 'hidden',
          bgcolor: alpha(brand.primary, 0.1),
          mb: 1,
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${brand.cta}, ${brand.ctaLight})`,
          }}
        />
      </Box>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" flexWrap="wrap" gap={0.5}>
        <Typography variant={compact ? 'body2' : 'h6'} fontWeight={800} color="primary.dark">
          {formatRupiah(campaign.collected)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {pct}% dari target {formatRupiah(campaign.target)}
        </Typography>
      </Stack>
      {!compact && (
        <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            👥 {campaign.donorCount.toLocaleString('id-ID')} donatur
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ⏳ Batas {new Date(campaign.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
