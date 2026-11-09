import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '../components/ui/Txt';
import Stack from '../components/ui/FlexStack';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import Logo from '../components/Logo';
import { GrassRow, Flower } from '../components/art/Nature';

const footerLinks = {
  Platform: [
    { label: 'Komunitas', to: '/komunitas' },
    { label: 'Modal Usaha', to: '/modal-usaha' },
    { label: 'FJB', to: '/fjb' },
    { label: 'Karhutla', to: '/karhutla' },
    { label: 'Keamanan', to: '/keamanan' },
    { label: 'Mitra', to: '/mitra' },
  ],
  Perusahaan: [
    { label: 'PT INI TIKET QUE', to: 'https://tiketq.com' },
  ],
  Akun: [
    { label: 'Masuk', to: '/masuk' },
    { label: 'Daftar', to: '/daftar' },
  ],
};

export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: 8, position: 'relative', zIndex: 1 }}>
      <Box sx={{ position: 'relative', lineHeight: 0, mb: '-1px' }}>
        <Box sx={{ position: 'absolute', left: '8%', bottom: 12, display: { xs: 'none', md: 'block' } }}>
          <Flower size={54} />
        </Box>
        <Box sx={{ position: 'absolute', right: '12%', bottom: 12, display: { xs: 'none', md: 'block' } }}>
          <Flower size={44} color="#fff" />
        </Box>
        <GrassRow height={52} color="#4267B2" count={70} />
      </Box>
      <Box sx={{ background: 'linear-gradient(180deg,#4267B2 0%, #2F4F8A 100%)', color: 'rgba(255,255,255,0.88)', pt: 5, pb: 3 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr 1fr', md: '2fr 1fr 1fr 1fr' } }}>
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Logo size={34} light />
              <Typography variant="h6" fontWeight={800} color="#fff">Qpeduli</Typography>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.75, maxWidth: 320 }}>
              Dari diskusi menjadi aksi. Tempat kebaikan tumbuh: simpati berubah menjadi bantuan nyata, dan usaha kecil mendapat modal untuk bertunas.
            </Typography>
          </Box>
          {Object.entries(footerLinks).map(([title, links]) => (
            <Box key={title}>
              <Typography variant="subtitle2" fontWeight={800} color="#fff" sx={{ mb: 1.5 }}>
                {title}
              </Typography>
              <Stack spacing={1}>
                {links.map((l) =>
                  l.to.startsWith('http') ? (
                    <Link
                      key={l.label}
                      href={l.to}
                      target="_blank"
                      rel="noreferrer"
                      variant="body2"
                      underline="none"
                      sx={{ color: 'rgba(255,255,255,0.75)', '&:hover': { color: '#fff' } }}
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <Link
                      key={l.label}
                      component={RouterLink}
                      to={l.to}
                      variant="body2"
                      underline="none"
                      sx={{ color: 'rgba(255,255,255,0.75)', '&:hover': { color: '#fff' } }}
                    >
                      {l.label}
                    </Link>
                  ),
                )}
              </Stack>
            </Box>
          ))}
        </Box>
        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.15)' }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1.5}>
          <Typography variant="caption" sx={{ opacity: 0.65 }}>
            © {new Date().getFullYear()} Qpeduli. Seluruh hak cipta dilindungi.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.65 }}>
            Bagian dari{' '}
            <Link
              href="https://tiketq.com"
              target="_blank"
              rel="noreferrer"
              variant="caption"
              underline="none"
              sx={{ color: '#F6C453', fontWeight: 700 }}
            >
              PT INI TIKET QUE
            </Link>{' '}
            (tiketq.com)
          </Typography>
        </Stack>
      </Container>
      </Box>
    </Box>
  );
}
