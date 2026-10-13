import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Share2,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Layers,
  Tag
} from 'lucide-react';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PlatformSubType {
  id: string;
  name: string;
  slug: string;
  platformId: string;
  platform?: { id: string; name: string; slug: string; icon?: string | null; imageUrl?: string | null };
  _count?: { socialLinks: number };
  createdAt: string;
  updatedAt: string;
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  imageUrl?: string | null;
  subTypes?: PlatformSubType[];
  _count?: { subTypes: number; socialLinks: number };
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  id: string;
  title: string;
  slug: string;
  hyperlink: string;
  imageUrl?: string | null;
  icon?: string | null;
  description?: string | null;
  activeState: boolean;
  order: number;
  platformId: string;
  platform?: { id: string; name: string; slug: string; icon?: string | null; imageUrl?: string | null };
  subTypeId?: string | null;
  subType?: { id: string; name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
}

type TabKey = 'links' | 'platforms' | 'subtypes';

interface LinkFormState {
  title: string;
  slug: string;
  hyperlink: string;
  imageUrl: string;
  icon: string;
  description: string;
  activeState: boolean;
  order: number;
  platformId: string;
  subTypeId: string;
}

interface PlatformFormState {
  name: string;
  slug: string;
  icon: string;
  imageUrl: string;
}

interface SubTypeFormState {
  name: string;
  slug: string;
  platformId: string;
}

const emptyLinkForm: LinkFormState = {
  title: '',
  slug: '',
  hyperlink: '',
  imageUrl: '',
  icon: '',
  description: '',
  activeState: true,
  order: 0,
  platformId: '',
  subTypeId: ''
};

const emptyPlatformForm: PlatformFormState = { name: '', slug: '', icon: '', imageUrl: '' };
const emptySubTypeForm: SubTypeFormState = { name: '', slug: '', platformId: '' };

const formatDisplayDate = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-CA');
};

const extractList = (json: any): any[] => json?.data || json?.items || (Array.isArray(json) ? json : []);

// ─── Shared UI classes ──────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-xs placeholder:text-gray-400 transition-all';
const labelCls = 'block font-semibold text-gray-700 mb-1';
const thCls =
  'px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200';
const actionBtnBase = 'p-1 text-gray-500 rounded transition-colors cursor-pointer';

// ─── Small helper components ────────────────────────────────────────────────

