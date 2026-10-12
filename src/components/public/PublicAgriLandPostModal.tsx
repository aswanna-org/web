import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, Trash2, Loader2, Star, Check, AlertCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  SRI_LANKA_PROVINCES,
  getDistrictsForProvince,
  getDSDsForDistrict,
  getGNDsForDSD
} from '../../data/sriLankaLocations';
import type {
  AgriLandDealType,
  AgriLandLocation,
  AgriLandDeedType,
  AgriLandCategory,
  AgriLandTerrain,
  AgriLandElephantFence,
  AgriLandWildlifeThreat,
  AgriLandBoundaryFencing,
  AgriLandFarmBuilding,
  AgriLandIrrigationTech,
  AgriLandMachineryAccess,
  AgriLandCrop,
  AgriLandAccessRoad,
  AgriLandElectricity,
  AgriLandWaterSource
} from '../../admin/components/agriLand/types';

interface ImageSlot {
  id?: string;
  imageUrl: string;
  isPrimary: boolean;
}

interface PublicAgriLandPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  landToEdit?: any | null;
  dealTypes: AgriLandDealType[];
  locations?: AgriLandLocation[];
  deedTypes: AgriLandDeedType[];
  categories: AgriLandCategory[];
  terrains: AgriLandTerrain[];
  elephantFences?: AgriLandElephantFence[];
  wildlifeThreats?: AgriLandWildlifeThreat[];
  boundaryFencings: AgriLandBoundaryFencing[];
  farmBuildings: AgriLandFarmBuilding[];
  irrigationTechs?: AgriLandIrrigationTech[];
  machineryAccesses?: AgriLandMachineryAccess[];
  crops: AgriLandCrop[];
  accessRoads: AgriLandAccessRoad[];
  electricities: AgriLandElectricity[];
  waterSources: AgriLandWaterSource[];
  apiBaseUrl: string;
  token: string | null;
}

type StepKey = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { num: 1 as StepKey, titleSi: 'මූලික තොරතුරු', titleEn: 'Basic Info' },
  { num: 2 as StepKey, titleSi: 'පිහිටීම', titleEn: 'Location' },
  { num: 3 as StepKey, titleSi: 'ප්‍රමාණය සහ පහසුකම්', titleEn: 'Area & Facilities' },
  { num: 4 as StepKey, titleSi: 'ඡායාරූප', titleEn: 'Photos' },
  { num: 5 as StepKey, titleSi: 'හිමිකරු සහ තහවුරු කිරීම', titleEn: 'Contact & Review' }
];

// Draft Storage Configuration (7 Days TTL)
const DRAFT_STORAGE_PREFIX = 'aswanna_agri_land_draft_';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const getDraftKey = (userId?: string) => `${DRAFT_STORAGE_PREFIX}${userId || 'anonymous'}`;

// Human-friendly error formatter - removes raw database / system error codes and translates to natural language
function formatUserFriendlyError(err: any, isSi: boolean, context?: 'upload' | 'submit'): string {
  if (!err) {
    return isSi ? 'නොදන්නා දෝෂයක් ඇති විය.' : 'An unknown error occurred.';
  }

  const rawMsg = String(typeof err === 'string' ? err : err.message || err.error || '').trim();
  const lower = rawMsg.toLowerCase();

  // JavaScript runtime errors (not defined, TypeError, ReferenceError)
  if (
    lower.includes('not defined') ||
    lower.includes('referenceerror') ||
    lower.includes('typeerror') ||
    lower.includes('cannot read property') ||
    lower.includes('cannot read properties')
  ) {
    return isSi
      ? 'දත්ත සැකසීමේදී තාක්ෂණික දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.'
      : 'A technical processing error occurred. Please try again.';
  }

  // Network / Connection errors
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network error') ||
    lower.includes('connection refused') ||
    lower.includes('err_connection')
  ) {
    return isSi
      ? 'සම්බන්ධතා දෝෂයකි. කරුණාකර ඔබගේ අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න.'
      : 'Network connection error. Please check your internet connection and try again.';
  }

  // Authentication errors
  if (
    lower.includes('unauthorized') ||
    lower.includes('not authenticated') ||
    lower.includes('jwt') ||
    lower.includes('token') ||
    lower.includes('log in') ||
    lower.includes('401')
  ) {
    return isSi
      ? 'ඔබගේ පිවිසුම් කාලය අවසන් වී ඇත. කරුණාකර නැවත ලොග් වී උත්සාහ කරන්න.'
      : 'Your session has expired. Please log in again to continue.';
  }

  // Permission errors
  if (lower.includes('forbidden') || lower.includes('not authorized') || lower.includes('403')) {
    return isSi
      ? 'මෙම දැන්වීම පළ කිරීමට හෝ වෙනස් කිරීමට ඔබට අවසර නොමැත.'
      : 'You do not have permission to post or update this listing.';
  }

  // File size / Payload too large
  if (
    lower.includes('file too large') ||
    lower.includes('payload too large') ||
    lower.includes('entity too large') ||
    lower.includes('413') ||
    lower.includes('size limit')
  ) {
    return isSi
      ? 'ඡායාරූප ගොනුවේ ප්‍රමාණය විශාල වැඩිය (උපරිම 5MB). කරුණාකර කුඩා ඡායාරූපයක් තෝරන්න.'
      : 'Photo file size is too large (maximum 5MB). Please select a smaller photo.';
  }

  // Duplicate / Unique constraint (Prisma P2002 or slug collision)
  if (
    lower.includes('p2002') ||
    lower.includes('unique constraint') ||
    lower.includes('already exists') ||
    lower.includes('duplicate') ||
    lower.includes('slug')
  ) {
    return isSi
      ? 'මෙම නමින් හෝ තොරතුරු වලින් යුතු දැන්වීමක් දැනටමත් ලියාපදිංචි කර ඇත. කරුණාකර මාතෘකාව සුළු වශයෙන් වෙනස් කර නැවත උත්සාහ කරන්න.'
      : 'A listing with this title or details already exists. Please adjust the title slightly and try again.';
  }

  // Prisma or raw DB codes
  if (/p\d{4}/i.test(rawMsg) || lower.includes('prisma') || lower.includes('foreign key')) {
    return isSi
      ? 'දත්ත පද්ධතියේ සැකසීමේ දෝෂයක් ඇති විය. කරුණාකර සියලු තොරතුරු නිවැරදි දැයි පරීක්ෂා කර නැවත උත්සාහ කරන්න.'
      : 'A database error occurred. Please verify your details and try again.';
  }

  // Image Upload context
  if (context === 'upload' || lower.includes('upload') || lower.includes('image')) {
    return isSi
      ? 'ඡායාරූපය උඩුගත කිරීම අසාර්ථක විය. කරුණාකර වලංගු JPG හෝ PNG ඡායාරූපයක් තෝරන්න.'
      : 'Photo upload failed. Please choose a valid JPG or PNG image.';
  }

  // Validation / Required fields
  if (
    lower.includes('required') ||
    lower.includes('validation') ||
    lower.includes('invalid') ||
    lower.includes('bad request') ||
    lower.includes('400')
  ) {
    if (lower.includes('phone') || lower.includes('whatsapp') || lower.includes('contact')) {
      return isSi
        ? 'කරුණාකර නිවැරදි දුරකථන හෝ WhatsApp අංකයක් ඇතුළත් කරන්න.'
        : 'Please enter a valid phone or WhatsApp number.';
    }
    if (lower.includes('title')) {
      return isSi
        ? 'කරුණාකර ඉඩමේ නම / සිරස්තලය ඇතුළත් කරන්න.'
        : 'Please enter a valid land title.';
    }
    if (lower.includes('deal') || lower.includes('type')) {
      return isSi
        ? 'කරුණාකර ගනුදෙනු වර්ගය තෝරන්න.'
        : 'Please select a deal type.';
    }
    if (lower.includes('district') || lower.includes('location')) {
      return isSi
        ? 'කරුණාකර ඉඩම පිහිටි දිස්ත්‍රික්කය තෝරන්න.'
        : 'Please select the district where the land is located.';
    }
    return isSi
      ? 'ඇතුළත් කළ තොරතුරු කිහිපයක් අසම්පූර්ණයි. කරුණාකර සියලු අනිවාර්ය තොරතුරු නිවැරදිව පුරවා නැවත උත්සාහ කරන්න.'
      : 'Some required details are missing or invalid. Please check your inputs and try again.';
  }

  // Internal Server Error
  if (lower.includes('500') || lower.includes('internal server error')) {
    return isSi
      ? 'සේවාදායකයේ තාවකාලික දෝෂයක් ඇති විය. කරුණාකර සුළු මොහොතකින් නැවත උත්සාහ කරන්න.'
      : 'A temporary server error occurred. Please try again in a moment.';
  }

  // Clean custom message if it's already plain human-readable language (no code syntax)
  if (
    !lower.includes('error:') &&
    !lower.includes('object object') &&
    !lower.includes('exception') &&
    !lower.includes('stack') &&
    rawMsg.length < 120
  ) {
    return rawMsg;
  }

  // Default clean fallback
  return isSi
    ? 'දත්ත ඇතුළත් කිරීමේදී දෝෂයක් ඇති විය. කරුණාකර තොරතුරු පරීක්ෂා කර නැවත උත්සාහ කරන්න.'
    : 'An error occurred while submitting your listing. Please check the details and try again.';
}

