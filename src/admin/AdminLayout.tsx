import { useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
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
import ForumIcon from '@mui/icons-material/Forum';
import ShieldIcon from '@mui/icons-material/AdminPanelSettings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PowerIcon from '@mui/icons-material/PowerSettingsNew';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import Logo from '../components/Logo';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useAdminOverview } from '../lib/queries';
import FloatingLeaves from './FloatingLeaves';
import { adminTheme, lte, profilePalette, creatorPalette } from './adminTheme';

interface Item { to: string; label: string; icon: React.ReactNode; badge?: number; superOnly?: boolean; end?: boolean; perm?: string[] }

const FULL = 250;
const MINI = 64;

/** AdminLTE-style shell: dark sidebar, top bar, content header with breadcrumb, light content area. */
export default function AdminLayout({ variant = 'admin' }: { variant?: 'admin' | 'profile' | 'creator' }) {
  const profile = variant === 'profile';
  const creator = variant === 'creator';
  const pal = profile ? profilePalette : creator ? creatorPalette : lte;
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: ov } = useAdminOverview();
  const [mini, setMini] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  if (loading) return <Stack alignItems="center" sx={{ py: 10 }}><CircularProgress /></Stack>;
  const perms = user?.permissions ?? [];
  if (!user || (!profile && !creator && perms.length === 0)) return <Navigate to={profile || creator ? '/masuk' : '/'} replace />;
  const isSuper = user.role === 'SUPERADMIN';
  const can = (i: Item) => (!i.superOnly || isSuper) && (!i.perm || i.perm.some((p) => perms.includes(p)));

  const adminGroups: { title: string; items: Item[] }[] = [
    { title: 'UTAMA', items: [
      { to: '/admin', label: 'Dashboard', icon: <DashboardIcon />, end: true },
      { to: '/admin/analitik', label: 'Analitik', icon: <InsightsIcon />, perm: ['analitik'] },
      { to: '/admin/laporan', label: 'Laporan', icon: <AssessmentIcon />, perm: ['laporan'] },
    ] },
    { title: 'OPERASIONAL', items: [
      { to: '/admin/kampanye', label: 'Kampanye', icon: <CampaignIcon />, perm: ['kampanye'] },
      { to: '/admin/verifikasi', label: 'Verifikasi', icon: <FactCheckIcon />, badge: ov?.pendingCampaigns, perm: ['verifikasi'] },
      { to: '/admin/donasi', label: 'Donasi', icon: <DonationIcon />, badge: ov?.pendingDonations, perm: ['donasi'] },
      { to: '/admin/pencairan', label: 'Pencairan dana', icon: <PaymentsIcon />, perm: ['pencairan'] },
    ] },
    { title: 'SISTEM', items: [
      { to: '/admin/pengguna', label: 'Pengguna', icon: <PeopleIcon />, perm: ['pengguna'] },
      { to: '/admin/peran', label: 'Peran & izin', icon: <ShieldIcon />, superOnly: true },
      { to: '/admin/pengaturan', label: 'Pengaturan', icon: <SettingsIcon /> },
      { to: '/admin/audit', label: 'Log audit', icon: <HistoryIcon />, superOnly: true },
    ] },
  ];
  const profileGroups: { title: string; items: Item[] }[] = [
    { title: 'AKUN', items: [{ to: `/profil/${user.username}`, label: 'Profil saya', icon: <PeopleIcon />, end: true }] },
    { title: 'JELAJAHI', items: [
      { to: '/', label: 'Beranda', icon: <DashboardIcon />, end: true },
      { to: '/komunitas', label: 'Komunitas', icon: <ForumIcon /> },
      { to: '/modal-usaha', label: 'Modal Usaha', icon: <CampaignIcon /> },
      { to: '/fjb', label: 'FJB Amal', icon: <DonationIcon /> },
    ] },
    ...(perms.length || user.isCreator ? [{ title: 'PENGELOLAAN', items: [...(user.isCreator ? [{ to: '/penggalang', label: 'Konsol penggalang', icon: <CampaignIcon /> }] : []), ...(perms.length ? [{ to: '/admin', label: 'Konsol admin', icon: <ShieldIcon /> }] : [])] }] : []),
  ];
  const creatorGroups: { title: string; items: Item[] }[] = [
    { title: 'RINGKASAN', items: [{ to: '/penggalang', label: 'Dashboard', icon: <DashboardIcon />, end: true }] },
    { title: 'KAMPANYE', items: [
      { to: '/penggalang/dana', label: 'Dana', icon: <PaymentsIcon /> },
      { to: '/penggalang/laporan', label: 'Laporan', icon: <AssessmentIcon /> },
      { to: '/penggalang/donatur', label: 'Donatur', icon: <PeopleIcon /> },
      { to: '/penggalang/komentar', label: 'Komentar', icon: <ForumIcon /> },
    ] },
    { title: 'LAINNYA', items: [{ to: `/profil/${user.username}`, label: 'Profil saya', icon: <PeopleIcon /> }, { to: '/', label: 'Ke situs', icon: <OpenInNewIcon /> }] },
  ];
  const groups = profile ? profileGroups : creator ? creatorGroups : adminGroups;
  const flat = groups.flatMap((g) => g.items).filter(can);
  const current = flat.find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to) && i.to !== '/admin')) ?? flat[0];
  const width = mini ? MINI : FULL;

  const sidebar = (compact: boolean) => (
    <Box sx={{ width: compact ? MINI : FULL, background: pal.sidebar, color: pal.sidebarText, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', transition: 'width .2s ease', position: 'relative', '& > *:not([aria-hidden])': { position: 'relative', zIndex: 1 } }}>
      <FloatingLeaves />
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ height: 57, px: compact ? 1.5 : 2, borderBottom: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate(profile ? '/' : creator ? '/penggalang' : '/admin')}>
        <Logo size={30} light />
        {!compact && <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem', whiteSpace: 'nowrap' }}>Qpeduli <Box component="span" sx={{ fontWeight: 400, opacity: 0.7 }}>{profile ? 'Akun' : creator ? 'Penggalang' : 'Admin'}</Box></Typography>}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: compact ? 1.5 : 2, py: 1.75, borderBottom: '1px solid rgba(255,255,255,0.18)' }}>
        <UserAvatar name={user.name} src={user.avatarUrl} color={user.avatarColor} size={36} />
        {!compact && (
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{user.name}</Typography>
            <Typography noWrap sx={{ color: pal.sidebarText, fontSize: 12 }}>{isSuper ? 'Superadmin' : user.role === 'ADMIN' ? 'Admin' : user.role === 'PENGGALANG' ? 'Penggalang dana' : 'Anggota'}</Typography>
          </Box>
        )}
      </Stack>
      <Box component="nav" sx={{ py: 1, flex: 1 }}>
        {groups.map((g) => {
          const items = g.items.filter(can);
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
                    color: pal.sidebarText, textDecoration: 'none', fontSize: 14, whiteSpace: 'nowrap',
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
          aria-label="Keluar"
          sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: compact ? 'center' : 'flex-start', gap: 1.5, px: 1.5, py: 1.1, border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', fontSize: 14, color: lte.sidebarText, '&:hover': { color: '#fff' }, '&:hover svg': { color: '#FF7A33' } }}
        >
          <PowerIcon sx={{ fontSize: 22, transition: 'color .15s ease' }} />
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
            <Stack direction="row" alignItems="center" spacing={1} onClick={(e) => setAnchor(e.currentTarget as HTMLElement)} sx={{ cursor: 'pointer' }}>
              <Badge color="warning" variant="dot" invisible={!(ov?.pendingCampaigns || ov?.pendingDonations)}>
                <UserAvatar name={user.name} src={user.avatarUrl} color={user.avatarColor} size={32} />
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
              <Box component={NavLink} to="/" sx={{ color: pal.blue, textDecoration: 'none' }}>Beranda</Box> / {profile ? <>Profil</> : creator ? <><Box component={NavLink} to="/penggalang" sx={{ color: pal.blue, textDecoration: 'none' }}>Penggalang</Box>{current.to !== '/penggalang' && <> / {current.label}</>}</> : <><Box component={NavLink} to="/admin" sx={{ color: pal.blue, textDecoration: 'none' }}>Admin</Box>{current.to !== '/admin' && <> / {current.label}</>}</>}
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
