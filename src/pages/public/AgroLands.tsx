import { useState, useEffect } from 'react';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Maximize, Phone, Tag } from 'lucide-react';

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

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchLands();
  }, [debouncedSearch, selectedType, selectedLocation]);

  const fetchLands = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedType) params.append('type', selectedType);
      if (selectedLocation) params.append('location', selectedLocation);

      const response = await fetch(`${API_BASE_URL}/agrolands?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch agro lands');
      
      const data = await response.json();
      setLands(data.lands || []);
      setFilters(data.filters || { locations: [], types: [] });
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
      />
      
      <div className="container mx-auto px-4 lg:px-12 mt-12 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
              {t('plantFinder.filters', 'Filters')}
            </h3>
            
            {/* Type Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Type</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">{t('common.all', 'All')}</option>
                {filters.types.map(t => (
                  <option key={t.id} value={t.id}>{isSinhala ? (t.nameSi || t.name) : t.name}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Location</label>
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">{t('common.all', 'All')}</option>
                {filters.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
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
          <div className="relative mb-8">
            <input 
              type="text" 
              placeholder={t('plantFinder.searchPlaceholder', 'Search...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-shadow text-lg"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
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
              {lands.map(land => (
                <div key={land.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                  
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
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                        land.status === 'Available' ? 'bg-green-500/90 text-white' : 
                        land.status === 'Sold' ? 'bg-red-500/90 text-white' : 'bg-orange-500/90 text-white'
                      }`}>
                        {land.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-blue-600/90 text-white`}>
                        {isSinhala ? (land.type?.nameSi || land.type?.name) : land.type?.name}
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
          
        </div>
      </div>
    </div>
  );
}
