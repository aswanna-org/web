import { useState, useEffect, useMemo } from 'react';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Maximize, Phone, Tag, X, Plus, CheckCircle2, Clock } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import CustomDropdown from '../../components/ui/CustomDropdown';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { AgriLandFormModal } from '../../admin/components/agriLand/AgriLandFormModal';
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
  size: string;
  sizeSi: string | null;
  price: number;
  priceFormatted?: string | null;
  typeId: string;
  type?: Lookup;
  contactNumber: string;
  image: string | null;
  status: string;
}

interface Filters {
  locations: string[];
  types: Lookup[];
}

export default function AgroLands() {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const { isAuthenticated, token, openLoginModal } = useAuth();
  
  const [lands, setLands] = useState<AgroLand[]>([]);
  const [filters, setFilters] = useState<Filters>({ locations: [], types: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // User Submission Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Lookups for user submission
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
  const [lookupsLoaded, setLookupsLoaded] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      console.error('Error fetching lookups for submit modal:', err);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchLands(currentPage);
  }, [debouncedSearch, selectedType, selectedLocation, currentPage]);

  const fetchLands = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedType) params.append('type', selectedType);
      if (selectedLocation) params.append('location', selectedLocation);

      // Public call to /api/agri-lands strictly returns only active & APPROVED lands!
      const [agriRes, agroRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/agri-lands?${params.toString()}`),
        fetch(`${API_BASE_URL}/agrolands?${params.toString()}`)
      ]);

      const combinedLands: AgroLand[] = [];

      // 1. Process new AgriLands
      if (agriRes.status === 'fulfilled' && agriRes.value.ok) {
        const agriData = await agriRes.value.json();
        const rawAgriList = agriData.data || [];
        rawAgriList.forEach((l: any) => {
          const cover = l.images?.find((img: any) => img.isPrimary) || l.images?.[0];
          combinedLands.push({
            id: l.id,
            title: l.titleEn,
            titleSi: l.titleSi || null,
            slug: l.slug,
            description: l.additionalDetailsEn || null,
            descriptionSi: l.additionalDetailsSi || null,
            location: l.location?.districtEn ? `${l.location.districtEn}, ${l.location.provinceEn}` : 'Sri Lanka',
            locationSi: l.location?.districtSi ? `${l.location.districtSi}` : null,
            size: l.acres ? `${l.acres} A ${l.perches ? l.perches + ' P' : ''}` : (l.totalPerches ? `${l.totalPerches} Perches` : ''),
            sizeSi: l.acres ? `අක්කර ${l.acres}` : (l.totalPerches ? `පර්චස් ${l.totalPerches}` : null),
            price: Number(l.priceEn) || 0,
            priceFormatted: l.priceEn || l.priceSi,
            typeId: l.dealTypeId,
            type: l.dealType ? { id: l.dealType.id, name: l.dealType.nameEn, nameSi: l.dealType.nameSi } : undefined,
            contactNumber: l.whatsappNumber || '',
            image: cover?.imageUrl || null,
            status: l.activeState ? 'Available' : 'Unavailable'
          });
        });
        if (agriData.meta && combinedLands.length > 0) {
          setTotalPages(agriData.meta.totalPages || 1);
        }
      }

      // 2. Process legacy AgroLands
      if (agroRes.status === 'fulfilled' && agroRes.value.ok) {
        const agroData = await agroRes.value.json();
        const rawAgroList = agroData.data?.lands || agroData.data || agroData.lands || [];
        rawAgroList.forEach((l: any) => {
          if (!combinedLands.some((existing) => existing.id === l.id)) {
            combinedLands.push(l);
          }
        });
        setFilters(agroData.data?.filters || agroData.filters || { locations: [], types: [] });
      }

      setLands(combinedLands);
    } catch (error) {
      console.error('Error fetching agro lands:', error);
    } finally {
      setIsLoading(false);
    }
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

    if (selectedLocation) list.push(selectedLocation);
    if (selectedType) list.push(selectedType);
    if (searchQuery.trim()) list.push(searchQuery.trim());

    lands.forEach(l => {
      if (l.title) list.push(l.title);
      if (l.titleSi) list.push(l.titleSi);
      if (l.location) list.push(l.location);
      if (l.locationSi) list.push(l.locationSi);
    });

    return Array.from(new Set(list.filter(Boolean))).slice(0, 30).join(', ');
  }, [lands, selectedLocation, selectedType, searchQuery]);

  const pageTitle = searchQuery.trim() 
    ? `${searchQuery.trim()} - කෘෂිකාර්මික ඉඩම් | Agro Lands - Aswanna`
    : selectedLocation
    ? `${selectedLocation} කෘෂිකාර්මික ඉඩම් | Agro Lands in ${selectedLocation} - Aswanna`
    : (isSinhala ? 'කෘෂිකාර්මික ඉඩම් | Agro Lands for Sale & Lease' : 'Agro Lands for Sale and Lease in Sri Lanka | Aswanna');

  const pageDesc = selectedLocation
    ? (isSinhala 
        ? `${selectedLocation} ප්‍රදේශයේ වගාවට සුදුසු කෘෂිකාර්මික ඉඩම් මිලදී ගැනීමට සහ බදු ගැනීමට සොයාගන්න. Aswanna Agro Lands.`
        : `Explore prime agricultural and cultivation lands for sale or lease in ${selectedLocation}, Sri Lanka.`)
    : (isSinhala
        ? 'වගාවට සුදුසු පොල්, තේ, කුරුඳු, එළවළු සහ වාණිජ කෘෂි ඉඩම් මිලදී ගැනීමට සහ බදු ගැනීමට සොයාගන්න. Aswanna Agro Lands.'
        : 'Browse agricultural lands for sale and lease across Sri Lanka. Coconut, tea, cinnamon, and commercial cultivation lands.');

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      <SEO 
        title={pageTitle}
        description={pageDesc}
        keywords={pageKeywords}
        canonical={selectedLocation ? `/agro-lands?location=${encodeURIComponent(selectedLocation)}` : '/agro-lands'}
      />
      <PageHero 
        title={t('agroLands.title', 'AGRO LANDS')} 
        description={t('agroLands.desc', 'Find agricultural lands for sale and lease.')} 
        image="https://images.unsplash.com/photo-1629731215450-4591e1d0ed53?w=1600&q=80"
        gradientColor="#2b6cb0"
        icon={MapPin}
        badgeBg="bg-[#2b6cb0]"
        waveColor="text-gray-50"
      />
      
      <div className="container mx-auto px-4 lg:px-12 mt-12 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4 space-y-6 relative z-30">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
              {t('plantFinder.filters', 'Filters')}
            </h3>
            
            {/* Type Filter */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Type</label>
              <CustomDropdown
                value={selectedType}
                onChange={(val) => setSelectedType(val)}
                options={[
                  { value: '', label: t('common.all', 'All Types') },
                  ...filters.types.map(t => ({
                    value: t.id,
                    label: isSinhala ? (t.nameSi || t.name) : t.name
                  }))
                ]}
              />
            </div>

            {/* Location Filter */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Location</label>
              <CustomDropdown
                value={selectedLocation}
                onChange={(val) => setSelectedLocation(val)}
                options={[
                  { value: '', label: t('common.all', 'All Locations') },
                  ...filters.locations.map(loc => ({
                    value: loc,
                    label: loc
                  }))
                ]}
              />
            </div>

            {(selectedType || selectedLocation) && (
              <button 
                onClick={() => {
                  setSelectedType('');
                  setSelectedLocation('');
                }}
                className="w-full py-2.5 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors mt-4 text-sm border border-blue-100"
              >
                {t('plantFinder.clearFilters', 'Clear Filters')}
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full lg:w-3/4">
          
          {/* Post Land Action Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-sm">
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isSinhala ? 'ඔබේ කෘෂිකාර්මික ඉඩම Aswanna හි පළ කරන්න' : 'List Your Agricultural Land on Aswanna'}
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                {isSinhala 
                  ? 'ලොග් වී තොරතුරු ඇතුළත් කරන්න. Admin අනුමැතියෙන් පසු එය ප්‍රසිද්ධියේ පළ වේ.' 
                  : 'Submit your land details. Once approved by our admin, it will go live!'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddLand}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md hover:shadow-lg shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isSinhala ? 'ඉඩමක් ලැයිස්තුගත කරන්න' : 'Post Agri Land'}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6 group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder={t('plantFinder.searchPlaceholder', 'Search...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-full border border-gray-200/90 bg-gray-50/70 hover:bg-white focus:bg-white hover:border-emerald-500/60 focus:border-[#006837] focus:ring-3 focus:ring-[#006837]/15 outline-none transition-all duration-200 text-xs sm:text-sm text-gray-800 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          {/* Results Grid */}
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <AgroLoader message={t('agroLands.loading', 'ඉඩම් තොරතුරු පූරණය වෙමින් පවතී...')} />
            </div>
          ) : lands.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
              <MapPin className="mx-auto text-gray-300 mb-6" size={64} />
              <h3 className="text-2xl font-medium text-gray-700 mb-3">{t('agroLands.noResults', 'No lands found')}</h3>
              <p className="text-gray-500">{t('plantFinder.tryAdjusting', 'Try adjusting your search or filters to find what you are looking for.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {lands.map((land, index) => (
                <div 
                  key={land.id} 
                  style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                  className="animate-card-pop bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col"
                >
                  
                  <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
                    {land.image ? (
                      <img 
                        src={land.image} 
                        alt={land.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <MapPin size={48} className="mb-2 opacity-50" />
                      </div>
                    )}
                    
                    {/* Badges Container */}
                    <div className="absolute top-3.5 inset-x-3.5 flex items-start justify-between gap-2 z-10 pointer-events-none">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-blue-600/90 text-white pointer-events-auto min-w-0 max-w-full truncate"
                        title={isSinhala ? (land.type?.nameSi || land.type?.name) : land.type?.name}
                      >
                        {isSinhala ? (land.type?.nameSi || land.type?.name) : land.type?.name}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md pointer-events-auto shrink-0 ${
                        land.status === 'Available' ? 'bg-green-500/90 text-white' : 
                        land.status === 'Sold' ? 'bg-red-500/90 text-white' : 'bg-orange-500/90 text-white'
                      }`}>
                        {land.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col grow">
                    <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">
                      {isSinhala ? (land.titleSi || land.title) : land.title}
                    </h3>
                    
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                       <MapPin size={16} className="mr-1" />
                      <span className="line-clamp-1">{isSinhala ? (land.locationSi || land.location) : land.location}</span>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                      {isSinhala ? (land.descriptionSi || land.description) : land.description}
                    </p>
                    
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Tag size={18} />
                          </div>
                          <div>
                            <span className="block text-xs text-gray-500 font-medium">Price</span>
                            <span className="font-bold text-gray-800">
                              {land.priceFormatted ? land.priceFormatted : (land.price > 0 ? `Rs. ${land.price.toLocaleString()}` : 'Price on request')}
                            </span>
                          </div>
                        </div>

                        {land.size && (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                              <Maximize size={18} />
                            </div>
                            <div>
                              <span className="block text-xs text-gray-500 font-medium">Size</span>
                              <span className="font-bold text-gray-800">{isSinhala ? (land.sizeSi || land.size) : land.size}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {land.contactNumber ? (
                          <a
                            href={`https://wa.me/${land.contactNumber.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 transition"
                          >
                            <Phone size={16} className="text-green-600" />
                            <span className="font-semibold">{land.contactNumber}</span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Phone size={16} />
                            <span>Contact on request</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
          
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
      </div>

      {/* User Submission Form Modal */}
      {isSubmitModalOpen && (
        <AgriLandFormModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onSuccess={handleSubmissionSuccess}
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
