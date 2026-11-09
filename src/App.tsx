import { type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './layout/Navbar';
import { CONTENT_ML, CONTENT_MAX } from './layout/layoutConst';
import NatureBackground from './components/NatureBackground';
import Admin from './pages/Admin';
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
  const hideChrome = location.pathname === '/masuk' || location.pathname === '/daftar';

  return (
    <CreateThreadProvider>
      <NatureBackground />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {!hideChrome && <Navbar />}
        <Box sx={{ flex: 1, minWidth: 0, ...(hideChrome ? {} : { ml: { md: `${CONTENT_ML}px` }, mr: { md: 2 }, px: { xs: 1, md: 0 }, pt: 1.5, maxWidth: { md: CONTENT_MAX } }) }}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/komunitas" element={<PageTransition><Komunitas /></PageTransition>} />
              <Route path="/komunitas/:slug" element={<PageTransition><Komunitas /></PageTransition>} />
              <Route path="/thread/:id" element={<PageTransition><ThreadDetail /></PageTransition>} />
              <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
              <Route path="/modal-usaha" element={<PageTransition><ModalUsaha /></PageTransition>} />
              <Route path="/modal-usaha/:id" element={<PageTransition><ModalUsahaDetail /></PageTransition>} />
              <Route path="/fjb" element={<PageTransition><FjbAmal /></PageTransition>} />
              <Route path="/profil/:username" element={<PageTransition><Profile /></PageTransition>} />
              <Route path="/mitra" element={<PageTransition><Mitra /></PageTransition>} />
              <Route path="/keamanan" element={<PageTransition><TrustSafety /></PageTransition>} />
              <Route path="/masuk" element={<PageTransition><Login /></PageTransition>} />
              <Route path="/daftar" element={<PageTransition><Register /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Box>
        {!hideChrome && <Box sx={{ ml: { md: `${CONTENT_ML}px` }, mr: { md: 2 }, px: { xs: 1, md: 0 }, maxWidth: { md: CONTENT_MAX } }}><Footer /></Box>}
      </Box>
    </CreateThreadProvider>
  );
}
