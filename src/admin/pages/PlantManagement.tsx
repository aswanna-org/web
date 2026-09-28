import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, Paper, IconButton, Typography, CircularProgress,
  Avatar, Tooltip, Autocomplete
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Grass as GrassIcon, Close as CloseIcon
} from '@mui/icons-material';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Lookup { id: string; name: string; nameSi?: string; }
interface Plant {
  id: string; name: string; sinhalaName?: string; slug: string; description?: string;
  sinhalaDescription?: string; climaticZoneId?: string; soilTypeId?: string; harvestTimeId?: string; image?: string;
  climaticZone?: Lookup; soilType?: Lookup; harvestTime?: Lookup;
}

const defaultForm = { name: '', sinhalaName: '', description: '', sinhalaDescription: '', climaticZoneId: '', soilTypeId: '', harvestTimeId: '', image: '' };

export default function PlantManagement() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filters, setFilters] = useState<{ climaticZones: Lookup[]; soilTypes: Lookup[]; harvestTimes: Lookup[] }>({ climaticZones: [], soilTypes: [], harvestTimes: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchPlants = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/plants?page=${page}&limit=15&search=${search}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPlants(data.data || []);
        if (data.filters) setFilters(data.filters);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPlants(currentPage); }, [currentPage, search]);

  const openCreate = () => { setForm({ ...defaultForm }); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (p: Plant) => {
    setForm({ name: p.name, sinhalaName: p.sinhalaName || '', description: p.description || '', sinhalaDescription: p.sinhalaDescription || '', climaticZoneId: p.climaticZoneId || '', soilTypeId: p.soilTypeId || '', harvestTimeId: p.harvestTimeId || '', image: p.image || '' });
    setEditingId(p.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/plants/${editingId}` : `${API_BASE_URL}/plants`;
    const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
    if (res.ok) { setIsModalOpen(false); fetchPlants(currentPage); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plant?')) return;
    await fetch(`${API_BASE_URL}/plants/${id}`, { method: 'DELETE', headers });
    fetchPlants(currentPage);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>Plant Management</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Manage plant finder database</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
          sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Add Plant
        </Button>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'grey.100', borderRadius: 3 }}>
        <TextField size="small" placeholder="Search plants..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
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
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Plant</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Climatic Zone</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Soil Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Harvest Time</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <GrassIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>No plants found</Typography>
                    </TableCell>
                  </TableRow>
                ) : plants.map(p => (
                  <TableRow key={p.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {p.image && <Avatar src={p.image} variant="rounded" sx={{ width: 36, height: 36 }} />}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{p.name}</Typography>
                          {p.sinhalaName && <Typography variant="caption" sx={{ color: "text.secondary" }}>{p.sinhalaName}</Typography>}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>{p.climaticZone?.name || '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>{p.soilType?.name || '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>{p.harvestTime?.name || '-'}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)} sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main', bgcolor: 'primary.50' } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(p.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: 'error.50' } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? 'Edit Plant' : 'Add Plant'}</Typography>
          <IconButton onClick={() => setIsModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
              {/* Left: Metadata Fields */}
              <Box sx={{ width: { lg: '280px' }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Name (EN) *" size="small" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
                <TextField label="Name (SI)" size="small" value={form.sinhalaName} onChange={e => setForm({ ...form, sinhalaName: e.target.value })} fullWidth />
                <Autocomplete
                  options={filters.climaticZones} getOptionLabel={o => o.name}
                  value={filters.climaticZones.find(z => z.id === form.climaticZoneId) || null}
                  onChange={(_, v) => setForm({ ...form, climaticZoneId: v?.id || '' })}
                  size="small" renderInput={(params) => <TextField {...params} label="Climatic Zone" />}
                />
                <Autocomplete
                  options={filters.soilTypes} getOptionLabel={o => o.name}
                  value={filters.soilTypes.find(s => s.id === form.soilTypeId) || null}
                  onChange={(_, v) => setForm({ ...form, soilTypeId: v?.id || '' })}
                  size="small" renderInput={(params) => <TextField {...params} label="Soil Type" />}
                />
                <Autocomplete
                  options={filters.harvestTimes} getOptionLabel={o => o.name}
                  value={filters.harvestTimes.find(h => h.id === form.harvestTimeId) || null}
                  onChange={(_, v) => setForm({ ...form, harvestTimeId: v?.id || '' })}
                  size="small" renderInput={(params) => <TextField {...params} label="Harvest Time" />}
                />
                <TextField label="Image URL" size="small" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} fullWidth />
              </Box>

              {/* Right: Rich Text Editors side by side */}
              <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Description (EN)</Typography>
                  <Box sx={{ minHeight: 350 }}>
                    <RichTextEditor value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Write description in English..." />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Description (SI)</Typography>
                  <Box sx={{ minHeight: 350 }}>
                    <RichTextEditor value={form.sinhalaDescription} onChange={v => setForm({ ...form, sinhalaDescription: v })} placeholder="Write description in Sinhala..." />
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
              {editingId ? 'Update' : 'Add Plant'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
