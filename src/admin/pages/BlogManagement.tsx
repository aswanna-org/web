import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, Paper, IconButton, Typography, CircularProgress,
  Avatar, Tooltip
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Article as ArticleIcon, CloudUpload as UploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface BlogItem {
  id: string; title?: string; sinhalaTitle?: string; slug?: string;
  content?: string; sinhalaContent?: string; image?: string;
  authorName?: string; authorEmail?: string; authorAvatar?: string; createdAt: string;
}

const defaultForm = { title: '', sinhalaTitle: '', slug: '', content: '', sinhalaContent: '', image: '', authorName: '', authorEmail: '', authorAvatar: '' };

export default function BlogManagement() {
  const [items, setItems] = useState<BlogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem('admin_token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchItems = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/blogs?page=${page}&limit=15`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(currentPage); }, [currentPage]);

  const openCreate = () => { setForm({ ...defaultForm }); setImageFile(null); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (item: BlogItem) => {
    setForm({ title: item.title || '', sinhalaTitle: item.sinhalaTitle || '', slug: item.slug || '', content: item.content || '', sinhalaContent: item.sinhalaContent || '', image: item.image || '', authorName: item.authorName || '', authorEmail: item.authorEmail || '', authorAvatar: item.authorAvatar || '' });
    setImageFile(null); setEditingId(item.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
    if (imageFile) fd.append('image', imageFile);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/blogs/${editingId}` : `${API_BASE_URL}/blogs`;
    try {
      const res = await fetch(url, { method, headers: authHeaders, body: fd });
      if (res.ok) { setIsModalOpen(false); fetchItems(currentPage); }
      else { const err = await res.json(); alert(`Error: ${err.error || 'Failed to save'}`); }
    } catch { alert('Network error occurred.'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    await fetch(`${API_BASE_URL}/blogs/${id}`, { method: 'DELETE', headers: authHeaders });
    fetchItems(currentPage);
  };

  const filteredItems = items.filter(i => (i.title || i.sinhalaTitle || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>Blog Management</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Manage blog posts and articles</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
          sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Add Post
        </Button>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'grey.100', borderRadius: 3 }}>
        <TextField size="small" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)}
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
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Author</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Slug</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <ArticleIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>No blog posts found</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.map(item => (
                  <TableRow key={item.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {item.image && <Avatar src={item.image} variant="rounded" sx={{ width: 36, height: 36 }} />}
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500, maxWidth: 240 }}>{item.title || item.sinhalaTitle || 'Untitled'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>{item.authorName || '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.disabled", fontFamily: 'monospace', fontSize: '0.7rem' }}>{item.slug || '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>{new Date(item.createdAt).toLocaleDateString()}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(item)} sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main', bgcolor: 'primary.50' } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: 'error.50' } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? 'Edit Post' : 'Add New Post'}</Typography>
          <IconButton onClick={() => setIsModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>

              {/* Left: Metadata Fields */}
              <Box sx={{ width: { lg: '280px' }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Title (EN)" size="small" value={form.title} onChange={e => {
                  const val = e.target.value;
                  if (!editingId) setForm({ ...form, title: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') });
                  else setForm({ ...form, title: val });
                }} fullWidth />
                <TextField label="Title (SI)" size="small" value={form.sinhalaTitle} onChange={e => setForm({ ...form, sinhalaTitle: e.target.value })} fullWidth />
                <TextField label="Slug" size="small" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} fullWidth />
                <TextField label="Author Name" size="small" value={form.authorName} onChange={e => setForm({ ...form, authorName: e.target.value })} fullWidth />
                <TextField label="Author Email" type="email" size="small" value={form.authorEmail} onChange={e => setForm({ ...form, authorEmail: e.target.value })} fullWidth />
                <Button component="label" variant="outlined" startIcon={<UploadIcon />} size="small" fullWidth
                  sx={{ textTransform: 'none', borderColor: 'grey.300', color: 'text.secondary', height: 40, justifyContent: 'flex-start', px: 2 }}>
                  {imageFile ? imageFile.name : 'Featured Image...'}
                  <input type="file" hidden accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                </Button>
              </Box>

              {/* Right: EN + SI Rich Text Editors side by side */}
              <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Content (EN)</Typography>
                  <Box sx={{ minHeight: 380 }}>
                    <RichTextEditor value={form.content} onChange={v => setForm({ ...form, content: v })} placeholder="Write blog content in English..." />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Content (SI)</Typography>
                  <Box sx={{ minHeight: 380 }}>
                    <RichTextEditor value={form.sinhalaContent} onChange={v => setForm({ ...form, sinhalaContent: v })} placeholder="Write blog content in Sinhala..." />
                  </Box>
                </Box>
              </Box>

            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
            <Button onClick={() => setIsModalOpen(false)} disabled={isSaving} variant="outlined"
              sx={{ textTransform: 'none', borderRadius: 2, flex: 1, borderColor: 'grey.300', color: 'text.secondary' }}>Cancel</Button>
            <Button type="submit" disabled={isSaving} variant="contained"
              sx={{ textTransform: 'none', borderRadius: 2, flex: 1, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}>
              {isSaving ? <CircularProgress size={20} color="inherit" /> : (editingId ? 'Update' : 'Publish')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
