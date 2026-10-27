export interface MushroomLocationItem {
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
}

export interface MushroomAssociateOption {
  id: string;
  slug: string;
  nameSi?: string | null;
  nameEn?: string | null;
  activeState: boolean;
  _count?: {
    suppliers?: number;
    inventoryItems?: number;
    featuredItems?: number;
  };
}

export interface MushroomImageItem {
  id?: string;
  slug?: string;
  imageUrl: string;
  isPrimary?: boolean;
  activeState?: boolean;
}

export interface MushroomInventoryItemType {
  id?: string;
  slug?: string;
  categoryId?: string | null;
  category?: MushroomAssociateOption | null;
  itemNameSi?: string | null;
  itemNameEn?: string | null;
  specificationSi?: string | null;
  specificationEn?: string | null;
  priceSi?: string | null;
  priceEn?: string | null;
  stockSi?: string | null;
  stockEn?: string | null;
  supplierId?: string | null;
  activeState?: boolean;
}

export interface MushroomFeaturedItemType {
  id?: string;
  slug?: string;
  itemTypeSi?: string | null;
  itemTypeEn?: string | null;
  varietySi?: string | null;
  varietyEn?: string | null;
  priceSi?: string | null;
  priceEn?: string | null;
  imageUrl?: string | null;
  badgeId?: string | null;
  badge?: MushroomAssociateOption | null;
  supplierId?: string | null;
  activeState?: boolean;
}

export interface MushroomSupplierItem {
  id: string;
  slug: string;
  activeState: boolean;
  businessNameSi?: string | null;
  businessNameEn?: string | null;
  ownerNameSi?: string | null;
  ownerNameEn?: string | null;
  whatsappNumber?: string | null;
  locationId?: string | null;
  location?: MushroomLocationItem | null;
  deliveryId?: string | null;
  delivery?: MushroomAssociateOption | null;
  operatingHoursId?: string | null;
  operatingHours?: MushroomAssociateOption | null;
  googleMapsUrl?: string | null;
  descriptionSi?: string | null;
  descriptionEn?: string | null;
  images?: MushroomImageItem[];
  inventoryItems?: MushroomInventoryItemType[];
  featuredItems?: MushroomFeaturedItemType[];
  categories?: MushroomAssociateOption[];
  userId?: string | null;
  user?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    avatar?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface MushroomFormDropdownOptions {
  categories: MushroomAssociateOption[];
  deliveries: MushroomAssociateOption[];
  operatingHours: MushroomAssociateOption[];
  badges: MushroomAssociateOption[];
  locations: MushroomLocationItem[];
}

export interface MushroomFormState {
  // Top level fields
  businessNameSi: string;
  businessNameEn: string;
  ownerNameSi: string;
  ownerNameEn: string;
  whatsappNumber: string;

  // Section 1: Location
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

  // Section 2: Specific Inventory Items
  inventoryItems: Array<{
    id?: string;
    slug?: string;
    categoryId: string;
    categoryName?: string;
    itemNameSi: string;
    itemNameEn: string;
    specificationSi: string;
    specificationEn: string;
    priceSi: string;
    priceEn: string;
    stockSi: string;
    stockEn: string;
  }>;

  // Section 3: Top 5 Featured Items
  featuredItems: Array<{
    id?: string;
    slug?: string;
    itemTypeSi: string;
    itemTypeEn: string;
    varietySi: string;
    varietyEn: string;
    priceSi: string;
    priceEn: string;
    imageUrl: string;
    badgeId: string;
    badgeName?: string;
  }>;

  // Section 4: Available Categories (checkboxes)
  categoryIds: string[];

  // Bottom fields
  deliveryId: string;
  operatingHoursId: string;
  googleMapsUrl: string;
  descriptionSi: string;
  descriptionEn: string;

  // Photos
  primaryImageUrl: string;
  photos: string[];

  activeState: boolean;
}

export const DEFAULT_MUSHROOM_OPTIONS: MushroomFormDropdownOptions = {
  categories: [],
  deliveries: [],
  operatingHours: [],
  badges: [],
  locations: []
};
