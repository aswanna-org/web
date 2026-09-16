import worldCountriesRaw from 'world-countries';

export interface CountryItem {
  code: string; // cca2 (e.g. 'LK')
  code3: string; // cca3 (e.g. 'LKA')
  nameEn: string; // e.g. 'Sri Lanka'
  nameSi: string; // e.g. 'ශ්‍රී ලංකාව'
  flag: string; // Emoji flag e.g. '🇱🇰'
  region: string; // 'Asia', 'Europe', etc.
  subregion?: string;
}

export const SINHALA_COUNTRY_MAP: Record<string, string> = {
  LK: 'ශ්‍රී ලංකාව',
  IN: 'ඉන්දියාව',
  US: 'එක්සත් ජනපදය (ඇමරිකාව)',
  GB: 'එක්සත් රාජධානිය (බ්‍රිතාන්‍යය)',
  CN: 'චීනය',
  JP: 'ජපානය',
  DE: 'ජර්මනිය',
  FR: 'ප්‍රංශය',
  IT: 'ඉතාලිය',
  CA: 'කැනඩාව',
  AU: 'ඕස්ට්‍රේලියාව',
  RU: 'රුසියාව',
  PK: 'පකිස්ථානය',
  BD: 'බංග්ලාදේශය',
  NP: 'නේපාලය',
  BT: 'භූතානය',
  MV: 'මාලදිවයින',
  AF: 'ඇෆ්ගනිස්ථානය',
  MM: 'මියන්මාරය',
  TH: 'තායිලන්තය',
  VN: 'වියට්නාමය',
  ID: 'ඉන්දුනීසියාව',
  MY: 'මැලේසියාව',
  SG: 'සිංගප්පූරුව',
  PH: 'පිලිපීනය',
  KR: 'දකුණු කොරියාව',
  KP: 'උතුරු කොරියාව',
  CH: 'ස්විට්සර්ලන්තය',
  NL: 'නෙදර්ලන්තය',
  BE: 'බෙල්ජියම',
  SE: 'ස්වීඩනය',
  NO: 'නෝර්වේ',
  DK: 'ඩෙන්මාර්කය',
  FI: 'ෆින්ලන්තය',
  NZ: 'නවසීලන්තය',
  ZA: 'දකුණු අප්‍රිකාව',
  EG: 'ඊජිප්තුව',
  KE: 'කෙන්යාව',
  NG: 'නයිජීරියාව',
  GH: 'ඝානාව',
  ET: 'ඉතියෝපියාව',
  SA: 'සවුදි අරාබිය',
  AE: 'එක්සත් අරාබි එමීර් රාජ්‍යය',
  QA: 'කටාර්',
  IL: 'ඊශ්‍රායලය',
  IR: 'ඉරානය',
  IQ: 'ඉරාකය',
  TR: 'තුර්කිය',
  ES: 'ස්පාඤ්ඤය',
  PT: 'පෘතුගාලය',
  MX: 'මෙක්සිකෝව',
  BR: 'බ්‍රසීලය',
  AR: 'ආර්ජන්ටිනාව',
  CL: 'චිලී',
  CO: 'කොලොම්බියාව',
  PE: 'පේරු',
  CU: 'කියුබාව',
  UA: 'යුක්‍රේනය',
  PL: 'පෝලන්තය',
  AT: 'ඔස්ට්‍රියාව',
  IE: 'අයර්ලන්තය',
  GR: 'ග්‍රීසිය',
  VA: 'වතිකානුව',
  ZW: 'සිම්බාබ්වේ',
  ZM: 'සැම්බියාව',
  TZ: 'ටැන්සානියාව',
  UG: 'උගන්ඩාව',
  RW: 'රුවන්ඩාව',
  KH: 'කාම්බෝජය',
  LA: 'ලාඕසය',
  OM: 'ඕමානය',
  KW: 'කුවේට්',
  BH: 'බහරේනය',
  JO: 'ජෝර්දානය',
  LB: 'ලෙබනනය',
  SY: 'සිරියාව',
  YE: 'යේමනය',
  DZ: 'ඇල්ජීරියාව',
  MA: 'මොරොක්කෝව',
  TN: 'ටියුනීසියාව',
  LY: 'ලිබියාව',
  SD: 'සුඩානය',
  SO: 'සෝමාලියාව',
  MG: 'මැඩගස්කරය',
  MU: 'මොරිෂස්',
  SC: 'සීෂෙල්ස්',
  IS: 'අයිස්ලන්තය',
  CZ: 'චෙක් ජනරජය',
  HU: 'හංගේරියාව',
  RO: 'රුමේනියාව',
  BG: 'බල්ගේරියාව',
  RS: 'සර්බියාව',
  HR: 'ක්‍රොඒෂියාව',
  SI: 'ස්ලෝවේනියාව',
  SK: 'ස්ලෝවැකියාව',
  LT: 'ලිතුවේනියාව',
  LV: 'ලැට්වියාව',
  EE: 'එස්ටෝනියාව',
  BY: 'බෙලරුස්',
  KZ: 'කසකස්ථානය',
  UZ: 'උස්බෙකිස්ථානය',
  TM: 'ටර්ක්මෙනිස්ථානය',
  KG: 'කිර්ගිස්ථානය',
  TJ: 'ටජිකිස්ථානය',
  MN: 'මොන්ගෝලියාව',
  TW: 'තායිවානය',
  HK: 'හොංකොං',
  MO: 'මැකාවු',
  FJ: 'ෆීජි',
  PG: 'පැපුවා නිව්ගිනියාව',
  WS: 'සැමෝවා',
  TO: 'ටොංගා',
  VU: 'වනවාටු',
  EC: 'ඉක්වදෝරය',
  VE: 'වෙනිසියුලාව',
  BO: 'බොලිවියාව',
  PY: 'පැරගුවේ',
  UY: 'උරුගුවේ',
  CR: 'කොස්ටාරිකා',
  PA: 'පැනමාව',
  JM: 'ජැමෙයිකාව',
  TT: 'ට්‍රිනිඩෑඩ් සහ ටොබැගෝ',
};

