import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, Paper, IconButton, Typography, CircularProgress,
  Tabs, Tab, Select, MenuItem, FormControl, InputLabel, Avatar, Alert
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Close as CloseIcon, CloudUpload as UploadIcon,
  AutoAwesome as SparklesIcon, Schedule as ClockIcon,
  Restore as RestoreIcon, Inventory as PackageIcon, Language as GlobeIcon
} from '@mui/icons-material';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ITEM_DRAFT_KEY = 'aswanna_item_draft';
const DRAFT_EXPIRY_DAYS = 7;
const DRAFT_EXPIRY_MS = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

interface Category { id: string; name: string; }
interface DistrictShare { districtName: string; sinhalaDistrictName: string; percentage: number; }
interface SriLankaAgriData { cultivationArea: string; sinhalaCultivationArea: string; annualProduction: string; sinhalaAnnualProduction: string; averageYield: string; sinhalaAverageYield: string; districts: DistrictShare[]; }
interface GlobalAgriData { rank: number; countryName: string; sinhalaCountryName: string; production: string; cultivationArea: string; }

interface Item {
  id: string; name: string; sinhalaName?: string; slug: string; description?: string;
  sinhalaDescription?: string; scientificName?: string; location?: string; sinhalaLocation?: string;
  status?: string; highestInTheWorld?: string; sinhalaHighestInTheWorld?: string;
  highestInTheWorldUnit?: string;
  images?: string | string[]; categoryId?: string; category?: Category; order?: number;
  slAgriData?: SriLankaAgriData; globalAgriData?: GlobalAgriData[];
}

const defaultForm = {
  name: '', sinhalaName: '', slug: '', scientificName: '', location: '', sinhalaLocation: '', status: 'AVAILABLE',
  highestInTheWorld: '', sinhalaHighestInTheWorld: '', highestInTheWorldUnit: 'HECTARES',
  description: '', sinhalaDescription: '', categoryId: '', order: '0',
  slAgriData: { cultivationArea: '', sinhalaCultivationArea: '', annualProduction: '', sinhalaAnnualProduction: '', averageYield: '', sinhalaAverageYield: '', districts: [] as DistrictShare[] },
  globalAgriData: [] as GlobalAgriData[]
};

interface SavedItemDraft {
  savedAt: number;
  form: typeof defaultForm;
}

