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
import ProjectCard from '../components/ProjectCard';
import { HandHeart, Sprout } from '../components/art/Nature';
import { categoryIcon } from '../components/categoryIcons';
import { formatRupiah } from '../data/mockData';
import { brand } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useCategories, useThreads, useStats, useModalUsahaList } from '../lib/queries';

const steps = [
  { icon: <ForumIcon />, title: 'Diskusi', desc: 'Ceritakan masalah atau ide.' },
  { icon: <VolunteerActivismIcon />, title: 'Aksi', desc: 'Ubah thread jadi kampanye.' },
  { icon: <VerifiedIcon />, title: 'Dikawal', desc: 'Penjamin dan donatur memantau.' },
  { icon: <PaymentsIcon />, title: 'Nyata', desc: 'Dana cair bertahap.' },
];

/** Bento layout: modal usaha leads, stats and steps sit in a side column, feed and categories follow. */
export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const { data: threads = [] } = useThreads({ filter: 'aksi' });
  const { data: projects = [] } = useModalUsahaList();
  const { data: stats } = useStats();
  const featured = threads.filter((t) => t.campaign?.status !== 'completed').slice(0, 3);

  const statCards = [
    { label: 'Tersalurkan', value: formatRupiah(stats?.totalDisbursed ?? 0) },
    { label: 'Aksi aktif', value: String(stats?.activeCampaigns ?? 0) },
    { label: 'Anggota', value: (stats?.totalUsers ?? 0).toLocaleString('id-ID') },
    { label: 'Kota', value: String(stats?.citiesReached ?? 0) },
  ];

  return (
    <Box>
      <Hero
        size="lg"
        eyebrow={<Chip label="Tumbuh bersama" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }} />}
        title={<>Dari Diskusi,<br />Jadi Aksi.</>}
        subtitle="Danai usaha kecil, dukung aksi warga, dan awasi bersama."
        actions={
          <>
            <Button variant="contained" color="warning" onClick={() => navigate('/modal-usaha')}>Danai Usaha</Button>
            <Button variant="contained" onClick={() => navigate('/komunitas')} sx={{ bgcolor: '#fff', color: 'primary.dark', backgroundImage: 'none', '&:hover': { bgcolor: brand.ice } }}>Komunitas</Button>
          </>
        }
        aside={
          <Box className="float-slow" sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <HandHeart size={180} />
          </Box>
        }
      />

      <Box sx={{ display: 'grid', gap: 2, mt: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0,1fr))' }, position: 'relative', zIndex: 1 }}>
        {statCards.map((s, i) => (
          <GlossCard key={s.label} delay={i * 0.05} sx={{ gap: 0.25 }}>
            <Typography variant="h5" color="primary.dark" sx={{ fontSize: '1.4rem' }}>{s.value}</Typography>
            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
          </GlossCard>
        ))}
      </Box>

      <Section
        title="Modal usaha"
        action={<Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/modal-usaha')}>Semua</Button>}
      >
        {projects.length ? (
          <CardGrid cols={{ xs: 1, md: 2 }}>
            {projects.slice(0, 4).map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
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

      <Box sx={{ display: 'grid', gap: 2, mt: 4, gridTemplateColumns: { xs: '1fr', md: 'minmax(0,3fr) minmax(0,2fr)' }, alignItems: 'start', position: 'relative', zIndex: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h5" sx={{ fontSize: '1.4rem' }}>Aksi pilihan</Typography>
            <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/komunitas')}>Semua</Button>
          </Stack>
          {featured.length ? (
            <Stack spacing={2}>{featured.map((t, i) => <ThreadCard thread={t} key={t.id} index={i} />)}</Stack>
          ) : (
            <EmptyState
              icon={<VolunteerActivismIcon />}
              color={brand.cta}
              title="Belum ada aksi"
              description="Jadilah yang pertama."
              action={<Button variant="contained" color="warning" onClick={() => navigate('/komunitas')}>Mulai</Button>}
            />
          )}
        </Box>
        <GlossCard sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Cara kerja</Typography>
          {steps.map((s, i) => (
            <Stack key={s.title} direction="row" spacing={1.5} alignItems="center">
              <IconTile>{s.icon}</IconTile>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2">{i + 1}. {s.title}</Typography>
                <Typography variant="caption" color="text.secondary">{s.desc}</Typography>
              </Box>
            </Stack>
          ))}
        </GlossCard>
      </Box>

      <Section title="Ruang komunitas">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {categories.map((c) => (
            <Chip
              key={c.id}
              icon={<Box sx={{ display: 'flex', color: c.color, '& svg': { fontSize: 18 } }}>{categoryIcon(c.icon)}</Box>}
              label={`${c.name} · ${c.threadCount}`}
              onClick={() => navigate(`/komunitas/${c.slug}`)}
              sx={{ height: 40, bgcolor: 'rgba(255,255,255,0.85)', fontWeight: 600 }}
            />
          ))}
        </Box>
      </Section>

      {!user && (
        <Section>
          <GlossCard sx={{ p: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2, background: 'linear-gradient(135deg, rgba(66,103,178,0.1), rgba(255,90,0,0.1))' }}>
            <Typography variant="h6">Siap menanam kebaikan?</Typography>
            <Button variant="contained" color="warning" onClick={() => navigate('/daftar')}>Daftar</Button>
          </GlossCard>
        </Section>
      )}
    </Box>
  );
}
