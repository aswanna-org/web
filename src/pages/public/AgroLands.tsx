import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';
import {
  Search, MapPin, Maximize, Tag, X, Plus, CheckCircle2,
  Clock, RotateCcw
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Pagination from '../../components/admin/Pagination';
import CustomDropdown from '../../components/ui/CustomDropdown';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import PublicAgriLandPostModal from '../../components/public/PublicAgriLandPostModal';
import { getDistricts, getDSDsByDistrict } from 'sl-gnd-dsd-districts';
import type {
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

interface Lookup {
  id: string;
  name: string;
  nameSi: string | null;
}

interface AgroLand {
  id: string;
  title: string;
  titleSi: string | null;
  slug: string;
  description: string | null;
  descriptionSi: string | null;
  location: string;
  locationSi: string | null;
  districtEn?: string | null;
  districtSi?: string | null;
  dsdEn?: string | null;
  dsdSi?: string | null;
  size: string;
  sizeSi: string | null;
  price: number;
  priceFormatted?: string | null;
  typeId: string;
  type?: Lookup;
  categoryId?: string;
  category?: Lookup;
  contactNumber: string;
  image: string | null;
  status: string;
  approvalStatus?: string;
  createdById?: string | null;
}

// Clean and reliable currency formatter for public listings
const formatDisplayPrice = (val?: string | number | null, isSi = false) => {
  if (val === null || val === undefined || val === '') {
    return isSi ? 'මිල විමසන්න' : 'Price on request';
  }
  const str = String(val).trim();
  if (!str) return isSi ? 'මිල විමසන්න' : 'Price on request';
  if (/[a-zA-Z\u0D80-\u0DFF]/.test(str)) return str;
  const num = parseFloat(str.replace(/,/g, ''));
  if (!isNaN(num) && num > 0) {
    return `${isSi ? 'රු.' : 'Rs.'} ${num.toLocaleString('en-LK')}`;
  }
  return str;
};

export default function AgroLands() {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const { isAuthenticated, token, openLoginModal } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Filters State initialized from URL query params or defaults
  const initialSearch = searchParams.get('search') || '';
  const initialType = searchParams.get('type') || 'all';
  const initialDistrict = searchParams.get('district') || 'all';
  const initialDsd = searchParams.get('dsd') || 'all';
  const initialCategory = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [selectedDsd, setSelectedDsd] = useState(initialDsd);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const [lands, setLands] = useState<AgroLand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // User Submission Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [landToEdit, setLandToEdit] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Lookups for filters & submit modal
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
  const [legacyTypes, setLegacyTypes] = useState<any[]>([]);
  const [lookupsLoaded, setLookupsLoaded] = useState(false);

  // Fetch Lookups for filter dropdowns & modal
  const fetchMasterLookups = async () => {
    if (lookupsLoaded) return;
    try {
      const [
        dtRes, locRes, deedRes, catRes, terrRes,
        efRes, wtRes, bfRes, fbRes, itRes,
        maRes, crRes, arRes, elRes, wsRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/agri-land-deal-types`),
        fetch(`${API_BASE_URL}/agri-land-locations`),
        fetch(`${API_BASE_URL}/agri-land-deed-types`),
        fetch(`${API_BASE_URL}/agri-land-categories`),
        fetch(`${API_BASE_URL}/agri-land-terrains`),
        fetch(`${API_BASE_URL}/agri-land-elephant-fences`),
        fetch(`${API_BASE_URL}/agri-land-wildlife-threats`),
        fetch(`${API_BASE_URL}/agri-land-boundary-fencings`),
        fetch(`${API_BASE_URL}/agri-land-farm-buildings`),
        fetch(`${API_BASE_URL}/agri-land-irrigation-techs`),
        fetch(`${API_BASE_URL}/agri-land-machinery-accesses`),
        fetch(`${API_BASE_URL}/agri-land-crops`),
        fetch(`${API_BASE_URL}/agri-land-access-roads`),
        fetch(`${API_BASE_URL}/agri-land-electricities`),
        fetch(`${API_BASE_URL}/agri-land-water-sources`)
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
      setLookupsLoaded(true);
    } catch (err) {
      console.error('Error fetching lookups:', err);
    }
  };

  useEffect(() => {
    fetchMasterLookups();
  }, []);

  // Debounce search input for real-time snappy typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync state to URL search parameters
  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (debouncedSearch) nextParams.set('search', debouncedSearch);
    if (selectedType && selectedType !== 'all') nextParams.set('type', selectedType);
    if (selectedDistrict && selectedDistrict !== 'all') nextParams.set('district', selectedDistrict);
    if (selectedDsd && selectedDsd !== 'all') nextParams.set('dsd', selectedDsd);
    if (selectedCategory && selectedCategory !== 'all') nextParams.set('category', selectedCategory);
    setSearchParams(nextParams, { replace: true });
  }, [debouncedSearch, selectedType, selectedDistrict, selectedDsd, selectedCategory]);

  // Whenever any filter changes, reset to page 1 & fetch immediately
  useEffect(() => {
    setCurrentPage(1);
    fetchLands(1);
  }, [debouncedSearch, selectedType, selectedDistrict, selectedDsd, selectedCategory]);

  // When page changes, fetch lands
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLands(page);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const fetchLands = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedType && selectedType !== 'all') params.append('dealTypeId', selectedType);
      if (selectedDistrict && selectedDistrict !== 'all') params.append('district', selectedDistrict);
      if (selectedDsd && selectedDsd !== 'all') params.append('dsd', selectedDsd);
      if (selectedCategory && selectedCategory !== 'all') params.append('landCategoryId', selectedCategory);

      // Public call to /api/agri-lands strictly returns only active & APPROVED lands
      const authHeaders: Record<string, string> = {};
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      // Public call to /api/agri-lands (with optional auth so user sees their own listings)
      const [agriRes, agroRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/agri-lands?${params.toString()}`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/agrolands?${params.toString()}`)
      ]);

      const combinedLands: AgroLand[] = [];
      let total = 0;
      let agriCount = 0;

      // 1. Process new AgriLands
      if (agriRes.status === 'fulfilled' && agriRes.value.ok) {
        const agriData = await agriRes.value.json();
        const rawAgriList = (agriData.data || []).filter((l: any) => l.approvalStatus === 'APPROVED' || !l.approvalStatus);
        agriCount = rawAgriList.length;
        rawAgriList.forEach((l: any) => {
          const cover = l.images?.find((img: any) => img.isPrimary) || l.images?.[0];
          const resolvedImage = cover?.imageUrl || cover?.url || l.image || l.imageUrl || (Array.isArray(l.images) && (typeof l.images[0] === 'string' ? l.images[0] : (l.images[0]?.imageUrl || l.images[0]?.url))) || null;

          // Full administrative location hierarchy (GND, DSD, District, Province)
          const locSiRaw = [
            l.location?.gramaNiladhariDivisionSi || l.gramaNiladhariDivisionSi,
            l.location?.divisionalSecretariatSi || l.divisionalSecretariatSi,
            l.location?.districtSi || l.districtSi,
            l.location?.provinceSi || l.provinceSi
          ].filter(Boolean);
          const locSiList = locSiRaw.filter((item, idx) => locSiRaw.indexOf(item) === idx);
          const locSiFormatted = locSiList.length > 0 ? locSiList.join(', ') : (l.locationSi || null);

          const locEnRaw = [
            l.location?.gramaNiladhariDivisionEn || l.gramaNiladhariDivisionEn,
            l.location?.divisionalSecretariatEn || l.divisionalSecretariatEn,
            l.location?.districtEn || l.districtEn,
            l.location?.provinceEn || l.provinceEn
          ].filter(Boolean);
          const locEnList = locEnRaw.filter((item, idx) => locEnRaw.indexOf(item) === idx);
          const locEnFormatted = locEnList.length > 0 ? locEnList.join(', ') : (l.location || 'Sri Lanka');

          // Full clean size formatting
          const sizePartsEn: string[] = [];
          if (l.acres && Number(l.acres) > 0) sizePartsEn.push(`${l.acres} Ac`);
          if (l.roods && Number(l.roods) > 0) sizePartsEn.push(`${l.roods} Rd`);
          if (l.perches && Number(l.perches) > 0) sizePartsEn.push(`${l.perches} P`);
          const fullSizeEn = sizePartsEn.length > 0
            ? sizePartsEn.join(' ')
            : (l.totalPerches ? `${l.totalPerches} Perches` : '');

          const sizePartsSi: string[] = [];
          if (l.acres && Number(l.acres) > 0) sizePartsSi.push(`අක්කර ${l.acres}`);
          if (l.roods && Number(l.roods) > 0) sizePartsSi.push(`රූඩ් ${l.roods}`);
          if (l.perches && Number(l.perches) > 0) sizePartsSi.push(`පර්චස් ${l.perches}`);
          const fullSizeSi = sizePartsSi.length > 0
            ? sizePartsSi.join(' ')
            : (l.totalPerches ? `පර්චස් ${l.totalPerches}` : null);

          combinedLands.push({
            id: l.id,
            title: l.titleEn || l.titleSi || l.title,
            titleSi: l.titleSi || null,
            slug: l.slug,
            description: l.additionalDetailsEn || null,
            descriptionSi: l.additionalDetailsSi || null,
            location: locEnFormatted,
            locationSi: locSiFormatted,
            districtEn: l.location?.districtEn || l.districtEn || null,
            districtSi: l.location?.districtSi || l.districtSi || null,
            dsdEn: l.location?.divisionalSecretariatEn || l.divisionalSecretariatEn || null,
            dsdSi: l.location?.divisionalSecretariatSi || l.divisionalSecretariatSi || null,
            size: fullSizeEn,
            sizeSi: fullSizeSi,
            price: Number(l.priceEn) || 0,
            priceFormatted: l.priceEn || l.priceSi,
            typeId: l.dealTypeId,
            type: l.dealType ? { id: l.dealType.id, name: l.dealType.nameEn, nameSi: l.dealType.nameSi } : undefined,
            categoryId: l.landCategoryId,
            category: l.landCategory ? { id: l.landCategory.id, name: l.landCategory.nameEn, nameSi: l.landCategory.nameSi } : undefined,
            contactNumber: l.whatsappNumber || '',
            image: resolvedImage,
            status: l.activeState ? 'Available' : 'Unavailable',
            approvalStatus: l.approvalStatus || 'APPROVED',
            createdById: l.createdById || null
          });
        });
        if (agriData.meta) {
          total = agriData.meta.total || rawAgriList.length;
          setTotalPages(agriData.meta.totalPages || 1);
        }
      }

      // 2. Process legacy AgroLands if any
      let agroAddedCount = 0;
      if (agroRes.status === 'fulfilled' && agroRes.value.ok) {
        const agroData = await agroRes.value.json();
        if (agroData.filters?.types && Array.isArray(agroData.filters.types)) {
          setLegacyTypes(agroData.filters.types);
        }
        const rawAgroList = agroData.data?.lands || agroData.data || agroData.lands || [];
        rawAgroList.forEach((l: any) => {
          if (!combinedLands.some((existing) => existing.id === l.id)) {
            // Apply client side matching for legacy lands
            let matches = true;

            // Search query filter
            if (debouncedSearch && debouncedSearch.trim()) {
              const q = debouncedSearch.trim().toLowerCase();
              const hasSearchMatch =
                Boolean(l.title && l.title.toLowerCase().includes(q)) ||
                Boolean(l.titleSi && l.titleSi.toLowerCase().includes(q)) ||
                Boolean(l.location && l.location.toLowerCase().includes(q)) ||
                Boolean(l.locationSi && l.locationSi.toLowerCase().includes(q)) ||
                Boolean(l.description && l.description.toLowerCase().includes(q)) ||
                Boolean(l.descriptionSi && l.descriptionSi.toLowerCase().includes(q));
              if (!hasSearchMatch) matches = false;
            }

            // District filter
            if (selectedDistrict && selectedDistrict !== 'all') {
              const d = selectedDistrict.toLowerCase();
              const distOpt = districtOptions.find((opt) => opt.value === selectedDistrict);
              const dSi = distOpt?.label?.toLowerCase();
              const hasDistrictMatch =
                Boolean(l.location && l.location.toLowerCase().includes(d)) ||
                Boolean(l.locationSi && l.locationSi.toLowerCase().includes(d)) ||
                Boolean(dSi && l.locationSi && l.locationSi.toLowerCase().includes(dSi)) ||
                Boolean(dSi && l.location && l.location.toLowerCase().includes(dSi));
              if (!hasDistrictMatch) matches = false;
            }

            // DSD filter
            if (selectedDsd && selectedDsd !== 'all') {
              const s = selectedDsd.toLowerCase();
              const dsdOpt = dsdOptions.find((opt) => opt.value === selectedDsd);
              const sSi = dsdOpt?.label?.toLowerCase();
              const hasDsdMatch =
                Boolean(l.location && l.location.toLowerCase().includes(s)) ||
                Boolean(l.locationSi && l.locationSi.toLowerCase().includes(s)) ||
                Boolean(sSi && l.locationSi && l.locationSi.toLowerCase().includes(sSi));
              if (!hasDsdMatch) matches = false;
            }

            // Category filter: legacy lands have no category
            if (selectedCategory && selectedCategory !== 'all') {
              matches = false;
            }

            // Deal Type filter
            if (selectedType && selectedType !== 'all') {
              const dtObj = dealTypes.find((dt) => dt.id === selectedType);
              const matchesType =
                l.typeId === selectedType ||
                l.type?.id === selectedType ||
                (dtObj && (
                  Boolean(l.type?.slug && dtObj.slug && l.type.slug.toLowerCase() === dtObj.slug.toLowerCase()) ||
                  Boolean(l.type?.name && dtObj.nameEn && l.type.name.toLowerCase() === dtObj.nameEn.toLowerCase()) ||
                  Boolean(l.type?.nameSi && dtObj.nameSi && l.type.nameSi === dtObj.nameSi)
                ));
              if (!matchesType) matches = false;
            }

            if (matches) {
              combinedLands.push({
                ...l,
                districtEn: l.location,
                districtSi: l.locationSi
              });
              agroAddedCount++;
            }
          }
        });
      }

      setLands(combinedLands);
      const computedTotal = (total > 0 ? total : agriCount) + agroAddedCount;
      setTotalCount(combinedLands.length === 0 ? 0 : Math.max(combinedLands.length, computedTotal));
    } catch (error) {
      console.error('Error fetching agro lands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddLand = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    await fetchMasterLookups();
    setIsSubmitModalOpen(true);
  };

  const handleSubmissionSuccess = () => {
    setIsSubmitModalOpen(false);
    setShowSuccessModal(true);
    fetchLands(currentPage);
  };

  // ── District Options from npm: sl-gnd-dsd-districts ──
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
    } catch (err) {
      console.error('Error loading districts:', err);
      return [{ value: 'all', label: isSinhala ? 'සියලු දිස්ත්‍රික්ක' : 'All Districts' }];
    }
  }, [isSinhala]);

  // ── DSD Options from npm: sl-gnd-dsd-districts based on selected District ──
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
    } catch (err) {
      console.error('Error loading DSDs:', err);
      return [{ value: 'all', label: isSinhala ? 'සියලු ප්‍රා. ලේ. කොට්ඨාස' : 'All DSD Divisions' }];
    }
  }, [selectedDistrict, isSinhala]);

  // ── Deal Type Options ──
  const dealTypeOptions = useMemo(() => {
    const list = [
      { value: 'all', label: isSinhala ? 'සියලු ගනුදෙනු වර්ග' : 'All Deal Types' },
      ...dealTypes.map((dt) => ({
        value: dt.id,
        label: isSinhala ? (dt.nameSi || dt.nameEn) : dt.nameEn
      }))
    ];

    legacyTypes.forEach((lt) => {
      const alreadyExists = list.some(
        (item) => item.value === lt.id || (lt.name && item.label.toLowerCase() === lt.name.toLowerCase())
      );
      if (!alreadyExists) {
        list.push({
          value: lt.id,
          label: isSinhala ? (lt.nameSi || lt.name) : lt.name
        });
      }
    });

    return list;
  }, [dealTypes, legacyTypes, isSinhala]);

  // ── Land Category Options ──
  const categoryOptions = useMemo(() => {
    return [
      { value: 'all', label: isSinhala ? 'සියලු ඉඩම් වර්ග' : 'All Categories' },
      ...categories.map((c) => ({
        value: c.id,
        label: isSinhala ? (c.nameSi || c.nameEn) : c.nameEn
      }))
    ];
  }, [categories, isSinhala]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    (selectedType && selectedType !== 'all') ||
    (selectedDistrict && selectedDistrict !== 'all') ||
    (selectedDsd && selectedDsd !== 'all') ||
    (selectedCategory && selectedCategory !== 'all')
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedType('all');
    setSelectedDistrict('all');
    setSelectedDsd('all');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  const pageKeywords = useMemo(() => {
    const list: string[] = [
      'Agro Lands Sri Lanka',
      'Agricultural land for sale',
      'කෘෂිකාර්මික ඉඩම්',
      'වගා ඉඩම්',
      'Aswanna Lands',
      'farm land for lease'
    ];
    if (selectedDistrict && selectedDistrict !== 'all') list.push(selectedDistrict);
    if (searchQuery.trim()) list.push(searchQuery.trim());
    return list.slice(0, 30).join(', ');
  }, [selectedDistrict, searchQuery]);

  const pageTitle = searchQuery.trim()
    ? `${searchQuery.trim()} - කෘෂිකාර්මික ඉඩම් | Agro Lands - Aswanna`
    : selectedDistrict && selectedDistrict !== 'all'
    ? `${selectedDistrict} කෘෂිකාර්මික ඉඩම් | Agro Lands in ${selectedDistrict} - Aswanna`
    : (isSinhala ? 'කෘෂිකාර්මික ඉඩම් | Agro Lands for Sale & Lease' : 'Agro Lands for Sale and Lease in Sri Lanka | Aswanna');

  const pageDesc = isSinhala
    ? 'වගාවට සුදුසු පොල්, තේ, කුරුඳු, එළවළු සහ වාණිජ කෘෂි ඉඩම් මිලදී ගැනීමට සහ බදු ගැනීමට සොයාගන්න. Aswanna Agro Lands.'
    : 'Browse agricultural lands for sale and lease across Sri Lanka. Coconut, tea, cinnamon, and commercial cultivation lands.';

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-28 sm:pb-32 lg:pb-16">
      <SEO
        title={pageTitle}
        description={pageDesc}
        keywords={pageKeywords}
        canonical={selectedDistrict !== 'all' ? `/agro-lands?district=${encodeURIComponent(selectedDistrict)}` : '/agro-lands'}
      />

      <PageHero
        title={t('agroLands.title', 'AGRO LANDS')}
        description={t('agroLands.desc', 'Find agricultural lands for sale and lease.')}
        image="https://images.unsplash.com/photo-1629731215450-4591e1d0ed53?w=1600&q=80"
        gradientColor="#006837"
        icon={MapPin}
        badgeBg="bg-[#006837]"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 mt-8">
        
        {/* Header Bar with Title, Count & Post Land Button */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-base sm:text-2xl font-bold text-gray-900 truncate">
              {isSinhala ? 'කෘෂිකාර්මික ඉඩම්' : 'Agricultural Lands'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold shrink-0">
              {totalCount}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenAddLand}
            className="inline-flex items-center justify-between gap-1.5 sm:gap-2.5 pl-3 sm:pl-5 pr-1 sm:pr-2 py-1 sm:py-2 rounded-full bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-gray-200/80 hover:border-emerald-300 text-gray-900 font-bold text-[11px] sm:text-sm shadow-[0_4px_16px_rgba(0,0,0,0.05),inset_0_1px_1.5px_rgba(255,255,255,1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer shrink-0"
          >
            <span className="truncate">{isSinhala ? 'ඉඩමක් ලැයිස්තුගත කරන්න' : 'Post Agri Land'}</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/80 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 shadow-2xs shrink-0">
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* ── Seamless Horizontal Filter Bar (matching Screenshot 2) ── */}
        <div className="space-y-3 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-12 lg:grid-cols-12 gap-2 sm:gap-3">
            
            {/* 1. Search Bar */}
            <div className="col-span-2 md:col-span-12 lg:col-span-4 relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={
                  isSinhala
                    ? 'ඉඩමේ නම, ප්‍රදේශය හෝ විස්තර සොයන්න...'
                    : 'Search land name, location or details...'
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

            {/* 2. Deal Type Dropdown */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2">
              <CustomDropdown
                value={selectedType}
                onChange={(val) => {
                  setSelectedType(val);
                  setCurrentPage(1);
                }}
                options={dealTypeOptions}
                placeholder={isSinhala ? 'සියලු ගනුදෙනු වර්ග' : 'All Deal Types'}
              />
            </div>

            {/* 3. District Dropdown (sl-gnd-dsd-districts) */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2">
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

            {/* 4. DSD Dropdown (sl-gnd-dsd-districts) */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2">
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

            {/* 5. Category Dropdown */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2">
              <CustomDropdown
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val);
                  setCurrentPage(1);
                }}
                options={categoryOptions}
                placeholder={isSinhala ? 'සියලු ඉඩම් වර්ග' : 'All Categories'}
              />
            </div>
          </div>

          {/* Active Filter Clear Row */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-gray-500 font-medium">
                {isSinhala ? 'ක්‍රියාකාරී පෙරහන් ක්‍රියාත්මකයි' : 'Filters applied'}
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

        {/* ── Content Section: Cards Grid (4 per row on desktop) ── */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <AgroLoader message={t('agroLands.loading', 'ඉඩම් තොරතුරු පූරණය වෙමින් පවතී...')} />
          </div>
        ) : lands.length === 0 ? (
          <div className="py-12 sm:py-16 text-center max-w-lg mx-auto space-y-4">
            <AgroLoader message="" className="scale-90 sm:scale-100" />
            <div className="space-y-1.5 pt-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {t('agroLands.noResults', 'ඉඩම් හමු නොවීය')}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                {isSinhala
                  ? 'ඔබ සෙවූ නිර්ණායකවලට ගැළපෙන කෘෂිකාර්මික ඉඩම් මේ මොහොතේ නොමැත. කරුණාකර පෙරහන් ඉවත් කර හෝ වෙනත් සෙවුම් වචනයක් යොදා නැවත උත්සාහ කරන්න.'
                  : 'No agricultural lands match your selected filters. Try clearing filters or using another keyword.'}
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
          <div className="space-y-10">
            {/* Grid: 2 cards per row on mobile/tablet, 3 on lg, 4 on xl */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5 lg:gap-6">
              {lands.map((land, index) => {
                const landTitle = isSinhala ? (land.titleSi || land.title) : land.title;
                const landTypeBadge = land.type
                  ? (isSinhala ? (land.type.nameSi || land.type.name) : land.type.name)
                  : (land.category ? (isSinhala ? (land.category.nameSi || land.category.name) : land.category.name) : undefined);
                const landLocation = isSinhala ? (land.locationSi || land.location) : land.location;
                const landPrice = formatDisplayPrice(land.priceFormatted || land.price, isSinhala);
                const landSize = isSinhala ? (land.sizeSi || land.size) : land.size;

                const isAvailable = land.status === 'Available';
                const statusBadge = (
                  <div className={`h-6 sm:h-7 inline-flex items-center gap-1 sm:gap-1.5 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 rounded-full shadow-xs ${
                    isAvailable ? 'bg-emerald-600/90 border border-emerald-400/40' : 'bg-red-600/90 border border-red-400/40'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse" />
                    <span className="truncate">
                      {isAvailable ? (isSinhala ? 'ලබාගත හැක' : 'AVAILABLE') : (isSinhala ? 'විකිණී ඇත' : 'UNAVAILABLE')}
                    </span>
                  </div>
                );

                return (
                  <div
                    key={land.id}
                    style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                    className="animate-card-pop h-full"
                  >
                    <Card
                      to={`/agro-lands/${land.slug || land.id}`}
                      image={land.image || 'https://images.unsplash.com/photo-1629731215450-4591e1d0ed53?w=800&q=80'}
                      badge={landTypeBadge}
                      topRightBadge={statusBadge}
                      icon={MapPin}
                      title={landTitle}
                      subtitle={landLocation}
                      titleClassName="text-xs sm:text-base font-bold text-[#143d4d] leading-snug mb-1 line-clamp-2"
                      meta={[
                        { icon: Tag, text: landPrice },
                        ...(landSize ? [{ icon: Maximize, text: landSize }] : []),
                        ...(landLocation ? [{ icon: MapPin, text: landLocation }] : [])
                      ]}
                      primaryAction={{
                        text: isSinhala ? 'විස්තර බලන්න' : 'View Details'
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Submission Form Modal */}
      {isSubmitModalOpen && (
        <PublicAgriLandPostModal
          isOpen={isSubmitModalOpen}
          onClose={() => {
            setIsSubmitModalOpen(false);
            setLandToEdit(null);
          }}
          onSuccess={handleSubmissionSuccess}
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
      )}

      {/* Success Notification Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 border border-emerald-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {isSinhala ? 'ඉඩම් ලැයිස්තුගත කිරීම සාර්ථකයි!' : 'Land Listing Submitted!'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isSinhala
                ? 'ඔබගේ ඉඩම් තොරතුරු සාර්ථකව පද්ධතියට එක් විය. අපගේ පරිපාලක (Admin) කණ්ඩායම විසින් එය පරීක්ෂා කර අනුමත (Approve) කළ පසු එය වෙබ් අඩවියේ ප්‍රසිද්ධියේ දිස්වනු ඇත.'
                : 'Your agricultural land listing has been submitted successfully for review. Once verified and approved by our administrator, it will be published on the public site.'}
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{isSinhala ? 'තත්ත්වය: අනුමැතිය අපේක්ෂිතයි (Pending Review)' : 'Status: Pending Administrator Approval'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-[#006837] hover:bg-[#00522c] text-white font-bold rounded-xl transition shadow-md cursor-pointer"
            >
              {isSinhala ? 'තේරුම් ගත්තා' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
