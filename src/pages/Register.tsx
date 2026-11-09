import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', city: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
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
    <AuthShell title="Daftar" subtitle="Dari diskusi, menjadi aksi">
      <Stack spacing={3} component="form" onSubmit={submit}>
        {error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}
        <TextField label="Nama lengkap" fullWidth required value={form.name} onChange={set('name')} />
        <TextField label="Username" fullWidth required value={form.username} onChange={set('username')} />
        <TextField label="Email" type="email" fullWidth required value={form.email} onChange={set('email')} />
        <TextField label="Kota" fullWidth value={form.city} onChange={set('city')} />
        <TextField label="Kata sandi" type="password" fullWidth required value={form.password} onChange={set('password')} />
        <Button variant="contained" size="large" type="submit" disabled={loading}>{loading ? 'Memproses...' : 'Daftar'}</Button>
        <Typography variant="body2" textAlign="center">
          Sudah punya akun?{' '}
          <Link component={RouterLink} to="/masuk" underline="none" sx={{ fontWeight: 700 }}>Masuk</Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}
