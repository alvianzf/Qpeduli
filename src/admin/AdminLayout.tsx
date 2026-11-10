import { useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import InsightsIcon from '@mui/icons-material/Insights';
import CampaignIcon from '@mui/icons-material/Campaign';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import DonationIcon from '@mui/icons-material/VolunteerActivism';
import PaymentsIcon from '@mui/icons-material/Payments';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LogoutIcon from '@mui/icons-material/Logout';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useAdminOverview } from '../lib/queries';
import FloatingLeaves from './FloatingLeaves';
import { adminTheme, lte } from './adminTheme';

interface Item { to: string; label: string; icon: React.ReactNode; badge?: number; superOnly?: boolean; end?: boolean }

const FULL = 250;
const MINI = 64;

/** AdminLTE-style shell: dark sidebar, top bar, content header with breadcrumb, light content area. */
export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: ov } = useAdminOverview();
  const [mini, setMini] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  if (loading) return <Stack alignItems="center" sx={{ py: 10 }}><CircularProgress /></Stack>;
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) return <Navigate to="/" replace />;
  const isSuper = user.role === 'SUPERADMIN';

  const groups: { title: string; items: Item[] }[] = [
    { title: 'UTAMA', items: [
      { to: '/admin', label: 'Dashboard', icon: <DashboardIcon />, end: true },
      { to: '/admin/analitik', label: 'Analitik', icon: <InsightsIcon /> },
      { to: '/admin/laporan', label: 'Laporan', icon: <AssessmentIcon /> },
    ] },
    { title: 'OPERASIONAL', items: [
      { to: '/admin/kampanye', label: 'Kampanye', icon: <CampaignIcon /> },
      { to: '/admin/verifikasi', label: 'Verifikasi', icon: <FactCheckIcon />, badge: ov?.pendingCampaigns },
      { to: '/admin/donasi', label: 'Donasi', icon: <DonationIcon />, badge: ov?.pendingDonations },
      { to: '/admin/pencairan', label: 'Pencairan dana', icon: <PaymentsIcon /> },
    ] },
    { title: 'SISTEM', items: [
      { to: '/admin/pengguna', label: 'Pengguna & peran', icon: <PeopleIcon /> },
      { to: '/admin/pengaturan', label: 'Pengaturan', icon: <SettingsIcon /> },
      { to: '/admin/audit', label: 'Log audit', icon: <HistoryIcon />, superOnly: true },
    ] },
  ];
  const flat = groups.flatMap((g) => g.items);
  const current = flat.find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to) && i.to !== '/admin')) ?? flat[0];
  const width = mini ? MINI : FULL;

  const sidebar = (compact: boolean) => (
    <Box sx={{ width: compact ? MINI : FULL, background: lte.sidebar, color: lte.sidebarText, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', transition: 'width .2s ease', position: 'relative', '& > *:not([aria-hidden])': { position: 'relative', zIndex: 1 } }}>
      <FloatingLeaves />
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ height: 57, px: compact ? 1.5 : 2, borderBottom: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/admin')}>
        <Logo size={30} light />
        {!compact && <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem', whiteSpace: 'nowrap' }}>Qpeduli <Box component="span" sx={{ fontWeight: 400, opacity: 0.7 }}>Admin</Box></Typography>}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: compact ? 1.5 : 2, py: 1.75, borderBottom: '1px solid rgba(255,255,255,0.18)' }}>
        <Avatar sx={{ bgcolor: user.avatarColor, width: 36, height: 36, fontWeight: 700 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
        {!compact && (
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{user.name}</Typography>
            <Typography noWrap sx={{ color: lte.sidebarText, fontSize: 12 }}>{isSuper ? 'Superadmin' : 'Admin'}</Typography>
          </Box>
        )}
      </Stack>
      <Box component="nav" sx={{ py: 1, flex: 1 }}>
        {groups.map((g) => {
          const items = g.items.filter((i) => !i.superOnly || isSuper);
          if (!items.length) return null;
          return (
            <Box key={g.title} sx={{ mb: 1 }}>
              {!compact && <Typography sx={{ px: 2, py: 1, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'rgba(255,255,255,0.55)' }}>{g.title}</Typography>}
              {items.map((i) => (
                <Box
                  key={i.to}
                  component={NavLink}
                  to={i.to}
                  end={i.end}
                  onClick={() => setMobile(false)}
                  title={i.label}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, mx: 1, my: 0.25, px: compact ? 1.75 : 1.5, py: 1.1, borderRadius: '4px',
                    color: lte.sidebarText, textDecoration: 'none', fontSize: 14, whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' },
                    '&.active': { bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', boxShadow: 'inset 3px 0 0 #FF7A33' },
                    '& svg': { fontSize: 20, flexShrink: 0 },
                  }}
                >
                  {i.icon}
                  {!compact && <Box sx={{ flex: 1 }}>{i.label}</Box>}
                  {!compact && !!i.badge && <Box sx={{ bgcolor: lte.orange, color: '#fff', borderRadius: '10px', px: 0.9, fontSize: 11, fontWeight: 700, lineHeight: '18px' }}>{i.badge}</Box>}
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.18)' }}>
        <Box
          component="button"
          onClick={() => { logout(); navigate('/'); }}
          title="Keluar"
          sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: compact ? 'center' : 'flex-start', gap: 1.5, px: 1.5, py: 1.1, border: 0, borderRadius: '4px', cursor: 'pointer', font: 'inherit', fontSize: 14, color: '#fff', bgcolor: 'rgba(255,255,255,0.14)', '&:hover': { bgcolor: 'rgba(255,255,255,0.26)' } }}
        >
          <LogoutIcon sx={{ fontSize: 20 }} />
          {!compact && 'Keluar'}
        </Box>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={adminTheme}>
      <Box sx={{ minHeight: '100vh', bgcolor: lte.content, display: 'flex' }}>
        <Box sx={{ display: { xs: 'none', md: 'block' }, width, flexShrink: 0, transition: 'width .2s ease' }}>
          <Box sx={{ position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 20 }}>{sidebar(mini)}</Box>
        </Box>
        <Drawer open={mobile} onClose={() => setMobile(false)} sx={{ display: { md: 'none' } }} slotProps={{ paper: { sx: { background: 'transparent' } } }}>{sidebar(false)}</Drawer>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* top navbar */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ height: 57, px: 2, bgcolor: '#fff', borderBottom: `1px solid ${lte.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
            <IconButton aria-label="Menu" onClick={() => (window.innerWidth >= 900 ? setMini((m) => !m) : setMobile(true))}><MenuIcon /></IconButton>
            <Button component="a" href="/" target="_blank" rel="noreferrer" size="small" endIcon={<OpenInNewIcon fontSize="small" />} sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'text.secondary' }}>Lihat situs</Button>
            <Box sx={{ flex: 1 }} />
            <Button variant="outlined" color="error" size="small" startIcon={<LogoutIcon />} onClick={() => { logout(); navigate('/'); }}>Keluar</Button>
            <Stack direction="row" alignItems="center" spacing={1} onClick={(e) => setAnchor(e.currentTarget as HTMLElement)} sx={{ cursor: 'pointer' }}>
              <Badge color="warning" variant="dot" invisible={!(ov?.pendingCampaigns || ov?.pendingDonations)}>
                <Avatar sx={{ bgcolor: user.avatarColor, width: 32, height: 32, fontWeight: 700 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
              </Badge>
              <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, fontSize: 14 }}>{user.name}</Typography>
            </Stack>
            <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography fontWeight={700}>{user.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user.email ?? `@${user.username}`} · {isSuper ? 'Superadmin' : 'Admin'}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setAnchor(null); navigate(`/profil/${user.username}`); }}>Profil</MenuItem>
              <MenuItem onClick={() => { setAnchor(null); navigate('/'); }}>Ke situs</MenuItem>
              <MenuItem onClick={() => { setAnchor(null); logout(); navigate('/'); }}>Keluar</MenuItem>
            </Menu>
          </Stack>

          {/* content header */}
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={0.5} sx={{ px: 3, pt: 2.5, pb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.6rem' }}>{current.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              <Box component={NavLink} to="/" sx={{ color: lte.blue, textDecoration: 'none' }}>Beranda</Box> / <Box component={NavLink} to="/admin" sx={{ color: lte.blue, textDecoration: 'none' }}>Admin</Box>
              {current.to !== '/admin' && <> / {current.label}</>}
            </Typography>
          </Stack>

          <Box component="main" sx={{ flex: 1, px: 3, pb: 4, pt: 1.5, minWidth: 0 }}>
            <Outlet />
          </Box>
          <Box sx={{ px: 3, py: 1.5, borderTop: `1px solid ${lte.border}`, bgcolor: '#fff', fontSize: 13, color: 'text.secondary' }}>
            <strong>Qpeduli Admin</strong> · PT INI TIKET QUE
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
