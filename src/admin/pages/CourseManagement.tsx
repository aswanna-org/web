import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Paper, IconButton, Typography, CircularProgress,
  Chip, Switch,  Tabs, Tab, MenuItem
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Book as BookIcon, CloudUpload as UploadIcon,
  Close as CloseIcon, Work as WorkIcon, Layers as LayersIcon,
  School as SchoolIcon, Schedule as ScheduleIcon, AttachMoney as MoneyIcon,
  Check as CheckIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon,
  ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon,
  LocationOn as LocationOnIcon, Description as DescriptionIcon
} from '@mui/icons-material';
import {
  Plus, Edit, Trash2, X, Search, BookOpen,
  Clock, MapPin, Award, CheckCircle, Users, ExternalLink,
  Layers, FileText, Eye, Calendar,Check, UserCheck, AlertCircle,
  Phone, Mail, MessageSquare, CheckCircle2, XCircle,
  Briefcase, Sparkles, Lock, Megaphone, Globe
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ==========================================
// CONSTANTS & ENUMS (User Specified)
// ==========================================
const QUALIFICATION_LEVELS = [
  'NVQ Level 3 (Certificate)',
  'NVQ Level 4 (Craft Certificate)',
  'NVQ Level 5 (Diploma)',
  'NVQ Level 6 (Higher Diploma)',
  'NVQ 7 / SLQF 6 (Bachelor\'s Degree)',
  'SLQF 7 (Postgraduate Certificate)',
  'SLQF 8 (Postgraduate Diploma)',
  'SLQF 9 (Master\'s by Coursework)',
  'SLQF 10 (Master\'s with Research)',
  'SLQF 11 (Master of Philosophy - M.Phil)',
  'SLQF 12 (Doctor of Philosophy - Ph.D)'
];

const DELIVERY_MODES = [
  { value: 'Physical_Farm', label: 'Physical Farm' },
  { value: 'Hybrid_Blended', label: 'Hybrid (Blended)' },
  { value: 'Online_Lectures', label: 'Online Lectures' },
  { value: 'Full_Time_Residential', label: 'Full Time Residential' }
];

const DURATION_UNITS = [
  { value: 'Hours', label: 'Hours' },
  { value: 'Days', label: 'Days' },
  { value: 'Weeks', label: 'Weeks' },
  { value: 'Months', label: 'Months' },
  { value: 'Years', label: 'Years' }
];

const MEDIUM_OPTIONS = ['Sinhala', 'English', 'Tamil'];

const MONTH_OPTIONS = [
  { value: '', label: '-- Select Month --' },
  { value: 'January', label: 'January' },
  { value: 'February', label: 'February' },
  { value: 'March', label: 'March' },
  { value: 'April', label: 'April' },
  { value: 'May', label: 'May' },
  { value: 'June', label: 'June' },
  { value: 'July', label: 'July' },
  { value: 'August', label: 'August' },
  { value: 'September', label: 'September' },
  { value: 'October', label: 'October' },
  { value: 'November', label: 'November' },
  { value: 'December', label: 'December' },
  { value: 'Every Month', label: 'Every Month' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Bi-Annually', label: 'Bi-Annually' },
  { value: 'On Demand', label: 'On Demand' }
];

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

interface RelatedJob {
  id: string;
  name: string;
  _count?: {
    courses: number;
  };
  createdAt?: string;
  updatedAt?: string;
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
  applicationCallingMonth?: string | null;
  enrollmentMonth?: string | null;
  startMonth?: string | null;
  classSchedule?: string | null;
  venueLocation?: string | null;
  venueLocations?: string[];
  entryRequirements?: string | null;
  certificateType?: string | null;
  accreditedBy?: string | null;
  courseFee: number;
  applyUrl?: string | null;
  applicationFileUrl?: string | null;
  bannerImageUrl?: string | null;
  status: string;
  applicationCalled?: boolean;
  internalNotes?: string | null;
  createdAt: string;
  category?: CourseCategory;
  instructor?: Instructor;
  relatedJobs?: RelatedJob[];
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
  applicationCallingMonth: '',
  enrollmentMonth: '',
  startMonth: '',
  classSchedule: '',
  venueLocation: '',
  venueLocations: [''],
  entryRequirements: '',
  certificateType: 'රජයේ පිළිගත් නිපුණතා සහතිකය',
  accreditedBy: 'TVEC / කෘෂිකර්ම දෙපාර්තමේන්තුව',
  courseFee: 0,
  applyUrl: '',
  applicationFileUrl: '',
  bannerImageUrl: '',
  status: 'Draft',
  applicationCalled: false,
  relatedJobIds: [] as string[],
  internalNotes: '',
};

export default function CourseManagement() {
  // Top View Mode
  const [viewMode, setViewMode] = useState<'courses' | 'applications'>('courses');

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [relatedJobs, setRelatedJobs] = useState<RelatedJob[]>([]);
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
  const [applicationFile, setApplicationFile] = useState<File | null>(null);

  // Quick Modals for Category, Instructor, & Related Jobs
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatForm, setNewCatForm] = useState({ categoryNameSi: '', categoryNameEn: '', slug: '', iconClass: 'fa-leaf' });

  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [newInsForm, setNewInsForm] = useState({ fullName: '', designation: '', phone: '', whatsappNumber: '', email: '', bio: '' });

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editingJobName, setEditingJobName] = useState('');
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [jobSearch, setJobSearch] = useState('');

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

  const handleToggleCourseStatus = async (courseId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: nextStatus } : c));
        if (previewCourse && previewCourse.id === courseId) {
          setPreviewCourse(prev => prev ? { ...prev, status: nextStatus } : null);
        }
        fetchCourses(currentPage);
      }
    } catch (err) {
      console.error('Failed to toggle course status:', err);
    }
  };

  const handleToggleApplicationCalled = async (courseId: string, currentVal: boolean) => {
    const nextVal = !currentVal;
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationCalled: nextVal })
      });
      if (res.ok) {
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, applicationCalled: nextVal } : c));
        if (previewCourse && previewCourse.id === courseId) {
          setPreviewCourse(prev => prev ? { ...prev, applicationCalled: nextVal } : null);
        }
        setSuccessMsg(nextVal ? 'Application intake marked as Called!' : 'Application intake marked as Closed.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle application called status:', err);
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
      const [catRes, insRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/categories?all=true`),
        fetch(`${API_BASE_URL}/courses/instructors`),
        fetch(`${API_BASE_URL}/courses/related-jobs`)
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (insRes.ok) setInstructors(await insRes.json());
      if (jobsRes.ok) setRelatedJobs(await jobsRes.json());
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

  const handleCreateRelatedJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobName.trim()) return;
    setIsSubmittingJob(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/related-jobs`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newJobName.trim() })
      });
      if (res.ok) {
        const created = await res.json();
        setRelatedJobs(prev => [...prev, created]);
        setForm(prev => ({ ...prev, relatedJobIds: [...(prev.relatedJobIds || []), created.id] }));
        setNewJobName('');
        setSuccessMsg('Job created successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create job.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating job.');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleUpdateRelatedJob = async (id: string) => {
    if (!editingJobName.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/courses/related-jobs/${id}`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingJobName.trim() })
      });
      if (res.ok) {
        const updated = await res.json();
        setRelatedJobs(prev => prev.map(j => j.id === id ? { ...j, name: updated.name } : j));
        setEditingJobId(null);
        setEditingJobName('');
        setSuccessMsg('Job updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update job.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating job.');
    }
  };

  const handleDeleteRelatedJob = async (id: string, name: string, coursesCount = 0) => {
    const confirmMsg = coursesCount > 0
      ? `"${name}" රැකියාව දැනට පාඨමාලා ${coursesCount} කට සම්බන්ධ කර ඇත. මෙය පද්ධතියෙන්ම ස්ථිරවම මකා දැමීමට අවශ්‍ය බව තහවුරු කරන්නද? (Warning: This job is linked to ${coursesCount} courses. Are you sure you want to permanently delete it from the system?)`
      : `Are you sure you want to permanently delete job "${name}" from the system?`;
    if (!confirm(confirmMsg)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/courses/related-jobs/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        setRelatedJobs(prev => prev.filter(j => j.id !== id));
        setForm(prev => ({ ...prev, relatedJobIds: (prev.relatedJobIds || []).filter(jId => jId !== id) }));
        setSuccessMsg('Job deleted successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete job.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete job.');
    }
  };

  const handleToggleJobSelection = (jobId: string) => {
    setForm(prev => {
      const current = prev.relatedJobIds || [];
      if (current.includes(jobId)) {
        return { ...prev, relatedJobIds: current.filter(id => id !== jobId) };
      } else {
        return { ...prev, relatedJobIds: [...current, jobId] };
      }
    });
  };

  const openCreateModal = () => {
    setForm({
      ...defaultFormData,
      categoryId: categories.length > 0 ? categories[0].id : '',
      instructorId: instructors.length > 0 ? instructors[0].id : '',
      applicationCalled: false,
      relatedJobIds: [],
    });
    setModules([
      { moduleOrder: 1, moduleTitle: '', moduleDescription: '' }
    ]);
    setImageFile(null);
    setImagePreview(null);
    setApplicationFile(null);
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
      applicationCallingMonth: course.applicationCallingMonth || '',
      enrollmentMonth: course.enrollmentMonth || '',
      startMonth: course.startMonth || '',
      classSchedule: course.classSchedule || '',
      venueLocation: course.venueLocation || '',
      venueLocations: (course.venueLocations && Array.isArray(course.venueLocations) && course.venueLocations.length > 0)
        ? course.venueLocations
        : (course.venueLocation ? [course.venueLocation] : ['']),
      entryRequirements: course.entryRequirements || '',
      certificateType: course.certificateType || 'රජයේ පිළිගත් නිපුණතා සහතිකය',
      accreditedBy: course.accreditedBy || 'TVEC / කෘෂිකර්ම දෙපාර්තමේන්තුව',
      courseFee: course.courseFee || 0,
      applyUrl: course.applyUrl || '',
      applicationFileUrl: course.applicationFileUrl || '',
      bannerImageUrl: course.bannerImageUrl || '',
      status: course.status || 'Draft',
      applicationCalled: Boolean(course.applicationCalled),
      relatedJobIds: course.relatedJobs?.map(j => j.id) || [],
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
    setApplicationFile(null);
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
        if (k === 'mediums' || k === 'venueLocations' || k === 'relatedJobIds') {
          fd.append(k, JSON.stringify(v));
        } else if (k === 'applicationCalled') {
          fd.append(k, String(v));
        } else if (v !== null && v !== undefined) {
          fd.append(k, String(v));
        }
      });

      const validModules = modules.filter(m => m.moduleTitle.trim() !== '');
      fd.append('modules', JSON.stringify(validModules));

      if (imageFile) {
        fd.append('image', imageFile);
      }
      if (applicationFile) {
        fd.append('applicationFile', applicationFile);
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
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage course curriculum, qualification standards, syllabus modules, and admissions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsJobModalOpen(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-lg font-medium text-xs border border-gray-200 shadow-sm transition-colors cursor-pointer"
          >
            <Briefcase size={15} /> Related Jobs ({relatedJobs.length})
          </button>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-lg font-medium text-xs border border-gray-200 shadow-sm transition-colors cursor-pointer"
          >
            <Layers size={15} /> New Category
          </button>
          <button
            onClick={() => setIsInstructorModalOpen(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-lg font-medium text-xs border border-gray-200 shadow-sm transition-colors cursor-pointer"
          >
            <UserCheck size={15} /> New Instructor
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={18} /> Add Course
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
          <span>Courses</span>
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
          <span>Applications</span>
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
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.categoryNameEn}</option>
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
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[11px] text-gray-500 font-medium">
                                  {course.courseCode}
                                </span>
                                {course.applicationCalled && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                                    <Sparkles size={10} className="text-blue-600" /> App Called
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-800 text-xs">{course.category?.categoryNameEn || '-'}</p>
                          <p className="text-[11px] text-gray-500 truncate max-w-[180px]">{course.courseLevel}</p>
                          {course.relatedJobs && course.relatedJobs.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 font-semibold">
                              <Briefcase size={11} /> {course.relatedJobs.length} Related Job{course.relatedJobs.length > 1 ? 's' : ''}
                            </div>
                          )}
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
                          <div className="flex flex-col gap-1.5 items-start">
                            <button
                              type="button"
                              onClick={() => handleToggleCourseStatus(course.id, course.status)}
                              title={course.status === 'Published' ? "Click to set as Draft (Hide from public website)" : "Click to Publish (Show on public website)"}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95 ${
                                course.status === 'Published'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : course.status === 'Draft'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${course.status === 'Published' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                              <span>{course.status === 'Published' ? 'Published' : 'Draft'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleApplicationCalled(course.id, Boolean(course.applicationCalled))}
                              title="Click to toggle Application Called status"
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                                course.applicationCalled
                                  ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <Sparkles size={10} className={course.applicationCalled ? "text-blue-600" : "text-gray-400"} />
                              <span>{course.applicationCalled ? 'Calling Open' : 'Calling Closed'}</span>
                            </button>
                          </div>
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
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <select
                  value={appFilterCourse}
                  onChange={e => { setAppFilterCourse(e.target.value); setAppCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="all">All Courses</option>
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
                            <option value="Pending">Pending</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
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
      {/* ── MUI COURSE CREATION / EDIT DIALOG MODAL ── */}
      {/* ==================================================================== */}
      <Dialog
        open={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        maxWidth="xl"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '94vh', width: '95vw' } } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editingId ? 'Edit Course Details' : 'Add New Course'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Enter curriculum details, NVQ/SLQF qualification standards, syllabus modules, schedule and fees.
            </Typography>
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} disabled={isSubmitting} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {errorMsg && (
          <Box sx={{ mx: 3, mt: 2, p: 1.5, bgcolor: 'error.50', borderRadius: 2, border: '1px solid', borderColor: 'error.200' }}>
            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
              {errorMsg}
            </Typography>
          </Box>
        )}

        {/* Clean Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50', px: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
              '& .Mui-selected': { color: '#16a34a' },
              '& .MuiTabs-indicator': { bgcolor: '#16a34a' }
            }}
          >
            <Tab icon={<BookIcon fontSize="small" />} iconPosition="start" label="1. Basic Info" value="basic" />
            <Tab icon={<SchoolIcon fontSize="small" />} iconPosition="start" label="2. Level & Mode" value="classification" />
            <Tab icon={<ScheduleIcon fontSize="small" />} iconPosition="start" label="3. Schedule & Venue" value="schedule" />
            <Tab icon={<MoneyIcon fontSize="small" />} iconPosition="start" label="4. Fees & Requirements" value="requirements" />
            <Tab icon={<LayersIcon fontSize="small" />} iconPosition="start" label={`5. Syllabus Modules (${modules.length})`} value="modules" />
          </Tabs>
        </Box>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
            {/* ── TAB 1: BASIC INFO ── */}
            {activeTab === 'basic' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Course Title *"
                  size="small"
                  required
                  fullWidth
                  placeholder="e.g. Commercial Organic Gardening and Greenhouse Technology"
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Course Code *"
                    size="small"
                    required
                    fullWidth
                    placeholder="e.g. AGRI-ORG-2026"
                    value={form.courseCode}
                    onChange={e => setForm({ ...form, courseCode: e.target.value })}
                  />

                  <TextField
                    label="URL Slug (SEO Identifier) *"
                    size="small"
                    required
                    fullWidth
                    placeholder="commercial-organic-gardening-2026"
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value })}
                  />

                  <TextField
                    select
                    label="Publication Status *"
                    size="small"
                    fullWidth
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <MenuItem value="Draft">Draft (Internal use only)</MenuItem>
                    <MenuItem value="Published">Published (Visible on website)</MenuItem>
                    <MenuItem value="Archived">Archived</MenuItem>
                  </TextField>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Course Category *</Typography>
                      <Button size="small" onClick={() => setIsCategoryModalOpen(true)} sx={{ textTransform: 'none', p: 0, minWidth: 'auto', fontSize: '0.75rem', color: '#16a34a' }}>
                        + New Category
                      </Button>
                    </Box>
                    <TextField
                      select
                      size="small"
                      required
                      fullWidth
                      value={form.categoryId}
                      onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    >
                      <MenuItem value="">-- Select Category --</MenuItem>
                      {categories.map(c => (
                        <MenuItem key={c.id} value={c.id}>{c.categoryNameEn}</MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Primary Instructor</Typography>
                      <Button size="small" onClick={() => setIsInstructorModalOpen(true)} sx={{ textTransform: 'none', p: 0, minWidth: 'auto', fontSize: '0.75rem', color: '#16a34a' }}>
                        + New Instructor
                      </Button>
                    </Box>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={form.instructorId || ''}
                      onChange={e => setForm({ ...form, instructorId: e.target.value })}
                    >
                      <MenuItem value="">-- Select Instructor (Optional) --</MenuItem>
                      {instructors.map(ins => (
                        <MenuItem key={ins.id} value={ins.id}>{ins.fullName} ({ins.designation || ins.phone})</MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button component="label" variant="outlined" startIcon={<UploadIcon />} size="small" fullWidth
                      sx={{ textTransform: 'none', borderColor: 'grey.300', color: 'text.secondary', height: 40, justifyContent: 'flex-start', px: 2 }}>
                      {imageFile ? imageFile.name : 'Upload Banner Image...'}
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>
                    {imagePreview && (
                      <Box component="img" src={imagePreview} sx={{ width: 44, height: 40, objectFit: 'cover', borderRadius: 1.5, border: '1px solid', borderColor: 'grey.300' }} />
                    )}
                  </Box>
                </Box>

                {/* Highlighted Application Called Status Switch */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0369a1' }}>
                        APPLICATION CALLED STATUS
                      </Typography>
                      <Chip
                        label={form.applicationCalled ? 'ACTIVE (Calling Open)' : 'CLOSED (Calling Closed)'}
                        size="small"
                        sx={{ fontSize: '0.65rem', height: 20, bgcolor: form.applicationCalled ? '#0284c7' : '#e2e8f0', color: form.applicationCalled ? '#fff' : '#475569', fontWeight: 700 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      When enabled, the "Application Called" badge will appear on this course card and details page.
                    </Typography>
                  </Box>
                  <Switch
                    checked={form.applicationCalled}
                    onChange={e => setForm({ ...form, applicationCalled: e.target.checked })}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0284c7' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0284c7' } }}
                  />
                </Paper>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>
                    Description & Objectives
                  </Typography>
                  <RichTextEditor
                    value={form.description || ''}
                    onChange={value => setForm({ ...form, description: value })}
                    placeholder="Enter full course description, curriculum overview, learning objectives and practical training methodology..."
                  />
                </Box>
              </Box>
            )}

            {/* ── TAB 2: LEVEL & MODE ── */}
            {activeTab === 'classification' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  select
                  label="Course / Qualification Level *"
                  size="small"
                  fullWidth
                  value={form.courseLevel}
                  onChange={e => setForm({ ...form, courseLevel: e.target.value })}
                  helperText="Select the recognized qualification level in accordance with NVQ and SLQF framework standards."
                >
                  {QUALIFICATION_LEVELS.map(lvl => (
                    <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>
                  ))}
                </TextField>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    select
                    label="Delivery Mode *"
                    size="small"
                    fullWidth
                    value={form.deliveryMode}
                    onChange={e => setForm({ ...form, deliveryMode: e.target.value })}
                  >
                    {DELIVERY_MODES.map(mode => (
                      <MenuItem key={mode.value} value={mode.value}>{mode.label}</MenuItem>
                    ))}
                  </TextField>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
                      Mediums of Instruction *
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {MEDIUM_OPTIONS.map(med => {
                        const isSelected = form.mediums.includes(med);
                        return (
                          <Chip
                            key={med}
                            label={med}
                            clickable
                            onClick={() => handleMediumToggle(med)}
                            color={isSelected ? 'success' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 600, bgcolor: isSelected ? '#16a34a' : undefined }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                </Box>

                {/* Related Jobs Section */}
                <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'grey.200', borderRadius: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Related Jobs / Career Pathways
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Select career opportunities and jobs relevant to this course from master pool.
                      </Typography>
                    </Box>
                    <Button size="small" onClick={() => setIsJobModalOpen(true)} startIcon={<AddIcon />} sx={{ textTransform: 'none', color: '#16a34a', fontWeight: 600 }}>
                      Manage Master Job Pool
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {relatedJobs.map(job => {
                      const isSelected = (form.relatedJobIds || []).includes(job.id);
                      return (
                        <Chip
                          key={job.id}
                          label={job.name}
                          clickable
                          onClick={() => handleToggleJobSelection(job.id)}
                          icon={isSelected ? <CheckIcon fontSize="small" /> : <WorkIcon fontSize="small" />}
                          sx={{
                            fontWeight: 600,
                            bgcolor: isSelected ? '#16a34a' : 'grey.100',
                            color: isSelected ? '#fff' : 'text.primary',
                            '&:hover': { bgcolor: isSelected ? '#15803d' : 'grey.200' }
                          }}
                        />
                      );
                    })}
                  </Box>
                </Paper>

                <TextField
                  label="Internal Notes (Confidential)"
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Institutional internal notes (never shown to public users)..."
                  value={form.internalNotes || ''}
                  onChange={e => setForm({ ...form, internalNotes: e.target.value })}
                />
              </Box>
            )}

            {/* ── TAB 3: SCHEDULE & VENUE ── */}
            {activeTab === 'schedule' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Duration Value *"
                      type="number"
                      size="small"
                      required
                      value={form.durationValue}
                      onChange={e => setForm({ ...form, durationValue: parseInt(e.target.value) || 1 })}
                      sx={{ width: 140 }}
                    />
                    <TextField
                      select
                      label="Duration Unit *"
                      size="small"
                      fullWidth
                      value={form.durationUnit}
                      onChange={e => setForm({ ...form, durationUnit: e.target.value })}
                    >
                      {DURATION_UNITS.map(u => (
                        <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <TextField
                    label="Class Schedule"
                    size="small"
                    fullWidth
                    placeholder="e.g. Every Saturday 9:00 AM - 4:00 PM"
                    value={form.classSchedule || ''}
                    onChange={e => setForm({ ...form, classSchedule: e.target.value })}
                  />

                  <TextField
                    select
                    label="Application Calling Month"
                    size="small"
                    fullWidth
                    value={form.applicationCallingMonth || ''}
                    onChange={e => setForm({ ...form, applicationCallingMonth: e.target.value })}
                  >
                    {MONTH_OPTIONS.map(m => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Enrollment Month"
                    size="small"
                    fullWidth
                    value={form.enrollmentMonth || ''}
                    onChange={e => setForm({ ...form, enrollmentMonth: e.target.value })}
                  >
                    {MONTH_OPTIONS.map(m => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Course Start Month"
                    size="small"
                    fullWidth
                    value={form.startMonth || ''}
                    onChange={e => setForm({ ...form, startMonth: e.target.value })}
                  >
                    {MONTH_OPTIONS.map(m => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Application Deadline Date"
                    type="date"
                    size="small"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={form.deadlineDate}
                    onChange={e => setForm({ ...form, deadlineDate: e.target.value })}
                  />
                </Box>

                {/* Venue Locations */}
                <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Venue Locations</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Add practical / lecture venues for this course</Typography>
                    </Box>
                    <Button size="small" onClick={() => setForm(prev => ({ ...prev, venueLocations: [...prev.venueLocations, ''] }))}
                      startIcon={<AddIcon />} sx={{ textTransform: 'none', color: '#16a34a', fontWeight: 600 }}>
                      Add Location
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {form.venueLocations.map((loc, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder={`Venue location ${idx + 1}`}
                          value={loc}
                          onChange={e => {
                            const newLocs = [...form.venueLocations];
                            newLocs[idx] = e.target.value;
                            setForm(prev => ({ ...prev, venueLocations: newLocs, venueLocation: newLocs[0] || '' }));
                          }}
                          slotProps={{ input: { startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ color: '#16a34a', fontSize: 20 }} /></InputAdornment> } }}
                        />
                        {form.venueLocations.length > 1 && (
                          <IconButton size="small" onClick={() => {
                            const newLocs = form.venueLocations.filter((_, i) => i !== idx);
                            setForm(prev => ({ ...prev, venueLocations: newLocs.length > 0 ? newLocs : [''], venueLocation: newLocs[0] || '' }));
                          }} sx={{ color: 'error.main' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}

            {/* ── TAB 4: FEES & REQUIREMENTS ── */}
            {activeTab === 'requirements' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Course Fee (LKR) * (0 for Free)"
                    type="number"
                    size="small"
                    required
                    fullWidth
                    value={form.courseFee}
                    onChange={e => setForm({ ...form, courseFee: parseFloat(e.target.value) || 0 })}
                  />

                  <TextField
                    label="Certificate Type"
                    size="small"
                    fullWidth
                    placeholder="e.g. NVQ National Vocational Certificate"
                    value={form.certificateType || ''}
                    onChange={e => setForm({ ...form, certificateType: e.target.value })}
                  />

                  <TextField
                    label="Accredited Body"
                    size="small"
                    fullWidth
                    placeholder="e.g. TVEC / Department of Agriculture"
                    value={form.accreditedBy || ''}
                    onChange={e => setForm({ ...form, accreditedBy: e.target.value })}
                  />

                  <TextField
                    label="Application Form URL (Google Form Link)"
                    type="url"
                    size="small"
                    fullWidth
                    placeholder="https://forms.gle/..."
                    value={form.applyUrl || ''}
                    onChange={e => setForm({ ...form, applyUrl: e.target.value })}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button component="label" variant="outlined" startIcon={<UploadIcon />} size="small"
                    sx={{ textTransform: 'none', borderColor: 'grey.300', color: 'text.secondary', height: 40 }}>
                    {applicationFile ? applicationFile.name : (form.applicationFileUrl ? 'Replace Application PDF / Doc...' : 'Upload Application PDF / Doc...')}
                    <input type="file" hidden accept=".pdf,.doc,.docx" onChange={e => { const f = e.target.files?.[0]; if (f) setApplicationFile(f); }} />
                  </Button>
                  {form.applicationFileUrl && (
                    <Button size="small" href={form.applicationFileUrl} target="_blank" startIcon={<DescriptionIcon />} sx={{ textTransform: 'none', color: '#16a34a' }}>
                      View Current Document
                    </Button>
                  )}
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>
                    Entry Requirements
                  </Typography>
                  <RichTextEditor
                    value={form.entryRequirements || ''}
                    onChange={value => setForm({ ...form, entryRequirements: value })}
                    placeholder="Minimum educational qualifications, prior experience or general interest..."
                  />
                </Box>
              </Box>
            )}

            {/* ── TAB 5: SYLLABUS MODULES ── */}
            {activeTab === 'modules' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Syllabus Modules</Typography>
                  <Button size="small" onClick={addModule} startIcon={<AddIcon />} variant="contained"
                    sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, textTransform: 'none', borderRadius: 2 }}>
                    Add Module
                  </Button>
                </Box>

                {modules.map((mod, idx) => (
                  <Paper key={idx} elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Module #{idx + 1}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" disabled={idx === 0} onClick={() => moveModule(idx, 'up')}><ArrowUpwardIcon fontSize="small" /></IconButton>
                        <IconButton size="small" disabled={idx === modules.length - 1} onClick={() => moveModule(idx, 'down')}><ArrowDownwardIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => removeModule(idx)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                    <TextField
                      label="Module Title *"
                      size="small"
                      fullWidth
                      value={mod.moduleTitle}
                      onChange={e => updateModule(idx, 'moduleTitle', e.target.value)}
                    />
                    <TextField
                      label="Module Description"
                      multiline
                      rows={2}
                      size="small"
                      fullWidth
                      value={mod.moduleDescription || ''}
                      onChange={e => updateModule(idx, 'moduleDescription', e.target.value)}
                    />
                  </Paper>
                ))}
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {activeTab !== 'basic' && (
                <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => {
                  if (activeTab === 'classification') setActiveTab('basic');
                  else if (activeTab === 'schedule') setActiveTab('classification');
                  else if (activeTab === 'requirements') setActiveTab('schedule');
                  else if (activeTab === 'modules') setActiveTab('requirements');
                }} sx={{ textTransform: 'none', borderRadius: 2, color: 'text.secondary', borderColor: 'grey.300' }}>
                  Previous
                </Button>
              )}
              {activeTab !== 'modules' && (
                <Button variant="outlined" size="small" endIcon={<ArrowForwardIcon />} onClick={() => {
                  if (activeTab === 'basic') setActiveTab('classification');
                  else if (activeTab === 'classification') setActiveTab('schedule');
                  else if (activeTab === 'schedule') setActiveTab('requirements');
                  else if (activeTab === 'requirements') setActiveTab('modules');
                }} sx={{ textTransform: 'none', borderRadius: 2, color: 'text.secondary', borderColor: 'grey.300' }}>
                  Next
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setIsModalOpen(false)} disabled={isSubmitting} variant="outlined"
                sx={{ textTransform: 'none', borderRadius: 2, borderColor: 'grey.300', color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="contained"
                sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, minWidth: 120 }}>
                {isSubmitting ? <CircularProgress size={20} color="inherit" /> : (editingId ? 'Update Course' : 'Create Course')}
              </Button>
            </Box>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==================================================================== */}
      {/* ── COURSE PREVIEW MODAL ── */}
      {/* ==================================================================== */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewCourse(null)} />
          <div className="bg-white rounded-3xl w-[92vw] max-w-5xl max-h-[92vh] relative z-10 shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-slate-900 text-white">
              <div className="flex items-center gap-4">
                {previewCourse.bannerImageUrl && (
                  <img
                    src={previewCourse.bannerImageUrl}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white/20 shadow-sm shrink-0"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
                      {previewCourse.category?.categoryNameEn || 'Course'}
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      {previewCourse.courseCode}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">{previewCourse.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setPreviewCourse(null)}
                className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm">
              {/* Status Banner with Quick Action */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                previewCourse.status === 'Published'
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/90 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-start gap-3">
                  {previewCourse.status === 'Published' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">
                        Status: {previewCourse.status === 'Published' ? 'Published (Live on Website)' : 'Draft (Hidden from Public)'}
                      </p>
                      {previewCourse.applicationCalled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 text-white font-bold text-[11px] rounded-full shadow-xs">
                          <Sparkles size={11} />
                          <span>Application Called</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-200 text-gray-700 font-semibold text-[11px] rounded-full">
                          <span>Application Closed</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-80 mt-0.5">
                      {previewCourse.status === 'Published'
                        ? 'This course is currently live and visible to visitors on the public website (/education).'
                        : 'This course is currently saved as a draft and is hidden from public visitors. Click "Publish Now" to make it visible.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleApplicationCalled(previewCourse.id, !!previewCourse.applicationCalled)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5 ${
                      previewCourse.applicationCalled
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {previewCourse.applicationCalled ? (
                      <>
                        <XCircle size={14} className="shrink-0" />
                        <span>Mark App Closed</span>
                      </>
                    ) : (
                      <>
                        <Megaphone size={14} className="shrink-0" />
                        <span>Mark App Called</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleCourseStatus(previewCourse.id, previewCourse.status)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5 ${
                      previewCourse.status === 'Published'
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {previewCourse.status === 'Published' ? (
                      <>
                        <Lock size={14} className="shrink-0" />
                        <span>Set as Draft</span>
                      </>
                    ) : (
                      <>
                        <Globe size={14} className="shrink-0" />
                        <span>Publish Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ── 3 Month Schedule & Important Months Card ── */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 p-5 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Course Intake Months & Schedule</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">1. Application Calling Month</span>
                    <p className="font-bold text-gray-900 text-sm mt-1 text-emerald-900">
                      {previewCourse.applicationCallingMonth || <span className="text-gray-400 font-normal italic">Not specified</span>}
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">2. Enrollment Month</span>
                    <p className="font-bold text-gray-900 text-sm mt-1 text-teal-900">
                      {previewCourse.enrollmentMonth || <span className="text-gray-400 font-normal italic">Not specified</span>}
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">3. Course Start Month</span>
                    <p className="font-bold text-gray-900 text-sm mt-1 text-indigo-900">
                      {previewCourse.startMonth || <span className="text-gray-400 font-normal italic">Not specified</span>}
                    </p>
                  </div>
                </div>

                {previewCourse.deadlineDate && (
                  <div className="text-xs text-gray-600 bg-white/80 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-500" />
                    <span>Application Deadline: <strong>{new Date(previewCourse.deadlineDate).toLocaleDateString()}</strong></span>
                  </div>
                )}
              </div>

              {/* ── Key Metrics Grid ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
                <div>
                  <p className="text-gray-400 font-medium">Qualification Level</p>
                  <p className="font-bold text-gray-900 mt-0.5">{previewCourse.courseLevel}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Duration</p>
                  <p className="font-bold text-gray-900 mt-0.5">{previewCourse.durationValue} {previewCourse.durationUnit}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Course Fee</p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {previewCourse.courseFee === 0 ? <span className="text-emerald-700 font-bold">Free</span> : `Rs. ${previewCourse.courseFee.toLocaleString()} LKR`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Delivery Mode</p>
                  <p className="font-bold text-gray-900 mt-0.5">{previewCourse.deliveryMode.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* ── Venues & Location Section ── */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Venue Locations</span>
                </div>
                {previewCourse.venueLocations && previewCourse.venueLocations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {previewCourse.venueLocations.map((loc, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-800">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span>{loc}</span>
                      </div>
                    ))}
                  </div>
                ) : previewCourse.venueLocation ? (
                  <p className="text-xs text-gray-800 font-medium bg-white px-3 py-2 rounded-xl border border-gray-200">{previewCourse.venueLocation}</p>
                ) : (
                  <p className="text-xs text-gray-400 italic">No venue locations specified.</p>
                )}
              </div>

              {/* ── Download Application File & Accreditation ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Application File */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Application Document</span>
                  {previewCourse.applicationFileUrl ? (
                    <a
                      href={previewCourse.applicationFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download Application PDF</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No application document uploaded.</p>
                  )}
                </div>

                {/* Accreditation */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1.5 text-xs">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Accreditation & Certification</span>
                  <p className="text-gray-800"><strong>Certificate:</strong> {previewCourse.certificateType || 'Government Recognized Certificate'}</p>
                  <p className="text-gray-800"><strong>Accreditation:</strong> {previewCourse.accreditedBy || 'TVEC / Department of Agriculture'}</p>
                </div>
              </div>

              {/* ── Rich Text Description ── */}
              {previewCourse.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-600 tracking-wider">Course Description</h4>
                  <div
                    className="p-5 bg-gray-50 rounded-2xl border border-gray-200 text-xs sm:text-sm text-gray-800 leading-relaxed max-w-none prose prose-emerald"
                    dangerouslySetInnerHTML={{ __html: previewCourse.description }}
                  />
                </div>
              )}

              {/* ── Entry Requirements ── */}
              {previewCourse.entryRequirements && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-600 tracking-wider">Entry Requirements</h4>
                  <div
                    className="p-5 bg-gray-50 rounded-2xl border border-gray-200 text-xs sm:text-sm text-gray-800 leading-relaxed max-w-none prose prose-emerald"
                    dangerouslySetInnerHTML={{ __html: previewCourse.entryRequirements }}
                  />
                </div>
              )}

              {/* ── Curriculum Modules ── */}
              {previewCourse.modules && previewCourse.modules.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-gray-600 tracking-wider">
                    Syllabus Modules ({previewCourse.modules.length} Modules)
                  </h4>
                  <div className="space-y-2">
                    {previewCourse.modules.map((m, i) => (
                      <div key={i} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                        <p className="font-bold text-gray-900 text-sm">
                          <span className="text-emerald-700 mr-2">Module {m.moduleOrder || (i + 1)}:</span>
                          {m.moduleTitle}
                        </p>
                        {m.moduleDescription && (
                          <p className="text-gray-600 mt-1 leading-relaxed">{m.moduleDescription}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Related Jobs ── */}
              {previewCourse.relatedJobs && previewCourse.relatedJobs.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-5 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                    <Briefcase className="w-4 h-4 text-blue-700" />
                    <span>Career Pathways & Related Jobs ({previewCourse.relatedJobs.length} Related Jobs)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {previewCourse.relatedJobs.map((job) => (
                      <span
                        key={job.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-900 rounded-xl text-xs font-bold shadow-2xs"
                      >
                        <Briefcase size={12} className="text-blue-600" />
                        {job.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Instructor Info ── */}
              {previewCourse.instructor && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {previewCourse.instructor.fullName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Lead Instructor / Resource Person</span>
                    <h5 className="font-bold text-gray-900 text-sm">{previewCourse.instructor.fullName}</h5>
                    <p className="text-xs text-gray-600">{previewCourse.instructor.designation} • {previewCourse.instructor.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewCourse(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const toEdit = previewCourse;
                  setPreviewCourse(null);
                  openEditModal(toEdit);
                }}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Edit size={14} />
                <span>Edit This Course</span>
              </button>
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
                  placeholder="e.g. කාබනික කෘෂිකර්මය"
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  required
                  placeholder="e.g. Dr. Nimal Senaratne"
                  value={newInsForm.fullName}
                  onChange={e => setNewInsForm({ ...newInsForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Designation</label>
                  <input
                    placeholder="e.g. Senior Agricultural Officer"
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
                  placeholder="Short bio, qualifications and practical training background..."
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
      {/* ── MANAGE RELATED JOBS MODAL ── */}
      {/* ==================================================================== */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsJobModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl p-6 border border-gray-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Manage Related Jobs</h3>
                  <p className="text-[11px] text-gray-500">Manage master career pathways and job opportunities linked to courses</p>
                </div>
              </div>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Create New Job Form */}
            <form onSubmit={handleCreateRelatedJob} className="pt-4 pb-3 shrink-0">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Create New Related Job
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Farm Manager"
                  value={newJobName}
                  onChange={e => setNewJobName(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmittingJob || !newJobName.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <Plus size={15} />
                  <span>{isSubmittingJob ? 'Adding...' : 'Add Job'}</span>
                </button>
              </div>
            </form>

            {/* Search Filter for Jobs */}
            <div className="py-2 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search existing jobs..."
                  value={jobSearch}
                  onChange={e => setJobSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>

            {/* Job Items List */}
            <div className="overflow-y-auto flex-1 my-2 divide-y divide-gray-100 pr-1 space-y-1">
              {relatedJobs
                .filter(j => !jobSearch || j.name.toLowerCase().includes(jobSearch.toLowerCase()))
                .length === 0 ? (
                <div className="text-center py-8 px-4 text-gray-400">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No career opportunities found.</p>
                  <p className="text-[11px] mt-0.5">Enter a new job above to add to the pool.</p>
                </div>
              ) : (
                relatedJobs
                  .filter(j => !jobSearch || j.name.toLowerCase().includes(jobSearch.toLowerCase()))
                  .map(job => (
                    <div
                      key={job.id}
                      className="py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between gap-3 group"
                    >
                      {editingJobId === job.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingJobName}
                            onChange={e => setEditingJobName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleUpdateRelatedJob(job.id);
                              if (e.key === 'Escape') { setEditingJobId(null); setEditingJobName(''); }
                            }}
                            autoFocus
                            className="flex-1 px-2.5 py-1.5 border border-blue-400 rounded-lg text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateRelatedJob(job.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Save changes"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingJobId(null); setEditingJobName(''); }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <span className="text-xs font-semibold text-gray-800 truncate">{job.name}</span>
                            {job._count?.courses !== undefined && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                job._count.courses > 0
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-gray-100 text-gray-500 border-gray-200'
                              }`}>
                                {job._count.courses} {job._count.courses === 1 ? 'course' : 'courses'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => { setEditingJobId(job.id); setEditingJobName(job.name); }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Job Name"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRelatedJob(job.id, job.name, job._count?.courses || 0)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Job from Master Pool"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center shrink-0">
              <span className="text-[11px] text-gray-500 font-medium">
                Total Jobs: {relatedJobs.length}
              </span>
              <button
                type="button"
                onClick={() => setIsJobModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
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
                      Fee: <strong>{selectedApp.course.courseFee === 0 ? 'Free' : `Rs. ${selectedApp.course.courseFee.toLocaleString()} LKR`}</strong>
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
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      selectedApp.status === 'Pending'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <Clock size={13} className="shrink-0" />
                    <span>Pending</span>
                  </button>
                  <button
                    onClick={() => handleUpdateAppStatus(selectedApp.id, 'Contacted')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      selectedApp.status === 'Contacted'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <Phone size={13} className="shrink-0" />
                    <span>Contacted</span>
                  </button>
                  <button
                    onClick={() => handleUpdateAppStatus(selectedApp.id, 'Approved')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      selectedApp.status === 'Approved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span>Approved</span>
                  </button>
                  <button
                    onClick={() => handleUpdateAppStatus(selectedApp.id, 'Rejected')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      selectedApp.status === 'Rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <XCircle size={13} className="shrink-0" />
                    <span>Rejected</span>
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

