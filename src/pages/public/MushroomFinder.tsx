import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';
import {
  Search, Sparkles, MapPin, X, Plus,
  RotateCcw, ArrowUpRight
} from 'lucide-react';
import { CardWaveDivider, AswannaLeafBadge } from '../../components/ui/Card';
import Pagination from '../../components/admin/Pagination';
import CustomDropdown from '../../components/ui/CustomDropdown';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import type {
  MushroomSupplierItem,
  MushroomFormDropdownOptions
} from '../../admin/components/mushroom/types';
import { getDistricts, getDSDsByDistrict } from 'sl-gnd-dsd-districts';
import { useAuth } from '../../context/AuthContext';
import MushroomFormModal from '../../admin/components/mushroom/MushroomFormModal';

export default function MushroomFinder() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const { isAuthenticated, openLoginModal } = useAuth();

  // Modal State for Public Supplier Registration
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);

  // State
  const [suppliers, setSuppliers] = useState<MushroomSupplierItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedDsd, setSelectedDsd] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState('all');

  // Form options (categories, deliveries, badges)
  const [options, setOptions] = useState<MushroomFormDropdownOptions>({
    categories: [],
    deliveries: [],
    operatingHours: [],
    badges: [],
    locations: []
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load dropdown options
  useEffect(() => {
    fetch(`${API_BASE_URL}/mushroom-suppliers/form-options`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setOptions(json.data);
      })
      .catch((err) => console.error('Failed to load mushroom options:', err));
  }, [API_BASE_URL]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch suppliers
  useEffect(() => {
    fetchSuppliers(currentPage);
  }, [debouncedSearch, selectedDistrict, selectedDsd, selectedCategory, selectedDelivery, currentPage]);

  const fetchSuppliers = async (page = 1) => {
    try {
      setIsLoading(true);
      const q = new URLSearchParams();
      q.append('page', page.toString());
      q.append('limit', '16');
      q.append('activeOnly', 'true');
      if (debouncedSearch.trim()) q.append('search', debouncedSearch.trim());
      if (selectedDistrict && selectedDistrict !== 'all') q.append('district', selectedDistrict);
      if (selectedDsd && selectedDsd !== 'all') q.append('dsd', selectedDsd);
      if (selectedCategory && selectedCategory !== 'all') q.append('categoryId', selectedCategory);
      if (selectedDelivery && selectedDelivery !== 'all') q.append('deliveryId', selectedDelivery);

      const res = await fetch(`${API_BASE_URL}/mushroom-suppliers?${q.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch suppliers');
      const json = await res.json();

      const items = json.data || json.items || [];
      setSuppliers(Array.isArray(items) ? items : []);
      setTotalPages(json.totalPages || json.meta?.totalPages || 1);
      setTotalCount(json.total || json.meta?.total || items.length || 0);
    } catch (err) {
      console.error('Error fetching mushroom suppliers:', err);
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Dropdown Options
  const districtOptions = useMemo(() => {
    try {
      const dList = getDistricts();
      return [
        { value: 'all', label: isSinhala ? 'සියලු දිස්ත්‍රික්ක' : 'All Districts' },
        ...dList.map((d) => ({
          value: d.nameEn,
          label: isSinhala ? d.nameSi : d.nameEn
        }))
      ];
    } catch {
      return [{ value: 'all', label: isSinhala ? 'සියලු දිස්ත්‍රික්ක' : 'All Districts' }];
    }
  }, [isSinhala]);

  const dsdOptions = useMemo(() => {
    if (!selectedDistrict || selectedDistrict === 'all') {
      return [{ value: 'all', label: isSinhala ? 'සියලු ප්‍රා. ලේ. කොට්ඨාස' : 'All DSD Divisions' }];
    }
    try {
      const dsds = getDSDsByDistrict(selectedDistrict);
      return [
        { value: 'all', label: isSinhala ? 'සියලු ප්‍රා. ලේ. කොට්ඨාස' : 'All DSD Divisions' },
        ...dsds.map((d) => ({
          value: d.nameEn,
          label: isSinhala ? (d.nameSi || d.nameEn) : d.nameEn
        }))
      ];
    } catch {
      return [{ value: 'all', label: isSinhala ? 'සියලු ප්‍රා. ලේ. කොට්ඨාස' : 'All DSD Divisions' }];
    }
  }, [selectedDistrict, isSinhala]);

  const categoryOptions = useMemo(() => {
    return [
      { value: 'all', label: isSinhala ? 'සියලු කාණ්ඩ (Categories)' : 'All Categories' },
      ...options.categories.map((c) => ({
        value: c.id,
        label: (isSinhala ? (c.nameSi || c.nameEn) : (c.nameEn || c.nameSi)) || c.slug
      }))
    ];
  }, [options.categories, isSinhala]);

  const deliveryOptions = useMemo(() => {
    return [
      { value: 'all', label: isSinhala ? 'සියලු බෙදාහැරීම් ක්‍රම' : 'All Delivery Options' },
      ...options.deliveries.map((d) => ({
        value: d.id,
        label: (isSinhala ? (d.nameSi || d.nameEn) : (d.nameEn || d.nameSi)) || d.slug
      }))
    ];
  }, [options.deliveries, isSinhala]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    (selectedDistrict && selectedDistrict !== 'all') ||
    (selectedDsd && selectedDsd !== 'all') ||
    (selectedCategory && selectedCategory !== 'all') ||
    (selectedDelivery && selectedDelivery !== 'all')
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedDistrict('all');
    setSelectedDsd('all');
    setSelectedCategory('all');
    setSelectedDelivery('all');
    setCurrentPage(1);
  };


  // SEO
  const pageTitle = isSinhala
    ? 'බිම්මල් වගාකරුවන් සහ බීජ නිෂ්පාදකයින් | Mushroom Suppliers - Aswanna'
    : 'Mushroom Suppliers & Spawn Centers in Sri Lanka | Aswanna';

  const pageDesc = isSinhala
    ? 'ශ්‍රී ලංකාවේ විශ්වාසවන්ත බිම්මල් වගාකරුවන්, ගුණාත්මක බීජ (Spawn), වගා මලු සහ අමුද්‍රව්‍ය සපයන්නන් එකම තැනකින් සොයාගන්න.'
    : 'Find certified mushroom growers, oyster mushroom spawn, substrates, and cultivation supplies across Sri Lanka on Aswanna.';

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-28 sm:pb-32 lg:pb-16 font-sans">
      <SEO
        title={pageTitle}
        description={pageDesc}
        canonical="/mushrooms"
      />

      <PageHero
        title={isSinhala ? 'බිම්මල් වගාකරුවන් සහ බීජ නිෂ්පාදකයින්' : 'Mushroom Growers & Spawn Centers'}
        description={
          isSinhala
            ? 'ශ්‍රී ලංකාවේ ප්‍රමුඛ බිම්මල් වගාකරුවන්, ගුණාත්මක ඔයිස්ටර්/බටන් බීජ, වගා මලු සහ අමුද්‍රව්‍ය සපයන්නන් පහසුවෙන් සොයාගන්න.'
            : 'Find verified mushroom suppliers, top-grade spawn bottles, bags, and cultivation equipment across Sri Lanka.'
        }
        image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600&q=80"
        gradientColor="#006837"
        icon={Sparkles}
        badgeBg="bg-[#006837]"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 mt-8">
        {/* Submission Notice for Public Registration */}
        {submissionNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  {isSinhala ? 'තොරතුරු සාර්ථකව යොමු කරන ලදී' : 'Submission Received'}
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {submissionNotice}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubmissionNotice(null)}
              className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header Bar with Title, Count & Action */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-base sm:text-2xl font-bold text-gray-900 truncate">
              {isSinhala ? 'ලියාපදිංචි බිම්මල් සපයන්නන්' : 'Registered Mushroom Suppliers'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006837] text-[11px] sm:text-xs font-bold shrink-0">
              {totalCount}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                openLoginModal();
                return;
              }
              setIsPostModalOpen(true);
            }}
            className="inline-flex items-center justify-between gap-1.5 sm:gap-2.5 pl-3 sm:pl-5 pr-1 sm:pr-2 py-1 sm:py-2 rounded-full bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-gray-200/80 hover:border-emerald-300 text-gray-900 font-bold text-[11px] sm:text-sm shadow-[0_4px_16px_rgba(0,0,0,0.05),inset_0_1px_1.5px_rgba(255,255,255,1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer shrink-0"
          >
            <span className="truncate">{isSinhala ? 'සපයන්නෙකු එක්කරන්න' : 'Register Supplier'}</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-50 text-[#006837] border border-emerald-100/80 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 shadow-2xs shrink-0">
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="space-y-3 mb-8">
          {/* Search Input */}
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={
                isSinhala
                  ? 'ව්‍යාපාරයේ නම, හිමිකරු, බීජ වර්ග, දිස්ත්‍රික්කය හෝ දුරකථන අංකය සොයන්න...'
                  : 'Search by business name, owner, spawn type, district, or phone...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl sm:rounded-full border border-gray-200/90 bg-white hover:border-emerald-500/60 focus:border-[#006837] focus:ring-2 focus:ring-[#006837]/15 outline-none transition-all text-xs sm:text-sm text-gray-800 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-all cursor-pointer"
                title={isSinhala ? 'සෙවීම ඉවත් කරන්න' : 'Clear search'}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Cascading Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* 1. District */}
            <div>
              <CustomDropdown
                value={selectedDistrict}
                onChange={(val) => {
                  setSelectedDistrict(val);
                  setSelectedDsd('all');
                  setCurrentPage(1);
                }}
                options={districtOptions}
                placeholder={isSinhala ? 'සියලු දිස්ත්‍රික්ක' : 'All Districts'}
              />
            </div>

            {/* 2. DSD */}
            <div>
              <CustomDropdown
                value={selectedDsd}
                onChange={(val) => {
                  setSelectedDsd(val);
                  setCurrentPage(1);
                }}
                options={dsdOptions}
                placeholder={isSinhala ? 'සියලු ප්‍රා. ලේ. කොට්ඨාස' : 'All DSD Divisions'}
                disabled={!selectedDistrict || selectedDistrict === 'all'}
              />
            </div>

            {/* 3. Category */}
            <div>
              <CustomDropdown
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val);
                  setCurrentPage(1);
                }}
                options={categoryOptions}
                placeholder={isSinhala ? 'සියලු කාණ්ඩ' : 'All Categories'}
              />
            </div>

            {/* 4. Delivery Option */}
            <div>
              <CustomDropdown
                value={selectedDelivery}
                onChange={(val) => {
                  setSelectedDelivery(val);
                  setCurrentPage(1);
                }}
                options={deliveryOptions}
                placeholder={isSinhala ? 'සියලු බෙදාහැරීම්' : 'All Delivery Options'}
              />
            </div>
          </div>

          {/* Active Filter Clear Row */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-gray-500 font-medium">
                {isSinhala ? 'ක්‍රියාකාරී පෙරහන් ක්‍රියාත්මකයි' : 'Filters applied'} ({totalCount})
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center justify-between gap-2 pl-3.5 pr-1.5 py-1 rounded-full bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-gray-200/80 hover:border-emerald-300 text-gray-800 font-bold text-xs shadow-xs hover:shadow transition-all group cursor-pointer"
              >
                <span>{isSinhala ? 'සියලු පෙරහන් ඉවත් කරන්න' : 'Clear All Filters'}</span>
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/80 flex items-center justify-center group-hover:-rotate-180 transition-transform duration-300 shrink-0">
                  <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="py-16">
            <AgroLoader
              message={isSinhala ? 'බිම්මල් සපයන්නන්ගේ තොරතුරු පූරණය වෙමින් පවතී...' : 'Loading mushroom suppliers...'}
              subMessage="Aswanna Mushroom Network"
            />
          </div>
        ) : suppliers.length === 0 ? (
          <div className="py-12 sm:py-16 text-center max-w-lg mx-auto space-y-4">
            <AgroLoader message="" className="scale-90 sm:scale-100" />
            <div className="space-y-1.5 pt-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {isSinhala ? 'බිම්මල් සපයන්නන් හමු නොවීය' : 'No Mushroom Suppliers Found'}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                {isSinhala
                  ? 'ඔබ සෙවූ නිර්ණායකවලට ගැළපෙන බිම්මල් ව්‍යාපාර මේ මොහොතේ නොමැත. කරුණාකර පෙරහන් ඉවත් කර හෝ වෙනත් ප්‍රදේශයක් යොදා නැවත උත්සාහ කරන්න.'
                  : 'No mushroom suppliers match your selected filters. Try clearing filters or checking other districts.'}
              </p>
            </div>
            {hasActiveFilters && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center justify-between gap-2.5 pl-5 pr-2 py-2 rounded-full bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-gray-200/80 hover:border-emerald-300 text-gray-900 font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(0,0,0,0.05),inset_0_1px_1.5px_rgba(255,255,255,1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
                >
                  <span className="truncate">{isSinhala ? 'සියලු පෙරහන් ඉවත් කරන්න' : 'Clear All Filters'}</span>
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/80 flex items-center justify-center group-hover:-rotate-180 transition-transform duration-300 shadow-2xs shrink-0">
                    <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5">
            {suppliers.map((supplier, index) => {
              const primaryImg =
                supplier.images?.find((img) => img.isPrimary)?.imageUrl ||
                supplier.images?.[0]?.imageUrl ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
              const businessName = (isSinhala
                ? supplier.businessNameSi || supplier.businessNameEn
                : supplier.businessNameEn || supplier.businessNameSi) || 'Mushroom Supplier';
              const owner = isSinhala
                ? supplier.ownerNameSi || supplier.ownerNameEn
                : supplier.ownerNameEn || supplier.ownerNameSi;
              const district = isSinhala
                ? supplier.location?.districtSi || supplier.location?.districtEn
                : supplier.location?.districtEn;
              const province = isSinhala
                ? supplier.location?.provinceSi || supplier.location?.provinceEn
                : supplier.location?.provinceEn;

              return (
                <div
                  key={supplier.id}
                  style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                  className="animate-card-pop h-full"
                >
                  <Link
                    to={`/mushrooms/${supplier.slug}`}
                    className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden group hover:-translate-y-1.5 cursor-pointer block"
                  >
                    {/* Media Top */}
                    <div className="relative">
                      <div className="relative h-28 xs:h-36 sm:h-48 lg:h-52 w-full overflow-hidden bg-gray-100">
                        <img
                          src={primaryImg}
                          alt={businessName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 right-2 sm:right-2.5 flex items-center justify-between gap-1 pointer-events-none">
                          <AswannaLeafBadge />

                          {supplier.images && supplier.images.length > 1 && (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold">
                              {supplier.images.length} Photos
                            </span>
                          )}
                        </div>
                      </div>

                      <CardWaveDivider />
                    </div>

                    {/* Card Content Body */}
                    <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1 sm:space-y-1.5">
                        {/* Title (Cultivation / Farm Name) */}
                        <h3 className="font-bold text-gray-900 text-xs sm:text-base group-hover:text-[#006837] transition-colors line-clamp-1 leading-snug">
                          {businessName}
                        </h3>

                        {/* Owner Name */}
                        {owner && (
                          <div className="text-[10px] sm:text-[11px] text-gray-600 font-medium flex items-center gap-1">
                            <span className="text-gray-400 shrink-0">{isSinhala ? 'හිමිකරු:' : 'Owner:'}</span>
                            <span className="font-semibold text-gray-800 truncate">{owner}</span>
                          </div>
                        )}

                        {/* Location address row */}
                        {(district || province) && (
                          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-gray-500 pt-0.5">
                            <MapPin size={11} className="text-[#006837] shrink-0 sm:w-3 sm:h-3" />
                            <span className="truncate">
                              {district}
                              {province ? `, ${province}` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: "පිවිසෙන්න ↗" Button */}
                      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 mt-2 sm:mt-3.5">
                        <span className="bg-[#006837] group-hover:bg-[#00532c] text-white text-[9px] sm:text-xs font-semibold px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full inline-flex items-center gap-0.5 sm:gap-1 transition-all shadow-xs group-hover:shadow">
                          <span>{isSinhala ? 'පිවිසෙන්න' : 'Explore'}</span>
                          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 stroke-[2.5]" />
                        </span>

                        <AswannaLeafBadge />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>

      {/* Public Add Mushroom Supplier Modal */}
      <MushroomFormModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={() => {
          fetchSuppliers(1);
          setSubmissionNotice(
            isSinhala
              ? 'ඔබගේ බිම්මල් ව්‍යාපාර තොරතුරු සාර්ථකව යොමු කරන ලදී. අපගේ පරිපාලක මණ්ඩලය (Admin) විසින් සමාලෝචනය කර අනුමත කළ පසු එය වෙබ් අඩවියේ ප්‍රදර්ශනය කෙරේ.'
              : 'Your mushroom supplier details have been submitted successfully. It will be published after review and approval by an administrator.'
          );
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }}
        editingItem={null}
        options={options}
        onOptionsRefresh={() => {
          fetch(`${API_BASE_URL}/mushroom-suppliers/form-options`)
            .then((res) => res.json())
            .then((json) => {
              if (json.data) setOptions(json.data);
            });
        }}
        isAdmin={false}
      />
    </div>
  );
}
