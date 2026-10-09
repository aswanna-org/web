import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  Store,
  MapPin,
  Phone,
  ArrowUpRight,
  ArrowLeft,
  RotateCcw,
  Tag,
  Layers,
  ChevronRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import { getDistricts, type District } from 'sl-gnd-dsd-districts';
import { useAuth } from '../../context/AuthContext';
import MarketplacePublicPostModal from '../../components/public/MarketplacePublicPostModal';

interface MarketplaceImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  slug: string;
}

interface MarketplaceCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameSi: string;
  imageUrl?: string | null;
  activeState: boolean;
  _count?: { marketplaces: number };
}

interface MarketplaceItem {
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
  createdAt: string;
  categoryId: string;
  category?: MarketplaceCategory;
  images?: MarketplaceImage[];
}

const CLOUD_PALETTE = [
  { fill: '#e2f5dc' }, // 1. Soft Leaf Green
  { fill: '#fff1d6' }, // 2. Warm Peach
  { fill: '#daf0fc' }, // 3. Sky Blue
  { fill: '#f0def8' }, // 4. Soft Lavender
  { fill: '#fde2e6' }, // 5. Soft Rose Pink
  { fill: '#fde8d4' }, // 6. Soft Apricot Orange
  { fill: '#eef8ce' }, // 7. Fresh Lime
  { fill: '#d5f3ed' }, // 8. Mint Aqua
  { fill: '#fce4ec' }, // 9. Blush Rose
  { fill: '#e8f5e9' }, // 10. Pale Meadow Green
  { fill: '#ede7f6' }, // 11. Pale Lilac
  { fill: '#e0f7fa' }, // 12. Soft Cyan Ice
  { fill: '#fff8e1' }, // 13. Pale Amber Cream
  { fill: '#fbe9e7' }, // 14. Soft Coral Mist
  { fill: '#f3e5f5' }, // 15. Light Heather Purple
  { fill: '#e8eaf6' }, // 16. Periwinkle Mist
  { fill: '#e0f2f1' }, // 17. Seafoam Mint
  { fill: '#f9fbe7' }, // 18. Pale Chartreuse
  { fill: '#fff3e0' }, // 19. Honey Peach
  { fill: '#f1f8e9' }, // 20. Spring Sprout Green
  { fill: '#e1f5fe' }, // 21. Glacier Blue
  { fill: '#ffe0b2' }, // 22. Golden Wheat
  { fill: '#dcedc8' }, // 23. Pistachio Green
  { fill: '#f8bbd0' }, // 24. Cherry Blossom Pink
  { fill: '#e1bee7' }, // 25. Orchid Tint
  { fill: '#c8e6c9' }, // 26. Clover Green
  { fill: '#ffebee' }, // 27. Petal Pink
  { fill: '#d1c4e9' }, // 28. Soft Violet
  { fill: '#b2dfdb' }, // 29. Cool Sage Aqua
  { fill: '#ffecb3' }, // 30. Sunlight Yellow
  { fill: '#ffccbc' }, // 31. Papaya Tint
  { fill: '#d7ccc8' }, // 32. Warm Sandstone
  { fill: '#cfd8dc' }, // 33. Morning Mist
  { fill: '#c5cae9' }, // 34. Twilight Blue
  { fill: '#b3e5fc' }, // 35. Powder Blue
  { fill: '#b2ebf2' }, // 36. Lagoon Tint
  { fill: '#dcedc1' }, // 37. Olive Sprout
  { fill: '#ffd3b6' }, // 38. Cantaloupe Tint
  { fill: '#ffaaa5' }, // 39. Coral Tint
  { fill: '#a8e6cf' }, // 40. Sweet Pea Green
];

const CLOUD_PATHS = [
  "M 25,90 C 5,90 2,65 18,48 C 30,30 55,34 70,22 C 86,5 122,5 142,18 C 162,28 175,38 186,50 C 200,64 198,90 182,108 C 166,126 142,130 124,136 C 96,146 64,142 45,126 C 28,112 25,98 25,90 Z",
  "M 20,82 C 2,82 0,55 16,38 C 30,22 58,26 72,16 C 90,4 128,4 146,18 C 164,30 178,36 190,52 C 202,68 198,95 180,114 C 162,130 138,132 120,138 C 96,148 62,145 42,126 C 24,108 20,92 20,82 Z",
  "M 28,95 C 6,95 2,68 18,50 C 32,32 58,38 72,25 C 90,8 126,6 146,18 C 166,28 180,44 192,54 C 206,70 202,98 184,116 C 166,132 142,134 122,140 C 94,150 64,144 46,128 C 30,114 26,102 28,95 Z",
  "M 22,86 C 4,86 0,60 16,42 C 32,24 60,30 74,18 C 92,4 130,4 148,18 C 166,30 182,40 192,58 C 204,78 198,104 178,122 C 158,134 134,134 116,140 C 90,150 60,144 42,124 C 26,106 22,94 22,86 Z",
];

