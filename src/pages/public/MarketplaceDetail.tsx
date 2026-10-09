import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Phone,
  User as UserIcon,
  Tag,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  Building2,
  Clock,
  Store,
  Image as ImageIcon
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';

interface MarketplaceImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  slug: string;
}

interface MarketplaceCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameSi: string;
  imageUrl?: string | null;
}

interface MarketplaceItem {
  id: string;
  slug: string;
  titleEn: string;
  titleSi: string;
  districtEn: string;
  districtSi: string;
  locationEn?: string | null;
  locationSi?: string | null;
  priceEn?: string | null;
  priceSi?: string | null;
  phoneNumber?: string | null;
  ownerNameEn?: string | null;
  ownerNameSi?: string | null;
  descriptionEn?: string | null;
  descriptionSi?: string | null;
  activeState: boolean;
  isPublished: boolean;
  createdAt: string;
  categoryId: string;
  category?: MarketplaceCategory;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  images?: MarketplaceImage[];
}

// WhatsApp SVG Icon
const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
  </svg>
);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MarketplaceDetail() {
  const { slug, id } = useParams<{ slug?: string; id?: string; categorySlug?: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSi = i18n.language === 'si';

  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const targetIdentifier = slug || id;

  useEffect(() => {
    if (!targetIdentifier) return;

    setLoading(true);
    setSelectedImageIndex(0);

    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    fetch(`${API_BASE_URL}/marketplace/id-or-slug/${targetIdentifier}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error('Listing not found');
        return res.json();
      })
      .then((json) => {
        setItem(json.data);
      })
      .catch((err) => {
        console.error('Error fetching marketplace item:', err);
        setItem(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [targetIdentifier]);

  const displayTitle = item ? (isSi ? item.titleSi : item.titleEn) : '';
  const displayDistrict = item ? (isSi ? item.districtSi : item.districtEn) : '';
  const displayLocation = item ? (isSi && item.locationSi ? item.locationSi : item.locationEn) : '';
  const displayPrice = item ? (isSi && item.priceSi ? item.priceSi : item.priceEn) : '';
  const displayOwner = item ? (isSi && item.ownerNameSi ? item.ownerNameSi : item.ownerNameEn) : '';

  const images = (item?.images && item.images.length > 0) ? item.images : [];
  const activeImage = images[selectedImageIndex] || images[0];

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayTitle,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const cleanPhone = item?.phoneNumber ? item.phoneNumber.replace(/[^0-9]/g, '') : '';
  const whatsAppPhone = cleanPhone ? (cleanPhone.startsWith('0') ? `94${cleanPhone.slice(1)}` : cleanPhone) : '';

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/50">
        <AgroLoader message={isSi ? 'තොරතුරු පූරණය වෙමින් පවතී...' : 'Loading listing details...'} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-gray-50/50">
        <Building2 className="w-16 h-16 text-gray-300 mb-3" />
        <h2 className="text-xl font-bold text-gray-800">
          {isSi ? 'වෙළඳපල අයිතමය හමු නොවීය' : 'Marketplace Item Not Found'}
        </h2>
        <p className="text-sm text-gray-500 mt-1 max-w-md">
          {isSi
            ? 'මෙම අයිතමය ඉවත් කර හෝ තවමත් පරිපාලක අනුමැතිය ලැබී නොතිබිය හැක.'
            : 'The listing may have expired, been removed, or is awaiting administrator approval.'}
        </p>
        <Link
          to="/marketplace"
          className="mt-5 inline-flex items-center gap-2 bg-[#006837] hover:bg-[#00532c] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition shadow-sm"
        >
          <ArrowLeft size={16} />
          <span>{isSi ? 'වෙළඳපොල වෙත ආපසු' : 'Back to Marketplace'}</span>
        </Link>
      </div>
    );
  }

  const categoryBackUrl = item.category?.slug
    ? `/marketplace/category/${item.category.slug}`
    : '/marketplace';

  const categoryName = item.category
    ? (isSi ? item.category.nameSi : item.category.nameEn)
    : '';

  const descriptionText = isSi
    ? (item.descriptionSi || item.descriptionEn)
    : (item.descriptionEn || item.descriptionSi);

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-20 font-roboto">
      <SEO
        title={`${displayTitle} | Aswanna Marketplace`}
        description={item.descriptionEn || item.descriptionSi || displayTitle}
        image={images[0]?.imageUrl}
      />

      {/* Page Hero Header */}
      <PageHero
        title={displayTitle}
        subtitle={
          categoryName
            ? `${categoryName} • ${displayDistrict}`
            : displayDistrict
        }
        icon={Tag}
        image={images[0]?.imageUrl || "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80"}
        badgeBg="bg-[#2E7D32]"
        waveColor="text-gray-50"
      />

      {/* Main Container */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-12 py-6 sm:py-8 space-y-8">
        {/* Navigation & Breadcrumb Bar (Matching ShortCourses / JobDetail standard) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-emerald-800 transition-colors">
              {isSi ? 'මුල් පිටුව' : 'Home'}
            </Link>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <Link to="/marketplace" className="hover:text-emerald-800 transition-colors">
              {isSi ? 'වෙළඳපොල' : 'Marketplace'}
            </Link>
            {item.category && (
              <>
                <ChevronRight size={14} className="text-gray-400 shrink-0" />
                <Link to={categoryBackUrl} className="hover:text-emerald-800 transition-colors">
                  {categoryName}
                </Link>
              </>
            )}
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-[320px]">
              {displayTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate(categoryBackUrl)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={14} />
              <span>{isSi ? 'ආපසු' : 'Back'}</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition-all cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copiedLink ? (isSi ? 'පිටපත් විය' : 'Copied!') : (isSi ? 'බෙදාහරින්න' : 'Share')}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: Specification sheet, descriptions, and IMAGES AT THE VERY BOTTOM (8 cols) */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* 1. ITEM SPECIFICATION SUMMARY SHEET */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
              <div className="bg-gray-50/90 px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                    <Store size={18} />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900">
                    {isSi ? 'අයිතම විස්තර පත්‍රිකාව' : 'Item Specification Sheet'}
                  </h2>
                </div>

                {categoryName && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-md">
                    {categoryName}
                  </span>
                )}
              </div>

              {/* Form Grid showing only actual data */}
              <div className="p-5 sm:p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 text-xs sm:text-sm">
                  {/* Price */}
                  {displayPrice && (
                    <div className="p-3.5 sm:p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                        {isSi ? 'මිල' : 'Price'}
                      </span>
                      <p className="font-bold text-[#006837] text-base mt-1">
                        {displayPrice}
                      </p>
                    </div>
                  )}

                  {/* District */}
                  <div className="p-3.5 sm:p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      {isSi ? 'දිස්ත්‍රික්කය' : 'District'}
                    </span>
                    <p className="font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                      <MapPin size={14} className="text-rose-500 shrink-0" />
                      <span>{displayDistrict}</span>
                    </p>
                  </div>

                  {/* Location / Town (only if exists) */}
                  {displayLocation && (
                    <div className="p-3.5 sm:p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                        {isSi ? 'ස්ථානය / නගරය' : 'Location / Town'}
                      </span>
                      <p className="font-bold text-gray-900 mt-1 truncate">
                        {displayLocation}
                      </p>
                    </div>
                  )}

                  {/* Seller / Owner Name (only if exists) */}
                  {displayOwner && (
                    <div className="p-3.5 sm:p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                        {isSi ? 'හිමිකරු / විකුණුම්කරු' : 'Seller / Owner'}
                      </span>
                      <p className="font-bold text-gray-900 mt-1 flex items-center gap-1.5 truncate">
                        <UserIcon size={14} className="text-emerald-700 shrink-0" />
                        <span>{displayOwner}</span>
                      </p>
                    </div>
                  )}

                  {/* Phone Number (only if exists) */}
                  {item.phoneNumber && (
                    <div className="p-3.5 sm:p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                        {isSi ? 'දුරකථන අංකය' : 'Phone Number'}
                      </span>
                      <p className="font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                        <Phone size={14} className="text-emerald-700 shrink-0" />
                        <span>{item.phoneNumber}</span>
                      </p>
                    </div>
                  )}

                  {/* Date Posted */}
                  <div className="p-3.5 sm:p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      {isSi ? 'පල කළ දිනය' : 'Date Posted'}
                    </span>
                    <p className="font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-500 shrink-0" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                {/* Description (only if provided) */}
                {descriptionText && (
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <h3 className="text-sm font-bold text-gray-900">
                      {isSi ? 'විස්තරය' : 'Description'}
                    </h3>
                    <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      {descriptionText}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. ITEM IMAGES DISPLAYED AT THE VERY BOTTOM */}
            {images.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
                <div className="bg-gray-50/90 px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                      <ImageIcon size={18} />
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-gray-900">
                      {isSi ? 'අයිතමයේ ඡායාරූප' : 'Item Photos'}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    {images.length} {isSi ? 'ඡායාරූප' : 'Photos'}
                  </span>
                </div>

                <div className="p-5 sm:p-6 md:p-8 space-y-4">
                  {/* Main Display Photo */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[480px] rounded-xl bg-gray-950 overflow-hidden flex items-center justify-center group">
                    <img
                      src={activeImage.imageUrl}
                      alt={displayTitle}
                      className="w-full h-full object-contain"
                    />

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-xs font-semibold">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </div>

                  {/* Thumbnail Selector (if multiple images) */}
                  {images.length > 1 && (
                    <div className="flex gap-2.5 overflow-x-auto pt-2 pb-1">
                      {images.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                            selectedImageIndex === idx
                              ? 'border-emerald-600 scale-105'
                              : 'border-gray-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Price & Seller Contact Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-5">
              {displayPrice && (
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    {isSi ? 'මිල' : 'Price'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#006837] mt-1">
                    {displayPrice}
                  </div>
                </div>
              )}

              {/* Seller Contact & Actions */}
              {item.phoneNumber && (
                <div className="space-y-2.5 pt-2">
                  <a
                    href={`tel:${item.phoneNumber}`}
                    className="w-full bg-[#006837] hover:bg-[#00532c] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <Phone size={16} />
                    <span>{isSi ? 'ඇමතුමක් ලබාගන්න' : 'Call Seller'} ({item.phoneNumber})</span>
                  </a>

                  {whatsAppPhone && (
                    <a
                      href={`https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(
                        `Hello, I am interested in your listing "${displayTitle}" on Aswanna Marketplace.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#1ebc59] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <WhatsAppIcon className="w-4.5 h-4.5" />
                      <span>{isSi ? 'WhatsApp පණිවිඩයක් එවන්න' : 'Chat on WhatsApp'}</span>
                    </a>
                  )}
                </div>
              )}

              {displayOwner && (
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    {isSi ? 'විකුණුම්කරු' : 'Seller'}
                  </span>
                  <p className="font-bold text-gray-800 text-sm mt-0.5 flex items-center gap-1.5">
                    <UserIcon size={14} className="text-emerald-700 shrink-0" />
                    <span>{displayOwner}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
