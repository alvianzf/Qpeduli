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
import KarmaChip from '../components/KarmaChip';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

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
  const { user, logout } = useAuth();

  const handleCreateClick = () => {
    if (!user) {
      navigate('/masuk');
      return;
    }
    onCreateThread();
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: scrolled ? alpha('#FFFFFF', 0.7) : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? `1px solid ${alpha('#4267B2', 0.1)}` : '1px solid transparent',
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
            <Box sx={{ boxShadow: '0 6px 16px rgba(66,103,178,0.35)', borderRadius: '12px', lineHeight: 0 }}>
              <Logo size={38} />
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
                  bgcolor: location.pathname === link.to ? alpha('#4267B2', 0.08) : 'transparent',
                }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ flex: { xs: 1, md: 0 } }} />

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button variant="contained" startIcon={<AddCircleIcon />} onClick={handleCreateClick}>
              Buat Aksi Sosial
            </Button>
            {user ? (
              <>
                <KarmaChip karma={user.karma} />
                <Avatar
                  sx={{ bgcolor: user.avatarColor, cursor: 'pointer', width: 40, height: 40, fontWeight: 700 }}
                  onClick={() => navigate(`/profil/${user.username}`)}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/masuk')}>Masuk</Button>
                <Button variant="outlined" onClick={() => navigate('/daftar')}>Daftar</Button>
              </>
            )}
          </Stack>

          <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' } }} onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, p: 2, height: '100%', background: 'linear-gradient(180deg,#F3F7FF,#FFFFFF)' }}>
          {user ? (
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2, p: 1 }}>
              <Avatar sx={{ bgcolor: user.avatarColor, fontWeight: 700 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
              <Box>
                <Typography fontWeight={700}>{user.name}</Typography>
                <KarmaChip karma={user.karma} />
              </Box>
            </Stack>
          ) : (
            <Stack spacing={1} sx={{ mb: 2, p: 1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  navigate('/masuk');
                  setOpen(false);
                }}
              >
                Masuk
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  navigate('/daftar');
                  setOpen(false);
                }}
              >
                Daftar
              </Button>
            </Stack>
          )}
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
            {user && (
              <>
                <ListItemButton
                  onClick={() => {
                    navigate(`/profil/${user.username}`);
                    setOpen(false);
                  }}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ListItemText sx={{ '& .MuiListItemText-primary': { fontWeight: 700 } }} primary="Profil Saya" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate('/');
                  }}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ListItemText sx={{ '& .MuiListItemText-primary': { fontWeight: 700 } }} primary="Keluar" />
                </ListItemButton>
              </>
            )}
          </List>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={() => {
              handleCreateClick();
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
