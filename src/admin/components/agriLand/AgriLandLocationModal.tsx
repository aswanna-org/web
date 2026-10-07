import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Save, MapPin } from 'lucide-react';
import type { AgriLandLocation } from './types';
import {
  SRI_LANKA_PROVINCES,
  getDistrictsForProvince,
  getDSDsForDistrict,
  getGNDsForDSD
} from '../../../data/sriLankaLocations';

interface AgriLandLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  locationToEdit?: AgriLandLocation | null;
  apiBaseUrl: string;
  token: string | null;
}

export const AgriLandLocationModal: React.FC<AgriLandLocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  locationToEdit,
  apiBaseUrl,
  token
}) => {
  const [provinceEn, setProvinceEn] = useState('Western');
  const [provinceSi, setProvinceSi] = useState('බස්නාහිර පළාත');
  const [districtEn, setDistrictEn] = useState('Colombo');
  const [districtSi, setDistrictSi] = useState('කොළඹ');

  // DSD and GND selections powered by sl-gnd
  const [selectedDsd, setSelectedDsd] = useState('');
  const [dsEn, setDsEn] = useState('');
  const [dsSi, setDsSi] = useState('');

  const [selectedGnd, setSelectedGnd] = useState('');
  const [gnEn, setGnEn] = useState('');
  const [gnSi, setGnSi] = useState('');

  const [isCustomDs, setIsCustomDs] = useState(false);
  const [isCustomGn, setIsCustomGn] = useState(false);

  const [activeState, setActiveState] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available districts for the selected province
  const availableDistricts = getDistrictsForProvince(provinceEn);
  // Available DSDs for the selected district
  const availableDsds = getDSDsForDistrict(districtEn);
  // Available GNDs for the selected DSD
  const availableGnds = getGNDsForDSD(dsEn, districtEn);

  useEffect(() => {
    if (locationToEdit) {
      setProvinceEn(locationToEdit.provinceEn || 'Western');
      setProvinceSi(locationToEdit.provinceSi || 'බස්නාහිර පළාත');
      setDistrictEn(locationToEdit.districtEn || 'Colombo');
      setDistrictSi(locationToEdit.districtSi || 'කොළඹ');
      setDsEn(locationToEdit.divisionalSecretariatEn || '');
      setDsSi(locationToEdit.divisionalSecretariatSi || '');
      setSelectedDsd(locationToEdit.divisionalSecretariatEn || '');
      setGnEn(locationToEdit.gramaNiladhariDivisionEn || '');
      setGnSi(locationToEdit.gramaNiladhariDivisionSi || '');
      setSelectedGnd(locationToEdit.gramaNiladhariDivisionEn || '');
      setIsCustomDs(false);
      setIsCustomGn(false);
      setActiveState(locationToEdit.activeState !== false);
    } else {
      const defaultProv = SRI_LANKA_PROVINCES[0] || { en: 'Western', si: 'බස්නාහිර පළාත', districts: [] };
      const defaultDist = defaultProv.districts[0] || { en: 'Colombo', si: 'කොළඹ' };
      setProvinceEn(defaultProv.en.replace(' Province', ''));
      setProvinceSi(defaultProv.si);
      setDistrictEn(defaultDist.en);
      setDistrictSi(defaultDist.si);
      setDsEn('');
      setDsSi('');
      setSelectedDsd('');
      setGnEn('');
      setGnSi('');
      setSelectedGnd('');
      setIsCustomDs(false);
      setIsCustomGn(false);
      setActiveState(true);
    }
    setError(null);
  }, [locationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleProvinceSelect = (pEnName: string) => {
    const prov = SRI_LANKA_PROVINCES.find(
      (p) => p.en.toLowerCase().replace(' province', '').trim() === pEnName.toLowerCase().replace(' province', '').trim()
    );
    const cleanEn = pEnName.replace(' Province', '');
    setProvinceEn(cleanEn);
    if (prov) {
      setProvinceSi(prov.si);
      if (prov.districts.length > 0) {
        const firstDist = prov.districts[0];
        setDistrictEn(firstDist.en);
        setDistrictSi(firstDist.si);
      }
    }
    setSelectedDsd('');
    setDsEn('');
    setDsSi('');
    setSelectedGnd('');
    setGnEn('');
    setGnSi('');
  };

  const handleDistrictSelect = (dEnName: string) => {
    setDistrictEn(dEnName);
    const dist = availableDistricts.find((d) => d.en.toLowerCase() === dEnName.toLowerCase());
    if (dist) {
      setDistrictSi(dist.si);
    }
    setSelectedDsd('');
    setDsEn('');
    setDsSi('');
    setSelectedGnd('');
    setGnEn('');
    setGnSi('');
  };

  const handleDsdSelect = (val: string) => {
    setSelectedDsd(val);
    if (val === '__custom__') {
      setIsCustomDs(true);
      setDsEn('');
      setDsSi('');
      return;
    }
    setIsCustomDs(false);
    const found = availableDsds.find((d) => d.nameEn === val);
    if (found) {
      setDsEn(found.nameEn);
      setDsSi(found.nameSi || found.nameEn);
    } else {
      setDsEn(val);
      setDsSi(val);
    }
    setSelectedGnd('');
    setGnEn('');
    setGnSi('');
  };

  const handleGndSelect = (val: string) => {
    setSelectedGnd(val);
    if (val === '__custom__') {
      setIsCustomGn(true);
      setGnEn('');
      setGnSi('');
      return;
    }
    setIsCustomGn(false);
    const found = availableGnds.find((g) => g.nameEn === val || g.lifeCode === val);
    if (found) {
      setGnEn(found.nameEn);
      setGnSi(found.nameSi || found.nameEn);
    } else {
      setGnEn(val);
      setGnSi(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provinceEn.trim() || !provinceSi.trim() || !districtEn.trim() || !districtSi.trim()) {
      setError('Province and District are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = locationToEdit
        ? `${apiBaseUrl}/agri-land-locations/${locationToEdit.id}`
        : `${apiBaseUrl}/agri-land-locations`;
      const method = locationToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          provinceEn: provinceEn.trim(),
          provinceSi: provinceSi.trim(),
          districtEn: districtEn.trim(),
          districtSi: districtSi.trim(),
          divisionalSecretariatEn: dsEn.trim() || null,
          divisionalSecretariatSi: dsSi.trim() || null,
          gramaNiladhariDivisionEn: gnEn.trim() || null,
          gramaNiladhariDivisionSi: gnSi.trim() || null,
          activeState
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save location');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {locationToEdit ? 'Edit Agri Land Location' : 'Add New Location (sl-gnd Powered)'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {locationToEdit ? 'ප්‍රදේශය සංස්කරණය' : 'ශ්‍රී ලංකා පළාත්, දිස්ත්‍රික්ක සහ ප්‍රාදේශීය ලේකම් කොට්ඨාස තෝරන්න'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Province (sl-gnd) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Province (පළාත තෝරන්න) <span className="text-red-500">*</span>
              </label>
              <select
                value={provinceEn}
                onChange={(e) => handleProvinceSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium"
              >
                {SRI_LANKA_PROVINCES.map((p) => {
                  const clean = p.en.replace(' Province', '');
                  return (
                    <option key={clean} value={clean}>
                      {clean} ({p.si})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Province (සිංහල නම)
              </label>
              <input
                type="text"
                value={provinceSi}
                onChange={(e) => setProvinceSi(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* District (sl-gnd filtered) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select District (දිස්ත්‍රික්කය තෝරන්න) <span className="text-red-500">*</span>
              </label>
              <select
                value={districtEn}
                onChange={(e) => handleDistrictSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium"
              >
                {availableDistricts.map((d) => (
                  <option key={d.en} value={d.en}>
                    {d.en} ({d.si})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                District (සිංහල නම)
              </label>
              <input
                type="text"
                value={districtSi}
                onChange={(e) => setDistrictSi(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Divisional Secretariat (sl-gnd populated) */}
          <div className="space-y-2 p-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Divisional Secretariat (ප්‍රාදේශීය ලේකම් කොට්ඨාසය)
              </label>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                {availableDsds.length} DSDs in {districtEn}
              </span>
            </div>

            <select
              value={isCustomDs ? '__custom__' : selectedDsd}
              onChange={(e) => handleDsdSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            >
              <option value="">-- Select DSD from list ({availableDsds.length} options) --</option>
              {availableDsds.map((d) => (
                <option key={d.id} value={d.nameEn}>
                  {d.nameEn} ({d.nameSi})
                </option>
              ))}
              <option value="__custom__">-- Type Custom DSD Manually (වෙනත්) --</option>
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">DS Name (English)</span>
                <input
                  type="text"
                  placeholder="e.g. Padukka / Homagama"
                  value={dsEn}
                  onChange={(e) => {
                    setDsEn(e.target.value);
                    setIsCustomDs(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">DS Name (සිංහල)</span>
                <input
                  type="text"
                  placeholder="උදා: පාදුක්ක / හෝමාගම"
                  value={dsSi}
                  onChange={(e) => {
                    setDsSi(e.target.value);
                    setIsCustomDs(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Grama Niladhari Division (sl-gnd populated) */}
          <div className="space-y-2 p-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Grama Niladhari Division (ග්‍රාම නිලධාරී වසම - Optional)
              </label>
              {availableGnds.length > 0 && (
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  {availableGnds.length} GNDs available
                </span>
              )}
            </div>

            {availableGnds.length > 0 ? (
              <select
                value={isCustomGn ? '__custom__' : selectedGnd}
                onChange={(e) => handleGndSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              >
                <option value="">-- Select GND from list ({availableGnds.length} options) --</option>
                {availableGnds.map((g) => (
                  <option key={g.id} value={g.nameEn}>
                    {g.nameEn} ({g.nameSi}) {g.gnCode ? `[${g.gnCode}]` : ''}
                  </option>
                ))}
                <option value="__custom__">-- Type Custom GND Manually (වෙනත්) --</option>
              </select>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">GN Name (English)</span>
                <input
                  type="text"
                  placeholder="e.g. 560 Beralapanathara"
                  value={gnEn}
                  onChange={(e) => {
                    setGnEn(e.target.value);
                    setIsCustomGn(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">GN Name (සිංහල)</span>
                <input
                  type="text"
                  placeholder="උදා: 560 බෙරලපනාතර"
                  value={gnSi}
                  onChange={(e) => {
                    setGnSi(e.target.value);
                    setIsCustomGn(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-slate-700">Active Location Status</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={activeState}
                onChange={(e) => setActiveState(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs hover:shadow transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : locationToEdit ? 'Update Location' : 'Save Location'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
