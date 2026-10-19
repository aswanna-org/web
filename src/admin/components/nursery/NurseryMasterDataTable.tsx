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
import type { AssociateOption } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface NurseryMasterDataTableProps {
  title: string;
  itemSingular: string;
  endpoint: string;
  icon: React.ReactNode;
  categories?: AssociateOption[];
  hasCategoryRelation?: boolean;
  crops?: AssociateOption[];
  hasCropRelation?: boolean;
  onDataChanged?: () => void;
}

export default function NurseryMasterDataTable({
  title,
  itemSingular,
  endpoint,
  icon,
  categories,
  hasCategoryRelation,
  crops,
  hasCropRelation,
  onDataChanged
}: NurseryMasterDataTableProps) {
  const [items, setItems] = useState<AssociateOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cropFilter, setCropFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  // Modal for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AssociateOption | null>(null);
  const [nameEn, setNameEn] = useState('');
  const [nameSi, setNameSi] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cropId, setCropId] = useState('');
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
      if (hasCategoryRelation && categoryFilter) {
        params.append('categoryId', categoryFilter);
      }
      if (hasCropRelation && cropFilter) {
        params.append('cropId', cropFilter);
      }

      const res = await fetch(`${API_BASE_URL}/${endpoint}?${params.toString()}`);
      if (!res.ok) return;
      const json = await res.json();

      const list = json?.data || json?.items || (Array.isArray(json) ? json : []);
      setItems(Array.isArray(list) ? list : []);
      setTotalPages(json?.meta?.totalPages || 1);
      setTotalCount(json?.meta?.total || list.length || 0);
    } catch (err) {
      console.error(`Failed to fetch ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, limit, search, statusFilter, hasCategoryRelation, categoryFilter, hasCropRelation, cropFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter, cropFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setNameEn('');
    setNameSi('');
    setCategoryId(categoryFilter || '');
    setCropId(cropFilter || '');
    setActiveState(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AssociateOption) => {
    setEditingItem(item);
    setNameEn(item.nameEn || '');
    setNameSi(item.nameSi || '');
    setCategoryId(item.categoryId || item.category?.id || '');
    setCropId(item.cropId || item.crop?.id || '');
    setActiveState(item.activeState !== false);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameSi.trim()) {
      setErrorMsg('Please enter at least one name.');
      return;
    }
    if (hasCategoryRelation && !categoryId) {
      setErrorMsg('Please select a Crop Category.');
      return;
    }
    if (hasCropRelation && !cropId) {
      setErrorMsg('Please select a Crop.');
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
      if (hasCategoryRelation) {
        payload.categoryId = categoryId || null;
      }
      if (hasCropRelation) {
        payload.cropId = cropId || null;
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
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: AssociateOption) => {
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
    if (!window.confirm(`Are you sure you want to delete this ${itemSingular}?`)) return;

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
      } else {
        const json = await res.json();
        alert(json.error || `Failed to delete ${itemSingular}.`);
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Top Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">{title}</h3>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                {totalCount}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Manage dropdown options and data presets for {itemSingular.toLowerCase()} records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${itemSingular}...`}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Category Filter (When applicable, e.g. Crops under Category) */}
          {hasCategoryRelation && categories && categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-gray-50 border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer font-medium text-emerald-950"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn || c.nameSi}
                </option>
              ))}
            </select>
          )}

          {/* Crop Filter (When applicable, e.g. Varieties under Crop) */}
          {hasCropRelation && crops && crops.length > 0 && (
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-gray-50 border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer font-medium text-emerald-950"
            >
              <option value="">All Crops</option>
              {crops.map((cr) => (
                <option key={cr.id} value={cr.id}>
                  {cr.nameEn || cr.nameSi}
                </option>
              ))}
            </select>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => fetchItems()}
            title="Refresh"
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Add Button */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Plus size={14} />
            <span>Add {itemSingular}</span>
          </button>
        </div>
      </div>

      {/* Ultra-Compact Table complying strictly with AGENTS.md */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-gray-700">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                <th className="px-3 py-2 w-12 text-center">#</th>
                <th className="px-3 py-2">Name (English)</th>
                <th className="px-3 py-2">Name (Sinhala)</th>
                {hasCategoryRelation && <th className="px-3 py-2">Category</th>}
                {hasCropRelation && <th className="px-3 py-2">Crop</th>}
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2 text-center">Nurseries / Stocks</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7 + (hasCategoryRelation ? 1 : 0) + (hasCropRelation ? 1 : 0)} className="px-3 py-8 text-center text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-emerald-600" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7 + (hasCategoryRelation ? 1 : 0) + (hasCropRelation ? 1 : 0)} className="px-3 py-8 text-center text-gray-400">
                    No {title.toLowerCase()} found.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const usageCount = item._count?.nurseries ?? item._count?.stocks ?? 0;
                  const rowNumber = (page - 1) * limit + index + 1;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-3 py-1.5 text-center text-gray-400 font-mono text-[10px]">
                        {rowNumber}
                      </td>

                      <td className="px-3 py-1.5">
                        <span className="font-semibold text-gray-900 truncate text-xs block max-w-xs">
                          {item.nameEn || '—'}
                        </span>
                      </td>

                      <td className="px-3 py-1.5">
                        <span className="text-gray-700 truncate text-xs block max-w-xs">
                          {item.nameSi || '—'}
                        </span>
                      </td>

                      {hasCategoryRelation && (
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          {item.category ? (
                            <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {item.category.nameEn || item.category.nameSi}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">None</span>
                          )}
                        </td>
                      )}

                      {hasCropRelation && (
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          {item.crop ? (
                            <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {item.crop.nameEn || item.crop.nameSi}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">None</span>
                          )}
                        </td>
                      )}

                      <td className="px-3 py-1.5">
                        <span className="text-[10px] text-gray-400 font-mono truncate block max-w-[140px]">
                          {item.slug || '—'}
                        </span>
                      </td>

                      <td className="px-3 py-1.5 text-center">
                        <span className="inline-block text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          {usageCount}
                        </span>
                      </td>

                      <td className="px-3 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold cursor-pointer transition-colors ${
                            item.activeState
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.activeState ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                          <span>{item.activeState ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit"
                            className="p-1 hover:bg-gray-100 text-blue-600 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                            className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors cursor-pointer"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50/90 border-t border-gray-200 text-[11px] text-gray-500">
            <span>
              Page {page} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal with clean English labels */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50/80 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  {icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  {editingItem ? `Edit ${itemSingular}` : `Add New ${itemSingular}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Crop Category Dropdown (Required when hasCategoryRelation is true) */}
              {hasCategoryRelation && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Crop Category *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="">-- Select Crop Category --</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameEn || cat.nameSi} {cat.nameSi && cat.nameEn ? `(${cat.nameSi})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Every crop belongs to a category (e.g. Vegetable → Carrot, Fruit → Mango).
                  </p>
                </div>
              )}

              {/* Crop Dropdown (Required when hasCropRelation is true) */}
              {hasCropRelation && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Crop *
                  </label>
                  <select
                    required
                    value={cropId}
                    onChange={(e) => setCropId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="">-- Select Crop --</option>
                    {crops?.map((cr) => (
                      <option key={cr.id} value={cr.id}>
                        {cr.nameEn || cr.nameSi} {cr.nameSi && cr.nameEn ? `(${cr.nameSi})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Every plant variety belongs to a parent crop (e.g. Mango → TEJC, Chili → MI-2).
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder={`e.g. ${itemSingular} Name in English`}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Name (Sinhala)
                </label>
                <input
                  type="text"
                  value={nameSi}
                  onChange={(e) => setNameSi(e.target.value)}
                  placeholder={`e.g. ${itemSingular} Name in Sinhala`}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="masterItemActiveState"
                  checked={activeState}
                  onChange={(e) => setActiveState(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="masterItemActiveState"
                  className="text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  Active Status
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 rounded-lg shadow-2xs cursor-pointer"
                >
                  {saving ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={13} />
                  )}
                  <span>{editingItem ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
