import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock, MapPin, Award, CheckCircle2,
  Calendar, BookOpen, Layers, Globe, Check,
  Send, DollarSign,
  GraduationCap, X, ExternalLink, FileText,
  Briefcase, Sparkles, Copy, Download
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import PageHero from '../../components/public/PageHero';

// Helper to extract or translate bilingual strings like "මාර්තු (March)" based on active language
export const formatBilingualText = (text: string | undefined | null, isSinhala: boolean): string => {
  if (!text) return '';
  const match = text.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const first = match[1].trim();
    const second = match[2].trim();
    const firstIsSi = /[\u0D80-\u0DFF]/.test(first);
    const secondIsSi = /[\u0D80-\u0DFF]/.test(second);
    
    if (firstIsSi && !secondIsSi) {
      return isSinhala ? first : second;
    } else if (!firstIsSi && secondIsSi) {
      return isSinhala ? second : first;
    } else {
      return isSinhala ? first : second;
    }
  }
  return text;
};

// Helper for delivery modes
export const formatDeliveryMode = (mode: string | undefined | null, isSinhala: boolean): string => {
  if (!mode) return '';
  switch (mode) {
    case 'Physical_Farm':
      return isSinhala ? 'ක්ෂේත්‍ර පුහුණුව' : 'Physical Farm';
    case 'Hybrid_Blended':
      return isSinhala ? 'මිශ්‍ර ක්‍රමය (Hybrid)' : 'Hybrid (Blended)';
    case 'Online_Lectures':
      return isSinhala ? 'මාර්ගගත දේශන' : 'Online Lectures';
    case 'Full_Time_Residential':
      return isSinhala ? 'පූර්ණකාලීන නේවාසික' : 'Full Time Residential';
    default:
      return mode.replace(/_/g, ' ');
  }
};

// Helper for duration units
export const formatDurationUnit = (unit: string | undefined | null, isSinhala: boolean): string => {
  if (!unit) return '';
  const lower = unit.toLowerCase();
  if (lower.startsWith('hour')) return isSinhala ? 'පැය' : 'Hours';
  if (lower.startsWith('day')) return isSinhala ? 'දින' : 'Days';
  if (lower.startsWith('week')) return isSinhala ? 'සති' : 'Weeks';
  if (lower.startsWith('month')) return isSinhala ? 'මාස' : 'Months';
  if (lower.startsWith('year')) return isSinhala ? 'වසර' : 'Years';
  return unit;
};