const loadItemDraft = (): SavedItemDraft | null => {
  try {
    const raw = localStorage.getItem(ITEM_DRAFT_KEY);
    if (!raw) return null;
    const parsed: SavedItemDraft = JSON.parse(raw);
    if (!parsed || !parsed.savedAt || !parsed.form) return null;
    if (Date.now() - parsed.savedAt > DRAFT_EXPIRY_MS) {
      localStorage.removeItem(ITEM_DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
};

const saveItemDraft = (formData: typeof defaultForm) => {
  try {
    const payload: SavedItemDraft = {
      savedAt: Date.now(),
      form: formData
    };
    localStorage.setItem(ITEM_DRAFT_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save item draft:', e);
  }
};

const clearItemDraft = () => {
  try {
    localStorage.removeItem(ITEM_DRAFT_KEY);
  } catch (e) {
    console.error('Failed to clear item draft:', e);
  }
};

export default function ItemManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [restoredDraftTime, setRestoredDraftTime] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageFile1, setImageFile1] = useState<File | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'EN' | 'SI' | 'SL_DATA' | 'GLOBAL_DATA'>('EN');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Auto-save form draft for 7 days when creating a new item
  useEffect(() => {
    if (isModalOpen && !editingId) {
      const hasData =
        form.name.trim() ||
        form.sinhalaName.trim() ||
        form.scientificName.trim() ||
        form.location.trim() ||
        form.sinhalaLocation.trim() ||
        form.description.trim() ||
        form.sinhalaDescription.trim() ||
        form.categoryId ||
        form.slAgriData.cultivationArea ||
        form.slAgriData.annualProduction ||
        form.globalAgriData.length > 0;

      if (hasData) {
        saveItemDraft(form);
      }
    }
  }, [form, isModalOpen, editingId]);

  const fetchItems = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/items?page=${page}&limit=15`, { headers: authHeaders });
      if (res.ok) { const data = await res.json(); setItems(data.data || []); if (data.meta) setTotalPages(data.meta.totalPages); }
    } finally { setIsLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories?limit=100`, { headers: authHeaders });
      if (res.ok) { const data = await res.json(); setCategories(data.data || []); }
    } catch (_) {}
  };

  useEffect(() => { fetchItems(currentPage); }, [currentPage]);
  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    const draft = loadItemDraft();
    if (draft && draft.form) {
      setForm({ ...defaultForm, ...draft.form });
      setRestoredDraftTime(draft.savedAt);
    } else {
      setForm({ ...defaultForm });
      setRestoredDraftTime(null);
    }
    setImageFile1(null);
    setImageFile2(null);
    setExistingImages([]);
    setEditingId(null);
    setActiveTab('EN');
    setSaveError(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: Item) => {
    setRestoredDraftTime(null);
    setForm({
      name: item.name,
      sinhalaName: item.sinhalaName || '',
      slug: item.slug,
      scientificName: item.scientificName || '',
      location: item.location || '',
      sinhalaLocation: item.sinhalaLocation || '',
      status: item.status || 'AVAILABLE',
      highestInTheWorld: item.highestInTheWorld ?? '',
      sinhalaHighestInTheWorld: item.sinhalaHighestInTheWorld ?? '',
      highestInTheWorldUnit: item.highestInTheWorldUnit ?? 'HECTARES',
      description: item.description || '',
      sinhalaDescription: item.sinhalaDescription || '',
      categoryId: item.categoryId || '',
      order: String(item.order ?? 0),
      slAgriData: {
        cultivationArea: item.slAgriData?.cultivationArea ?? '',
        sinhalaCultivationArea: item.slAgriData?.sinhalaCultivationArea ?? '',
        annualProduction: item.slAgriData?.annualProduction ?? '',
        sinhalaAnnualProduction: item.slAgriData?.sinhalaAnnualProduction ?? '',
        averageYield: item.slAgriData?.averageYield ?? '',
        sinhalaAverageYield: item.slAgriData?.sinhalaAverageYield ?? '',
        districts: (item.slAgriData?.districts ?? []).map(d => ({
          districtName: d.districtName ?? '',
          sinhalaDistrictName: d.sinhalaDistrictName ?? '',
          percentage: d.percentage ?? 0
        }))
      },
      globalAgriData: (item.globalAgriData ?? []).map(g => ({
        rank: g.rank ?? 1,
        countryName: g.countryName ?? '',
        sinhalaCountryName: g.sinhalaCountryName ?? '',
        production: g.production ?? '',
        cultivationArea: g.cultivationArea ?? ''
      }))
    });
    const imgs = Array.isArray(item.images) ? item.images : (item.images ? [item.images as string] : []);
    setExistingImages(imgs); setImageFile1(null); setImageFile2(null); setEditingId(item.id); setActiveTab('EN'); setSaveError(null); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true); setSaveError(null);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (k === 'slAgriData' || k === 'globalAgriData') { fd.append(k, JSON.stringify(v)); } else { fd.append(k, String(v)); } });
    const finalImagesOrder: string[] = [];
    if (imageFile1) { fd.append('images', imageFile1); finalImagesOrder.push('NEW_FILE'); } else if (existingImages[0]) { finalImagesOrder.push(existingImages[0]); } else { finalImagesOrder.push(''); }
    if (imageFile2) { fd.append('images', imageFile2); finalImagesOrder.push('NEW_FILE'); } else if (existingImages[1]) { finalImagesOrder.push(existingImages[1]); } else { finalImagesOrder.push(''); }
    fd.append('imagesOrder', JSON.stringify(finalImagesOrder));
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE_URL}/items/${editingId}` : `${API_BASE_URL}/items`;
      const res = await fetch(url, { method, headers: authHeaders, body: fd });
      if (res.ok) {
        if (!editingId) {
          clearItemDraft();
        }
        setRestoredDraftTime(null);
        setIsModalOpen(false);
        fetchItems(currentPage);
      }
      else { const errData = await res.json().catch(() => ({})); setSaveError(errData.error || `Failed to save item (${res.status}).`); }
    } catch { setSaveError('Network error. Please check your connection.'); } finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`${API_BASE_URL}/items/${id}`, { method: 'DELETE', headers: authHeaders });
    fetchItems(currentPage);
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const editorHeight = 'calc(95vh - 220px)';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── Top Page Bar ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Item Management
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Manage agro information items
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            bgcolor: '#16a34a',
            '&:hover': { bgcolor: '#15803d' },
            textTransform: 'none',
            borderRadius: 2,
            px: 2.5,
            py: 1,
            fontWeight: 700
          }}
        >
          Add Item
        </Button>
      </Box>

      {/* ── Search Bar ── */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <TextField
          size="small"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 400, width: '100%' }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }
          }}
        />
      </Paper>

      {/* ── Table Container ── */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={32} sx={{ color: '#16a34a' }} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Slug</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      <PackageIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography variant="body2">No items found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const imgUrl = item.images && (Array.isArray(item.images) ? item.images[0] : item.images);
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {imgUrl && (
                              <Avatar
                                src={typeof imgUrl === 'string' ? imgUrl : undefined}
                                variant="rounded"
                                sx={{ width: 40, height: 40, bgcolor: 'grey.100' }}
                              />
                            )}
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                              {item.sinhalaName && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{item.sinhalaName}</Typography>}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{item.category?.name || '-'}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>{item.slug}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: 'primary.main' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: 'error.main' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {totalPages > 1 && (
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </Box>
        )}
      </Paper>

      {/* ── Dialog / Form Modal ── */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xl"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              height: '95vh',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column'
            }
          }
        }}
      >
        <DialogTitle sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editingId ? 'Edit Item' : 'Add Item'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Fill in all details below. Required fields are marked with *
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <DialogContent sx={{ p: 0, display: 'flex', flex: 1, minHeight: 0 }}>
            <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
              {/* Left Sidebar Form Inputs */}
              <Box
                sx={{
                  width: 420,
                  minWidth: 420,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  overflowY: 'auto',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                  bgcolor: 'grey.50'
                }}
              >
                {/* 7-Day Auto-Save Draft Notification */}
                {!editingId && (
                  <Alert
                    severity={restoredDraftTime ? 'warning' : 'info'}
                    icon={restoredDraftTime ? <SparklesIcon fontSize="small" /> : <ClockIcon fontSize="small" />}
                    action={
                      restoredDraftTime ? (
                        <Button
                          size="small"
                          color="inherit"
                          startIcon={<RestoreIcon fontSize="small" />}
                          onClick={() => {
                            if (window.confirm('Clear saved draft and start with an empty form?')) {
                              clearItemDraft();
                              setForm({ ...defaultForm });
                              setRestoredDraftTime(null);
                            }
                          }}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Clear Draft
                        </Button>
                      ) : undefined
                    }
                    sx={{ borderRadius: 2 }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                      {restoredDraftTime ? 'Draft Restored (Auto-Saved)' : '7-Day Auto-Save Active'}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                      {restoredDraftTime
                        ? `Saved: ${new Date(restoredDraftTime).toLocaleString()}`
                        : 'Your entered form data will be saved locally for up to 7 days.'}
                    </Typography>
                  </Alert>
                )}

                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Basic Info
                </Typography>

                <TextField
                  label="Name (EN) *"
                  required
                  size="small"
                  value={form.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!editingId) {
                      setForm({ ...form, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') });
                    } else {
                      setForm({ ...form, name: val });
                    }
                  }}
                  fullWidth
                />

                <TextField
                  label="Name (SI)"
                  size="small"
                  value={form.sinhalaName}
                  onChange={(e) => setForm({ ...form, sinhalaName: e.target.value })}
                  fullWidth
                />

                <TextField
                  label="Scientific Name"
                  size="small"
                  value={form.scientificName}
                  onChange={(e) => setForm({ ...form, scientificName: e.target.value })}
                  placeholder="e.g. Oryza sativa"
                  fullWidth
                  slotProps={{ htmlInput: { style: { fontStyle: 'italic' } } }}
                />

                <TextField
                  label="Slug *"
                  required
                  size="small"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  fullWidth
                  slotProps={{ htmlInput: { style: { fontFamily: 'monospace' } } }}
                />

                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={form.categoryId}
                    label="Category"
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Location (EN)"
                    size="small"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Location (SI)"
                    size="small"
                    value={form.sinhalaLocation}
                    onChange={(e) => setForm({ ...form, sinhalaLocation: e.target.value })}
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Order"
                    type="number"
                    size="small"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    fullWidth
                  />
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={form.status}
                      label="Status"
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <MenuItem value="AVAILABLE">Available</MenuItem>
                      <MenuItem value="UNAVAILABLE">Unavailable</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Images */}
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mt: 1 }}>
                  Images
                </Typography>

                {/* Card Image */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Card Image</Typography>
                  {(imageFile1 || existingImages[0]) ? (
                    <Paper elevation={0} sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', aspectRatio: '16/7', bgcolor: 'grey.100' }}>
                      <img
                        src={imageFile1 ? URL.createObjectURL(imageFile1) : existingImages[0]}
                        alt="Card Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', opacity: 0, '&:hover': { opacity: 1 }, transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Button component="label" size="small" variant="contained" startIcon={<UploadIcon />} sx={{ bgcolor: 'white', color: 'text.primary', '&:hover': { bgcolor: 'grey.100' }, textTransform: 'none' }}>
                          Change
                          <input type="file" accept="image/*" hidden onChange={e => setImageFile1(e.target.files?.[0] || null)} />
                        </Button>
                        <Button size="small" variant="contained" color="error" startIcon={<CloseIcon />} onClick={() => { setImageFile1(null); setExistingImages(prev => { const n = [...prev]; n[0] = ''; return n; }); }} sx={{ textTransform: 'none' }}>
                          Remove
                        </Button>
                      </Box>
                    </Paper>
                  ) : (
                    <Button
                      component="label"
                      variant="outlined"
                      sx={{
                        width: '100%',
                        aspectRatio: '16/7',
                        borderRadius: 2,
                        borderStyle: 'dashed',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        textTransform: 'none',
                        color: 'text.secondary'
                      }}
                    >
                      <UploadIcon sx={{ fontSize: 24, color: 'text.disabled' }} />
                      <Typography variant="caption">Click to upload card image</Typography>
                      <input type="file" accept="image/*" hidden onChange={e => setImageFile1(e.target.files?.[0] || null)} />
                    </Button>
                  )}
                </Box>

                {/* Header Image */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Header Image</Typography>
                  {(imageFile2 || existingImages[1]) ? (
                    <Paper elevation={0} sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', aspectRatio: '16/7', bgcolor: 'grey.100' }}>
                      <img
                        src={imageFile2 ? URL.createObjectURL(imageFile2) : existingImages[1]}
                        alt="Header Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', opacity: 0, '&:hover': { opacity: 1 }, transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Button component="label" size="small" variant="contained" startIcon={<UploadIcon />} sx={{ bgcolor: 'white', color: 'text.primary', '&:hover': { bgcolor: 'grey.100' }, textTransform: 'none' }}>
                          Change
                          <input type="file" accept="image/*" hidden onChange={e => setImageFile2(e.target.files?.[0] || null)} />
                        </Button>
                        <Button size="small" variant="contained" color="error" startIcon={<CloseIcon />} onClick={() => { setImageFile2(null); setExistingImages(prev => { const n = [...prev]; n[1] = ''; return n; }); }} sx={{ textTransform: 'none' }}>
                          Remove
                        </Button>
                      </Box>
                    </Paper>
                  ) : (
                    <Button
                      component="label"
                      variant="outlined"
                      sx={{
                        width: '100%',
                        aspectRatio: '16/7',
                        borderRadius: 2,
                        borderStyle: 'dashed',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        textTransform: 'none',
                        color: 'text.secondary'
                      }}
                    >
                      <UploadIcon sx={{ fontSize: 24, color: 'text.disabled' }} />
                      <Typography variant="caption">Click to upload header image</Typography>
                      <input type="file" accept="image/*" hidden onChange={e => setImageFile2(e.target.files?.[0] || null)} />
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Right Tab Panel */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
                <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, bgcolor: 'background.paper' }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, val) => setActiveTab(val)}
                    sx={{
                      '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
                      '& .Mui-selected': { color: '#16a34a' },
                      '& .MuiTabs-indicator': { bgcolor: '#16a34a' }
                    }}
                  >
                    <Tab label="English Details" value="EN" />
                    <Tab label="Sinhala Details" value="SI" />
                    <Tab label="SL Data" value="SL_DATA" />
                    <Tab label="Global Data" value="GLOBAL_DATA" />
                  </Tabs>
                </Box>

                <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                  {/* EN Tab */}
                  {activeTab === 'EN' && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Description (EN)</Typography>
                      <Box sx={{ flex: 1, minHeight: 0 }}>
                        <RichTextEditor
                          value={form.description}
                          onChange={value => setForm({ ...form, description: value })}
                          placeholder="Enter item description in English..."
                          height={editorHeight}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* SI Tab */}
                  {activeTab === 'SI' && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Description (SI)</Typography>
                      <Box sx={{ flex: 1, minHeight: 0 }}>
                        <RichTextEditor
                          value={form.sinhalaDescription}
                          onChange={value => setForm({ ...form, sinhalaDescription: value })}
                          placeholder="Enter item description in Sinhala..."
                          height={editorHeight}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* SL Data Tab */}
                  {activeTab === 'SL_DATA' && (
                    <Box sx={{ height: '100%', overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField label="Cultivation Area" size="small" value={form.slAgriData.cultivationArea} onChange={e => setForm({ ...form, slAgriData: { ...form.slAgriData, cultivationArea: e.target.value } })} fullWidth />
                        <TextField label="Cultivation Area (SI)" size="small" value={form.slAgriData.sinhalaCultivationArea} onChange={e => setForm({ ...form, slAgriData: { ...form.slAgriData, sinhalaCultivationArea: e.target.value } })} fullWidth />
                        <TextField label="Annual Production" size="small" value={form.slAgriData.annualProduction} onChange={e => setForm({ ...form, slAgriData: { ...form.slAgriData, annualProduction: e.target.value } })} fullWidth />
                        <TextField label="Annual Production (SI)" size="small" value={form.slAgriData.sinhalaAnnualProduction} onChange={e => setForm({ ...form, slAgriData: { ...form.slAgriData, sinhalaAnnualProduction: e.target.value } })} fullWidth />
                        <TextField label="Average Yield" size="small" value={form.slAgriData.averageYield} onChange={e => setForm({ ...form, slAgriData: { ...form.slAgriData, averageYield: e.target.value } })} fullWidth />
                        <TextField label="Average Yield (SI)" size="small" value={form.slAgriData.sinhalaAverageYield} onChange={e => setForm({ ...form, slAgriData: { ...form.slAgriData, sinhalaAverageYield: e.target.value } })} fullWidth />
                      </Box>

                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>District Shares</Typography>
                          <Button
                            size="small"
                            onClick={() => setForm({ ...form, slAgriData: { ...form.slAgriData, districts: [...form.slAgriData.districts, { districtName: '', sinhalaDistrictName: '', percentage: 0 }] } })}
                            sx={{ textTransform: 'none', color: '#16a34a', bgcolor: 'rgba(22, 163, 74, 0.1)', '&:hover': { bgcolor: 'rgba(22, 163, 74, 0.2)' } }}
                          >
                            + Add District
                          </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {form.slAgriData.districts.map((d, idx) => (
                            <Paper key={idx} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <TextField placeholder="District (EN)" size="small" value={d.districtName} onChange={e => { const newD = [...form.slAgriData.districts]; newD[idx].districtName = e.target.value; setForm({ ...form, slAgriData: { ...form.slAgriData, districts: newD } }); }} sx={{ flex: 1 }} />
                              <TextField placeholder="District (SI)" size="small" value={d.sinhalaDistrictName} onChange={e => { const newD = [...form.slAgriData.districts]; newD[idx].sinhalaDistrictName = e.target.value; setForm({ ...form, slAgriData: { ...form.slAgriData, districts: newD } }); }} sx={{ flex: 1 }} />
                              <TextField type="number" placeholder="%" size="small" value={d.percentage} onChange={e => { const newD = [...form.slAgriData.districts]; newD[idx].percentage = parseFloat(e.target.value) || 0; setForm({ ...form, slAgriData: { ...form.slAgriData, districts: newD } }); }} sx={{ width: 100 }} />
                              <IconButton size="small" onClick={() => { const newD = form.slAgriData.districts.filter((_, i) => i !== idx); setForm({ ...form, slAgriData: { ...form.slAgriData, districts: newD } }); }} sx={{ color: 'error.main' }}>
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Paper>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Global Data Tab */}
                  {activeTab === 'GLOBAL_DATA' && (
                    <Box sx={{ height: '100%', overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Highest In The World Card */}
                      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'emerald.200', bgcolor: 'rgba(16, 185, 129, 0.05)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: 'emerald.950' }}>
                              <GlobeIcon fontSize="small" sx={{ color: '#16a34a' }} /> Highest In The World (ලෝකයේ වැඩිම අගය)
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Specify the highest global production or cultivation area in Hectares or Acres (අක්කර).
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', bgcolor: 'background.paper', p: 0.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Button
                              size="small"
                              onClick={() => {
                                const prevUnit = form.highestInTheWorldUnit;
                                const num = parseFloat(form.highestInTheWorld.replace(/,/g, ''));
                                let newSi = form.sinhalaHighestInTheWorld;
                                if (!isNaN(num) && prevUnit === 'ACRES') {
                                  const ha = (num / 2.47105).toFixed(2);
                                  newSi = `හෙක්ටයාර ${ha}`;
                                } else if (form.highestInTheWorld) {
                                  newSi = `හෙක්ටයාර ${form.highestInTheWorld}`;
                                }
                                setForm({ ...form, highestInTheWorldUnit: 'HECTARES', sinhalaHighestInTheWorld: newSi });
                              }}
                              variant={form.highestInTheWorldUnit === 'HECTARES' ? 'contained' : 'text'}
                              sx={{
                                textTransform: 'none',
                                size: 'small',
                                py: 0.5,
                                px: 1.5,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                bgcolor: form.highestInTheWorldUnit === 'HECTARES' ? '#16a34a' : 'transparent',
                                '&:hover': { bgcolor: form.highestInTheWorldUnit === 'HECTARES' ? '#15803d' : 'action.hover' }
                              }}
                            >
                              Hectares (හෙක්ටයාර)
                            </Button>
                            <Button
                              size="small"
                              onClick={() => {
                                const prevUnit = form.highestInTheWorldUnit;
                                const num = parseFloat(form.highestInTheWorld.replace(/,/g, ''));
                                let newSi = form.sinhalaHighestInTheWorld;
                                if (!isNaN(num) && prevUnit === 'HECTARES') {
                                  const acres = (num * 2.47105).toFixed(2);
                                  newSi = `අක්කර ${acres}`;
                                } else if (form.highestInTheWorld) {
                                  newSi = `අක්කර ${form.highestInTheWorld}`;
                                }
                                setForm({ ...form, highestInTheWorldUnit: 'ACRES', sinhalaHighestInTheWorld: newSi });
                              }}
                              variant={form.highestInTheWorldUnit === 'ACRES' ? 'contained' : 'text'}
                              sx={{
                                textTransform: 'none',
                                size: 'small',
                                py: 0.5,
                                px: 1.5,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                bgcolor: form.highestInTheWorldUnit === 'ACRES' ? '#16a34a' : 'transparent',
                                '&:hover': { bgcolor: form.highestInTheWorldUnit === 'ACRES' ? '#15803d' : 'action.hover' }
                              }}
                            >
                              Acres / Akkara (අක්කර)
                            </Button>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                          <Box>
                            <TextField
                              label={`Highest In The World (EN) [${form.highestInTheWorldUnit === 'HECTARES' ? 'Hectares (ha)' : 'Acres (ac)'}]`}
                              size="small"
                              placeholder={form.highestInTheWorldUnit === 'HECTARES' ? 'e.g. 1,500,000 ha' : 'e.g. 3,700,000 acres'}
                              value={form.highestInTheWorld}
                              onChange={(e) => {
                                const val = e.target.value;
                                const num = parseFloat(val.replace(/,/g, ''));
                                let autoSi = form.sinhalaHighestInTheWorld;
                                if (!isNaN(num)) {
                                  autoSi = form.highestInTheWorldUnit === 'HECTARES' ? `හෙක්ටයාර ${val}` : `අක්කර ${val}`;
                                }
                                setForm({ ...form, highestInTheWorld: val, sinhalaHighestInTheWorld: autoSi });
                              }}
                              fullWidth
                            />
                            {(() => {
                              const num = parseFloat(form.highestInTheWorld.replace(/,/g, ''));
                              if (!isNaN(num) && num > 0) {
                                if (form.highestInTheWorldUnit === 'HECTARES') {
                                  const acres = (num * 2.47105).toLocaleString(undefined, { maximumFractionDigits: 2 });
                                  return (
                                    <Typography variant="caption" sx={{ color: 'emerald.800', mt: 0.5, display: 'block', fontWeight: 600 }}>
                                      Equivalent: ≈ {acres} Acres (අක්කර)
                                    </Typography>
                                  );
                                } else {
                                  const ha = (num / 2.47105).toLocaleString(undefined, { maximumFractionDigits: 2 });
                                  return (
                                    <Typography variant="caption" sx={{ color: 'emerald.800', mt: 0.5, display: 'block', fontWeight: 600 }}>
                                      Equivalent: ≈ {ha} Hectares (හෙක්ටයාර)
                                    </Typography>
                                  );
                                }
                              }
                              return null;
                            })()}
                          </Box>

                          <Box>
                            <TextField
                              label={`Highest In The World (SI) [${form.highestInTheWorldUnit === 'HECTARES' ? 'හෙක්ටයාර' : 'අක්කර'}]`}
                              size="small"
                              placeholder={form.highestInTheWorldUnit === 'HECTARES' ? 'උදා: හෙක්ටයාර 1,500,000' : 'උදා: අක්කර 3,700,000'}
                              value={form.sinhalaHighestInTheWorld}
                              onChange={(e) => setForm({ ...form, sinhalaHighestInTheWorld: e.target.value })}
                              fullWidth
                            />
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                              සිංහල මාධ්‍යයෙන් පෙන්විය යුතු ආකාරය.
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>

                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Global Production Data</Typography>
                          <Button
                            size="small"
                            onClick={() => setForm({ ...form, globalAgriData: [...form.globalAgriData, { rank: form.globalAgriData.length + 1, countryName: '', sinhalaCountryName: '', production: '', cultivationArea: '' }] })}
                            sx={{ textTransform: 'none', color: '#16a34a', bgcolor: 'rgba(22, 163, 74, 0.1)', '&:hover': { bgcolor: 'rgba(22, 163, 74, 0.2)' } }}
                          >
                            + Add Country
                          </Button>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {form.globalAgriData.map((g, idx) => (
                            <Paper key={idx} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, position: 'relative' }}>
                              <IconButton
                                size="small"
                                onClick={() => { const newG = form.globalAgriData.filter((_, i) => i !== idx); setForm({ ...form, globalAgriData: newG }); }}
                                sx={{ position: 'absolute', top: 8, right: 8, color: 'error.main' }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, pr: 4 }}>
                                <TextField label="Rank" type="number" size="small" value={g.rank} onChange={e => { const newG = [...form.globalAgriData]; newG[idx].rank = parseInt(e.target.value) || 0; setForm({ ...form, globalAgriData: newG }); }} />
                                <TextField label="Production" size="small" value={g.production} onChange={e => { const newG = [...form.globalAgriData]; newG[idx].production = e.target.value; setForm({ ...form, globalAgriData: newG }); }} />
                                <TextField label="Country Name (EN)" size="small" value={g.countryName} onChange={e => { const newG = [...form.globalAgriData]; newG[idx].countryName = e.target.value; setForm({ ...form, globalAgriData: newG }); }} />
                                <TextField label="Country Name (SI)" size="small" value={g.sinhalaCountryName} onChange={e => { const newG = [...form.globalAgriData]; newG[idx].sinhalaCountryName = e.target.value; setForm({ ...form, globalAgriData: newG }); }} />
                                <Box sx={{ gridColumn: 'span 2' }}>
                                  <TextField label="Cultivation Area" size="small" value={g.cultivationArea} onChange={e => { const newG = [...form.globalAgriData]; newG[idx].cultivationArea = e.target.value; setForm({ ...form, globalAgriData: newG }); }} fullWidth />
                                </Box>
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {saveError && (
              <Alert severity="error" sx={{ width: '100%', py: 0.5 }}>
                {saveError}
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Button onClick={() => setIsModalOpen(false)} disabled={isSaving} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, px: 3, borderColor: 'grey.300', color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} variant="contained" sx={{ textTransform: 'none', borderRadius: 2, flex: 1, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, fontWeight: 700 }}>
                {isSaving ? <CircularProgress size={20} color="inherit" /> : (editingId ? 'Update Item' : 'Add Item')}
              </Button>
            </Box>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
