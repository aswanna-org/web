import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Trees,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Sprout,
  Check,
  X,
  MapPin,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../admin/components/ConfirmDialog';
import NurseryFormModal from '../../admin/components/nursery/NurseryFormModal';
import type { FormDropdownOptions, NurseryItem } from '../../admin/components/nursery/types';
import NurseryViewModal from '../../admin/components/nursery/NurseryViewModal';

export const UserNurseryManagement = () => {
  const { user, token } = useAuth();
  const { confirm } = useConfirm();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [nurseries, setNurseries] = useState<NurseryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'APPROVED' | 'PENDING' | 'REJECTED'>('all');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedNursery, setSelectedNursery] = useState<NurseryItem | null>(null);
  const [formOptions, setFormOptions] = useState<FormDropdownOptions>({
    categories: [],
    grades: [],
    deliveries: [],
    operatingHours: [],
    certifications: [],
    specialties: [],
    badges: [],
    crops: [],
    varieties: []
  });

  const fetchFormOptions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/nurseries/form-options`);
      const json = await res.json();
      if (json.success && json.data) {
        setFormOptions(json.data);
      }
    } catch (err) {
      console.error('Error fetching nursery options:', err);
    }
  }, [API_BASE_URL]);

  const fetchNurseries = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: user.id,
        approvalStatus: 'ALL',
        limit: '100'
      });
      if (search.trim()) params.append('search', search.trim());

      const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/nurseries?${params.toString()}`, {
        headers: authHeaders
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNurseries(json.data);
      } else {
        setNurseries([]);
      }
    } catch (err) {
      console.error('Error fetching user nurseries:', err);
      setNurseries([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, user?.id, token, search]);

  useEffect(() => {
    fetchFormOptions();
  }, [fetchFormOptions]);

  useEffect(() => {
    fetchNurseries();
  }, [fetchNurseries]);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Delete Plant Nursery',
      subtitle: 'මෙම පැළ තවාන ස්ථිරවම ඉවත් කිරීමට ඔබට අවශ්‍යද?',
      message: `Are you sure you want to delete "${name}"? All associated inventory stocks and images will also be removed. This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/nurseries/${id}`, {
        method: 'DELETE',
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit
      });
      if (res.ok) {
        fetchNurseries();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete nursery.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error while deleting nursery.');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/nurseries/${id}/toggle-status`, {
        method: 'PATCH',
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit
      });
      if (res.ok) {
        fetchNurseries();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const filteredNurseries = nurseries.filter((item) => {
    if (statusFilter !== 'all' && item.approvalStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Trees size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">My Plant Nurseries</h2>
              <p className="text-xs text-gray-500">ඔබ විසින් ඇතුළත් කළ පැළ තවාන් ලැයිස්තුව කළමනාකරණය කරන්න</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedNursery(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>Add New Nursery</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, owner, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({nurseries.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Approved ({nurseries.filter((n) => n.approvalStatus === 'APPROVED').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Pending ({nurseries.filter((n) => n.approvalStatus === 'PENDING').length})
          </button>
        </div>
      </div>

      {/* Mobile Card View (Completely responsive for mobile - Compact) */}
      <div className="block md:hidden space-y-2.5">
        {loading ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-xs text-gray-500">
            <RefreshCw size={16} className="animate-spin text-emerald-600 mx-auto mb-1.5" />
            <span>Loading nurseries...</span>
          </div>
        ) : filteredNurseries.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-xs text-gray-400">
            <Trees size={32} className="mx-auto mb-1.5 text-gray-300" />
            <p className="font-semibold text-gray-700 text-xs">No plant nurseries found</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Tap "+ Add New Nursery" to list your nursery.</p>
          </div>
        ) : (
          filteredNurseries.map((item) => {
            const primaryPhoto =
              item.images && item.images.length > 0 ? item.images[0].imageUrl : null;
            const loc = item.location;

            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-2.5 space-y-2">
                {/* Card Top: Thumbnail + Name + Approval Badge */}
                <div className="flex items-start gap-2 justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {primaryPhoto ? (
                      <img
                        src={primaryPhoto}
                        alt={item.nameEn || item.nameSi || 'Nursery'}
                        className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                        <Sprout size={16} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">
                        {item.nameEn || item.nameSi || 'Untitled Nursery'}
                      </h4>
                      <p className="text-[10px] text-gray-500 truncate">
                        {item.ownerNameEn || item.ownerNameSi || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Approval Badge */}
                  <div className="shrink-0">
                    {item.approvalStatus === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={10} />
                        <span>Approved</span>
                      </span>
                    ) : item.approvalStatus === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-rose-100 text-rose-800">
                        <XCircle size={10} />
                        <span>Rejected</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-800">
                        <Clock size={10} />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick info row (Location, Phone, Crops, Status) */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-gray-100 text-[10px]">
                  <div className="flex items-center gap-1 text-gray-600 truncate">
                    <MapPin size={11} className="text-gray-400 shrink-0" />
                    <span className="truncate">{loc?.districtEn || loc?.districtSi || 'Location N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 truncate">
                    <Phone size={11} className="text-gray-400 shrink-0" />
                    <span className="font-mono truncate">{item.whatsappNumber || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <span className="px-1 py-0.2 rounded bg-gray-100 text-gray-700 font-medium text-[9px]">
                      {item.stocks?.length || 0} Crops
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id)}
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold transition cursor-pointer ${
                        item.activeState
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {item.activeState ? <Check size={9} /> : <X size={9} />}
                      <span>{item.activeState ? 'Active' : 'Hidden'}</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNursery(item);
                      setIsViewOpen(true);
                    }}
                    className="flex-1 py-1 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-lg border border-gray-200 flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Eye size={12} className="text-gray-500" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNursery(item);
                      setIsFormOpen(true);
                    }}
                    className="flex-1 py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold rounded-lg border border-blue-200/60 flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Edit size={12} className="text-blue-600" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.nameEn || item.nameSi || 'Nursery')}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200/60 transition cursor-pointer"
                    title="Delete Nursery"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ultra-compact Data Table (Desktop md+) */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs text-gray-700 border-collapse">
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
                  Stocks
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-center">
                  Approval
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-center">
                  Active
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-xs text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-emerald-600" />
                      <span>Loading nurseries...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredNurseries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-xs text-gray-400">
                    <Trees size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-600">No plant nurseries found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Click "Add New Nursery" to list your first plant nursery.</p>
                  </td>
                </tr>
              ) : (
                filteredNurseries.map((item) => {
                  const primaryPhoto =
                    item.images && item.images.length > 0 ? item.images[0].imageUrl : null;
                  const loc = item.location;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* 1. Nursery Name & Thumbnail */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-2 max-w-[220px]">
                          {primaryPhoto ? (
                            <img
                              src={primaryPhoto}
                              alt={item.nameEn || item.nameSi || 'Nursery'}
                              className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-emerald-100/60 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
                              <Sprout size={13} />
                            </div>
                          )}
                          <span
                            className="font-semibold text-gray-900 truncate text-xs"
                            title={item.nameEn || item.nameSi || ''}
                          >
                            {item.nameEn || item.nameSi || '—'}
                          </span>
                        </div>
                      </td>

                      {/* 2. Owner */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">
                        <span className="truncate max-w-[140px] inline-block text-xs font-medium text-gray-800">
                          {item.ownerNameEn || item.ownerNameSi || '—'}
                        </span>
                      </td>

                      {/* 3. Phone */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-600 font-mono text-[11px]">
                        {item.whatsappNumber || '—'}
                      </td>

                      {/* 4. Location */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-600 text-[11px]">
                        {loc?.districtEn || loc?.districtSi ? (
                          <span className="font-medium text-gray-700">
                            {loc.districtEn || loc.districtSi}
                            {loc.provinceEn ? `, ${loc.provinceEn}` : ''}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* 5. Stocks Count */}
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {item.stocks?.length || 0} Crops
                        </span>
                      </td>

                      {/* 6. Approval Status */}
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        {item.approvalStatus === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 size={11} />
                            <span>Approved</span>
                          </span>
                        ) : item.approvalStatus === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                            <XCircle size={11} />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                            <Clock size={11} />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* 7. Active State Toggle */}
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id)}
                          title={item.activeState ? 'Click to deactivate' : 'Click to activate'}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                            item.activeState
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          {item.activeState ? <Check size={10} /> : <X size={10} />}
                          <span>{item.activeState ? 'Active' : 'Hidden'}</span>
                        </button>
                      </td>

                      {/* 8. Actions */}
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNursery(item);
                              setIsViewOpen(true);
                            }}
                            title="View Nursery Details"
                            className="p-1 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNursery(item);
                              setIsFormOpen(true);
                            }}
                            title="Edit Nursery"
                            className="p-1 hover:bg-blue-50 text-gray-500 hover:text-blue-700 rounded transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item.id, item.nameEn || item.nameSi || 'Nursery')
                            }
                            title="Delete Nursery"
                            className="p-1 hover:bg-rose-50 text-gray-500 hover:text-rose-700 rounded transition-colors cursor-pointer"
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
      </div>

      {/* Modals */}
      {isFormOpen && (
        <NurseryFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchNurseries();
          }}
          editingItem={selectedNursery}
          options={formOptions}
          onOptionsRefresh={fetchFormOptions}
        />
      )}

      {isViewOpen && (
        <NurseryViewModal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          nursery={selectedNursery}
        />
      )}
    </div>
  );
};

export default UserNurseryManagement;

