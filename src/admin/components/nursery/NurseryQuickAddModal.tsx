import { useState, useEffect } from 'react';
import type React from 'react';
import {
  X,
  Plus,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Award,
  Truck,
  Clock,
  Layers,
  Sprout,
  Sparkles,
  Database,
  Flame
} from 'lucide-react';
import type { AssociateOption } from './types';

export type MasterDataType =
  | 'grade'
  | 'delivery'
  | 'operatingHours'
  | 'certification'
  | 'category'
  | 'crop'
  | 'variety'
  | 'specialty'
  | 'badge';

interface MasterDataConfig {
  endpoint: string;
  title: string;
  itemSingular: string;
  icon: React.ReactNode;
  placeholderEn: string;
  placeholderSi: string;
}

const MASTER_CONFIGS: Record<MasterDataType, MasterDataConfig> = {
  grade: {
    endpoint: 'nursery-grades',
    title: 'Add New Nursery Grade',
    itemSingular: 'Nursery Grade',
    icon: <Award size={16} className="text-emerald-700" />,
    placeholderEn: 'e.g. Grade A+ / Star Class',
    placeholderSi: 'උදා: ශ්‍රේණිය A+ (විශිෂ්ඨ)'
  },
  delivery: {
    endpoint: 'nursery-deliveries',
    title: 'Add New Delivery Facility',
    itemSingular: 'Delivery Facility',
    icon: <Truck size={16} className="text-emerald-700" />,
    placeholderEn: 'e.g. Island-wide Island Transport / Express Courier',
    placeholderSi: 'උදා: දිවයින පුරා ප්‍රවාහනය ඇත'
  },
  operatingHours: {
    endpoint: 'nursery-operating-hours',
    title: 'Add Operating Hours Preset',
    itemSingular: 'Operating Hours Preset',
    icon: <Clock size={16} className="text-emerald-700" />,
    placeholderEn: 'e.g. Daily: 7.30 AM - 6.00 PM',
    placeholderSi: 'උදා: දිනපතා: පෙ.ව. 7.30 - ප.ව. 6.00'
  },
  certification: {
    endpoint: 'nursery-certifications',
    title: 'Add Quality Certification',
    itemSingular: 'Certification',
    icon: <Award size={16} className="text-emerald-700" />,
    placeholderEn: 'e.g. DOA Certified Mother Plant Nursery',
    placeholderSi: 'උදා: කෘෂිකර්ම දෙපාර්තමේන්තු සහතිකලත් මව් ශාක තවාන'
  },
  category: {
    endpoint: 'nursery-categories',
    title: 'Add Crop Category',
    itemSingular: 'Crop Category',
    icon: <Layers size={16} className="text-emerald-700" />,
    placeholderEn: 'e.g. Fruit Plants / Export Crops / Flowers',
    placeholderSi: 'උදා: පලතුරු පැළ / අපනයන බෝග / මල් වර්ග'
  },
  crop: {
    endpoint: 'nursery-crops',
    title: 'Add New Crop',
    itemSingular: 'Crop',
    icon: <Sprout size={16} className="text-emerald-700" />,
    placeholderEn: 'e.g. Mango / Avocado / Chili',
    placeholderSi: 'උදා: අඹ / අලිගැටපේර / මිරිස්'
  },
  variety: {
    endpoint: 'nursery-varieties',
    title: 'Add Plant Variety',
    itemSingular: 'Plant Variety',
    icon: <Sparkles size={16} className="text-emerald-700" />,
    placeholderEn: 'e.g. TEJC / Willard / MI-2',
    placeholderSi: 'උදා: ටීජේසී / විලාඩ් / එම්අයි-2'
  },
  specialty: {
    endpoint: 'nursery-specialties',
    title: 'Add Nursery Specialty',
    itemSingular: 'Specialty',
    icon: <Database size={16} className="text-emerald-700" />,
    placeholderEn: 'e.g. Grafted Fruit Plants / Tissue Culture Plants',
    placeholderSi: 'උදා: බද්ධ කළ පලතුරු පැළ / පටක රෝපිත පැළ'
  },
  badge: {
    endpoint: 'nursery-badges',
    title: 'Add Promotional Badge',
    itemSingular: 'Promotion Badge',
    icon: <Flame size={16} className="text-rose-600" />,
    placeholderEn: 'e.g. 🔥 Fast-Selling / 🌟 High Demand',
    placeholderSi: 'උදා: 🔥 ඉක්මනින් විකිණෙන / 🌟 ඉහළ ඉල්ලුමක් ඇති'
  }
};

