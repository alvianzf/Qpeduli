import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Typography from '../components/ui/Txt';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '../components/ui/FlexStack';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { heroGradient } from '../theme/theme';
import Logo from '../components/Logo';

export default function Login() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', background: heroGradient, display: 'flex', alignItems: 'center', py: 8 }}>
      <Container maxWidth="xs">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card sx={{ p: 4 }}>
            <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Logo size={46} />
              <Typography variant="h5" fontWeight={800}>Masuk ke Qpeduli</Typography>
              <Typography variant="body2" color="text.secondary">Lanjutkan diskusi & aksi sosialmu</Typography>
            </Stack>
            <Stack spacing={2} component="form" onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
              <TextField label="Email atau Username" fullWidth required />
              <TextField label="Kata Sandi" type="password" fullWidth required />
              <Button variant="contained" size="large" type="submit">Masuk</Button>
            </Stack>
            <Divider sx={{ my: 3 }}>atau</Divider>
            <Button fullWidth variant="outlined" onClick={() => navigate('/')}>Masuk sebagai Tamu</Button>
            <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
              Belum punya akun?{' '}
              <Link component={RouterLink} to="/daftar" variant="body2" underline="none" sx={{ fontWeight: 700 }}>
                Daftar sekarang
              </Link>
            </Typography>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
