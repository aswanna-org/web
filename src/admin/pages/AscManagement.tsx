import { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, X, Search, Building2, Phone, Mail,
  MapPin, StickyNote, Users, ExternalLink, CheckCircle2, ChevronRight,
  Star
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface AscOfficerItem {
  id?: string;
  name: string;
  nameSi?: string;
  position: string;
  positionSi?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
  order?: number;
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

  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

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
      officers: [
        {
          name: '',
          position: 'Agrarian Development Officer (ADO)',
          phone: '',
          email: '',
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
    setForm(prev => ({
      ...prev,
      officers: [
        ...prev.officers,
        {
          name: '',
          position: isPrimary ? 'Agrarian Development Officer (ADO)' : 'Agricultural Instructor (AI)',
          phone: '',
          email: '',
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
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={18} />
          <span>Add Govijana Center</span>
        </button>
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
                      {form.officers.map((officer, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border transition-all ${
                            officer.isPrimary
                              ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                              : 'bg-gray-50/80 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Officer Card Header */}
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/60">
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
                                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
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

                          {/* Officer Input Fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

                            <div>
                              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                Position / Designation *
                              </label>
                              <input
                                required
                                placeholder="e.g. Agricultural Instructor (AI)"
                                value={officer.position}
                                onChange={e => handleUpdateOfficer(index, 'position', e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                              />
                            </div>

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
                      ))}

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
    </div>
  );
}
