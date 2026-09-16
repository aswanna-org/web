import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Globe, Plus, Sparkles, ChevronDown } from 'lucide-react';
import {
  ALL_COUNTRIES,
  REGIONAL_PRESETS,
  type CountryItem,
  findCountryByCode,
  formatCountryList,
  parseCountryCodesFromText,
} from '../../utils/worldCountries';

interface CountryMultiSelectProps {
  valueSi: string;
  valueEn: string;
  onChange: (si: string, en: string) => void;
}

export default function CountryMultiSelect({
  valueSi,
  valueEn,
  onChange,
}: CountryMultiSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'picker' | 'custom'>('picker');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse existing selection into country codes
  const selectedCodes = useMemo(() => {
    return parseCountryCodesFromText(valueEn || valueSi || '');
  }, [valueEn, valueSi]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered countries based on search
  const filteredCountries = useMemo(() => {
    if (!search.trim()) {
      // Prioritize top popular international institutions countries first
      const popular = ['LK', 'IN', 'US', 'GB', 'CN', 'JP', 'DE', 'FR', 'IT', 'CH', 'AU', 'CA', 'TH', 'ID', 'PH', 'BD', 'NP', 'PK'];
      return ALL_COUNTRIES.filter((c) => !selectedCodes.includes(c.code)).sort((a, b) => {
        const aPop = popular.includes(a.code) ? 0 : 1;
        const bPop = popular.includes(b.code) ? 0 : 1;
        if (aPop !== bPop) return aPop - bPop;
        return a.nameEn.localeCompare(b.nameEn);
      });
    }

    const q = search.trim().toLowerCase();
    return ALL_COUNTRIES.filter(
      (c) =>
        !selectedCodes.includes(c.code) &&
        (c.nameEn.toLowerCase().includes(q) ||
          c.nameSi.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q))
    );
  }, [search, selectedCodes]);

  // Add country
  const handleAddCountry = (country: CountryItem) => {
    const updatedCodes = [...selectedCodes, country.code];
    const { si, en } = formatCountryList(updatedCodes);
    onChange(si, en);
    setSearch('');
  };

  // Remove country
  const handleRemoveCountry = (code: string) => {
    const updatedCodes = selectedCodes.filter((c) => c !== code);
    const { si, en } = formatCountryList(updatedCodes);
    onChange(si, en);
  };

  // Clear all
  const handleClearAll = () => {
    onChange('', '');
  };

  // Apply regional preset
  const handleApplyPreset = (preset: typeof REGIONAL_PRESETS[0]) => {
    if (preset.countryCodes.length > 0) {
      const { si, en } = formatCountryList(preset.countryCodes);
      onChange(si, en);
      setMode('picker');
    } else {
      // Global preset
      onChange(preset.phraseSi, preset.phraseEn);
      setMode('custom');
    }
  };

  const selectedCountryObjects = selectedCodes
    .map((code) => findCountryByCode(code))
    .filter((c): c is CountryItem => Boolean(c));

  return (
    <div className="space-y-3 bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-2xs">
      {/* Header with Mode Toggle & Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>ක්‍රියාත්මක වන රටවල් තේරීම (Operating Countries)</span>
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => setMode('picker')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              mode === 'picker' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            🌍 රටවල් ලැයිස්තුව (Multi-Select)
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              mode === 'custom' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            ✏️ නිදහස් විස්තරය (Custom Text)
          </button>
        </div>
      </div>

      {/* Quick Presets Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10.5px] text-zinc-400 font-medium flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          පෙරනිමි කාණ්ඩ (Presets):
        </span>
        {REGIONAL_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className="text-[10.5px] px-2.5 py-1 rounded-lg bg-zinc-100/90 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-zinc-200 text-zinc-700 transition-all cursor-pointer flex items-center gap-1 font-medium"
          >
            <span>{preset.nameSi}</span>
          </button>
        ))}
      </div>

      {mode === 'picker' ? (
        <div className="space-y-3" ref={dropdownRef}>
          {/* Selected Countries Chips */}
          <div className="min-h-[42px] p-2 bg-zinc-50/70 border border-zinc-200 rounded-lg flex flex-wrap items-center gap-1.5">
            {selectedCountryObjects.length === 0 ? (
              <p className="text-xs text-zinc-400 italic px-1">
                රටවල් කිසිවක් තෝරා නැත. පහතින් රටවල් තෝරන්න (No countries selected).
              </p>
            ) : (
              <>
                {selectedCountryObjects.map((c) => (
                  <span
                    key={c.code}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-emerald-200 text-emerald-900 text-xs font-medium shadow-2xs group hover:border-emerald-400 transition-colors"
                  >
                    <span className="text-sm leading-none">{c.flag}</span>
                    <span>{c.nameSi}</span>
                    <span className="text-[10px] text-zinc-400 font-normal">({c.nameEn})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCountry(c.code)}
                      className="text-zinc-400 hover:text-red-500 hover:bg-red-50 p-0.5 rounded transition-colors ml-0.5 cursor-pointer"
                      title={`${c.nameSi} ඉවත් කරන්න`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[10.5px] text-red-500 hover:text-red-700 hover:underline px-2 py-0.5 ml-auto font-medium cursor-pointer"
                >
                  සියල්ල ඉවත් කරන්න (Clear)
                </button>
              </>
            )}
          </div>

          {/* Search Dropdown Input & Menu */}
          <div className="relative">
            <div
              onClick={() => setIsOpen(true)}
              className="relative flex items-center"
            >
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="රටක නම සිංහලෙන් හෝ English වලින් සොයන්න (Search country e.g. Sri Lanka, India, USA)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 placeholder:text-zinc-400"
              />
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 absolute right-3 transition-transform pointer-events-none ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Dropdown Options */}
            {isOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-zinc-200 rounded-xl shadow-lg divide-y divide-zinc-50">
                <div className="p-2 bg-zinc-50 text-[10.5px] font-semibold text-zinc-500 flex justify-between">
                  <span>ලෝකයේ රටවල් ({filteredCountries.length})</span>
                  <span>ක්ලික් කර එක් කරන්න</span>
                </div>

                {filteredCountries.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-400">
                    ගැලපෙන රටක් හමු නොවීය (No matching country).
                  </div>
                ) : (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleAddCountry(country)}
                      className="w-full px-3 py-2 text-left hover:bg-emerald-50/80 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{country.flag}</span>
                        <div>
                          <p className="font-medium text-zinc-900 group-hover:text-emerald-950">
                            {country.nameSi}
                          </p>
                          <p className="text-[10px] text-zinc-400 group-hover:text-emerald-700">
                            {country.nameEn} • {country.code}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 font-mono">
                          {country.region}
                        </span>
                        <span className="p-1 rounded bg-emerald-100 text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Bilingual Text Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                ක්‍රියාත්මක වන රටවල් (සිංහල පෙළ)
              </label>
              <input
                type="text"
                value={valueSi}
                onChange={(e) => onChange(e.target.value, valueEn)}
                placeholder="උදා: ශ්‍රී ලංකාව, ඉන්දියාව, එක්සත් ජනපදය"
                className="w-full p-2 bg-zinc-50/50 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                Operating Countries (English Text)
              </label>
              <input
                type="text"
                value={valueEn}
                onChange={(e) => onChange(valueSi, e.target.value)}
                placeholder="e.g. Sri Lanka, India, United States"
                className="w-full p-2 bg-zinc-50/50 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-800"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Custom Free-text Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              ක්‍රියාත්මක වන රටවල් (සිංහලෙන්)
            </label>
            <input
              type="text"
              value={valueSi}
              onChange={(e) => onChange(e.target.value, valueEn)}
              placeholder="උදා: ලොව පුරා රටවල් 195 කට අධික සංඛ්‍යාවක"
              className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Operating Countries (English)
            </label>
            <input
              type="text"
              value={valueEn}
              onChange={(e) => onChange(valueSi, e.target.value)}
              placeholder="e.g. In over 195 countries worldwide"
              className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
            />
          </div>
        </div>
      )}
    </div>
  );
}