interface NurseryQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: MasterDataType | null;
  categories: AssociateOption[];
  crops: AssociateOption[];
  initialCategoryId?: string;
  initialCropId?: string;
  onSuccess: (createdItem: AssociateOption, type: MasterDataType) => void;
}

export default function NurseryQuickAddModal({
  isOpen,
  onClose,
  type,
  categories,
  crops,
  initialCategoryId = '',
  initialCropId = '',
  onSuccess
}: NurseryQuickAddModalProps) {
  const [nameEn, setNameEn] = useState('');
  const [nameSi, setNameSi] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cropId, setCropId] = useState('');
  const [activeState, setActiveState] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNameEn('');
      setNameSi('');
      setActiveState(true);
      setErrorMsg(null);
      setCategoryId(initialCategoryId || '');
      setCropId(initialCropId || '');
    }
  }, [isOpen, initialCategoryId, initialCropId, type]);

  if (!isOpen || !type) return null;

  const config = MASTER_CONFIGS[type];
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const filteredCrops = categoryId
    ? crops.filter((c) => !c.categoryId || c.categoryId === categoryId)
    : crops;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameSi.trim()) {
      setErrorMsg('Please enter at least one name (English or Sinhala).');
      return;
    }

    if (type === 'crop' && !categoryId) {
      setErrorMsg('Please select a Crop Category.');
      return;
    }

    if (type === 'variety' && !cropId) {
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

      if (type === 'crop') {
        payload.categoryId = categoryId || null;
      }

      if (type === 'variety') {
        payload.cropId = cropId || null;
      }

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
        throw new Error(json.error || `Failed to save ${config.itemSingular}.`);
      }

      const created = json.data || json;
      onSuccess(created, type);
      onClose();
    } catch (err: any) {
      console.error('Quick add error:', err);
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50/90 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/70 flex items-center justify-center">
              {config.icon}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                {config.title}
              </h3>
              <p className="text-[10px] text-gray-500">
                Quickly add this preset without leaving the nursery form.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-3.5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* If Crop: Category Select */}
          {type === 'crop' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Crop Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 cursor-pointer"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn || c.nameSi} {c.nameSi && c.nameEn ? `(${c.nameSi})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* If Variety: Crop Select */}
          {type === 'variety' && (
            <div className="space-y-2">
              {categories.length > 0 && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                    Filter by Category (Optional)
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      if (cropId) {
                        const cr = crops.find((c) => c.id === cropId);
                        if (cr && cr.categoryId && cr.categoryId !== e.target.value) {
                          setCropId('');
                        }
                      }
                    }}
                    className="w-full px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn || c.nameSi}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Parent Crop *
                </label>
                <select
                  required
                  value={cropId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    setCropId(cId);
                    if (cId && !categoryId) {
                      const cr = crops.find((c) => c.id === cId);
                      if (cr?.categoryId) setCategoryId(cr.categoryId);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 cursor-pointer font-medium"
                >
                  <option value="">-- Select Crop --</option>
                  {filteredCrops.map((cr) => (
                    <option key={cr.id} value={cr.id}>
                      {cr.nameEn || cr.nameSi} {cr.nameSi && cr.nameEn ? `(${cr.nameSi})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Name English */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Name (English) *
            </label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder={config.placeholderEn}
              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 placeholder:text-gray-400"
            />
          </div>

          {/* Name Sinhala */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              නම (සිංහලෙන් / Sinhala)
            </label>
            <input
              type="text"
              value={nameSi}
              onChange={(e) => setNameSi(e.target.value)}
              placeholder={config.placeholderSi}
              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 placeholder:text-gray-400"
            />
          </div>

          {/* Active status */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="quickAddActive"
              checked={activeState}
              onChange={(e) => setActiveState(e.target.checked)}
              className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label
              htmlFor="quickAddActive"
              className="text-xs font-semibold text-gray-700 cursor-pointer"
            >
              Active
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 rounded-lg transition-all shadow-xs cursor-pointer"
            >
              {saving ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <CheckCircle2 size={13} />
              )}
              <span>{saving ? 'Saving...' : 'Save & Select'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
