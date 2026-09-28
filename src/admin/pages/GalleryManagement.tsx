import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, Paper, IconButton, Typography, CircularProgress,
  Tooltip, Chip, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, CloudUpload as UploadIcon, Close as CloseIcon,
  Image as ImageIcon, VideoLibrary as VideoIcon, PlayCircle as PlayIcon
} from '@mui/icons-material';
import Pagination from '../../components/admin/Pagination';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface GalleryItem {
  id: string;
  title: string;
  sinhalaTitle?: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  description?: string;
  createdAt: string;
}

const defaultForm = { title: '', sinhalaTitle: '', type: 'IMAGE' as 'IMAGE' | 'VIDEO', url: '', description: '' };

export default function GalleryManagement() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof defaultForm>({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchItems = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/gallery?page=${page}&limit=15`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } catch (err) {
      console.error('Fetch gallery error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchItems(currentPage); }, [currentPage]);

  const openCreate = () => {
    setForm({ ...defaultForm });
    setImageFile(null);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setForm({
      title: item.title,
      sinhalaTitle: item.sinhalaTitle || '',
      type: item.type,
      url: item.url,
      description: item.description || ''
    });
    setImageFile(null);
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const getYoutubeThumbnail = (url: string) => {
    if (!url) return '';
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0] || url.split('embed/')[1]?.split('?')[0] || url.split('shorts/')[1]?.split('?')[0];
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  };

  const handleUploadImageFile = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: fd
      });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, url: data.url }));
      } else {
        alert('Failed to upload image file.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('sinhalaTitle', form.sinhalaTitle || '');
      fd.append('type', form.type);
      fd.append('url', form.url || '');
      fd.append('description', form.description || '');

      const slugValue = form.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      fd.append('slug', slugValue || `media-${Date.now()}`);

      if (imageFile) {
        fd.append('file', imageFile);
        fd.append('image', imageFile);
      }

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE_URL}/gallery/${editingId}` : `${API_BASE_URL}/gallery`;

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: fd
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchItems(currentPage);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to save gallery item');
      }
    } catch (err: any) {
      console.error('Error saving gallery item:', err);
      alert('Failed to save gallery item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery media item?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        fetchItems(currentPage);
      } else {
        alert('Failed to delete gallery item.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredItems = items.filter(i => (i.title || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>Gallery Management</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Manage photo gallery uploads and YouTube video links</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Add Media
        </Button>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 3 }}>
        <TextField
          size="small"
          placeholder="Search photos or videos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment> } }}
          sx={{ maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3, overflow: 'hidden' }}>
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
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Preview</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <ImageIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>No gallery media items found</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.map(item => (
                  <TableRow key={item.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                      {item.sinhalaTitle && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{item.sinhalaTitle}</Typography>}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={item.type === 'IMAGE' ? <ImageIcon sx={{ fontSize: '14px !important' }} /> : <VideoIcon sx={{ fontSize: '14px !important' }} />}
                        label={item.type}
                        size="small"
                        sx={{ fontSize: '0.65rem', height: 22, fontWeight: 700, bgcolor: item.type === 'IMAGE' ? '#dbeafe' : '#ede9fe', color: item.type === 'IMAGE' ? '#1d4ed8' : '#6d28d9' }}
                      />
                    </TableCell>
                    <TableCell>
                      {item.type === 'IMAGE' && item.url && (
                        <Box component="img" src={item.url} alt="" sx={{ width: 60, height: 38, borderRadius: 1, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                      )}
                      {item.type === 'VIDEO' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getYoutubeThumbnail(item.url) ? (
                            <Box component="img" src={getYoutubeThumbnail(item.url)} sx={{ width: 60, height: 38, borderRadius: 1, objectFit: 'cover' }} />
                          ) : (
                            <VideoIcon sx={{ color: '#6d28d9' }} />
                          )}
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', maxWidth: 200 }} noWrap>
                            {item.url}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
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
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '92vh' } } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? 'Edit Media Item' : 'Add Media Item'}</Typography>
          <IconButton onClick={() => setIsModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Title (English) *" size="small" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth />
              <TextField label="Title (Sinhala) - මාතෘකාව" size="small" value={form.sinhalaTitle} onChange={e => setForm({ ...form, sinhalaTitle: e.target.value })} fullWidth />
            </Box>

            <FormControl size="small" fullWidth>
              <InputLabel>Media Type (IMAGE / VIDEO) *</InputLabel>
              <Select label="Media Type (IMAGE / VIDEO) *" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'IMAGE' | 'VIDEO' })}>
                <MenuItem value="IMAGE">📷 Photo / Image (ඡායාරූප)</MenuItem>
                <MenuItem value="VIDEO">🎥 YouTube Video (වීඩියෝ)</MenuItem>
              </Select>
            </FormControl>

            {form.type === 'IMAGE' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    label="Image URL"
                    size="small"
                    value={form.url}
                    onChange={e => setForm({ ...form, url: e.target.value })}
                    placeholder="https://..."
                    fullWidth
                  />
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<UploadIcon />}
                    sx={{ textTransform: 'none', shrink: 0, whiteSpace: 'nowrap', height: 40 }}
                  >
                    {isUploadingImage ? '...' : (imageFile ? imageFile.name.slice(0, 12) + '...' : 'Upload Image')}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          handleUploadImageFile(file);
                        }
                      }}
                    />
                  </Button>
                </Box>
                {form.url && (
                  <Box sx={{ display: 'flex', items: 'center', gap: 1 }}>
                    <Box component="img" src={form.url} alt="Preview" sx={{ width: 80, height: 50, borderRadius: 1.5, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center' }}>Live Preview</Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  label="YouTube URL *"
                  size="small"
                  required
                  value={form.url}
                  onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  fullWidth
                />
                {getYoutubeThumbnail(form.url) && (
                  <Box sx={{ display: 'flex', items: 'center', gap: 1.5, p: 1, border: '1px solid #e5e7eb', borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Box component="img" src={getYoutubeThumbnail(form.url)} alt="Preview" sx={{ width: 100, height: 60, borderRadius: 1, objectFit: 'cover' }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PlayIcon fontSize="small" /> YouTube Video Detected
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Thumbnail auto-loaded from YouTube</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            <TextField label="Description (විස්තරය)" size="small" multiline rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
            <Button onClick={() => setIsModalOpen(false)} variant="outlined"
              sx={{ textTransform: 'none', borderRadius: 2, flex: 1, borderColor: 'grey.300', color: 'text.secondary' }}>Cancel</Button>
            <Button type="submit" variant="contained"
              sx={{ textTransform: 'none', borderRadius: 2, flex: 1, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, fontWeight: 700 }}>
              {editingId ? 'Update Media' : 'Add Media'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
