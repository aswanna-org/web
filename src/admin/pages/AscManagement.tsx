import { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, X, Search, Building2, Phone, Mail,
  MapPin, StickyNote, Users, ExternalLink, CheckCircle2, ChevronRight,
  Star, Briefcase, AlertCircle, Loader2, Upload, User
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import { compressImageFile } from '../../utils/imageCompressor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface AscPositionItem {
  id: string;
  title: string;
  titleSi?: string | null;
  code?: string | null;
  order?: number;
  createdAt?: string;
  _count?: {
    officers?: number;
    ascOfficers?: number;
  };
}

export interface AscDepartmentItem {
  id: string;
  name: string;
  nameSi?: string | null;
  code?: string | null;
  order?: number;
  createdAt?: string;
  _count?: {
    officers?: number;
    ascOfficers?: number;
  };
}

export interface AscOfficerItem {
  id?: string;
  name: string;
  nameSi?: string;
  position: string;
  positionSi?: string;
  departmentId?: string;
  departmentName?: string;
  departmentNameSi?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | string;
  isPrimary?: boolean;
  order?: number;
  positionId?: string;
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
  const [totalCount, setTotalCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'officers' | 'notes'>('basic');

  // Positions state
  const [positions, setPositions] = useState<AscPositionItem[]>([]);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [positionForm, setPositionForm] = useState({
    title: '',
    titleSi: '',
    code: '',
    order: 0
  });
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null);
  const [isSavingPosition, setIsSavingPosition] = useState(false);
  const [positionError, setPositionError] = useState<string | null>(null);

