import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Typography from '../components/ui/Txt';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '../components/ui/FlexStack';
import Link from '@mui/material/Link';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { heroGradient } from '../theme/theme';
import Logo from '../components/Logo';

export default function Register() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', background: heroGradient, display: 'flex', alignItems: 'center', py: 8 }}>
      <Container maxWidth="xs">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card sx={{ p: 4 }}>
            <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Logo size={46} />
              <Typography variant="h5" fontWeight={800}>Gabung Qpeduli</Typography>
              <Typography variant="body2" color="text.secondary">Dari diskusi, menjadi aksi</Typography>
            </Stack>
            <Stack spacing={2} component="form" onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
              <TextField label="Nama Lengkap" fullWidth required />
              <TextField label="Email" type="email" fullWidth required />
              <TextField label="Kota" fullWidth required />
              <TextField label="Kata Sandi" type="password" fullWidth required />
              <Button variant="contained" size="large" type="submit">Daftar Gratis</Button>
            </Stack>
            <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
              Sudah punya akun?{' '}
              <Link component={RouterLink} to="/masuk" variant="body2" underline="none" sx={{ fontWeight: 700 }}>
                Masuk
              </Link>
            </Typography>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
