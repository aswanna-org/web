import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin,
  Eye,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Layers,
  Compass,
  Check,
  X,
  Clock,
  User
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';
import { useConfirm } from '../components/ConfirmDialog';

// Import separate modular components & modals
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
} from '../components/agriLand/types';
import { AgriLandFormModal } from '../components/agriLand/AgriLandFormModal';
import { AgriLandViewModal } from '../components/agriLand/AgriLandViewModal';
import { AgriLandImagesModal } from '../components/agriLand/AgriLandImagesModal';
import { AgriLandMasterManager } from '../components/agriLand/AgriLandMasterManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AgriLandManagement() {
  const { confirm } = useConfirm();

  // Active top-level tab: 'lands' (Main listing) or 'master' (Associate data)
  const [activeTab, setActiveTab] = useState<'lands' | 'master'>('lands');

  // Listings state
  const [lands, setLands] = useState<AgriLand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLands, setTotalLands] = useState(0);

  // Filters state
  const [search, setSearch] = useState('');
  const [filterDealType, setFilterDealType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCultivated, setFilterCultivated] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [filterApprovalStatus, setFilterApprovalStatus] = useState<string>('all');
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Master lookups for form dropdowns & filters
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

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [landToEdit, setLandToEdit] = useState<AgriLand | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingLand, setViewingLand] = useState<AgriLand | null>(null);

  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [landForImages, setLandForImages] = useState<AgriLand | null>(null);

  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Fetch all master lookups
  const fetchAllLookups = async () => {
    try {
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
      console.error('Error fetching master lookups:', err);
    }
  };

  // Fetch pending lands count for KPI card
  const fetchPendingCount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/agri-lands?approvalStatus=PENDING&activeOnly=false&limit=1`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.meta?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching pending lands count:', err);
    }
  };

  // Fetch AgriLands with filters & pagination
  const fetchLands = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12'
      });

      if (search.trim()) params.append('search', search.trim());
      if (filterDealType) params.append('dealTypeId', filterDealType);
      if (filterLocation) params.append('locationId', filterLocation);
      if (filterCategory) params.append('landCategoryId', filterCategory);
      if (filterCultivated) params.append('isCultivated', filterCultivated);
      if (filterActive !== '') {
        params.append('activeOnly', filterActive === 'true' ? 'true' : 'false');
      } else {
        // Admin views all (active and inactive) by default
        params.append('activeOnly', 'false');
      }
      if (filterApprovalStatus) {
        params.append('approvalStatus', filterApprovalStatus);
      }

      const res = await fetch(`${API_BASE_URL}/agri-lands?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLands(data.data || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setTotalLands(data.meta.total || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching agri lands:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLookups();
    fetchPendingCount();
  }, []);

  useEffect(() => {
    fetchLands(currentPage);
  }, [currentPage, search, filterDealType, filterLocation, filterCategory, filterCultivated, filterActive, filterApprovalStatus]);

  const handleResetFilters = () => {
    setSearch('');
    setFilterDealType('');
    setFilterLocation('');
    setFilterCategory('');
    setFilterCultivated('');
    setFilterActive('');
    setFilterApprovalStatus('all');
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setLandToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (land: AgriLand) => {
    setLandToEdit(land);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (land: AgriLand) => {
    setViewingLand(land);
    setIsViewModalOpen(true);
  };

  const handleOpenImages = (land: AgriLand) => {
    setLandForImages(land);
    setIsImagesModalOpen(true);
  };

  const handleToggleStatus = async (land: AgriLand) => {
    try {
      const res = await fetch(`${API_BASE_URL}/agri-lands/${land.id}/toggle-status`, {
        method: 'PATCH',
        headers
      });
      if (res.ok) {
        fetchLands(currentPage);
      }
    } catch (err) {
      console.error('Failed to toggle land status:', err);
    }
  };

  const handleUpdateApprovalStatus = async (
    land: AgriLand,
    newStatus: 'APPROVED' | 'REJECTED' | 'PENDING',
    reason?: string
  ) => {
    if (newStatus === 'REJECTED') {
      const isConfirmed = await confirm({
        title: 'Reject Agri Land Listing',
        subtitle: 'ඉඩම් ලැයිස්තුගත කිරීම ප්‍රතික්ෂේප කිරීම',
        message: `Are you sure you want to reject "${land.titleEn}"? It will not be shown to visitors on the public website.`,
        confirmText: 'Reject Listing',
        type: 'danger'
      });
      if (!isConfirmed) return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/agri-lands/${land.id}/approval-status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          approvalStatus: newStatus,
          rejectionReason: reason || null
        })
      });
      if (res.ok) {
        fetchLands(currentPage);
        fetchPendingCount();
        if (viewingLand?.id === land.id) {
          setViewingLand((prev) => (prev ? { ...prev, approvalStatus: newStatus, rejectionReason: reason || null } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update land approval status:', err);
    }
  };

  const handleDelete = async (land: AgriLand) => {
    const isConfirmed = await confirm({
      title: 'Delete Agri Land Listing',
      subtitle: 'කෘෂිකාර්මික ඉඩම ස්ථිරවම ඉවත් කිරීම',
      message: `Are you sure you want to delete "${land.titleEn}"? All associated photos and records will be deleted permanently.`,
      confirmText: 'Delete Land Listing'
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/agri-lands/${land.id}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        fetchLands(currentPage);
      }
    } catch (err) {
      console.error('Failed to delete land listing:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Agri Land Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-sinhala">
            කෘෂිකාර්මික ඉඩම් ලැයිස්තුගත කිරීම් සහ ආශ්‍රිත දත්ත කළමනාකරණය
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-xs hover:shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Agri Land</span>
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Lands</span>
            <h4 className="text-lg font-bold text-slate-800">{totalLands}</h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFilterApprovalStatus(filterApprovalStatus === 'PENDING' ? 'all' : 'PENDING');
            setCurrentPage(1);
          }}
          className={`text-left p-4 rounded-2xl border transition shadow-xs flex items-center justify-between cursor-pointer ${
            filterApprovalStatus === 'PENDING'
              ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-400/30'
              : pendingCount > 0
              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/20 hover:bg-amber-100/60'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
          title="Click to filter Pending listings"
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${pendingCount > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
              <div className="flex items-center gap-1.5">
                <h4 className="text-lg font-bold text-slate-800">{pendingCount}</h4>
                {pendingCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900">
                    Needs Review
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Deal Types</span>
            <h4 className="text-lg font-bold text-slate-800">{dealTypes.length}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Locations</span>
            <h4 className="text-lg font-bold text-slate-800">{locations.length}</h4>
          </div>
        </div>
      </div>

      {/* ── Main Tab Navigation ── */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-white px-5 pt-3 rounded-2xl shadow-xs border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('lands')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'lands'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Agri Lands Listings</span>
          <span className="text-xs text-slate-400 font-normal font-sinhala">(කෘෂිකාර්මික ඉඩම් ලැයිස්තුව)</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${activeTab === 'lands' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
            {totalLands}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('master')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'master'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Associate Master Tables</span>
          <span className="text-xs text-slate-400 font-normal font-sinhala">(ආශ්‍රිත ප්‍රධාන වගු 15)</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${activeTab === 'master' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
            15 Tables
          </span>
        </button>
      </div>

      {/* TAB 1: MAIN LANDS LISTINGS */}
      {activeTab === 'lands' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search lands, owners, districts..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Deal Type Filter */}
              <select
                value={filterDealType}
                onChange={(e) => {
                  setFilterDealType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              >
                <option value="">All Deal Types (සියලු ගනුදෙනු)</option>
                {dealTypes.map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dt.nameEn} ({dt.nameSi})
                  </option>
                ))}
              </select>

              {/* Location Filter */}
              <select
                value={filterLocation}
                onChange={(e) => {
                  setFilterLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              >
                <option value="">All Locations (සියලු දිස්ත්‍රික්ක)</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.districtEn} ({loc.districtSi}) - {loc.provinceEn}
                  </option>
                ))}
              </select>

              {/* Land Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              >
                <option value="">All Categories (සියලු ඉඩම් වර්ග)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameEn} ({cat.nameSi})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                {/* Approval Status Filter */}
                <select
                  value={filterApprovalStatus}
                  onChange={(e) => {
                    setFilterApprovalStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 border rounded-xl text-xs font-semibold transition ${
                    filterApprovalStatus === 'PENDING'
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : filterApprovalStatus === 'APPROVED'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : filterApprovalStatus === 'REJECTED'
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="all">Approval: All (සියල්ල)</option>
                  <option value="PENDING">Pending Review (අනුමැතිය අපේක්ෂිත)</option>
                  <option value="APPROVED">Approved (අනුමත කළ)</option>
                  <option value="REJECTED">Rejected (ප්‍රතික්ෂේපිත)</option>
                </select>

                {/* Cultivation Filter */}
                <select
                  value={filterCultivated}
                  onChange={(e) => {
                    setFilterCultivated(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="">Cultivation: All</option>
                  <option value="true">Cultivated Only (වගා කළ)</option>
                  <option value="false">Uncultivated (වගා නොකළ)</option>
                </select>

                {/* Active Status Filter */}
                <select
                  value={filterActive}
                  onChange={(e) => {
                    setFilterActive(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="">Status: All</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>

                {(search || filterDealType || filterLocation || filterCategory || filterCultivated || filterActive || filterApprovalStatus !== 'all') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <span className="text-xs text-slate-400 font-medium">
                Showing {lands.length} of {totalLands} listings
              </span>
            </div>
          </div>

          {/* Listings Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="py-20 flex justify-center">
                  <AgroLoader />
                </div>
              ) : lands.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <Layers className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-base font-semibold text-slate-700">No Agri Lands Found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or click "Add New Agri Land"</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <th className="py-3.5 px-4 font-bold">Land Details</th>
                      <th className="py-3.5 px-4 font-bold">Deal & Category</th>
                      <th className="py-3.5 px-4 font-bold">Location</th>
                      <th className="py-3.5 px-4 font-bold">Size & Price</th>
                      <th className="py-3.5 px-4 font-bold text-center">Photos</th>
                      <th className="py-3.5 px-4 font-bold text-center">Approval Status</th>
                      <th className="py-3.5 px-4 font-bold text-center">Active</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lands.map((land) => {
                      const cover = land.images?.find((img) => img.isPrimary) || land.images?.[0];
                      return (
                        <tr key={land.id} className="hover:bg-slate-50/80 transition">
                          {/* Land details with photo */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                                {cover ? (
                                  <img
                                    src={cover.imageUrl}
                                    alt={land.titleEn}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <ImageIcon className="w-6 h-6" />
                                  </div>
                                )}
                              </div>
                              <div className="max-w-xs">
                                <h4 className="font-bold text-slate-800 text-sm line-clamp-1">
                                  {land.titleEn}
                                </h4>
                                {land.titleSi && (
                                  <p className="text-[11px] text-slate-500 line-clamp-1 font-sinhala">
                                    {land.titleSi}
                                  </p>
                                )}
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {land.slug}
                                  </span>
                                  {land.user ? (
                                    <span
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60"
                                      title={`Submitted by user: ${land.user.name || land.user.email}`}
                                    >
                                      <User className="w-2.5 h-2.5" />
                                      <span>User: {land.user.name || land.user.email?.split('@')[0]}</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500">
                                      Admin
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Deal & Category */}
                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {land.dealType?.nameEn || 'Deal'}
                            </span>
                            <span className="block text-slate-600 text-[11px] font-medium mt-1">
                              {land.landCategory?.nameEn || 'Uncategorized'}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 text-xs block">
                              {land.location?.districtEn || 'Unspecified'}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {land.location?.provinceEn} Province
                            </span>
                          </td>

                          {/* Size & Price */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 block">
                              {land.acres ? `${land.acres} A ` : ''}
                              {land.roods ? `${land.roods} R ` : ''}
                              {land.perches ? `${land.perches} P` : ''}
                              {!land.acres && !land.roods && !land.perches && (land.totalPerches ? `${land.totalPerches} Perches` : 'N/A')}
                            </span>
                            <span className="text-emerald-700 font-semibold text-[11px] block mt-0.5">
                              {land.priceEn || land.priceSi || 'Price on request'}
                            </span>
                          </td>

                          {/* Photos count & manage */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenImages(land)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                              <span>{land.images?.length || 0}</span>
                            </button>
                          </td>

                          {/* Approval Status */}
                          <td className="py-3 px-4 text-center">
                            {land.approvalStatus === 'PENDING' ? (
                              <div className="inline-flex flex-col items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Pending</span>
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateApprovalStatus(land, 'APPROVED')}
                                    title="Approve for public view"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition shadow-2xs cursor-pointer"
                                  >
                                    <Check className="w-2.5 h-2.5" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateApprovalStatus(land, 'REJECTED')}
                                    title="Reject listing"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-md transition shadow-2xs cursor-pointer"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              </div>
                            ) : land.approvalStatus === 'REJECTED' ? (
                              <div className="inline-flex flex-col items-center gap-0.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>Rejected</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateApprovalStatus(land, 'APPROVED')}
                                  className="text-[10px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                                >
                                  Re-Approve
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center gap-0.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Approved</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateApprovalStatus(land, 'REJECTED')}
                                  className="text-[10px] text-slate-400 hover:text-rose-600 hover:underline cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Active Status toggle */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(land)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                                land.activeState
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {land.activeState ? (
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

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenView(land)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenImages(land)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                title="Manage Photos"
                              >
                                <ImageIcon className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(land)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(land)}
                                className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MASTER / ASSOCIATE DATA MANAGER */}
      {activeTab === 'master' && (
        <div className="animate-fadeIn">
          <AgriLandMasterManager
            apiBaseUrl={API_BASE_URL}
            token={token}
            onRefreshParent={fetchAllLookups}
          />
        </div>
      )}

      {/* Separate Modal: Create & Edit AgriLand */}
      <AgriLandFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => {
          fetchLands(currentPage);
          fetchAllLookups();
        }}
        onRefreshLookups={fetchAllLookups}
        landToEdit={landToEdit}
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

      {/* Separate Modal: View Details */}
      <AgriLandViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        land={viewingLand}
        onUpdateApprovalStatus={handleUpdateApprovalStatus}
      />

      {/* Separate Modal: Images Management */}
      <AgriLandImagesModal
        isOpen={isImagesModalOpen}
        onClose={() => setIsImagesModalOpen(false)}
        land={landForImages}
        onSuccess={() => fetchLands(currentPage)}
        apiBaseUrl={API_BASE_URL}
        token={token}
      />
    </div>
  );
}
