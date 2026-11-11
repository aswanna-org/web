import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  RefreshCw,
  Package,
  Check,
  X,
  MapPin,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../admin/components/ConfirmDialog';
import MushroomFormModal from '../../admin/components/mushroom/MushroomFormModal';
import type {
  MushroomFormDropdownOptions,
  MushroomSupplierItem
} from '../../admin/components/mushroom/types';
import MushroomViewModal from '../../admin/components/mushroom/MushroomViewModal';

export const UserMushroomManagement = () => {
  const { user, token } = useAuth();
  const { confirm } = useConfirm();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [suppliers, setSuppliers] = useState<MushroomSupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<MushroomSupplierItem | null>(null);
  const [formOptions, setFormOptions] = useState<MushroomFormDropdownOptions>({
    categories: [],
    deliveries: [],
    operatingHours: [],
    badges: [],
    locations: []
  });

  const fetchFormOptions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/mushroom-suppliers/form-options`);
      const json = await res.json();
      if (json.success && json.data) {
        setFormOptions(json.data);
      }
    } catch (err) {
      console.error('Error fetching mushroom options:', err);
    }
  }, [API_BASE_URL]);

  const fetchSuppliers = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: user.id,
        limit: '100'
      });
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`${API_BASE_URL}/mushroom-suppliers?${params.toString()}`, {
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSuppliers(json.data);
      } else {
        setSuppliers([]);
      }
    } catch (err) {
      console.error('Error fetching user mushroom suppliers:', err);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, user?.id, token, search]);

  useEffect(() => {
    fetchFormOptions();
  }, [fetchFormOptions]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Delete Mushroom Business',
      subtitle: 'මෙම බිම්මල් ව්‍යාපාරය ස්ථිරවම ඉවත් කිරීමට ඔබට අවශ්‍යද?',
      message: `Are you sure you want to delete "${name}"? Associated inventory items and images will also be removed. This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/mushroom-suppliers/${id}`, {
        method: 'DELETE',
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit
      });
      if (res.ok) {
        fetchSuppliers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete mushroom business.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error while deleting.');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/mushroom-suppliers/${id}/toggle-status`, {
        method: 'PATCH',
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit
      });
      if (res.ok) {
        fetchSuppliers();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">My Mushroom Businesses</h2>
              <p className="text-xs text-gray-500">ඔබ විසින් ලියාපදිංචි කළ බිම්මල් වගාකරුවන් සහ සැපයුම්කරුවන්</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedSupplier(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>Add Mushroom Business</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by business name, owner, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <span className="text-xs text-gray-400 font-medium hidden sm:inline">
          Total: {suppliers.length} records
        </span>
      </div>

      {/* Mobile Card View (Completely responsive for mobile - Compact) */}
      <div className="block md:hidden space-y-2.5">
        {loading ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-xs text-gray-500">
            <RefreshCw size={16} className="animate-spin text-purple-600 mx-auto mb-1.5" />
            <span>Loading mushroom businesses...</span>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-xs text-gray-400">
            <Sparkles size={32} className="mx-auto mb-1.5 text-gray-300" />
            <p className="font-semibold text-gray-700 text-xs">No mushroom businesses found</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Tap "+ Add Mushroom Business" to list your profile.</p>
          </div>
        ) : (
          suppliers.map((item) => {
            const primaryPhoto =
              item.images && item.images.length > 0 ? item.images[0].imageUrl : null;
            const loc = item.location;

            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-2.5 space-y-2">
                {/* Card Top: Photo + Name + Owner */}
                <div className="flex items-start gap-2 justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {primaryPhoto ? (
                      <img
                        src={primaryPhoto}
                        alt={item.businessNameEn || item.businessNameSi || 'Mushroom'}
                        className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shrink-0">
                        <Sparkles size={16} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">
                        {item.businessNameEn || item.businessNameSi || 'Untitled Business'}
                      </h4>
                      <p className="text-[10px] text-gray-500 truncate">
                        {item.ownerNameEn || item.ownerNameSi || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item.id)}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold transition cursor-pointer shrink-0 ${
                      item.activeState
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    {item.activeState ? <Check size={9} /> : <X size={9} />}
                    <span>{item.activeState ? 'Active' : 'Hidden'}</span>
                  </button>
                </div>

                {/* Details row (Location, Phone, Inventory) */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-gray-100 text-[10px]">
                  <div className="flex items-center gap-1 text-gray-600 truncate">
                    <MapPin size={11} className="text-gray-400 shrink-0" />
                    <span className="truncate">{loc?.districtEn || loc?.districtSi || 'Location N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 truncate">
                    <Phone size={11} className="text-gray-400 shrink-0" />
                    <span className="font-mono truncate">{item.whatsappNumber || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 col-span-2">
                    <Package size={11} className="text-gray-400 shrink-0" />
                    <span className="px-1 py-0.2 rounded bg-gray-100 text-gray-700 font-medium text-[9px]">
                      {item.inventoryItems?.length || 0} Products / Supplies Listed
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSupplier(item);
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
                      setSelectedSupplier(item);
                      setIsFormOpen(true);
                    }}
                    className="flex-1 py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold rounded-lg border border-blue-200/60 flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Edit size={12} className="text-blue-600" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.businessNameEn || item.businessNameSi || 'Mushroom Business')}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200/60 transition cursor-pointer"
                    title="Delete Business"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs text-gray-700 border-collapse">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200">
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                  Business Name & Owner
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                  Phone
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                  Location
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-center">
                  Inventory
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
                  <td colSpan={6} className="px-3 py-10 text-center text-xs text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-emerald-600" />
                      <span>Loading mushroom businesses...</span>
                    </div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center text-xs text-gray-400">
                    <Sparkles size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-600">No mushroom businesses found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Click "Add Mushroom Business" to list your profile.</p>
                  </td>
                </tr>
              ) : (
                suppliers.map((item) => {
                  const primaryPhoto =
                    item.images && item.images.length > 0 ? item.images[0].imageUrl : null;
                  const loc = item.location;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* 1. Name & Photo */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-2 max-w-[240px]">
                          {primaryPhoto ? (
                            <img
                              src={primaryPhoto}
                              alt={item.businessNameEn || item.businessNameSi || 'Mushroom'}
                              className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                              <Sparkles size={13} />
                            </div>
                          )}
                          <div className="overflow-hidden min-w-0">
                            <span className="font-semibold text-gray-900 truncate text-xs block" title={item.businessNameEn || item.businessNameSi || ''}>
                              {item.businessNameEn || item.businessNameSi || '—'}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate block">
                              {item.ownerNameEn || item.ownerNameSi || '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Phone */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-600 font-mono text-[11px]">
                        {item.whatsappNumber || '—'}
                      </td>

                      {/* 3. Location */}
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

                      {/* 4. Inventory items */}
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                          <Package size={10} />
                          <span>{item.inventoryItems?.length || 0} Products</span>
                        </span>
                      </td>

                      {/* 5. Active state */}
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

                      {/* 6. Actions */}
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSupplier(item);
                              setIsViewOpen(true);
                            }}
                            title="View Supplier Details"
                            className="p-1 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSupplier(item);
                              setIsFormOpen(true);
                            }}
                            title="Edit Supplier"
                            className="p-1 hover:bg-blue-50 text-gray-500 hover:text-blue-700 rounded transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item.id, item.businessNameEn || item.businessNameSi || 'Mushroom Business')
                            }
                            title="Delete Supplier"
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
        <MushroomFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchSuppliers();
          }}
          editingItem={selectedSupplier}
          options={formOptions}
          onOptionsRefresh={fetchFormOptions}
          isAdmin={user?.role === 'ADMIN'}
        />
      )}

      {isViewOpen && (
        <MushroomViewModal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          supplier={selectedSupplier}
        />
      )}
    </div>
  );
};

export default UserMushroomManagement;

