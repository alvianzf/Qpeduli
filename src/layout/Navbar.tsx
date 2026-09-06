import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Stack from '../components/ui/FlexStack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '../components/ui/Txt';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { currentUser } from '../data/mockData';
import KarmaChip from '../components/KarmaChip';

const navLinks = [
  { label: 'Beranda', to: '/' },
  { label: 'Komunitas', to: '/komunitas' },
  { label: 'FJB Amal', to: '/fjb' },
  { label: 'Transparansi & Keamanan', to: '/keamanan' },
];

export default function Navbar({ onCreateThread }: { onCreateThread: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 8 });

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: scrolled ? alpha('#FFFFFF', 0.7) : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? `1px solid ${alpha('#1E5FE0', 0.1)}` : '1px solid transparent',
          color: '#0B1E4D',
          transition: 'all 0.25s ease',
        }}
      >
        <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', px: { xs: 1.5, md: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer', mr: { xs: 1, md: 4 } }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: 'linear-gradient(135deg,#1E5FE0,#60A5FA)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(30,95,224,0.35)',
              }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>Q</Typography>
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              Qpeduli
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' }, flex: 1 }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                onClick={() => navigate(link.to)}
                sx={{
                  color: location.pathname === link.to ? 'primary.dark' : 'text.secondary',
                  fontWeight: location.pathname === link.to ? 800 : 600,
                  bgcolor: location.pathname === link.to ? alpha('#1E5FE0', 0.08) : 'transparent',
                }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ flex: { xs: 1, md: 0 } }} />

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={onCreateThread}
            >
              Buat Aksi Sosial
            </Button>
            <KarmaChip karma={currentUser.karma} />
            <Avatar
              sx={{ bgcolor: currentUser.avatarColor, cursor: 'pointer', width: 40, height: 40, fontWeight: 700 }}
              onClick={() => navigate('/profil')}
            >
              {currentUser.avatarInitial}
            </Avatar>
          </Stack>

          <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' } }} onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, p: 2, height: '100%', background: 'linear-gradient(180deg,#F3F7FF,#FFFFFF)' }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2, p: 1 }}>
            <Avatar sx={{ bgcolor: currentUser.avatarColor, fontWeight: 700 }}>{currentUser.avatarInitial}</Avatar>
            <Box>
              <Typography fontWeight={700}>{currentUser.name}</Typography>
              <KarmaChip karma={currentUser.karma} />
            </Box>
          </Stack>
          <Divider sx={{ mb: 1 }} />
          <List>
            {navLinks.map((link) => (
              <ListItemButton
                key={link.to}
                selected={location.pathname === link.to}
                onClick={() => {
                  navigate(link.to);
                  setOpen(false);
                }}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemText sx={{ '& .MuiListItemText-primary': { fontWeight: 700 } }} primary={link.label} />
              </ListItemButton>
            ))}
            <ListItemButton
              onClick={() => {
                navigate('/profil');
                setOpen(false);
              }}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemText sx={{ '& .MuiListItemText-primary': { fontWeight: 700 } }} primary="Profil Saya" />
            </ListItemButton>
          </List>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={() => {
              onCreateThread();
              setOpen(false);
            }}
            sx={{ mt: 1 }}
          >
            Buat Aksi Sosial
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
