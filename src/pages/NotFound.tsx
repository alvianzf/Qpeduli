import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import { Sprout } from '../components/art/Nature';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 4 }}>
      <Stack alignItems="center" spacing={3}>
        <Box className="float-slow"><Sprout size={110} /></Box>
        <Typography variant="h4">Halaman tidak ditemukan</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 380 }}>Sepertinya kamu tersesat. Yuk kembali ke beranda.</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Ke Beranda</Button>
      </Stack>
    </Box>
  );
}
