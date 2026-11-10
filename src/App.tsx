import { type ReactNode } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Box from '@mui/material/Box';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './layout/Navbar';
import NatureBackground from './components/NatureBackground';
import AdminLayout from './admin/AdminLayout';
import { Dashboard, Campaigns } from './admin/pages';
import { Verification, Donations, Disbursement } from './pages/Admin';
import UsersTable from './admin/UsersTable';
import Roles from './admin/Roles';
import { CreatorDashboard, CreatorFunds, CreatorDonors, CreatorComments, CreatorReports, ReportWizard } from './creator/pages';
import { Analytics, Reports, SettingsPanel, AuditLog } from './pages/AdminExtras';
import ModalUsaha from './pages/ModalUsaha';
import ModalUsahaDetail from './pages/ModalUsahaDetail';
import Footer from './layout/Footer';
import { CreateThreadProvider } from './context/CreateThreadContext';
import Home from './pages/Home';
import Komunitas from './pages/Komunitas';
import ThreadDetail from './pages/ThreadDetail';
import FjbAmal from './pages/FjbAmal';
import Profile from './pages/Profile';
import TrustSafety from './pages/TrustSafety';
import Login from './pages/Login';
import Register from './pages/Register';
import Wilayah from './pages/Wilayah';
import Karhutla from './pages/Karhutla';
import Mitra from './pages/Mitra';
import NotFound from './pages/NotFound';

function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const { user: me, loading: authLoading } = useAuth();
  const inProfileShell = location.pathname.startsWith('/profil/') && (authLoading || !!me);
  const isCreatorArea = location.pathname === '/penggalang' || location.pathname.startsWith('/penggalang/');
  const isAdmin = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const hideChrome = location.pathname === '/masuk' || location.pathname === '/daftar';

  if (inProfileShell) {
    return (
      <CreateThreadProvider>
        <Routes>
          <Route path="/profil/:username" element={<AdminLayout variant="profile" />}>
            <Route index element={<Profile />} />
          </Route>
        </Routes>
      </CreateThreadProvider>
    );
  }

  if (isCreatorArea) {
    return (
      <CreateThreadProvider>
        <Routes>
          <Route path="/penggalang" element={<AdminLayout variant="creator" />}>
            <Route index element={<CreatorDashboard />} />
            <Route path="dana" element={<CreatorFunds />} />
            <Route path="laporan" element={<CreatorReports />} />
            <Route path="laporan/baru" element={<ReportWizard />} />
            <Route path="donatur" element={<CreatorDonors />} />
            <Route path="komentar" element={<CreatorComments />} />
            <Route path="*" element={<Navigate to="/penggalang" replace />} />
          </Route>
        </Routes>
      </CreateThreadProvider>
    );
  }

  if (isAdmin) {
    return (
      <CreateThreadProvider>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analitik" element={<Analytics />} />
            <Route path="laporan" element={<Reports />} />
            <Route path="kampanye" element={<Campaigns />} />
            <Route path="verifikasi" element={<Verification />} />
            <Route path="donasi" element={<Donations />} />
            <Route path="pencairan" element={<Disbursement />} />
            <Route path="pengguna" element={<UsersTable />} />
            <Route path="peran" element={<Roles />} />
            <Route path="pengaturan" element={<SettingsPanel />} />
            <Route path="audit" element={<AuditLog />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </CreateThreadProvider>
    );
  }

  return (
    <CreateThreadProvider>
      <NatureBackground />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {!hideChrome && <Navbar />}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/komunitas" element={<PageTransition><Komunitas /></PageTransition>} />
              <Route path="/komunitas/:slug" element={<PageTransition><Komunitas /></PageTransition>} />
              <Route path="/thread/:id" element={<PageTransition><ThreadDetail /></PageTransition>} />
              <Route path="/modal-usaha" element={<PageTransition><ModalUsaha /></PageTransition>} />
              <Route path="/modal-usaha/:id" element={<PageTransition><ModalUsahaDetail /></PageTransition>} />
              <Route path="/fjb" element={<PageTransition><FjbAmal /></PageTransition>} />
              <Route path="/profil/:username" element={<PageTransition><Profile /></PageTransition>} />
              <Route path="/wilayah/:id" element={<PageTransition><Wilayah /></PageTransition>} />
              <Route path="/karhutla" element={<PageTransition><Karhutla /></PageTransition>} />
              <Route path="/mitra" element={<PageTransition><Mitra /></PageTransition>} />
              <Route path="/keamanan" element={<PageTransition><TrustSafety /></PageTransition>} />
              <Route path="/masuk" element={<PageTransition><Login /></PageTransition>} />
              <Route path="/daftar" element={<PageTransition><Register /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Box>
        {!hideChrome && <Footer />}
      </Box>
    </CreateThreadProvider>
  );
}
