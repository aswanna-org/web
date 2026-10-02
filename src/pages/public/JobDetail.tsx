import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar, DollarSign, GraduationCap, CheckCircle2,
  Building2, ExternalLink, Globe, Landmark, Download,
  FileText, ArrowLeft, Briefcase, Share2, Check
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';

interface Job {
  id: string | number;
  designation?: string;
  designationSi?: string;
  title?: string;
  sinhalaTitle?: string;
  description?: string;
  sinhalaDescription?: string;
  location?: string;
  sinhalaLocation?: string;
  jobCategory?: { id: number; name: string; nameSi?: string };
  institution?: { id: number; name: string; nameSi?: string; ministry?: { id: number; name: string; nameSi?: string } };
  serviceCategory?: string;
  serviceCategorySi?: string;
  jobNature?: string;
  jobNatureSi?: string;
  serviceConditions?: string;
  serviceConditionsSi?: string;
  companyName?: string | null;
  companyNameSi?: string | null;
  governingMinistry?: string | null;
  governingMinistrySi?: string | null;
  agency?: string | null;
  agencySi?: string | null;
  country?: string | null;
  countrySi?: string | null;
  applyLink?: string | null;
  expiryDate?: string;
  salaryDetails?: {
    salaryCode?: string;
    basicSalary?: string;
    basicSalarySi?: string;
    salaryScale?: string;
    salaryScaleSi?: string;
    allowances?: string;
    allowancesSi?: string;
    salaryDisplay?: string;
    salaryDisplaySi?: string;
  };
  eligibility?: {
    ageLimit?: string;
    ageLimitSi?: string;
    ageRelaxation?: string;
    ageRelaxationSi?: string;
    qualifications?: string;
    qualificationsSi?: string;
    basicExperience?: string;
    basicExperienceSi?: string;
  };
  selectionProcedure?: {
    method?: string;
    methodSi?: string;
    examDetails?: string;
    examDetailsSi?: string;
  };
  applicationInfo?: {
    gazetteNo?: string;
    gazetteDate?: string;
    examFee?: string;
    examFeeSi?: string;
    gazetteUrl?: string;
    gazetteUrlSi?: string;
    specimenAppUrl?: string;
    specimenAppUrlSi?: string;
    postalAddress?: string;
    postalAddressSi?: string;
    envelopeMarking?: string;
    envelopeMarkingSi?: string;
    submissionDetails?: string;
    submissionDetailsSi?: string;
    applyLink?: string;
  };
  approvalStatus?: string;
  isActive: boolean;
  createdAt: string;
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isSi = i18n.language === 'si';

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/careers/openings/${id}`);
        if (!res.ok) {
          throw new Error('රැකියා තොරතුරු ලබා ගැනීමට නොහැකි විය.');
        }
        const data = await res.json();
        setJob(data);
      } catch (err: any) {
        console.error('Failed to load job details:', err);
        setError(err.message || 'Job not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [id, API_BASE_URL]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.designationSi || job?.designation || 'Aswanna Careers',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-24 bg-[#fafbfc]">
        <AgroLoader message={isSi ? 'රැකියා විස්තර පූරණය වෙමින් පවතී...' : 'Loading job details...'} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-24 px-4 bg-[#fafbfc]">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-md text-center max-w-md w-full">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#143d4d] mb-2">
            {isSi ? 'රැකියාව සොයාගත නොහැකි විය' : 'Job Post Not Found'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isSi ? 'මෙම රැකියා දැන්වීම කල් ඉකුත් වී හෝ ඉවත් කර තිබිය හැක.' : 'This job opening may have expired or been removed.'}
          </p>
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#006837] hover:bg-[#00532c] text-white text-sm font-semibold transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isSi ? 'රැකියා පිටුව වෙත' : 'Back to Careers'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const displayTitle = isSi && job.designationSi ? job.designationSi : (job.designation || job.title);
  const secondaryTitle = isSi ? job.designation : job.designationSi;
  const displayCategory = isSi && job.jobCategory?.nameSi ? job.jobCategory.nameSi : (job.jobCategory?.name || 'CAREERS');
  const displayNature = isSi && job.jobNatureSi ? job.jobNatureSi : job.jobNature;
  const displayServiceCategory = isSi && job.serviceCategorySi ? job.serviceCategorySi : job.serviceCategory;
  const displaySalary = isSi && (job.salaryDetails?.salaryDisplaySi || job.salaryDetails?.basicSalarySi)
    ? (job.salaryDetails?.salaryDisplaySi || job.salaryDetails?.basicSalarySi)
    : (job.salaryDetails?.salaryDisplay || job.salaryDetails?.basicSalary);

  const companyOrInstitution = job.companyNameSi || job.companyName
    ? (isSi && job.companyNameSi ? job.companyNameSi : (job.companyName || job.companyNameSi))
    : (job.countrySi || job.country)
    ? `${isSi && job.countrySi ? job.countrySi : job.country} ${job.agency ? `• ${job.agency}` : ''}`
    : (isSi && job.institution?.nameSi ? job.institution.nameSi : (job.institution?.name || job.location || 'Sri Lanka'));

  const effectiveApplyLink = job.applyLink || job.applicationInfo?.applyLink;

  const hasAnyPdfs = Boolean(
    job.applicationInfo?.gazetteUrl ||
    job.applicationInfo?.gazetteUrlSi ||
    job.applicationInfo?.specimenAppUrl ||
    job.applicationInfo?.specimenAppUrlSi
  );

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] font-roboto">
      <SEO 
        title={`${displayTitle} | Aswanna Careers`}
        description={job.description ? job.description.slice(0, 160) : `Agricultural career opportunity: ${displayTitle}`}
        canonical={`/careers/${job.id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": displayTitle,
          "description": job.description || displayTitle,
          "datePosted": job.createdAt,
          "validThrough": job.expiryDate,
          "hiringOrganization": {
            "@type": "Organization",
            "name": companyOrInstitution
          }
        }}
      />

      {/* Hero Header */}
      <PageHero 
        title={t('careers.title', 'CAREERS')} 
        description=""
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#006837"
        icon={Briefcase}
        badgeBg="bg-[#006837]"
        waveColor="text-[#fafbfc]"
      />

      <div className="container mx-auto px-4 lg:px-12 py-8 sm:py-12">

        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate('/careers')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-50 border border-gray-200 px-4 py-2 rounded-full transition-all cursor-pointer shadow-xs w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isSi ? 'සියලු රැකියා වෙත' : 'Back to Careers'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-xs cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? (isSi ? 'ලින්ක් එක කොපි විය' : 'Link Copied') : (isSi ? 'බෙදාහරින්න' : 'Share')}</span>
            </button>
          </div>
        </div>

        {/* Job Header Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_6px_24px_rgba(0,0,0,0.05)] p-6 sm:p-10 mb-8 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
              {displayCategory}
            </span>
            {displayNature && (
              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                {displayNature}
              </span>
            )}
            {displayServiceCategory && (
              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                {displayServiceCategory}
              </span>
            )}
            {job.expiryDate && (
              <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5 ml-auto">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>{isSi ? 'අවසන් දිනය:' : 'Closing Date:'} {new Date(job.expiryDate).toLocaleDateString()}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#143d4d] leading-tight mb-2">
            {displayTitle}
          </h1>

          {secondaryTitle && (
            <p className="text-base text-gray-500 font-medium mb-4">
              {secondaryTitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 font-medium pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {job.country || job.agency ? (
                <Globe className="w-4 h-4 text-emerald-600" />
              ) : job.companyName || job.companyNameSi ? (
                <Building2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Landmark className="w-4 h-4 text-emerald-600" />
              )}
              <span className="text-gray-900 font-semibold">{companyOrInstitution}</span>
            </div>

            {displaySalary && (
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <DollarSign className="w-4 h-4" />
                <span>{displaySalary}</span>
              </div>
            )}
          </div>

          {/* Prominent Apply Button in Header */}
          {effectiveApplyLink && (
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs sm:text-sm text-emerald-900 font-medium">
                {isSi ? 'මෙම රැකියාව සඳහා සෘජුවම මාර්ගගතව අයදුම් කළ හැක' : 'Online direct application is open for this position'}
              </span>
              <a
                href={effectiveApplyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#006837] hover:bg-[#00532c] text-white text-sm font-bold px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <span>{isSi ? 'සෘජුවම අයදුම් කරන්න' : 'Apply Online Now'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Comprehensive Details (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Job Description & Overview */}
            {(job.sinhalaDescription || job.description) && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-3">
                <h3 className="text-lg font-bold text-[#143d4d] flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Briefcase className="w-5 h-5 text-emerald-700" />
                  <span>{isSi ? 'රැකියා විස්තරය සහ කාර්යභාරය' : 'Job Description & Overview'}</span>
                </h3>
                <div
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed rich-content"
                  dangerouslySetInnerHTML={{
                    __html: ((isSi && job.sinhalaDescription ? job.sinhalaDescription : job.description) || '').replace(/&nbsp;|\u00a0/g, ' ')
                  }}
                />
              </div>
            )}

            {/* 2. Salary & Allowances Details */}
            {job.salaryDetails && (
              job.salaryDetails.salaryCode ||
              job.salaryDetails.basicSalary ||
              job.salaryDetails.salaryScale ||
              job.salaryDetails.allowances ||
              job.salaryDetails.salaryDisplay
            ) && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#143d4d] flex items-center gap-2 border-b border-gray-100 pb-3">
                  <DollarSign className="w-5 h-5 text-emerald-700" />
                  <span>{isSi ? 'වැටුප් සහ දීමනා විස්තර' : 'Salary & Allowance Details'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {job.salaryDetails.salaryCode && (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <span className="text-xs text-gray-500 font-medium block mb-1">{isSi ? 'වැටුප් කේතය' : 'Salary Code'}</span>
                      <span className="font-bold text-gray-900 text-sm">{job.salaryDetails.salaryCode}</span>
                    </div>
                  )}
                  {(job.salaryDetails.basicSalary || job.salaryDetails.salaryDisplay) && (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <span className="text-xs text-gray-500 font-medium block mb-1">{isSi ? 'මූලික වැටුප' : 'Basic Salary'}</span>
                      <span className="font-bold text-emerald-800 text-sm">
                        {isSi && job.salaryDetails.basicSalarySi ? job.salaryDetails.basicSalarySi : (job.salaryDetails.basicSalary || job.salaryDetails.salaryDisplay)}
                      </span>
                    </div>
                  )}
                </div>

                {job.salaryDetails.salaryScale && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                    <span className="text-xs text-gray-500 font-medium block mb-1">{isSi ? 'වැටුප් පරිමාණය' : 'Salary Scale'}</span>
                    <span className="font-medium text-gray-800">
                      {isSi && job.salaryDetails.salaryScaleSi ? job.salaryDetails.salaryScaleSi : job.salaryDetails.salaryScale}
                    </span>
                  </div>
                )}

                {job.salaryDetails.allowances && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1.5">{isSi ? 'හිමිවන දීමනා' : 'Allowances'}</span>
                    <div className="prose prose-sm max-w-none text-gray-700 rich-content" dangerouslySetInnerHTML={{ __html: isSi && job.salaryDetails.allowancesSi ? job.salaryDetails.allowancesSi : job.salaryDetails.allowances }} />
                  </div>
                )}
              </div>
            )}

            {/* 3. Eligibility & Qualifications */}
            {job.eligibility && (
              job.eligibility.qualifications ||
              job.eligibility.basicExperience ||
              job.eligibility.ageLimit ||
              job.eligibility.ageRelaxation
            ) && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#143d4d] flex items-center gap-2 border-b border-gray-100 pb-3">
                  <GraduationCap className="w-5 h-5 text-emerald-700" />
                  <span>{isSi ? 'සුදුසුකම් සහ සේවා කොන්දේසි' : 'Eligibility & Qualifications'}</span>
                </h3>

                {(job.eligibility.ageLimit || job.eligibility.ageRelaxation) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {job.eligibility.ageLimit && (
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <span className="text-xs text-gray-500 font-medium block mb-1">{isSi ? 'වයස් සීමාව' : 'Age Limit'}</span>
                        <span className="font-bold text-gray-900">{isSi && job.eligibility.ageLimitSi ? job.eligibility.ageLimitSi : job.eligibility.ageLimit}</span>
                      </div>
                    )}
                    {job.eligibility.ageRelaxation && (
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <span className="text-xs text-gray-500 font-medium block mb-1">{isSi ? 'වයස් ලිහිල් කිරීම්' : 'Age Relaxation'}</span>
                        <span className="font-bold text-gray-900">{isSi && job.eligibility.ageRelaxationSi ? job.eligibility.ageRelaxationSi : job.eligibility.ageRelaxation}</span>
                      </div>
                    )}
                  </div>
                )}

                {job.eligibility.qualifications && (
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-sm">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">
                      {isSi ? 'අධ්‍යාපනික සහ වෘත්තීය සුදුසුකම්' : 'Educational & Professional Qualifications'}
                    </span>
                    <div className="prose prose-sm max-w-none text-gray-700 rich-content" dangerouslySetInnerHTML={{ __html: isSi && job.eligibility.qualificationsSi ? job.eligibility.qualificationsSi : job.eligibility.qualifications }} />
                  </div>
                )}

                {job.eligibility.basicExperience && (
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-sm">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">
                      {isSi ? 'අවශ්‍ය සේවා පළපුරුද්ද හා පුරවැසිභාවය' : 'Required Experience & Citizenship'}
                    </span>
                    <div className="prose prose-sm max-w-none text-gray-700 rich-content" dangerouslySetInnerHTML={{ __html: isSi && job.eligibility.basicExperienceSi ? job.eligibility.basicExperienceSi : job.eligibility.basicExperience }} />
                  </div>
                )}
              </div>
            )}

            {/* 4. Selection Procedure */}
            {job.selectionProcedure && (
              job.selectionProcedure.method ||
              job.selectionProcedure.examDetails
            ) && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#143d4d] flex items-center gap-2 border-b border-gray-100 pb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>{isSi ? 'තෝරා ගැනීමේ ක්‍රමවේදය' : 'Selection Procedure'}</span>
                </h3>

                {job.selectionProcedure.method && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                    <span className="text-xs text-gray-500 font-medium block mb-1">{isSi ? 'තේරීම් ක්‍රමය' : 'Method of Selection'}</span>
                    <span className="font-semibold text-gray-900">{isSi && job.selectionProcedure.methodSi ? job.selectionProcedure.methodSi : job.selectionProcedure.method}</span>
                  </div>
                )}

                {job.selectionProcedure.examDetails && (
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-sm">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">
                      {isSi ? 'විභාගය / සම්මුඛ පරීක්ෂණ විස්තර' : 'Examination & Interview Details'}
                    </span>
                    <div className="prose prose-sm max-w-none text-gray-700 rich-content" dangerouslySetInnerHTML={{ __html: isSi && job.selectionProcedure.examDetailsSi ? job.selectionProcedure.examDetailsSi : job.selectionProcedure.examDetails }} />
                  </div>
                )}
              </div>
            )}

            {/* 5. Application Instructions */}
            {job.applicationInfo && (
              job.applicationInfo.gazetteNo ||
              job.applicationInfo.examFee ||
              job.applicationInfo.postalAddress ||
              job.applicationInfo.envelopeMarking ||
              job.applicationInfo.submissionDetails
            ) && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#143d4d] flex items-center gap-2 border-b border-gray-100 pb-3">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <span>{isSi ? 'අයදුම්පත් සහ ගැසට් උපදෙස්' : 'Application & Gazette Instructions'}</span>
                </h3>

                {(job.applicationInfo.gazetteNo || job.applicationInfo.examFee) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {job.applicationInfo.gazetteNo && (
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <span className="text-xs text-gray-500 font-medium block mb-1">{isSi ? 'ගැසට් අංකය' : 'Gazette Number'}</span>
                        <span className="font-semibold text-gray-900">
                          {job.applicationInfo.gazetteNo}
                          {job.applicationInfo.gazetteDate && ` (${new Date(job.applicationInfo.gazetteDate).toLocaleDateString()})`}
                        </span>
                      </div>
                    )}
                    {job.applicationInfo.examFee && (
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <span className="text-xs text-gray-500 font-medium block mb-1">{isSi ? 'විභාග ගාස්තුව' : 'Application / Exam Fee'}</span>
                        <span className="font-semibold text-gray-900">{isSi && job.applicationInfo.examFeeSi ? job.applicationInfo.examFeeSi : job.applicationInfo.examFee}</span>
                      </div>
                    )}
                  </div>
                )}

                {job.applicationInfo.postalAddress && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">
                      {isSi ? 'අයදුම්පත් යොමු කළ යුතු ලිපිනය' : 'Send Applications To (Postal Address)'}
                    </span>
                    <div className="font-medium text-gray-800 whitespace-pre-line">{isSi && job.applicationInfo.postalAddressSi ? job.applicationInfo.postalAddressSi : job.applicationInfo.postalAddress}</div>
                  </div>
                )}

                {job.applicationInfo.envelopeMarking && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1.5">
                      {isSi ? 'ලිපි කවරයේ වම්පස ඉහළ කෙළවරේ සටහන' : 'Marking on the Top-Left Corner of Envelope'}
                    </span>
                    <div className="prose prose-sm max-w-none text-gray-800 rich-content" dangerouslySetInnerHTML={{ __html: isSi && job.applicationInfo.envelopeMarkingSi ? job.applicationInfo.envelopeMarkingSi : job.applicationInfo.envelopeMarking }} />
                  </div>
                )}

                {job.applicationInfo.submissionDetails && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1.5">
                      {isSi ? 'අමතර ඉදිරිපත් කිරීමේ විස්තර සහ උපදෙස්' : 'Additional Submission Details'}
                    </span>
                    <div className="prose prose-sm max-w-none text-gray-700 rich-content" dangerouslySetInnerHTML={{ __html: isSi && job.applicationInfo.submissionDetailsSi ? job.applicationInfo.submissionDetailsSi : job.applicationInfo.submissionDetails }} />
                  </div>
                )}
              </div>
            )}

            {/* 6. Official PDF Documents Download */}
            {hasAnyPdfs && (
              <div className="bg-gradient-to-br from-[#0c2f24] via-[#09472e] to-[#04331b] p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
                      <Download className="w-5 h-5 text-emerald-400" />
                      <span>{isSi ? 'නිල ලේඛන සහ අයදුම්පත් බාගත කිරීම' : 'Official Documents & Specimen Applications'}</span>
                    </h3>
                    <p className="text-xs text-emerald-200/80 mt-1">
                      {isSi ? 'ගැසට් නිවේදන සහ ආදර්ශ අයදුම්පත් PDF ගොනු මෙතැනින් බාගත කරගන්න' : 'Download official PDF gazettes and specimen application forms'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {job.applicationInfo?.gazetteUrl && (
                    <a
                      href={job.applicationInfo.gazetteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-300" />
                        <div>
                          <p className="text-sm font-semibold text-white">Official Gazette (English)</p>
                          <p className="text-xs text-gray-300">PDF • Download / View</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-emerald-400" />
                    </a>
                  )}

                  {job.applicationInfo?.gazetteUrlSi && (
                    <a
                      href={job.applicationInfo.gazetteUrlSi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-300" />
                        <div>
                          <p className="text-sm font-semibold text-white">රාජ්‍ය ගැසට් පත්‍රය (සිංහල)</p>
                          <p className="text-xs text-gray-300">PDF • බාගත කරන්න</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-emerald-400" />
                    </a>
                  )}

                  {job.applicationInfo?.specimenAppUrl && (
                    <a
                      href={job.applicationInfo.specimenAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-300" />
                        <div>
                          <p className="text-sm font-semibold text-white">Specimen Application (English)</p>
                          <p className="text-xs text-gray-300">PDF Form • Download</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-emerald-400" />
                    </a>
                  )}

                  {job.applicationInfo?.specimenAppUrlSi && (
                    <a
                      href={job.applicationInfo.specimenAppUrlSi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-300" />
                        <div>
                          <p className="text-sm font-semibold text-white">ආදර්ශ අයදුම්පත්‍රය (සිංහල)</p>
                          <p className="text-xs text-gray-300">PDF Form • බාගත කරන්න</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-emerald-400" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* 7. Dedicated Online Application Banner */}
            {effectiveApplyLink && (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h4 className="text-base font-bold text-emerald-950 mb-1">
                    {isSi ? 'සෘජු මාර්ගගත අයදුම්පත (Direct Online Application)' : 'Direct Online Application Portal'}
                  </h4>
                  <p className="text-xs text-emerald-800">
                    {isSi ? 'මෙම රැකියාව සඳහා අන්තර්ජාලය ඔස්සේ සෘජුවම අයදුම් කිරීමට මෙම සබැඳිය භාවිතා කරන්න.' : 'Click to visit the official online application / registration portal directly.'}
                  </p>
                </div>
                <a
                  href={effectiveApplyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#006837] hover:bg-[#00532c] text-white font-bold text-sm tracking-wide shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <span>{isSi ? 'සෘජුව අයදුම් කරන්න' : 'Apply Online Now'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

          </div>

          {/* Right Column: Sticky Sidebar Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs sticky top-28 space-y-5">
              <h4 className="font-bold text-[#143d4d] text-base border-b border-gray-100 pb-3">
                {isSi ? 'රැකියා සාරාංශය' : 'Job Overview'}
              </h4>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-400 block text-xs">{isSi ? 'අංශය' : 'Sector / Category'}</span>
                  <span className="font-bold text-gray-800">{displayCategory}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-xs">{isSi ? 'ආයතනය / සමාගම' : 'Organization'}</span>
                  <span className="font-bold text-gray-800">{companyOrInstitution}</span>
                </div>

                {job.location && (
                  <div>
                    <span className="text-gray-400 block text-xs">{isSi ? 'ස්ථානය' : 'Location'}</span>
                    <span className="font-bold text-gray-800">{job.location}</span>
                  </div>
                )}

                {displayNature && (
                  <div>
                    <span className="text-gray-400 block text-xs">{isSi ? 'සේවා ස්වභාවය' : 'Employment Type'}</span>
                    <span className="font-bold text-gray-800">{displayNature}</span>
                  </div>
                )}

                {job.expiryDate && (
                  <div>
                    <span className="text-gray-400 block text-xs">{isSi ? 'අයදුම්පත් භාරගන්නා අවසන් දිනය' : 'Closing Date'}</span>
                    <span className="font-bold text-amber-700">{new Date(job.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}

                {displaySalary && (
                  <div>
                    <span className="text-gray-400 block text-xs">{isSi ? 'වැටුප' : 'Salary'}</span>
                    <span className="font-bold text-emerald-800">{displaySalary}</span>
                  </div>
                )}
              </div>

              {effectiveApplyLink && (
                <div className="pt-3 border-t border-gray-100">
                  <a
                    href={effectiveApplyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-full bg-[#006837] hover:bg-[#00532c] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>{isSi ? 'අයදුම් කරන්න ↗' : 'Apply Online ↗'}</span>
                  </a>
                </div>
              )}

              <div className="pt-2 text-center">
                <Link
                  to="/careers"
                  className="text-xs font-semibold text-gray-500 hover:text-emerald-700 underline underline-offset-4"
                >
                  {isSi ? '← සියලු රැකියා ලැයිස්තුව' : '← All Careers List'}
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
