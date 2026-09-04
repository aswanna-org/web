import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDistricts } from 'sl-gnd-dsd-districts';
import type { District } from 'sl-gnd-dsd-districts';
import { MapPin, Building, Search, Phone, Mail, ArrowLeft, User, ArrowRight } from 'lucide-react';
import PageHero from '../../components/public/PageHero';

interface ASC {
  id: string;
  ascId: string;
  name: string;
  nameSi: string | null;
  province: string;
  district: string;
  officePhone: string | null;
  mobilePhone: string | null;
  email: string | null;
  address: string | null;
  addressSi: string | null;
  googleMapsUrl: string | null;
  officerInCharge: string | null;
  officerInChargeSi: string | null;
  officerDesignation: string | null;
  officerDesignationSi: string | null;
}

export default function GovijanaSewa() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [stats, setStats] = useState<Record<string, number>>({});
  const [districts, setDistricts] = useState<District[]>([]);
  
  // Navigation State
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedASC, setSelectedASC] = useState<ASC | null>(null);
  
  // Centers State
  const [centers, setCenters] = useState<ASC[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load static districts and fetch stats
    setDistricts(getDistricts());
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/asc/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleDistrictSelect = async (district: District) => {
    setSelectedDistrict(district);
    setSelectedASC(null);
    setSearchQuery('');
    
    // Fetch centers for this district
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/asc?district=${encodeURIComponent(district.nameEn)}`);
      if (res.ok) {
        const data = await res.json();
        setCenters(data);
      }
    } catch (err) {
      console.error('Failed to fetch centers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDistricts = () => {
    setSelectedDistrict(null);
    setSelectedASC(null);
  };

  const handleBackToCenters = () => {
    setSelectedASC(null);
  };

  const filteredCenters = centers.filter(center => 
    (center.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) || 
    (center.nameSi?.includes(searchQuery) || false)
  );

  // Group districts by province for better display if needed, but the screenshot just lists them.
  // We'll just display them as cards as requested.

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      <PageHero 
        title={isSinhala ? "ගොවිජන සේවා තොරතුරු පද්ධතිය" : "Agrarian Services Information System"} 
        description={isSinhala ? "දිවයින පුරා පිහිටි ගොවිජන සේවා මධ්‍යස්ථාන වල තොරතුරු" : "Information on Agrarian Service Centers across the island."} 
        image="https://images.unsplash.com/photo-1592982537447-6f232490287b?w=1600&q=80"
        gradientColor="#0f5132"
      />

      <div className="container mx-auto px-4 lg:px-12 mt-12">
        
        {/* VIEW 1: Districts List */}
        {!selectedDistrict && !selectedASC && (
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Left Sidebar */}
            <div className="w-full lg:w-1/3 flex flex-col items-start lg:sticky lg:top-32 h-fit">
              <h2 className="text-[3.5rem] lg:text-[4rem] font-bold text-[#143d4d] leading-[1.1] mb-12 tracking-tight whitespace-pre-line">
                {isSinhala ? 'දිස්ත්‍රික්කය\nතෝරන්න' : 'Select a\nDistrict'}
              </h2>
              <div className="flex flex-col items-start border-t-2 border-[var(--color-primary)] pt-6 w-full max-w-[200px]">
                <p className="text-xs font-bold text-[#143d4d] tracking-widest uppercase mb-2">Total coverage</p>
                <div className="text-[var(--color-primary)] text-3xl font-bold">
                  {districts.length}
                </div>
                <p className="text-gray-500 font-medium">Districts nationwide</p>
              </div>
            </div>

            {/* Right List */}
            <div className="w-full lg:w-2/3 flex flex-col">
              {districts.map((district) => (
                <div key={district.id} className="border-b border-gray-200 flex flex-col">
                  <div
                    className="py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group cursor-pointer"
                    onClick={() => handleDistrictSelect(district)}
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] mb-3">
                        {district.provinceEn} PROVINCE
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-[#143d4d] mb-3 tracking-tight group-hover:text-[var(--color-primary)] transition-colors">
                        {isSinhala ? district.nameSi : district.nameEn}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium tracking-wide flex items-center gap-2">
                        <Building size={16} />
                        {stats[district.nameEn] || 0} {isSinhala ? 'මධ්‍යස්ථාන' : 'Agrarian Service Centers'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                      <button
                        className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-300 hidden sm:flex shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white group-hover:border-[var(--color-primary)] text-gray-400"
                      >
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: Centers List in a District */}
        {selectedDistrict && !selectedASC && (
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Left Sidebar */}
            <div className="w-full lg:w-1/3 flex flex-col items-start lg:sticky lg:top-32 h-fit">
              <button 
                onClick={handleBackToDistricts}
                className="flex items-center text-gray-500 hover:text-[var(--color-primary)] transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
              >
                <ArrowLeft size={16} className="mr-2" /> 
                {isSinhala ? 'සියලුම දිස්ත්‍රික්ක වෙත ආපසු' : 'Back to Districts'}
              </button>
              
              <h2 className="text-[3.5rem] lg:text-[4rem] font-bold text-[#143d4d] leading-[1.1] mb-6 tracking-tight">
                {isSinhala ? selectedDistrict.nameSi : selectedDistrict.nameEn}
              </h2>
              <p className="text-xl text-gray-500 font-medium mb-12">
                {isSinhala ? selectedDistrict.nameEn : selectedDistrict.nameSi}
              </p>

              <div className="w-full relative mb-12">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all text-gray-700 shadow-sm"
                  placeholder={isSinhala ? 'මධ්‍යස්ථානයේ නමින් සොයන්න...' : 'Search center by name...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col items-start border-t-2 border-[var(--color-primary)] pt-6 w-full max-w-[200px]">
                <p className="text-xs font-bold text-[#143d4d] tracking-widest uppercase mb-2">Total centers</p>
                <div className="text-[var(--color-primary)] text-3xl font-bold">
                  {filteredCenters.length}
                </div>
              </div>
            </div>

            {/* Right List */}
            <div className="w-full lg:w-2/3 flex flex-col pt-8 lg:pt-0">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-12 h-12 border-4 border-emerald-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
                </div>
              ) : filteredCenters.length === 0 ? (
                <div className="w-full py-20 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center mt-4">
                  <Search className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-[#143d4d] mb-2">{isSinhala ? 'මධ්‍යස්ථාන කිසිවක් හමු නොවීය' : 'No centers found'}</h3>
                </div>
              ) : (
                filteredCenters.map((center) => (
                  <div key={center.id} className="border-b border-gray-200 flex flex-col">
                    <div
                      className="py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group cursor-pointer"
                      onClick={() => setSelectedASC(center)}
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] mb-3">
                          ASC ID: {center.ascId}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-bold text-[#143d4d] mb-3 tracking-tight group-hover:text-[var(--color-primary)] transition-colors">
                          {isSinhala ? (center.nameSi || center.name) : center.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium tracking-wide flex items-center gap-3">
                          <User size={16} />
                          {isSinhala ? (center.officerInChargeSi || center.officerInCharge || 'තොරතුරු නොමැත') : (center.officerInCharge || 'Officer not assigned')}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <button
                          className="px-8 py-4 bg-[var(--color-primary)]/80 hover:bg-[var(--color-primary)] border border-[var(--color-primary)]/50 backdrop-blur-md flex items-center justify-center text-white font-bold rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 uppercase tracking-wider shrink-0 w-full sm:w-auto"
                        >
                          View Details <ArrowRight size={16} className="ml-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: Center Detail */}
        {selectedDistrict && selectedASC && (
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Left Sidebar */}
            <div className="w-full lg:w-1/3 flex flex-col items-start lg:sticky lg:top-32 h-fit">
              <button 
                onClick={handleBackToCenters}
                className="flex items-center text-gray-500 hover:text-[var(--color-primary)] transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
              >
                <ArrowLeft size={16} className="mr-2" /> 
                {isSinhala ? 'මධ්‍යස්ථාන ලැයිස්තුව වෙත ආපසු' : 'Back to Centers'}
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-6">
                <MapPin size={12} />
                {isSinhala ? `${selectedDistrict.nameSi} දිස්ත්‍රික්කය` : `${selectedDistrict.nameEn} District`}
              </div>
              
              <h2 className="text-[3rem] lg:text-[3.5rem] font-bold text-[#143d4d] leading-[1.1] mb-6 tracking-tight">
                {isSinhala ? (selectedASC.nameSi || selectedASC.name) : selectedASC.name}
              </h2>
              <p className="text-xl text-gray-500 font-medium mb-12">
                {isSinhala ? selectedASC.name : selectedASC.nameSi}
              </p>

              <div className="flex flex-col items-start border-t-2 border-[var(--color-primary)] pt-6 w-full max-w-[200px]">
                <p className="text-xs font-bold text-[#143d4d] tracking-widest uppercase mb-2">ASC ID</p>
                <div className="text-[var(--color-primary)] text-3xl font-bold font-mono">
                  {selectedASC.ascId}
                </div>
              </div>
            </div>

            {/* Right Details */}
            <div className="w-full lg:w-2/3 flex flex-col pt-8 lg:pt-0">
              
              {/* Officer */}
              <div className="border-b border-gray-200 py-8 flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <User size={24} className="text-gray-400" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] mb-2 block">
                    {isSinhala ? 'භාරකාර නිලධාරී' : 'ADO IN-CHARGE'}
                  </span>
                  <h3 className="text-2xl font-bold text-[#143d4d] mb-2 tracking-tight">
                    {isSinhala ? (selectedASC.officerInChargeSi || selectedASC.officerInCharge || 'තොරතුරු නොමැත') : (selectedASC.officerInCharge || 'Officer not assigned')}
                  </h3>
                  <p className="text-gray-500 font-medium">
                    {isSinhala ? (selectedASC.officerDesignationSi || selectedASC.officerDesignation || 'තනතුර නොමැත') : (selectedASC.officerDesignation || 'Designation not assigned')}
                  </p>
                </div>
              </div>

              {/* Contacts */}
              <div className="border-b border-gray-200 py-8 flex flex-col gap-6">
                <span className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em]">
                  {isSinhala ? 'සම්බන්ධතා තොරතුරු' : 'OFFICIAL CONTACTS'}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {selectedASC.officePhone && (
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-500 font-medium mb-1">{isSinhala ? 'කාර්යාලය' : 'Office Phone'}</p>
                      <a href={`tel:${selectedASC.officePhone.replace(/\D/g, '')}`} className="text-xl font-bold text-[#143d4d] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
                        <Phone size={18} /> {selectedASC.officePhone}
                      </a>
                    </div>
                  )}

                  {selectedASC.mobilePhone && (
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-500 font-medium mb-1">{isSinhala ? 'පෞද්ගලික / WhatsApp' : 'Mobile / WhatsApp'}</p>
                      <a href={`https://wa.me/94${selectedASC.mobilePhone.replace(/\D/g, '').substring(1)}`} target="_blank" rel="noreferrer" className="text-xl font-bold text-[#143d4d] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
                        <Phone size={18} /> {selectedASC.mobilePhone}
                      </a>
                    </div>
                  )}

                  {selectedASC.email && (
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-500 font-medium mb-1">{isSinhala ? 'විද්‍යුත් තැපෑල' : 'Email Address'}</p>
                      <a href={`mailto:${selectedASC.email}`} className="text-lg font-bold text-[#143d4d] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
                        <Mail size={18} /> {selectedASC.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="py-8 flex flex-col gap-6">
                <span className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em]">
                  {isSinhala ? 'ස්ථානය සහ ලිපිනය' : 'LOCATION & ADDRESS'}
                </span>
                
                <p className="text-xl font-medium text-[#143d4d] leading-relaxed whitespace-pre-line mb-4">
                  {isSinhala ? (selectedASC.addressSi || selectedASC.address) : selectedASC.address}
                </p>

                {selectedASC.googleMapsUrl && (
                  <a 
                    href={selectedASC.googleMapsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)] text-[var(--color-primary)] hover:text-white font-bold rounded-lg transition-all duration-300 w-fit uppercase tracking-wider"
                  >
                    <MapPin size={20} />
                    {isSinhala ? 'Google Maps හි විවෘත කරන්න' : 'Open in Google Maps'}
                  </a>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