function CloudBackground({ index }: { index: number }) {
  const color = CLOUD_PALETTE[index % CLOUD_PALETTE.length];
  const path = CLOUD_PATHS[index % CLOUD_PATHS.length];

  return (
    <svg
      viewBox="0 0 200 150"
      className="absolute inset-0 w-full h-full -z-0 transition-transform duration-300 group-hover:scale-105 pointer-events-none"
      preserveAspectRatio="none"
    >
      <path d={path} fill={color.fill} />
    </svg>
  );
}

// Reusable SVG for wavy card divider matching reference UI
const CardWaveDivider = () => (
  <svg
    className="absolute -bottom-1 left-0 right-0 w-full h-8 sm:h-9 text-white fill-white pointer-events-none z-10 translate-y-1"
    viewBox="0 0 500 70"
    preserveAspectRatio="none"
  >
    <path d="M0,25 C150,55 350,0 500,25 L500,70 L0,70 Z" />
  </svg>
);

// Leaf watermark matching reference UI
const AswannaLeafBadge = () => (
  <div className="w-7 h-7 flex items-center justify-center text-emerald-500/80 group-hover:text-emerald-600 transition-colors shrink-0">
    <svg viewBox="0 0 32 32" className="w-7 h-7 fill-current">
      <path d="M16 28c0-7.7 6.3-14 14-14 0 7.7-6.3 14-14 14z" opacity="0.9" />
      <path d="M16 28C16 19.2 8.8 12 0 12c0 8.8 7.2 16 16 16z" opacity="0.6" />
      <path d="M16 28v-8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
  'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&q=80',
  'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80',
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
  'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80',
  'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&q=80'
];

