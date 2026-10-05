import {
  PROVINCES,
  provinces,
  getDistricts,
  getDistrictsByProvince,
  getDistrictByName,
  getDSDs,
  getDSDByName,
  getDSDsByDistrict,
  getDSDsByProvince,
  getGNDs,
  getGNDByName,
  getGNDByCode,
  getGNDByLifeCode,
  getGNDsByDSD,
  getGNDsByDistrict,
  getGNDsByProvince,
  getDistrictHierarchy,
  getDSDHierarchy,
  getProvinces,
  getProvincesInfo,
  getStats,
  searchDistricts,
  searchDSD,
  searchGND,
  type District,
  type DSD,
  type GND,
  type ProvinceInfo
} from 'sl-gnd-dsd-districts';

export interface DistrictOption {
  id?: number;
  en: string;
  si: string;
  ta?: string;
}

export interface ProvinceOption {
  en: string;
  si: string;
  ta?: string;
  districts: DistrictOption[];
}

const allDistricts: District[] = getDistricts();

// Proper Sinhala & Tamil province names
const PROVINCE_NAMES_SI: Record<string, string> = {
  'Western': 'බස්නාහිර පළාත',
  'Central': 'මධ්‍යම පළාත',
  'Southern': 'දකුණු පළාත',
  'Northern': 'උතුරු පළාත',
  'Eastern': 'නැගෙනහිර පළාත',
  'North Western': 'වයඹ පළාත',
  'North-Western': 'වයඹ පළාත',
  'North Central': 'උතුරු මැද පළාත',
  'North-Central': 'උතුරු මැද පළාත',
  'Uva': 'ඌව පළාත',
  'Sabaragamuwa': 'සබරගමුව පළාත'
};

const PROVINCE_NAMES_TA: Record<string, string> = {
  'Western': 'மேல் மாகாணம்',
  'Central': 'மத்திய மாகாணம்',
  'Southern': 'தென் மாகாணம்',
  'Northern': 'வட மாகாணம்',
  'Eastern': 'கிழக்கு மாகாணம்',
  'North Western': 'வட மேல் மாகாணம்',
  'North-Western': 'வட மேல் மாகாணம்',
  'North Central': 'வட மத்திய மாகாணம்',
  'North-Central': 'வட மத்திய மாகாணம்',
  'Uva': 'ஊவா மாகாணம்',
  'Sabaragamuwa': 'சபரகமுவ மாகாணம்'
};

/**
 * Dynamically generated provinces & districts of Sri Lanka powered by npm: sl-gnd-dsd-districts
 */
export const SRI_LANKA_PROVINCES: ProvinceOption[] = PROVINCES.map((pEn) => {
  const provDistricts = allDistricts.filter(
    (d) => d.provinceEn.toLowerCase() === pEn.toLowerCase() ||
           d.provinceEn.toLowerCase().replace('-', ' ') === pEn.toLowerCase().replace('-', ' ')
  );

  return {
    en: `${pEn.replace('-', ' ')} Province`,
    si: PROVINCE_NAMES_SI[pEn] || `${pEn} පළාත`,
    ta: PROVINCE_NAMES_TA[pEn],
    districts: provDistricts.map((d) => ({
      id: d.id,
      en: d.nameEn,
      si: d.nameSi,
      ta: d.nameTa
    }))
  };
});

/**
 * Helper to get districts for a given province name (supports English or Sinhala)
 */
export function getDistrictsForProvince(provinceName?: string | null): DistrictOption[] {
  if (!provinceName) return [];
  const clean = provinceName.trim().toLowerCase().replace(' province', '').replace(' පළාත', '').replace('-', ' ');
  const prov = SRI_LANKA_PROVINCES.find((p) => {
    const pCleanEn = p.en.toLowerCase().replace(' province', '').replace('-', ' ');
    const pCleanSi = p.si.replace(' පළාත', '');
    return (
      p.en === provinceName ||
      p.si === provinceName ||
      pCleanEn === clean ||
      pCleanSi === provinceName.trim() ||
      pCleanSi === clean ||
      p.en.toLowerCase().includes(clean) ||
      clean.includes(pCleanEn)
    );
  });
  return prov ? prov.districts : [];
}

/**
 * Helper to get Divisional Secretariat Divisions (DSDs) for a district by name (English or Sinhala)
 */
export function getDSDsForDistrict(districtName?: string | null): DSD[] {
  if (!districtName) return [];
  const trimmed = districtName.trim();
  const cleanName = trimmed.replace(/\s*\(.*?\)\s*/g, '').trim();
  const foundDistrict = getDistrictByName(cleanName) || getDistrictByName(trimmed);
  if (foundDistrict) {
    return getDSDsByDistrict(foundDistrict.nameEn);
  }
  return getDSDsByDistrict(cleanName) || getDSDsByDistrict(trimmed) || [];
}

/**
 * Helper to get Grama Niladhari Divisions (GNDs) for a DSD by name (English or Sinhala)
 */
export function getGNDsForDSD(dsdName?: string | null, districtName?: string | null): GND[] {
  if (!dsdName) return [];
  const cleanDSD = dsdName.replace(/\s*\(.*?\)\s*/g, '').trim();
  const cleanDistrict = districtName ? districtName.replace(/\s*\(.*?\)\s*/g, '').trim() : undefined;

  try {
    const list = getGNDsByDSD(cleanDSD, cleanDistrict);
    if (list && list.length > 0) return list;
  } catch {
    // continue
  }

  if (cleanDistrict) {
    const foundDistrict = getDistrictByName(cleanDistrict);
    if (foundDistrict) {
      try {
        const list = getGNDsByDSD(cleanDSD, foundDistrict.nameEn);
        if (list && list.length > 0) return list;
      } catch {
        // continue
      }
    }
  }

  try {
    const list = getGNDsByDSD(cleanDSD);
    if (list && list.length > 0) return list;
  } catch {
    // continue
  }

  return [];
}

/**
 * Helper to get Grama Niladhari Divisions (GNDs) for a district by name (English or Sinhala)
 */
export function getGNDsForDistrict(districtName?: string | null): GND[] {
  if (!districtName) return [];
  const trimmed = districtName.trim();
  const cleanName = trimmed.replace(/\s*\(.*?\)\s*/g, '').trim();
  const foundDistrict = getDistrictByName(cleanName) || getDistrictByName(trimmed);
  if (foundDistrict) {
    return getGNDsByDistrict(foundDistrict.nameEn);
  }
  return getGNDsByDistrict(cleanName) || getGNDsByDistrict(trimmed) || [];
}

export {
  PROVINCES,
  provinces,
  getDistricts,
  getDistrictsByProvince,
  getDistrictByName,
  getDSDs,
  getDSDByName,
  getDSDsByDistrict,
  getDSDsByProvince,
  getGNDs,
  getGNDByName,
  getGNDByCode,
  getGNDByLifeCode,
  getGNDsByDSD,
  getGNDsByDistrict,
  getGNDsByProvince,
  getDistrictHierarchy,
  getDSDHierarchy,
  getProvinces,
  getProvincesInfo,
  getStats,
  searchDistricts,
  searchDSD,
  searchGND,
  type District,
  type DSD,
  type GND,
  type ProvinceInfo
};
