import { useState } from 'react';
import type React from 'react';
import {
  X,
  RefreshCw,
  AlertCircle,
  Truck,
  Clock,
  Layers,
  Flame,
  Check
} from 'lucide-react';
import type { MushroomAssociateOption } from './types';
import { generateFrontendSlug } from './MushroomFormModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export type MushroomMasterDataType =
  | 'category'
  | 'delivery'
  | 'operatingHours'
  | 'badge';

interface MasterDataConfig {
  endpoint: string;
  title: string;
  itemSingular: string;
  icon: React.ReactNode;
  placeholderEn: string;
  placeholderSi: string;
}

const MASTER_CONFIGS: Record<MushroomMasterDataType, MasterDataConfig> = {
  category: {
    endpoint: 'mushroom-categories',
    title: 'Add New Mushroom Category',
    itemSingular: 'Mushroom Category',
    icon: <Layers size={16} className="text-emerald-700" />,
    placeholderEn: 'e.g. Spawn Bottles / Fresh Mushrooms',
    placeholderSi: 'උදා: බිම්මල් බීජ / නැවුම් බිම්මල්'
  },
  delivery: {
    endpoint: 'mushroom-deliveries',
    title: 'Add Delivery Option',
    itemSingular: 'Delivery Option',
    icon: <Truck size={16} className="text-emerald-700" />,
    placeholderEn: 'e.g. Island-wide Delivery Available / Courier Service',
    placeholderSi: 'උදා: දිවයින පුරා බෙදාහැරීම ඇත / කුරියර් මගින්'
  },
  operatingHours: {
    endpoint: 'mushroom-operating-hours',
    title: 'Add Operating Hours Preset',
    itemSingular: 'Operating Hours Preset',
    icon: <Clock size={16} className="text-emerald-700" />,
    placeholderEn: 'e.g. 8.00 AM - 6.00 PM (Daily)',
    placeholderSi: 'උදා: පෙ.ව. 8.00 - ප.ව. 6.00 (සෑම දිනකම)'
  },
  badge: {
    endpoint: 'mushroom-badges',
    title: 'Add Promotional Badge',
    itemSingular: 'Badge',
    icon: <Flame size={16} className="text-amber-500" />,
    placeholderEn: 'e.g. Fast Selling / Popular / Best Seller',
    placeholderSi: 'උදා: ඉක්මනින් විකිණේ / ජනප්‍රියයි'
  }
};

interface MushroomQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: MushroomMasterDataType;
  onCreated: (newItem: MushroomAssociateOption) => void;
}

export default function MushroomQuickAddModal({
  isOpen,
  onClose,
  type,
  onCreated
}: MushroomQuickAddModalProps) {
  const config = MASTER_CONFIGS[type];
  const [nameEn, setNameEn] = useState('');
  const [nameSi, setNameSi] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nameEn.trim() && !nameSi.trim()) {
      setErrorMsg('Please enter at least one name (English or Sinhala).');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const slug = generateFrontendSlug(nameEn || nameSi, config.endpoint);

      const payload = {
        slug,
        nameEn: nameEn.trim() || nameSi.trim(),
        nameSi: nameSi.trim() || nameEn.trim(),
        activeState: true
      };

      const res = await fetch(`${API_BASE}/${config.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Failed to create ${config.itemSingular}.`);
      }

      const createdItem: MushroomAssociateOption = json.data || json;
      onCreated(createdItem);
      setNameEn('');
      setNameSi('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              {config.icon}
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900">{config.title}</h3>
              <p className="text-[10px] text-gray-500">Quickly add and auto-select this preset</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle size={14} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Name in English (English නම) *
            </label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder={config.placeholderEn}
              className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
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
              placeholder={config.placeholderSi}
              className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition"
            >
              {saving ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Add Preset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
