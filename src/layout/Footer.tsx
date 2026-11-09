import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import Logo from '../components/Logo';

const links = [
  { label: 'FJB', to: '/fjb' },
  { label: 'Keamanan', to: '/keamanan' },
  { label: 'Mitra', to: '/mitra' },
];

/** Slim one-row footer that sits inside the content column. */
export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: 5, mb: { xs: 9, md: 2 }, position: 'relative', zIndex: 1 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2.5, py: 1.5, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.9)' }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Logo size={20} />
          <Typography variant="caption" color="text.secondary">© {new Date().getFullYear()} Qpeduli ·</Typography>
          <Link href="https://tiketq.com" target="_blank" rel="noreferrer" underline="none" variant="caption" sx={{ fontWeight: 700 }}>PT INI TIKET QUE</Link>
        </Stack>
        <Stack direction="row" spacing={2.5}>
          {links.map((l) => (
            <Link key={l.to} component={RouterLink} to={l.to} variant="caption" underline="none" color="text.secondary" sx={{ fontWeight: 600 }}>{l.label}</Link>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
