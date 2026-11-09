import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '../components/ui/Txt';
import Grid from '../components/ui/FlexGrid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '../components/ui/FlexStack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PlaceIcon from '@mui/icons-material/Place';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HeroDecor from '../components/HeroDecor';
import EmptyState from '../components/EmptyState';
import CampaignProgress from '../components/CampaignProgress';
import ProjectArt from '../components/ProjectArt';
import CreateModalUsahaDialog from '../components/CreateModalUsahaDialog';
import { Sprout } from '../components/art/Nature';
import { heroBase, brand } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useModalUsahaList } from '../lib/queries';
import { userCache } from '../lib/adapters';

export default function ModalUsaha() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: projects = [], isLoading } = useModalUsahaList();
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = () => {
    if (!user) {
      navigate('/masuk');
      return;
    }
    setCreateOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      <Box sx={{ ...heroBase, pt: { xs: 6, md: 8 }, pb: { xs: 10, md: 12 } }}>
        <HeroDecor />
        <Container maxWidth="lg">
          <Chip
            icon={<Sprout size={18} />}
            label="Modal Usaha"
            sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700, mb: 2 }}
          />
          <Typography variant="h3" sx={{ fontSize: { xs: '1.9rem', md: '2.6rem' }, mb: 1.5, maxWidth: 680 }}>
            Modal Kecil, Usaha yang Bertunas
          </Typography>
          <Typography sx={{ opacity: 0.88, maxWidth: 580, mb: 3 }}>
            Dukung warga yang ingin memulai usaha sendiri. Dana ditahan di eskrow dan dicairkan bertahap sesuai milestone, dan pendukung mendapat hadiah dari pemilik usaha.
          </Typography>
          <Button variant="contained" color="warning" startIcon={<AddCircleIcon />} onClick={handleCreate}>
            Ajukan Usaha
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<Sprout size={34} />}
            color={brand.primary}
            title="Belum ada usaha yang dibuka"
            description="Jadilah yang pertama mengajukan usaha, atau kembali lagi setelah usaha pertama selesai diverifikasi."
            action={<Button variant="contained" onClick={handleCreate}>Ajukan Usaha</Button>}
          />
        ) : (
          <Grid container spacing={3}>
            {projects.map((p, i) => {
              const owner = userCache[p.ownerId];
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                    whileHover={{ y: -5 }}
                    style={{ height: '100%' }}
                  >
                    <Card sx={{ height: '100%', overflow: 'hidden' }}>
                      <CardActionArea onClick={() => navigate(`/modal-usaha/${p.id}`)} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                        <ProjectArt seed={p.id} />
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                            {p.businessType && <Chip label={p.businessType} size="small" color="primary" variant="outlined" />}
                            {p.city && <Chip icon={<PlaceIcon />} label={p.city} size="small" />}
                          </Stack>
                          <Typography variant="h6" sx={{ lineHeight: 1.25 }}>{p.title}</Typography>
                          {owner && (
                            <Typography variant="caption" color="text.secondary">oleh {owner.name}</Typography>
                          )}
                          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {p.story}
                          </Typography>
                          <Box sx={{ mt: 'auto', pt: 1 }}>
                            <CampaignProgress campaign={p.campaign} compact />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      <CreateModalUsahaDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  );
}
