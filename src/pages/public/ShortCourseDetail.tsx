import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Clock, DollarSign, MapPin, Calendar, BookOpen, Layers,
  Award, Sparkles, Share2, Check, CheckCircle2, Copy,
  ExternalLink, Download, FileText, Building2, GraduationCap,
  ArrowLeft, Phone, Mail, UserCheck, AlertCircle, ChevronRight
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import { formatFee, stripHtml, getDistrictLabel, formatSchedule } from './ShortCourses';

interface ShortCourseSubject {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  descriptionSi?: string | null;
  descriptionEn?: string | null;
}

interface ShortCourseCenter {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  addressSi?: string | null;
  addressEn?: string | null;
  district?: string | null;
  phone?: string | null;
  email?: string | null;
  mapUrl?: string | null;
}

interface ShortCourseTrainer {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  positionSi?: string | null;
  positionEn?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface ShortCourseDetailData {
  id: string;
  slug: string;
  activeState: boolean;
  titleSi: string;
  titleEn: string;
  overviewSi?: string | null;
  overviewEn?: string | null;
  duration?: string | null;
  fee?: string | null;
  district?: string | null;
  imageUrl?: string | null;
  eligibilitySi?: string[];
  eligibilityEn?: string[];
  benefitsSi?: string[];
  benefitsEn?: string[];
  syllabusModulesSi?: string[];
  syllabusModulesEn?: string[];
  schedule?: string | null;
  closingDate?: string | null;
  expiryDate?: string | null;
  detailedDescriptionSi?: string | null;
  detailedDescriptionEn?: string | null;
  onlineAppUrl?: string | null;
  whatsappNumber?: string | null;
  pdfLink?: string | null;
  shortCourseSubject?: ShortCourseSubject | null;
  shortCourseCenter?: ShortCourseCenter | null;
  shortCourseTrainer?: ShortCourseTrainer | null;
  createdAt: string;
  updatedAt: string;
}

// Crisp WhatsApp SVG Icon
const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
  </svg>
);

