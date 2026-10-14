import { useState, useEffect } from 'react';
import type React from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Database,
  Layers,
  Sprout,
  Truck,
  Clock,
  Award,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import type { AssociateOption } from './types';

interface NurseryMasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOptionsUpdated: () => void;
}

type TabType =
  | 'grades'
  | 'deliveries'
  | 'operating-hours'
  | 'certifications'
  | 'categories'
  | 'crops'
  | 'varieties'
  | 'specialties';

interface TabConfig {
  key: TabType;
  labelSi: string;
  labelEn: string;
  endpoint: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { key: 'grades', labelSi: 'තවාන් ශ්‍රේණි (Grades)', labelEn: 'Grades', endpoint: 'nursery-grades', icon: <Award size={14} /> },
  { key: 'deliveries', labelSi: 'ප්‍රවාහන සේවා (Deliveries)', labelEn: 'Deliveries', endpoint: 'nursery-deliveries', icon: <Truck size={14} /> },
  { key: 'operating-hours', labelSi: 'විවෘත වේලාවන් (Hours)', labelEn: 'Hours', endpoint: 'nursery-operating-hours', icon: <Clock size={14} /> },
  { key: 'certifications', labelSi: 'නිල සහතික (Certifications)', labelEn: 'Certifications', endpoint: 'nursery-certifications', icon: <Award size={14} /> },
  { key: 'categories', labelSi: 'බෝග කාණ්ඩ (Categories)', labelEn: 'Categories', endpoint: 'nursery-categories', icon: <Layers size={14} /> },
  { key: 'crops', labelSi: 'බෝග වර්ග (Crops)', labelEn: 'Crops', endpoint: 'nursery-crops', icon: <Sprout size={14} /> },
  { key: 'varieties', labelSi: 'නියම ප්‍රභේද (Varieties)', labelEn: 'Varieties', endpoint: 'nursery-varieties', icon: <Sparkles size={14} /> },
  { key: 'specialties', labelSi: 'විශේෂතා (Specialties)', labelEn: 'Specialties', endpoint: 'nursery-specialties', icon: <Database size={14} /> }
];

export default function NurseryMasterDataModal({
  isOpen,
  onClose,
  onOptionsUpdated
}: NurseryMasterDataModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('grades');
  const [items, setItems] = useState<AssociateOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New/Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameSi, setNameSi] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentTab = TABS.find((t) => t.key === activeTab) || TABS[0];

  const fetchItems = async (endpoint: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/${endpoint}`);
      const json = await res.json();
      const list = json?.data || json?.items || (Array.isArray(json) ? json : []);
      setItems(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error('Error fetching master items:', err);
      setErrorMsg('දත්ත ලබා ගැනීමේදී දෝෂයක් ඇති විය.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchItems(currentTab.endpoint);
      setEditingId(null);
      setNameSi('');
      setNameEn('');
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameSi.trim() && !nameEn.trim()) {
      setErrorMsg('කරුණාකර සිංහල හෝ ඉංග්‍රීසි නමක් ඇතුළත් කරන්න.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = editingId
        ? `${API_BASE}/${currentTab.endpoint}/${editingId}`
        : `${API_BASE}/${currentTab.endpoint}`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nameSi: nameSi.trim() || null,
          nameEn: nameEn.trim() || null
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'සුරැකීමේදී දෝෂයක් ඇති විය.');
      }

      setEditingId(null);
      setNameSi('');
      setNameEn('');
      fetchItems(currentTab.endpoint);
      onOptionsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'දෝෂයක් ඇති විය.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (item: AssociateOption) => {
    setEditingId(item.id);
    setNameSi(item.nameSi || '');
    setNameEn(item.nameEn || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNameSi('');
    setNameEn('');
  };

  const handleToggleStatus = async (item: AssociateOption) => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/${currentTab.endpoint}/${item.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchItems(currentTab.endpoint);
        onOptionsUpdated();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ඔබට මෙම අගය ඉවත් කිරීමට අවශ්‍ය බව තහවුරු කරන්නද?')) return;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/${currentTab.endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'ඉවත් කිරීමට නොහැකි විය.');
        return;
      }

      fetchItems(currentTab.endpoint);
      onOptionsUpdated();
    } catch (err) {
      console.error('Error deleting master item:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100/70 text-teal-800 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Dropdowns & Associate Tables කළමනාකරණය
              </h2>
              <p className="text-[11px] text-gray-500">
                තවාන් ආකෘතියේ (Form) පෙන්වන ශ්‍රේණි, බෝග, ප්‍රභේද සහ සේවා වර්ග මෙතැනින් කළමනාකරණය කරන්න.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-gray-50/80 border-b border-gray-200 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span>{tab.labelSi}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Add / Edit Form */}
          <form
            onSubmit={handleSave}
            className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row items-end gap-3"
          >
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                නම (සිංහල) *
              </label>
              <input
                type="text"
                value={nameSi}
                onChange={(e) => setNameSi(e.target.value)}
                placeholder="උදා: Grade A / පළතුරු පැල / TEJC"
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Name (English)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Grade A / Fruit Plants / TEJC"
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  අවලංගු කරන්න
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg transition-colors shadow cursor-pointer w-full sm:w-auto"
              >
                {editingId ? <Check size={14} /> : <Plus size={14} />}
                <span>{editingId ? 'යාවත්කාලීන කරන්න' : 'එක් කරන්න'}</span>
              </button>
            </div>
          </form>

          {/* Ultra-compact Master Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] text-gray-500 font-bold uppercase whitespace-nowrap">
                  <th className="px-3 py-2">නම (සිංහල)</th>
                  <th className="px-3 py-2">Name (English)</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2 text-center">තත්ත්වය</th>
                  <th className="px-3 py-2 text-right">ක්‍රියාකාරකම්</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-400 text-xs">
                      පූරණය වෙමින් පවතී...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-400 text-xs">
                      තවමත් දත්ත ඇතුළත් කර නොමැත. ඉහත පෝරමයෙන් අලුතින් එක් කරන්න.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-1.5 font-semibold text-gray-900 text-xs truncate max-w-[180px]">
                        {item.nameSi || '—'}
                      </td>
                      <td className="px-3 py-1.5 text-gray-700 text-xs truncate max-w-[180px]">
                        {item.nameEn || '—'}
                      </td>
                      <td className="px-3 py-1.5 text-[10px] text-gray-400 font-mono truncate max-w-[140px]">
                        {item.slug}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className="cursor-pointer inline-flex items-center"
                          title={item.activeState ? 'Active' : 'Inactive'}
                        >
                          {item.activeState ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                              Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            title="සංස්කරණය"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="ඉවත් කරන්න"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100">
          <span className="text-[11px] text-gray-500">
            එකතුව: <strong>{items.length}</strong> අයිතම
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200/80 rounded-xl transition-colors cursor-pointer"
          >
            වසන්න (Done)
          </button>
        </div>
      </div>
    </div>
  );
}
