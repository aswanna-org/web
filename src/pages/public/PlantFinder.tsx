import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';
import {
  Search, Sprout, MapPin, X, Plus, Store,
  ShieldCheck, Truck, MessageSquare,
  CheckCircle2, RotateCcw, ArrowUpRight
} from 'lucide-react';
import { CardWaveDivider, AswannaLeafBadge } from '../../components/ui/Card';
import Pagination from '../../components/admin/Pagination';
import CustomDropdown from '../../components/ui/CustomDropdown';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import PublicNurseryPostModal from '../../components/public/PublicNurseryPostModal';
import type { NurseryItem, FormDropdownOptions } from '../../admin/components/nursery/types';
import { getDistricts, getDSDsByDistrict } from 'sl-gnd-dsd-districts';

export default function PlantFinder() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const { isAuthenticated, openLoginModal } = useAuth();

  // Nurseries State
  const [nurseries, setNurseries] = useState<NurseryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States (matching AgroLands horizontal bar)
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedDsd, setSelectedDsd] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');

  // Form options (crops, grades, deliveries)
  const [options, setOptions] = useState<FormDropdownOptions>({
    grades: [],
    deliveries: [],
    operatingHours: [],
    certifications: [],
    categories: [],
    crops: [],
    varieties: [],
    specialties: [],
    badges: []
  });

  // Modal & Notice
  const [isNurseryModalOpen, setIsNurseryModalOpen] = useState(false);
  const [showSubmitNotice, setShowSubmitNotice] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load dropdown options
  useEffect(() => {
    fetch(`${API_BASE_URL}/nurseries/form-options`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setOptions(json.data);
      })
      .catch((err) => console.error('Failed to load nursery options:', err));
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch nurseries whenever filters or page change
  useEffect(() => {
    fetchNurseries(currentPage);
  }, [debouncedSearch, selectedDistrict, selectedDsd, selectedCrop, selectedGrade, currentPage]);

  const fetchNurseries = async (page = 1) => {
    try {
      setIsLoading(true);
      const q = new URLSearchParams();
      q.append('page', page.toString());
      q.append('limit', '16');
      q.append('publicOnly', 'true');
      q.append('approvalStatus', 'APPROVED');
      if (debouncedSearch.trim()) q.append('search', debouncedSearch.trim());
      if (selectedDistrict && selectedDistrict !== 'all') q.append('district', selectedDistrict);
      if (selectedDsd && selectedDsd !== 'all') q.append('dsd', selectedDsd);
      if (selectedCrop && selectedCrop !== 'all') q.append('cropId', selectedCrop);
      if (selectedGrade && selectedGrade !== 'all') {
        if (selectedGrade === 'gov_only') {
          q.append('isGovRegistered', 'true');
        } else {
          q.append('gradeId', selectedGrade);
        }
      }

      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/nurseries?${q.toString()}`, { headers });
      if (res.ok) {
        const json = await res.json();
        const rawItems = json.data?.items || json.items || json.data || [];
        const items = Array.isArray(rawItems)
          ? rawItems.filter((item: any) => item.approvalStatus === 'APPROVED')
          : [];
        setNurseries(items);
        if (json.data?.totalPages || json.meta?.totalPages) {
          setTotalPages(json.data?.totalPages || json.meta?.totalPages || 1);
        }
        if (json.data?.total !== undefined || json.meta?.total !== undefined) {
          setTotalCount(json.data?.total ?? json.meta?.total ?? items.length);
        }
      }
    } catch (err) {
      console.error('Failed to fetch plant nurseries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Nursery registration modal
  const handleOpenNurseryModal = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setIsNurseryModalOpen(true);
  };

  const handleNurserySuccess = () => {
    setIsNurseryModalOpen(false);
    setShowSubmitNotice(true);
    fetchNurseries(1);
  };

  // ── Dropdown Options ──
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

  const cropOptions = useMemo(() => {
    return [
      { value: 'all', label: isSinhala ? 'සියලු බෝග / පැළ වර්ග' : 'All Plant Varieties' },
      ...options.crops.map((c) => ({
        value: c.id,
        label: (isSinhala ? (c.nameSi || c.nameEn) : (c.nameEn || c.nameSi)) || c.slug || ''
      }))
    ];
  }, [options.crops, isSinhala]);

  const gradeOptions = useMemo(() => {
    return [
      { value: 'all', label: isSinhala ? 'සියලු ශ්‍රේණි / ලියාපදිංචි' : 'All Grades & Certifications' },
      { value: 'gov_only', label: isSinhala ? 'කෘෂිකර්ම දෙපාර්තමේන්තුවේ ලියාපදිංචි' : 'Gov DOA Registered' },
      ...options.grades.map((g) => ({
        value: g.id,
        label: (isSinhala ? (g.nameSi || g.nameEn) : (g.nameEn || g.nameSi)) || g.slug || ''
      }))
    ];
  }, [options.grades, isSinhala]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    (selectedDistrict && selectedDistrict !== 'all') ||
    (selectedDsd && selectedDsd !== 'all') ||
    (selectedCrop && selectedCrop !== 'all') ||
    (selectedGrade && selectedGrade !== 'all')
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedDistrict('all');
    setSelectedDsd('all');
    setSelectedCrop('all');
    setSelectedGrade('all');
    setCurrentPage(1);
  };

  // Contact helpers
  const cleanPhone = (phone?: string | null) => {
    if (!phone) return '';
    return phone.replace(/[^0-9+]/g, '');
  };

  const getWhatsAppLink = (number?: string | null, name?: string) => {
    const raw = cleanPhone(number);
    if (!raw) return '#';
    let formatted = raw.replace('+', '');
    if (formatted.startsWith('0')) {
      formatted = '94' + formatted.slice(1);
    }
    const message = encodeURIComponent(`ආයුබෝවන්, මම අස්වැන්න (Aswanna) මගින් ${name || 'ඔබගේ පැළ තවාන'} දුටුවෙමි. වැඩි විස්තර දැනගැනීමට කැමැත්තෙමි.`);
    return `https://wa.me/${formatted}?text=${message}`;
  };

  // SEO details
  const pageTitle = isSinhala
    ? 'පැළ සහ තවාන් සොයන්නා | Plant & Nursery Finder - Aswanna'
    : 'Plant & Nursery Finder in Sri Lanka | Aswanna';

  const pageDesc = isSinhala
    ? 'ශ්‍රී ලංකාවේ ප්‍රමුඛ ලියාපදිංචි පැළ තවාන්, ගුණාත්මක බද්ධ පැළ, පලතුරු සහ කුළුබඩු පැළ වර්ග පහසුවෙන් සොයාගන්න.'
    : 'Find top registered plant nurseries, grafted plants, fruit and spice varieties across Sri Lanka on Aswanna.';

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-16">
      <SEO
        title={pageTitle}
        description={pageDesc}
        canonical="/plant-finder"
      />

      <PageHero
        title={isSinhala ? 'බෝග සහ පැළ තවාන් සොයන්නා' : 'Plant & Nursery Finder'}
        description={
          isSinhala
            ? 'ඔබේ දේශගුණයට ගැළපෙන බෝග සහ ශ්‍රී ලංකාවේ ලියාපදිංචි ප්‍රමුඛ පැළ තවාන් එකම තැනකින් සොයාගන්න.'
            : 'Find the best crops and discover verified plant nurseries across Sri Lanka.'
        }
        image="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1600&q=80"
        gradientColor="#006837"
        icon={Sprout}
        badgeBg="bg-[#006837]"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 mt-8">
        
        {/* Header Bar with Title, Count & Hero-styled Post Button */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-base sm:text-2xl font-bold text-gray-900 truncate">
              {isSinhala ? 'ලියාපදිංචි පැළ තවාන් සහ පැළ' : 'Plant Nurseries & Crops'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006837] text-[11px] sm:text-xs font-bold shrink-0">
              {totalCount}
            </span>
          </div>

          {/* Hero-styled Glassmorphic Post Button (matching AgroLands) */}
          <button
            type="button"
            onClick={handleOpenNurseryModal}
            className="inline-flex items-center justify-between gap-1.5 sm:gap-2.5 pl-3 sm:pl-5 pr-1 sm:pr-2 py-1 sm:py-2 rounded-full bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-gray-200/80 hover:border-emerald-300 text-gray-900 font-bold text-[11px] sm:text-sm shadow-[0_4px_16px_rgba(0,0,0,0.05),inset_0_1px_1.5px_rgba(255,255,255,1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer shrink-0"
          >
            <span className="truncate">{isSinhala ? 'පැළ තවානක් ලියාපදිංචි කරන්න' : 'Register Plant Nursery'}</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-50 text-[#006837] border border-emerald-100/80 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 shadow-2xs shrink-0">
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* ── Seamless Horizontal Filter Bar (Matching Screenshot 2) ── */}
        <div className="space-y-3 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-2.5 sm:gap-3">
            
            {/* 1. Search Bar */}
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={
                  isSinhala
                    ? 'පැළ හෝ තවාන් නම, ප්‍රදේශය හෝ විස්තර සොයන්න...'
                    : 'Search plants or nursery name, location...'
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
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 2. District Dropdown (sl-gnd-dsd-districts) */}
            <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
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

            {/* 3. DSD Dropdown (sl-gnd-dsd-districts) */}
            <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
              <CustomDropdown
                value={selectedDsd}
                onChange={(val) => {
                  setSelectedDsd(val);
                  setCurrentPage(1);
                }}
                options={dsdOptions}
                placeholder={isSinhala ? 'සියලු ප්‍රා. ලේ. කොට්ඨාස' : 'All DSD Divisions'}
              />
            </div>

            {/* 4. Plant Crops Dropdown */}
            <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
              <CustomDropdown
                value={selectedCrop}
                onChange={(val) => {
                  setSelectedCrop(val);
                  setCurrentPage(1);
                }}
                options={cropOptions}
                placeholder={isSinhala ? 'සියලු බෝග / පැළ වර්ග' : 'All Plant Varieties'}
              />
            </div>

            {/* 5. Grade & Registration Dropdown */}
            <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
              <CustomDropdown
                value={selectedGrade}
                onChange={(val) => {
                  setSelectedGrade(val);
                  setCurrentPage(1);
                }}
                options={gradeOptions}
                placeholder={isSinhala ? 'සියලු ශ්‍රේණි / ලියාපදිංචි' : 'All Grades & Certifications'}
              />
            </div>
          </div>

          {/* Active Filter Clear Row */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-gray-500 font-medium">
                {isSinhala ? 'පෙරහන් කර ඇති ප්‍රතිඵල' : 'Filtered results'} ({totalCount})
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isSinhala ? 'සියලු පෙරහන් ඉවත් කරන්න' : 'Clear All Filters'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Submission Success Alert Notice */}
        {showSubmitNotice && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 text-xs sm:text-sm text-emerald-950 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>
                <strong>{isSinhala ? 'සාර්ථකයි!' : 'Submitted!'}</strong>{' '}
                {isSinhala
                  ? 'ඔබගේ පැළ තවානේ විස්තර සාර්ථකව ලැබිණි. පරිපාලක අනුමැතියෙන් පසු සජීවීව ප්‍රදර්ශනය කෙරේ.'
                  : 'Your plant nursery submission was received. It will appear publicly upon administrative approval.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSubmitNotice(false)}
              className="text-emerald-700 hover:text-emerald-950 font-bold p-1 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Nursery Listings Grid ── */}
        {isLoading ? (
          <div className="py-16">
            <AgroLoader
              message={isSinhala ? 'පැළ තවාන් තොරතුරු පූරණය වෙමින් පවතී...' : 'Loading plant nurseries...'}
              subMessage="Aswanna Smart Plant Finder"
            />
          </div>
        ) : nurseries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center space-y-4">
            <Store className="mx-auto text-gray-300" size={56} />
            <h3 className="text-xl font-bold text-gray-800">
              {isSinhala ? 'පැළ තවාන් හමු නොවීය' : 'No plant nurseries found'}
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto">
              {isSinhala
                ? 'ඔබ සෙවූ නිර්ණායක වලට අදාළව තවාන් හමු නොවීය. කරුණාකර වෙනත් දිස්ත්‍රික්කයක් හෝ බෝගයක් යොදා බලන්න.'
                : 'No plant nurseries match your current filters. Try adjusting your district or search term.'}
            </p>
            <button
              type="button"
              onClick={handleOpenNurseryModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006837] text-white rounded-xl text-xs font-bold hover:bg-[#00522c] transition-colors cursor-pointer"
            >
              <Plus size={15} />
              <span>{isSinhala ? 'පළමු පැළ තවාන ලියාපදිංචි කරන්න' : 'Register your nursery now'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5">
            {nurseries.map((nursery, index) => {
              const primaryImg =
                nursery.images?.[0]?.imageUrl ||
                'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80';
              const name = (isSinhala
                ? nursery.nameSi || nursery.nameEn
                : nursery.nameEn || nursery.nameSi) || '';
              const secondary = isSinhala ? nursery.nameEn : nursery.nameSi;
              const district = isSinhala
                ? nursery.location?.districtSi || nursery.location?.districtEn
                : nursery.location?.districtEn;
              const province = isSinhala
                ? nursery.location?.provinceSi || nursery.location?.provinceEn
                : nursery.location?.provinceEn;

              return (
                <div
                  key={nursery.id}
                  style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                  className="animate-card-pop h-full"
                >
                  <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] sm:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden group hover:-translate-y-1.5 cursor-pointer">
                    
                    {/* Top Media Section */}
                    <div className="relative">
                      <Link
                        to={`/plant-finder/nursery/${nursery.slug}`}
                        className="h-28 xs:h-36 sm:h-44 lg:h-48 w-full relative overflow-hidden bg-white block"
                      >
                        <img
                          src={primaryImg}
                          alt={name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                        {/* Badges Overlay on Top Corners */}
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3.5 right-2 sm:right-3.5 flex flex-wrap items-center justify-between gap-1 z-10 pointer-events-none">
                          <div className="flex flex-wrap gap-1 pointer-events-auto">
                            {nursery.isGovRegistered && (
                              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-[#006837]/95 text-white text-[9px] sm:text-[10px] font-bold shadow-xs backdrop-blur-xs">
                                <ShieldCheck size={11} className="sm:w-3 sm:h-3" />
                                <span>{isSinhala ? 'ලියාපදිංචි' : 'Gov'}</span>
                              </span>
                            )}
                            {nursery.grade && (
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[9px] sm:text-[10px] font-bold shadow-xs backdrop-blur-xs">
                                {isSinhala ? nursery.grade.nameSi || nursery.grade.nameEn : nursery.grade.nameEn}
                              </span>
                            )}
                          </div>

                          {nursery.delivery && (
                            <div className="pointer-events-auto ml-auto">
                              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-black/70 text-white text-[9px] sm:text-[10px] font-medium backdrop-blur-xs">
                                <Truck size={10} className="sm:w-2.5 sm:h-2.5" />
                                <span className="hidden xs:inline">{isSinhala ? nursery.delivery.nameSi || nursery.delivery.nameEn : nursery.delivery.nameEn}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Smooth Organic Wave Divider */}
                      <CardWaveDivider />

                      {/* Floating Round Icon Badge */}
                      <div className="absolute -bottom-3 sm:-bottom-5 left-2.5 sm:left-6 z-20 w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-[#006837] text-white flex items-center justify-center border-[2px] sm:border-[3.5px] border-white shadow-md sm:shadow-lg group-hover:scale-110 transition-transform">
                        <Sprout className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="pt-4 sm:pt-7 px-2.5 sm:px-5 pb-2.5 sm:pb-5 flex flex-col flex-1 justify-between">
                      <div>
                        <Link to={`/plant-finder/nursery/${nursery.slug}`}>
                          <h3 className="text-xs sm:text-base font-bold text-[#143d4d] leading-snug group-hover:text-[#006837] transition-colors mb-0.5 sm:mb-1 line-clamp-1">
                            {name}
                          </h3>
                        </Link>
                        {secondary && secondary !== name && (
                          <p className="text-[10px] sm:text-[11px] text-gray-400 line-clamp-1 mb-1 sm:mb-1.5">
                            {secondary}
                          </p>
                        )}

                        {/* Location */}
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-gray-500 mb-2 sm:mb-2.5">
                          <MapPin size={12} className="text-emerald-700 shrink-0 sm:w-3.5 sm:h-3.5" />
                          <span className="truncate">
                            {district ? `${district}, ` : ''}{province || 'Sri Lanka'}
                          </span>
                        </div>

                        {/* Fast Selling / Featured Plant Varieties */}
                        {nursery.fastSellingItems && nursery.fastSellingItems.length > 0 && (
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                              {nursery.fastSellingItems.slice(0, 2).map((item) => (
                                <span
                                  key={item.id}
                                  className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200/70 font-medium truncate max-w-[100px] sm:max-w-[140px]"
                                >
                                  🌱 {isSinhala ? item.crop?.nameSi || item.crop?.nameEn : item.crop?.nameEn || item.crop?.nameSi}
                                </span>
                              ))}
                              {nursery.fastSellingItems.length > 2 && (
                                <span className="text-[9px] sm:text-[10px] px-1 py-0.5 rounded-md bg-gray-100 text-gray-600 font-mono">
                                  +{nursery.fastSellingItems.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer: Button, WhatsApp & Leaf Watermark */}
                      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 mt-auto">
                        <Link
                          to={`/plant-finder/nursery/${nursery.slug}`}
                          className="bg-[#006837] hover:bg-[#00532c] text-white text-[10px] sm:text-xs font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1 transition-all shadow-xs group-hover:shadow cursor-pointer"
                        >
                          <span>{isSinhala ? 'විස්තර' : 'Details'}</span>
                          <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                        </Link>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {nursery.whatsappNumber && (
                            <a
                              href={getWhatsAppLink(nursery.whatsappNumber, name)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] flex items-center justify-center transition-colors cursor-pointer"
                              title="WhatsApp Chat"
                            >
                              <MessageSquare size={12} className="sm:w-3.5 sm:h-3.5" />
                            </a>
                          )}
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

        {/* Nurseries Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Public Nursery Post Modal */}
      <PublicNurseryPostModal
        isOpen={isNurseryModalOpen}
        onClose={() => setIsNurseryModalOpen(false)}
        onSuccess={handleNurserySuccess}
        options={options}
      />
    </div>
  );
}
