import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from './ui/FlexStack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from './ui/Txt';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useCreateModalUsaha, apiErrorMessage } from '../lib/queries';

const types = ['Kuliner & Warung', 'Pertanian', 'Peternakan', 'Kerajinan', 'Jasa', 'Perdagangan', 'Lainnya'];

interface RewardDraft {
  title: string;
  description: string;
  minAmount: string;
  stock: string;
}

const emptyReward = (): RewardDraft => ({ title: '', description: '', minAmount: '', stock: '' });

export default function CreateModalUsahaDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateModalUsaha();
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [businessType, setBusinessType] = useState(types[0]);
  const [city, setCity] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [rewards, setRewards] = useState<RewardDraft[]>([emptyReward()]);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const reset = () => {
    setTitle('');
    setStory('');
    setBusinessType(types[0]);
    setCity('');
    setTarget('');
    setDeadline('');
    setRewards([emptyReward()]);
    setError('');
    setDone(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const updateReward = (i: number, patch: Partial<RewardDraft>) =>
    setRewards((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const submit = async () => {
    setError('');
    const filled = rewards.filter((r) => r.title.trim() || r.minAmount);
    for (const r of filled) {
      if (!r.title.trim() || !Number(r.minAmount)) {
        setError('Setiap hadiah butuh judul dan nominal minimal.');
        return;
      }
    }
    try {
      await create.mutateAsync({
        title: title.trim(),
        story: story.trim(),
        businessType,
        city: city.trim() || undefined,
        target: Number(target),
        deadline: new Date(deadline).toISOString(),
        rewards: filled.map((r) => ({
          title: r.title.trim(),
          description: r.description.trim() || undefined,
          minAmount: Number(r.minAmount),
          stock: r.stock ? Number(r.stock) : undefined,
        })),
      });
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal mengirim usaha.'));
    }
  };

  const valid = title.trim().length >= 5 && story.trim().length >= 30 && Number(target) > 0 && deadline;

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Ajukan Modal Usaha
        <IconButton onClick={close} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {done ? (
          <Stack spacing={1.5} sx={{ py: 3 }} alignItems="center">
            <Typography variant="h6" fontWeight={700}>Usahamu sudah terkirim</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={440}>
              Tim Qpeduli atau seorang Ksatria Komunitas akan memverifikasi usahamu dulu. Setelah disetujui, halamannya
              tampil di daftar Modal Usaha dan mulai menerima dukungan.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}
            <TextField label="Nama usaha" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select label="Jenis usaha" value={businessType} onChange={(e) => setBusinessType(e.target.value)} fullWidth>
                {types.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField label="Kota" value={city} onChange={(e) => setCity(e.target.value)} fullWidth />
            </Stack>
            <TextField
              label="Ceritakan usahamu: siapa kamu, apa rencananya, untuk apa modalnya"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              multiline
              minRows={4}
              helperText={`${story.trim().length}/30 karakter minimal`}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Target dana (Rp)" type="number" value={target} onChange={(e) => setTarget(e.target.value)} fullWidth />
              <TextField
                label="Batas waktu"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Hadiah untuk pendukung (opsional)</Typography>
              <Typography variant="caption" color="text.secondary">
                Contoh: kartu ucapan, sampel produk, atau makan gratis di warungmu. Pastikan kamu sanggup mengirimnya.
              </Typography>
              {rewards.map((r, i) => (
                <Stack key={i} direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-start' }}>
                  <TextField label="Judul hadiah" value={r.title} onChange={(e) => updateReward(i, { title: e.target.value })} fullWidth />
                  <TextField label="Minimal (Rp)" type="number" value={r.minAmount} onChange={(e) => updateReward(i, { minAmount: e.target.value })} sx={{ minWidth: 150 }} />
                  <TextField label="Stok" type="number" value={r.stock} onChange={(e) => updateReward(i, { stock: e.target.value })} sx={{ minWidth: 100 }} />
                  <IconButton aria-label="Hapus hadiah" onClick={() => setRewards((rs) => rs.filter((_, idx) => idx !== i))} disabled={rewards.length === 1}>
                    <DeleteOutlinedIcon />
                  </IconButton>
                </Stack>
              ))}
              {rewards.length < 8 && (
                <Button startIcon={<AddIcon />} onClick={() => setRewards((rs) => [...rs, emptyReward()])} sx={{ alignSelf: 'flex-start' }}>
                  Hadiah
                </Button>
              )}
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {done ? (
          <Button onClick={close} variant="contained">Tutup</Button>
        ) : (
          <>
            <Button onClick={close} color="inherit">Batal</Button>
            <Button onClick={submit} variant="contained" disabled={!valid || create.isPending}>
              {create.isPending ? 'Mengirim...' : 'Kirim'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
