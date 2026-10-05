import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Edit, Trash2, X, Search, Briefcase, ToggleLeft, ToggleRight,
  CheckCircle2, XCircle, Clock, Building2, Layers, DollarSign,
  GraduationCap, FileText, Download, ExternalLink,
  Landmark, Filter, Check, Eye, Phone, UserCheck, Wrench
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';
import RichTextEditor from '../components/RichTextEditor';
import { SRI_LANKA_PROVINCES, getDistrictsForProvince, getDSDsForDistrict, getGNDsForDSD } from '../../data/sriLankaLocations';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Interfaces ---
interface DailyWageSkill {
  id: string;
  name: string;
  nameSi: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  _count?: { workers: number };
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isActive: boolean;
  createdAt: string;
  skills: { skill: DailyWageSkill }[];
}

interface Ministry {
  id: string;
  name: string;
  nameSi?: string | null;
  institutions?: Institution[];
  _count?: { institutions: number };
}

interface Institution {
  id: string;
  name: string;
  nameSi?: string | null;
  ministryId?: string | null;
  ministry?: Ministry;
  _count?: { jobs: number };
}

interface JobCategory {
  id: string;
  slug?: string;
  name: string;
  nameSi?: string | null;
  image?: string | null;
  _count?: { jobs: number };
}

interface SalaryDetail {
  id?: string;
  jobPostId?: string;
  salaryCode?: string | null;
  basicSalary?: string | null;
  basicSalarySi?: string | null;
  salaryScale?: string | null;
  salaryScaleSi?: string | null;
  allowances?: string | null;
  allowancesSi?: string | null;
  salaryDisplay?: string | null;
  salaryDisplaySi?: string | null;
}

interface EligibilityCriteria {
  id?: string;
  jobPostId?: string;
  ageLimit?: string | null;
  ageLimitSi?: string | null;
  ageRelaxation?: string | null;
  ageRelaxationSi?: string | null;
  qualifications?: string | null;
  qualificationsSi?: string | null;
  basicExperience?: string | null;
  basicExperienceSi?: string | null;
}

interface SelectionProcedure {
  id?: string;
  jobPostId?: string;
  method?: string | null;
  methodSi?: string | null;
  examDetails?: string | null;
  examDetailsSi?: string | null;
}

interface ApplicationDetail {
  id?: string;
  jobPostId?: string;
  gazetteNo?: string | null;
  gazetteDate?: string | null;
  examFee?: string | null;
  examFeeSi?: string | null;
  gazetteUrl?: string | null;
  gazetteUrlSi?: string | null;
  specimenAppUrl?: string | null;
  specimenAppUrlSi?: string | null;
  postalAddress?: string | null;
  postalAddressSi?: string | null;
  envelopeMarking?: string | null;
  envelopeMarkingSi?: string | null;
  submissionDetails?: string | null;
  submissionDetailsSi?: string | null;
  applyLink?: string | null;
}

interface JobPost {
  id: string;
  slug: string;
  designation: string;
  designationSi?: string | null;
  userId?: string | null;
  user?: { id: string; name: string; email: string; role: string } | null;
  jobCategoryId: string;
  jobCategory?: JobCategory;
  institutionId?: string | null;
  institution?: Institution | null;
  serviceCategory?: string | null;
  serviceCategorySi?: string | null;
  jobNature?: string | null;
  jobNatureSi?: string | null;
  serviceConditions?: string | null;
  serviceConditionsSi?: string | null;
  recruitmentType?: string | null;
  recruitmentTypeSi?: string | null;
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
  expiryDate: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  salaryDetails?: SalaryDetail | null;
  eligibility?: EligibilityCriteria | null;
  selectionProcedure?: SelectionProcedure | null;
  applicationInfo?: ApplicationDetail | null;
}

const JOB_NATURE_OPTIONS = [
  { label: 'ස්ථිර (Permanent)', en: 'Permanent', si: 'ස්ථිර' },
  { label: 'කොන්ත්‍රාත් පදනම මත (Contract Basis)', en: 'Contract Basis', si: 'කොන්ත්‍රාත් පදනම මත' },
  { label: 'තාවකාලික (Temporary)', en: 'Temporary', si: 'තාවකාලික' },
  { label: 'අනුයුක්ත (On Assignment / Secondment)', en: 'On Assignment / Secondment', si: 'අනුයුක්ත' },
];

const SERVICE_CONDITIONS_OPTIONS = [
  { label: 'ස්ථිර හා විශ්‍රාම වැටුප් සහිතයි (Pensionable)', en: 'Pensionable', si: 'ස්ථිර හා විශ්‍රාම වැටුප් සහිතයි' },
  { label: 'විශ්‍රාම වැටුප් රහිත (EPF/ETF දායකත්ව)', en: 'Non-pensionable (EPF/ETF)', si: 'විශ්‍රාම වැටුප් රහිත (EPF/ETF දායකත්ව)' },
  { label: 'ගිවිසුම්ගත / ව්‍යාපෘති පදනම', en: 'Contract / Project Basis', si: 'ගිවිසුම්ගත / ව්‍යාපෘති පදනම' },
];

export const RECRUITMENT_TYPE_OPTIONS = [
  { label: 'විවෘත (Open)', en: 'Open', si: 'විවෘත' },
  { label: 'සීමිත (Limited)', en: 'Limited', si: 'සීමිත' },
  { label: 'විවෘත හා සීමිත (Open & Limited)', en: 'Open & Limited', si: 'විවෘත හා සීමිත' },
  { label: 'දෙපාර්තමේන්තු / අභ්‍යන්තර (Internal)', en: 'Internal', si: 'දෙපාර්තමේන්තු / අභ්‍යන්තර' },
];

const defaultJobForm = {
  slug: '',
  designation: '',
  designationSi: '',
  jobCategoryId: '',
  selectedMinistryId: '',
  institutionId: '',
  serviceCategory: '',
  serviceCategorySi: '',
  jobNature: 'Permanent',
  jobNatureSi: 'ස්ථිර',
  serviceConditions: 'Pensionable',
  serviceConditionsSi: 'ස්ථිර හා විශ්‍රාම වැටුප් සහිතයි',
  recruitmentType: 'Open',
  recruitmentTypeSi: 'විවෘත',
  companyName: '',
  companyNameSi: '',
  governingMinistry: '',
  governingMinistrySi: '',
  agency: '',
  agencySi: '',
  country: '',
  countrySi: '',
  applyLink: '',
  expiryDate: '',
  isActive: true,
  approvalStatus: 'APPROVED' as 'PENDING' | 'APPROVED' | 'REJECTED',

  // Salary
  salaryCode: '',
  basicSalary: '',
  basicSalarySi: '',
  salaryScale: '',
  salaryScaleSi: '',
  allowances: '',
  allowancesSi: '',
  salaryDisplay: '',
  salaryDisplaySi: '',

  // Eligibility
  ageLimit: '',
  ageLimitSi: '',
  ageRelaxation: '',
  ageRelaxationSi: '',
  qualifications: '',
  qualificationsSi: '',
  basicExperience: '',
  basicExperienceSi: '',

  // Selection
  selectionMethod: '',
  selectionMethodSi: '',
  examDetails: '',
  examDetailsSi: '',

  // Application Info
  gazetteNo: '',
  gazetteDate: '',
  examFee: '',
  examFeeSi: '',
  postalAddress: '',
  postalAddressSi: '',
  envelopeMarking: '',
  envelopeMarkingSi: '',
  submissionDetails: '',
  submissionDetailsSi: '',
  existingGazetteUrl: '',
  existingGazetteUrlSi: '',
  existingSpecimenAppUrl: '',
  existingSpecimenAppUrlSi: '',
  existingBannerImage: ''
};

