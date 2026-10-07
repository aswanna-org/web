import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Edit, Trash2, X, FileText, Download,
  CheckCircle2, ExternalLink, Upload,
  BookOpen, Eye, Filter, RefreshCw, AlertCircle, FolderTree, Image as ImageIcon
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';
import { useConfirm } from '../components/ConfirmDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface AgriPublicationSubject {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  descriptionSi?: string | null;
  descriptionEn?: string | null;
  activeState: boolean;
  _count?: {
    publications: number;
  };
}

export interface AgriPublicationAndHandbook {
  id: string;
  slug: string;
  activeState: boolean;
  publishedState: boolean;
  typeSi?: string | null;
  typeEn?: string | null;
  titleSi: string;
  titleEn: string;
  publisherSi?: string | null;
  publisherEn?: string | null;
  authorSi?: string | null;
  authorEn?: string | null;
  subjectId?: string | null;
  subject?: AgriPublicationSubject | null;
  subjectSi?: string | null;
  subjectEn?: string | null;
  pdfUrl?: string | null;
  thumbnail?: string | null;
  createdAt: string;
  updatedAt: string;
}

const PUBLICATION_TYPES = [
  { en: 'Publication', si: 'ප්‍රකාශනය', desc: 'Agricultural publications, reports and periodicals' },
  { en: 'Handbook', si: 'අත්පොත', desc: 'Practical handbooks, guides, instructions and manuals' },
];

export const generateSlug = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const defaultForm = {
  titleEn: '',
  titleSi: '',
  slug: '',
  typeEn: 'Publication',
  typeSi: 'ප්‍රකාශනය',
  subjectId: '',
  subjectEn: '',
  subjectSi: '',
  authorEn: '',
  authorSi: '',
  publisherEn: '',
  publisherSi: '',
  pdfUrl: '',
  thumbnail: '',
  activeState: true,
  publishedState: true,
};

