import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import KarmaChip from '../components/KarmaChip';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useCreateThreadDialog } from '../context/CreateThreadContext';
import { brand } from '../theme/theme';

const links = [
  { label: 'Beranda', to: '/' },
  { label: 'Komunitas', to: '/komunitas' },
  { label: 'Modal Usaha', to: '/modal-usaha' },
  { label: 'Keamanan', to: '/keamanan' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { openCreateThread } = useCreateThreadDialog();

  const go = (to: string) => {
    navigate(to);
    setOpen(false);
  };
  const create = () => {
    setOpen(false);
    if (!user) return navigate('/masuk');
    openCreateThread();
  };
  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ background: 'transparent', color: brand.ink, zIndex: 10, pt: 1 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              height: 64,
              px: { xs: 2, md: 3 },
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              borderRadius: '16px',
              bgcolor: alpha('#FFFFFF', 0.86),
              border: `1px solid ${alpha('#FFFFFF', 0.9)}`,
              boxShadow: `inset 0 1.5px 0 #fff, 0 10px 28px ${alpha(brand.deep, 0.16)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} onClick={() => go('/')} sx={{ cursor: 'pointer', flexShrink: 0 }}>
              <Logo size={32} />
              <Typography variant="h6" sx={{ fontSize: '1.25rem' }}>Qpeduli</Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' }, flex: 1 }}>
              {links.map((l) => (
                <Button
                  key={l.to}
                  onClick={() => go(l.to)}
                  sx={{
                    px: 1.75,
                    py: 0.75,
                    color: isActive(l.to) ? 'primary.dark' : 'text.secondary',
                    bgcolor: isActive(l.to) ? alpha(brand.primary, 0.1) : 'transparent',
                  }}
                >
                  {l.label}
                </Button>
              ))}
              {user?.role === 'ADMIN' && (
                <Button onClick={() => go('/admin')} sx={{ px: 1.75, py: 0.75, color: isActive('/admin') ? 'primary.dark' : 'text.secondary', bgcolor: isActive('/admin') ? alpha(brand.primary, 0.1) : 'transparent' }}>
                  Admin
                </Button>
              )}
            </Stack>

            <Box sx={{ flex: { xs: 1, md: 0 } }} />

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button variant="contained" startIcon={<AddCircleIcon />} onClick={create}>Buat</Button>
              {user ? (
                <>
                  <KarmaChip karma={user.karma} compact />
                  <Avatar
                    onClick={() => go(`/profil/${user.username}`)}
                    sx={{ bgcolor: user.avatarColor, cursor: 'pointer', width: 40, height: 40, fontWeight: 700 }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </>
              ) : (
                <>
                  <Button onClick={() => go('/masuk')}>Masuk</Button>
                  <Button variant="outlined" onClick={() => go('/daftar')}>Daftar</Button>
                </>
              )}
            </Stack>

            <IconButton aria-label="Menu" sx={{ display: { xs: 'inline-flex', md: 'none' } }} onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: 300, p: 3 } } }}>
        <Stack spacing={3}>
          {user ? (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: user.avatarColor, fontWeight: 700 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={700} noWrap>{user.name}</Typography>
                <KarmaChip karma={user.karma} compact />
              </Box>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1.5}>
              <Button fullWidth variant="contained" onClick={() => go('/masuk')}>Masuk</Button>
              <Button fullWidth variant="outlined" onClick={() => go('/daftar')}>Daftar</Button>
            </Stack>
          )}
          <Divider />
          <List disablePadding>
            {[...links, ...(user?.role === 'ADMIN' ? [{ label: 'Admin', to: '/admin' }] : []), ...(user ? [{ label: 'Profil', to: `/profil/${user.username}` }] : [])].map((l) => (
              <ListItemButton key={l.to} selected={isActive(l.to)} onClick={() => go(l.to)} sx={{ borderRadius: '12px', mb: 0.5 }}>
                <ListItemText primary={l.label} slotProps={{ primary: { sx: { fontWeight: 700 } } }} />
              </ListItemButton>
            ))}
            {user && (
              <ListItemButton onClick={() => { logout(); go('/'); }} sx={{ borderRadius: '12px' }}>
                <ListItemText primary="Keluar" slotProps={{ primary: { sx: { fontWeight: 700 } } }} />
              </ListItemButton>
            )}
          </List>
          <Button fullWidth variant="contained" startIcon={<AddCircleIcon />} onClick={create}>Buat</Button>
        </Stack>
      </Drawer>
    </>
  );
}
