import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '../components/ui/Txt';
import Hero from '../components/ui/Hero';
import Section from '../components/ui/Section';
import GlossCard from '../components/ui/GlossCard';
import CampaignComments from '../components/CampaignComments';
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
import CampaignProgress from '../components/CampaignProgress';
import ProjectArt from '../components/ProjectArt';
import ProjectUpdateForm from '../components/ProjectUpdateForm';
import { useAuth } from '../context/AuthContext';
import BackProjectDialog from '../components/BackProjectDialog';
import VerifiedBadge from '../components/VerifiedBadge';
import { brand } from '../theme/theme';
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
  const canPost = !!me && (String(me.id) === project.ownerId || me.role === 'ADMIN' || me.role === 'SUPERADMIN');

  const back = (rid?: string) => {
    setRewardId(rid);
    setSession((n) => n + 1);
    setBackOpen(true);
  };

  return (
    <Box>
      <Hero
        eyebrow={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/modal-usaha')} sx={{ color: '#fff', opacity: 0.85, px: 1 }}>Usaha</Button>
            {project.businessType && <Chip label={project.businessType} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />}
            {project.city && <Chip icon={<PlaceIcon sx={{ color: '#fff !important' }} />} label={project.city} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />}
            {!open && <Chip label={project.campaign.status === 'completed' ? 'Selesai' : 'Menunggu verifikasi'} size="small" color="warning" />}
          </Stack>
        }
        title={project.title}
        size="sm"
      />

      <Section overlap>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'minmax(0,8fr) minmax(0,4fr)' }, alignItems: 'start' }}>
          <Box sx={{ minWidth: 0 }}>
            <Stack spacing={3}>
              <GlossCard flush>
                <ProjectArt seed={project.id} height={200} />
                <Box sx={{ p: { xs: 3, md: 4 } }}>
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
              </GlossCard>

              {project.campaign.milestones.length > 0 && (
                <GlossCard sx={{ p: { xs: 3, md: 4 } }}>
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
                </GlossCard>
              )}

              <GlossCard sx={{ p: { xs: 3, md: 4 } }}>
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
              </GlossCard>

              <GlossCard sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>Komentar donatur</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Donatur yang donasinya terkonfirmasi bisa berkomentar dengan nama asli atau anonim.</Typography>
                <CampaignComments campaignId={project.id} />
              </GlossCard>
            </Stack>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
              <GlossCard>
                <CampaignProgress campaign={project.campaign} />
                <Button fullWidth variant="contained" color="warning" size="large" sx={{ mt: 2.5 }} disabled={!open} onClick={() => back()}>
                  {open ? 'Dukung' : 'Belum dibuka'}
                </Button>
                {guarantor && (
                  <Alert icon={<VerifiedBadge />} severity="success" sx={{ mt: 2, borderRadius: '12px' }}>
                    Dijamin oleh <b>{guarantor.name}</b>
                  </Alert>
                )}
              </GlossCard>

              {project.rewards.length > 0 && (
                <GlossCard>
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
                          p: 2.25,
                          borderRadius: '12px',
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
                </GlossCard>
              )}
            </Stack>
          </Box>
        </Box>
      </Section>

      <BackProjectDialog key={session} open={backOpen} onClose={() => setBackOpen(false)} project={project} initialRewardId={rewardId} />
    </Box>
  );
}