export default function Marketplace() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSi = i18n.language === 'si';

  // Auth & Posting
  const { isAuthenticated, token, openLoginModal } = useAuth();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleOpenPostModal = () => {
    if (!isAuthenticated || !token) {
      openLoginModal();
      return;
    }
    setIsPostModalOpen(true);
  };

  // State
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc'>('newest');

  // Districts
  const districts: District[] = useMemo(() => {
    try {
      return getDistricts();
    } catch {
      return [];
    }
  }, []);

  // Active Category Object (if categorySlug in URL)
  const activeCategory = useMemo(() => {
    if (!categorySlug) return null;
    return categories.find((c) => c.slug === categorySlug) || null;
  }, [categorySlug, categories]);

  // Filtered categories for overview search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.nameEn.toLowerCase().includes(q) ||
        c.nameSi.includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/categories?activeOnly=true`);
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load marketplace categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Fetch Listings
  const fetchItems = useCallback(async () => {
    setIsLoadingItems(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', String(itemsPerPage));
      params.append('activeOnly', 'true');
      params.append('isPublished', 'true');

      if (categorySlug) {
        params.append('categorySlug', categorySlug);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (selectedDistrict !== 'ALL') {
        params.append('districtEn', selectedDistrict);
      }

      if (sortBy === 'newest') {
        params.append('sortBy', 'createdAt');
        params.append('sortOrder', 'desc');
      }

      const res = await fetch(`${API_BASE_URL}/marketplace?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        let fetchedItems: MarketplaceItem[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.items)
          ? json.items
          : Array.isArray(json)
          ? json
          : [];

        // In-memory sort by price if requested
        if (sortBy === 'priceAsc') {
          fetchedItems = fetchedItems.sort((a, b) => {
            const pA = parseFloat(a.priceEn?.replace(/[^0-9.]/g, '') || '0') || 0;
            const pB = parseFloat(b.priceEn?.replace(/[^0-9.]/g, '') || '0') || 0;
            return pA - pB;
          });
        } else if (sortBy === 'priceDesc') {
          fetchedItems = fetchedItems.sort((a, b) => {
            const pA = parseFloat(a.priceEn?.replace(/[^0-9.]/g, '') || '0') || 0;
            const pB = parseFloat(b.priceEn?.replace(/[^0-9.]/g, '') || '0') || 0;
            return pB - pA;
          });
        }

        setItems(fetchedItems);
        const total = json.meta?.total ?? json.pagination?.total ?? fetchedItems.length;
        const totalP = json.meta?.totalPages ?? json.pagination?.totalPages ?? 1;
        setTotalPages(totalP);
        setTotalItems(total);
      }
    } catch (err) {
      console.error('Failed to load marketplace items:', err);
    } finally {
      setIsLoadingItems(false);
    }
  }, [categorySlug, currentPage, searchQuery, selectedDistrict, sortBy]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const activeCategoryTitle = activeCategory
    ? isSi
      ? activeCategory.nameSi
      : activeCategory.nameEn
    : '';

  return (
    <div className="min-h-screen bg-[#fcfdfa] pb-16 font-roboto">
      <SEO
        title={
          activeCategoryTitle
            ? `${activeCategoryTitle} | Aswanna Marketplace`
            : isSi
            ? 'කෘෂි වෙළඳපොල | Aswanna Marketplace'
            : 'Agricultural Marketplace | Aswanna'
        }
        description={
          isSi
            ? 'බීජ, පොහොර, පැලෑටි, අස්වැන්න සහ කෘෂිකාර්මික උපකරණ මිලදී ගන්න සහ විකුණන්න'
            : 'Buy & sell seeds, produce, farming tools, and agricultural machinery across Sri Lanka'
        }
      />

      {/* Page Hero Header */}
      <PageHero
        title={
          activeCategoryTitle
            ? activeCategoryTitle
            : isSi
            ? 'කෘෂි වෙළඳපොල'
            : 'Agricultural Marketplace'
        }
        subtitle={
          activeCategory
            ? isSi
              ? `${activeCategory.nameSi} යටතේ ඇති සියලුම දැන්වීම් සහ නිෂ්පාදන`
              : `All available listings and farming produce in ${activeCategory.nameEn}`
            : isSi
            ? 'බීජ, පොහොර, පැලෑටි, අස්වැන්න සහ කෘෂිකාර්මික උපකරණ මිලදී ගන්න සහ විකුණන්න'
            : 'Buy & sell seeds, produce, plants, tools, and farming equipment across Sri Lanka'
        }
        icon={Store}
        image={activeCategory?.imageUrl || "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80"}
        badgeBg="bg-[#2E7D32]"
        waveColor="text-[#fcfdfa]"
      />

      {/* ── VIEW 1: CATEGORIES OVERVIEW (When no category is selected) ── */}
      {!categorySlug && (
        <>
          {/* Action Bar (Right-Aligned Button matching site style, No Search Bar) */}
          <section className="w-full py-4 sm:py-5 bg-white border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative z-20">
            <div className="container mx-auto px-4 lg:px-12 flex justify-end">
              <button
                type="button"
                onClick={handleOpenPostModal}
                className="inline-flex items-center gap-3.5 pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2 sm:py-2.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-xl border border-gray-200/80 hover:border-emerald-300 text-emerald-950 font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(0,0,0,0.05),inset_0_1.5px_2px_rgba(255,255,255,1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <span>{isSi ? 'දැන්වීමක් පළ කරන්න' : 'Post an Ad'}</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-100 shadow-xs flex items-center justify-center text-emerald-900 group-hover:rotate-45 transition-transform duration-300 shrink-0">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </button>
            </div>
          </section>

          {/* Category Grid Section */}
          <section className="w-full py-12 sm:py-16 bg-[#fbfdfa]">
            <div className="container mx-auto px-4 lg:px-12">
              {isLoadingCategories ? (
                <div className="py-16 flex justify-center">
                  <AgroLoader message={isSi ? 'කාණ්ඩ පූරණය වෙමින් පවතී...' : 'Loading categories...'} />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-6">
                  <Layers className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <h3 className="font-bold text-gray-700 text-base">
                    {isSi ? 'කාණ්ඩ හමු නොවීය' : 'No categories found'}
                  </h3>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                  {filteredCategories.map((cat, idx) => {
                    const title = isSi ? cat.nameSi : cat.nameEn;
                    const catImg = cat.imageUrl;

                    return (
                      <Link
                        key={cat.id}
                        to={`/marketplace/category/${cat.slug}`}
                        style={{ animationDelay: `${Math.min(idx * 45, 600)}ms` }}
                        className="animate-card-pop group relative flex flex-col items-center justify-between p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-200/80 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      >
                        {/* Top: Illustration with large organic cloud pastel background shape */}
                        <div className="w-full aspect-square max-w-[100px] sm:max-w-[130px] md:max-w-[145px] flex items-center justify-center relative">
                          <CloudBackground index={idx} />
                          {catImg ? (
                            <img
                              src={catImg}
                              alt={title}
                              className="w-full h-full max-w-[85%] max-h-[85%] object-contain relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="relative z-10 text-emerald-800">
                              <Store className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5]" />
                            </div>
                          )}
                        </div>

                        {/* Middle: Title */}
                        <div className="w-full text-center my-1.5 px-0.5 sm:px-1">
                          <h3 className="font-bold text-[11px] sm:text-xs md:text-sm text-gray-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
                            {title}
                          </h3>
                        </div>

                        {/* Bottom: Circular Green Chevron Button */}
                        <div className="mt-0.5 pb-0.5">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-emerald-700 group-hover:bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:shadow-emerald-600/30 group-hover:scale-110 transition-all duration-300">
                            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 stroke-[2.5]" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── VIEW 2: INSIDE CATEGORY VIEW (Listings for category) ── */}
      {categorySlug && (
        <section className="w-full py-8 sm:py-12 bg-[#fbfdfa]">
          <div className="container mx-auto px-4 lg:px-12">
            {/* Simple Back button & Post Ad button */}
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <button
                onClick={() => {
                  navigate('/marketplace');
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-700" />
                <span>{isSi ? 'සියලු ප්‍රවර්ග වෙත ආපසු' : 'Back to All Categories'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenPostModal}
                className="inline-flex items-center gap-3 pl-5 sm:pl-6 pr-2 sm:pr-2.5 py-1.5 sm:py-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-xl border border-gray-200/80 hover:border-emerald-300 text-emerald-950 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <span>{isSi ? 'දැන්වීමක් පළ කරන්න' : 'Post in this Category'}</span>
                <div className="w-7 h-7 rounded-full bg-white border border-gray-100 shadow-xs flex items-center justify-center text-emerald-900 group-hover:rotate-45 transition-transform duration-300 shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </button>
            </div>

            {/* Direct filters row (NO card wrapper) */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              {/* Search input */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder={isSi ? 'මෙම ප්‍රවර්ගයේ සොයන්න...' : 'Search in this category...'}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-white text-xs sm:text-sm focus:outline-emerald-600 shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* District Filter */}
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded-full px-4 py-2 text-xs sm:text-sm bg-white text-gray-700 focus:outline-emerald-600 cursor-pointer shadow-xs"
              >
                <option value="ALL">{isSi ? 'සියලු දිස්ත්‍රික්ක' : 'All Districts'}</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.nameEn}>
                    {isSi ? d.nameSi : d.nameEn}
                  </option>
                ))}
              </select>

              {/* Sort By Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-200 rounded-full px-4 py-2 text-xs sm:text-sm bg-white text-gray-700 focus:outline-emerald-600 cursor-pointer shadow-xs"
              >
                <option value="newest">{isSi ? 'නවතම මුලින්' : 'Newest First'}</option>
                <option value="priceAsc">{isSi ? 'මිල: අඩු සිට වැඩි' : 'Price: Low to High'}</option>
                <option value="priceDesc">{isSi ? 'මිල: වැඩි සිට අඩු' : 'Price: High to Low'}</option>
              </select>

              {(searchQuery || selectedDistrict !== 'ALL' || sortBy !== 'newest') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDistrict('ALL');
                    setSortBy('newest');
                    setCurrentPage(1);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>{isSi ? 'යළි සකසන්න' : 'Reset'}</span>
                </button>
              )}
            </div>

            {/* Category Results Count */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-6 px-1">
              <span>
                {isSi ? 'ලබාගත හැකි දැන්වීම්:' : 'Available Listings:'}{' '}
                <strong className="text-gray-900 font-bold">{totalItems}</strong>
              </span>
            </div>

            {/* Category Items Grid */}
            {isLoadingItems ? (
              <div className="py-20 flex justify-center">
                <AgroLoader message={isSi ? 'අයිතම පූරණය වෙමින් පවතී...' : 'Loading category items...'} />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
                <Store className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <h3 className="text-base font-bold text-gray-800">
                  {isSi ? 'මෙම ප්‍රවර්ගයේ දැන්වීම් හමු නොවීය' : 'No listings found in this category'}
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  {isSi
                    ? 'වෙනත් දිස්ත්‍රික්කයක් හෝ සෙවුම් පදයක් භාවිතා කර බලන්න.'
                    : 'Try clearing your filters or search terms to find other items.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {items.map((it, idx) => {
                  const primaryImg =
                    it.images?.find((img) => img.isPrimary)?.imageUrl ||
                    it.images?.[0]?.imageUrl ||
                    DEFAULT_CATEGORY_IMAGES[idx % DEFAULT_CATEGORY_IMAGES.length];
                  const itemTitle = isSi ? it.titleSi : it.titleEn;
                  const itemDistrict = isSi ? it.districtSi : it.districtEn;
                  const itemPrice = isSi && it.priceSi ? it.priceSi : it.priceEn;
                  const itemLocation = isSi && it.locationSi ? it.locationSi : it.locationEn;
                  const detailUrl = `/marketplace/items/${categorySlug}/${it.slug}`;

                  return (
                    <div
                      key={it.id}
                      onClick={() => navigate(detailUrl)}
                      style={{ animationDelay: `${idx * 40}ms` }}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.05)] sm:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 cursor-pointer"
                    >
                      {/* Top Media Wrapper */}
                      <div className="relative">
                        <div className="h-40 sm:h-48 w-full relative overflow-hidden bg-white">
                          <img
                            src={primaryImg}
                            alt={itemTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </div>

                        {/* Wavy Divider */}
                        <CardWaveDivider />

                        {/* Floating Round Badge */}
                        <div className="absolute -bottom-4 sm:-bottom-5 left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#006837] text-white flex items-center justify-center border-[3px] border-white shadow-md sm:shadow-lg group-hover:scale-110 transition-transform">
                          <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      </div>

                      {/* Card Content Area */}
                      <div className="pt-7 sm:pt-8 px-4 sm:px-6 pb-4 sm:pb-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="font-bold text-sm sm:text-base lg:text-lg text-[#143d4d] leading-snug group-hover:text-[#006837] transition-colors line-clamp-2">
                            {itemTitle}
                          </h4>

                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                            <MapPin size={13} className="text-rose-500 shrink-0" />
                            <span className="font-medium text-gray-700">{itemDistrict}</span>
                            {itemLocation && (
                              <span className="text-gray-400 truncate">({itemLocation})</span>
                            )}
                          </div>

                          {it.phoneNumber && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                              <Phone size={12} className="shrink-0" />
                              <span>{it.phoneNumber}</span>
                            </div>
                          )}
                        </div>

                        {/* Footer: Price & Explore */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                              {isSi ? 'මිල' : 'Price'}
                            </span>
                            <span className="font-extrabold text-[#006837] text-sm sm:text-base">
                              {itemPrice || (isSi ? 'සාකච්ඡා කරගත හැක' : 'Negotiable')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="bg-[#006837] hover:bg-[#00532c] text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all shadow-xs group-hover:shadow cursor-pointer"
                            >
                              <span>{isSi ? 'විස්තර' : 'View'}</span>
                              <ArrowUpRight size={14} />
                            </button>
                            <div className="hidden xs:block">
                              <AswannaLeafBadge />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  totalItems={totalItems}
                  pageSize={itemsPerPage}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Public Item Submission Modal */}
      <MarketplacePublicPostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        categories={categories}
        defaultCategorySlug={categorySlug}
        onSuccess={() => {
          setShowSuccessModal(true);
        }}
      />

      {/* Success Notification Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-smooth">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 border border-emerald-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {isSi ? 'දැන්වීම සාර්ථකව ඉදිරිපත් කරන ලදී!' : 'Listing Submitted Successfully!'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isSi
                ? 'ඔබගේ දැන්වීම සාර්ථකව පද්ධතියට එක් විය. අපගේ පරිපාලක (Admin) කණ්ඩායම විසින් එය පරීක්ෂා කර අනුමත කළ පසු එය වෙළඳපොලෙහි ප්‍රසිද්ධ කෙරේ.'
                : 'Your marketplace listing has been submitted for review. Once verified and approved by our administrator, it will be published to the public marketplace.'}
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{isSi ? 'තත්ත්වය: පරිපාලක අනුමැතිය අපේක්ෂිතයි' : 'Status: Pending Administrator Approval'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-[#006837] hover:bg-[#00532c] text-white font-bold rounded-xl transition shadow-md cursor-pointer text-xs sm:text-sm"
            >
              {isSi ? 'තේරුම් ගත්තා' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
