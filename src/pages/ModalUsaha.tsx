import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/ui/Hero';
import Section from '../components/ui/Section';
import CardGrid from '../components/ui/CardGrid';
import Stack from '../components/ui/FlexStack';
import EmptyState from '../components/EmptyState';
import ProjectCard from '../components/ProjectCard';
import CreateModalUsahaDialog from '../components/CreateModalUsahaDialog';
import { Sprout } from '../components/art/Nature';
import { brand } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useModalUsahaList } from '../lib/queries';

export default function ModalUsaha() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: projects = [], isLoading } = useModalUsahaList();
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = () => {
    if (!user) return navigate('/masuk');
    setCreateOpen(true);
  };

  return (
    <Box>
      <Hero
        eyebrow={<Chip icon={<Sprout size={18} />} label="Modal Usaha" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />}
        title="Modal Kecil, Usaha Bertunas"
        subtitle="Dukung warga memulai usahanya. Dana cair bertahap sesuai milestone, pendukung dapat hadiah."
        actions={<Button variant="contained" color="warning" startIcon={<AddCircleIcon />} onClick={handleCreate}>Ajukan</Button>}
      />
      <Section overlap>
        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<Sprout size={34} />}
            color={brand.primary}
            title="Belum ada usaha"
            description="Jadilah yang pertama mengajukan usaha."
            action={<Button variant="contained" onClick={handleCreate}>Ajukan</Button>}
          />
        ) : (
          <CardGrid cols={{ xs: 1, md: 2 }}>
            {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </CardGrid>
        )}
      </Section>
      <CreateModalUsahaDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  );
}
