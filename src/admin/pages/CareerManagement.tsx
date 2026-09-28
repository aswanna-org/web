import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, Paper, IconButton, Typography, CircularProgress,
  Tooltip, Chip, Switch, FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Work as WorkIcon, Close as CloseIcon
} from '@mui/icons-material';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Job {
  id: string; title: string; sinhalaTitle?: string; description: string;
  sinhalaDescription?: string; location: string; sinhalaLocation?: string;
  isActive: boolean; createdAt: string;
}

const defaultForm = { title: '', sinhalaTitle: '', description: '', sinhalaDescription: '', location: '', sinhalaLocation: '', isActive: true };

export default function CareerManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof defaultForm>({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchJobs = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/careers/openings?page=${page}&limit=15`, { headers });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.data || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchJobs(currentPage); }, [currentPage]);

  const openCreate = () => { setForm({ ...defaultForm }); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (job: Job) => {
    setForm({ title: job.title, sinhalaTitle: job.sinhalaTitle || '', description: job.description, sinhalaDescription: job.sinhalaDescription || '', location: job.location, sinhalaLocation: job.sinhalaLocation || '', isActive: job.isActive });
    setEditingId(job.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/careers/openings/${editingId}` : `${API_BASE_URL}/careers/openings`;
    const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
    if (res.ok) { setIsModalOpen(false); fetchJobs(currentPage); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job opening?')) return;
    await fetch(`${API_BASE_URL}/careers/openings/${id}`, { method: 'DELETE', headers });
    fetchJobs(currentPage);
  };

  const filteredJobs = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>Career Management</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Manage job openings and applications</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
          sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Add Job
        </Button>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'grey.100', borderRadius: 3 }}>
        <TextField size="small" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)}
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
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <WorkIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>No job openings found</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredJobs.map(job => (
                  <TableRow key={job.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{job.title}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>{job.location}</Typography></TableCell>
                    <TableCell>
                      <Chip label={job.isActive ? 'Active' : 'Inactive'} size="small"
                        sx={{ fontSize: '0.65rem', height: 22, bgcolor: job.isActive ? '#dcfce7' : '#f3f4f6', color: job.isActive ? '#15803d' : '#6b7280', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>{new Date(job.createdAt).toLocaleDateString()}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(job)} sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main', bgcolor: 'primary.50' } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(job.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: 'error.50' } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? 'Edit Job' : 'Add New Job'}</Typography>
          <IconButton onClick={() => setIsModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
              {/* Left: Metadata Fields */}
              <Box sx={{ width: { lg: '280px' }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Title (EN) *" size="small" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth />
                <TextField label="Title (SI)" size="small" value={form.sinhalaTitle} onChange={e => setForm({ ...form, sinhalaTitle: e.target.value })} fullWidth />
                <TextField label="Location" size="small" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} fullWidth />
                <TextField label="Location (SI)" size="small" value={form.sinhalaLocation} onChange={e => setForm({ ...form, sinhalaLocation: e.target.value })} fullWidth />
                <FormControlLabel
                  control={<Switch checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#16a34a' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#16a34a' } }} />}
                  label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Active (visible to public)</Typography>}
                />
              </Box>

              {/* Right: EN + SI Rich Text Editors side by side */}
              <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Description (EN) *</Typography>
                  <Box sx={{ minHeight: 350 }}>
                    <RichTextEditor value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Write job description in English..." />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Description (SI)</Typography>
                  <Box sx={{ minHeight: 350 }}>
                    <RichTextEditor value={form.sinhalaDescription} onChange={v => setForm({ ...form, sinhalaDescription: v })} placeholder="Write job description in Sinhala..." />
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
              {editingId ? 'Update' : 'Post Job'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
