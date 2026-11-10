import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ForumIcon from '@mui/icons-material/Forum';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import VerifiedIcon from '@mui/icons-material/Verified';
import PaymentsIcon from '@mui/icons-material/Payments';
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
import KepriMap from '../components/KepriMap';
import { useRegions } from '../lib/useRegions';
import ProjectCard from '../components/ProjectCard';
import { Sprout, DonationArt } from '../components/art/Nature';
import { categoryIcon } from '../components/categoryIcons';
import { formatRupiah } from '../data/mockData';
import { brand } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import DonateDialog from '../components/DonateDialog';
import CampaignProgress from '../components/CampaignProgress';
import { useCategories, useThreads, useStats, useModalUsahaList } from '../lib/queries';

const steps = [
  { icon: <ForumIcon />, title: 'Diskusi', desc: 'Ceritakan masalah atau ide di ruang komunitas.' },
  { icon: <VolunteerActivismIcon />, title: 'Aksi', desc: 'Ubah thread jadi kampanye dengan target jelas.' },
  { icon: <VerifiedIcon />, title: 'Dikawal', desc: 'Penjamin dan donatur memantau bersama.' },
  { icon: <PaymentsIcon />, title: 'Nyata', desc: 'Dana cair bertahap sesuai progres.' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const { data: threads = [] } = useThreads({ filter: 'aksi' });
  const { data: projects = [] } = useModalUsahaList();
  const { data: stats } = useStats();
  const { counts } = useRegions();
  const [donateOpen, setDonateOpen] = useState(false);
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
        tone="warm"
        eyebrow={<Chip icon={<VolunteerActivismIcon sx={{ color: '#fff !important' }} />} label="Donasi" sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff' }} />}
        title={<>Satu donasi,<br />satu harapan.</>}
        subtitle="Beri langsung ke warga yang butuh modal usaha dan aksi sosial di sekitarmu. Dana cair bertahap, diawasi bersama."
        actions={
          <>
            <Button size="large" variant="contained" startIcon={<VolunteerActivismIcon />} onClick={() => document.getElementById('donasi')?.scrollIntoView({ behavior: 'smooth' })} sx={{ bgcolor: '#fff', color: '#C2410C', backgroundImage: 'none', '&:hover': { bgcolor: '#FFF1E6' } }}>Donasi sekarang</Button>
            <Button size="large" variant="outlined" onClick={() => navigate('/modal-usaha')} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.7)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}>Danai Usaha</Button>
          </>
        }
        aside={
          <Stack alignItems="stretch" spacing={2}>
            <Box className="float-slow" sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}><DonationArt size={300} /></Box>
            {featured[0]?.campaign && (
              <GlossCard sx={{ gap: 2, p: 3 }}>
                <Typography variant="h5" sx={{ fontSize: '1.2rem', color: 'text.primary' }}>{featured[0].title}</Typography>
                <CampaignProgress campaign={featured[0].campaign} />
                <Button fullWidth size="large" variant="contained" color="warning" startIcon={<VolunteerActivismIcon />} onClick={() => setDonateOpen(true)}>Donasi</Button>
              </GlossCard>
            )}
          </Stack>
        }
      />

      <Section
        overlap
        id="donasi"
        title="Butuh dukunganmu"
        subtitle="Donasi langsung ke kampanye yang sedang berjalan."
        action={<Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/komunitas')}>Semua</Button>}
      >
        {featured.length ? (
          <CardGrid cols={{ xs: 1, md: 3 }}>
            {featured.map((t, i) => <ThreadCard thread={t} key={t.id} index={i} />)}
          </CardGrid>
        ) : (
          <EmptyState
            icon={<VolunteerActivismIcon />}
            color={brand.cta}
            title="Belum ada aksi"
            description="Jadilah yang pertama."
            action={<Button variant="contained" color="warning" onClick={() => navigate('/komunitas')}>Mulai</Button>}
          />
        )}
      </Section>

      <Section
        title="Modal usaha"
        subtitle="Usaha kecil yang sedang mencari modal."
        action={<Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/modal-usaha')}>Semua</Button>}
      >
        {projects.length ? (
          <CardGrid cols={{ xs: 1, sm: 2, md: 3 }}>
            {projects.slice(0, 3).map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </CardGrid>
        ) : (
          <EmptyState
            icon={<Sprout size={30} />}
            title="Belum ada usaha"
            description="Ajukan usahamu, atau kembali setelah usaha pertama diverifikasi."
            action={<Button variant="contained" onClick={() => navigate('/modal-usaha')}>Lihat</Button>}
          />
        )}
      </Section>

      <Section>
        <CardGrid cols={{ xs: 2, md: 4 }}>
          {statCards.map((s, i) => (
            <GlossCard key={s.label} delay={i * 0.05} sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 0.5 }}>
              <Typography variant="h4" color="primary.dark" sx={{ fontSize: { xs: '1.5rem', md: '2.1rem' } }}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            </GlossCard>
          ))}
        </CardGrid>
      </Section>

      <Section title="Peta kampanye Kepulauan Riau" subtitle="Saat ini kampanye hanya untuk Kepri. Klik kota atau kabupaten untuk melihat usaha dan aksi di sana.">
        <GlossCard sx={{ p: { xs: 2, md: 4 }, background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(219,234,254,0.7))' }}>
          <KepriMap counts={counts} />
        </GlossCard>
      </Section>

      <Section title="Cara kerja" subtitle="Empat langkah dari peduli ke dampak.">
        <CardGrid cols={{ xs: 1, sm: 2, md: 4 }}>
          {steps.map((s, i) => (
            <GlossCard key={s.title} delay={i * 0.06} sx={{ gap: 2 }}>
              <IconTile>{s.icon}</IconTile>
              <Typography variant="h6" sx={{ fontSize: '1.15rem' }}>{i + 1}. {s.title}</Typography>
              <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
            </GlossCard>
          ))}
        </CardGrid>
      </Section>

      <Section title="Ruang komunitas" subtitle="Dari isu daerah sampai hobi.">
        <CardGrid cols={{ xs: 1, sm: 2, md: 3 }}>
          {categories.map((c, i) => (
            <GlossCard key={c.id} delay={(i % 3) * 0.06} onClick={() => navigate(`/komunitas/${c.slug}`)} sx={{ gap: 2 }}>
              <IconTile color={c.color}>{categoryIcon(c.icon)}</IconTile>
              <Box>
                <Typography variant="h6" sx={{ fontSize: '1.15rem', mb: 0.5 }}>{c.name}</Typography>
                <Typography variant="body2" color="text.secondary">{c.description}</Typography>
              </Box>
              <Chip label={`${c.threadCount} thread`} size="small" sx={{ mt: 'auto', alignSelf: 'flex-start' }} />
            </GlossCard>
          ))}
        </CardGrid>
      </Section>

      {!user && (
        <Section>
          <GlossCard sx={{ p: { xs: 4, md: 6 }, alignItems: 'center', textAlign: 'center', gap: 2.5, background: 'linear-gradient(135deg, rgba(66,103,178,0.1), rgba(255,90,0,0.12))' }}>
            <Typography variant="h3" sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' } }}>Siap menanam kebaikan?</Typography>
            <Button size="large" variant="contained" color="warning" onClick={() => navigate('/daftar')}>Daftar</Button>
          </GlossCard>
        </Section>
      )}
      {featured[0] && <DonateDialog open={donateOpen} onClose={() => setDonateOpen(false)} thread={featured[0]} />}
    </Box>
  );
}
