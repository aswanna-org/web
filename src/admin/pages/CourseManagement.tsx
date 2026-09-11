import { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, X, Search, BookOpen, Upload,
  Clock, MapPin, Award, CheckCircle, DollarSign, Users, ExternalLink,
  Layers, FileText, GraduationCap, Eye,
  ChevronUp, ChevronDown, Check, UserCheck, AlertCircle,
  Phone, Mail, MessageSquare, CheckCircle2, XCircle
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ==========================================
// CONSTANTS & ENUMS (User Specified)
// ==========================================
export const QUALIFICATION_LEVELS = [
  'NVQ 3 (සහතිකය)',
  'NVQ 4 (ශිල්පීය සහතිකය)',
  'NVQ 5 (ඩිප්ලෝමා)',
  'NVQ 6 (උසස් ඩිප්ලෝමා)',
  'NVQ 7 / SLQF 6 (ප්‍රථම උපාධිය)',
  'SLQF 7 (පශ්චාත් උපාධි සහතිකය)',
  'SLQF 8 (පශ්චාත් උපාධි ඩිප්ලෝමාව)',
  'SLQF 9 (ශාස්ත්‍රපති / විද්‍යාපති පාඨමාලා උපාධිය)',
  'SLQF 10 (පර්යේෂණ සහිත ශාස්ත්‍රපති / විද්‍යාපති උපාධිය)',
  'SLQF 11 (දර්ශනපති උපාධිය - M.Phil)',
  'SLQF 12 (ආචාර්ය උපාධිය - Ph.D)'
];

export const DELIVERY_MODES = [
  { value: 'Physical_Farm', label: 'Physical Farm / ක්ෂේත්‍ර පුහුණුව' },
  { value: 'Hybrid_Blended', label: 'Hybrid (Blended) / මිශ්‍ර ක්‍රමය' },
  { value: 'Online_Lectures', label: 'Online Lectures / මාර්ගගත දේශන' },
  { value: 'Full_Time_Residential', label: 'Full Time Residential / පූර්ණකාලීන නේවාසික' }
];

export const DURATION_UNITS = [
  { value: 'Hours', label: 'Hours / පැය' },
  { value: 'Days', label: 'Days / දින' },
  { value: 'Weeks', label: 'Weeks / සති' },
  { value: 'Months', label: 'Months / මාස' },
  { value: 'Years', label: 'Years / වසර' }
];

export const MEDIUM_OPTIONS = ['සිංහල', 'English', 'தமிழ்'];
export const STATUS_OPTIONS = ['Draft', 'Published', 'Archived'];

interface CourseModule {
  id?: string;
  moduleOrder: number;
  moduleTitle: string;
  moduleDescription?: string;
}

interface CourseCategory {
  id: string;
  categoryNameSi: string;
  categoryNameEn: string;
  slug: string;
  iconClass?: string;
}

interface Instructor {
  id: string;
  fullName: string;
  designation?: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  bio?: string;
  profileImageUrl?: string;
}

interface CourseApplication {
  id: string;
  courseId: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail?: string | null;
  applicantNic?: string | null;
  applicantDistrict?: string | null;
  remarks?: string | null;
  status: string; // 'Pending' | 'Approved' | 'Contacted' | 'Rejected'
  appliedAt: string;
  course?: {
    id: string;
    courseCode: string;
    title: string;
    courseLevel: string;
    courseFee: number;
    category?: {
      categoryNameSi: string;
      categoryNameEn: string;
    };
  };
}

interface Course {
  id: string;
  courseCode: string;
  title: string;
  slug: string;
  categoryId: string;
  instructorId?: string | null;
  courseLevel: string;
  deliveryMode: string;
  mediums: string[];
  description?: string | null;
  durationValue: number;
  durationUnit: string;
  startDate?: string | null;
  deadlineDate?: string | null;
  classSchedule?: string | null;
  venueLocation?: string | null;
  entryRequirements?: string | null;
  certificateType?: string | null;
  accreditedBy?: string | null;
  courseFee: number;
  maxIntake?: number | null;
  applyUrl?: string | null;
  bannerImageUrl?: string | null;
  status: string;
  internalNotes?: string | null;
  createdAt: string;
  category?: CourseCategory;
  instructor?: Instructor;
  modules?: CourseModule[];
  _count?: { modules: number; applications: number };
}

const defaultFormData = {
  courseCode: '',
  title: '',
  slug: '',
  categoryId: '',
  instructorId: '',
  courseLevel: 'NVQ 4 (ශිල්පීය සහතිකය)',
  deliveryMode: 'Physical_Farm',
  mediums: ['සිංහල'],
  description: '',
  durationValue: 3,
  durationUnit: 'Months',
  startDate: '',
  deadlineDate: '',
  classSchedule: '',
  venueLocation: '',
  entryRequirements: '',
  certificateType: 'රජයේ පිළිගත් නිපුණතා සහතිකය',
  accreditedBy: 'TVEC / කෘෂිකර්ම දෙපාර්තමේන්තුව',
  courseFee: 0,
  maxIntake: 30,
  applyUrl: '',
  bannerImageUrl: '',
  status: 'Draft',
  internalNotes: '',
};

export default function CourseManagement() {
  // Top View Mode
  const [viewMode, setViewMode] = useState<'courses' | 'applications'>('courses');

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Course Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [kpis, setKpis] = useState({ total: 0, published: 0, draft: 0, archived: 0, free: 0 });

  // Applications State
  const [applications, setApplications] = useState<CourseApplication[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [appCurrentPage, setAppCurrentPage] = useState(1);
  const [appTotalPages, setAppTotalPages] = useState(1);
  const [appSearch, setAppSearch] = useState('');
  const [appFilterStatus, setAppFilterStatus] = useState('all');
  const [appFilterCourse, setAppFilterCourse] = useState('all');
  const [appKpis, setAppKpis] = useState({ total: 0, pending: 0, approved: 0, contacted: 0, rejected: 0 });
  const [selectedApp, setSelectedApp] = useState<CourseApplication | null>(null);
  const [isAppDetailModalOpen, setIsAppDetailModalOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'classification' | 'schedule' | 'requirements' | 'modules'>('basic');
  const [form, setForm] = useState(defaultFormData);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Quick Modals for Category & Instructor
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatForm, setNewCatForm] = useState({ categoryNameSi: '', categoryNameEn: '', slug: '', iconClass: 'fa-leaf' });

  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [newInsForm, setNewInsForm] = useState({ fullName: '', designation: '', phone: '', whatsappNumber: '', email: '', bio: '' });

  // Preview Modal
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  const token = localStorage.getItem('admin_token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchCourses = async (page = 1) => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/courses/admin/all?page=${page}&limit=12`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (filterCategory !== 'all') url += `&categoryId=${filterCategory}`;
      if (filterStatus !== 'all') url += `&status=${filterStatus}`;
      if (filterLevel !== 'all') url += `&courseLevel=${encodeURIComponent(filterLevel)}`;

      const res = await fetch(url, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.data || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
        if (data.kpis) setKpis(data.kpis);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async (page = 1) => {
    setAppLoading(true);
    try {
      let url = `${API_BASE_URL}/courses/admin/applications?page=${page}&limit=12`;
      if (appSearch) url += `&search=${encodeURIComponent(appSearch)}`;
      if (appFilterStatus !== 'all') url += `&status=${appFilterStatus}`;
      if (appFilterCourse !== 'all') url += `&courseId=${appFilterCourse}`;

      const res = await fetch(url, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.data || []);
        if (data.meta) setAppTotalPages(data.meta.totalPages);
        if (data.kpis) setAppKpis(data.kpis);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setAppLoading(false);
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: string, remarks?: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/admin/applications/${appId}`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(remarks !== undefined ? { remarks } : {}) })
      });

      if (res.ok) {
        const updated = await res.json();
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: updated.status, remarks: updated.remarks } : a));
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp(prev => prev ? { ...prev, status: updated.status, remarks: updated.remarks } : null);
        }
        setSuccessMsg(`Status updated to "${status}".`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchApplications(appCurrentPage);
      }
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
  };

  const handleDeleteApp = async (appId: string, applicantName: string) => {
    if (!confirm(`Are you sure you want to delete the application from "${applicantName}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/courses/admin/applications/${appId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        setSuccessMsg('Application deleted successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
        if (isAppDetailModalOpen && selectedApp?.id === appId) {
          setIsAppDetailModalOpen(false);
        }
        fetchApplications(appCurrentPage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategoriesAndInstructors = async () => {
    try {
      const [catRes, insRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/categories?all=true`),
        fetch(`${API_BASE_URL}/courses/instructors`)
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (insRes.ok) setInstructors(await insRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage, search, filterCategory, filterStatus, filterLevel]);

  useEffect(() => {
    fetchApplications(appCurrentPage);
  }, [appCurrentPage, appSearch, appFilterStatus, appFilterCourse]);

  useEffect(() => {
    fetchCategoriesAndInstructors();
  }, []);

  const openCreateModal = () => {
    setForm({
      ...defaultFormData,
      categoryId: categories.length > 0 ? categories[0].id : '',
      instructorId: instructors.length > 0 ? instructors[0].id : '',
    });
    setModules([
      { moduleOrder: 1, moduleTitle: '', moduleDescription: '' }
    ]);
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setActiveTab('basic');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setForm({
      courseCode: course.courseCode || '',
      title: course.title || '',
      slug: course.slug || '',
      categoryId: course.categoryId || '',
      instructorId: course.instructorId || '',
      courseLevel: course.courseLevel || 'NVQ 4 (ශිල්පීය සහතිකය)',
      deliveryMode: course.deliveryMode || 'Physical_Farm',
      mediums: Array.isArray(course.mediums) ? course.mediums : ['සිංහල'],
      description: course.description || '',
      durationValue: course.durationValue || 3,
      durationUnit: course.durationUnit || 'Months',
      startDate: course.startDate ? course.startDate.split('T')[0] : '',
      deadlineDate: course.deadlineDate ? course.deadlineDate.split('T')[0] : '',
      classSchedule: course.classSchedule || '',
      venueLocation: course.venueLocation || '',
      entryRequirements: course.entryRequirements || '',
      certificateType: course.certificateType || 'රජයේ පිළිගත් නිපුණතා සහතිකය',
      accreditedBy: course.accreditedBy || 'TVEC / කෘෂිකර්ම දෙපාර්තමේන්තුව',
      courseFee: course.courseFee || 0,
      maxIntake: course.maxIntake || 30,
      applyUrl: course.applyUrl || '',
      bannerImageUrl: course.bannerImageUrl || '',
      status: course.status || 'Draft',
      internalNotes: course.internalNotes || '',
    });

    if (course.modules && course.modules.length > 0) {
      setModules(course.modules.map(m => ({
        id: m.id,
        moduleOrder: m.moduleOrder,
        moduleTitle: m.moduleTitle,
        moduleDescription: m.moduleDescription || ''
      })));
    } else {
      setModules([{ moduleOrder: 1, moduleTitle: '', moduleDescription: '' }]);
    }

    setImageFile(null);
    setImagePreview(course.bannerImageUrl || null);
    setEditingId(course.id);
    setActiveTab('basic');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setForm(prev => ({ ...prev, title: val, slug: editingId ? prev.slug : slug }));
  };

  const handleMediumToggle = (medium: string) => {
    setForm(prev => {
      const current = [...prev.mediums];
      if (current.includes(medium)) {
        if (current.length === 1) return prev;
        return { ...prev, mediums: current.filter(m => m !== medium) };
      } else {
        return { ...prev, mediums: [...current, medium] };
      }
    });
  };

  const addModule = () => {
    setModules(prev => [
      ...prev,
      { moduleOrder: prev.length + 1, moduleTitle: '', moduleDescription: '' }
    ]);
  };

  const updateModule = (index: number, field: keyof CourseModule, value: any) => {
    setModules(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeModule = (index: number) => {
    setModules(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((m, idx) => ({ ...m, moduleOrder: idx + 1 }));
    });
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === modules.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...modules];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setModules(updated.map((m, idx) => ({ ...m, moduleOrder: idx + 1 })));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'mediums') {
          fd.append('mediums', JSON.stringify(v));
        } else if (v !== null && v !== undefined) {
          fd.append(k, String(v));
        }
      });

      const validModules = modules.filter(m => m.moduleTitle.trim() !== '');
      fd.append('modules', JSON.stringify(validModules));

      if (imageFile) {
        fd.append('image', imageFile);
      }

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE_URL}/courses/${editingId}` : `${API_BASE_URL}/courses`;

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: fd
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to save course.');
      }

      setSuccessMsg(editingId ? 'Course updated successfully!' : 'Course created successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsModalOpen(false);
      fetchCourses(currentPage);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        setSuccessMsg('Course deleted successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchCourses(currentPage);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete course.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete course.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/courses/categories`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(newCatForm)
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories(prev => [...prev, newCat]);
        setForm(prev => ({ ...prev, categoryId: newCat.id }));
        setIsCategoryModalOpen(false);
        setNewCatForm({ categoryNameSi: '', categoryNameEn: '', slug: '', iconClass: 'fa-leaf' });
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create category.');
      }
    } catch (err) {
      alert('Error creating category.');
    }
  };

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/courses/instructors`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(newInsForm)
      });
      if (res.ok) {
        const newIns = await res.json();
        setInstructors(prev => [...prev, newIns]);
        setForm(prev => ({ ...prev, instructorId: newIns.id }));
        setIsInstructorModalOpen(false);
        setNewInsForm({ fullName: '', designation: '', phone: '', whatsappNumber: '', email: '', bio: '' });
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create instructor.');
      }
    } catch (err) {
      alert('Error creating instructor.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header (Clean & Professional) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold tracking-wider uppercase mb-1">
            <GraduationCap size={16} /> Agricultural Education & Training
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">කෘෂිකාර්මික පාඨමාලා කළමනාකරණය</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Manage course curriculum, NVQ/SLQF qualification standards, syllabus modules, and admissions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3.5 py-2 rounded-xl font-medium text-xs border border-gray-200 transition-colors"
          >
            <Layers size={15} /> New Category
          </button>
          <button
            onClick={() => setIsInstructorModalOpen(true)}
            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3.5 py-2 rounded-xl font-medium text-xs border border-gray-200 transition-colors"
          >
            <UserCheck size={15} /> New Instructor
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      {/* ── View Switcher: Courses vs Applications ── */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setViewMode('courses')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            viewMode === 'courses'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <BookOpen size={17} />
          <span>පාඨමාලා ලැයිස්තුව (Courses)</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${viewMode === 'courses' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
            {kpis.total}
          </span>
        </button>

        <button
          onClick={() => {
            setViewMode('applications');
            fetchApplications(1);
          }}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
            viewMode === 'applications'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <UserCheck size={17} />
          <span>ලැබුණු අයදුම්පත් (Applications)</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${viewMode === 'applications' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
            {appKpis.total}
          </span>
          {appKpis.pending > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              {appKpis.pending} New
            </span>
          )}
        </button>
      </div>

      {/* ── Success Alert ── */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 text-xs font-medium">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── VIEW 1: COURSES MANAGEMENT ── */}
      {/* ==================================================================== */}
      {viewMode === 'courses' && (
        <div className="space-y-6">
          {/* ── KPI Widgets (Courses) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Courses</p>
                <p className="text-xl font-bold text-gray-900">{kpis.total}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Published</p>
                <p className="text-xl font-bold text-emerald-700">{kpis.published}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Drafts</p>
                <p className="text-xl font-bold text-amber-700">{kpis.draft}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Free Courses</p>
                <p className="text-xl font-bold text-blue-700">{kpis.free}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3.5 col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Instructors</p>
                <p className="text-xl font-bold text-gray-900">{instructors.length}</p>
              </div>
            </div>
          </div>

          {/* ── Course Filters Bar ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3.5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search title, code..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div>
                <select
                  value={filterCategory}
                  onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="all">All Categories (සියලු කාණ්ඩ)</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.categoryNameEn} ({c.categoryNameSi})</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterLevel}
                  onChange={e => { setFilterLevel(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="all">All Qualification Levels</option>
                  {QUALIFICATION_LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="all">All Statuses</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Courses Table ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20 gap-3">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500 font-medium">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-base font-bold text-gray-800">No Courses Found</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">No courses matched the criteria.</p>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-xs hover:bg-emerald-700"
                >
                  <Plus size={14} /> Add First Course
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px] uppercase font-semibold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Course</th>
                      <th className="px-5 py-3.5">Category & Level</th>
                      <th className="px-5 py-3.5">Duration & Mode</th>
                      <th className="px-5 py-3.5">Fee</th>
                      <th className="px-5 py-3.5">Instructor</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courses.map(course => (
                      <tr key={course.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                              {course.bannerImageUrl ? (
                                <img src={course.bannerImageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <BookOpen size={16} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p className="font-semibold text-gray-900 truncate text-xs sm:text-sm">
                                {course.title}
                              </p>
                              <span className="font-mono text-[11px] text-gray-500 font-medium">
                                {course.courseCode}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-800 text-xs">{course.category?.categoryNameEn || '-'}</p>
                          <p className="text-[11px] text-gray-500 truncate max-w-[180px]">{course.courseLevel}</p>
                        </td>

                        <td className="px-5 py-3.5 text-xs text-gray-600">
                          <p className="font-medium text-gray-800">{course.durationValue} {course.durationUnit}</p>
                          <p className="text-[11px] text-gray-500">{course.deliveryMode.replace('_', ' ')}</p>
                        </td>

                        <td className="px-5 py-3.5 text-xs">
                          {course.courseFee === 0 ? (
                            <span className="font-bold text-emerald-700">Free</span>
                          ) : (
                            <span className="font-bold text-gray-900">Rs. {course.courseFee.toLocaleString()}</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-xs text-gray-600">
                          {course.instructor?.fullName || <span className="text-gray-400 italic">None</span>}
                        </td>

                        <td className="px-5 py-3.5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            course.status === 'Published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : course.status === 'Draft'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {course.status}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setPreviewCourse(course)}
                              className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => openEditModal(course)}
                              className="p-1.5 text-gray-400 hover:text-blue-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(course.id, course.title)}
                              className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Delete"
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

            {courses.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50/50">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={kpis.total}
                  pageSize={12}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── VIEW 2: COURSE APPLICATIONS MANAGEMENT ── */}
      {/* ==================================================================== */}
      {viewMode === 'applications' && (
        <div className="space-y-6">
          {/* ── KPI Widgets (Applications) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Applications</p>
                <p className="text-xl font-bold text-gray-900">{appKpis.total}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Review</p>
                <p className="text-xl font-bold text-amber-900">{appKpis.pending}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Approved / Enrolled</p>
                <p className="text-xl font-bold text-emerald-900">{appKpis.approved}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Contacted</p>
                <p className="text-xl font-bold text-blue-900">{appKpis.contacted}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3.5 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                <XCircle size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rejected</p>
                <p className="text-xl font-bold text-rose-700">{appKpis.rejected}</p>
              </div>
            </div>
          </div>

          {/* ── Applications Filters Bar ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3.5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-2">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applicant name, phone, email, NIC, course code..."
                  value={appSearch}
                  onChange={e => { setAppSearch(e.target.value); setAppCurrentPage(1); }}
                  className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div>
                <select
                  value={appFilterStatus}
                  onChange={e => { setAppFilterStatus(e.target.value); setAppCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="all">All Application Statuses</option>
                  <option value="Pending">⏳ Pending (සලකා බැලෙමින් පවතී)</option>
                  <option value="Contacted">📞 Contacted (සම්බන්ධ කරගත්)</option>
                  <option value="Approved">✅ Approved (අනුමත කළ / ලියාපදිංචි)</option>
                  <option value="Rejected">❌ Rejected (ප්‍රතික්ෂේපිත)</option>
                </select>
              </div>

              <div>
                <select
                  value={appFilterCourse}
                  onChange={e => { setAppFilterCourse(e.target.value); setAppCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="all">All Courses (සියලු පාඨමාලා)</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.courseCode} - {c.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Applications Data Table ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {appLoading ? (
              <div className="flex flex-col justify-center items-center py-20 gap-3">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500 font-medium">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <UserCheck size={24} />
                </div>
                <h3 className="text-base font-bold text-gray-800">No Applications Received Yet</h3>
                <p className="text-xs text-gray-500 mt-1">When students apply for courses through the website, their applications will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px] uppercase font-semibold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Applicant Info</th>
                      <th className="px-5 py-3.5">Contact Details</th>
                      <th className="px-5 py-3.5">Applied Course</th>
                      <th className="px-5 py-3.5">District</th>
                      <th className="px-5 py-3.5">Applied Date</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Applicant Name & NIC */}
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-bold text-gray-900 text-xs sm:text-sm">{app.applicantName}</p>
                            {app.applicantNic && (
                              <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                NIC: {app.applicantNic}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Contact details */}
                        <td className="px-5 py-3.5 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-medium text-gray-800">
                              <Phone size={13} className="text-emerald-700 shrink-0" />
                              <a href={`tel:${app.applicantPhone}`} className="hover:underline text-emerald-800 font-mono">
                                {app.applicantPhone}
                              </a>
                              <a
                                href={`https://wa.me/${app.applicantPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 ml-1"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare size={13} />
                              </a>
                            </div>
                            {app.applicantEmail && (
                              <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                                <Mail size={12} className="text-gray-400 shrink-0" />
                                <a href={`mailto:${app.applicantEmail}`} className="hover:underline truncate max-w-[170px]">
                                  {app.applicantEmail}
                                </a>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Course */}
                        <td className="px-5 py-3.5">
                          {app.course ? (
                            <div>
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                                {app.course.courseCode}
                              </span>
                              <p className="font-semibold text-gray-900 text-xs mt-0.5 max-w-xs truncate">
                                {app.course.title}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Course #{app.courseId.slice(0, 8)}</span>
                          )}
                        </td>

                        {/* District */}
                        <td className="px-5 py-3.5 text-xs text-gray-600">
                          {app.applicantDistrict || <span className="text-gray-400 italic">-</span>}
                        </td>

                        {/* Applied Date */}
                        <td className="px-5 py-3.5 text-xs text-gray-500">
                          <div className="font-medium text-gray-700">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {new Date(app.appliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* Status dropdown with inline instant update */}
                        <td className="px-5 py-3.5">
                          <select
                            value={app.status}
                            onChange={e => handleUpdateAppStatus(app.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer outline-none ${
                              app.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-1 focus:ring-emerald-500'
                                : app.status === 'Pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 focus:ring-1 focus:ring-amber-500'
                                : app.status === 'Contacted'
                                ? 'bg-blue-50 text-blue-800 border-blue-300 focus:ring-1 focus:ring-blue-500'
                                : 'bg-rose-50 text-rose-800 border-rose-300 focus:ring-1 focus:ring-rose-500'
                            }`}
                          >
                            <option value="Pending">⏳ Pending</option>
                            <option value="Contacted">📞 Contacted</option>
                            <option value="Approved">✅ Approved</option>
                            <option value="Rejected">❌ Rejected</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { setSelectedApp(app); setIsAppDetailModalOpen(true); }}
                              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="View Application Details"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteApp(app.id, app.applicantName)}
                              className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Application"
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

            {applications.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50/50">
                <Pagination
                  currentPage={appCurrentPage}
                  totalPages={appTotalPages}
                  totalItems={appKpis.total}
                  pageSize={12}
                  onPageChange={setAppCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── EXTRA LARGE, ULTRA-WIDE POPUP MODAL (w-[96vw] max-w-7xl h-[94vh]) ── */}
      {/* ==================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          {/* Modal Container: Extra Wide max-w-7xl (almost full screen), Height 94vh */}
          <div className="bg-white rounded-2xl w-[96vw] max-w-7xl h-[94vh] relative z-10 shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Clean Modal Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? 'පාඨමාලාව සංස්කරණය (Edit Course Details)' : 'නව පාඨමාලාවක් ඇතුළත් කිරීම (Add New Course)'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter curriculum details, NVQ/SLQF qualification standards, syllabus modules, schedule and fees.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mx-8 mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 shrink-0 font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Clean Tab Navigation */}
            <div className="flex border-b border-gray-200 bg-gray-50/80 px-8 overflow-x-auto shrink-0 gap-2 pt-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
                  activeTab === 'basic'
                    ? 'border-emerald-600 text-emerald-950 bg-white font-bold shadow-sm'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen size={16} /> 1. මූලික විස්තර (Basic Info)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('classification')}
                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
                  activeTab === 'classification'
                    ? 'border-emerald-600 text-emerald-950 bg-white font-bold shadow-sm'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Award size={16} /> 2. මට්ටම සහ මාධ්‍ය (Level & Mode)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
                  activeTab === 'schedule'
                    ? 'border-emerald-600 text-emerald-950 bg-white font-bold shadow-sm'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock size={16} /> 3. කාලසටහන සහ ස්ථානය (Schedule & Venue)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('requirements')}
                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
                  activeTab === 'requirements'
                    ? 'border-emerald-600 text-emerald-950 bg-white font-bold shadow-sm'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <DollarSign size={16} /> 4. සුදුසුකම් සහ ගාස්තු (Fees & Requirements)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('modules')}
                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
                  activeTab === 'modules'
                    ? 'border-emerald-600 text-emerald-950 bg-white font-bold shadow-sm'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layers size={16} /> 5. විෂය නිර්දේශයේ මොඩියුල ({modules.length}) (Syllabus)
              </button>
            </div>

            {/* Modal Body Form - Spacious with smooth scrolling */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              
              {/* ── TAB 1: BASIC INFO ── */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                      පාඨමාලා නාමය (Course Title) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="උදා: වාණිජ කාබනික ගෙවතු වගාව සහ හරිතාගාර තාක්ෂණය"
                      value={form.title}
                      onChange={e => handleTitleChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        පාඨමාලා අනන්‍ය කේතය (Course Code) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="උදා: AGRI-ORG-2026"
                        value={form.courseCode}
                        onChange={e => setForm({ ...form, courseCode: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        URL Slug (SEO අනන්‍යකාරකය) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="commercial-organic-gardening-2026"
                        value={form.slug}
                        onChange={e => setForm({ ...form, slug: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono text-gray-600 focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        ප්‍රකාශන තත්ත්වය (Status) *
                      </label>
                      <select
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none bg-white"
                      >
                        <option value="Draft">Draft (කටුසටහන - අභ්‍යන්තර භාවිතයට)</option>
                        <option value="Published">Published (ප්‍රකාශිත - වෙබ් අඩවියේ පෙන්වයි)</option>
                        <option value="Archived">Archived (ලේඛනගත)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                          පාඨමාලා කාණ්ඩය (Category) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCategoryModalOpen(true)}
                          className="text-xs text-emerald-700 hover:underline font-semibold"
                        >
                          + New Category
                        </button>
                      </div>
                      <select
                        required
                        value={form.categoryId}
                        onChange={e => setForm({ ...form, categoryId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none bg-white"
                      >
                        <option value="">-- කාණ්ඩයක් තෝරන්න (Select Category) --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.categoryNameEn} ({c.categoryNameSi})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                          ප්‍රධාන දේශකයා (Instructor)
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsInstructorModalOpen(true)}
                          className="text-xs text-emerald-700 hover:underline font-semibold"
                        >
                          + New Instructor
                        </button>
                      </div>
                      <select
                        value={form.instructorId || ''}
                        onChange={e => setForm({ ...form, instructorId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none bg-white"
                      >
                        <option value="">-- දේශකයෙකු තෝරන්න (Optional) --</option>
                        {instructors.map(ins => (
                          <option key={ins.id} value={ins.id}>{ins.fullName} ({ins.designation || ins.phone})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        ප්‍රවර්ධන ඡායාරූපය (Banner Image)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 flex items-center gap-2.5 px-4 py-3 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl cursor-pointer bg-gray-50/60 hover:bg-gray-100 transition-colors text-xs text-gray-600">
                          <Upload size={16} className="text-gray-400 shrink-0" />
                          <span className="truncate">{imageFile ? imageFile.name : 'Upload file to S3...'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                        {imagePreview && (
                          <img src={imagePreview} alt="" className="w-12 h-11 object-cover rounded-lg border border-gray-200 shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                      පාඨමාලා හැඳින්වීම සහ අරමුණු (Description & Objectives)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="පාඨමාලාව පිළිබඳ සම්පූර්ණ හැඳින්වීම, අරමුණු සහ පුහුණු ක්‍රමවේදය..."
                      value={form.description || ''}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 2: CLASSIFICATION & MEDIUMS ── */}
              {activeTab === 'classification' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                      පාඨමාලා සුදුසුකම් මට්ටම (Course / Qualification Level) *
                    </label>
                    <select
                      value={form.courseLevel}
                      onChange={e => setForm({ ...form, courseLevel: e.target.value })}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 bg-white focus:ring-1 focus:ring-emerald-600 outline-none"
                    >
                      {QUALIFICATION_LEVELS.map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      ජාතික වෘත්තීය නිපුණතා (NVQ) සහ ශ්‍රී ලංකා සුදුසුකම් රාමුව (SLQF) අනුව අදාළ නිපුණතා මට්ටම තෝරන්න.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        පැවැත්වෙන ආකාරය (Delivery Mode) *
                      </label>
                      <select
                        value={form.deliveryMode}
                        onChange={e => setForm({ ...form, deliveryMode: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none bg-white"
                      >
                        {DELIVERY_MODES.map(mode => (
                          <option key={mode.value} value={mode.value}>{mode.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        ඉගැන්වීමේ භාෂා (Mediums of Instruction) *
                      </label>
                      <div className="flex flex-wrap gap-2.5 pt-0.5">
                        {MEDIUM_OPTIONS.map(med => {
                          const isSelected = form.mediums.includes(med);
                          return (
                            <button
                              key={med}
                              type="button"
                              onClick={() => handleMediumToggle(med)}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                                isSelected
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {isSelected && <Check size={15} />} {med}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                      පරිපාලක අභ්‍යන්තර සටහන් (Internal Notes - Confidential)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="ආයතනික අභ්‍යන්තර සටහන් (පොදු පරිශීලකයින්ට නොපෙන්වයි)..."
                      value={form.internalNotes || ''}
                      onChange={e => setForm({ ...form, internalNotes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 3: SCHEDULE & VENUE ── */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        කාලසීමාව (Duration) *
                      </label>
                      <div className="flex gap-2.5">
                        <input
                          type="number"
                          min="1"
                          required
                          value={form.durationValue}
                          onChange={e => setForm({ ...form, durationValue: parseInt(e.target.value) || 1 })}
                          className="w-32 px-4 py-3 border border-gray-300 rounded-xl text-sm font-bold focus:ring-1 focus:ring-emerald-600 outline-none"
                        />
                        <select
                          value={form.durationUnit}
                          onChange={e => setForm({ ...form, durationUnit: e.target.value })}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 outline-none bg-white"
                        >
                          {DURATION_UNITS.map(u => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        පන්ති පැවැත්වෙන වේලාවන් (Class Schedule)
                      </label>
                      <input
                        type="text"
                        placeholder="උදා: සෑම සෙනසුරාදා දිනකම පෙ.ව. 9:00 - ප.ව. 4:00"
                        value={form.classSchedule || ''}
                        onChange={e => setForm({ ...form, classSchedule: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        ආරම්භ වන දිනය (Start Date)
                      </label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={e => setForm({ ...form, startDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        අයදුම්පත් භාරගන්නා අවසන් දිනය (Deadline Date)
                      </label>
                      <input
                        type="date"
                        value={form.deadlineDate}
                        onChange={e => setForm({ ...form, deadlineDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        ප්‍රායෝගික පුහුණු ගොවිපළ ලිපිනය / ස්ථානය (Venue Location)
                      </label>
                      <div className="relative">
                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="උදා: පේරාදෙණිය ජාතික කෘෂිකර්ම පුහුණු පර්යේෂණ මධ්‍යස්ථානය"
                          value={form.venueLocation || ''}
                          onChange={e => setForm({ ...form, venueLocation: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 4: FEES & REQUIREMENTS ── */}
              {activeTab === 'requirements' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        පාඨමාලා ගාස්තුව (Course Fee - LKR) * (0 නම් නොමිලේ)
                      </label>
                      <div className="relative">
                        <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.courseFee}
                          onChange={e => setForm({ ...form, courseFee: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm font-bold focus:ring-1 focus:ring-emerald-600 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        උපරිම ශිෂ්‍ය ධාරිතාව (Max Intake)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="30"
                        value={form.maxIntake || ''}
                        onChange={e => setForm({ ...form, maxIntake: parseInt(e.target.value) || 30 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        ලබාදෙන සහතිකය (Certificate Type)
                      </label>
                      <input
                        type="text"
                        placeholder="උදා: NVQ ජාතික වෘත්තීය සහතිකය"
                        value={form.certificateType || ''}
                        onChange={e => setForm({ ...form, certificateType: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        ප්‍රතීතන ආයතනය (Accredited Body)
                      </label>
                      <input
                        type="text"
                        placeholder="උදා: TVEC / කෘෂිකර්ම දෙපාර්තමේන්තුව"
                        value={form.accreditedBy || ''}
                        onChange={e => setForm({ ...form, accreditedBy: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        අයදුම්පත් ලින්ක් එක (Application URL / Google Form)
                      </label>
                      <div className="relative">
                        <ExternalLink size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="url"
                          placeholder="https://forms.gle/..."
                          value={form.applyUrl || ''}
                          onChange={e => setForm({ ...form, applyUrl: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        ඇතුළත් වීමේ අවම සුදුසුකම් (Entry Requirements)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="අ.පො.ස. (සා.පෙළ) විභාගයට පෙනී සිටීම හෝ කෘෂිකර්මාන්තයට ඇති උනන්දුව..."
                        value={form.entryRequirements || ''}
                        onChange={e => setForm({ ...form, entryRequirements: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 5: SYLLABUS MODULES BUILDER ── */}
              {activeTab === 'modules' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base">විෂය නිර්දේශයේ මොඩියුල (Syllabus Modules)</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Add, reorder and structure the lessons/topics taught in this training program.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addModule}
                      className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
                    >
                      <Plus size={15} /> Add Module
                    </button>
                  </div>

                  <div className="space-y-4">
                    {modules.map((mod, idx) => (
                      <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-gray-800 text-white font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-gray-800">Module #{idx + 1}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveModule(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-200 transition-colors"
                              title="Move Up"
                            >
                              <ChevronUp size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveModule(idx, 'down')}
                              disabled={idx === modules.length - 1}
                              className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-200 transition-colors"
                              title="Move Down"
                            >
                              <ChevronDown size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeModule(idx)}
                              className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors ml-1"
                              title="Remove Module"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="මොඩියුලයේ නම / මාතෘකාව (Module Title) *"
                            value={mod.moduleTitle}
                            onChange={e => updateModule(idx, 'moduleTitle', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-emerald-600 outline-none bg-white"
                          />
                        </div>

                        <div>
                          <textarea
                            rows={3}
                            placeholder="මොඩියුලයේ අන්තර්ගත කෙටි විස්තරය (Module Description)..."
                            value={mod.moduleDescription || ''}
                            onChange={e => updateModule(idx, 'moduleDescription', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600 outline-none bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-5 border-t border-gray-200 shrink-0">
                <div className="flex items-center gap-3">
                  {activeTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === 'classification') setActiveTab('basic');
                        else if (activeTab === 'schedule') setActiveTab('classification');
                        else if (activeTab === 'requirements') setActiveTab('schedule');
                        else if (activeTab === 'modules') setActiveTab('requirements');
                      }}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                    >
                      ← Previous Step
                    </button>
                  )}
                  {activeTab !== 'modules' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === 'basic') setActiveTab('classification');
                        else if (activeTab === 'classification') setActiveTab('schedule');
                        else if (activeTab === 'schedule') setActiveTab('requirements');
                        else if (activeTab === 'requirements') setActiveTab('modules');
                      }}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {editingId ? 'Update Course (සුරකින්න)' : 'Create Course (ඇතුළත් කරන්න)'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── COURSE PREVIEW MODAL ── */}
      {/* ==================================================================== */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewCourse(null)} />
          <div className="bg-white rounded-2xl w-[90vw] max-w-5xl h-[88vh] relative z-10 shadow-2xl overflow-hidden flex flex-col border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{previewCourse.category?.categoryNameEn}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">{previewCourse.title}</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{previewCourse.courseCode}</p>
              </div>
              <button
                onClick={() => setPreviewCourse(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                <div>
                  <p className="text-gray-400 font-medium">Level</p>
                  <p className="font-bold text-gray-900 mt-0.5">{previewCourse.courseLevel}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Duration</p>
                  <p className="font-bold text-gray-900 mt-0.5">{previewCourse.durationValue} {previewCourse.durationUnit}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Course Fee</p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {previewCourse.courseFee === 0 ? 'Free' : `Rs. ${previewCourse.courseFee.toLocaleString()}`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Delivery Mode</p>
                  <p className="font-bold text-gray-900 mt-0.5">{previewCourse.deliveryMode.replace('_', ' ')}</p>
                </div>
              </div>

              {previewCourse.description && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                    {previewCourse.description}
                  </p>
                </div>
              )}

              {previewCourse.modules && previewCourse.modules.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                    Curriculum Modules ({previewCourse.modules.length})
                  </h4>
                  <div className="space-y-2">
                    {previewCourse.modules.map((m, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-bold text-gray-900">
                          <span className="text-emerald-700 mr-2">Module {i + 1}:</span>
                          {m.moduleTitle}
                        </p>
                        {m.moduleDescription && (
                          <p className="text-xs text-gray-600 mt-1">{m.moduleDescription}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── QUICK ADD CATEGORY MODAL ── */}
      {/* ==================================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Add Course Category</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category Name (Sinhala) *</label>
                <input
                  required
                  placeholder="උදා: කාබනික කෘෂිකර්මය"
                  value={newCatForm.categoryNameSi}
                  onChange={e => setNewCatForm({ ...newCatForm, categoryNameSi: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category Name (English) *</label>
                <input
                  required
                  placeholder="Organic Agriculture"
                  value={newCatForm.categoryNameEn}
                  onChange={e => setNewCatForm({ ...newCatForm, categoryNameEn: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Slug *</label>
                <input
                  required
                  placeholder="organic-agriculture"
                  value={newCatForm.slug}
                  onChange={e => setNewCatForm({ ...newCatForm, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-mono text-gray-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── QUICK ADD INSTRUCTOR MODAL ── */}
      {/* ==================================================================== */}
      {isInstructorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInstructorModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Add Instructor / Resource Person</h3>
              <button onClick={() => setIsInstructorModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateInstructor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name (සම්පූර්ණ නම) *</label>
                <input
                  required
                  placeholder="ආචාර්ය නිමල් සේනාරත්න"
                  value={newInsForm.fullName}
                  onChange={e => setNewInsForm({ ...newInsForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Designation (තනතුර)</label>
                  <input
                    placeholder="කෘෂිකර්ම නිලධාරී"
                    value={newInsForm.designation}
                    onChange={e => setNewInsForm({ ...newInsForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone *</label>
                  <input
                    required
                    placeholder="+94771234567"
                    value={newInsForm.phone}
                    onChange={e => setNewInsForm({ ...newInsForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp</label>
                  <input
                    placeholder="+94771234567"
                    value={newInsForm.whatsappNumber}
                    onChange={e => setNewInsForm({ ...newInsForm, whatsappNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="instructor@domain.lk"
                    value={newInsForm.email}
                    onChange={e => setNewInsForm({ ...newInsForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bio / Experience</label>
                <textarea
                  rows={2}
                  placeholder="කෙටි විස්තරය සහ පළපුරුද්ද..."
                  value={newInsForm.bio}
                  onChange={e => setNewInsForm({ ...newInsForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setIsInstructorModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold">
                  Save Instructor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ── APPLICATION DETAIL MODAL ── */}
      {/* ==================================================================== */}
      {isAppDetailModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAppDetailModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl p-6 sm:p-8 border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
                  {selectedApp.applicantName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedApp.applicantName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      Applied: {new Date(selectedApp.appliedAt).toLocaleString()}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedApp.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : selectedApp.status === 'Pending'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : selectedApp.status === 'Contacted'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}>
                      {selectedApp.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAppDetailModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Details Grid */}
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Applicant Personal Info Card */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Applicant Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                  <div>
                    <span className="text-gray-400 text-xs block">Phone Number:</span>
                    <div className="flex items-center gap-2 font-mono font-bold text-gray-900 text-sm mt-0.5">
                      <Phone size={14} className="text-emerald-700" />
                      <span>{selectedApp.applicantPhone}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Email Address:</span>
                    <div className="flex items-center gap-2 font-medium text-gray-900 text-sm mt-0.5 truncate">
                      <Mail size={14} className="text-gray-500" />
                      <span>{selectedApp.applicantEmail || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">National ID (NIC):</span>
                    <span className="font-mono font-bold text-gray-900">{selectedApp.applicantNic || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">District / Location:</span>
                    <span className="font-semibold text-gray-900">{selectedApp.applicantDistrict || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Course Info Card */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Applied Course Information</p>
                {selectedApp.course ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-emerald-800 text-white rounded">
                        {selectedApp.course.courseCode}
                      </span>
                      <span className="text-xs font-semibold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded">
                        {selectedApp.course.courseLevel}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">{selectedApp.course.title}</h4>
                    <p className="text-xs text-gray-600">
                      Fee: <strong>{selectedApp.course.courseFee === 0 ? 'Free (නොමිලේ)' : `Rs. ${selectedApp.course.courseFee.toLocaleString()} LKR`}</strong>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">Course ID: {selectedApp.courseId}</p>
                )}
              </div>

              {/* Remarks Box */}
              {selectedApp.remarks && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Remarks / Special Notes</p>
                  <p className="text-gray-700 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">{selectedApp.remarks}</p>
                </div>
              )}

              {/* Status Updater Buttons */}
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-700 mb-2">Change Application Status:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleUpdateAppStatus(selectedApp.id, 'Pending')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      selectedApp.status === 'Pending'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    ⏳ Pending
                  </button>
                  <button
                    onClick={() => handleUpdateAppStatus(selectedApp.id, 'Contacted')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      selectedApp.status === 'Contacted'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    📞 Contacted
                  </button>
                  <button
                    onClick={() => handleUpdateAppStatus(selectedApp.id, 'Approved')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      selectedApp.status === 'Approved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    ✅ Approved
                  </button>
                  <button
                    onClick={() => handleUpdateAppStatus(selectedApp.id, 'Rejected')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      selectedApp.status === 'Rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    ❌ Rejected
                  </button>
                </div>
              </div>

              {/* Direct Action Bar */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                <a
                  href={`tel:${selectedApp.applicantPhone}`}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone size={14} /> Call Phone
                </a>
                <a
                  href={`https://wa.me/${selectedApp.applicantPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <MessageSquare size={14} /> WhatsApp
                </a>
                {selectedApp.applicantEmail && (
                  <a
                    href={`mailto:${selectedApp.applicantEmail}`}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail size={14} /> Email
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteApp(selectedApp.id, selectedApp.applicantName)}
                  className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

