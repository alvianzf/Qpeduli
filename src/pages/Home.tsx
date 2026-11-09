import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ForumIcon from '@mui/icons-material/Forum';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import VerifiedIcon from '@mui/icons-material/Verified';
import PaymentsIcon from '@mui/icons-material/Payments';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/ui/Hero';
import Section from '../components/ui/Section';
import CardGrid from '../components/ui/CardGrid';
import GlossCard from '../components/ui/GlossCard';
import IconTile from '../components/ui/IconTile';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import EmptyState from '../components/EmptyState';
import ThreadCard from '../components/ThreadCard';
import ProjectCard from '../components/ProjectCard';
import CampaignProgress from '../components/CampaignProgress';
import { HandHeart, Sprout } from '../components/art/Nature';
import { categoryIcon } from '../components/categoryIcons';
import { formatRupiah } from '../data/mockData';
import { brand } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useCategories, useThreads, useFjbItems, useStats, useModalUsahaList } from '../lib/queries';

const steps = [
  { icon: <ForumIcon />, title: 'Diskusi', desc: 'Ceritakan masalah atau ide di ruang komunitas.' },
  { icon: <VolunteerActivismIcon />, title: 'Jadi Aksi', desc: 'Butuh dana? Ubah thread jadi kampanye dengan target dan batas waktu.' },
  { icon: <VerifiedIcon />, title: 'Dikawal', desc: 'Ksatria Komunitas menjamin, donatur ikut memantau.' },
  { icon: <PaymentsIcon />, title: 'Nyata', desc: 'Dana cair bertahap sesuai progres yang terverifikasi.' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const { data: threads = [] } = useThreads({ filter: 'aksi' });
  const { data: fjbItems = [] } = useFjbItems();
  const { data: projects = [] } = useModalUsahaList();
  const { data: stats } = useStats();
  const featured = threads.filter((t) => t.campaign?.status !== 'completed').slice(0, 3);

  const statCards = [
    { label: 'Dana tersalurkan', value: formatRupiah(stats?.totalDisbursed ?? 0) },
    { label: 'Aksi aktif', value: String(stats?.activeCampaigns ?? 0) },
    { label: 'Anggota', value: (stats?.totalUsers ?? 0).toLocaleString('id-ID') },
    { label: 'Kota', value: String(stats?.citiesReached ?? 0) },
  ];

  return (
    <Box>
      <Hero
        size="lg"
        eyebrow={<Chip label="Tumbuh bersama" sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }} />}
        title={<>Dari Diskusi,<br />Tumbuh Jadi Aksi.</>}
        subtitle="Ruang komunitas yang menanam benih kebaikan, dari bantuan darurat sampai modal usaha."
        actions={
          <>
            <Button size="large" variant="contained" onClick={() => navigate('/komunitas')} sx={{ bgcolor: '#fff', color: 'primary.dark', backgroundImage: 'none', '&:hover': { bgcolor: brand.ice } }}>
              Komunitas
            </Button>
            <Button size="large" variant="contained" color="warning" onClick={() => navigate('/modal-usaha')}>
              Danai Usaha
            </Button>
          </>
        }
        aside={
          featured[0] && featured[0].campaign ? (
            <GlossCard sx={{ gap: 2 }}>
              <Chip icon={<VolunteerActivismIcon />} label="Aksi terhangat" color="primary" size="small" sx={{ alignSelf: 'flex-start' }} />
              <Typography variant="h6" sx={{ fontSize: '1.1rem', color: 'text.primary' }}>{featured[0].title}</Typography>
              <CampaignProgress campaign={featured[0].campaign} />
              <Button fullWidth variant="contained" sx={{ mt: 'auto' }} onClick={() => navigate(`/thread/${featured[0].id}`)}>Donasi</Button>
            </GlossCard>
          ) : (
            <Box className="float-slow" sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <HandHeart size={220} />
            </Box>
          )
        }
      />

      <Section overlap>
        <CardGrid cols={{ xs: 2, md: 4 }}>
          {statCards.map((s, i) => (
            <GlossCard key={s.label} delay={i * 0.05} sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 0.5 }}>
              <Typography variant="h4" color="primary.dark" sx={{ fontSize: { xs: '1.4rem', md: '1.9rem' } }}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            </GlossCard>
          ))}
        </CardGrid>
      </Section>

      <Section title="Cara kerja" subtitle="Empat langkah dari kepedulian ke dampak.">
        <CardGrid cols={{ xs: 1, sm: 2, md: 4 }}>
          {steps.map((s, i) => (
            <GlossCard key={s.title} delay={i * 0.06} sx={{ gap: 2 }}>
              <IconTile>{s.icon}</IconTile>
              <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>{s.title}</Typography>
              <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
            </GlossCard>
          ))}
        </CardGrid>
      </Section>

      <Section
        title="Aksi pilihan"
        subtitle="Kampanye yang butuh dukunganmu sekarang."
        action={<Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/komunitas')}>Semua</Button>}
      >
        {featured.length ? (
          <Stack spacing={3}>{featured.map((t, i) => <ThreadCard thread={t} key={t.id} index={i} />)}</Stack>
        ) : (
          <EmptyState
            icon={<VolunteerActivismIcon />}
            color={brand.cta}
            title="Belum ada aksi aktif"
            description="Jadilah yang pertama mengubah diskusi jadi aksi."
            action={<Button variant="contained" color="warning" onClick={() => navigate('/komunitas')}>Mulai Diskusi</Button>}
          />
        )}
      </Section>

      <Section
        title="Modal usaha"
        subtitle="Modal kecil dari banyak orang, usaha yang bertunas."
        action={<Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/modal-usaha')}>Semua</Button>}
      >
        {projects.length ? (
          <CardGrid cols={{ xs: 1, sm: 2, md: 3 }}>
            {projects.slice(0, 3).map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </CardGrid>
        ) : (
          <EmptyState
            icon={<Sprout size={30} />}
            title="Belum ada usaha dibuka"
            description="Ajukan usahamu, atau kembali setelah usaha pertama diverifikasi."
            action={<Button variant="contained" onClick={() => navigate('/modal-usaha')}>Lihat Usaha</Button>}
          />
        )}
      </Section>

      <Section title="Ruang komunitas" subtitle="Dari isu daerah sampai hobi.">
        <CardGrid cols={{ xs: 1, sm: 2, md: 3 }}>
          {categories.map((c, i) => (
            <GlossCard key={c.id} delay={(i % 3) * 0.06} onClick={() => navigate(`/komunitas/${c.slug}`)} sx={{ gap: 2 }}>
              <IconTile color={c.color}>{categoryIcon(c.icon)}</IconTile>
              <Box>
                <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 0.5 }}>{c.name}</Typography>
                <Typography variant="body2" color="text.secondary">{c.description}</Typography>
              </Box>
              <Chip label={`${c.threadCount} thread`} size="small" sx={{ mt: 'auto', alignSelf: 'flex-start' }} />
            </GlossCard>
          ))}
        </CardGrid>
      </Section>

      <Section>
        <GlossCard sx={{ p: { xs: 3, md: 5 }, background: 'linear-gradient(135deg, rgba(66,103,178,0.1), rgba(246,196,83,0.18))' }}>
          <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, alignItems: 'center' }}>
            <Stack spacing={2.5} alignItems="flex-start">
              <Chip icon={<StorefrontIcon />} label="FJB" color="primary" size="small" />
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' } }}>Jual preloved, salurkan jadi donasi</Typography>
              <Typography color="text.secondary">Hasil penjualan masuk ke dompet kampanye pilihanmu.</Typography>
              <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/fjb')}>Buka FJB</Button>
            </Stack>
            {fjbItems.length > 0 && (
              <CardGrid cols={2}>
                {fjbItems.slice(0, 4).map((item) => (
                  <GlossCard key={item.id} sx={{ p: 2.5, gap: 1 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>{item.title}</Typography>
                    <Typography variant="caption" color="primary.dark" fontWeight={800} sx={{ mt: 'auto' }}>{formatRupiah(item.price)}</Typography>
                  </GlossCard>
                ))}
              </CardGrid>
            )}
          </Box>
        </GlossCard>
      </Section>

      {!user && (
        <Section>
          <GlossCard sx={{ p: { xs: 4, md: 6 }, alignItems: 'center', textAlign: 'center', gap: 2.5 }}>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' } }}>Siap menanam kebaikan?</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 480 }}>Gabung, mulai diskusi, dan wujudkan aksi pertamamu.</Typography>
            <Button size="large" variant="contained" color="warning" onClick={() => navigate('/daftar')}>Daftar</Button>
          </GlossCard>
        </Section>
      )}
    </Box>
  );
}
