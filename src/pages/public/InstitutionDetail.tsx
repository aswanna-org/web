import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Search,
  Check,
  Clock,
  BookOpen,
  ClipboardList,
  Building,
  ArrowLeft,
  Copy,
  Zap,
  Share2,
  PhoneCall,
  Sparkles,
  FileText,
  Download
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import {
  type InstitutionDocument
} from '../../data/agriInstitutionsData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RegionalCenter {
  nameSi?: string;
  nameEn?: string;
  locationSi?: string;
  locationEn?: string;
  phone?: string;
}

export default function InstitutionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [institution, setInstitution] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [centerSearch, setCenterSearch] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;

    setIsLoading(true);
    fetch(`${API_BASE_URL}/institutions/slug/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setInstitution(data);
      })
      .catch((err) => {
        console.error('Failed to load institution details:', err);
        setInstitution(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Extract services
  const servicesList: string[] = useMemo(() => {
    if (!institution) return [];
    if (Array.isArray(institution.services)) {
      return institution.services
        .map((s: any) => (isSinhala ? s.serviceSi || s.serviceEn : s.serviceEn || s.serviceSi))
        .filter(Boolean);
    }
    const list = isSinhala
      ? institution.servicesSi || institution.servicesEn
      : institution.servicesEn || institution.servicesSi;

    if (Array.isArray(list)) {
      return list
        .map((item: any) => (typeof item === 'string' ? item : isSinhala ? item.serviceSi || item.serviceEn : item.serviceEn || item.serviceSi))
        .filter(Boolean);
    }
    if (typeof list === 'string') {
      try {
        const parsed = JSON.parse(list);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item: any) => (typeof item === 'string' ? item : isSinhala ? item.serviceSi || item.serviceEn : item.serviceEn || item.serviceSi))
            .filter(Boolean);
        }
      } catch {
        return list.split('\n').filter(Boolean);
      }
    }
    return [];
  }, [institution, isSinhala]);

  // Extract regional centers
  const regionalCentersList: RegionalCenter[] = useMemo(() => {
    if (!institution || !institution.regionalCenters) return [];
    const centers = institution.regionalCenters;
    if (Array.isArray(centers)) return centers;
    if (typeof centers === 'string') {
      try {
        const parsed = JSON.parse(centers);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  }, [institution]);

  const filteredCenters = useMemo(() => {
    if (!centerSearch.trim()) return regionalCentersList;
    const q = centerSearch.toLowerCase();
    return regionalCentersList.filter((center) => {
      const name = (isSinhala ? center.nameSi || center.nameEn : center.nameEn || center.nameSi) || '';
      const loc = (isSinhala ? center.locationSi || center.locationEn : center.locationEn || center.locationSi) || '';
      return name.toLowerCase().includes(q) || loc.toLowerCase().includes(q);
    });
  }, [regionalCentersList, centerSearch, isSinhala]);

  // Extract documents
  const documentsList: InstitutionDocument[] = useMemo(() => {
    if (!institution || !institution.documents) return [];
    const docs = institution.documents;
    if (Array.isArray(docs)) return docs;
    if (typeof docs === 'string') {
      try {
        const parsed = JSON.parse(docs);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  }, [institution]);

  if (isLoading) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center bg-[#f8faf8]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-gray-500">
            {isSinhala ? 'ආයතන විස්තර පූරණය වෙමින් පවතී...' : 'Loading institution details...'}
          </p>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center bg-[#f8faf8] p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-gray-100 shadow-sm">
          <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800">
            {isSinhala ? 'ආයතනය සොයාගත නොහැකි විය' : 'Institution Not Found'}
          </h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            {isSinhala ? 'ඔබ සොයන ආයතන පිටුව සොයාගත නොහැකි විය.' : 'The requested institution profile does not exist.'}
          </p>
          <Link
            to="/agri-info-hub/government-institutions"
            className="inline-flex items-center gap-2 bg-[#006837]/15 hover:bg-[#006837]/25 text-[#006837] border border-[#006837]/30 backdrop-blur-md text-xs font-bold px-6 py-2.5 rounded-full shadow-2xs hover:shadow-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isSinhala ? 'ආයතන නාමාවලියට' : 'Back to Directory'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const title = isSinhala ? institution.nameSi || institution.nameEn : institution.nameEn || institution.nameSi;
  const subtitle = isSinhala ? institution.nameEn : institution.nameSi;
  const description = isSinhala
    ? institution.descriptionSi || institution.descriptionEn
    : institution.descriptionEn || institution.descriptionSi;
  const hotline = institution.hotline || '1920';
  const phone = institution.phone || '+94 81 238 8331 / +94 81 238 8011';
  const email = institution.email || 'info@doa.gov.lk';
  const address = isSinhala
    ? institution.addressSi || institution.addressEn || 'පේරාදෙණිය, ශ්‍රී ලංකාව'
    : institution.addressEn || institution.addressSi || 'Peradeniya, Sri Lanka';
  const workingHours = isSinhala
    ? institution.workingHoursSi || 'සතියේ දිනවල පෙ.ව. 8.30 සිට ප.ව. 4.15 දක්වා'
    : institution.workingHoursEn || 'Weekdays 8:30 AM to 4:15 PM';

  const sectorBadgeText =
    institution.type === 'pvt'
      ? isSinhala ? 'පුද්ගලික අංශය (PRIVATE)' : 'PRIVATE SECTOR'
      : institution.type === 'intl'
      ? isSinhala ? 'ජාත්‍යන්තර අංශය (INTERNATIONAL)' : 'INTERNATIONAL BODY'
      : isSinhala ? 'රාජ්‍ය අංශය (GOVERNMENT)' : 'GOVERNMENT SECTOR';

  const directoryUrl = institution?.type === 'pvt'
    ? '/agri-info-hub/private-institutions'
    : institution?.type === 'intl'
    ? '/agri-info-hub/international-institutions'
    : '/agri-info-hub/government-institutions';

  const directoryLabel = institution?.type === 'pvt'
    ? (isSinhala ? 'පුද්ගලික ආයතන' : 'Private Institutions')
    : institution?.type === 'intl'
    ? (isSinhala ? 'ජාත්‍යන්තර ආයතන' : 'International Institutions')
    : (isSinhala ? 'රාජ්‍ය ආයතන' : 'Government Institutions');

  return (
    <div className="w-full min-h-screen bg-[#f8faf8] font-roboto pb-20">
      {/* ── Page Hero Header (Displaying short name only as the title) ── */}
      <PageHero
        title={institution.shortName || title}
        image="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=1600&q=80"
        gradientColor="#0f4d30"
      />

      {/* ── Breadcrumb Bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-xs">
        <div className="container mx-auto px-4 lg:px-12 py-3 flex items-center justify-between text-xs sm:text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-[#006837] transition-colors">
              {isSinhala ? 'මුල් පිටුව' : 'Home'}
            </Link>
            <span>/</span>
            <Link to="/agri-info-hub" className="hover:text-[#006837] transition-colors">
              {isSinhala ? 'කෘෂි තොරතුරු කේන්ද්‍රය' : 'Agri Info Hub'}
            </Link>
            <span>/</span>
            <Link to={directoryUrl} className="hover:text-[#006837] transition-colors">
              {directoryLabel}
            </Link>
            <span>/</span>
            <span className="text-[#0f4d30] font-bold truncate max-w-[200px] sm:max-w-none">
              {institution.shortName || title}
            </span>
          </div>

          <Link
            to={directoryUrl}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#006837] px-3.5 py-1.5 rounded-full bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-600/20 hover:border-emerald-600/40 backdrop-blur-md shadow-2xs hover:shadow-xs transition-all duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isSinhala ? 'ආයතන නාමාවලියට' : 'Back to Directory'}</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-12 pt-8 space-y-8">
        {/* ── TOP HEADER CARD (Matching Screenshot 1) ── */}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Logo & Info */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              {/* Logo / Emblem */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] bg-[#dcfce7] border border-[#bbf7d0] flex items-center justify-center text-[#16a34a] shrink-0 shadow-xs overflow-hidden">
                {institution.logoUrl ? (
                  <img
                    src={institution.logoUrl}
                    alt={title}
                    className="w-full h-full object-contain p-2 rounded-[20px]"
                  />
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 sm:w-12 sm:h-12">
                    <path d="M7 20h10" />
                    <path d="M10 20c0-5.5-2.5-9.5-6-11 4.5 0 9 2 10 7" />
                    <path d="M14 20c0-3.5 1.5-6.5 4-8-1.5 3-1 6.5 0 8" />
                  </svg>
                )}
              </div>

              {/* Title & Badges */}
              <div className="space-y-2">
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#166534]">
                    {sectorBadgeText}
                  </span>

                  {hotline && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#fef9c3] text-[#854d0e]">
                      <Phone className="w-3 h-3" />
                      <span>{isSinhala ? `කෙටි අංකය: ${hotline}` : `Hotline: ${hotline}`}</span>
                    </span>
                  )}

                  {regionalCentersList.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#e0f2fe] text-[#0369a1]">
                      <Building className="w-3 h-3" />
                      <span>{isSinhala ? `${regionalCentersList.length} ප්‍රාදේශීය මධ්‍යස්ථාන` : `${regionalCentersList.length} Regional Centers`}</span>
                    </span>
                  )}
                </div>

                {/* Main Titles */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm sm:text-base font-semibold text-gray-500">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Call Now Action Button (Glassy styling) */}
            <div className="flex items-center lg:self-center shrink-0">
              <a
                href={`tel:${hotline || phone.split('/')[0].trim()}`}
                className="inline-flex items-center gap-2.5 bg-[#006837]/90 hover:bg-[#006837] text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base border border-white/30 backdrop-blur-md shadow-[0_8px_25px_rgba(0,104,55,0.25)] hover:shadow-[0_12px_32px_rgba(0,104,55,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <PhoneCall className="w-5 h-5 animate-pulse" />
                <span>{isSinhala ? 'දැන්ම අමතන්න' : 'Call Now'}</span>
              </a>
            </div>
          </div>

          {/* ── Social Media & Web Links Row (Matching Screenshot 1 Bottom) ── */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              <Share2 className="w-3.5 h-3.5 text-[#006837]" />
              <span>{isSinhala ? 'ඩිජිටල් හා සමාජ මාධ්‍ය පිටු (SOCIAL MEDIA & WEB LINKS)' : 'DIGITAL & SOCIAL MEDIA LINKS'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Official Website */}
              <a
                href={institution.website}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl border border-white/80 hover:border-blue-300 bg-white/70 hover:bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 backdrop-blur-xs flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">{isSinhala ? 'නිල වෙබ් අඩවිය' : 'Official Website'}</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-blue-600 truncate">{isSinhala ? 'පිවිසෙන්න' : 'Visit Site'}</p>
                </div>
              </a>

              {/* Facebook */}
              <a
                href={institution.facebookUrl || `https://www.facebook.com/search/top?q=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl border border-white/80 hover:border-blue-400 bg-white/70 hover:bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 backdrop-blur-xs flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">Facebook</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#1877F2] truncate">{isSinhala ? 'පිටුවට යන්න' : 'Go to Page'}</p>
                </div>
              </a>

              {/* YouTube */}
              <a
                href={institution.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl border border-white/80 hover:border-red-300 bg-white/70 hover:bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 backdrop-blur-xs flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">YouTube</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-red-600 truncate">{isSinhala ? 'චැනලය නරඹන්න' : 'Watch Channel'}</p>
                </div>
              </a>

              {/* TikTok / Other */}
              <a
                href={institution.tiktokUrl || `https://www.tiktok.com`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl border border-white/80 hover:border-gray-300 bg-white/70 hover:bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-black/10 text-gray-900 border border-black/10 backdrop-blur-xs flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.45V11.8a8.28 8.28 0 0 0 5.77 2.27V10.6a4.84 4.84 0 0 1-3.77-3.91z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">TikTok</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-black truncate">{isSinhala ? 'වීඩියෝ බලන්න' : 'Watch Videos'}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* ── MAIN 2-COLUMN BODY SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ════ LEFT COLUMN (7 Cols / 60-65% width) ════ */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* CARD 1: Short Introduction (Matching Screenshot 2 Top-Left) */}
            <div className="bg-white rounded-[26px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006837] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                  {isSinhala ? 'ආයතනය පිළිබඳ කෙටි හැඳින්වීම' : 'About the Institution'}
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base font-normal">
                {description}
              </p>
            </div>

            {/* CARD 2: Main Roles and Services (Matching Screenshot 2 Bottom-Left) */}
            <div className="bg-white rounded-[26px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                  {isSinhala ? 'ආයතනයේ ප්‍රධාන කාර්යභාරය හා සේවාවන්' : 'Key Roles & Public Services'}
                </h2>
              </div>

              <div className="space-y-3.5">
                {servicesList.map((service, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <p className="text-gray-700 text-sm sm:text-[15px] leading-snug font-medium">
                      {service}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 3: Regional Office Network and Locations (Matching Screenshot 3) */}
            {regionalCentersList.length > 0 && (
              <div className="bg-white rounded-[26px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-gray-900">
                        {isSinhala ? 'ප්‍රාදේශීය කාර්යාල ජාලය සහ ස්ථාන' : 'Regional Office Network & Stations'}
                      </h2>
                    </div>
                  </div>

                  <span className="inline-block self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-100">
                    {isSinhala ? `මධ්‍යස්ථාන ${regionalCentersList.length} ක්` : `${regionalCentersList.length} Centers`}
                  </span>
                </div>

                <p className="text-xs text-gray-500 font-medium mb-6">
                  {isSinhala ? 'ගොවිබිම් මට්ටමින් සේවා සපයන දිස්ත්‍රික් හා කලාප මධ්‍යස්ථාන' : 'District and zonal research/extension stations providing grassroots service'}
                </p>

                {/* Filter Input */}
                <div className="relative mb-6">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={centerSearch}
                    onChange={(e) => setCenterSearch(e.target.value)}
                    placeholder={isSinhala ? 'ප්‍රාදේශීය කාර්යාලයක් හෝ දිස්ත්‍රික්කයක් සොයන්න...' : 'Search station or district...'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#006837] focus:ring-2 focus:ring-[#006837]/20 outline-none text-xs sm:text-sm text-gray-800 bg-gray-50/60 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                {/* Centers 2-Column Grid */}
                {filteredCenters.length === 0 ? (
                  <p className="text-center py-8 text-xs text-gray-400">
                    {isSinhala ? 'සෙවුමට ගැළපෙන මධ්‍යස්ථානයක් හමු නොවීය.' : 'No stations matching your search.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredCenters.map((center, idx) => {
                      const centerName = isSinhala ? center.nameSi || center.nameEn : center.nameEn || center.nameSi;
                      const centerLoc = isSinhala ? center.locationSi || center.locationEn : center.locationEn || center.locationSi;
                      const centerPhone = center.phone || phone.split('/')[0].trim();

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-[#fdfefe] hover:border-emerald-200 hover:shadow-xs transition-all"
                        >
                          <div className="min-w-0 pr-2">
                            <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate leading-snug">
                              {centerName}
                            </h4>
                            <p className="text-[11.5px] text-gray-500 font-medium flex items-center gap-1 mt-1 truncate">
                              <MapPin className="w-3 h-3 text-[#006837] shrink-0" />
                              <span>{centerLoc}</span>
                            </p>
                          </div>

                          <a
                            href={`tel:${centerPhone}`}
                            className="w-8 h-8 rounded-full bg-emerald-500/15 hover:bg-[#006837] text-[#006837] hover:text-white border border-emerald-600/25 backdrop-blur-xs flex items-center justify-center shrink-0 transition-all shadow-2xs hover:shadow-md hover:scale-110"
                            title={`Call ${centerPhone}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── CARD 4: Official Documents & Publications Download Section ── */}
            {documentsList.length > 0 && (
              <div className="bg-white rounded-[26px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-gray-900">
                        {isSinhala ? 'නිල ලේඛන සහ ප්‍රකාශන බාගත කිරීම්' : 'Official Documents & Publications'}
                      </h2>
                    </div>
                  </div>

                  <span className="inline-block self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                    {isSinhala ? `ලේඛන ${documentsList.length} ක්` : `${documentsList.length} Documents`}
                  </span>
                </div>

                <p className="text-xs text-gray-500 font-medium mb-5">
                  {isSinhala
                    ? 'බාගත කරගත හැකි පත්‍රිකා, චක්‍රලේඛ, ආකෘති පත්‍ර, වාර්තා සහ මාර්ගෝපදේශ'
                    : 'Downloadable official guides, circulars, application forms, catalogs, and reports'}
                </p>

                <div className="space-y-3">
                  {documentsList.map((doc, idx) => {
                    const fileTypeUpper = (doc.fileType || 'PDF').toUpperCase();
                    return (
                      <div
                        key={doc.id || idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 rounded-2xl border border-gray-100 bg-[#fdfefe] hover:border-emerald-200 hover:shadow-xs transition-all"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug break-words">
                              {doc.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100/80 text-red-800 tracking-wider uppercase">
                                {fileTypeUpper}
                              </span>
                              {doc.fileSize && (
                                <span className="text-[11.5px] text-gray-400 font-medium">
                                  {doc.fileSize}
                                </span>
                              )}
                              {doc.uploadedAt && (
                                <span className="text-[11px] text-gray-400">
                                  • {new Date(doc.uploadedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-2 bg-[#006837]/15 hover:bg-[#006837]/25 text-[#006837] border border-[#006837]/30 backdrop-blur-md text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>{isSinhala ? 'බාගත කරන්න' : 'Download'}</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ════ RIGHT COLUMN (5 Cols / 35-40% width) ════ */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* CARD 1: Contact Details Card (Matching Screenshot 2 Right-Top) */}
            <div className="bg-white rounded-[26px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-green-50 text-[#006837] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  {isSinhala ? 'සම්බන්ධ කරගැනීමේ තොරතුරු' : 'Contact Information'}
                </h3>
              </div>

              {/* Phone Box */}
              {phone && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {isSinhala ? 'දුරකථන අංකය' : 'Telephone'}
                      </p>
                      <a href={`tel:${phone.split('/')[0].trim()}`} className="text-xs sm:text-sm font-bold text-gray-900 hover:text-[#006837] truncate block">
                        {phone}
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(phone, 'phone')}
                    className="p-2 rounded-xl bg-white/60 hover:bg-white/95 border border-emerald-600/15 hover:border-emerald-600/35 text-gray-500 hover:text-[#006837] backdrop-blur-xs shadow-2xs transition-all shrink-0 cursor-pointer"
                    title="Copy phone"
                  >
                    {copiedField === 'phone' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Hotline Box */}
              {hotline && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100/80">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#fef9c3] text-[#ca8a04] flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {isSinhala ? 'කෙටි අංකය (HOTLINE)' : 'Hotline Number'}
                      </p>
                      <p className="text-base font-black text-gray-900">
                        {hotline}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#fef08a] text-[#854d0e]">
                    {isSinhala ? 'ගාස්තු රහිතයි' : 'Toll Free'}
                  </span>
                </div>
              )}

              {/* Email Box */}
              {email && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/40 border border-blue-100/80">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {isSinhala ? 'විද්‍යුත් ලිපිනය (EMAIL)' : 'Official Email'}
                      </p>
                      <a href={`mailto:${email}`} className="text-xs sm:text-sm font-bold text-gray-900 hover:text-blue-600 truncate block">
                        {email}
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(email, 'email')}
                    className="p-2 rounded-xl bg-white/60 hover:bg-white/95 border border-blue-600/15 hover:border-blue-600/35 text-gray-500 hover:text-blue-600 backdrop-blur-xs shadow-2xs transition-all shrink-0 cursor-pointer"
                    title="Copy email"
                  >
                    {copiedField === 'email' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Address Box */}
              {address && (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/30 border border-rose-100/70">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                      {isSinhala ? 'ප්‍රධාන කාර්යාල ලිපිනය' : 'Head Office Address'}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                      {address}
                    </p>
                  </div>
                </div>
              )}

              {/* Working Hours */}
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{isSinhala ? `රාජකාරි වේලාවන්: ${workingHours}` : `Working Hours: ${workingHours}`}</span>
              </div>
            </div>

            {/* CARD 2: Farmer Guidance Promo Callout (Matching Screenshot 2 Right-Bottom) */}
            <div className="bg-gradient-to-br from-[#0c4a2a] via-[#093c22] to-[#042817] text-white rounded-[26px] p-6 sm:p-7 shadow-lg relative overflow-hidden">
              {/* Background leaf watermark */}
              <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22c0-4-3-8-3-11 0-3 3-5 3-5s3 2 3 5c0 3-3 7-3 11z" />
                </svg>
              </div>

              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold tracking-wider uppercase backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{isSinhala ? 'නොමිලේ උපදෙස්' : 'Free Assistance'}</span>
                </div>

                <h3 className="text-lg sm:text-xl font-black leading-snug text-white">
                  {isSinhala ? 'ගොවි සහන සහ තාක්ෂණික මඟපෙන්වීම්' : 'Farmer Advisory & Technical Guidance'}
                </h3>

                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                  {isSinhala
                    ? `ඔබට ගැටලුවක් ඇත්නම් සෘජුවම කෘෂි ව්‍යාප්ති නිලධාරීන් සම්බන්ධ කරගැනීමට ${hotline} අමතන්න.`
                    : `For immediate technical farming guidance, call the toll-free hotline ${hotline}.`}
                </p>

                <div className="pt-2">
                  <a
                    href={`tel:${hotline}`}
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/35 text-white border border-white/40 hover:border-white/60 backdrop-blur-md px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_24px_rgba(255,255,255,0.25)] hover:scale-[1.03]"
                  >
                    <Phone className="w-4 h-4 fill-current" />
                    <span>{isSinhala ? `${hotline} අමතන්න` : `Call ${hotline}`}</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
