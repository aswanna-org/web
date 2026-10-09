import { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Layers,
  Building2,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  X,
  Upload,
  Clock,
  MapPin,
  FileText,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  FileUp,
  Award,
  Globe,
  Sparkles
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';
import RichTextEditor from '../components/RichTextEditor';
import { useConfirm } from '../components/ConfirmDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

export const generateSlug = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

interface ShortCourseSubject {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  descriptionSi?: string | null;
  descriptionEn?: string | null;
  _count?: { shortCourses: number };
}

interface ShortCourseCenter {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  addressSi?: string | null;
  addressEn?: string | null;
  district?: string | null;
  phone?: string | null;
  email?: string | null;
  _count?: { shortCourses: number };
}

interface ShortCourseTrainer {
  id: string;
  slug: string;
  activeState: boolean;
  nameSi: string;
  nameEn: string;
  positionSi?: string | null;
  positionEn?: string | null;
  _count?: { shortCourses: number };
}

interface ShortCourse {
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
  eligibilitySi: string[];
  eligibilityEn: string[];
  benefitsSi: string[];
  benefitsEn: string[];
  syllabusModulesSi: string[];
  syllabusModulesEn: string[];
  schedule?: string | null;
  closingDate?: string | null;
  expiryDate?: string | null;
  detailedDescriptionSi?: string | null;
  detailedDescriptionEn?: string | null;
  onlineAppUrl?: string | null;
  whatsappNumber?: string | null;
  pdfLink?: string | null;
  shortCourseSubjectId: string;
  shortCourseCenterId: string;
  shortCourseTrainerId?: string | null;
  shortCourseSubject?: ShortCourseSubject;
  shortCourseCenter?: ShortCourseCenter;
  shortCourseTrainer?: ShortCourseTrainer | null;
  createdAt?: string;
  updatedAt?: string;
}

type ViewTab = 'courses' | 'subjects' | 'centers' | 'trainers';

export default function ShortCourseManagement() {
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<ViewTab>('courses');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ── COURSES STATE ──
  const [courses, setCourses] = useState<ShortCourse[]>([]);
  const [coursesPage, setCoursesPage] = useState(1);
  const [coursesTotalPages, setCoursesTotalPages] = useState(1);
  const [coursesTotalItems, setCoursesTotalItems] = useState(0);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseFilterSubject, setCourseFilterSubject] = useState('all');
  const [courseFilterCenter, setCourseFilterCenter] = useState('all');
  const [courseFilterTrainer, setCourseFilterTrainer] = useState('all');
  const [courseFilterDistrict, setCourseFilterDistrict] = useState('all');
  const [courseFilterStatus, setCourseFilterStatus] = useState('all');
  const [kpis, setKpis] = useState({ total: 0, active: 0, inactive: 0, closingSoon: 0 });

  // ── ASSOCIATE DATA ──
  const [subjectsList, setSubjectsList] = useState<ShortCourseSubject[]>([]);
  const [centersList, setCentersList] = useState<ShortCourseCenter[]>([]);
  const [trainersList, setTrainersList] = useState<ShortCourseTrainer[]>([]);

  // ── SUBJECTS TAB STATE ──
  const [subjectsPage, setSubjectsPage] = useState(1);
  const [subjectsTotalPages, setSubjectsTotalPages] = useState(1);
  const [subjectsTotalItems, setSubjectsTotalItems] = useState(0);
  const [subjectSearch, setSubjectSearch] = useState('');

  // ── CENTERS TAB STATE ──
  const [centersPage, setCentersPage] = useState(1);
  const [centersTotalPages, setCentersTotalPages] = useState(1);
  const [centersTotalItems, setCentersTotalItems] = useState(0);
  const [centerSearch, setCenterSearch] = useState('');
  const [centerDistrictFilter, setCenterDistrictFilter] = useState('all');

  // ── TRAINERS TAB STATE ──
  const [trainersPage, setTrainersPage] = useState(1);
  const [trainersTotalPages, setTrainersTotalPages] = useState(1);
  const [trainersTotalItems, setTrainersTotalItems] = useState(0);
  const [trainerSearch, setTrainerSearch] = useState('');

  // ── MODALS ──
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [previewCourse, setPreviewCourse] = useState<ShortCourse | null>(null);
  const [viewingSubject, setViewingSubject] = useState<ShortCourseSubject | null>(null);
  const [viewingCenter, setViewingCenter] = useState<ShortCourseCenter | null>(null);
  const [viewingTrainer, setViewingTrainer] = useState<ShortCourseTrainer | null>(null);
  const [isCourseSlugCustom, setIsCourseSlugCustom] = useState(false);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [isSubjectSlugCustom, setIsSubjectSlugCustom] = useState(false);

  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [editingCenterId, setEditingCenterId] = useState<string | null>(null);
  const [isCenterSlugCustom, setIsCenterSlugCustom] = useState(false);

  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [editingTrainerId, setEditingTrainerId] = useState<string | null>(null);
  const [isTrainerSlugCustom, setIsTrainerSlugCustom] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'descriptions' | 'curriculum' | 'media'>('basic');
  const [descriptionLang, setDescriptionLang] = useState<'en' | 'si'>('en');

  // ── FORM STATES ──
  const defaultCourseForm = {
    titleEn: '',
    titleSi: '',
    slug: '',
    shortCourseSubjectId: '',
    shortCourseCenterId: '',
    shortCourseTrainerId: '',
    district: '',
    duration: '',
    fee: '',
    schedule: '',
    closingDate: '',
    expiryDate: '',
    whatsappNumber: '',
    onlineAppUrl: '',
    overviewEn: '',
    overviewSi: '',
    detailedDescriptionEn: '',
    detailedDescriptionSi: '',
    activeState: true,
    eligibilityEn: [''],
    eligibilitySi: [''],
    benefitsEn: [''],
    benefitsSi: [''],
    syllabusModulesEn: [''],
    syllabusModulesSi: [''],
    imageUrl: '',
    pdfLink: ''
  };

  const [courseForm, setCourseForm] = useState(defaultCourseForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  // Subject Form
  const defaultSubjectForm = {
    nameEn: '',
    nameSi: '',
    slug: '',
    descriptionEn: '',
    descriptionSi: '',
    activeState: true
  };
  const [subjectForm, setSubjectForm] = useState(defaultSubjectForm);

  // Center Form
  const defaultCenterForm = {
    nameEn: '',
    nameSi: '',
    slug: '',
    district: '',
    addressEn: '',
    addressSi: '',
    phone: '',
    email: '',
    activeState: true
  };
  const [centerForm, setCenterForm] = useState(defaultCenterForm);

  // Trainer Form
  const defaultTrainerForm = {
    nameEn: '',
    nameSi: '',
    slug: '',
    positionEn: '',
    positionSi: '',
    activeState: true
  };
  const [trainerForm, setTrainerForm] = useState(defaultTrainerForm);

  const token = localStorage.getItem('admin_token');
  const authHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // ── DATA FETCHERS ──
  const fetchAllDropdownData = async () => {
    try {
      const [resSub, resCen, resTrn] = await Promise.all([
        fetch(`${API_BASE_URL}/short-courses/subjects?all=true&limit=100`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/short-courses/centers?all=true&limit=100`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/short-courses/trainers?all=true&limit=100`, { headers: authHeaders })
      ]);
      if (resSub.ok) {
        const d = await resSub.json();
        setSubjectsList(d.data || []);
      }
      if (resCen.ok) {
        const d = await resCen.json();
        setCentersList(d.data || []);
      }
      if (resTrn.ok) {
        const d = await resTrn.json();
        setTrainersList(d.data || []);
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  };

  const fetchAdminCourses = async (page = 1) => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/short-courses/admin/all?page=${page}&limit=10`;
      if (courseSearch.trim()) url += `&search=${encodeURIComponent(courseSearch.trim())}`;
      if (courseFilterSubject !== 'all') url += `&subjectId=${encodeURIComponent(courseFilterSubject)}`;
      if (courseFilterCenter !== 'all') url += `&centerId=${encodeURIComponent(courseFilterCenter)}`;
      if (courseFilterTrainer !== 'all') url += `&trainerId=${encodeURIComponent(courseFilterTrainer)}`;
      if (courseFilterDistrict !== 'all') url += `&district=${encodeURIComponent(courseFilterDistrict)}`;
      if (courseFilterStatus !== 'all') url += `&activeState=${courseFilterStatus === 'active'}`;

      const res = await fetch(url, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.data || []);
        if (data.meta) {
          setCoursesPage(data.meta.page);
          setCoursesTotalPages(data.meta.totalPages);
          setCoursesTotalItems(data.meta.total);
        }
        if (data.stats) {
          setKpis(data.stats);
        }
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to fetch short courses.');
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      showError('Error connecting to courses API.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjects = async (page = 1) => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/short-courses/subjects?all=true&page=${page}&limit=10`;
      if (subjectSearch.trim()) url += `&search=${encodeURIComponent(subjectSearch.trim())}`;

      const res = await fetch(url, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setSubjectsList(data.data || []);
        if (data.meta) {
          setSubjectsPage(data.meta.page);
          setSubjectsTotalPages(data.meta.totalPages);
          setSubjectsTotalItems(data.meta.total);
        }
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCenters = async (page = 1) => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/short-courses/centers?all=true&page=${page}&limit=10`;
      if (centerSearch.trim()) url += `&search=${encodeURIComponent(centerSearch.trim())}`;
      if (centerDistrictFilter !== 'all') url += `&district=${encodeURIComponent(centerDistrictFilter)}`;

      const res = await fetch(url, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setCentersList(data.data || []);
        if (data.meta) {
          setCentersPage(data.meta.page);
          setCentersTotalPages(data.meta.totalPages);
          setCentersTotalItems(data.meta.total);
        }
      }
    } catch (err) {
      console.error('Failed to fetch centers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrainers = async (page = 1) => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/short-courses/trainers?all=true&page=${page}&limit=10`;
      if (trainerSearch.trim()) url += `&search=${encodeURIComponent(trainerSearch.trim())}`;

      const res = await fetch(url, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setTrainersList(data.data || []);
        if (data.meta) {
          setTrainersPage(data.meta.page);
          setTrainersTotalPages(data.meta.totalPages);
          setTrainersTotalItems(data.meta.total);
        }
      }
    } catch (err) {
      console.error('Failed to fetch trainers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDropdownData();
  }, []);

  useEffect(() => {
    if (activeTab === 'courses') {
      fetchAdminCourses(coursesPage);
    } else if (activeTab === 'subjects') {
      fetchSubjects(subjectsPage);
    } else if (activeTab === 'centers') {
      fetchCenters(centersPage);
    } else if (activeTab === 'trainers') {
      fetchTrainers(trainersPage);
    }
  }, [
    activeTab,
    coursesPage,
    courseSearch,
    courseFilterSubject,
    courseFilterCenter,
    courseFilterTrainer,
    courseFilterDistrict,
    courseFilterStatus,
    subjectsPage,
    subjectSearch,
    centersPage,
    centerSearch,
    centerDistrictFilter,
    trainersPage,
    trainerSearch
  ]);

  // ── TOGGLE COURSE ACTIVE STATUS ──
  const handleToggleCourseStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/short-courses/${courseId}/status`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeState: !currentStatus })
      });
      if (res.ok) {
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, activeState: !currentStatus } : c));
        showSuccess(`Course status changed to ${!currentStatus ? 'Active' : 'Inactive'}.`);
        fetchAdminCourses(coursesPage);
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to update course status.');
      }
    } catch (err) {
      console.error(err);
      showError('Failed to change status.');
    }
  };

  // ── DELETE SHORT COURSE ──
  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!await confirm({
      title: 'Delete Short Course',
      subtitle: 'කෙටි පාඨමාලාව ස්ථිරවම ඉවත් කිරීම',
      message: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      confirmText: 'Delete Course'
    })) return;
    try {
      const res = await fetch(`${API_BASE_URL}/short-courses/${courseId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showSuccess('Short course deleted successfully.');
        fetchAdminCourses(coursesPage);
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to delete course.');
      }
    } catch (err) {
      console.error(err);
      showError('Failed to delete course.');
    }
  };

  // ── OPEN COURSE CREATE MODAL ──
  const openCreateCourse = () => {
    setEditingCourseId(null);
    setIsCourseSlugCustom(false);
    setCourseForm({
      ...defaultCourseForm,
      shortCourseSubjectId: subjectsList[0]?.id || '',
      shortCourseCenterId: centersList[0]?.id || '',
      district: centersList[0]?.district || ''
    });
    setImageFile(null);
    setImagePreviewUrl(null);
    setPdfFile(null);
    setActiveFormTab('basic');
    setDescriptionLang('en');
    setIsCourseModalOpen(true);
  };

  // ── OPEN COURSE EDIT MODAL ──
  const openEditCourse = (course: ShortCourse) => {
    setEditingCourseId(course.id);
    setIsCourseSlugCustom(true);
    setCourseForm({
      titleEn: course.titleEn || '',
      titleSi: course.titleSi || '',
      slug: course.slug || '',
      shortCourseSubjectId: course.shortCourseSubjectId || '',
      shortCourseCenterId: course.shortCourseCenterId || '',
      shortCourseTrainerId: course.shortCourseTrainerId || '',
      district: course.district || '',
      duration: course.duration || '',
      fee: course.fee || '',
      schedule: course.schedule || '',
      closingDate: course.closingDate ? new Date(course.closingDate).toISOString().substring(0, 10) : '',
      expiryDate: course.expiryDate ? new Date(course.expiryDate).toISOString().substring(0, 10) : '',
      whatsappNumber: course.whatsappNumber || '',
      onlineAppUrl: course.onlineAppUrl || '',
      overviewEn: course.overviewEn || '',
      overviewSi: course.overviewSi || '',
      detailedDescriptionEn: course.detailedDescriptionEn || '',
      detailedDescriptionSi: course.detailedDescriptionSi || '',
      activeState: course.activeState,
      eligibilityEn: course.eligibilityEn && course.eligibilityEn.length > 0 ? course.eligibilityEn : [''],
      eligibilitySi: course.eligibilitySi && course.eligibilitySi.length > 0 ? course.eligibilitySi : [''],
      benefitsEn: course.benefitsEn && course.benefitsEn.length > 0 ? course.benefitsEn : [''],
      benefitsSi: course.benefitsSi && course.benefitsSi.length > 0 ? course.benefitsSi : [''],
      syllabusModulesEn: course.syllabusModulesEn && course.syllabusModulesEn.length > 0 ? course.syllabusModulesEn : [''],
      syllabusModulesSi: course.syllabusModulesSi && course.syllabusModulesSi.length > 0 ? course.syllabusModulesSi : [''],
      imageUrl: course.imageUrl || '',
      pdfLink: course.pdfLink || ''
    });
    setImageFile(null);
    setImagePreviewUrl(course.imageUrl || null);
    setPdfFile(null);
    setActiveFormTab('basic');
    setDescriptionLang('en');
    setIsCourseModalOpen(true);
  };

  // ── SAVE SHORT COURSE ──
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.titleEn.trim() || !courseForm.titleSi.trim()) {
      showError('Course titles in both English and Sinhala are required.');
      return;
    }
    if (!courseForm.shortCourseSubjectId) {
      showError('Please select a Short Course Subject.');
      return;
    }
    if (!courseForm.shortCourseCenterId) {
      showError('Please select a Training Center.');
      return;
    }

    const finalSlug = courseForm.slug.trim() || generateSlug(courseForm.titleEn);

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('titleEn', courseForm.titleEn.trim());
      formData.append('titleSi', courseForm.titleSi.trim());
      formData.append('slug', finalSlug);
      formData.append('shortCourseSubjectId', courseForm.shortCourseSubjectId);
      formData.append('shortCourseCenterId', courseForm.shortCourseCenterId);
      if (courseForm.shortCourseTrainerId) formData.append('shortCourseTrainerId', courseForm.shortCourseTrainerId);
      if (courseForm.district.trim()) formData.append('district', courseForm.district.trim());
      if (courseForm.duration.trim()) formData.append('duration', courseForm.duration.trim());
      if (courseForm.fee.trim()) formData.append('fee', courseForm.fee.trim());
      if (courseForm.schedule.trim()) formData.append('schedule', courseForm.schedule.trim());
      if (courseForm.closingDate) formData.append('closingDate', courseForm.closingDate);
      if (courseForm.expiryDate) formData.append('expiryDate', courseForm.expiryDate);
      if (courseForm.whatsappNumber.trim()) formData.append('whatsappNumber', courseForm.whatsappNumber.trim());
      if (courseForm.onlineAppUrl.trim()) formData.append('onlineAppUrl', courseForm.onlineAppUrl.trim());
      if (courseForm.overviewEn.trim()) formData.append('overviewEn', courseForm.overviewEn.trim());
      if (courseForm.overviewSi.trim()) formData.append('overviewSi', courseForm.overviewSi.trim());
      if (courseForm.detailedDescriptionEn.trim()) formData.append('detailedDescriptionEn', courseForm.detailedDescriptionEn.trim());
      if (courseForm.detailedDescriptionSi.trim()) formData.append('detailedDescriptionSi', courseForm.detailedDescriptionSi.trim());
      formData.append('activeState', String(courseForm.activeState));

      // Arrays
      formData.append('eligibilityEn', JSON.stringify(courseForm.eligibilityEn.filter(s => s.trim())));
      formData.append('eligibilitySi', JSON.stringify(courseForm.eligibilitySi.filter(s => s.trim())));
      formData.append('benefitsEn', JSON.stringify(courseForm.benefitsEn.filter(s => s.trim())));
      formData.append('benefitsSi', JSON.stringify(courseForm.benefitsSi.filter(s => s.trim())));
      formData.append('syllabusModulesEn', JSON.stringify(courseForm.syllabusModulesEn.filter(s => s.trim())));
      formData.append('syllabusModulesSi', JSON.stringify(courseForm.syllabusModulesSi.filter(s => s.trim())));

      // S3 File Uploads
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (courseForm.imageUrl) {
        formData.append('imageUrl', courseForm.imageUrl);
      }

      if (pdfFile) {
        formData.append('pdf', pdfFile);
      } else if (courseForm.pdfLink) {
        formData.append('pdfLink', courseForm.pdfLink);
      }

      const method = editingCourseId ? 'PUT' : 'POST';
      const endpoint = editingCourseId
        ? `${API_BASE_URL}/short-courses/${editingCourseId}`
        : `${API_BASE_URL}/short-courses`;

      const res = await fetch(endpoint, {
        method,
        headers: authHeaders,
        body: formData
      });

      if (res.ok) {
        showSuccess(editingCourseId ? 'Course updated successfully!' : 'Short Course created successfully!');
        setIsCourseModalOpen(false);
        fetchAdminCourses(editingCourseId ? coursesPage : 1);
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to save course.');
      }
    } catch (err) {
      console.error(err);
      showError('Error saving short course.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── ARRAY FIELD HELPERS ──
  const handleArrayFieldChange = (
    field: 'eligibilityEn' | 'eligibilitySi' | 'benefitsEn' | 'benefitsSi' | 'syllabusModulesEn' | 'syllabusModulesSi',
    index: number,
    value: string
  ) => {
    setCourseForm(prev => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayFieldItem = (
    field: 'eligibilityEn' | 'eligibilitySi' | 'benefitsEn' | 'benefitsSi' | 'syllabusModulesEn' | 'syllabusModulesSi'
  ) => {
    setCourseForm(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayFieldItem = (
    field: 'eligibilityEn' | 'eligibilitySi' | 'benefitsEn' | 'benefitsSi' | 'syllabusModulesEn' | 'syllabusModulesSi',
    index: number
  ) => {
    setCourseForm(prev => {
      const arr = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: arr.length > 0 ? arr : [''] };
    });
  };

  // ── SUBJECTS CRUD ──
  const openCreateSubject = () => {
    setEditingSubjectId(null);
    setIsSubjectSlugCustom(false);
    setSubjectForm(defaultSubjectForm);
    setIsSubjectModalOpen(true);
  };

  const openEditSubject = (sub: ShortCourseSubject) => {
    setEditingSubjectId(sub.id);
    setIsSubjectSlugCustom(true);
    setSubjectForm({
      nameEn: sub.nameEn,
      nameSi: sub.nameSi,
      slug: sub.slug,
      descriptionEn: sub.descriptionEn || '',
      descriptionSi: sub.descriptionSi || '',
      activeState: sub.activeState
    });
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.nameEn.trim() || !subjectForm.nameSi.trim()) {
      showError('Subject name in both languages is required.');
      return;
    }
    const finalSlug = subjectForm.slug.trim() || generateSlug(subjectForm.nameEn);
    setIsSaving(true);
    try {
      const method = editingSubjectId ? 'PUT' : 'POST';
      const endpoint = editingSubjectId
        ? `${API_BASE_URL}/short-courses/subjects/${editingSubjectId}`
        : `${API_BASE_URL}/short-courses/subjects`;

      const res = await fetch(endpoint, {
        method,
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subjectForm, slug: finalSlug })
      });

      if (res.ok) {
        showSuccess(editingSubjectId ? 'Subject updated successfully!' : 'Subject created successfully!');
        setIsSubjectModalOpen(false);
        fetchSubjects(subjectsPage);
        fetchAllDropdownData();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to save subject.');
      }
    } catch (err) {
      console.error(err);
      showError('Error saving subject.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!await confirm({
      title: 'Delete Subject',
      subtitle: 'විෂය ස්ථිරවම ඉවත් කිරීම',
      message: `Are you sure you want to delete subject "${name}"?`,
      confirmText: 'Delete Subject'
    })) return;
    try {
      const res = await fetch(`${API_BASE_URL}/short-courses/subjects/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showSuccess('Subject deleted successfully.');
        fetchSubjects(subjectsPage);
        fetchAllDropdownData();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to delete subject.');
      }
    } catch (err) {
      console.error(err);
      showError('Error deleting subject.');
    }
  };

  // ── CENTERS CRUD ──
  const openCreateCenter = () => {
    setEditingCenterId(null);
    setIsCenterSlugCustom(false);
    setCenterForm(defaultCenterForm);
    setIsCenterModalOpen(true);
  };

  const openEditCenter = (cen: ShortCourseCenter) => {
    setEditingCenterId(cen.id);
    setIsCenterSlugCustom(true);
    setCenterForm({
      nameEn: cen.nameEn,
      nameSi: cen.nameSi,
      slug: cen.slug,
      district: cen.district || '',
      addressEn: cen.addressEn || '',
      addressSi: cen.addressSi || '',
      phone: cen.phone || '',
      email: cen.email || '',
      activeState: cen.activeState
    });
    setIsCenterModalOpen(true);
  };

  const handleSaveCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerForm.nameEn.trim() || !centerForm.nameSi.trim()) {
      showError('Center name in both languages is required.');
      return;
    }
    const finalSlug = centerForm.slug.trim() || generateSlug(centerForm.nameEn);
    setIsSaving(true);
    try {
      const method = editingCenterId ? 'PUT' : 'POST';
      const endpoint = editingCenterId
        ? `${API_BASE_URL}/short-courses/centers/${editingCenterId}`
        : `${API_BASE_URL}/short-courses/centers`;

      const res = await fetch(endpoint, {
        method,
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...centerForm, slug: finalSlug })
      });

      if (res.ok) {
        showSuccess(editingCenterId ? 'Center updated successfully!' : 'Center created successfully!');
        setIsCenterModalOpen(false);
        fetchCenters(centersPage);
        fetchAllDropdownData();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to save center.');
      }
    } catch (err) {
      console.error(err);
      showError('Error saving center.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCenter = async (id: string, name: string) => {
    if (!await confirm({
      title: 'Delete Training Center',
      subtitle: 'පුහුණු මධ්‍යස්ථානය ස්ථිරවම ඉවත් කිරීම',
      message: `Are you sure you want to delete training center "${name}"?`,
      confirmText: 'Delete Center'
    })) return;
    try {
      const res = await fetch(`${API_BASE_URL}/short-courses/centers/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showSuccess('Training center deleted successfully.');
        fetchCenters(centersPage);
        fetchAllDropdownData();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to delete center.');
      }
    } catch (err) {
      console.error(err);
      showError('Error deleting center.');
    }
  };

  // ── TRAINERS CRUD ──
  const openCreateTrainer = () => {
    setEditingTrainerId(null);
    setIsTrainerSlugCustom(false);
    setTrainerForm(defaultTrainerForm);
    setIsTrainerModalOpen(true);
  };

  const openEditTrainer = (trn: ShortCourseTrainer) => {
    setEditingTrainerId(trn.id);
    setIsTrainerSlugCustom(true);
    setTrainerForm({
      nameEn: trn.nameEn,
      nameSi: trn.nameSi,
      slug: trn.slug,
      positionEn: trn.positionEn || '',
      positionSi: trn.positionSi || '',
      activeState: trn.activeState
    });
    setIsTrainerModalOpen(true);
  };

  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerForm.nameEn.trim() || !trainerForm.nameSi.trim()) {
      showError('Trainer name in both languages is required.');
      return;
    }
    const finalSlug = trainerForm.slug.trim() || generateSlug(trainerForm.nameEn);
    setIsSaving(true);
    try {
      const method = editingTrainerId ? 'PUT' : 'POST';
      const endpoint = editingTrainerId
        ? `${API_BASE_URL}/short-courses/trainers/${editingTrainerId}`
        : `${API_BASE_URL}/short-courses/trainers`;

      const res = await fetch(endpoint, {
        method,
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...trainerForm, slug: finalSlug })
      });

      if (res.ok) {
        showSuccess(editingTrainerId ? 'Trainer updated successfully!' : 'Trainer created successfully!');
        setIsTrainerModalOpen(false);
        fetchTrainers(trainersPage);
        fetchAllDropdownData();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to save trainer.');
      }
    } catch (err) {
      console.error(err);
      showError('Error saving trainer.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTrainer = async (id: string, name: string) => {
    if (!await confirm({
      title: 'Delete Trainer',
      subtitle: 'පුහුණුකරු ස්ථිරවම ඉවත් කිරීම',
      message: `Are you sure you want to delete trainer "${name}"?`,
      confirmText: 'Delete Trainer'
    })) return;
    try {
      const res = await fetch(`${API_BASE_URL}/short-courses/trainers/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showSuccess('Trainer deleted successfully.');
        fetchTrainers(trainersPage);
        fetchAllDropdownData();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to delete trainer.');
      }
    } catch (err) {
      console.error(err);
      showError('Error deleting trainer.');
    }
  };

  const handleFilterCoursesByAssociate = (type: 'subject' | 'center' | 'trainer', id: string) => {
    if (type === 'subject') setCourseFilterSubject(id);
    if (type === 'center') setCourseFilterCenter(id);
    if (type === 'trainer') setCourseFilterTrainer(id);
    setActiveTab('courses');
    setCoursesPage(1);
  };

  // Common input styling class for absolute UI consistency across all fields
  const fieldLabelClass = "block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5";
  const fieldInputClass = "w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all";
  const fieldSelectClass = "w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer";

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="text-emerald-600" size={26} />
            Short Courses & Workshops Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage agricultural practical courses, curriculum modules, subjects, training centers, and instructors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'courses' && (
            <button
              onClick={openCreateCourse}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
            >
              <Plus size={18} />
              <span>Create Short Course</span>
            </button>
          )}

          {activeTab === 'subjects' && (
            <button
              onClick={openCreateSubject}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
            >
              <Plus size={18} />
              <span>Add Subject</span>
            </button>
          )}

          {activeTab === 'centers' && (
            <button
              onClick={openCreateCenter}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
            >
              <Plus size={18} />
              <span>Add Training Center</span>
            </button>
          )}

          {activeTab === 'trainers' && (
            <button
              onClick={openCreateTrainer}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
            >
              <Plus size={18} />
              <span>Add Trainer</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 bg-white px-5 pt-3 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'courses'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <BookOpen size={17} />
          <span>Short Courses</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${activeTab === 'courses' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
            {kpis.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'subjects'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Layers size={17} />
          <span>Subjects</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${activeTab === 'subjects' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
            {subjectsTotalItems || subjectsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('centers')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'centers'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Building2 size={17} />
          <span>Training Centers</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${activeTab === 'centers' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
            {centersTotalItems || centersList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('trainers')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'trainers'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Users size={17} />
          <span>Trainers & Instructors</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${activeTab === 'trainers' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
            {trainersTotalItems || trainersList.length}
          </span>
        </button>
      </div>

      {/* ── Alerts ── */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm font-medium">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── VIEW 1: SHORT COURSES LIST ── */}
      {/* ==================================================================== */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* ── KPI Widgets ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Courses</p>
                <p className="text-xl font-bold text-gray-900">{kpis.total}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Active</p>
                <p className="text-xl font-bold text-emerald-700">{kpis.active}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Inactive</p>
                <p className="text-xl font-bold text-amber-700">{kpis.inactive}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Closing Soon</p>
                <p className="text-xl font-bold text-rose-700">{kpis.closingSoon}</p>
              </div>
            </div>
          </div>

          {/* ── Search & Filters ── */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="text"
                placeholder="Search courses by title, district or keywords..."
                value={courseSearch}
                onChange={e => {
                  setCourseSearch(e.target.value);
                  setCoursesPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-emerald-600 focus:border-emerald-600"
              />
              {courseSearch && (
                <button
                  onClick={() => setCourseSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <select
              value={courseFilterSubject}
              onChange={e => {
                setCourseFilterSubject(e.target.value);
                setCoursesPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-emerald-600"
            >
              <option value="all">All Subjects</option>
              {subjectsList.map(s => (
                <option key={s.id} value={s.id}>{s.nameEn} ({s.nameSi})</option>
              ))}
            </select>

            <select
              value={courseFilterCenter}
              onChange={e => {
                setCourseFilterCenter(e.target.value);
                setCoursesPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-emerald-600"
            >
              <option value="all">All Centers</option>
              {centersList.map(c => (
                <option key={c.id} value={c.id}>{c.nameEn} - {c.district || ''}</option>
              ))}
            </select>

            <select
              value={courseFilterDistrict}
              onChange={e => {
                setCourseFilterDistrict(e.target.value);
                setCoursesPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-emerald-600"
            >
              <option value="all">All Districts</option>
              {SRI_LANKA_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={courseFilterStatus}
              onChange={e => {
                setCourseFilterStatus(e.target.value);
                setCoursesPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-emerald-600"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {(courseSearch || courseFilterSubject !== 'all' || courseFilterCenter !== 'all' || courseFilterTrainer !== 'all' || courseFilterDistrict !== 'all' || courseFilterStatus !== 'all') && (
              <button
                onClick={() => {
                  setCourseSearch('');
                  setCourseFilterSubject('all');
                  setCourseFilterCenter('all');
                  setCourseFilterTrainer('all');
                  setCourseFilterDistrict('all');
                  setCourseFilterStatus('all');
                  setCoursesPage(1);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* ── Courses Table ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <AgroLoader message="Loading Short Courses..." subMessage="Fetching curriculum and training centers" />
              </div>
            ) : courses.length === 0 ? (
              <div className="p-16 text-center">
                <BookOpen size={44} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-base font-semibold text-gray-800">No Short Courses Found</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  No courses matching current filters. Click "Create Short Course" to publish a new practical training program.
                </p>
                <button
                  onClick={openCreateCourse}
                  className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-xs cursor-pointer"
                >
                  <Plus size={15} /> Create Short Course
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                    <tr>
                      <th className="px-3 py-2">Course Program</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Center</th>
                      <th className="px-3 py-2">Duration</th>
                      <th className="px-3 py-2">Fee</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courses.map(course => (
                      <tr key={course.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-3 py-1.5">
                          <div className="flex items-center gap-2 max-w-xs">
                            {course.imageUrl ? (
                              <img
                                src={course.imageUrl}
                                alt={course.titleEn}
                                className="w-6 h-6 rounded object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                                <Award size={13} />
                              </div>
                            )}
                            <span className="font-semibold text-gray-900 truncate text-xs" title={course.titleEn}>
                              {course.titleEn}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">
                          <span className="truncate max-w-[150px] inline-block" title={course.shortCourseSubject?.nameEn || '-'}>
                            {course.shortCourseSubject?.nameEn || '-'}
                          </span>
                        </td>

                        <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">
                          <span className="truncate max-w-[150px] inline-block" title={course.shortCourseCenter?.nameEn || '-'}>
                            {course.shortCourseCenter?.nameEn || '-'}
                          </span>
                        </td>

                        <td className="px-3 py-1.5 whitespace-nowrap text-gray-700 font-medium">
                          {course.duration || '-'}
                        </td>

                        <td className="px-3 py-1.5 whitespace-nowrap font-bold text-emerald-700">
                          {course.fee && course.fee.trim() !== '0' ? course.fee : 'Free'}
                        </td>

                        <td className="px-3 py-1.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleCourseStatus(course.id, course.activeState)}
                            title="Click to toggle active status"
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                              course.activeState
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${course.activeState ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                            <span>{course.activeState ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        <td className="px-3 py-1.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setPreviewCourse(course)}
                              title="View Details"
                              className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => openEditCourse(course)}
                              title="Edit Course"
                              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id, course.titleEn)}
                              title="Delete Course"
                              className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              currentPage={coursesPage}
              totalPages={coursesTotalPages}
              onPageChange={setCoursesPage}
              totalItems={coursesTotalItems}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── VIEW 2: SUBJECTS LIST ── */}
      {/* ==================================================================== */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="text"
                placeholder="Search subjects by name or keywords..."
                value={subjectSearch}
                onChange={e => {
                  setSubjectSearch(e.target.value);
                  setSubjectsPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            <button
              onClick={openCreateSubject}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-sm cursor-pointer"
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <AgroLoader message="Loading Subjects..." />
              </div>
            ) : subjectsList.length === 0 ? (
              <div className="p-16 text-center text-gray-500">
                <Layers size={40} className="mx-auto text-gray-300 mb-2" />
                <p>No subjects found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                    <tr>
                      <th className="px-3 py-2">Subject Name</th>
                      <th className="px-3 py-2">Slug</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2 text-center">Linked Courses</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subjectsList.map(sub => (
                      <tr key={sub.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <span className="font-semibold text-gray-900 truncate max-w-xs inline-block" title={sub.nameEn}>
                            {sub.nameEn}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[11px] text-gray-400 whitespace-nowrap">{sub.slug}</td>
                        <td className="px-3 py-1.5 text-[11px] text-gray-600 max-w-xs truncate whitespace-nowrap">
                          {sub.descriptionEn ? sub.descriptionEn.replace(/<[^>]*>/g, '') : '-'}
                        </td>
                        <td className="px-3 py-1.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleFilterCoursesByAssociate('subject', sub.id)}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold hover:bg-emerald-100 cursor-pointer"
                          >
                            {sub._count?.shortCourses || 0} Courses
                          </button>
                        </td>
                        <td className="px-3 py-1.5 text-center whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${sub.activeState ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                            {sub.activeState ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingSubject(sub)}
                              title="View Subject Details"
                              className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleFilterCoursesByAssociate('subject', sub.id)}
                              title="View Courses"
                              className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            >
                              <BookOpen size={15} />
                            </button>
                            <button
                              onClick={() => openEditSubject(sub)}
                              title="Edit Subject"
                              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(sub.id, sub.nameEn)}
                              title="Delete Subject"
                              className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              currentPage={subjectsPage}
              totalPages={subjectsTotalPages}
              onPageChange={setSubjectsPage}
              totalItems={subjectsTotalItems}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── VIEW 3: CENTERS LIST ── */}
      {/* ==================================================================== */}
      {activeTab === 'centers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type="text"
                  placeholder="Search centers by name, address, district..."
                  value={centerSearch}
                  onChange={e => {
                    setCenterSearch(e.target.value);
                    setCentersPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>

              <select
                value={centerDistrictFilter}
                onChange={e => {
                  setCenterDistrictFilter(e.target.value);
                  setCentersPage(1);
                }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700"
              >
                <option value="all">All Districts</option>
                {SRI_LANKA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <button
              onClick={openCreateCenter}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-sm cursor-pointer"
            >
              <Plus size={16} /> Add Training Center
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <AgroLoader message="Loading Centers..." />
              </div>
            ) : centersList.length === 0 ? (
              <div className="p-16 text-center text-gray-500">
                <Building2 size={40} className="mx-auto text-gray-300 mb-2" />
                <p>No training centers found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                    <tr>
                      <th className="px-3 py-2">Center Name</th>
                      <th className="px-3 py-2">District</th>
                      <th className="px-3 py-2">Contact</th>
                      <th className="px-3 py-2 text-center">Linked Courses</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {centersList.map(cen => (
                      <tr key={cen.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <span className="font-semibold text-gray-900 truncate max-w-xs inline-block" title={cen.nameEn}>
                            {cen.nameEn}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap text-gray-700 font-medium">
                          {cen.district || '-'}
                        </td>
                        <td className="px-3 py-1.5 text-gray-600 whitespace-nowrap">
                          {cen.phone || cen.email || '-'}
                        </td>
                        <td className="px-3 py-1.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleFilterCoursesByAssociate('center', cen.id)}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold hover:bg-emerald-100 cursor-pointer"
                          >
                            {cen._count?.shortCourses || 0} Courses
                          </button>
                        </td>
                        <td className="px-3 py-1.5 text-center whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${cen.activeState ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                            {cen.activeState ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingCenter(cen)}
                              title="View Center Details"
                              className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleFilterCoursesByAssociate('center', cen.id)}
                              title="View Courses"
                              className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            >
                              <BookOpen size={15} />
                            </button>
                            <button
                              onClick={() => openEditCenter(cen)}
                              title="Edit Center"
                              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteCenter(cen.id, cen.nameEn)}
                              title="Delete Center"
                              className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              currentPage={centersPage}
              totalPages={centersTotalPages}
              onPageChange={setCentersPage}
              totalItems={centersTotalItems}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── VIEW 4: TRAINERS LIST ── */}
      {/* ==================================================================== */}
      {activeTab === 'trainers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="text"
                placeholder="Search trainers by name or position..."
                value={trainerSearch}
                onChange={e => {
                  setTrainerSearch(e.target.value);
                  setTrainersPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            <button
              onClick={openCreateTrainer}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-sm cursor-pointer"
            >
              <Plus size={16} /> Add Trainer
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <AgroLoader message="Loading Trainers..." />
              </div>
            ) : trainersList.length === 0 ? (
              <div className="p-16 text-center text-gray-500">
                <Users size={40} className="mx-auto text-gray-300 mb-2" />
                <p>No trainers found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                    <tr>
                      <th className="px-3 py-2">Trainer Name</th>
                      <th className="px-3 py-2">Position / Designation</th>
                      <th className="px-3 py-2">Slug</th>
                      <th className="px-3 py-2 text-center">Linked Courses</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {trainersList.map(trn => (
                      <tr key={trn.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <span className="font-semibold text-gray-900 truncate max-w-xs inline-block" title={trn.nameEn}>
                            {trn.nameEn}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap text-gray-700 font-medium">
                          <span className="truncate max-w-xs inline-block" title={trn.positionEn || '-'}>
                            {trn.positionEn || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[11px] text-gray-400 whitespace-nowrap">{trn.slug}</td>
                        <td className="px-3 py-1.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleFilterCoursesByAssociate('trainer', trn.id)}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold hover:bg-emerald-100 cursor-pointer"
                          >
                            {trn._count?.shortCourses || 0} Courses
                          </button>
                        </td>
                        <td className="px-3 py-1.5 text-center whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${trn.activeState ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                            {trn.activeState ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingTrainer(trn)}
                              title="View Trainer Details"
                              className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleFilterCoursesByAssociate('trainer', trn.id)}
                              title="View Courses"
                              className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            >
                              <BookOpen size={15} />
                            </button>
                            <button
                              onClick={() => openEditTrainer(trn)}
                              title="Edit Trainer"
                              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteTrainer(trn.id, trn.nameEn)}
                              title="Delete Trainer"
                              className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              currentPage={trainersPage}
              totalPages={trainersTotalPages}
              onPageChange={setTrainersPage}
              totalItems={trainersTotalItems}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── MODAL: CREATE / EDIT SHORT COURSE (EXTRA LARGE & SPACIOUS) ── */}
      {/* ==================================================================== */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    {editingCourseId ? 'Edit Short Course Program' : 'Create New Short Course Program'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure titles, auto-generated slug, training centers, rich descriptions, syllabus, and S3 files.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-gray-200 px-8 bg-white gap-3 text-xs font-bold overflow-x-auto">
              {[
                { key: 'basic', label: '1. General & Logistics' },
                { key: 'descriptions', label: '2. Rich Descriptions & Objectives' },
                { key: 'curriculum', label: '3. Curriculum, Benefits & Requirements' },
                { key: 'media', label: '4. S3 Media & PDF Document' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFormTab(tab.key as any)}
                  className={`py-3.5 px-4 border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
                    activeFormTab === tab.key
                      ? 'border-emerald-600 text-emerald-700 font-bold bg-emerald-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveCourse} className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* TAB 1: GENERAL & LOGISTICS */}
              {activeFormTab === 'basic' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  {/* Basic Information Section */}
                  <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-200/60 flex items-center gap-2">
                      <BookOpen size={16} className="text-emerald-600" />
                      Program Titles & Slug
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={fieldLabelClass}>
                          Course Title (English) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={courseForm.titleEn}
                          onChange={e => {
                            const val = e.target.value;
                            setCourseForm(prev => ({
                              ...prev,
                              titleEn: val,
                              slug: !isCourseSlugCustom ? generateSlug(val) : prev.slug
                            }));
                          }}
                          placeholder="e.g. Modern Hydroponics and Protected Agriculture"
                          className={fieldInputClass}
                        />
                      </div>

                      <div>
                        <label className={fieldLabelClass}>
                          Course Title (Sinhala) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={courseForm.titleSi}
                          onChange={e => setCourseForm(prev => ({ ...prev, titleSi: e.target.value }))}
                          placeholder="e.g. නූතන හයිඩ්‍රොපොනික්ස් සහ ආරක්ෂිත කෘෂිකර්මාන්තය"
                          className={`${fieldInputClass} font-sinhala`}
                        />
                      </div>
                    </div>

                    {/* Auto-generated Slug field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={fieldLabelClass}>
                          Unique URL Slug <span className="text-gray-400 font-normal text-[11px] lowercase">(frontend generated)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCourseSlugCustom(false);
                            setCourseForm(prev => ({ ...prev, slug: generateSlug(prev.titleEn) }));
                          }}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles size={13} />
                          Auto-generate from Title
                        </button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          value={courseForm.slug}
                          onChange={e => {
                            setIsCourseSlugCustom(true);
                            setCourseForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                          }}
                          placeholder="modern-hydroponics-protected-agriculture"
                          className={`${fieldInputClass} font-mono text-xs`}
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        URL path: <span className="text-emerald-700 font-mono font-medium">/short-courses/{courseForm.slug || 'slug-placeholder'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Classification & Associations Section */}
                  <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-200/60 flex items-center gap-2">
                      <Layers size={16} className="text-emerald-600" />
                      Subject, Center & Instructor Assignment
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className={fieldLabelClass}>
                          Subject Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={courseForm.shortCourseSubjectId}
                          onChange={e => setCourseForm(prev => ({ ...prev, shortCourseSubjectId: e.target.value }))}
                          className={fieldSelectClass}
                        >
                          <option value="">-- Select Subject --</option>
                          {subjectsList.map(s => (
                            <option key={s.id} value={s.id}>{s.nameEn} ({s.nameSi})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={fieldLabelClass}>
                          Training Center <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={courseForm.shortCourseCenterId}
                          onChange={e => {
                            const cen = centersList.find(c => c.id === e.target.value);
                            setCourseForm(prev => ({
                              ...prev,
                              shortCourseCenterId: e.target.value,
                              district: cen?.district || prev.district
                            }));
                          }}
                          className={fieldSelectClass}
                        >
                          <option value="">-- Select Center --</option>
                          {centersList.map(c => (
                            <option key={c.id} value={c.id}>{c.nameEn} - {c.district || 'National'}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={fieldLabelClass}>
                          Assigned Trainer <span className="text-gray-400 font-normal text-[11px] lowercase">(optional)</span>
                        </label>
                        <select
                          value={courseForm.shortCourseTrainerId}
                          onChange={e => setCourseForm(prev => ({ ...prev, shortCourseTrainerId: e.target.value }))}
                          className={fieldSelectClass}
                        >
                          <option value="">-- Unassigned / None --</option>
                          {trainersList.map(t => (
                            <option key={t.id} value={t.id}>{t.nameEn} ({t.positionEn || 'Instructor'})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={fieldLabelClass}>District Location</label>
                        <select
                          value={courseForm.district}
                          onChange={e => setCourseForm(prev => ({ ...prev, district: e.target.value }))}
                          className={fieldSelectClass}
                        >
                          <option value="">-- Select District (Default: Center District) --</option>
                          {SRI_LANKA_DISTRICTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={courseForm.activeState}
                            onChange={e => setCourseForm(prev => ({ ...prev, activeState: e.target.checked }))}
                            className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-sm font-bold text-gray-900 block">Active Status</span>
                            <span className="text-xs text-gray-500">Enable to display this course program publicly on website</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Logistics & Dates Section */}
                  <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-200/60 flex items-center gap-2">
                      <Clock size={16} className="text-emerald-600" />
                      Fees, Duration, Schedule & Contact
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className={fieldLabelClass}>Course Duration</label>
                        <input
                          type="text"
                          value={courseForm.duration}
                          onChange={e => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g. 2 Days (Weekend) / 40 Hours"
                          className={fieldInputClass}
                        />
                      </div>

                      <div>
                        <label className={fieldLabelClass}>Course Fee</label>
                        <input
                          type="text"
                          value={courseForm.fee}
                          onChange={e => setCourseForm(prev => ({ ...prev, fee: e.target.value }))}
                          placeholder="e.g. LKR 5,000 / Free of Charge"
                          className={fieldInputClass}
                        />
                      </div>

                      <div>
                        <label className={fieldLabelClass}>Schedule Details</label>
                        <input
                          type="text"
                          value={courseForm.schedule}
                          onChange={e => setCourseForm(prev => ({ ...prev, schedule: e.target.value }))}
                          placeholder="e.g. Saturdays & Sundays (9 AM - 4 PM)"
                          className={fieldInputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={fieldLabelClass}>Application Closing Date</label>
                        <input
                          type="date"
                          value={courseForm.closingDate}
                          onChange={e => setCourseForm(prev => ({ ...prev, closingDate: e.target.value }))}
                          className={fieldInputClass}
                        />
                      </div>

                      <div>
                        <label className={fieldLabelClass}>Listing Expiry Date</label>
                        <input
                          type="date"
                          value={courseForm.expiryDate}
                          onChange={e => setCourseForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                          className={fieldInputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={fieldLabelClass}>WhatsApp Inquiries Number</label>
                        <input
                          type="text"
                          value={courseForm.whatsappNumber}
                          onChange={e => setCourseForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                          placeholder="e.g. 0771234567"
                          className={fieldInputClass}
                        />
                      </div>

                      <div>
                        <label className={fieldLabelClass}>Online Application URL</label>
                        <input
                          type="url"
                          value={courseForm.onlineAppUrl}
                          onChange={e => setCourseForm(prev => ({ ...prev, onlineAppUrl: e.target.value }))}
                          placeholder="e.g. https://forms.google.com/..."
                          className={fieldInputClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RICH TEXT DESCRIPTIONS */}
              {activeFormTab === 'descriptions' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  {/* Language switch header */}
                  <div className="flex items-center justify-between bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <Globe size={18} className="text-emerald-700" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-950">Content Language Mode</h4>
                        <p className="text-xs text-emerald-700">Select language tab to write rich descriptions with formatting.</p>
                      </div>
                    </div>
                    <div className="flex bg-white p-1 rounded-xl border border-emerald-200">
                      <button
                        type="button"
                        onClick={() => setDescriptionLang('en')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          descriptionLang === 'en'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        English Content
                      </button>
                      <button
                        type="button"
                        onClick={() => setDescriptionLang('si')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-sinhala ${
                          descriptionLang === 'si'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        සිංහල අන්තර්ගතය
                      </button>
                    </div>
                  </div>

                  {/* English Descriptions */}
                  {descriptionLang === 'en' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-3">
                        <label className={fieldLabelClass}>
                          Program Overview (English)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">A concise summary introducing the course aims and benefits.</p>
                        <RichTextEditor
                          value={courseForm.overviewEn}
                          onChange={value => setCourseForm(prev => ({ ...prev, overviewEn: value }))}
                          placeholder="Write concise program overview in English..."
                        />
                      </div>

                      <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-3">
                        <label className={fieldLabelClass}>
                          Detailed Description & Learning Objectives (English)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Comprehensive curriculum details, hands-on training, field visits, and learning milestones.</p>
                        <RichTextEditor
                          value={courseForm.detailedDescriptionEn}
                          onChange={value => setCourseForm(prev => ({ ...prev, detailedDescriptionEn: value }))}
                          placeholder="Write full detailed curriculum description in English..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Sinhala Descriptions */}
                  {descriptionLang === 'si' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-3">
                        <label className={fieldLabelClass}>
                          පාඨමාලා සාරාංශය (Overview - Sinhala)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">පාඨමාලාව පිළිබඳ කෙටි හැඳින්වීම සහ එහි වැදගත්කම.</p>
                        <RichTextEditor
                          value={courseForm.overviewSi}
                          onChange={value => setCourseForm(prev => ({ ...prev, overviewSi: value }))}
                          placeholder="පාඨමාලා කෙටි හැඳින්වීම සිංහලෙන් ඇතුළත් කරන්න..."
                        />
                      </div>

                      <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-3">
                        <label className={fieldLabelClass}>
                          සම්පූර්ණ පාඨමාලා විස්තරය සහ ඉගෙනුම් අරමුණු (Detailed Description - Sinhala)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">විෂය නිර්දේශයේ සියලුම අංශ, ප්‍රායෝගික පුහුණු ක්ෂේත්‍ර සහ අධ්‍යයන ප්‍රතිඵල.</p>
                        <RichTextEditor
                          value={courseForm.detailedDescriptionSi}
                          onChange={value => setCourseForm(prev => ({ ...prev, detailedDescriptionSi: value }))}
                          placeholder="සම්පූර්ණ පාඨමාලා විස්තරය සිංහලෙන් ඇතුළත් කරන්න..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CURRICULUM, BENEFITS & ELIGIBILITY */}
              {activeFormTab === 'curriculum' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  {/* Syllabus Modules */}
                  <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <BookOpen size={16} className="text-emerald-600" />
                          Syllabus Modules (විෂය නිර්දේශ ඒකක)
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">Key topics and lessons included in this short course curriculum.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => addArrayFieldItem('syllabusModulesEn')}
                          className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-200 cursor-pointer"
                        >
                          + Add English Module
                        </button>
                        <button
                          type="button"
                          onClick={() => addArrayFieldItem('syllabusModulesSi')}
                          className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-200 font-sinhala cursor-pointer"
                        >
                          + Add Sinhala Module
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <label className={fieldLabelClass}>English Modules</label>
                        {courseForm.syllabusModulesEn.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="text-xs font-mono text-gray-400 w-5">{idx + 1}.</span>
                            <input
                              type="text"
                              value={item}
                              onChange={e => handleArrayFieldChange('syllabusModulesEn', idx, e.target.value)}
                              placeholder={`e.g. Module ${idx + 1}: Soil Preparation & Nutrients`}
                              className={fieldInputClass}
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayFieldItem('syllabusModulesEn', idx)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2.5">
                        <label className={fieldLabelClass}>Sinhala Modules (සිංහල)</label>
                        {courseForm.syllabusModulesSi.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="text-xs font-mono text-gray-400 w-5">{idx + 1}.</span>
                            <input
                              type="text"
                              value={item}
                              onChange={e => handleArrayFieldChange('syllabusModulesSi', idx, e.target.value)}
                              placeholder={`උදා: පාඩම් ඒකකය ${idx + 1}: බීජ තවාන් සහ පෝෂක කළමනාකරණය`}
                              className={`${fieldInputClass} font-sinhala`}
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayFieldItem('syllabusModulesSi', idx)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Award size={16} className="text-blue-600" />
                          Key Benefits (පාඨමාලාවේ ප්‍රතිලාභ)
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">Certifications, practical kits, job opportunities or skills gained.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => addArrayFieldItem('benefitsEn')}
                          className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 cursor-pointer"
                        >
                          + Add English Benefit
                        </button>
                        <button
                          type="button"
                          onClick={() => addArrayFieldItem('benefitsSi')}
                          className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 font-sinhala cursor-pointer"
                        >
                          + Add Sinhala Benefit
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <label className={fieldLabelClass}>English Benefits</label>
                        {courseForm.benefitsEn.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="text-xs font-mono text-gray-400 w-5">{idx + 1}.</span>
                            <input
                              type="text"
                              value={item}
                              onChange={e => handleArrayFieldChange('benefitsEn', idx, e.target.value)}
                              placeholder={`e.g. Government Recognized Certificate`}
                              className={fieldInputClass}
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayFieldItem('benefitsEn', idx)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2.5">
                        <label className={fieldLabelClass}>Sinhala Benefits (සිංහල)</label>
                        {courseForm.benefitsSi.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="text-xs font-mono text-gray-400 w-5">{idx + 1}.</span>
                            <input
                              type="text"
                              value={item}
                              onChange={e => handleArrayFieldChange('benefitsSi', idx, e.target.value)}
                              placeholder={`උදා: රජයේ පිළිගත් වටිනා සහතිකපත්‍රයක්`}
                              className={`${fieldInputClass} font-sinhala`}
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayFieldItem('benefitsSi', idx)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <CheckCircle size={16} className="text-amber-600" />
                          Eligibility Requirements (සුදුසුකම්)
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">Educational qualifications, minimum age, or basic farming background.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => addArrayFieldItem('eligibilityEn')}
                          className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-200 cursor-pointer"
                        >
                          + Add English Requirement
                        </button>
                        <button
                          type="button"
                          onClick={() => addArrayFieldItem('eligibilitySi')}
                          className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-200 font-sinhala cursor-pointer"
                        >
                          + Add Sinhala Requirement
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <label className={fieldLabelClass}>English Requirements</label>
                        {courseForm.eligibilityEn.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="text-xs font-mono text-gray-400 w-5">{idx + 1}.</span>
                            <input
                              type="text"
                              value={item}
                              onChange={e => handleArrayFieldChange('eligibilityEn', idx, e.target.value)}
                              placeholder={`e.g. Open to anyone interested in agriculture`}
                              className={fieldInputClass}
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayFieldItem('eligibilityEn', idx)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2.5">
                        <label className={fieldLabelClass}>Sinhala Requirements (සිංහල)</label>
                        {courseForm.eligibilitySi.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="text-xs font-mono text-gray-400 w-5">{idx + 1}.</span>
                            <input
                              type="text"
                              value={item}
                              onChange={e => handleArrayFieldChange('eligibilitySi', idx, e.target.value)}
                              placeholder={`උදා: කෘෂිකර්මාන්තයට ලැදි ඕනෑම අයෙකුට`}
                              className={`${fieldInputClass} font-sinhala`}
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayFieldItem('eligibilitySi', idx)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: S3 MEDIA & PDF */}
              {activeFormTab === 'media' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  {/* Banner Image */}
                  <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-200/60 flex items-center gap-2">
                      <Upload size={16} className="text-emerald-600" />
                      Course Banner Image (Stored on AWS S3)
                    </h4>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      {imagePreviewUrl ? (
                        <div className="relative w-48 h-32 rounded-2xl overflow-hidden border-2 border-emerald-200 shadow-xs shrink-0 group">
                          <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreviewUrl(null);
                              setCourseForm(prev => ({ ...prev, imageUrl: '' }));
                              if (imageInputRef.current) imageInputRef.current.value = '';
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 shadow-md hover:bg-red-700 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-48 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 shrink-0 bg-white">
                          <Upload size={28} className="text-gray-300" />
                          <span className="text-xs font-semibold mt-1">No Image Uploaded</span>
                        </div>
                      )}

                      <div className="space-y-3 flex-1">
                        <input
                          type="file"
                          ref={imageInputRef}
                          accept="image/*"
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setImageFile(f);
                              setImagePreviewUrl(URL.createObjectURL(f));
                            }
                          }}
                          className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                        />
                        <p className="text-xs text-gray-500">
                          Recommended format: 16:9 aspect ratio (1200x675px) PNG or JPG. Files are automatically uploaded and served via S3 bucket.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Application Form / Syllabus PDF */}
                  <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-200/60 flex items-center gap-2">
                      <FileUp size={16} className="text-blue-600" />
                      Official Application Form or Syllabus PDF (Stored on AWS S3)
                    </h4>

                    <div className="space-y-3">
                      {courseForm.pdfLink && !pdfFile && (
                        <div className="flex items-center gap-3 text-xs bg-emerald-50 text-emerald-900 p-3.5 rounded-xl border border-emerald-200">
                          <FileText size={20} className="text-emerald-600 shrink-0" />
                          <span className="font-semibold truncate flex-1">{courseForm.pdfLink}</span>
                          <a
                            href={courseForm.pdfLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-700"
                          >
                            View <ExternalLink size={12} />
                          </a>
                          <button
                            type="button"
                            onClick={() => setCourseForm(prev => ({ ...prev, pdfLink: '' }))}
                            className="text-red-600 font-bold ml-2 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      {pdfFile && (
                        <div className="flex items-center gap-3 text-xs bg-blue-50 text-blue-900 p-3.5 rounded-xl border border-blue-200">
                          <FileText size={20} className="text-blue-600 shrink-0" />
                          <span className="font-bold flex-1">{pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPdfFile(null);
                              if (pdfInputRef.current) pdfInputRef.current.value = '';
                            }}
                            className="text-red-600 font-bold hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      <input
                        type="file"
                        ref={pdfInputRef}
                        accept=".pdf,application/pdf"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) setPdfFile(f);
                        }}
                        className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                      />
                      <p className="text-xs text-gray-500">
                        Upload official brochure, application form or curriculum schedule PDF document.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  {editingCourseId ? 'Updating existing course record' : 'Drafting new course program'}
                </span>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : editingCourseId ? 'Save Changes' : 'Publish Course'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── MODAL: CREATE / EDIT SUBJECT (ENLARGED & CONSISTENT) ── */}
      {/* ==================================================================== */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                <Layers className="text-emerald-600" size={20} />
                {editingSubjectId ? 'Edit Subject Category' : 'Create Subject Category'}
              </h2>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-8 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={fieldLabelClass}>
                    Subject Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectForm.nameEn}
                    onChange={e => {
                      const val = e.target.value;
                      setSubjectForm(prev => ({
                        ...prev,
                        nameEn: val,
                        slug: !isSubjectSlugCustom ? generateSlug(val) : prev.slug
                      }));
                    }}
                    placeholder="e.g. Organic Farming & Soil Science"
                    className={fieldInputClass}
                  />
                </div>

                <div>
                  <label className={fieldLabelClass}>
                    Subject Name (Sinhala) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectForm.nameSi}
                    onChange={e => setSubjectForm(prev => ({ ...prev, nameSi: e.target.value }))}
                    placeholder="e.g. කාබනික ගොවිතැන සහ පස් විද්‍යාව"
                    className={`${fieldInputClass} font-sinhala`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={fieldLabelClass}>
                    Unique Slug <span className="text-gray-400 font-normal text-[11px] lowercase">(frontend generated)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubjectSlugCustom(false);
                      setSubjectForm(prev => ({ ...prev, slug: generateSlug(prev.nameEn) }));
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={13} />
                    Auto-generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={subjectForm.slug}
                  onChange={e => {
                    setIsSubjectSlugCustom(true);
                    setSubjectForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                  }}
                  placeholder="organic-farming-soil"
                  className={`${fieldInputClass} font-mono text-xs`}
                />
              </div>

              <div>
                <label className={fieldLabelClass}>Description (English)</label>
                <RichTextEditor
                  value={subjectForm.descriptionEn}
                  onChange={value => setSubjectForm(prev => ({ ...prev, descriptionEn: value }))}
                  placeholder="Enter subject scope and description in English..."
                />
              </div>

              <div>
                <label className={fieldLabelClass}>Description (Sinhala)</label>
                <RichTextEditor
                  value={subjectForm.descriptionSi}
                  onChange={value => setSubjectForm(prev => ({ ...prev, descriptionSi: value }))}
                  placeholder="විෂය පථය පිළිබඳ විස්තරය සිංහලෙන් ඇතුළත් කරන්න..."
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={subjectForm.activeState}
                    onChange={e => setSubjectForm(prev => ({ ...prev, activeState: e.target.checked }))}
                    className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-gray-800">Active Status</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── MODAL: CREATE / EDIT CENTER (ENLARGED & CONSISTENT) ── */}
      {/* ==================================================================== */}
      {isCenterModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                <Building2 className="text-emerald-600" size={20} />
                {editingCenterId ? 'Edit Training Center' : 'Create Training Center'}
              </h2>
              <button onClick={() => setIsCenterModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCenter} className="p-8 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={fieldLabelClass}>
                    Center Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={centerForm.nameEn}
                    onChange={e => {
                      const val = e.target.value;
                      setCenterForm(prev => ({
                        ...prev,
                        nameEn: val,
                        slug: !isCenterSlugCustom ? generateSlug(val) : prev.slug
                      }));
                    }}
                    placeholder="e.g. In-Service Training Institute (ISTI) Gannoruwa"
                    className={fieldInputClass}
                  />
                </div>

                <div>
                  <label className={fieldLabelClass}>
                    Center Name (Sinhala) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={centerForm.nameSi}
                    onChange={e => setCenterForm(prev => ({ ...prev, nameSi: e.target.value }))}
                    placeholder="e.g. සේවාස්ථ පුහුණු ආයතනය - ගන්නෝරුව"
                    className={`${fieldInputClass} font-sinhala`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={fieldLabelClass}>District</label>
                  <select
                    value={centerForm.district}
                    onChange={e => setCenterForm(prev => ({ ...prev, district: e.target.value }))}
                    className={fieldSelectClass}
                  >
                    <option value="">-- Select District --</option>
                    {SRI_LANKA_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={fieldLabelClass}>
                      Unique Slug <span className="text-gray-400 font-normal text-[11px] lowercase">(frontend generated)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCenterSlugCustom(false);
                        setCenterForm(prev => ({ ...prev, slug: generateSlug(prev.nameEn) }));
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={13} /> Auto-generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={centerForm.slug}
                    onChange={e => {
                      setIsCenterSlugCustom(true);
                      setCenterForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                    }}
                    placeholder="isti-gannoruwa"
                    className={`${fieldInputClass} font-mono text-xs`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={fieldLabelClass}>Address (English)</label>
                  <input
                    type="text"
                    value={centerForm.addressEn}
                    onChange={e => setCenterForm(prev => ({ ...prev, addressEn: e.target.value }))}
                    placeholder="e.g. Gannoruwa, Peradeniya"
                    className={fieldInputClass}
                  />
                </div>

                <div>
                  <label className={fieldLabelClass}>Address (Sinhala)</label>
                  <input
                    type="text"
                    value={centerForm.addressSi}
                    onChange={e => setCenterForm(prev => ({ ...prev, addressSi: e.target.value }))}
                    placeholder="e.g. ගන්නෝරුව, පේරාදෙණිය"
                    className={`${fieldInputClass} font-sinhala`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={fieldLabelClass}>Phone Number</label>
                  <input
                    type="text"
                    value={centerForm.phone}
                    onChange={e => setCenterForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. 081 2388200"
                    className={fieldInputClass}
                  />
                </div>

                <div>
                  <label className={fieldLabelClass}>Official Email</label>
                  <input
                    type="email"
                    value={centerForm.email}
                    onChange={e => setCenterForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. isti@doa.gov.lk"
                    className={fieldInputClass}
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={centerForm.activeState}
                    onChange={e => setCenterForm(prev => ({ ...prev, activeState: e.target.checked }))}
                    className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-gray-800">Active Status</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCenterModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── MODAL: CREATE / EDIT TRAINER (ENLARGED & CONSISTENT) ── */}
      {/* ==================================================================== */}
      {isTrainerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                <Users className="text-emerald-600" size={20} />
                {editingTrainerId ? 'Edit Trainer' : 'Create Trainer'}
              </h2>
              <button onClick={() => setIsTrainerModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTrainer} className="p-8 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={fieldLabelClass}>
                    Trainer Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={trainerForm.nameEn}
                    onChange={e => {
                      const val = e.target.value;
                      setTrainerForm(prev => ({
                        ...prev,
                        nameEn: val,
                        slug: !isTrainerSlugCustom ? generateSlug(val) : prev.slug
                      }));
                    }}
                    placeholder="e.g. Dr. H. M. Karunaratne"
                    className={fieldInputClass}
                  />
                </div>

                <div>
                  <label className={fieldLabelClass}>
                    Trainer Name (Sinhala) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={trainerForm.nameSi}
                    onChange={e => setTrainerForm(prev => ({ ...prev, nameSi: e.target.value }))}
                    placeholder="e.g. ආචාර්ය එච්. එම්. කරුණාරත්න"
                    className={`${fieldInputClass} font-sinhala`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={fieldLabelClass}>
                    Unique Slug <span className="text-gray-400 font-normal text-[11px] lowercase">(frontend generated)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTrainerSlugCustom(false);
                      setTrainerForm(prev => ({ ...prev, slug: generateSlug(prev.nameEn) }));
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={13} /> Auto-generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={trainerForm.slug}
                  onChange={e => {
                    setIsTrainerSlugCustom(true);
                    setTrainerForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                  }}
                  placeholder="dr-h-m-karunaratne"
                  className={`${fieldInputClass} font-mono text-xs`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={fieldLabelClass}>Position / Title (English)</label>
                  <input
                    type="text"
                    value={trainerForm.positionEn}
                    onChange={e => setTrainerForm(prev => ({ ...prev, positionEn: e.target.value }))}
                    placeholder="e.g. Senior Agricultural Research Officer"
                    className={fieldInputClass}
                  />
                </div>

                <div>
                  <label className={fieldLabelClass}>Position / Title (Sinhala)</label>
                  <input
                    type="text"
                    value={trainerForm.positionSi}
                    onChange={e => setTrainerForm(prev => ({ ...prev, positionSi: e.target.value }))}
                    placeholder="e.g. ජ්‍යෙෂ්ඨ කෘෂිකර්ම පර්යේෂණ නිලධාරී"
                    className={`${fieldInputClass} font-sinhala`}
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={trainerForm.activeState}
                    onChange={e => setTrainerForm(prev => ({ ...prev, activeState: e.target.checked }))}
                    className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-gray-800">Active Status</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTrainerModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Trainer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── MODAL: PREVIEW COURSE DETAILS (LARGE & RICH HTML RENDER) ── */}
      {/* ==================================================================== */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                <Eye size={20} className="text-emerald-600" />
                Course Program Preview
              </h2>
              <button onClick={() => setPreviewCourse(null)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Header with image */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {previewCourse.imageUrl && (
                  <img
                    src={previewCourse.imageUrl}
                    alt={previewCourse.titleEn}
                    className="w-full sm:w-60 h-40 rounded-2xl object-cover border border-gray-200 shrink-0 shadow-xs"
                  />
                )}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold">
                      {previewCourse.shortCourseSubject?.nameEn}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${previewCourse.activeState ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'}`}>
                      {previewCourse.activeState ? 'Active' : 'Inactive'}
                    </span>
                    {(previewCourse.district || previewCourse.shortCourseCenter?.district) && (
                      <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                        <MapPin size={12} /> {previewCourse.district || previewCourse.shortCourseCenter?.district}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">{previewCourse.titleEn}</h3>
                  <h4 className="text-base text-gray-600 font-sinhala">{previewCourse.titleSi}</h4>
                  <p className="text-xs text-gray-400 font-mono">slug: {previewCourse.slug}</p>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[10px] tracking-wider">Duration</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">{previewCourse.duration || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[10px] tracking-wider">Fee</span>
                  <span className="font-bold text-emerald-700 text-sm mt-0.5 block">{previewCourse.fee || 'Free'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[10px] tracking-wider">Application Deadline</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                    {previewCourse.closingDate ? new Date(previewCourse.closingDate).toLocaleDateString() : 'Open Intake'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[10px] tracking-wider">Schedule</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">{previewCourse.schedule || 'Regular'}</span>
                </div>
              </div>

              {/* Center & Trainer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-1.5 text-xs">
                  <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Building2 size={16} className="text-emerald-600" />
                    Training Center
                  </p>
                  <p className="font-bold text-gray-800 text-sm">{previewCourse.shortCourseCenter?.nameEn}</p>
                  <p className="text-gray-500 font-sinhala">{previewCourse.shortCourseCenter?.nameSi}</p>
                  {previewCourse.shortCourseCenter?.phone && <p className="text-gray-600 mt-1">Phone: {previewCourse.shortCourseCenter.phone}</p>}
                </div>

                <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-1.5 text-xs">
                  <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Users size={16} className="text-emerald-600" />
                    Trainer / Instructor
                  </p>
                  <p className="font-bold text-gray-800 text-sm">{previewCourse.shortCourseTrainer?.nameEn || 'Unassigned'}</p>
                  <p className="text-gray-500">{previewCourse.shortCourseTrainer?.positionEn || ''}</p>
                </div>
              </div>

              {/* Overviews (Rich HTML) */}
              {(previewCourse.overviewEn || previewCourse.overviewSi) && (
                <div className="space-y-3">
                  <p className="font-bold text-gray-900 uppercase text-xs tracking-wider">Program Overview</p>
                  {previewCourse.overviewEn && (
                    <div
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewCourse.overviewEn }}
                    />
                  )}
                  {previewCourse.overviewSi && (
                    <div
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700 font-sinhala leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewCourse.overviewSi }}
                    />
                  )}
                </div>
              )}

              {/* Detailed Description (Rich HTML) */}
              {(previewCourse.detailedDescriptionEn || previewCourse.detailedDescriptionSi) && (
                <div className="space-y-3">
                  <p className="font-bold text-gray-900 uppercase text-xs tracking-wider">Detailed Curriculum Description</p>
                  {previewCourse.detailedDescriptionEn && (
                    <div
                      className="p-5 bg-white rounded-xl border border-gray-200 text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewCourse.detailedDescriptionEn }}
                    />
                  )}
                  {previewCourse.detailedDescriptionSi && (
                    <div
                      className="p-5 bg-white rounded-xl border border-gray-200 text-sm text-gray-800 font-sinhala leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewCourse.detailedDescriptionSi }}
                    />
                  )}
                </div>
              )}

              {/* Syllabus modules */}
              {previewCourse.syllabusModulesEn && previewCourse.syllabusModulesEn.length > 0 && (
                <div className="space-y-3">
                  <p className="font-bold text-gray-900 uppercase text-xs tracking-wider">Curriculum Modules</p>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    {previewCourse.syllabusModulesEn.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* PDF Document */}
              {previewCourse.pdfLink && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-emerald-950 font-bold">
                    <FileText size={22} className="text-emerald-700" />
                    <span>Official Syllabus / Application PDF attached (AWS S3)</span>
                  </div>
                  <a
                    href={previewCourse.pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    Open Document <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end bg-gray-50">
              <button
                onClick={() => setPreviewCourse(null)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PREVIEW SUBJECT ── */}
      {viewingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingSubject(null)} />
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{viewingSubject.nameEn}</h3>
                {viewingSubject.nameSi && <p className="text-xs text-emerald-700 font-medium">{viewingSubject.nameSi}</p>}
              </div>
              <button
                onClick={() => setViewingSubject(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${viewingSubject.activeState ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  {viewingSubject.activeState ? 'Active' : 'Inactive'}
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  slug: {viewingSubject.slug}
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {viewingSubject._count?.shortCourses || 0} Linked Courses
                </span>
              </div>

              {viewingSubject.descriptionEn && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (English)</h4>
                  <div className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100" dangerouslySetInnerHTML={{ __html: viewingSubject.descriptionEn }} />
                </div>
              )}

              {viewingSubject.descriptionSi && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">විස්තරය (Sinhala)</h4>
                  <div className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100" dangerouslySetInnerHTML={{ __html: viewingSubject.descriptionSi }} />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const id = viewingSubject.id;
                  setViewingSubject(null);
                  handleFilterCoursesByAssociate('subject', id);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen size={13} />
                View Courses
              </button>
              <button
                onClick={() => {
                  const s = viewingSubject;
                  setViewingSubject(null);
                  openEditSubject(s);
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <Edit size={13} />
                Edit
              </button>
              <button
                onClick={() => setViewingSubject(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 text-xs font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PREVIEW CENTER ── */}
      {viewingCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingCenter(null)} />
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{viewingCenter.nameEn}</h3>
                {viewingCenter.nameSi && <p className="text-xs text-emerald-700 font-medium">{viewingCenter.nameSi}</p>}
              </div>
              <button
                onClick={() => setViewingCenter(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${viewingCenter.activeState ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  {viewingCenter.activeState ? 'Active' : 'Inactive'}
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  slug: {viewingCenter.slug}
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {viewingCenter._count?.shortCourses || 0} Linked Courses
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">District</span>
                  <span className="font-semibold text-slate-800">{viewingCenter.district || '-'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Phone</span>
                  <span className="font-semibold text-slate-800">{viewingCenter.phone || '-'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                  <span className="text-slate-400 block mb-0.5">Email</span>
                  <span className="font-medium text-slate-800">{viewingCenter.email || '-'}</span>
                </div>
              </div>

              {viewingCenter.addressEn && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Address (English)</h4>
                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-wrap">{viewingCenter.addressEn}</p>
                </div>
              )}

              {viewingCenter.addressSi && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ලිපිනය (Sinhala)</h4>
                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-wrap">{viewingCenter.addressSi}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const id = viewingCenter.id;
                  setViewingCenter(null);
                  handleFilterCoursesByAssociate('center', id);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen size={13} />
                View Courses
              </button>
              <button
                onClick={() => {
                  const c = viewingCenter;
                  setViewingCenter(null);
                  openEditCenter(c);
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <Edit size={13} />
                Edit
              </button>
              <button
                onClick={() => setViewingCenter(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 text-xs font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PREVIEW TRAINER ── */}
      {viewingTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingTrainer(null)} />
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{viewingTrainer.nameEn}</h3>
                {viewingTrainer.nameSi && <p className="text-xs text-emerald-700 font-medium">{viewingTrainer.nameSi}</p>}
              </div>
              <button
                onClick={() => setViewingTrainer(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${viewingTrainer.activeState ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  {viewingTrainer.activeState ? 'Active' : 'Inactive'}
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  slug: {viewingTrainer.slug}
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {viewingTrainer._count?.shortCourses || 0} Linked Courses
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Position (EN)</span>
                  <span className="font-semibold text-slate-800">{viewingTrainer.positionEn || '-'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">තනතුර (SI)</span>
                  <span className="font-semibold text-slate-800">{viewingTrainer.positionSi || '-'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const id = viewingTrainer.id;
                  setViewingTrainer(null);
                  handleFilterCoursesByAssociate('trainer', id);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen size={13} />
                View Courses
              </button>
              <button
                onClick={() => {
                  const t = viewingTrainer;
                  setViewingTrainer(null);
                  openEditTrainer(t);
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <Edit size={13} />
                Edit
              </button>
              <button
                onClick={() => setViewingTrainer(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 text-xs font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
