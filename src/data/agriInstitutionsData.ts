export type AgriInstitutionType = 'gov' | 'pvt' | 'intl';
export type AgriCategoryKey =
  | 'ministry'
  | 'department'
  | 'research'
  | 'board'
  | 'authority'
  | 'inputs'
  | 'seeds'
  | 'fertilizer'
  | 'machinery'
  | 'un'
  | 'funding'
  | 'pvt'
  | 'intl'
  | string;

export interface RegionalCenter {
  nameSi?: string;
  nameEn?: string;
  locationSi?: string;
  locationEn?: string;
  phone?: string;
}

export interface InstitutionDocument {
  id: string;
  name: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
  uploadedAt?: string;
}

export interface AgriInstitution {
  id: string;
  slug?: string | null;
  nameSi: string;
  nameEn: string;
  shortName: string;
  type: AgriInstitutionType;
  categoryKey: AgriCategoryKey;
  categorySi: string;
  categoryEn: string;
  website: string;
  phone?: string | null;
  email?: string | null;
  addressSi?: string | null;
  addressEn?: string | null;
  descriptionSi?: string | null;
  descriptionEn?: string | null;
  logoUrl?: string | null;
  logoSvg?: string;
  logoBgColor?: string;
  iconName?: string;
  hotline?: string | null;
  workingHoursSi?: string | null;
  workingHoursEn?: string | null;
  servicesSi?: string[] | null;
  servicesEn?: string[] | null;
  services?: Array<{ serviceSi: string; serviceEn?: string | null }> | null;
  regionalCenters?: RegionalCenter[] | null;
  documents?: InstitutionDocument[] | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  order?: number;
  isActive?: boolean;
}