  // Departments state
  const [departments, setDepartments] = useState<AscDepartmentItem[]>([]);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    nameSi: '',
    code: '',
    order: 0
  });
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [isSavingDepartment, setIsSavingDepartment] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  // Avatar upload loading state
  const [uploadingAvatarIndex, setUploadingAvatarIndex] = useState<number | null>(null);

  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchPositions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/asc-positions`);
      if (res.ok) {
        const data = await res.json();
        setPositions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch ASC positions:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/asc-departments`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch ASC departments:', err);
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
  }, [currentPage, search, filterProvince, filterDistrict]);

  useEffect(() => {
    fetchPositions();
    fetchDepartments();
  }, []);

  const handleSavePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionForm.title.trim()) {
      setPositionError('Position title (English) is required.');
      return;
    }
    setIsSavingPosition(true);
    setPositionError(null);
    try {
      const method = editingPositionId ? 'PUT' : 'POST';
      const url = editingPositionId
        ? `${API_BASE_URL}/asc-positions/${editingPositionId}`
        : `${API_BASE_URL}/asc-positions`;

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          title: positionForm.title.trim(),
          titleSi: positionForm.titleSi.trim() || null,
          code: positionForm.code.trim() || null,
          order: Number(positionForm.order) || 0
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save position.');
      }

      await fetchPositions();
      setPositionForm({ title: '', titleSi: '', code: '', order: positions.length + 1 });
      setEditingPositionId(null);
    } catch (err: any) {
      setPositionError(err.message || 'Error occurred while saving position.');
    } finally {
      setIsSavingPosition(false);
    }
  };

  const handleDeletePosition = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete position "${title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/asc-positions/${id}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        await fetchPositions();
        if (editingPositionId === id) {
          setEditingPositionId(null);
          setPositionForm({ title: '', titleSi: '', code: '', order: 0 });
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to delete position.');
      }
    } catch (err) {
      console.error('Error deleting position:', err);
    }
  };

  const handleStartEditPosition = (pos: AscPositionItem) => {
    setEditingPositionId(pos.id);
    setPositionForm({
      title: pos.title,
      titleSi: pos.titleSi || '',
      code: pos.code || '',
      order: pos.order ?? 0
    });
    setPositionError(null);
  };

  const handleCancelEditPosition = () => {
    setEditingPositionId(null);
    setPositionForm({ title: '', titleSi: '', code: '', order: positions.length + 1 });
    setPositionError(null);
  };

  // Departments Handlers
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentForm.name.trim()) {
      setDepartmentError('Department name (English) is required.');
      return;
    }
    setIsSavingDepartment(true);
    setDepartmentError(null);
    try {
      const method = editingDepartmentId ? 'PUT' : 'POST';
      const url = editingDepartmentId
        ? `${API_BASE_URL}/asc-departments/${editingDepartmentId}`
        : `${API_BASE_URL}/asc-departments`;

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          name: departmentForm.name.trim(),
          nameSi: departmentForm.nameSi.trim() || null,
          code: departmentForm.code.trim() || null,
          order: Number(departmentForm.order) || 0
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save department.');
      }

      await fetchDepartments();
      setDepartmentForm({ name: '', nameSi: '', code: '', order: departments.length + 1 });
      setEditingDepartmentId(null);
    } catch (err: any) {
      setDepartmentError(err.message || 'Error occurred while saving department.');
    } finally {
      setIsSavingDepartment(false);
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete department "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/asc-departments/${id}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        await fetchDepartments();
        if (editingDepartmentId === id) {
          setEditingDepartmentId(null);
          setDepartmentForm({ name: '', nameSi: '', code: '', order: 0 });
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to delete department.');
      }
    } catch (err) {
      console.error('Error deleting department:', err);
    }
  };

  const handleStartEditDepartment = (dept: AscDepartmentItem) => {
    setEditingDepartmentId(dept.id);
    setDepartmentForm({
      name: dept.name,
      nameSi: dept.nameSi || '',
      code: dept.code || '',
      order: dept.order ?? 0
    });
    setDepartmentError(null);
  };

  const handleCancelEditDepartment = () => {
    setEditingDepartmentId(null);
    setDepartmentForm({ name: '', nameSi: '', code: '', order: departments.length + 1 });
    setDepartmentError(null);
  };

  // Upload avatar file for officer
  const handleUploadOfficerAvatar = async (index: number, file: File) => {
    if (!file) return;
    setUploadingAvatarIndex(index);
    try {
      const optimized = await compressImageFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.85 });
      const fd = new FormData();
      fd.append('image', optimized);

      const targetOfficer = form.officers[index];
      if (targetOfficer?.id) fd.append('officerId', targetOfficer.id);

      const res = await fetch(`${API_BASE_URL}/upload/officer-avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      if (res.ok) {
        const data = await res.json();
        handleUpdateOfficer(index, 'avatar', data.url);
      } else {
        alert('Failed to upload officer avatar.');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      alert('An error occurred during image upload.');
    } finally {
      setUploadingAvatarIndex(null);
    }
  };

  const extractOfficersList = (asc: ASC): AscOfficerItem[] => {
    if (asc.officers && Array.isArray(asc.officers) && asc.officers.length > 0) {
      return asc.officers.map(o => {
        const matchedPos = positions.find(
          p => p.id === o.positionId || p.title.toLowerCase() === o.position?.toLowerCase()
        );
        const matchedDept = departments.find(
          d => d.id === o.departmentId || d.name.toLowerCase() === (o.departmentName || '').toLowerCase()
        );
        return {
          ...o,
          positionId: matchedPos?.id || o.positionId,
          positionSi: o.positionSi || matchedPos?.titleSi || '',
          departmentId: matchedDept?.id || o.departmentId,
          departmentName: o.departmentName || matchedDept?.name || '',
          departmentNameSi: o.departmentNameSi || matchedDept?.nameSi || '',
          gender: o.gender || 'MALE',
          avatar: o.avatar || ''
        };
      });
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
      const matchedPos = positions.find(
        p => p.title.toLowerCase() === (asc.officerDesignation || '').toLowerCase()
      );
      fallbackList.push({
        name: asc.officerInCharge,
        nameSi: asc.officerInChargeSi || '',
        position: asc.officerDesignation || 'Agrarian Development Officer (ADO)',
        positionSi: asc.officerDesignationSi || matchedPos?.titleSi || 'ගොවිජන සංවර්ධන නිලධාරී',
        positionId: matchedPos?.id,
        departmentName: departments[0]?.name || 'Department of Agrarian Development (DAD)',
        departmentNameSi: departments[0]?.nameSi || 'ගොවිජන සංවර්ධන දෙපාර්තමේන්තුව',
        departmentId: departments[0]?.id,
        phone: asc.mobilePhone || asc.officePhone || '',
        email: asc.email || '',
        avatar: '',
        gender: 'MALE',
        isPrimary: true,
        order: 0
      });
    }

    return fallbackList;
  };

  const openCreate = () => {
    const primaryPos = positions.find(p => p.code === 'ADO' || p.title.toLowerCase().includes('development officer')) || positions[0];
    const defaultDept = departments[0];
    setForm({
      ...defaultForm,
      officers: [
        {
          name: '',
          nameSi: '',
          position: primaryPos?.title || 'Agrarian Development Officer (ADO)',
          positionSi: primaryPos?.titleSi || 'ගොවිජන සංවර්ධන නිලධාරී',
          positionId: primaryPos?.id,
          departmentId: defaultDept?.id,
          departmentName: defaultDept?.name || '',
          departmentNameSi: defaultDept?.nameSi || '',
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

  // Dynamic Officers handlers
  const handleAddOfficer = (isPrimary = false) => {
    const primaryPos = positions.find(p => p.code === 'ADO' || p.title.toLowerCase().includes('development officer')) || positions[0];
    const secondaryPos = positions.find(p => p.code === 'AI' || p.title.toLowerCase().includes('instructor')) || positions[1] || positions[0];
    const defaultPos = isPrimary ? primaryPos : secondaryPos;
    const defaultDept = departments[0];

    setForm(prev => ({
      ...prev,
      officers: [
        ...prev.officers,
        {
          name: '',
          nameSi: '',
          position: defaultPos?.title || (isPrimary ? 'Agrarian Development Officer (ADO)' : 'Agricultural Instructor (AI)'),
          positionSi: defaultPos?.titleSi || (isPrimary ? 'ගොවිජන සංවර්ධන නිලධාරී' : 'කෘෂිකර්ම උපදේශක'),
          positionId: defaultPos?.id,
          departmentId: defaultDept?.id,
          departmentName: defaultDept?.name || '',
          departmentNameSi: defaultDept?.nameSi || '',
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
      
      // If toggling primary, unset other primaries if needed
      if (field === 'isPrimary' && value === true) {
        updated.forEach((o, i) => {
          if (i !== index) o.isPrimary = false;
        });
      }

      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, officers: updated };
    });
  };

  const handleUpdateOfficerMultiple = (index: number, updates: Partial<AscOfficerItem>) => {
    setForm(prev => {
      const updated = [...prev.officers];
      updated[index] = { ...updated[index], ...updates };
      return { ...prev, officers: updated };
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
      
      // Find primary officer to sync legacy fields for backward compatibility
      const primaryOfficer = form.officers.find(o => o.isPrimary) || form.officers[0];
      
      const payload = {
        ...form,
        officerInCharge: primaryOfficer?.name || form.officerInCharge || '',
        officerDesignation: primaryOfficer?.position || form.officerDesignation || 'Agrarian Development Officer (ADO)',
        officers: form.officers
          .filter(o => o.name.trim() !== '')
          .map((o, idx) => ({
            ...o,
            order: idx
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
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Govijana Sewa Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage Agrarian Services Centers, appointed officers table, contacts, and special announcements
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setEditingPositionId(null);
              setPositionForm({ title: '', titleSi: '', code: '', order: positions.length + 1 });
              setIsPositionModalOpen(true);
            }}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3.5 py-2.5 rounded-lg font-medium text-sm shadow-2xs transition-colors cursor-pointer"
          >
            <Briefcase size={17} className="text-emerald-700" />
            <span>Positions ({positions.length})</span>
          </button>

          <button
            onClick={() => {
              setEditingDepartmentId(null);
              setDepartmentForm({ name: '', nameSi: '', code: '', order: departments.length + 1 });
              setIsDepartmentModalOpen(true);
            }}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3.5 py-2.5 rounded-lg font-medium text-sm shadow-2xs transition-colors cursor-pointer"
          >
            <Building2 size={17} className="text-emerald-700" />
            <span>Departments ({departments.length})</span>
          </button>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Govijana Center</span>
          </button>
        </div>
      </div>

      {/* ── Search and Filter Controls ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ASC ID, center name, or officer..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <select
              value={filterProvince}
              onChange={e => {
                setFilterProvince(e.target.value);
                setFilterDistrict('');
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All Provinces</option>
              {Object.keys(SRI_LANKA_PROVINCES).map(p => (
                <option key={p} value={p}>{p} Province</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterDistrict}
              onChange={e => { setFilterDistrict(e.target.value); setCurrentPage(1); }}
              disabled={!filterProvince}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">All Districts</option>
              {availableFilterDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Total Centers: <strong className="text-gray-800 font-semibold">{totalCount}</strong></span>
            {(filterProvince || filterDistrict || search) && (
              <button
                onClick={() => { setFilterProvince(''); setFilterDistrict(''); setSearch(''); setCurrentPage(1); }}
                className="text-emerald-600 hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading Govijana Centers...</p>
          </div>
        ) : ascs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Building2 size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-800">No Govijana Centers Found</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">No agrarian service centers match your criteria.</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-xs hover:bg-emerald-700"
            >
              <Plus size={14} /> Add First Center
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 text-[11px] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Center Name & ID</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Officers & Staff</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Special Note</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ascs.map(asc => {
                  const officersList = extractOfficersList(asc);
                  const primaryOfficer = officersList.find(o => o.isPrimary) || officersList[0];
                  const additionalCount = officersList.filter(o => !o.isPrimary).length;

                  return (
                    <tr key={asc.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 uppercase tracking-wider">
                              {asc.ascId}
                            </span>
                            <p className="font-semibold text-gray-800 text-sm mt-0.5">{asc.name}</p>
                            {asc.nameSi && <p className="text-xs text-gray-400">{asc.nameSi}</p>}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-gray-600">
                        <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                          <MapPin size={13} className="text-gray-400 shrink-0" />
                          <span>{asc.district}</span>
                        </div>
                        <p className="text-xs text-gray-400 pl-4">{asc.province} Province</p>
                      </td>

                      <td className="px-5 py-3.5 text-gray-700">
                        {primaryOfficer ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                              <span className="font-medium text-gray-900">{primaryOfficer.name}</span>
                            </div>
                            <p className="text-[11px] text-emerald-700 font-medium pl-4">{primaryOfficer.position}</p>
                            {additionalCount > 0 && (
                              <div className="pl-4 pt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  <Users size={10} /> +{additionalCount} more {additionalCount === 1 ? 'officer' : 'officers'}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No Officers Assigned</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-gray-600">
                        {asc.officePhone || asc.mobilePhone || asc.email ? (
                          <div className="space-y-0.5">
                            {(asc.officePhone || asc.mobilePhone) && (
                              <p className="flex items-center gap-1 text-xs text-gray-700">
                                <Phone size={11} className="text-gray-400" /> {asc.officePhone || asc.mobilePhone}
                              </p>
                            )}
                            {asc.email && (
                              <p className="flex items-center gap-1 text-[11px] text-gray-500 truncate max-w-[140px]">
                                <Mail size={11} className="text-gray-400" /> {asc.email}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        {asc.specialNote || asc.specialNoteSi ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200" title={asc.specialNote || asc.specialNoteSi}>
                            <StickyNote size={11} /> Note Added
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <a
                            href="/govijana-sewa"
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View on Public Page"
                          >
                            <ExternalLink size={15} />
                          </a>
                          <button
                            onClick={() => openEdit(asc)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Center"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(asc.id, asc.name)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Center"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-3 border-t border-gray-100 flex justify-end">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-4xl relative z-10 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingId ? 'Edit Govijana Sewa Center' : 'Add New Govijana Sewa Center'}
                  </h2>
                  <p className="text-xs text-gray-500">Center information, dedicated officers table, and special notices</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-200 px-6 gap-6 bg-white text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`py-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'basic' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                1. Center Details & Contacts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('officers')}
                className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'officers' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                2. Officers & Staff Table
                {form.officers.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {form.officers.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`py-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'notes' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                3. Special Notes & Map
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: Center Details & Contacts */}
              {activeTab === 'basic' && (
                <div className="space-y-5">
                  {/* Basic Identification */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Center Identification</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ASC ID *</label>
                        <input
                          required
                          placeholder="e.g. ASC-0001"
                          value={form.ascId}
                          onChange={e => setForm({ ...form, ascId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Center Name (English) *</label>
                        <input
                          required
                          placeholder="e.g. Nintavur"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Center Name (Sinhala)</label>
                        <input
                          placeholder="උදා: නින්දවූර්"
                          value={form.nameSi}
                          onChange={e => setForm({ ...form, nameSi: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Province & District */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Administrative Division</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Province *</label>
                        <select
                          required
                          value={form.province}
                          onChange={e => {
                            const newProv = e.target.value;
                            setForm({ ...form, province: newProv, district: (SRI_LANKA_PROVINCES[newProv] && SRI_LANKA_PROVINCES[newProv][0]) || '' });
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        >
                          <option value="">Select Province</option>
                          {Object.keys(SRI_LANKA_PROVINCES).map(p => (
                            <option key={p} value={p}>{p} Province</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">District *</label>
                        <select
                          required
                          value={form.district}
                          onChange={e => setForm({ ...form, district: e.target.value })}
                          disabled={!form.province}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:bg-gray-50"
                        >
                          <option value="">Select District</option>
                          {availableFormDistricts.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Center Contacts */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Center Contacts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Office Landline Phone</label>
                        <input
                          placeholder="e.g. 0672260268"
                          value={form.officePhone}
                          onChange={e => setForm({ ...form, officePhone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile / WhatsApp Phone</label>
                        <input
                          placeholder="e.g. 0771234567"
                          value={form.mobilePhone}
                          onChange={e => setForm({ ...form, mobilePhone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Center Email</label>
                        <input
                          type="email"
                          placeholder="e.g. ascnintavur@gmail.com"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Officers & Staff Table (නිලධාරී මණ්ඩලය) */}
              {activeTab === 'officers' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Appointed Officers Table</h3>
                      <p className="text-xs text-gray-500">
                        Add the Head Officer (Officer in-charge / ADO) and Additional Officers (AI, Field Officers, etc.)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddOfficer(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <Plus size={14} /> Add Officer
                      </button>
                    </div>
                  </div>

                  {form.officers.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Users size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-xs font-semibold text-gray-700">No officers added yet</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Click the button below to add officers (Primary ADO, Agricultural Instructors, Field Assistants).
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAddOfficer(true)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        <Plus size={14} /> Add Head Officer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {form.officers.map((officer, index) => {
                        const isFemale = officer.gender === 'FEMALE';
                        const isUploadingThis = uploadingAvatarIndex === index;

                        return (
                          <div
                            key={index}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                              officer.isPrimary
                                ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                                : 'bg-gray-50/80 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Officer Card Header */}
                            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-gray-200/70">
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono font-bold ${
                                  officer.isPrimary ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {index + 1}
                                </span>

                                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(officer.isPrimary)}
                                    onChange={e => handleUpdateOfficer(index, 'isPrimary', e.target.checked)}
                                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
                                  />
                                  <span className={officer.isPrimary ? 'text-emerald-800 font-bold flex items-center gap-1' : 'text-gray-600'}>
                                    {officer.isPrimary ? (
                                      <>
                                        <Star size={13} className="text-amber-500 fill-amber-500" />
                                        Primary Officer In-Charge (ප්‍රධාන නිලධාරී)
                                      </>
                                    ) : (
                                      'Set as Primary / Head Officer'
                                    )}
                                  </span>
                                </label>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveOfficer(index)}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Remove Officer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Officer Card Content: Left Profile/Avatar & Gender + Right Input Fields */}
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                              {/* Avatar & Gender Widget */}
                              <div className="flex sm:flex-col items-center gap-2.5 shrink-0 self-center sm:self-start bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs">
                                {/* Avatar / Gender Icon Preview */}
                                <div className="relative group">
                                  {officer.avatar ? (
                                    <img
                                      src={officer.avatar}
                                      alt={officer.name || 'Officer'}
                                      className="w-14 h-14 rounded-full object-cover shadow-2xs border-2 border-emerald-500/50 bg-gray-100"
                                    />
                                  ) : (
                                    <div
                                      className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shrink-0 shadow-2xs border-2 border-white ring-2 ${
                                        isFemale
                                          ? 'ring-pink-300 bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-300'
                                          : 'ring-emerald-300 bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-400'
                                      }`}
                                      title={isFemale ? 'Female Officer (කාන්තා නිලධාරී)' : 'Male Officer (පුරුෂ නිලධාරී)'}
                                    >
                                      <User size={24} />
                                      <span className="text-[10px] font-black leading-none mt-0.5">
                                        {isFemale ? '♀' : '♂'}
                                      </span>
                                    </div>
                                  )}

                                  {isUploadingThis && (
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                      <Loader2 size={18} className="text-white animate-spin" />
                                    </div>
                                  )}
                                </div>

                                {/* Avatar Upload / Remove Buttons */}
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="flex items-center gap-1">
                                    <label
                                      className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 cursor-pointer flex items-center gap-1 transition-colors"
                                      title="Upload photo"
                                    >
                                      <Upload size={10} />
                                      <span>{officer.avatar ? 'Change' : 'Upload'}</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => {
                                          const file = e.target.files?.[0];
                                          if (file) handleUploadOfficerAvatar(index, file);
                                          e.target.value = '';
                                        }}
                                      />
                                    </label>

                                    {officer.avatar && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateOfficer(index, 'avatar', '')}
                                        className="text-[10px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-1.5 py-1 rounded-md border border-red-200 cursor-pointer transition-colors"
                                        title="Remove photo"
                                      >
                                        <X size={10} />
                                      </button>
                                    )}
                                  </div>

                                  {/* Gender Toggle */}
                                  <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateOfficer(index, 'gender', 'MALE')}
                                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-0.5 ${
                                        !isFemale
                                          ? 'bg-emerald-600 text-white shadow-2xs'
                                          : 'text-gray-500 hover:text-gray-800'
                                      }`}
                                      title="Male (පුරුෂ)"
                                    >
                                      <span>♂</span> Male
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateOfficer(index, 'gender', 'FEMALE')}
                                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-0.5 ${
                                        isFemale
                                          ? 'bg-pink-600 text-white shadow-2xs'
                                          : 'text-gray-500 hover:text-gray-800'
                                      }`}
                                      title="Female (කාන්තා)"
                                    >
                                      <span>♀</span> Female
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Input Fields Grid */}
                              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {/* Officer Name EN */}
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                    Officer Name (EN) *
                                  </label>
                                  <input
                                    required
                                    placeholder="e.g. M.S. Perera"
                                    value={officer.name}
                                    onChange={e => handleUpdateOfficer(index, 'name', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                  />
                                </div>

                                {/* Officer Name SI */}
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                    Officer Name (Sinhala)
                                  </label>
                                  <input
                                    placeholder="උදා: එම්.එස්. පෙරේරා"
                                    value={officer.nameSi || ''}
                                    onChange={e => handleUpdateOfficer(index, 'nameSi', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                  />
                                </div>

                                {/* Position / Designation Dropdown */}
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="block text-[11px] font-semibold text-gray-700">
                                      Position / Designation *
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingPositionId(null);
                                        setPositionForm({ title: '', titleSi: '', code: '', order: positions.length + 1 });
                                        setIsPositionModalOpen(true);
                                      }}
                                      className="text-[10px] text-emerald-700 hover:text-emerald-800 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                                      title="Add or manage designations"
                                    >
                                      <Plus size={11} /> New
                                    </button>
                                  </div>
                                  <select
                                    required
                                    value={
                                      officer.positionId ||
                                      positions.find(p => p.title.toLowerCase() === officer.position?.toLowerCase())?.id ||
                                      officer.position ||
                                      ''
                                    }
                                    onChange={e => {
                                      const val = e.target.value;
                                      if (val === '__manage__') {
                                        setEditingPositionId(null);
                                        setPositionForm({ title: '', titleSi: '', code: '', order: positions.length + 1 });
                                        setIsPositionModalOpen(true);
                                        return;
                                      }
                                      const selected = positions.find(p => p.id === val);
                                      if (selected) {
                                        handleUpdateOfficerMultiple(index, {
                                          positionId: selected.id,
                                          position: selected.title,
                                          positionSi: selected.titleSi || ''
                                        });
                                      } else {
                                        handleUpdateOfficerMultiple(index, {
                                          position: val,
                                          positionId: undefined
                                        });
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                                  >
                                    <option value="">-- Select Designation --</option>
                                    {positions.map(p => (
                                      <option key={p.id} value={p.id}>
                                        {p.title} {p.titleSi ? `(${p.titleSi})` : ''} {p.code ? `[${p.code}]` : ''}
                                      </option>
                                    ))}
                                    {officer.position &&
                                      !positions.some(
                                        p => p.id === officer.positionId || p.title.toLowerCase() === officer.position?.toLowerCase()
                                      ) && (
                                        <option value={officer.position}>
                                          {officer.position} (Custom)
                                        </option>
                                      )}
                                    <option value="__manage__" className="text-emerald-700 font-bold bg-emerald-50">
                                      ➕ Manage / Add New Position...
                                    </option>
                                  </select>
                                </div>

                                {/* Department / Division Dropdown */}
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="block text-[11px] font-semibold text-gray-700">
                                      Department / Division
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingDepartmentId(null);
                                        setDepartmentForm({ name: '', nameSi: '', code: '', order: departments.length + 1 });
                                        setIsDepartmentModalOpen(true);
                                      }}
                                      className="text-[10px] text-emerald-700 hover:text-emerald-800 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                                      title="Add or manage departments"
                                    >
                                      <Plus size={11} /> New
                                    </button>
                                  </div>
                                  <select
                                    value={
                                      officer.departmentId ||
                                      departments.find(d => d.name.toLowerCase() === (officer.departmentName || '').toLowerCase())?.id ||
                                      officer.departmentName ||
                                      ''
                                    }
                                    onChange={e => {
                                      const val = e.target.value;
                                      if (val === '__manage__') {
                                        setEditingDepartmentId(null);
                                        setDepartmentForm({ name: '', nameSi: '', code: '', order: departments.length + 1 });
                                        setIsDepartmentModalOpen(true);
                                        return;
                                      }
                                      const selected = departments.find(d => d.id === val);
                                      if (selected) {
                                        handleUpdateOfficerMultiple(index, {
                                          departmentId: selected.id,
                                          departmentName: selected.name,
                                          departmentNameSi: selected.nameSi || ''
                                        });
                                      } else {
                                        handleUpdateOfficerMultiple(index, {
                                          departmentName: val,
                                          departmentId: undefined
                                        });
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                                  >
                                    <option value="">-- Select Department --</option>
                                    {departments.map(d => (
                                      <option key={d.id} value={d.id}>
                                        {d.name} {d.nameSi ? `(${d.nameSi})` : ''} {d.code ? `[${d.code}]` : ''}
                                      </option>
                                    ))}
                                    {officer.departmentName &&
                                      !departments.some(
                                        d => d.id === officer.departmentId || d.name.toLowerCase() === (officer.departmentName || '').toLowerCase()
                                      ) && (
                                        <option value={officer.departmentName}>
                                          {officer.departmentName} (Custom)
                                        </option>
                                      )}
                                    <option value="__manage__" className="text-emerald-700 font-bold bg-emerald-50">
                                      ➕ Manage / Add New Department...
                                    </option>
                                  </select>
                                </div>

                                {/* Phone Number */}
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                    Phone Number
                                  </label>
                                  <input
                                    placeholder="e.g. 0712345678"
                                    value={officer.phone || ''}
                                    onChange={e => handleUpdateOfficer(index, 'phone', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                  />
                                </div>

                                {/* Email Address */}
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                    Email Address
                                  </label>
                                  <input
                                    type="email"
                                    placeholder="e.g. perera.agri@gmail.com"
                                    value={officer.email || ''}
                                    onChange={e => handleUpdateOfficer(index, 'email', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => handleAddOfficer(false)}
                        className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-gray-600 hover:text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Plus size={15} /> Add Another Officer
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Special Notes & Location */}
              {activeTab === 'notes' && (
                <div className="space-y-5">
                  {/* Special Note */}
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                    <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <StickyNote size={14} /> Special Notes / Remarks (සුවිශේෂී සටහන්)
                    </h3>
                    <p className="text-[11px] text-amber-700 mb-3">
                      Add special notices about this center (e.g. office hours, fertilizer distribution dates, seed testing days, meeting schedules, farmer instructions).
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Special Note (English)</label>
                        <textarea
                          placeholder="e.g. Fertilizer distribution on Mondays and Wednesdays 8:30 AM - 2:00 PM. Soil testing samples accepted every Friday."
                          value={form.specialNote}
                          onChange={e => setForm({ ...form, specialNote: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Special Note (Sinhala)</label>
                        <textarea
                          placeholder="උදා: පොහොර සහනාධාර බෙදාහැරීම සෑම සඳුදා සහ බදාදා දිනවල පෙ.ව. 8:30 සිට ප.ව. 2:00 දක්වා සිදුකෙරේ. පස් සාම්පල පරීක්ෂාව සෑම සිකුරාදා දිනකම."
                          value={form.specialNoteSi}
                          onChange={e => setForm({ ...form, specialNoteSi: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Physical Address & Maps */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Location & Address</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Address (English)</label>
                          <textarea
                            placeholder="e.g. Agrarian Services Centre, Main Street, Nintavur"
                            value={form.address}
                            onChange={e => setForm({ ...form, address: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Address (Sinhala)</label>
                          <textarea
                            placeholder="උදා: ගොවිජන සේවා මධ්‍යස්ථානය, ප්‍රධාන වීදිය, නින්දවූර්"
                            value={form.addressSi}
                            onChange={e => setForm({ ...form, addressSi: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Google Maps URL</label>
                        <input
                          placeholder="e.g. https://maps.google.com/?q=..."
                          value={form.googleMapsUrl}
                          onChange={e => setForm({ ...form, googleMapsUrl: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {activeTab !== 'notes' ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab(activeTab === 'basic' ? 'officers' : 'notes')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Next Step <ChevronRight size={14} />
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>{editingId ? 'Update Center' : 'Save Center'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── MANAGE ASC POSITIONS MODAL ── */}
      {isPositionModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Manage ASC Positions</h2>
                  <p className="text-xs text-gray-500">
                    Add, edit, and organize officer designations (තනතුරු කළමනාකරණය)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPositionModalOpen(false);
                  setEditingPositionId(null);
                  setPositionError(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* Add / Edit Form Card */}
              <form onSubmit={handleSavePosition} className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100/60">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Plus size={14} className="text-emerald-600" />
                    {editingPositionId ? 'Edit Designation' : 'Add New Designation'}
                  </span>
                  {editingPositionId && (
                    <button
                      type="button"
                      onClick={handleCancelEditPosition}
                      className="text-[11px] text-gray-500 hover:text-gray-700 underline font-medium cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {positionError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{positionError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Position Title (English) *
                    </label>
                    <input
                      required
                      placeholder="e.g. Agricultural Instructor (AI)"
                      value={positionForm.title}
                      onChange={e => setPositionForm({ ...positionForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Position Title (Sinhala)
                    </label>
                    <input
                      placeholder="උදා: කෘෂිකර්ම උපදේශක (AI)"
                      value={positionForm.titleSi}
                      onChange={e => setPositionForm({ ...positionForm, titleSi: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Short Code / Acronym
                    </label>
                    <input
                      placeholder="e.g. AI, ADO, ARPA"
                      value={positionForm.code}
                      onChange={e => setPositionForm({ ...positionForm, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={positionForm.order}
                      onChange={e => setPositionForm({ ...positionForm, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  {editingPositionId && (
                    <button
                      type="button"
                      onClick={handleCancelEditPosition}
                      className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSavingPosition}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingPosition ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>{editingPositionId ? 'Update Position' : 'Save Position'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Positions List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Existing Designations ({positions.length})
                  </h3>
                </div>

                {positions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No positions added yet. Use the form above to create positions.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs max-h-64 overflow-y-auto">
                    {positions.map(pos => (
                      <div
                        key={pos.id}
                        className={`p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors ${
                          editingPositionId === pos.id ? 'bg-emerald-50/60 ring-1 ring-emerald-300' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                            {pos.order ?? 0}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-gray-900 truncate">
                                {pos.title}
                              </span>
                              {pos.code && (
                                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded">
                                  {pos.code}
                                </span>
                              )}
                            </div>
                            {pos.titleSi && (
                              <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                {pos.titleSi}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditPosition(pos)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePosition(pos.id, pos.title)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsPositionModalOpen(false);
                  setEditingPositionId(null);
                  setPositionError(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── MANAGE ASC DEPARTMENTS MODAL ── */}
      {isDepartmentModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Manage ASC Departments</h2>
                  <p className="text-xs text-gray-500">
                    Add, edit, and organize officer departments (දෙපාර්තමේන්තු කළමනාකරණය)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDepartmentModalOpen(false);
                  setEditingDepartmentId(null);
                  setDepartmentError(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* Add / Edit Form Card */}
              <form onSubmit={handleSaveDepartment} className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100/60">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Plus size={14} className="text-emerald-600" />
                    {editingDepartmentId ? 'Edit Department' : 'Add New Department'}
                  </span>
                  {editingDepartmentId && (
                    <button
                      type="button"
                      onClick={handleCancelEditDepartment}
                      className="text-[11px] text-gray-500 hover:text-gray-700 underline font-medium cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {departmentError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{departmentError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Department Name (English) *
                    </label>
                    <input
                      required
                      placeholder="e.g. Department of Agrarian Development (DAD)"
                      value={departmentForm.name}
                      onChange={e => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Department Name (Sinhala)
                    </label>
                    <input
                      placeholder="උදා: ගොවිජන සංවර්ධන දෙපාර්තමේන්තුව"
                      value={departmentForm.nameSi}
                      onChange={e => setDepartmentForm({ ...departmentForm, nameSi: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Short Code / Acronym
                    </label>
                    <input
                      placeholder="e.g. DAD, DOA, DEA"
                      value={departmentForm.code}
                      onChange={e => setDepartmentForm({ ...departmentForm, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={departmentForm.order}
                      onChange={e => setDepartmentForm({ ...departmentForm, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  {editingDepartmentId && (
                    <button
                      type="button"
                      onClick={handleCancelEditDepartment}
                      className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSavingDepartment}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingDepartment ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>{editingDepartmentId ? 'Update Department' : 'Save Department'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Departments List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Existing Departments ({departments.length})
                  </h3>
                </div>

                {departments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No departments added yet. Use the form above to create departments.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs max-h-64 overflow-y-auto">
                    {departments.map(dept => (
                      <div
                        key={dept.id}
                        className={`p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors ${
                          editingDepartmentId === dept.id ? 'bg-emerald-50/60 ring-1 ring-emerald-300' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                            {dept.order ?? 0}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-gray-900 truncate">
                                {dept.name}
                              </span>
                              {dept.code && (
                                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded">
                                  {dept.code}
                                </span>
                              )}
                            </div>
                            {dept.nameSi && (
                              <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                {dept.nameSi}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditDepartment(dept)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsDepartmentModalOpen(false);
                  setEditingDepartmentId(null);
                  setDepartmentError(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