export default function ShortCourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [course, setCourse] = useState<ShortCourseDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/short-courses/slug/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Course not found');
        }
        return res.json();
      })
      .then((data) => {
        setCourse(data);
      })
      .catch((err) => {
        console.error('Error fetching short course by slug:', err);
        setError(err.message || 'Failed to load course details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, API_BASE_URL]);

  const handleCopyLink = (urlToCopy?: string) => {
    const link = urlToCopy || window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const handleShare = () => {
    const currentUrl = window.location.href;
    const title = course
      ? (isSinhala ? course.titleSi : (course.titleEn || course.titleSi))
      : 'Short Course - Aswanna';

    if (navigator.share) {
      navigator.share({
        title,
        url: currentUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  // WhatsApp link generator
  const getWhatsAppLink = (number?: string | null, courseTitle?: string) => {
    if (!number) return null;
    let clean = number.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '94' + clean.slice(1);
    }
    const message = isSinhala
      ? `ආයුබෝවන්, මට Aswanna වෙබ් අඩවියේ ඇති "${courseTitle || ''}" කෙටිකාලීන පාඨමාලාව පිළිබඳ වැඩිදුර තොරතුරු දැනගැනීමට අවශ්‍යයි.`
      : `Hello, I would like to inquire about the "${courseTitle || ''}" short course listed on Aswanna.`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  };

  // Date formatting helpers
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(isSinhala ? 'si-LK' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isClosingSoon = useMemo(() => {
    if (!course?.closingDate) return false;
    const target = new Date(course.closingDate).getTime();
    const now = Date.now();
    const diffDays = (target - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }, [course?.closingDate]);

  const isExpired = useMemo(() => {
    if (!course?.closingDate) return false;
    return new Date(course.closingDate).getTime() < Date.now();
  }, [course?.closingDate]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50/50 flex items-center justify-center py-24">
        <AgroLoader
          message={
            isSinhala
              ? 'පාඨමාලා විස්තර පූරණය වෙමින් පවතී...'
              : 'Loading course specifications...'
          }
        />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="w-full min-h-screen bg-gray-50/50 py-20">
        <div className="container mx-auto px-4 max-w-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isSinhala ? 'පාඨමාලාව හමු නොවීය' : 'Course Not Found'}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isSinhala
              ? 'ඔබ සොයන කෙටිකාලීන පාඨමාලාව හෝ වැඩමුළුව පද්ධතියේ නොමැත හෝ ඉවත් කර ඇත.'
              : 'The short course or workshop you are looking for does not exist or has been removed.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/short-courses')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#006837] hover:bg-[#00522c] text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>{isSinhala ? 'සියලු කෙටිකාලීන පාඨමාලා වෙත' : 'Back to Short Courses'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isNonEmptyHtml = (content?: string | null): boolean => {
    if (!content) return false;
    const text = stripHtml(content).replace(/\u00a0/g, ' ').trim();
    return text.length > 0;
  };

  const courseTitle = isSinhala
    ? (course.titleSi || course.titleEn)
    : (course.titleEn || course.titleSi);

  // Strictly language-isolated description resolution to prevent cross-language mixing
  const hasSinhalaOverview = isNonEmptyHtml(course.overviewSi);
  const hasSinhalaDetailed = isNonEmptyHtml(course.detailedDescriptionSi);
  const hasEnglishOverview = isNonEmptyHtml(course.overviewEn);
  const hasEnglishDetailed = isNonEmptyHtml(course.detailedDescriptionEn);

  const hasAnySinhalaDesc = hasSinhalaOverview || hasSinhalaDetailed;
  const hasAnyEnglishDesc = hasEnglishOverview || hasEnglishDetailed;

  let overviewHtml: string | null = null;
  let detailedDescriptionHtml: string | null = null;

  if (isSinhala) {
    if (hasAnySinhalaDesc) {
      overviewHtml = hasSinhalaOverview ? course.overviewSi! : null;
      detailedDescriptionHtml = hasSinhalaDetailed ? course.detailedDescriptionSi! : null;
    } else if (hasAnyEnglishDesc) {
      // Complete fallback only if no Sinhala description exists at all
      overviewHtml = hasEnglishOverview ? course.overviewEn! : null;
      detailedDescriptionHtml = hasEnglishDetailed ? course.detailedDescriptionEn! : null;
    }
  } else {
    if (hasAnyEnglishDesc) {
      overviewHtml = hasEnglishOverview ? course.overviewEn! : null;
      detailedDescriptionHtml = hasEnglishDetailed ? course.detailedDescriptionEn! : null;
    } else if (hasAnySinhalaDesc) {
      // Complete fallback only if no English description exists at all
      overviewHtml = hasSinhalaOverview ? course.overviewSi! : null;
      detailedDescriptionHtml = hasSinhalaDetailed ? course.detailedDescriptionSi! : null;
    }
  }

  const overviewClean = stripHtml(overviewHtml || detailedDescriptionHtml);

  const subjectName = course.shortCourseSubject
    ? (isSinhala
        ? (course.shortCourseSubject.nameSi || course.shortCourseSubject.nameEn)
        : (course.shortCourseSubject.nameEn || course.shortCourseSubject.nameSi))
    : '';

  const centerName = course.shortCourseCenter
    ? (isSinhala
        ? (course.shortCourseCenter.nameSi || course.shortCourseCenter.nameEn)
        : (course.shortCourseCenter.nameEn || course.shortCourseCenter.nameSi))
    : '';

  const trainerName = course.shortCourseTrainer
    ? (isSinhala
        ? (course.shortCourseTrainer.nameSi || course.shortCourseTrainer.nameEn)
        : (course.shortCourseTrainer.nameEn || course.shortCourseTrainer.nameSi))
    : '';

  const trainerPosition = course.shortCourseTrainer
    ? (isSinhala
        ? (course.shortCourseTrainer.positionSi || course.shortCourseTrainer.positionEn)
        : (course.shortCourseTrainer.positionEn || course.shortCourseTrainer.positionSi))
    : '';

  const hasEligibilitySi = Array.isArray(course.eligibilitySi) && course.eligibilitySi.some((i) => i && i.trim().length > 0);
  const hasEligibilityEn = Array.isArray(course.eligibilityEn) && course.eligibilityEn.some((i) => i && i.trim().length > 0);
  const eligibilityList = isSinhala
    ? (hasEligibilitySi
        ? course.eligibilitySi!.filter((i) => i && i.trim().length > 0)
        : (hasEligibilityEn ? course.eligibilityEn!.filter((i) => i && i.trim().length > 0) : []))
    : (hasEligibilityEn
        ? course.eligibilityEn!.filter((i) => i && i.trim().length > 0)
        : (hasEligibilitySi ? course.eligibilitySi!.filter((i) => i && i.trim().length > 0) : []));

  const hasBenefitsSi = Array.isArray(course.benefitsSi) && course.benefitsSi.some((i) => i && i.trim().length > 0);
  const hasBenefitsEn = Array.isArray(course.benefitsEn) && course.benefitsEn.some((i) => i && i.trim().length > 0);
  const benefitsList = isSinhala
    ? (hasBenefitsSi
        ? course.benefitsSi!.filter((i) => i && i.trim().length > 0)
        : (hasBenefitsEn ? course.benefitsEn!.filter((i) => i && i.trim().length > 0) : []))
    : (hasBenefitsEn
        ? course.benefitsEn!.filter((i) => i && i.trim().length > 0)
        : (hasBenefitsSi ? course.benefitsSi!.filter((i) => i && i.trim().length > 0) : []));

  const hasSyllabusSi = Array.isArray(course.syllabusModulesSi) && course.syllabusModulesSi.some((i) => i && i.trim().length > 0);
  const hasSyllabusEn = Array.isArray(course.syllabusModulesEn) && course.syllabusModulesEn.some((i) => i && i.trim().length > 0);
  const syllabusModulesList = isSinhala
    ? (hasSyllabusSi
        ? course.syllabusModulesSi!.filter((i) => i && i.trim().length > 0)
        : (hasSyllabusEn ? course.syllabusModulesEn!.filter((i) => i && i.trim().length > 0) : []))
    : (hasSyllabusEn
        ? course.syllabusModulesEn!.filter((i) => i && i.trim().length > 0)
        : (hasSyllabusSi ? course.syllabusModulesSi!.filter((i) => i && i.trim().length > 0) : []));

  const feeLabel = formatFee(course.fee, isSinhala);
  const whatsAppUrl = getWhatsAppLink(course.whatsappNumber, courseTitle);

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-20">
      <SEO
        title={`${courseTitle} | ${isSinhala ? 'කෙටිකාලීන පාඨමාලා' : 'Short Courses'} - Aswanna`}
        description={overviewClean || `${courseTitle} - Practical training and workshop in Sri Lanka.`}
        canonical={`/short-courses/${course.slug}`}
        keywords={[
          courseTitle,
          subjectName,
          'Short Courses',
          'Agri Workshop',
          'Aswanna',
          'Sri Lanka Agriculture Training',
        ].join(', ')}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: courseTitle,
          description: overviewClean,
          provider: {
            '@type': 'Organization',
            name: centerName || 'Aswanna Agro Education',
          },
          offers: {
            '@type': 'Offer',
            price: course.fee || '0',
            priceCurrency: 'LKR',
          },
        }}
      />

      {/* Hero Section */}
      <PageHero
        title={courseTitle}
        image={course.imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=1600&q=80'}
        gradientColor="#047857"
        icon={Clock}
        badgeBg="bg-emerald-600"
        waveColor="text-gray-50"
      />

      {/* Main Container */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-12 py-6 sm:py-10 space-y-8">
        {/* Navigation & Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-emerald-800 transition-colors">
              {isSinhala ? 'මුල් පිටුව' : 'Home'}
            </Link>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <Link to="/education" className="hover:text-emerald-800 transition-colors">
              {isSinhala ? 'අධ්‍යාපනය' : 'Education'}
            </Link>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <Link to="/short-courses" className="hover:text-emerald-800 transition-colors">
              {isSinhala ? 'කෙටිකාලීන පාඨමාලා' : 'Short Courses'}
            </Link>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-[320px]">
              {courseTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/short-courses')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={14} />
              <span>{isSinhala ? 'සියලු පාඨමාලා' : 'Back to Courses'}</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition-all cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copiedLink ? (isSinhala ? 'පිටපත් විය' : 'Copied!') : (isSinhala ? 'බෙදාහරින්න' : 'Share')}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: Specification sheet, descriptions, modules, eligibility, benefits, documents (8 cols) */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* 1. COURSE SPECIFICATION SUMMARY SHEET */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
              <div className="bg-gray-50/90 px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                    <GraduationCap size={18} />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900">
                    {isSinhala ? 'පාඨමාලා විස්තර පත්‍රිකාව' : 'Course Specification Sheet'}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {!isExpired && (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold shadow-2xs">
                      <Sparkles size={12} className="shrink-0" />
                      <span>{isSinhala ? 'අයදුම්පත් විවෘතයි' : 'Applications Open'}</span>
                    </span>
                  )}
                  {subjectName && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-md">
                      {subjectName}
                    </span>
                  )}
                </div>
              </div>

              {/* Form Grid */}
              <div className="p-5 sm:p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 text-xs sm:text-sm">
                  {/* Field: Duration */}
                  <div className="p-3.5 sm:p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {isSinhala ? 'කාලසීමාව' : 'Duration'}
                    </p>
                    <p className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Clock size={16} className="text-emerald-700 shrink-0" />
                      <span>{course.duration || (isSinhala ? 'දැනුම් දී නොමැත' : 'Not Specified')}</span>
                    </p>
                  </div>

                  {/* Field: Fee */}
                  <div className="p-3.5 sm:p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {isSinhala ? 'පාඨමාලා ගාස්තුව' : 'Course Fee'}
                    </p>
                    <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <DollarSign size={16} className="text-emerald-700 shrink-0" />
                      <span>{feeLabel}</span>
                    </p>
                  </div>

                  {/* Field: Schedule */}
                  <div className="p-3.5 sm:p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {isSinhala ? 'පැවැත්වෙන වේලාවන්' : 'Schedule'}
                    </p>
                    <p className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Calendar size={16} className="text-emerald-700 shrink-0" />
                      <span className="truncate">
                        {formatSchedule(course.schedule) || (isSinhala ? 'දැනුම් දී නොමැත' : 'Not Specified')}
                      </span>
                    </p>
                  </div>

                  {/* Field: District / Venue */}
                  <div className="p-3.5 sm:p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {isSinhala ? 'දිස්ත්‍රික්කය / ස්ථානය' : 'District / Location'}
                    </p>
                    <p className="font-bold text-gray-900 flex items-center gap-1.5">
                      <MapPin size={16} className="text-emerald-700 shrink-0" />
                      <span>{getDistrictLabel(course.district || course.shortCourseCenter?.district, isSinhala) || (isSinhala ? 'දැනුම් දී නොමැත' : 'Not Specified')}</span>
                    </p>
                  </div>

                  {/* Field: Closing Date */}
                  <div className="p-3.5 sm:p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {isSinhala ? 'අයදුම්පත් අවසන් දිනය' : 'Application Deadline'}
                    </p>
                    <p className={`font-bold flex items-center gap-1.5 ${isExpired ? 'text-red-600' : isClosingSoon ? 'text-amber-600' : 'text-gray-900'}`}>
                      <Calendar size={16} className={isExpired ? 'text-red-500' : 'text-emerald-700'} />
                      <span>
                        {course.closingDate
                          ? formatDate(course.closingDate)
                          : (isSinhala ? 'විවෘතයි / දැනුම් දෙනු ලැබේ' : 'Ongoing / Open')}
                      </span>
                    </p>
                  </div>

                  {/* Field: Subject */}
                  <div className="p-3.5 sm:p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {isSinhala ? 'විෂය ක්ෂේත්‍රය' : 'Subject Category'}
                    </p>
                    <p className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Layers size={16} className="text-emerald-700 shrink-0" />
                      <span className="truncate">{subjectName || (isSinhala ? 'දැනුම් දී නොමැත' : 'Not Specified')}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. COURSE DESCRIPTION & OBJECTIVES */}
            {(overviewHtml || detailedDescriptionHtml) && (
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 md:p-8 space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-700" />
                  <span>{isSinhala ? 'පාඨමාලා හැඳින්වීම සහ අරමුණු' : 'Course Overview & Objectives'}</span>
                </h3>

                {overviewHtml && (
                  <div
                    className="p-4 sm:p-5 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs sm:text-sm text-gray-800 leading-relaxed font-medium prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: overviewHtml.replace(/&nbsp;|\u00a0/g, ' '),
                    }}
                  />
                )}

                {detailedDescriptionHtml && (
                  <div
                    className="text-xs sm:text-sm text-gray-700 leading-relaxed p-4 sm:p-5 bg-gray-50/70 rounded-xl border border-gray-100 prose max-w-none prose-emerald rich-content"
                    dangerouslySetInnerHTML={{
                      __html: detailedDescriptionHtml.replace(/&nbsp;|\u00a0/g, ' '),
                    }}
                  />
                )}
              </div>
            )}

            {/* 3. SYLLABUS MODULES */}
            {syllabusModulesList.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    <Layers size={18} className="text-emerald-700" />
                    <span>
                      {isSinhala
                        ? `විෂය නිර්දේශයේ මොඩියුල (${syllabusModulesList.length})`
                        : `Curriculum & Course Modules (${syllabusModulesList.length})`}
                    </span>
                  </h3>
                </div>

                <div className="space-y-3 pt-1">
                  {syllabusModulesList.map((moduleItem, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50/80 hover:bg-emerald-50/30 rounded-xl border border-gray-200/90 hover:border-emerald-200 transition-all flex items-start gap-3.5 group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-emerald-950 leading-relaxed">
                          {moduleItem}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. ENTRY REQUIREMENTS & ELIGIBILITY */}
            {eligibilityList.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 md:p-8 space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-700" />
                  <span>{isSinhala ? 'ඇතුළත් වීමේ සුදුසුකම්' : 'Eligibility & Requirements'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {eligibilityList.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 flex items-start gap-2.5 text-xs sm:text-sm text-gray-800"
                    >
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. COURSE BENEFITS & OUTCOMES */}
            {benefitsList.length > 0 && (
              <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs p-6 md:p-8 space-y-4 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    <Award size={18} className="text-emerald-700" />
                    <span>{isSinhala ? 'පාඨමාලාව හැදෑරීමෙන් ලැබෙන ප්‍රතිලාභ' : 'Course Benefits & Career Outcomes'}</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {benefitsList.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white rounded-xl border border-emerald-200/80 shadow-2xs flex items-start gap-2.5 text-xs sm:text-sm text-gray-800"
                    >
                      <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. APPLICATION LINKS & OFFICIAL DOCUMENTS */}
            {(course.onlineAppUrl || course.pdfLink) && (
              <div className="bg-white rounded-2xl border border-emerald-200/90 shadow-xs p-6 md:p-8 space-y-6 bg-gradient-to-br from-white via-emerald-50/25 to-teal-50/25">
                <div className="flex items-center gap-2.5 border-b border-emerald-100 pb-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {isSinhala ? 'අයදුම්පත් සහ බාගත හැකි ලේඛන' : 'Application Links & Documents'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isSinhala
                        ? 'මෙම පාඨමාලාවට අයදුම් කිරීමට පහත නිල සබැඳි භාවිතා කරන්න.'
                        : 'Use the official application links and documents below to enroll.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Card 1: Online Application URL */}
                  {course.onlineAppUrl && (
                    <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <ExternalLink size={12} /> {isSinhala ? 'මාර්ගගත අයදුම්පත' : 'Online Form'}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400">Portal / Form</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 leading-snug">
                          {isSinhala ? 'මාර්ගගතව සෘජුවම අයදුම් කරන්න' : 'Direct Online Application Link'}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {isSinhala
                            ? 'ඔබගේ තොරතුරු පහසුවෙන් මාර්ගගතව ඉදිරිපත් කිරීමට මෙම පෝරමය විවෘත කරන්න.'
                            : 'Submit your registration details directly through the official online application form.'}
                        </p>

                        <div className="mt-3.5 bg-gray-50 p-2.5 rounded-lg border border-gray-200 flex items-center gap-2">
                          <ExternalLink size={14} className="text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-700 font-mono truncate select-all flex-1">
                            {course.onlineAppUrl}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(course.onlineAppUrl || undefined)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold rounded-xl text-xs transition-all shadow-2xs cursor-pointer"
                        >
                          {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          <span>{copiedLink ? (isSinhala ? 'පිටපත් විය!' : 'Copied!') : (isSinhala ? 'Copy කරන්න' : 'Copy Link')}</span>
                        </button>
                        <a
                          href={course.onlineAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                        >
                          <ExternalLink size={14} />
                          <span>{isSinhala ? 'පෝරමය විවෘත කරන්න' : 'Open Form'}</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Card 2: Syllabus PDF Download */}
                  {course.pdfLink && (
                    <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                            <FileText size={12} /> {isSinhala ? 'විෂය නිර්දේශය (PDF)' : 'Syllabus PDF'}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400">PDF File</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 leading-snug">
                          {isSinhala ? 'නිල විෂය නිර්දේශ පත්‍රිකාව බාගත කරන්න' : 'Download Course Syllabus Document'}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {isSinhala
                            ? 'සම්පූර්ණ විෂය නිර්දේශය, දේශන කාලසටහන සහ පුහුණු විස්තර අඩංගු නිල PDF පත්‍රිකාව.'
                            : 'Official PDF document containing complete syllabus details, timetable, and study units.'}
                        </p>

                        <div className="mt-3.5 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 flex items-center gap-2.5">
                          <FileText size={18} className="text-blue-600 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-gray-800 block truncate">
                              {courseTitle} - {isSinhala ? 'විෂය නිර්දේශය' : 'Syllabus'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono truncate block">
                              {course.pdfLink.split('/').pop() || 'syllabus.pdf'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <a
                          href={course.pdfLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-blue-50 border border-blue-300 text-blue-800 font-bold rounded-xl text-xs transition-all shadow-2xs"
                        >
                          <ExternalLink size={14} />
                          <span>{isSinhala ? 'පෙරදසුන' : 'View'}</span>
                        </a>
                        <a
                          href={course.pdfLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                        >
                          <Download size={14} />
                          <span>{isSinhala ? 'බාගත කරන්න' : 'Download PDF'}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Actions, Center Info, Trainer Info, Helpline (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. PRIMARY ACTION CARD (STICKY) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 space-y-5 sticky top-24">
              {/* Fee Callout */}
              <div className="pb-4 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  {isSinhala ? 'පාඨමාලා ගාස්තුව' : 'Course Fee'}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-800">
                  {feeLabel}
                </div>
                {course.duration && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                    <Clock size={12} className="text-emerald-700" />
                    <span>{course.duration}</span>
                  </div>
                )}
              </div>

              {/* Status Alert */}
              {course.closingDate && (
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                  isExpired
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : isClosingSoon
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <Calendar size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      {isExpired
                        ? (isSinhala ? 'අයදුම්පත් භාරගැනීම අවසන්' : 'Applications Closed')
                        : isClosingSoon
                        ? (isSinhala ? 'අයදුම්පත් අවසන් දිනය ආසන්නයි!' : 'Closing Soon!')
                        : (isSinhala ? 'අයදුම්පත් අවසන් දිනය:' : 'Deadline:')}
                    </span>
                    <span>{formatDate(course.closingDate)}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                {course.onlineAppUrl && !isExpired && (
                  <a
                    href={course.onlineAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#006837] hover:bg-[#00522c] text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <ExternalLink size={16} />
                    <span>{isSinhala ? 'මාර්ගගතව අයදුම් කරන්න' : 'Apply Online Now'}</span>
                  </a>
                )}

                {whatsAppUrl && (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-sm transition-all shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                    <span>{isSinhala ? 'WhatsApp මඟින් විමසන්න' : 'Inquire via WhatsApp'}</span>
                  </a>
                )}

                {course.pdfLink && (
                  <a
                    href={course.pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold rounded-xl text-xs sm:text-sm border border-gray-200 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                    <span>{isSinhala ? 'විෂය නිර්දේශය බාගත කරන්න' : 'Download Syllabus PDF'}</span>
                  </a>
                )}
              </div>

              {/* Share */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{isSinhala ? 'පාඨමාලාව බෙදාහරින්න:' : 'Share this course:'}</span>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                  <span>{copiedLink ? (isSinhala ? 'පිටපත් විය!' : 'Copied!') : (isSinhala ? 'සබැඳිය පිටපත් කරන්න' : 'Copy Link')}</span>
                </button>
              </div>
            </div>

            {/* 2. TRAINING CENTER CARD */}
            {course.shortCourseCenter && (
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      {isSinhala ? 'පුහුණු මධ්‍යස්ථානය' : 'Training Center'}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">
                      {isSinhala
                        ? (course.shortCourseCenter.nameSi || course.shortCourseCenter.nameEn)
                        : (course.shortCourseCenter.nameEn || course.shortCourseCenter.nameSi)}
                    </h4>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-gray-700">
                  {/* Address */}
                  {(course.shortCourseCenter.addressSi || course.shortCourseCenter.addressEn) && (
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span>
                          {isSinhala
                            ? course.shortCourseCenter.addressSi || course.shortCourseCenter.addressEn
                            : course.shortCourseCenter.addressEn || course.shortCourseCenter.addressSi}
                        </span>
                        {course.shortCourseCenter.district && (
                          <span className="block text-gray-500 text-xs">
                            {course.shortCourseCenter.district} {isSinhala ? 'දිස්ත්‍රික්කය' : 'District'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {course.shortCourseCenter.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone size={16} className="text-emerald-700 shrink-0" />
                      <a
                        href={`tel:${course.shortCourseCenter.phone}`}
                        className="font-semibold text-emerald-800 hover:underline"
                      >
                        {course.shortCourseCenter.phone}
                      </a>
                    </div>
                  )}

                  {/* Email */}
                  {course.shortCourseCenter.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail size={16} className="text-emerald-700 shrink-0" />
                      <a
                        href={`mailto:${course.shortCourseCenter.email}`}
                        className="text-gray-700 hover:text-emerald-800 truncate"
                      >
                        {course.shortCourseCenter.email}
                      </a>
                    </div>
                  )}

                  {/* Map URL */}
                  {course.shortCourseCenter.mapUrl && (
                    <div className="pt-2">
                      <a
                        href={course.shortCourseCenter.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
                      >
                        <MapPin size={14} />
                        <span>{isSinhala ? 'Google සිතියමෙන් බලන්න' : 'View on Google Maps'}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. TRAINER CARD */}
            {course.shortCourseTrainer && (
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      {isSinhala ? 'සම්පත් දායකයා / පුහුණුකරු' : 'Lead Trainer / Instructor'}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">
                      {trainerName}
                    </h4>
                  </div>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                  {trainerPosition && (
                    <p className="font-medium text-gray-600">{trainerPosition}</p>
                  )}
                  {course.shortCourseTrainer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-emerald-700 shrink-0" />
                      <a
                        href={`tel:${course.shortCourseTrainer.phone}`}
                        className="font-semibold text-emerald-800 hover:underline"
                      >
                        {course.shortCourseTrainer.phone}
                      </a>
                    </div>
                  )}
                  {course.shortCourseTrainer.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-emerald-700 shrink-0" />
                      <a
                        href={`mailto:${course.shortCourseTrainer.email}`}
                        className="text-gray-700 hover:text-emerald-800 truncate"
                      >
                        {course.shortCourseTrainer.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
