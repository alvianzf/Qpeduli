import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from './ui/FlexStack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from './ui/Txt';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import { alpha } from '@mui/material/styles';
import { formatRupiah } from '../data/mockData';
import { useDonateToProject, apiErrorMessage } from '../lib/queries';
import { brand } from '../theme/theme';
import PaymentSummary, { type DonationResult } from './PaymentSummary';
import type { ModalUsaha } from '../types';

export default function BackProjectDialog({
  open,
  onClose,
  project,
  initialRewardId,
}: {
  open: boolean;
  onClose: () => void;
  project: ModalUsaha;
  initialRewardId?: string;
}) {
  const initial = project.rewards.find((x) => x.id === initialRewardId);
  const [rewardId, setRewardId] = useState<string>(initialRewardId || '');
  const [amount, setAmount] = useState(initial ? String(initial.minAmount) : '');
  const [anon, setAnon] = useState(false);
  const [result, setResult] = useState<DonationResult | null>(null);
  const [error, setError] = useState('');
  const donate = useDonateToProject(project.campaign.id);

  const chosen = project.rewards.find((r) => r.id === rewardId);
  const value = Number(amount);
  const tooLow = chosen && value < chosen.minAmount;

  const pick = (id: string) => {
    setRewardId(id);
    const r = project.rewards.find((x) => x.id === id);
    if (r && Number(amount) < r.minAmount) setAmount(String(r.minAmount));
  };

  const submit = async () => {
    setError('');
    try {
      const data = await donate.mutateAsync({ amount: value, anonymous: anon, rewardId: rewardId || undefined });
      setResult({ payAmount: data.payAmount, reference: data.reference, instructions: data.instructions });
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal mencatat dukungan.'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Dukung Usaha Ini
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {result ? (
          <PaymentSummary
            result={result}
            title={project.title}
            note={chosen ? `Hadiah "${chosen.title}" dikirim pemilik usaha setelah dana dikonfirmasi.` : undefined}
          />
        ) : (
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}
            <Typography variant="body2" color="text.secondary">
              Untuk: <b>{project.title}</b>
            </Typography>

            <Stack spacing={1}>
              <Typography variant="subtitle2">Pilih hadiah (opsional)</Typography>
              <RewardOption
                selected={rewardId === ''}
                onClick={() => pick('')}
                title="Dukung tanpa hadiah"
                caption="Nominal bebas"
              />
              {project.rewards.map((r) => (
                <RewardOption
                  key={r.id}
                  selected={rewardId === r.id}
                  onClick={() => pick(r.id)}
                  title={r.title}
                  caption={`Mulai ${formatRupiah(r.minAmount)}${r.stock !== null ? ` · sisa terbatas (${r.stock})` : ''}`}
                  body={r.description}
                />
              ))}
            </Stack>

            <TextField
              label="Nominal dukungan (Rp)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={Boolean(tooLow)}
              helperText={tooLow ? `Minimal ${formatRupiah(chosen!.minAmount)} untuk hadiah ini` : ' '}
              fullWidth
            />
            <FormControlLabel
              control={<Checkbox checked={anon} onChange={(e) => setAnon(e.target.checked)} />}
              label={<Typography variant="body2">Sembunyikan nama saya</Typography>}
            />
            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              Dana dicairkan bertahap sesuai milestone usaha yang terverifikasi.
            </Alert>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {result ? (
          <Button onClick={onClose} variant="contained" fullWidth>Selesai</Button>
        ) : (
          <>
            <Button onClick={onClose} color="inherit">Batal</Button>
            <Button onClick={submit} variant="contained" color="warning" disabled={!value || value <= 0 || Boolean(tooLow) || donate.isPending}>
              {donate.isPending ? 'Memproses...' : value > 0 ? formatRupiah(value) : 'Dukung'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

function RewardOption({
  selected,
  onClick,
  title,
  caption,
  body,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  caption: string;
  body?: string;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'flex-start',
        p: 1.5,
        borderRadius: '12px',
        cursor: 'pointer',
        border: `1.5px solid ${selected ? brand.primary : brand.line}`,
        bgcolor: selected ? alpha(brand.primary, 0.07) : '#fff',
        transition: 'all .15s ease',
        '&:hover': { borderColor: brand.mid },
      }}
    >
      <Radio checked={selected} size="small" sx={{ p: 0.25, mt: 0.25 }} />
      <Box>
        <Typography fontWeight={700} variant="body2">{title}</Typography>
        <Typography variant="caption" color="text.secondary">{caption}</Typography>
        {body && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{body}</Typography>}
      </Box>
    </Box>
  );
}
