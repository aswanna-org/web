import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Phone, User as UserIcon, Tag, ArrowLeft,
  ChevronLeft, ChevronRight, Check, Share2,
  Maximize, Layers, Mountain, Zap, Droplets, Compass,
  Truck, Building2, Shield, AlertTriangle, Leaf, ExternalLink,
  CheckCircle2, Copy, Edit3, Clock
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import PublicAgriLandPostModal from '../../components/public/PublicAgriLandPostModal';
import type {
  AgriLandDealType,
  AgriLandDeedType,
  AgriLandCategory,
  AgriLandTerrain,
  AgriLandBoundaryFencing,
  AgriLandFarmBuilding,
  AgriLandCrop,
  AgriLandAccessRoad,
  AgriLandElectricity,
  AgriLandWaterSource
} from '../../admin/components/agriLand/types';

interface Lookup {
  id: string;
  slug?: string;
  nameSi?: string;
  nameEn?: string;
}

interface LandLocation {
  id: string;
  provinceSi?: string;
  provinceEn?: string;
  districtSi?: string;
  districtEn?: string;
  divisionalSecretariatSi?: string | null;
  divisionalSecretariatEn?: string | null;
  gramaNiladhariDivisionSi?: string | null;
  gramaNiladhariDivisionEn?: string | null;
}

interface LandImage {
  id: string;
  imageUrl: string;
  isPrimary?: boolean;
  slug?: string;
}

interface CropItem {
  id: string;
  nameSi?: string;
  nameEn?: string;
}

interface AgriLandDetailData {
  id: string;
  slug: string;
  titleSi: string;
  titleEn: string;
  activeState: boolean;
  approvalStatus?: string;
  userId?: string | null;
  user?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  dealType?: Lookup | null;
  location?: LandLocation | null;
  acres?: number | null;
  roods?: number | null;
  perches?: number | null;
  totalPerches?: number | null;
  deedType?: Lookup | null;
  landCategory?: Lookup | null;
  terrain?: Lookup | null;
  elephantFence?: Lookup | null;
  wildlifeThreat?: Lookup | null;
  boundaryFencing?: Lookup | null;
  farmBuilding?: Lookup | null;
  irrigationTech?: Lookup | null;
  machineryAccess?: Lookup | null;
  accessRoad?: Lookup | null;
  electricity?: Lookup | null;
  waterSource?: Lookup | null;
  isCultivated?: boolean;
  cultivatedCrops?: CropItem[];
  priceSi?: string | null;
  priceEn?: string | null;
  ownerNameSi?: string | null;
  ownerNameEn?: string | null;
  whatsappNumber?: string | null;
  locationUrl?: string | null;
  additionalDetailsSi?: string | null;
  additionalDetailsEn?: string | null;
  images?: LandImage[];
  createdAt?: string;
  updatedAt?: string;

  // Legacy fallback fields
  locationStr?: string;
  descriptionStr?: string;
}

// Crisp WhatsApp SVG Icon
const WhatsAppIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
  </svg>
);

