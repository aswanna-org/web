import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, Paper, IconButton, Typography, CircularProgress,
  Chip, FormControlLabel, Tooltip, Autocomplete, Tabs, Tab, Checkbox,
  Select, MenuItem, FormControl, InputLabel, Avatar
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Business as BuildingIcon, Close as CloseIcon,
  Star as StarIcon, CloudUpload as UploadIcon, Man as MaleIcon, Woman as FemaleIcon
} from '@mui/icons-material';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface AscPositionItem {
  id: string;
  title: string;
  titleSi?: string;
  code?: string;
  order?: number;
}

export interface AscDirectoryOfficerItem {
  id: string;
  name: string;
  nameSi?: string;
  phone?: string;
  email?: string;
  nic?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | string;
  positionId?: string;
  positionName?: string;
  positionNameSi?: string;
}

export interface AscOfficerItem {
  id?: string;
  ascId?: string;
  name: string;
  nameSi?: string;
  position: string;
  positionSi?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | string;
  isPrimary?: boolean;
  order?: number;
  positionId?: string;
  officerDirectoryId?: string;
}

export interface ASC {
  id: string;
  ascId: string;
  name: string;
  nameSi?: string;
  province: string;
  district: string;
  officePhone?: string;
  mobilePhone?: string;
  email?: string;
  address?: string;
  addressSi?: string;
  googleMapsUrl?: string;
  officerInCharge?: string;
  officerInChargeSi?: string;
  officerDesignation?: string;
  officerDesignationSi?: string;
  officers?: AscOfficerItem[];
  additionalOfficers?: AscOfficerItem[] | string;
  specialNote?: string;
  specialNoteSi?: string;
}

const SRI_LANKA_PROVINCES: Record<string, string[]> = {
  'Western': ['Colombo', 'Gampaha', 'Kalutara'],
  'Central': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern': ['Galle', 'Matara', 'Hambantota'],
  'Northern': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  'Eastern': ['Batticaloa', 'Ampara', 'Trincomalee'],
  'North Western': ['Kurunegala', 'Puttalam'],
  'North Central': ['Anuradhapura', 'Polonnaruwa'],
  'Uva': ['Badulla', 'Monaragala'],
  'Sabaragamuwa': ['Ratnapura', 'Kegalle']
};

const defaultForm = {
  ascId: '',
  name: '',
  nameSi: '',
  province: '',
  district: '',
  officePhone: '',
  mobilePhone: '',
  email: '',
  address: '',
  addressSi: '',
  googleMapsUrl: '',
  officerInCharge: '',
  officerInChargeSi: '',
  officerDesignation: 'Agrarian Development Officer (ADO)',
  officerDesignationSi: 'ගොවිජන සංවර්ධන නිලධාරී',
  officers: [] as AscOfficerItem[],
  specialNote: '',
  specialNoteSi: ''
};

export const renderOfficerAvatar = (avatarUrl?: string | null, gender?: string, size = 36) => {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return <Avatar src={avatarUrl} sx={{ width: size, height: size, border: '1px solid #bbf7d0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />;
  }
  const isFemale = gender === 'FEMALE';
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: isFemale ? '#fce7f3' : '#e0f2fe',
        color: isFemale ? '#be185d' : '#0369a1',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      {isFemale ? <FemaleIcon fontSize={size >= 36 ? 'medium' : 'small'} /> : <MaleIcon fontSize={size >= 36 ? 'medium' : 'small'} />}
    </Avatar>
  );
};

