import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Typography from '../components/ui/Txt';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '../components/ui/FlexStack';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { heroGradient } from '../theme/theme';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', city: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

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
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
            <Stack spacing={2} component="form" onSubmit={handleSubmit}>
              <TextField label="Nama Lengkap" fullWidth required value={form.name} onChange={set('name')} />
              <TextField label="Username" fullWidth required value={form.username} onChange={set('username')} />
              <TextField label="Email" type="email" fullWidth required value={form.email} onChange={set('email')} />
              <TextField label="Kota" fullWidth value={form.city} onChange={set('city')} />
              <TextField label="Kata Sandi" type="password" fullWidth required value={form.password} onChange={set('password')} />
              <Button variant="contained" size="large" type="submit" disabled={loading}>
                {loading ? 'Memproses...' : 'Daftar Gratis'}
              </Button>
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
