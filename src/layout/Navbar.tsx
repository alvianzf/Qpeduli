import { useState } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import HomeIcon from '@mui/icons-material/HomeRounded';
import ForumIcon from '@mui/icons-material/ForumRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import ShieldIcon from '@mui/icons-material/ShieldRounded';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/PersonRounded';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import KarmaChip from '../components/KarmaChip';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useCreateThreadDialog } from '../context/CreateThreadContext';
import { brand } from '../theme/theme';
import { SIDEBAR_W } from './layoutConst';

interface Item { label: string; to: string; icon: ReactNode }

const items: Item[] = [
  { label: 'Beranda', to: '/', icon: <HomeIcon /> },
  { label: 'Komunitas', to: '/komunitas', icon: <ForumIcon /> },
  { label: 'Modal Usaha', to: '/modal-usaha', icon: <StorefrontIcon /> },
  { label: 'Keamanan', to: '/keamanan', icon: <ShieldIcon /> },
  { label: 'Mitra', to: '/mitra', icon: <HandshakeIcon /> },
];

const glass = {
  bgcolor: alpha('#FFFFFF', 0.82),
  backdropFilter: 'blur(14px)',
  border: `1px solid ${alpha('#FFFFFF', 0.9)}`,
  boxShadow: `inset 0 1.5px 0 #fff, 0 10px 28px ${alpha(brand.deep, 0.16)}`,
} as const;

/** Desktop: floating left rail. Mobile: slim top bar, bottom tabs and an account drawer. */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { openCreateThread } = useCreateThreadDialog();

  const all = [...items, ...(user?.role === 'ADMIN' ? [{ label: 'Admin', to: '/admin', icon: <AdminIcon /> }] : [])];
  const go = (to: string) => { navigate(to); setOpen(false); };
  const create = () => { setOpen(false); if (!user) return navigate('/masuk'); openCreateThread(); };
  const active = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));
  const tabValue = ['/', '/komunitas', '/modal-usaha'].find(active) ?? (user && pathname.startsWith('/profil') ? '/me' : false);

  const account = user ? (
    <Stack direction="row" spacing={1.25} alignItems="center" onClick={() => go(`/profil/${user.username}`)} sx={{ cursor: 'pointer', minWidth: 0 }}>
      <Avatar sx={{ bgcolor: user.avatarColor, width: 36, height: 36, fontWeight: 700 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap>{user.name}</Typography>
        <KarmaChip karma={user.karma} compact />
      </Box>
    </Stack>
  ) : (
    <Stack spacing={1}>
      <Button fullWidth variant="outlined" onClick={() => go('/masuk')}>Masuk</Button>
      <Button fullWidth onClick={() => go('/daftar')}>Daftar</Button>
    </Stack>
  );

  return (
    <>
      <Box
        component="nav"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          position: 'fixed',
          top: 12, bottom: 12, left: 12,
          width: SIDEBAR_W,
          p: 2,
          gap: 2,
          borderRadius: '24px',
          zIndex: 10,
          ...glass,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25} onClick={() => go('/')} sx={{ cursor: 'pointer', px: 1, pt: 0.5 }}>
          <Logo size={30} />
          <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>Qpeduli</Typography>
        </Stack>
        <Button variant="contained" startIcon={<AddCircleIcon />} onClick={create}>Buat</Button>
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          {all.map((l) => (
            <Button
              key={l.to}
              startIcon={l.icon}
              onClick={() => go(l.to)}
              sx={{
                justifyContent: 'flex-start',
                px: 1.5,
                borderRadius: '12px',
                color: active(l.to) ? 'primary.dark' : 'text.secondary',
                bgcolor: active(l.to) ? alpha(brand.primary, 0.12) : 'transparent',
              }}
            >
              {l.label}
            </Button>
          ))}
        </Stack>
        {account}
        {user && <Button size="small" color="inherit" startIcon={<LogoutIcon />} onClick={() => { logout(); go('/'); }} sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}>Keluar</Button>}
      </Box>

      <Box sx={{ display: { xs: 'flex', md: 'none' }, position: 'sticky', top: 8, zIndex: 10, mx: 1, mt: 1, px: 1.5, height: 52, alignItems: 'center', gap: 1.5, borderRadius: '16px', ...glass }}>
        <Stack direction="row" alignItems="center" spacing={1} onClick={() => go('/')} sx={{ cursor: 'pointer', flex: 1 }}>
          <Logo size={26} />
          <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Qpeduli</Typography>
        </Stack>
        <Button size="small" variant="contained" onClick={create}>Buat</Button>
        <IconButton aria-label="Menu" onClick={() => setOpen(true)}><MenuIcon /></IconButton>
      </Box>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: 260, p: 2 } } }}>
        <Stack spacing={2}>
          {account}
          {all.map((l) => (
            <Button key={l.to} startIcon={l.icon} onClick={() => go(l.to)} sx={{ justifyContent: 'flex-start', color: active(l.to) ? 'primary.dark' : 'text.secondary' }}>{l.label}</Button>
          ))}
          {user && <Button startIcon={<LogoutIcon />} color="inherit" onClick={() => { logout(); go('/'); }} sx={{ justifyContent: 'flex-start' }}>Keluar</Button>}
        </Stack>
      </Drawer>

      <Paper elevation={0} sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', left: 8, right: 8, bottom: 8, zIndex: 10, borderRadius: '16px', overflow: 'hidden', ...glass }}>
        <BottomNavigation
          showLabels
          value={tabValue}
          onChange={(_, v) => go(v === '/me' ? (user ? `/profil/${user.username}` : '/masuk') : v)}
          sx={{ bgcolor: 'transparent', height: 56 }}
        >
          <BottomNavigationAction label="Beranda" value="/" icon={<HomeIcon />} />
          <BottomNavigationAction label="Komunitas" value="/komunitas" icon={<ForumIcon />} />
          <BottomNavigationAction label="Usaha" value="/modal-usaha" icon={<StorefrontIcon />} />
          <BottomNavigationAction label={user ? 'Profil' : 'Masuk'} value="/me" icon={<PersonIcon />} />
        </BottomNavigation>
      </Paper>
    </>
  );
}
