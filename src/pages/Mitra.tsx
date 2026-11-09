import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import HandshakeIcon from '@mui/icons-material/Handshake';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VerifiedIcon from '@mui/icons-material/Verified';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import Hero from '../components/ui/Hero';
import Section from '../components/ui/Section';
import CardGrid from '../components/ui/CardGrid';
import GlossCard from '../components/ui/GlossCard';
import IconTile from '../components/ui/IconTile';
import Typography from '../components/ui/Txt';

const mailto = 'mailto:halo@qpeduli.com?subject=Kemitraan%20Qpeduli';

const benefits = [
  { icon: <StorefrontIcon />, title: 'Danai usaha kecil', desc: 'Pilih UMKM yang sudah terverifikasi dan danai tahap pencairannya.' },
  { icon: <VerifiedIcon />, title: 'Terverifikasi', desc: 'Tiap tahap dana ditinjau admin dan dikawal komunitas.' },
  { icon: <AssessmentIcon />, title: 'Laporan dampak', desc: 'Update progres dan ringkasan dampak untuk laporan CSR Anda.' },
];

export default function Mitra() {
  return (
    <Box>
      <Hero
        eyebrow={<Chip icon={<HandshakeIcon sx={{ color: '#fff !important' }} />} label="Mitra" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />}
        title="CSR yang Tumbuh Jadi Usaha"
        subtitle="Perusahaan dan komunitas bisa mendanai UMKM pilihan, lengkap dengan laporan progres."
        actions={<Button variant="contained" color="warning" startIcon={<MailOutlinedIcon />} href={mailto}>Hubungi kami</Button>}
      />
      <Section overlap>
        <CardGrid cols={{ xs: 1, md: 3 }}>
          {benefits.map((b, i) => (
            <GlossCard key={b.title} delay={i * 0.06} sx={{ gap: 2 }}>
              <IconTile>{b.icon}</IconTile>
              <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>{b.title}</Typography>
              <Typography variant="body2" color="text.secondary">{b.desc}</Typography>
            </GlossCard>
          ))}
        </CardGrid>
      </Section>
    </Box>
  );
}
