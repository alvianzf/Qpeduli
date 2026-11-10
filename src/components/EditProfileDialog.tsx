import { useEffect, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useQueryClient } from '@tanstack/react-query';
import Stack from './ui/FlexStack';
import Typography from './ui/Txt';
import UserAvatar from './UserAvatar';
import api, { apiErrorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../feedback/FeedbackProvider';

interface Props {
  open: boolean;
  onClose: () => void;
  initial: { name: string; city?: string | null; bio?: string | null; username: string; avatarUrl?: string | null; avatarColor?: string };
}

const MAX = 2 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Edit name, city, bio and profile picture. A chosen picture is previewed locally and only uploaded on Simpan. */
export default function EditProfileDialog({ open, onClose, initial }: Props) {
  const qc = useQueryClient();
  const { refresh } = useAuth();
  const { toast, confirm } = useFeedback();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initial.name);
  const [city, setCity] = useState(initial.city ?? '');
  const [bio, setBio] = useState(initial.bio ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Release the object URL when the preview changes or the dialog goes away.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const choose = (f?: File | null) => {
    if (!f) return;
    if (!TYPES.includes(f.type)) return setError('Format foto harus JPG, PNG, atau WEBP.');
    if (f.size > MAX) return setError('Foto maksimal 2 MB.');
    setError('');
    setFile(f);
    setRemovePhoto(false);
    setPreview(URL.createObjectURL(f));
  };
  const discard = () => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; };

  const shownUrl = preview ?? (removePhoto ? null : initial.avatarUrl ?? null);

  const save = async () => {
    if (file && !(await confirm({ title: 'Unggah foto ini?', text: 'Foto akan menjadi foto profilmu dan terlihat oleh orang lain.', icon: 'question', confirmText: 'Ya, unggah' }))) return;
    setBusy(true);
    setError('');
    try {
      if (file) {
        const form = new FormData();
        form.append('avatar', file);
        await api.post('/users/me/avatar', form);
      } else if (removePhoto && initial.avatarUrl) {
        await api.delete('/users/me/avatar');
      }
      await api.patch('/users/me', { name: name.trim(), city: city.trim(), bio: bio.trim() });
      await refresh();
      await qc.invalidateQueries({ queryKey: ['user', initial.username] });
      toast.success('Profil diperbarui.');
      onClose();
    } catch (e) {
      setError(apiErrorMessage(e, 'Gagal menyimpan profil.'));
      toast.error('Gagal menyimpan profil.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit profil</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={2.5} alignItems="center">
            <UserAvatar name={name} src={shownUrl} color={initial.avatarColor} size={88} sx={{ border: preview ? '3px solid #FF7A33' : '3px solid #E1E8F2' }} />
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Foto profil</Typography>
                {preview && <Chip size="small" color="warning" label="Pratinjau, belum diunggah" />}
              </Stack>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => choose(e.target.files?.[0])} />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button size="small" variant="outlined" onClick={() => fileRef.current?.click()} disabled={busy}>{preview ? 'Ganti foto' : 'Pilih foto'}</Button>
                {preview && <Button size="small" onClick={discard} disabled={busy}>Batalkan pilihan</Button>}
                {!preview && shownUrl && <Button size="small" color="error" onClick={() => setRemovePhoto(true)} disabled={busy}>Hapus foto</Button>}
                {!preview && removePhoto && <Button size="small" onClick={() => setRemovePhoto(false)} disabled={busy}>Batal hapus</Button>}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>JPG, PNG, atau WEBP, maksimal 2 MB.</Typography>
            </Box>
          </Stack>

          <TextField label="Nama" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
          <TextField label="Kota" value={city} onChange={(e) => setCity(e.target.value)} fullWidth helperText="Dipakai untuk menampilkanmu di peta wilayah." />
          <TextField label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} multiline minRows={3} fullWidth helperText={`${bio.length}/300`} slotProps={{ htmlInput: { maxLength: 300 } }} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>Batal</Button>
        <Button variant="contained" onClick={save} disabled={busy || name.trim().length < 2}>Simpan</Button>
      </DialogActions>
    </Dialog>
  );
}
