import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDistricts } from 'sl-gnd-dsd-districts';
import type { District } from 'sl-gnd-dsd-districts';
import {
  ChevronDown,
  X
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {isSinhala ? 'ගොවිජන සේවා මධ්‍යස්ථාන නාමාවලිය' : 'Agrarian Service Centers Directory'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {isSinhala ? 'පළාත හෝ දිස්ත්‍රික්කය තෝරා අදාළ ප්‍රදේශයේ මධ්‍යස්ථාන සහ නිලධාරී තොරතුරු සොයන්න' : 'Select province or district to locate nearest service centers and officers'}
              </p>
            </div>

            <div className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl self-start md:self-auto">
              <span>{filteredCenters.length} {isSinhala ? 'මධ්‍යස්ථාන' : 'Centers'}</span>
            </div>
          </div>

          {/* Styled Custom Dropdown Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Custom Province Dropdown */}
            <div className="relative" ref={provinceDropdownRef}>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {isSinhala ? 'පළාත' : 'Province'}
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsProvinceOpen(!isProvinceOpen);
                  setIsDistrictOpen(false);
                }}
                className={`w-full px-4 py-3 bg-gray-50/80 hover:bg-white border rounded-2xl text-left flex items-center justify-between gap-2 text-sm font-semibold transition-all cursor-pointer ${
                  isProvinceOpen
                    ? 'border-emerald-700 ring-2 ring-emerald-700/20 bg-white shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-gray-900 truncate">
                  {selectedProvince === 'All'
                    ? (isSinhala ? 'සියලු පළාත් (All Provinces)' : 'All Provinces')
                    : `${selectedProvince} Province`}
                </span>

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
                          <span className="truncate">
                            {prov === 'All' ? (isSinhala ? 'සියලු පළාත් (All Provinces)' : 'All Provinces') : `${prov} Province`}
                          </span>
                          {isSelected && <span className="text-emerald-700 font-bold text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Custom District Dropdown */}
            <div className="relative" ref={districtDropdownRef}>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {isSinhala ? 'දිස්ත්‍රික්කය' : 'District'}
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
                    ? 'border-emerald-700 ring-2 ring-emerald-700/20 bg-white shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
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

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400 font-medium">
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
                    <input
                      type="text"
                      placeholder={isSinhala ? "දිස්ත්‍රික්කය සොයන්න..." : "Search district..."}
                      value={districtSearchQuery}
                      onChange={e => setDistrictSearchQuery(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
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
                            <span className="truncate">
                              {isSinhala ? `${dist.nameSi} (${dist.nameEn})` : dist.nameEn}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-gray-400">
                                {count}
                              </span>
                              {isSelected && <span className="text-emerald-700 font-bold text-xs">✓</span>}
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
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {isSinhala ? 'සෙවුම' : 'Search'}
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isSinhala ? "මධ්‍යස්ථානය, නගරය, නිලධාරී..." : "Center, town, officer, ASC ID..."}
                  className="w-full px-4 py-3 bg-gray-50/80 hover:bg-white focus:bg-white border border-gray-200 focus:border-emerald-700 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 transition-all placeholder:text-gray-400"
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
        <div className="mt-8 mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 px-1">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {isSinhala
                ? `${currentDistrictObj?.nameSi || selectedDistrictName} දිස්ත්‍රික්කයේ ගොවිජන සේවා මධ්‍යස්ථාන`
                : `Agrarian Service Centers in ${selectedDistrictName} District`}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {isSinhala
                ? `මධ්‍යස්ථාන ${filteredCenters.length} ක් හමු විය`
                : `Showing ${filteredCenters.length} centers`}
            </p>
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
                className="glass-btn-green mt-4 px-5 py-2 text-xs font-bold cursor-pointer"
              >
                {isSinhala ? 'සෙවුම ඉවත් කරන්න' : 'Clear Search'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map(center => {
              const { primary, additional } = extractOfficers(center);

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
                  className="relative overflow-hidden bg-white/80 hover:bg-white/95 backdrop-blur-2xl border border-gray-200/90 hover:border-emerald-700/30 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(15,77,48,0.08)] transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between cursor-pointer group min-h-[320px]"
                >
                  {/* Card Main Info */}
                  <div className="space-y-4">
                    {/* Top Metadata Row */}
                    <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                      <span className="font-mono text-emerald-800 font-semibold">{center.ascId}</span>
                      <span>{center.district}</span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-emerald-900 tracking-tight leading-snug transition-colors">
                        {isSinhala ? (center.nameSi || center.name) : center.name}
                      </h3>
                      {center.nameSi && center.name && (
                        <p className="text-xs text-gray-400 mt-0.5 font-normal">
                          {isSinhala ? center.name : center.nameSi}
                        </p>
                      )}
                    </div>

                    {/* Officer Details */}
                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                        {isSinhala ? 'භාරකාර නිලධාරී' : 'Officer In-Charge'}
                      </span>
                      <div className="font-bold text-gray-900 text-sm">
                        {primaryName || (isSinhala ? 'පත් කර නොමැත' : 'Not Assigned')}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {primaryPosition || (isSinhala ? 'ගොවිජන සංවර්ධන නිලධාරී' : 'Agrarian Dev Officer')}
                      </p>
                    </div>

                    {/* Quick Contacts - Showing Complete Email clearly */}
                    <div className="pt-3 border-t border-gray-100 space-y-2 text-xs" onClick={e => e.stopPropagation()}>
                      {primaryPhone && (
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-gray-400">{isSinhala ? 'දුරකථන' : 'Phone'}:</span>
                          <a
                            href={`tel:${primaryPhone.replace(/\D/g, '')}`}
                            className="font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
                          >
                            {primaryPhone}
                          </a>
                        </div>
                      )}

                      {center.mobilePhone && center.mobilePhone !== primaryPhone && (
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-gray-400">{isSinhala ? 'ජංගම' : 'Mobile'}:</span>
                          <a
                            href={`tel:${center.mobilePhone.replace(/\D/g, '')}`}
                            className="font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
                          >
                            {center.mobilePhone}
                          </a>
                        </div>
                      )}

                      {primaryEmail && (
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <span className="text-gray-400">{isSinhala ? 'විද්‍යුත් තැපෑල' : 'Email'}:</span>
                          <a
                            href={`mailto:${primaryEmail}`}
                            className="font-medium text-emerald-800 hover:text-emerald-950 hover:underline break-all text-xs"
                          >
                            {primaryEmail}
                          </a>
                        </div>
                      )}

                      {center.address && (
                        <div className="flex items-baseline justify-between gap-2 pt-0.5 text-gray-600">
                          <span className="text-gray-400 shrink-0">{isSinhala ? 'ලිපිනය' : 'Address'}:</span>
                          <span className="text-right text-gray-700 text-xs">
                            {isSinhala ? (center.addressSi || center.address) : center.address}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Special Notice if any */}
                    {(center.specialNote || center.specialNoteSi) && (
                      <div
                        className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60"
                        onClick={e => e.stopPropagation()}
                      >
                        <p className="text-xs text-amber-950 font-medium line-clamp-2 leading-relaxed">
                          {isSinhala ? (center.specialNoteSi || center.specialNote) : (center.specialNote || center.specialNoteSi)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Row with Liquid Glass Button */}
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-400 font-medium">
                      {additional.length > 0 ? (
                        isSinhala ? `කාර්ය මණ්ඩලය: ${additional.length + 1}` : `Staff: ${additional.length + 1}`
                      ) : (
                        center.province ? `${center.province} Province` : ''
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(centerUrl);
                      }}
                      className="glass-btn-green px-5 py-2 text-xs font-bold"
                    >
                      {isSinhala ? 'තොරතුරු' : 'Details'}
                    </button>
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
