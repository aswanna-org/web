import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Save } from 'lucide-react';
import type { MasterTableMeta } from './types';

interface AgriLandMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  meta: MasterTableMeta;
  itemToEdit?: { id: string; nameEn: string; nameSi: string; activeState: boolean } | null;
  apiBaseUrl: string;
  token: string | null;
}

export const AgriLandMasterModal: React.FC<AgriLandMasterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  meta,
  itemToEdit,
  apiBaseUrl,
  token
}) => {
  const [nameEn, setNameEn] = useState('');
  const [nameSi, setNameSi] = useState('');
  const [activeState, setActiveState] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setNameEn(itemToEdit.nameEn || '');
      setNameSi(itemToEdit.nameSi || '');
      setActiveState(itemToEdit.activeState !== false);
    } else {
      setNameEn('');
      setNameSi('');
      setActiveState(true);
    }
    setError(null);
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameSi.trim()) {
      setError('Please provide both English and Sinhala names.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = itemToEdit
        ? `${apiBaseUrl}${meta.endpoint}/${itemToEdit.id}`
        : `${apiBaseUrl}${meta.endpoint}`;
      const method = itemToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nameEn: nameEn.trim(),
          nameSi: nameSi.trim(),
          activeState
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save record');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold">
              {itemToEdit ? `Edit ${meta.singularEn}` : `Add New ${meta.singularEn}`}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {itemToEdit ? `${meta.singularSi} සංස්කරණය` : `නව ${meta.singularSi} එක් කරන්න`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              English Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={`e.g. Freehold Deed / Solar Power`}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Sinhala Name (සිංහල නම) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="උදා: සින්නක්කර ඔප්පු / සූර්ය බලශක්තිය"
              value={nameSi}
              onChange={(e) => setNameSi(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-slate-700">Active Listing Status</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={activeState}
                onChange={(e) => setActiveState(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs hover:shadow transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : itemToEdit ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
