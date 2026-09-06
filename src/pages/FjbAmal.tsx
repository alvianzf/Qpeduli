import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '../components/ui/Txt';
import Grid from '../components/ui/FlexGrid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '../components/ui/FlexStack';
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
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';
import { formatRupiah } from '../data/mockData';
import { userCache as users } from '../lib/adapters';
import { useFjbItems } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import CreateFjbItemDialog from '../components/CreateFjbItemDialog';
import EmptyState from '../components/EmptyState';
import type { FjbItem } from '../types';

export default function FjbAmal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<FjbItem | null>(null);
  const [sellOpen, setSellOpen] = useState(false);
  const { data: fjbItems = [], isLoading } = useFjbItems();

  const handleSellClick = () => {
    if (!user) {
      navigate('/masuk');
      return;
    }
    setSellOpen(true);
  };

  const filtered = useMemo(
    () => fjbItems.filter((f) => f.title.toLowerCase().includes(query.toLowerCase())),
    [query, fjbItems],
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      <Box sx={{ background: 'linear-gradient(180deg,#2F4F8A,#4267B2)', color: '#fff', pt: { xs: 6, md: 8 }, pb: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Chip icon={<StorefrontIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} />} label="Forum Jual Beli Amal" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700, mb: 2 }} />
          <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.9rem', md: '2.6rem' }, mb: 1.5 }}>
            Jual Barang, Salurkan Kebaikan
          </Typography>
          <Typography sx={{ opacity: 0.85, maxWidth: 560, mb: 3 }}>
            Setiap barang & jasa di sini terhubung ke sebuah kampanye Aksi Sosial — hasil penjualan otomatis disalurkan ke dompet kampanye pilihan penjual.
          </Typography>
          <Button
            variant="contained"
            color="warning"
            startIcon={<AddCircleIcon />}
            onClick={handleSellClick}
          >
            Jual Barang / Jasa
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -5 }}>
        <Card sx={{ p: 2, mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Cari barang atau jasa amal..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
          />
        </Card>

        {isLoading && (
          <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>
        )}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            icon={<StorefrontIcon fontSize="large" />}
            title={query ? 'Tidak ada barang yang cocok' : 'Belum ada barang atau jasa'}
            description={query ? 'Coba kata kunci lain.' : 'Jadilah penjual pertama di FJB Amal.'}
            action={
              !query && (
                <Button variant="contained" color="warning" onClick={handleSellClick}>
                  Jual Barang / Jasa
                </Button>
              )
            }
          />
        )}

        <Grid container spacing={2.5}>
          {filtered.map((item, i) => {
            const seller = users[item.sellerId];
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card sx={{ height: '100%', opacity: item.sold ? 0.6 : 1 }}>
                    <CardActionArea onClick={() => !item.sold && setSelected(item)} disabled={item.sold}>
                      <Box sx={{
                        height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56,
                        background: 'linear-gradient(135deg, rgba(30,95,224,0.08), rgba(96,165,250,0.15))',
                      }}>
                        {item.emoji}
                      </Box>
                      <CardContent>
                        {item.sold && <Chip label="Terjual" size="small" color="default" sx={{ mb: 1 }} />}
                        <Typography fontWeight={700} sx={{ mb: 0.5 }} noWrap>{item.title}</Typography>
                        <Typography variant="h6" fontWeight={800} color="primary.dark" sx={{ mb: 1 }}>
                          {formatRupiah(item.price)}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <Chip label={item.condition} size="small" variant="outlined" />
                          <Chip label={item.category} size="small" variant="outlined" />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Oleh {seller?.name}
                          {item.campaignTitle && ` · untuk kampanye "${item.campaignTitle.replace('[Aksi Sosial] ', '').slice(0, 40)}..."`}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="xs">
        {selected && (
          <>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Detail Barang
              <IconButton size="small" onClick={() => setSelected(null)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{
                height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, borderRadius: 3, mb: 2,
                background: 'linear-gradient(135deg, rgba(30,95,224,0.08), rgba(96,165,250,0.15))',
              }}>
                {selected.emoji}
              </Box>
              <Typography variant="h6" fontWeight={800}>{selected.title}</Typography>
              <Typography variant="h5" fontWeight={800} color="primary.dark" sx={{ my: 1 }}>{formatRupiah(selected.price)}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{selected.description}</Typography>
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                100% hasil penjualan akan disalurkan otomatis ke dompet kampanye Aksi Sosial terkait.
              </Alert>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelected(null)} color="inherit">Tutup</Button>
              <Button variant="contained" color="warning" onClick={() => setSelected(null)}>Beli Sekarang</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <CreateFjbItemDialog open={sellOpen} onClose={() => setSellOpen(false)} />
    </Box>
  );
}
