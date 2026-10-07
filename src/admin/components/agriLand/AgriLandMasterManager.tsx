import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Layers,
  MapPin,
  Tag,
  Building,
  Zap,
  Droplets,
  Sprout,
  Shield,
  Compass,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MASTER_TABLES_CONFIG } from './types';
import type { MasterTableKey } from './types';
import { AgriLandMasterModal } from './AgriLandMasterModal';
import { AgriLandLocationModal } from './AgriLandLocationModal';
import { useConfirm } from '../ConfirmDialog';
import AgroLoader from '../../../components/common/AgroLoader';

interface AgriLandMasterManagerProps {
  apiBaseUrl: string;
  token: string | null;
  onRefreshParent: () => void;
}

export const AgriLandMasterManager: React.FC<AgriLandMasterManagerProps> = ({
  apiBaseUrl,
  token,
  onRefreshParent
}) => {
  const { confirm } = useConfirm();
  const [selectedKey, setSelectedKey] = useState<MasterTableKey>('dealTypes');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modals state
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any | null>(null);

  const tabsRef = useRef<HTMLDivElement | null>(null);
  const tabButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSelectTab = (key: MasterTableKey) => {
    setSelectedKey(key);
    const btn = tabButtonRefs.current[key];
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const currentMeta = MASTER_TABLES_CONFIG.find((m) => m.key === selectedKey) || MASTER_TABLES_CONFIG[0];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}${currentMeta.endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        setItems(resData.data || []);
      }
    } catch (err) {
      console.error(`Failed to fetch ${currentMeta.titleEn}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    setSearch('');
  }, [selectedKey]);

  const handleOpenCreate = () => {
    setItemToEdit(null);
    if (selectedKey === 'locations') {
      setIsLocationModalOpen(true);
    } else {
      setIsMasterModalOpen(true);
    }
  };

  const handleOpenEdit = (item: any) => {
    setItemToEdit(item);
    if (selectedKey === 'locations') {
      setIsLocationModalOpen(true);
    } else {
      setIsMasterModalOpen(true);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}${currentMeta.endpoint}/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchItems();
        onRefreshParent();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (item: any) => {
    const isConfirmed = await confirm({
      title: `Delete ${currentMeta.singularEn}`,
      subtitle: `${currentMeta.singularSi} ඉවත් කිරීම`,
      message: `Are you sure you want to delete "${item.nameEn || item.districtEn}"? This action cannot be undone.`,
      confirmText: 'Delete Record'
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`${apiBaseUrl}${currentMeta.endpoint}/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete record');
      } else {
        fetchItems();
        onRefreshParent();
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting record');
    }
  };

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (selectedKey === 'locations') {
      return (
        (item.districtEn && item.districtEn.toLowerCase().includes(q)) ||
        (item.districtSi && item.districtSi.includes(q)) ||
        (item.provinceEn && item.provinceEn.toLowerCase().includes(q)) ||
        (item.divisionalSecretariatEn && item.divisionalSecretariatEn.toLowerCase().includes(q))
      );
    }
    return (
      (item.nameEn && item.nameEn.toLowerCase().includes(q)) ||
      (item.nameSi && item.nameSi.includes(q)) ||
      (item.slug && item.slug.toLowerCase().includes(q))
    );
  });

  const getTableIcon = (key: MasterTableKey) => {
    switch (key) {
      case 'dealTypes': return Tag;
      case 'locations': return MapPin;
      case 'deedTypes': return FileText;
      case 'categories': return Layers;
      case 'terrains': return Compass;
      case 'crops': return Sprout;
      case 'elephantFences': return Shield;
      case 'wildlifeThreats': return Shield;
      case 'boundaryFencings': return Shield;
      case 'farmBuildings': return Building;
      case 'irrigationTechs': return Droplets;
      case 'machineryAccesses': return Building;
      case 'accessRoads': return MapPin;
      case 'electricities': return Zap;
      case 'waterSources': return Droplets;
      default: return Tag;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Table Card with Integrated Horizontal Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Horizontal Scrollable Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-2 pt-2 sm:px-3">
          <div className="flex items-center gap-1">
            {/* Scroll Left Button */}
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 rounded-xl transition shrink-0"
              title="Scroll tabs left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Tabs Container */}
            <div
              ref={tabsRef}
              className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1 px-1 flex-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {MASTER_TABLES_CONFIG.map((cfg) => {
                const Icon = getTableIcon(cfg.key);
                const isSelected = selectedKey === cfg.key;
                return (
                  <button
                    key={cfg.key}
                    ref={(el) => { tabButtonRefs.current[cfg.key] = el; }}
                    type="button"
                    onClick={() => handleSelectTab(cfg.key)}
                    className={`flex items-center gap-2 pb-3 pt-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap rounded-t-xl ${
                      isSelected
                        ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{cfg.titleEn}</span>
                    <span className={`text-[11px] font-normal ${isSelected ? 'text-emerald-600/80 font-medium' : 'text-slate-400'}`}>
                      ({cfg.titleSi})
                    </span>
                    {isSelected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 ml-1">
                        {items.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 rounded-xl transition shrink-0"
              title="Scroll tabs right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Table Action Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>{currentMeta.titleEn}</span>
              <span className="text-xs font-normal text-slate-500">({currentMeta.titleSi})</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {items.length} records
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage configuration options for {currentMeta.singularEn.toLowerCase()} in land listings
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${currentMeta.titleEn}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add {currentMeta.singularEn}</span>
            </button>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 flex justify-center">
              <AgroLoader />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm">No {currentMeta.titleEn.toLowerCase()} found.</p>
              {search && <p className="text-xs text-slate-400 mt-1">Try refining your search keyword</p>}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4 font-bold">#</th>
                  {selectedKey === 'locations' ? (
                    <>
                      <th className="py-3 px-4 font-bold">District / දිස්ත්‍රික්කය</th>
                      <th className="py-3 px-4 font-bold">Province / පළාත</th>
                      <th className="py-3 px-4 font-bold">DS & GN Divisions</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4 font-bold">Name (English)</th>
                      <th className="py-3 px-4 font-bold">Name (Sinhala)</th>
                      <th className="py-3 px-4 font-bold">Slug</th>
                    </>
                  )}
                  <th className="py-3 px-4 font-bold text-center">Linked Lands</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-400 font-medium">{idx + 1}</td>

                    {selectedKey === 'locations' ? (
                      <>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {item.districtEn}
                          {item.districtSi && (
                            <span className="block text-[11px] text-slate-500 font-normal">
                              {item.districtSi}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {item.provinceEn} Province
                          {item.provinceSi && (
                            <span className="block text-[11px] text-slate-500">{item.provinceSi}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.divisionalSecretariatEn && `DS: ${item.divisionalSecretariatEn} `}
                          {item.gramaNiladhariDivisionEn && `| GN: ${item.gramaNiladhariDivisionEn}`}
                          {!item.divisionalSecretariatEn && !item.gramaNiladhariDivisionEn && '—'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 font-semibold text-slate-800">{item.nameEn}</td>
                        <td className="py-3 px-4 text-slate-700 font-sinhala">{item.nameSi}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">{item.slug}</td>
                      </>
                    )}

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item._count?.agriLands || 0}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                          item.activeState
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {item.activeState ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Render Master Modal (Generic for 14 lookup tables) */}
      <AgriLandMasterModal
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
        onSuccess={() => {
          fetchItems();
          onRefreshParent();
        }}
        meta={currentMeta}
        itemToEdit={itemToEdit}
        apiBaseUrl={apiBaseUrl}
        token={token}
      />

      {/* Render Location Modal */}
      <AgriLandLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSuccess={() => {
          fetchItems();
          onRefreshParent();
        }}
        locationToEdit={itemToEdit}
        apiBaseUrl={apiBaseUrl}
        token={token}
      />
    </div>
  );
};
