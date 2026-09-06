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
import { useNavigate } from 'react-router-dom';
import { useCategories, useCreateThread, apiErrorMessage } from '../lib/queries';

export default function CreateThreadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const createThread = useCreateThread();

  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAksi, setIsAksi] = useState(false);
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);

  const reset = () => {
    setCategoryId('');
    setTitle('');
    setContent('');
    setIsAksi(false);
    setTarget('');
    setDeadline('');
    setError('');
    setCreatedId(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    if (!categoryId || title.trim().length < 5 || content.trim().length < 10) {
      setError('Lengkapi kategori, judul (min. 5 karakter), dan isi (min. 10 karakter).');
      return;
    }
    if (isAksi && (!target || Number(target) <= 0 || !deadline)) {
      setError('Isi target dana dan batas waktu untuk Aksi Sosial.');
      return;
    }
    try {
      const thread = await createThread.mutateAsync({
        categoryId,
        title: title.trim(),
        content: content.trim(),
        isAksiSosial: isAksi,
        ...(isAksi
          ? {
              campaign: {
                target: Number(target),
                deadline: new Date(deadline).toISOString(),
                milestones: [],
              },
            }
          : {}),
      });
      setCreatedId(thread.id);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal membuat thread.'));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Buat Thread Baru
        <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {createdId ? (
          <Alert severity="success" sx={{ borderRadius: 3 }}>
            Thread berhasil dibuat! {isAksi ? 'Kampanye Aksi Sosial-mu menunggu verifikasi komunitas & admin sebelum tombol donasi aktif penuh.' : 'Selamat berdiskusi bersama komunitas.'}
          </Alert>
        ) : (
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
            <TextField select label="Pilih Ruang Komunitas" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} fullWidth>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Judul Thread"
              placeholder="Contoh: Bantu biaya pengobatan Pak Slamet"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Ceritakan detailnya"
              placeholder="Jelaskan situasi, kebutuhan, dan data pendukung..."
              fullWidth
              multiline
              minRows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{
              p: 1.5, borderRadius: 3, bgcolor: 'rgba(66,103,178,0.06)', border: '1px solid rgba(66,103,178,0.15)',
            }}>
              <Stack>
                <Typography fontWeight={700} variant="body2">Jadikan "Aksi Sosial" 🎯</Typography>
                <Typography variant="caption" color="text.secondary">Aktifkan target dana & tombol donasi pada thread ini</Typography>
              </Stack>
              <Switch checked={isAksi} onChange={(e) => setIsAksi(e.target.checked)} />
            </Stack>

            {isAksi && (
              <Stack spacing={2}>
                <TextField
                  label="Target Dana (Rp)"
                  type="number"
                  fullWidth
                  placeholder="misal: 50000000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
                <TextField
                  label="Batas Waktu Penggalangan"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  Dana dicairkan bertahap per-milestone setelah diverifikasi komunitas & admin, atau dijamin (guarantor) oleh Ksatria Komunitas. Pelajari selengkapnya di halaman Transparansi & Keamanan.
                </Alert>
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {createdId ? (
          <Button
            onClick={() => {
              const id = createdId;
              handleClose();
              navigate(`/thread/${id}`);
            }}
            variant="contained"
            fullWidth
          >
            Lihat Thread
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} color="inherit">Batal</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={createThread.isPending}>
              {createThread.isPending ? 'Mempublikasikan...' : 'Publikasikan'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
