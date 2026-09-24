import { useState, useEffect } from 'react';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Maximize, Phone, Tag, X } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import CustomDropdown from '../../components/ui/CustomDropdown';

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

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

      const response = await fetch(`${API_BASE_URL}/agrolands?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch agro lands');
      
      const data = await response.json();
      setLands(data.data?.lands || data.lands || []);
      setFilters(data.data?.filters || data.filters || { locations: [], types: [] });
      if (data.meta) {
        setTotalPages(data.meta.totalPages);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
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
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
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
                            <span className="font-bold text-gray-800">Rs. {land.price.toLocaleString()}</span>
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
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone size={16} className="text-green-600" />
                          <span className="font-semibold">{land.contactNumber}</span>
                        </div>
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
    </div>
  );
}
