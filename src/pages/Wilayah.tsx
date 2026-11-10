import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceIcon from '@mui/icons-material/Place';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { useNavigate, useParams } from 'react-router-dom';
import Hero from '../components/ui/Hero';
import Section from '../components/ui/Section';
import CardGrid from '../components/ui/CardGrid';
import Stack from '../components/ui/FlexStack';
import EmptyState from '../components/EmptyState';
import ThreadCard from '../components/ThreadCard';
import ProjectCard from '../components/ProjectCard';
import { Sprout } from '../components/art/Nature';
import { kepriArea } from '../data/kepri';
import { useRegions } from '../lib/useRegions';
import NotFound from './NotFound';

/** Everything running in one Kepulauan Riau city or regency: Modal Usaha and Aksi campaigns. */
export default function Wilayah() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const name = kepriArea(id)?.name;
  const { byArea, isLoading } = useRegions();

  if (!name) return <NotFound />;
  const data = byArea[id] ?? { projects: [], threads: [] };

  return (
    <Box>
      <Hero
        size="sm"
        eyebrow={
          <Stack direction="row" spacing={1} alignItems="center">
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ color: '#fff', opacity: 0.85, px: 1 }}>Peta</Button>
            <Chip icon={<PlaceIcon sx={{ color: '#fff !important' }} />} label="Wilayah" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />
          </Stack>
        }
        title={name}
        subtitle={`${data.projects.length} usaha dan ${data.threads.length} aksi di wilayah ini.`}
      />

      {isLoading ? (
        <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>
      ) : (
        <>
          <Section overlap title="Modal usaha">
            {data.projects.length ? (
              <CardGrid cols={{ xs: 1, sm: 2, md: 3 }}>
                {data.projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
              </CardGrid>
            ) : (
              <EmptyState
                icon={<Sprout size={30} />}
                title="Belum ada usaha"
                description={`Belum ada usaha dari ${name}.`}
                action={<Button variant="contained" onClick={() => navigate('/modal-usaha')}>Ajukan</Button>}
              />
            )}
          </Section>
          <Section title="Aksi sosial">
            {data.threads.length ? (
              <CardGrid cols={{ xs: 1, md: 3 }}>
                {data.threads.map((t, i) => <ThreadCard key={t.id} thread={t} index={i} />)}
              </CardGrid>
            ) : (
              <EmptyState
                icon={<VolunteerActivismIcon />}
                title="Belum ada aksi"
                description={`Belum ada aksi dari ${name}.`}
                action={<Button variant="contained" color="warning" onClick={() => navigate('/komunitas')}>Mulai</Button>}
              />
            )}
          </Section>
        </>
      )}
    </Box>
  );
}