export default function AgriPublicationAndHandbookManagement() {
  const { confirm } = useConfirm();

  const [items, setItems] = useState<AgriPublicationAndHandbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgriPublicationAndHandbook | null>(null);
  const [viewingItem, setViewingItem] = useState<AgriPublicationAndHandbook | null>(null);

  // Form state
  const [form, setForm] = useState({ ...defaultForm });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingPdf, setIsUploadingPdf] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Thumbnail state
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState<boolean>(false);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState<number>(0);
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterPublished, setFilterPublished] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [filterActive, setFilterActive] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Subject management state
  const [subjects, setSubjects] = useState<AgriPublicationSubject[]>([]);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isSubjectManageModalOpen, setIsSubjectManageModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<AgriPublicationSubject | null>(null);
  const [isSavingSubject, setIsSavingSubject] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    nameEn: '',
    nameSi: '',
    descriptionEn: '',
    descriptionSi: '',
    activeState: true,
  });

  const token = localStorage.getItem('admin_token');
  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/publications-handbooks/subjects`);
      if (res.ok) {
        const data = await res.json();
        setSubjects(data || []);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchItems = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
      });

      if (search.trim()) params.append('search', search.trim());
      if (filterType !== 'ALL') params.append('type', filterType);
      if (filterSubject !== 'ALL') params.append('subjectId', filterSubject);
      if (filterPublished === 'PUBLISHED') params.append('publishedState', 'true');
      if (filterPublished === 'DRAFT') params.append('publishedState', 'false');
      if (filterActive === 'ACTIVE') params.append('activeState', 'true');
      if (filterActive === 'INACTIVE') params.append('activeState', 'false');

      const res = await fetch(`${API_BASE_URL}/publications-handbooks/admin/all?${params.toString()}`, {
        headers: authHeaders,
      });

      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
        if (json.meta) {
          setTotalPages(json.meta.totalPages || 1);
          setTotalCount(json.meta.total || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching publications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchItems(currentPage);
  }, [currentPage, search, filterType, filterSubject, filterPublished, filterActive]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePdfFileSelect = (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported / කරුණාකර PDF ලේඛනයක් තෝරන්න.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File exceeds 50MB maximum limit / ගොනුව 50MB උපරිම සීමාව ඉක්මවයි.');
      return;
    }

    setUploadError(null);
    setPdfFile(file);
    setUploadedFileName(file.name);
    setUploadedFileSize(formatFileSize(file.size));
    setIsUploadingPdf(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('pdf', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/publications-handbooks/upload-pdf`, true);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploadingPdf(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.pdfUrl) {
            setForm(prev => ({ ...prev, pdfUrl: res.pdfUrl }));
            setUploadProgress(100);
          } else {
            setUploadError('Server did not return a valid file URL.');
          }
        } catch {
          setUploadError('Failed to parse server upload response.');
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          setUploadError(errRes.error || `Upload failed (Status ${xhr.status})`);
        } catch {
          setUploadError(`Upload failed (Status ${xhr.status})`);
        }
      }
    };

    xhr.onerror = () => {
      setIsUploadingPdf(false);
      setUploadError('Network error occurred during PDF upload.');
    };

    xhr.send(formData);
  };

  const handleThumbnailFileSelect = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setThumbnailUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setThumbnailUploadError('Image exceeds 10MB maximum limit / ඡායාරූපය 10MB සීමාව ඉක්මවයි.');
      return;
    }

    setThumbnailUploadError(null);
    setThumbnailPreview(URL.createObjectURL(file));
    setIsUploadingThumbnail(true);
    setThumbnailUploadProgress(0);

    const formData = new FormData();
    formData.append('thumbnail', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/publications-handbooks/upload-thumbnail`, true);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setThumbnailUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploadingThumbnail(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          const url = res.thumbnailUrl || res.thumbnail;
          if (url) {
            setForm(prev => ({ ...prev, thumbnail: url }));
            setThumbnailPreview(url);
            setThumbnailUploadProgress(100);
          } else {
            setThumbnailUploadError('Server did not return a valid image URL.');
          }
        } catch {
          setThumbnailUploadError('Failed to parse upload response.');
        }
      } else {
        setThumbnailUploadError(`Upload failed (Status ${xhr.status})`);
      }
    };

    xhr.onerror = () => {
      setIsUploadingThumbnail(false);
      setThumbnailUploadError('Network error occurred during image upload.');
    };

    xhr.send(formData);
  };

  const handleRemoveThumbnail = () => {
    setThumbnailPreview('');
    setForm(prev => ({ ...prev, thumbnail: '' }));
    setThumbnailUploadProgress(0);
    setThumbnailUploadError(null);
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setForm(prev => ({ ...prev, pdfUrl: '' }));
    setUploadProgress(0);
    setUploadedFileName('');
    setUploadedFileSize('');
    setUploadError(null);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({ ...defaultForm });
    setIsSlugCustomized(false);
    setPdfFile(null);
    setUploadProgress(0);
    setIsUploadingPdf(false);
    setUploadedFileName('');
    setUploadedFileSize('');
    setUploadError(null);
    setThumbnailPreview('');
    setIsUploadingThumbnail(false);
    setThumbnailUploadProgress(0);
    setThumbnailUploadError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: AgriPublicationAndHandbook) => {
    setEditingItem(item);
    setIsSlugCustomized(true);
    setForm({
      titleEn: item.titleEn || '',
      titleSi: item.titleSi || '',
      slug: item.slug || '',
      typeEn: item.typeEn || 'Publication',
      typeSi: item.typeSi || 'ප්‍රකාශනය',
      subjectId: item.subjectId || item.subject?.id || '',
      subjectEn: item.subject?.nameEn || item.subjectEn || '',
      subjectSi: item.subject?.nameSi || item.subjectSi || '',
      authorEn: item.authorEn || '',
      authorSi: item.authorSi || '',
      publisherEn: item.publisherEn || '',
      publisherSi: item.publisherSi || '',
      pdfUrl: item.pdfUrl || '',
      thumbnail: item.thumbnail || '',
      activeState: item.activeState,
      publishedState: item.publishedState,
    });
    setPdfFile(null);
    setUploadProgress(item.pdfUrl ? 100 : 0);
    setIsUploadingPdf(false);
    setUploadedFileName(item.pdfUrl ? item.pdfUrl.split('/').pop() || 'Attached PDF' : '');
    setUploadedFileSize('');
    setUploadError(null);
    setThumbnailPreview(item.thumbnail || '');
    setIsUploadingThumbnail(false);
    setThumbnailUploadProgress(item.thumbnail ? 100 : 0);
    setThumbnailUploadError(null);
    setIsFormModalOpen(true);
  };

  const handleTitleEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setForm(prev => {
      const shouldAutoSlug = !isSlugCustomized || !prev.slug || prev.slug === generateSlug(prev.titleEn);
      return {
        ...prev,
        titleEn: newTitle,
        slug: shouldAutoSlug ? generateSlug(newTitle) : prev.slug,
      };
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugCustomized(true);
    setForm(prev => ({ ...prev, slug: e.target.value }));
  };

  const handleAutoGenerateSlug = () => {
    const autoSlug = generateSlug(form.titleEn);
    setForm(prev => ({ ...prev, slug: autoSlug }));
    setIsSlugCustomized(false);
  };

  const openViewModal = (item: AgriPublicationAndHandbook) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const openSubjectModal = (subj?: AgriPublicationSubject) => {
    if (subj) {
      setEditingSubject(subj);
      setSubjectForm({
        nameEn: subj.nameEn || '',
        nameSi: subj.nameSi || '',
        descriptionEn: subj.descriptionEn || '',
        descriptionSi: subj.descriptionSi || '',
        activeState: subj.activeState,
      });
    } else {
      setEditingSubject(null);
      setSubjectForm({
        nameEn: '',
        nameSi: '',
        descriptionEn: '',
        descriptionSi: '',
        activeState: true,
      });
    }
    setSubjectError(null);
    setIsSubjectModalOpen(true);
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.nameEn.trim() || !subjectForm.nameSi.trim()) {
      setSubjectError('Please enter both English and Sinhala subject names.');
      return;
    }

    setIsSavingSubject(true);
    setSubjectError(null);

    try {
      const url = editingSubject
        ? `${API_BASE_URL}/publications-handbooks/subjects/${editingSubject.id}`
        : `${API_BASE_URL}/publications-handbooks/subjects`;
      const method = editingSubject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectForm),
      });

      if (res.ok) {
        const savedSubject = await res.json();
        await fetchSubjects();
        if (isFormModalOpen) {
          setForm(prev => ({
            ...prev,
            subjectId: savedSubject.id,
            subjectEn: savedSubject.nameEn,
            subjectSi: savedSubject.nameSi,
          }));
        }
        setIsSubjectModalOpen(false);
      } else {
        const err = await res.json();
        setSubjectError(err.error || 'Failed to save subject.');
      }
    } catch (err) {
      console.error('Error saving subject:', err);
      setSubjectError('Network error occurred while saving subject.');
    } finally {
      setIsSavingSubject(false);
    }
  };

  const handleDeleteSubject = async (subj: AgriPublicationSubject) => {
    const isConfirmed = await confirm({
      title: 'Delete Publication Subject',
      subtitle: 'විෂය ක්ෂේත්‍රය ස්ථිරවම ඉවත් කිරීම',
      message: `Are you sure you want to delete the subject "${subj.nameEn}" (${subj.nameSi})?`,
      confirmText: 'Delete Subject',
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/publications-handbooks/subjects/${subj.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (res.ok) {
        if (form.subjectId === subj.id) {
          setForm(prev => ({ ...prev, subjectId: '', subjectEn: '', subjectSi: '' }));
        }
        fetchSubjects();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete subject.');
      }
    } catch (err) {
      console.error('Error deleting subject:', err);
      alert('Network error occurred while deleting subject.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.titleEn.trim() || !form.titleSi.trim()) {
      alert('Please enter both English and Sinhala titles.');
      return;
    }

    if (isUploadingPdf) {
      alert('Please wait for the PDF to finish uploading / කරුණාකර PDF ගොනුව upload වී අවසන් වනතුරු රැඳී සිටින්න.');
      return;
    }

    if (isUploadingThumbnail) {
      alert('Please wait for the thumbnail image to finish uploading / කරුණාකර ඡායාරූපය upload වී අවසන් වනතුරු රැඳී සිටින්න.');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('titleEn', form.titleEn.trim());
      formData.append('titleSi', form.titleSi.trim());
      const finalSlug = form.slug.trim() || generateSlug(form.titleEn);
      if (finalSlug) formData.append('slug', finalSlug);
      if (form.typeEn) formData.append('typeEn', form.typeEn.trim());
      if (form.typeSi) formData.append('typeSi', form.typeSi.trim());
      if (form.subjectId) formData.append('subjectId', form.subjectId);
      if (form.subjectEn) formData.append('subjectEn', form.subjectEn.trim());
      if (form.subjectSi) formData.append('subjectSi', form.subjectSi.trim());
      if (form.authorEn) formData.append('authorEn', form.authorEn.trim());
      if (form.authorSi) formData.append('authorSi', form.authorSi.trim());
      if (form.publisherEn) formData.append('publisherEn', form.publisherEn.trim());
      if (form.publisherSi) formData.append('publisherSi', form.publisherSi.trim());
      if (form.pdfUrl) formData.append('pdfUrl', form.pdfUrl.trim());
      if (form.thumbnail) formData.append('thumbnail', form.thumbnail.trim());
      formData.append('activeState', String(form.activeState));
      formData.append('publishedState', String(form.publishedState));

      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }

      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem
        ? `${API_BASE_URL}/publications-handbooks/${editingItem.id}`
        : `${API_BASE_URL}/publications-handbooks`;

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: formData,
      });

      if (res.ok) {
        setIsFormModalOpen(false);
        fetchItems(currentPage);
      } else {
        const error = await res.json();
        alert(`Failed to save: ${error.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('Error saving publication:', err);
      alert('Network or server error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleState = async (
    item: AgriPublicationAndHandbook,
    field: 'activeState' | 'publishedState'
  ) => {
    const newValue = !item[field];
    try {
      // Optimistic update
      setItems(prev =>
        prev.map(p => (p.id === item.id ? { ...p, [field]: newValue } : p))
      );

      const res = await fetch(`${API_BASE_URL}/publications-handbooks/${item.id}/status`, {
        method: 'PATCH',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (!res.ok) {
        // Rollback on failure
        fetchItems(currentPage);
      }
    } catch (err) {
      console.error(`Error toggling ${field}:`, err);
      fetchItems(currentPage);
    }
  };

  const handleDelete = async (item: AgriPublicationAndHandbook) => {
    const isConfirmed = await confirm({
      title: 'Delete Publication or Handbook',
      subtitle: 'ප්‍රකාශනය හෝ අත්පොත ස්ථිරවම ඉවත් කිරීම',
      message: `Are you sure you want to delete "${item.titleEn}" (${item.titleSi})? This action cannot be undone.`,
      confirmText: 'Delete Publication',
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/publications-handbooks/${item.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (res.ok) {
        fetchItems(currentPage);
      } else {
        const err = await res.json();
        alert(`Failed to delete: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting publication:', err);
      alert('Network error while deleting publication.');
    }
  };

  // Stats
  const publishedCount = items.filter(i => i.publishedState).length;
  const activeCount = items.filter(i => i.activeState).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Agri Publications & Handbooks Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                කෘෂිකාර්මික ප්‍රකාශන, අත්පොත් සහ මාර්ගෝපදේශ පාලනය
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSubjectManageModalOpen(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Manage publication subjects"
          >
            <FolderTree size={16} className="text-emerald-600" />
            <span className="hidden sm:inline">Subjects ({subjects.length})</span>
          </button>
          <button
            onClick={() => fetchItems(currentPage)}
            title="Refresh list"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all"
          >
            <Plus size={18} />
            <span>Add Publication</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Items</span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Published</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{publishedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Drafts</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{items.length - publishedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Active</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{activeCount}</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Title, Author, Publisher, or Subject..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
            <Filter size={14} className="text-gray-400 ml-1.5" />
            <select
              value={filterType}
              onChange={e => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none text-xs font-medium text-gray-700 py-1 pl-1 pr-6 focus:outline-none"
            >
              <option value="ALL">All Types (සියල්ල)</option>
              {PUBLICATION_TYPES.map((p, idx) => (
                <option key={idx} value={p.en}>
                  {p.en} ({p.si})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={e => {
              setFilterSubject(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 rounded-xl px-3 py-2 focus:outline-none max-w-[170px] truncate"
          >
            <option value="ALL">Subject: All (සියල්ල)</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.nameEn} ({s.nameSi})
              </option>
            ))}
          </select>

          {/* Published State Filter */}
          <select
            value={filterPublished}
            onChange={e => {
              setFilterPublished(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">Status: All</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Drafts Only</option>
          </select>

          {/* Active State Filter */}
          <select
            value={filterActive}
            onChange={e => {
              setFilterActive(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">Visibility: All</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex justify-center shadow-xs">
          <AgroLoader message="ප්‍රකාශන තොරතුරු පූරණය වෙමින් පවතී..." />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center mb-4">
            <BookOpen size={30} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No Publications or Handbooks Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
            {search
              ? 'No matching publications found for your search query.'
              : 'Start by adding your first agricultural publication, handbook, or manual.'}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add New Item</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Type & Subject</th>
                  <th className="px-3 py-2">Author / Publisher</th>
                  <th className="px-3 py-2 text-center">PDF</th>
                  <th className="px-3 py-2 text-center">Published</th>
                  <th className="px-3 py-2 text-center">Active</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Title & Slug */}
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2 max-w-sm">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                            <BookOpen size={12} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-semibold text-gray-900 truncate block text-xs" title={item.titleEn}>
                            {item.titleEn}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <span className="truncate max-w-[130px]" title={item.titleSi}>{item.titleSi}</span>
                            <span>•</span>
                            <span className="font-mono truncate max-w-[110px]">/{item.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type & Subject */}
                    <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                          {item.typeEn || 'Handbook'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span
                          className="truncate max-w-[160px] text-xs text-gray-700 inline-block"
                          title={item.subject ? `${item.subject.nameEn} (${item.subject.nameSi})` : item.subjectEn || item.subjectSi || '-'}
                        >
                          {item.subject ? item.subject.nameEn : (item.subjectEn || item.subjectSi || '-')}
                        </span>
                      </div>
                    </td>

                    {/* Author / Publisher */}
                    <td className="px-3 py-1.5 whitespace-nowrap text-gray-600">
                      <div className="max-w-[160px] truncate" title={`${item.authorEn || item.authorSi || '—'} ${item.publisherEn || item.publisherSi ? `(${item.publisherEn || item.publisherSi})` : ''}`}>
                        <span className="font-medium text-gray-800 text-xs truncate block">
                          {item.authorEn || item.authorSi || '—'}
                        </span>
                        {(item.publisherEn || item.publisherSi) && (
                          <span className="text-[10px] text-gray-400 truncate block">
                            {item.publisherEn || item.publisherSi}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* PDF Document */}
                    <td className="px-3 py-1.5 text-center whitespace-nowrap">
                      {item.pdfUrl ? (
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 transition-colors cursor-pointer"
                          title="Open PDF Document"
                        >
                          <FileText size={11} />
                          <span>PDF</span>
                          <ExternalLink size={9} className="opacity-70" />
                        </a>
                      ) : (
                        <span className="text-gray-300 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Published State Quick Toggle */}
                    <td className="px-3 py-1.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleState(item, 'publishedState')}
                        title="Click to toggle Published / Draft"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                          item.publishedState
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.publishedState ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                        <span>{item.publishedState ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>

                    {/* Active State Quick Toggle */}
                    <td className="px-3 py-1.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleState(item, 'activeState')}
                        title="Click to toggle Active / Inactive"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                          item.activeState
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.activeState ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                        <span>{item.activeState ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-1.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(item)}
                          className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
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

          {totalPages > 1 && (
            <div className="border-t border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={page => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL (Expanded Single-View Layout) ── */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs select-none overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden my-6">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Publication or Handbook' : 'New Publication or Handbook'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingItem ? 'ප්‍රකාශන තොරතුරු සංස්කරණය කිරීම' : 'නව කෘෂිකාර්මික ප්‍රකාශනයක් හෝ අත්පොතක් එක් කිරීම'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Single Unified Form (No Tabs) */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[78vh] overflow-y-auto">
              {/* 1. Type Selection Cards */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100/80">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                  Select Type / ප්‍රභේදය තෝරන්න <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {PUBLICATION_TYPES.map(itemType => {
                    const isSelected = form.typeEn === itemType.en;
                    return (
                      <div
                        key={itemType.en}
                        onClick={() => setForm({ ...form, typeEn: itemType.en, typeSi: itemType.si })}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-sm'
                            : 'border-gray-200 bg-white/70 hover:border-gray-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-gray-900">{itemType.en}</span>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-emerald-700 mt-1">
                          {itemType.si}
                        </span>
                        <span className="text-xs text-gray-500 mt-1.5">
                          {itemType.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Title Section (Bilingual 2 Columns) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Basic Titles & URL Slug
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* English Title */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Title (English) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.titleEn}
                      onChange={handleTitleEnChange}
                      placeholder="e.g. Handbook of Crop Protection and Management"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Sinhala Title */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Title (Sinhala) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.titleSi}
                      onChange={e => setForm({ ...form, titleSi: e.target.value })}
                      placeholder="උදා: බෝග ආරක්ෂණ සහ කළමනාකරණ අත්පොත"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Custom URL Slug with Auto-generate */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase">
                      URL Slug <span className="text-gray-400 font-normal lowercase">(auto-generated)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateSlug}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer border border-emerald-100"
                      title="Sync slug with English title"
                    >
                      <RefreshCw size={11} />
                      <span>Sync with Title</span>
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-mono text-sm">
                      /
                    </span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={handleSlugChange}
                      placeholder="e.g. handbook-of-crop-protection-and-management"
                      className="w-full pl-7 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    English Title එක type කරන විට slug එක ස්වයංක්‍රීයව සෑදේ. අවශ්‍ය නම් වෙනස් කිරීමටද හැකිය.
                  </p>
                </div>
              </div>

              {/* 3. Publication Metadata (Subject, Author, Publisher) */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Publication Details & Attribution
                </h4>

                {/* Associated Subject Selector */}
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Subject / විෂය ක්ෂේත්‍රය
                      </label>
                      <span className="text-[11px] text-gray-500">
                        Select an existing subject or save a new one
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openSubjectModal()}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>New Subject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSubjectManageModalOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <FolderTree size={14} className="text-gray-500" />
                        <span>Manage</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <select
                      value={form.subjectId || ''}
                      onChange={e => {
                        const selId = e.target.value;
                        const matched = subjects.find(s => s.id === selId);
                        setForm({
                          ...form,
                          subjectId: selId,
                          subjectEn: matched ? matched.nameEn : '',
                          subjectSi: matched ? matched.nameSi : '',
                        });
                      }}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- No Subject Assigned / විෂයයක් තෝරාගෙන නැත --</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nameEn} ({s.nameSi})
                        </option>
                      ))}
                    </select>
                  </div>

                  {form.subjectId && (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        <span className="font-semibold text-emerald-950 truncate">
                          Selected: {form.subjectEn} ({form.subjectSi})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, subjectId: '', subjectEn: '', subjectSi: '' })}
                        className="text-gray-400 hover:text-red-600 p-1 rounded-lg transition-colors ml-2"
                        title="Clear selection"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Author */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Author (English)
                    </label>
                    <input
                      type="text"
                      value={form.authorEn}
                      onChange={e => setForm({ ...form, authorEn: e.target.value })}
                      placeholder="e.g. Department of Agriculture"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Author (Sinhala)
                    </label>
                    <input
                      type="text"
                      value={form.authorSi}
                      onChange={e => setForm({ ...form, authorSi: e.target.value })}
                      placeholder="උදා: කෘෂිකර්ම දෙපාර්තමේන්තුව"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Publisher */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Publisher (English)
                    </label>
                    <input
                      type="text"
                      value={form.publisherEn}
                      onChange={e => setForm({ ...form, publisherEn: e.target.value })}
                      placeholder="e.g. Ministry of Agriculture"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Publisher (Sinhala)
                    </label>
                    <input
                      type="text"
                      value={form.publisherSi}
                      onChange={e => setForm({ ...form, publisherSi: e.target.value })}
                      placeholder="උදා: කෘෂිකර්ම අමාත්‍යාංශය"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Thumbnail / Cover Image Upload */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Thumbnail / Cover Image
                  </h4>
                  <span className="text-[11px] text-gray-400">PNG, JPG, WEBP (Max 10MB)</span>
                </div>

                <div className="rounded-2xl bg-gray-50/80 border border-gray-200/80 p-4">
                  {!thumbnailPreview && !isUploadingThumbnail ? (
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl cursor-pointer hover:bg-emerald-50/30 transition-all bg-white group text-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
                        <ImageIcon size={20} />
                      </div>
                      <span className="text-xs font-semibold text-gray-800">
                        Click or drag & drop thumbnail image
                      </span>
                      <span className="text-[11px] text-gray-400 mt-0.5">
                        කවරයේ ඡායාරූපය මෙතැනින් උඩුගත කරන්න (Public side එකේ පෙන්වයි)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handleThumbnailFileSelect(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  ) : null}

                  {/* Thumbnail Uploading Progress */}
                  {isUploadingThumbnail && (
                    <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-800">Uploading thumbnail image...</span>
                        <span className="font-mono font-bold text-emerald-600">{thumbnailUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full transition-all duration-150"
                          style={{ width: `${thumbnailUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Thumbnail Attached Preview */}
                  {thumbnailPreview && !isUploadingThumbnail && (
                    <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200 shadow-2xs shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-gray-800 truncate block">
                            Thumbnail Attached
                          </span>
                          <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium mt-0.5">
                            <CheckCircle2 size={12} /> Ready to save
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveThumbnail}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove thumbnail"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {thumbnailUploadError && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle size={13} /> {thumbnailUploadError}
                    </p>
                  )}
                </div>
              </div>

              {/* 5. PDF Attachment (Upload with Real-time Percentage Progress) */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Document Attachment (PDF)
                  </h4>
                  <span className="text-[11px] text-gray-400">PDF up to 50MB</span>
                </div>

                <div className="rounded-2xl bg-gray-50/80 border border-gray-200/80 p-4">
                  {!form.pdfUrl && !isUploadingPdf && !uploadError ? (
                    <label className="flex flex-col items-center justify-center p-7 sm:p-9 border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl cursor-pointer hover:bg-emerald-50/30 transition-all bg-white group text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                        <Upload size={22} />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        Click or drag & drop PDF file to upload
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        කෘෂිකාර්මික ප්‍රකාශනය හෝ අත්පොත (PDF) මෙතැනින් උඩුගත කරන්න (උපරිම 50MB)
                      </span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handlePdfFileSelect(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  ) : null}

                  {/* UPLOADING STATE WITH REAL-TIME PERCENTAGE */}
                  {isUploadingPdf && (
                    <div className="p-5 bg-white rounded-xl border border-emerald-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <FileText size={20} className="animate-pulse" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800 truncate max-w-[240px] sm:max-w-md">
                              {uploadedFileName || 'Uploading PDF document...'}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {uploadedFileSize ? `${uploadedFileSize} • ` : ''}Uploading to server...
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-600 font-mono tracking-tight">
                            {uploadProgress}%
                          </span>
                        </div>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-3 rounded-full transition-all duration-150 ease-out shadow-xs"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5 font-medium">
                        <span>කරුණාකර රැඳී සිටින්න (Please wait)...</span>
                        <span>{uploadProgress === 100 ? 'Finalizing upload...' : `${uploadProgress}% completed`}</span>
                      </div>
                    </div>
                  )}

                  {/* UPLOAD ERROR STATE */}
                  {uploadError && !isUploadingPdf && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-red-700">
                          <span className="font-bold block">Upload failed:</span>
                          <span>{uploadError}</span>
                        </div>
                      </div>
                      <label className="shrink-0 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
                        Try Again
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handlePdfFileSelect(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {/* ATTACHED / UPLOADED SUCCESS STATE */}
                  {form.pdfUrl && !isUploadingPdf && (
                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-bold text-gray-800 truncate max-w-[220px] sm:max-w-xs">
                              {uploadedFileName || (form.pdfUrl.split('/').pop() || 'Attached PDF Document')}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 size={11} />
                              100% Uploaded
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {uploadedFileSize ? `${uploadedFileSize} • ` : ''}PDF document ready to publish
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <a
                          href={form.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <ExternalLink size={13} />
                          <span>Preview</span>
                        </a>
                        <label className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                          Replace
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                handlePdfFileSelect(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemovePdf}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove PDF"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Publishing Status Settings */}
              <div className="pt-2 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Published State Switcher */}
                  <div
                    onClick={() => setForm({ ...form, publishedState: !form.publishedState })}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 hover:bg-gray-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="block text-xs font-bold text-gray-800">Published State</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            form.publishedState ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {form.publishedState ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500">ප්‍රසිද්ධ කර ඇති බව (Public Website)</span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.publishedState}
                      onClick={e => {
                        e.stopPropagation();
                        setForm({ ...form, publishedState: !form.publishedState });
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        form.publishedState ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          form.publishedState ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Active State Switcher */}
                  <div
                    onClick={() => setForm({ ...form, activeState: !form.activeState })}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 hover:bg-gray-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="block text-xs font-bold text-gray-800">Active State</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            form.activeState ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {form.activeState ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500">පද්ධතියේ සක්‍රිය බව (Active)</span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.activeState}
                      onClick={e => {
                        e.stopPropagation();
                        setForm({ ...form, activeState: !form.activeState });
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        form.activeState ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          form.activeState ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingPdf}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {(isSaving || isUploadingPdf) && <RefreshCw size={14} className="animate-spin" />}
                  <span>
                    {isUploadingPdf
                      ? `Uploading PDF (${uploadProgress}%)...`
                      : editingItem
                      ? 'Update Publication'
                      : 'Create Publication'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW DETAILS MODAL ── */}
      {isViewModalOpen && viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4.5 border-b border-gray-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Publication Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {viewingItem.thumbnail && (
                <div className="rounded-2xl overflow-hidden border border-gray-100 max-h-52 bg-gray-50 flex items-center justify-center">
                  <img
                    src={viewingItem.thumbnail}
                    alt={viewingItem.titleEn}
                    className="w-full h-52 object-cover"
                  />
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold uppercase text-gray-400">English Title</span>
                <p className="text-base font-bold text-gray-900 mt-0.5">{viewingItem.titleEn}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-gray-400">Sinhala Title</span>
                <p className="text-base font-bold text-gray-900 mt-0.5">{viewingItem.titleSi}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400">Type</span>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5">
                    {viewingItem.typeEn || 'Handbook'} ({viewingItem.typeSi || 'අත්පොත'})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400">Subject</span>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5">
                    {viewingItem.subjectEn || viewingItem.subjectSi || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400">Author</span>
                  <p className="text-xs font-medium text-gray-800 mt-0.5">
                    {viewingItem.authorEn || viewingItem.authorSi || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400">Publisher</span>
                  <p className="text-xs font-medium text-gray-800 mt-0.5">
                    {viewingItem.publisherEn || viewingItem.publisherSi || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-gray-400">Slug</span>
                <p className="font-mono text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg mt-0.5">
                  /publications-handbooks/{viewingItem.slug}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    viewingItem.publishedState
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {viewingItem.publishedState ? 'Published' : 'Draft'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    viewingItem.activeState
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {viewingItem.activeState ? 'Active' : 'Inactive'}
                </span>
              </div>

              {viewingItem.pdfUrl && (
                <div className="pt-2">
                  <a
                    href={viewingItem.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    <Download size={15} />
                    <span>Download / View PDF File</span>
                  </a>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT SUBJECT MODAL ── */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FolderTree size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingSubject ? 'Edit Subject' : 'New Publication Subject'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {editingSubject ? 'විෂය ක්ෂේත්‍රය සංස්කරණය' : 'නව විෂය ක්ෂේත්‍රයක් එක් කිරීම'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubjectSubmit} className="p-6 space-y-4">
              {subjectError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{subjectError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Subject Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.nameEn}
                  onChange={e => setSubjectForm({ ...subjectForm, nameEn: e.target.value })}
                  placeholder="e.g. Paddy Cultivation, Plant Pathology"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Subject Name (Sinhala) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.nameSi}
                  onChange={e => setSubjectForm({ ...subjectForm, nameSi: e.target.value })}
                  placeholder="උදා: වී වගාව, ශාක රෝග විද්‍යාව"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Description (English - Optional)
                </label>
                <textarea
                  rows={2}
                  value={subjectForm.descriptionEn}
                  onChange={e => setSubjectForm({ ...subjectForm, descriptionEn: e.target.value })}
                  placeholder="Brief description of the subject..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Description (Sinhala - Optional)
                </label>
                <textarea
                  rows={2}
                  value={subjectForm.descriptionSi}
                  onChange={e => setSubjectForm({ ...subjectForm, descriptionSi: e.target.value })}
                  placeholder="විෂය පිළිබඳ කෙටි විස්තරයක්..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Status Switcher */}
              <div
                onClick={() => setSubjectForm({ ...subjectForm, activeState: !subjectForm.activeState })}
                className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100/70 transition-colors cursor-pointer select-none"
              >
                <div>
                  <span className="block text-xs font-bold text-gray-800">Active State</span>
                  <span className="text-[11px] text-gray-500">සක්‍රිය විෂය ක්ෂේත්‍රයක් බව</span>
                </div>
                <div
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    subjectForm.activeState ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      subjectForm.activeState ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSubject}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {isSavingSubject && <RefreshCw size={13} className="animate-spin" />}
                  <span>{editingSubject ? 'Update Subject' : 'Save Subject'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MANAGE ALL SUBJECTS MODAL ── */}
      {isSubjectManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FolderTree size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Manage Publication Subjects</h3>
                  <p className="text-xs text-gray-500">ප්‍රකාශන විෂය ක්ෂේත්‍ර කළමනාකරණය ({subjects.length})</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openSubjectModal()}
                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Subject</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubjectManageModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {subjects.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FolderTree size={36} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-semibold">No subjects created yet.</p>
                  <p className="text-xs text-gray-400 mt-0.5">Click "Add Subject" above to create your first subject.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                  {subjects.map(subj => (
                    <div
                      key={subj.id}
                      className="p-4 flex items-center justify-between gap-3 bg-white hover:bg-gray-50/70 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                            {subj.nameEn}
                          </span>
                          <span className="text-xs text-emerald-700 font-medium">
                            ({subj.nameSi})
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              subj.activeState ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {subj.activeState ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {subj.descriptionEn && (
                          <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{subj.descriptionEn}</p>
                        )}
                        <span className="inline-block mt-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {subj._count?.publications || 0} publications linked
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openSubjectModal(subj)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Subject"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubject(subj)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Subject"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsSubjectManageModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
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
