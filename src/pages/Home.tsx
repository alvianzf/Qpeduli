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
import { heroBase, brand } from '../theme/theme';
import HeroDecor from '../components/HeroDecor';
import { Sprout, HandHeart, Tree } from '../components/art/Nature';
import { useModalUsahaList } from '../lib/queries';
import EmptyState from '../components/EmptyState';
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
    title: '1. Diskusi',
    desc: 'Bagikan cerita, isu, atau masalah sosial di ruang diskusi regional, pendidikan, kesehatan, dan lainnya.',
  },
  {
    icon: <VolunteerActivismIcon fontSize="large" />,
    title: '2. Jadi Aksi',
    desc: 'Jika butuh solusi dana, ubah thread menjadi kampanye lengkap dengan target & tombol donasi.',
  },
  {
    icon: <VerifiedIcon fontSize="large" />,
    title: '3. Dikawal',
    desc: 'Ksatria Komunitas bisa jadi penjamin, donatur ikut mengawasi lewat update & diskusi transparan.',
  },
  {
    icon: <StorefrontIcon fontSize="large" />,
    title: '4. Nyata',
    desc: 'Dana cair bertahap sesuai progres, hasil FJB Amal pun bisa ikut disalurkan ke kampanye pilihan.',
  },
];

function ModalUsahaPreview() {
  const navigate = useNavigate();
  const { data: projects = [] } = useModalUsahaList();
  const top = projects.slice(0, 3);
  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 12 } }}>
      <Card sx={{ p: { xs: 3, md: 5 }, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(90,126,196,0.16), rgba(246,196,83,0.22))' }}>
        <Box className="float-slow" sx={{ position: 'absolute', right: { xs: -20, md: 40 }, bottom: -10, opacity: { xs: 0.25, md: 1 }, pointerEvents: 'none' }}>
          <Tree size={150} />
        </Box>
        <Chip icon={<Sprout size={18} />} label="Modal Usaha" color="primary" size="small" sx={{ mb: 1.5 }} />
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5, maxWidth: 560 }}>Bantu Usaha Kecil Bertunas</Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 560 }}>
          Warung, tani, kerajinan — modal kecil dari banyak orang bisa membuka jalan mandiri. Danai usahanya, dapatkan hadiah dari pemiliknya, dan pantau tumbuhnya.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ position: 'relative' }}>
          <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/modal-usaha')}>
            {top.length ? `${projects.length} Usaha` : 'Lihat Usaha'}
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}

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
          ...heroBase,
          pt: { xs: 10, md: 14 },
          pb: { xs: 16, md: 20 },
        }}
      >
        <HeroDecor />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Chip
                  label="Tumbuh Bersama, Berbagi Bersama"
                  sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', fontWeight: 700, mb: 2.5 }}
                />
                <Typography variant="h2" sx={{ fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.4rem' }, mb: 2, lineHeight: 1.15 }}>
                  Dari Diskusi,<br /> Tumbuh Jadi Aksi.
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.88, fontWeight: 400, mb: 4, maxWidth: 520 }}>
                  Ruang diskusi komunitas yang menanam benih kebaikan — dari bantuan darurat hingga modal usaha bagi mereka yang ingin bangkit dengan kakinya sendiri.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap>
                  <Button
                    size="large"
                    variant="contained"
                    onClick={() => navigate('/komunitas')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ bgcolor: '#fff', color: 'primary.dark', '&:hover': { bgcolor: '#DBEAFE' }, backgroundImage: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                  >
                    Komunitas
                  </Button>
                  <Button
                    size="large"
                    variant="contained"
                    color="warning"
                    onClick={() => navigate('/modal-usaha')}
                  >
                    Danai Usaha
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
                {!featured[0] && (
                  <Box className="float-slow" sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                    <HandHeart size={220} />
                  </Box>
                )}
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
                        Donasi
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
      <Container maxWidth="lg" sx={{ mt: { xs: -9, md: -11 }, position: 'relative', zIndex: 1 }}>
        <Card sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3}>
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
            Semua
          </Button>
        </Stack>
        {featured.length > 0 ? (
          <Stack spacing={2.5}>
            {featured.map((t, i) => (
              <ThreadCard thread={t} key={t.id} index={i} />
            ))}
          </Stack>
        ) : (
          <EmptyState
            icon={<VolunteerActivismIcon fontSize="large" />}
            color={brand.cta}
            title="Belum ada Aksi Sosial aktif"
            description="Jadilah yang pertama mengubah diskusi menjadi aksi nyata."
            action={
              <Button variant="contained" color="warning" onClick={() => navigate('/komunitas')}>
                Mulai Diskusi
              </Button>
            }
          />
        )}
      </Container>

      {/* MODAL USAHA */}
      <ModalUsahaPreview />

      {/* CATEGORIES */}
      <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 12 } }}>
        <Stack alignItems="center" textAlign="center" spacing={1.5} sx={{ mb: 5 }}>
          <Typography variant="h4" fontWeight={800}>Ruang Komunitas</Typography>
          <Typography color="text.secondary" maxWidth={560}>
            Diskusi bebas layaknya forum, dari isu regional hingga hobi — sambil membuka peluang aksi sosial.
          </Typography>
        </Stack>
        <Grid container spacing={3}>
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
                  <CardActionArea onClick={() => navigate(`/komunitas/${c.slug}`)} sx={{ height: '100%', p: 3, alignItems: 'stretch', display: 'flex' }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1 }}>
                      <Box sx={{
                        width: 52, height: 52, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: `${c.color}1A`, color: c.color, flexShrink: 0,
                      }}>
                        {iconMap[c.icon]}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch', flex: 1 }}>
                        <Typography fontWeight={800}>{c.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{c.description}</Typography>
                        <Chip label={`${c.threadCount} thread`} size="small" sx={{ mt: 'auto', alignSelf: 'flex-start' }} />
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
        <Card sx={{ p: { xs: 3, md: 5 }, backgroundImage: 'linear-gradient(135deg, rgba(66,103,178,0.08), rgba(246,196,83,0.16))' }}>
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip icon={<StorefrontIcon sx={{ fontSize: '14px !important' }} />} label="FJB Amal" color="primary" size="small" sx={{ mb: 1.5 }} />
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1.5 }}>Jual Barang Preloved, Salurkan Jadi Donasi</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Jual barang atau jasa di Forum Jual Beli Amal — hasil penjualan otomatis masuk ke dompet kampanye sosial pilihanmu.
              </Typography>
              <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/fjb')}>
                Buka FJB
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {fjbItems.length > 0 ? (
                <Grid container spacing={3}>
                  {fjbItems.slice(0, 4).map((item) => (
                    <Grid size={6} key={item.id}>
                      <Card sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h4" sx={{ mb: 1 }}>{item.emoji}</Typography>
                        <Typography variant="body2" fontWeight={700} noWrap>{item.title}</Typography>
                        <Typography variant="caption" color="primary.dark" fontWeight={800}>{formatRupiah(item.price)}</Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <EmptyState
                  icon={<StorefrontIcon fontSize="large" />}
                  title="Belum ada yang dijual"
                  description="Jadilah penjual pertama di FJB Amal."
                />
              )}
            </Grid>
          </Grid>
        </Card>
      </Container>

      {/* CTA */}
      <Container maxWidth="lg" sx={{ my: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            borderRadius: '24px',
            p: { xs: 4, md: 7 },
            textAlign: 'center',
            color: '#fff',
            ...heroBase,
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
            sx={{ bgcolor: '#fff', color: 'primary.dark', '&:hover': { bgcolor: '#DBEAFE' }, backgroundImage: 'none' }}
          >
            Daftar
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
