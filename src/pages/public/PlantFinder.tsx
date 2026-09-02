import { useState, useEffect } from 'react';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Sprout, MapPin, Layers, Clock } from 'lucide-react';

interface Lookup {
  id: string;
  name: string;
  nameSi: string | null;
}

interface Plant {
  id: string;
  name: string;
  sinhalaName: string | null;
  slug: string;
  description: string | null;
  sinhalaDescription: string | null;
  climaticZoneId: string | null;
  climaticZone?: Lookup;
  soilTypeId: string | null;
  soilType?: Lookup;
  harvestTimeId: string | null;
  harvestTime?: Lookup;
  image: string | null;
}

interface Filters {
  climaticZones: Lookup[];
  soilTypes: Lookup[];
  harvestTimes: Lookup[];
}

export default function PlantFinder() {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  
  const [plants, setPlants] = useState<Plant[]>([]);
  const [availableFilters, setAvailableFilters] = useState<Filters>({
    climaticZones: [],
    soilTypes: [],
    harvestTimes: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Active Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedSoil, setSelectedSoil] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPlants();
  }, [searchQuery, selectedZone, selectedSoil, selectedTime]);

  const fetchPlants = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (selectedZone) queryParams.append('climaticZone', selectedZone);
      if (selectedSoil) queryParams.append('soilType', selectedSoil);
      if (selectedTime) queryParams.append('harvestTime', selectedTime);
      
      const res = await fetch(`${API_BASE_URL}/plants?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPlants(data.plants);
        setAvailableFilters(data.filters);
      }
    } catch (err) {
      console.error('Failed to fetch plants', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <PageHero 
        title={t('plantFinder.title', 'Plant Finder')} 
        description={t('plantFinder.desc', 'Find the best plants for your climatic zone and soil type.')} 
        image="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1600&q=80"
        gradientColor="#2e7d32"
      />
      
      <div className="container mx-auto px-4 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <div className="w-full lg:w-1/4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Filter size={24} className="text-green-600" />
                {t('plantFinder.filters', 'Filters')}
              </h3>
              
              <div className="space-y-6">
                {/* Climatic Zone Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-green-600"/>
                    {t('plantFinder.climaticZone', 'Climatic Zone')}
                  </label>
                  <select 
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-gray-50"
                  >
                    <option value="">{t('plantFinder.all', 'All')}</option>
                    {availableFilters.climaticZones.map(zone => (
                      <option key={zone.id} value={zone.id}>{isSinhala ? (zone.nameSi || zone.name) : zone.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Soil Type Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Layers size={16} className="text-green-600"/>
                    {t('plantFinder.soilType', 'Soil Type')}
                  </label>
                  <select 
                    value={selectedSoil}
                    onChange={(e) => setSelectedSoil(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-gray-50"
                  >
                    <option value="">{t('plantFinder.all', 'All')}</option>
                    {availableFilters.soilTypes.map(soil => (
                      <option key={soil.id} value={soil.id}>{isSinhala ? (soil.nameSi || soil.name) : soil.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Harvest Time Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-green-600"/>
                    {t('plantFinder.harvestTime', 'Harvest Time')}
                  </label>
                  <select 
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-gray-50"
                  >
                    <option value="">{t('plantFinder.all', 'All')}</option>
                    {availableFilters.harvestTimes.map(time => (
                      <option key={time.id} value={time.id}>{isSinhala ? (time.nameSi || time.name) : time.name}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={() => {
                    setSelectedZone('');
                    setSelectedSoil('');
                    setSelectedTime('');
                    setSearchQuery('');
                  }}
                  className="w-full py-3 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg font-medium transition-colors"
                >
                  {t('plantFinder.clearFilters', 'Clear Filters')}
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            
            {/* Search Bar */}
            <div className="mb-8 relative">
              <input 
                type="text" 
                placeholder={t('plantFinder.searchPlaceholder', 'Search plants by name or description...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 shadow-sm transition-shadow text-lg"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            </div>
            
            {/* Results Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            ) : plants.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                <Sprout className="mx-auto text-gray-300 mb-6" size={64} />
                <h3 className="text-2xl font-medium text-gray-700 mb-3">{t('plantFinder.noResults', 'No plants found')}</h3>
                <p className="text-gray-500">{t('plantFinder.tryAdjusting', 'Try adjusting your search or filters to find what you are looking for.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {plants.map(plant => (
                  <div key={plant.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                    <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
                      {plant.image ? (
                        <img 
                          src={plant.image} 
                          alt={plant.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <Sprout size={48} className="mb-2 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col grow">
                      <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">
                        {isSinhala ? (plant.sinhalaName || plant.name) : plant.name}
                      </h3>
                      
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                        {isSinhala ? (plant.sinhalaDescription || plant.description) : plant.description}
                      </p>
                      
                      <div className="mt-auto space-y-3 pt-4 border-t border-gray-50">
                        {plant.climaticZone && (
                          <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-green-600 mt-0.5 shrink-0" />
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700 block">{t('plantFinder.climaticZone', 'Climatic Zone')}</span>
                              <span className="text-gray-600">{isSinhala ? (plant.climaticZone.nameSi || plant.climaticZone.name) : plant.climaticZone.name}</span>
                            </div>
                          </div>
                        )}
                        {plant.soilType && (
                          <div className="flex items-start gap-3">
                            <Layers size={18} className="text-green-600 mt-0.5 shrink-0" />
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700 block">{t('plantFinder.soilType', 'Soil Type')}</span>
                              <span className="text-gray-600">{isSinhala ? (plant.soilType.nameSi || plant.soilType.name) : plant.soilType.name}</span>
                            </div>
                          </div>
                        )}
                        {plant.harvestTime && (
                          <div className="flex items-start gap-3">
                            <Clock size={18} className="text-green-600 mt-0.5 shrink-0" />
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700 block">{t('plantFinder.harvestTime', 'Harvest Time')}</span>
                              <span className="text-gray-600">{isSinhala ? (plant.harvestTime.nameSi || plant.harvestTime.name) : plant.harvestTime.name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
