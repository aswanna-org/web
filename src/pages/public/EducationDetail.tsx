import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, MapPin, Award, CheckCircle2,
  Calendar, BookOpen, Layers, Globe, Check,
  UserCheck, Send, DollarSign, Users,
  GraduationCap, X, ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function EducationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const { isAuthenticated, user, openLoginModal } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        <h2 className="text-2xl font-bold text-gray-800">පාඨමාලාව හමු නොවීය (Course Not Found)</h2>
        <p className="text-gray-500 mt-2 mb-6">ඔබ සොයන පාඨමාලා විස්තර පත්‍රිකාව දැනට නොපවතී.</p>
        <Link to="/education" className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800">
          ආපසු පාඨමාලා වෙත (Back to Courses)
        </Link>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80';
  const heroImage = course.bannerImageUrl || defaultImage;

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] pb-20">

      {/* ── TOP HERO BANNER (Clean, Title only, with ample pt-36 to avoid overlapping navbars) ── */}
      <section className="relative w-full min-h-[30vh] lg:min-h-[34vh] overflow-hidden flex flex-col justify-end">
        <img src={heroImage} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />

        {/* Dark Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(5, 46, 22, 0.92) 0%, rgba(5, 46, 22, 0.82) 60%, rgba(0, 0, 0, 0.65) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content in Hero Banner - pt-36 gives space for fixed Navbars */}
        <div className="relative z-10 container mx-auto px-4 lg:px-12 pt-36 pb-8">
          <Link
            to="/education"
            className="inline-flex items-center gap-2 text-emerald-200 hover:text-white text-xs sm:text-sm font-semibold transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            ආපසු සියලු පාඨමාලා වෙත (Back to Courses)
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-white/10 text-white border border-white/20 font-mono">
              {course.courseCode}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
              {isSinhala ? course.category?.categoryNameSi : course.category?.categoryNameEn}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-400 text-emerald-950">
              {course.courseLevel}
            </span>
          </div>

          {/* Only Course Title in Hero */}
          <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-md max-w-4xl leading-tight">
            {course.title}
          </h1>
        </div>
      </section>

      {/* ── MAIN CONTENT: FULL-WIDTH STRUCTURED SPECIFICATION FORM & BOTTOM ACTION BAR ── */}
      <div className="container mx-auto px-4 lg:px-12 py-10 max-w-9xl space-y-8">

        {/* ── 1. COURSE SPECIFICATION FORM (ව්‍යුහගත විස්තර පත්‍රිකාව) ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <h2 className="text-base font-bold text-gray-900">
                පාඨමාලා විස්තර පත්‍රිකාව (Course Specification Sheet)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-gray-500 bg-gray-200/70 px-2.5 py-1 rounded-md">
              {course.courseCode}
            </span>
          </div>

          {/* Form Fields Grid: 3 columns on lg screens */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6 text-xs sm:text-sm">

              {/* Field: Level */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  සුදුසුකම් මට්ටම (Qualification Level)
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Award size={16} className="text-emerald-700 shrink-0" />
                  <span>{course.courseLevel}</span>
                </p>
              </div>

              {/* Field: Category */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  පාඨමාලා කාණ්ඩය (Category)
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Layers size={16} className="text-emerald-700 shrink-0" />
                  <span>{isSinhala ? course.category?.categoryNameSi : course.category?.categoryNameEn}</span>
                </p>
              </div>

              {/* Field: Delivery Mode */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  පැවැත්වෙන ආකාරය (Delivery Mode)
                </p>
                <p className="font-bold text-gray-900">
                  {course.deliveryMode.replace(/_/g, ' ')}
                </p>
              </div>

              {/* Field: Mediums */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  ඉගැන්වීමේ භාෂා (Mediums)
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Globe size={16} className="text-emerald-700 shrink-0" />
                  <span>{Array.isArray(course.mediums) ? course.mediums.join(', ') : 'සිංහල'}</span>
                </p>
              </div>

              {/* Field: Duration */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  කාලසීමාව (Duration)
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Clock size={16} className="text-emerald-700 shrink-0" />
                  <span>{course.durationValue} {course.durationUnit}</span>
                </p>
              </div>

              {/* Field: Course Fee */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  පාඨමාලා ගාස්තුව (Course Fee)
                </p>
                <p className="font-bold text-emerald-800 flex items-center gap-1">
                  <DollarSign size={16} className="text-emerald-700 shrink-0" />
                  <span>{course.courseFee === 0 ? 'නොමිලේ (Free)' : `Rs. ${course.courseFee.toLocaleString()} LKR`}</span>
                </p>
              </div>

              {/* Field: Start Date */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  ආරම්භ වන දිනය (Start Date)
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Calendar size={16} className="text-gray-500 shrink-0" />
                  <span>{course.startDate ? course.startDate.split('T')[0] : 'ඉදිරියේදී ආරම්භ වේ'}</span>
                </p>
              </div>

              {/* Field: Deadline */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  අයදුම්පත් භාරගන්නා අවසන් දිනය
                </p>
                <p className="font-bold text-red-600 flex items-center gap-1.5">
                  <Calendar size={16} className="text-red-500 shrink-0" />
                  <span>{course.deadlineDate ? course.deadlineDate.split('T')[0] : 'විවෘතයි'}</span>
                </p>
              </div>

              {/* Field: Intake */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  ශිෂ්‍ය ධාරිතාව (Max Intake)
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Users size={16} className="text-gray-500 shrink-0" />
                  <span>{course.maxIntake ? `${course.maxIntake} Seats` : '30 Seats'}</span>
                </p>
              </div>

              {/* Field: Schedule */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 sm:col-span-2 lg:col-span-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  පන්ති පැවැත්වෙන වේලාවන් (Class Schedule)
                </p>
                <p className="font-bold text-gray-900">
                  {course.classSchedule || 'සති අන්තයේ පෙ.ව. 9:00 - ප.ව. 4:00'}
                </p>
              </div>

              {/* Field: Venue */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 sm:col-span-2 lg:col-span-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  ප්‍රායෝගික පුහුණු ගොවිපළ / ස්ථානය (Venue & Practical Farm)
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <MapPin size={16} className="text-emerald-700 shrink-0" />
                  <span>{course.venueLocation || 'ජාතික කෘෂිකර්ම පුහුණු සහ පර්යේෂණ මධ්‍යස්ථානය'}</span>
                </p>
              </div>

              {/* Field: Certificate & Accreditation */}
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 sm:col-span-2 lg:col-span-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  ලබාදෙන සහතිකය සහ ප්‍රතීතන ආයතනය (Accredited Certification)
                </p>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                  <span>{course.certificateType || 'රජයේ පිළිගත් නිපුණතා සහතිකය'} - {course.accreditedBy || 'TVEC / කෘෂිකර්ම දෙපාර්තමේන්තුව'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. COURSE DESCRIPTION & OBJECTIVES ── */}
        {course.description && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-700" />
              පාඨමාලා හැඳින්වීම සහ අරමුණු (Course Overview & Objectives)
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50/60 p-5 rounded-xl border border-gray-100 whitespace-pre-line">
              {course.description}
            </p>
          </div>
        )}

        {/* ── 3. ENTRY REQUIREMENTS & INSTRUCTOR IN 2 COLUMNS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Entry Requirements */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-700" />
              ඇතුළත් වීමේ අවම සුදුසුකම් (Entry Requirements)
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50/60 p-4 rounded-xl border border-gray-100">
              {course.entryRequirements || 'අ.පො.ස. (සා.පෙළ) විභාගයට පෙනී සිටීම හෝ කෘෂිකර්මාන්තයට ඇති උනන්දුව.'}
            </p>
          </div>

          {/* Instructor Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <UserCheck size={18} className="text-emerald-700" />
              සම්පත්දායකයා / ප්‍රධාන දේශකයා
            </h3>
            {course.instructor ? (
              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-base">
                  {course.instructor.profileImageUrl ? (
                    <img src={course.instructor.profileImageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    course.instructor.fullName.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{course.instructor.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{course.instructor.designation || 'කෘෂිකර්ම විශේෂඥ'}</p>
                  {course.instructor.phone && (
                    <p className="text-xs text-emerald-700 font-mono font-semibold mt-0.5">{course.instructor.phone}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                දේශක තොරතුරු සටහන් කර නොමැත.
              </p>
            )}
          </div>
        </div>

        {/* ── 4. SYLLABUS MODULES (විෂය නිර්දේශයේ සියලු මොඩියුල) ── */}
        {course.modules && course.modules.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers size={18} className="text-emerald-700" />
                විෂය නිර්දේශයේ මොඩියුල (Curriculum & Course Modules - {course.modules.length})
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

        {/* ── 5. BOTTOM ACTION BANNER (Fee Info & Apply Now CTA) ── */}
        <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 rounded-2xl text-white p-6 md:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {course.courseCode} • {course.courseLevel}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl md:text-3xl font-black text-white">
                {course.courseFee === 0 ? 'නොමිලේ (Free)' : `Rs. ${course.courseFee.toLocaleString()} LKR`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/80 mt-2">
              {course.maxIntake && (
                <span className="flex items-center gap-1">
                  <Users size={14} /> ශිෂ්‍ය ධාරිතාව: <strong className="text-white">{course.maxIntake} Seats</strong>
                </span>
              )}
              {course.deadlineDate && (
                <span className="flex items-center gap-1 text-amber-300 font-semibold">
                  <Calendar size={14} /> අයදුම්පත් අවසන් දිනය: {course.deadlineDate.split('T')[0]}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleApplyClick}
            className="flex items-center justify-center gap-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-8 py-3.5 rounded-xl font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-950/30 hover:scale-[1.02] transition-all shrink-0"
          >
            <Send size={18} /> දැන්ම අයදුම් කරන්න (Apply Now)
          </button>
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
                  පාඨමාලාවට ලියාපදිංචි වීමේ පෝරමය
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
                <h4 className="text-lg font-bold text-gray-900">අයදුම්පත සාර්ථකව යොමු කෙරිණි!</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  ඔබගේ අයදුම්පත අප වෙත ලැබුණි. අපගේ නිලධාරියෙකු කඩිනමින් ඔබව සම්බන්ධ කරගනු ඇත.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    අයදුම්කරුගේ සම්පූර්ණ නම (Full Name) *
                  </label>
                  <input
                    required
                    placeholder="ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න"
                    value={applyForm.applicantName}
                    onChange={e => setApplyForm({ ...applyForm, applicantName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    දුරකථන අංකය (Phone Number) *
                  </label>
                  <input
                    required
                    placeholder="+9477..."
                    value={applyForm.applicantPhone}
                    onChange={e => setApplyForm({ ...applyForm, applicantPhone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      විද්‍යුත් තැපෑල (Email)
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
                      ජාතික හැඳුනුම්පත් අංකය (NIC)
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
                    දිස්ත්‍රික්කය (District)
                  </label>
                  <input
                    placeholder="උදා: මහනුවර / කුරුණෑගල"
                    value={applyForm.applicantDistrict}
                    onChange={e => setApplyForm({ ...applyForm, applicantDistrict: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    විශේෂ සටහන් (Remarks)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="අමතර තොරතුරු හෝ විමසීම්..."
                    value={applyForm.remarks}
                    onChange={e => setApplyForm({ ...applyForm, remarks: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>

                {course.applyUrl && (
                  <div className="pt-1">
                    <a
                      href={course.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink size={13} /> Google Form මඟින් සෘජුවම අයදුම් කිරීමට මෙතැන ක්ලික් කරන්න
                    </a>
                  </div>
                )}

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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingApp}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingApp && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    අයදුම්පත යොමු කරන්න (Submit)
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
