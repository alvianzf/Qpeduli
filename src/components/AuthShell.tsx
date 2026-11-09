import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Stack from './ui/FlexStack';
import Typography from './ui/Txt';
import HeroDecor from './HeroDecor';
import Logo from './Logo';
import { heroBase, heroFull } from '../theme/theme';

/** Full-screen glossy backdrop with one centered card; shared by Login and Register. */
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <Box sx={{ ...heroBase, ...heroFull, minHeight: '100vh', display: 'flex', alignItems: 'center', py: 8 }}>
      <HeroDecor />
      <Container maxWidth="xs">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card sx={{ p: 4 }}>
            <Stack alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
              <Box onClick={() => navigate('/')} sx={{ cursor: 'pointer', lineHeight: 0 }}><Logo size={48} /></Box>
              <Typography variant="h5">{title}</Typography>
              <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
            </Stack>
            {children}
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
