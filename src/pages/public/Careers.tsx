import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, X, Briefcase, CheckCircle2, Building2,
  Phone, LogIn, ArrowUpRight, ArrowLeft, Landmark, Users,
  Tractor, Plane,  RotateCcw
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { SRI_LANKA_PROVINCES, getDistricts, getDistrictsForProvince, getDSDsForDistrict, getGNDsForDSD } from '../../data/sriLankaLocations';

interface Job {
  id: string;
  slug?: string;
  designation?: string;
  designationSi?: string;
  title?: string;
  sinhalaTitle?: string;
  description?: string;
  sinhalaDescription?: string;
  location?: string;
  sinhalaLocation?: string;
  jobCategory?: { id: string; slug?: string; name: string; nameSi?: string };
  institution?: { id: string; name: string; nameSi?: string; ministry?: { id: string; name: string; nameSi?: string } };
  serviceCategory?: string;
  serviceCategorySi?: string;
  jobNature?: string;
  jobNatureSi?: string;
  serviceConditions?: string;
  serviceConditionsSi?: string;
  recruitmentType?: string;
  recruitmentTypeSi?: string;
  companyName?: string | null;
  companyNameSi?: string | null;
  governingMinistry?: string | null;
  governingMinistrySi?: string | null;
  agency?: string | null;
  agencySi?: string | null;
  country?: string | null;
  countrySi?: string | null;
  applyLink?: string | null;
  bannerImage?: string | null;
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

interface DailyWageSkill {
  id: string;
  name: string;
  nameSi: string;
  order: number;
}

interface DailyWageWorker {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  dsDivision: string;
  gnDivision: string;
  expectedWage?: string | null;
  experience?: string | null;
  notes?: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  skills: { skill: DailyWageSkill }[];
}

interface JobCategoryData {
  id: string;
  slug?: string;
  name: string;
  nameSi?: string | null;
  image?: string | null;
  _count?: { jobs: number };
}

interface CategoryCardItem {
  id: string;
  slug?: string;
  title: string;
  image: string;
  icon: any;
  filterId: string;
  jobCount?: number;
  isDailyWage?: boolean;
}

// Reusable SVG for wavy card divider matching reference UI
const CardWaveDivider = () => (
  <svg
    className="absolute -bottom-1 left-0 right-0 w-full h-8 sm:h-9 text-white fill-white pointer-events-none z-10 translate-y-1"
    viewBox="0 0 500 70"
    preserveAspectRatio="none"
  >
    <path d="M0,25 C150,55 350,0 500,25 L500,70 L0,70 Z" />
  </svg>
);

// Reusable stylized leaf watermark badge matching reference UI
const AswannaLeafBadge = () => (
  <div className="w-7 h-7 flex items-center justify-center text-emerald-500/80 group-hover:text-emerald-600 transition-colors shrink-0">
    <svg viewBox="0 0 32 32" className="w-7 h-7 fill-current">
      <path d="M16 28c0-7.7 6.3-14 14-14 0 7.7-6.3 14-14 14z" opacity="0.9" />
      <path d="M16 28C16 19.2 8.8 12 0 12c0 8.8 7.2 16 16 16z" opacity="0.6" />
      <path d="M16 28v-8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

// Helper to resolve absolute or relative image URLs safely
const formatImageUrl = (url?: string | null): string | null => {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  if (!clean || clean === 'null' || clean === 'undefined' || clean.includes('/uploads/undefined')) {
    return null;
  }
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const serverBase = apiBase.replace(/\/api\/?$/, '');
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${serverBase}${path}`;
};

export default function Careers() {
  const navigate = useNavigate();
  const { categorySlug, slug } = useParams<{ categorySlug?: string; slug?: string }>();
  const currentCategorySlug = categorySlug || slug;
  const { t, i18n } = useTranslation();
  const isSi = i18n.language === 'si';

  // Navigation State: null = Categories view; non-null = inside category view
  const [activeCategoryView, setActiveCategoryView] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [categories, setCategories] = useState<JobCategoryData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  const [jobsData, setJobsData] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Daily Wage state
  const [availableSkills, setAvailableSkills] = useState<DailyWageSkill[]>([]);
  const [dailyWorkers, setDailyWorkers] = useState<DailyWageWorker[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Daily Wage Location Filter State (Optional - non-compulsory)
  const [filterProvince, setFilterProvince] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');
  const [filterDSD, setFilterDSD] = useState<string>('');
  const [filterGND, setFilterGND] = useState<string>('');

  const [dailyWorkerForm, setDailyWorkerForm] = useState({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    dsDivision: '',
    gnDivision: '',
    expectedWage: '',
    experience: '',
    skills: [] as string[]
  });

  const { isAuthenticated, token, user, openLoginModal } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch categories & available daily skills on mount
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [catsRes, skillsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/careers/categories`),
          fetch(`${API_BASE_URL}/careers/daily-wage-skills?isActive=true`)
        ]);

        if (catsRes.ok) {
          const data = await catsRes.json();
          setCategories(data || []);
        }
        if (skillsRes.ok) {
          const data = await skillsRes.json();
          setAvailableSkills(data || []);
        }
      } catch (err) {
        console.error('Failed to load initial lookups', err);
      }
    };
    fetchLookups();
  }, [API_BASE_URL]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Category cards dynamically mapped from backend Job Categories
  const categoryCards: CategoryCardItem[] = useMemo(() => {
    return categories.map(cat => {
      const slugLower = (cat.slug || '').toLowerCase();
      const nameLower = (cat.name || '').toLowerCase();
      const isDailyWage = slugLower.includes('daily') || nameLower.includes('daily') || Boolean(cat.nameSi && cat.nameSi.includes('දෛනික'));

      // Clean title for Sinhala display (remove English name in brackets if present, e.g. "රාජ්‍ය අංශයේ රැකියා (Government Jobs)" -> "රාජ්‍ය අංශයේ රැකියා")
      let title = cat.name;
      if (isSi && cat.nameSi) {
        title = cat.nameSi.replace(/\s*\([^)]*\)/g, '').trim();
      }

      // Determine Icon
      let icon = Briefcase;
      if (slugLower.includes('gov') || nameLower.includes('gov') || Boolean(cat.nameSi && cat.nameSi.includes('රාජ්‍ය'))) {
        icon = Landmark;
      } else if (slugLower.includes('private') || nameLower.includes('private') || Boolean(cat.nameSi && cat.nameSi.includes('පුද්ගලික'))) {
        icon = Building2;
      } else if (isDailyWage) {
        icon = Tractor;
      } else if (slugLower.includes('foreign') || nameLower.includes('foreign') || Boolean(cat.nameSi && cat.nameSi.includes('විදේශ'))) {
        icon = Plane;
      }

      // Fallback image based on type
      let fallbackImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80';
      if (slugLower.includes('gov') || nameLower.includes('gov') || Boolean(cat.nameSi && cat.nameSi.includes('රාජ්‍ය'))) {
        fallbackImage = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80';
      } else if (slugLower.includes('private') || nameLower.includes('private') || Boolean(cat.nameSi && cat.nameSi.includes('පුද්ගලික'))) {
        fallbackImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80';
      } else if (isDailyWage) {
        fallbackImage = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80';
      } else if (slugLower.includes('foreign') || nameLower.includes('foreign') || Boolean(cat.nameSi && cat.nameSi.includes('විදේශ'))) {
        fallbackImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80';
      }

      return {
        id: cat.id,
        slug: cat.slug,
        title,
        image: formatImageUrl(cat.image) || fallbackImage,
        icon,
        filterId: isDailyWage ? 'DAILY_WAGE' : cat.id,
        jobCount: cat._count?.jobs ?? 0,
        isDailyWage
      };
    });
  }, [categories, isSi]);

  // Match category from route parameter
  const matchedCategory = useMemo(() => {
    if (!currentCategorySlug) return null;
    const target = currentCategorySlug.toLowerCase().trim();
    return categoryCards.find(c => {
      const cardSlug = (c.slug || '').toLowerCase().trim();
      const cardId = (c.id || '').toLowerCase().trim();
      if (cardSlug === target || cardId === target) return true;
      if (target.includes('daily') && c.isDailyWage) return true;
      if (target.includes('gov') && cardSlug.includes('gov')) return true;
      if (target.includes('private') && cardSlug.includes('private')) return true;
      if (target.includes('foreign') && cardSlug.includes('foreign')) return true;
      return false;
    });
  }, [currentCategorySlug, categoryCards]);

  // Synchronize route param with active category state
  useEffect(() => {
    if (matchedCategory) {
      setActiveCategoryView(matchedCategory.id);
      setSelectedCategoryId(matchedCategory.filterId);
      setCurrentPage(1);
    } else if (!currentCategorySlug && !searchQuery.trim()) {
      setActiveCategoryView(null);
      setSelectedCategoryId('ALL');
      setCurrentPage(1);
    }
  }, [matchedCategory, currentCategorySlug, searchQuery]);

  // Handle clicking a category card to go inside
  const handleSelectCategoryCard = (cat: CategoryCardItem) => {
    const slugToUse = cat.slug || cat.id;
    navigate(`/careers/category/${slugToUse}`);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleBackToCategories = () => {
    setSearchQuery('');
    setActiveCategoryView(null);
    setSelectedCategoryId('ALL');
    navigate('/careers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch jobs or workers based on category
  useEffect(() => {
    if (selectedCategoryId === 'DAILY_WAGE' || activeCategoryView === 'DAILY_WAGE') {
      fetchDailyWorkers(debouncedSearch);
    } else {
      fetchJobs(currentPage, debouncedSearch, selectedCategoryId);
    }
  }, [currentPage, debouncedSearch, selectedCategoryId, activeCategoryView]);

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

      if (categoryId && categoryId !== 'ALL' && categoryId !== 'DAILY_WAGE') {
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
      console.error('Failed to fetch jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyWorkers = async (search = '') => {
    setIsLoadingWorkers(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        isActive: 'true',
        status: 'APPROVED'
      });
      if (search.trim()) {
        params.append('search', search.trim());
      }
      const res = await fetch(`${API_BASE_URL}/careers/daily-wage-workers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDailyWorkers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch daily workers', err);
    } finally {
      setIsLoadingWorkers(false);
    }
  };

  const handleOpenRegistration = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setSubmitSuccess(false);
    if (user && !dailyWorkerForm.fullName) {
      setDailyWorkerForm(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: prev.phone || (user as any).phone || ''
      }));
    }
    setIsModalOpen(true);
  };

  const availableDistricts = useMemo(() => {
    if (!dailyWorkerForm.province) return [];
    return getDistrictsForProvince(dailyWorkerForm.province);
  }, [dailyWorkerForm.province]);

  const availableDSDs = useMemo(() => {
    if (!dailyWorkerForm.district) return [];
    const list = getDSDsForDistrict(dailyWorkerForm.district);
    return list.slice().sort((a, b) => {
      const nameA = isSi ? (a.nameSi || a.nameEn) : a.nameEn;
      const nameB = isSi ? (b.nameSi || b.nameEn) : b.nameEn;
      return nameA.localeCompare(nameB, isSi ? 'si' : 'en');
    });
  }, [dailyWorkerForm.district, isSi]);

  const availableGNDs = useMemo(() => {
    if (!dailyWorkerForm.dsDivision) return [];
    const list = getGNDsForDSD(dailyWorkerForm.dsDivision, dailyWorkerForm.district);
    return list.slice().sort((a, b) => {
      if (a.gnCode && b.gnCode) {
        const numA = parseInt(a.gnCode, 10);
        const numB = parseInt(b.gnCode, 10);
        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
          return numA - numB;
        }
        return a.gnCode.localeCompare(b.gnCode);
      }
      const nameA = isSi ? (a.nameSi || a.nameEn) : a.nameEn;
      const nameB = isSi ? (b.nameSi || b.nameEn) : b.nameEn;
      return nameA.localeCompare(nameB, isSi ? 'si' : 'en');
    });
  }, [dailyWorkerForm.dsDivision, dailyWorkerForm.district, isSi]);

  // --- Location Search Filtering for Daily Wage Workers (sl-gnd-dsd-districts) ---
  const allDistrictsList = useMemo(() => {
    try {
      const dList = getDistricts();
      return dList.map(d => ({
        id: d.id,
        en: d.nameEn,
        si: d.nameSi,
        provinceEn: d.provinceEn
      })).sort((a, b) => {
        const nameA = isSi ? a.si : a.en;
        const nameB = isSi ? b.si : b.en;
        return nameA.localeCompare(nameB, isSi ? 'si' : 'en');
      });
    } catch {
      return [];
    }
  }, [isSi]);

  const availableFilterDistricts = useMemo(() => {
    if (!filterProvince) return allDistrictsList;
    const list = getDistrictsForProvince(filterProvince);
    return list.slice().sort((a, b) => {
      const nameA = isSi ? a.si : a.en;
      const nameB = isSi ? b.si : b.en;
      return nameA.localeCompare(nameB, isSi ? 'si' : 'en');
    });
  }, [filterProvince, allDistrictsList, isSi]);

  const availableFilterDSDs = useMemo(() => {
    if (!filterDistrict) return [];
    const list = getDSDsForDistrict(filterDistrict);
    return list.slice().sort((a, b) => {
      const nameA = isSi ? (a.nameSi || a.nameEn) : a.nameEn;
      const nameB = isSi ? (b.nameSi || b.nameEn) : b.nameEn;
      return nameA.localeCompare(nameB, isSi ? 'si' : 'en');
    });
  }, [filterDistrict, isSi]);

  const availableFilterGNDs = useMemo(() => {
    if (!filterDSD) return [];
    const list = getGNDsForDSD(filterDSD, filterDistrict);
    return list.slice().sort((a, b) => {
      if (a.gnCode && b.gnCode) {
        const numA = parseInt(a.gnCode, 10);
        const numB = parseInt(b.gnCode, 10);
        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
          return numA - numB;
        }
        return a.gnCode.localeCompare(b.gnCode);
      }
      const nameA = isSi ? (a.nameSi || a.nameEn) : a.nameEn;
      const nameB = isSi ? (b.nameSi || b.nameEn) : b.nameEn;
      return nameA.localeCompare(nameB, isSi ? 'si' : 'en');
    });
  }, [filterDSD, filterDistrict, isSi]);

  const handleProvinceChange = (selectedProv: string) => {
    setFilterProvince(selectedProv);
    if (selectedProv && filterDistrict) {
      const districtsForNewProv = getDistrictsForProvince(selectedProv);
      const stillValid = districtsForNewProv.some(d => d.en === filterDistrict || d.si === filterDistrict);
      if (!stillValid) {
        setFilterDistrict('');
        setFilterDSD('');
        setFilterGND('');
      }
    }
  };

  const handleDistrictChange = (selectedDist: string) => {
    setFilterDistrict(selectedDist);
    setFilterDSD('');
    setFilterGND('');
    if (!filterProvince && selectedDist) {
      const found = allDistrictsList.find(d => d.en === selectedDist || d.si === selectedDist);
      if (found && found.provinceEn) {
        const provObj = SRI_LANKA_PROVINCES.find(p => p.en.toLowerCase().includes(found.provinceEn.toLowerCase()));
        if (provObj) {
          setFilterProvince(isSi ? provObj.si : provObj.en);
        }
      }
    }
  };

  const handleDSDChange = (selectedDSD: string) => {
    setFilterDSD(selectedDSD);
    setFilterGND('');
  };

  const handleClearLocationFilters = () => {
    setFilterProvince('');
    setFilterDistrict('');
    setFilterDSD('');
    setFilterGND('');
  };

  const hasActiveLocationFilter = Boolean(filterProvince || filterDistrict || filterDSD || filterGND);
  const activeLocationFilterCount = [filterProvince, filterDistrict, filterDSD, filterGND].filter(Boolean).length;

  const filteredDailyWorkers = useMemo(() => {
    return dailyWorkers.filter((worker) => {
      // 1. Province filter (optional)
      if (filterProvince) {
        const targetClean = filterProvince.toLowerCase().replace(/ province| පළාත|-/g, '').trim();
        const workerProv = (worker.province || '').toLowerCase().replace(/ province| පළාත|-/g, '').trim();

        const pObj = SRI_LANKA_PROVINCES.find(p =>
          p.en.toLowerCase().includes(targetClean) ||
          p.si.includes(filterProvince) ||
          targetClean.includes(p.en.toLowerCase().replace(/ province|-/g, '').trim())
        );

        let match = workerProv.includes(targetClean) || targetClean.includes(workerProv);
        if (!match && pObj) {
          const pEn = pObj.en.toLowerCase().replace(/ province|-/g, '').trim();
          const pSi = pObj.si.replace(/ පළාත/g, '').trim();
          if (
            workerProv.includes(pEn) ||
            (worker.province || '').includes(pSi) ||
            pEn.includes(workerProv)
          ) {
            match = true;
          }
        }
        if (!match) return false;
      }

      // 2. District filter (optional)
      if (filterDistrict) {
        const cleanFilterDist = filterDistrict.toLowerCase().trim();
        const workerDist = (worker.district || '').toLowerCase().trim();

        let match = workerDist.includes(cleanFilterDist) || cleanFilterDist.includes(workerDist);
        if (!match) {
          const dObj = allDistrictsList.find(d =>
            d.en.toLowerCase() === cleanFilterDist ||
            d.si === filterDistrict ||
            cleanFilterDist.includes(d.en.toLowerCase()) ||
            filterDistrict.includes(d.si)
          );
          if (dObj) {
            if (
              workerDist.includes(dObj.en.toLowerCase()) ||
              (worker.district || '').includes(dObj.si)
            ) {
              match = true;
            }
          }
        }
        if (!match) return false;
      }

      // 3. DS Division filter (optional)
      if (filterDSD) {
        const cleanFilterDSD = filterDSD.toLowerCase().trim();
        const workerDSD = (worker.dsDivision || '').toLowerCase().trim();
        let match = workerDSD.includes(cleanFilterDSD) || cleanFilterDSD.includes(workerDSD);
        if (!match) {
          const dsdObj = availableFilterDSDs.find(d =>
            (d.nameEn && d.nameEn.toLowerCase() === cleanFilterDSD) ||
            (d.nameSi && d.nameSi === filterDSD)
          );
          if (dsdObj) {
            if (
              (dsdObj.nameEn && workerDSD.includes(dsdObj.nameEn.toLowerCase())) ||
              (dsdObj.nameSi && workerDSD.includes(dsdObj.nameSi.toLowerCase()))
            ) {
              match = true;
            }
          }
        }
        if (!match) return false;
      }

      // 4. GN Division filter (optional)
      if (filterGND) {
        const cleanFilterGND = filterGND.toLowerCase().trim();
        const workerGND = (worker.gnDivision || '').toLowerCase().trim();
        const codeMatch = filterGND.match(/^([0-9A-Za-z/]+)/);
        const code = codeMatch ? codeMatch[1].toLowerCase() : null;

        let match = workerGND.includes(cleanFilterGND) || cleanFilterGND.includes(workerGND);
        if (!match && code && workerGND.includes(code)) {
          match = true;
        }
        if (!match) return false;
      }

      return true;
    });
  }, [dailyWorkers, filterProvince, filterDistrict, filterDSD, filterGND, allDistrictsList, availableFilterDSDs]);

  const handleRegisterWorker = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      openLoginModal();
      return;
    }

    if (!dailyWorkerForm.fullName || !dailyWorkerForm.phone || !dailyWorkerForm.province || !dailyWorkerForm.district || !dailyWorkerForm.dsDivision || !dailyWorkerForm.gnDivision) {
      alert('කරුණාකර සියලු අනිවාර්ය තොරතුරු පුරවන්න.');
      return;
    }
    if (dailyWorkerForm.skills.length === 0) {
      alert('කරුණාකර ඔබට කළ හැකි රැකියාවේ ස්වභාවය/කාර්යයන් අවම වශයෙන් එකක් හෝ තෝරන්න.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/careers/daily-wage-workers/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dailyWorkerForm)
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setDailyWorkerForm({
          fullName: '',
          phone: '',
          province: '',
          district: '',
          dsDivision: '',
          gnDivision: '',
          expectedWage: '',
          experience: '',
          skills: []
        });
        if (selectedCategoryId === 'DAILY_WAGE') {
          fetchDailyWorkers(debouncedSearch);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to register worker');
      }
    } catch (err) {
      console.error('Error registering worker:', err);
      alert('ලියාපදිංචි වීමේදී දෝෂයක් සිදු විය.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getJobCardImage = (job: Job) => {
    const rawImage = job.bannerImage || (job as any).bannerImageUrl || (job as any).imageUrl || (job as any).image;
    const formatted = formatImageUrl(rawImage);
    if (formatted) {
      return formatted;
    }
    if (job.country || job.agency) {
      return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80';
    }
    if (job.companyName || job.companyNameSi) {
      return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80';
    }
    if (job.institution || job.governingMinistry) {
      return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80';
  };

  const getJobCategoryIcon = (job: Job) => {
    if (job.country || job.agency) return <Plane className="w-4 h-4 sm:w-5 sm:h-5" />;
    if (job.companyName || job.companyNameSi) return <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />;
    return <Landmark className="w-4 h-4 sm:w-5 sm:h-5" />;
  };

  const getJobDetailUrl = (job: Job) => {
    const catSlug = job.jobCategory?.slug || currentCategorySlug || 'all';
    const jobSlug = job.slug || job.id;
    return `/careers/jobs/${catSlug}/${jobSlug}`;
  };

  const renderJobCard = (job: Job, idx: number) => {
    const displayTitle = isSi && job.designationSi ? job.designationSi : (job.designation || job.title);
    const companyOrInstitution = job.companyNameSi || job.companyName
      ? (isSi && job.companyNameSi ? job.companyNameSi : (job.companyName || job.companyNameSi))
      : (job.countrySi || job.country)
      ? `${isSi && job.countrySi ? job.countrySi : job.country} ${job.agency ? `• ${job.agency}` : ''}`
      : (isSi && job.institution?.nameSi ? job.institution.nameSi : (job.institution?.name || job.location || 'Sri Lanka'));
    const cardImage = getJobCardImage(job);
    const jobUrl = getJobDetailUrl(job);

    return (
      <div
        key={job.id}
        onClick={() => navigate(jobUrl)}
        style={{ animationDelay: `${idx * 60}ms` }}
        className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.05)] sm:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 cursor-pointer"
      >
        {/* Top Media Wrapper */}
        <div className="relative">
          <div className="h-32 sm:h-44 lg:h-48 w-full relative overflow-hidden bg-white">
            <img
              src={cardImage}
              alt={displayTitle}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Wavy Divider */}
          <CardWaveDivider />

          {/* Round Icon Badge */}
          <div className="absolute -bottom-4 sm:-bottom-5 left-3 sm:left-6 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#006837] text-white flex items-center justify-center border-[2.5px] sm:border-[3.5px] border-white shadow-md sm:shadow-lg group-hover:scale-110 transition-transform">
            {getJobCategoryIcon(job)}
          </div>
        </div>

        {/* Card Content Area: Job Title and Institution */}
        <div className="pt-6 sm:pt-8 px-3 sm:px-6 pb-3.5 sm:pb-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
              {(job.recruitmentType || job.recruitmentTypeSi) && (
                <span className="text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {isSi && job.recruitmentTypeSi ? job.recruitmentTypeSi : (job.recruitmentType || job.recruitmentTypeSi)}
                </span>
              )}
              {job.jobNature && (
                <span className="text-[10px] sm:text-[11px] font-medium text-gray-600 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {isSi && job.jobNatureSi ? job.jobNatureSi : job.jobNature}
                </span>
              )}
            </div>
            <h3 className="text-xs sm:text-xl font-bold text-[#143d4d] leading-snug group-hover:text-[#006837] transition-colors mb-1 min-h-[2rem] sm:min-h-[3rem] line-clamp-2">
              {displayTitle}
            </h3>
            <p className="text-[10px] sm:text-sm text-gray-500 font-medium line-clamp-1 mb-2.5 sm:mb-4">
              {companyOrInstitution}
            </p>
          </div>

          {/* Card Footer: Button & Leaf Watermark */}
          <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-50 mt-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(jobUrl);
              }}
              className="bg-[#006837] hover:bg-[#00532c] text-white text-[10px] sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1 transition-all shadow-xs group-hover:shadow cursor-pointer"
            >
              <span>{isSi ? 'විස්තර බලන්න' : 'View Details'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <div className="hidden xs:block sm:block">
              <AswannaLeafBadge />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const activeCategoryTitle = useMemo(() => {
    if ((!activeCategoryView && !currentCategorySlug) || activeCategoryView === 'ALL') {
      return isSi ? 'සියලුම රැකියා අවස්ථා' : 'All Job Openings';
    }
    const found = matchedCategory || categoryCards.find(c => c.id === activeCategoryView || c.slug === activeCategoryView);
    return found ? found.title : (isSi ? 'රැකියා අවස්ථා' : 'Careers');
  }, [activeCategoryView, currentCategorySlug, matchedCategory, categoryCards, isSi]);

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] font-roboto">
      <SEO 
        title="රැකියා අවස්ථා | Careers at Aswanna"
        description="කෘෂිකාර්මික ක්ෂේත්‍රයේ නවීන රැකියා අවස්ථා. Explore agricultural opportunities across Sri Lanka."
        canonical="/careers"
      />

      {/* Hero Section */}
      <PageHero 
        title={t('careers.title', 'CAREERS')} 
        description=""
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#006837"
        icon={Briefcase}
        badgeBg="bg-[#006837]"
        waveColor="text-[#fafbfc]"
      />

      {/* Main Container */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-12 py-8 sm:py-14">

        {/* Top Back Button & Breadcrumbs Navigation */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-gray-100">
          {activeCategoryView !== null || currentCategorySlug || searchQuery ? (
            <button
              onClick={handleBackToCategories}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isSi ? 'ආපසු සියලු කාණ්ඩ වෙත' : 'Back to Categories'}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-900 bg-white hover:bg-emerald-50/60 border border-gray-200 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
              <span>{isSi ? 'ප්‍රධාන පිටුවට (Home)' : 'Back to Home'}</span>
            </button>
          )}

          <div className="text-xs text-gray-400 font-medium">
            <span
              className="cursor-pointer hover:underline"
              onClick={handleBackToCategories}
            >
              {isSi ? 'රැකියා අවස්ථා' : 'Careers'}
            </span>
            {(activeCategoryView || currentCategorySlug) && (
              <>
                <span className="mx-1.5">/</span>
                <span className="text-emerald-800 font-bold">{activeCategoryTitle}</span>
              </>
            )}
          </div>
        </div>

        {/* Top Controls: Search Bar & Daily Worker Button */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="w-full md:w-96 relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-full border border-gray-200 bg-white hover:border-emerald-500/60 focus:border-[#006837] focus:ring-3 focus:ring-[#006837]/15 outline-none transition-all text-xs sm:text-sm text-gray-800 shadow-xs"
              placeholder={isSi ? 'රැකියා සොයන්න...' : 'Search jobs...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeCategoryView === null && e.target.value.trim().length > 0) {
                  setActiveCategoryView('ALL');
                  setSelectedCategoryId('ALL');
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleOpenRegistration}
            className="glass-btn-green px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs w-full sm:w-auto justify-center"
          >
            <span>🚜</span>
            <span>{isSi ? 'දෛනික ශ්‍රමිකයෙකු ලෙස ලියාපදිංචි වන්න' : 'Register as Daily Worker'}</span>
          </button>
        </div>

        {/* VIEW 1: Categories Overview (The 4 Category Cards - Exact Match to UI Image, NO Extra Text!) */}
        {activeCategoryView === null && !searchQuery.trim() ? (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
              {categoryCards.map((cat, idx) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategoryCard(cat)}
                    style={{ animationDelay: `${idx * 80}ms` }}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.05)] sm:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 cursor-pointer"
                  >
                    {/* Top Media Wrapper */}
                    <div className="relative">
                      {/* Image & Gradient (constrained to rounded top of card) */}
                      <div className="h-32 sm:h-48 lg:h-52 w-full relative overflow-hidden bg-white">
                        <img
                          src={cat.image}
                          alt={cat.title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      </div>

                      {/* Smooth Wave Divider */}
                      <CardWaveDivider />

                      {/* Floating Round Icon Badge - sits half on the wave and half on the white body, completely unclipped! */}
                      <div className="absolute -bottom-4 sm:-bottom-5 left-3 sm:left-6 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#006837] text-white flex items-center justify-center border-[2.5px] sm:border-[3.5px] border-white shadow-md sm:shadow-lg group-hover:scale-110 transition-transform">
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>

                    {/* Card Content Area: Job Category Title ONLY! */}
                    <div className="pt-6 sm:pt-8 px-3 sm:px-6 pb-3.5 sm:pb-6 flex-1 flex flex-col justify-between">
                      <h3 className="text-xs sm:text-xl font-bold text-[#143d4d] leading-snug group-hover:text-[#006837] transition-colors mb-2 sm:mb-6 min-h-[2rem] sm:min-h-[3.2rem] line-clamp-2">
                        {cat.title}
                      </h3>

                      {/* Card Footer: Button & Leaf Watermark */}
                      <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-50 mt-auto">
                        <button
                          type="button"
                          className="bg-[#006837] hover:bg-[#00532c] text-white text-[11px] sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1 transition-all shadow-xs group-hover:shadow cursor-pointer"
                        >
                          <span>{isSi ? 'පිවිසෙන්න' : 'Explore'}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        <div className="hidden xs:block sm:block">
                          <AswannaLeafBadge />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (

          /* VIEW 2: Inside Category View (Jobs / Daily Workers) */
          <div>
            {/* Category Title Header */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-[#143d4d]">
                {activeCategoryTitle}
              </h2>
            </div>

            {/* Content: Daily Wage Workers vs Regular Jobs */}
            {selectedCategoryId === 'DAILY_WAGE' || activeCategoryView === 'DAILY_WAGE' ? (
              <div>
                {/* Location Filter Card for Daily Wage Workers (sl-gnd-dsd-districts) */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs p-4 sm:p-6 mb-7">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-none">
                          {isSi ? 'ප්‍රදේශය අනුව පෙරහන් කරන්න' : 'Filter by Location'}
                        </h3>
                        {hasActiveLocationFilter && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            {activeLocationFilterCount} {isSi ? 'තෝරා ඇත' : 'selected'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 font-normal mt-1">
                        {isSi
                          ? 'පළාත, දිස්ත්‍රික්කය, ප්‍රාදේශීය ලේකම් හෝ ග්‍රාම නිලධාරී වසම තෝරන්න (අනිවාර්ය නැත).'
                          : 'Filter workers by province, district, DS division or GN division (optional).'}
                      </p>
                    </div>

                    {hasActiveLocationFilter && (
                      <button
                        type="button"
                        onClick={handleClearLocationFilters}
                        className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold bg-rose-50 hover:bg-rose-100/80 px-3.5 py-1.5 rounded-full border border-rose-200/60 transition-all cursor-pointer self-start sm:self-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isSi ? 'පෙරහන් ඉවත් කරන්න' : 'Clear Filters'}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {/* 1. පළාත (Province) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs sm:text-sm font-bold text-gray-700">
                        {isSi ? 'පළාත' : 'Province'}
                      </label>
                      <select
                        value={filterProvince}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white focus:bg-white focus:border-[#006837] focus:ring-2 focus:ring-[#006837]/15 outline-none text-xs sm:text-sm text-gray-800 transition-all cursor-pointer"
                      >
                        <option value="">{isSi ? 'පළාත තෝරන්න...' : 'Select Province...'}</option>
                        {SRI_LANKA_PROVINCES.map((p) => (
                          <option key={p.en} value={isSi ? p.si : p.en}>
                            {isSi ? p.si : p.en}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. දිස්ත්‍රික්කය (District) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs sm:text-sm font-bold text-gray-700">
                        {isSi ? 'දිස්ත්‍රික්කය' : 'District'}
                      </label>
                      <select
                        value={filterDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white focus:bg-white focus:border-[#006837] focus:ring-2 focus:ring-[#006837]/15 outline-none text-xs sm:text-sm text-gray-800 transition-all cursor-pointer"
                      >
                        <option value="">{isSi ? 'දිස්ත්‍රික්කය තෝරන්න...' : 'Select District...'}</option>
                        {availableFilterDistricts.map((d) => (
                          <option key={d.en} value={isSi ? d.si : d.en}>
                            {isSi ? d.si : d.en}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. ප්‍රාදේශීය ලේකම් කොට්ඨාසය (DS Division) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs sm:text-sm font-bold text-gray-700">
                        {isSi ? 'ප්‍රාදේශීය ලේකම් කොට්ඨාසය' : 'DS Division'}
                      </label>
                      <select
                        value={filterDSD}
                        onChange={(e) => handleDSDChange(e.target.value)}
                        disabled={!filterDistrict}
                        className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white focus:bg-white focus:border-[#006837] focus:ring-2 focus:ring-[#006837]/15 outline-none text-xs sm:text-sm text-gray-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!filterDistrict
                            ? (isSi ? 'ප්‍රථමයෙන් දිස්ත්‍රික්කය තෝරන්න...' : 'Select District first...')
                            : (isSi ? 'ප්‍රාදේශීය ලේකම් කොට්ඨාසය තෝරන්න...' : 'Select DS Division...')}
                        </option>
                        {availableFilterDSDs.map((dsd) => {
                          const val = isSi ? (dsd.nameSi || dsd.nameEn) : dsd.nameEn;
                          return (
                            <option key={dsd.id || dsd.nameEn} value={val}>
                              {val}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* 4. ග්‍රාම නිලධාරී වසම (GN Division) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs sm:text-sm font-bold text-gray-700">
                        {isSi ? 'ග්‍රාම නිලධාරී වසම' : 'GN Division'}
                      </label>
                      <select
                        value={filterGND}
                        onChange={(e) => setFilterGND(e.target.value)}
                        disabled={!filterDSD}
                        className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white focus:bg-white focus:border-[#006837] focus:ring-2 focus:ring-[#006837]/15 outline-none text-xs sm:text-sm text-gray-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!filterDSD
                            ? (isSi ? 'ප්‍රථමයෙන් ප්‍රා.ලේ. තෝරන්න...' : 'Select DSD first...')
                            : (isSi ? 'ග්‍රාම නිලධාරී වසම තෝරන්න...' : 'Select GN Division...')}
                        </option>
                        {availableFilterGNDs.map((gnd) => {
                          const name = isSi ? (gnd.nameSi || gnd.nameEn) : gnd.nameEn;
                          const label = gnd.gnCode ? `${gnd.gnCode} - ${name}` : name;
                          return (
                            <option key={gnd.id || gnd.lifeCode || label} value={label}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {isLoadingWorkers ? (
                  <div className="py-20 flex justify-center">
                    <AgroLoader message={isSi ? 'දෛනික ශ්‍රමිකයන් පූරණය වෙමින් පවතී...' : 'Loading daily workers...'} />
                  </div>
                ) : filteredDailyWorkers.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                    {filteredDailyWorkers.map((worker) => (
                      <div
                        key={worker.id}
                        className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.05)] sm:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5"
                      >
                        {/* Top Media Wrapper */}
                        <div className="relative">
                          <div className="h-32 sm:h-44 lg:h-48 w-full relative overflow-hidden bg-white">
                            <img
                              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80"
                              alt={worker.fullName}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          </div>

                          {/* Smooth Wave Divider */}
                          <CardWaveDivider />

                          <div className="absolute -bottom-4 sm:-bottom-5 left-3 sm:left-6 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#006837] text-white flex items-center justify-center border-[2.5px] sm:border-[3.5px] border-white shadow-md sm:shadow-lg">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        </div>

                        {/* Card Content Area */}
                        <div className="pt-6 sm:pt-8 px-3 sm:px-6 pb-3.5 sm:pb-6 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xs sm:text-xl font-bold text-[#143d4d] leading-snug group-hover:text-[#006837] transition-colors mb-0.5 sm:mb-1 line-clamp-1">
                              {worker.fullName}
                            </h3>
                            <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-2 sm:mb-3 line-clamp-1">
                              {worker.dsDivision}, {worker.district} ({worker.gnDivision || worker.province})
                            </p>

                            {/* Skills List with Dots - No green background, No checkmark */}
                            <ul className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4 pt-1">
                              {worker.skills?.map((item) => (
                                <li
                                  key={item.skill.id}
                                  className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-700 font-medium"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                                  <span className="line-clamp-1">
                                    {isSi && item.skill.nameSi ? item.skill.nameSi : item.skill.name}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Footer with Call Button & Leaf Watermark */}
                          <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-50 mt-auto">
                            <a
                              href={`tel:${worker.phone}`}
                              className="bg-[#006837] hover:bg-[#00532c] text-white text-[10px] sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1 sm:gap-1.5 transition-all shadow-xs group-hover:shadow"
                            >
                              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="truncate max-w-[80px] sm:max-w-none">{worker.phone}</span>
                            </a>
                            <div className="hidden xs:block sm:block">
                              <AswannaLeafBadge />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full py-16 bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center p-6 shadow-xs">
                    <Search className="w-12 h-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-bold text-[#143d4d] mb-1">
                      {isSi ? 'දෛනික ශ්‍රමිකයන් කිසිවෙකු හමු නොවීය' : 'No workers found'}
                    </h3>
                    {hasActiveLocationFilter ? (
                      <div className="mt-2 text-center">
                        <p className="text-xs sm:text-sm text-gray-500 mb-4">
                          {isSi
                            ? 'තෝරාගත් ප්‍රදේශය සඳහා ශ්‍රමිකයන් හමු නොවීය. කරුණාකර පෙරහන් වෙනස් කරන්න.'
                            : 'No workers match the selected location filters. Please try adjusting your filters.'}
                        </p>
                        <button
                          type="button"
                          onClick={handleClearLocationFilters}
                          className="px-4 py-2 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isSi ? 'සියලු පෙරහන් ඉවත් කරන්න' : 'Clear All Filters'}</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : (

              /* Regular Job Vacancies Cards Grid */
              <div>
                {isLoading ? (
                  <div className="py-20 flex justify-center">
                    <AgroLoader message={t('careers.loading', 'රැකියා තොරතුරු පූරණය වෙමින් පවතී...')} />
                  </div>
                ) : jobsData.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                      {jobsData.map(renderJobCard)}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-12">
                        <Pagination 
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalItems={totalItems}
                          pageSize={pageSize}
                          onPageChange={(page) => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full py-16 bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center p-6 shadow-xs">
                    <Search className="w-12 h-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-bold text-[#143d4d] mb-1">{t('careers.noResults', 'No jobs found')}</h3>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>



      {/* DAILY WAGE WORKER REGISTRATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-card-pop">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full glass-btn-light !p-0 cursor-pointer text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🚜</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#143d4d]">
                {isSi ? 'දෛනික කෘෂි ශ්‍රමිකයෙකු ලෙස ලියාපදිංචි වීම' : 'Daily Wage Worker Registration'}
              </h3>
            </div>
            <p className="text-gray-500 mb-6 font-medium text-sm">
              {isSi
                ? 'ඔබේ තොරතුරු ඇතුළත් කර අස්වැන්න ජාලය හරහා ගොවිපල හා වගාබිම් හිමියන් වෙත සෘජුවම සම්බන්ධ වන්න.'
                : 'Enter your details to get connected directly with farm owners across Sri Lanka.'}
            </p>

            {!isAuthenticated ? (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700 shadow-sm">
                  <LogIn className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-amber-950">
                  {isSi ? 'ලියාපදිංචි වීමට කරුණාකර ප්‍රථමයෙන් පද්ධතියට ලොග් වන්න' : 'Please Log In to Register'}
                </h4>
                <p className="text-sm text-amber-800 max-w-md mx-auto leading-relaxed">
                  {isSi
                    ? 'දෛනික කෘෂි ශ්‍රමිකයෙකු ලෙස ලියාපදිංචි වීම සඳහා ඔබගේ Aswanna ගිණුමෙන් ලොග් විය යුතුය.'
                    : 'To register as a daily wage worker, please log into your Aswanna account.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => { setIsModalOpen(false); openLoginModal(); }}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 mx-auto shadow-md transition-all cursor-pointer"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>{isSi ? 'දැන් ලොග් වන්න' : 'Log In Now'}</span>
                  </button>
                </div>
              </div>
            ) : submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-emerald-900">
                  {isSi ? 'ලියාපදිංචිය සාර්ථකව යොමු විය!' : 'Registration Submitted Successfully!'}
                </h4>
                <p className="text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
                  {isSi
                    ? 'ඔබගේ තොරතුරු සාර්ථකව පද්ධතියට ලැබුණි. පරිපාලක (Admin) අනුමැතියෙන් පසු එය වෙබ් අඩවියේ ප්‍රසිද්ධ කරනු ඇත.'
                    : 'Your information has been successfully received. It will be published on the website after administrator approval.'}
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => { setSubmitSuccess(false); }}
                    className="px-5 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-semibold text-sm hover:bg-emerald-50 cursor-pointer"
                  >
                    {isSi ? 'තවත් අයදුම්පතක්' : 'Register Another'}
                  </button>
                  <button
                    onClick={() => { setIsModalOpen(false); setSubmitSuccess(false); }}
                    className="px-5 py-2.5 rounded-xl bg-[#006837] text-white font-semibold text-sm hover:bg-[#00532c] cursor-pointer"
                  >
                    {isSi ? 'වසන්න' : 'Close'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterWorker} className="flex flex-col gap-4">
                {/* 1. Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-bold text-gray-700">
                    {isSi ? 'සම්පූර්ණ නම' : 'Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={dailyWorkerForm.fullName}
                    onChange={e => setDailyWorkerForm({ ...dailyWorkerForm, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#006837] outline-none text-sm"
                    placeholder={isSi ? 'උදා: කේ. ඒ. සුනිල් පෙරේරා' : 'e.g. K. A. Sunil Perera'}
                  />
                </div>

                {/* 2. Direct Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-bold text-gray-700">
                    {isSi ? 'සෘජු දුරකථන අංකය' : 'Direct Phone Number'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{9,12}"
                    value={dailyWorkerForm.phone}
                    onChange={e => setDailyWorkerForm({ ...dailyWorkerForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#006837] outline-none text-sm"
                    placeholder="0771234567"
                  />
                </div>

                {/* 3. Province & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-bold text-gray-700">
                      {isSi ? 'පළාත' : 'Province'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={dailyWorkerForm.province}
                      onChange={e => setDailyWorkerForm({ ...dailyWorkerForm, province: e.target.value, district: '', dsDivision: '', gnDivision: '' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#006837] outline-none text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <option value="">{isSi ? 'පළාත තෝරන්න...' : 'Select Province...'}</option>
                      {SRI_LANKA_PROVINCES.map(p => (
                        <option key={p.en} value={isSi ? p.si : p.en}>
                          {isSi ? p.si : p.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-bold text-gray-700">
                      {isSi ? 'දිස්ත්‍රික්කය' : 'District'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      disabled={!dailyWorkerForm.province}
                      value={dailyWorkerForm.district}
                      onChange={e => setDailyWorkerForm({ ...dailyWorkerForm, district: e.target.value, dsDivision: '', gnDivision: '' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#006837] outline-none text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <option value="">{isSi ? 'දිස්ත්‍රික්කය තෝරන්න...' : 'Select District...'}</option>
                      {availableDistricts.map(d => (
                        <option key={d.en} value={isSi ? d.si : d.en}>
                          {isSi ? d.si : d.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. DS Division & GN Division */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-bold text-gray-700">
                      {isSi ? 'ප්‍රාදේශීය ලේකම් කොට්ඨාසය' : 'DS Division'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      disabled={!dailyWorkerForm.district}
                      value={dailyWorkerForm.dsDivision}
                      onChange={e => setDailyWorkerForm({ ...dailyWorkerForm, dsDivision: e.target.value, gnDivision: '' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#006837] outline-none text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <option value="">{isSi ? 'ප්‍රාදේශීය ලේකම් කොට්ඨාසය තෝරන්න...' : 'Select DS Division...'}</option>
                      {availableDSDs.map(dsd => {
                        const val = isSi ? (dsd.nameSi || dsd.nameEn) : dsd.nameEn;
                        return (
                          <option key={dsd.id || dsd.nameEn} value={val}>
                            {val}
                          </option>
                        );
                      })}
                      {dailyWorkerForm.dsDivision && !availableDSDs.some(d => (isSi ? (d.nameSi || d.nameEn) : d.nameEn) === dailyWorkerForm.dsDivision) && (
                        <option value={dailyWorkerForm.dsDivision}>{dailyWorkerForm.dsDivision}</option>
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-bold text-gray-700">
                      {isSi ? 'ග්‍රාම නිලධාරී වසම' : 'GN Division'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      disabled={!dailyWorkerForm.dsDivision}
                      value={dailyWorkerForm.gnDivision}
                      onChange={e => setDailyWorkerForm({ ...dailyWorkerForm, gnDivision: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#006837] outline-none text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <option value="">{isSi ? 'ග්‍රාම නිලධාරී වසම තෝරන්න...' : 'Select GN Division...'}</option>
                      {availableGNDs.map(gnd => {
                        const name = isSi ? (gnd.nameSi || gnd.nameEn) : gnd.nameEn;
                        const label = gnd.gnCode ? `${gnd.gnCode} - ${name}` : name;
                        return (
                          <option key={gnd.id || gnd.lifeCode || label} value={label}>
                            {label}
                          </option>
                        );
                      })}
                      {dailyWorkerForm.gnDivision && !availableGNDs.some(g => {
                        const name = isSi ? (g.nameSi || g.nameEn) : g.nameEn;
                        const label = g.gnCode ? `${g.gnCode} - ${name}` : name;
                        return label === dailyWorkerForm.gnDivision;
                      }) && (
                        <option value={dailyWorkerForm.gnDivision}>{dailyWorkerForm.gnDivision}</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* 5. Skills Checkboxes */}
                <div className="flex flex-col gap-2 pt-2">
                  <label className="text-xs sm:text-sm font-bold text-gray-700">
                    {isSi ? 'ඔබට කළ හැකි කාර්යයන් / කුසලතා' : 'Skills & Work Categories'} <span className="text-red-500">*</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                    {availableSkills.map((sk) => {
                      const isChecked = dailyWorkerForm.skills.includes(sk.id);
                      return (
                        <label
                          key={sk.id}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-xs'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const next = isChecked
                                ? dailyWorkerForm.skills.filter(id => id !== sk.id)
                                : [...dailyWorkerForm.skills, sk.id];
                              setDailyWorkerForm({ ...dailyWorkerForm, skills: next });
                            }}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                          />
                          <span>{isSi && sk.nameSi ? sk.nameSi : sk.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Expected Wage & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-bold text-gray-700">
                      {isSi ? 'අපේක්ෂිත දෛනික වැටුප (රු.)' : 'Expected Daily Wage (LKR)'}
                    </label>
                    <input
                      type="number"
                      value={dailyWorkerForm.expectedWage}
                      onChange={e => setDailyWorkerForm({ ...dailyWorkerForm, expectedWage: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#006837] outline-none text-sm"
                      placeholder="e.g. 2500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-bold text-gray-700">
                      {isSi ? 'සේවා පළපුරුද්ද (වසර)' : 'Experience (Years)'}
                    </label>
                    <input
                      type="number"
                      value={dailyWorkerForm.experience}
                      onChange={e => setDailyWorkerForm({ ...dailyWorkerForm, experience: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#006837] outline-none text-sm"
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 w-full py-4 glass-btn-green text-sm sm:text-base tracking-wider uppercase font-bold disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <span>{isSi ? 'ලියාපදිංචි වෙමින් පවතී...' : 'Registering...'}</span>
                  ) : (
                    <span>{isSi ? 'ලියාපදිංචි වන්න' : 'Register Now'}</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
