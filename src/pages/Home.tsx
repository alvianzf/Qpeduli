import type { ReactElement } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '../components/ui/Txt';
import Button from '@mui/material/Button';
import Stack from '../components/ui/FlexStack';
import Grid from '../components/ui/FlexGrid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ForumIcon from '@mui/icons-material/Forum';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import VerifiedIcon from '@mui/icons-material/Verified';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SchoolIcon from '@mui/icons-material/School';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LandslideIcon from '@mui/icons-material/Landslide';
import GroupsIcon from '@mui/icons-material/Groups';
import ParkIcon from '@mui/icons-material/Park';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { heroGradient } from '../theme/theme';
import { formatRupiah } from '../data/mockData';
import { useCategories, useThreads, useFjbItems, useStats } from '../lib/queries';
import ThreadCard from '../components/ThreadCard';
import CampaignProgress from '../components/CampaignProgress';

const iconMap: Record<string, ReactElement> = {
  LocationCity: <LocationCityIcon />,
  School: <SchoolIcon />,
  LocalHospital: <LocalHospitalIcon />,
  Landslide: <LandslideIcon />,
  Groups: <GroupsIcon />,
  Park: <ParkIcon />,
};


const steps = [
  {
    icon: <ForumIcon fontSize="large" />,
    title: '1. Diskusi di Komunitas',
    desc: 'Bagikan cerita, isu, atau masalah sosial di ruang diskusi regional, pendidikan, kesehatan, dan lainnya.',
  },
  {
    icon: <VolunteerActivismIcon fontSize="large" />,
    title: '2. Naikkan Jadi Aksi Sosial',
    desc: 'Jika butuh solusi dana, ubah thread menjadi kampanye lengkap dengan target & tombol donasi.',
  },
  {
    icon: <VerifiedIcon fontSize="large" />,
    title: '3. Dikawal Komunitas',
    desc: 'Ksatria Komunitas bisa jadi penjamin, donatur ikut mengawasi lewat update & diskusi transparan.',
  },
  {
    icon: <StorefrontIcon fontSize="large" />,
    title: '4. Aksi Nyata Terukur',
    desc: 'Dana cair bertahap sesuai progres, hasil FJB Amal pun bisa ikut disalurkan ke kampanye pilihan.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { data: threads = [] } = useThreads({ filter: 'aksi' });
  const { data: fjbItems = [] } = useFjbItems();
  const { data: stats } = useStats();
  const featured = threads.filter((t) => t.campaign?.status !== 'completed').slice(0, 3);

  const statCards = [
    { label: 'Total Dana Tersalurkan', value: formatRupiah(stats?.totalDisbursed ?? 0) },
    { label: 'Aksi Sosial Aktif', value: String(stats?.activeCampaigns ?? 0) },
    { label: 'Anggota Komunitas', value: (stats?.totalUsers ?? 0).toLocaleString('id-ID') },
    { label: 'Kota Terjangkau', value: String(stats?.citiesReached ?? 0) },
  ];

  return (
    <Box>
      {/* HERO */}
      <Box
        sx={{
          position: 'relative',
          background: heroGradient,
          color: '#fff',
          pt: { xs: 10, md: 14 },
          pb: { xs: 16, md: 20 },
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.10) 0, transparent 45%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Chip
                  label="Community-Driven Crowdfunding"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, mb: 2.5, backdropFilter: 'blur(6px)' }}
                />
                <Typography variant="h2" sx={{ fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.4rem' }, mb: 2, lineHeight: 1.15 }}>
                  Dari Diskusi,<br /> Menjadi Aksi.
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.88, fontWeight: 400, mb: 4, maxWidth: 520 }}>
                  Ruang diskusi komunitas yang mengubah simpati menjadi bantuan nyata dan terukur — bukan cuma komentar, tapi aksi.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    size="large"
                    variant="contained"
                    onClick={() => navigate('/komunitas')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ bgcolor: '#fff', color: 'primary.dark', '&:hover': { bgcolor: '#EAF1FF' }, backgroundImage: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}
                  >
                    Jelajahi Komunitas
                  </Button>
                  <Button
                    size="large"
                    variant="outlined"
                    onClick={() => navigate('/keamanan')}
                    sx={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}
                  >
                    Cara Kerja & Keamanan Dana
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                {featured[0] && (
                  <Card
                    sx={{
                      backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(255,255,255,0.75))',
                      p: 0.5,
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Chip icon={<VolunteerActivismIcon sx={{ fontSize: '14px !important' }} />} label="Aksi Sosial Terhangat" color="primary" size="small" sx={{ mb: 1.5 }} />
                      <Typography fontWeight={800} sx={{ mb: 1.5, color: 'text.primary' }}>
                        {featured[0].title}
                      </Typography>
                      {featured[0].campaign && <CampaignProgress campaign={featured[0].campaign} />}
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/thread/${featured[0].id}`)}
                      >
                        Lihat & Donasi
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* STATS */}
      <Container maxWidth="lg" sx={{ mt: { xs: -9, md: -11 }, position: 'relative', zIndex: 2 }}>
        <Card sx={{ p: { xs: 2.5, md: 4 } }}>
          <Grid container spacing={2}>
            {statCards.map((s, i) => (
              <Grid size={{ xs: 6, md: 3 }} key={s.label}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Typography variant="h4" fontWeight={800} color="primary.dark" textAlign={{ xs: 'left', md: 'center' }}>
                    {s.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign={{ xs: 'left', md: 'center' }}>
                    {s.label}
                  </Typography>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Container>

      {/* HOW IT WORKS */}
      <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 12 } }}>
        <Stack alignItems="center" textAlign="center" spacing={1.5} sx={{ mb: 5 }}>
          <Typography variant="h4" fontWeight={800}>Bagaimana Qpeduli Bekerja?</Typography>
          <Typography color="text.secondary" maxWidth={560}>
            Empat langkah sederhana untuk mengubah kepedulian menjadi dampak nyata bersama komunitas.
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {steps.map((s, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.title}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ color: 'primary.main', mb: 1.5 }}>{s.icon}</Box>
                  <Typography fontWeight={800} sx={{ mb: 1 }}>{s.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FEATURED CAMPAIGNS */}
      <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 12 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Aksi Sosial Pilihan</Typography>
            <Typography color="text.secondary">Kampanye yang sedang butuh dukunganmu sekarang</Typography>
          </Box>
          <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/komunitas')} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            Lihat Semua
          </Button>
        </Stack>
        <Stack spacing={2.5}>
          {featured.map((t, i) => (
            <ThreadCard thread={t} key={t.id} index={i} />
          ))}
        </Stack>
      </Container>

      {/* CATEGORIES */}
      <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 12 } }}>
        <Stack alignItems="center" textAlign="center" spacing={1.5} sx={{ mb: 5 }}>
          <Typography variant="h4" fontWeight={800}>Ruang Komunitas</Typography>
          <Typography color="text.secondary" maxWidth={560}>
            Diskusi bebas layaknya forum, dari isu regional hingga hobi — sambil membuka peluang aksi sosial.
          </Typography>
        </Stack>
        <Grid container spacing={2.5}>
          {categories.map((c, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardActionArea onClick={() => navigate(`/komunitas/${c.slug}`)} sx={{ height: '100%', p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{
                        width: 52, height: 52, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: `${c.color}1A`, color: c.color, flexShrink: 0,
                      }}>
                        {iconMap[c.icon]}
                      </Box>
                      <Box>
                        <Typography fontWeight={800}>{c.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{c.description}</Typography>
                        <Chip label={`${c.threadCount} thread`} size="small" />
                      </Box>
                    </Stack>
                  </CardActionArea>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FJB PREVIEW */}
      <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 12 } }}>
        <Card sx={{ p: { xs: 3, md: 5 }, backgroundImage: 'linear-gradient(135deg, rgba(30,95,224,0.08), rgba(96,165,250,0.12))' }}>
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip icon={<StorefrontIcon sx={{ fontSize: '14px !important' }} />} label="FJB Amal" color="primary" size="small" sx={{ mb: 1.5 }} />
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1.5 }}>Jual Barang Preloved, Salurkan Jadi Donasi</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Jual barang atau jasa di Forum Jual Beli Amal — hasil penjualan otomatis masuk ke dompet kampanye sosial pilihanmu.
              </Typography>
              <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/fjb')}>
                Buka FJB Amal
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={2}>
                {fjbItems.slice(0, 4).map((item) => (
                  <Grid size={6} key={item.id}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="h4" sx={{ mb: 1 }}>{item.emoji}</Typography>
                      <Typography variant="body2" fontWeight={700} noWrap>{item.title}</Typography>
                      <Typography variant="caption" color="primary.dark" fontWeight={800}>{formatRupiah(item.price)}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Container>

      {/* CTA */}
      <Container maxWidth="lg" sx={{ my: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            borderRadius: 6,
            p: { xs: 4, md: 7 },
            textAlign: 'center',
            color: '#fff',
            background: heroGradient,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1.5 }}>Siap mengubah kepedulianmu jadi aksi?</Typography>
          <Typography sx={{ opacity: 0.85, mb: 3.5, maxWidth: 520, mx: 'auto' }}>
            Gabung sekarang, mulai diskusi, dan bantu wujudkan aksi sosial pertamamu bersama ribuan anggota komunitas Qpeduli.
          </Typography>
          <Button
            size="large"
            variant="contained"
            onClick={() => navigate('/daftar')}
            sx={{ bgcolor: '#fff', color: 'primary.dark', '&:hover': { bgcolor: '#EAF1FF' }, backgroundImage: 'none' }}
          >
            Daftar Gratis
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
