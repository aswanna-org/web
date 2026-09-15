export type AgriInstitutionType = 'gov' | 'pvt' | 'intl';

export interface RegionalCenter {
  id?: string;
  nameSi?: string;
  nameEn?: string;
  locationSi?: string;
  locationEn?: string;
  phone?: string;
}

export interface InstitutionDocument {
  id?: string;
  tempId?: string;
  name: string;
  fileUrl: string;
  fileSize?: string | null;
  fileType?: string | null;
  category?: string | null;
  year?: string | null;
  uploadedAt?: string | null;
  createdAt?: string | null;
  file?: File;
}

export interface InstitutionServiceItem {
  id?: string;
  serviceSi: string;
  serviceEn?: string | null;
}

// 1. Government Institution Interface
export interface GovInstitution {
  id: string;
  slug: string;
  sector: string;
  institutionType: string;
  ministry: string;
  nameSi: string;
  nameEn: string;
  badgeText?: string | null;
  iconClass?: string | null;
  colorTheme?: string | null;
  phone: string;
  shortCode?: string | null;
  email: string;
  address: string;
  descriptionSi: string;
  fullDescriptionSi: string;
  website?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  logoUrl?: string | null;
  order?: number;
  isActive?: boolean;
  services?: InstitutionServiceItem[];
  regionalCenters?: RegionalCenter[];
  documents?: InstitutionDocument[];
  createdAt?: string;
  updatedAt?: string;
}

// 2. Private Sector Institution Interface
export interface PvtInstitution {
  id: string;
  slug: string;
  sector: string;
  legalEntityType: string;
  parentConglomerate: string;
  nameSi: string;
  nameEn: string;
  badgeText?: string | null;
  iconClass?: string | null;
  colorTheme?: string | null;
  phone: string;
  shortCode?: string | null;
  email: string;
  headquartersAddress: string;
  descriptionSi: string;
  fullDescriptionSi: string;
  website?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  logoUrl?: string | null;
  order?: number;
  isActive?: boolean;
  productsAndServices?: InstitutionServiceItem[];
  services?: InstitutionServiceItem[];
  dealersAndShowrooms?: RegionalCenter[];
  regionalCenters?: RegionalCenter[];
  catalogues?: InstitutionDocument[];
  documents?: InstitutionDocument[];
  createdAt?: string;
  updatedAt?: string;
}

// 3. International Organization Interface
export interface IntlInstitution {
  id: string;
  slug: string;
  sector: string;
  agencyCategory: string;
  globalHQ: string;
  operatingCountries: string;
  thematicScope: string;
  hasSriLankaOffice: boolean;
  slOfficeLocation?: string | null;
  slOfficeAddress?: string | null;
  nameSi: string;
  nameEn: string;
  badgeText?: string | null;
  iconClass?: string | null;
  colorTheme?: string | null;
  phone: string;
  shortCode?: string | null;
  email: string;
  slMissionAddress?: string | null;
  descriptionSi: string;
  fullDescriptionSi: string;
  website?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  logoUrl?: string | null;
  order?: number;
  isActive?: boolean;
  interventions?: InstitutionServiceItem[];
  services?: InstitutionServiceItem[];
  projectStations?: RegionalCenter[];
  regionalCenters?: RegionalCenter[];
  reportsAndBriefs?: InstitutionDocument[];
  documents?: InstitutionDocument[];
  createdAt?: string;
  updatedAt?: string;
}

// Unified interface for backward compatibility & detail page
export interface AgriInstitution {
  id: string;
  slug?: string | null;
  type?: 'gov' | 'pvt' | 'intl' | string;
  sector?: string;
  institutionType?: string;
  ministry?: string;
  legalEntityType?: string;
  parentConglomerate?: string;
  agencyCategory?: string;
  globalHQ?: string;
  operatingCountries?: string;
  thematicScope?: string;
  hasSriLankaOffice?: boolean;
  slOfficeLocation?: string | null;
  slOfficeAddress?: string | null;
  nameSi: string;
  nameEn: string;
  shortName?: string;
  categoryKey?: string;
  categorySi?: string | null;
  categoryEn?: string | null;
  badgeText?: string | null;
  iconClass?: string | null;
  colorTheme?: string | null;
  phone?: string | null;
  shortCode?: string | null;
  hotline?: string | null;
  email?: string | null;
  address?: string | null;
  addressSi?: string | null;
  addressEn?: string | null;
  headquartersAddress?: string | null;
  slMissionAddress?: string | null;
  workingHoursSi?: string | null;
  workingHoursEn?: string | null;
  descriptionSi?: string | null;
  descriptionEn?: string | null;
  fullDescriptionSi?: string | null;
  website?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  logoUrl?: string | null;
  order?: number;
  isActive?: boolean;
  services?: any[] | null;
  servicesSi?: string[] | null;
  productsAndServices?: any[] | null;
  interventions?: any[] | null;
  regionalCenters?: RegionalCenter[] | null;
  dealersAndShowrooms?: RegionalCenter[] | null;
  projectStations?: RegionalCenter[] | null;
  documents?: InstitutionDocument[] | null;
  catalogues?: InstitutionDocument[] | null;
  reportsAndBriefs?: InstitutionDocument[] | null;
  createdAt?: string;
  updatedAt?: string;
}
