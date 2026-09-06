import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from './ui/FlexStack';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useThreads, useCreateFjbItem, apiErrorMessage } from '../lib/queries';

const conditions = [
  { value: 'BARU', label: 'Baru' },
  { value: 'SEPERTI_BARU', label: 'Seperti Baru' },
  { value: 'BEKAS_LAYAK_PAKAI', label: 'Bekas Layak Pakai' },
] as const;

const emojiOptions = ['🎁', '📷', '🚲', '👜', '📚', '🎨', '👕', '🛋️', '⚽', '🎮'];

export default function CreateFjbItemDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: aksiThreads = [] } = useThreads({ filter: 'aksi' });
  const createItem = useCreateFjbItem();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<typeof conditions[number]['value']>('SEPERTI_BARU');
  const [category, setCategory] = useState('');
  const [emoji, setEmoji] = useState('🎁');
  const [campaignId, setCampaignId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const reset = () => {
    setTitle('');
    setPrice('');
    setCondition('SEPERTI_BARU');
    setCategory('');
    setEmoji('🎁');
    setCampaignId('');
    setDescription('');
    setError('');
    setDone(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim() || !price || Number(price) <= 0 || !category.trim() || !campaignId) {
      setError('Lengkapi judul, harga, kategori, dan pilih kampanye tujuan.');
      return;
    }
    try {
      await createItem.mutateAsync({
        title: title.trim(),
        price: Number(price),
        condition,
        category: category.trim(),
        emoji,
        campaignId,
        description: description.trim(),
      });
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal menambahkan barang.'));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Jual Barang / Jasa
        <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {done ? (
          <Alert severity="success" sx={{ borderRadius: 3 }}>
            Barangmu berhasil ditambahkan ke FJB Amal! Hasil penjualan akan disalurkan ke kampanye yang kamu pilih.
          </Alert>
        ) : (
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
            {aksiThreads.length === 0 && (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Belum ada kampanye Aksi Sosial aktif untuk dituju. Buat atau tunggu kampanye tersedia dulu sebelum menjual barang di sini.
              </Alert>
            )}
            <TextField label="Judul Barang/Jasa" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
            <Stack direction="row" spacing={2}>
              <TextField label="Harga (Rp)" type="number" fullWidth value={price} onChange={(e) => setPrice(e.target.value)} />
              <TextField select label="Kondisi" fullWidth value={condition} onChange={(e) => setCondition(e.target.value as typeof condition)}>
                {conditions.map((c) => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Kategori" placeholder="misal: Elektronik" fullWidth value={category} onChange={(e) => setCategory(e.target.value)} />
              <TextField select label="Ikon" fullWidth value={emoji} onChange={(e) => setEmoji(e.target.value)}>
                {emojiOptions.map((e) => (
                  <MenuItem key={e} value={e}>{e}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              select
              label="Salurkan hasil penjualan ke kampanye"
              fullWidth
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              disabled={aksiThreads.length === 0}
            >
              {aksiThreads.map((t) => (
                <MenuItem key={t.campaign!.id} value={t.campaign!.id}>{t.title}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Deskripsi"
              fullWidth
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {done ? (
          <Button onClick={handleClose} variant="contained" fullWidth>Selesai</Button>
        ) : (
          <>
            <Button onClick={handleClose} color="inherit">Batal</Button>
            <Button onClick={handleSubmit} variant="contained" color="warning" disabled={createItem.isPending}>
              {createItem.isPending ? 'Menyimpan...' : 'Pasang Iklan'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
