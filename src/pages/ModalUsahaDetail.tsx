import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '../components/ui/Txt';
import Grid from '../components/ui/FlexGrid';
import Card from '@mui/material/Card';
import Stack from '../components/ui/FlexStack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceIcon from '@mui/icons-material/Place';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { useNavigate, useParams } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import HeroDecor from '../components/HeroDecor';
import CampaignProgress from '../components/CampaignProgress';
import ProjectArt from '../components/ProjectArt';
import ProjectUpdateForm from '../components/ProjectUpdateForm';
import { useAuth } from '../context/AuthContext';
import BackProjectDialog from '../components/BackProjectDialog';
import VerifiedBadge from '../components/VerifiedBadge';
import { heroBase, brand } from '../theme/theme';
import { formatRupiah, timeAgo } from '../data/mockData';
import { userCache } from '../lib/adapters';
import { useModalUsaha } from '../lib/queries';
import NotFound from './NotFound';

export default function ModalUsahaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const { data: project, isLoading, isError } = useModalUsaha(id);
  const [backOpen, setBackOpen] = useState(false);
  const [rewardId, setRewardId] = useState<string | undefined>();
  const [session, setSession] = useState(0);

  if (isLoading) return <Stack alignItems="center" sx={{ py: 12 }}><CircularProgress /></Stack>;
  if (isError || !project) return <NotFound />;

  const owner = userCache[project.ownerId];
  const guarantor = project.guarantorId ? userCache[project.guarantorId] : undefined;
  const open = project.campaign.status === 'active';
  const canPost = !!me && (String(me.id) === project.ownerId || me.role === 'ADMIN');

  const back = (rid?: string) => {
    setRewardId(rid);
    setSession((n) => n + 1);
    setBackOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      <Box sx={{ ...heroBase, pt: { xs: 4, md: 5 }, pb: { xs: 12, md: 14 } }}>
        <HeroDecor />
        <Container maxWidth="lg">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/modal-usaha')} sx={{ color: '#fff', opacity: 0.85, mb: 2 }}>
            Semua usaha
          </Button>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
            {project.businessType && <Chip label={project.businessType} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700 }} />}
            {project.city && <Chip icon={<PlaceIcon sx={{ color: '#fff !important' }} />} label={project.city} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700 }} />}
            {!open && <Chip label={project.campaign.status === 'completed' ? 'Selesai' : 'Menunggu verifikasi'} size="small" color="warning" />}
          </Stack>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, maxWidth: 760 }}>{project.title}</Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -8, md: -9 }, position: 'relative' }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              <Card sx={{ overflow: 'hidden' }}>
                <ProjectArt seed={project.id} height={200} />
                <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  {owner && (
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: owner.avatarColor, fontWeight: 700 }}>{owner.avatarInitial}</Avatar>
                      <Box>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography fontWeight={700} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/profil/${owner.username}`)}>{owner.name}</Typography>
                          {owner.isKsatria && <VerifiedBadge />}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">Pemilik usaha{owner.city ? ` · ${owner.city}` : ''}</Typography>
                      </Box>
                    </Stack>
                  )}
                  <Typography variant="h6" sx={{ mb: 1 }}>Cerita usaha</Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{project.story}</Typography>
                </Box>
              </Card>

              {project.campaign.milestones.length > 0 && (
                <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>Rencana pencairan dana</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Dana cair bertahap setelah tiap tahap terverifikasi.</Typography>
                  <Stack spacing={1.25}>
                    {project.campaign.milestones.map((m) => (
                      <Stack key={m.id} direction="row" spacing={1.25} alignItems="center">
                        {m.released ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon color="disabled" />}
                        <Typography sx={{ flex: 1 }}>{m.label}</Typography>
                        <Typography fontWeight={700}>{formatRupiah(m.amount)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              )}

              <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Kabar dari pemilik usaha</Typography>
                {canPost && <ProjectUpdateForm projectId={project.id} />}
                {project.updates.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Belum ada kabar. Update akan muncul di sini.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {project.updates.map((u) => (
                      <Box key={u.id} sx={{ pl: 2, borderLeft: `3px solid ${brand.primary}` }}>
                        <Typography fontWeight={700}>{u.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{timeAgo(u.date)}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{u.content}</Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2.5} sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
              <Card sx={{ p: 3 }}>
                <CampaignProgress campaign={project.campaign} />
                <Button fullWidth variant="contained" color="warning" size="large" sx={{ mt: 2.5 }} disabled={!open} onClick={() => back()}>
                  {open ? 'Dukung Usaha Ini' : 'Belum menerima dukungan'}
                </Button>
                {guarantor && (
                  <Alert icon={<VerifiedBadge />} severity="success" sx={{ mt: 2, borderRadius: 3 }}>
                    Dijamin oleh <b>{guarantor.name}</b>
                  </Alert>
                )}
              </Card>

              {project.rewards.length > 0 && (
                <Card sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <CardGiftcardIcon color="warning" />
                    <Typography variant="h6">Hadiah pendukung</Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {project.rewards.map((r) => (
                      <Box
                        key={r.id}
                        onClick={() => open && back(r.id)}
                        sx={{
                          p: 1.75,
                          borderRadius: 3,
                          border: `1.5px solid ${brand.line}`,
                          cursor: open ? 'pointer' : 'default',
                          transition: 'all .15s ease',
                          '&:hover': open ? { borderColor: brand.primary, bgcolor: alpha(brand.primary, 0.05) } : undefined,
                        }}
                      >
                        <Typography fontWeight={800} color="primary.dark">Mulai {formatRupiah(r.minAmount)}</Typography>
                        <Typography fontWeight={700} variant="body2">{r.title}</Typography>
                        {r.description && <Typography variant="body2" color="text.secondary">{r.description}</Typography>}
                        {r.stock !== null && <Chip size="small" label={`Stok ${r.stock}`} sx={{ mt: 0.75 }} />}
                      </Box>
                    ))}
                  </Stack>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <BackProjectDialog key={session} open={backOpen} onClose={() => setBackOpen(false)} project={project} initialRewardId={rewardId} />
    </Box>
  );
}
