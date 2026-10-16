import { useState, useEffect, useCallback } from 'react';
import {
  Sprout,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Phone,
  Layers,
  ChevronLeft,
  ChevronRight,
  Award,
  Truck,
  Clock,
  Sparkles,
  Database,
  Flame
} from 'lucide-react';
import type {
  NurseryItem,
  FormDropdownOptions
} from '../components/nursery/types';
import NurseryFormModal from '../components/nursery/NurseryFormModal';
import NurseryViewModal from '../components/nursery/NurseryViewModal';
import NurseryMasterDataTable from '../components/nursery/NurseryMasterDataTable';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const defaultOptions: FormDropdownOptions = {
  grades: [],
  deliveries: [],
  operatingHours: [],
  certifications: [],
  categories: [],
  crops: [],
  varieties: [],
  specialties: [],
  badges: []
};

type ActiveTabType =
  | 'nurseries'
  | 'grades'
  | 'deliveries'
  | 'operating-hours'
  | 'certifications'
  | 'categories'
  | 'crops'
  | 'varieties'
  | 'specialties'
  | 'badges';

export default function NurseryManagement() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('nurseries');
  const [nurseries, setNurseries] = useState<NurseryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<FormDropdownOptions>(defaultOptions);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedReg, setSelectedReg] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedApproval, setSelectedApproval] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNursery, setEditingNursery] = useState<NurseryItem | null>(null);
  const [viewingNursery, setViewingNursery] = useState<NurseryItem | null>(null);

  // Fetch form dropdown options
  const fetchFormOptions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/nurseries/form-options`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.data) {
        setOptions(json.data);
      }
    } catch (err) {
      console.error('Failed to load form options:', err);
    }
  }, []);

  // Fetch nurseries list
  const fetchNurseries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedGrade) params.append('gradeId', selectedGrade);
      if (selectedReg !== '') params.append('isGovRegistered', selectedReg);
      if (selectedStatus !== '') params.append('activeOnly', selectedStatus === 'active' ? 'true' : 'false');
      if (selectedApproval) {
        params.append('approvalStatus', selectedApproval);
      } else {
        params.append('approvalStatus', 'ALL');
      }

      const res = await fetch(`${API_BASE_URL}/nurseries?${params.toString()}`);
      if (!res.ok) return;
      const json = await res.json();

      const items = json?.data || json?.items || [];
      setNurseries(Array.isArray(items) ? items : []);
      setTotalPages(json?.meta?.totalPages || 1);
      setTotalCount(json?.meta?.total || items.length || 0);
    } catch (err) {
      console.error('Failed to load nurseries:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, selectedGrade, selectedReg, selectedStatus, selectedApproval]);

  useEffect(() => {
    fetchFormOptions();
  }, [fetchFormOptions]);

  useEffect(() => {
    if (activeTab === 'nurseries') {
      fetchNurseries();
    }
  }, [activeTab, fetchNurseries]);

  // Handle Nursery Status Toggle
  const handleToggleStatus = async (item: NurseryItem) => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/nurseries/${item.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        fetchNurseries();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Handle Nursery Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this nursery and its associated data?')) return;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/nurseries/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to delete nursery.');
        return;
      }

      fetchNurseries();
    } catch (err) {
      console.error('Failed to delete nursery:', err);
    }
  };

  // Handle Update Approval Status directly
  const handleUpdateApprovalStatus = async (item: NurseryItem, newStatus: string) => {
    if (item.approvalStatus === newStatus) return;

    let rejectionReason: string | null = null;
    if (newStatus === 'REJECTED') {
      const reason = window.prompt(
        'Enter rejection reason (optional):',
        item.rejectionReason || 'Details incomplete or unverified.'
      );
      if (reason === null) return;
      rejectionReason = reason.trim() || 'Rejected by Admin';
    }

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      let url = `${API_BASE_URL}/nurseries/${item.id}`;
      let body: any = { approvalStatus: newStatus };

      if (newStatus === 'APPROVED') {
        url = `${API_BASE_URL}/nurseries/${item.id}/approve`;
        body = {};
      } else if (newStatus === 'REJECTED') {
        url = `${API_BASE_URL}/nurseries/${item.id}/reject`;
        body = { rejectionReason };
      } else {
        body = { approvalStatus: 'PENDING', rejectionReason: null };
      }

      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setNurseries((prev) =>
          prev.map((n) =>
            n.id === item.id
              ? {
                  ...n,
                  approvalStatus: newStatus,
                  rejectionReason: newStatus === 'REJECTED' ? rejectionReason : null
                }
              : n
          )
        );
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.error || 'Failed to update approval status.');
      }
    } catch (err) {
      console.error('Failed to update approval status:', err);
      alert('An error occurred while updating approval status.');
    }
  };

  // Stats Counters
  const activeCount = nurseries.filter((n) => n.activeState).length;
  const govRegCount = nurseries.filter((n) => n.isGovRegistered).length;
  const pendingApprovalCount = nurseries.filter((n) => n.approvalStatus === 'PENDING').length;
  const totalStocksListed = nurseries.reduce((acc, curr) => acc + (curr.stocks?.length || 0), 0);

  // Tabs configuration
  const tabs = [
    { key: 'nurseries' as const, label: 'Nurseries', icon: <Sprout size={14} />, count: totalCount },
    { key: 'grades' as const, label: 'Grades', icon: <Award size={14} />, count: options.grades?.length },
    { key: 'deliveries' as const, label: 'Delivery Facilities', icon: <Truck size={14} />, count: options.deliveries?.length },
    { key: 'operating-hours' as const, label: 'Operating Hours', icon: <Clock size={14} />, count: options.operatingHours?.length },
    { key: 'certifications' as const, label: 'Certifications', icon: <Award size={14} />, count: options.certifications?.length },
    { key: 'categories' as const, label: 'Crop Categories', icon: <Layers size={14} />, count: options.categories?.length },
    { key: 'crops' as const, label: 'Crops', icon: <Sprout size={14} />, count: options.crops?.length },
    { key: 'varieties' as const, label: 'Varieties', icon: <Sparkles size={14} />, count: options.varieties?.length },
    { key: 'specialties' as const, label: 'Specialties', icon: <Database size={14} />, count: options.specialties?.length },
    { key: 'badges' as const, label: 'Badges', icon: <Flame size={14} />, count: options.badges?.length }
  ];

  return (
    <div className="space-y-3 font-sans text-gray-900">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight leading-tight">
              Nursery Management
            </h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Manage nationwide plant nurseries, grades, certifications, crops, and live inventory presets.
            </p>
          </div>
        </div>

        {activeTab === 'nurseries' && (
          <button
            type="button"
            onClick={() => {
              setEditingNursery(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-800/20 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Add New Nursery</span>
          </button>
        )}
      </div>

      {/* Page Tabs Navigation (matching other admin management pages) */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-1 bg-white px-3 pt-2 rounded-xl shadow-2xs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === tab.key
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  activeTab === tab.key ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Tab: Nurseries */}
      {activeTab === 'nurseries' && (
        <>
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Sprout size={16} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Nurseries</span>
                <span className="text-sm font-extrabold text-gray-900">{totalCount}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Active</span>
                <span className="text-sm font-extrabold text-gray-900">{activeCount}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pending Approval</span>
                <span className="text-sm font-extrabold text-amber-700">{pendingApprovalCount}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Award size={16} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Gov Reg</span>
                <span className="text-sm font-extrabold text-gray-900">{govRegCount}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Layers size={16} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Stocks</span>
                <span className="text-sm font-extrabold text-gray-900">{totalStocksListed}</span>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search nursery, owner, crop, category, variety, specialty, district..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white placeholder:text-gray-400 transition-all"
              />
            </div>

            {/* Approval Filter */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedApproval}
                onChange={(e) => {
                  setSelectedApproval(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-36 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer font-medium"
              >
                <option value="">Approval (All)</option>
                <option value="PENDING">Pending Only ({pendingApprovalCount})</option>
                <option value="APPROVED">Approved Only</option>
                <option value="REJECTED">Rejected Only</option>
              </select>
            </div>

            {/* Grade Filter */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-36 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="">All Grades</option>
                {options.grades.map((gr) => (
                  <option key={gr.id} value={gr.id}>
                    {gr.nameEn || gr.nameSi}
                  </option>
                ))}
              </select>
            </div>

            {/* Registration Filter */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedReg}
                onChange={(e) => {
                  setSelectedReg(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-36 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="">Registration (All)</option>
                <option value="true">Gov Registered</option>
                <option value="false">Private / Not Reg</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-32 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="">Status (All)</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedApproval('');
                setSelectedGrade('');
                setSelectedReg('');
                setSelectedStatus('');
                setPage(1);
              }}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Reset Filters"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* ULTRA-COMPACT DATA TABLE (STRICT RULES ADHERED) */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr className="bg-gray-50/90 border-b border-gray-200">
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                      Nursery Name
                    </th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                      Owner
                    </th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                      Phone
                    </th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                      Location
                    </th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-center">
                      Grade
                    </th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-center">
                      Gov Reg
                    </th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-center">
                      Stocks
                    </th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-center">
                      Approval
                    </th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-center">
                      Status
                    </th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-10 text-center text-xs text-gray-400">
                        <div className="inline-flex items-center gap-2">
                          <RefreshCw size={14} className="animate-spin text-emerald-600" />
                          <span>Loading nurseries...</span>
                        </div>
                      </td>
                    </tr>
                  ) : nurseries.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-10 text-center text-xs text-gray-400">
                        No nurseries found. Click "Add New Nursery" to get started.
                      </td>
                    </tr>
                  ) : (
                    nurseries.map((item) => {
                      const primaryPhoto =
                        item.images && item.images.length > 0
                          ? item.images[0].imageUrl
                          : null;
                      const loc = item.location;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/70 transition-colors group"
                        >
                          {/* 1. Nursery Name & Thumbnail (Single-line) */}
                          <td className="px-3 py-1.5 whitespace-nowrap">
                            <div className="flex items-center gap-2 max-w-[220px]">
                              {primaryPhoto ? (
                                <img
                                  src={primaryPhoto}
                                  alt={item.nameEn || item.nameSi || 'Nursery'}
                                  className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-7 h-7 rounded bg-emerald-100/60 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
                                  <Sprout size={13} />
                                </div>
                              )}
                              <span
                                className="font-semibold text-gray-900 truncate text-xs"
                                title={`${item.nameEn || item.nameSi || ''} (${item.slug})`}
                              >
                                {item.nameEn || item.nameSi || '—'}
                              </span>
                            </div>
                          </td>

                          {/* 2. Owner (Single-line) */}
                          <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">
                            <span
                              className="truncate max-w-[140px] inline-block text-xs font-medium text-gray-800"
                              title={item.ownerNameEn || item.ownerNameSi || '—'}
                            >
                              {item.ownerNameEn || item.ownerNameSi || '—'}
                            </span>
                          </td>

                          {/* 3. Phone (Single-line) */}
                          <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">
                            <span
                              className="truncate max-w-[125px] inline-flex items-center gap-1 text-xs text-gray-700 font-mono"
                              title={item.whatsappNumber || '—'}
                            >
                              {item.whatsappNumber ? (
                                <>
                                  <Phone size={10} className="text-emerald-600 shrink-0" />
                                  <span>{item.whatsappNumber}</span>
                                </>
                              ) : (
                                '—'
                              )}
                            </span>
                          </td>

                          {/* 4. Location (Single-line) */}
                          <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">
                            <span
                              className="truncate max-w-[150px] inline-block text-xs text-gray-800"
                              title={
                                loc?.fullAddressEn ||
                                loc?.fullAddressSi ||
                                [loc?.districtEn, loc?.provinceEn].filter(Boolean).join(', ') ||
                                '—'
                              }
                            >
                              {loc?.districtEn || loc?.districtSi || loc?.provinceEn || '—'}
                            </span>
                          </td>

                          {/* 5. Grade */}
                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            {item.grade ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                                {item.grade.nameEn || item.grade.nameSi}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400">—</span>
                            )}
                          </td>

                          {/* 6. Gov Registered */}
                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            {item.isGovRegistered ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                <span>Gov Reg</span>
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                Not Reg
                              </span>
                            )}
                          </td>

                          {/* 7. Stocks Count */}
                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-teal-50 text-teal-800 border border-teal-200/80">
                              {item.stocks?.length || 0} stocks
                            </span>
                          </td>

                          {/* 8. Approval Status (Interactive Select Dropdown Badge) */}
                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center">
                              <select
                                value={item.approvalStatus || 'APPROVED'}
                                onChange={(e) => handleUpdateApprovalStatus(item, e.target.value)}
                                className={`text-[10px] font-semibold pl-2 pr-5 py-0.5 rounded-full border cursor-pointer outline-none transition-all appearance-none bg-no-repeat ${
                                  item.approvalStatus === 'APPROVED'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                    : item.approvalStatus === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                }`}
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                  backgroundPosition: 'right 4px center',
                                  backgroundSize: '8px 8px'
                                }}
                                title={
                                  item.rejectionReason
                                    ? `Status: ${item.approvalStatus} | Reason: ${item.rejectionReason} (Click to change)`
                                    : `Status: ${item.approvalStatus || 'APPROVED'} (Click to change)`
                                }
                              >
                                <option value="APPROVED" className="bg-white text-gray-800 font-medium">Approved</option>
                                <option value="PENDING" className="bg-white text-gray-800 font-medium">Pending</option>
                                <option value="REJECTED" className="bg-white text-gray-800 font-medium">Rejected</option>
                              </select>
                            </div>
                          </td>

                          {/* 9. Active Status Toggle */}
                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              className="cursor-pointer inline-flex items-center"
                              title={item.activeState ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
                            >
                              {item.activeState ? (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                  <span>Active</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                  <span>Inactive</span>
                                </span>
                              )}
                            </button>
                          </td>

                          {/* 10. Actions (Compact p-1 with size={14}) */}
                          <td className="px-3 py-1.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <button
                                type="button"
                                onClick={() => setViewingNursery(item)}
                                className="p-1 hover:bg-gray-100 text-gray-500 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNursery(item);
                                  setIsFormOpen(true);
                                }}
                                className="p-1 hover:bg-gray-100 text-gray-500 hover:text-blue-700 rounded transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="p-1 hover:bg-gray-100 text-gray-500 hover:text-red-600 rounded transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Compact Pagination Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              <div>
                Total: <strong>{totalCount}</strong> nurseries
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[11px] font-medium px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Associate Master Data Tabs */}
      {activeTab === 'grades' && (
        <NurseryMasterDataTable
          title="Nursery Grades"
          itemSingular="Grade"
          endpoint="nursery-grades"
          icon={<Award size={16} />}
          onDataChanged={fetchFormOptions}
        />
      )}

      {activeTab === 'deliveries' && (
        <NurseryMasterDataTable
          title="Delivery Facilities"
          itemSingular="Delivery Facility"
          endpoint="nursery-deliveries"
          icon={<Truck size={16} />}
          onDataChanged={fetchFormOptions}
        />
      )}

      {activeTab === 'operating-hours' && (
        <NurseryMasterDataTable
          title="Operating Hours & Days"
          itemSingular="Operating Hour Preset"
          endpoint="nursery-operating-hours"
          icon={<Clock size={16} />}
          onDataChanged={fetchFormOptions}
        />
      )}

      {activeTab === 'certifications' && (
        <NurseryMasterDataTable
          title="Quality Certifications"
          itemSingular="Certification"
          endpoint="nursery-certifications"
          icon={<Award size={16} />}
          onDataChanged={fetchFormOptions}
        />
      )}

      {activeTab === 'categories' && (
        <NurseryMasterDataTable
          title="Crop Categories"
          itemSingular="Crop Category"
          endpoint="nursery-categories"
          icon={<Layers size={16} />}
          onDataChanged={fetchFormOptions}
        />
      )}

      {activeTab === 'crops' && (
        <NurseryMasterDataTable
          title="Crops"
          itemSingular="Crop"
          endpoint="nursery-crops"
          icon={<Sprout size={16} />}
          hasCategoryRelation={true}
          categories={options.categories}
          onDataChanged={fetchFormOptions}
        />
      )}

      {activeTab === 'varieties' && (
        <NurseryMasterDataTable
          title="Plant Varieties"
          itemSingular="Plant Variety"
          endpoint="nursery-varieties"
          icon={<Sparkles size={16} />}
          onDataChanged={fetchFormOptions}
        />
      )}

      {activeTab === 'specialties' && (
        <NurseryMasterDataTable
          title="Nursery Specialties & Plant Materials"
          itemSingular="Specialty"
          endpoint="nursery-specialties"
          icon={<Database size={16} />}
          onDataChanged={fetchFormOptions}
        />
      )}

      {activeTab === 'badges' && (
        <NurseryMasterDataTable
          title="Promotional Badges (Fast-Selling / New Arrivals)"
          itemSingular="Badge"
          endpoint="nursery-badges"
          icon={<Flame size={16} />}
          onDataChanged={fetchFormOptions}
        />
      )}

      {/* MODALS */}
      {/* 1. Nursery Add / Edit Form Modal */}
      <NurseryFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingNursery(null);
        }}
        onSuccess={() => {
          fetchNurseries();
          fetchFormOptions();
        }}
        editingItem={editingNursery}
        options={options}
      />

      {/* 2. Nursery View Modal */}
      <NurseryViewModal
        isOpen={Boolean(viewingNursery)}
        onClose={() => setViewingNursery(null)}
        nursery={viewingNursery}
      />
    </div>
  );
}
