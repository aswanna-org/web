import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Landmark,
  Building2,
  Globe2,
  ExternalLink,
  RotateCcw,
  Phone,
  Check,
  Share2,
  ListPlus,
  MapPin,
  Trash,
  Layers,
  Sparkles,
  Upload,
  Image as ImageIcon,
  FileText,
  Download,
  Paperclip
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import type { InstitutionDocument } from '../../data/agriInstitutionsData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RegionalCenter {
  nameSi?: string;
  nameEn?: string;
  locationSi?: string;
  locationEn?: string;
  phone?: string;
}

export interface FormDocument extends InstitutionDocument {
  file?: File;
}

interface Institution {
  id: string;
  slug?: string | null;
  nameSi: string;
  nameEn: string;
  shortName: string;
  type: 'gov' | 'pvt' | 'intl';
  categoryKey: string;
  categorySi: string;
  categoryEn: string;
  website: string;
  hotline?: string | null;
  phone?: string | null;
  email?: string | null;
  addressSi?: string | null;
  addressEn?: string | null;
  workingHoursSi?: string | null;
  workingHoursEn?: string | null;
  descriptionSi?: string | null;
  descriptionEn?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  servicesSi?: string[] | null;
  servicesEn?: string[] | null;
  regionalCenters?: RegionalCenter[] | null;
  documents?: InstitutionDocument[] | null;
  logoUrl?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

const defaultForm = {
  slug: '',
  nameSi: '',
  nameEn: '',
  shortName: '',
  type: 'gov' as 'gov' | 'pvt' | 'intl',
  categoryKey: 'department',
  categorySi: 'රාජ්‍ය දෙපාර්තමේන්තුව',
  categoryEn: 'Department',
  website: '',
  hotline: '',
  phone: '',
  email: '',
  addressSi: '',
  addressEn: '',
  workingHoursSi: 'සතියේ දිනවල පෙ.ව. 8.30 සිට ප.ව. 4.15 දක්වා',
  workingHoursEn: 'Weekdays 8:30 AM to 4:15 PM',
  descriptionSi: '',
  descriptionEn: '',
  facebookUrl: '',
  youtubeUrl: '',
  tiktokUrl: '',
  servicesSi: [] as string[],
  regionalCenters: [] as RegionalCenter[],
  documents: [] as FormDocument[],
  logoUrl: '',
  order: 99,
  isActive: true
};

const CATEGORY_PRESETS: Record<string, { key: string; si: string; en: string }> = {
  // Government presets
  ministry: { key: 'ministry', si: 'රාජ්‍ය අමාත්‍යාංශය', en: 'Ministry' },
  department: { key: 'department', si: 'රාජ්‍ය දෙපාර්තමේන්තුව', en: 'Department' },
  research: { key: 'research', si: 'පර්යේෂණ ආයතනය', en: 'Research Institute' },
  board: { key: 'board', si: 'ව්‍යවස්ථාපිත මණ්ඩලය', en: 'Statutory Board' },
  authority: { key: 'authority', si: 'අධිකාරිය / සංස්ථාව', en: 'Authority / Corporation' },
  // Private presets
  inputs: { key: 'inputs', si: 'කෘෂි තාක්ෂණ සහ යෙදවුම්', en: 'Agri Inputs & Tech' },
  seeds: { key: 'seeds', si: 'බීජ සහ රෝපණ ද්‍රව්‍ය', en: 'Seeds & Planting Materials' },
  fertilizer: { key: 'fertilizer', si: 'පොහොර සහ ශාක පෝෂණය', en: 'Fertilizers & Protection' },
  machinery: { key: 'machinery', si: 'යන්ත්‍රෝපකරණ සහ මෙවලම්', en: 'Agri Machinery & Tools' },
  // International presets
  un: { key: 'un', si: 'එක්සත් ජාතීන්ගේ නියෝජිතායතනය', en: 'UN Agency' },
  funding: { key: 'funding', si: 'ජාත්‍යන්තර මූල්‍ය ආයතනය / සංවර්ධන බැංකුව', en: 'Development & Funding Bank' },
  pvt: { key: 'inputs', si: 'කෘෂි තාක්ෂණ සහ යෙදවුම්', en: 'Agri Inputs & Technology' },
  intl: { key: 'un', si: 'ජාත්‍යන්තර නියෝජිතායතනය', en: 'International Agency' }
};

function formatBytes(bytes: number, decimals = 1): string {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export default function InstitutionManagement() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'basic' | 'contact' | 'services' | 'centers' | 'documents'>('basic');
  const [form, setForm] = useState({ ...defaultForm });
  const [activeTab, setActiveTab] = useState<'all' | 'gov' | 'pvt' | 'intl'>('gov');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Logo file upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogoFlag, setRemoveLogoFlag] = useState<boolean>(false);

  // Helper inputs for dynamic lists
  const [newServiceInput, setNewServiceInput] = useState('');
  const [newCenterInput, setNewCenterInput] = useState<RegionalCenter>({
    nameSi: '',
    nameEn: '',
    locationSi: '',
    locationEn: '',
    phone: ''
  });

