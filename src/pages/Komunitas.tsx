import { useState, type ReactElement } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '../components/ui/Txt';
import Grid from '../components/ui/FlexGrid';
import Stack from '../components/ui/FlexStack';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SchoolIcon from '@mui/icons-material/School';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LandslideIcon from '@mui/icons-material/Landslide';
import GroupsIcon from '@mui/icons-material/Groups';
import ParkIcon from '@mui/icons-material/Park';
import { useCategories, useThreads } from '../lib/queries';
import ThreadCard from '../components/ThreadCard';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { useAuth } from '../context/AuthContext';
import { useCreateThreadDialog } from '../context/CreateThreadContext';

const iconMap: Record<string, ReactElement> = {
  LocationCity: <LocationCityIcon />,
  School: <SchoolIcon />,
  LocalHospital: <LocalHospitalIcon />,
  Landslide: <LandslideIcon />,
  Groups: <GroupsIcon />,
  Park: <ParkIcon />,
};

export default function Komunitas() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'aksi' | 'diskusi'>('all');
  const { data: categories = [] } = useCategories();
  const activeCategory = categories.find((c) => c.slug === slug);
  const { data: filteredThreads = [], isLoading } = useThreads({
    category: slug,
    filter: filter === 'all' ? undefined : filter,
  });
  const { user } = useAuth();
  const { openCreateThread } = useCreateThreadDialog();

  const handleCreateClick = () => {
    if (!user) {
      navigate('/masuk');
      return;
    }
    openCreateThread();
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Box sx={{ background: 'linear-gradient(180deg,#2F4F8A,#4267B2)', color: '#fff', pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.9rem', md: '2.6rem' } }}>
            {activeCategory ? activeCategory.name : 'Ruang Komunitas'}
          </Typography>
          <Typography sx={{ opacity: 0.85, mt: 1, maxWidth: 560 }}>
            {activeCategory ? activeCategory.description : 'Diskusi bebas seputar isu sosial — dan wujudkan jadi Aksi Sosial saat dibutuhkan.'}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4 }}>
        <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 2 }}>
          <Chip
            label="Semua Kategori"
            onClick={() => navigate('/komunitas')}
            color={!activeCategory ? 'primary' : 'default'}
            sx={{ fontWeight: 700, bgcolor: !activeCategory ? undefined : '#fff' }}
          />
          {categories.map((c) => (
            <Chip
              key={c.id}
              icon={iconMap[c.icon]}
              label={c.name}
              onClick={() => navigate(`/komunitas/${c.slug}`)}
              color={activeCategory?.id === c.id ? 'primary' : 'default'}
              sx={{ fontWeight: 700, bgcolor: activeCategory?.id === c.id ? undefined : '#fff' }}
            />
          ))}
        </Stack>

        {!activeCategory && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {categories.map((c, i) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={c.id}>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/komunitas/${c.slug}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <Box sx={{
                    p: 2, borderRadius: 4, textAlign: 'center', bgcolor: '#fff',
                    border: '1px solid rgba(30,95,224,0.1)', boxShadow: '0 6px 18px rgba(18,58,140,0.06)',
                  }}>
                    <Box sx={{ color: c.color, mb: 0.5 }}>{iconMap[c.icon]}</Box>
                    <Typography variant="body2" fontWeight={700} noWrap>{c.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.threadCount} thread</Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        <Tabs
          value={filter}
          onChange={(_, v) => setFilter(v)}
          sx={{ mb: 3, minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontWeight: 700 } }}
        >
          <Tab label="Semua Thread" value="all" />
          <Tab label="🎯 Aksi Sosial" value="aksi" />
          <Tab label="💬 Diskusi" value="diskusi" />
        </Tabs>

        <Stack spacing={2.5}>
          {isLoading ? (
            <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>
          ) : filteredThreads.length ? (
            filteredThreads.map((t, i) => <ThreadCard thread={t} key={t.id} index={i} />)
          ) : (
            <Card sx={{ p: 6, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 40, mb: 1 }}>💬</Typography>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>Belum ada thread untuk filter ini</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Jadilah yang pertama memulai diskusi{activeCategory ? ` di ${activeCategory.name}` : ''}.
              </Typography>
              <Button variant="contained" onClick={handleCreateClick}>Buat Thread</Button>
            </Card>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
