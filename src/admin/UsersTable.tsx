import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import Stack from '../components/ui/FlexStack';
import Typography from '../components/ui/Txt';
import AdminCard from './AdminCard';
import UserAvatar from '../components/UserAvatar';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useAdminAction, useAdminList, apiErrorMessage } from '../lib/queries';
import { useFeedback } from '../feedback/FeedbackProvider';

const roleLabel: Record<string, string> = { USER: 'Pengguna', KSATRIA_KOMUNITAS: 'Ksatria Komunitas', PENGGALANG: 'Penggalang Dana', ADMIN: 'Admin', SUPERADMIN: 'Superadmin' };
const roleColor: Record<string, 'default' | 'primary' | 'warning' | 'error'> = { USER: 'default', KSATRIA_KOMUNITAS: 'primary', PENGGALANG: 'primary', ADMIN: 'warning', SUPERADMIN: 'error' };

type SortKey = 'name' | 'username' | 'email' | 'role' | 'karma' | 'createdAt';

/** Users datatable: search, role filter, sortable columns, pagination and inline role / custom-role / verified controls. */
export default function UsersTable() {
  const { user: me } = useAuth();
  const isSuper = me?.role === 'SUPERADMIN';
  const canChangeRole = me?.role === 'ADMIN' || isSuper;
  const { data = [], isLoading } = useAdminList<any>('users', {});
  const { data: roles } = useQuery({ queryKey: ['admin', 'roles'], queryFn: async () => (await api.get('/admin/roles')).data, enabled: isSuper });
  const act = useAdminAction();
  const { toast, confirm } = useFeedback();
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'createdAt', dir: 'desc' });
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);

  const patch = async (u: any, body: Record<string, unknown>) => {
    setError('');
    const high = body.role === 'ADMIN' || body.role === 'SUPERADMIN';
    if (high && !(await confirm({ title: `Jadikan ${roleLabel[body.role as string]}?`, text: `${u.name} akan mendapat akses ${body.role === 'SUPERADMIN' ? 'penuh, termasuk mengelola admin dan peran' : 'admin ke konsol ini'}.`, icon: 'warning', danger: true, confirmText: 'Ya, jadikan' }))) return;
    if (body.role && !high && (u.role === 'ADMIN' || u.role === 'SUPERADMIN') && !(await confirm({ title: 'Turunkan peran?', text: `${u.name} akan kehilangan akses admin.`, icon: 'warning', danger: true, confirmText: 'Ya, turunkan' }))) return;
    try {
      await act.mutateAsync({ method: 'patch', url: `/admin/users/${u.id}`, data: body });
      toast.success(`Pengguna ${u.name} diperbarui.`);
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Perubahan gagal.'));
    }
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = (data as any[]).filter((u) => (!roleFilter || u.role === roleFilter) && (!needle || [u.name, u.username, u.email, u.city].some((v) => (v ?? '').toLowerCase().includes(needle))));
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
      return String(x ?? '').localeCompare(String(y ?? ''), 'id') * dir;
    });
  }, [data, q, roleFilter, sort]);

  const shown = filtered.slice(page * rows, page * rows + rows);
  const head = (key: SortKey, label: string) => (
    <TableCell sortDirection={sort.key === key ? sort.dir : false}>
      <TableSortLabel active={sort.key === key} direction={sort.key === key ? sort.dir : 'asc'} onClick={() => { setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' })); setPage(0); }}>{label}</TableSortLabel>
    </TableCell>
  );
  // Admins can't edit other admins; only a superadmin can.
  const locked = (u: any) => u.id === me?.id || (!isSuper && (u.role === 'ADMIN' || u.role === 'SUPERADMIN'));

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      <AdminCard
        flush
        title={`${filtered.length} pengguna`}
        tools={
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Select size="small" displayEmpty value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
              <MenuItem value="">Semua peran</MenuItem>
              {Object.entries(roleLabel).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </Select>
            <TextField
              size="small"
              placeholder="Cari nama, username, email, kota"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
              sx={{ minWidth: 240 }}
            />
          </Stack>
        }
      >
        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {head('name', 'Pengguna')}
                    {head('email', 'Email')}
                    {head('role', 'Peran')}
                    {isSuper && <TableCell>Peran khusus</TableCell>}
                    <TableCell align="center">Terverifikasi</TableCell>
                    {head('karma', 'Karma')}
                    {head('createdAt', 'Bergabung')}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shown.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <UserAvatar name={u.name} src={u.avatarUrl} color={u.avatarColor || '#4267B2'} size={30} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={600} noWrap>{u.name}</Typography>
                            <Typography variant="caption" color="text.secondary">@{u.username}{u.city ? ` · ${u.city}` : ''}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        {canChangeRole && !locked(u) ? (
                          <Select size="small" value={u.role} disabled={act.isPending} onChange={(e) => patch(u, { role: e.target.value })} sx={{ minWidth: 160 }}>
                            <MenuItem value="USER">Pengguna</MenuItem>
                            <MenuItem value="KSATRIA_KOMUNITAS">Ksatria Komunitas</MenuItem>
                            <MenuItem value="PENGGALANG">Penggalang Dana</MenuItem>
                            <MenuItem value="ADMIN" disabled={!isSuper}>Admin</MenuItem>
                            <MenuItem value="SUPERADMIN" disabled={!isSuper}>Superadmin</MenuItem>
                          </Select>
                        ) : (
                          <Chip size="small" color={roleColor[u.role]} label={roleLabel[u.role]} />
                        )}
                      </TableCell>
                      {isSuper && (
                        <TableCell>
                          <Select
                            size="small"
                            displayEmpty
                            value={u.customRoleId ?? ''}
                            disabled={act.isPending || u.id === me?.id}
                            onChange={(e) => patch(u, { customRoleId: e.target.value === '' ? null : Number(e.target.value) })}
                            sx={{ minWidth: 150 }}
                          >
                            <MenuItem value="">Tidak ada</MenuItem>
                            {(roles?.custom ?? []).map((r: any) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                          </Select>
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <Switch size="small" checked={u.isVerified} disabled={act.isPending || locked(u)} onChange={(e) => patch(u, { isVerified: e.target.checked })} />
                      </TableCell>
                      <TableCell>{u.karma}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                    </TableRow>
                  ))}
                  {!shown.length && <TableRow><TableCell colSpan={7}><Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>Tidak ada pengguna yang cocok.</Typography></TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rows}
              onRowsPerPageChange={(e) => { setRows(Number(e.target.value)); setPage(0); }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Baris per halaman"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
            />
          </>
        )}
      </AdminCard>
    </Stack>
  );
}
