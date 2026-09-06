import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '../components/ui/FlexGrid';
import Typography from '../components/ui/Txt';
import Stack from '../components/ui/FlexStack';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { motion } from 'framer-motion';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { threads, users, currentUser, formatRupiah, timeAgo, categories } from '../data/mockData';
import VerifiedBadge from '../components/VerifiedBadge';
import CampaignProgress from '../components/CampaignProgress';
import DonateDialog from '../components/DonateDialog';

export default function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const thread = threads.find((t) => t.id === id);
  const [donateOpen, setDonateOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [localComments, setLocalComments] = useState(thread?.comments ?? []);

  if (!thread) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={800}>Thread tidak ditemukan</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/komunitas')}>Kembali ke Komunitas</Button>
      </Container>
    );
  }

  const author = users[thread.authorId];
  const guarantor = thread.campaign?.guarantorId ? users[thread.campaign.guarantorId] : null;
  const category = categories.find((c) => c.id === thread.categoryId);

  const handleSendComment = () => {
    if (!comment.trim()) return;
    setLocalComments((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, authorId: currentUser.id, date: new Date().toISOString(), content: comment.trim() },
    ]);
    setComment('');
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      <Box sx={{ background: 'linear-gradient(180deg,#123A8C,#1E5FE0)', pt: { xs: 4, md: 5 }, pb: { xs: 12, md: 14 } }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ color: '#fff', opacity: 0.85, mb: 2 }}
          >
            Kembali
          </Button>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
            {category && <Chip label={category.name} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700 }} />}
            {thread.isAksiSosial && (
              <Chip
                icon={<VolunteerActivismIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} />}
                label="Aksi Sosial"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 700 }}
              />
            )}
          </Stack>
          <Typography variant="h4" color="#fff" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', md: '2.1rem' }, maxWidth: 800 }}>
            {thread.title}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -8, md: -9 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: author.avatarColor, width: 46, height: 46, fontWeight: 700 }}>{author.avatarInitial}</Avatar>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography fontWeight={800}>{author.name}</Typography>
                      {author.isKsatria && <VerifiedBadge />}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {author.city} · {timeAgo(thread.createdAt)} · {thread.views.toLocaleString('id-ID')} dilihat
                    </Typography>
                  </Box>
                </Stack>
                <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.75 }}>{thread.content}</Typography>
              </Card>
            </motion.div>

            {thread.isAksiSosial && thread.campaign && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>📋 Progres Pencairan Dana Bertahap</Typography>
                  <Stack spacing={1.5}>
                    {thread.campaign.milestones.map((m) => (
                      <Stack key={m.id} direction="row" spacing={1.5} alignItems="center">
                        {m.released ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ color: 'text.disabled' }} />
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ textDecoration: m.released ? 'none' : 'none' }}>
                            {m.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{formatRupiah(m.amount)}</Typography>
                        </Box>
                        <Chip
                          label={m.released ? 'Sudah Cair' : 'Menunggu Verifikasi'}
                          size="small"
                          color={m.released ? 'success' : 'default'}
                          variant={m.released ? 'filled' : 'outlined'}
                        />
                      </Stack>
                    ))}
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary">
                    Dana dicairkan bertahap setelah verifikasi komunitas & admin platform{guarantor ? `, dijamin oleh ${guarantor.name} (Ksatria Komunitas)` : ''}.
                  </Typography>
                </Card>
              </motion.div>
            )}

            {thread.updates.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
                <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>📢 Update Transparansi</Typography>
                  <Stack spacing={2.5}>
                    {thread.updates.map((u) => (
                      <Box key={u.id} sx={{ pl: 2, borderLeft: '3px solid #1E5FE0' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {u.imageEmoji && <Typography>{u.imageEmoji}</Typography>}
                          <Typography fontWeight={700}>{u.title}</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">{timeAgo(u.date)}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{u.content}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </motion.div>
            )}

            <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                💬 Diskusi & Komentar ({localComments.length})
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: currentUser.avatarColor, width: 38, height: 38, fontWeight: 700, fontSize: 14 }}>
                  {currentUser.avatarInitial}
                </Avatar>
                <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Tulis komentar, pertanyaan, atau dukungan..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  />
                  <IconButton color="primary" onClick={handleSendComment}><SendIcon /></IconButton>
                </Stack>
              </Stack>
              <Stack spacing={2.5} divider={<Divider />}>
                {localComments.map((c) => {
                  const u = users[c.authorId];
                  return (
                    <Stack direction="row" spacing={1.5} key={c.id} sx={{ display: 'flex' }}>
                      <Avatar sx={{ bgcolor: u?.avatarColor, width: 38, height: 38, fontWeight: 700, fontSize: 14, mr: 1.5 }}>
                        {u?.avatarInitial}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="body2" fontWeight={700}>{u?.name}</Typography>
                          {u?.isKsatria && <VerifiedBadge size={14} />}
                          {c.isDonor && <Chip label="Donatur" size="small" color="primary" sx={{ height: 18, fontSize: 10 }} />}
                          <Typography variant="caption" color="text.secondary">· {timeAgo(c.date)}</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{c.content}</Typography>
                        {c.karmaGiven && (
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                            <ThumbUpAltOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.disabled">+{c.karmaGiven} Poin Kebaikan</Typography>
                          </Stack>
                        )}
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: 'sticky', top: 90 }}>
              {thread.isAksiSosial && thread.campaign && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                  <Card sx={{ p: 3, mb: 2.5 }}>
                    <CampaignProgress campaign={thread.campaign} />
                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      startIcon={<VolunteerActivismIcon />}
                      sx={{ mt: 2.5 }}
                      onClick={() => setDonateOpen(true)}
                      disabled={thread.campaign.status === 'completed'}
                    >
                      {thread.campaign.status === 'completed' ? 'Target Tercapai 🎉' : 'Donasi Sekarang'}
                    </Button>
                    {thread.campaign.status === 'pending-verification' && (
                      <Chip
                        icon={<ShieldIcon sx={{ fontSize: '14px !important' }} />}
                        label="Menunggu Guarantor Ksatria Komunitas"
                        size="small"
                        color="warning"
                        sx={{ mt: 1.5, width: '100%' }}
                      />
                    )}
                  </Card>
                </motion.div>
              )}

              {guarantor && (
                <Card sx={{ p: 3, mb: 2.5 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>🛡️ Dijamin Oleh</Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: guarantor.avatarColor, fontWeight: 700 }}>{guarantor.avatarInitial}</Avatar>
                    <Box>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="body2" fontWeight={700}>{guarantor.name}</Typography>
                        <VerifiedBadge size={14} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">{guarantor.karma.toLocaleString('id-ID')} Poin Kebaikan</Typography>
                    </Box>
                  </Stack>
                </Card>
              )}

              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>Tentang Pembuat Thread</Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: author.avatarColor, fontWeight: 700 }}>{author.avatarInitial}</Avatar>
                  <Box>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2" fontWeight={700}>{author.name}</Typography>
                      {author.isKsatria && <VerifiedBadge size={14} />}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">Bergabung {new Date(author.joinedAt).getFullYear()}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {author.badges.map((b) => (
                    <Chip key={b} label={b} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <DonateDialog open={donateOpen} onClose={() => setDonateOpen(false)} thread={thread} />
    </Box>
  );
}