export default function PublicAgriLandPostModal({
  isOpen,
  onClose,
  onSuccess,
  landToEdit,
  dealTypes = [],
  locations = [],
  deedTypes = [],
  categories = [],
  terrains = [],
  boundaryFencings = [],
  farmBuildings = [],
  crops = [],
  accessRoads = [],
  electricities = [],
  waterSources = [],
  apiBaseUrl,
  token
}: PublicAgriLandPostModalProps) {
  const { i18n } = useTranslation();
  const isSi = i18n.language === 'si';
  const { user, isAuthenticated, openLoginModal } = useAuth();

  const [currentStep, setCurrentStep] = useState<StepKey>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stepTransitionTimeRef = useRef<number>(0);

  // Draft persistence state
  const [draftRestored, setDraftRestored] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [dealTypeId, setDealTypeId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceDescription, setPriceDescription] = useState('');

  // Location
  const [slProvince, setSlProvince] = useState('Western');
  const [slDistrict, setSlDistrict] = useState('Colombo');
  const [slDsd, setSlDsd] = useState('');
  const [slGnd, setSlGnd] = useState('');
  const [locationUrl, setLocationUrl] = useState('');

  // Area & Facilities
  const [acres, setAcres] = useState('');
  const [roods, setRoods] = useState('');
  const [perches, setPerches] = useState('');
  const [deedTypeId, setDeedTypeId] = useState('');
  const [terrainId, setTerrainId] = useState('');
  const [electricityId, setElectricityId] = useState('');
  const [waterSourceId, setWaterSourceId] = useState('');
  const [accessRoadId, setAccessRoadId] = useState('');
  const [boundaryFencingId, setBoundaryFencingId] = useState('');
  const [farmBuildingId, setFarmBuildingId] = useState('');
  const [isCultivated, setIsCultivated] = useState(false);
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([]);

  // Photos (Max 6)
  const [imagesList, setImagesList] = useState<ImageSlot[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [directImageUrl, setDirectImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Contact
  const [ownerName, setOwnerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Calculations
  const calculatedTotalPerches = useMemo(() => {
    const a = parseFloat(acres) || 0;
    const r = parseFloat(roods) || 0;
    const p = parseFloat(perches) || 0;
    if (a === 0 && r === 0 && p === 0) return null;
    return a * 160 + r * 40 + p;
  }, [acres, roods, perches]);

  const districtList = useMemo(() => {
    return getDistrictsForProvince(slProvince);
  }, [slProvince]);

  const dsdList = useMemo(() => {
    return slDistrict ? getDSDsForDistrict(slDistrict) : [];
  }, [slDistrict]);

  const gndList = useMemo(() => {
    return slDsd ? getGNDsForDSD(slDsd, slDistrict) : [];
  }, [slDsd, slDistrict]);

  // Load either landToEdit or restored draft on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setError(null);

      if (landToEdit) {
        setDraftRestored(false);
        setTitle(landToEdit.titleSi || landToEdit.titleEn || landToEdit.title || '');
        setDealTypeId(landToEdit.dealTypeId || landToEdit.dealType?.id || (dealTypes[0]?.id || ''));
        setCategoryId(landToEdit.landCategoryId || landToEdit.categoryId || landToEdit.landCategory?.id || (categories[0]?.id || ''));
        setPriceDescription(landToEdit.priceSi || landToEdit.priceEn || landToEdit.priceFormatted || '');
        const prov = landToEdit.location?.provinceEn?.replace(' Province', '') || landToEdit.provinceEn?.replace(' Province', '') || 'Western';
        setSlProvince(prov);
        setSlDistrict(landToEdit.location?.districtEn || landToEdit.districtEn || 'Colombo');
        setSlDsd(landToEdit.location?.divisionalSecretariatEn || landToEdit.divisionalSecretariatEn || '');
        setSlGnd(landToEdit.location?.gramaNiladhariDivisionEn || landToEdit.gramaNiladhariDivisionEn || '');
        setLocationUrl(landToEdit.locationUrl || '');
        setAcres(landToEdit.acres !== null && landToEdit.acres !== undefined ? String(landToEdit.acres) : '');
        setRoods(landToEdit.roods !== null && landToEdit.roods !== undefined ? String(landToEdit.roods) : '');
        setPerches(landToEdit.perches !== null && landToEdit.perches !== undefined ? String(landToEdit.perches) : '');
        setDeedTypeId(landToEdit.deedTypeId || landToEdit.deedType?.id || (deedTypes[0]?.id || ''));
        setTerrainId(landToEdit.terrainId || landToEdit.terrain?.id || '');
        setElectricityId(landToEdit.electricityId || landToEdit.electricity?.id || '');
        setWaterSourceId(landToEdit.waterSourceId || landToEdit.waterSource?.id || '');
        setAccessRoadId(landToEdit.accessRoadId || landToEdit.accessRoad?.id || '');
        setBoundaryFencingId(landToEdit.boundaryFencingId || landToEdit.boundaryFencing?.id || '');
        setFarmBuildingId(landToEdit.farmBuildingId || landToEdit.farmBuilding?.id || '');
        setIsCultivated(Boolean(landToEdit.isCultivated));
        setSelectedCropIds(landToEdit.cultivatedCrops?.map((c: any) => c.id) || []);
        if (Array.isArray(landToEdit.images) && landToEdit.images.length > 0) {
          setImagesList(
            landToEdit.images.slice(0, 6).map((img: any, idx: number) => ({
              id: img.id,
              imageUrl: typeof img === 'string' ? img : (img.imageUrl || img.url),
              isPrimary: img.isPrimary !== undefined ? Boolean(img.isPrimary) : idx === 0
            }))
          );
        } else if (landToEdit.image) {
          setImagesList([{ imageUrl: landToEdit.image, isPrimary: true }]);
        } else {
          setImagesList([]);
        }
        setOwnerName(landToEdit.ownerNameSi || landToEdit.ownerNameEn || user?.name || '');
        setWhatsappNumber(landToEdit.whatsappNumber || '');
        setAdditionalDetails(landToEdit.additionalDetailsSi || landToEdit.additionalDetailsEn || '');
      } else {
        // Check for 7-day draft for the logged in user
        const draftKey = getDraftKey(user?.id);
        const rawDraft = localStorage.getItem(draftKey) || (user?.id ? localStorage.getItem(getDraftKey('anonymous')) : null);
        let restored = false;

        if (rawDraft) {
          try {
            const parsed = JSON.parse(rawDraft);
            const now = Date.now();
            if (parsed && parsed.savedAt && (now - parsed.savedAt <= DRAFT_TTL_MS)) {
              // Valid draft within 7 days
              const d = parsed.data || {};
              setTitle(d.title || '');
              setDealTypeId(d.dealTypeId || (dealTypes[0]?.id || ''));
              setCategoryId(d.categoryId || (categories[0]?.id || ''));
              setPriceDescription(d.priceDescription || '');
              setSlProvince(d.slProvince || 'Western');
              setSlDistrict(d.slDistrict || 'Colombo');
              setSlDsd(d.slDsd || '');
              setSlGnd(d.slGnd || '');
              setLocationUrl(d.locationUrl || '');
              setAcres(d.acres || '');
              setRoods(d.roods || '');
              setPerches(d.perches || '');
              setDeedTypeId(d.deedTypeId || (deedTypes[0]?.id || ''));
              setTerrainId(d.terrainId || '');
              setElectricityId(d.electricityId || '');
              setWaterSourceId(d.waterSourceId || '');
              setAccessRoadId(d.accessRoadId || '');
              setBoundaryFencingId(d.boundaryFencingId || '');
              setFarmBuildingId(d.farmBuildingId || '');
              setIsCultivated(Boolean(d.isCultivated));
              setSelectedCropIds(Array.isArray(d.selectedCropIds) ? d.selectedCropIds : []);
              setImagesList(Array.isArray(d.imagesList) ? d.imagesList : []);
              setDirectImageUrl('');
              setOwnerName(d.ownerName || user?.name || '');
              setWhatsappNumber(d.whatsappNumber || '');
              setAdditionalDetails(d.additionalDetails || '');
              if (d.currentStep && [1, 2, 3, 4, 5].includes(d.currentStep)) {
                setCurrentStep(d.currentStep as StepKey);
              }
              setDraftRestored(true);
              restored = true;
            } else {
              // Expired draft (> 7 days)
              localStorage.removeItem(draftKey);
              if (user?.id) localStorage.removeItem(getDraftKey('anonymous'));
            }
          } catch {
            localStorage.removeItem(draftKey);
          }
        }

        if (!restored) {
          setDraftRestored(false);
          setTitle('');
          setDealTypeId(dealTypes[0]?.id || '');
          setCategoryId(categories[0]?.id || '');
          setPriceDescription('');
          setSlProvince('Western');
          setSlDistrict('Colombo');
          setSlDsd('');
          setSlGnd('');
          setLocationUrl('');
          setAcres('');
          setRoods('');
          setPerches('');
          setDeedTypeId(deedTypes[0]?.id || '');
          setTerrainId('');
          setElectricityId('');
          setWaterSourceId('');
          setAccessRoadId('');
          setBoundaryFencingId('');
          setFarmBuildingId('');
          setIsCultivated(false);
          setSelectedCropIds([]);
          setImagesList([]);
          setDirectImageUrl('');
          setOwnerName(user?.name || '');
          setWhatsappNumber('');
          setAdditionalDetails('');
        }
      }
      stepTransitionTimeRef.current = Date.now();
    }
  }, [isOpen, landToEdit, dealTypes, categories, deedTypes, user]);

  // Auto-save form as draft for logged in user (valid for 7 days)
  useEffect(() => {
    if (!isOpen || landToEdit) return;

    const hasContent = Boolean(
      title.trim() ||
      priceDescription.trim() ||
      slDsd.trim() ||
      slGnd.trim() ||
      locationUrl.trim() ||
      acres ||
      roods ||
      perches ||
      terrainId ||
      whatsappNumber.trim() ||
      additionalDetails.trim() ||
      imagesList.length > 0
    );

    if (!hasContent) return;

    const timer = setTimeout(() => {
      const draftPayload = {
        savedAt: Date.now(),
        userId: user?.id || null,
        data: {
          title,
          dealTypeId,
          categoryId,
          priceDescription,
          slProvince,
          slDistrict,
          slDsd,
          slGnd,
          locationUrl,
          acres,
          roods,
          perches,
          deedTypeId,
          terrainId,
          electricityId,
          waterSourceId,
          accessRoadId,
          boundaryFencingId,
          farmBuildingId,
          isCultivated,
          selectedCropIds,
          imagesList,
          ownerName,
          whatsappNumber,
          additionalDetails,
          currentStep
        }
      };

      try {
        localStorage.setItem(getDraftKey(user?.id), JSON.stringify(draftPayload));
      } catch {
        // quota exceeded or private mode
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    isOpen,
    landToEdit,
    user?.id,
    title,
    dealTypeId,
    categoryId,
    priceDescription,
    slProvince,
    slDistrict,
    slDsd,
    slGnd,
    locationUrl,
    acres,
    roods,
    perches,
    deedTypeId,
    terrainId,
    electricityId,
    waterSourceId,
    accessRoadId,
    boundaryFencingId,
    farmBuildingId,
    isCultivated,
    selectedCropIds,
    imagesList,
    ownerName,
    whatsappNumber,
    additionalDetails,
    currentStep
  ]);

  // Discard draft and reset fields
  const handleDiscardDraft = () => {
    localStorage.removeItem(getDraftKey(user?.id));
    if (user?.id) localStorage.removeItem(getDraftKey('anonymous'));
    setDraftRestored(false);
    setTitle('');
    setDealTypeId(dealTypes[0]?.id || '');
    setCategoryId(categories[0]?.id || '');
    setPriceDescription('');
    setSlProvince('Western');
    setSlDistrict('Colombo');
    setSlDsd('');
    setSlGnd('');
    setLocationUrl('');
    setAcres('');
    setRoods('');
    setPerches('');
    setDeedTypeId(deedTypes[0]?.id || '');
    setTerrainId('');
    setElectricityId('');
    setWaterSourceId('');
    setAccessRoadId('');
    setBoundaryFencingId('');
    setFarmBuildingId('');
    setIsCultivated(false);
    setSelectedCropIds([]);
    setImagesList([]);
    setDirectImageUrl('');
    setOwnerName(user?.name || '');
    setWhatsappNumber('');
    setAdditionalDetails('');
    setCurrentStep(1);
    setError(null);
  };

  if (!isOpen) return null;

  // Step Navigation
  const goToStep = (step: StepKey) => {
    if (step > currentStep) {
      if (currentStep === 1) {
        if (!title.trim()) {
          setError(isSi ? 'කරුණාකර ඉඩමේ නම ඇතුළත් කරන්න.' : 'Please enter the land title.');
          return;
        }
        if (!dealTypeId) {
          setError(isSi ? 'කරුණාකර ගනුදෙනු වර්ගය තෝරන්න.' : 'Please select a deal type.');
          return;
        }
      }
      if (currentStep === 2 && !slDistrict) {
        setError(isSi ? 'කරුණාකර දිස්ත්‍රික්කය තෝරන්න.' : 'Please select the district.');
        return;
      }
    }
    setError(null);
    setCurrentStep(step);
    stepTransitionTimeRef.current = Date.now();
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!title.trim()) {
        setError(isSi ? 'කරුණාකර ඉඩමේ නම ඇතුළත් කරන්න.' : 'Please enter the land title.');
        return;
      }
      if (!dealTypeId) {
        setError(isSi ? 'කරුණාකර ගනුදෙනු වර්ගය තෝරන්න.' : 'Please select a deal type.');
        return;
      }
    } else if (currentStep === 2 && !slDistrict) {
      setError(isSi ? 'කරුණාකර දිස්ත්‍රික්කය තෝරන්න.' : 'Please select the district.');
      return;
    }
    setError(null);
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as StepKey);
      stepTransitionTimeRef.current = Date.now();
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepKey);
      stepTransitionTimeRef.current = Date.now();
    }
  };

  // Image Upload Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = 6 - imagesList.length;
    if (availableSlots <= 0) {
      setError(isSi ? 'උපරිම ඡායාරූප 6ක් පමණක් එකතු කළ හැක.' : 'Maximum 6 photos allowed.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    setUploadingFiles(true);
    setError(null);

    try {
      const newUploaded: ImageSlot[] = [];
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${apiBaseUrl}/agri-land-images/upload`, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: formData
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }

        const uploadedUrl = data.url || data.imageUrl || data.data?.imageUrl;
        if (uploadedUrl) {
          const isFirst = imagesList.length === 0 && newUploaded.length === 0;
          newUploaded.push({ imageUrl: uploadedUrl, isPrimary: isFirst });
        }
      }

      setImagesList((prev) => {
        const combined = [...prev, ...newUploaded];
        if (!combined.some((img) => img.isPrimary) && combined.length > 0) {
          combined[0].isPrimary = true;
        }
        return combined.slice(0, 6);
      });
    } catch (err: any) {
      setError(formatUserFriendlyError(err, isSi, 'upload'));
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddDirectUrl = () => {
    if (!directImageUrl.trim()) return;
    if (imagesList.length >= 6) {
      setError(isSi ? 'උපරිම ඡායාරූප 6ක් සම්පූර්ණයි.' : 'Maximum 6 photos reached.');
      return;
    }
    const isFirst = imagesList.length === 0;
    setImagesList((prev) => [...prev, { imageUrl: directImageUrl.trim(), isPrimary: isFirst }]);
    setDirectImageUrl('');
    setError(null);
  };

  const setPrimaryImage = (index: number) => {
    setImagesList((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  };

  const removeImage = (index: number) => {
    setImagesList((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const toggleCrop = (cId: string) => {
    setSelectedCropIds((prev) =>
      prev.includes(cId) ? prev.filter((id) => id !== cId) : [...prev, cId]
    );
  };

  // Final Explicit Submit
  const handleFinalSubmit = async () => {
    if (Date.now() - stepTransitionTimeRef.current < 400) {
      return;
    }

    if (!isAuthenticated || !token) {
      openLoginModal();
      return;
    }

    if (!title.trim()) {
      setError(isSi ? 'කරුණාකර ඉඩමේ නම ඇතුළත් කරන්න.' : 'Please enter the land title.');
      setCurrentStep(1);
      return;
    }

    if (!dealTypeId) {
      setError(isSi ? 'කරුණාකර ගනුදෙනු වර්ගය තෝරන්න.' : 'Please select a deal type.');
      setCurrentStep(1);
      return;
    }

    if (!slDistrict) {
      setError(isSi ? 'කරුණාකර දිස්ත්‍රික්කය තෝරන්න.' : 'Please select the district.');
      setCurrentStep(2);
      return;
    }

    if (!whatsappNumber.trim()) {
      setError(isSi ? 'කරුණාකර WhatsApp හෝ දුරකථන අංකය ඇතුළත් කරන්න.' : 'Please enter contact phone number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const prov = SRI_LANKA_PROVINCES.find((p) => p.en.toLowerCase() === slProvince.toLowerCase());
      const dist = prov?.districts.find((d) => d.en.toLowerCase() === slDistrict.toLowerCase());
      const currentDsdList = getDSDsForDistrict(slDistrict);
      const dsd = currentDsdList.find((d) => d.nameEn.toLowerCase() === slDsd.toLowerCase() || d.nameSi === slDsd);
      const currentGndList = slDsd ? getGNDsForDSD(slDsd, slDistrict) : [];
      const gnd = currentGndList.find((g) => g.nameEn.toLowerCase() === slGnd.toLowerCase() || g.nameSi === slGnd);

      // Resolve locationId safely from locations prop or landToEdit
      const safeLocList = Array.isArray(locations) ? locations : [];
      const matchedLoc = safeLocList.find((loc) =>
        loc?.districtEn?.toLowerCase() === slDistrict.toLowerCase() &&
        (!slDsd || loc?.divisionalSecretariatEn?.toLowerCase() === slDsd.toLowerCase()) &&
        (!slGnd || loc?.gramaNiladhariDivisionEn?.toLowerCase() === slGnd.toLowerCase())
      ) || safeLocList.find((loc) =>
        loc?.districtEn?.toLowerCase() === slDistrict.toLowerCase()
      );
      const resolvedLocId = landToEdit?.locationId || matchedLoc?.id || null;

      const finalImages = imagesList.map((img, idx) => ({
        ...(img.id ? { id: img.id } : {}),
        imageUrl: img.imageUrl,
        isPrimary: imagesList.some((m) => m.isPrimary) ? img.isPrimary : idx === 0
      }));

      const cleanTitle = title.trim();
      const cleanPrice = priceDescription.trim() || null;
      const cleanOwner = ownerName.trim() || null;
      const cleanDetails = additionalDetails.trim() || null;

      const payload = {
        titleEn: cleanTitle,
        titleSi: cleanTitle,
        dealTypeId,
        landCategoryId: categoryId || null,
        locationId: resolvedLocId || null,
        provinceEn: slProvince,
        provinceSi: prov?.si || `${slProvince} පළාත`,
        districtEn: slDistrict,
        districtSi: dist?.si || slDistrict,
        divisionalSecretariatEn: dsd?.nameEn || slDsd || null,
        divisionalSecretariatSi: dsd?.nameSi || dsd?.nameEn || slDsd || null,
        gramaNiladhariDivisionEn: gnd?.nameEn || slGnd || null,
        gramaNiladhariDivisionSi: gnd?.nameSi || gnd?.nameEn || slGnd || null,
        locationUrl: locationUrl.trim() || null,
        priceEn: cleanPrice,
        priceSi: cleanPrice,
        acres: acres ? parseFloat(acres) : null,
        roods: roods ? parseFloat(roods) : null,
        perches: perches ? parseFloat(perches) : null,
        totalPerches: calculatedTotalPerches,
        deedTypeId: deedTypeId || null,
        terrainId: terrainId || null,
        electricityId: electricityId || null,
        waterSourceId: waterSourceId || null,
        accessRoadId: accessRoadId || null,
        boundaryFencingId: boundaryFencingId || null,
        farmBuildingId: farmBuildingId || null,
        isCultivated,
        cultivatedCropIds: isCultivated ? selectedCropIds : [],
        ownerNameEn: cleanOwner,
        ownerNameSi: cleanOwner,
        whatsappNumber: whatsappNumber.trim(),
        additionalDetailsEn: cleanDetails,
        additionalDetailsSi: cleanDetails,
        activeState: true,
        images: finalImages
      };

      const url = landToEdit
        ? `${apiBaseUrl}/agri-lands/${landToEdit.id}`
        : `${apiBaseUrl}/agri-lands`;
      const method = landToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
      }

      // Clear draft for user on successful submission
      localStorage.removeItem(getDraftKey(user?.id));
      if (user?.id) localStorage.removeItem(getDraftKey('anonymous'));
      setDraftRestored(false);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(formatUserFriendlyError(err, isSi, 'submit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDealType = dealTypes.find((d) => d.id === dealTypeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl md:max-w-4xl lg:max-w-5xl bg-white rounded-2xl shadow-2xl border border-gray-200/90 flex flex-col my-auto max-h-[92vh]">
        {/* Clean Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                {isSi
                  ? (landToEdit ? 'ඉඩම් තොරතුරු සංස්කරණය' : 'ඉඩමක් ලැයිස්තුගත කිරීම')
                  : (landToEdit ? 'Edit Land Listing' : 'List Agricultural Land')}
              </h2>
              {!landToEdit && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full font-medium">
                  <FileText size={10} />
                  {isSi ? 'දින 7ක් කෙටුම්පත් වේ' : 'Auto-saved for 7 days'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isSi
                ? (landToEdit ? 'ඔබගේ ඉඩමේ යාවත්කාලීන තොරතුරු ඇතුළත් කරන්න' : 'පියවර 5කින් ඔබගේ ඉඩමේ තොරතුරු ඇතුළත් කරන්න')
                : (landToEdit ? 'Update your land listing details' : 'Fill in the details to publish your land listing')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Minimal Step Indicator */}
        <div className="border-b border-gray-200 bg-gray-50/70 px-4 sm:px-6 py-2.5 shrink-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-between gap-1 sm:gap-2 min-w-max md:min-w-0 w-full">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;
              return (
                <React.Fragment key={step.num}>
                  <button
                    type="button"
                    onClick={() => goToStep(step.num)}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer text-left shrink-0"
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition shrink-0 ${
                        isActive
                          ? 'bg-[#006837] text-white shadow-xs'
                          : isDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isDone ? <Check size={11} className="stroke-[2.5]" /> : step.num}
                    </span>
                    <span className={isActive ? 'text-gray-900 font-semibold' : isDone ? 'text-gray-700' : 'text-gray-500'}>
                      {isSi ? step.titleSi : step.titleEn}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-px bg-gray-200 mx-1 hidden md:block min-w-3" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Restored Draft Banner (Valid for 7 Days) */}
        {draftRestored && !landToEdit && (
          <div className="mx-4 sm:mx-6 mt-3 px-3.5 py-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-900 text-xs flex items-center justify-between gap-3 shrink-0 animate-fadeIn shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">
                {isSi
                  ? 'ඔබ මීට පෙර ඇතුළත් කළ කෙටුම්පත ප්‍රතිස්ථාපනය කරන ලදී (දින 7ක් වලංගුයි).'
                  : 'Your previously saved draft has been restored (valid for 7 days).'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="text-red-600 hover:text-red-700 font-semibold underline underline-offset-2 transition-colors cursor-pointer shrink-0 text-[11px]"
            >
              {isSi ? 'කෙටුම්පත ඉවත් කරන්න' : 'Discard Draft'}
            </button>
          </div>
        )}

        {/* User-Friendly Error Notification (Without raw technical error codes) */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-3 px-3.5 py-2.5 bg-red-50/95 border border-red-200 text-red-700 rounded-xl text-xs font-medium shrink-0 flex items-start justify-between gap-2 animate-fadeIn shadow-xs">
            <div className="flex items-start gap-2">
              <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-700 p-0.5 rounded transition cursor-pointer shrink-0"
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* STEP 1: Basic & Pricing */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {isSi ? 'ඉඩමේ නම / සිරස්තලය' : 'Land Title'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isSi
                      ? 'උදා: කුරුණෑගල අක්කර 5ක පොල් ඉඩම'
                      : 'e.g. 5-Acre Coconut Land in Kurunegala'
                  }
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  {isSi ? 'සිංහල හෝ English භාෂාවෙන් ඇතුළත් කළ හැක' : 'Enter in Sinhala or English'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isSi ? 'ගනුදෙනු වර්ගය' : 'Deal Type'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dealTypeId}
                    onChange={(e) => setDealTypeId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] cursor-pointer"
                  >
                    <option value="">{isSi ? '-- තෝරන්න --' : '-- Select Deal Type --'}</option>
                    {dealTypes.map((dt) => (
                      <option key={dt.id} value={dt.id}>
                        {isSi && dt.nameSi ? dt.nameSi : dt.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isSi ? 'ඉඩම් කාණ්ඩය' : 'Land Category'}
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] cursor-pointer"
                  >
                    <option value="">{isSi ? '-- තෝරන්න (විකල්පයි) --' : '-- Select Category --'}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isSi && c.nameSi ? c.nameSi : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isSi ? 'මිල සහ කොන්දේසි' : 'Price & Terms'}
                  </label>
                  <input
                    type="text"
                    value={priceDescription}
                    onChange={(e) => setPriceDescription(e.target.value)}
                    placeholder={
                      isSi
                        ? 'උදා: රු. 2,500,000 / අක්කරයකට (සාකච්ඡා කරගත හැක)'
                        : 'e.g. LKR 2,500,000 / Per Acre (Negotiable)'
                    }
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isSi ? 'පළාත' : 'Province'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={slProvince}
                    onChange={(e) => {
                      const newProv = e.target.value;
                      setSlProvince(newProv);
                      const newDistricts = getDistrictsForProvince(newProv);
                      if (newDistricts.length > 0) {
                        setSlDistrict(newDistricts[0].en);
                        setSlDsd('');
                        setSlGnd('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] cursor-pointer"
                  >
                    {SRI_LANKA_PROVINCES.map((p) => (
                      <option key={p.en} value={p.en}>
                        {isSi ? p.si : p.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isSi ? 'දිස්ත්‍රික්කය' : 'District'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={slDistrict}
                    onChange={(e) => {
                      setSlDistrict(e.target.value);
                      setSlDsd('');
                      setSlGnd('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] cursor-pointer"
                  >
                    {districtList.map((d) => (
                      <option key={d.en} value={d.en}>
                        {isSi ? d.si : d.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isSi ? 'ප්‍රාදේශීය ලේකම් කොට්ඨාසය (DSD)' : 'Divisional Secretariat (DSD)'}
                  </label>
                  <select
                    value={slDsd}
                    onChange={(e) => {
                      setSlDsd(e.target.value);
                      setSlGnd('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] cursor-pointer"
                  >
                    <option value="">{isSi ? '-- තෝරන්න (විකල්පයි) --' : '-- Select (Optional) --'}</option>
                    {dsdList.map((d) => (
                      <option key={d.id || d.nameEn} value={d.nameEn}>
                        {isSi && d.nameSi ? d.nameSi : d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isSi ? 'ග්‍රාම නිලධාරී වසම (GND)' : 'Grama Niladhari Division (GND)'}
                  </label>
                  <select
                    value={slGnd}
                    onChange={(e) => setSlGnd(e.target.value)}
                    disabled={!slDsd}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer"
                  >
                    <option value="">{isSi ? '-- තෝරන්න (විකල්පයි) --' : '-- Select (Optional) --'}</option>
                    {gndList.map((g) => (
                      <option key={g.id || g.gnCode || g.nameEn} value={g.nameEn}>
                        {isSi && g.nameSi ? g.nameSi : g.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {isSi ? 'Google Maps සබැඳිය' : 'Google Maps Link'} <span className="text-gray-400 font-normal">({isSi ? 'විකල්පයි' : 'Optional'})</span>
                </label>
                <input
                  type="url"
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Area & Facilities */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {isSi ? 'ඉඩමේ ප්‍රමාණය' : 'Land Size'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="block text-[11px] text-gray-500 mb-1">{isSi ? 'අක්කර' : 'Acres'}</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={acres}
                      onChange={(e) => setAcres(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837]"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 mb-1">{isSi ? 'රූඩ්' : 'Roods'}</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max="3"
                      value={roods}
                      onChange={(e) => setRoods(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837]"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 mb-1">{isSi ? 'පර්චස්' : 'Perches'}</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={perches}
                      onChange={(e) => setPerches(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837]"
                    />
                  </div>
                </div>
                {calculatedTotalPerches !== null && (
                  <p className="text-xs text-gray-600 mt-1.5 font-medium">
                    {isSi ? 'මුළු පර්චස් ප්‍රමාණය:' : 'Total Perches:'}{' '}
                    <span className="font-semibold text-gray-900">{calculatedTotalPerches} Perches</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isSi ? 'ඔප්පු වර්ගය' : 'Deed Type'}
                  </label>
                  <select
                    value={deedTypeId}
                    onChange={(e) => setDeedTypeId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] cursor-pointer"
                  >
                    <option value="">{isSi ? '-- තෝරන්න (විකල්පයි) --' : '-- Select Deed Type --'}</option>
                    {deedTypes.map((dt) => (
                      <option key={dt.id} value={dt.id}>
                        {isSi && dt.nameSi ? dt.nameSi : dt.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isSi ? 'භූමි ස්වභාවය' : 'Terrain'}
                  </label>
                  <select
                    value={terrainId}
                    onChange={(e) => setTerrainId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] cursor-pointer"
                  >
                    <option value="">{isSi ? '-- තෝරන්න (විකල්පයි) --' : '-- Select Terrain --'}</option>
                    {terrains.map((t) => (
                      <option key={t.id} value={t.id}>
                        {isSi && t.nameSi ? t.nameSi : t.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    {isSi ? 'විදුලිය' : 'Electricity'}
                  </label>
                  <select
                    value={electricityId}
                    onChange={(e) => setElectricityId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] cursor-pointer"
                  >
                    <option value="">{isSi ? '-- තෝරන්න --' : '-- Select --'}</option>
                    {electricities.map((item) => (
                      <option key={item.id} value={item.id}>
                        {isSi && item.nameSi ? item.nameSi : item.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    {isSi ? 'ජල මූලාශ්‍රය' : 'Water Source'}
                  </label>
                  <select
                    value={waterSourceId}
                    onChange={(e) => setWaterSourceId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] cursor-pointer"
                  >
                    <option value="">{isSi ? '-- තෝරන්න --' : '-- Select --'}</option>
                    {waterSources.map((item) => (
                      <option key={item.id} value={item.id}>
                        {isSi && item.nameSi ? item.nameSi : item.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    {isSi ? 'ප්‍රවේශ මාර්ගය' : 'Access Road'}
                  </label>
                  <select
                    value={accessRoadId}
                    onChange={(e) => setAccessRoadId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] cursor-pointer"
                  >
                    <option value="">{isSi ? '-- තෝරන්න --' : '-- Select --'}</option>
                    {accessRoads.map((item) => (
                      <option key={item.id} value={item.id}>
                        {isSi && item.nameSi ? item.nameSi : item.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    {isSi ? 'මායිම් වැට' : 'Boundary Fencing'}
                  </label>
                  <select
                    value={boundaryFencingId}
                    onChange={(e) => setBoundaryFencingId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] cursor-pointer"
                  >
                    <option value="">{isSi ? '-- තෝරන්න --' : '-- Select --'}</option>
                    {boundaryFencings.map((item) => (
                      <option key={item.id} value={item.id}>
                        {isSi && item.nameSi ? item.nameSi : item.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    {isSi ? 'ගොඩනැගිලි' : 'Farm Buildings'}
                  </label>
                  <select
                    value={farmBuildingId}
                    onChange={(e) => setFarmBuildingId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] cursor-pointer"
                  >
                    <option value="">{isSi ? '-- තෝරන්න --' : '-- Select --'}</option>
                    {farmBuildings.map((item) => (
                      <option key={item.id} value={item.id}>
                        {isSi && item.nameSi ? item.nameSi : item.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cultivated Switch & Crops */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="block text-xs font-medium text-gray-800">
                      {isSi ? 'දැනටමත් වගා කර ඇති ඉඩමක්ද?' : 'Is this land currently cultivated?'}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {isSi ? 'පොල්, තේ, කුරුඳු ආදී පවතින වගාවන් තෝරන්න' : 'Select if there are active crops on the land'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCultivated(!isCultivated)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                      isCultivated ? 'bg-[#006837]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        isCultivated ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {isCultivated && crops.length > 0 && (
                  <div className="mt-2.5 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="block text-xs font-medium text-gray-700 mb-2">
                      {isSi ? 'පවතින වගාවන් තෝරන්න:' : 'Select Crops:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {crops.map((c) => {
                        const isSelected = selectedCropIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleCrop(c.id)}
                            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer border ${
                              isSelected
                                ? 'bg-[#006837] text-white border-[#006837]'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {isSi && c.nameSi ? c.nameSi : c.nameEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Photos */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Minimal Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-6 text-center cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition"
              >
                {uploadingFiles ? (
                  <div className="flex flex-col items-center justify-center py-2 text-gray-600">
                    <Loader2 size={24} className="animate-spin mb-1.5 text-gray-500" />
                    <p className="text-xs font-medium">{isSi ? 'උඩුගත වෙමින් පවතී...' : 'Uploading...'}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Upload size={20} className="text-gray-400 mb-1.5" />
                    <p className="text-xs font-medium text-gray-700">
                      {isSi ? 'ඡායාරූප තෝරන්න' : 'Click to select photos'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      JPG, PNG, WEBP (උපරිම 6ක්) • {imagesList.length}/6 Uploaded
                    </p>
                  </div>
                )}
              </div>

              {/* Direct URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={directImageUrl}
                  onChange={(e) => setDirectImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg (Image URL)"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837]"
                />
                <button
                  type="button"
                  onClick={handleAddDirectUrl}
                  disabled={!directImageUrl.trim() || imagesList.length >= 6}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium transition disabled:opacity-50 cursor-pointer"
                >
                  {isSi ? 'එක් කරන්න' : 'Add URL'}
                </button>
              </div>

              {/* Thumbnails */}
              {imagesList.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
                  {imagesList.map((slot, idx) => (
                    <div
                      key={idx}
                      className={`relative group rounded-lg overflow-hidden aspect-square border bg-gray-100 ${
                        slot.isPrimary ? 'border-[#006837] ring-1 ring-[#006837]' : 'border-gray-200'
                      }`}
                    >
                      <img src={slot.imageUrl} alt="" className="w-full h-full object-cover" />

                      {slot.isPrimary && (
                        <div className="absolute top-1 left-1 bg-black/75 text-white text-[9px] px-1 py-0.2 rounded font-medium">
                          Cover
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          title="Set as Cover"
                          className="p-1 rounded bg-white text-gray-700 hover:text-[#006837] transition cursor-pointer"
                        >
                          <Star size={13} className={slot.isPrimary ? 'fill-[#006837] text-[#006837]' : ''} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          title="Delete"
                          className="p-1 rounded bg-white text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Contact & Review */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isSi ? 'හිමිකරුගේ නම' : 'Owner / Contact Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder={isSi ? 'උදා: බණ්ඩාර මහතා' : 'e.g. Mr. Bandara'}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isSi ? 'WhatsApp / දුරකථන අංකය' : 'WhatsApp / Contact Number'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="0771234567"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {isSi ? 'අමතර විස්තර' : 'Additional Details'}
                </label>
                <textarea
                  rows={3}
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder={
                    isSi
                      ? 'ඉඩමේ තත්ත්වය, අස්වැන්න, ආසන්න වැදගත් ස්ථාන ආදී වැඩිදුර විස්තර ඇතුළත් කරන්න...'
                      : 'Provide details regarding land condition, yield, nearby landmarks...'
                  }
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] resize-none"
                />
              </div>

              {/* Review Summary */}
              <div className="border border-gray-200 rounded-lg p-3.5 bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-xs font-semibold text-gray-800">
                    {isSi ? 'දැන්වීමේ සාරාංශය' : 'Summary'}
                  </span>
                  <span className="text-[11px] text-gray-600 font-medium">
                    {selectedDealType ? (isSi && selectedDealType.nameSi ? selectedDealType.nameSi : selectedDealType.nameEn) : 'Listing'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">{isSi ? 'නම:' : 'Title:'}</span>{' '}
                    <span className="font-medium text-gray-900">{title || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{isSi ? 'ස්ථානය:' : 'Location:'}</span>{' '}
                    <span className="font-medium text-gray-900">
                      {slDistrict}, {slProvince}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{isSi ? 'ප්‍රමාණය:' : 'Size:'}</span>{' '}
                    <span className="font-medium text-gray-900">
                      {acres ? `${acres} Acres ` : ''}
                      {perches ? `${perches} Perches` : ''}
                      {!acres && !perches ? 'Not specified' : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{isSi ? 'මිල:' : 'Price:'}</span>{' '}
                    <span className="font-medium text-gray-900">{priceDescription || 'Negotiable'}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                {isSi
                  ? (landToEdit
                      ? 'සංස්කරණය කළ පසු, යාවත්කාලීන තොරතුරු පරිපාලක (Admin) අනුමැතියෙන් පසු වෙබ් අඩවියේ ප්‍රසිද්ධ කෙරේ.'
                      : 'දැන්වීම ඉදිරිපත් කළ පසු අපගේ පරිපාලක (Admin) කණ්ඩායම විසින් පරීක්ෂා කර අනුමත කළ පසුව එය වෙබ් අඩවියේ ප්‍රසිද්ධ කෙරේ.')
                  : (landToEdit
                      ? 'Once updated, your changes will be republished following administrator review.'
                      : 'Once submitted, your listing will be published following administrator verification.')}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>{isSi ? 'ආපසු' : 'Previous'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition cursor-pointer"
              >
                {isSi ? 'අවලංගු කරන්න' : 'Cancel'}
              </button>
            )}
          </div>

          <div>
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1 px-4 py-1.5 bg-[#006837] hover:bg-[#00532c] text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
              >
                <span>{isSi ? 'ඊළඟට' : 'Next'}</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-1.5 bg-[#006837] hover:bg-[#00532c] text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{isSi ? 'සුරකිමින් පවතී...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <span>
                    {isSi
                      ? (landToEdit ? 'යාවත්කාලීන කරන්න' : 'දැන්වීම පළ කරන්න')
                      : (landToEdit ? 'Update Listing' : 'Publish Listing')}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