export default function AgroLandDetail() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const { user, token } = useAuth();
  const [land, setLand] = useState<AgriLandDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);

  // Lookups for edit modal
  const [dealTypes, setDealTypes] = useState<AgriLandDealType[]>([]);
  const [categories, setCategories] = useState<AgriLandCategory[]>([]);
  const [deedTypes, setDeedTypes] = useState<AgriLandDeedType[]>([]);
  const [terrains, setTerrains] = useState<AgriLandTerrain[]>([]);
  const [boundaryFencings, setBoundaryFencings] = useState<AgriLandBoundaryFencing[]>([]);
  const [farmBuildings, setFarmBuildings] = useState<AgriLandFarmBuilding[]>([]);
  const [crops, setCrops] = useState<AgriLandCrop[]>([]);
  const [accessRoads, setAccessRoads] = useState<AgriLandAccessRoad[]>([]);
  const [electricities, setElectricities] = useState<AgriLandElectricity[]>([]);
  const [waterSources, setWaterSources] = useState<AgriLandWaterSource[]>([]);
  const [lookupsLoaded, setLookupsLoaded] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const targetIdentifier = slug || id;

  const fetchMasterLookups = async () => {
    if (lookupsLoaded) return;
    try {
      const [
        dtRes, deedRes, catRes, terrRes,
        bfRes, fbRes, crRes, arRes, elRes, wsRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/agri-land-deal-types`),
        fetch(`${API_BASE_URL}/agri-land-deed-types`),
        fetch(`${API_BASE_URL}/agri-land-categories`),
        fetch(`${API_BASE_URL}/agri-land-terrains`),
        fetch(`${API_BASE_URL}/agri-land-boundary-fencings`),
        fetch(`${API_BASE_URL}/agri-land-farm-buildings`),
        fetch(`${API_BASE_URL}/agri-land-crops`),
        fetch(`${API_BASE_URL}/agri-land-access-roads`),
        fetch(`${API_BASE_URL}/agri-land-electricities`),
        fetch(`${API_BASE_URL}/agri-land-water-sources`)
      ]);

      if (dtRes.ok) setDealTypes((await dtRes.json()).data || []);
      if (deedRes.ok) setDeedTypes((await deedRes.json()).data || []);
      if (catRes.ok) setCategories((await catRes.json()).data || []);
      if (terrRes.ok) setTerrains((await terrRes.json()).data || []);
      if (bfRes.ok) setBoundaryFencings((await bfRes.json()).data || []);
      if (fbRes.ok) setFarmBuildings((await fbRes.json()).data || []);
      if (crRes.ok) setCrops((await crRes.json()).data || []);
      if (arRes.ok) setAccessRoads((await arRes.json()).data || []);
      if (elRes.ok) setElectricities((await elRes.json()).data || []);
      if (wsRes.ok) setWaterSources((await wsRes.json()).data || []);
      setLookupsLoaded(true);
    } catch (err) {
      console.error('Error fetching lookups for edit:', err);
    }
  };

  const fetchLandDetail = async () => {
    if (!targetIdentifier) return;
    try {
      setLoading(true);
      setActiveImageIndex(0);

      const authToken = token || localStorage.getItem('token') || localStorage.getItem('admin_token');
      const headers: Record<string, string> = {};
      if (authToken) {
        headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      }

      // 1. Try slug endpoint
      let res = await fetch(`${API_BASE_URL}/agri-lands/slug/${encodeURIComponent(targetIdentifier)}`, { headers });
      
      // 2. If not found, try ID endpoint
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/agri-lands/${encodeURIComponent(targetIdentifier)}`, { headers });
      }

      // 3. Fallback to legacy agrolands if needed
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/agrolands/${encodeURIComponent(targetIdentifier)}`, { headers });
      }

      if (!res.ok) {
        throw new Error('Land listing not found');
      }

      const json = await res.json();
      const data = json.data || json;

      if (data) {
        // Normalize legacy or new
        const normalized: AgriLandDetailData = {
          id: data.id,
          slug: data.slug || data.id,
          titleSi: data.titleSi || data.title || '',
          titleEn: data.titleEn || data.title || '',
          activeState: data.activeState ?? true,
          approvalStatus: data.approvalStatus || 'APPROVED',
          userId: data.userId || data.user?.id || null,
          user: data.user || null,
          dealType: data.dealType || (data.type ? { id: data.type.id || '', nameEn: data.type.name, nameSi: data.type.nameSi } : null),
          location: data.location && typeof data.location === 'object' ? {
            ...data.location,
            provinceSi: data.location.provinceSi || data.provinceSi,
            provinceEn: data.location.provinceEn || data.provinceEn,
            districtSi: data.location.districtSi || data.districtSi,
            districtEn: data.location.districtEn || data.districtEn,
            divisionalSecretariatSi: data.location.divisionalSecretariatSi || data.divisionalSecretariatSi,
            divisionalSecretariatEn: data.location.divisionalSecretariatEn || data.divisionalSecretariatEn,
            gramaNiladhariDivisionSi: data.location.gramaNiladhariDivisionSi || data.gramaNiladhariDivisionSi,
            gramaNiladhariDivisionEn: data.location.gramaNiladhariDivisionEn || data.gramaNiladhariDivisionEn,
          } : (data.districtEn || data.districtSi ? {
            id: 'root-loc',
            provinceSi: data.provinceSi,
            provinceEn: data.provinceEn,
            districtSi: data.districtSi,
            districtEn: data.districtEn,
            divisionalSecretariatSi: data.divisionalSecretariatSi,
            divisionalSecretariatEn: data.divisionalSecretariatEn,
            gramaNiladhariDivisionSi: data.gramaNiladhariDivisionSi,
            gramaNiladhariDivisionEn: data.gramaNiladhariDivisionEn,
          } : null),
          locationStr: typeof data.location === 'string' ? data.location : null,
          acres: data.acres,
          roods: data.roods,
          perches: data.perches,
          totalPerches: data.totalPerches,
          deedType: data.deedType,
          landCategory: data.landCategory,
          terrain: data.terrain,
          elephantFence: data.elephantFence,
          wildlifeThreat: data.wildlifeThreat,
          boundaryFencing: data.boundaryFencing,
          farmBuilding: data.farmBuilding,
          irrigationTech: data.irrigationTech,
          machineryAccess: data.machineryAccess,
          accessRoad: data.accessRoad,
          electricity: data.electricity,
          waterSource: data.waterSource,
          isCultivated: data.isCultivated,
          cultivatedCrops: data.cultivatedCrops || [],
          priceSi: data.priceSi || (data.priceFormatted ? String(data.priceFormatted) : data.price ? `Rs. ${Number(data.price).toLocaleString()}` : null),
          priceEn: data.priceEn || (data.priceFormatted ? String(data.priceFormatted) : data.price ? `Rs. ${Number(data.price).toLocaleString()}` : null),
          ownerNameSi: data.ownerNameSi,
          ownerNameEn: data.ownerNameEn,
          whatsappNumber: data.whatsappNumber || data.contactNumber || null,
          locationUrl: data.locationUrl,
          additionalDetailsSi: data.additionalDetailsSi || data.descriptionSi || data.description || null,
          additionalDetailsEn: data.additionalDetailsEn || data.description || null,
          images: data.images && data.images.length > 0
            ? data.images
            : data.image
            ? [{ id: 'legacy-img', imageUrl: data.image, isPrimary: true }]
            : [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };

        setLand(normalized);
      } else {
        setLand(null);
      }
    } catch (err) {
      console.error('Error fetching agri land detail:', err);
      setLand(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandDetail();
  }, [targetIdentifier]);

  // Check if current user can edit this land
  const isOwner = Boolean(user && land && (land.userId === user.id || (land as any).user?.id === user.id));
  const canEdit = isOwner || user?.role === 'ADMIN';

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setShowEditSuccessModal(true);
    fetchLandDetail();
  };

  const handleShare = async (type?: 'native' | 'copy' | 'whatsapp' | 'facebook') => {
    if (!land) return;
    const socialShareUrl = `${API_BASE_URL}/share/agro-lands/${encodeURIComponent(land.slug || land.id)}`;
    const directPageUrl = window.location.href;
    const shareTitle = `${isSinhala ? (land.titleSi || land.titleEn) : (land.titleEn || land.titleSi)} | Aswanna`;
    const shareText = isSinhala
      ? `${shareTitle} - Aswanna හි පළ කර ඇති කෘෂිකාර්මික ඉඩමේ විස්තර බලන්න:`
      : `Check out this agricultural land on Aswanna: ${shareTitle}`;

    if (!type || type === 'native') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: socialShareUrl
          });
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      }
      setShowShareMenu((prev) => !prev);
      return;
    }

    if (type === 'copy') {
      try {
        await navigator.clipboard.writeText(socialShareUrl);
      } catch {
        await navigator.clipboard.writeText(directPageUrl);
      }
      setCopiedLink(true);
      setTimeout(() => {
        setCopiedLink(false);
        setShowShareMenu(false);
      }, 2500);
    } else if (type === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + '\n' + socialShareUrl)}`, '_blank');
      setShowShareMenu(false);
    } else if (type === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(socialShareUrl)}`, '_blank');
      setShowShareMenu(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-24">
        <AgroLoader message={isSinhala ? 'ඉඩම් විස්තර පූරණය වෙමින් පවතී...' : 'Loading land details...'} />
      </div>
    );
  }

  if (!land) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-24 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-4 shadow-xs">
          <MapPin size={38} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isSinhala ? 'ඉඩම් තොරතුරු හමු නොවීය' : 'Land listing not found'}
        </h2>
        <p className="text-gray-500 text-sm max-w-md mb-6 leading-relaxed">
          {isSinhala
            ? 'ඔබ සොයන ඉඩම් තොරතුරු ඉවත් කර හෝ තවමත් අනුමත වී නොමැත. කරුණාකර වෙනත් ඉඩම් පරීක්ෂා කරන්න.'
            : 'The land listing you are looking for may have been removed or is pending review.'}
        </p>
        <Link
          to="/agro-lands"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#006837] hover:bg-[#00532c] text-white rounded-full font-bold text-sm shadow-sm transition-all"
        >
          <ArrowLeft size={16} />
          <span>{isSinhala ? 'සියලු ඉඩම් වෙත ආපසු' : 'Back to Agri Lands'}</span>
        </Link>
      </div>
    );
  }

  const title = isSinhala ? (land.titleSi || land.titleEn) : (land.titleEn || land.titleSi);
  const dealTypeName = land.dealType
    ? (isSinhala ? (land.dealType.nameSi || land.dealType.nameEn) : (land.dealType.nameEn || land.dealType.nameSi))
    : null;
  const categoryName = land.landCategory
    ? (isSinhala ? (land.landCategory.nameSi || land.landCategory.nameEn) : (land.landCategory.nameEn || land.landCategory.nameSi))
    : null;
  const deedTypeName = land.deedType
    ? (isSinhala ? (land.deedType.nameSi || land.deedType.nameEn) : (land.deedType.nameEn || land.deedType.nameSi))
    : null;
  const terrainName = land.terrain
    ? (isSinhala ? (land.terrain.nameSi || land.terrain.nameEn) : (land.terrain.nameEn || land.terrain.nameSi))
    : null;

  // Format size
  const sizeParts: string[] = [];
  if (land.acres && land.acres > 0) sizeParts.push(isSinhala ? `අක්කර ${land.acres}` : `${land.acres} Acres`);
  if (land.roods && land.roods > 0) sizeParts.push(isSinhala ? `රූඩ් ${land.roods}` : `${land.roods} Roods`);
  if (land.perches && land.perches > 0) sizeParts.push(isSinhala ? `පර්චස් ${land.perches}` : `${land.perches} Perches`);
  const sizeFormatted = sizeParts.length > 0
    ? sizeParts.join(' ')
    : land.totalPerches
    ? (isSinhala ? `පර්චස් ${land.totalPerches}` : `${land.totalPerches} Perches`)
    : null;

  // Format Location
  const districtName = land.location
    ? (isSinhala ? (land.location.districtSi || land.location.districtEn) : land.location.districtEn)
    : null;
  const provinceName = land.location
    ? (isSinhala ? (land.location.provinceSi || land.location.provinceEn) : land.location.provinceEn)
    : null;
  const dsdName = land.location
    ? (isSinhala ? (land.location.divisionalSecretariatSi || land.location.divisionalSecretariatEn) : land.location.divisionalSecretariatEn)
    : null;
  const gndName = land.location
    ? (isSinhala ? (land.location.gramaNiladhariDivisionSi || land.location.gramaNiladhariDivisionEn) : land.location.gramaNiladhariDivisionEn)
    : null;

  // Format Location parts with explicit administrative labels
  const locPartsDetailed = [
    gndName ? (isSinhala ? `${gndName} වසම` : `GN: ${gndName}`) : null,
    dsdName ? (isSinhala ? `${dsdName} ප්‍රා.ලේ.` : `DSD: ${dsdName}`) : null,
    districtName,
    provinceName
  ].filter(Boolean);
  const locationDisplay = locPartsDetailed.length > 0 ? locPartsDetailed.join(', ') : (land.locationStr || 'Sri Lanka');

  // Price text with currency formatting
  const formatDetailPrice = (val?: string | null, isSi = false) => {
    if (!val || !val.trim()) return isSi ? 'මිල සාකච්ඡා කළ හැක' : 'Price on request';
    const str = val.trim();
    if (/[a-zA-Z\u0D80-\u0DFF]/.test(str)) return str;
    const num = parseFloat(str.replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      return `${isSi ? 'රු.' : 'Rs.'} ${num.toLocaleString('en-LK')}`;
    }
    return str;
  };

  const rawPrice = isSinhala ? (land.priceSi || land.priceEn) : (land.priceEn || land.priceSi);
  const priceDisplay = formatDetailPrice(rawPrice, isSinhala);

  const images = land.images && land.images.length > 0 ? land.images : [];
  const activeImage = images[activeImageIndex]?.imageUrl || 'https://images.unsplash.com/photo-1629731215450-4591e1d0ed53?w=1600&q=80';

  const cleanPhone = land.whatsappNumber ? land.whatsappNumber.replace(/[^0-9+]/g, '') : '';
  const waChatText = encodeURIComponent(
    isSinhala
      ? `හෙලෝ, Aswanna හි පළ කර ඇති "${title}" කෘෂිකාර්මික ඉඩම පිළිබඳව වැඩිදුර විස්තර දැනගැනීමට කැමැත්තෙමි.`
      : `Hello, I am interested in your agricultural land listing on Aswanna: "${title}".`
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      <SEO
        title={`${title} - කෘෂිකාර්මික ඉඩම් | Aswanna`}
        description={land.additionalDetailsSi || land.additionalDetailsEn || `${title} in ${locationDisplay}. Agricultural land for sale/lease in Sri Lanka.`}
        image={activeImage}
        canonical={`/agro-lands/${land.slug || land.id}`}
      />

      <PageHero
        title={title}
        description={locationDisplay}
        image="https://images.unsplash.com/photo-1629731215450-4591e1d0ed53?w=1600&q=80"
        gradientColor="#006837"
        icon={MapPin}
        badgeBg="bg-[#006837]"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 pt-10 sm:pt-14 pb-8 relative z-20">
        
        {/* Navigation & Action Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate('/agro-lands');
                }
              }}
              className="inline-flex items-center gap-2 pl-2 sm:pl-2.5 pr-3.5 sm:pr-4 py-1 sm:py-1.5 rounded-full bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-gray-200/80 hover:border-emerald-300 text-gray-900 font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all group cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/80 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform shrink-0">
                <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>{isSinhala ? 'සියලු ඉඩම් වෙත' : 'Back to Agri Lands'}</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <span>/</span>
              <span>{districtName || 'Sri Lanka'}</span>
              <span>/</span>
              <span className="text-gray-700 font-medium truncate max-w-xs">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  fetchMasterLookups();
                  setIsEditModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#006837] border border-emerald-300 font-bold text-xs sm:text-sm shadow-xs transition hover:scale-[1.02] cursor-pointer"
                title={isSinhala ? 'දැන්වීම සංස්කරණය කරන්න' : 'Edit Listing'}
              >
                <Edit3 size={14} className="stroke-[2.5]" />
                <span>{isSinhala ? 'සංස්කරණය' : 'Edit'}</span>
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => handleShare('native')}
                className="inline-flex items-center justify-between gap-2 sm:gap-2.5 pl-3.5 sm:pl-4 pr-1.5 py-1.5 rounded-full bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-gray-200/80 hover:border-emerald-300 text-gray-900 font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all group cursor-pointer"
                title={isSinhala ? 'බෙදාගන්න' : 'Share listing'}
              >
              <span>{copiedLink ? (isSinhala ? 'පිටපත් විය!' : 'Copied!') : (isSinhala ? 'බෙදාගන්න' : 'Share')}</span>
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/80 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                {copiedLink ? (
                  <Check size={14} className="text-emerald-700 stroke-[2.5]" />
                ) : (
                  <Share2 size={13} className="stroke-[2.5]" />
                )}
              </div>
            </button>

            {/* Share Popover Menu */}
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-fadeIn space-y-1">
                <button
                  type="button"
                  onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/80 rounded-xl transition cursor-pointer text-left"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp හරහා</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-blue-700 hover:bg-blue-50/80 rounded-xl transition cursor-pointer text-left"
                >
                  <svg className="w-4 h-4 text-blue-600 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook හි</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition cursor-pointer text-left"
                >
                  <Copy size={15} className="text-gray-500" />
                  <span>{isSinhala ? 'සබැඳිය පිටපත් කරන්න' : 'Copy Link'}</span>
                </button>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Gallery & Details (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Gallery Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 overflow-hidden">
              <div className="relative h-72 sm:h-96 md:h-[450px] rounded-2xl overflow-hidden bg-gray-100 group">
                <img
                  src={activeImage}
                  alt={title}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.dataset.fallbackTried) {
                      target.dataset.fallbackTried = 'true';
                      target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80';
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                  {dealTypeName && (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md bg-emerald-700/90 text-white border border-emerald-500/30">
                      {dealTypeName}
                    </span>
                  )}
                  {categoryName && (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md bg-teal-600/90 text-white border border-teal-400/30">
                      {categoryName}
                    </span>
                  )}
                  {land.isCultivated && (
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md bg-amber-600/90 text-white flex items-center gap-1 border border-amber-400/30">
                      <Leaf size={13} />
                      <span>{isSinhala ? 'වගා කළ ඉඩමකි' : 'Cultivated'}</span>
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                    land.activeState ? 'bg-emerald-600/90 text-white' : 'bg-red-600/90 text-white'
                  }`}>
                    {land.activeState ? (isSinhala ? 'ලබාගත හැක' : 'AVAILABLE') : (isSinhala ? 'විකිණී ඇත' : 'UNAVAILABLE')}
                  </span>
                  {land.approvalStatus === 'PENDING' && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold shadow-md backdrop-blur-md bg-amber-500/95 text-white flex items-center gap-1 border border-amber-300/40">
                      <Clock size={12} />
                      <span>{isSinhala ? 'අනුමැතිය අපේක්ෂිතයි' : 'Pending Review'}</span>
                    </span>
                  )}
                </div>

                {/* Left / Right Carousel Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#006837] shadow-md scale-102 ring-2 ring-emerald-200'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Overview Summary Banner */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="text-emerald-200 text-xs uppercase tracking-wider font-bold block mb-1">
                  {isSinhala ? 'ඉඩමේ මිල' : 'Listing Price'}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                  <Tag className="w-6 h-6 text-emerald-300" />
                  <span>{priceDisplay}</span>
                </div>
              </div>

              {sizeFormatted && (
                <div className="sm:border-l sm:border-emerald-700/60 sm:pl-8">
                  <span className="text-emerald-200 text-xs uppercase tracking-wider font-bold block mb-1">
                    {isSinhala ? 'මුළු ඉඩම් ප්‍රමාණය' : 'Total Extent'}
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Maximize className="w-5 h-5 text-emerald-300" />
                    <span>{sizeFormatted}</span>
                  </div>
                </div>
              )}

              {deedTypeName && (
                <div className="sm:border-l sm:border-emerald-700/60 sm:pl-8">
                  <span className="text-emerald-200 text-xs uppercase tracking-wider font-bold block mb-1">
                    {isSinhala ? 'ඔප්පු වර්ගය' : 'Deed Type'}
                  </span>
                  <div className="text-base sm:text-lg font-bold text-white">
                    {deedTypeName}
                  </div>
                </div>
              )}
            </div>

            {/* Comprehensive Specifications Grid */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Layers className="text-[#006837] w-5 h-5" />
                <span>{isSinhala ? 'ඉඩමේ විශේෂාංග සහ පහසුකම්' : 'Key Specifications & Infrastructure'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* 0. Comprehensive Location Breakdown */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-gray-50 to-emerald-50/30 border border-emerald-100/90 col-span-1 sm:col-span-2 md:col-span-3 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100/70 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#006837] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          {isSinhala ? 'ඉඩම පිහිටි පරිපාලන ප්‍රදේශය (පිහිටීම)' : 'Administrative Location Details'}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium block">
                          {locationDisplay}
                        </span>
                      </div>
                    </div>
                    {land.locationUrl && (
                      <a
                        href={land.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-800 hover:text-emerald-900 bg-white border border-emerald-200 px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                      >
                        <Compass size={13} />
                        <span>{isSinhala ? 'Google Maps හි බලන්න' : 'View on Google Maps'}</span>
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* 1. පළාත */}
                    <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        {isSinhala ? 'පළාත' : 'Province'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 block truncate mt-0.5" title={provinceName || ''}>
                        {provinceName || '—'}
                      </span>
                    </div>

                    {/* 2. දිස්ත්‍රික්කය */}
                    <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        {isSinhala ? 'දිස්ත්‍රික්කය' : 'District'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 block truncate mt-0.5" title={districtName || ''}>
                        {districtName || '—'}
                      </span>
                    </div>

                    {/* 3. ප්‍රාදේශීය ලේකම් කොට්ඨාසය */}
                    <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        {isSinhala ? 'ප්‍රා. ලේ. කොට්ඨාසය' : 'Divisional Secretariat'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 block truncate mt-0.5" title={dsdName || ''}>
                        {dsdName || '—'}
                      </span>
                    </div>

                    {/* 4. ග්‍රාම නිලධාරී වසම */}
                    <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        {isSinhala ? 'ග්‍රාම නිලධාරී වසම' : 'GN Division'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-800 block truncate mt-0.5" title={gndName || ''}>
                        {gndName || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1. Category */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
                    <Layers size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{isSinhala ? 'කාණ්ඩය' : 'Category'}</span>
                    <span className="text-sm font-bold text-gray-900">{categoryName || '—'}</span>
                  </div>
                </div>

                {/* 2. Terrain */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
                    <Mountain size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{isSinhala ? 'භූමි ස්වභාවය' : 'Terrain'}</span>
                    <span className="text-sm font-bold text-gray-900">{terrainName || '—'}</span>
                  </div>
                </div>

                {/* 3. Water Source */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{isSinhala ? 'ජල මූලාශ්‍ර' : 'Water Source'}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {land.waterSource ? (isSinhala ? (land.waterSource.nameSi || land.waterSource.nameEn) : land.waterSource.nameEn) : '—'}
                    </span>
                  </div>
                </div>

                {/* 4. Electricity */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                    <Zap size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{isSinhala ? 'විදුලිබල පහසුකම්' : 'Electricity'}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {land.electricity ? (isSinhala ? (land.electricity.nameSi || land.electricity.nameEn) : land.electricity.nameEn) : '—'}
                    </span>
                  </div>
                </div>

                {/* 5. Access Road */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
                    <Compass size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{isSinhala ? 'ප්‍රවේශ මාර්ගය' : 'Access Road'}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {land.accessRoad ? (isSinhala ? (land.accessRoad.nameSi || land.accessRoad.nameEn) : land.accessRoad.nameEn) : '—'}
                    </span>
                  </div>
                </div>

                {/* 6. Machinery Access */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0">
                    <Truck size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{isSinhala ? 'යන්ත්‍රෝපකරණ ප්‍රවේශය' : 'Machinery Access'}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {land.machineryAccess ? (isSinhala ? (land.machineryAccess.nameSi || land.machineryAccess.nameEn) : land.machineryAccess.nameEn) : '—'}
                    </span>
                  </div>
                </div>

                {/* 7. Irrigation Tech */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-100/80 text-cyan-700 flex items-center justify-center shrink-0">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{isSinhala ? 'වාරිමාර්ග තාක්ෂණය' : 'Irrigation Tech'}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {land.irrigationTech ? (isSinhala ? (land.irrigationTech.nameSi || land.irrigationTech.nameEn) : land.irrigationTech.nameEn) : '—'}
                    </span>
                  </div>
                </div>

                {/* 8. Farm Building */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100/80 text-orange-700 flex items-center justify-center shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{isSinhala ? 'ගොවිපොළ ගොඩනැගිලි' : 'Farm Buildings'}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {land.farmBuilding ? (isSinhala ? (land.farmBuilding.nameSi || land.farmBuilding.nameEn) : land.farmBuilding.nameEn) : '—'}
                    </span>
                  </div>
                </div>

                {/* 9. Boundary Fence */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Shield size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{isSinhala ? 'මායිම් වැට' : 'Boundary Fence'}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {land.boundaryFencing ? (isSinhala ? (land.boundaryFencing.nameSi || land.boundaryFencing.nameEn) : land.boundaryFencing.nameEn) : '—'}
                    </span>
                  </div>
                </div>

                {/* 10. Elephant Fence */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{isSinhala ? 'අලි වැට' : 'Elephant Fence'}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {land.elephantFence ? (isSinhala ? (land.elephantFence.nameSi || land.elephantFence.nameEn) : land.elephantFence.nameEn) : '—'}
                    </span>
                  </div>
                </div>

                {/* 11. Wildlife Threat */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{isSinhala ? 'වනජීවී තර්ජන' : 'Wildlife Threats'}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {land.wildlifeThreat ? (isSinhala ? (land.wildlifeThreat.nameSi || land.wildlifeThreat.nameEn) : land.wildlifeThreat.nameEn) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cultivated Crops section if cultivated */}
              {land.cultivatedCrops && land.cultivatedCrops.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-3">
                    {isSinhala ? 'වගා කර ඇති බෝග වර්ග' : 'Currently Cultivated Crops'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {land.cultivatedCrops.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold text-xs sm:text-sm"
                      >
                        <Leaf size={14} className="text-emerald-600" />
                        <span>{isSinhala ? (c.nameSi || c.nameEn) : (c.nameEn || c.nameSi)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Details & Overview Description */}
            {(land.additionalDetailsSi || land.additionalDetailsEn) && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
                  {isSinhala ? 'වැඩිදුර විස්තර සහ සටහන්' : 'Additional Information & Description'}
                </h3>
                <div className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                  {isSinhala
                    ? (land.additionalDetailsSi || land.additionalDetailsEn)
                    : (land.additionalDetailsEn || land.additionalDetailsSi)}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact & Seller Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Sticky Seller Contact Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-7 space-y-6 lg:sticky lg:top-24">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider block mb-1">
                  {isSinhala ? 'විකිණුම්කරු හෝ හිමිකරු' : 'Land Owner / Contact Person'}
                </span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#006837] flex items-center justify-center font-bold text-lg shrink-0">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                      {isSinhala ? (land.ownerNameSi || land.ownerNameEn || 'Aswanna Land Owner') : (land.ownerNameEn || land.ownerNameSi || 'Aswanna Land Owner')}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {isSinhala ? 'තහවුරු කළ ඉඩම් හිමිකරු' : 'Verified Land Lister'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {land.whatsappNumber ? (
                  <>
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${waChatText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-2xl shadow-md transition-all hover:shadow-lg text-sm cursor-pointer"
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                      <span>{isSinhala ? 'WhatsApp හරහා විමසන්න' : 'Chat on WhatsApp'}</span>
                    </a>

                    <a
                      href={`tel:${cleanPhone}`}
                      className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 font-bold rounded-2xl transition-all text-sm cursor-pointer"
                    >
                      <Phone size={18} className="text-[#006837]" />
                      <span>{land.whatsappNumber}</span>
                    </a>
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-500">
                    {isSinhala
                      ? 'දුරකථන අංකය ලබාගැනීමට කරුණාකර Aswanna පාරිභෝගික සහය අමතන්න.'
                      : 'Please contact Aswanna customer support to inquire about this listing.'}
                  </div>
                )}

                {/* Google Maps Link if available */}
                {land.locationUrl && (
                  <a
                    href={land.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-2xl transition-all text-xs sm:text-sm cursor-pointer"
                  >
                    <ExternalLink size={16} />
                    <span>{isSinhala ? 'Google සිතියමෙහි බලන්න' : 'View on Google Maps'}</span>
                  </a>
                )}

                {/* Edit Button for Owner / Admin */}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      fetchMasterLookups();
                      setIsEditModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-[#006837] border border-emerald-300 font-bold rounded-2xl transition-all text-xs sm:text-sm cursor-pointer shadow-xs"
                  >
                    <Edit3 size={16} />
                    <span>{isSinhala ? 'දැන්වීම සංස්කරණය කරන්න' : 'Edit This Listing'}</span>
                  </button>
                )}
              </div>

              {/* Administrative Location Breakdown */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5 text-xs">
                <span className="font-bold text-gray-700 block text-xs">
                  {isSinhala ? 'පරිපාලන ප්‍රදේශය' : 'Administrative Location'}
                </span>
                {provinceName && (
                  <div className="flex justify-between text-gray-600">
                    <span>{isSinhala ? 'පළාත:' : 'Province:'}</span>
                    <span className="font-semibold text-gray-800">{provinceName}</span>
                  </div>
                )}
                {districtName && (
                  <div className="flex justify-between text-gray-600">
                    <span>{isSinhala ? 'දිස්ත්‍රික්කය:' : 'District:'}</span>
                    <span className="font-semibold text-gray-800">{districtName}</span>
                  </div>
                )}
                {dsdName && (
                  <div className="flex justify-between text-gray-600">
                    <span>{isSinhala ? 'ප්‍රා. ලේ. කොට්ඨාසය:' : 'DSD:'}</span>
                    <span className="font-semibold text-gray-800">{dsdName}</span>
                  </div>
                )}
                {gndName && (
                  <div className="flex justify-between text-gray-600">
                    <span>{isSinhala ? 'ග්‍රාම නිලධාරී වසම:' : 'GND:'}</span>
                    <span className="font-semibold text-gray-800">{gndName}</span>
                  </div>
                )}
              </div>

              {/* Buyer Safety Tips */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 size={16} />
                  <span>{isSinhala ? 'ආරක්ෂිත ගනුදෙනු උපදෙස්' : 'Safety Advice'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-800/90">
                  {isSinhala
                    ? 'ඉඩම පරීක්ෂා කර ඔප්පු, පත්තිරු සහ නීතිමය ලියකියවිලි නීතිඥවරයෙකු ලවා නිසි පරිදි තහවුරු කරගන්න.'
                    : 'Always physically inspect the land and verify deed certificates with a qualified legal professional before making payments.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Land Modal for Owner / Admin */}
      {isEditModalOpen && land && (
        <PublicAgriLandPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          landToEdit={land}
          dealTypes={dealTypes}
          locations={[]}
          deedTypes={deedTypes}
          categories={categories}
          terrains={terrains}
          boundaryFencings={boundaryFencings}
          farmBuildings={farmBuildings}
          crops={crops}
          accessRoads={accessRoads}
          electricities={electricities}
          waterSources={waterSources}
          apiBaseUrl={API_BASE_URL}
          token={token}
        />
      )}

      {/* Success Modal after Editing */}
      {showEditSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 border border-emerald-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {isSinhala ? 'දැන්වීම යාවත්කාලීන විය!' : 'Listing Updated Successfully!'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isSinhala
                ? 'ඔබ විසින් සිදුකළ වෙනස්කම් සාර්ථකව සුරකින ලදී. අපගේ පරිපාලක (Admin) කණ්ඩායම විසින් එය පරීක්ෂා කර අනුමත (Approve) කළ පසු යාවත්කාලීන තොරතුරු ප්‍රසිද්ධියේ දිස්වනු ඇත.'
                : 'Your changes have been saved. The updated listing will be published publicly once reviewed and approved by administrators.'}
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{isSinhala ? 'තත්ත්වය: අනුමැතිය අපේක්ෂිතයි (Pending Review)' : 'Status: Pending Administrator Approval'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowEditSuccessModal(false)}
              className="w-full py-2.5 bg-[#006837] hover:bg-[#00522c] text-white font-bold rounded-xl transition shadow-md cursor-pointer"
            >
              {isSinhala ? 'තේරුම් ගත්තා' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
