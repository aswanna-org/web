import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Store,
  Plus,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Layers,
  MapPin,
  Phone,
  AlertCircle,
  X,
  RotateCcw,
  Tag
} from 'lucide-react';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';
import { getDistricts, type District } from 'sl-gnd-dsd-districts';
import MarketplaceCategoryModal from '../components/marketplace/MarketplaceCategoryModal';
import MarketplaceFormModal from '../components/marketplace/MarketplaceFormModal';
import MarketplaceViewModal from '../components/marketplace/MarketplaceViewModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface MarketplaceImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  slug: string;
  activeState: boolean;
}

interface MarketplaceCategory {
  id: string;
  nameEn: string;
  nameSi: string;
  slug: string;
  imageUrl?: string | null;
  activeState: boolean;
  _count?: { marketplaces: number };
}

interface Marketplace {
  id: string;
  slug: string;
  titleEn: string;
  titleSi: string;
  districtEn: string;
  districtSi: string;
  locationEn?: string | null;
  locationSi?: string | null;
  priceEn?: string | null;
  priceSi?: string | null;
  phoneNumber?: string | null;
  ownerNameEn?: string | null;
  ownerNameSi?: string | null;
  descriptionEn?: string | null;
  descriptionSi?: string | null;
  activeState: boolean;
  isPublished: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt?: string;
  category?: {
    id: string;
    nameEn: string;
    nameSi: string;
    slug: string;
    imageUrl?: string | null;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  } | null;
  images?: MarketplaceImage[];
}