function Thumb({ src, fallback, onClick }: { src?: string | null; fallback?: string | null; onClick?: () => void }) {
  const isUrl = (val?: string | null) => !!val && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'));
  const effectiveImg = src || (isUrl(fallback) ? fallback : null);

  if (effectiveImg) {
    return (
      <img
        src={effectiveImg}
        alt=""
        onClick={onClick}
        className={`w-7 h-7 rounded object-contain bg-gray-50 border border-gray-200 shrink-0 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      />
    );
  }
  return (
    <div className="w-7 h-7 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0 text-[10px] font-bold uppercase overflow-hidden">
      {fallback ? <span className="truncate px-0.5">{fallback.slice(0, 2)}</span> : <ImageIcon size={13} />}
    </div>
  );
}

function ImagePicker({
  previewUrl,
  urlValue,
  hasFile,
  onFileSelect,
  onUrlChange,
  onRemove,
  hint,
  uploadLabel = 'Click to upload image',
  urlPlaceholder = 'Or enter direct Image URL (https://...)'
}: {
  previewUrl: string | null;
  urlValue: string;
  hasFile: boolean;
  onFileSelect: (file: File) => void;
  onUrlChange: (url: string) => void;
  onRemove: () => void;
  hint?: string;
  uploadLabel?: string;
  urlPlaceholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-28 flex items-center justify-center group mb-2">
          <img src={previewUrl} alt="Preview" className="max-h-24 object-contain" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2.5 py-1 bg-white text-gray-800 text-[11px] font-semibold rounded-md shadow-xs hover:bg-gray-50 cursor-pointer"
            >
              Change
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="px-2.5 py-1 bg-rose-600 text-white text-[11px] font-semibold rounded-md shadow-xs hover:bg-rose-700 cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-lg p-3 text-center cursor-pointer bg-gray-50/50 hover:bg-emerald-50/20 transition-all mb-2"
        >
          <Upload size={18} className="mx-auto text-emerald-600 mb-1" />
          <p className="font-semibold text-gray-700 text-xs">{uploadLabel}</p>
          {hint && <p className="text-[10px] text-emerald-700 font-medium mt-0.5">{hint}</p>}
          <p className="text-[9px] text-gray-400">PNG, JPG, WEBP, SVG</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = '';
        }}
      />

      <input
        type="text"
        placeholder={urlPlaceholder}
        value={urlValue}
        disabled={hasFile}
        onChange={e => onUrlChange(e.target.value)}
        className={`${inputCls} disabled:opacity-50`}
      />
    </div>
  );
}

function ModalShell({
  title,
  icon,
  onClose,
  children,
  maxWidth = 'max-w-lg'
}: {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className={`bg-white rounded-xl shadow-xl border border-gray-200 w-full ${maxWidth} overflow-hidden my-8`}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({
  onCancel,
  isSaving,
  label
}: {
  onCancel: () => void;
  isSaving: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
        <span>{label}</span>
      </button>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SocialLinkManagement() {
  const { confirm } = useConfirm();

  // Data
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [subTypes, setSubTypes] = useState<PlatformSubType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tabs, filters, pagination
  const [activeTab, setActiveTab] = useState<TabKey>('links');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [subTypeFilter, setSubTypeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Link modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState<LinkFormState>(emptyLinkForm);
  const [linkImageFile, setLinkImageFile] = useState<File | null>(null);
  const [linkImagePreview, setLinkImagePreview] = useState<string | null>(null);
  const [linkIconFile, setLinkIconFile] = useState<File | null>(null);
  const [linkIconPreview, setLinkIconPreview] = useState<string | null>(null);
  const [previewLink, setPreviewLink] = useState<SocialLink | null>(null);

  // Platform modal
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
  const [platformForm, setPlatformForm] = useState<PlatformFormState>(emptyPlatformForm);
  const [platformImageFile, setPlatformImageFile] = useState<File | null>(null);
  const [platformImagePreview, setPlatformImagePreview] = useState<string | null>(null);
  const [platformIconFile, setPlatformIconFile] = useState<File | null>(null);
  const [platformIconPreview, setPlatformIconPreview] = useState<string | null>(null);

  // Sub type modal
  const [isSubTypeModalOpen, setIsSubTypeModalOpen] = useState(false);
  const [editingSubTypeId, setEditingSubTypeId] = useState<string | null>(null);
  const [subTypeForm, setSubTypeForm] = useState<SubTypeFormState>(emptySubTypeForm);

  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  const authHeaders = { Authorization: token ? `Bearer ${token}` : '' };

  // ─── Fetching ─────────────────────────────────────────────────────────────

  const fetchAll = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [linksRes, platformsRes, subTypesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/social-links`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/platforms?includeSubTypes=true`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/platform-sub-types`, { headers: authHeaders })
      ]);
      const [linksJson, platformsJson, subTypesJson] = await Promise.all([
        linksRes.json(),
        platformsRes.json(),
        subTypesRes.json()
      ]);
      setLinks(extractList(linksJson));
      setPlatforms(extractList(platformsJson));
      setSubTypes(extractList(subTypesJson));
    } catch (err: any) {
      console.error('Failed to load social link data:', err);
      setErrorMessage(err.message || 'Failed to load social link data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // ─── Filtering ────────────────────────────────────────────────────────────

  const filteredLinks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return links.filter(item => {
      if (statusFilter === 'active' && !item.activeState) return false;
      if (statusFilter === 'inactive' && item.activeState) return false;
      if (platformFilter && item.platformId !== platformFilter) return false;
      if (subTypeFilter && item.subTypeId !== subTypeFilter) return false;
      if (q) {
        const haystack = [item.title, item.slug, item.hyperlink, item.description, item.platform?.name, item.subType?.name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [links, searchQuery, statusFilter, platformFilter, subTypeFilter]);

  const filteredPlatforms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return platforms;
    return platforms.filter(p => `${p.name} ${p.slug} ${p.icon || ''}`.toLowerCase().includes(q));
  }, [platforms, searchQuery]);

  const filteredSubTypes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return subTypes.filter(s => {
      if (platformFilter && s.platformId !== platformFilter) return false;
      if (q && !`${s.name} ${s.slug} ${s.platform?.name || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [subTypes, searchQuery, platformFilter]);

  const activeList: any[] =
    activeTab === 'links' ? filteredLinks : activeTab === 'platforms' ? filteredPlatforms : filteredSubTypes;

  const totalPages = Math.ceil(activeList.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activeList.slice(start, start + pageSize);
  }, [activeList, currentPage]);

  // Sub types available for the currently selected platform filter
  const filterSubTypeOptions = useMemo(
    () => (platformFilter ? subTypes.filter(s => s.platformId === platformFilter) : subTypes),
    [subTypes, platformFilter]
  );

  // Sub types available inside the link form
  const formSubTypeOptions = useMemo(
    () => subTypes.filter(s => s.platformId === linkForm.platformId),
    [subTypes, linkForm.platformId]
  );

  // ─── Social Link CRUD ─────────────────────────────────────────────────────

  const openCreateLink = () => {
    setEditingLinkId(null);
    setLinkForm({
      ...emptyLinkForm,
      platformId: platformFilter || platforms[0]?.id || '',
      subTypeId: platformFilter ? subTypeFilter : '',
      order: links.length
    });
    setLinkImageFile(null);
    setLinkImagePreview(null);
    setLinkIconFile(null);
    setLinkIconPreview(null);
    setIsLinkModalOpen(true);
  };

  const openEditLink = (item: SocialLink) => {
    setEditingLinkId(item.id);
    setLinkForm({
      title: item.title || '',
      slug: item.slug || '',
      hyperlink: item.hyperlink || '',
      imageUrl: item.imageUrl || '',
      icon: item.icon || '',
      description: item.description || '',
      activeState: item.activeState,
      order: item.order ?? 0,
      platformId: item.platformId,
      subTypeId: item.subTypeId || ''
    });
    setLinkImageFile(null);
    setLinkImagePreview(item.imageUrl || null);
    setLinkIconFile(null);
    setLinkIconPreview(item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? item.icon : null);
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!linkForm.title.trim() || !linkForm.hyperlink.trim() || !linkForm.platformId) {
      alert('Title, hyperlink and platform are required.');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', linkForm.title.trim());
      formData.append('hyperlink', linkForm.hyperlink.trim());
      formData.append('platformId', linkForm.platformId);
      formData.append('subTypeId', linkForm.subTypeId || '');
      formData.append('description', linkForm.description.trim());
      formData.append('order', String(linkForm.order || 0));
      formData.append('activeState', String(linkForm.activeState));
      if (linkForm.slug.trim()) formData.append('slug', linkForm.slug.trim());

      if (linkImageFile) {
        formData.append('image', linkImageFile);
      } else {
        formData.append('imageUrl', linkForm.imageUrl.trim());
      }

      if (linkIconFile) {
        formData.append('iconFile', linkIconFile);
      } else {
        formData.append('icon', linkForm.icon.trim());
      }

      const url = editingLinkId ? `${API_BASE_URL}/social-links/${editingLinkId}` : `${API_BASE_URL}/social-links`;
      const res = await fetch(url, {
        method: editingLinkId ? 'PUT' : 'POST',
        headers: authHeaders,
        body: formData
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData?.error || 'Failed to save social link');

      setIsLinkModalOpen(false);
      await fetchAll();
    } catch (err: any) {
      console.error('Error saving social link:', err);
      alert(err.message || 'Error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLinkStatus = async (item: SocialLink) => {
    try {
      const res = await fetch(`${API_BASE_URL}/social-links/${item.id}/status`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to toggle status');
      setLinks(prev => prev.map(l => (l.id === item.id ? { ...l, activeState: !l.activeState } : l)));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteLink = async (item: SocialLink) => {
    const ok = await confirm({
      title: 'Delete Social Link',
      message: `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger'
    });
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE_URL}/social-links/${item.id}`, { method: 'DELETE', headers: authHeaders });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to delete social link');
      }
      setLinks(prev => prev.filter(l => l.id !== item.id));
      setPlatforms(prev =>
        prev.map(p =>
          p.id === item.platformId && p._count
            ? { ...p, _count: { ...p._count, socialLinks: Math.max(0, p._count.socialLinks - 1) } }
            : p
        )
      );
    } catch (err: any) {
      alert(err.message || 'Failed to delete social link');
    }
  };

  // ─── Platform CRUD ────────────────────────────────────────────────────────

  const openCreatePlatform = () => {
    setEditingPlatformId(null);
    setPlatformForm(emptyPlatformForm);
    setPlatformImageFile(null);
    setPlatformImagePreview(null);
    setPlatformIconFile(null);
    setPlatformIconPreview(null);
    setIsPlatformModalOpen(true);
  };

  const openEditPlatform = (item: Platform) => {
    setEditingPlatformId(item.id);
    setPlatformForm({
      name: item.name || '',
      slug: item.slug || '',
      icon: item.icon || '',
      imageUrl: item.imageUrl || ''
    });
    setPlatformImageFile(null);
    setPlatformImagePreview(item.imageUrl || null);
    setPlatformIconFile(null);
    setPlatformIconPreview(item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? item.icon : null);
    setIsPlatformModalOpen(true);
  };

  const handleSavePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformForm.name.trim()) {
      alert('Platform name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', platformForm.name.trim());
      if (platformForm.slug.trim()) formData.append('slug', platformForm.slug.trim());
      if (platformImageFile) {
        formData.append('image', platformImageFile);
      } else {
        formData.append('imageUrl', platformForm.imageUrl.trim());
      }

      if (platformIconFile) {
        formData.append('iconFile', platformIconFile);
      } else {
        formData.append('icon', platformForm.icon.trim());
      }

      const url = editingPlatformId ? `${API_BASE_URL}/platforms/${editingPlatformId}` : `${API_BASE_URL}/platforms`;
      const res = await fetch(url, {
        method: editingPlatformId ? 'PUT' : 'POST',
        headers: authHeaders,
        body: formData
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData?.error || 'Failed to save platform');

      setIsPlatformModalOpen(false);
      await fetchAll();
    } catch (err: any) {
      console.error('Error saving platform:', err);
      alert(err.message || 'Error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlatform = async (item: Platform) => {
    const linkCount = item._count?.socialLinks ?? 0;
    const subCount = item._count?.subTypes ?? 0;
    const ok = await confirm({
      title: 'Delete Platform',
      message:
        linkCount || subCount
          ? `Deleting "${item.name}" will also permanently delete its ${subCount} sub type(s) and ${linkCount} social link(s). Continue?`
          : `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger'
    });
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE_URL}/platforms/${item.id}`, { method: 'DELETE', headers: authHeaders });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to delete platform');
      }
      if (platformFilter === item.id) {
        setPlatformFilter('');
        setSubTypeFilter('');
      }
      await fetchAll();
    } catch (err: any) {
      alert(err.message || 'Failed to delete platform');
    }
  };

  // ─── Sub Type CRUD ────────────────────────────────────────────────────────

  const openCreateSubType = () => {
    setEditingSubTypeId(null);
    setSubTypeForm({ ...emptySubTypeForm, platformId: platformFilter || platforms[0]?.id || '' });
    setIsSubTypeModalOpen(true);
  };

  const openEditSubType = (item: PlatformSubType) => {
    setEditingSubTypeId(item.id);
    setSubTypeForm({ name: item.name || '', slug: item.slug || '', platformId: item.platformId });
    setIsSubTypeModalOpen(true);
  };

  const handleSaveSubType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTypeForm.name.trim() || !subTypeForm.platformId) {
      alert('Sub type name and platform are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, string> = {
        name: subTypeForm.name.trim(),
        platformId: subTypeForm.platformId
      };
      if (subTypeForm.slug.trim()) payload.slug = subTypeForm.slug.trim();

      const url = editingSubTypeId
        ? `${API_BASE_URL}/platform-sub-types/${editingSubTypeId}`
        : `${API_BASE_URL}/platform-sub-types`;
      const res = await fetch(url, {
        method: editingSubTypeId ? 'PUT' : 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData?.error || 'Failed to save sub type');

      setIsSubTypeModalOpen(false);
      await fetchAll();
    } catch (err: any) {
      console.error('Error saving sub type:', err);
      alert(err.message || 'Error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubType = async (item: PlatformSubType) => {
    const linkCount = item._count?.socialLinks ?? 0;
    const ok = await confirm({
      title: 'Delete Sub Type',
      message: linkCount
        ? `"${item.name}" is used by ${linkCount} social link(s). They will be kept but detached from this sub type. Continue?`
        : `Are you sure you want to delete "${item.name}"?`,
      confirmText: 'Delete',
      type: 'danger'
    });
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE_URL}/platform-sub-types/${item.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to delete sub type');
      }
      if (subTypeFilter === item.id) setSubTypeFilter('');
      await fetchAll();
    } catch (err: any) {
      alert(err.message || 'Failed to delete sub type');
    }
  };

  // ─── Stats ────────────────────────────────────────────────────────────────

  const activeLinkCount = links.filter(l => l.activeState).length;

  const addButton =
    activeTab === 'links'
      ? { label: 'Add Social Link', onClick: openCreateLink, disabled: platforms.length === 0 }
      : activeTab === 'platforms'
      ? { label: 'Add Platform', onClick: openCreatePlatform, disabled: false }
      : { label: 'Add Sub Type', onClick: openCreateSubType, disabled: platforms.length === 0 };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'links', label: 'Social Links', icon: <LinkIcon size={13} />, count: links.length },
    { key: 'platforms', label: 'Platforms', icon: <Layers size={13} />, count: platforms.length },
    { key: 'subtypes', label: 'Sub Types', icon: <Tag size={13} />, count: subTypes.length }
  ];

  return (
    <div className="space-y-4">
      {/* Top Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Share2 size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">Social Links Management</h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage social media platforms, their sub types (pages, groups, channels) and public social links.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={addButton.onClick}
            disabled={addButton.disabled}
            title={addButton.disabled ? 'Create a platform first' : addButton.label}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
              addButton.disabled
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-sm'
            }`}
          >
            <Plus size={15} />
            <span>{addButton.label}</span>
          </button>
        </div>
      </div>

      {/* No platforms notice */}
      {!isLoading && platforms.length === 0 && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs rounded-lg">
          <AlertCircle size={15} className="shrink-0 text-amber-600" />
          <span>
            <strong>No platforms yet:</strong> Create a platform (e.g. Facebook, YouTube) in the Platforms tab before
            adding sub types or social links.
          </span>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Links</span>
          <span className="text-xl font-bold text-gray-900 mt-0.5 block">{links.length}</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Active Links</span>
          <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{activeLinkCount}</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Platforms</span>
          <span className="text-xl font-bold text-blue-700 mt-0.5 block">{platforms.length}</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider block">Sub Types</span>
          <span className="text-xl font-bold text-violet-700 mt-0.5 block">{subTypes.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200/80 shadow-2xs w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === tab.key ? 'bg-emerald-600 text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 bg-white p-3 rounded-lg border border-gray-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                activeTab === 'links'
                  ? 'Search by title, link, platform...'
                  : activeTab === 'platforms'
                  ? 'Search platforms...'
                  : 'Search sub types...'
              }
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {activeTab !== 'platforms' && (
            <select
              value={platformFilter}
              onChange={e => {
                setPlatformFilter(e.target.value);
                setSubTypeFilter('');
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">All Platforms</option>
              {platforms.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          {activeTab === 'links' && (
            <select
              value={subTypeFilter}
              onChange={e => {
                setSubTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">All Sub Types</option>
              {filterSubTypeOptions.map(s => (
                <option key={s.id} value={s.id}>
                  {platformFilter ? s.name : `${s.platform?.name || ''} · ${s.name}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {activeTab === 'links' && (
          <div className="flex items-center gap-1 overflow-x-auto">
            {(['all', 'active', 'inactive'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md capitalize transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-gray-100/80 hover:bg-gray-200/70 text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Ultra-Compact Admin Data Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <AgroLoader />
            <p className="text-xs text-gray-500 mt-2">Loading social links...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
              {activeTab === 'links' ? <LinkIcon size={22} /> : activeTab === 'platforms' ? <Layers size={22} /> : <Tag size={22} />}
            </div>
            <p className="text-xs font-semibold text-gray-800">
              No {activeTab === 'links' ? 'social links' : activeTab === 'platforms' ? 'platforms' : 'sub types'} found
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {searchQuery || platformFilter || subTypeFilter || statusFilter !== 'all'
                ? 'Try adjusting your search terms or filters.'
                : `Click "${addButton.label}" to create one.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* ── Social Links Table ── */}
            {activeTab === 'links' && (
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr>
                    <th className={`${thCls} w-12 text-center`}>#</th>
                    <th className={`${thCls} w-12`}>Image</th>
                    <th className={thCls}>Title</th>
                    <th className={thCls}>Platform</th>
                    <th className={thCls}>Sub Type</th>
                    <th className={thCls}>Hyperlink</th>
                    <th className={`${thCls} text-center`}>Status</th>
                    <th className={thCls}>Created</th>
                    <th className={`${thCls} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(paginated as SocialLink[]).map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-3 py-1.5 text-center font-mono text-[11px] text-gray-500 whitespace-nowrap">
                        {item.order ?? 0}
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <Thumb
                          src={item.imageUrl || item.platform?.imageUrl}
                          fallback={item.icon || item.platform?.icon || item.platform?.name}
                          onClick={() => setPreviewLink(item)}
                        />
                      </td>
                      <td className="px-3 py-1.5 max-w-[220px]">
                        <div className="font-semibold text-gray-900 truncate text-xs" title={item.title}>
                          {item.title}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono truncate">{item.slug}</div>
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700">
                          {item.platform?.name || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {item.subType ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-violet-50 text-violet-700">
                            {item.subType.name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 max-w-xs">
                        <a
                          href={item.hyperlink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:underline truncate max-w-[220px]"
                          title={item.hyperlink}
                        >
                          <ExternalLink size={11} className="shrink-0" />
                          <span className="truncate">{item.hyperlink}</span>
                        </a>
                      </td>
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleLinkStatus(item)}
                          title="Click to toggle status"
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
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-400 font-mono text-[10px]">
                        {formatDisplayDate(item.createdAt)}
                      </td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewLink(item)}
                            title="Preview"
                            className={`${actionBtnBase} hover:text-emerald-600 hover:bg-emerald-50`}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openEditLink(item)}
                            title="Edit"
                            className={`${actionBtnBase} hover:text-blue-600 hover:bg-blue-50`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(item)}
                            title="Delete"
                            className={`${actionBtnBase} hover:text-rose-600 hover:bg-rose-50`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── Platforms Table ── */}
            {activeTab === 'platforms' && (
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr>
                    <th className={`${thCls} w-12`}>Image</th>
                    <th className={thCls}>Platform</th>
                    <th className={thCls}>Icon</th>
                    <th className={thCls}>Sub Types</th>
                    <th className={`${thCls} text-center`}>Links</th>
                    <th className={thCls}>Created</th>
                    <th className={`${thCls} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(paginated as Platform[]).map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <Thumb src={item.imageUrl} fallback={item.icon || item.name} />
                      </td>
                      <td className="px-3 py-1.5 max-w-[220px]">
                        <div className="font-semibold text-gray-900 truncate text-xs">{item.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono truncate">{item.slug}</div>
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {item.icon ? (
                          item.icon.startsWith('http') || item.icon.startsWith('/') ? (
                            <img src={item.icon} alt="icon" className="w-5 h-5 rounded object-contain border border-gray-200" />
                          ) : (
                            <span className="text-[10px] text-gray-500 font-mono truncate">{item.icon}</span>
                          )
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 max-w-xs">
                        <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap">
                          {(item.subTypes || []).length === 0 ? (
                            <span className="text-[11px] text-gray-400 italic">None</span>
                          ) : (
                            <>
                              {(item.subTypes || []).slice(0, 3).map(s => (
                                <span
                                  key={s.id}
                                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-violet-50 text-violet-700 shrink-0"
                                >
                                  {s.name}
                                </span>
                              ))}
                              {(item.subTypes || []).length > 3 && (
                                <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                                  +{(item.subTypes || []).length - 3}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            setPlatformFilter(item.id);
                            setSubTypeFilter('');
                            switchTab('links');
                          }}
                          title="View links for this platform"
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer transition-colors"
                        >
                          {item._count?.socialLinks ?? 0}
                        </button>
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-400 font-mono text-[10px]">
                        {formatDisplayDate(item.createdAt)}
                      </td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditPlatform(item)}
                            title="Edit"
                            className={`${actionBtnBase} hover:text-blue-600 hover:bg-blue-50`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePlatform(item)}
                            title="Delete"
                            className={`${actionBtnBase} hover:text-rose-600 hover:bg-rose-50`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── Sub Types Table ── */}
            {activeTab === 'subtypes' && (
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr>
                    <th className={thCls}>Sub Type</th>
                    <th className={thCls}>Platform</th>
                    <th className={`${thCls} text-center`}>Links</th>
                    <th className={thCls}>Created</th>
                    <th className={`${thCls} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(paginated as PlatformSubType[]).map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-3 py-1.5 max-w-[260px]">
                        <div className="font-semibold text-gray-900 truncate text-xs">{item.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono truncate">{item.slug}</div>
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Thumb src={item.platform?.imageUrl} fallback={item.platform?.icon || item.platform?.name} />
                          <span className="text-xs font-semibold text-gray-700 truncate">{item.platform?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            setPlatformFilter(item.platformId);
                            setSubTypeFilter(item.id);
                            switchTab('links');
                          }}
                          title="View links for this sub type"
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer transition-colors"
                        >
                          {item._count?.socialLinks ?? 0}
                        </button>
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-400 font-mono text-[10px]">
                        {formatDisplayDate(item.createdAt)}
                      </td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditSubType(item)}
                            title="Edit"
                            className={`${actionBtnBase} hover:text-blue-600 hover:bg-blue-50`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubType(item)}
                            title="Delete"
                            className={`${actionBtnBase} hover:text-rose-600 hover:bg-rose-50`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={page => setCurrentPage(page)}
          totalItems={activeList.length}
          pageSize={pageSize}
        />
      </div>

      {/* ── Social Link Create / Edit Modal ── */}
      {isLinkModalOpen && (
        <ModalShell
          title={editingLinkId ? 'Edit Social Link' : 'Add New Social Link'}
          icon={<LinkIcon size={16} className="text-emerald-600" />}
          onClose={() => setIsLinkModalOpen(false)}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveLink} className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  Platform <span className="text-rose-500">*</span>
                </label>
                <select
                  value={linkForm.platformId}
                  onChange={e => setLinkForm(prev => ({ ...prev, platformId: e.target.value, subTypeId: '' }))}
                  className={`${inputCls} cursor-pointer`}
                  required
                >
                  <option value="" disabled>
                    Select platform
                  </option>
                  {platforms.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Sub Type (Optional)</label>
                <select
                  value={linkForm.subTypeId}
                  onChange={e => setLinkForm(prev => ({ ...prev, subTypeId: e.target.value }))}
                  disabled={!linkForm.platformId || formSubTypeOptions.length === 0}
                  className={`${inputCls} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {linkForm.platformId && formSubTypeOptions.length === 0 ? 'No sub types for this platform' : 'None'}
                  </option>
                  {formSubTypeOptions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={linkForm.title}
                  onChange={e => setLinkForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Aswanna Official Page"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Slug (Optional)</label>
                <input
                  type="text"
                  value={linkForm.slug}
                  onChange={e => setLinkForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Auto-generated from title"
                  className={`${inputCls} font-mono`}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Hyperlink <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={linkForm.hyperlink}
                  onChange={e => setLinkForm(prev => ({ ...prev, hyperlink: e.target.value }))}
                  placeholder="https://facebook.com/aswanna"
                  className={`${inputCls} pl-9`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Description (Optional)</label>
              <textarea
                rows={2}
                value={linkForm.description}
                onChange={e => setLinkForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Short description shown with the link"
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Image / Banner (Optional)</label>
                <ImagePicker
                  previewUrl={linkImagePreview}
                  urlValue={linkForm.imageUrl}
                  hasFile={!!linkImageFile}
                  hint="Square image recommended (e.g. 256 × 256 px)"
                  uploadLabel="Click to upload image"
                  urlPlaceholder="Or enter image URL (https://...)"
                  onFileSelect={file => {
                    setLinkImageFile(file);
                    setLinkImagePreview(URL.createObjectURL(file));
                  }}
                  onUrlChange={url => {
                    setLinkForm(prev => ({ ...prev, imageUrl: url }));
                    setLinkImagePreview(url.trim() || null);
                  }}
                  onRemove={() => {
                    setLinkImageFile(null);
                    setLinkImagePreview(null);
                    setLinkForm(prev => ({ ...prev, imageUrl: '' }));
                  }}
                />
              </div>

              <div>
                <label className={labelCls}>Icon / SVG (Optional)</label>
                <ImagePicker
                  previewUrl={linkIconPreview}
                  urlValue={linkForm.icon}
                  hasFile={!!linkIconFile}
                  hint="Upload icon (SVG, PNG) or enter icon name"
                  uploadLabel="Click to upload icon file"
                  urlPlaceholder="Or enter icon name or URL"
                  onFileSelect={file => {
                    setLinkIconFile(file);
                    setLinkIconPreview(URL.createObjectURL(file));
                  }}
                  onUrlChange={val => {
                    setLinkForm(prev => ({ ...prev, icon: val }));
                    setLinkIconPreview(val && (val.startsWith('http') || val.startsWith('/')) ? val.trim() : null);
                  }}
                  onRemove={() => {
                    setLinkIconFile(null);
                    setLinkIconPreview(null);
                    setLinkForm(prev => ({ ...prev, icon: '' }));
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div>
                <label className={labelCls}>Display Order</label>
                <input
                  type="number"
                  min="0"
                  value={linkForm.order}
                  onChange={e => setLinkForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <label className="inline-flex items-center gap-2 mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkForm.activeState}
                    onChange={e => setLinkForm(prev => ({ ...prev, activeState: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-gray-800">
                    {linkForm.activeState ? 'Active (Visible)' : 'Inactive (Hidden)'}
                  </span>
                </label>
              </div>
            </div>

            <ModalFooter
              onCancel={() => setIsLinkModalOpen(false)}
              isSaving={isSaving}
              label={editingLinkId ? 'Update Link' : 'Save Link'}
            />
          </form>
        </ModalShell>
      )}

      {/* ── Platform Create / Edit Modal ── */}
      {isPlatformModalOpen && (
        <ModalShell
          title={editingPlatformId ? 'Edit Platform' : 'Add New Platform'}
          icon={<Layers size={16} className="text-emerald-600" />}
          onClose={() => setIsPlatformModalOpen(false)}
        >
          <form onSubmit={handleSavePlatform} className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  Platform Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={platformForm.name}
                  onChange={e => setPlatformForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Facebook"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Slug (Optional)</label>
                <input
                  type="text"
                  value={platformForm.slug}
                  onChange={e => setPlatformForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Auto-generated from name"
                  className={`${inputCls} font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Platform Logo (Optional)</label>
                <ImagePicker
                  previewUrl={platformImagePreview}
                  urlValue={platformForm.imageUrl}
                  hasFile={!!platformImageFile}
                  hint="Square logo (e.g. 256 × 256 px)"
                  uploadLabel="Click to upload logo"
                  urlPlaceholder="Or enter logo URL (https://...)"
                  onFileSelect={file => {
                    setPlatformImageFile(file);
                    setPlatformImagePreview(URL.createObjectURL(file));
                  }}
                  onUrlChange={url => {
                    setPlatformForm(prev => ({ ...prev, imageUrl: url }));
                    setPlatformImagePreview(url.trim() || null);
                  }}
                  onRemove={() => {
                    setPlatformImageFile(null);
                    setPlatformImagePreview(null);
                    setPlatformForm(prev => ({ ...prev, imageUrl: '' }));
                  }}
                />
              </div>

              <div>
                <label className={labelCls}>Platform Icon (Optional)</label>
                <ImagePicker
                  previewUrl={platformIconPreview}
                  urlValue={platformForm.icon}
                  hasFile={!!platformIconFile}
                  hint="Upload icon (SVG, PNG) or enter name"
                  uploadLabel="Click to upload icon file"
                  urlPlaceholder="Or enter icon name / URL"
                  onFileSelect={file => {
                    setPlatformIconFile(file);
                    setPlatformIconPreview(URL.createObjectURL(file));
                  }}
                  onUrlChange={val => {
                    setPlatformForm(prev => ({ ...prev, icon: val }));
                    setPlatformIconPreview(val && (val.startsWith('http') || val.startsWith('/')) ? val.trim() : null);
                  }}
                  onRemove={() => {
                    setPlatformIconFile(null);
                    setPlatformIconPreview(null);
                    setPlatformForm(prev => ({ ...prev, icon: '' }));
                  }}
                />
              </div>
            </div>

            <ModalFooter
              onCancel={() => setIsPlatformModalOpen(false)}
              isSaving={isSaving}
              label={editingPlatformId ? 'Update Platform' : 'Save Platform'}
            />
          </form>
        </ModalShell>
      )}

      {/* ── Sub Type Create / Edit Modal ── */}
      {isSubTypeModalOpen && (
        <ModalShell
          title={editingSubTypeId ? 'Edit Sub Type' : 'Add New Sub Type'}
          icon={<Tag size={16} className="text-emerald-600" />}
          onClose={() => setIsSubTypeModalOpen(false)}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveSubType} className="p-5 space-y-4 text-xs">
            <div>
              <label className={labelCls}>
                Platform <span className="text-rose-500">*</span>
              </label>
              <select
                value={subTypeForm.platformId}
                onChange={e => setSubTypeForm(prev => ({ ...prev, platformId: e.target.value }))}
                className={`${inputCls} cursor-pointer`}
                required
              >
                <option value="" disabled>
                  Select platform
                </option>
                {platforms.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {editingSubTypeId && (
                <p className="text-[10px] text-amber-600 mt-0.5">
                  Changing the platform also moves all linked social links to the new platform.
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>
                Sub Type Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subTypeForm.name}
                onChange={e => setSubTypeForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Page, Group, Channel"
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Slug (Optional)</label>
              <input
                type="text"
                value={subTypeForm.slug}
                onChange={e => setSubTypeForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="Auto-generated (platform-name)"
                className={`${inputCls} font-mono`}
              />
            </div>

            <ModalFooter
              onCancel={() => setIsSubTypeModalOpen(false)}
              isSaving={isSaving}
              label={editingSubTypeId ? 'Update Sub Type' : 'Save Sub Type'}
            />
          </form>
        </ModalShell>
      )}

      {/* ── Social Link Preview Modal ── */}
      {previewLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/70">
              <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Eye size={15} className="text-emerald-600" />
                <span>Social Link Preview</span>
              </h3>
              <button
                onClick={() => setPreviewLink(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                {previewLink.imageUrl || previewLink.platform?.imageUrl ? (
                  <img
                    src={previewLink.imageUrl || previewLink.platform?.imageUrl || ''}
                    alt={previewLink.title}
                    className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                    <ImageIcon size={20} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{previewLink.title}</p>
                  <p className="text-[10px] text-gray-400 font-mono truncate">{previewLink.slug}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700">
                      {previewLink.platform?.name}
                    </span>
                    {previewLink.subType && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-violet-50 text-violet-700">
                        {previewLink.subType.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {previewLink.description && (
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-200/70">
                  {previewLink.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-200/70">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Display Order</span>
                  <span className="font-semibold text-gray-800">#{previewLink.order}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Status</span>
                  <span className={`font-semibold ${previewLink.activeState ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {previewLink.activeState ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Icon</span>
                  {previewLink.icon ? (
                    previewLink.icon.startsWith('http') || previewLink.icon.startsWith('/') ? (
                      <img
                        src={previewLink.icon}
                        alt="icon"
                        className="w-5 h-5 rounded object-contain border border-gray-200 mt-0.5"
                      />
                    ) : (
                      <span className="font-semibold text-gray-800 font-mono">{previewLink.icon}</span>
                    )
                  ) : (
                    <span className="font-semibold text-gray-800 font-mono">—</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Created</span>
                  <span className="font-semibold text-gray-800">{formatDisplayDate(previewLink.createdAt)}</span>
                </div>
              </div>

              <a
                href={previewLink.hyperlink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors"
              >
                <ExternalLink size={13} />
                <span>Open Link</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
