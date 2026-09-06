import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '../components/ui/FlexGrid';
import Typography from '../components/ui/Txt';
import Stack from '../components/ui/FlexStack';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import Logo from '../components/Logo';

const footerLinks = {
  Platform: [
    { label: 'Ruang Komunitas', to: '/komunitas' },
    { label: 'FJB Amal', to: '/fjb' },
    { label: 'Transparansi & Keamanan', to: '/keamanan' },
  ],
  Perusahaan: [
    { label: 'Tentang Qpeduli', to: '/keamanan' },
    { label: 'PT INI TIKET QUE', to: 'https://tiketq.com' },
  ],
  Akun: [
    { label: 'Masuk', to: '/masuk' },
    { label: 'Daftar', to: '/daftar' },
    { label: 'Profil Saya', to: '/profil' },
  ],
};

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        background: 'linear-gradient(180deg,#1E3A6E 0%, #2F4F8A 100%)',
        color: 'rgba(255,255,255,0.85)',
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Logo size={34} />
              <Typography variant="h6" fontWeight={800} color="#fff">Qpeduli</Typography>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.75, maxWidth: 320 }}>
              Dari diskusi menjadi aksi. Platform community-driven crowdfunding tempat simpati berubah menjadi bantuan nyata dan terukur.
            </Typography>
          </Grid>
          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid size={{ xs: 6, md: 2.3 }} key={title}>
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
            </Grid>
          ))}
        </Grid>
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
              sx={{ color: '#93C5FD', fontWeight: 700 }}
            >
              PT INI TIKET QUE
            </Link>{' '}
            (tiketq.com)
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
