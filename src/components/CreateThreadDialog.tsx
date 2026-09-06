import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from './ui/FlexStack';
import Switch from '@mui/material/Switch';
import Typography from './ui/Txt';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { categories } from '../data/mockData';

export default function CreateThreadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isAksi, setIsAksi] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    setSubmitted(false);
    setIsAksi(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Buat Thread Baru
        <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {submitted ? (
          <Alert severity="success" sx={{ borderRadius: 3 }}>
            Thread berhasil dibuat (simulasi)! {isAksi ? 'Kampanye Aksi Sosial-mu menunggu verifikasi awal sebelum tombol donasi aktif penuh.' : 'Selamat berdiskusi bersama komunitas.'}
          </Alert>
        ) : (
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField select label="Pilih Ruang Komunitas" defaultValue={categories[0].id} fullWidth>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Judul Thread" placeholder="Contoh: Bantu biaya pengobatan Pak Slamet" fullWidth />
            <TextField label="Ceritakan detailnya" placeholder="Jelaskan situasi, kebutuhan, dan data pendukung..." fullWidth multiline minRows={4} />

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{
              p: 1.5, borderRadius: 3, bgcolor: 'rgba(30,95,224,0.06)', border: '1px solid rgba(30,95,224,0.15)',
            }}>
              <Stack>
                <Typography fontWeight={700} variant="body2">Jadikan "Aksi Sosial" 🎯</Typography>
                <Typography variant="caption" color="text.secondary">Aktifkan target dana & tombol donasi pada thread ini</Typography>
              </Stack>
              <Switch checked={isAksi} onChange={(e) => setIsAksi(e.target.checked)} />
            </Stack>

            {isAksi && (
              <Stack spacing={2}>
                <TextField label="Target Dana (Rp)" type="number" fullWidth placeholder="misal: 50000000" />
                <TextField label="Batas Waktu Penggalangan" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  Dana dicairkan bertahap per-milestone setelah diverifikasi komunitas & admin, atau dijamin (guarantor) oleh Ksatria Komunitas. Pelajari selengkapnya di halaman Transparansi & Keamanan.
                </Alert>
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {submitted ? (
          <Button onClick={handleClose} variant="contained" fullWidth>Selesai</Button>
        ) : (
          <>
            <Button onClick={handleClose} color="inherit">Batal</Button>
            <Button onClick={() => setSubmitted(true)} variant="contained">Publikasikan</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
