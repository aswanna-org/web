import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, Paper, IconButton, Typography, CircularProgress,
  Tooltip, Chip, Autocomplete
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, LocationOn as MapPinIcon, Close as CloseIcon
} from '@mui/icons-material';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AgroLandType { id: string; name: string; }
interface AgroLand {
  id: string; title: string; titleSi?: string; description?: string; descriptionSi?: string;
  location: string; locationSi?: string; size?: string; sizeSi?: string; price: number;
  contactNumber: string; image?: string; status: string; typeId: string; type?: AgroLandType;
}

const STATUSES = ['Available', 'Sold', 'Pending'];
const defaultForm = {
  title: '', titleSi: '', description: '', descriptionSi: '',
  location: '', locationSi: '', size: '', sizeSi: '',
  price: '', contactNumber: '', image: '', status: 'Available', typeId: ''
};

const statusColors: Record<string, { bg: string; color: string }> = {
  Available: { bg: '#dcfce7', color: '#15803d' },
  Sold: { bg: '#fee2e2', color: '#b91c1c' },
  Pending: { bg: '#fef9c3', color: '#a16207' },
};

export default function AgroLandManagement() {
  const [lands, setLands] = useState<AgroLand[]>([]);
  const [types, setTypes] = useState<AgroLandType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchLands = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/agrolands?page=${page}&limit=15&search=${search}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLands(data.data || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally { setIsLoading(false); }
  };

  const fetchTypes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/agrolands/types`, { headers });
      if (res.ok) setTypes(await res.json());
    } catch (_) {}
  };

  useEffect(() => { fetchLands(currentPage); }, [currentPage, search]);
  useEffect(() => { fetchTypes(); }, []);

  const openCreate = () => { setForm({ ...defaultForm }); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (land: AgroLand) => {
    setForm({ title: land.title, titleSi: land.titleSi || '', description: land.description || '', descriptionSi: land.descriptionSi || '', location: land.location, locationSi: land.locationSi || '', size: land.size || '', sizeSi: land.sizeSi || '', price: String(land.price), contactNumber: land.contactNumber, image: land.image || '', status: land.status, typeId: land.typeId });
    setEditingId(land.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/agrolands/${editingId}` : `${API_BASE_URL}/agrolands`;
    const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
    if (res.ok) { setIsModalOpen(false); fetchLands(currentPage); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this land listing?')) return;
    await fetch(`${API_BASE_URL}/agrolands/${id}`, { method: 'DELETE', headers });
    fetchLands(currentPage);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>Agro Land Management</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Manage agricultural land listings</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
          sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Add Land
        </Button>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'grey.100', borderRadius: 3 }}>
        <TextField size="small" placeholder="Search lands..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment> } }}
          sx={{ maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'grey.100', borderRadius: 3, overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#16a34a' }} />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <MapPinIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>No land listings found</Typography>
                    </TableCell>
                  </TableRow>
                ) : lands.map(land => (
                  <TableRow key={land.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{land.title}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>{land.location}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>Rs. {land.price?.toLocaleString()}</Typography></TableCell>
                    <TableCell>
                      <Chip label={land.status} size="small"
                        sx={{ fontSize: '0.65rem', height: 22, fontWeight: 600, bgcolor: statusColors[land.status]?.bg || '#f3f4f6', color: statusColors[land.status]?.color || '#6b7280' }} />
                    </TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>{land.type?.name || '-'}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(land)} sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main', bgcolor: 'primary.50' } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(land.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: 'error.50' } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </Paper>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="xl" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '92vh', width: '95vw' } } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? 'Edit Land' : 'Add New Land'}</Typography>
          <IconButton onClick={() => setIsModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
              {/* Left: Metadata Fields */}
              <Box sx={{ width: { lg: '300px' }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Title (EN) *" size="small" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth />
                <TextField label="Title (SI)" size="small" value={form.titleSi} onChange={e => setForm({ ...form, titleSi: e.target.value })} fullWidth />
                <TextField label="Location (EN) *" size="small" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} fullWidth />
                <TextField label="Location (SI)" size="small" value={form.locationSi} onChange={e => setForm({ ...form, locationSi: e.target.value })} fullWidth />
                <TextField label="Size (EN)" size="small" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} fullWidth />
                <TextField label="Size (SI)" size="small" value={form.sizeSi} onChange={e => setForm({ ...form, sizeSi: e.target.value })} fullWidth />
                <TextField label="Price (Rs.) *" type="number" size="small" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} fullWidth />
                <TextField label="Contact Number *" size="small" required value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} fullWidth />
                <Autocomplete
                  options={STATUSES} value={form.status} disableClearable
                  onChange={(_, v) => setForm({ ...form, status: v || 'Available' })}
                  size="small" renderInput={(params) => <TextField {...params} label="Status" />}
                />
                <Autocomplete
                  options={types} getOptionLabel={o => o.name} value={types.find(t => t.id === form.typeId) || null}
                  onChange={(_, v) => setForm({ ...form, typeId: v?.id || '' })}
                  size="small" renderInput={(params) => <TextField {...params} label="Type" />}
                />
                <TextField label="Image URL" size="small" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} fullWidth />
              </Box>

              {/* Right: Rich Text Editors side by side */}
              <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Description (EN)</Typography>
                  <Box sx={{ minHeight: 380 }}>
                    <RichTextEditor value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Write land description in English..." />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Description (SI)</Typography>
                  <Box sx={{ minHeight: 380 }}>
                    <RichTextEditor value={form.descriptionSi} onChange={v => setForm({ ...form, descriptionSi: v })} placeholder="Write land description in Sinhala..." />
                  </Box>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
            <Button onClick={() => setIsModalOpen(false)} variant="outlined"
              sx={{ textTransform: 'none', borderRadius: 2, flex: 1, borderColor: 'grey.300', color: 'text.secondary' }}>Cancel</Button>
            <Button type="submit" variant="contained"
              sx={{ textTransform: 'none', borderRadius: 2, flex: 1, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
