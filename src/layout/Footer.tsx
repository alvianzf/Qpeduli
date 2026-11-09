import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import Logo from '../components/Logo';
import { GrassRow, Flower } from '../components/art/Nature';

const columns = [
  {
    title: 'Platform',
    links: [
      { label: 'Komunitas', to: '/komunitas' },
      { label: 'Modal Usaha', to: '/modal-usaha' },
      { label: 'FJB', to: '/fjb' },
      { label: 'Keamanan', to: '/keamanan' },
      { label: 'Mitra', to: '/mitra' },
    ],
  },
  {
    title: 'Akun',
    links: [
      { label: 'Masuk', to: '/masuk' },
      { label: 'Daftar', to: '/daftar' },
    ],
  },
  { title: 'Perusahaan', links: [{ label: 'PT INI TIKET QUE', to: 'https://tiketq.com' }] },
];

const linkSx = { color: 'rgba(255,255,255,0.78)', '&:hover': { color: '#fff' } } as const;

export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: { xs: 8, md: 10 }, position: 'relative', zIndex: 1 }}>
      <Box sx={{ position: 'relative', lineHeight: 0, mb: '-1px' }}>
        <Box sx={{ position: 'absolute', left: '8%', bottom: 12, display: { xs: 'none', md: 'block' } }}><Flower size={54} /></Box>
        <Box sx={{ position: 'absolute', right: '12%', bottom: 12, display: { xs: 'none', md: 'block' } }}><Flower size={44} color="#fff" /></Box>
        <GrassRow height={52} color="#4267B2" count={70} />
      </Box>
      <Box sx={{ background: 'linear-gradient(180deg,#4267B2 0%, #2F4F8A 100%)', color: 'rgba(255,255,255,0.9)', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gap: 5, gridTemplateColumns: { xs: '1fr 1fr', md: '2fr 1fr 1fr 1fr' } }}>
            <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
                <Logo size={32} light />
                <Typography variant="h6" color="#fff">Qpeduli</Typography>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 320 }}>
                Dari diskusi menjadi aksi. Tempat kebaikan tumbuh dan usaha kecil mendapat modal untuk bertunas.
              </Typography>
            </Box>
            {columns.map((c) => (
              <Box key={c.title}>
                <Typography variant="subtitle2" color="#fff" sx={{ mb: 2 }}>{c.title}</Typography>
                <Stack spacing={1.5}>
                  {c.links.map((l) =>
                    l.to.startsWith('http') ? (
                      <Link key={l.label} href={l.to} target="_blank" rel="noreferrer" variant="body2" underline="none" sx={linkSx}>{l.label}</Link>
                    ) : (
                      <Link key={l.label} component={RouterLink} to={l.to} variant="body2" underline="none" sx={linkSx}>{l.label}</Link>
                    ),
                  )}
                </Stack>
              </Box>
            ))}
          </Box>
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.18)' }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1.5}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>© {new Date().getFullYear()} Qpeduli</Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Bagian dari{' '}
              <Link href="https://tiketq.com" target="_blank" rel="noreferrer" underline="none" sx={{ color: '#F6C453', fontWeight: 700 }}>
                PT INI TIKET QUE
              </Link>
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