// Helper for qualification levels
export const formatQualificationLevel = (level: string | undefined | null, isSinhala: boolean): string => {
  if (!level) return '';
  const levelMap: Record<string, { si: string; en: string }> = {
    'NVQ 3 (සහතිකය)': { si: 'NVQ 3 (සහතිකය)', en: 'NVQ Level 3 (Certificate)' },
    'NVQ 4 (ශිල්පීය සහතිකය)': { si: 'NVQ 4 (ශිල්පීය සහතිකය)', en: 'NVQ Level 4 (Craft Certificate)' },
    'NVQ 5 (ඩිප්ලෝමා)': { si: 'NVQ 5 (ඩිප්ලෝමා)', en: 'NVQ Level 5 (Diploma)' },
    'NVQ 6 (උසස් ඩිප්ලෝමා)': { si: 'NVQ 6 (උසස් ඩිප්ලෝමා)', en: 'NVQ Level 6 (Higher Diploma)' },
    'NVQ 7 / SLQF 6 (ප්‍රථම උපාධිය)': { si: 'NVQ 7 / SLQF 6 (ප්‍රථම උපාධිය)', en: 'NVQ 7 / SLQF 6 (Bachelor\'s Degree)' },
    'SLQF 7 (පශ්චාත් උපාධි සහතිකය)': { si: 'SLQF 7 (පශ්චාත් උපාධි සහතිකය)', en: 'SLQF 7 (Postgraduate Certificate)' },
    'SLQF 8 (පශ්චාත් උපාධි ඩිප්ලෝමාව)': { si: 'SLQF 8 (පශ්චාත් උපාධි ඩිප්ලෝමාව)', en: 'SLQF 8 (Postgraduate Diploma)' },
    'SLQF 9 (ශාස්ත්‍රපති / විද්‍යාපති පාඨමාලා උපාධිය)': { si: 'SLQF 9 (ශාස්ත්‍රපති / විද්‍යාපති පාඨමාලා උපාධිය)', en: 'SLQF 9 (Master\'s by Coursework)' },
    'SLQF 10 (පර්යේෂණ සහිත ශාස්ත්‍රපති / විද්‍යාපති උපාධිය)': { si: 'SLQF 10 (පර්යේෂණ සහිත ශාස්ත්‍රපති / විද්‍යාපති උපාධිය)', en: 'SLQF 10 (Master\'s with Research)' },
    'SLQF 11 (දර්ශනපති උපාධිය - M.Phil)': { si: 'SLQF 11 (දර්ශනපති උපාධිය - M.Phil)', en: 'SLQF 11 (Master of Philosophy - M.Phil)' },
    'SLQF 12 (ආචාර්ය උපාධිය - Ph.D)': { si: 'SLQF 12 (ආචාර්ය උපාධිය - Ph.D)', en: 'SLQF 12 (Doctor of Philosophy - Ph.D)' },
  };

  if (levelMap[level]) {
    return isSinhala ? levelMap[level].si : levelMap[level].en;
  }
  return formatBilingualText(level, isSinhala);
};

// Helper for medium
export const formatMedium = (medium: string | undefined | null, isSinhala: boolean): string => {
  if (!medium) return '';
  if (medium === 'සිංහල') return isSinhala ? 'සිංහල' : 'Sinhala';
  if (medium.toLowerCase() === 'english') return isSinhala ? 'ඉංග්‍රීසි' : 'English';
  if (medium === 'தமிழ்' || medium.toLowerCase() === 'tamil') return isSinhala ? 'දෙමළ' : 'Tamil';
  return formatBilingualText(medium, isSinhala);
};