export default function MarketplaceController() {
  const { confirm } = useConfirm();

  // Active Tab: 'listings' | 'pending' | 'categories'
  const [activeTab, setActiveTab] = useState<'listings' | 'pending' | 'categories'>('listings');

  // Listings State
  const [listings, setListings] = useState<Marketplace[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [totalListings, setTotalListings] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // Categories State
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categorySearch, setCategorySearch] = useState('');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    categoriesCount: 0
  });

  // Filters for listings
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Feedback Messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Marketplace | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<MarketplaceCategory | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Marketplace | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const districts: District[] = useMemo(() => {
    try {
      return getDistricts();
    } catch {
      return [];
    }
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {})
    };
  };

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/categories`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        const data: MarketplaceCategory[] = json.data || [];
        setCategories(data);
        setStats((prev) => ({ ...prev, categoriesCount: data.length }));
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Fetch Listings with pagination & filters
  const fetchListings = useCallback(async () => {
    setIsLoadingListings(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', String(itemsPerPage));
      params.append('activeOnly', 'false');

      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim());
      }
      if (selectedCategory !== 'ALL') {
        params.append('categoryId', selectedCategory);
      }
      if (selectedDistrict !== 'ALL') {
        params.append('districtEn', selectedDistrict);
      }

      if (activeTab === 'pending') {
        params.append('isPublished', 'false');
      }

      const res = await fetch(`${API_BASE_URL}/marketplace?${params.toString()}`, {
        headers: getAuthHeaders()
      });

      if (res.ok) {
        const json = await res.json();
        let items: Marketplace[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.items)
          ? json.items
          : Array.isArray(json)
          ? json
          : [];

        if (statusFilter === 'ACTIVE') {
          items = items.filter((i) => i.activeState);
        } else if (statusFilter === 'INACTIVE') {
          items = items.filter((i) => !i.activeState);
        }

        setListings(items);
        const total = json.meta?.total ?? json.pagination?.total ?? items.length;
        const totalP = json.meta?.totalPages ?? json.pagination?.totalPages ?? 1;
        setTotalListings(total);
        setTotalPages(totalP);
      } else {
        showError('Failed to load listings from server');
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      showError('Could not reach server to load listings.');
    } finally {
      setIsLoadingListings(false);
    }
  }, [currentPage, debouncedSearch, selectedCategory, selectedDistrict, activeTab, statusFilter]);

  // Overall Stats
  const fetchOverallStats = useCallback(async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/marketplace?limit=1&activeOnly=false`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/marketplace?limit=1&activeOnly=false&isPublished=false`, { headers: getAuthHeaders() })
      ]);

      const allData = allRes.ok ? await allRes.json() : null;
      const pendingData = pendingRes.ok ? await pendingRes.json() : null;

      const total = allData?.meta?.total ?? allData?.pagination?.total ?? (allData?.data?.length || allData?.items?.length || 0);
      const pending = pendingData?.meta?.total ?? pendingData?.pagination?.total ?? (pendingData?.data?.length || pendingData?.items?.length || 0);
      const published = Math.max(0, total - pending);

      setStats((prev) => ({
        ...prev,
        total,
        published,
        pending
      }));
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchOverallStats();
  }, [fetchCategories, fetchOverallStats]);

  useEffect(() => {
    if (activeTab !== 'categories') {
      fetchListings();
    }
  }, [fetchListings, activeTab]);

  // Toggle Publish / Approval Status
  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/${id}/publish`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isPublished: !currentPublished })
      });

      if (res.ok) {
        setListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isPublished: !currentPublished } : item))
        );
        if (viewingItem && viewingItem.id === id) {
          setViewingItem({ ...viewingItem, isPublished: !currentPublished });
        }
        showSuccess(
          !currentPublished
            ? 'Listing approved & published successfully!'
            : 'Listing unpublished successfully.'
        );
        fetchOverallStats();
      } else {
        const data = await res.json();
        showError(data.error || 'Failed to update approval status');
      }
    } catch (err) {
      console.error('Error toggling publish status:', err);
      showError('Network error while updating approval status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Active State
  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        setListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, activeState: !currentActive } : item))
        );
        showSuccess(`Listing status updated to ${!currentActive ? 'Active' : 'Inactive'}.`);
      } else {
        const data = await res.json();
        showError(data.error || 'Failed to update active state');
      }
    } catch (err) {
      console.error('Error toggling active status:', err);
      showError('Network error while updating active state');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Listing
  const handleDeleteListing = async (item: Marketplace) => {
    const isConfirmed = await confirm({
      title: 'Delete Marketplace Listing',
      subtitle: 'මෙම වෙළඳපල අයිතමය ස්ථිරවම ඉවත් කරන්නද?',
      message: `Are you sure you want to delete "${item.titleEn}"? This action cannot be undone.`,
      itemName: item.titleEn,
      type: 'danger'
    });

    if (!isConfirmed) return;

    setActionLoadingId(item.id);
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/${item.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        setListings((prev) => prev.filter((i) => i.id !== item.id));
        showSuccess('Listing deleted successfully.');
        fetchOverallStats();
        if (viewingItem?.id === item.id) {
          setIsViewModalOpen(false);
          setViewingItem(null);
        }
      } else {
        const data = await res.json();
        showError(data.error || 'Failed to delete listing');
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
      showError('Network error while deleting listing');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Category Active State
  const handleToggleCategoryActive = async (cat: MarketplaceCategory) => {
    setActionLoadingId(cat.id);
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/categories/${cat.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, activeState: !cat.activeState } : c))
        );
        showSuccess(`Category status updated to ${!cat.activeState ? 'Active' : 'Inactive'}.`);
      } else {
        const data = await res.json();
        showError(data.error || 'Failed to update category status');
      }
    } catch (err) {
      console.error('Error toggling category status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat: MarketplaceCategory) => {
    const isConfirmed = await confirm({
      title: 'Delete Category',
      subtitle: 'මෙම ප්‍රවර්ගය ස්ථිරවම ඉවත් කරන්නද?',
      message: `Are you sure you want to delete category "${cat.nameEn}"? Listings in this category must be reassigned or deleted first.`,
      itemName: cat.nameEn,
      type: 'danger'
    });

    if (!isConfirmed) return;

    setActionLoadingId(cat.id);
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/categories/${cat.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        showSuccess('Category deleted successfully.');
        fetchOverallStats();
      } else {
        const data = await res.json();
        showError(data.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (!categorySearch.trim()) return true;
    const q = categorySearch.toLowerCase();
    return cat.nameEn.toLowerCase().includes(q) || cat.nameSi.includes(q) || cat.slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Marketplace Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage agricultural marketplace listings, seller approvals, and categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'categories' ? (
            <button
              onClick={() => {
                setCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              <Plus size={18} /> Add Category
            </button>
          ) : (
            <button
              onClick={() => {
                setItemToEdit(null);
                setIsFormModalOpen(true);
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              <Plus size={18} /> Add Listing
            </button>
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm font-medium">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── KPI Widgets ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
            <Store size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Listings</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Published</p>
            <p className="text-xl font-bold text-emerald-700">{stats.published}</p>
          </div>
        </div>

        <div
          onClick={() => {
            setActiveTab('pending');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border shadow-xs flex items-center gap-3.5 cursor-pointer transition ${
            stats.pending > 0
              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/40'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock size={20} className={stats.pending > 0 ? 'animate-pulse' : ''} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pending Approval</p>
            <p className="text-xl font-bold text-amber-800">{stats.pending}</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('categories')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5 cursor-pointer hover:border-emerald-500 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Categories</p>
            <p className="text-xl font-bold text-gray-900">{stats.categoriesCount}</p>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center justify-between border-b border-gray-200 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('listings');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'listings'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Store size={17} />
            <span>All Listings</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'listings' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pending');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'pending'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Clock size={17} />
            <span>Pending Approval</span>
            {stats.pending > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                {stats.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'categories'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Layers size={17} />
            <span>Categories</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'categories' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {categories.length}
            </span>
          </button>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'categories') fetchCategories();
            else fetchListings();
            fetchOverallStats();
          }}
          title="Refresh Data"
          className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg transition cursor-pointer mb-2"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* ==================================================================== */}
      {/* ── VIEW 1: LISTINGS / PENDING APPROVAL TAB ── */}
      {/* ==================================================================== */}
      {activeTab !== 'categories' && (
        <div className="space-y-4">
          {/* ── Search & Filters Bar ── */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="text"
                placeholder="Search listings by title, seller, location or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-emerald-600 focus:border-emerald-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-emerald-600 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn} ({c.nameSi})
                </option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-emerald-600 cursor-pointer"
            >
              <option value="ALL">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.nameEn}>
                  {d.nameEn} ({d.nameSi})
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-emerald-600 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            {(searchQuery || selectedCategory !== 'ALL' || selectedDistrict !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSelectedDistrict('ALL');
                  setStatusFilter('ALL');
                  setCurrentPage(1);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* ── Listings Table ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {isLoadingListings ? (
              <div className="p-12 flex justify-center">
                <AgroLoader message="Loading marketplace listings..." subMessage="කරුණාකර රැඳී සිටින්න" />
              </div>
            ) : listings.length === 0 ? (
              <div className="p-16 text-center">
                <Store size={44} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-base font-semibold text-gray-800">
                  {activeTab === 'pending' ? 'No Pending Approvals' : 'No Marketplace Listings Found'}
                </h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  {activeTab === 'pending'
                    ? 'All current listings have been approved.'
                    : 'No listings match your search criteria. Click "Add Listing" to create a new item.'}
                </p>
                {activeTab !== 'pending' && (
                  <button
                    onClick={() => {
                      setItemToEdit(null);
                      setIsFormModalOpen(true);
                    }}
                    className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-xs cursor-pointer"
                  >
                    <Plus size={15} /> Add Listing
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                    <tr>
                      <th className="px-3 py-2">Listing Item</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">District & Location</th>
                      <th className="px-3 py-2">Price & Contact</th>
                      <th className="px-3 py-2 text-center">Approval</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listings.map((item) => {
                      const primaryImg =
                        item.images?.find((img) => img.isPrimary)?.imageUrl ||
                        item.images?.[0]?.imageUrl ||
                        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&q=80';

                      const isBusy = actionLoadingId === item.id;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                          {/* Item Info */}
                          <td className="px-3 py-1.5">
                            <div className="flex items-center gap-2 max-w-xs">
                              <img
                                src={primaryImg}
                                alt={item.titleEn}
                                className="w-6 h-6 rounded object-cover border border-gray-200 shrink-0 bg-gray-50"
                              />
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 truncate text-xs" title={item.titleEn}>
                                  {item.titleEn}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono truncate" title={item.slug}>
                                  /{item.slug}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-3 py-1.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                              <Tag size={10} className="text-emerald-600" />
                              {item.category?.nameEn || 'General'}
                            </span>
                          </td>

                          {/* Location & District */}
                          <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">
                            <div className="flex items-center gap-1 text-xs">
                              <MapPin size={12} className="text-rose-500 shrink-0" />
                              <span className="font-medium text-gray-800">{item.districtEn}</span>
                              {item.locationEn && (
                                <span className="text-[11px] text-gray-400 truncate max-w-[130px]">
                                  • {item.locationEn}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Price & Contact */}
                          <td className="px-3 py-1.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-700 text-xs">
                                {item.priceEn || 'N/A'}
                              </span>
                              {item.phoneNumber && (
                                <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                  <Phone size={10} className="text-gray-400" />
                                  {item.phoneNumber}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Approval Switch */}
                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            <button
                              disabled={isBusy}
                              onClick={() => handleTogglePublish(item.id, item.isPublished)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition ${
                                item.isPublished
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={item.isPublished ? 'Click to unpublish' : 'Click to approve & publish'}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${item.isPublished ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                              <span>{item.isPublished ? 'Published' : 'Pending'}</span>
                            </button>
                          </td>

                          {/* Active Status */}
                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            <button
                              disabled={isBusy}
                              onClick={() => handleToggleActive(item.id, item.activeState)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition ${
                                item.activeState
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={item.activeState ? 'Click to deactivate' : 'Click to activate'}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.activeState ? 'bg-emerald-600' : 'bg-gray-400'
                                }`}
                              />
                              <span>{item.activeState ? 'Active' : 'Inactive'}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-1.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setViewingItem(item);
                                  setIsViewModalOpen(true);
                                }}
                                className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                onClick={() => {
                                  setItemToEdit(item);
                                  setIsFormModalOpen(true);
                                }}
                                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title="Edit Listing"
                              >
                                <Edit size={15} />
                              </button>

                              <button
                                disabled={isBusy}
                                onClick={() => handleDeleteListing(item)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Delete Listing"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                totalItems={totalListings}
                pageSize={itemsPerPage}
              />
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── VIEW 2: CATEGORIES TAB ── */}
      {/* ==================================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            <button
              onClick={() => {
                setCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              <Plus size={18} /> Add Category
            </button>
          </div>

          {isLoadingCategories ? (
            <div className="p-12 flex justify-center bg-white rounded-xl border border-gray-200">
              <AgroLoader message="Loading categories..." />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-xl border border-gray-200">
              <Layers size={44} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No Categories Found</h3>
              <p className="text-sm text-gray-500 mt-1">Create your first marketplace category using the button above.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                    <tr>
                      <th className="px-3 py-2">Category Name</th>
                      <th className="px-3 py-2">Slug</th>
                      <th className="px-3 py-2 text-center">Listings</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCategories.map((cat) => {
                      const isCatBusy = actionLoadingId === cat.id;

                      return (
                        <tr key={cat.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-3 py-1.5">
                            <div className="flex items-center gap-2 max-w-xs">
                              {cat.imageUrl ? (
                                <img
                                  src={cat.imageUrl}
                                  alt={cat.nameEn}
                                  className="w-6 h-6 rounded object-cover border border-gray-200 shrink-0 bg-gray-50"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                                  <Layers size={13} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-semibold text-gray-900 truncate text-xs block" title={cat.nameEn}>
                                  {cat.nameEn}
                                </span>
                                <span className="text-[10px] text-gray-400 block truncate" title={cat.nameSi}>
                                  {cat.nameSi}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-1.5 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                            /{cat.slug}
                          </td>

                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                              {cat._count?.marketplaces ?? 0}
                            </span>
                          </td>

                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            <button
                              disabled={isCatBusy}
                              onClick={() => handleToggleCategoryActive(cat)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition ${
                                cat.activeState
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              } ${isCatBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${cat.activeState ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                              <span>{cat.activeState ? 'Active' : 'Inactive'}</span>
                            </button>
                          </td>

                          <td className="px-3 py-1.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setCategoryToEdit(cat);
                                  setIsCategoryModalOpen(true);
                                }}
                                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title="Edit Category"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                disabled={isCatBusy}
                                onClick={() => handleDeleteCategory(cat)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Delete Category"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Separate Modals ── */}
      <MarketplaceCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
        onSuccess={() => {
          fetchCategories();
          fetchOverallStats();
          showSuccess('Category saved successfully!');
        }}
      />

      <MarketplaceFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setItemToEdit(null);
        }}
        itemToEdit={itemToEdit}
        categories={categories}
        onSuccess={() => {
          fetchListings();
          fetchOverallStats();
          showSuccess('Marketplace listing saved successfully!');
        }}
      />

      <MarketplaceViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingItem(null);
        }}
        item={viewingItem}
        onEdit={(item) => {
          setIsViewModalOpen(false);
          setItemToEdit(item);
          setIsFormModalOpen(true);
        }}
        onTogglePublish={handleTogglePublish}
      />
    </div>
  );
}
