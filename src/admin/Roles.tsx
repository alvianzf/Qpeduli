import { useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import AdminCard from './AdminCard';
import { lte } from './adminTheme';
import api, { apiErrorMessage } from '../lib/api';
import { useFeedback } from '../feedback/FeedbackProvider';

interface CustomRole { id: number; name: string; description: string | null; permissions: string[]; users: number }
interface Perm { key: string; label: string }

/** Superadmin-only: create, edit and delete custom roles and the console permissions they grant. */
export default function Roles() {
  const qc = useQueryClient();
  const { toast, confirm } = useFeedback();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'roles'], queryFn: async () => (await api.get('/admin/roles')).data });
  const [editing, setEditing] = useState<Partial<CustomRole> | null>(null);
  const [error, setError] = useState('');

  const save = useMutation({
    mutationFn: async (r: Partial<CustomRole>) => {
      const body = { name: r.name, description: r.description ?? '', permissions: r.permissions ?? [] };
      return r.id ? (await api.patch(`/admin/roles/${r.id}`, body)).data : (await api.post('/admin/roles', body)).data;
    },
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: ['admin'] }); setEditing(null); setError(''); toast.success(vars.id ? 'Peran diperbarui.' : 'Peran dibuat.'); },
    onError: (e) => toast.error(apiErrorMessage(e, 'Gagal menyimpan peran.')),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/admin/roles/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin'] }); toast.success('Peran dihapus.'); },
    onError: (e) => toast.error(apiErrorMessage(e, 'Gagal menghapus peran.')),
  });

  if (isLoading || !data) return <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>;
  const perms: Perm[] = data.permissions;
  const label = (k: string) => perms.find((p) => p.key === k)?.label ?? k;
  const toggle = (k: string) => setEditing((r) => r && { ...r, permissions: r.permissions?.includes(k) ? r.permissions.filter((x) => x !== k) : [...(r.permissions ?? []), k] });

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <AdminCard accent={lte.blue} title="Peran bawaan" hint="Tidak bisa diubah atau dihapus" flush>
        <TableContainer>
          <Table size="small">
            <TableHead><TableRow><TableCell>Peran</TableCell><TableCell>Keterangan</TableCell><TableCell align="right">Pengguna</TableCell></TableRow></TableHead>
            <TableBody>
              {data.system.map((r: any) => (
                <TableRow key={r.key} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{r.name}</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell align="right">{r.users}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AdminCard>

      <AdminCard
        accent={lte.orange}
        title="Peran khusus"
        hint="Memberi akses terbatas ke konsol admin tanpa menjadikan seseorang admin penuh"
        tools={<Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setEditing({ name: '', description: '', permissions: [] })}>Tambah peran</Button>}
        flush
      >
        {data.custom.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>Belum ada peran khusus. Contoh: "Petugas keuangan" dengan izin Donasi dan Pencairan.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow><TableCell>Peran</TableCell><TableCell>Izin</TableCell><TableCell align="right">Pengguna</TableCell><TableCell align="right">Aksi</TableCell></TableRow></TableHead>
              <TableBody>
                {data.custom.map((r: CustomRole) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Typography fontWeight={700}>{r.name}</Typography>
                      {r.description && <Typography variant="caption" color="text.secondary">{r.description}</Typography>}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {r.permissions.length ? r.permissions.map((p) => <Chip key={p} size="small" label={label(p)} />) : <Typography variant="caption" color="text.secondary">Tanpa izin</Typography>}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">{r.users}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => setEditing(r)}>Ubah</Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={async () => { if (await confirm({ title: `Hapus peran "${r.name}"?`, text: `${r.users ? `${r.users} pengguna akan kehilangan peran ini dan izinnya. ` : ''}Tindakan ini tidak bisa dibatalkan.`, icon: 'warning', danger: true, confirmText: 'Ya, hapus' })) remove.mutate(r.id); }}>Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AdminCard>

      <Dialog open={!!editing} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>{editing?.id ? 'Ubah peran' : 'Tambah peran'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField label="Nama peran" value={editing?.name ?? ''} onChange={(e) => setEditing((r) => r && { ...r, name: e.target.value })} fullWidth required />
            <TextField label="Keterangan" value={editing?.description ?? ''} onChange={(e) => setEditing((r) => r && { ...r, description: e.target.value })} fullWidth />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Izin konsol</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 2 }}>
                {perms.map((p) => (
                  <FormControlLabel key={p.key} control={<Checkbox size="small" checked={!!editing?.permissions?.includes(p.key)} onChange={() => toggle(p.key)} />} label={<Typography variant="body2">{p.label}</Typography>} />
                ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditing(null)}>Batal</Button>
          <Button variant="contained" disabled={save.isPending || (editing?.name ?? '').trim().length < 2} onClick={() => editing && save.mutate(editing)}>Simpan</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
