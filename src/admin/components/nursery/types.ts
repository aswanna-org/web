export interface NurseryLocationItem {
  id?: string;
  slug?: string;
  provinceSi?: string | null;
  provinceEn?: string | null;
  districtSi?: string | null;
  districtEn?: string | null;
  divisionalSecretariatSi?: string | null;
  divisionalSecretariatEn?: string | null;
  gramaNiladhariDivisionSi?: string | null;
  gramaNiladhariDivisionEn?: string | null;
  fullAddressSi?: string | null;
  fullAddressEn?: string | null;
  address?: string | null;
}

export interface AssociateOption {
  id: string;
  slug: string;
  nameSi?: string | null;
  nameEn?: string | null;
  activeState: boolean;
  _count?: {
    nurseries?: number;
    stocks?: number;
    fastSellingItems?: number;
  };
}

export interface NurseryImageItem {
  id?: string;
  slug?: string;
  imageUrl: string;
  isPrimary?: boolean;
  caption?: string | null;
}

export interface NurseryStockItem {
  id?: string;
  slug?: string;
  categoryId?: string | null;
  category?: AssociateOption | null;
  cropId?: string | null;
  crop?: AssociateOption | null;
  varietyId?: string | null;
  variety?: AssociateOption | null;
  stockRangeSi?: string | null;
  stockRangeEn?: string | null;
  quantity?: number | string | null;
  unit?: string | null;
  grade?: AssociateOption | string | null;
}

export interface NurseryBadge extends AssociateOption {
  _count?: {
    fastSellingItems?: number;
    nurseries?: number;
    stocks?: number;
  };
}

export interface NurseryFastSellingItem {
  id?: string;
  slug?: string;
  categoryId?: string | null;
  category?: AssociateOption | null;
  cropId?: string | null;
  crop?: AssociateOption | null;
  varietyId?: string | null;
  variety?: AssociateOption | null;
  priceSi?: string | null;
  priceEn?: string | null;
  imageUrl?: string | null;
  badgeId?: string | null;
  badge?: AssociateOption | null;
  nurseryId?: string | null;
  activeState?: boolean;
}

export interface NurseryItem {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi?: string | null;
  nameEn?: string | null;
  ownerNameSi?: string | null;
  ownerNameEn?: string | null;
  whatsappNumber?: string | null;
  hotline?: string | null;
  website?: string | null;
  rating?: number | null;
  locationId?: string | null;
  location?: NurseryLocationItem | null;
  isGovRegistered: boolean;
  certificateNo?: string | null;
  gradeId?: string | null;
  grade?: AssociateOption | null;
  deliveryId?: string | null;
  delivery?: AssociateOption | null;
  operatingHoursId?: string | null;
  operatingHours?: AssociateOption | null;
  certificationId?: string | null;
  certification?: AssociateOption | null;
  googleMapsUrl?: string | null;
  descriptionSi?: string | null;
  descriptionEn?: string | null;
  images?: NurseryImageItem[];
  stocks?: NurseryStockItem[];
  specialties?: AssociateOption[];
  fastSellingItems?: NurseryFastSellingItem[];
  userId?: string | null;
  user?: { id: string; name: string; email?: string | null; phone?: string | null; avatar?: string | null; role?: string } | null;
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED' | string;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormDropdownOptions {
  grades: AssociateOption[];
  deliveries: AssociateOption[];
  operatingHours: AssociateOption[];
  certifications: AssociateOption[];
  categories: AssociateOption[];
  crops: AssociateOption[];
  varieties: AssociateOption[];
  specialties: AssociateOption[];
  badges: AssociateOption[];
}

export interface NurseryFormState {
  nameSi: string;
  nameEn: string;
  ownerNameSi: string;
  ownerNameEn: string;
  whatsappNumber: string;
  // Location
  provinceEn: string;
  provinceSi: string;
  districtEn: string;
  districtSi: string;
  divisionalSecretariatSi: string;
  divisionalSecretariatEn: string;
  gramaNiladhariDivisionSi: string;
  gramaNiladhariDivisionEn: string;
  fullAddressSi: string;
  fullAddressEn: string;
  // Registration & Grade
  isGovRegistered: boolean;
  certificateNo: string;
  gradeId: string;
  // Delivery & Hours & Certification
  deliveryId: string;
  operatingHoursId: string;
  certificationId: string;
  // Photos (up to 5)
  photos: string[];
  // Stocks
  stocks: Array<{
    categoryId: string | null;
    cropId: string | null;
    varietyId: string | null;
    stockRangeSi: string;
    stockRangeEn: string;
  }>;
  // Specialties
  specialtyIds: string[];
  // Fast Selling Items (Max 4)
  fastSellingItems: Array<{
    categoryId?: string;
    cropId: string;
    varietyId: string;
    priceEn: string;
    priceSi: string;
    imageUrl: string;
    badgeId: string;
  }>;
  // Maps & Details
  googleMapsUrl: string;
  descriptionSi: string;
  descriptionEn: string;
  activeState: boolean;
}

export const DEFAULT_FORM_OPTIONS: FormDropdownOptions = {
  grades: [],
  deliveries: [],
  operatingHours: [],
  certifications: [],
  categories: [],
  crops: [],
  varieties: [],
  specialties: [],
  badges: []
};

