import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Stack from './ui/FlexStack';
import Typography from './ui/Txt';
import HeroDecor from './HeroDecor';
import Logo from './Logo';
import { HandHeart } from './art/Nature';
import { heroBase } from '../theme/theme';

/** Split screen: translucent brand panel on the left (desktop), form card on the right. Shared by Login and Register. */
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) minmax(0,1fr)' }, gap: 2, p: 2, position: 'relative', zIndex: 1 }}>
      <Box sx={{ ...heroBase, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', p: 5 }}>
        <HeroDecor />
        <Stack direction="row" spacing={1.25} alignItems="center" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
          <Logo size={34} light />
          <Typography variant="h6" color="#fff">Qpeduli</Typography>
        </Stack>
        <Box className="float-slow" sx={{ alignSelf: 'center' }}><HandHeart size={220} /></Box>
        <Box>
          <Typography variant="h3" sx={{ fontSize: '2rem', mb: 1 }}>Dari diskusi, jadi aksi.</Typography>
          <Typography sx={{ opacity: 0.9 }}>Danai usaha kecil dan dukung aksi warga.</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: '100%', maxWidth: 400 }}>
          <Card sx={{ p: 3 }}>
            <Stack alignItems="flex-start" spacing={0.5} sx={{ mb: 3 }}>
              <Box onClick={() => navigate('/')} sx={{ cursor: 'pointer', lineHeight: 0, display: { md: 'none' }, mb: 1 }}><Logo size={40} /></Box>
              <Typography variant="h5">{title}</Typography>
              <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
            </Stack>
            {children}
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
}
