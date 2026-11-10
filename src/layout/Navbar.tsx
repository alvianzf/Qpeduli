import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
  { label: 'Karhutla', to: '/karhutla' },
  { label: 'Keamanan', to: '/keamanan' },
  { label: 'Mitra', to: '/mitra' },
];

/** Full-width glass top bar: logo left, links centered, actions right. */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { openCreateThread } = useCreateThreadDialog();

  const all = [...links, ...((user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') ? [{ label: 'Admin', to: '/admin' }] : [])];
  const go = (to: string) => { navigate(to); setOpen(false); };
  const create = () => { setOpen(false); if (!user) return navigate('/masuk'); openCreateThread(); };
  const active = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          color: brand.ink,
          zIndex: 10,
          bgcolor: alpha('#FFFFFF', 0.78),
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${alpha('#FFFFFF', 0.9)}`,
          boxShadow: `0 8px 24px ${alpha(brand.deep, 0.1)}`,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ height: 72, display: 'grid', gridTemplateColumns: { xs: 'auto 1fr', md: '1fr auto 1fr' }, alignItems: 'center', gap: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.25} onClick={() => go('/')} sx={{ cursor: 'pointer' }}>
              <Logo size={36} />
              <Typography variant="h6" sx={{ fontSize: '1.35rem' }}>Qpeduli</Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {all.map((l) => (
                <Button
                  key={l.to}
                  onClick={() => go(l.to)}
                  sx={{
                    px: 2,
                    color: active(l.to) ? 'primary.dark' : 'text.secondary',
                    boxShadow: active(l.to) ? `inset 0 -3px 0 ${brand.cta}` : 'none',
                    borderRadius: 0,
                    height: 72,
                  }}
                >
                  {l.label}
                </Button>
              ))}
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
              <Button variant="contained" color="warning" startIcon={<AddCircleIcon />} onClick={create} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>Buat</Button>
              {user ? (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                  <KarmaChip karma={user.karma} compact />
                  <IconButton aria-label="Menu akun" onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: user.avatarColor, width: 40, height: 40, fontWeight: 700 }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography fontWeight={700}>{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">@{user.username}</Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { setAnchor(null); go(`/profil/${user.username}`); }}>Profil</MenuItem>
                    {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && <MenuItem onClick={() => { setAnchor(null); go('/admin'); }}>Panel admin</MenuItem>}
                    <MenuItem onClick={() => { setAnchor(null); logout(); go('/'); }}>Keluar</MenuItem>
                  </Menu>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
                  <Button onClick={() => go('/masuk')}>Masuk</Button>
                  <Button variant="outlined" onClick={() => go('/daftar')}>Daftar</Button>
                </Stack>
              )}
              <IconButton aria-label="Menu" sx={{ display: { xs: 'inline-flex', md: 'none' } }} onClick={() => setOpen(true)}><MenuIcon /></IconButton>
            </Stack>
          </Box>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: 280, p: 3 } } }}>
        <Stack spacing={1.5}>
          {user ? (
            <Stack direction="row" spacing={1.5} alignItems="center" onClick={() => go(`/profil/${user.username}`)} sx={{ mb: 1, cursor: 'pointer' }}>
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
          {all.map((l) => (
            <Button key={l.to} onClick={() => go(l.to)} sx={{ justifyContent: 'flex-start', color: active(l.to) ? 'primary.dark' : 'text.secondary', bgcolor: active(l.to) ? alpha(brand.primary, 0.1) : 'transparent' }}>{l.label}</Button>
          ))}
          <Button variant="contained" color="warning" startIcon={<AddCircleIcon />} onClick={create}>Buat</Button>
          {user && <Button color="inherit" onClick={() => { logout(); go('/'); }}>Keluar</Button>}
        </Stack>
      </Drawer>
    </>
  );
}
