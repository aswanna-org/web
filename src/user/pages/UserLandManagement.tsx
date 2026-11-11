import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ImageIcon,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../admin/components/ConfirmDialog';
import { AgriLandFormModal } from '../../admin/components/agriLand/AgriLandFormModal';
import { AgriLandViewModal } from '../../admin/components/agriLand/AgriLandViewModal';
import { AgriLandImagesModal } from '../../admin/components/agriLand/AgriLandImagesModal';
import type {
  AgriLand,
  AgriLandDealType,
  AgriLandLocation,
  AgriLandDeedType,
  AgriLandCategory,
  AgriLandTerrain,
  AgriLandElephantFence,
  AgriLandWildlifeThreat,
  AgriLandBoundaryFencing,
  AgriLandFarmBuilding,
  AgriLandIrrigationTech,
  AgriLandMachineryAccess,
  AgriLandCrop,
  AgriLandAccessRoad,
  AgriLandElectricity,
  AgriLandWaterSource
} from '../../admin/components/agriLand/types';

export const UserLandManagement = () => {
  const { user, token } = useAuth();
  const { confirm } = useConfirm();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [lands, setLands] = useState<AgriLand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'APPROVED' | 'PENDING' | 'REJECTED'>('all');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isImagesOpen, setIsImagesOpen] = useState(false);
  const [selectedLand, setSelectedLand] = useState<AgriLand | null>(null);

  // Lookups
  const [dealTypes, setDealTypes] = useState<AgriLandDealType[]>([]);
  const [locations, setLocations] = useState<AgriLandLocation[]>([]);
  const [deedTypes, setDeedTypes] = useState<AgriLandDeedType[]>([]);
  const [categories, setCategories] = useState<AgriLandCategory[]>([]);
  const [terrains, setTerrains] = useState<AgriLandTerrain[]>([]);
  const [elephantFences, setElephantFences] = useState<AgriLandElephantFence[]>([]);
  const [wildlifeThreats, setWildlifeThreats] = useState<AgriLandWildlifeThreat[]>([]);
  const [boundaryFencings, setBoundaryFencings] = useState<AgriLandBoundaryFencing[]>([]);
  const [farmBuildings, setFarmBuildings] = useState<AgriLandFarmBuilding[]>([]);
  const [irrigationTechs, setIrrigationTechs] = useState<AgriLandIrrigationTech[]>([]);
  const [machineryAccesses, setMachineryAccesses] = useState<AgriLandMachineryAccess[]>([]);
  const [crops, setCrops] = useState<AgriLandCrop[]>([]);
  const [accessRoads, setAccessRoads] = useState<AgriLandAccessRoad[]>([]);
  const [electricities, setElectricities] = useState<AgriLandElectricity[]>([]);
  const [waterSources, setWaterSources] = useState<AgriLandWaterSource[]>([]);

  const fetchLookups = useCallback(async () => {
    try {
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const [
        dtRes,
        locRes,
        deedRes,
        catRes,
        terrRes,
        efRes,
        wtRes,
        bfRes,
        fbRes,
        itRes,
        maRes,
        crRes,
        arRes,
        elRes,
        wsRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/agri-land-deal-types`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-locations`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-deed-types`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-categories`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-terrains`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-elephant-fences`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-wildlife-threats`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-boundary-fencings`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-farm-buildings`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-irrigation-techs`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-machinery-accesses`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-crops`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-access-roads`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-electricities`, { headers }),
        fetch(`${API_BASE_URL}/agri-land-water-sources`, { headers })
      ]);

      if (dtRes.ok) setDealTypes((await dtRes.json()).data || []);
      if (locRes.ok) setLocations((await locRes.json()).data || []);
      if (deedRes.ok) setDeedTypes((await deedRes.json()).data || []);
      if (catRes.ok) setCategories((await catRes.json()).data || []);
      if (terrRes.ok) setTerrains((await terrRes.json()).data || []);
      if (efRes.ok) setElephantFences((await efRes.json()).data || []);
      if (wtRes.ok) setWildlifeThreats((await wtRes.json()).data || []);
      if (bfRes.ok) setBoundaryFencings((await bfRes.json()).data || []);
      if (fbRes.ok) setFarmBuildings((await fbRes.json()).data || []);
      if (itRes.ok) setIrrigationTechs((await itRes.json()).data || []);
      if (maRes.ok) setMachineryAccesses((await maRes.json()).data || []);
      if (crRes.ok) setCrops((await crRes.json()).data || []);
      if (arRes.ok) setAccessRoads((await arRes.json()).data || []);
      if (elRes.ok) setElectricities((await elRes.json()).data || []);
      if (wsRes.ok) setWaterSources((await wsRes.json()).data || []);
    } catch (err) {
      console.error('Error fetching land lookups:', err);
    }
  }, [API_BASE_URL, token]);

  const fetchLands = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/agri-lands/my/listings`, {
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLands(json.data);
      } else {
        setLands([]);
      }
    } catch (err) {
      console.error('Error fetching user lands:', err);
      setLands([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, user?.id, token]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    fetchLands();
  }, [fetchLands]);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: 'Delete Agri Land',
      subtitle: 'මෙම කෘෂි ඉඩම ස්ථිරවම ඉවත් කිරීමට ඔබට අවශ්‍යද?',
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/agri-lands/${id}`, {
        method: 'DELETE',
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit
      });
      if (res.ok) {
        fetchLands();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete land.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error while deleting.');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/agri-lands/${id}/toggle-status`, {
        method: 'PATCH',
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit
      });
      if (res.ok) {
        fetchLands();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const filteredLands = lands.filter((l) => {
    if (statusFilter !== 'all' && l.approvalStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = (l.titleEn && l.titleEn.toLowerCase().includes(q)) || (l.titleSi && l.titleSi.includes(q));
      const matchDistrict = l.location?.districtEn?.toLowerCase().includes(q) || l.location?.districtSi?.includes(q);
      return matchTitle || matchDistrict;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">My Agri Lands</h2>
              <p className="text-xs text-gray-500">ඔබ විසින් ලියාපදිංචි කළ කෘෂිකාර්මික ඉඩම් ලැයිස්තුව</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedLand(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>Add New Agri Land</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, location..."
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
            All ({lands.length})
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
            Approved ({lands.filter((l) => l.approvalStatus === 'APPROVED').length})
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
            Pending ({lands.filter((l) => l.approvalStatus === 'PENDING').length})
          </button>
        </div>
      </div>

      {/* Mobile Card View (Completely responsive for mobile - Compact) */}
      <div className="block md:hidden space-y-2.5">
        {loading ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-xs text-gray-500">
            <RefreshCw size={16} className="animate-spin text-emerald-600 mx-auto mb-1.5" />
            <span>Loading lands...</span>
          </div>
        ) : filteredLands.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-xs text-gray-400">
            <MapPin size={32} className="mx-auto mb-1.5 text-gray-300" />
            <p className="font-semibold text-gray-700 text-xs">No agri lands found</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Tap "+ Add New Agri Land" to list your first land parcel.</p>
          </div>
        ) : (
          filteredLands.map((land) => {
            const cover = land.images?.find((img: any) => img.isPrimary) || land.images?.[0];

            return (
              <div key={land.id} className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-2.5 space-y-2">
                {/* Card Top: Thumbnail + Title + Approval Badge */}
                <div className="flex items-start gap-2 justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {cover ? (
                      <img
                        src={cover.imageUrl}
                        alt={land.titleEn}
                        className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                        <MapPin size={16} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">
                        {land.titleEn || land.titleSi || 'Untitled Agri Land'}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          {land.dealType?.nameEn || 'Deal'}
                        </span>
                        {land.landCategory?.nameEn && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-medium bg-gray-100 text-gray-600 truncate">
                            {land.landCategory.nameEn}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Approval Status Badge */}
                  <div className="shrink-0">
                    {land.approvalStatus === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={10} />
                        <span>Approved</span>
                      </span>
                    ) : land.approvalStatus === 'REJECTED' ? (
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

                {/* Details Row: Location, Size & Price, Active State */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-gray-100 text-[10px]">
                  <div className="flex items-center gap-1 text-gray-600 truncate">
                    <MapPin size={11} className="text-gray-400 shrink-0" />
                    <span className="truncate">
                      {land.location?.districtEn || 'District N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(land.id)}
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold transition cursor-pointer ${
                        land.activeState
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {land.activeState ? <Check size={9} /> : <X size={9} />}
                      <span>{land.activeState ? 'Active' : 'Hidden'}</span>
                    </button>
                  </div>
                  <div className="col-span-2 flex items-center justify-between text-gray-600">
                    <span className="font-medium text-gray-700">
                      {[
                        land.acres ? `${land.acres} ac` : null,
                        land.roods ? `${land.roods} rd` : null,
                        land.perches ? `${land.perches} p` : null
                      ]
                        .filter(Boolean)
                        .join(' ') || `${land.totalPerches || 0} perches`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLand(land);
                        setIsImagesOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
                    >
                      <ImageIcon size={11} />
                      <span>{land.images?.length || 0} Photos</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLand(land);
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
                      setSelectedLand(land);
                      setIsImagesOpen(true);
                    }}
                    className="py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-lg border border-emerald-200 flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Photos"
                  >
                    <ImageIcon size={12} />
                    <span>Photos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLand(land);
                      setIsFormOpen(true);
                    }}
                    className="flex-1 py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold rounded-lg border border-blue-200/60 flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Edit size={12} className="text-blue-600" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(land.id, land.titleEn || land.titleSi || 'Agri Land')}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200/60 transition cursor-pointer"
                    title="Delete Land"
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
                  Land Details
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                  Deal & Category
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                  Location
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                  Size & Price
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-center">
                  Photos
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
                      <span>Loading lands...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLands.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-xs text-gray-400">
                    <MapPin size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-600">No agri lands found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Click "Add New Agri Land" to list your first land parcel.</p>
                  </td>
                </tr>
              ) : (
                filteredLands.map((land) => {
                  const cover = land.images?.find((img: any) => img.isPrimary) || land.images?.[0];

                  return (
                    <tr key={land.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* 1. Title & Photo */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-2 max-w-xs">
                          {cover ? (
                            <img
                              src={cover.imageUrl}
                              alt={land.titleEn}
                              className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                              <MapPin size={13} />
                            </div>
                          )}
                          <div className="overflow-hidden min-w-0">
                            <span className="font-semibold text-gray-900 truncate text-xs block" title={land.titleEn}>
                              {land.titleEn || land.titleSi || 'Untitled'}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate block">
                              {land.titleSi || ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Deal & Category */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 text-[11px]">
                            {land.dealType?.nameEn || '—'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {land.landCategory?.nameEn || '—'}
                          </span>
                        </div>
                      </td>

                      {/* 3. Location */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 text-[11px]">
                            {land.location?.districtEn || '—'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {land.location?.provinceEn || ''}
                          </span>
                        </div>
                      </td>

                      {/* 4. Size & Price */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700 text-[11px]">
                            {land.acres ? `${land.acres}A ` : ''}
                            {land.perches ? `${land.perches}P` : ''}
                            {!land.acres && !land.perches && (land.totalPerches ? `${land.totalPerches}P` : '—')}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            {land.priceEn || land.priceSi || 'Contact for price'}
                          </span>
                        </div>
                      </td>

                      {/* 5. Photos count */}
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLand(land);
                            setIsImagesOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                        >
                          <ImageIcon size={11} className="text-gray-500" />
                          <span>{land.images?.length || 0}</span>
                        </button>
                      </td>

                      {/* 6. Approval Status */}
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        {land.approvalStatus === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 size={11} />
                            <span>Approved</span>
                          </span>
                        ) : land.approvalStatus === 'REJECTED' ? (
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

                      {/* 7. Active state */}
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(land.id)}
                          title={land.activeState ? 'Click to deactivate' : 'Click to activate'}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                            land.activeState
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          {land.activeState ? <Check size={10} /> : <X size={10} />}
                          <span>{land.activeState ? 'Active' : 'Hidden'}</span>
                        </button>
                      </td>

                      {/* 8. Actions */}
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLand(land);
                              setIsViewOpen(true);
                            }}
                            title="View Land Details"
                            className="p-1 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLand(land);
                              setIsFormOpen(true);
                            }}
                            title="Edit Land"
                            className="p-1 hover:bg-blue-50 text-gray-500 hover:text-blue-700 rounded transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(land.id, land.titleEn || land.titleSi || 'Agri Land')
                            }
                            title="Delete Land"
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
        <AgriLandFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchLands();
            fetchLookups();
          }}
          onRefreshLookups={fetchLookups}
          landToEdit={selectedLand}
          dealTypes={dealTypes}
          locations={locations}
          deedTypes={deedTypes}
          categories={categories}
          terrains={terrains}
          elephantFences={elephantFences}
          wildlifeThreats={wildlifeThreats}
          boundaryFencings={boundaryFencings}
          farmBuildings={farmBuildings}
          irrigationTechs={irrigationTechs}
          machineryAccesses={machineryAccesses}
          crops={crops}
          accessRoads={accessRoads}
          electricities={electricities}
          waterSources={waterSources}
          apiBaseUrl={API_BASE_URL}
          token={token}
        />
      )}

      {isViewOpen && (
        <AgriLandViewModal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          land={selectedLand}
        />
      )}

      {isImagesOpen && selectedLand && (
        <AgriLandImagesModal
          isOpen={isImagesOpen}
          onClose={() => setIsImagesOpen(false)}
          land={selectedLand}
          apiBaseUrl={API_BASE_URL}
          token={token}
          onSuccess={() => {
            setIsImagesOpen(false);
            fetchLands();
          }}
        />
      )}
    </div>
  );
};

export default UserLandManagement;

