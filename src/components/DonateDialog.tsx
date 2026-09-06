import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from './ui/FlexStack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from './ui/Txt';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRupiah } from '../data/mockData';
import type { Thread } from '../types';

const amounts = [50000, 100000, 250000, 500000];

export default function DonateDialog({ open, onClose, thread }: { open: boolean; onClose: () => void; thread: Thread | null }) {
  const [amount, setAmount] = useState<number>(100000);
  const [custom, setCustom] = useState('');
  const [anon, setAnon] = useState(false);
  const [done, setDone] = useState(false);

  const handleClose = () => {
    setDone(false);
    setAmount(100000);
    setCustom('');
    onClose();
  };

  if (!thread) return null;
  const finalAmount = custom ? Number(custom) : amount;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Donasi Sekarang
        <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Stack alignItems="center" spacing={1.5} sx={{ py: 2 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 15 }}
                  style={{ fontSize: 56 }}
                >
                  💙
                </motion.div>
                <Typography variant="h6" fontWeight={800}>Terima kasih!</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Donasi {formatRupiah(finalAmount)} kamu untuk "{thread.title}" berhasil disimulasikan. Kamu mendapat +{Math.round(finalAmount / 10000)} Poin Kebaikan.
                </Typography>
              </Stack>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Untuk: <b>{thread.title}</b>
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {amounts.map((a) => (
                    <Chip
                      key={a}
                      label={formatRupiah(a)}
                      color={amount === a && !custom ? 'primary' : 'default'}
                      onClick={() => {
                        setAmount(a);
                        setCustom('');
                      }}
                      sx={{ fontWeight: 700 }}
                    />
                  ))}
                </Stack>
                <TextField
                  label="Atau nominal lain (Rp)"
                  type="number"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  fullWidth
                />
                <FormControlLabel
                  control={<Checkbox checked={anon} onChange={(e) => setAnon(e.target.checked)} />}
                  label={<Typography variant="body2">Sembunyikan nama saya (donasi anonim)</Typography>}
                />
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  Dana kamu ditahan aman di eskrow Qpeduli dan dicairkan bertahap ke penerima sesuai progres yang terverifikasi.
                </Alert>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {done ? (
          <Button onClick={handleClose} variant="contained" fullWidth>Tutup</Button>
        ) : (
          <>
            <Button onClick={handleClose} color="inherit">Batal</Button>
            <Button onClick={() => setDone(true)} variant="contained" disabled={!finalAmount}>
              Donasi {finalAmount ? formatRupiah(finalAmount) : ''}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
