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

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Masuk" subtitle="Lanjutkan diskusi dan aksimu">
      <Stack spacing={3} component="form" onSubmit={submit}>
        {error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}
        <TextField label="Email atau username" fullWidth required value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <TextField label="Kata sandi" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button variant="contained" size="large" type="submit" disabled={loading}>{loading ? 'Memproses...' : 'Masuk'}</Button>
        <Typography variant="body2" textAlign="center">
          Belum punya akun?{' '}
          <Link component={RouterLink} to="/daftar" underline="none" sx={{ fontWeight: 700 }}>Daftar</Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}
