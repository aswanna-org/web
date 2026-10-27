import { useState, useEffect, useCallback } from 'react';
import type React from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X
} from 'lucide-react';
import type { MushroomAssociateOption } from './types';
import { generateFrontendSlug } from './MushroomFormModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface MushroomMasterDataTableProps {
  title: string;
  itemSingular: string;
  endpoint: string;
  icon: React.ReactNode;
  onDataChanged?: () => void;
}

export default function MushroomMasterDataTable({
  title,
  itemSingular,
  endpoint,
  icon,
  onDataChanged
}: MushroomMasterDataTableProps) {
  const [items, setItems] = useState<MushroomAssociateOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  // Modal for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MushroomAssociateOption | null>(null);
  const [nameEn, setNameEn] = useState('');
  const [nameSi, setNameSi] = useState('');
  const [activeState, setActiveState] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') {
        params.append('activeOnly', statusFilter === 'active' ? 'true' : 'false');
      }

      const res = await fetch(`${API_BASE_URL}/${endpoint}?${params.toString()}`);
      if (!res.ok) return;
      const json = await res.json();

      const dataItems = json.items || json.data || [];
      setItems(Array.isArray(dataItems) ? dataItems : []);
      setTotalPages(json.totalPages || json.meta?.totalPages || 1);
      setTotalCount(json.total || json.meta?.total || dataItems.length || 0);
    } catch (err) {
      console.error(`Failed to load ${title}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, limit, search, statusFilter, title]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setNameEn('');
    setNameSi('');
    setActiveState(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MushroomAssociateOption) => {
    setEditingItem(item);
    setNameEn(item.nameEn || '');
    setNameSi(item.nameSi || '');
    setActiveState(item.activeState);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameSi.trim()) {
      setErrorMsg('Please enter at least one name (English or Sinhala).');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const payload: any = {
        nameEn: nameEn.trim() || nameSi.trim(),
        nameSi: nameSi.trim() || nameEn.trim(),
        activeState
      };

      if (!editingItem) {
        payload.slug = generateFrontendSlug(nameEn || nameSi, endpoint);
      }

      const url = editingItem
        ? `${API_BASE_URL}/${endpoint}/${editingItem.id}`
        : `${API_BASE_URL}/${endpoint}`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Failed to save ${itemSingular}.`);
      }

      setIsModalOpen(false);
      fetchItems();
      onDataChanged?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: MushroomAssociateOption) => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/${endpoint}/${item.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        fetchItems();
        onDataChanged?.();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemSingular.toLowerCase()}?`)) {
      return;
    }
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        fetchItems();
        onDataChanged?.();
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchItems()}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer transition"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition"
          >
            <Plus size={14} />
            <span>Add {itemSingular}</span>
          </button>
        </div>
      </div>

      {/* Ultra-Compact Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-500 uppercase font-bold text-[11px] whitespace-nowrap">
                <th className="px-3 py-2 w-10 text-center">#</th>
                <th className="px-3 py-2">Name (English / Primary)</th>
                <th className="px-3 py-2">Name (Sinhala)</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2 text-center">Usage</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                    <RefreshCw size={18} className="animate-spin mx-auto mb-1 text-emerald-600" />
                    <span>Loading {title.toLowerCase()}...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                    No {title.toLowerCase()} found.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const usageCount = item._count?.suppliers ?? item._count?.inventoryItems ?? item._count?.featuredItems ?? 0;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-3 py-1.5 text-center text-[10px] text-gray-400 font-mono">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="px-3 py-1.5 font-semibold text-gray-900 truncate max-w-[200px]">
                        {item.nameEn || '—'}
                      </td>
                      <td className="px-3 py-1.5 text-gray-700 truncate max-w-[200px]">
                        {item.nameSi || '—'}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-[10px] text-gray-400 truncate max-w-[150px]">
                        {item.slug}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                          {usageCount}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold cursor-pointer transition ${
                            item.activeState
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.activeState ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                          <span>{item.activeState ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition cursor-pointer"
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

        {/* Compact Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50/60 border-t border-gray-200 text-[11px] text-gray-500">
            <div>
              Total: <strong>{totalCount}</strong> items
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

      {/* Add / Edit Master Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/70">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingItem ? `Edit ${itemSingular}` : `Add New ${itemSingular}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Name in English (Required)
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Spawn Bottles"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Name in Sinhala (සිංහල නම)
                </label>
                <input
                  type="text"
                  value={nameSi}
                  onChange={(e) => setNameSi(e.target.value)}
                  placeholder="උදා: බිම්මල් බීජ"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={activeState}
                  onChange={(e) => setActiveState(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                />
                <label htmlFor="activeToggle" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Active State
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-lg font-semibold transition cursor-pointer shadow-xs"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
