import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from './ui/FlexStack';
import Typography from './ui/Txt';
import { HandHeart } from './art/Nature';
import { formatRupiah } from '../data/mockData';

export interface DonationResult {
  payAmount: number;
  reference: string;
  instructions: string | null;
}

/** What a donor sees after pledging: the exact amount to transfer (with its unique code) and how. */
export default function PaymentSummary({ result, title, note }: { result: DonationResult; title: string; note?: string }) {
  return (
    <Stack alignItems="center" spacing={3} sx={{ py: 2 }}>
      <Box className="float-slow"><HandHeart size={96} /></Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6">Satu langkah lagi</Typography>
        <Typography variant="body2" color="text.secondary">Untuk "{title}"</Typography>
      </Box>

      <Box sx={{ width: '100%', p: 3, borderRadius: '12px', bgcolor: 'rgba(31,122,77,0.08)', textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">Transfer tepat</Typography>
        <Typography variant="h4" color="primary.dark">{formatRupiah(result.payAmount)}</Typography>
        <Typography variant="caption" color="text.secondary">Referensi {result.reference}. Tiga digit terakhir membantu admin mencocokkan pembayaranmu.</Typography>
      </Box>

      {result.instructions ? (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', width: '100%' }}>{result.instructions}</Typography>
      ) : (
        <Alert severity="info" sx={{ width: '100%', borderRadius: '12px' }}>
          Admin akan mengirim instruksi pembayaran. Pledge-mu sudah tercatat.
        </Alert>
      )}
      {note && <Typography variant="caption" color="text.secondary" textAlign="center">{note}</Typography>}
    </Stack>
  );
}