export default function AscManagement() {
  const [ascs, setAscs] = useState<ASC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [_totalCount, setTotalCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'officers' | 'notes'>('basic');

  // Master Data & Quick Add Modal States
  const [positions, setPositions] = useState<AscPositionItem[]>([]);
  const [officerDirectory, setOfficerDirectory] = useState<AscDirectoryOfficerItem[]>([]);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [isOfficerDirectoryModalOpen, setIsOfficerDirectoryModalOpen] = useState(false);
  const [targetOfficerCardIndex, setTargetOfficerCardIndex] = useState<number | null>(null);
  
  const [newPositionForm, setNewPositionForm] = useState({ title: '', titleSi: '', code: '' });
  const [isSavingPosition, setIsSavingPosition] = useState(false);

  const [newOfficerForm, setNewOfficerForm] = useState({
    name: '', nameSi: '', positionId: '', phone: '', email: '', nic: '', avatar: '', gender: 'MALE'
  });
  const [isSavingOfficerDirectory, setIsSavingOfficerDirectory] = useState(false);

  // Avatar Image Upload States
  const [uploadingOfficerAvatarIndex, setUploadingOfficerAvatarIndex] = useState<number | null>(null);
  const [isUploadingDirectoryAvatar, setIsUploadingDirectoryAvatar] = useState(false);

  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchPositions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/asc-positions`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPositions(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch positions:', err);
    }
  };

  const fetchOfficerDirectory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/officers?all=true`, { headers });
      if (res.ok) {
        const data = await res.json();
        setOfficerDirectory(data.data || data || []);
      }
    } catch (err) {
      console.error('Failed to fetch officer directory:', err);
    }
  };

  const fetchAscs = async (page = 1) => {
    setIsLoading(true);
    try {
      let queryParams = `page=${page}&limit=15&search=${encodeURIComponent(search)}`;
      if (filterProvince) queryParams += `&province=${encodeURIComponent(filterProvince)}`;
      if (filterDistrict) queryParams += `&district=${encodeURIComponent(filterDistrict)}`;

      const res = await fetch(`${API_BASE_URL}/asc?${queryParams}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAscs(data.data || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages);
          setTotalCount(data.meta.total);
        }
      }
    } catch (err) {
      console.error('Failed to fetch ASCs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAscs(currentPage);
    fetchPositions();
    fetchOfficerDirectory();
  }, [currentPage, search, filterProvince, filterDistrict]);

  const extractOfficersList = (asc: ASC): AscOfficerItem[] => {
    if (asc.officers && Array.isArray(asc.officers) && asc.officers.length > 0) {
      return asc.officers;
    }

    if (asc.additionalOfficers) {
      if (Array.isArray(asc.additionalOfficers)) return asc.additionalOfficers;
      if (typeof asc.additionalOfficers === 'string') {
        try {
          const parsed = JSON.parse(asc.additionalOfficers);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // ignore
        }
      }
    }

    // Fallback from main center record if no officers table entries exist yet
    const fallbackList: AscOfficerItem[] = [];
    if (asc.officerInCharge) {
      fallbackList.push({
        name: asc.officerInCharge,
        nameSi: asc.officerInChargeSi || '',
        position: asc.officerDesignation || 'Agrarian Development Officer (ADO)',
        positionSi: asc.officerDesignationSi || 'ගොවිජන සංවර්ධන නිලධාරී',
        phone: asc.mobilePhone || asc.officePhone || '',
        email: asc.email || '',
        isPrimary: true,
        order: 0
      });
    }

    return fallbackList;
  };

  const openCreate = () => {
    setForm({
      ...defaultForm,
      officerInCharge: '',
      officerInChargeSi: '',
      officerDesignation: 'Agrarian Development Officer (ADO)',
      officerDesignationSi: 'ගොවිජන සංවර්ධන නිලධාරී',
      officers: [
        {
          name: '',
          nameSi: '',
          position: 'Agrarian Development Officer (ADO)',
          positionSi: 'ගොවිජන සංවර්ධන නිලධාරී',
          phone: '',
          email: '',
          avatar: '',
          gender: 'MALE',
          isPrimary: true,
          order: 0
        }
      ]
    });
    setEditingId(null);
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const openEdit = (asc: ASC) => {
    const officersList = extractOfficersList(asc);

    setForm({
      ascId: asc.ascId || '',
      name: asc.name || '',
      nameSi: asc.nameSi || '',
      province: asc.province || '',
      district: asc.district || '',
      officePhone: asc.officePhone || '',
      mobilePhone: asc.mobilePhone || '',
      email: asc.email || '',
      address: asc.address || '',
      addressSi: asc.addressSi || '',
      googleMapsUrl: asc.googleMapsUrl || '',
      officerInCharge: asc.officerInCharge || '',
      officerInChargeSi: asc.officerInChargeSi || '',
      officerDesignation: asc.officerDesignation || 'Agrarian Development Officer (ADO)',
      officerDesignationSi: asc.officerDesignationSi || 'ගොවිජන සංවර්ධන නිලධාරී',
      officers: officersList,
      specialNote: asc.specialNote || '',
      specialNoteSi: asc.specialNoteSi || ''
    });
    setEditingId(asc.id);
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  // Upload avatar file for dynamic officer card
  const handleUploadOfficerAvatar = async (index: number, file: File) => {
    if (!file) return;
    setUploadingOfficerAvatarIndex(index);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const targetOfficer = form.officers[index];
      if (targetOfficer?.id) fd.append('officerId', targetOfficer.id);
      if (targetOfficer?.officerDirectoryId) fd.append('directoryId', targetOfficer.officerDirectoryId);

      const res = await fetch(`${API_BASE_URL}/upload/officer-avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          handleUpdateOfficer(index, 'avatar', data.url);
        }
      } else {
        alert('Failed to upload avatar image.');
      }
    } catch (err) {
      console.error('Error uploading officer avatar:', err);
    } finally {
      setUploadingOfficerAvatarIndex(null);
    }
  };

  // Upload avatar file for master officer directory
  const handleUploadDirectoryOfficerAvatar = async (file: File) => {
    if (!file) return;
    setIsUploadingDirectoryAvatar(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE_URL}/upload/officer-avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setNewOfficerForm(prev => ({ ...prev, avatar: data.url }));
        }
      } else {
        alert('Failed to upload directory officer avatar image.');
      }
    } catch (err) {
      console.error('Error uploading directory avatar:', err);
    } finally {
      setIsUploadingDirectoryAvatar(false);
    }
  };

  // Select officer from Directory dropdown
  const handleSelectDirectoryOfficer = (index: number, officerDirId: string) => {
    if (!officerDirId) return;
    const dirOfficer = officerDirectory.find(d => d.id === officerDirId);
    if (dirOfficer) {
      setForm(prev => {
        const updated = [...prev.officers];
        updated[index] = {
          ...updated[index],
          officerDirectoryId: dirOfficer.id,
          name: dirOfficer.name,
          nameSi: dirOfficer.nameSi || '',
          position: dirOfficer.positionName || updated[index].position || 'Officer',
          positionSi: dirOfficer.positionNameSi || updated[index].positionSi || '',
          phone: dirOfficer.phone || updated[index].phone || '',
          email: dirOfficer.email || updated[index].email || '',
          avatar: dirOfficer.avatar || '',
          gender: dirOfficer.gender || 'MALE',
          positionId: dirOfficer.positionId || updated[index].positionId
        };
        return { ...prev, officers: updated };
      });
    }
  };

  // Select position from Positions dropdown
  const handleSelectPosition = (index: number, positionId: string) => {
    if (!positionId) return;
    const pos = positions.find(p => p.id === positionId);
    if (pos) {
      setForm(prev => {
        const updated = [...prev.officers];
        updated[index] = {
          ...updated[index],
          positionId: pos.id,
          position: pos.title,
          positionSi: pos.titleSi || ''
        };
        return { ...prev, officers: updated };
      });
    }
  };

  // Quick Create Position handler
  const handleCreatePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPositionForm.title.trim()) return;
    setIsSavingPosition(true);
    try {
      const res = await fetch(`${API_BASE_URL}/asc-positions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newPositionForm)
      });
      if (res.ok) {
        const createdPos = await res.json();
        await fetchPositions();
        setIsPositionModalOpen(false);
        setNewPositionForm({ title: '', titleSi: '', code: '' });

        if (targetOfficerCardIndex !== null && createdPos?.id) {
          handleSelectPosition(targetOfficerCardIndex, createdPos.id);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create position');
      }
    } catch (err) {
      console.error('Error creating position:', err);
    } finally {
      setIsSavingPosition(false);
    }
  };

  // Quick Create Master Directory Officer handler
  const handleCreateOfficerDirectorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficerForm.name.trim()) return;
    setIsSavingOfficerDirectory(true);
    try {
      const selectedPos = positions.find(p => p.id === newOfficerForm.positionId);
      const payload = {
        ...newOfficerForm,
        positionName: selectedPos?.title || '',
        positionNameSi: selectedPos?.titleSi || ''
      };

      const res = await fetch(`${API_BASE_URL}/officers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdOfficer = await res.json();
        await fetchOfficerDirectory();
        setIsOfficerDirectoryModalOpen(false);
        setNewOfficerForm({ name: '', nameSi: '', positionId: '', phone: '', email: '', nic: '', avatar: '', gender: 'MALE' });

        if (targetOfficerCardIndex !== null && createdOfficer?.id) {
          handleSelectDirectoryOfficer(targetOfficerCardIndex, createdOfficer.id);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create officer in directory');
      }
    } catch (err) {
      console.error('Error creating officer directory item:', err);
    } finally {
      setIsSavingOfficerDirectory(false);
    }
  };

  // Dynamic Officers handlers
  const handleAddOfficer = (isPrimary = false) => {
    setForm(prev => ({
      ...prev,
      officers: [
        ...prev.officers,
        {
          name: '',
          nameSi: '',
          position: '',
          positionSi: '',
          phone: '',
          email: '',
          avatar: '',
          gender: 'MALE',
          isPrimary,
          order: prev.officers.length
        }
      ]
    }));
  };

  const handleUpdateOfficer = (index: number, field: keyof AscOfficerItem, value: any) => {
    setForm(prev => {
      const updated = [...prev.officers];
      
      if (field === 'isPrimary' && value === true) {
        updated.forEach((o, i) => {
          if (i !== index) o.isPrimary = false;
        });
      }

      updated[index] = { ...updated[index], [field]: value };

      const isPrimary = updated[index].isPrimary;
      const isFirst = index === 0 && !updated.some(o => o.isPrimary);
      if (isPrimary || isFirst) {
        const extra: Partial<typeof prev> = {};
        if (field === 'name') extra.officerInCharge = value;
        if (field === 'nameSi') extra.officerInChargeSi = value;
        if (field === 'position') extra.officerDesignation = value;
        if (field === 'positionSi') extra.officerDesignationSi = value;
        return { ...prev, officers: updated, ...extra };
      }

      return { ...prev, officers: updated };
    });
  };

  const handleHeadOfficerChange = (field: 'officerInCharge' | 'officerInChargeSi' | 'officerDesignation' | 'officerDesignationSi', value: string) => {
    setForm(prev => {
      const updatedOfficers = [...prev.officers];
      let primaryIdx = updatedOfficers.findIndex(o => o.isPrimary);
      if (primaryIdx < 0 && updatedOfficers.length > 0) primaryIdx = 0;

      if (primaryIdx >= 0) {
        if (field === 'officerInCharge') updatedOfficers[primaryIdx].name = value;
        if (field === 'officerInChargeSi') updatedOfficers[primaryIdx].nameSi = value;
        if (field === 'officerDesignation') updatedOfficers[primaryIdx].position = value;
        if (field === 'officerDesignationSi') updatedOfficers[primaryIdx].positionSi = value;
      }

      return {
        ...prev,
        [field]: value,
        officers: updatedOfficers
      };
    });
  };

  const handleRemoveOfficer = (index: number) => {
    setForm(prev => ({
      ...prev,
      officers: prev.officers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE_URL}/asc/${editingId}` : `${API_BASE_URL}/asc`;
      
      const primaryOfficer = form.officers.find(o => o.isPrimary) || form.officers[0];
      
      const payload = {
        ...form,
        officerInCharge: primaryOfficer?.name || form.officerInCharge || '',
        officerInChargeSi: primaryOfficer?.nameSi || form.officerInChargeSi || '',
        officerDesignation: primaryOfficer?.position || form.officerDesignation || 'Agrarian Development Officer (ADO)',
        officerDesignationSi: primaryOfficer?.positionSi || form.officerDesignationSi || 'ගොවිජන සංවර්ධන නිලධාරී',
        officers: form.officers
          .filter(o => (o.name && o.name.trim() !== '') || (o.position && o.position.trim() !== ''))
          .map((o, idx) => ({
            name: o.name,
            nameSi: o.nameSi || null,
            position: o.position || 'Officer',
            positionSi: o.positionSi || null,
            phone: o.phone || null,
            email: o.email || null,
            avatar: o.avatar || null,
            gender: o.gender || 'MALE',
            positionId: o.positionId || null,
            officerDirectoryId: o.officerDirectoryId || null,
            isPrimary: Boolean(o.isPrimary),
            order: o.order !== undefined ? Number(o.order) : idx
          }))
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchAscs(currentPage);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save Govijana Sewa Center.');
      }
    } catch (err) {
      console.error('Error saving ASC:', err);
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the Govijana Sewa Center "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/asc/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        fetchAscs(currentPage);
      } else {
        alert('Failed to delete center.');
      }
    } catch (err) {
      console.error('Error deleting ASC:', err);
    }
  };

  const availableFormDistricts = form.province ? (SRI_LANKA_PROVINCES[form.province] || []) : [];
  const availableFilterDistricts = filterProvince ? (SRI_LANKA_PROVINCES[filterProvince] || []) : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>Govijana Sewa Management</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage Agrarian Services Centers, appointed officers table, contacts, and special notices
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Add Govijana Center
        </Button>
      </Box>

      {/* Search & Filters */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search by ASC ID, center name, officer name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment> } }}
          sx={{ flex: 1, minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <Autocomplete
          options={Object.keys(SRI_LANKA_PROVINCES)}
          value={filterProvince || null}
          size="small"
          onChange={(_, v) => { setFilterProvince(v || ''); setFilterDistrict(''); setCurrentPage(1); }}
          renderInput={(params) => <TextField {...params} label="Province" />}
          sx={{ width: 200 }}
        />

        <Autocomplete
          options={availableFilterDistricts}
          value={filterDistrict || null}
          size="small"
          disabled={!filterProvince}
          onChange={(_, v) => { setFilterDistrict(v || ''); setCurrentPage(1); }}
          renderInput={(params) => <TextField {...params} label="District" />}
          sx={{ width: 200 }}
        />
      </Paper>

      {/* Table Card */}
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
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Center Name & ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Officers & Staff</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Special Note</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ascs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <BuildingIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>No Govijana Centers found</Typography>
                    </TableCell>
                  </TableRow>
                ) : ascs.map(asc => {
                  const officersList = extractOfficersList(asc);
                  const primaryOfficer = officersList.find(o => o.isPrimary) || officersList[0];
                  const additionalCount = officersList.filter(o => !o.isPrimary).length;

                  return (
                    <TableRow key={asc.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <BuildingIcon sx={{ color: '#16a34a', mt: 0.5 }} fontSize="small" />
                          <Box>
                            <Chip label={asc.ascId} size="small" sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700, fontFamily: 'monospace' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{asc.name}</Typography>
                            {asc.nameSi && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{asc.nameSi}</Typography>}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{asc.district}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{asc.province} Province</Typography>
                      </TableCell>

                      <TableCell>
                        {primaryOfficer ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {renderOfficerAvatar(primaryOfficer.avatar, primaryOfficer.gender, 32)}
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <StarIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                                {primaryOfficer.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600, display: 'block' }}>{primaryOfficer.position}</Typography>
                              {additionalCount > 0 && (
                                <Chip label={`+${additionalCount} more officers`} size="small" sx={{ fontSize: '0.65rem', height: 18, mt: 0.5, bgcolor: '#eff6ff', color: '#1d4ed8' }} />
                              )}
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>No Officers</Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{asc.officePhone || asc.mobilePhone || '-'}</Typography>
                        {asc.email && <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>{asc.email}</Typography>}
                      </TableCell>

                      <TableCell>
                        {asc.specialNote || asc.specialNoteSi ? (
                          <Chip label="Note Added" size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#fef3c7', color: '#b45309', fontWeight: 600 }} />
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.disabled' }}>-</Typography>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(asc)} sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main', bgcolor: 'primary.50' } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(asc.id, asc.name)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: 'error.50' } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </Paper>

      {/* ================= MAIN ASC MODAL (MUI Dialog) ================= */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="xl" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '92vh', width: '95vw' } } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? 'Edit Govijana Sewa Center' : 'Add New Govijana Sewa Center'}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Center information, dedicated officers table, and special notices</Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50', px: 3 }}>
          <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 }, '& .Mui-selected': { color: '#16a34a' }, '& .MuiTabs-indicator': { bgcolor: '#16a34a' } }}>
            <Tab label="1. Center Details & Contacts" value="basic" />
            <Tab label={`2. Officers & Staff Table (${form.officers.length})`} value="officers" />
            <Tab label="3. Special Notes & Map" value="notes" />
          </Tabs>
        </Box>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
            {/* TAB 1: BASIC DETAILS */}
            {activeTab === 'basic' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                  <TextField label="ASC ID *" size="small" required value={form.ascId} onChange={e => setForm({ ...form, ascId: e.target.value })} fullWidth />
                  <TextField label="Center Name (EN) *" size="small" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
                  <TextField label="Center Name (SI)" size="small" value={form.nameSi} onChange={e => setForm({ ...form, nameSi: e.target.value })} fullWidth />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Autocomplete
                    options={Object.keys(SRI_LANKA_PROVINCES)} value={form.province || null} size="small"
                    onChange={(_, v) => {
                      const newProv = v || '';
                      setForm({ ...form, province: newProv, district: (SRI_LANKA_PROVINCES[newProv] && SRI_LANKA_PROVINCES[newProv][0]) || '' });
                    }}
                    renderInput={(params) => <TextField {...params} label="Province *" required />}
                  />
                  <Autocomplete
                    options={availableFormDistricts} value={form.district || null} size="small" disabled={!form.province}
                    onChange={(_, v) => setForm({ ...form, district: v || '' })}
                    renderInput={(params) => <TextField {...params} label="District *" required />}
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                  <TextField label="Office Landline Phone" size="small" value={form.officePhone} onChange={e => setForm({ ...form, officePhone: e.target.value })} fullWidth />
                  <TextField label="Mobile / WhatsApp Phone" size="small" value={form.mobilePhone} onChange={e => setForm({ ...form, mobilePhone: e.target.value })} fullWidth />
                  <TextField label="Center Email" type="email" size="small" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth />
                </Box>

                {/* Head Officer Summary Card */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid', borderColor: '#bbf7d0', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                    Head Officer In-Charge (ප්‍රධාන නිලධාරී)
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField label="Head Officer Name (English)" size="small" value={form.officerInCharge} onChange={e => handleHeadOfficerChange('officerInCharge', e.target.value)} fullWidth />
                    <TextField label="Head Officer Name (Sinhala) - නිලධාරියාගේ නම (සිංහල)" size="small" value={form.officerInChargeSi} onChange={e => handleHeadOfficerChange('officerInChargeSi', e.target.value)} fullWidth />
                    <TextField label="Officer Designation (English)" size="small" value={form.officerDesignation} onChange={e => handleHeadOfficerChange('officerDesignation', e.target.value)} fullWidth />
                    <TextField label="Officer Designation (Sinhala) - තනතුර (සිංහල)" size="small" value={form.officerDesignationSi} onChange={e => handleHeadOfficerChange('officerDesignationSi', e.target.value)} fullWidth />
                  </Box>
                </Paper>
              </Box>
            )}

            {/* TAB 2: OFFICERS TABLE */}
            {activeTab === 'officers' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Appointed Officers & Staff Table</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Add Head Officer (ADO) and Additional Officers (AI, Field Officers)</Typography>
                  </Box>
                  <Button size="small" onClick={() => handleAddOfficer(false)} startIcon={<AddIcon />} variant="contained"
                    sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, textTransform: 'none', borderRadius: 2 }}>
                    Add Officer
                  </Button>
                </Box>

                {form.officers.length === 0 ? (
                  <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px border-dashed', borderColor: 'grey.300', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>No officers added yet.</Typography>
                    <Button size="small" onClick={() => handleAddOfficer(true)} startIcon={<AddIcon />} variant="outlined" sx={{ textTransform: 'none', color: '#16a34a', borderColor: '#16a34a' }}>
                      Add Primary Officer
                    </Button>
                  </Paper>
                ) : form.officers.map((officer, index) => (
                  <Paper key={index} elevation={0} sx={{ p: 2.5, bgcolor: officer.isPrimary ? '#f0fdf4' : 'grey.50', border: '1px solid', borderColor: officer.isPrimary ? '#bbf7d0' : 'grey.200', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Officer Card Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'grey.200', pb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {renderOfficerAvatar(officer.avatar, officer.gender, 36)}
                        <Chip label={`#${index + 1}`} size="small" sx={{ fontWeight: 700, height: 20 }} />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(officer.isPrimary)}
                              onChange={e => handleUpdateOfficer(index, 'isPrimary', e.target.checked)}
                              sx={{ color: '#16a34a', '&.Mui-checked': { color: '#16a34a' } }}
                            />
                          }
                          label={<Typography variant="body2" sx={{ fontWeight: officer.isPrimary ? 700 : 500, color: officer.isPrimary ? '#15803d' : 'text.primary' }}>{officer.isPrimary ? '⭐ Primary Officer In-Charge (ප්‍රධාන නිලධාරී)' : 'Set as Primary / Head Officer'}</Typography>}
                        />
                      </Box>

                      <IconButton size="small" onClick={() => handleRemoveOfficer(index)} sx={{ color: 'error.main' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Master Dropdowns Toolbar */}
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid', borderColor: '#bbf7d0', borderRadius: 2 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5 }}>
                        {/* Select Officer from Directory */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            Select from Master Officers Directory
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <FormControl fullWidth size="small">
                              <Select
                                value={officer.officerDirectoryId || ''}
                                onChange={e => handleSelectDirectoryOfficer(index, e.target.value)}
                                displayEmpty
                                sx={{ bgcolor: 'white', borderRadius: 1.5 }}
                              >
                                <MenuItem value=""><em>-- Select Existing Officer --</em></MenuItem>
                                {officerDirectory.map(d => (
                                  <MenuItem key={d.id} value={d.id}>{d.name} {d.nameSi ? `(${d.nameSi})` : ''} - {d.positionName || 'Officer'}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Button
                              variant="contained"
                              size="medium"
                              startIcon={<AddIcon />}
                              onClick={() => { setTargetOfficerCardIndex(index); setIsOfficerDirectoryModalOpen(true); }}
                              sx={{
                                bgcolor: '#16a34a',
                                '&:hover': { bgcolor: '#15803d' },
                                textTransform: 'none',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                px: 2,
                                height: 40,
                                borderRadius: 1.5,
                                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                                color: '#ffffff',
                                flexShrink: 0
                              }}
                            >
                              + New Officer
                            </Button>
                          </Box>
                        </Box>

                        {/* Select Master Position */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            Select Master Position / Designation
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <FormControl fullWidth size="small">
                              <Select
                                value={officer.positionId || ''}
                                onChange={e => handleSelectPosition(index, e.target.value)}
                                displayEmpty
                                sx={{ bgcolor: 'white', borderRadius: 1.5 }}
                              >
                                <MenuItem value=""><em>-- Select Master Position --</em></MenuItem>
                                {positions.map(p => (
                                  <MenuItem key={p.id} value={p.id}>{p.title} {p.titleSi ? `(${p.titleSi})` : ''}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Button
                              variant="contained"
                              size="medium"
                              startIcon={<AddIcon />}
                              onClick={() => { setTargetOfficerCardIndex(index); setIsPositionModalOpen(true); }}
                              sx={{
                                bgcolor: '#16a34a',
                                '&:hover': { bgcolor: '#15803d' },
                                textTransform: 'none',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                px: 2,
                                height: 40,
                                borderRadius: 1.5,
                                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                                color: '#ffffff',
                                flexShrink: 0
                              }}
                            >
                              + New Position
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>

                    {/* Officer Form Grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                      <TextField label="Officer Name (English) *" size="small" required value={officer.name} onChange={e => handleUpdateOfficer(index, 'name', e.target.value)} fullWidth />
                      <TextField label="Officer Name (Sinhala) - නම (සිංහල)" size="small" value={officer.nameSi || ''} onChange={e => handleUpdateOfficer(index, 'nameSi', e.target.value)} fullWidth />
                      <TextField label="Position (English) *" size="small" required value={officer.position} onChange={e => handleUpdateOfficer(index, 'position', e.target.value)} fullWidth />
                      <TextField label="Position (Sinhala) - තනතුර (සිංහල)" size="small" value={officer.positionSi || ''} onChange={e => handleUpdateOfficer(index, 'positionSi', e.target.value)} fullWidth />
                      
                      {/* Gender Toggle */}
                      <FormControl fullWidth size="small">
                        <InputLabel>Gender (ස්ත්‍රී / පුරුෂ)</InputLabel>
                        <Select
                          value={officer.gender || 'MALE'}
                          label="Gender (ස්ත්‍රී / පුරුෂ)"
                          onChange={e => handleUpdateOfficer(index, 'gender', e.target.value)}
                        >
                          <MenuItem value="MALE">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <MaleIcon sx={{ color: '#0369a1', fontSize: 20 }} />
                              <span>Male (පිරිමි)</span>
                            </Box>
                          </MenuItem>
                          <MenuItem value="FEMALE">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FemaleIcon sx={{ color: '#be185d', fontSize: 20 }} />
                              <span>Female (කාන්තා)</span>
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>

                      {/* Avatar File Upload + URL */}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {renderOfficerAvatar(officer.avatar, officer.gender, 36)}
                        <TextField
                          label="Avatar Image URL / Upload"
                          size="small"
                          value={officer.avatar || ''}
                          onChange={e => handleUpdateOfficer(index, 'avatar', e.target.value)}
                          fullWidth
                        />
                        <Button
                          component="label"
                          variant="outlined"
                          size="small"
                          startIcon={<UploadIcon />}
                          sx={{ textTransform: 'none', shrink: 0, whiteSpace: 'nowrap' }}
                        >
                          {uploadingOfficerAvatarIndex === index ? '...' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadOfficerAvatar(index, file);
                            }}
                          />
                        </Button>
                      </Box>

                      <TextField label="Phone Number" size="small" value={officer.phone || ''} onChange={e => handleUpdateOfficer(index, 'phone', e.target.value)} fullWidth />
                      <TextField label="Email Address" type="email" size="small" value={officer.email || ''} onChange={e => handleUpdateOfficer(index, 'email', e.target.value)} fullWidth />
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}

            {/* TAB 3: SPECIAL NOTES & MAP */}
            {activeTab === 'notes' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Special Notes & Remarks (Rich Text)</Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>Special Note (English)</Typography>
                    <Box sx={{ minHeight: 280 }}>
                      <RichTextEditor value={form.specialNote} onChange={v => setForm({ ...form, specialNote: v })} placeholder="Write special notice or remarks in English..." />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>Special Note (Sinhala)</Typography>
                    <Box sx={{ minHeight: 280 }}>
                      <RichTextEditor value={form.specialNoteSi} onChange={v => setForm({ ...form, specialNoteSi: v })} placeholder="Write special notice or remarks in Sinhala..." />
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField label="Address (English)" multiline rows={2} size="small" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} fullWidth />
                  <TextField label="Address (Sinhala)" multiline rows={2} size="small" value={form.addressSi} onChange={e => setForm({ ...form, addressSi: e.target.value })} fullWidth />
                </Box>
                <TextField label="Google Maps URL" size="small" value={form.googleMapsUrl} onChange={e => setForm({ ...form, googleMapsUrl: e.target.value })} fullWidth />
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
            <Button onClick={() => setIsModalOpen(false)} variant="outlined"
              sx={{ textTransform: 'none', borderRadius: 2, flex: 1, borderColor: 'grey.300', color: 'text.secondary' }}>Cancel</Button>
            <Button type="submit" disabled={isSaving} variant="contained"
              sx={{ textTransform: 'none', borderRadius: 2, flex: 1, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}>
              {isSaving ? <CircularProgress size={20} color="inherit" /> : (editingId ? 'Update Center' : 'Save Center')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ================= MUI DIALOG: QUICK ADD POSITION ================= */}
      <Dialog open={isPositionModalOpen} onClose={() => setIsPositionModalOpen(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Add New Master Position</Typography>
          <IconButton onClick={() => setIsPositionModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>

        <form onSubmit={handleCreatePositionSubmit}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Position Title (English) *" size="small" required value={newPositionForm.title} onChange={e => setNewPositionForm({ ...newPositionForm, title: e.target.value })} fullWidth />
            <TextField label="Position Title (Sinhala) - තනතුර (සිංහල)" size="small" value={newPositionForm.titleSi} onChange={e => setNewPositionForm({ ...newPositionForm, titleSi: e.target.value })} fullWidth />
            <TextField label="Position Code (Optional)" size="small" value={newPositionForm.code} onChange={e => setNewPositionForm({ ...newPositionForm, code: e.target.value })} fullWidth />
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => setIsPositionModalOpen(false)} variant="outlined" sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" disabled={isSavingPosition} variant="contained" sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, textTransform: 'none' }}>
              {isSavingPosition ? <CircularProgress size={20} color="inherit" /> : 'Create Position'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ================= MUI DIALOG: QUICK ADD OFFICER TO DIRECTORY ================= */}
      <Dialog open={isOfficerDirectoryModalOpen} onClose={() => setIsOfficerDirectoryModalOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Add Officer to Master Directory</Typography>
          <IconButton onClick={() => setIsOfficerDirectoryModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>

        <form onSubmit={handleCreateOfficerDirectorySubmit}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField label="Full Name (English) *" size="small" required value={newOfficerForm.name} onChange={e => setNewOfficerForm({ ...newOfficerForm, name: e.target.value })} fullWidth />
              <TextField label="Full Name (Sinhala) - නම (සිංහල)" size="small" value={newOfficerForm.nameSi} onChange={e => setNewOfficerForm({ ...newOfficerForm, nameSi: e.target.value })} fullWidth />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Primary Position</InputLabel>
                <Select
                  value={newOfficerForm.positionId}
                  label="Primary Position"
                  onChange={e => setNewOfficerForm({ ...newOfficerForm, positionId: e.target.value })}
                >
                  <MenuItem value=""><em>Select Position</em></MenuItem>
                  {positions.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Gender (ස්ත්‍රී / පුරුෂ)</InputLabel>
                <Select
                  value={newOfficerForm.gender}
                  label="Gender (ස්ත්‍රී / පුරුෂ)"
                  onChange={e => setNewOfficerForm({ ...newOfficerForm, gender: e.target.value })}
                >
                  <MenuItem value="MALE">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MaleIcon sx={{ color: '#0369a1', fontSize: 20 }} />
                      <span>Male (පිරිමි)</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value="FEMALE">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FemaleIcon sx={{ color: '#be185d', fontSize: 20 }} />
                      <span>Female (කාන්තා)</span>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField label="Phone Number" size="small" value={newOfficerForm.phone} onChange={e => setNewOfficerForm({ ...newOfficerForm, phone: e.target.value })} fullWidth />
              <TextField label="Email Address" type="email" size="small" value={newOfficerForm.email} onChange={e => setNewOfficerForm({ ...newOfficerForm, email: e.target.value })} fullWidth />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField label="NIC Number" size="small" value={newOfficerForm.nic} onChange={e => setNewOfficerForm({ ...newOfficerForm, nic: e.target.value })} fullWidth />
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {renderOfficerAvatar(newOfficerForm.avatar, newOfficerForm.gender, 36)}
                <TextField
                  label="Avatar Image URL / Upload"
                  size="small"
                  value={newOfficerForm.avatar}
                  onChange={e => setNewOfficerForm({ ...newOfficerForm, avatar: e.target.value })}
                  fullWidth
                />
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<UploadIcon />}
                  sx={{ textTransform: 'none', shrink: 0, whiteSpace: 'nowrap' }}
                >
                  {isUploadingDirectoryAvatar ? '...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadDirectoryOfficerAvatar(file);
                    }}
                  />
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => setIsOfficerDirectoryModalOpen(false)} variant="outlined" sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" disabled={isSavingOfficerDirectory} variant="contained" sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, textTransform: 'none' }}>
              {isSavingOfficerDirectory ? <CircularProgress size={20} color="inherit" /> : 'Add Officer to Directory'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
