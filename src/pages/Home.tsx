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
import Typography from '../components/ui/Txt';
import EmptyState from '../components/EmptyState';
import ThreadCard from '../components/ThreadCard';
import ProjectCard from '../components/ProjectCard';
import { HandHeart, Sprout, Tree, Flower } from '../components/art/Nature';
import { categoryIcon } from '../components/categoryIcons';
import { formatRupiah } from '../data/mockData';
import { brand } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
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
        eyebrow={<Chip label="Tumbuh bersama" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />}
        title={<>Modal kecil.<br />Usaha bertunas.</>}
        subtitle="Danai warga yang memulai usahanya, dukung aksi di sekitarmu, dan awasi bersama."
        actions={
          <>
            <Button size="large" variant="contained" color="warning" onClick={() => navigate('/modal-usaha')}>Danai Usaha</Button>
            <Button size="large" variant="contained" onClick={() => navigate('/komunitas')} sx={{ bgcolor: '#fff', color: 'primary.dark', backgroundImage: 'none', '&:hover': { bgcolor: brand.ice } }}>Komunitas</Button>
          </>
        }
        aside={
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'flex-end', justifyContent: 'center', gap: 2 }}>
            <Box className="float-slow"><Tree size={200} /></Box>
            <Box className="float-slow" sx={{ animationDelay: '-2s' }}><HandHeart size={260} /></Box>
            <Box className="float-slow" sx={{ animationDelay: '-4s' }}><Flower size={110} /></Box>
          </Box>
        }
      />

      <Section overlap>
        <CardGrid cols={{ xs: 2, md: 4 }}>
          {statCards.map((s, i) => (
            <GlossCard key={s.label} delay={i * 0.05} sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 0.5 }}>
              <Typography variant="h4" color="primary.dark" sx={{ fontSize: { xs: '1.5rem', md: '2.1rem' } }}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            </GlossCard>
          ))}
        </CardGrid>
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

      <Section
        title="Aksi pilihan"
        subtitle="Kampanye yang butuh dukunganmu."
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
          <GlossCard sx={{ p: { xs: 4, md: 6 }, alignItems: 'center', textAlign: 'center', gap: 2.5, background: 'linear-gradient(135deg, rgba(31,122,77,0.1), rgba(242,107,29,0.12))' }}>
            <Typography variant="h3" sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' } }}>Siap menanam kebaikan?</Typography>
            <Button size="large" variant="contained" color="warning" onClick={() => navigate('/daftar')}>Daftar</Button>
          </GlossCard>
        </Section>
      )}
    </Box>
  );
}