// Process world countries
const rawList: any[] = Array.isArray(worldCountriesRaw)
  ? worldCountriesRaw
  : (worldCountriesRaw as any)?.default && Array.isArray((worldCountriesRaw as any).default)
  ? (worldCountriesRaw as any).default
  : [];

export const ALL_COUNTRIES: CountryItem[] = rawList
  .map((c: any) => {
    const code = c.cca2;
    const nameEn = c.name?.common || c.name || '';
    const nameSi = SINHALA_COUNTRY_MAP[code] || nameEn;
    return {
      code,
      code3: c.cca3 || code,
      nameEn,
      nameSi,
      flag: c.flag || '🌐',
      region: c.region || 'Other',
      subregion: c.subregion,
    };
  })
  .sort((a, b) => a.nameEn.localeCompare(b.nameEn));

// Preset groups
export const REGIONAL_PRESETS = [
  {
    id: 'global',
    nameSi: '🌐 ලොව පුරා (රටවල් 195+)',
    nameEn: '🌐 Worldwide (195+ Countries)',
    phraseSi: 'ලොව පුරා රටවල් 195 කට අධික සංඛ්‍යාවක',
    phraseEn: 'In over 195 countries worldwide',
    countryCodes: [] as string[],
  },
  {
    id: 'south_asia',
    nameSi: '🌏 දකුණු ආසියාව (SAARC - රටවල් 8)',
    nameEn: '🌏 South Asia (SAARC - 8 Countries)',
    phraseSi: 'ශ්‍රී ලංකාව ඇතුළු දකුණු ආසියානු රටවල් 8 ක',
    phraseEn: '8 South Asian Countries including Sri Lanka',
    countryCodes: ['LK', 'IN', 'PK', 'BD', 'NP', 'BT', 'MV', 'AF'],
  },
  {
    id: 'asia_pacific',
    nameSi: '🌏 ආසියා පැසිෆික් කලාපය (Asia-Pacific)',
    nameEn: '🌏 Asia-Pacific Region',
    phraseSi: 'ආසියා පැසිෆික් කලාපයේ රටවල් 40 කට අධික සංඛ්‍යාවක',
    phraseEn: 'Over 40 countries across the Asia-Pacific region',
    countryCodes: ['LK', 'IN', 'JP', 'AU', 'NZ', 'TH', 'VN', 'ID', 'MY', 'SG', 'PH', 'KR', 'CN'],
  },
  {
    id: 'global_south',
    nameSi: '🌍 සංවර්ධනය වෙමින් පවතින රටවල් (Global South)',
    nameEn: '🌍 Developing Nations (Global South)',
    phraseSi: 'ආසියානු සහ අප්‍රිකානු සංවර්ධනය වෙමින් පවතින රටවල් 70 කට අධික සංඛ්‍යාවක',
    phraseEn: 'Over 70 developing nations across Asia and Africa',
    countryCodes: ['LK', 'IN', 'BD', 'NP', 'KE', 'NG', 'GH', 'ET', 'TZ', 'UG'],
  },
];

export function findCountryByCode(code: string): CountryItem | undefined {
  return ALL_COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase() || c.code3.toUpperCase() === code.toUpperCase());
}

export function findCountryByName(name: string): CountryItem | undefined {
  const q = name.trim().toLowerCase();
  return ALL_COUNTRIES.find(
    (c) =>
      c.nameEn.toLowerCase() === q ||
      c.nameSi.toLowerCase() === q ||
      c.nameEn.toLowerCase().includes(q) ||
      c.nameSi.toLowerCase().includes(q)
  );
}

/**
 * Format a list of country codes into bilingual strings
 */
export function formatCountryList(codes: string[]): { si: string; en: string } {
  if (!codes || codes.length === 0) {
    return { si: '', en: '' };
  }

  const items = codes
    .map((code) => findCountryByCode(code))
    .filter((c): c is CountryItem => Boolean(c));

  const si = items.map((c) => c.nameSi).join(', ');
  const en = items.map((c) => c.nameEn).join(', ');

  return { si, en };
}

/**
 * Parse string into country codes if matched
 */
export function parseCountryCodesFromText(text: string): string[] {
  if (!text) return [];

  // Check if it's already comma-separated names or codes
  const tokens = text.split(/[,;|]/).map((t) => t.trim()).filter(Boolean);
  const matchedCodes: string[] = [];

  for (const token of tokens) {
    const byCode = findCountryByCode(token);
    if (byCode && !matchedCodes.includes(byCode.code)) {
      matchedCodes.push(byCode.code);
      continue;
    }

    const byName = ALL_COUNTRIES.find(
      (c) =>
        c.nameEn.toLowerCase() === token.toLowerCase() ||
        c.nameSi.toLowerCase() === token.toLowerCase() ||
        token.toLowerCase().includes(c.nameEn.toLowerCase())
    );

    if (byName && !matchedCodes.includes(byName.code)) {
      matchedCodes.push(byName.code);
    }
  }

  return matchedCodes;
}
