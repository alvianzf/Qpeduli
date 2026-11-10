import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '../components/ui/Txt';

/** AdminLTE "small box": coloured tile with big number, label, faded icon and a "more info" footer. */
export function SmallBox({ value, label, color, icon, to }: { value: ReactNode; label: string; color: string; icon: ReactNode; to?: string }) {
  return (
    <Box sx={{ bgcolor: color, color: '#fff', borderRadius: '4px', boxShadow: '0 0 1px rgba(0,0,0,.13), 0 1px 3px rgba(0,0,0,.2)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, pr: 10, flex: 1 }}>
        <Typography sx={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, color: '#fff' }}>{value}</Typography>
        <Typography sx={{ color: '#fff', opacity: 0.95 }}>{label}</Typography>
      </Box>
      <Box sx={{ position: 'absolute', top: 12, right: 14, opacity: 0.25, '& svg': { fontSize: 72 } }}>{icon}</Box>
      {to ? (
        <Box component={RouterLink} to={to} sx={{ display: 'block', textAlign: 'center', py: 0.6, bgcolor: 'rgba(0,0,0,0.12)', color: 'rgba(255,255,255,0.85)', fontSize: 13, textDecoration: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.2)', color: '#fff' } }}>
          Lihat detail
        </Box>
      ) : (
        <Box sx={{ py: 0.6, bgcolor: 'rgba(0,0,0,0.12)', height: 29 }} />
      )}
    </Box>
  );
}

/** AdminLTE "info box": white tile with a coloured icon square on the left. */
export function InfoBox({ value, label, color, icon }: { value: ReactNode; label: string; color: string; icon: ReactNode }) {
  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '4px', boxShadow: '0 0 1px rgba(0,0,0,.13), 0 1px 3px rgba(0,0,0,.2)', display: 'flex', minHeight: 80, overflow: 'hidden', height: '100%' }}>
      <Box sx={{ width: 70, bgcolor: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, '& svg': { fontSize: 32 } }}>{icon}</Box>
      <Box sx={{ px: 2, py: 1.25, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary" noWrap>{label}</Typography>
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700 }} noWrap>{value}</Typography>
      </Box>
    </Box>
  );
}