  // Document upload state (Document Name + File)
  const [newDocName, setNewDocName] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

  const token = localStorage.getItem('admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const fetchInstitutions = async (page = 1) => {
    setIsLoading(true);
    try {
      const typeQuery = activeTab !== 'all' ? `&type=${activeTab}` : '';
      const catQuery = categoryFilter !== 'all' ? `&categoryKey=${categoryFilter}` : '';
      const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';

      const res = await fetch(
        `${API_BASE_URL}/institutions?page=${page}&limit=12${typeQuery}${catQuery}${searchQuery}`,
        { headers }
      );

      if (res.ok) {
        const data = await res.json();
        setInstitutions(data.data || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setTotalCount(data.meta.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch institutions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions(currentPage);
  }, [currentPage, activeTab, categoryFilter, search]);

  const openCreate = () => {
    const defaultKey =
      activeTab === 'pvt'
        ? 'inputs'
        : activeTab === 'intl'
        ? 'un'
        : 'department';
    const preset = CATEGORY_PRESETS[defaultKey] || {
      key: defaultKey,
      si: 'රාජ්‍ය දෙපාර්තමේන්තුව',
      en: 'Department'
    };

    setForm({
      ...defaultForm,
      type: activeTab === 'all' ? 'gov' : activeTab,
      categoryKey: preset.key,
      categorySi: preset.si,
      categoryEn: preset.en,
      servicesSi: [],
      regionalCenters: [],
      documents: []
    });
    setEditingId(null);
    setModalTab('basic');
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogoFlag(false);
    setNewServiceInput('');
    setNewDocName('');
    setNewDocFile(null);
    setIsModalOpen(true);
  };

  const openEdit = (inst: Institution) => {
    let parsedServices: string[] = [];
    if (Array.isArray((inst as any).services)) {
      parsedServices = (inst as any).services
        .map((s: any) => (typeof s === 'string' ? s : s.serviceSi || s.serviceEn || ''))
        .filter(Boolean);
    } else if (Array.isArray(inst.servicesSi)) {
      parsedServices = inst.servicesSi;
    } else if (typeof inst.servicesSi === 'string') {
      try {
        parsedServices = JSON.parse(inst.servicesSi);
      } catch {
        parsedServices = [];
      }
    }

    let parsedCenters: RegionalCenter[] = [];
    if (Array.isArray(inst.regionalCenters)) {
      parsedCenters = inst.regionalCenters;
    } else if (typeof inst.regionalCenters === 'string') {
      try {
        parsedCenters = JSON.parse(inst.regionalCenters);
      } catch {
        parsedCenters = [];
      }
    }

    let parsedDocs: FormDocument[] = [];
    if (Array.isArray(inst.documents)) {
      parsedDocs = inst.documents;
    } else if (typeof inst.documents === 'string') {
      try {
        parsedDocs = JSON.parse(inst.documents);
      } catch {
        parsedDocs = [];
      }
    }

    setForm({
      slug: inst.slug || '',
      nameSi: inst.nameSi || '',
      nameEn: inst.nameEn || '',
      shortName: inst.shortName || '',
      type: inst.type || 'gov',
      categoryKey: inst.categoryKey || 'department',
      categorySi: inst.categorySi || '',
      categoryEn: inst.categoryEn || '',
      website: inst.website || '',
      hotline: inst.hotline || '',
      phone: inst.phone || '',
      email: inst.email || '',
      addressSi: inst.addressSi || '',
      addressEn: inst.addressEn || '',
      workingHoursSi: inst.workingHoursSi || 'සතියේ දිනවල පෙ.ව. 8.30 සිට ප.ව. 4.15 දක්වා',
      workingHoursEn: inst.workingHoursEn || 'Weekdays 8:30 AM to 4:15 PM',
      descriptionSi: inst.descriptionSi || '',
      descriptionEn: inst.descriptionEn || '',
      facebookUrl: inst.facebookUrl || '',
      youtubeUrl: inst.youtubeUrl || '',
      tiktokUrl: inst.tiktokUrl || '',
      servicesSi: parsedServices,
      regionalCenters: parsedCenters,
      documents: parsedDocs,
      logoUrl: inst.logoUrl || '',
      order: inst.order !== undefined ? inst.order : 99,
      isActive: inst.isActive !== undefined ? inst.isActive : true
    });
    setEditingId(inst.id);
    setModalTab('basic');
    setLogoFile(null);
    setLogoPreview(inst.logoUrl || null);
    setRemoveLogoFlag(false);
    setNewServiceInput('');
    setNewDocName('');
    setNewDocFile(null);
    setIsModalOpen(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setRemoveLogoFlag(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogoFlag(true);
    setForm((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handleCategorySelect = (key: string) => {
    const preset = CATEGORY_PRESETS[key];
    if (preset) {
      setForm((prev) => ({
        ...prev,
        categoryKey: preset.key,
        categorySi: preset.si,
        categoryEn: preset.en
      }));
    }
  };

  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    setForm((prev) => ({
      ...prev,
      servicesSi: [...prev.servicesSi, newServiceInput.trim()]
    }));
    setNewServiceInput('');
  };

  const handleRemoveService = (index: number) => {
    setForm((prev) => ({
      ...prev,
      servicesSi: prev.servicesSi.filter((_, i) => i !== index)
    }));
  };

  const handleAddCenter = () => {
    if (!newCenterInput.nameSi && !newCenterInput.nameEn) {
      alert('Please enter at least the center name.');
      return;
    }
    setForm((prev) => ({
      ...prev,
      regionalCenters: [...prev.regionalCenters, { ...newCenterInput }]
    }));
    setNewCenterInput({
      nameSi: '',
      nameEn: '',
      locationSi: '',
      locationEn: '',
      phone: ''
    });
  };

  const handleRemoveCenter = (index: number) => {
    setForm((prev) => ({
      ...prev,
      regionalCenters: prev.regionalCenters.filter((_, i) => i !== index)
    }));
  };

  const handleAddDocument = () => {
    if (!newDocFile && !newDocName.trim()) {
      alert('Please select a file and specify the document name.');
      return;
    }
    const docName = newDocName.trim() || (newDocFile ? newDocFile.name.replace(/\.[^/.]+$/, '') : 'Document');
    const ext = newDocFile ? newDocFile.name.split('.').pop()?.toLowerCase() || 'pdf' : 'pdf';
    const sizeStr = newDocFile ? formatBytes(newDocFile.size) : '';

    const newDocItem: FormDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: docName,
      fileUrl: newDocFile ? URL.createObjectURL(newDocFile) : '',
      fileSize: sizeStr,
      fileType: ext,
      file: newDocFile || undefined,
      uploadedAt: new Date().toISOString()
    };

    setForm((prev) => ({
      ...prev,
      documents: [...prev.documents, newDocItem]
    }));

    setNewDocName('');
    setNewDocFile(null);
  };

  const handleRemoveDocument = (index: number) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/institutions/${editingId}` : `${API_BASE_URL}/institutions`;

    const finalSlug = form.slug.trim() || slugify(form.nameEn || form.nameSi);

    try {
      const fd = new FormData();
      fd.append('nameSi', form.nameSi);
      fd.append('nameEn', form.nameEn);
      fd.append('slug', finalSlug);
      fd.append('shortName', form.shortName);
      fd.append('type', form.type);
      fd.append('categoryKey', form.categoryKey);
      fd.append('categorySi', form.categorySi);
      fd.append('categoryEn', form.categoryEn);
      fd.append('website', form.website);
      fd.append('hotline', form.hotline || '');
      fd.append('phone', form.phone || '');
      fd.append('email', form.email || '');
      fd.append('addressSi', form.addressSi || '');
      fd.append('addressEn', form.addressEn || '');
      fd.append('workingHoursSi', form.workingHoursSi || '');
      fd.append('workingHoursEn', form.workingHoursEn || '');
      fd.append('descriptionSi', form.descriptionSi || '');
      fd.append('descriptionEn', form.descriptionEn || '');
      fd.append('facebookUrl', form.facebookUrl || '');
      fd.append('youtubeUrl', form.youtubeUrl || '');
      fd.append('tiktokUrl', form.tiktokUrl || '');
      fd.append('servicesSi', JSON.stringify(form.servicesSi));
      fd.append('regionalCenters', JSON.stringify(form.regionalCenters));
      fd.append('order', String(form.order));
      fd.append('isActive', String(form.isActive));

      // Append documents metadata & binary files
      const docsPayload: InstitutionDocument[] = [];
      form.documents.forEach((doc) => {
        if (doc.file) {
          fd.append(`doc_${doc.id}`, doc.file);
          docsPayload.push({
            id: doc.id,
            name: doc.name,
            fileUrl: '',
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            uploadedAt: doc.uploadedAt
          });
        } else {
          docsPayload.push({
            id: doc.id,
            name: doc.name,
            fileUrl: doc.fileUrl || '',
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            uploadedAt: doc.uploadedAt
          });
        }
      });
      fd.append('documents', JSON.stringify(docsPayload));

      if (logoFile) {
        fd.append('logo', logoFile);
      } else if (removeLogoFlag) {
        fd.append('removeLogo', 'true');
      } else if (form.logoUrl) {
        fd.append('logoUrl', form.logoUrl);
      }

      const authHeaders = {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: fd
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchInstitutions(currentPage);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to save institution');
      }
    } catch (err) {
      console.error('Error saving institution:', err);
      alert('Error connecting to backend API');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/institutions/${id}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        fetchInstitutions(currentPage);
      }
    } catch (err) {
      console.error('Failed to delete institution', err);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm('This will reset and reload verified Sri Lankan institutions data with complete slugs and regional centers. Continue?')) {
      return;
    }
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/institutions/seed`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        setSeedMessage('Institutions successfully initialized with verified data!');
        fetchInstitutions(1);
        setTimeout(() => setSeedMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error seeding institutions:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
            <Landmark className="text-green-600 w-7 h-7" />
            <span>Agri Institutions Management</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage Government Ministries, Departments, Statutory Boards, Agribusinesses & International Bodies
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-lg font-medium text-xs transition-colors border border-gray-200 shadow-xs"
            title="Reset and reload default Sri Lankan agricultural institutions data"
          >
            <RotateCcw size={15} className={isSeeding ? 'animate-spin text-green-600' : ''} />
            <span>{isSeeding ? 'Seeding...' : 'Load Verified Defaults'}</span>
          </button>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            <span>Add Institution</span>
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-xs">
          <Check size={18} className="text-green-600 shrink-0" />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* ── Type Selector Tabs ── */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('gov');
            setCategoryFilter('all');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shrink-0 ${
            activeTab === 'gov'
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Landmark size={16} />
          <span>Government Institutions (රාජ්‍ය ආයතන)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('pvt');
            setCategoryFilter('all');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shrink-0 ${
            activeTab === 'pvt'
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building2 size={16} />
          <span>Private Agribusinesses (පුද්ගලික ආයතන)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('intl');
            setCategoryFilter('all');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shrink-0 ${
            activeTab === 'intl'
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Globe2 size={16} />
          <span>International Bodies (ජාත්‍යන්තර ආයතන)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setCategoryFilter('all');
            setCurrentPage(1);
          }}
          className={`px-3 py-2 rounded-lg font-medium text-xs text-gray-500 hover:bg-gray-100 shrink-0 ${
            activeTab === 'all' ? 'bg-gray-200 text-gray-800 font-bold' : ''
          }`}
        >
          Show All
        </button>
      </div>

      {/* ── Search and Category Filters ── */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, acronym, slug, or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 text-sm text-gray-800 bg-gray-50/50 focus:bg-white transition-all"
          />
        </div>

        {activeTab === 'gov' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-green-500/30"
            >
              <option value="all">All Categories</option>
              <option value="ministry">Ministries (අමාත්‍යාංශ)</option>
              <option value="department">Departments (දෙපාර්තමේන්තු)</option>
              <option value="research">Research Institutes (පර්යේෂණ ආයතන)</option>
              <option value="board">Statutory Boards (මණ්ඩල හා සභා)</option>
              <option value="authority">Authorities & Corps (අධිකාරි සහ සංස්ථා)</option>
            </select>
          </div>
        )}

        {activeTab === 'pvt' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-green-500/30"
            >
              <option value="all">All Categories</option>
              <option value="inputs">Inputs & Technology (කෘෂි තාක්ෂණ සහ යෙදවුම්)</option>
              <option value="seeds">Seeds & Materials (බීජ සහ රෝපණ ද්‍රව්‍ය)</option>
              <option value="fertilizer">Fertilizers & Crop Nutrition (පොහොර සහ ශාක පෝෂණය)</option>
              <option value="machinery">Agri Machinery (යන්ත්‍රෝපකරණ)</option>
            </select>
          </div>
        )}

        {activeTab === 'intl' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-green-500/30"
            >
              <option value="all">All Categories</option>
              <option value="un">UN Agencies (එක්සත් ජාතීන්ගේ නියෝජිතායතන)</option>
              <option value="research">Global Research HQ (ගෝලීය පර්යේෂණ මධ්‍යස්ථාන)</option>
              <option value="funding">Development & Funding Banks (මූල්‍ය හා සංවර්ධන ආයතන)</option>
            </select>
          </div>
        )}

        <div className="text-xs font-semibold text-gray-500">
          Total: <span className="text-gray-900 font-bold">{totalCount}</span>
        </div>
      </div>

      {/* ── Institutions Table ── */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : institutions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Landmark className="mx-auto mb-2 text-gray-300" size={40} />
            <p className="text-base font-semibold text-gray-600">No institutions found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or click "Load Verified Defaults"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Logo & Name
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acronym
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Hotline / Contact
                  </th>
                  <th className="text-center px-3 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Logo & Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-bold text-xs text-green-800 shrink-0 shadow-xs overflow-hidden p-1">
                          {inst.logoUrl ? (
                            <img src={inst.logoUrl} alt={inst.shortName || inst.nameEn} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full bg-green-50 rounded-lg flex items-center justify-center text-green-700 font-extrabold text-xs">
                              {inst.shortName || inst.nameEn.substring(0, 3).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-snug">{inst.nameSi}</p>
                          <p className="text-xs text-gray-500">{inst.nameEn}</p>
                          {inst.slug && (
                            <a
                              href={`/agri-info-hub/institutions/${inst.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[11px] text-green-700 hover:text-green-800 hover:underline mt-0.5"
                            >
                              <span>/institutions/{inst.slug}</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Short Name */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md">
                        {inst.shortName || '-'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-100/80">
                        {inst.categorySi || inst.categoryEn}
                      </span>
                    </td>

                    {/* Hotline & Contact */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {inst.hotline && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-md border border-amber-200">
                            <Phone size={10} /> Hotline: {inst.hotline}
                          </div>
                        )}
                        {inst.website && (
                          <div>
                            <a
                              href={inst.website}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 hover:underline"
                            >
                              <span>{inst.website.replace('https://', '').replace('http://', '').replace(/\/$/, '')}</span>
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Order */}
                    <td className="px-3 py-3.5 text-center font-mono text-xs text-gray-500">
                      {inst.order}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(inst)}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(inst.id, inst.nameSi || inst.nameEn)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={12}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* ── Create / Edit Multi-Tab Enlarged Modal (Wide & Tall) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl lg:max-w-6xl h-[94vh] max-h-[94vh] overflow-hidden border border-gray-100 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-emerald-50/20 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-md shadow-green-600/20">
                  <Landmark size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg sm:text-xl">
                    {editingId ? 'Edit Institution Profile' : 'Add New Agricultural Institution'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure official logo, details, public services, contact information, and regional offices
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs Navigation Bar */}
            <div className="flex items-center gap-2 px-6 sm:px-8 pt-3 border-b border-gray-100 bg-gray-50/60 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setModalTab('basic')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-t-2xl text-xs sm:text-sm font-bold transition-all border-b-2 shrink-0 ${
                  modalTab === 'basic'
                    ? 'border-green-600 text-green-700 bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
                }`}
              >
                <Layers size={16} />
                <span>1. General & Logo</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('contact')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-t-2xl text-xs sm:text-sm font-bold transition-all border-b-2 shrink-0 ${
                  modalTab === 'contact'
                    ? 'border-green-600 text-green-700 bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
                }`}
              >
                <Phone size={16} />
                <span>2. Contact & Social Channels</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('services')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-t-2xl text-xs sm:text-sm font-bold transition-all border-b-2 shrink-0 ${
                  modalTab === 'services'
                    ? 'border-green-600 text-green-700 bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
                }`}
              >
                <ListPlus size={16} />
                <span>3. Key Roles & Services ({form.servicesSi.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('centers')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-t-2xl text-xs sm:text-sm font-bold transition-all border-b-2 shrink-0 ${
                  modalTab === 'centers'
                    ? 'border-green-600 text-green-700 bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
                }`}
              >
                <MapPin size={16} />
                <span>4. Regional Office Network ({form.regionalCenters.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('documents')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-t-2xl text-xs sm:text-sm font-bold transition-all border-b-2 shrink-0 ${
                  modalTab === 'documents'
                    ? 'border-green-600 text-green-700 bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
                }`}
              >
                <FileText size={16} />
                <span>5. Documents & Publications ({form.documents.length})</span>
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-sm bg-[#fafbfa]">
              {/* ════ TAB 1: BASIC DETAILS & LOGO UPLOAD ════ */}
              {modalTab === 'basic' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Logo Image Upload Card */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                    <label className="text-xs font-bold text-gray-700 block flex items-center gap-2">
                      <ImageIcon size={15} className="text-green-600" />
                      <span>Institution Official Logo / Emblem (ආයතනයේ නිල ලාංඡනය):</span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Logo Preview */}
                      <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden relative group">
                        {logoPreview ? (
                          <>
                            <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-1.5" />
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold gap-1"
                              title="Remove Logo"
                            >
                              <Trash size={14} /> Remove
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-2 text-gray-400">
                            <Upload size={24} className="mx-auto mb-1 text-gray-300" />
                            <span className="text-[10px] font-semibold">No Logo</span>
                          </div>
                        )}
                      </div>

                      {/* Upload Controls */}
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs">
                            <Upload size={15} />
                            <span>{logoPreview ? 'Change Logo Image' : 'Upload Logo Image'}</span>
                            <input
                              type="file"
                              accept="image/*,.svg,.webp"
                              onChange={handleLogoChange}
                              className="hidden"
                            />
                          </label>

                          {logoPreview && (
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              Remove Logo
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-400 leading-tight">
                          Supported formats: PNG, JPG, JPEG, WEBP, SVG (Square or transparent background recommended)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Directory Type */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">Directory Classification & Sector:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, type: 'gov' });
                          handleCategorySelect('department');
                        }}
                        className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
                          form.type === 'gov'
                            ? 'border-green-500 bg-green-50 text-green-800 shadow-xs ring-2 ring-green-500/20'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Landmark size={16} /> Government (රාජ්‍ය අංශය)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, type: 'pvt' });
                          handleCategorySelect('inputs');
                        }}
                        className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
                          form.type === 'pvt'
                            ? 'border-green-500 bg-green-50 text-green-800 shadow-xs ring-2 ring-green-500/20'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Building2 size={16} /> Private Agribusiness (පුද්ගලික)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, type: 'intl' });
                          handleCategorySelect('un');
                        }}
                        className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
                          form.type === 'intl'
                            ? 'border-green-500 bg-green-50 text-green-800 shadow-xs ring-2 ring-green-500/20'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Globe2 size={16} /> International Body (ජාත්‍යන්තර)
                      </button>
                    </div>
                  </div>

                  {/* Names and Slugs in 2 Columns */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Sinhala Name (නම - සිංහල) *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.nameSi}
                          onChange={(e) => setForm({ ...form, nameSi: e.target.value })}
                          placeholder="උදා: කෘෂිකර්ම දෙපාර්තමේන්තුව"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          English Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.nameEn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((prev) => ({
                              ...prev,
                              nameEn: val,
                              slug: prev.slug ? prev.slug : slugify(val)
                            }));
                          }}
                          placeholder="e.g. Department of Agriculture"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Custom Slug (URL Identifier) *
                        </label>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                          placeholder="e.g. department-of-agriculture"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none font-mono text-xs text-green-700 bg-green-50/20 font-bold"
                        />
                        <span className="text-[11px] text-gray-400 mt-1 block">
                          Preview URL: <span className="text-green-700 font-semibold font-mono">/agri-info-hub/institutions/{form.slug || 'slug-preview'}</span>
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Short Acronym / Code (කෙටි නම)
                        </label>
                        <input
                          type="text"
                          value={form.shortName}
                          onChange={(e) => setForm({ ...form, shortName: e.target.value.toUpperCase() })}
                          placeholder="e.g. DOA, HARTI, CCB, TRI"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Category Preset
                        </label>
                        <select
                          value={form.categoryKey}
                          onChange={(e) => handleCategorySelect(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none bg-white font-medium text-xs sm:text-sm"
                        >
                          {form.type === 'gov' && (
                            <>
                              <option value="ministry">Ministry (රාජ්‍ය අමාත්‍යාංශය)</option>
                              <option value="department">Department (දෙපාර්තමේන්තුව)</option>
                              <option value="research">Research Institute (පර්යේෂණ ආයතනය)</option>
                              <option value="board">Statutory Board (මණ්ඩලය/සභාව)</option>
                              <option value="authority">Authority/Corp (අධිකාරිය/සංස්ථාව)</option>
                            </>
                          )}
                          {form.type === 'pvt' && (
                            <>
                              <option value="inputs">Inputs & Technology (කෘෂි තාක්ෂණ සහ යෙදවුම්)</option>
                              <option value="seeds">Seeds & Planting Materials (බීජ සහ රෝපණ ද්‍රව්‍ය)</option>
                              <option value="fertilizer">Fertilizers & Crop Nutrition (පොහොර සහ ශාක පෝෂණය)</option>
                              <option value="machinery">Agri Machinery & Tools (යන්ත්‍රෝපකරණ සහ මෙවලම්)</option>
                            </>
                          )}
                          {form.type === 'intl' && (
                            <>
                              <option value="un">UN Agency (එක්සත් ජාතීන්ගේ නියෝජිතායතනය)</option>
                              <option value="research">Global Research HQ (ගෝලීය පර්යේෂණ මූලස්ථානය)</option>
                              <option value="funding">Development & Funding Bank (ජාත්‍යන්තර මූල්‍ය / සංවර්ධන බැංකුව)</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Category Label (Sinhala)
                        </label>
                        <input
                          type="text"
                          value={form.categorySi}
                          onChange={(e) => setForm({ ...form, categorySi: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Category Label (English)
                        </label>
                        <input
                          type="text"
                          value={form.categoryEn}
                          onChange={(e) => setForm({ ...form, categoryEn: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description Sinhala */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Brief Description (ආයතනය පිළිබඳ කෙටි හැඳින්වීම - සිංහල)
                    </label>
                    <textarea
                      rows={4}
                      value={form.descriptionSi}
                      onChange={(e) => setForm({ ...form, descriptionSi: e.target.value })}
                      placeholder="ශ්‍රී ලංකාවේ ප්‍රමුඛතම රාජ්‍ය කෘෂිකාර්මික පර්යේෂණ හා ව්‍යාප්ති ආයතනයයි..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none text-xs sm:text-sm leading-relaxed"
                    />
                  </div>

                  {/* Order & Visibility */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-6">
                    <div className="w-40">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Display Sort Order</label>
                      <input
                        type="number"
                        value={form.order}
                        onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none text-sm font-mono font-bold"
                      />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer mt-4 bg-green-50/50 p-3 rounded-xl border border-green-100">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm font-bold text-gray-800">
                        Active & Published on Public Directory
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* ════ TAB 2: CONTACT & SOCIAL LINKS ════ */}
              {modalTab === 'contact' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Official Website & Hotline */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Official Website URL *
                        </label>
                        <input
                          type="url"
                          required
                          value={form.website}
                          onChange={(e) => setForm({ ...form, website: e.target.value })}
                          placeholder="https://www.doa.gov.lk"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Hotline / Toll-free Code (කෙටි අංකය)
                        </label>
                        <input
                          type="text"
                          value={form.hotline}
                          onChange={(e) => setForm({ ...form, hotline: e.target.value })}
                          placeholder="e.g. 1920, 1919"
                          className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 outline-none font-bold text-amber-800 bg-amber-50/30 text-sm"
                        />
                      </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          General Phone Numbers (දුරකථන අංක)
                        </label>
                        <input
                          type="text"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+94 81 238 8331 / +94 81 238 8011"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Official Email (විද්‍යුත් තැපෑල)
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="info@doa.gov.lk"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Physical Address Sinhala & English */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Head Office Address (ලිපිනය - සිංහල)
                        </label>
                        <input
                          type="text"
                          value={form.addressSi}
                          onChange={(e) => setForm({ ...form, addressSi: e.target.value })}
                          placeholder="පේරාදෙණිය, ශ්‍රී ලංකාව (P.O. Box 01)"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Head Office Address (English)
                        </label>
                        <input
                          type="text"
                          value={form.addressEn}
                          onChange={(e) => setForm({ ...form, addressEn: e.target.value })}
                          placeholder="Peradeniya, Sri Lanka (P.O. Box 01)"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Working Hours (රාජකාරි වේලාවන් - සිංහල)
                        </label>
                        <input
                          type="text"
                          value={form.workingHoursSi}
                          onChange={(e) => setForm({ ...form, workingHoursSi: e.target.value })}
                          placeholder="සතියේ දිනවල පෙ.ව. 8.30 සිට ප.ව. 4.15 දක්වා"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Working Hours (English)
                        </label>
                        <input
                          type="text"
                          value={form.workingHoursEn}
                          onChange={(e) => setForm({ ...form, workingHoursEn: e.target.value })}
                          placeholder="Weekdays 8:30 AM to 4:15 PM"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <p className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Share2 size={16} className="text-green-600" />
                      <span>Social Media & Video Channels</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Facebook URL</label>
                        <input
                          type="url"
                          value={form.facebookUrl}
                          onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                          placeholder="https://facebook.com/page"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">YouTube URL</label>
                        <input
                          type="url"
                          value={form.youtubeUrl}
                          onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                          placeholder="https://youtube.com/@channel"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">TikTok URL</label>
                        <input
                          type="url"
                          value={form.tiktokUrl}
                          onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
                          placeholder="https://tiktok.com/@account"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ TAB 3: SERVICES CHECKLIST ════ */}
              {modalTab === 'services' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs sm:text-sm text-emerald-900 flex items-start gap-3 shadow-xs">
                    <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-950">ආයතනයේ ප්‍රධාන කාර්යභාරය හා සේවාවන් ලැයිස්තුව</p>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        These services will be rendered as a bulleted checklist with check icons on the public institution detail page.
                      </p>
                    </div>
                  </div>

                  {/* Add New Service Input */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Add Service Item (Sinhala):</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newServiceInput}
                        onChange={(e) => setNewServiceInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddService();
                          }
                        }}
                        placeholder="උදා: බීජ සහ රෝපණ ද්‍රව්‍ය සහතික කිරීමේ සේවාව..."
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-green-500/30 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddService}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 shadow-sm"
                      >
                        <Plus size={16} /> Add Item
                      </button>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Current Services Checklist ({form.servicesSi.length})
                    </p>

                    <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-2">
                      {form.servicesSi.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                          <ListPlus size={36} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm font-medium">No service items added yet.</p>
                          <p className="text-xs text-gray-400 mt-0.5">Type above and click "Add Item" to add bullet points.</p>
                        </div>
                      ) : (
                        form.servicesSi.map((service, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:shadow-xs transition-all"
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed break-words">{service}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveService(idx)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                              title="Delete Item"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ════ TAB 4: REGIONAL CENTERS NETWORK ════ */}
              {modalTab === 'centers' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-2xl text-xs sm:text-sm text-cyan-900 flex items-start gap-3 shadow-xs">
                    <MapPin className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-cyan-950">ප්‍රාදේශීය කාර්යාල ජාලය සහ ස්ථාන (Regional Research & Extension Network)</p>
                      <p className="text-xs text-cyan-800 mt-0.5">
                        Add district institutes, research centers, or extension stations with location names and direct phone numbers.
                      </p>
                    </div>
                  </div>

                  {/* Add New Center Card Form */}
                  <div className="bg-white p-5 rounded-2xl border border-cyan-100 shadow-xs space-y-4">
                    <p className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Plus size={16} className="text-cyan-700" />
                      <span>Add New Regional Office / Station</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Center Name (Sinhala) *</label>
                        <input
                          type="text"
                          value={newCenterInput.nameSi}
                          onChange={(e) => setNewCenterInput({ ...newCenterInput, nameSi: e.target.value })}
                          placeholder="e.g. ප්‍රධාන පර්යේෂණ මධ්‍යස්ථානය (FCRDI)"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Center Name (English)</label>
                        <input
                          type="text"
                          value={newCenterInput.nameEn}
                          onChange={(e) => setNewCenterInput({ ...newCenterInput, nameEn: e.target.value })}
                          placeholder="e.g. Field Crop Research Institute (FCRDI)"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Location (Sinhala)</label>
                        <input
                          type="text"
                          value={newCenterInput.locationSi}
                          onChange={(e) => setNewCenterInput({ ...newCenterInput, locationSi: e.target.value })}
                          placeholder="e.g. මහඉලුප්පල්ලම"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Location (English)</label>
                        <input
                          type="text"
                          value={newCenterInput.locationEn}
                          onChange={(e) => setNewCenterInput({ ...newCenterInput, locationEn: e.target.value })}
                          placeholder="e.g. Mahailluppallama"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Direct Phone</label>
                        <input
                          type="text"
                          value={newCenterInput.phone}
                          onChange={(e) => setNewCenterInput({ ...newCenterInput, phone: e.target.value })}
                          placeholder="e.g. +94 25 224 9100"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm bg-white font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCenter}
                      className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Plus size={16} /> Add Regional Station
                    </button>
                  </div>

                  {/* Centers List */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Configured Regional Network ({form.regionalCenters.length})
                    </p>

                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                      {form.regionalCenters.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                          <MapPin size={36} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm font-medium">No regional centers added yet.</p>
                          <p className="text-xs text-gray-400 mt-0.5">Add stations using the form above.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {form.regionalCenters.map((center, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:shadow-xs transition-all"
                            >
                              <div className="min-w-0 flex-1 space-y-1">
                                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                  {center.nameSi || center.nameEn}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                  {(center.locationSi || center.locationEn) && (
                                    <span className="flex items-center gap-1 text-green-700 font-medium">
                                      <MapPin size={12} />
                                      <span>{center.locationSi || center.locationEn}</span>
                                    </span>
                                  )}
                                  {center.phone && (
                                    <span className="flex items-center gap-1 font-mono text-gray-600">
                                      <Phone size={11} />
                                      <span>{center.phone}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveCenter(idx)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                title="Delete Station"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ════ TAB 5: OFFICIAL DOCUMENTS & PUBLICATIONS ════ */}
              {modalTab === 'documents' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs sm:text-sm text-red-900 flex items-start gap-3 shadow-xs">
                    <FileText className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-950">නිල ලේඛන සහ ප්‍රකාශන (PDF / Documents Upload)</p>
                      <p className="text-xs text-red-800 mt-0.5">
                        Upload official acts, circulars, application forms, guides, catalogs, and reports. Only document name and file are required.
                      </p>
                    </div>
                  </div>

                  {/* Add New Document Card */}
                  <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs space-y-4">
                    <p className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Plus size={16} className="text-red-600" />
                      <span>Attach New PDF / Document (ලේඛනයක් එකතු කිරීම)</span>
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Document Title / Name (ලේඛනයේ නම / මාතෘකාව) *
                        </label>
                        <input
                          type="text"
                          value={newDocName}
                          onChange={(e) => setNewDocName(e.target.value)}
                          placeholder="උදා: කෘෂිකාර්මික තාක්ෂණික උපදේශන සංග්‍රහය 2026 (PDF)"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-red-500/30 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Select Document File (PDF, DOCX, XLSX, etc.) *
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs">
                            <Upload size={15} />
                            <span>{newDocFile ? 'Choose Different File' : 'Browse File...'}</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const f = e.target.files[0];
                                  setNewDocFile(f);
                                  if (!newDocName.trim()) {
                                    setNewDocName(f.name.replace(/\.[^/.]+$/, ''));
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          {newDocFile && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 truncate max-w-full sm:max-w-md">
                              <Paperclip size={14} className="text-red-500 shrink-0" />
                              <span className="truncate">{newDocFile.name}</span>
                              <span className="text-gray-400 shrink-0">({formatBytes(newDocFile.size)})</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddDocument}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Plus size={16} /> Add Document to List
                      </button>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Attached Documents ({form.documents.length})
                    </p>

                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                      {form.documents.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                          <FileText size={36} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm font-medium">No documents attached yet.</p>
                          <p className="text-xs text-gray-400 mt-0.5">Attach documents using the form above.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {form.documents.map((doc, idx) => {
                            const fileTypeUpper = (doc.fileType || 'PDF').toUpperCase();
                            return (
                              <div
                                key={doc.id || idx}
                                className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:shadow-xs transition-all"
                              >
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                                    <FileText size={18} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                      {doc.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-700">
                                        {fileTypeUpper}
                                      </span>
                                      {doc.fileSize && (
                                        <span className="text-xs text-gray-400 font-mono">
                                          {doc.fileSize}
                                        </span>
                                      )}
                                      {doc.file && (
                                        <span className="text-xs text-amber-600 font-semibold">
                                          (Pending Upload)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {doc.fileUrl && !doc.file && (
                                    <a
                                      href={doc.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="View / Download"
                                    >
                                      <Download size={16} />
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDocument(idx)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Document"
                                  >
                                    <Trash size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Sticky Footer */}
              <div className="flex items-center justify-between pt-5 border-t border-gray-200 sticky bottom-0 bg-[#fafbfa]">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                  <span>
                    Step{' '}
                    {modalTab === 'basic'
                      ? '1'
                      : modalTab === 'contact'
                      ? '2'
                      : modalTab === 'services'
                      ? '3'
                      : modalTab === 'centers'
                      ? '4'
                      : '5'}{' '}
                    of 5
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-200/80 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-7 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSaving && <RotateCcw size={15} className="animate-spin" />}
                    <span>{editingId ? (isSaving ? 'Saving...' : 'Save Changes') : (isSaving ? 'Creating...' : 'Create Institution')}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
