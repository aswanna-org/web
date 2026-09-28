import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, Paper, IconButton, Typography, CircularProgress,
  Avatar, Tooltip, Autocomplete
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, ShoppingBag as ShoppingBagIcon, CloudUpload as UploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Product {
  id: string; name: string; sinhalaName?: string; slug: string; description?: string; sinhalaDescription?: string;
  price?: number; quantity?: number; image?: string; category?: string; categorySinhala?: string;
}

const PREDEFINED_CATEGORIES = ['Pohora', 'Upakarana', 'Bija', 'Prakashana'];
const defaultForm = { name: '', sinhalaName: '', slug: '', description: '', sinhalaDescription: '', price: '', quantity: '', image: '', category: '', categorySinhala: '' };

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const token = localStorage.getItem('admin_token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products?page=${page}&limit=15&search=${search}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || data.products || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchProducts(currentPage); }, [currentPage, search]);

  const openCreate = () => { setForm({ ...defaultForm }); setImageFile(null); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (prod: Product) => {
    setForm({ name: prod.name, sinhalaName: prod.sinhalaName || '', slug: prod.slug, description: prod.description || '', sinhalaDescription: prod.sinhalaDescription || '', price: String(prod.price ?? ''), quantity: String(prod.quantity ?? ''), category: prod.category || '', categorySinhala: prod.categorySinhala || '', image: '' });
    setImageFile(null); setEditingId(prod.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/products/${editingId}` : `${API_BASE_URL}/products`;
    const res = await fetch(url, { method, headers: authHeaders, body: fd });
    if (res.ok) { setIsModalOpen(false); fetchProducts(currentPage); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE', headers: authHeaders });
    fetchProducts(currentPage);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>Product Management</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Manage marketplace products</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
          sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Add Product
        </Button>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'grey.100', borderRadius: 3 }}>
        <TextField size="small" placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
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
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Qty</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <ShoppingBagIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>No products found</Typography>
                    </TableCell>
                  </TableRow>
                ) : products.map(p => (
                  <TableRow key={p.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {p.image && <Avatar src={p.image} variant="rounded" sx={{ width: 36, height: 36 }} />}
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{p.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>{p.category || '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>Rs. {p.price?.toLocaleString() || '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>{p.quantity ?? '-'}</Typography></TableCell>
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
        slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '92vh' } } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? 'Edit Product' : 'Add Product'}</Typography>
          <IconButton onClick={() => setIsModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
              {/* Left: Basic Fields */}
              <Box sx={{ width: { lg: '33%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Name (EN) *" size="small" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
                <TextField label="Name (SI)" size="small" value={form.sinhalaName} onChange={e => setForm({ ...form, sinhalaName: e.target.value })} fullWidth />
                <TextField label="Slug *" size="small" required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} fullWidth />
                <Autocomplete
                  options={PREDEFINED_CATEGORIES} value={form.category || null} size="small"
                  onChange={(_, v) => setForm({ ...form, category: v || '' })}
                  renderInput={(params) => <TextField {...params} label="Category" />}
                />
                <TextField label="Category (SI)" size="small" value={form.categorySinhala} onChange={e => setForm({ ...form, categorySinhala: e.target.value })} fullWidth />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField label="Price (Rs.)" type="number" size="small" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                  <TextField label="Quantity" type="number" size="small" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                </Box>
                <Button component="label" variant="outlined" startIcon={<UploadIcon />} size="small" fullWidth
                  sx={{ textTransform: 'none', borderColor: 'grey.300', color: 'text.secondary', height: 40, justifyContent: 'flex-start', px: 2 }}>
                  {imageFile ? imageFile.name : 'Product Image...'}
                  <input type="file" hidden accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                </Button>
              </Box>
              {/* Right: Rich Text Editors side by side */}
              <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Description (EN)</Typography>
                  <Box sx={{ minHeight: 350 }}>
                    <RichTextEditor value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Enter product description in English..." />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Description (SI)</Typography>
                  <Box sx={{ minHeight: 350 }}>
                    <RichTextEditor value={form.sinhalaDescription} onChange={v => setForm({ ...form, sinhalaDescription: v })} placeholder="Enter product description in Sinhala..." />
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
              {editingId ? 'Update' : 'Add Product'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