export default function CareerManagement() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'jobs' | 'dailyWage' | 'skills' | 'categories' | 'ministries' | 'institutions'>('jobs');

  // Job Posts State
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterApproval, setFilterApproval] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [totalJobs, setTotalJobs] = useState(0);

  // Job Banner Image Upload State
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);

  // Daily Wage Workers State
  const [workers, setWorkers] = useState<DailyWageWorker[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  const [workersPage, setWorkersPage] = useState(1);
  const [workersTotalPages, setWorkersTotalPages] = useState(1);
  const [workersTotalItems, setWorkersTotalItems] = useState(0);
  const [workersSearch, setWorkersSearch] = useState('');
  const [workersStatusFilter, setWorkersStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Categories Pagination & Search
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoriesSearch, setCategoriesSearch] = useState('');
  const categoriesPageSize = 10;

  // Ministries Pagination & Search
  const [ministriesPage, setMinistriesPage] = useState(1);
  const [ministriesSearch, setMinistriesSearch] = useState('');
  const ministriesPageSize = 10;

  // Institutions Pagination & Search
  const [institutionsPage, setInstitutionsPage] = useState(1);
  const [institutionsSearch, setInstitutionsSearch] = useState('');
  const institutionsPageSize = 10;

  // Daily Wage Skills Pagination & Search
  const [skillsPage, setSkillsPage] = useState(1);
  const [skillsSearch, setSkillsSearch] = useState('');
  const skillsPageSize = 10;

  // Daily Wage Worker Modal State
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [isSavingWorker, setIsSavingWorker] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    dsDivision: '',
    gnDivision: '',
    expectedWage: '',
    experience: '',
    status: 'APPROVED' as 'PENDING' | 'APPROVED' | 'REJECTED',
    isActive: true,
    skills: [] as string[]
  });

  // Daily Wage Skills Master State
  const [skillsList, setSkillsList] = useState<DailyWageSkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [isSavingSkill, setIsSavingSkill] = useState(false);
  const [skillForm, setSkillForm] = useState({
    name: '',
    nameSi: '',
    order: 0,
    isActive: true
  });

  // Lookups State
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  // Job Modal State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({ ...defaultJobForm });
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [modalTab, setModalTab] = useState<'basic' | 'salary' | 'eligibility' | 'application'>('basic');
  const [gazetteFile, setGazetteFile] = useState<File | null>(null);
  const [gazetteFileSi, setGazetteFileSi] = useState<File | null>(null);
  const [specimenAppFile, setSpecimenAppFile] = useState<File | null>(null);
  const [specimenAppFileSi, setSpecimenAppFileSi] = useState<File | null>(null);
  const [isSavingJob, setIsSavingJob] = useState(false);

  // View Details Modal State
  const [viewingJob, setViewingJob] = useState<JobPost | null>(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryNameSi, setCategoryNameSi] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [isCategorySlugCustomized, setIsCategorySlugCustomized] = useState(false);
  const [categoryImage, setCategoryImage] = useState('');
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);

  // Ministry Modal State
  const [isMinistryModalOpen, setIsMinistryModalOpen] = useState(false);
  const [editingMinistryId, setEditingMinistryId] = useState<string | null>(null);
  const [ministryName, setMinistryName] = useState('');
  const [ministryNameSi, setMinistryNameSi] = useState('');

  // Institution Modal State
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);
  const [editingInstitutionId, setEditingInstitutionId] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState('');
  const [institutionNameSi, setInstitutionNameSi] = useState('');
  const [institutionMinistryId, setInstitutionMinistryId] = useState<string>('');

  const token = localStorage.getItem('admin_token');
  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  // --- Fetch Lookups ---
  const fetchLookups = async () => {
    try {
      const [catsRes, minsRes, instsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/careers/categories`),
        fetch(`${API_BASE_URL}/careers/ministries`),
        fetch(`${API_BASE_URL}/careers/institutions`)
      ]);

      if (catsRes.ok) setCategories(await catsRes.json());
      if (minsRes.ok) setMinistries(await minsRes.json());
      if (instsRes.ok) setInstitutions(await instsRes.json());
    } catch (err) {
      console.error('Failed to fetch lookups:', err);
    }
  };

  // --- Fetch Daily Wage Skills ---
  const fetchSkills = async () => {
    setIsLoadingSkills(true);
    try {
      const res = await fetch(`${API_BASE_URL}/careers/daily-wage-skills`);
      if (res.ok) {
        const data = await res.json();
        setSkillsList(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    } finally {
      setIsLoadingSkills(false);
    }
  };

  // --- Fetch Daily Wage Workers ---
  const fetchWorkers = async (page = 1) => {
    setIsLoadingWorkers(true);
    try {
      let url = `${API_BASE_URL}/careers/daily-wage-workers?page=${page}&limit=12&status=${workersStatusFilter}`;
      if (workersSearch.trim()) url += `&search=${encodeURIComponent(workersSearch.trim())}`;
      const res = await fetch(url, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setWorkers(data.data || []);
        if (data.meta) {
          setWorkersTotalPages(data.meta.totalPages || 1);
          setWorkersTotalItems(data.meta.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    } finally {
      setIsLoadingWorkers(false);
    }
  };

  // --- Fetch Job Posts ---
  const fetchJobs = async (page = 1) => {
    setIsLoadingJobs(true);
    try {
      let url = `${API_BASE_URL}/careers/jobs?page=${page}&limit=12`;
      if (filterApproval !== 'ALL') url += `&approvalStatus=${filterApproval}`;
      if (filterCategory !== 'ALL') url += `&jobCategoryId=${filterCategory}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.data || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setTotalJobs(data.meta.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchLookups();
    fetchSkills();
  }, []);

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage, filterApproval, filterCategory]);

  useEffect(() => {
    if (activeTab === 'dailyWage') {
      fetchWorkers(workersPage);
    }
  }, [activeTab, workersPage, workersStatusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs(1);
  };

  const handleWorkersSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkersPage(1);
    fetchWorkers(1);
  };

  // Filter institutions based on selected ministry in job modal
  const filteredModalInstitutions = useMemo(() => {
    if (!jobForm.selectedMinistryId) return institutions;
    return institutions.filter(inst => String(inst.ministryId) === String(jobForm.selectedMinistryId));
  }, [institutions, jobForm.selectedMinistryId]);

  // Counts for tabs
  const pendingCount = useMemo(() => jobs.filter(j => j.approvalStatus === 'PENDING').length, [jobs]);
  const pendingWorkersCount = useMemo(() => workers.filter(w => w.status === 'PENDING').length, [workers]);

  // Modal Category Types
  const currentModalCategory = useMemo(() => {
    return categories.find(c => String(c.id) === String(jobForm.jobCategoryId));
  }, [categories, jobForm.jobCategoryId]);

  const isModalPrivate = useMemo(() => {
    if (!currentModalCategory) return false;
    return (
      currentModalCategory.name.toLowerCase().includes('private') ||
      (currentModalCategory.nameSi && currentModalCategory.nameSi.includes('පුද්ගලික'))
    );
  }, [currentModalCategory]);

  const isModalForeign = useMemo(() => {
    if (!currentModalCategory) return false;
    return (
      currentModalCategory.name.toLowerCase().includes('foreign') ||
      (currentModalCategory.nameSi && currentModalCategory.nameSi.includes('විදේශ'))
    );
  }, [currentModalCategory]);

  const isModalGov = !isModalPrivate && !isModalForeign;

  // Available worker districts for modal
  const availableWorkerDistricts = useMemo(() => {
    if (!workerForm.province) return [];
    return getDistrictsForProvince(workerForm.province);
  }, [workerForm.province]);

  const availableWorkerDSDs = useMemo(() => {
    if (!workerForm.district) return [];
    const list = getDSDsForDistrict(workerForm.district);
    return list.slice().sort((a, b) => (a.nameSi || a.nameEn).localeCompare(b.nameSi || b.nameEn, 'si'));
  }, [workerForm.district]);

  const availableWorkerGNDs = useMemo(() => {
    if (!workerForm.dsDivision) return [];
    const list = getGNDsForDSD(workerForm.dsDivision, workerForm.district);
    return list.slice().sort((a, b) => {
      if (a.gnCode && b.gnCode) {
        const numA = parseInt(a.gnCode, 10);
        const numB = parseInt(b.gnCode, 10);
        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
          return numA - numB;
        }
        return a.gnCode.localeCompare(b.gnCode);
      }
      return (a.nameSi || a.nameEn).localeCompare(b.nameSi || b.nameEn, 'si');
    });
  }, [workerForm.dsDivision, workerForm.district]);

  // Categories filtering & pagination
  const filteredCategories = useMemo(() => {
    if (!categoriesSearch.trim()) return categories;
    const q = categoriesSearch.toLowerCase().trim();
    return categories.filter(c =>
      c.name.toLowerCase().includes(q) || (c.nameSi && c.nameSi.toLowerCase().includes(q))
    );
  }, [categories, categoriesSearch]);

  const categoriesTotalPages = Math.ceil(filteredCategories.length / categoriesPageSize) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (categoriesPage - 1) * categoriesPageSize;
    return filteredCategories.slice(start, start + categoriesPageSize);
  }, [filteredCategories, categoriesPage, categoriesPageSize]);

  // Ministries filtering & pagination
  const filteredMinistries = useMemo(() => {
    if (!ministriesSearch.trim()) return ministries;
    const q = ministriesSearch.toLowerCase().trim();
    return ministries.filter(m =>
      m.name.toLowerCase().includes(q) || (m.nameSi && m.nameSi.toLowerCase().includes(q))
    );
  }, [ministries, ministriesSearch]);

  const ministriesTotalPages = Math.ceil(filteredMinistries.length / ministriesPageSize) || 1;
  const paginatedMinistries = useMemo(() => {
    const start = (ministriesPage - 1) * ministriesPageSize;
    return filteredMinistries.slice(start, start + ministriesPageSize);
  }, [filteredMinistries, ministriesPage, ministriesPageSize]);

  // Institutions filtering & pagination
  const filteredInstitutions = useMemo(() => {
    if (!institutionsSearch.trim()) return institutions;
    const q = institutionsSearch.toLowerCase().trim();
    return institutions.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.nameSi && i.nameSi.toLowerCase().includes(q)) ||
      (i.ministry?.name && i.ministry.name.toLowerCase().includes(q)) ||
      (i.ministry?.nameSi && i.ministry.nameSi.toLowerCase().includes(q))
    );
  }, [institutions, institutionsSearch]);

  const institutionsTotalPages = Math.ceil(filteredInstitutions.length / institutionsPageSize) || 1;
  const paginatedInstitutions = useMemo(() => {
    const start = (institutionsPage - 1) * institutionsPageSize;
    return filteredInstitutions.slice(start, start + institutionsPageSize);
  }, [filteredInstitutions, institutionsPage, institutionsPageSize]);

  // Skills filtering & pagination
  const filteredSkills = useMemo(() => {
    if (!skillsSearch.trim()) return skillsList;
    const q = skillsSearch.toLowerCase().trim();
    return skillsList.filter(s =>
      s.name.toLowerCase().includes(q) || (s.nameSi && s.nameSi.toLowerCase().includes(q))
    );
  }, [skillsList, skillsSearch]);

  const skillsTotalPages = Math.ceil(filteredSkills.length / skillsPageSize) || 1;
  const paginatedSkills = useMemo(() => {
    const start = (skillsPage - 1) * skillsPageSize;
    return filteredSkills.slice(start, start + skillsPageSize);
  }, [filteredSkills, skillsPage, skillsPageSize]);

  // --- Worker Handlers ---
  const openCreateWorker = () => {
    setEditingWorkerId(null);
    setWorkerForm({
      fullName: '',
      phone: '',
      province: '',
      district: '',
      dsDivision: '',
      gnDivision: '',
      expectedWage: '',
      experience: '',
      status: 'APPROVED',
      isActive: true,
      skills: []
    });
    setIsWorkerModalOpen(true);
  };

  const openEditWorker = (worker: DailyWageWorker) => {
    setEditingWorkerId(worker.id);
    setWorkerForm({
      fullName: worker.fullName || '',
      phone: worker.phone || '',
      province: worker.province || '',
      district: worker.district || '',
      dsDivision: worker.dsDivision || '',
      gnDivision: worker.gnDivision || '',
      expectedWage: worker.expectedWage || '',
      experience: worker.experience || '',
      status: worker.status || 'APPROVED',
      isActive: worker.isActive,
      skills: worker.skills?.map(s => s.skill.id) || []
    });
    setIsWorkerModalOpen(true);
  };

  const handleSaveWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerForm.fullName.trim() || !workerForm.phone.trim() || !workerForm.province || !workerForm.district) {
      alert('Please fill all required worker fields (Full Name, Phone, Province, District).');
      return;
    }
    setIsSavingWorker(true);
    try {
      const method = editingWorkerId ? 'PUT' : 'POST';
      const url = editingWorkerId
        ? `${API_BASE_URL}/careers/daily-wage-workers/${editingWorkerId}`
        : `${API_BASE_URL}/careers/daily-wage-workers`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(workerForm)
      });
      if (res.ok) {
        setIsWorkerModalOpen(false);
        fetchWorkers(workersPage);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save worker');
      }
    } catch (err) {
      console.error('Error saving worker:', err);
    } finally {
      setIsSavingWorker(false);
    }
  };

  const handleWorkerStatusChange = async (workerId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`${API_BASE_URL}/careers/daily-wage-workers/${workerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchWorkers(workersPage);
      }
    } catch (err) {
      console.error('Error updating worker status:', err);
    }
  };

  const handleToggleWorkerActive = async (worker: DailyWageWorker) => {
    try {
      const res = await fetch(`${API_BASE_URL}/careers/daily-wage-workers/${worker.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ isActive: !worker.isActive })
      });
      if (res.ok) {
        setWorkers(workers.map(w => w.id === worker.id ? { ...w, isActive: !w.isActive } : w));
      }
    } catch (err) {
      console.error('Error toggling worker status:', err);
    }
  };

  const handleDeleteWorker = async (worker: DailyWageWorker) => {
    if (!confirm(`Are you sure you want to delete worker "${worker.fullName}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/careers/daily-wage-workers/${worker.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        fetchWorkers(workersPage);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete worker');
      }
    } catch (err) {
      console.error('Error deleting worker:', err);
    }
  };

  // --- Skill Handlers ---
  const openCreateSkill = () => {
    setEditingSkillId(null);
    setSkillForm({ name: '', nameSi: '', order: skillsList.length, isActive: true });
    setIsSkillModalOpen(true);
  };

  const openEditSkill = (skill: DailyWageSkill) => {
    setEditingSkillId(skill.id);
    setSkillForm({
      name: skill.name,
      nameSi: skill.nameSi,
      order: skill.order,
      isActive: skill.isActive
    });
    setIsSkillModalOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name.trim() || !skillForm.nameSi.trim()) {
      alert('Please fill skill names in English and Sinhala.');
      return;
    }
    setIsSavingSkill(true);
    try {
      const method = editingSkillId ? 'PUT' : 'POST';
      const url = editingSkillId
        ? `${API_BASE_URL}/careers/daily-wage-skills/${editingSkillId}`
        : `${API_BASE_URL}/careers/daily-wage-skills`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(skillForm)
      });
      if (res.ok) {
        setIsSkillModalOpen(false);
        fetchSkills();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save skill');
      }
    } catch (err) {
      console.error('Error saving skill:', err);
    } finally {
      setIsSavingSkill(false);
    }
  };

  const handleDeleteSkill = async (skill: DailyWageSkill) => {
    if (!confirm(`Are you sure you want to delete skill "${skill.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/careers/daily-wage-skills/${skill.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        fetchSkills();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete skill');
      }
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  };

  const generateSlug = (val: string) => {
    return (val || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // --- Job Form Handlers ---
  const openCreateJob = () => {
    setJobForm({ ...defaultJobForm });
    setIsSlugCustomized(false);
    setGazetteFile(null);
    setGazetteFileSi(null);
    setSpecimenAppFile(null);
    setSpecimenAppFileSi(null);
    setBannerImageFile(null);
    setBannerImagePreview(null);
    setEditingJobId(null);
    setModalTab('basic');
    setIsJobModalOpen(true);
  };

  const openEditJob = (job: JobPost) => {
    setEditingJobId(job.id);
    setIsSlugCustomized(true);
    setJobForm({
      slug: job.slug || '',
      designation: job.designation || '',
      designationSi: job.designationSi || '',
      jobCategoryId: job.jobCategoryId ? String(job.jobCategoryId) : '',
      selectedMinistryId: job.institution?.ministryId ? String(job.institution.ministryId) : '',
      institutionId: job.institutionId ? String(job.institutionId) : '',
      serviceCategory: job.serviceCategory || '',
      serviceCategorySi: job.serviceCategorySi || '',
      jobNature: job.jobNature || 'Permanent',
      jobNatureSi: job.jobNatureSi || 'ස්ථිර',
      serviceConditions: job.serviceConditions || 'Pensionable',
      serviceConditionsSi: job.serviceConditionsSi || 'ස්ථිර හා විශ්‍රාම වැටුප් සහිතයි',
      recruitmentType: job.recruitmentType || 'Open',
      recruitmentTypeSi: job.recruitmentTypeSi || 'විවෘත',
      companyName: job.companyName || '',
      companyNameSi: job.companyNameSi || '',
      governingMinistry: job.governingMinistry || '',
      governingMinistrySi: job.governingMinistrySi || '',
      agency: job.agency || '',
      agencySi: job.agencySi || '',
      country: job.country || '',
      countrySi: job.countrySi || '',
      applyLink: job.applyLink || job.applicationInfo?.applyLink || '',
      expiryDate: job.expiryDate ? job.expiryDate.split('T')[0] : '',
      isActive: job.isActive,
      approvalStatus: job.approvalStatus,

      salaryCode: job.salaryDetails?.salaryCode || '',
      basicSalary: job.salaryDetails?.basicSalary || '',
      basicSalarySi: job.salaryDetails?.basicSalarySi || '',
      salaryScale: job.salaryDetails?.salaryScale || '',
      salaryScaleSi: job.salaryDetails?.salaryScaleSi || '',
      allowances: job.salaryDetails?.allowances || '',
      allowancesSi: job.salaryDetails?.allowancesSi || '',
      salaryDisplay: job.salaryDetails?.salaryDisplay || '',
      salaryDisplaySi: job.salaryDetails?.salaryDisplaySi || '',

      ageLimit: job.eligibility?.ageLimit || '',
      ageLimitSi: job.eligibility?.ageLimitSi || '',
      ageRelaxation: job.eligibility?.ageRelaxation || '',
      ageRelaxationSi: job.eligibility?.ageRelaxationSi || '',
      qualifications: job.eligibility?.qualifications || '',
      qualificationsSi: job.eligibility?.qualificationsSi || '',
      basicExperience: job.eligibility?.basicExperience || '',
      basicExperienceSi: job.eligibility?.basicExperienceSi || '',

      selectionMethod: job.selectionProcedure?.method || '',
      selectionMethodSi: job.selectionProcedure?.methodSi || '',
      examDetails: job.selectionProcedure?.examDetails || '',
      examDetailsSi: job.selectionProcedure?.examDetailsSi || '',

      gazetteNo: job.applicationInfo?.gazetteNo || '',
      gazetteDate: job.applicationInfo?.gazetteDate ? job.applicationInfo.gazetteDate.split('T')[0] : '',
      examFee: job.applicationInfo?.examFee || '',
      examFeeSi: job.applicationInfo?.examFeeSi || '',
      postalAddress: job.applicationInfo?.postalAddress || '',
      postalAddressSi: job.applicationInfo?.postalAddressSi || '',
      envelopeMarking: job.applicationInfo?.envelopeMarking || '',
      envelopeMarkingSi: job.applicationInfo?.envelopeMarkingSi || '',
      submissionDetails: job.applicationInfo?.submissionDetails || '',
      submissionDetailsSi: job.applicationInfo?.submissionDetailsSi || '',
      existingGazetteUrl: job.applicationInfo?.gazetteUrl || '',
      existingGazetteUrlSi: job.applicationInfo?.gazetteUrlSi || '',
      existingSpecimenAppUrl: job.applicationInfo?.specimenAppUrl || '',
      existingSpecimenAppUrlSi: job.applicationInfo?.specimenAppUrlSi || '',
      existingBannerImage: job.bannerImage || ''
    });
    setGazetteFile(null);
    setGazetteFileSi(null);
    setSpecimenAppFile(null);
    setSpecimenAppFileSi(null);
    setBannerImageFile(null);
    setBannerImagePreview(job.bannerImage || null);
    setModalTab('basic');
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCat = categories.find(c => String(c.id) === String(jobForm.jobCategoryId));
    const isPrivateJob = selectedCat ? (selectedCat.name.toLowerCase().includes('private') || (selectedCat.nameSi && selectedCat.nameSi.includes('පුද්ගලික'))) : false;
    const isForeignJob = selectedCat ? (selectedCat.name.toLowerCase().includes('foreign') || (selectedCat.nameSi && selectedCat.nameSi.includes('විදේශ'))) : false;
    const isGovJob = !isPrivateJob && !isForeignJob;

    const finalDesignation = (jobForm.designation || jobForm.designationSi || '').trim();
    const finalSlug = (jobForm.slug || generateSlug(finalDesignation)).trim();
    if (!finalDesignation || !finalSlug || !jobForm.jobCategoryId || !jobForm.expiryDate) {
      alert('Please fill required fields: Designation, URL Slug, Category, and Expiry Date.');
      return;
    }

    if (isGovJob && !jobForm.institutionId) {
      alert('Please select an Institution for Government Job postings.');
      return;
    }

    setIsSavingJob(true);
    try {
      const formData = new FormData();
      formData.append('slug', finalSlug);
      formData.append('designation', finalDesignation);
      if (jobForm.designationSi) formData.append('designationSi', jobForm.designationSi.trim());
      formData.append('jobCategoryId', String(jobForm.jobCategoryId));
      if (jobForm.institutionId) formData.append('institutionId', String(jobForm.institutionId));
      formData.append('expiryDate', jobForm.expiryDate);
      formData.append('isActive', String(jobForm.isActive));
      formData.append('approvalStatus', jobForm.approvalStatus);

      if (jobForm.serviceCategory) formData.append('serviceCategory', jobForm.serviceCategory);
      if (jobForm.serviceCategorySi) formData.append('serviceCategorySi', jobForm.serviceCategorySi);
      if (jobForm.jobNature) formData.append('jobNature', jobForm.jobNature);
      if (jobForm.jobNatureSi) formData.append('jobNatureSi', jobForm.jobNatureSi);
      if (jobForm.serviceConditions) formData.append('serviceConditions', jobForm.serviceConditions);
      if (jobForm.serviceConditionsSi) formData.append('serviceConditionsSi', jobForm.serviceConditionsSi);
      if (jobForm.recruitmentType) formData.append('recruitmentType', jobForm.recruitmentType);
      if (jobForm.recruitmentTypeSi) formData.append('recruitmentTypeSi', jobForm.recruitmentTypeSi);

      if (jobForm.companyName) formData.append('companyName', jobForm.companyName);
      if (jobForm.companyNameSi) formData.append('companyNameSi', jobForm.companyNameSi);
      if (jobForm.governingMinistry) formData.append('governingMinistry', jobForm.governingMinistry);
      if (jobForm.governingMinistrySi) formData.append('governingMinistrySi', jobForm.governingMinistrySi);
      if (jobForm.agency) formData.append('agency', jobForm.agency);
      if (jobForm.agencySi) formData.append('agencySi', jobForm.agencySi);
      if (jobForm.country) formData.append('country', jobForm.country);
      if (jobForm.countrySi) formData.append('countrySi', jobForm.countrySi);
      if (jobForm.applyLink) formData.append('applyLink', jobForm.applyLink);

      // Salary Details
      formData.append('salaryDetails', JSON.stringify({
        salaryCode: jobForm.salaryCode,
        basicSalary: jobForm.basicSalary,
        basicSalarySi: jobForm.basicSalarySi,
        salaryScale: jobForm.salaryScale,
        salaryScaleSi: jobForm.salaryScaleSi,
        allowances: jobForm.allowances,
        allowancesSi: jobForm.allowancesSi,
        salaryDisplay: jobForm.salaryDisplay,
        salaryDisplaySi: jobForm.salaryDisplaySi
      }));

      // Eligibility
      formData.append('eligibility', JSON.stringify({
        ageLimit: jobForm.ageLimit,
        ageLimitSi: jobForm.ageLimitSi,
        ageRelaxation: jobForm.ageRelaxation,
        ageRelaxationSi: jobForm.ageRelaxationSi,
        qualifications: jobForm.qualifications,
        qualificationsSi: jobForm.qualificationsSi,
        basicExperience: jobForm.basicExperience,
        basicExperienceSi: jobForm.basicExperienceSi
      }));

      // Selection Procedure
      formData.append('selectionProcedure', JSON.stringify({
        method: jobForm.selectionMethod,
        methodSi: jobForm.selectionMethodSi,
        examDetails: jobForm.examDetails,
        examDetailsSi: jobForm.examDetailsSi
      }));

      // Application Info
      formData.append('applicationInfo', JSON.stringify({
        gazetteNo: jobForm.gazetteNo,
        gazetteDate: jobForm.gazetteDate || null,
        examFee: jobForm.examFee,
        examFeeSi: jobForm.examFeeSi,
        postalAddress: jobForm.postalAddress,
        postalAddressSi: jobForm.postalAddressSi,
        envelopeMarking: jobForm.envelopeMarking,
        envelopeMarkingSi: jobForm.envelopeMarkingSi,
        submissionDetails: jobForm.submissionDetails,
        submissionDetailsSi: jobForm.submissionDetailsSi,
        applyLink: jobForm.applyLink || null,
        gazetteUrl: jobForm.existingGazetteUrl || null,
        gazetteUrlSi: jobForm.existingGazetteUrlSi || null,
        specimenAppUrl: jobForm.existingSpecimenAppUrl || null,
        specimenAppUrlSi: jobForm.existingSpecimenAppUrlSi || null
      }));

      // Banner Image
      if (bannerImageFile) {
        formData.append('bannerImage', bannerImageFile);
      } else if (jobForm.existingBannerImage) {
        formData.append('bannerImage', jobForm.existingBannerImage);
      } else if (!bannerImagePreview) {
        formData.append('bannerImage', '');
      }

      // PDF Files (English & Sinhala)
      if (gazetteFile) formData.append('gazetteFile', gazetteFile);
      if (gazetteFileSi) formData.append('gazetteFileSi', gazetteFileSi);
      if (specimenAppFile) formData.append('specimenAppFile', specimenAppFile);
      if (specimenAppFileSi) formData.append('specimenAppFileSi', specimenAppFileSi);

      const method = editingJobId ? 'PUT' : 'POST';
      const url = editingJobId
        ? `${API_BASE_URL}/careers/jobs/${editingJobId}`
        : `${API_BASE_URL}/careers/jobs`;

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: formData
      });

      if (res.ok) {
        setIsJobModalOpen(false);
        fetchJobs(currentPage);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to save job post');
      }
    } catch (err) {
      console.error('Error saving job:', err);
      alert('An unexpected error occurred while saving the job.');
    } finally {
      setIsSavingJob(false);
    }
  };

  const handleToggleActive = async (job: JobPost) => {
    try {
      const res = await fetch(`${API_BASE_URL}/careers/jobs/${job.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ isActive: !job.isActive })
      });
      if (res.ok) {
        setJobs(jobs.map(j => (j.id === job.id ? { ...j, isActive: !j.isActive } : j)));
      }
    } catch (err) {
      console.error('Failed to toggle job status:', err);
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/careers/jobs/${jobId}/approve`, {
        method: 'PATCH',
        headers: authHeaders
      });
      if (res.ok) {
        setJobs(jobs.map(j => (j.id === jobId ? { ...j, approvalStatus: 'APPROVED', isActive: true } : j)));
      }
    } catch (err) {
      console.error('Failed to approve job:', err);
    }
  };

  const handleRejectJob = async (jobId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/careers/jobs/${jobId}/reject`, {
        method: 'PATCH',
        headers: authHeaders
      });
      if (res.ok) {
        setJobs(jobs.map(j => (j.id === jobId ? { ...j, approvalStatus: 'REJECTED', isActive: false } : j)));
      }
    } catch (err) {
      console.error('Failed to reject job:', err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job post? This will delete all attached salary, eligibility, and application files.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/careers/jobs/${jobId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        fetchJobs(currentPage);
      }
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  // --- Category CRUD Handlers ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim() && !categoryNameSi.trim()) return;
    try {
      const method = editingCategoryId ? 'PUT' : 'POST';
      const url = editingCategoryId ? `${API_BASE_URL}/careers/categories/${editingCategoryId}` : `${API_BASE_URL}/careers/categories`;
      
      let res;
      if (categoryImageFile) {
        const formData = new FormData();
        formData.append('name', (categoryName || categoryNameSi).trim());
        if (categoryNameSi.trim()) formData.append('nameSi', categoryNameSi.trim());
        if (categorySlug.trim()) formData.append('slug', categorySlug.trim());
        formData.append('image', categoryImageFile);
        
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        res = await fetch(url, {
          method,
          headers,
          body: formData
        });
      } else {
        res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({
            name: (categoryName || categoryNameSi).trim(),
            nameSi: categoryNameSi.trim() || null,
            slug: categorySlug.trim() || undefined,
            image: categoryImage.trim() || null
          })
        });
      }
      if (res.ok) {
        setIsCategoryModalOpen(false);
        setCategoryName('');
        setCategoryNameSi('');
        setCategorySlug('');
        setIsCategorySlugCustomized(false);
        setCategoryImage('');
        setCategoryImageFile(null);
        setEditingCategoryId(null);
        fetchLookups();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save category');
      }
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleDeleteCategory = async (cat: JobCategory) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/careers/categories/${cat.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        fetchLookups();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // --- Ministry CRUD Handlers ---
  const handleSaveMinistry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ministryName.trim() && !ministryNameSi.trim()) return;
    try {
      const method = editingMinistryId ? 'PUT' : 'POST';
      const url = editingMinistryId ? `${API_BASE_URL}/careers/ministries/${editingMinistryId}` : `${API_BASE_URL}/careers/ministries`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          name: (ministryName || ministryNameSi).trim(),
          nameSi: ministryNameSi.trim() || null
        })
      });
      if (res.ok) {
        setIsMinistryModalOpen(false);
        setMinistryName('');
        setMinistryNameSi('');
        setEditingMinistryId(null);
        fetchLookups();
      }
    } catch (err) {
      console.error('Error saving ministry:', err);
    }
  };

  const handleDeleteMinistry = async (min: Ministry) => {
    if (!confirm(`Delete ministry "${min.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/careers/ministries/${min.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        fetchLookups();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete ministry');
      }
    } catch (err) {
      console.error('Error deleting ministry:', err);
    }
  };

  // --- Institution CRUD Handlers ---
  const handleSaveInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionName.trim() && !institutionNameSi.trim()) return;
    try {
      const method = editingInstitutionId ? 'PUT' : 'POST';
      const url = editingInstitutionId ? `${API_BASE_URL}/careers/institutions/${editingInstitutionId}` : `${API_BASE_URL}/careers/institutions`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          name: (institutionName || institutionNameSi).trim(),
          nameSi: institutionNameSi.trim() || null,
          ministryId: institutionMinistryId ? String(institutionMinistryId) : null
        })
      });
      if (res.ok) {
        setIsInstitutionModalOpen(false);
        setInstitutionName('');
        setInstitutionNameSi('');
        setInstitutionMinistryId('');
        setEditingInstitutionId(null);
        fetchLookups();
      }
    } catch (err) {
      console.error('Error saving institution:', err);
    }
  };

  const handleDeleteInstitution = async (inst: Institution) => {
    if (!confirm(`Delete institution "${inst.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/careers/institutions/${inst.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        fetchLookups();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete institution');
      }
    } catch (err) {
      console.error('Error deleting institution:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Careers & Job Openings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage government and agricultural job postings, categories, ministries, and institutions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'jobs' && (
            <button
              onClick={openCreateJob}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              <Plus size={18} /> Add Job Post
            </button>
          )}
          {activeTab === 'dailyWage' && (
            <button
              onClick={openCreateWorker}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              <Plus size={18} /> Add Worker
            </button>
          )}
          {activeTab === 'skills' && (
            <button
              onClick={openCreateSkill}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              <Plus size={18} /> Add Skill
            </button>
          )}
          {activeTab === 'categories' && (
            <button
              onClick={() => { setCategoryName(''); setCategoryNameSi(''); setCategoryImage(''); setCategoryImageFile(null); setEditingCategoryId(null); setIsCategoryModalOpen(true); }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              <Plus size={18} /> Add Category
            </button>
          )}
          {activeTab === 'ministries' && (
            <button
              onClick={() => { setMinistryName(''); setEditingMinistryId(null); setIsMinistryModalOpen(true); }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              <Plus size={18} /> Add Ministry
            </button>
          )}
          {activeTab === 'institutions' && (
            <button
              onClick={() => { setInstitutionName(''); setInstitutionMinistryId(''); setEditingInstitutionId(null); setIsInstitutionModalOpen(true); }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              <Plus size={18} /> Add Institution
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation (Segmented pill bar matching InstitutionManagement) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-medium flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-white text-gray-900 font-semibold shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase size={14} className="text-gray-600" />
            <span>Job Postings</span>
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {pendingCount} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dailyWage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'dailyWage'
                ? 'bg-white text-gray-900 font-semibold shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>🚜</span>
            <span>Daily Wage Workers</span>
            {pendingWorkersCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {pendingWorkersCount} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'skills'
                ? 'bg-white text-gray-900 font-semibold shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Wrench size={14} className="text-gray-600" />
            <span>Daily Wage Skills ({skillsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-gray-900 font-semibold shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers size={14} className="text-gray-600" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ministries')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'ministries'
                ? 'bg-white text-gray-900 font-semibold shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Landmark size={14} className="text-gray-600" />
            <span>Ministries ({ministries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('institutions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'institutions'
                ? 'bg-white text-gray-900 font-semibold shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 size={14} className="text-gray-600" />
            <span>Institutions ({institutions.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: JOB POSTINGS */}
      {/* ======================================================== */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search job designation, nature, service..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
              />
            </form>

            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Approval Filter Pill Buttons */}
              <div className="inline-flex bg-gray-100 p-1 rounded-lg text-xs font-medium">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => { setFilterApproval(status); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      filterApproval === status ? 'bg-white text-gray-900 font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {status === 'ALL' ? 'All' : status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoadingJobs ? (
              <div className="flex justify-center items-center py-20">
                <AgroLoader message="Loading job posts..." />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Briefcase className="mx-auto mb-2 opacity-50" size={36} />
                <p className="text-base font-medium text-gray-600">No job postings found</p>
                <p className="text-xs text-gray-400 mt-1">Try changing filters or add a new job post.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Institution & Ministry</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Closing Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Approval Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jobs.map(job => {
                    const isExpired = new Date(job.expiryDate) < new Date();
                    return (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            {job.bannerImage ? (
                              <img
                                src={job.bannerImage.startsWith('http') || job.bannerImage.startsWith('/api') ? job.bannerImage : `${API_BASE_URL.replace('/api', '')}${job.bannerImage}`}
                                alt={job.designation}
                                className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0 shadow-2xs"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <Briefcase className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-800 leading-snug">{job.designation}</div>
                              {job.designationSi && (
                                <div className="text-xs text-gray-500 font-normal mt-0.5">{job.designationSi}</div>
                              )}
                              {job.slug && (
                                <div className="text-[11px] font-mono text-emerald-700 mt-1">
                                  /{job.slug}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                            {job.jobNature && (
                              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                                {JOB_NATURE_OPTIONS.find(o => o.en === job.jobNature || o.si === job.jobNatureSi)?.label || job.jobNature}
                              </span>
                            )}
                            {job.serviceConditions && (
                              <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                                {SERVICE_CONDITIONS_OPTIONS.find(o => o.en === job.serviceConditions || o.si === job.serviceConditionsSi)?.label || job.serviceConditions}
                              </span>
                            )}
                            {job.recruitmentType && (
                              <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                                {RECRUITMENT_TYPE_OPTIONS.find(o => o.en === job.recruitmentType || o.si === job.recruitmentTypeSi)?.label || job.recruitmentType}
                              </span>
                            )}
                            {job.user && <span className="text-gray-400">By: {job.user.name}</span>}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            {job.jobCategory?.name || 'Unassigned'}
                          </span>
                          {job.jobCategory?.nameSi && (
                            <div className="text-[11px] text-gray-400 mt-0.5">{job.jobCategory.nameSi}</div>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.companyName ? (
                            <div>
                              <div className="font-semibold text-emerald-800">{job.companyName}</div>
                              {job.governingMinistry && (
                                <div className="text-xs text-gray-500">{job.governingMinistry}</div>
                              )}
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">Private</span>
                            </div>
                          ) : (job.agency || job.country) ? (
                            <div>
                              <div className="font-semibold text-blue-800">{job.agency || 'Foreign Agency'}</div>
                              {job.country && (
                                <div className="text-xs text-gray-600 font-medium">📍 {job.country}</div>
                              )}
                              <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold border border-blue-200">Foreign</span>
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium text-gray-800">{job.institution?.name || '—'}</div>
                              {job.institution?.nameSi && (
                                <div className="text-xs text-gray-500">{job.institution.nameSi}</div>
                              )}
                              {job.institution?.ministry && (
                                <div className="text-xs text-gray-400">{job.institution.ministry.name}</div>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            isExpired ? 'bg-red-50 text-red-600' : 'text-gray-600'
                          }`}>
                            {new Date(job.expiryDate).toLocaleDateString()}
                            {isExpired && ' (Expired)'}
                          </span>
                        </td>

                        {/* Approval Status & Quick Action Buttons */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {job.approvalStatus === 'APPROVED' && (
                              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium border border-green-200">
                                <CheckCircle2 size={12} /> Approved
                              </span>
                            )}
                            {job.approvalStatus === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium border border-amber-200">
                                <Clock size={12} /> Pending Review
                              </span>
                            )}
                            {job.approvalStatus === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium border border-red-200">
                                <XCircle size={12} /> Rejected
                              </span>
                            )}

                            {/* Quick Approve / Reject buttons for PENDING jobs */}
                            {job.approvalStatus === 'PENDING' && (
                              <div className="flex items-center gap-1 ml-1">
                                <button
                                  onClick={() => handleApproveJob(job.id)}
                                  title="Approve Job Post"
                                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => handleRejectJob(job.id)}
                                  title="Reject Job Post"
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Active Toggle Switch */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(job)}
                            className="cursor-pointer transition-transform active:scale-95"
                            title={job.isActive ? 'Active (Click to disable)' : 'Inactive (Click to enable)'}
                          >
                            {job.isActive ? (
                              <ToggleRight size={26} className="text-green-600" />
                            ) : (
                              <ToggleLeft size={26} className="text-gray-300 hover:text-gray-400" />
                            )}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 justify-end">
                            {job.applyLink && (
                              <a
                                href={job.applyLink}
                                target="_blank"
                                rel="noreferrer"
                                title="Open Apply Link"
                                className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                            <a
                              href={`/careers/${job.slug || job.id}`}
                              target="_blank"
                              rel="noreferrer"
                              title="View Public Page"
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <ExternalLink size={16} />
                            </a>
                            <button
                              onClick={() => setViewingJob(job)}
                              title="View Details"
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => openEditJob(job)}
                              title="Edit Job"
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              title="Delete Job"
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {totalPages >= 1 && (
              <div className="border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalJobs}
                  pageSize={12}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: JOB CATEGORIES */}
      {/* ======================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-base">Job Categories</h3>
              <p className="text-xs text-gray-500">Manage categories used to classify agricultural job postings.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categoriesSearch}
                  onChange={e => { setCategoriesSearch(e.target.value); setCategoriesPage(1); }}
                  className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50 w-48"
                />
              </div>
              <button
                onClick={() => {
                  setCategoryName('');
                  setCategoryNameSi('');
                  setCategorySlug('');
                  setIsCategorySlugCustomized(false);
                  setCategoryImage('');
                  setCategoryImageFile(null);
                  setEditingCategoryId(null);
                  setIsCategoryModalOpen(true);
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus size={18} /> Add Category
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Linked Jobs</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      <Layers className="mx-auto mb-2 opacity-50" size={32} />
                      <p>No job categories found</p>
                    </td>
                  </tr>
                ) : paginatedCategories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      {cat.image ? (
                        <img
                          src={cat.image.startsWith('http') || cat.image.startsWith('/api') ? cat.image : `${API_BASE_URL.replace('/api', '')}${cat.image}`}
                          alt={cat.name}
                          className="w-12 h-10 object-cover rounded-lg border border-gray-200 shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-[10px] font-semibold">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div>{cat.name}</div>
                      {cat.nameSi && <div className="text-xs text-gray-400 font-normal">{cat.nameSi}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                        {cat.slug || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {cat._count?.jobs ?? 0} jobs
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => {
                            setCategoryName(cat.name);
                            setCategoryNameSi(cat.nameSi || '');
                            setCategorySlug(cat.slug || generateSlug(cat.name));
                            setIsCategorySlugCustomized(true);
                            setCategoryImage(cat.image || '');
                            setCategoryImageFile(null);
                            setEditingCategoryId(cat.id);
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {categoriesTotalPages > 1 && (
              <div className="border-t border-gray-100">
                <Pagination
                  currentPage={categoriesPage}
                  totalPages={categoriesTotalPages}
                  onPageChange={setCategoriesPage}
                  totalItems={filteredCategories.length}
                  pageSize={categoriesPageSize}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MINISTRIES */}
      {/* ======================================================== */}
      {activeTab === 'ministries' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-base">Ministries</h3>
              <p className="text-xs text-gray-500">Government ministries associated with agricultural departments and careers.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ministries..."
                  value={ministriesSearch}
                  onChange={e => { setMinistriesSearch(e.target.value); setMinistriesPage(1); }}
                  className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50 w-48"
                />
              </div>
              <button
                onClick={() => { setMinistryName(''); setMinistryNameSi(''); setEditingMinistryId(null); setIsMinistryModalOpen(true); }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus size={18} /> Add Ministry
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ministry Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Institutions</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedMinistries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-400">
                      <Landmark className="mx-auto mb-2 opacity-50" size={32} />
                      <p>No ministries found</p>
                    </td>
                  </tr>
                ) : paginatedMinistries.map(min => (
                  <tr key={min.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{min.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div>{min.name}</div>
                      {min.nameSi && <div className="text-xs text-gray-400 font-normal">{min.nameSi}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {min._count?.institutions ?? min.institutions?.length ?? 0} institutions
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => { setMinistryName(min.name); setMinistryNameSi(min.nameSi || ''); setEditingMinistryId(min.id); setIsMinistryModalOpen(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMinistry(min)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {ministriesTotalPages > 1 && (
              <div className="border-t border-gray-100">
                <Pagination
                  currentPage={ministriesPage}
                  totalPages={ministriesTotalPages}
                  onPageChange={setMinistriesPage}
                  totalItems={filteredMinistries.length}
                  pageSize={ministriesPageSize}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: INSTITUTIONS */}
      {/* ======================================================== */}
      {activeTab === 'institutions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-base">Institutions & Departments</h3>
              <p className="text-xs text-gray-500">Government departments, boards, and institutions under ministries.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search institutions..."
                  value={institutionsSearch}
                  onChange={e => { setInstitutionsSearch(e.target.value); setInstitutionsPage(1); }}
                  className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50 w-48"
                />
              </div>
              <button
                onClick={() => {
                  setInstitutionName('');
                  setInstitutionNameSi('');
                  setInstitutionMinistryId('');
                  setEditingInstitutionId(null);
                  setIsInstitutionModalOpen(true);
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus size={18} /> Add Institution
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Institution Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ministry</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Linked Jobs</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedInstitutions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      <Building2 className="mx-auto mb-2 opacity-50" size={32} />
                      <p>No institutions found</p>
                    </td>
                  </tr>
                ) : paginatedInstitutions.map(inst => (
                  <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{inst.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div>{inst.name}</div>
                      {inst.nameSi && <div className="text-xs text-gray-400 font-normal">{inst.nameSi}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{inst.ministry?.name || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {inst._count?.jobs ?? 0} jobs
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => {
                            setInstitutionName(inst.name);
                            setInstitutionNameSi(inst.nameSi || '');
                            setInstitutionMinistryId(inst.ministryId ? String(inst.ministryId) : '');
                            setEditingInstitutionId(inst.id);
                            setIsInstitutionModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteInstitution(inst)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {institutionsTotalPages > 1 && (
              <div className="border-t border-gray-100">
                <Pagination
                  currentPage={institutionsPage}
                  totalPages={institutionsTotalPages}
                  onPageChange={setInstitutionsPage}
                  totalItems={filteredInstitutions.length}
                  pageSize={institutionsPageSize}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: DAILY WAGE WORKERS */}
      {/* ======================================================== */}
      {activeTab === 'dailyWage' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <form onSubmit={handleWorkersSearchSubmit} className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search worker by name, phone, district, division..."
                value={workersSearch}
                onChange={e => setWorkersSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
              />
            </form>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="inline-flex bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => { setWorkersStatusFilter(status); setWorkersPage(1); }}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      workersStatusFilter === status ? 'bg-white text-gray-900 font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {status === 'ALL' ? 'All' : status}
                  </button>
                ))}
              </div>

              <button
                onClick={openCreateWorker}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer"
              >
                <Plus size={18} /> Register Worker
              </button>
            </div>
          </div>

          {/* Workers Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoadingWorkers ? (
              <div className="flex justify-center items-center py-20">
                <AgroLoader message="Loading daily wage workers..." />
              </div>
            ) : workers.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <span className="text-4xl block mb-2">🚜</span>
                <p className="text-base font-medium text-gray-600">No daily wage workers registered</p>
                <p className="text-xs text-gray-400 mt-1">Try changing filters or register a new worker.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Worker Details</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills / Capabilities</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Wage & Exp</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                    <th className="px-6 py-3 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {workers.map(worker => (
                    <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{worker.fullName}</div>
                        <a href={`tel:${worker.phone}`} className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline mt-0.5">
                          <Phone size={11} /> {worker.phone}
                        </a>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-600">
                        <div className="font-medium text-gray-800">{worker.district} ({worker.province})</div>
                        <div className="text-gray-400 mt-0.5">{worker.dsDivision}, {worker.gnDivision}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {worker.skills?.map(s => (
                            <span key={s.skill.id} className="bg-emerald-50 text-emerald-800 text-[11px] px-2 py-0.5 rounded border border-emerald-100 font-medium">
                              {s.skill.nameSi || s.skill.name}
                            </span>
                          ))}
                          {(!worker.skills || worker.skills.length === 0) && <span className="text-xs text-gray-400">None</span>}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <div className="font-semibold text-gray-800">
                          {worker.expectedWage ? `Rs. ${worker.expectedWage}` : 'Negotiable'}
                        </div>
                        <div className="text-gray-400 mt-0.5">
                          {worker.experience ? `${worker.experience} yrs exp` : 'No exp stated'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {worker.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium border border-green-200">
                              <CheckCircle2 size={12} /> Approved
                            </span>
                          )}
                          {worker.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium border border-amber-200">
                              <Clock size={12} /> Pending Review
                            </span>
                          )}
                          {worker.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium border border-red-200">
                              <XCircle size={12} /> Rejected
                            </span>
                          )}

                          {worker.status === 'PENDING' && (
                            <div className="flex items-center gap-1 ml-1">
                              <button
                                onClick={() => handleWorkerStatusChange(worker.id, 'APPROVED')}
                                title="Approve Worker"
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleWorkerStatusChange(worker.id, 'REJECTED')}
                                title="Reject Worker"
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleWorkerActive(worker)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            worker.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {worker.isActive ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} />}
                          <span>{worker.isActive ? 'Active' : 'Hidden'}</span>
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openEditWorker(worker)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteWorker(worker)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {workersTotalPages >= 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination
                  currentPage={workersPage}
                  totalPages={workersTotalPages}
                  onPageChange={setWorkersPage}
                  totalItems={workersTotalItems}
                  pageSize={12}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: DAILY WAGE SKILLS */}
      {/* ======================================================== */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-base">Daily Wage Skills Master</h3>
              <p className="text-xs text-gray-500">Configure skill categories available for daily agricultural workers.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={skillsSearch}
                  onChange={e => { setSkillsSearch(e.target.value); setSkillsPage(1); }}
                  className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50 w-48"
                />
              </div>
              <button
                onClick={openCreateSkill}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus size={18} /> Add Skill
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoadingSkills ? (
              <div className="flex justify-center items-center py-20">
                <AgroLoader message="Loading skills..." />
              </div>
            ) : paginatedSkills.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Wrench className="mx-auto mb-2 opacity-50" size={32} />
                <p>No skills found. Click "Add Skill" to create one.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Skill (English)</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">කුසලතාවය (Sinhala)</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Display Order</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Workers Count</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                    <th className="px-6 py-3 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedSkills.map(skill => (
                    <tr key={skill.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">{skill.name}</td>
                      <td className="px-6 py-4 font-medium text-emerald-800">{skill.nameSi}</td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{skill.order}</td>
                      <td className="px-6 py-4 text-gray-500">
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {skill._count?.workers ?? 0} workers
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          skill.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {skill.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openEditSkill(skill)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {skillsTotalPages > 1 && (
              <div className="border-t border-gray-100">
                <Pagination
                  currentPage={skillsPage}
                  totalPages={skillsTotalPages}
                  onPageChange={setSkillsPage}
                  totalItems={filteredSkills.length}
                  pageSize={skillsPageSize}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD / EDIT JOB MODAL (WITH EVERY FIELD) */}
      {/* ======================================================== */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsJobModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1450px] relative z-10 shadow-2xl h-[94vh] max-h-[96vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {editingJobId ? 'Edit Job Posting' : 'Add New Job Post'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Complete all applicable fields including salary, eligibility, selection, and gazette documents
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsJobModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Section Navigation */}
            <div className="flex border-b border-gray-100 px-6 pt-2 bg-gray-50/50 gap-2 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setModalTab('basic')}
                className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === 'basic' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {isModalGov ? '1. General & Organization' : isModalPrivate ? '1. Company & Role' : '1. Agency & Program'}
              </button>
              {isModalGov && (
                <button
                  type="button"
                  onClick={() => setModalTab('salary')}
                  className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    modalTab === 'salary' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  2. Salary Details
                </button>
              )}
              <button
                type="button"
                onClick={() => setModalTab('eligibility')}
                className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === 'eligibility' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {isModalGov ? '3. Eligibility & Selection' : '2. Eligibility Criteria'}
              </button>
              <button
                type="button"
                onClick={() => setModalTab('application')}
                className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === 'application' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {isModalGov ? '4. Application & Gazette PDFs' : '3. How to Apply & Online Link'}
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveJob} className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* SECTION 1: BASIC & ORGANIZATION */}
              {modalTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation (Job Title - English) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Agriculture Instructor (Class III)"
                        value={jobForm.designation}
                        onChange={e => {
                          const val = e.target.value;
                          setJobForm(prev => ({
                            ...prev,
                            designation: val,
                            slug: (!isSlugCustomized || !prev.slug) ? generateSlug(val) : prev.slug
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        තනතුර (Sinhala Title - Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="උදා: කෘෂිකර්ම උපදේශක (III ශ්‍රේණිය)"
                        value={jobForm.designationSi}
                        onChange={e => setJobForm({ ...jobForm, designationSi: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                    </div>
                  </div>

                  {/* Slug Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        URL Slug <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const auto = generateSlug(jobForm.designation || jobForm.designationSi);
                          setJobForm(prev => ({ ...prev, slug: auto }));
                          setIsSlugCustomized(false);
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer hover:underline flex items-center gap-1"
                      >
                        ↻ Auto-generate from Title
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. agriculture-instructor-class-iii"
                      value={jobForm.slug}
                      onChange={e => {
                        setIsSlugCustomized(true);
                        setJobForm({ ...jobForm, slug: generateSlug(e.target.value) });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm font-mono bg-white"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Public Link: <span className="font-mono text-emerald-700">/careers/{jobForm.slug || 'job-slug'}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={jobForm.jobCategoryId}
                        onChange={e => setJobForm({ ...jobForm, jobCategoryId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white"
                      >
                        <option value="">Select Category...</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}{c.nameSi ? ` (${c.nameSi})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Closing / Expiry Date (අවසන් දිනය) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={jobForm.expiryDate}
                        onChange={e => setJobForm({ ...jobForm, expiryDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">
                        මෙම දිනය අවසන් වූ පසු රැකියා දැන්වීම ස්වයංක්‍රීයව පද්ධතිය මඟින් unpublish (අක්‍රිය) කෙරේ.
                      </p>
                    </div>
                  </div>

                  {/* Banner Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Banner Image / පෝස්ටරය (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-200 hover:border-emerald-500/50 rounded-xl p-4 transition-colors bg-gray-50/50">
                      {bannerImagePreview ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <img
                            src={bannerImagePreview.startsWith('http') || bannerImagePreview.startsWith('blob:') || bannerImagePreview.startsWith('/api') ? bannerImagePreview : `${API_BASE_URL.replace('/api', '')}${bannerImagePreview}`}
                            alt="Banner Preview"
                            className="w-full sm:w-48 h-28 object-cover rounded-lg border border-gray-200 shadow-xs"
                          />
                          <div className="flex-1 space-y-2 text-center sm:text-left">
                            <p className="text-xs text-gray-700 font-medium">
                              {bannerImageFile ? bannerImageFile.name : 'Current Banner Image'}
                            </p>
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                              <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors shadow-2xs">
                                <span>Change Image</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setBannerImageFile(file);
                                      setBannerImagePreview(URL.createObjectURL(file));
                                    }
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setBannerImageFile(null);
                                  setBannerImagePreview(null);
                                  setJobForm(prev => ({ ...prev, existingBannerImage: '' }));
                                }}
                                className="text-xs font-semibold px-3 py-1.5 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg text-red-600 transition-colors shadow-2xs cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-bold text-emerald-700 hover:underline">Click to upload banner image</span>
                            <span className="text-xs text-gray-500"> or drag and drop</span>
                            <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WEBP up to 5MB (16:9 or banner ratio recommended)</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setBannerImageFile(file);
                                setBannerImagePreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Fields for Private Job (Image 1) */}
                  {isModalPrivate && (
                    <div className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company / Holdings Name (English) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={isModalPrivate}
                            placeholder="e.g. Hayleys Agriculture Holdings Ltd"
                            value={jobForm.companyName}
                            onChange={e => setJobForm({ ...jobForm, companyName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            සමාගමේ නම (Sinhala - Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="උදා: හේලීස් ඇග්‍රිකල්චර් හෝල්ඩිංග්ස්"
                            value={jobForm.companyNameSi}
                            onChange={e => setJobForm({ ...jobForm, companyNameSi: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fields for Foreign Job (Image 2) */}
                  {isModalForeign && (
                    <div className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Foreign Agency / SLBFE Program (English) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={isModalForeign}
                            placeholder="e.g. SLBFE / Israel Agriculture Program"
                            value={jobForm.agency}
                            onChange={e => setJobForm({ ...jobForm, agency: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            විදේශ රැකියා නියෝජිතායතනය (Sinhala - Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="උදා: ශ්‍රී ලංකා විදේශ සේවා නියුක්ති කාර්යාංශය"
                            value={jobForm.agencySi}
                            onChange={e => setJobForm({ ...jobForm, agencySi: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country / Destination (English) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={isModalForeign}
                            placeholder="e.g. Israel / Japan / South Korea"
                            value={jobForm.country}
                            onChange={e => setJobForm({ ...jobForm, country: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            රට (Sinhala - Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="උදා: ඊශ්‍රායලය / ජපානය"
                            value={jobForm.countrySi}
                            onChange={e => setJobForm({ ...jobForm, countrySi: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fields for Government Job (Preserve all existing fields) */}
                  {isModalGov && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Ministry (Optional)
                          </label>
                          <select
                            value={jobForm.selectedMinistryId}
                            onChange={e => setJobForm({ ...jobForm, selectedMinistryId: e.target.value, institutionId: '' })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white"
                          >
                            <option value="">All Ministries</option>
                            {ministries.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name}{m.nameSi ? ` (${m.nameSi})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Institution / Department <span className="text-red-500">*</span>
                          </label>
                          <select
                            required={isModalGov}
                            value={jobForm.institutionId}
                            onChange={e => setJobForm({ ...jobForm, institutionId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white"
                          >
                            <option value="">Select Institution...</option>
                            {filteredModalInstitutions.map(inst => (
                              <option key={inst.id} value={inst.id}>
                                {inst.name}{inst.nameSi ? ` (${inst.nameSi})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Job Nature, Service Conditions & Recruitment Type Dropdowns */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                            තනතුරේ ස්වභාවය <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={
                              JOB_NATURE_OPTIONS.find(
                                o => o.en === jobForm.jobNature || o.label === jobForm.jobNature || o.si === jobForm.jobNatureSi
                              )?.en || jobForm.jobNature || 'Permanent'
                            }
                            onChange={e => {
                              const val = e.target.value;
                              const match = JOB_NATURE_OPTIONS.find(o => o.en === val);
                              setJobForm({
                                ...jobForm,
                                jobNature: val,
                                jobNatureSi: match ? match.si : val,
                              });
                            }}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white font-medium text-gray-800 shadow-sm cursor-pointer"
                          >
                            {JOB_NATURE_OPTIONS.map(opt => (
                              <option key={opt.en} value={opt.en}>
                                {opt.label}
                              </option>
                            ))}
                            {!JOB_NATURE_OPTIONS.some(o => o.en === jobForm.jobNature) && jobForm.jobNature && (
                              <option value={jobForm.jobNature}>{jobForm.jobNature}</option>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                            සේවා කොන්දේසි (Pensionable etc.) <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={
                              SERVICE_CONDITIONS_OPTIONS.find(
                                o => o.en === jobForm.serviceConditions || o.label === jobForm.serviceConditions || o.si === jobForm.serviceConditionsSi
                              )?.en || jobForm.serviceConditions || 'Pensionable'
                            }
                            onChange={e => {
                              const val = e.target.value;
                              const match = SERVICE_CONDITIONS_OPTIONS.find(o => o.en === val);
                              setJobForm({
                                ...jobForm,
                                serviceConditions: val,
                                serviceConditionsSi: match ? match.si : val,
                              });
                            }}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white font-medium text-gray-800 shadow-sm cursor-pointer"
                          >
                            {SERVICE_CONDITIONS_OPTIONS.map(opt => (
                              <option key={opt.en} value={opt.en}>
                                {opt.label}
                              </option>
                            ))}
                            {!SERVICE_CONDITIONS_OPTIONS.some(o => o.en === jobForm.serviceConditions) && jobForm.serviceConditions && (
                              <option value={jobForm.serviceConditions}>{jobForm.serviceConditions}</option>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                            බඳවා ගැනීමේ ක්‍රමය <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={
                              RECRUITMENT_TYPE_OPTIONS.find(
                                o => o.en === jobForm.recruitmentType || o.label === jobForm.recruitmentType || o.si === jobForm.recruitmentTypeSi
                              )?.en || jobForm.recruitmentType || 'Open'
                            }
                            onChange={e => {
                              const val = e.target.value;
                              const match = RECRUITMENT_TYPE_OPTIONS.find(o => o.en === val);
                              setJobForm({
                                ...jobForm,
                                recruitmentType: val,
                                recruitmentTypeSi: match ? match.si : val,
                              });
                            }}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white font-medium text-gray-800 shadow-sm cursor-pointer"
                          >
                            {RECRUITMENT_TYPE_OPTIONS.map(opt => (
                              <option key={opt.en} value={opt.en}>
                                {opt.label}
                              </option>
                            ))}
                            {!RECRUITMENT_TYPE_OPTIONS.some(o => o.en === jobForm.recruitmentType) && jobForm.recruitmentType && (
                              <option value={jobForm.recruitmentType}>{jobForm.recruitmentType}</option>
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Service Category */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Service Category (English)</label>
                          <input
                            type="text"
                            placeholder="e.g. Technological Service"
                            value={jobForm.serviceCategory}
                            onChange={e => setJobForm({ ...jobForm, serviceCategory: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">සේවා ගණය (Sinhala - Optional)</label>
                          <input
                            type="text"
                            placeholder="උදා: තාක්ෂණික සේවය"
                            value={jobForm.serviceCategorySi}
                            onChange={e => setJobForm({ ...jobForm, serviceCategorySi: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Job Nature for Private/Foreign */}
                  {!isModalGov && (
                    <div className="pt-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Nature / Employment Type</label>
                      <select
                        value={jobForm.jobNature || 'Full-Time'}
                        onChange={e => setJobForm({ ...jobForm, jobNature: e.target.value, jobNatureSi: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white"
                      >
                        <option value="Full-Time">Full-Time (පූර්ණ කාලීන)</option>
                        <option value="Contract">Contract (කොන්ත්‍රාත්)</option>
                        <option value="Permanent">Permanent (ස්ථීර)</option>
                        <option value="Part-Time">Part-Time (අර්ධ කාලීන)</option>
                      </select>
                    </div>
                  )}

                  {/* Status & Visibility Row */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setJobForm({ ...jobForm, isActive: !jobForm.isActive })}
                        className="cursor-pointer"
                      >
                        {jobForm.isActive ? (
                          <ToggleRight size={28} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={28} className="text-gray-300 hover:text-gray-400" />
                        )}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {jobForm.isActive ? 'Active (Publicly Visible)' : 'Inactive (Hidden)'}
                        </div>
                        <div className="text-xs text-gray-400">Controls visibility on the public careers page.</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-gray-700">Approval State:</label>
                      <select
                        value={jobForm.approvalStatus}
                        onChange={e => setJobForm({ ...jobForm, approvalStatus: e.target.value as any })}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      >
                        <option value="APPROVED">APPROVED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: SALARY DETAILS */}
              {modalTab === 'salary' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Code</label>
                    <input
                      type="text"
                      placeholder="e.g. MN-1-2016"
                      value={jobForm.salaryCode}
                      onChange={e => setJobForm({ ...jobForm, salaryCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Rs. 31,040"
                        value={jobForm.basicSalary}
                        onChange={e => setJobForm({ ...jobForm, basicSalary: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">මූලික වැටුප (Sinhala - Optional)</label>
                      <input
                        type="text"
                        placeholder="උදා: රු. 31,040"
                        value={jobForm.basicSalarySi}
                        onChange={e => setJobForm({ ...jobForm, basicSalarySi: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salary Scale (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Rs. 31,040 - 10x445 - 11x660 - 50,060"
                        value={jobForm.salaryScale}
                        onChange={e => setJobForm({ ...jobForm, salaryScale: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">වැටුප් පරිමාණය (Sinhala - Optional)</label>
                      <input
                        type="text"
                        placeholder="උදා: රු. 31,040 - 10x445 - 11x660 - 50,060"
                        value={jobForm.salaryScaleSi}
                        onChange={e => setJobForm({ ...jobForm, salaryScaleSi: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Allowances (English)</label>
                      <RichTextEditor
                        value={jobForm.allowances}
                        onChange={val => setJobForm({ ...jobForm, allowances: val })}
                        placeholder="e.g. Cost of Living Allowance, Transport..."
                        minHeight="120px"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">දීමනා (Sinhala - Optional)</label>
                      <RichTextEditor
                        value={jobForm.allowancesSi}
                        onChange={val => setJobForm({ ...jobForm, allowancesSi: val })}
                        placeholder="උදා: ජීවන වියදම් දීමනාව සහ අනෙකුත් රජයේ දීමනා..."
                        minHeight="120px"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Public Display String (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Rs. 31,040 - 50,060 + Allowances"
                        value={jobForm.salaryDisplay}
                        onChange={e => setJobForm({ ...jobForm, salaryDisplay: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ප්‍රදර්ශනය වන වැටුප (Sinhala - Optional)</label>
                      <input
                        type="text"
                        placeholder="උදා: රු. 31,040 - 50,060 + දීමනා"
                        value={jobForm.salaryDisplaySi}
                        onChange={e => setJobForm({ ...jobForm, salaryDisplaySi: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: ELIGIBILITY & SELECTION */}
              {modalTab === 'eligibility' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age Limit (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Not less than 21 and not more than 35 years"
                        value={jobForm.ageLimit}
                        onChange={e => setJobForm({ ...jobForm, ageLimit: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">වයස් සීමාව (Sinhala - Optional)</label>
                      <input
                        type="text"
                        placeholder="උදා: අවුරුදු 21ට නොඅඩු සහ 35ට නොවැඩි විය යුතුය"
                        value={jobForm.ageLimitSi}
                        onChange={e => setJobForm({ ...jobForm, ageLimitSi: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age Relaxation (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Upper age limit does not apply to officers in Public Service"
                        value={jobForm.ageRelaxation}
                        onChange={e => setJobForm({ ...jobForm, ageRelaxation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">වයස් ලිහිල් කිරීම (Sinhala - Optional)</label>
                      <input
                        type="text"
                        placeholder="උදා: රාජ්‍ය සේවයේ නිලධාරීන්ට උපරිම වයස් සීමාව අදාළ නොවේ"
                        value={jobForm.ageRelaxationSi}
                        onChange={e => setJobForm({ ...jobForm, ageRelaxationSi: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications (English)</label>
                      <RichTextEditor
                        value={jobForm.qualifications}
                        onChange={val => setJobForm({ ...jobForm, qualifications: val })}
                        placeholder="e.g. NVQ Level 5 or Higher National Diploma in Agriculture..."
                        minHeight="150px"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">අධ්‍යාපනික හා වෘත්තීය සුදුසුකම් (Sinhala - Optional)</label>
                      <RichTextEditor
                        value={jobForm.qualificationsSi}
                        onChange={val => setJobForm({ ...jobForm, qualificationsSi: val })}
                        placeholder="උදා: NVQ 5 මට්ටම හෝ කෘෂිකර්ම උසස් ජාතික ඩිප්ලෝමාව..."
                        minHeight="150px"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Basic Experience & Citizenship (English)</label>
                      <RichTextEditor
                        value={jobForm.basicExperience}
                        onChange={val => setJobForm({ ...jobForm, basicExperience: val })}
                        placeholder="e.g. Should be a citizen of Sri Lanka with excellent moral character..."
                        minHeight="130px"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">මූලික පළපුරුද්ද හා පුරවැසිභාවය (Sinhala - Optional)</label>
                      <RichTextEditor
                        value={jobForm.basicExperienceSi}
                        onChange={val => setJobForm({ ...jobForm, basicExperienceSi: val })}
                        placeholder="උදා: ශ්‍රී ලංකාවේ පුරවැසියෙකු විය යුතු අතර යහපත් චරිතයකින් යුක්ත විය යුතුය..."
                        minHeight="130px"
                      />
                    </div>
                  </div>

                  {isModalGov && (
                    <div className="border-t border-gray-100 pt-3">
                      <h3 className="text-sm font-bold text-gray-800 mb-2">Selection Procedure</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Selection Method (English)</label>
                            <input
                              type="text"
                              placeholder="e.g. Written Competitive Examination & General Interview"
                              value={jobForm.selectionMethod}
                              onChange={e => setJobForm({ ...jobForm, selectionMethod: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">තෝරා ගැනීමේ ක්‍රමවේදය (Sinhala - Optional)</label>
                            <input
                              type="text"
                              placeholder="උදා: ලිඛිත තරඟ විභාගය සහ සාමාන්‍ය සම්මුඛ පරීක්ෂණය"
                              value={jobForm.selectionMethodSi}
                              onChange={e => setJobForm({ ...jobForm, selectionMethodSi: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Examination Details (English)</label>
                            <RichTextEditor
                              value={jobForm.examDetails}
                              onChange={val => setJobForm({ ...jobForm, examDetails: val })}
                              placeholder="e.g. Subject Knowledge (100 Marks), Aptitude (100 Marks)..."
                              minHeight="130px"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">විභාග විස්තර (Sinhala - Optional)</label>
                            <RichTextEditor
                              value={jobForm.examDetailsSi}
                              onChange={val => setJobForm({ ...jobForm, examDetailsSi: val })}
                              placeholder="උදා: විෂය දැනුම (ලකුණු 100), අභියෝග්‍යතාව (ලකුණු 100)..."
                              minHeight="130px"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 4: APPLICATION & GAZETTE WITH PDF UPLOADS */}
              {modalTab === 'application' && (
                <div className="space-y-4">
                  {/* Direct Online Application Link (URL / applyLink) - For ALL Job Categories */}
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                    <label className="block text-sm font-semibold text-emerald-950 mb-1 flex items-center gap-2">
                      <ExternalLink size={16} className="text-emerald-700" />
                      <span>Online Application Link (Direct URL - Apply Link)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://agrimin.gov.lk/apply or https://forms.gle/... or https://company.com/jobs/123"
                      value={jobForm.applyLink}
                      onChange={e => setJobForm({ ...jobForm, applyLink: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-emerald-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-mono text-emerald-950 placeholder:font-sans placeholder:text-gray-400"
                    />
                    <p className="text-xs text-emerald-800 mt-1">
                      අයදුම්කරුවන්ට සෘජුවම අන්තර්ජාලය ඔස්සේ අයදුම් කළ හැකි නම් (Company Portal, Google Forms, Web link), එම සබැඳිය මෙහි ඇතුළත් කරන්න.
                    </p>
                  </div>

                  {isModalGov ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gazette Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 2,374"
                            value={jobForm.gazetteNo}
                            onChange={e => setJobForm({ ...jobForm, gazetteNo: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gazette Date</label>
                          <input
                            type="date"
                            value={jobForm.gazetteDate}
                            onChange={e => setJobForm({ ...jobForm, gazetteDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Fee (English)</label>
                          <input
                            type="text"
                            placeholder="e.g. Rs. 600"
                            value={jobForm.examFee}
                            onChange={e => setJobForm({ ...jobForm, examFee: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">විභාග ගාස්තුව (Sinhala - Optional)</label>
                          <input
                            type="text"
                            placeholder="උදා: රු. 600"
                            value={jobForm.examFeeSi}
                            onChange={e => setJobForm({ ...jobForm, examFeeSi: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                      </div>

                      {/* PDF Upload Cards (English & Sinhala) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* English Gazette PDF */}
                        <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50">
                          <div className="flex items-center gap-2 mb-2 font-medium text-xs text-gray-700">
                            <FileText size={15} className="text-green-600" />
                            <span>Gazette PDF Document (English)</span>
                          </div>
                          <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-lg cursor-pointer hover:bg-gray-50 text-xs text-gray-600">
                            <span className="truncate">{gazetteFile ? gazetteFile.name : 'Choose English Gazette PDF...'}</span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              className="hidden"
                              onChange={e => setGazetteFile(e.target.files?.[0] || null)}
                            />
                          </label>
                          {gazetteFile && (
                            <p className="mt-1.5 text-xs text-green-700 font-medium">
                              Selected: {gazetteFile.name} ({(gazetteFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                          {jobForm.existingGazetteUrl && !gazetteFile && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
                              <ExternalLink size={13} />
                              <a href={jobForm.existingGazetteUrl} target="_blank" rel="noreferrer" className="underline font-medium">
                                View Existing English Gazette
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Sinhala Gazette PDF */}
                        <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50">
                          <div className="flex items-center gap-2 mb-2 font-medium text-xs text-gray-700">
                            <FileText size={15} className="text-emerald-700" />
                            <span>ගැසට් පත්‍රය PDF (සිංහල - Optional)</span>
                          </div>
                          <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-lg cursor-pointer hover:bg-gray-50 text-xs text-gray-600">
                            <span className="truncate">{gazetteFileSi ? gazetteFileSi.name : 'සිංහල ගැසට් පත්‍රය තෝරන්න...'}</span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              className="hidden"
                              onChange={e => setGazetteFileSi(e.target.files?.[0] || null)}
                            />
                          </label>
                          {gazetteFileSi && (
                            <p className="mt-1.5 text-xs text-green-700 font-medium">
                              Selected: {gazetteFileSi.name} ({(gazetteFileSi.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                          {jobForm.existingGazetteUrlSi && !gazetteFileSi && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
                              <ExternalLink size={13} />
                              <a href={jobForm.existingGazetteUrlSi} target="_blank" rel="noreferrer" className="underline font-medium">
                                දැනට පවතින සිංහල ගැසට් පත්‍රය බලන්න
                              </a>
                            </div>
                          )}
                        </div>

                        {/* English Specimen Application PDF */}
                        <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50">
                          <div className="flex items-center gap-2 mb-2 font-medium text-xs text-gray-700">
                            <Download size={15} className="text-blue-600" />
                            <span>Specimen Application Form PDF (English)</span>
                          </div>
                          <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-lg cursor-pointer hover:bg-gray-50 text-xs text-gray-600">
                            <span className="truncate">{specimenAppFile ? specimenAppFile.name : 'Choose English Application PDF...'}</span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              className="hidden"
                              onChange={e => setSpecimenAppFile(e.target.files?.[0] || null)}
                            />
                          </label>
                          {specimenAppFile && (
                            <p className="mt-1.5 text-xs text-green-700 font-medium">
                              Selected: {specimenAppFile.name} ({(specimenAppFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                          {jobForm.existingSpecimenAppUrl && !specimenAppFile && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
                              <ExternalLink size={13} />
                              <a href={jobForm.existingSpecimenAppUrl} target="_blank" rel="noreferrer" className="underline font-medium">
                                View Existing English Form
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Sinhala Specimen Application PDF */}
                        <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50">
                          <div className="flex items-center gap-2 mb-2 font-medium text-xs text-gray-700">
                            <Download size={15} className="text-blue-700" />
                            <span>ආදර්ශ අයදුම්පත්‍රය PDF (සිංහල - Optional)</span>
                          </div>
                          <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-lg cursor-pointer hover:bg-gray-50 text-xs text-gray-600">
                            <span className="truncate">{specimenAppFileSi ? specimenAppFileSi.name : 'සිංහල ආදර්ශ අයදුම්පත්‍රය තෝරන්න...'}</span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              className="hidden"
                              onChange={e => setSpecimenAppFileSi(e.target.files?.[0] || null)}
                            />
                          </label>
                          {specimenAppFileSi && (
                            <p className="mt-1.5 text-xs text-green-700 font-medium">
                              Selected: {specimenAppFileSi.name} ({(specimenAppFileSi.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                          {jobForm.existingSpecimenAppUrlSi && !specimenAppFileSi && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
                              <ExternalLink size={13} />
                              <a href={jobForm.existingSpecimenAppUrlSi} target="_blank" rel="noreferrer" className="underline font-medium">
                                දැනට පවතින සිංහල අයදුම්පත්‍රය බලන්න
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Address for Submission (English)</label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Director General, Department of Agriculture, P.O. Box 01, Peradeniya"
                            value={jobForm.postalAddress}
                            onChange={e => setJobForm({ ...jobForm, postalAddress: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ලිපිනය (Sinhala - Optional)</label>
                          <textarea
                            rows={2}
                            placeholder="උදා: කෘෂිකර්ම අධ්‍යක්ෂ ජනරාල්, කෘෂිකර්ම දෙපාර්තමේන්තුව, තැ.පෙ. 01, පේරාදෙණිය"
                            value={jobForm.postalAddressSi}
                            onChange={e => setJobForm({ ...jobForm, postalAddressSi: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Envelope Marking (English)</label>
                          <RichTextEditor
                            value={jobForm.envelopeMarking}
                            onChange={val => setJobForm({ ...jobForm, envelopeMarking: val })}
                            placeholder="e.g. Recruitment to the post of Agriculture Instructor - 2026..."
                            minHeight="120px"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">කවරයේ වම්පස ඉහළ සටහන (Sinhala - Optional)</label>
                          <RichTextEditor
                            value={jobForm.envelopeMarkingSi}
                            onChange={val => setJobForm({ ...jobForm, envelopeMarkingSi: val })}
                            placeholder="උදා: කෘෂිකර්ම උපදේශක තනතුරට බඳවා ගැනීම - 2026..."
                            minHeight="120px"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Submission Details (English)</label>
                          <RichTextEditor
                            value={jobForm.submissionDetails}
                            onChange={val => setJobForm({ ...jobForm, submissionDetails: val })}
                            placeholder="e.g. Applications must be sent under registered cover on or before the closing date..."
                            minHeight="140px"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ඉදිරිපත් කිරීමේ උපදෙස් (Sinhala - Optional)</label>
                          <RichTextEditor
                            value={jobForm.submissionDetailsSi}
                            onChange={val => setJobForm({ ...jobForm, submissionDetailsSi: val })}
                            placeholder="උදා: සම්පූර්ණ කරන ලද අයදුම්පත් ලියාපදිංචි තැපෑලෙන් අවසන් දිනට පෙර එවිය යුතුය..."
                            minHeight="140px"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Private / Foreign How To Apply & Submission Details */
                    <div className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">How to Apply / Submission Details (English)</label>
                          <RichTextEditor
                            value={jobForm.submissionDetails}
                            onChange={val => setJobForm({ ...jobForm, submissionDetails: val })}
                            placeholder="e.g. Interested candidates may apply by forwarding their detailed CV with contact details to careers@company.com or via the application link below on or before the closing date..."
                            minHeight="160px"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">අයදුම් කළ යුතු ආකාරය (Sinhala - Optional)</label>
                          <RichTextEditor
                            value={jobForm.submissionDetailsSi}
                            onChange={val => setJobForm({ ...jobForm, submissionDetailsSi: val })}
                            placeholder="උදා: උනන්දුවක් දක්වන අපේක්ෂකයින් තම ජීව දත්ත පත්‍රය careers@company.com වෙත හෝ පහත සබැඳිය ඔස්සේ අවසන් දිනට පෙර යොමු කළ යුතුය..."
                            minHeight="160px"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address / Contact Info (English - Optional)</label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Head Office, No. 55, Colombo Road, Negombo"
                            value={jobForm.postalAddress}
                            onChange={e => setJobForm({ ...jobForm, postalAddress: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ලිපිනය / සම්බන්ධතා තොරතුරු (Sinhala - Optional)</label>
                          <textarea
                            rows={2}
                            placeholder="උදා: ප්‍රධාන කාර්යාලය, අංක 55, කොළඹ පාර, මීගමුව"
                            value={jobForm.postalAddressSi}
                            onChange={e => setJobForm({ ...jobForm, postalAddressSi: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  {modalTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (modalTab === 'application') setModalTab('eligibility');
                        else if (modalTab === 'eligibility') setModalTab(isModalGov ? 'salary' : 'basic');
                        else if (modalTab === 'salary') setModalTab('basic');
                      }}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      ← Previous
                    </button>
                  )}
                  {modalTab !== 'application' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (modalTab === 'basic') setModalTab(isModalGov ? 'salary' : 'eligibility');
                        else if (modalTab === 'salary') setModalTab('eligibility');
                        else if (modalTab === 'eligibility') setModalTab('application');
                      }}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Next →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsJobModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingJob}
                    className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSavingJob ? 'Saving...' : editingJobId ? 'Update Job' : 'Publish Job'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW DETAILS MODAL */}
      {/* ======================================================== */}
      {viewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingJob(null)} />
          <div className="bg-white rounded-2xl w-full max-w-5xl xl:max-w-6xl relative z-10 shadow-2xl max-h-[92vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    {viewingJob.jobCategory?.name || 'Job Post'}
                  </span>
                  {viewingJob.jobCategory?.nameSi && (
                    <span className="text-xs font-medium text-green-800 bg-green-100/70 px-2 py-0.5 rounded">
                      {viewingJob.jobCategory.nameSi}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-800 mt-2">{viewingJob.designation}</h2>
                {viewingJob.designationSi && (
                  <h3 className="text-base font-semibold text-emerald-800 mt-0.5">{viewingJob.designationSi}</h3>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {viewingJob.institution?.name} {viewingJob.institution?.nameSi ? `(${viewingJob.institution.nameSi})` : ''} 
                  {viewingJob.institution?.ministry ? ` • ${viewingJob.institution.ministry.name}` : ''}
                </p>
              </div>
              <button onClick={() => setViewingJob(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Banner Image Preview */}
            {viewingJob.bannerImage && (
              <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-xs">
                <img
                  src={viewingJob.bannerImage.startsWith('http') || viewingJob.bannerImage.startsWith('/api') ? viewingJob.bannerImage : `${API_BASE_URL.replace('/api', '')}${viewingJob.bannerImage}`}
                  alt={viewingJob.designation}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-gray-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-gray-400">Nature:</span> 
                <div className="font-semibold text-gray-700">
                  {JOB_NATURE_OPTIONS.find(o => o.en === viewingJob.jobNature || o.si === viewingJob.jobNatureSi)?.label || viewingJob.jobNature || '—'}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Conditions:</span> 
                <div className="font-semibold text-gray-700">
                  {SERVICE_CONDITIONS_OPTIONS.find(o => o.en === viewingJob.serviceConditions || o.si === viewingJob.serviceConditionsSi)?.label || viewingJob.serviceConditions || '—'}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Recruitment:</span> 
                <div className="font-semibold text-gray-700">
                  {RECRUITMENT_TYPE_OPTIONS.find(o => o.en === viewingJob.recruitmentType || o.si === viewingJob.recruitmentTypeSi)?.label || viewingJob.recruitmentType || '—'}
                </div>
              </div>
              <div><span className="text-gray-400">Closing Date:</span> <div className="font-semibold text-gray-700">{new Date(viewingJob.expiryDate).toLocaleDateString()}</div></div>
              <div><span className="text-gray-400">Approval:</span> <div className="font-semibold text-gray-700">{viewingJob.approvalStatus}</div></div>
            </div>

            {/* Salary */}
            {viewingJob.salaryDetails && (
              <div className="border border-gray-100 rounded-xl p-4 space-y-1.5 bg-gray-50/50">
                <h4 className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5">
                  <DollarSign size={14} className="text-green-600" /> Salary Information
                </h4>
                <p className="text-sm font-semibold text-gray-800">
                  {viewingJob.salaryDetails.salaryDisplay || viewingJob.salaryDetails.basicSalary || 'Not specified'}
                </p>
                {viewingJob.salaryDetails.salaryDisplaySi && (
                  <p className="text-xs font-medium text-emerald-800">{viewingJob.salaryDetails.salaryDisplaySi}</p>
                )}
                {viewingJob.salaryDetails.salaryScale && <p className="text-xs text-gray-600">Scale (EN): {viewingJob.salaryDetails.salaryScale}</p>}
                {viewingJob.salaryDetails.salaryScaleSi && <p className="text-xs text-gray-600">පරිමාණය (SI): {viewingJob.salaryDetails.salaryScaleSi}</p>}
                {viewingJob.salaryDetails.allowances && (
                  <div>
                    <span className="font-semibold text-gray-700 block mb-1">Allowances (English):</span>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-white p-3 rounded-lg border border-gray-200 rich-content" dangerouslySetInnerHTML={{ __html: viewingJob.salaryDetails.allowances }} />
                  </div>
                )}
                {viewingJob.salaryDetails.allowancesSi && (
                  <div>
                    <span className="font-semibold text-emerald-800 block mb-1">දීමනා (Sinhala):</span>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-white p-3 rounded-lg border border-gray-200 rich-content" dangerouslySetInnerHTML={{ __html: viewingJob.salaryDetails.allowancesSi }} />
                  </div>
                )}
              </div>
            )}

            {/* Eligibility */}
            {viewingJob.eligibility && (
              <div className="border border-gray-100 rounded-xl p-4 space-y-4 bg-gray-50/50 text-xs">
                <h4 className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-green-600" /> Eligibility Criteria
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingJob.eligibility.ageLimit && <p><span className="font-semibold text-gray-700">Age Limit:</span> {viewingJob.eligibility.ageLimit}</p>}
                  {viewingJob.eligibility.ageLimitSi && <p><span className="font-semibold text-emerald-800">වයස් සීමාව:</span> {viewingJob.eligibility.ageLimitSi}</p>}
                  {viewingJob.eligibility.ageRelaxation && <p><span className="font-semibold text-gray-700">Age Relaxation:</span> {viewingJob.eligibility.ageRelaxation}</p>}
                  {viewingJob.eligibility.ageRelaxationSi && <p><span className="font-semibold text-emerald-800">වයස් ලිහිල් කිරීම:</span> {viewingJob.eligibility.ageRelaxationSi}</p>}
                </div>

                {viewingJob.eligibility.qualifications && (
                  <div>
                    <span className="font-semibold text-gray-700 block mb-1">Qualifications (English):</span>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-white p-3 rounded-lg border border-gray-200 rich-content" dangerouslySetInnerHTML={{ __html: viewingJob.eligibility.qualifications }} />
                  </div>
                )}
                {viewingJob.eligibility.qualificationsSi && (
                  <div>
                    <span className="font-semibold text-emerald-800 block mb-1">අධ්‍යාපනික හා වෘත්තීය සුදුසුකම් (Sinhala):</span>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-white p-3 rounded-lg border border-gray-200 rich-content" dangerouslySetInnerHTML={{ __html: viewingJob.eligibility.qualificationsSi }} />
                  </div>
                )}
                {viewingJob.eligibility.basicExperience && (
                  <div>
                    <span className="font-semibold text-gray-700 block mb-1">Basic Experience & Citizenship (English):</span>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-white p-3 rounded-lg border border-gray-200 rich-content" dangerouslySetInnerHTML={{ __html: viewingJob.eligibility.basicExperience }} />
                  </div>
                )}
                {viewingJob.eligibility.basicExperienceSi && (
                  <div>
                    <span className="font-semibold text-emerald-800 block mb-1">මූලික පළපුරුද්ද හා පුරවැසිභාවය (Sinhala):</span>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-white p-3 rounded-lg border border-gray-200 rich-content" dangerouslySetInnerHTML={{ __html: viewingJob.eligibility.basicExperienceSi }} />
                  </div>
                )}
              </div>
            )}

            {/* Selection Procedure */}
            {viewingJob.selectionProcedure && (
              <div className="border border-gray-100 rounded-xl p-4 space-y-4 bg-gray-50/50 text-xs">
                <h4 className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-600" /> Selection Procedure
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingJob.selectionProcedure.method && <p><span className="font-semibold text-gray-700">Method (EN):</span> {viewingJob.selectionProcedure.method}</p>}
                  {viewingJob.selectionProcedure.methodSi && <p><span className="font-semibold text-emerald-800">ක්‍රමවේදය (SI):</span> {viewingJob.selectionProcedure.methodSi}</p>}
                </div>
                {viewingJob.selectionProcedure.examDetails && (
                  <div>
                    <span className="font-semibold text-gray-700 block mb-1">Examination Details (English):</span>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-white p-3 rounded-lg border border-gray-200 rich-content" dangerouslySetInnerHTML={{ __html: viewingJob.selectionProcedure.examDetails }} />
                  </div>
                )}
                {viewingJob.selectionProcedure.examDetailsSi && (
                  <div>
                    <span className="font-semibold text-emerald-800 block mb-1">විභාග විස්තර (Sinhala):</span>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-white p-3 rounded-lg border border-gray-200 rich-content" dangerouslySetInnerHTML={{ __html: viewingJob.selectionProcedure.examDetailsSi }} />
                  </div>
                )}
              </div>
            )}

            {/* Application Info & Downloads */}
            {viewingJob.applicationInfo && (
              <div className="border border-gray-100 rounded-xl p-4 space-y-4 bg-gray-50/50 text-xs">
                <h4 className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5">
                  <FileText size={14} className="text-green-600" /> Application & Gazette Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingJob.applicationInfo.gazetteNo && <p><span className="font-semibold text-gray-700">Gazette No:</span> {viewingJob.applicationInfo.gazetteNo}</p>}
                  {viewingJob.applicationInfo.gazetteDate && <p><span className="font-semibold text-gray-700">Gazette Date:</span> {new Date(viewingJob.applicationInfo.gazetteDate).toLocaleDateString()}</p>}
                  {viewingJob.applicationInfo.examFee && <p><span className="font-semibold text-gray-700">Exam Fee (EN):</span> {viewingJob.applicationInfo.examFee}</p>}
                  {viewingJob.applicationInfo.examFeeSi && <p><span className="font-semibold text-emerald-800">විභාග ගාස්තුව (SI):</span> {viewingJob.applicationInfo.examFeeSi}</p>}
                  {viewingJob.applicationInfo.postalAddress && <p><span className="font-semibold text-gray-700">Send To (EN):</span> {viewingJob.applicationInfo.postalAddress}</p>}
                  {viewingJob.applicationInfo.postalAddressSi && <p><span className="font-semibold text-emerald-800">ලිපිනය (SI):</span> {viewingJob.applicationInfo.postalAddressSi}</p>}
                </div>

                {viewingJob.applicationInfo.envelopeMarking && (
                  <div>
                    <span className="font-semibold text-gray-700 block mb-1">Envelope Marking (English):</span>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-white p-3 rounded-lg border border-gray-200 rich-content" dangerouslySetInnerHTML={{ __html: viewingJob.applicationInfo.envelopeMarking }} />
                  </div>
                )}
                {viewingJob.applicationInfo.envelopeMarkingSi && (
                  <div>
                    <span className="font-semibold text-emerald-800 block mb-1">කවරයේ සටහන (Sinhala):</span>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-white p-3 rounded-lg border border-gray-200 rich-content" dangerouslySetInnerHTML={{ __html: viewingJob.applicationInfo.envelopeMarkingSi }} />
                  </div>
                )}

                {viewingJob.applicationInfo.submissionDetails && (
                  <div>
                    <span className="font-semibold text-gray-700 block mb-1">Submission Details (English):</span>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-white p-3 rounded-lg border border-gray-200 rich-content" dangerouslySetInnerHTML={{ __html: viewingJob.applicationInfo.submissionDetails }} />
                  </div>
                )}
                {viewingJob.applicationInfo.submissionDetailsSi && (
                  <div>
                    <span className="font-semibold text-emerald-800 block mb-1">ඉදිරිපත් කිරීමේ විස්තර (Sinhala):</span>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-white p-3 rounded-lg border border-gray-200 rich-content" dangerouslySetInnerHTML={{ __html: viewingJob.applicationInfo.submissionDetailsSi }} />
                  </div>
                )}

                {/* PDF Download Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200/60">
                  {viewingJob.applicationInfo.gazetteUrl && (
                    <a
                      href={viewingJob.applicationInfo.gazetteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <Download size={14} /> English Gazette PDF
                    </a>
                  )}
                  {viewingJob.applicationInfo.gazetteUrlSi && (
                    <a
                      href={viewingJob.applicationInfo.gazetteUrlSi}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-800 transition-colors"
                    >
                      <Download size={14} /> ගැසට් පත්‍රය (සිංහල)
                    </a>
                  )}
                  {viewingJob.applicationInfo.specimenAppUrl && (
                    <a
                      href={viewingJob.applicationInfo.specimenAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Download size={14} /> English Specimen Form
                    </a>
                  )}
                  {viewingJob.applicationInfo.specimenAppUrlSi && (
                    <a
                      href={viewingJob.applicationInfo.specimenAppUrlSi}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-800 transition-colors"
                    >
                      <Download size={14} /> ආදර්ශ අයදුම්පත්‍රය (සිංහල)
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingJob(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CATEGORY MODAL */}
      {/* ======================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-800">{editingCategoryId ? 'Edit Category' : 'New Job Category'}</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Government Jobs"
                  value={categoryName}
                  onChange={e => {
                    const val = e.target.value;
                    setCategoryName(val);
                    if (!isCategorySlugCustomized) {
                      setCategorySlug(generateSlug(val));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Category URL Slug *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setCategorySlug(generateSlug(categoryName));
                      setIsCategorySlugCustomized(false);
                    }}
                    className="text-xs text-green-700 hover:text-green-800 font-medium hover:underline cursor-pointer"
                  >
                    ↻ Auto-generate
                  </button>
                </div>
                <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-green-500/50 bg-gray-50">
                  <span className="px-3 py-2 text-xs text-gray-400 bg-gray-100 border-r border-gray-200 select-none">
                    /careers/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. government-jobs"
                    value={categorySlug}
                    onChange={e => {
                      setCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      setIsCategorySlugCustomized(true);
                    }}
                    className="w-full px-3 py-2 bg-transparent text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name (සිංහල - Optional)</label>
                <input
                  type="text"
                  placeholder="උදා: රජයේ ගැසට් රැකියා"
                  value={categoryNameSi}
                  onChange={e => setCategoryNameSi(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Card Image (රූපය)</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer text-xs text-gray-700 font-medium">
                    <span>📷 {categoryImageFile ? categoryImageFile.name : 'Upload Image File...'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        setCategoryImageFile(file);
                        if (file) {
                          setCategoryImage(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Or paste direct image URL (e.g. https://...)"
                    value={categoryImageFile ? '' : categoryImage}
                    onChange={e => {
                      setCategoryImageFile(null);
                      setCategoryImage(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-xs"
                  />
                  {categoryImage && (
                    <div className="relative mt-2 w-full h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={categoryImage.startsWith('http') || categoryImage.startsWith('blob:') || categoryImage.startsWith('/api') ? categoryImage : `${API_BASE_URL.replace('/api', '')}${categoryImage}`}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => { setCategoryImage(''); setCategoryImageFile(null); }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-700 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MINISTRY MODAL */}
      {/* ======================================================== */}
      {isMinistryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMinistryModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-800">{editingMinistryId ? 'Edit Ministry' : 'New Ministry'}</h3>
              <button onClick={() => setIsMinistryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveMinistry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ministry Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ministry of Agriculture"
                  value={ministryName}
                  onChange={e => setMinistryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ministry Name (සිංහල - Optional)</label>
                <input
                  type="text"
                  placeholder="උදා: කෘෂිකර්ම අමාත්‍යාංශය"
                  value={ministryNameSi}
                  onChange={e => setMinistryNameSi(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsMinistryModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INSTITUTION MODAL */}
      {/* ======================================================== */}
      {isInstitutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsInstitutionModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-800">{editingInstitutionId ? 'Edit Institution' : 'New Institution'}</h3>
              <button onClick={() => setIsInstitutionModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveInstitution} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Department of Agriculture"
                  value={institutionName}
                  onChange={e => setInstitutionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name (සිංහල - Optional)</label>
                <input
                  type="text"
                  placeholder="උදා: කෘෂිකර්ම දෙපාර්තමේන්තුව"
                  value={institutionNameSi}
                  onChange={e => setInstitutionNameSi(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Governing Ministry (Optional)</label>
                <select
                  value={institutionMinistryId}
                  onChange={e => setInstitutionMinistryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white"
                >
                  <option value="">No Ministry / Independent</option>
                  {ministries.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}{m.nameSi ? ` (${m.nameSi})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsInstitutionModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DAILY WAGE WORKER MODAL (ADD / EDIT) */}
      {/* ======================================================== */}
      {isWorkerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsWorkerModalOpen(false)} />
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl relative z-10 shadow-xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-50 text-green-700 rounded-xl">
                  <UserCheck size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {editingWorkerId ? 'Edit Daily Wage Worker' : 'Register Daily Wage Worker'}
                  </h3>
                  <p className="text-xs text-gray-500">දෛනික කෘෂි ශ්‍රමික තොරතුරු සහ කුසලතා ඇතුළත් කිරීම</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWorkerModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="space-y-4 pt-4 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name (සම්පූර්ණ නම) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. කේ. එම්. සුනිල් ශාන්ත"
                    value={workerForm.fullName}
                    onChange={e => setWorkerForm({ ...workerForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number (දුරකථන අංකය) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="07X XXXXXXX"
                    value={workerForm.phone}
                    onChange={e => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                  />
                </div>
              </div>

              {/* Location Cascade: Province, District, DS Division & GN Division */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Province (පළාත) <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={workerForm.province}
                    onChange={e => setWorkerForm({ ...workerForm, province: e.target.value, district: '', dsDivision: '', gnDivision: '' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white"
                  >
                    <option value="">Select Province...</option>
                    {SRI_LANKA_PROVINCES.map(p => (
                      <option key={p.en} value={p.si}>
                        {p.si} ({p.en})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    District (දිස්ත්‍රික්කය) <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    disabled={!workerForm.province}
                    value={workerForm.district}
                    onChange={e => setWorkerForm({ ...workerForm, district: e.target.value, dsDivision: '', gnDivision: '' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select District...</option>
                    {availableWorkerDistricts.map(d => (
                      <option key={d.en} value={d.si}>
                        {d.si} ({d.en})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    DS Division (ප්‍රාදේශීය ලේකම් කොට්ඨාසය) <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    disabled={!workerForm.district}
                    value={workerForm.dsDivision}
                    onChange={e => setWorkerForm({ ...workerForm, dsDivision: e.target.value, gnDivision: '' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select DS Division...</option>
                    {availableWorkerDSDs.map(dsd => (
                      <option key={dsd.id || dsd.nameEn} value={dsd.nameSi}>
                        {dsd.nameSi} ({dsd.nameEn})
                      </option>
                    ))}
                    {workerForm.dsDivision && !availableWorkerDSDs.some(d => d.nameSi === workerForm.dsDivision || d.nameEn === workerForm.dsDivision) && (
                      <option value={workerForm.dsDivision}>{workerForm.dsDivision}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    GN Division (ග්‍රාම නිලධාරී වසම) <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    disabled={!workerForm.dsDivision}
                    value={workerForm.gnDivision}
                    onChange={e => setWorkerForm({ ...workerForm, gnDivision: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select GN Division...</option>
                    {availableWorkerGNDs.map(gnd => {
                      const val = gnd.gnCode ? `${gnd.gnCode} - ${gnd.nameSi}` : gnd.nameSi;
                      const label = gnd.gnCode ? `${gnd.gnCode} - ${gnd.nameSi} (${gnd.nameEn})` : `${gnd.nameSi} (${gnd.nameEn})`;
                      return (
                        <option key={gnd.id || gnd.lifeCode || val} value={val}>
                          {label}
                        </option>
                      );
                    })}
                    {workerForm.gnDivision && !availableWorkerGNDs.some(g => {
                      const val = g.gnCode ? `${g.gnCode} - ${g.nameSi}` : g.nameSi;
                      return val === workerForm.gnDivision;
                    }) && (
                      <option value={workerForm.gnDivision}>{workerForm.gnDivision}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Dynamic Skills Checkboxes from Skills Master */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Skills & Expertise (හැකියාවන් / කුසලතා - තෝරන්න)
                </label>
                {skillsList.length === 0 ? (
                  <div className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-lg">
                    No skills added yet. Go to Daily Wage Skills tab to add skills.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/80">
                    {skillsList.map(skill => {
                      const isChecked = workerForm.skills.includes(skill.id);
                      return (
                        <label
                          key={skill.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-green-50 border-green-300 text-green-900 font-medium shadow-xs'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100/70'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setWorkerForm(prev => ({
                                ...prev,
                                skills: isChecked
                                  ? prev.skills.filter(id => id !== skill.id)
                                  : [...prev.skills, skill.id]
                              }));
                            }}
                            className="rounded text-green-600 focus:ring-green-500 h-4 w-4 cursor-pointer"
                          />
                          <span className="truncate">{skill.nameSi} <span className="text-gray-400 font-normal">({skill.name})</span></span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Expected Daily Wage (අපේක්ෂිත දෛනික වැටුප)
                  </label>
                  <input
                    type="text"
                    placeholder="උදා: රු. 3,500/දිනකට"
                    value={workerForm.expectedWage}
                    onChange={e => setWorkerForm({ ...workerForm, expectedWage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Experience (පළපුරුද්ද)
                  </label>
                  <input
                    type="text"
                    placeholder="උදා: අවුරුදු 6"
                    value={workerForm.experience}
                    onChange={e => setWorkerForm({ ...workerForm, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Approval Status</label>
                  <select
                    value={workerForm.status}
                    onChange={e => setWorkerForm({ ...workerForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm bg-white"
                  >
                    <option value="APPROVED">Approved (අනුමතයි)</option>
                    <option value="PENDING">Pending Review (සලකා බැලෙමින්)</option>
                    <option value="REJECTED">Rejected (ප්‍රතික්ෂේපිතයි)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <button
                    type="button"
                    onClick={() => setWorkerForm({ ...workerForm, isActive: !workerForm.isActive })}
                    className="cursor-pointer"
                  >
                    {workerForm.isActive ? (
                      <ToggleRight size={28} className="text-green-600" />
                    ) : (
                      <ToggleLeft size={28} className="text-gray-300 hover:text-gray-400" />
                    )}
                  </button>
                  <span className="text-xs font-medium text-gray-700">
                    {workerForm.isActive ? 'Active on Public Directory' : 'Hidden from Directory'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsWorkerModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingWorker}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingWorker ? 'Saving...' : editingWorkerId ? 'Update Worker' : 'Register Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DAILY WAGE SKILL MODAL (ADD / EDIT) */}
      {/* ======================================================== */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSkillModalOpen(false)} />
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative z-10 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <Wrench size={18} />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">
                  {editingSkillId ? 'Edit Daily Wage Skill' : 'Add Daily Wage Skill'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSkillModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Skill Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coconut Plucking"
                  value={skillForm.name}
                  onChange={e => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  කුසලතාවය / නිපුණතාවය (Sinhala) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="උදා: පොල් කැඩීම"
                  value={skillForm.nameSi}
                  onChange={e => setSkillForm({ ...skillForm, nameSi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={skillForm.order}
                  onChange={e => setSkillForm({ ...skillForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSkillForm({ ...skillForm, isActive: !skillForm.isActive })}
                  className="cursor-pointer"
                >
                  {skillForm.isActive ? (
                    <ToggleRight size={28} className="text-green-600" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-300 hover:text-gray-400" />
                  )}
                </button>
                <span className="text-xs font-medium text-gray-700">
                  {skillForm.isActive ? 'Active (Enabled)' : 'Disabled'}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSkill}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingSkill ? 'Saving...' : editingSkillId ? 'Update Skill' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
