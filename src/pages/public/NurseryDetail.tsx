import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Phone, MessageSquare, ExternalLink, Share2, ArrowLeft,
  ChevronLeft, ChevronRight, ShieldCheck, Truck,
  Clock, Award, AlertCircle, Check, Sprout,
  Store, User, Navigation, Sparkles, Tag, Info
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import type { NurseryItem } from '../../admin/components/nursery/types';

export default function NurseryDetail() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [nursery, setNursery] = useState<NurseryItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const targetIdentifier = slug || id;

  useEffect(() => {
    if (!targetIdentifier) return;
    fetchNurseryDetail();
  }, [targetIdentifier]);

  const fetchNurseryDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      setActiveImageIndex(0);

      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }

      // Try fetching by slug endpoint first
      let res = await fetch(`${API_BASE_URL}/nurseries/slug/${encodeURIComponent(targetIdentifier!)}`, { headers });
      
      // If not found or error, try by id
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/nurseries/${encodeURIComponent(targetIdentifier!)}`, { headers });
      }

      if (!res.ok) {
        throw new Error('පැළ තවාන සොයාගත නොහැක (Plant nursery not found)');
      }

      const json = await res.json();
      const data = json.data || json;

      if (!data) {
        throw new Error('පැළ තවාන සොයාගත නොහැක');
      }

      setNursery(data);
    } catch (err: any) {
      console.error('Error fetching nursery detail:', err);
      setError(err.message || 'තොරතුරු ලබා ගැනීමට නොහැකි විය');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: (nursery && (isSinhala ? nursery.nameSi || nursery.nameEn : nursery.nameEn || nursery.nameSi)) || 'Aswanna Plant Nursery',
          text: (nursery && (nursery.nameEn || nursery.nameSi) ? `Check out ${nursery.nameEn || nursery.nameSi} on Aswanna!` : 'Aswanna Plant Nursery'),
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <AgroLoader
          message={isSinhala ? 'පැළ තවානේ විස්තර පූරණය වෙමින් පවතී...' : 'Loading plant nursery details...'}
          subMessage="Aswanna Smart Plant Finder"
        />
      </div>
    );
  }

  if (error || !nursery) {
    return (
      <div className="w-full min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {error || 'පැළ තවාන සොයාගත නොහැක'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isSinhala
              ? 'ඔබ සොයන පැළ තවාන ඉවත් කර හෝ තවමත් අනුමත කර නොමැත.'
              : 'The plant nursery you are looking for does not exist or is pending review.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/plant-finder')}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#006837] text-white rounded-xl text-sm font-semibold hover:bg-[#00522c] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              {isSinhala ? 'පැළ සොයන්නා වෙත' : 'Back to Plant Finder'}
            </button>
            <button
              onClick={fetchNurseryDetail}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {isSinhala ? 'නැවත උත්සාහ කරන්න' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format details
  const primaryName = (isSinhala ? (nursery.nameSi || nursery.nameEn) : (nursery.nameEn || nursery.nameSi)) || 'Plant Nursery';
  const secondaryName = isSinhala ? nursery.nameEn : nursery.nameSi;
  const description = isSinhala ? (nursery.descriptionSi || nursery.descriptionEn) : (nursery.descriptionEn || nursery.descriptionSi);

  const images = (nursery.images && nursery.images.length > 0)
    ? nursery.images
    : [{ id: 'fallback', imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80', isPrimary: true }];

  const activeImage = images[activeImageIndex] || images[0];

  // Contact helpers
  const cleanPhone = (phone?: string | null) => {
    if (!phone) return '';
    return phone.replace(/[^0-9+]/g, '');
  };

  const getWhatsAppLink = (number?: string | null) => {
    const raw = cleanPhone(number);
    if (!raw) return '#';
    let formatted = raw.replace('+', '');
    if (formatted.startsWith('0')) {
      formatted = '94' + formatted.slice(1);
    }
    const message = encodeURIComponent(`ආයුබෝවන්, මම අස්වැන්න (Aswanna) හරහා ඔබේ ${primaryName} පැළ තවාන දුටුවෙමි. වැඩි විස්තර දැනගැනීමට කැමැත්තෙමි.`);
    return `https://wa.me/${formatted}?text=${message}`;
  };

  const districtDisplay = isSinhala
    ? nursery.location?.districtSi || nursery.location?.districtEn
    : nursery.location?.districtEn || nursery.location?.districtSi;

  const dsdDisplay = isSinhala
    ? nursery.location?.divisionalSecretariatSi || nursery.location?.divisionalSecretariatEn
    : nursery.location?.divisionalSecretariatEn || nursery.location?.divisionalSecretariatSi;

  const provinceDisplay = isSinhala
    ? nursery.location?.provinceSi || nursery.location?.provinceEn
    : nursery.location?.provinceEn || nursery.location?.provinceSi;

  const locationDisplay = [
    nursery.location?.fullAddressSi || nursery.location?.fullAddressEn,
    dsdDisplay,
    districtDisplay,
    provinceDisplay,
    'Sri Lanka'
  ].filter(Boolean).join(', ');

  const defaultHeroImage = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1600&q=80';
  const heroImage = (nursery.images && nursery.images.length > 0 && nursery.images[0]?.imageUrl)
    ? nursery.images[0].imageUrl
    : defaultHeroImage;

  const getGoogleMapsLink = () => {
    if (nursery.googleMapsUrl && nursery.googleMapsUrl.startsWith('http')) {
      return nursery.googleMapsUrl;
    }
    const query = [
      nursery.nameEn || nursery.nameSi,
      nursery.location?.fullAddressEn || nursery.location?.fullAddressSi,
      nursery.location?.divisionalSecretariatEn,
      nursery.location?.districtEn,
      'Sri Lanka'
    ].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  // SEO details
  const pageTitle = `${primaryName} - පැළ තවාන | Plant Nursery - Aswanna`;
  const pageDesc = description
    ? description.slice(0, 160)
    : `${primaryName} - ශ්‍රී ලංකාවේ ගුණාත්මක පැළ වර්ග, බද්ධ පැළ සහ පැළ තවාන් තොරතුරු. Aswanna Plant Finder.`;

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-16">
      <SEO
        title={pageTitle}
        description={pageDesc}
        image={heroImage}
        canonical={`/plant-finder/nursery/${nursery.slug}`}
      />

      {/* Page Hero Header */}
      <PageHero
        title={primaryName}
        subtitle={
          nursery.grade
            ? (isSinhala
                ? `${nursery.grade.nameSi || nursery.grade.nameEn} • ${districtDisplay || 'ශ්‍රී ලංකාව'}`
                : `${nursery.grade.nameEn} • ${districtDisplay || 'Sri Lanka'}`)
            : (districtDisplay || (isSinhala ? 'ලියාපදිංචි පැළ තවාන' : 'Registered Plant Nursery'))
        }
        description={locationDisplay}
        image={heroImage}
        gradientColor="#006837"
        icon={Sprout}
        badgeBg="bg-[#006837]"
        waveColor="text-gray-50"
      />

      {/* Main Container */}
      <div className="container mx-auto px-4 lg:px-12 pt-6 sm:pt-8 pb-12 space-y-6">
        {/* Navigation & Action Bar */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate('/plant-finder');
                }
              }}
              className="inline-flex items-center gap-2 pl-2 sm:pl-2.5 pr-3.5 sm:pr-4 py-1 sm:py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200/80 hover:border-emerald-300 text-gray-800 font-bold text-xs sm:text-sm shadow-xs transition-all group cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/80 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform shrink-0">
                <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>{isSinhala ? 'සියලු පැළ තවාන් වෙත' : 'Back to Plant Finder'}</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 flex-wrap">
              <Link to="/" className="hover:text-emerald-700 transition-colors">
                {isSinhala ? 'මුල් පිටුව' : 'Home'}
              </Link>
              <ChevronRight size={13} className="text-gray-400" />
              <Link to="/plant-finder" className="hover:text-emerald-700 transition-colors">
                {isSinhala ? 'පැළ සොයන්නා' : 'Plant Finder'}
              </Link>
              {districtDisplay && (
                <>
                  <ChevronRight size={13} className="text-gray-400" />
                  <span className="text-gray-500">{districtDisplay}</span>
                </>
              )}
              <ChevronRight size={13} className="text-gray-400" />
              <span className="text-gray-700 font-semibold truncate max-w-xs">{primaryName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              title={isSinhala ? 'බෙදාගන්න' : 'Share listing'}
            >
              {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copiedLink ? (isSinhala ? 'පිටපත් විය!' : 'Copied!') : (isSinhala ? 'බෙදාගන්න' : 'Share')}</span>
            </button>
          </div>
        </div>

        {/* Pending / Approval Notice for user/admin */}
        {nursery.approvalStatus !== 'APPROVED' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-4 text-xs sm:text-sm text-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <span>
                <strong>{isSinhala ? 'දැනුම්දීමයි:' : 'Notice:'}</strong>{' '}
                {nursery.approvalStatus === 'PENDING'
                  ? (isSinhala
                      ? 'මෙම පැළ තවාන පරිපාලක අනුමැතිය ලැබෙන තෙක් රැඳී පවතී. අනුමත වූ පසු ප්‍රසිද්ධ පිටුවේ දර්ශනය වේ.'
                      : 'This nursery is currently pending admin review. It will become visible on the public listing once approved.')
                  : (isSinhala
                      ? `මෙම පැළ තවාන ප්‍රතික්ෂේප කර ඇත (${nursery.rejectionReason || 'විස්තර නැත'})`
                      : `This nursery submission was rejected: ${nursery.rejectionReason || 'No reason provided'}`)}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 shrink-0">
              {nursery.approvalStatus}
            </span>
          </div>
        )}

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image Gallery & Overview (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Gallery Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4 sm:p-5">
              {/* Main Image */}
              <div className="relative aspect-4/3 sm:aspect-16/10 rounded-xl overflow-hidden bg-gray-100 group">
                <img
                  src={activeImage.imageUrl}
                  alt={activeImage.caption || primaryName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />

                {/* Primary Tag / Verified Tag */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {nursery.isGovRegistered && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/95 text-white text-xs font-bold shadow-sm backdrop-blur-xs">
                      <ShieldCheck size={14} />
                      {isSinhala ? 'කෘෂිකර්ම දෙපාර්තමේන්තුවේ ලියාපදිංචි' : 'Gov Registered'}
                    </span>
                  )}
                  {nursery.grade && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-xs font-bold shadow-sm backdrop-blur-xs">
                      {isSinhala ? nursery.grade.nameSi || nursery.grade.nameEn : nursery.grade.nameEn}
                    </span>
                  )}
                </div>

                {/* Delivery Badge */}
                {nursery.delivery && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-900/80 text-white text-xs font-semibold backdrop-blur-xs shadow-sm">
                      <Truck size={13} />
                      {isSinhala ? nursery.delivery.nameSi || nursery.delivery.nameEn : nursery.delivery.nameEn}
                    </span>
                  </div>
                )}

                {/* Left/Right navigation arrows if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails strip */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2 scrollbar-thin">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        idx === activeImageIndex
                          ? 'border-[#006837] shadow-sm ring-2 ring-[#006837]/20 scale-102'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Overview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Info size={20} className="text-[#006837]" />
                {isSinhala ? 'තවාන පිළිබඳ විස්තරය' : 'About Nursery'}
              </h2>
              {description ? (
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              ) : (
                <p className="text-gray-400 text-sm italic">
                  {isSinhala ? 'විස්තරයක් ඇතුළත් කර නොමැත.' : 'No description provided.'}
                </p>
              )}

              {/* Specialties Tags */}
              {nursery.specialties && nursery.specialties.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                    {isSinhala ? 'විශේෂීකරණයන් (Specialties)' : 'Specialties & Features'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {nursery.specialties.map((spec) => (
                      <span
                        key={spec.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100"
                      >
                        <Tag size={12} className="text-emerald-600" />
                        {isSinhala ? spec.nameSi || spec.nameEn : spec.nameEn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fast Selling Items Section */}
            {nursery.fastSellingItems && nursery.fastSellingItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-500" />
                    {isSinhala ? 'විශේෂයෙන් අලෙවි වන පැළ (Fast-Selling)' : 'Fast-Selling Plant Varieties'}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {nursery.fastSellingItems.length} {isSinhala ? 'වර්ග' : 'items'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {nursery.fastSellingItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-all group"
                    >
                      <div className="w-18 h-18 rounded-lg overflow-hidden bg-gray-200 shrink-0 relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Sprout size={24} />
                          </div>
                        )}
                        {item.badge && (
                          <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-center bg-amber-500 text-white rounded px-1 py-0.5 shadow-xs truncate">
                            {isSinhala ? item.badge.nameSi || item.badge.nameEn : item.badge.nameEn}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col justify-between min-w-0 grow">
                        <div>
                          <h4 className="font-bold text-sm text-gray-800 truncate">
                            {isSinhala
                              ? item.crop?.nameSi || item.crop?.nameEn || 'බෝගය'
                              : item.crop?.nameEn || item.crop?.nameSi || 'Crop'}
                          </h4>
                          {item.variety && (
                            <p className="text-xs text-gray-500 truncate">
                              {isSinhala ? item.variety.nameSi || item.variety.nameEn : item.variety.nameEn}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className="text-xs font-bold text-emerald-700">
                            {isSinhala
                              ? item.priceSi || (item.priceEn ? `රු. ${item.priceEn}` : 'මිල විමසන්න')
                              : (item.priceEn ? `Rs. ${item.priceEn}` : item.priceSi || 'Contact')}
                          </span>

                          {nursery.whatsappNumber && (
                            <a
                              href={`https://wa.me/${cleanPhone(nursery.whatsappNumber).replace('+', '')}?text=${encodeURIComponent(
                                `ආයුබෝවන්, මම ඔබගේ ${primaryName} හි ${item.crop?.nameEn || item.crop?.nameSi || 'පැළය'} (${item.variety?.nameEn || ''}) ගැන විමසීමට කැමැත්තෙමි.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-md text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Inquire via WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Plant Stocks Table / List */}
            {nursery.stocks && nursery.stocks.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Store size={20} className="text-[#006837]" />
                    {isSinhala ? 'දැනට පවතින පැළ තොග (Available Stocks)' : 'Available Plant Stocks'}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {nursery.stocks.length} {isSinhala ? 'වර්ග' : 'varieties'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-500 font-bold uppercase text-[10px]">
                        <th className="px-3 py-2">{isSinhala ? 'බෝගය / ප්‍රභේදය' : 'Crop / Variety'}</th>
                        <th className="px-3 py-2">{isSinhala ? 'කාණ්ඩය' : 'Category'}</th>
                        <th className="px-3 py-2 text-center">{isSinhala ? 'ප්‍රමාණය' : 'Quantity'}</th>
                        <th className="px-3 py-2 text-center">{isSinhala ? 'තත්ත්වය' : 'Grade'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {nursery.stocks.map((stk) => (
                        <tr key={stk.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-3 py-2">
                            <span className="font-semibold text-gray-800 block text-xs">
                              {isSinhala
                                ? stk.crop?.nameSi || stk.crop?.nameEn || '-'
                                : stk.crop?.nameEn || stk.crop?.nameSi || '-'}
                            </span>
                            {stk.variety && (
                              <span className="text-[10px] text-gray-400">
                                {isSinhala ? stk.variety.nameSi || stk.variety.nameEn : stk.variety.nameEn}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {stk.category ? (isSinhala ? stk.category.nameSi || stk.category.nameEn : stk.category.nameEn) : '-'}
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-gray-800">
                            {stk.quantity} <span className="font-normal text-[10px] text-gray-500">{stk.unit || 'plants'}</span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {stk.grade ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {typeof stk.grade === 'string'
                                  ? stk.grade
                                  : (isSinhala ? stk.grade.nameSi || stk.grade.nameEn : stk.grade.nameEn || stk.grade.nameSi)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact Details, Location, Specs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Nursery Identity Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-1">
                  {primaryName}
                </h2>
                {secondaryName && (
                  <p className="text-sm font-medium text-gray-500 mb-3">
                    {secondaryName}
                  </p>
                )}

                {/* Rating / Reg badge */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {nursery.isGovRegistered && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <ShieldCheck size={14} className="text-emerald-700" />
                      {isSinhala ? 'රාජ්‍ය ලියාපදිංචි' : 'Gov Certified'}
                    </span>
                  )}
                  {nursery.grade && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      {isSinhala ? nursery.grade.nameSi || nursery.grade.nameEn : nursery.grade.nameEn}
                    </span>
                  )}
                  {nursery.rating && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                      ⭐ {nursery.rating} / 5.0
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                {nursery.whatsappNumber && (
                  <a
                    href={getWhatsAppLink(nursery.whatsappNumber)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer hover:shadow"
                  >
                    <MessageSquare size={18} />
                    <span>{isSinhala ? 'WhatsApp මගින් විමසන්න' : 'Chat via WhatsApp'}</span>
                  </a>
                )}

                {nursery.hotline && (
                  <a
                    href={`tel:${cleanPhone(nursery.hotline)}`}
                    className="w-full py-3 px-4 bg-[#006837] hover:bg-[#00522c] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer hover:shadow"
                  >
                    <Phone size={18} />
                    <span>{isSinhala ? 'ක්ෂණික ඇමතුම:' : 'Call Hotline:'} {nursery.hotline}</span>
                  </a>
                )}

                <a
                  href={getGoogleMapsLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Navigation size={16} className="text-emerald-700" />
                  <span>{isSinhala ? 'Google Maps හි බලන්න' : 'Open in Google Maps'}</span>
                </a>
              </div>
            </div>

            {/* Nursery Specifications Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-800 pb-3 border-b border-gray-100">
                {isSinhala ? 'තවාන් තොරතුරු (Details)' : 'Nursery Details'}
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm">
                {/* Owner */}
                {(nursery.ownerNameEn || nursery.ownerNameSi) && (
                  <div className="flex items-start gap-3">
                    <User size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-gray-400 text-xs block">{isSinhala ? 'හිමිකරු' : 'Owner / Manager'}</span>
                      <span className="font-semibold text-gray-800">
                        {isSinhala ? nursery.ownerNameSi || nursery.ownerNameEn : nursery.ownerNameEn}
                      </span>
                    </div>
                  </div>
                )}

                {/* Operating Hours */}
                {nursery.operatingHours && (
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-gray-400 text-xs block">{isSinhala ? 'වැඩ කරන වේලාවන්' : 'Operating Hours'}</span>
                      <span className="font-semibold text-gray-800">
                        {isSinhala ? nursery.operatingHours.nameSi || nursery.operatingHours.nameEn : nursery.operatingHours.nameEn}
                      </span>
                    </div>
                  </div>
                )}

                {/* Delivery */}
                {nursery.delivery && (
                  <div className="flex items-start gap-3">
                    <Truck size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-gray-400 text-xs block">{isSinhala ? 'බෙදාහැරීම' : 'Delivery Service'}</span>
                      <span className="font-semibold text-gray-800">
                        {isSinhala ? nursery.delivery.nameSi || nursery.delivery.nameEn : nursery.delivery.nameEn}
                      </span>
                    </div>
                  </div>
                )}

                {/* Registration & Certificate */}
                {nursery.certificateNo && (
                  <div className="flex items-start gap-3">
                    <Award size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-gray-400 text-xs block">{isSinhala ? 'ලියාපදිංචි අංකය' : 'Registration No.'}</span>
                      <span className="font-mono font-semibold text-gray-800">
                        {nursery.certificateNo}
                      </span>
                      {nursery.certification && (
                        <span className="text-gray-500 block text-xs">
                          {isSinhala ? nursery.certification.nameSi || nursery.certification.nameEn : nursery.certification.nameEn}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Website */}
                {nursery.website && (
                  <div className="flex items-start gap-3">
                    <ExternalLink size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-gray-400 text-xs block">{isSinhala ? 'වෙබ් අඩවිය' : 'Website'}</span>
                      <a
                        href={nursery.website.startsWith('http') ? nursery.website : `https://${nursery.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 font-semibold hover:underline break-all"
                      >
                        {nursery.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Address Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-2">
                <MapPin size={18} className="text-[#006837]" />
                {isSinhala ? 'ස්ථානය හා ලිපිනය' : 'Location & Address'}
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-gray-700">
                {nursery.location?.address && (
                  <div>
                    <span className="text-gray-400 text-xs block">{isSinhala ? 'භෞතික ලිපිනය' : 'Physical Address'}</span>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {nursery.location.address}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-gray-400 text-xs block">{isSinhala ? 'දිස්ත්‍රික්කය' : 'District'}</span>
                    <span className="font-semibold text-gray-800">
                      {isSinhala
                        ? nursery.location?.districtSi || nursery.location?.districtEn || '-'
                        : nursery.location?.districtEn || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">{isSinhala ? 'පළාත' : 'Province'}</span>
                    <span className="font-semibold text-gray-800">
                      {isSinhala
                        ? nursery.location?.provinceSi || nursery.location?.provinceEn || '-'
                        : nursery.location?.provinceEn || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">{isSinhala ? 'ප්‍රා.ලේ. කොට්ඨාසය' : 'DS Division'}</span>
                    <span className="font-semibold text-gray-800">
                      {isSinhala
                        ? nursery.location?.divisionalSecretariatSi || nursery.location?.divisionalSecretariatEn || '-'
                        : nursery.location?.divisionalSecretariatEn || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">{isSinhala ? 'ග්‍රාම නිලධාරී වසම' : 'GN Division'}</span>
                    <span className="font-semibold text-gray-800">
                      {isSinhala
                        ? nursery.location?.gramaNiladhariDivisionSi || nursery.location?.gramaNiladhariDivisionEn || '-'
                        : nursery.location?.gramaNiladhariDivisionEn || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registered By User notice */}
            {nursery.user && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  {nursery.user.name ? nursery.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <span className="block font-semibold text-gray-700 truncate">
                    {isSinhala ? 'ලියාපදිංචි සාමාජිකයා:' : 'Listed by user:'} {nursery.user.name || nursery.user.email}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {new Date(nursery.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
