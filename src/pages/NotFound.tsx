import Box from '@mui/material/Box';
import Typography from '../components/ui/Txt';
import Button from '@mui/material/Button';
import Stack from '../components/ui/FlexStack';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Stack alignItems="center" spacing={2}>
          <Typography sx={{ fontSize: 80 }}>🧭</Typography>
          <Typography variant="h4" fontWeight={800}>Halaman Tidak Ditemukan</Typography>
          <Typography color="text.secondary" maxWidth={400}>
            Sepertinya kamu tersesat. Yuk kembali ke komunitas dan temukan aksi sosial yang butuh dukunganmu.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>Kembali ke Beranda</Button>
        </Stack>
      </motion.div>
    </Box>
  );
}
