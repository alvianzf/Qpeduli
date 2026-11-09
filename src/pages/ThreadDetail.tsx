import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SendIcon from '@mui/icons-material/Send';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentsIcon from '@mui/icons-material/Payments';
import CampaignIcon from '@mui/icons-material/Campaign';
import ForumIcon from '@mui/icons-material/Forum';
import { alpha } from '@mui/material/styles';
import Hero from '../components/ui/Hero';
import Section from '../components/ui/Section';
import GlossCard from '../components/ui/GlossCard';
import IconTile from '../components/ui/IconTile';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import VerifiedBadge from '../components/VerifiedBadge';
import CampaignProgress from '../components/CampaignProgress';
import DonateDialog from '../components/DonateDialog';
import EmptyState from '../components/EmptyState';
import { formatRupiah, timeAgo } from '../data/mockData';
import { brand } from '../theme/theme';
import { userCache as users, categoryCache } from '../lib/adapters';
import { useThread, useAddComment, apiErrorMessage } from '../lib/queries';
import { useAuth } from '../context/AuthContext';

const whiteChip = { bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' } as const;

function CardTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
      <IconTile>{icon}</IconTile>
      <Typography variant="h6">{children}</Typography>
    </Stack>
  );
}

export default function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: thread, isLoading } = useThread(id);
  const addComment = useAddComment(id || '');
  const [donateOpen, setDonateOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  if (isLoading) return <Stack alignItems="center" sx={{ py: 12 }}><CircularProgress /></Stack>;
  if (!thread) {
    return (
      <Section>
        <EmptyState icon={<ForumIcon />} title="Thread tidak ditemukan" action={<Button variant="contained" onClick={() => navigate('/komunitas')}>Ke Komunitas</Button>} />
      </Section>
    );
  }

  const author = users[thread.authorId];
  const guarantor = thread.campaign?.guarantorId ? users[thread.campaign.guarantorId] : null;
  const category = categoryCache[thread.categoryId];
  const campaign = thread.isAksiSosial ? thread.campaign : undefined;

  const send = async () => {
    if (!comment.trim()) return;
    if (!user) return navigate('/masuk');
    setCommentError('');
    try {
      await addComment.mutateAsync(comment.trim());
      setComment('');
    } catch (err) {
      setCommentError(apiErrorMessage(err, 'Gagal mengirim komentar.'));
    }
  };

  return (
    <Box>
      <Hero
        size="sm"
        eyebrow={
          <Stack spacing={2} alignItems="flex-start">
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: '#fff', px: 0 }}>Kembali</Button>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {category && <Chip label={category.name} size="small" sx={whiteChip} />}
              {thread.isAksiSosial && <Chip icon={<VolunteerActivismIcon sx={{ color: '#fff !important' }} />} label="Aksi Sosial" size="small" sx={whiteChip} />}
            </Stack>
          </Stack>
        }
        title={thread.title}
      />

      <Section overlap>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) 340px' }, alignItems: 'start' }}>
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <GlossCard sx={{ p: { xs: 3, md: 4 } }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: author?.avatarColor, width: 48, height: 48, fontWeight: 700 }}>{author?.avatarInitial}</Avatar>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography fontWeight={700}>{author?.name}</Typography>
                    {author?.isKsatria && <VerifiedBadge />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {[author?.city, timeAgo(thread.createdAt), `${thread.views.toLocaleString('id-ID')} dilihat`].filter(Boolean).join(' · ')}
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.75 }}>{thread.content}</Typography>
            </GlossCard>

            {campaign && (
              <GlossCard sx={{ p: { xs: 3, md: 4 } }}>
                <CardTitle icon={<PaymentsIcon />}>Pencairan bertahap</CardTitle>
                {campaign.milestones.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Belum ada tahapan pencairan.</Typography>
                ) : (
                  <Stack spacing={2.5}>
                    {campaign.milestones.map((m) => (
                      <Stack key={m.id} direction="row" spacing={2} alignItems="center">
                        {m.released ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon sx={{ color: 'text.disabled' }} />}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700}>{m.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatRupiah(m.amount)}</Typography>
                        </Box>
                        <Chip label={m.released ? 'Cair' : 'Menunggu'} size="small" color={m.released ? 'success' : 'default'} variant={m.released ? 'filled' : 'outlined'} />
                      </Stack>
                    ))}
                  </Stack>
                )}
                <Divider sx={{ my: 3 }} />
                <Typography variant="caption" color="text.secondary">
                  Dana cair per tahap setelah diverifikasi admin{guarantor ? ` dan dijamin ${guarantor.name}` : ''}.
                </Typography>
              </GlossCard>
            )}

            {thread.updates.length > 0 && (
              <GlossCard sx={{ p: { xs: 3, md: 4 } }}>
                <CardTitle icon={<CampaignIcon />}>Kabar terbaru</CardTitle>
                <Stack spacing={3}>
                  {thread.updates.map((u) => (
                    <Box key={u.id} sx={{ pl: 2.5, borderLeft: `3px solid ${brand.primary}` }}>
                      <Typography fontWeight={700}>{u.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{timeAgo(u.date)}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>{u.content}</Typography>
                    </Box>
                  ))}
                </Stack>
              </GlossCard>
            )}

            <GlossCard sx={{ p: { xs: 3, md: 4 } }}>
              <CardTitle icon={<ForumIcon />}>Diskusi ({thread.comments.length})</CardTitle>
              {commentError && <Typography variant="body2" color="error" sx={{ mb: 2 }}>{commentError}</Typography>}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                <Avatar sx={{ bgcolor: user?.avatarColor || '#94A3B8', width: 40, height: 40, fontWeight: 700 }}>{user ? user.name.charAt(0).toUpperCase() : '?'}</Avatar>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={user ? 'Tulis komentar...' : 'Masuk untuk berkomentar'}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  onFocus={() => !user && navigate('/masuk')}
                />
                <IconButton color="primary" aria-label="Kirim" onClick={send} disabled={addComment.isPending}><SendIcon /></IconButton>
              </Stack>
              <Stack spacing={3} divider={<Divider />}>
                {thread.comments.map((c) => {
                  const u = users[c.authorId];
                  return (
                    <Stack direction="row" spacing={2} key={c.id} alignItems="flex-start">
                      <Avatar sx={{ bgcolor: u?.avatarColor, width: 40, height: 40, fontWeight: 700 }}>{u?.avatarInitial}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography variant="body2" fontWeight={700}>{u?.name}</Typography>
                          {u?.isKsatria && <VerifiedBadge size={14} />}
                          {c.isDonor && <Chip label="Donatur" size="small" color="primary" />}
                          <Typography variant="caption" color="text.secondary">{timeAgo(c.date)}</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 0.75 }}>{c.content}</Typography>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            </GlossCard>
          </Stack>

          <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: { md: 100 }, minWidth: 0 }}>
            {campaign && (
              <GlossCard sx={{ gap: 3 }}>
                <CampaignProgress campaign={campaign} />
                <Button fullWidth size="large" variant="contained" color="warning" startIcon={<VolunteerActivismIcon />} onClick={() => setDonateOpen(true)} disabled={campaign.status === 'completed'}>
                  {campaign.status === 'completed' ? 'Target tercapai' : 'Donasi'}
                </Button>
                {campaign.status === 'pending-verification' && (
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(brand.cta, 0.08) }}>
                    <ShieldIcon sx={{ fontSize: 18, color: 'warning.dark' }} />
                    <Typography variant="caption" fontWeight={700} color="warning.dark">Menunggu penjamin</Typography>
                  </Stack>
                )}
              </GlossCard>
            )}
            {guarantor && (
              <GlossCard sx={{ gap: 2 }}>
                <Typography variant="subtitle2">Dijamin oleh</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: guarantor.avatarColor, fontWeight: 700 }}>{guarantor.avatarInitial}</Avatar>
                  <Box>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Typography variant="body2" fontWeight={700}>{guarantor.name}</Typography>
                      <VerifiedBadge size={14} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{guarantor.karma.toLocaleString('id-ID')} poin</Typography>
                  </Box>
                </Stack>
              </GlossCard>
            )}
            {author && (
              <GlossCard sx={{ gap: 2 }}>
                <Typography variant="subtitle2">Pembuat thread</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: author.avatarColor, fontWeight: 700 }}>{author.avatarInitial}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{author.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Bergabung {new Date(author.joinedAt).getFullYear()}</Typography>
                  </Box>
                </Stack>
                {author.badges.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {author.badges.map((b) => <Chip key={b} label={b} size="small" variant="outlined" />)}
                  </Stack>
                )}
              </GlossCard>
            )}
          </Stack>
        </Box>
      </Section>

      <DonateDialog open={donateOpen} onClose={() => setDonateOpen(false)} thread={thread} />
    </Box>
  );
}
