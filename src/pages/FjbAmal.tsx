import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/ui/Hero';
import Section from '../components/ui/Section';
import CardGrid from '../components/ui/CardGrid';
import GlossCard from '../components/ui/GlossCard';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import EmptyState from '../components/EmptyState';
import CreateFjbItemDialog from '../components/CreateFjbItemDialog';
import { formatRupiah } from '../data/mockData';
import { userCache as users } from '../lib/adapters';
import { useFjbItems } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import type { FjbItem } from '../types';

const cover = 'linear-gradient(135deg, rgba(31,122,77,0.1), rgba(246,196,83,0.2))';

export default function FjbAmal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<FjbItem | null>(null);
  const [sellOpen, setSellOpen] = useState(false);
  const { data: items = [], isLoading } = useFjbItems();

  const sell = () => (user ? setSellOpen(true) : navigate('/masuk'));
  const filtered = useMemo(() => items.filter((f) => f.title.toLowerCase().includes(query.toLowerCase())), [query, items]);

  return (
    <Box>
      <Hero
        size="md"
        eyebrow={<Chip icon={<StorefrontIcon sx={{ color: '#fff !important' }} />} label="FJB" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />}
        title="Jual Barang, Salurkan Kebaikan"
        subtitle="Hasil penjualan masuk ke dompet kampanye pilihan penjual."
        actions={<Button variant="contained" color="warning" startIcon={<AddCircleIcon />} onClick={sell}>Jual</Button>}
      />

      <Section overlap>
        <GlossCard sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Cari barang atau jasa"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
          />
        </GlossCard>

        {isLoading && <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            icon={<StorefrontIcon />}
            title={query ? 'Tidak ada yang cocok' : 'Belum ada barang'}
            description={query ? 'Coba kata kunci lain.' : 'Jadilah penjual pertama.'}
            action={!query && <Button variant="contained" color="warning" onClick={sell}>Jual</Button>}
          />
        )}

        <CardGrid cols={{ xs: 1, sm: 2, md: 3 }}>
          {filtered.map((item, i) => {
            const seller = users[item.sellerId];
            return (
              <GlossCard key={item.id} flush delay={(i % 3) * 0.06} onClick={item.sold ? undefined : () => setSelected(item)} sx={{ opacity: item.sold ? 0.6 : 1 }}>
                <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, background: cover }}>{item.emoji}</Box>
                <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Stack direction="row" spacing={1} sx={{ minHeight: 28 }}>
                    {item.sold && <Chip label="Terjual" size="small" />}
                    <Chip label={item.condition} size="small" variant="outlined" />
                  </Stack>
                  <Typography fontWeight={700} noWrap>{item.title}</Typography>
                  <Typography variant="h6" color="primary.dark">{formatRupiah(item.price)}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
                    Oleh {seller?.name}
                  </Typography>
                </Box>
              </GlossCard>
            );
          })}
        </CardGrid>
      </Section>

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="xs">
        {selected && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Detail barang
              <IconButton size="small" onClick={() => setSelected(null)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2.5}>
                <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, borderRadius: '12px', background: cover }}>{selected.emoji}</Box>
                <Box>
                  <Typography variant="h6">{selected.title}</Typography>
                  <Typography variant="h5" color="primary.dark" sx={{ mt: 0.5 }}>{formatRupiah(selected.price)}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">{selected.description}</Typography>
                <Alert severity="info" sx={{ borderRadius: '12px' }}>Hasil penjualan disalurkan ke dompet kampanye terkait.</Alert>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelected(null)} color="inherit">Tutup</Button>
              <Button variant="contained" color="warning" onClick={() => setSelected(null)}>Beli</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <CreateFjbItemDialog open={sellOpen} onClose={() => setSellOpen(false)} />
    </Box>
  );
}
