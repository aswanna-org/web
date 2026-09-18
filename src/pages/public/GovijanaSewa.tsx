import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDistricts } from 'sl-gnd-dsd-districts';
import type { District } from 'sl-gnd-dsd-districts';
import {
  MapPin, Building, Search, Phone, Mail, User, StickyNote,
  ExternalLink, ChevronDown, ChevronUp, Users, MessageSquare,
  Check, Globe, Compass, X, ArrowRight
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';

export interface AscOfficerItem {
  id?: string;
  name: string;
  nameSi?: string | null;
  position: string;
  positionSi?: string | null;
  phone?: string | null;
  email?: string | null;
  isPrimary?: boolean;
  order?: number;
}

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
  officers?: AscOfficerItem[] | null;
  additionalOfficers?: AscOfficerItem[] | string | null;
  specialNote?: string | null;
  specialNoteSi?: string | null;
}

export default function GovijanaSewa() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [stats, setStats] = useState<Record<string, number>>({});
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  
  // Custom Dropdown Open States
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');

  const provinceDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);

  // Centers State
  const [centers, setCenters] = useState<ASC[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCenterId, setExpandedCenterId] = useState<string | null>(null);

  useEffect(() => {
    const dList = getDistricts();
    setDistricts(dList);
    fetchStats();

    // Default to the first district or load all
    if (dList.length > 0) {
      setSelectedDistrictName(dList[0].nameEn);
      fetchCentersForDistrict(dList[0].nameEn);
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(event.target as Node)) {
        setIsProvinceOpen(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target as Node)) {
        setIsDistrictOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const fetchCentersForDistrict = async (districtName: string) => {
    setIsLoading(true);
    try {
      const url = districtName
        ? `${API_BASE_URL}/asc?district=${encodeURIComponent(districtName)}&limit=200`
        : `${API_BASE_URL}/asc?limit=200`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        setCenters(items);
      } else {
        setCenters([]);
      }
    } catch (err) {
      console.error('Failed to fetch centers:', err);
      setCenters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrictName(districtName);
    setSearchQuery('');
    setExpandedCenterId(null);
    setIsDistrictOpen(false);
    fetchCentersForDistrict(districtName);
  };

  const provinces = useMemo(() => {
    const set = new Set<string>();
    districts.forEach(d => {
      if (d.provinceEn) set.add(d.provinceEn);
    });
    return ['All', ...Array.from(set)];
  }, [districts]);

  const filteredDistricts = useMemo(() => {
    let list = districts;
    if (selectedProvince !== 'All') {
      list = list.filter(d => d.provinceEn === selectedProvince);
    }
    if (districtSearchQuery.trim()) {
      const q = districtSearchQuery.toLowerCase();
      list = list.filter(d => 
        (d.nameEn || '').toLowerCase().includes(q) || 
        (d.nameSi || '').includes(q)
      );
    }
    return list;
  }, [districts, selectedProvince, districtSearchQuery]);

  const currentDistrictObj = districts.find(d => d.nameEn === selectedDistrictName);

  const filteredCenters = useMemo(() => {
    if (!searchQuery.trim()) return centers;
    const q = searchQuery.toLowerCase();
    return centers.filter(center => {
      const nameEn = (center.name || '').toLowerCase();
      const nameSi = (center.nameSi || '').toLowerCase();
      const ascId = (center.ascId || '').toLowerCase();
      const officer = (center.officerInCharge || '').toLowerCase();
      const town = (center.address || '').toLowerCase();

      // Also search inside officers list
      const officersList = Array.isArray(center.officers) ? center.officers : [];
      const officerMatch = officersList.some(o => (o.name || '').toLowerCase().includes(q) || (o.position || '').toLowerCase().includes(q));

      return nameEn.includes(q) || nameSi.includes(q) || ascId.includes(q) || officer.includes(q) || town.includes(q) || officerMatch;
    });
  }, [centers, searchQuery]);

  const extractOfficers = (center: ASC): { primary: AscOfficerItem | null; additional: AscOfficerItem[] } => {
    let list: AscOfficerItem[] = [];
    if (center.officers && Array.isArray(center.officers) && center.officers.length > 0) {
      list = center.officers;
    } else if (center.additionalOfficers) {
      if (Array.isArray(center.additionalOfficers)) {
        list = center.additionalOfficers;
      } else if (typeof center.additionalOfficers === 'string') {
        try {
          const parsed = JSON.parse(center.additionalOfficers);
          if (Array.isArray(parsed)) list = parsed;
        } catch (e) {
          // ignore
        }
      }
    }

    const primary = list.find(o => o.isPrimary) || (list.length > 0 && !center.officerInCharge ? list[0] : null);
    const additional = list.filter(o => !o.isPrimary && o !== primary);

    return { primary, additional };
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/60 pb-24">
      {/* ── Page Hero ── */}
      <PageHero 
        title={isSinhala ? "ගොවිජන සේවා තොරතුරු පද්ධතිය" : "Agrarian Services Information System"} 
        description={isSinhala ? "දිවයින පුරා පිහිටි සියලුම ගොවිජන සේවා මධ්‍යස්ථාන සහ නිලධාරීන්ගේ තොරතුරු එකම තැනකින්" : "Directory of Agrarian Service Centers (ASC), appointed officers, and agricultural support contacts across Sri Lanka"} 
        image="https://images.unsplash.com/photo-1592982537447-6f232490287b?w=1600&q=80"
        gradientColor="#0f5132"
      />

      <div className="container mx-auto px-4 lg:px-8 mt-8">
        
        {/* ── Custom Styled Search & Filter Box ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/90 p-5 sm:p-7 relative z-30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
                <Building size={16} />
                <span>{isSinhala ? 'දිවයින පුරා ගොවිජන සේවා මධ්‍යස්ථාන' : 'Islandwide Agrarian Centers'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {isSinhala ? 'ගොවිජන සේවා මධ්‍යස්ථානයක් තෝරන්න' : 'Find Your Local Agrarian Center'}
              </h2>
            </div>

            <div className="text-xs font-semibold px-3.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 w-fit flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{filteredCenters.length} {isSinhala ? 'මධ්‍යස්ථාන ලැයිස්තුගතයි' : 'Centers Listed'}</span>
            </div>
          </div>

          {/* Styled Custom Dropdown Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Custom Province Dropdown */}
            <div className="relative" ref={provinceDropdownRef}>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Globe size={13} className="text-emerald-700" />
                <span>{isSinhala ? 'පළාත (Province)' : 'Province'}</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsProvinceOpen(!isProvinceOpen);
                  setIsDistrictOpen(false);
                }}
                className={`w-full px-4 py-3 bg-gray-50/80 hover:bg-white border rounded-2xl text-left flex items-center justify-between gap-2 text-sm font-semibold transition-all cursor-pointer ${
                  isProvinceOpen
                    ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-white shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
                    <Compass size={14} />
                  </div>
                  <span className="text-gray-900 truncate">
                    {selectedProvince === 'All'
                      ? (isSinhala ? 'සියලු පළාත් (All Provinces)' : 'All Provinces')
                      : `${selectedProvince} Province`}
                  </span>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                    isProvinceOpen ? 'rotate-180 text-emerald-700' : ''
                  }`}
                />
              </button>

              {/* Province Dropdown Popover */}
              {isProvinceOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {provinces.map(prov => {
                      const isSelected = selectedProvince === prov;
                      return (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => {
                            setSelectedProvince(prov);
                            setIsProvinceOpen(false);
                            const matching = prov === 'All' ? districts : districts.filter(d => d.provinceEn === prov);
                            if (matching.length > 0) {
                              handleDistrictChange(matching[0].nameEn);
                            }
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-950 font-bold'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-transparent'}`} />
                            <span className="truncate">
                              {prov === 'All' ? (isSinhala ? 'සියලු පළාත් (All Provinces)' : 'All Provinces') : `${prov} Province`}
                            </span>
                          </div>
                          {isSelected && <Check size={14} className="text-emerald-700 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Custom District Dropdown */}
            <div className="relative" ref={districtDropdownRef}>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin size={13} className="text-emerald-700" />
                <span>{isSinhala ? 'දිස්ත්‍රික්කය (District)' : 'District'}</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsDistrictOpen(!isDistrictOpen);
                  setIsProvinceOpen(false);
                  setDistrictSearchQuery('');
                }}
                className={`w-full px-4 py-3 bg-gray-50/80 hover:bg-white border rounded-2xl text-left flex items-center justify-between gap-2 text-sm font-semibold transition-all cursor-pointer ${
                  isDistrictOpen
                    ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-white shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="truncate">
                    <span className="text-gray-900 font-bold">
                      {isSinhala ? (currentDistrictObj?.nameSi || selectedDistrictName) : selectedDistrictName}
                    </span>
                    {currentDistrictObj && (
                      <span className="text-xs text-gray-400 ml-1.5 font-normal">
                        ({isSinhala ? currentDistrictObj.nameEn : currentDistrictObj.nameSi})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {stats[selectedDistrictName] || 0}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${
                      isDistrictOpen ? 'rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </div>
              </button>

              {/* District Dropdown Popover */}
              {isDistrictOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 w-full min-w-[280px]">
                  {/* Search inside district list */}
                  <div className="relative mb-2 px-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder={isSinhala ? "දිස්ත්‍රික්කය සොයන්න..." : "Search district..."}
                      value={districtSearchQuery}
                      onChange={e => setDistrictSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                    {filteredDistricts.length === 0 ? (
                      <div className="py-4 text-center text-xs text-gray-400">
                        {isSinhala ? 'දිස්ත්‍රික්ක හමු නොවීය' : 'No districts found'}
                      </div>
                    ) : (
                      filteredDistricts.map(dist => {
                        const isSelected = selectedDistrictName === dist.nameEn;
                        const count = stats[dist.nameEn] || 0;
                        return (
                          <button
                            key={dist.id}
                            type="button"
                            onClick={() => handleDistrictChange(dist.nameEn)}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-950 font-bold'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-transparent'}`} />
                              <span className="truncate">
                                {isSinhala ? `${dist.nameSi} (${dist.nameEn})` : dist.nameEn}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                {count} {isSinhala ? 'මධ්‍යස්ථාන' : 'Centers'}
                              </span>
                              {isSelected && <Check size={14} className="text-emerald-700" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Styled Live Search Box */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Search size={13} className="text-emerald-700" />
                <span>{isSinhala ? 'සෙවුම (Quick Search)' : 'Quick Search'}</span>
              </label>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center pointer-events-none">
                  <Search size={13} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isSinhala ? "මධ්‍යස්ථානය, නගරය, නිලධාරී, ASC ID..." : "Center, town, officer, ASC ID..."}
                  className="w-full pl-12 pr-10 py-3 bg-gray-50/80 hover:bg-white focus:bg-white border border-gray-200 focus:border-emerald-600 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all placeholder:text-gray-400 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Centers Results Header ── */}
        <div className="mt-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="text-emerald-700" size={20} />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isSinhala
                  ? `${currentDistrictObj?.nameSi || selectedDistrictName} දිස්ත්‍රික්කයේ ගොවිජන සේවා මධ්‍යස්ථාන`
                  : `Agrarian Service Centers in ${selectedDistrictName} District`}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-7">
              {isSinhala
                ? `මධ්‍යස්ථාන ${filteredCenters.length} ක් හමු විය. ඇමතුම් ලබාගැනීමට හෝ ලිපිනය බැලීමට කාඩ්පත ක්ලික් කරන්න.`
                : `Showing ${filteredCenters.length} centers. Click on any center to view full officer staff & map location.`}
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 shrink-0 w-fit">
            {filteredCenters.length} {isSinhala ? 'මධ්‍යස්ථාන' : 'Centers Listed'}
          </div>
        </div>

        {/* ── Centers Grid / List (3 per row on Desktop) ── */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">
              {isSinhala ? 'මධ්‍යස්ථාන තොරතුරු පූරණය වෙමින් පවතී...' : 'Loading agrarian centers...'}
            </p>
          </div>
        ) : filteredCenters.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <Building className="w-14 h-14 mx-auto text-gray-300 mb-3 stroke-[1.5]" />
            <h4 className="text-lg font-bold text-gray-800">
              {isSinhala ? 'මධ්‍යස්ථාන කිසිවක් හමු නොවීය' : 'No Agrarian Centers Found'}
            </h4>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              {searchQuery
                ? (isSinhala ? `"${searchQuery}" සෙවුමට ගැලපෙන මධ්‍යස්ථාන නොමැත.` : `No centers matched your query "${searchQuery}".`)
                : (isSinhala ? 'මෙම දිස්ත්‍රික්කය සඳහා මධ්‍යස්ථාන දත්ත තවමත් ඇතුළත් කර නොමැත.' : 'No center data currently available for this district.')}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {isSinhala ? 'සෙවුම ඉවත් කරන්න' : 'Clear Search'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredCenters.map(center => {
              const { primary, additional } = extractOfficers(center);
              const isExpanded = expandedCenterId === center.id;

              const primaryName = primary
                ? (isSinhala ? (primary.nameSi || primary.name) : primary.name)
                : (isSinhala ? (center.officerInChargeSi || center.officerInCharge) : center.officerInCharge);

              const primaryPosition = primary
                ? (isSinhala ? (primary.positionSi || primary.position) : primary.position)
                : (isSinhala ? (center.officerDesignationSi || center.officerDesignation) : center.officerDesignation);

              const primaryPhone = primary?.phone || center.mobilePhone || center.officePhone;
              const primaryEmail = primary?.email || center.email;

              const centerUrl = `/govijana-sewa/${center.ascId || center.id}`;

              return (
                <div
                  key={center.id}
                  onClick={() => navigate(centerUrl)}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group"
                >
                  {/* Center Card Top Bar */}
                  <div className="p-4 sm:p-5 pb-3 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 tracking-wider">
                        {center.ascId}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                        <MapPin size={12} className="text-emerald-700 shrink-0" />
                        <span className="truncate">{center.district}</span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-emerald-950 tracking-tight leading-snug transition-colors">
                      {isSinhala ? (center.nameSi || center.name) : center.name}
                    </h3>
                    {center.nameSi && center.name && (
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                        {isSinhala ? center.name : center.nameSi}
                      </p>
                    )}
                  </div>

                  {/* Center Body */}
                  <div className="p-4 sm:p-5 pt-3.5 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      
                      {/* Special Notice (If Available) */}
                      {(center.specialNote || center.specialNoteSi) && (
                        <div
                          className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2"
                          onClick={e => e.stopPropagation()}
                        >
                          <StickyNote size={14} className="text-amber-700 shrink-0 mt-0.5" />
                          <div className="text-[11px] min-w-0">
                            <strong className="text-amber-900 font-bold block mb-0.5">
                              {isSinhala ? 'සුවිශේෂී නිවේදනය' : 'Special Notice'}
                            </strong>
                            <p className="text-amber-950 font-medium leading-relaxed whitespace-pre-line line-clamp-3">
                              {isSinhala ? (center.specialNoteSi || center.specialNote) : (center.specialNote || center.specialNoteSi)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Primary Head Officer Box */}
                      <div className="p-3 rounded-xl bg-gray-50/90 border border-gray-200/80 flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                          <User size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                            {isSinhala ? 'භාරකාර නිලධාරී' : 'In-Charge'}
                          </span>
                          <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate mt-1">
                            {primaryName || (isSinhala ? 'තොරතුරු නොමැත' : 'Not Assigned')}
                          </h4>
                          <p className="text-[11px] text-gray-500 font-medium truncate">
                            {primaryPosition || (isSinhala ? 'ගොවිජන සංවර්ධන නිලධාරී' : 'Agrarian Dev Officer')}
                          </p>
                        </div>
                      </div>

                      {/* Quick Contact Buttons */}
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5" onClick={e => e.stopPropagation()}>
                        {primaryPhone && (
                          <a
                            href={`tel:${primaryPhone.replace(/\D/g, '')}`}
                            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-200 transition-colors truncate"
                            title={`Call ${primaryPhone}`}
                          >
                            <Phone size={12} className="shrink-0" />
                            <span className="truncate">{primaryPhone}</span>
                          </a>
                        )}

                        {center.mobilePhone && (
                          <a
                            href={`https://wa.me/94${center.mobilePhone.replace(/\D/g, '').replace(/^0/, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-800 rounded-lg text-[11px] font-bold border border-green-200 transition-colors truncate"
                          >
                            <MessageSquare size={12} className="shrink-0" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {primaryEmail && (
                          <a
                            href={`mailto:${primaryEmail}`}
                            className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[11px] font-bold border border-blue-200 transition-colors truncate ${
                              primaryPhone && center.mobilePhone ? 'col-span-2' : ''
                            }`}
                            title={primaryEmail}
                          >
                            <Mail size={12} className="shrink-0" />
                            <span className="truncate">{primaryEmail}</span>
                          </a>
                        )}
                      </div>

                      {/* Additional Officers Expandable List */}
                      {additional.length > 0 && (
                        <div className="pt-1" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setExpandedCenterId(isExpanded ? null : center.id)}
                            className="w-full py-1.5 px-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Users size={12} className="text-emerald-700" />
                              <span>
                                {isSinhala
                                  ? `අමතර කාර්ය මණ්ඩලය (${additional.length})`
                                  : `Staff (${additional.length})`}
                              </span>
                            </span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-1.5 p-2 bg-gray-50/70 rounded-xl border border-gray-200 animate-in fade-in duration-150">
                              {additional.map((off, oIdx) => (
                                <div
                                  key={oIdx}
                                  className="p-2 bg-white rounded-lg border border-gray-200 flex flex-col gap-1 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <h5 className="font-bold text-gray-900 text-[11px] truncate">
                                      {isSinhala ? (off.nameSi || off.name) : off.name}
                                    </h5>
                                    <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded shrink-0 truncate max-w-[120px]">
                                      {isSinhala ? (off.positionSi || off.position) : off.position}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                                    {off.phone && (
                                      <a
                                        href={`tel:${off.phone.replace(/\D/g, '')}`}
                                        className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded transition-colors flex items-center gap-1 font-medium"
                                        title="Call Officer"
                                      >
                                        <Phone size={10} /> {off.phone}
                                      </a>
                                    )}
                                    {off.email && (
                                      <a
                                        href={`mailto:${off.email}`}
                                        className="p-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors"
                                        title={off.email}
                                      >
                                        <Mail size={10} />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* View Full Center Details Link */}
                    <div className="pt-2">
                      <div className="w-full py-2 px-3 rounded-xl bg-emerald-50/80 group-hover:bg-emerald-700 text-emerald-900 group-hover:text-white text-xs font-bold flex items-center justify-between transition-all duration-200 shadow-2xs">
                        <span>{isSinhala ? 'සම්පූර්ණ තොරතුරු බලන්න' : 'View Full Details'}</span>
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>

                  {/* Center Card Footer (Address & Google Maps) */}
                  <div className="px-4 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2 text-[11px] text-gray-600">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                      <span className="truncate" title={center.address || undefined}>
                        {isSinhala ? (center.addressSi || center.address || 'ලිපිනය නොමැත') : (center.address || 'Address not listed')}
                      </span>
                    </div>

                    {center.googleMapsUrl && (
                      <a
                        href={center.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 font-bold hover:underline shrink-0"
                      >
                        <span>Google Maps</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
