import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ForumIcon from '@mui/icons-material/Forum';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate, useParams } from 'react-router-dom';
import Hero from '../components/ui/Hero';
import Section from '../components/ui/Section';
import CardGrid from '../components/ui/CardGrid';
import GlossCard from '../components/ui/GlossCard';
import IconTile from '../components/ui/IconTile';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import EmptyState from '../components/EmptyState';
import ThreadCard from '../components/ThreadCard';
import { categoryIcon } from '../components/categoryIcons';
import { useCategories, useThreads } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { useCreateThreadDialog } from '../context/CreateThreadContext';

export default function Komunitas() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openCreateThread } = useCreateThreadDialog();
  const [filter, setFilter] = useState<'all' | 'aksi' | 'diskusi'>('all');
  const { data: categories = [] } = useCategories();
  const active = categories.find((c) => c.slug === slug);
  const { data: threads = [], isLoading } = useThreads({ category: slug, filter: filter === 'all' ? undefined : filter });

  const create = () => (user ? openCreateThread() : navigate('/masuk'));

  return (
    <Box>
      <Hero
        size="md"
        title={active ? active.name : 'Ruang Komunitas'}
        subtitle={active ? active.description : 'Diskusi bebas, dan jadikan aksi saat dibutuhkan.'}
        actions={<Button variant="contained" color="warning" startIcon={<AddCircleIcon />} onClick={create}>Buat Thread</Button>}
      />

      <Section overlap>
        <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 3 }}>
          <Chip label="Semua" onClick={() => navigate('/komunitas')} color={!active ? 'primary' : 'default'} sx={{ bgcolor: active ? '#fff' : undefined }} />
          {categories.map((c) => (
            <Chip
              key={c.id}
              icon={categoryIcon(c.icon)}
              label={c.name}
              onClick={() => navigate(`/komunitas/${c.slug}`)}
              color={active?.id === c.id ? 'primary' : 'default'}
              sx={{ bgcolor: active?.id === c.id ? undefined : '#fff' }}
            />
          ))}
        </Stack>

        {!active && (
          <Box sx={{ mb: 4 }}>
            <CardGrid cols={{ xs: 2, sm: 3, md: 6 }}>
              {categories.map((c, i) => (
                <GlossCard key={c.id} delay={i * 0.04} onClick={() => navigate(`/komunitas/${c.slug}`)} sx={{ p: 2.5, alignItems: 'center', textAlign: 'center', gap: 1.5 }}>
                  <IconTile color={c.color}>{categoryIcon(c.icon)}</IconTile>
                  <Typography variant="body2" fontWeight={700}>{c.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>{c.threadCount} thread</Typography>
                </GlossCard>
              ))}
            </CardGrid>
          </Box>
        )}

        <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ mb: 3 }}>
          <Tab label="Semua" value="all" />
          <Tab value="aksi" label={<Stack direction="row" spacing={1} alignItems="center"><VolunteerActivismIcon fontSize="small" /><span>Aksi</span></Stack>} />
          <Tab value="diskusi" label={<Stack direction="row" spacing={1} alignItems="center"><ForumIcon fontSize="small" /><span>Diskusi</span></Stack>} />
        </Tabs>

        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>
        ) : threads.length ? (
          <Stack spacing={3}>{threads.map((t, i) => <ThreadCard thread={t} key={t.id} index={i} />)}</Stack>
        ) : (
          <EmptyState
            icon={<ForumIcon />}
            title="Belum ada thread"
            description={`Jadilah yang pertama memulai diskusi${active ? ` di ${active.name}` : ''}.`}
            action={<Button variant="contained" onClick={create}>Buat Thread</Button>}
          />
        )}
      </Section>
    </Box>
  );
}
