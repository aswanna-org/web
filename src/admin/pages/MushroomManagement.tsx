import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Phone,
  Layers,
  ChevronLeft,
  ChevronRight,
  Truck,
  Clock,
  Flame
} from 'lucide-react';
import type {
  MushroomSupplierItem,
  MushroomFormDropdownOptions
} from '../components/mushroom/types';
import MushroomFormModal from '../components/mushroom/MushroomFormModal';
import MushroomViewModal from '../components/mushroom/MushroomViewModal';
import MushroomMasterDataTable from '../components/mushroom/MushroomMasterDataTable';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const defaultOptions: MushroomFormDropdownOptions = {
  categories: [],
  deliveries: [],
  operatingHours: [],
  badges: [],
  locations: []
};

type ActiveTabType =
  | 'suppliers'
  | 'categories'
  | 'deliveries'
  | 'operating-hours'
  | 'badges'
  | 'locations';

export default function MushroomManagement() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('suppliers');
  const [suppliers, setSuppliers] = useState<MushroomSupplierItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<MushroomFormDropdownOptions>(defaultOptions);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<MushroomSupplierItem | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<MushroomSupplierItem | null>(null);

  // Fetch form dropdown options
  const fetchFormOptions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/mushroom-suppliers/form-options`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.data) {
        setOptions(json.data);
      }
    } catch (err) {
      console.error('Failed to load mushroom form options:', err);
    }
  }, []);

  // Fetch mushroom suppliers list
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedStatus !== '') {
        params.append('activeOnly', selectedStatus === 'active' ? 'true' : 'false');
      }

      const res = await fetch(`${API_BASE_URL}/mushroom-suppliers?${params.toString()}`);
      if (!res.ok) return;
      const json = await res.json();

      const items = json?.data || json?.items || [];
      setSuppliers(Array.isArray(items) ? items : []);
      setTotalPages(json?.meta?.totalPages || json?.totalPages || 1);
      setTotalCount(json?.meta?.total || json?.total || items.length || 0);
    } catch (err) {
      console.error('Failed to load mushroom suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchFormOptions();
  }, [fetchFormOptions]);

  useEffect(() => {
    if (activeTab === 'suppliers') {
      fetchSuppliers();
    }
  }, [activeTab, fetchSuppliers]);

  // Handle Supplier Status Toggle
  const handleToggleStatus = async (item: MushroomSupplierItem) => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/mushroom-suppliers/${item.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        fetchSuppliers();
      }
    } catch (err) {
      console.error('Failed to toggle mushroom supplier status:', err);
    }
  };

  // Handle Supplier Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this mushroom supplier? All associated items and photos will be removed.')) {
      return;
    }
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/mushroom-suppliers/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || 'Failed to delete mushroom supplier');
        return;
      }
      fetchSuppliers();
    } catch (err) {
      console.error('Failed to delete mushroom supplier:', err);
    }
  };

  const activeCount = suppliers.filter((s) => s.activeState).length;
  const totalInventoryCount = suppliers.reduce((acc, curr) => acc + (curr.inventoryItems?.length || 0), 0);

  const tabs = [
    { key: 'suppliers' as const, label: 'Mushroom Suppliers', icon: <Sparkles size={14} />, count: totalCount },
    { key: 'categories' as const, label: 'Categories', icon: <Layers size={14} />, count: options.categories.length },
    { key: 'deliveries' as const, label: 'Deliveries', icon: <Truck size={14} />, count: options.deliveries.length },
    { key: 'operating-hours' as const, label: 'Operating Hours', icon: <Clock size={14} />, count: options.operatingHours.length },
    { key: 'badges' as const, label: 'Badges', icon: <Flame size={14} />, count: options.badges.length }
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              Mushroom Management
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">
              Manage nationwide mushroom suppliers, inventory items, top products, and preset master data.
            </p>
          </div>
        </div>

        {activeTab === 'suppliers' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetchSuppliers();
                fetchFormOptions();
              }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingSupplier(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition"
            >
              <Plus size={15} />
              <span>Add New Mushroom Supplier</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-gray-200 bg-white px-2 pt-2 rounded-t-xl border-x overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/60'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-emerald-200/80 text-emerald-900' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab: Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="space-y-3">
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Total Suppliers
              </span>
              <span className="text-xl font-bold text-gray-900 mt-0.5 block">{totalCount}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Active Listings
              </span>
              <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{activeCount}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Categories
              </span>
              <span className="text-xl font-bold text-gray-800 mt-0.5 block">{options.categories.length}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Total Inventory Listed
              </span>
              <span className="text-xl font-bold text-indigo-700 mt-0.5 block">{totalInventoryCount}</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[220px] flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search by business name, owner, phone..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none"
              >
                <option value="">All Categories</option>
                {options.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameSi || cat.nameEn}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Ultra-Compact Administrative Data Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-500 uppercase font-bold text-[11px] whitespace-nowrap">
                    <th className="px-3 py-2 w-10 text-center">#</th>
                    <th className="px-3 py-2">Photo</th>
                    <th className="px-3 py-2">Business Name & Owner</th>
                    <th className="px-3 py-2">District / Province</th>
                    <th className="px-3 py-2">Contact</th>
                    <th className="px-3 py-2 text-center">Categories</th>
                    <th className="px-3 py-2 text-center">Items</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading && suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                        <RefreshCw size={18} className="animate-spin mx-auto mb-1 text-emerald-600" />
                        <span>Loading mushroom suppliers...</span>
                      </td>
                    </tr>
                  ) : suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                        No mushroom suppliers found. Click "Add New Mushroom Supplier" to get started.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((item, idx) => {
                      const primaryImg =
                        item.images?.find((img) => img.isPrimary)?.imageUrl ||
                        item.images?.[0]?.imageUrl ||
                        '';
                      const loc = item.location;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-3 py-1.5 text-center text-[10px] text-gray-400 font-mono">
                            {(page - 1) * limit + idx + 1}
                          </td>
                          <td className="px-3 py-1.5">
                            {primaryImg ? (
                              <img
                                src={primaryImg}
                                alt={item.businessNameEn || 'Supplier'}
                                className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                                <Sparkles size={13} />
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-1.5">
                            <div className="font-semibold text-gray-900 truncate max-w-[200px] text-xs">
                              {item.businessNameSi || item.businessNameEn}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono truncate max-w-[200px]">
                              {item.ownerNameSi || item.ownerNameEn || 'Owner N/A'}
                            </div>
                          </td>
                          <td className="px-3 py-1.5 text-gray-600 whitespace-nowrap">
                            {loc?.districtSi || loc?.districtEn ? (
                              <span>
                                {loc.districtSi || loc.districtEn}
                                {loc.provinceSi ? `, ${loc.provinceSi}` : ''}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-1.5 whitespace-nowrap font-mono text-[11px] text-gray-700">
                            {item.whatsappNumber ? (
                              <span className="flex items-center gap-1">
                                <Phone size={11} className="text-emerald-600" />
                                {item.whatsappNumber}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800">
                              {item.categories?.length || 0}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {item.inventoryItems?.length || 0}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              title={item.activeState ? 'Click to unpublish (Deactivate)' : 'Click to approve & publish (Activate)'}
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold cursor-pointer transition ${
                                item.activeState
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/70'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100/70'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.activeState ? 'bg-emerald-600' : 'bg-amber-500'
                                }`}
                              />
                              <span>{item.activeState ? 'Active' : 'Pending'}</span>
                            </button>
                          </td>
                          <td className="px-3 py-1.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setViewingSupplier(item)}
                                className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSupplier(item);
                                  setIsFormOpen(true);
                                }}
                                className="p-1 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors cursor-pointer"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50/60 border-t border-gray-200 text-[11px] text-gray-500">
                <div>
                  Total: <strong>{totalCount}</strong> suppliers
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub Tabs: Master Data Tables */}
      {activeTab === 'categories' && (
        <MushroomMasterDataTable
          title="Mushroom Categories"
          itemSingular="Category"
          endpoint="mushroom-categories"
          icon={<Layers size={14} />}
          onDataChanged={fetchFormOptions}
        />
      )}

      {activeTab === 'deliveries' && (
        <MushroomMasterDataTable
          title="Delivery Options"
          itemSingular="Delivery Option"
          endpoint="mushroom-deliveries"
          icon={<Truck size={14} />}
          onDataChanged={fetchFormOptions}
        />
      )}

      {activeTab === 'operating-hours' && (
        <MushroomMasterDataTable
          title="Operating Hours"
          itemSingular="Operating Hours Option"
          endpoint="mushroom-operating-hours"
          icon={<Clock size={14} />}
          onDataChanged={fetchFormOptions}
        />
      )}

      {activeTab === 'badges' && (
        <MushroomMasterDataTable
          title="Promotional Badges"
          itemSingular="Badge"
          endpoint="mushroom-badges"
          icon={<Flame size={14} />}
          onDataChanged={fetchFormOptions}
        />
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <MushroomFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSupplier(null);
          }}
          onSuccess={() => {
            fetchSuppliers();
            fetchFormOptions();
          }}
          editingItem={editingSupplier}
          options={options}
          onOptionsRefresh={fetchFormOptions}
          isAdmin={true}
        />
      )}

      {/* View Modal */}
      {viewingSupplier && (
        <MushroomViewModal
          isOpen={Boolean(viewingSupplier)}
          onClose={() => setViewingSupplier(null)}
          supplier={viewingSupplier}
        />
      )}
    </div>
  );
}