export default function EducationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const { isAuthenticated, user, openLoginModal } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [pendingApply, setPendingApply] = useState(false);
  const [applyForm, setApplyForm] = useState({
    applicantName: '',
    applicantPhone: '',
    applicantEmail: '',
    applicantNic: '',
    applicantDistrict: '',
    remarks: ''
  });
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appSubmittedSuccess, setAppSubmittedSuccess] = useState(false);
  const [appError, setAppError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleCopyLink = (url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/courses/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Course not found');
        return res.json();
      })
      .then(data => {
        setCourse(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug, API_BASE_URL]);

  const openApplicationForm = useCallback(() => {
    setApplyForm(prev => ({
      ...prev,
      applicantName: prev.applicantName || user?.name || '',
      applicantEmail: prev.applicantEmail || user?.email || '',
    }));
    setIsApplyModalOpen(true);
    setAppSubmittedSuccess(false);
    setAppError('');
  }, [user]);

  // When user completes login after clicking Apply, automatically open the application form
  useEffect(() => {
    if (isAuthenticated && pendingApply) {
      setPendingApply(false);
      openApplicationForm();
    }
  }, [isAuthenticated, pendingApply, openApplicationForm]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      setPendingApply(true);
      openLoginModal();
      return;
    }

    openApplicationForm();
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingApp(true);
    setAppError('');

    try {
      const res = await fetch(`${API_BASE_URL}/courses/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course?.id,
          applicantName: applyForm.applicantName,
          applicantPhone: applyForm.applicantPhone,
          applicantEmail: applyForm.applicantEmail,
          applicantNic: applyForm.applicantNic,
          applicantDistrict: applyForm.applicantDistrict,
          remarks: applyForm.remarks
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setAppSubmittedSuccess(true);
      setTimeout(() => {
        setAppSubmittedSuccess(false);
        setIsApplyModalOpen(false);
        setApplyForm({
          applicantName: '',
          applicantPhone: '',
          applicantEmail: '',
          applicantNic: '',
          applicantDistrict: '',
          remarks: ''
        });
      }, 3000);
    } catch (err: any) {
      setAppError(err.message || 'Error submitting application.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 pt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center pt-32">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">{isSinhala ? 'පාඨමාලාව හමු නොවීය' : 'Course Not Found'}</h2>
        <p className="text-gray-500 mt-2 mb-6">
          {isSinhala ? 'ඔබ සොයන පාඨමාලා විස්තර පත්‍රිකාව දැනට නොපවතී.' : 'The course specification sheet you are looking for is currently unavailable.'}
        </p>
        <Link to="/education" className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800">
          {isSinhala ? 'ආපසු පාඨමාලා වෙත' : 'Back to Courses'}
        </Link>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80';
  const heroImage = course.bannerImageUrl || defaultImage;

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] pb-20">

      {/* ── Page Hero ── */}
      <PageHero
        title={course.title}
        description={course.shortDescription || ''}
        image={heroImage}
        gradientColor="#054a29"
      />

      {/* ── MAIN CONTENT: FULL-WIDTH STRUCTURED SPECIFICATION FORM & BOTTOM ACTION BAR ── */}
      <div className="container mx-auto px-4 lg:px-12 py-10 max-w-9xl space-y-8">

        {/* ── 1. COURSE SPECIFICATION FORM ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <h2 className="text-base font-bold text-gray-900">
                {isSinhala ? 'පාඨමාලා විස්තර පත්‍රිකාව' : 'Course Specification Sheet'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {course.applicationCalled && (
                <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                  <Sparkles size={12} className="shrink-0" />
                  <span>{isSinhala ? 'අයදුම්පත් කැඳවා ඇත' : 'Application Called'}</span>
                </span>
              )}
              <span className="text-xs font-mono font-bold text-gray-500 bg-gray-200/70 px-2.5 py-1 rounded-md">
                {course.courseCode}
              </span>
            </div>
          </div>

          {/* Form Fields Grid: 3 columns on lg screens */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6 text-xs sm:text-sm">

              {/* Field: Level */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {isSinhala ? 'සුදුසුකම් මට්ටම' : 'Qualification Level'}
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Award size={16} className="text-emerald-700 shrink-0" />
                  <span>{formatQualificationLevel(course.courseLevel, isSinhala)}</span>
                </p>
              </div>

              {/* Field: Category */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {isSinhala ? 'පාඨමාලා කාණ්ඩය' : 'Category'}
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Layers size={16} className="text-emerald-700 shrink-0" />
                  <span>{isSinhala ? (course.category?.categoryNameSi || course.category?.categoryNameEn) : (course.category?.categoryNameEn || course.category?.categoryNameSi)}</span>
                </p>
              </div>

              {/* Field: Delivery Mode */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {isSinhala ? 'පැවැත්වෙන ආකාරය' : 'Delivery Mode'}
                </p>
                <p className="font-bold text-gray-900">
                  {formatDeliveryMode(course.deliveryMode, isSinhala)}
                </p>
              </div>

              {/* Field: Mediums */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {isSinhala ? 'ඉගැන්වීමේ භාෂා' : 'Mediums'}
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Globe size={16} className="text-emerald-700 shrink-0" />
                  <span>
                    {Array.isArray(course.mediums) && course.mediums.length > 0
                      ? course.mediums.map((m: string) => formatMedium(m, isSinhala)).join(', ')
                      : (isSinhala ? 'සිංහල' : 'Sinhala')}
                  </span>
                </p>
              </div>

              {/* Field: Duration */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {isSinhala ? 'කාලසීමාව' : 'Duration'}
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Clock size={16} className="text-emerald-700 shrink-0" />
                  <span>{course.durationValue} {formatDurationUnit(course.durationUnit, isSinhala)}</span>
                </p>
              </div>

              {/* Field: Course Fee */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {isSinhala ? 'පාඨමාලා ගාස්තුව' : 'Course Fee'}
                </p>
                <p className="font-bold text-emerald-800 flex items-center gap-1">
                  <DollarSign size={16} className="text-emerald-700 shrink-0" />
                  <span>{course.courseFee === 0 ? (isSinhala ? 'නොමිලේ' : 'Free') : `Rs. ${Number(course.courseFee).toLocaleString()} LKR`}</span>
                </p>
              </div>

              {/* Field: Application Calling Month */}
              {course.applicationCallingMonth && (
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isSinhala ? 'අයදුම්පත් කැඳවන මාසය' : 'Application Calling Month'}
                  </p>
                  <p className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Calendar size={16} className="text-emerald-700 shrink-0" />
                    <span>{formatBilingualText(course.applicationCallingMonth, isSinhala)}</span>
                  </p>
                </div>
              )}

              {/* Field: Enrollment Month */}
              {course.enrollmentMonth && (
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isSinhala ? 'බඳවාගන්නා මාසය' : 'Enrollment Month'}
                  </p>
                  <p className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Calendar size={16} className="text-emerald-700 shrink-0" />
                    <span>{formatBilingualText(course.enrollmentMonth, isSinhala)}</span>
                  </p>
                </div>
              )}

              {/* Field: Course Start Month */}
              {course.startMonth && (
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isSinhala ? 'පාඨමාලාව ආරම්භය' : 'Course Start Month'}
                  </p>
                  <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <Calendar size={16} className="text-emerald-700 shrink-0" />
                    <span>{formatBilingualText(course.startMonth, isSinhala)}</span>
                  </p>
                </div>
              )}

              {/* Field: Deadline */}
              {course.deadlineDate && (
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isSinhala ? 'අයදුම්පත් අවසන් දිනය' : 'Application Deadline'}
                  </p>
                  <p className="font-bold text-red-600 flex items-center gap-1.5">
                    <Calendar size={16} className="text-red-500 shrink-0" />
                    <span>{course.deadlineDate.split('T')[0]}</span>
                  </p>
                </div>
              )}

              {/* Field: Schedule */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 sm:col-span-2 lg:col-span-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {isSinhala ? 'පන්ති පැවැත්වෙන වේලාවන්' : 'Class Schedule'}
                </p>
                <p className="font-bold text-gray-900">
                  {course.classSchedule || (isSinhala ? 'සති අන්තයේ පෙ.ව. 9:00 - ප.ව. 4:00' : 'Weekends 9:00 AM - 4:00 PM')}
                </p>
              </div>

              {/* Field: Venue Locations */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 sm:col-span-2 lg:col-span-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {isSinhala ? 'ප්‍රායෝගික පුහුණු ගොවිපළ ලිපිනයන් / ස්ථාන' : 'Practical Training Venues & Locations'}
                </p>
                {course.venueLocations && Array.isArray(course.venueLocations) && course.venueLocations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {course.venueLocations.map((loc: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-950 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs"
                      >
                        <MapPin size={15} className="text-emerald-700 shrink-0" />
                        <span>{loc}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-bold text-gray-900 flex items-center gap-1.5">
                    <MapPin size={16} className="text-emerald-700 shrink-0" />
                    <span>{course.venueLocation || (isSinhala ? 'ජාතික කෘෂිකර්ම පුහුණු සහ පර්යේෂණ මධ්‍යස්ථානය' : 'National Agricultural Training and Research Center')}</span>
                  </p>
                )}
              </div>

              {/* Field: Certificate & Accreditation */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 sm:col-span-2 lg:col-span-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {isSinhala ? 'ලබාදෙන සහතිකය සහ ප්‍රතීතන ආයතනය' : 'Accredited Certification'}
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                  <span>
                    {course.certificateType || (isSinhala ? 'රජයේ පිළිගත් නිපුණතා සහතිකය' : 'Government Recognized Skill Certificate')}
                    {' - '}
                    {course.accreditedBy || (isSinhala ? 'TVEC / කෘෂිකර්ම දෙපාර්තමේන්තුව' : 'TVEC / Department of Agriculture')}
                  </span>
                </p>
              </div>

              {/* Field: Online Application URL (Google Form) */}
              {course.applyUrl && (
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 sm:col-span-2 lg:col-span-3">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe size={14} className="text-emerald-700 shrink-0" />
                    <span>{isSinhala ? 'මාර්ගගත අයදුම්පත් සබැඳිය (Google Form)' : 'Online Application Link (Google Form)'}</span>
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex-1 bg-white px-3.5 py-2.5 rounded-lg border border-emerald-200 text-xs text-gray-700 font-mono truncate select-all">
                      {course.applyUrl}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(course.applyUrl)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        <span>{copiedLink ? (isSinhala ? 'පිටපත් විය!' : 'Copied!') : (isSinhala ? 'ලින්ක් එක Copy කරන්න' : 'Copy Link')}</span>
                      </button>
                      <a
                        href={course.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                      >
                        <ExternalLink size={14} />
                        <span>{isSinhala ? 'පෝරමය විවෘත කරන්න' : 'Open Form'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Field: Downloadable Application File (PDF / Doc) */}
              {course.applicationFileUrl && (
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 sm:col-span-2 lg:col-span-3">
                  <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-700 shrink-0" />
                    <span>{isSinhala ? 'අයදුම්පත්‍රය බාගත කිරීම සඳහා ලේඛනය (PDF)' : 'Downloadable Application Document (PDF)'}</span>
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          {isSinhala ? 'නිල පාඨමාලා අයදුම්පත්‍රය' : 'Official Course Application Form'}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {isSinhala ? 'බාගත කර මුද්‍රණය කර පුරවා භාරදෙන්න' : 'Download, print, fill and submit'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <a
                        href={course.applicationFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-blue-50 border border-blue-300 text-blue-800 rounded-lg text-xs font-bold transition-all"
                      >
                        <ExternalLink size={14} />
                        <span>{isSinhala ? 'පෙරදසුන' : 'View'}</span>
                      </a>
                      <a
                        href={course.applicationFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                      >
                        <Download size={14} />
                        <span>{isSinhala ? 'බාගත කරන්න' : 'Download'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 2. COURSE DESCRIPTION & OBJECTIVES ── */}
        {course.description && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-700" />
              {isSinhala ? 'පාඨමාලා හැඳින්වීම සහ අරමුණු' : 'Course Overview & Objectives'}
            </h3>
            <div
              className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50/60 p-5 rounded-xl border border-gray-100 prose max-w-none prose-emerald rich-content"
              dangerouslySetInnerHTML={{
                __html: course.description.replace(/&nbsp;|\u00a0/g, ' ')
              }}
            />
          </div>
        )}

        {/* ── 3. ENTRY REQUIREMENTS ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-700" />
            {isSinhala ? 'ඇතුළත් වීමේ අවම සුදුසුකම්' : 'Entry Requirements'}
          </h3>
          <div
            className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50/60 p-4 rounded-xl border border-gray-100 prose max-w-none prose-emerald rich-content"
            dangerouslySetInnerHTML={{
              __html: (course.entryRequirements || (isSinhala ? 'අ.පො.ස. (සා.පෙළ) විභාගයට පෙනී සිටීම හෝ කෘෂිකර්මාන්තයට ඇති උනන්දුව.' : 'G.C.E. (O/L) completion or genuine interest in agriculture.')).replace(/&nbsp;|\u00a0/g, ' ')
            }}
          />
        </div>

        {/* ── 3.5 APPLICATION LINKS & DOWNLOADABLE DOCUMENTS ── */}
        {(course.applyUrl || course.applicationFileUrl) && (
          <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-sm p-6 md:p-8 space-y-6 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3.5 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {isSinhala ? 'අයදුම්පත් සහ බාගත හැකි ලේඛන' : 'Application Links & Downloadable Documents'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isSinhala ? 'මෙම පාඨමාලාවට අයදුම් කිරීමට පහත සබැඳි හෝ ලේඛන භාවිතා කරන්න.' : 'Use the official links and forms below to apply for this course.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Card 1: Google Form / Online Link */}
              {course.applyUrl && (
                <div className="bg-white rounded-xl p-5 border border-emerald-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <Globe size={13} /> {isSinhala ? 'මාර්ගගත අයදුම්පත' : 'Online Form'}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">Google Form</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">
                      {isSinhala ? 'මාර්ගගතව සෘජුවම අයදුම් කරන්න' : 'Direct Online Application Link'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {isSinhala
                        ? 'Google Form සබැඳිය මඟින් ඔබගේ තොරතුරු පහසුවෙන් මාර්ගගතව ඉදිරිපත් කළ හැක.'
                        : 'Submit your application details directly via the official online form.'}
                    </p>

                    {/* URL View & Copy Box */}
                    <div className="mt-3.5 bg-gray-50 p-2.5 rounded-lg border border-gray-200 flex items-center gap-2">
                      <ExternalLink size={14} className="text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-700 font-mono truncate select-all flex-1">
                        {course.applyUrl}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(course.applyUrl)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold rounded-xl text-xs transition-all shadow-2xs cursor-pointer"
                    >
                      {copiedLink ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                      <span>{copiedLink ? (isSinhala ? 'පිටපත් විය!' : 'Copied!') : (isSinhala ? 'ලින්ක් එක Copy කරන්න' : 'Copy Link')}</span>
                    </button>
                    <a
                      href={course.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                    >
                      <ExternalLink size={15} />
                      <span>{isSinhala ? 'පෝරමය විවෘත කරන්න' : 'Open Form'}</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Card 2: Uploaded PDF / Application File */}
              {course.applicationFileUrl && (
                <div className="bg-white rounded-xl p-5 border border-blue-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                        <FileText size={13} /> {isSinhala ? 'බාගත හැකි ලේඛනය' : 'PDF Document'}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">PDF / Word</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">
                      {isSinhala ? 'නිල පාඨමාලා අයදුම්පත්‍රය' : 'Official Course Application Form'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {isSinhala
                        ? 'මුද්‍රිත අයදුම්පත්‍රය බාගත කර, සම්පූර්ණ කර අදාළ ආයතනය වෙත භාරදීම හෝ තැපැල් කිරීමට භාවිතා කරන්න.'
                        : 'Download the physical form to print, complete by hand, and submit or post to the center.'}
                    </p>

                    {/* File Box Preview */}
                    <div className="mt-3.5 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 flex items-center gap-2.5">
                      <FileText size={18} className="text-blue-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-gray-800 block truncate">
                          {course.title} - {isSinhala ? 'අයදුම්පත්‍රය' : 'Application Form'}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono truncate block">
                          {course.applicationFileUrl.split('/').pop() || 'application_form.pdf'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={course.applicationFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-white hover:bg-blue-50 border border-blue-300 text-blue-800 font-bold rounded-xl text-xs transition-all shadow-2xs"
                    >
                      <ExternalLink size={15} />
                      <span>{isSinhala ? 'පෙරදසුන' : 'View'}</span>
                    </a>
                    <a
                      href={course.applicationFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                    >
                      <Download size={15} />
                      <span>{isSinhala ? 'බාගත කරන්න' : 'Download PDF'}</span>
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ── 4. SYLLABUS MODULES ── */}
        {course.modules && course.modules.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers size={18} className="text-emerald-700" />
                {isSinhala ? `විෂය නිර්දේශයේ මොඩියුල (${course.modules.length})` : `Curriculum & Course Modules (${course.modules.length})`}
              </h3>
            </div>

            <div className="space-y-3">
              {course.modules.map((mod: any, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">{mod.moduleTitle}</h4>
                    {mod.moduleDescription && (
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{mod.moduleDescription}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4.5 RELATED JOB OPPORTUNITIES ── */}
        {course.relatedJobs && course.relatedJobs.length > 0 && (
          <div className="bg-white rounded-2xl border border-blue-100/80 shadow-sm p-6 md:p-8 space-y-4 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30">
            <div className="flex items-center justify-between border-b border-blue-100/80 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-700" />
                <span>{isSinhala ? 'අදාළ රැකියා අවස්ථා සහ වෘත්තීය මාවත්' : 'Related Job Opportunities & Career Paths'}</span>
              </h3>
              <span className="text-xs font-bold text-blue-800 bg-blue-100/80 border border-blue-200 px-3 py-1 rounded-full shadow-2xs">
                {course.relatedJobs.length} {isSinhala ? 'රැකියා අවස්ථා' : 'Careers'}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {isSinhala
                ? 'මෙම පාඨමාලාව සාර්ථකව නිමකිරීමෙන් පසු ඔබට පහත සඳහන් රැකියා අවස්ථා සහ වෘත්තීය ක්ෂේත්‍රයන් සඳහා යොමුවිය හැක.'
                : 'Upon successful completion of this course, you will be equipped for the following career pathways and job roles.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
              {course.relatedJobs.map((job: any) => (
                <div
                  key={job.id}
                  className="p-4 bg-white rounded-xl border border-blue-100/90 hover:border-blue-300 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <Briefcase size={18} />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">{job.name}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. BOTTOM ACTION BANNER ── */}
        <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 rounded-2xl text-white p-6 md:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                {course.courseCode} • {formatQualificationLevel(course.courseLevel, isSinhala)}
              </span>
              {course.applicationCalled && (
                <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-950 font-black px-2.5 py-0.5 rounded-full text-xs shadow-xs animate-pulse">
                  <Sparkles size={12} />
                  <span>{isSinhala ? 'අයදුම්පත් කැඳවා ඇත' : 'Application Called'}</span>
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl md:text-3xl font-black text-white">
                {course.courseFee === 0 ? (isSinhala ? 'නොමිලේ' : 'Free') : `Rs. ${Number(course.courseFee).toLocaleString()} LKR`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/80 mt-2">
              {course.deadlineDate && (
                <span className="flex items-center gap-1 text-amber-300 font-semibold">
                  <Calendar size={14} /> {isSinhala ? 'අයදුම්පත් අවසන් දිනය' : 'Application Deadline'}: {course.deadlineDate.split('T')[0]}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {course.applyUrl && (
              <a
                href={course.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs"
              >
                <ExternalLink size={16} /> Google Form
              </a>
            )}
            {course.applicationFileUrl && (
              <a
                href={course.applicationFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs"
              >
                <Download size={16} /> {isSinhala ? 'අයදුම්පත්‍රය බාගත කරන්න' : 'Download Application Form'}
              </a>
            )}
            <button
              onClick={handleApplyClick}
              className="flex items-center justify-center gap-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-8 py-3.5 rounded-xl font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-950/30 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Send size={18} /> {isSinhala ? 'දැන්ම අයදුම් කරන්න' : 'Apply Now'}
            </button>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* ── APPLICATION / ENROLLMENT POPUP MODAL ── */}
      {/* ==================================================================== */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmittingApp && setIsApplyModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl p-6 sm:p-8 border border-gray-200 animate-in fade-in zoom-in-95 duration-150">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-5">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
                  {course.courseCode}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                  {isSinhala ? 'පාඨමාලාවට ලියාපදිංචි වීමේ පෝරමය' : 'Course Application Form'}
                </h3>
                <p className="text-xs text-gray-500 truncate max-w-sm mt-0.5">{course.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {appSubmittedSuccess ? (
              <div className="text-center py-8 space-y-3 animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check size={32} />
                </div>
                <h4 className="text-lg font-bold text-gray-900">{isSinhala ? 'අයදුම්පත සාර්ථකව යොමු කෙරිණි!' : 'Application Submitted Successfully!'}</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  {isSinhala ? 'ඔබගේ අයදුම්පත අප වෙත ලැබුණි. අපගේ නිලධාරියෙකු කඩිනමින් ඔබව සම්බන්ධ කරගනු ඇත.' : 'We have received your application. Our representative will contact you shortly.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {isSinhala ? 'අයදුම්කරුගේ සම්පූර්ණ නම *' : 'Full Name *'}
                  </label>
                  <input
                    required
                    placeholder={isSinhala ? 'ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න' : 'Enter your full name'}
                    value={applyForm.applicantName}
                    onChange={e => setApplyForm({ ...applyForm, applicantName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {isSinhala ? 'දුරකථන අංකය *' : 'Phone Number *'}
                  </label>
                  <input
                    required
                    placeholder={isSinhala ? '+9477... (දුරකථන අංකය)' : '+9477... (Phone number)'}
                    value={applyForm.applicantPhone}
                    onChange={e => setApplyForm({ ...applyForm, applicantPhone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {isSinhala ? 'විද්‍යුත් තැපෑල' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      placeholder="email@domain.com"
                      value={applyForm.applicantEmail}
                      onChange={e => setApplyForm({ ...applyForm, applicantEmail: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {isSinhala ? 'ජාතික හැඳුනුම්පත් අංකය' : 'National Identity Card (NIC)'}
                    </label>
                    <input
                      placeholder="NIC Number"
                      value={applyForm.applicantNic}
                      onChange={e => setApplyForm({ ...applyForm, applicantNic: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {isSinhala ? 'දිස්ත්‍රික්කය' : 'District'}
                  </label>
                  <input
                    placeholder={isSinhala ? 'උදා: මහනුවර / කුරුණෑගල' : 'e.g. Kandy / Kurunegala'}
                    value={applyForm.applicantDistrict}
                    onChange={e => setApplyForm({ ...applyForm, applicantDistrict: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {isSinhala ? 'විශේෂ සටහන්' : 'Special Remarks'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isSinhala ? 'අමතර තොරතුරු හෝ විමසීම්...' : 'Additional notes or inquiries...'}
                    value={applyForm.remarks}
                    onChange={e => setApplyForm({ ...applyForm, remarks: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  {course.applyUrl && (
                    <a
                      href={course.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:underline flex items-center gap-1.5 font-semibold"
                    >
                      <ExternalLink size={13} /> {isSinhala ? 'Google Form මඟින් සෘජුවම අයදුම් කිරීමට මෙතැන ක්ලික් කරන්න' : 'Click here to apply directly via Google Form'}
                    </a>
                  )}
                  {course.applicationFileUrl && (
                    <a
                      href={course.applicationFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="text-xs text-emerald-700 hover:underline flex items-center gap-1.5 font-semibold"
                    >
                      <FileText size={13} /> {isSinhala ? 'අයදුම්පත්‍රය (PDF) බාගත කරගැනීමට මෙතැන ක්ලික් කරන්න' : 'Click here to download the printable application form (PDF)'}
                    </a>
                  )}
                </div>

                {appError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                    {appError}
                  </div>
                )}

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {isSinhala ? 'අවලංගු කරන්න' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingApp}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingApp && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {isSinhala ? 'අයදුම්පත යොමු කරන්න' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
