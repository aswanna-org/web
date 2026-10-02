import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, X, Briefcase, Download, FileText, Calendar, DollarSign, GraduationCap, CheckCircle2, Building2 } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import Pagination from '../../components/admin/Pagination';
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
  };
  approvalStatus?: string;
  isActive: boolean;
  createdAt: string;
}

export default function Careers() {
  const { t, i18n } = useTranslation();
  const isSi = i18n.language === 'si';
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number>('ALL');
  const [categories, setCategories] = useState<{ id: number; name: string; nameSi?: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 8;

  const [jobsData, setJobsData] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', location: '', description: '' });
  const [expandedJob, setExpandedJob] = useState<string | number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/careers/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, [API_BASE_URL]);

  // Debounce search query so user typing doesn't spam API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch jobs with server-side pagination whenever page, search, or category changes
  useEffect(() => {
    fetchJobs(currentPage, debouncedSearch, selectedCategoryId);
  }, [currentPage, debouncedSearch, selectedCategoryId]);

  const fetchJobs = async (page = 1, search = '', categoryId: string | number = 'ALL') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        approvalStatus: 'APPROVED',
        isActive: 'true'
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      if (categoryId && categoryId !== 'ALL') {
        params.append('jobCategoryId', String(categoryId));
      }

      const res = await fetch(`${API_BASE_URL}/careers/openings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobsData(data.data || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setTotalItems(data.meta.total || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (catId: string | number) => {
    setSelectedCategoryId(catId);
    setCurrentPage(1);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.location || !newJob.description) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/careers/openings/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      if (res.ok) {
        alert("Job submitted successfully! It will be visible after admin approval.");
        setIsModalOpen(false);
        setNewJob({ title: '', location: '', description: '' });
      } else {
        alert("Failed to submit job.");
      }
    } catch (err) {
      alert("Error submitting job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageKeywords = useMemo(() => {
    const list: string[] = [
      'Agri Jobs Sri Lanka',
      'කෘෂි රැකියා',
      'Aswanna careers',
      'agriculture vacancies',
      'farming employment Sri Lanka'
    ];

    if (searchQuery.trim()) list.push(searchQuery.trim());

    jobsData.forEach(j => {
      if (j.title) list.push(j.title);
      if (j.designation) list.push(j.designation);
      if (j.designationSi) list.push(j.designationSi);
      if (j.location) list.push(j.location);
    });

    return Array.from(new Set(list.filter(Boolean))).slice(0, 30).join(', ');
  }, [jobsData, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-white font-roboto">
      <SEO 
        title="රැකියා අවස්ථා | Careers at Aswanna"
        description="කෘෂිකාර්මික ක්ෂේත්‍රයේ නවීන රැකියා අවස්ථා සහ වෘත්තීය මඟපෙන්වීම්. Be part of the agricultural revolution with Aswanna."
        canonical="/careers"
        keywords={pageKeywords}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": jobsData.slice(0, 10).map((job, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": job.title || job.designation,
            "description": job.description
          }))
        }}
      />
      {/* Hero Section */}
      <PageHero 
        title={t('careers.title', 'CAREERS')} 
        description={t('careers.desc', 'Be part of the agricultural revolution. Explore opportunities across government, private sector, NGOs, and daily wage roles.')} 
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#1e3a8a"
        icon={Briefcase}
        badgeBg="bg-[#2563eb]"
        waveColor="text-white"
      />

      {/* Filter and Search Section */}
      <section className="w-full py-6 sm:py-8 bg-white border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            {/* Search Bar */}
            <div className="w-full md:w-96 relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-full border border-gray-200/90 bg-gray-50/70 hover:bg-white focus:bg-white hover:border-emerald-500/60 focus:border-[#006837] focus:ring-3 focus:ring-[#006837]/15 outline-none transition-all duration-200 text-xs sm:text-sm text-gray-800 shadow-xs"
                placeholder={t('careers.searchPlaceholder', 'Search for jobs, roles, or locations...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Filters */}
            <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleCategoryChange('ALL')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedCategoryId === 'ALL'
                    ? 'bg-[#006837] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80 border border-gray-200'
                }`}
              >
                {isSi ? 'සියලුම රැකියා' : 'All Roles'}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    selectedCategoryId === cat.id
                      ? 'bg-[#006837] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80 border border-gray-200'
                  }`}
                >
                  {isSi && cat.nameSi ? cat.nameSi : cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Jobs List Section (Redesigned matching mockup) */}
      <section className="w-full py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

            {/* Left Sidebar */}
            <div className="w-full lg:w-1/4 flex flex-col items-start lg:sticky lg:top-32 h-fit">
              <h2 className="text-[3rem] lg:text-[3.8rem] font-bold text-[#143d4d] leading-[1.1] mb-8 lg:mb-12 tracking-tight">
                {isSi ? <>විවෘත<br />රැකියා</> : <>Our Open<br />Roles</>}
              </h2>
              <div className="flex flex-col items-start border-t-2 border-[var(--color-primary)] pt-6 w-full max-w-[220px]">
                <p className="text-xs font-bold text-[#143d4d] tracking-widest uppercase mb-2">
                  {isSi ? 'සම්බන්ධ වන්න' : 'Or contact us with'}
                </p>
                <a href="mailto:aswanna.agri@gmail.com" className="text-[#e87f3b] text-base sm:text-lg font-medium underline underline-offset-4 decoration-[#e87f3b]/30 hover:decoration-[#e87f3b] transition-colors break-all">
                  aswanna.agri@gmail.com
                </a>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="glass-btn-green mt-8 px-7 py-3.5 text-sm sm:text-base tracking-wider uppercase w-full sm:w-auto"
              >
                {isSi ? 'රැකියාවක් පළ කරන්න (දෛනික වැටුප්)' : 'Post a Job (Daily Wage)'}
              </button>
            </div>

            {/* Right Job List */}
            <div className="w-full lg:w-3/4 flex flex-col">
              {isLoading ? (
                <div className="py-20 flex justify-center">
                  <AgroLoader message={t('careers.loading', 'රැකියා තොරතුරු පූරණය වෙමින් පවතී...')} />
                </div>
              ) : jobsData.length > 0 ? (
                jobsData.map((job, index) => {
                  const displayTitle = isSi && job.designationSi ? job.designationSi : (job.designation || job.title);
                  const secondaryTitle = isSi ? job.designation : job.designationSi;
                  const displayCategory = isSi && job.jobCategory?.nameSi ? job.jobCategory.nameSi : (job.jobCategory?.name || 'CAREERS');
                  const displayServiceCategory = isSi && job.serviceCategorySi ? job.serviceCategorySi : job.serviceCategory;
                  const displayNature = isSi && job.jobNatureSi ? job.jobNatureSi : job.jobNature;
                  const displayConditions = isSi && job.serviceConditionsSi ? job.serviceConditionsSi : job.serviceConditions;
                  const displayInstitution = isSi && job.institution?.nameSi ? job.institution.nameSi : (job.institution?.name || job.location || 'Sri Lanka');
                  const displayMinistry = isSi && job.institution?.ministry?.nameSi ? job.institution.ministry.nameSi : job.institution?.ministry?.name;

                  // Salary Details
                  const salaryCode = job.salaryDetails?.salaryCode;
                  const basicSalary = isSi && job.salaryDetails?.basicSalarySi ? job.salaryDetails.basicSalarySi : job.salaryDetails?.basicSalary;
                  const displaySalary = isSi && (job.salaryDetails?.salaryDisplaySi || job.salaryDetails?.basicSalarySi)
                    ? (job.salaryDetails?.salaryDisplaySi || job.salaryDetails?.basicSalarySi)
                    : (job.salaryDetails?.salaryDisplay || job.salaryDetails?.basicSalary);
                  const salaryScale = isSi && job.salaryDetails?.salaryScaleSi ? job.salaryDetails.salaryScaleSi : job.salaryDetails?.salaryScale;
                  const allowances = isSi && job.salaryDetails?.allowancesSi ? job.salaryDetails.allowancesSi : job.salaryDetails?.allowances;

                  // Eligibility
                  const qualifications = isSi && job.eligibility?.qualificationsSi ? job.eligibility.qualificationsSi : job.eligibility?.qualifications;
                  const basicExperience = isSi && job.eligibility?.basicExperienceSi ? job.eligibility.basicExperienceSi : job.eligibility?.basicExperience;
                  const ageLimit = isSi && job.eligibility?.ageLimitSi ? job.eligibility.ageLimitSi : job.eligibility?.ageLimit;
                  const ageRelaxation = isSi && job.eligibility?.ageRelaxationSi ? job.eligibility.ageRelaxationSi : job.eligibility?.ageRelaxation;

                  // Selection Procedure
                  const selectionMethod = isSi && job.selectionProcedure?.methodSi ? job.selectionProcedure.methodSi : job.selectionProcedure?.method;
                  const examDetails = isSi && job.selectionProcedure?.examDetailsSi ? job.selectionProcedure.examDetailsSi : job.selectionProcedure?.examDetails;

                  // Application Info
                  const gazetteNo = job.applicationInfo?.gazetteNo;
                  const gazetteDate = job.applicationInfo?.gazetteDate;
                  const examFee = isSi && job.applicationInfo?.examFeeSi ? job.applicationInfo.examFeeSi : job.applicationInfo?.examFee;
                  const postalAddress = isSi && job.applicationInfo?.postalAddressSi ? job.applicationInfo.postalAddressSi : job.applicationInfo?.postalAddress;
                  const envelopeMarking = isSi && job.applicationInfo?.envelopeMarkingSi ? job.applicationInfo.envelopeMarkingSi : job.applicationInfo?.envelopeMarking;
                  const submissionDetails = isSi && job.applicationInfo?.submissionDetailsSi ? job.applicationInfo.submissionDetailsSi : job.applicationInfo?.submissionDetails;

                  // PDFs
                  const gazetteUrl = job.applicationInfo?.gazetteUrl;
                  const gazetteUrlSi = job.applicationInfo?.gazetteUrlSi;
                  const specimenAppUrl = job.applicationInfo?.specimenAppUrl;
                  const specimenAppUrlSi = job.applicationInfo?.specimenAppUrlSi;
                  const hasAnyPdfs = Boolean(gazetteUrl || gazetteUrlSi || specimenAppUrl || specimenAppUrlSi);

                  return (
                    <div 
                      key={job.id} 
                      style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                      className="animate-card-pop border-b border-gray-200 flex flex-col"
                    >
                      <div
                        className="py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group cursor-pointer"
                        onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                      >
                        <div className="flex flex-col">
                          {/* Clean, Non-Rainbow Metadata Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-2.5">
                            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              {displayCategory}
                            </span>
                            {displayServiceCategory && (
                              <span className="text-[11px] font-medium text-gray-700 bg-gray-100 border border-gray-200/90 px-2.5 py-0.5 rounded-full">
                                {displayServiceCategory}
                              </span>
                            )}
                            {displayNature && (
                              <span className="text-[11px] font-medium text-gray-700 bg-gray-100 border border-gray-200/90 px-2.5 py-0.5 rounded-full">
                                {displayNature}
                              </span>
                            )}
                            {displayConditions && (
                              <span className="text-[11px] font-medium text-gray-700 bg-gray-100 border border-gray-200/90 px-2.5 py-0.5 rounded-full">
                                {displayConditions}
                              </span>
                            )}
                          </div>

                          <h3 className="text-2xl sm:text-3xl font-bold text-[#143d4d] mb-1 tracking-tight group-hover:text-[var(--color-primary)] transition-colors">
                            {displayTitle}
                          </h3>
                          {secondaryTitle && (
                            <p className="text-sm text-gray-500 font-medium mb-2">{secondaryTitle}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-y-1 text-sm text-gray-500 font-medium tracking-wide">
                            {displayInstitution ? (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                <span>{displayInstitution}</span>
                                {displayMinistry && (
                                  <span className="text-gray-400 font-normal"> ({displayMinistry})</span>
                                )}
                              </span>
                            ) : (
                              <span>{job.location || 'Sri Lanka'}</span>
                            )}

                            {job.expiryDate && (
                              <>
                                <span className="mx-2 text-gray-300">•</span>
                                <span className="text-amber-700 font-semibold flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" /> {isSi ? 'අවසන් දිනය:' : 'Closes:'} {new Date(job.expiryDate).toLocaleDateString()}
                                </span>
                              </>
                            )}

                            {displaySalary && (
                              <>
                                <span className="mx-2 text-gray-300">•</span>
                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                  <DollarSign className="w-3.5 h-3.5" /> {displaySalary}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                          <button
                            className={`w-11 h-11 rounded-full border border-[var(--color-secondary)]/30 flex items-center justify-center transition-all duration-300 hidden sm:flex shrink-0 ${expandedJob === job.id ? 'bg-[var(--color-secondary)] text-white rotate-180' : 'hover:bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'}`}
                            onClick={(e) => { e.stopPropagation(); setExpandedJob(expandedJob === job.id ? null : job.id); }}
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                          <button
                            className="glass-btn-green px-8 py-3.5 text-sm sm:text-base uppercase tracking-wider shrink-0 w-full sm:w-auto"
                            onClick={(e) => { e.stopPropagation(); setExpandedJob(expandedJob === job.id ? null : job.id); }}
                          >
                            {expandedJob === job.id ? (isSi ? 'විස්තර සඟවන්න' : 'Hide Details') : (isSi ? 'විස්තර බලන්න' : 'View Details')}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Details Container - Unconstrained Height */}
                      <div
                        className={`transition-all duration-300 ease-in-out ${expandedJob === job.id ? 'block opacity-100 mt-2 mb-10' : 'hidden opacity-0'}`}
                      >
                        <div className="pl-4 sm:pl-6 border-l-4 border-[var(--color-primary)]/40 pt-4 pb-4 space-y-6">

                          {/* 1. Salary & Allowances Details */}
                          {job.salaryDetails && (salaryCode || basicSalary || salaryScale || allowances) && (
                            <div className="bg-gray-50/80 border border-gray-200/80 p-5 rounded-2xl space-y-3">
                              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm uppercase tracking-wider">
                                <DollarSign className="w-4 h-4 text-emerald-700" />
                                <span>{isSi ? 'වැටුප් සහ දීමනා විස්තර' : 'Salary & Allowance Details'}</span>
                              </div>
                              
                              {(salaryCode || basicSalary) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                  {salaryCode && (
                                    <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 shadow-xs">
                                      <span className="text-xs text-gray-500 font-medium block mb-0.5">{isSi ? 'වැටුප් කේතය' : 'Salary Code'}</span>
                                      <span className="font-semibold text-gray-900">{salaryCode}</span>
                                    </div>
                                  )}
                                  {basicSalary && (
                                    <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 shadow-xs">
                                      <span className="text-xs text-gray-500 font-medium block mb-0.5">{isSi ? 'මූලික වැටුප' : 'Basic Salary'}</span>
                                      <span className="font-semibold text-gray-900">{basicSalary}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {salaryScale && (
                                <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 shadow-xs text-sm">
                                  <span className="text-xs text-gray-500 font-medium block mb-1">{isSi ? 'වැටුප් පරිමාණය' : 'Salary Scale'}</span>
                                  <span className="font-medium text-gray-800">{salaryScale}</span>
                                </div>
                              )}

                              {allowances && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-xs text-sm">
                                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1.5">{isSi ? 'හිමිවන දීමනා' : 'Allowances'}</span>
                                  <div className="prose prose-sm max-w-none text-gray-700 rich-content" dangerouslySetInnerHTML={{ __html: allowances }} />
                                </div>
                              )}
                            </div>
                          )}

                          {/* 2. Job Description */}
                          {(isSi && job.sinhalaDescription ? job.sinhalaDescription : job.description) && (
                            <div className="bg-gray-50/80 border border-gray-200/80 p-5 rounded-2xl space-y-2">
                              <h4 className="text-base font-bold text-[#143d4d] flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-emerald-700" />
                                {isSi ? 'රැකියා විස්තරය සහ කාර්යභාරය' : 'Job Description & Overview'}
                              </h4>
                              <div 
                                className="text-gray-700 leading-relaxed prose prose-sm max-w-none rich-content bg-white p-4 rounded-xl border border-gray-200/60 shadow-xs"
                                dangerouslySetInnerHTML={{ __html: ((isSi && job.sinhalaDescription ? job.sinhalaDescription : job.description) || '').replace(/&nbsp;|\u00a0/g, ' ') }}
                              />
                            </div>
                          )}

                          {/* 3. Eligibility & Qualifications */}
                          {job.eligibility && (qualifications || ageLimit || ageRelaxation || basicExperience) && (
                            <div className="bg-gray-50/80 border border-gray-200/80 p-5 rounded-2xl space-y-4">
                              <h4 className="text-base font-bold text-[#143d4d] flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-emerald-700" />
                                {isSi ? 'සුදුසුකම් සහ සේවා කොන්දේසි' : 'Eligibility & Qualifications'}
                              </h4>

                              {(ageLimit || ageRelaxation) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                  {ageLimit && (
                                    <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 shadow-xs">
                                      <span className="text-xs text-gray-500 font-medium block mb-0.5">{isSi ? 'වයස් සීමාව' : 'Age Limit'}</span>
                                      <span className="font-semibold text-gray-900">{ageLimit}</span>
                                    </div>
                                  )}
                                  {ageRelaxation && (
                                    <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 shadow-xs">
                                      <span className="text-xs text-gray-500 font-medium block mb-0.5">{isSi ? 'වයස් ලිහිල් කිරීම්' : 'Age Relaxation'}</span>
                                      <span className="font-semibold text-gray-900">{ageRelaxation}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {qualifications && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-xs">
                                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                                    {isSi ? 'අධ්‍යාපනික සහ වෘත්තීය සුදුසුකම්' : 'Educational & Professional Qualifications'}
                                  </span>
                                  <div className="prose prose-sm max-w-none text-gray-700 rich-content" dangerouslySetInnerHTML={{ __html: qualifications }} />
                                </div>
                              )}

                              {basicExperience && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-xs">
                                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                                    {isSi ? 'අවශ්‍ය සේවා පළපුරුද්ද හා පුරවැසිභාවය' : 'Required Experience & Citizenship'}
                                  </span>
                                  <div className="prose prose-sm max-w-none text-gray-700 rich-content" dangerouslySetInnerHTML={{ __html: basicExperience }} />
                                </div>
                              )}
                            </div>
                          )}

                          {/* 4. Selection Procedure */}
                          {job.selectionProcedure && (selectionMethod || examDetails) && (
                            <div className="bg-gray-50/80 border border-gray-200/80 p-5 rounded-2xl space-y-3">
                              <h4 className="text-base font-bold text-[#143d4d] flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                                {isSi ? 'තෝරා ගැනීමේ ක්‍රමවේදය' : 'Selection Procedure'}
                              </h4>

                              {selectionMethod && (
                                <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 shadow-xs text-sm">
                                  <span className="text-xs text-gray-500 font-medium block mb-0.5">{isSi ? 'තේරීම් ක්‍රමය' : 'Method of Selection'}</span>
                                  <span className="font-semibold text-gray-900">{selectionMethod}</span>
                                </div>
                              )}

                              {examDetails && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-xs">
                                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                                    {isSi ? 'විභාගය / සම්මුඛ පරීක්ෂණ විස්තර' : 'Examination & Interview Details'}
                                  </span>
                                  <div className="prose prose-sm max-w-none text-gray-700 rich-content" dangerouslySetInnerHTML={{ __html: examDetails }} />
                                </div>
                              )}
                            </div>
                          )}

                          {/* 5. Application Info & Instructions */}
                          {job.applicationInfo && (
                            <div className="bg-gray-50/80 border border-gray-200/80 p-5 rounded-2xl space-y-4">
                              <h4 className="text-base font-bold text-[#143d4d] flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-700" />
                                {isSi ? 'අයදුම්පත් සහ ගැසට් උපදෙස්' : 'Application & Gazette Instructions'}
                              </h4>

                              {(gazetteNo || examFee) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                  {gazetteNo && (
                                    <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 shadow-xs">
                                      <span className="text-xs text-gray-500 font-medium block mb-0.5">{isSi ? 'ගැසට් අංකය' : 'Gazette Number'}</span>
                                      <span className="font-semibold text-gray-900">
                                        {gazetteNo}
                                        {gazetteDate && ` (${new Date(gazetteDate).toLocaleDateString()})`}
                                      </span>
                                    </div>
                                  )}

                                  {examFee && (
                                    <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 shadow-xs">
                                      <span className="text-xs text-gray-500 font-medium block mb-0.5">{isSi ? 'විභාග ගාස්තුව' : 'Application / Examination Fee'}</span>
                                      <span className="font-semibold text-gray-900">{examFee}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {postalAddress && (
                                <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 shadow-xs text-sm">
                                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">
                                    {isSi ? 'අයදුම්පත් යොමු කළ යුතු ලිපිනය' : 'Send Applications To (Postal Address)'}
                                  </span>
                                  <div className="font-medium text-gray-800 whitespace-pre-line">{postalAddress}</div>
                                </div>
                              )}

                              {envelopeMarking && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-xs text-sm">
                                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1.5">
                                    {isSi ? 'ලිපි කවරයේ වම්පස ඉහළ කෙළවරේ සටහන' : 'Marking on the Top-Left Corner of Envelope'}
                                  </span>
                                  <div className="prose prose-sm max-w-none text-gray-800 rich-content" dangerouslySetInnerHTML={{ __html: envelopeMarking }} />
                                </div>
                              )}

                              {submissionDetails && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-xs text-sm">
                                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1.5">
                                    {isSi ? 'අමතර ඉදිරිපත් කිරීමේ විස්තර සහ උපදෙස්' : 'Additional Submission Details'}
                                  </span>
                                  <div className="prose prose-sm max-w-none text-gray-700 rich-content" dangerouslySetInnerHTML={{ __html: submissionDetails }} />
                                </div>
                              )}
                            </div>
                          )}

                          {/* 6. Official PDF Documents & Forms Download Section */}
                          {hasAnyPdfs && (
                            <div className="bg-gradient-to-br from-[#0c2f24] via-[#09472e] to-[#04331b] p-6 rounded-2xl text-white shadow-xl space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-3">
                                <div>
                                  <h4 className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
                                    <Download className="w-5 h-5 text-emerald-400" />
                                    {isSi ? 'නිල ලේඛන සහ අයදුම්පත් බාගත කිරීම' : 'Official Documents & Application Forms'}
                                  </h4>
                                  <p className="text-xs text-emerald-200/80 mt-0.5">
                                    {isSi ? 'අදාළ ගැසට් පත්‍ර සහ ආදර්ශ අයදුම්පත් PDF ආකෘතියෙන් බාගත කරන්න' : 'Download official gazette notices and specimen application forms (PDF)'}
                                  </p>
                                </div>
                                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider w-fit">
                                  Official PDFs
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                                {gazetteUrl && (
                                  <a
                                    href={gazetteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-emerald-400/50 transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        <FileText className="w-5 h-5 text-emerald-300" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                          Official Gazette (English)
                                        </p>
                                        <p className="text-xs text-gray-300 flex items-center gap-1">
                                          <span>PDF Document</span>
                                          <span className="text-gray-400">•</span>
                                          <span className="text-emerald-300 underline underline-offset-2">Download / View</span>
                                        </p>
                                      </div>
                                    </div>
                                    <Download className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform shrink-0 ml-2" />
                                  </a>
                                )}

                                {gazetteUrlSi && (
                                  <a
                                    href={gazetteUrlSi}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-emerald-400/50 transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        <FileText className="w-5 h-5 text-emerald-300" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                          රාජ්‍ය ගැසට් පත්‍රය (සිංහල)
                                        </p>
                                        <p className="text-xs text-gray-300 flex items-center gap-1">
                                          <span>PDF Document</span>
                                          <span className="text-gray-400">•</span>
                                          <span className="text-emerald-300 underline underline-offset-2">බාගත කරන්න</span>
                                        </p>
                                      </div>
                                    </div>
                                    <Download className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform shrink-0 ml-2" />
                                  </a>
                                )}

                                {specimenAppUrl && (
                                  <a
                                    href={specimenAppUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-emerald-400/50 transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        <FileText className="w-5 h-5 text-emerald-300" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                          Specimen Application (English)
                                        </p>
                                        <p className="text-xs text-gray-300 flex items-center gap-1">
                                          <span>PDF Form</span>
                                          <span className="text-gray-400">•</span>
                                          <span className="text-emerald-300 underline underline-offset-2">Download / View</span>
                                        </p>
                                      </div>
                                    </div>
                                    <Download className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform shrink-0 ml-2" />
                                  </a>
                                )}

                                {specimenAppUrlSi && (
                                  <a
                                    href={specimenAppUrlSi}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-emerald-400/50 transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        <FileText className="w-5 h-5 text-emerald-300" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                          ආදර්ශ අයදුම්පත්‍රය (සිංහල)
                                        </p>
                                        <p className="text-xs text-gray-300 flex items-center gap-1">
                                          <span>PDF Form</span>
                                          <span className="text-gray-400">•</span>
                                          <span className="text-emerald-300 underline underline-offset-2">බාගත කරන්න</span>
                                        </p>
                                      </div>
                                    </div>
                                    <Download className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform shrink-0 ml-2" />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full py-20 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center mt-4">
                  <Search className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-[#143d4d] mb-2">{t('careers.noResults', 'No jobs found')}</h3>
                  <p className="text-gray-500 max-w-sm">{t('careers.noResultsDesc', 'We couldn\'t find any open positions matching your search. Try adjusting your filters.')}</p>
                </div>
              )}
              
              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Post a Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 p-8 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full glass-btn-light !p-0 cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            <h3 className="text-3xl font-black text-[#143d4d] mb-2">Post a Job</h3>
            <p className="text-gray-500 mb-8 font-medium">Create a new daily wage / casual labor posting.</p>

            <form onSubmit={handlePostJob} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Job Title</label>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[var(--color-primary)] outline-none"
                  placeholder="e.g. Tea Plucker, Tractor Driver"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Location</label>
                <input
                  type="text"
                  required
                  value={newJob.location}
                  onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[var(--color-primary)] outline-none"
                  placeholder="e.g. Kandy, Sri Lanka"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Job Description *</label>
                <textarea
                  required
                  rows={4}
                  value={newJob.description}
                  onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[var(--color-primary)] outline-none resize-none"
                  placeholder="Describe the job role, requirements, and contact details..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full py-4 glass-btn-green text-sm sm:text-base tracking-wider uppercase font-bold disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Job'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
