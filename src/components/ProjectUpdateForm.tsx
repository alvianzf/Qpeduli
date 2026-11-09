import { useState } from 'react';
import Stack from './ui/FlexStack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from './ui/Txt';
import { usePostProjectUpdate, apiErrorMessage } from '../lib/queries';

export default function ProjectUpdateForm({ projectId }: { projectId: string }) {
  const post = usePostProjectUpdate(projectId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    try {
      await post.mutateAsync({ title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal mengirim kabar.'));
    }
  };

  return (
    <Stack spacing={1.5} sx={{ mb: 3 }}>
      <Typography variant="subtitle2">Bagikan kabar terbaru</Typography>
      {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
      <TextField label="Judul" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
      <TextField label="Ceritakan perkembangannya" value={content} onChange={(e) => setContent(e.target.value)} multiline minRows={3} fullWidth />
      <Button
        variant="contained"
        onClick={submit}
        disabled={!title.trim() || !content.trim() || post.isPending}
        sx={{ alignSelf: 'flex-start' }}
      >
        {post.isPending ? 'Mengirim...' : 'Kirim Kabar'}
      </Button>
    </Stack>
  );
}
