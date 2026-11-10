import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import Stack from './ui/FlexStack';
import Typography from './ui/Txt';
import UserAvatar from './UserAvatar';
import api, { apiErrorMessage } from '../lib/api';
import { timeAgo } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { joinedLabel } from '../lib/joined';
import { useFeedback } from '../feedback/FeedbackProvider';

interface Item {
  id: number;
  content: string;
  createdAt: string;
  anonymous: boolean;
  isOwner: boolean;
  isDonor: boolean;
  mine: boolean;
  realName?: string;
  author: { name: string; username: string | null; avatarUrl: string | null; avatarColor: string; createdAt?: string };
}

/** Discussion between a campaign's confirmed donors and its creator. Donors pick real name or anonymous. */
export default function CampaignComments({ campaignId }: { campaignId: number | string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast, confirm } = useFeedback();
  const key = ['campaign-comments', String(campaignId)];
  const { data, isLoading } = useQuery({ queryKey: key, queryFn: async () => (await api.get(`/campaigns/${campaignId}/comments`)).data as { canComment: boolean; viewer: { isOwner: boolean; isDonor: boolean }; comments: Item[] } });
  const [text, setText] = useState('');
  const [anon, setAnon] = useState(false);

  const post = useMutation({
    mutationFn: async () => (await api.post(`/campaigns/${campaignId}/comments`, { content: text.trim(), anonymous: anon })).data,
    onSuccess: () => { setText(''); qc.invalidateQueries({ queryKey: key }); toast.success(anon ? 'Komentar terkirim secara anonim.' : 'Komentar terkirim.'); },
    onError: (e) => toast.error(apiErrorMessage(e, 'Komentar gagal dikirim.')),
  });
  const del = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/campaigns/${campaignId}/comments/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success('Komentar dihapus.'); },
    onError: (e) => toast.error(apiErrorMessage(e, 'Gagal menghapus komentar.')),
  });

  if (isLoading || !data) return <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={24} /></Stack>;
  const canChooseAnon = data.viewer.isDonor && !data.viewer.isOwner;

  return (
    <Stack spacing={2.5}>
      {data.canComment ? (
        <Stack spacing={1.5}>
          <TextField multiline minRows={2} fullWidth placeholder={data.viewer.isOwner ? 'Balas atau beri kabar ke para donatur' : 'Tulis dukungan atau pertanyaanmu untuk penggalang dana'} value={text} onChange={(e) => setText(e.target.value)} slotProps={{ htmlInput: { maxLength: 1000 } }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
            {canChooseAnon ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="caption" color="text.secondary">Tampil sebagai</Typography>
                <ToggleButtonGroup exclusive size="small" value={anon ? 'anon' : 'real'} onChange={(_, v) => v && setAnon(v === 'anon')} aria-label="Identitas komentar">
                  <ToggleButton value="real">{user?.name ?? 'Nama asli'}</ToggleButton>
                  <ToggleButton value="anon">Anonim</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            ) : <span />}
            <Button variant="contained" disabled={post.isPending || text.trim().length < 2} onClick={async () => {
              if (anon && !(await confirm({ title: 'Kirim sebagai anonim?', text: 'Namamu disembunyikan dari pengunjung dan penggalang dana. Hanya admin yang bisa melihatnya.', icon: 'question', confirmText: 'Ya, kirim' }))) return;
              post.mutate();
            }}>Kirim komentar</Button>
          </Stack>
        </Stack>
      ) : !user ? (
        <Alert severity="info">Masuk dan berdonasi untuk ikut berkomentar. <RouterLink to="/masuk">Masuk</RouterLink></Alert>
      ) : (
        <Alert severity="info">Komentar terbuka untuk donatur yang donasinya sudah terkonfirmasi. Donasi dulu untuk bergabung dalam diskusi.</Alert>
      )}

      {data.comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Belum ada komentar dari donatur.</Typography>
      ) : (
        <Stack spacing={2.5}>
          {data.comments.map((c) => (
            <Stack key={c.id} direction="row" spacing={1.5} alignItems="flex-start">
              <UserAvatar name={c.author.name} src={c.author.avatarUrl} color={c.author.avatarColor} size={38} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  {c.author.username ? (
                    <Box component={RouterLink} to={`/profil/${c.author.username}`} sx={{ fontWeight: 700, fontSize: 14, color: 'text.primary', textDecoration: 'none' }}>{c.author.name}</Box>
                  ) : (
                    <Typography variant="body2" fontWeight={700}>{c.author.name}</Typography>
                  )}
                  {c.isOwner && <Chip size="small" color="primary" label="Penggalang" />}
                  {!c.isOwner && c.isDonor && <Chip size="small" variant="outlined" color="success" label="Donatur" />}
                  {c.mine && c.anonymous && <Chip size="small" variant="outlined" label="Anonim (hanya kamu yang tahu)" />}
                  {c.realName && <Chip size="small" variant="outlined" color="warning" label={`Admin: ${c.realName}`} />}
                  {c.author.createdAt && <Typography variant="caption" color="text.secondary">{joinedLabel(c.author.createdAt)}</Typography>}
                  <Typography variant="caption" color="text.secondary">· {timeAgo(c.createdAt)}</Typography>
                </Stack>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.25 }}>{c.content}</Typography>
              </Box>
              {c.mine && (
                <IconButton size="small" aria-label="Hapus komentar" onClick={async () => { if (await confirm({ title: 'Hapus komentar?', text: 'Tindakan ini tidak bisa dibatalkan.', icon: 'warning', danger: true, confirmText: 'Ya, hapus' })) del.mutate(c.id); }}><DeleteIcon fontSize="small" /></IconButton>
              )}
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
