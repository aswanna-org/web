export interface AgriLandDealType {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export const SRI_LANKA_PROVINCES = [
  { en: 'Western', si: 'බස්නාහිර' },
  { en: 'Central', si: 'මධ්‍යම' },
  { en: 'Southern', si: 'දකුණ' },
  { en: 'Northern', si: 'උතුර' },
  { en: 'Eastern', si: 'නැගෙනහිර' },
  { en: 'North Western', si: 'වයඹ' },
  { en: 'North Central', si: 'උතුරු මැද' },
  { en: 'Uva', si: 'ඌව' },
  { en: 'Sabaragamuwa', si: 'සබරගමුව' }
];

export const SRI_LANKA_DISTRICTS = [
  { en: 'Ampara', si: 'අම්පාර' },
  { en: 'Anuradhapura', si: 'අනුරාධපුරය' },
  { en: 'Badulla', si: 'බදුල්ල' },
  { en: 'Batticaloa', si: 'මඩකලපුව' },
  { en: 'Colombo', si: 'කොළඹ' },
  { en: 'Galle', si: 'ගාල්ල' },
  { en: 'Gampaha', si: 'ගම්පහ' },
  { en: 'Hambantota', si: 'හම්බන්තොට' },
  { en: 'Jaffna', si: 'යාපනය' },
  { en: 'Kalutara', si: 'කළුතර' },
  { en: 'Kandy', si: 'මහනුවර' },
  { en: 'Kegalle', si: 'කෑගල්ල' },
  { en: 'Kilinochchi', si: 'කිලිනොච්චිය' },
  { en: 'Kurunegala', si: 'කුරුණෑගල' },
  { en: 'Mannar', si: 'මන්නාරම' },
  { en: 'Matale', si: 'මාතලේ' },
  { en: 'Matara', si: 'මාතර' },
  { en: 'Monaragala', si: 'මොනරාගල' },
  { en: 'Mullaitivu', si: 'මුලතිව්' },
  { en: 'Nuwara Eliya', si: 'නුවරඑළිය' },
  { en: 'Polonnaruwa', si: 'පොළොන්නරුව' },
  { en: 'Puttalam', si: 'පුත්තලම' },
  { en: 'Ratnapura', si: 'රත්නපුර' },
  { en: 'Trincomalee', si: 'ත්‍රිකුණාමලය' },
  { en: 'Vavuniya', si: 'වවුනියාව' }
];

export interface AgriLandLocation {
  id: string;
  slug: string;
  activeState: boolean;
  provinceSi: string;
  provinceEn: string;
  districtSi: string;
  districtEn: string;
  divisionalSecretariatSi?: string | null;
  divisionalSecretariatEn?: string | null;
  gramaNiladhariDivisionSi?: string | null;
  gramaNiladhariDivisionEn?: string | null;
  _count?: { agriLands: number };
}

export interface AgriLandDeedType {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandCategory {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandTerrain {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandElephantFence {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandWildlifeThreat {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandBoundaryFencing {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandFarmBuilding {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandIrrigationTech {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandMachineryAccess {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandCrop {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandAccessRoad {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandElectricity {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandWaterSource {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  _count?: { agriLands: number };
}

export interface AgriLandImage {
  id: string;
  slug: string;
  activeState: boolean;
  imageUrl: string;
  isPrimary: boolean;
  agriLandId: string;
  createdAt: string;
}

export interface AgriLandUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
}

export interface AgriLand {
  id: string;
  slug: string;
  activeState: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  titleSi: string;
  titleEn: string;

  userId?: string | null;
  user?: AgriLandUser | null;

  dealTypeId: string;
  dealType?: AgriLandDealType;

  locationId?: string | null;
  location?: AgriLandLocation;

  acres?: number | null;
  roods?: number | null;
  perches?: number | null;
  totalPerches?: number | null;

  deedTypeId?: string | null;
  deedType?: AgriLandDeedType | null;

  landCategoryId?: string | null;
  landCategory?: AgriLandCategory | null;

  terrainId?: string | null;
  terrain?: AgriLandTerrain | null;

  elephantFenceId?: string | null;
  elephantFence?: AgriLandElephantFence | null;

  wildlifeThreatId?: string | null;
  wildlifeThreat?: AgriLandWildlifeThreat | null;

  boundaryFencingId?: string | null;
  boundaryFencing?: AgriLandBoundaryFencing | null;

  farmBuildingId?: string | null;
  farmBuilding?: AgriLandFarmBuilding | null;

  irrigationTechId?: string | null;
  irrigationTech?: AgriLandIrrigationTech | null;

  machineryAccessId?: string | null;
  machineryAccess?: AgriLandMachineryAccess | null;

  isCultivated: boolean;
  cultivatedCrops?: AgriLandCrop[];

  accessRoadId?: string | null;
  accessRoad?: AgriLandAccessRoad | null;

  electricityId?: string | null;
  electricity?: AgriLandElectricity | null;

  waterSourceId?: string | null;
  waterSource?: AgriLandWaterSource | null;

  priceSi?: string | null;
  priceEn?: string | null;
  ownerNameSi?: string | null;
  ownerNameEn?: string | null;
  whatsappNumber?: string | null;
  locationUrl?: string | null;
  additionalDetailsSi?: string | null;
  additionalDetailsEn?: string | null;

  images: AgriLandImage[];

  createdAt: string;
  updatedAt: string;
}

export type MasterTableKey =
  | 'dealTypes'
  | 'locations'
  | 'deedTypes'
  | 'categories'
  | 'terrains'
  | 'elephantFences'
  | 'wildlifeThreats'
  | 'boundaryFencings'
  | 'farmBuildings'
  | 'irrigationTechs'
  | 'machineryAccesses'
  | 'crops'
  | 'accessRoads'
  | 'electricities'
  | 'waterSources';

export interface MasterTableMeta {
  key: MasterTableKey;
  titleEn: string;
  titleSi: string;
  endpoint: string;
  singularEn: string;
  singularSi: string;
}

export const MASTER_TABLES_CONFIG: MasterTableMeta[] = [
  {
    key: 'dealTypes',
    titleEn: 'Deal Types',
    titleSi: 'ගනුදෙනු වර්ග',
    endpoint: '/agri-land-deal-types',
    singularEn: 'Deal Type',
    singularSi: 'ගනුදෙනු වර්ගය'
  },
  {
    key: 'locations',
    titleEn: 'Locations',
    titleSi: 'ස්ථාන / ප්‍රදේශ',
    endpoint: '/agri-land-locations',
    singularEn: 'Location',
    singularSi: 'ස්ථානය'
  },
  {
    key: 'deedTypes',
    titleEn: 'Deed Types',
    titleSi: 'ඔප්පු වර්ග',
    endpoint: '/agri-land-deed-types',
    singularEn: 'Deed Type',
    singularSi: 'ඔප්පු වර්ගය'
  },
  {
    key: 'categories',
    titleEn: 'Land Categories',
    titleSi: 'ඉඩම් වර්ගීකරණ',
    endpoint: '/agri-land-categories',
    singularEn: 'Land Category',
    singularSi: 'ඉඩම් කාණ්ඩය'
  },
  {
    key: 'terrains',
    titleEn: 'Terrains',
    titleSi: 'භූමි පිහිටීම්',
    endpoint: '/agri-land-terrains',
    singularEn: 'Terrain',
    singularSi: 'භූමි පිහිටීම'
  },
  {
    key: 'crops',
    titleEn: 'Cultivated Crops',
    titleSi: 'වගා බෝග',
    endpoint: '/agri-land-crops',
    singularEn: 'Crop',
    singularSi: 'බෝග වර්ගය'
  },
  {
    key: 'elephantFences',
    titleEn: 'Elephant Fences',
    titleSi: 'අලි වැටවල්',
    endpoint: '/agri-land-elephant-fences',
    singularEn: 'Elephant Fence',
    singularSi: 'අලි වැට'
  },
  {
    key: 'wildlifeThreats',
    titleEn: 'Wildlife Threats',
    titleSi: 'වනජීවී තර්ජන',
    endpoint: '/agri-land-wildlife-threats',
    singularEn: 'Wildlife Threat',
    singularSi: 'වනජීවී තර්ජනය'
  },
  {
    key: 'boundaryFencings',
    titleEn: 'Boundary Fencings',
    titleSi: 'මායිම් වැටවල්',
    endpoint: '/agri-land-boundary-fencings',
    singularEn: 'Boundary Fencing',
    singularSi: 'මායිම් වැට'
  },
  {
    key: 'farmBuildings',
    titleEn: 'Farm Buildings',
    titleSi: 'ගොවිපළ ගොඩනැගිලි',
    endpoint: '/agri-land-farm-buildings',
    singularEn: 'Farm Building',
    singularSi: 'ගොඩනැගිල්ල'
  },
  {
    key: 'irrigationTechs',
    titleEn: 'Irrigation Tech',
    titleSi: 'වාරි තාක්ෂණය',
    endpoint: '/agri-land-irrigation-techs',
    singularEn: 'Irrigation Tech',
    singularSi: 'වාරි තාක්ෂණය'
  },
  {
    key: 'machineryAccesses',
    titleEn: 'Machinery Access',
    titleSi: 'යන්ත්‍රෝපකරණ ප්‍රවේශය',
    endpoint: '/agri-land-machinery-accesses',
    singularEn: 'Machinery Access',
    singularSi: 'යන්ත්‍රෝපකරණ ප්‍රවේශය'
  },
  {
    key: 'accessRoads',
    titleEn: 'Access Roads',
    titleSi: 'ප්‍රවේශ මාර්ග',
    endpoint: '/agri-land-access-roads',
    singularEn: 'Access Road',
    singularSi: 'ප්‍රවේශ මාර්ගය'
  },
  {
    key: 'electricities',
    titleEn: 'Electricity Facilities',
    titleSi: 'විදුලි පහසුකම්',
    endpoint: '/agri-land-electricities',
    singularEn: 'Electricity',
    singularSi: 'විදුලි පහසුකම'
  },
  {
    key: 'waterSources',
    titleEn: 'Water Sources',
    titleSi: 'ජල මූලාශ්‍ර',
    endpoint: '/agri-land-water-sources',
    singularEn: 'Water Source',
    singularSi: 'ජල මූලාශ්‍රය'
  }
];
