import { useState, type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import CreateThreadDialog from './components/CreateThreadDialog';
import Home from './pages/Home';
import Komunitas from './pages/Komunitas';
import ThreadDetail from './pages/ThreadDetail';
import FjbAmal from './pages/FjbAmal';
import Profile from './pages/Profile';
import TrustSafety from './pages/TrustSafety';
import Login from './pages/Login';
import Register from './pages/Register';
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
  const [createOpen, setCreateOpen] = useState(false);
  const hideChrome = location.pathname === '/masuk' || location.pathname === '/daftar';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideChrome && <Navbar onCreateThread={() => setCreateOpen(true)} />}
      <Box sx={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/komunitas" element={<PageTransition><Komunitas /></PageTransition>} />
            <Route path="/komunitas/:slug" element={<PageTransition><Komunitas /></PageTransition>} />
            <Route path="/thread/:id" element={<PageTransition><ThreadDetail /></PageTransition>} />
            <Route path="/fjb" element={<PageTransition><FjbAmal /></PageTransition>} />
            <Route path="/profil/:username" element={<PageTransition><Profile /></PageTransition>} />
            <Route path="/keamanan" element={<PageTransition><TrustSafety /></PageTransition>} />
            <Route path="/masuk" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/daftar" element={<PageTransition><Register /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Box>
      {!hideChrome && <Footer />}
      <CreateThreadDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  );
}
