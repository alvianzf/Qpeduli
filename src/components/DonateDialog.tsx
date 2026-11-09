import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from './ui/FlexStack';
import Typography from './ui/Txt';
import PaymentSummary, { type DonationResult } from './PaymentSummary';
import { formatRupiah } from '../data/mockData';
import { useDonate, apiErrorMessage } from '../lib/queries';
import type { Thread } from '../types';

const amounts = [50000, 100000, 250000, 500000];

export default function DonateDialog({ open, onClose, thread }: { open: boolean; onClose: () => void; thread: Thread | null }) {
  const [amount, setAmount] = useState<number>(100000);
  const [custom, setCustom] = useState('');
  const [anon, setAnon] = useState(false);
  const [result, setResult] = useState<DonationResult | null>(null);
  const [error, setError] = useState('');
  const donate = useDonate(thread?.campaign?.id || '');

  const close = () => {
    setResult(null);
    setAmount(100000);
    setCustom('');
    setError('');
    onClose();
  };

  if (!thread) return null;
  const finalAmount = custom ? Number(custom) : amount;

  const submit = async () => {
    setError('');
    try {
      const data = await donate.mutateAsync({ amount: finalAmount, anonymous: anon });
      setResult({ payAmount: data.payAmount, reference: data.reference, instructions: data.instructions });
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal mencatat donasi.'));
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Donasi
        <IconButton onClick={close} size="small" aria-label="Tutup"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {result ? (
          <PaymentSummary result={result} title={thread.title} note="Dana dicatat setelah admin mengonfirmasi penerimaannya." />
        ) : (
          <Stack spacing={3} sx={{ mt: 0.5 }}>
            {error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}
            <Typography variant="body2" color="text.secondary" noWrap>Untuk: <b>{thread.title}</b></Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {amounts.map((a) => (
                <Chip
                  key={a}
                  label={formatRupiah(a)}
                  color={amount === a && !custom ? 'warning' : 'default'}
                  onClick={() => { setAmount(a); setCustom(''); }}
                />
              ))}
            </Stack>
            <TextField label="Nominal lain (Rp)" type="number" value={custom} onChange={(e) => setCustom(e.target.value)} fullWidth />
            <FormControlLabel
              control={<Checkbox checked={anon} onChange={(e) => setAnon(e.target.checked)} />}
              label={<Typography variant="body2">Sembunyikan namaku</Typography>}
            />
            <Alert severity="info" sx={{ borderRadius: '12px' }}>Dana dicairkan bertahap ke penerima sesuai progres yang terverifikasi.</Alert>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {result ? (
          <Button onClick={close} variant="contained" fullWidth>Selesai</Button>
        ) : (
          <>
            <Button onClick={close} color="inherit">Batal</Button>
            <Button onClick={submit} variant="contained" color="warning" disabled={!finalAmount || donate.isPending}>
              {donate.isPending ? 'Memproses...' : finalAmount ? formatRupiah(finalAmount) : 'Donasi'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
