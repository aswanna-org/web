import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, Paper, IconButton, Typography, CircularProgress,
  Chip, FormControlLabel, Tooltip, Tabs, Tab, Checkbox, Select, MenuItem,
  FormControl, InputLabel, Avatar,  Alert, List, ListItemButton,
  ListItemIcon, ListItemText
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Business as BuildingIcon, Phone as PhoneIcon, Close as CloseIcon,
  CloudUpload as UploadIcon, AccountBalance as LandmarkIcon,
  Public as PublicIcon, Language as GlobeIcon, InsertDriveFile as FileIcon,
  Restore as RestoreIcon, Launch as LaunchIcon,
  Category as CategoryIcon, Map as MapIcon,
} from '@mui/icons-material';
import Pagination from '../../components/admin/Pagination';
import CountryMultiSelect from '../components/CountryMultiSelect';
import type { InstitutionDocument, RegionalCenter } from '../../data/agriInstitutionsData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface FormDocument {
  id?: string;
  tempId?: string;
  name?: string;
  title?: string;
  titleSi?: string;
  titleEn?: string;
  nameSi?: string;
  nameEn?: string;
  fileUrl?: string;
  url?: string;
  fileSize?: string | null;
  fileType?: string | null;
  category?: string | null;
  categorySi?: string;
  categoryEn?: string;
  year?: string | null;
  uploadedAt?: string | null;
  createdAt?: string | null;
  file?: File;
}

export interface ServiceItem {
  serviceSi: string;
  serviceEn?: string;
}

export interface FormRegionalCenter {
  nameSi?: string;
  nameEn?: string;
  locationSi?: string;
  locationEn?: string;
  phone?: string;
}

export type SectorType = 'gov' | 'pvt' | 'intl';

interface BaseInstitution {
  id: string;
  slug: string;
  sector: string;
  nameSi?: string | null;
  nameEn?: string | null;
  badgeText?: string | null;
  badgeTextSi?: string | null;
  badgeTextEn?: string | null;
  iconClass?: string | null;
  colorTheme?: string | null;
  phone?: string | null;
  shortCode?: string | null;
  email?: string | null;
  descriptionSi?: string | null;
  descriptionEn?: string | null;
  fullDescriptionSi?: string | null;
  fullDescriptionEn?: string | null;
  website?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  linkedinUrl?: string | null;
  logoUrl?: string | null;
  order: number;
  isActive: boolean;
  createdAt?: string;

  // Gov specific
  institutionType?: string | null;
  institutionTypeSi?: string | null;
  institutionTypeEn?: string | null;
  ministry?: string | null;
  ministrySi?: string | null;
  ministryEn?: string | null;
  address?: string | null;
  addressSi?: string | null;
  addressEn?: string | null;

  // Pvt specific
  legalEntityType?: string | null;
  legalEntityTypeSi?: string | null;
  legalEntityTypeEn?: string | null;
  parentConglomerate?: string | null;
  parentConglomerateSi?: string | null;
  parentConglomerateEn?: string | null;
  headquartersAddress?: string | null;
  headquartersAddressSi?: string | null;
  headquartersAddressEn?: string | null;

  // Intl specific
  agencyCategory?: string | null;
  agencyCategorySi?: string | null;
  agencyCategoryEn?: string | null;
  globalHQ?: string | null;
  globalHQSi?: string | null;
  globalHQEn?: string | null;
  operatingCountries?: string | null;
  operatingCountriesSi?: string | null;
  operatingCountriesEn?: string | null;
  thematicScope?: string | null;
  thematicScopeSi?: string | null;
  thematicScopeEn?: string | null;
  hasSriLankaOffice?: boolean;
  slOfficeLocation?: string | null;
  slOfficeLocationSi?: string | null;
  slOfficeLocationEn?: string | null;
  slOfficeAddress?: string | null;
  slOfficeAddressSi?: string | null;
  slOfficeAddressEn?: string | null;
  slMissionAddress?: string | null;
  slMissionAddressSi?: string | null;
  slMissionAddressEn?: string | null;

  // Relations
  services?: any[];
  productsAndServices?: any[];
  interventions?: any[];
  regionalCenters?: RegionalCenter[];
  dealersAndShowrooms?: RegionalCenter[];
  projectStations?: RegionalCenter[];
  documents?: InstitutionDocument[];
  catalogues?: InstitutionDocument[];
  reportsAndBriefs?: InstitutionDocument[];
}

export const GOV_INSTITUTION_TYPES = [
  { si: 'අමාත්‍යාංශ', en: 'Ministries' },
  { si: 'දෙපාර්තමේන්තු', en: 'Departments' },
  { si: 'සංස්ථා', en: 'Corporations' },
  { si: 'මණ්ඩල', en: 'Boards' },
  { si: 'අධිකාරි', en: 'Authorities' },
  { si: 'ආයතන', en: 'Institutes / Institutions' },
  { si: 'කොමිෂන් සභා', en: 'Commissions' },
  { si: 'රජය සතු සමාගම්', en: 'State-Owned Enterprises / Companies' },
];

export const INTL_AGENCY_CATEGORIES = [
  { si: 'UN සහ අන්තර් රාජ්‍ය ආයතන', en: 'UN & Intergovernmental Organizations' },
  { si: 'ජාත්‍යන්තර පර්යේෂණ ආයතන', en: 'International Research Institutes' },
  { si: 'බහුජාතික මව් සමාගම්', en: 'Multinational Parent Companies' },
  { si: 'කෘෂි වෙළඳ සමාගම්', en: 'Agricultural Trading Companies' },
  { si: 'යන්ත්‍රෝපකරණ සමාගම්', en: 'Agricultural Machinery Companies' },
  { si: 'කෘෂි තාක්ෂණික සමාගම්', en: 'Agri-Tech Companies' },
  { si: 'බීජ හා රසායනික සමාගම්', en: 'Seed & Agro-Chemical Companies' },
  { si: 'මූල්‍ය හා සංවර්ධන ආයතන', en: 'Financial & Development Institutions' },
  { si: 'ප්‍රමිතිකරණ හා නියාමන ආයතන', en: 'Standards & Regulatory Bodies' },
  { si: 'රාජ්‍ය නොවන සංවිධාන', en: 'Non-Governmental Organizations (NGOs / INGOs)' },
];

const defaultFormData = {
  sector: 'gov' as SectorType,
  slug: '',
  nameSi: '',
  nameEn: '',
  badgeText: '',
  badgeTextSi: '',
  badgeTextEn: '',
  iconClass: 'fa-landmark',
  colorTheme: 'emerald',
  phone: '',
  shortCode: '',
  email: '',
  descriptionSi: '',
  descriptionEn: '',
  fullDescriptionSi: '',
  fullDescriptionEn: '',
  website: '',
  facebookUrl: '',
  youtubeUrl: '',
  tiktokUrl: '',
  linkedinUrl: '',
  logoUrl: '',
  order: 99,
  isActive: true,

  // Gov
  institutionType: 'දෙපාර්තමේන්තු',
  institutionTypeSi: 'දෙපාර්තමේන්තු',
  institutionTypeEn: 'Departments',
  ministry: 'කෘෂිකර්ම, පශු සම්පත්, ඉඩම් සහ වාරිමාර්ග අමාත්‍යාංශය',
  ministrySi: 'කෘෂිකර්ම, පශු සම්පත්, ඉඩම් සහ වාරිමාර්ග අමාත්‍යාංශය',
  ministryEn: 'Ministry of Agriculture, Livestock, Land and Irrigation',
  address: '',
  addressSi: '',
  addressEn: '',

  // Pvt
  legalEntityType: 'සීමාසහිත පුද්ගලික සමාගම (Pvt Ltd)',
  legalEntityTypeSi: 'සීමාසහිත පුද්ගලික සමාගම (Pvt Ltd)',
  legalEntityTypeEn: 'Private Limited Company (Pvt Ltd)',
  parentConglomerate: '',
  parentConglomerateSi: '',
  parentConglomerateEn: '',
  headquartersAddress: '',
  headquartersAddressSi: '',
  headquartersAddressEn: '',

  // Intl
  agencyCategory: 'UN සහ අන්තර් රාජ්‍ය ආයතන',
  agencyCategorySi: 'UN සහ අන්තර් රාජ්‍ය ආයතන',
  agencyCategoryEn: 'UN & Intergovernmental Organizations',
  globalHQ: 'රෝමය, ඉතාලිය',
  globalHQSi: 'රෝමය, ඉතාලිය',
  globalHQEn: 'Rome, Italy',
  operatingCountries: 'ලොව පුරා රටවල් 195 කට අධික සංඛ්‍යාවක',
  operatingCountriesSi: 'ලොව පුරා රටවල් 195 කට අධික සංඛ්‍යාවක',
  operatingCountriesEn: 'In over 195 countries worldwide',
  thematicScope: 'ගෝලීය ආහාර සුරක්ෂිතතාව, කෘෂි ප්‍රතිපත්ති සහ පෝෂණය',
  thematicScopeSi: 'ගෝලීය ආහාර සුරක්ෂිතතාව, කෘෂි ප්‍රතිපත්ති සහ පෝෂණය',
  thematicScopeEn: 'Global Food Security, Agricultural Policy and Nutrition',
  hasSriLankaOffice: true,
  slOfficeLocation: 'කොළඹ 07',
  slOfficeLocationSi: 'කොළඹ 07',
  slOfficeLocationEn: 'Colombo 07',
  slOfficeAddress: '',
  slOfficeAddressSi: '',
  slOfficeAddressEn: '',
  slMissionAddress: '',
  slMissionAddressSi: '',
  slMissionAddressEn: '',

  // Lists
  services: [] as ServiceItem[],
  regionalCenters: [] as FormRegionalCenter[],
  documents: [] as FormDocument[]
};

export const generateSlug = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const normalizeSector = (sec?: string | null, fallback: SectorType = 'gov'): SectorType => {
  if (!sec) return fallback;
  const lower = sec.toLowerCase();
  if (lower.includes('gov')) return 'gov';
  if (lower.includes('pvt') || lower.includes('priv')) return 'pvt';
  if (lower.includes('intl') || lower.includes('internat')) return 'intl';
  return fallback;
};

const DRAFT_STORAGE_PREFIX = 'aswanna_inst_draft_';
const DRAFT_EXPIRY_DAYS = 7;
const DRAFT_EXPIRY_MS = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

interface SavedDraft {
  savedAt: number;
  form: typeof defaultFormData;
}

const getDraftKey = (sector: SectorType) => `${DRAFT_STORAGE_PREFIX}${sector}`;

const loadDraft = (sector: SectorType): SavedDraft | null => {
  try {
    const raw = localStorage.getItem(getDraftKey(sector));
    if (!raw) return null;
    const parsed: SavedDraft = JSON.parse(raw);
    if (!parsed || !parsed.savedAt || !parsed.form) return null;
    if (Date.now() - parsed.savedAt > DRAFT_EXPIRY_MS) {
      localStorage.removeItem(getDraftKey(sector));
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
};

const saveDraft = (sector: SectorType, formData: typeof defaultFormData) => {
  try {
    const sanitizedDocs = (formData.documents || []).map(({ file, ...rest }) => rest);
    const draftPayload: SavedDraft = {
      savedAt: Date.now(),
      form: {
        ...formData,
        documents: sanitizedDocs
      }
    };
    localStorage.setItem(getDraftKey(sector), JSON.stringify(draftPayload));
  } catch (e) {
    console.error('Failed to save draft:', e);
  }
};

const clearDraft = (sector: SectorType) => {
  try {
    localStorage.removeItem(getDraftKey(sector));
  } catch (e) {
    console.error('Failed to clear draft:', e);
  }
};

export default function InstitutionManagement() {
  const [activeTab, setActiveTab] = useState<SectorType>('gov');
  const [institutions, setInstitutions] = useState<BaseInstitution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ ...defaultFormData });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 15;

  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [restoredDraftTime, setRestoredDraftTime] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Logo file upload state
  const [_logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // New item inputs
  const [newService, setNewService] = useState<ServiceItem>({ serviceSi: '', serviceEn: '' });
  const [newCenter, setNewCenter] = useState<FormRegionalCenter>({ nameSi: '', nameEn: '', locationSi: '', locationEn: '', phone: '' });
  const [newDoc, setNewDoc] = useState<FormDocument>({ title: '', titleSi: '', titleEn: '', url: '', category: 'General', file: undefined });

  const handleUploadDocFile = async (file: File) => {
    setIsUploadingDoc(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE_URL}/upload/document`, {
        method: 'POST',
        headers,
        body: fd
      });
      if (res.ok) {
        const data = await res.json();
        const docTitle = newDoc.titleSi || newDoc.title || newDoc.titleEn || data.originalName || file.name;
        const uploadedDoc: FormDocument = {
          title: docTitle,
          titleSi: docTitle,
          titleEn: docTitle,
          url: data.url,
          category: 'General'
        };
        setForm(prev => ({
          ...prev,
          documents: [...prev.documents, uploadedDoc]
        }));
        setNewDoc({ title: '', titleSi: '', titleEn: '', url: '', category: 'General' });
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to upload document file: ${errData.error || res.statusText || 'Upload error'}`);
      }
    } catch (err) {
      console.error('Error uploading document file:', err);
      alert('Error uploading document file.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Auto-save draft
  useEffect(() => {
    if (isModalOpen && !editingId) {
      saveDraft(form.sector, form);
    }
  }, [form, isModalOpen, editingId]);

  useEffect(() => {
    fetchInstitutions();
  }, [activeTab, currentPage, searchQuery]);

  const fetchInstitutions = async () => {
    setIsLoading(true);
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const url = `${API_BASE_URL}/institutions/${activeTab}?page=${currentPage}&limit=${PAGE_SIZE}${searchParam}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const items = data.data || data;
        setInstitutions(Array.isArray(items) ? items : []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || items.length || 0);
      } else {
        setInstitutions([]);
      }
    } catch (err) {
      console.error('Error fetching institutions:', err);
      setInstitutions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (sector: SectorType) => {
    setActiveTab(sector);
    setCurrentPage(1);
  };

  const openCreate = () => {
    setEditingId(null);
    setValidationError(null);
    setLogoFile(null);
    setActiveSection(1);

    const draft = loadDraft(activeTab);
    if (draft) {
      setForm(draft.form);
      setRestoredDraftTime(draft.savedAt);
    } else {
      setForm({ ...defaultFormData, sector: activeTab });
      setRestoredDraftTime(null);
    }
    setIsModalOpen(true);
  };

  const openEdit = (inst: BaseInstitution) => {
    setEditingId(inst.id);
    setValidationError(null);
    setRestoredDraftTime(null);
    setLogoFile(null);
    setActiveSection(1);

    const parseList = (data: any) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (typeof data === 'string') {
        try { return JSON.parse(data); } catch (e) { return []; }
      }
      return [];
    };

    const parsedServices = parseList(inst.services || inst.productsAndServices || inst.interventions);
    const parsedCenters = parseList(inst.regionalCenters || inst.dealersAndShowrooms || inst.projectStations);
    const parsedDocs = parseList(inst.documents || inst.catalogues || inst.reportsAndBriefs);

    setForm({
      sector: normalizeSector(inst.sector, activeTab),
      slug: inst.slug || '',
      nameSi: inst.nameSi || '',
      nameEn: inst.nameEn || '',
      badgeText: inst.badgeText || '',
      badgeTextSi: inst.badgeTextSi || '',
      badgeTextEn: inst.badgeTextEn || '',
      iconClass: inst.iconClass || 'fa-landmark',
      colorTheme: inst.colorTheme || 'emerald',
      phone: inst.phone || '',
      shortCode: inst.shortCode || '',
      email: inst.email || '',
      descriptionSi: inst.descriptionSi || '',
      descriptionEn: inst.descriptionEn || '',
      fullDescriptionSi: inst.fullDescriptionSi || '',
      fullDescriptionEn: inst.fullDescriptionEn || '',
      website: inst.website || '',
      facebookUrl: inst.facebookUrl || '',
      youtubeUrl: inst.youtubeUrl || '',
      tiktokUrl: inst.tiktokUrl || '',
      linkedinUrl: inst.linkedinUrl || '',
      logoUrl: inst.logoUrl || '',
      order: inst.order ?? 99,
      isActive: inst.isActive ?? true,

      institutionType: inst.institutionType || inst.institutionTypeSi || 'දෙපාර්තමේන්තු',
      institutionTypeSi: inst.institutionTypeSi || inst.institutionType || 'දෙපාර්තමේන්තු',
      institutionTypeEn: inst.institutionTypeEn || (GOV_INSTITUTION_TYPES.find((t) => t.si === (inst.institutionTypeSi || inst.institutionType))?.en || ''),
      ministry: inst.ministry || inst.ministrySi || '',
      ministrySi: inst.ministrySi || inst.ministry || '',
      ministryEn: inst.ministryEn || '',
      address: inst.address || inst.addressSi || '',
      addressSi: inst.addressSi || inst.address || '',
      addressEn: inst.addressEn || '',

      legalEntityType: inst.legalEntityType || inst.legalEntityTypeSi || '',
      legalEntityTypeSi: inst.legalEntityTypeSi || inst.legalEntityType || '',
      legalEntityTypeEn: inst.legalEntityTypeEn || '',
      parentConglomerate: inst.parentConglomerate || inst.parentConglomerateSi || '',
      parentConglomerateSi: inst.parentConglomerateSi || inst.parentConglomerate || '',
      parentConglomerateEn: inst.parentConglomerateEn || '',
      headquartersAddress: inst.headquartersAddress || inst.headquartersAddressSi || '',
      headquartersAddressSi: inst.headquartersAddressSi || inst.headquartersAddress || '',
      headquartersAddressEn: inst.headquartersAddressEn || '',

      agencyCategory: inst.agencyCategory || inst.agencyCategorySi || '',
      agencyCategorySi: inst.agencyCategorySi || inst.agencyCategory || '',
      agencyCategoryEn: inst.agencyCategoryEn || '',
      globalHQ: inst.globalHQ || inst.globalHQSi || '',
      globalHQSi: inst.globalHQSi || inst.globalHQ || '',
      globalHQEn: inst.globalHQEn || '',
      operatingCountries: inst.operatingCountries || inst.operatingCountriesSi || '',
      operatingCountriesSi: inst.operatingCountriesSi || inst.operatingCountries || '',
      operatingCountriesEn: inst.operatingCountriesEn || '',
      thematicScope: inst.thematicScope || inst.thematicScopeSi || '',
      thematicScopeSi: inst.thematicScopeSi || inst.thematicScope || '',
      thematicScopeEn: inst.thematicScopeEn || '',
      hasSriLankaOffice: inst.hasSriLankaOffice ?? true,
      slOfficeLocation: inst.slOfficeLocation || inst.slOfficeLocationSi || '',
      slOfficeLocationSi: inst.slOfficeLocationSi || inst.slOfficeLocation || '',
      slOfficeLocationEn: inst.slOfficeLocationEn || '',
      slOfficeAddress: inst.slOfficeAddress || inst.slOfficeAddressSi || '',
      slOfficeAddressSi: inst.slOfficeAddressSi || inst.slOfficeAddress || '',
      slOfficeAddressEn: inst.slOfficeAddressEn || '',
      slMissionAddress: inst.slMissionAddress || inst.slMissionAddressSi || '',
      slMissionAddressSi: inst.slMissionAddressSi || inst.slMissionAddress || '',
      slMissionAddressEn: inst.slMissionAddressEn || '',

      services: parsedServices.map((s: any) => typeof s === 'string' ? { serviceSi: s, serviceEn: s } : s),
      regionalCenters: parsedCenters,
      documents: parsedDocs
    });

    setIsModalOpen(true);
  };

  const handleUploadLogo = async (file: File) => {
    setIsUploadingLogo(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers,
        body: fd
      });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, logoUrl: data.url }));
      } else {
        alert('Failed to upload logo image.');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setValidationError(null);

    try {
      const effectiveNameEn = form.nameEn || form.nameSi;
      const effectiveNameSi = form.nameSi || form.nameEn;

      const finalSlug = form.slug
        ? generateSlug(form.slug)
        : generateSlug(effectiveNameEn || effectiveNameSi || `institution-${Date.now().toString().slice(-4)}`);

      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const targetSector = normalizeSector(form.sector, activeTab);

      const formData = new FormData();
      formData.append('sector', targetSector);
      formData.append('slug', finalSlug);
      formData.append('nameSi', form.nameSi || '');
      formData.append('nameEn', form.nameEn || '');
      formData.append('badgeText', form.badgeText || form.badgeTextSi || form.badgeTextEn || '');
      formData.append('badgeTextSi', form.badgeTextSi || form.badgeText || '');
      formData.append('badgeTextEn', form.badgeTextEn || '');
      formData.append('iconClass', form.iconClass || 'fa-landmark');
      formData.append('colorTheme', form.colorTheme || 'emerald');
      formData.append('phone', form.phone || '');
      formData.append('shortCode', form.shortCode || '');
      formData.append('email', form.email || '');
      formData.append('descriptionSi', form.descriptionSi || '');
      formData.append('descriptionEn', form.descriptionEn || '');
      formData.append('fullDescriptionSi', form.fullDescriptionSi || '');
      formData.append('fullDescriptionEn', form.fullDescriptionEn || '');
      formData.append('website', form.website || '');
      formData.append('facebookUrl', form.facebookUrl || '');
      formData.append('youtubeUrl', form.youtubeUrl || '');
      formData.append('tiktokUrl', form.tiktokUrl || '');
      formData.append('linkedinUrl', form.linkedinUrl || '');
      formData.append('logoUrl', form.logoUrl || '');
      formData.append('order', String(form.order ?? 99));
      formData.append('isActive', String(form.isActive));

      if (targetSector === 'gov') {
        formData.append('institutionType', form.institutionType || form.institutionTypeSi || form.institutionTypeEn || '');
        formData.append('institutionTypeSi', form.institutionTypeSi || form.institutionType || '');
        formData.append('institutionTypeEn', form.institutionTypeEn || '');
        formData.append('ministry', form.ministry || form.ministrySi || form.ministryEn || '');
        formData.append('ministrySi', form.ministrySi || form.ministry || '');
        formData.append('ministryEn', form.ministryEn || '');
        formData.append('address', form.address || form.addressSi || form.addressEn || '');
        formData.append('addressSi', form.addressSi || form.address || '');
        formData.append('addressEn', form.addressEn || '');
      } else if (targetSector === 'pvt') {
        formData.append('legalEntityType', form.legalEntityType || form.legalEntityTypeSi || form.legalEntityTypeEn || '');
        formData.append('legalEntityTypeSi', form.legalEntityTypeSi || form.legalEntityType || '');
        formData.append('legalEntityTypeEn', form.legalEntityTypeEn || '');
        formData.append('parentConglomerate', form.parentConglomerate || form.parentConglomerateSi || form.parentConglomerateEn || '');
        formData.append('parentConglomerateSi', form.parentConglomerateSi || form.parentConglomerate || '');
        formData.append('parentConglomerateEn', form.parentConglomerateEn || '');
        formData.append('headquartersAddress', form.headquartersAddress || form.headquartersAddressSi || form.headquartersAddressEn || '');
        formData.append('headquartersAddressSi', form.headquartersAddressSi || form.headquartersAddress || '');
        formData.append('headquartersAddressEn', form.headquartersAddressEn || '');
      } else if (targetSector === 'intl') {
        formData.append('agencyCategory', form.agencyCategory || form.agencyCategorySi || form.agencyCategoryEn || '');
        formData.append('agencyCategorySi', form.agencyCategorySi || form.agencyCategory || '');
        formData.append('agencyCategoryEn', form.agencyCategoryEn || '');
        formData.append('globalHQ', form.globalHQ || form.globalHQSi || form.globalHQEn || '');
        formData.append('globalHQSi', form.globalHQSi || form.globalHQ || '');
        formData.append('globalHQEn', form.globalHQEn || '');
        formData.append('operatingCountries', form.operatingCountries || form.operatingCountriesSi || form.operatingCountriesEn || '');
        formData.append('operatingCountriesSi', form.operatingCountriesSi || form.operatingCountries || '');
        formData.append('operatingCountriesEn', form.operatingCountriesEn || '');
        formData.append('thematicScope', form.thematicScope || form.thematicScopeSi || form.thematicScopeEn || '');
        formData.append('thematicScopeSi', form.thematicScopeSi || form.thematicScope || '');
        formData.append('thematicScopeEn', form.thematicScopeEn || '');
        formData.append('hasSriLankaOffice', String(form.hasSriLankaOffice));
        formData.append('slOfficeLocation', form.slOfficeLocation || form.slOfficeLocationSi || form.slOfficeLocationEn || '');
        formData.append('slOfficeLocationSi', form.slOfficeLocationSi || form.slOfficeLocation || '');
        formData.append('slOfficeLocationEn', form.slOfficeLocationEn || '');
        formData.append('slOfficeAddress', form.slOfficeAddress || form.slOfficeAddressSi || form.slOfficeAddressEn || '');
        formData.append('slOfficeAddressSi', form.slOfficeAddressSi || form.slOfficeAddress || '');
        formData.append('slOfficeAddressEn', form.slOfficeAddressEn || '');
        formData.append('slMissionAddress', form.slMissionAddress || form.slMissionAddressSi || form.slMissionAddressEn || '');
        formData.append('slMissionAddressSi', form.slMissionAddressSi || form.slMissionAddress || '');
        formData.append('slMissionAddressEn', form.slMissionAddressEn || '');
      }

      if (form.services && form.services.length > 0) {
        formData.append('services', JSON.stringify(form.services));
        formData.append('productsAndServices', JSON.stringify(form.services));
        formData.append('interventions', JSON.stringify(form.services));
      }
      if (form.regionalCenters && form.regionalCenters.length > 0) {
        formData.append('regionalCenters', JSON.stringify(form.regionalCenters));
        formData.append('dealersAndShowrooms', JSON.stringify(form.regionalCenters));
        formData.append('projectStations', JSON.stringify(form.regionalCenters));
      }

      const existingDocsJSON = (form.documents || []).filter(d => !d.file);
      formData.append('documents', JSON.stringify(existingDocsJSON));
      formData.append('catalogues', JSON.stringify(existingDocsJSON));
      formData.append('reportsAndBriefs', JSON.stringify(existingDocsJSON));

      (form.documents || []).forEach((doc) => {
        if (doc.file) {
          formData.append('docFiles', doc.file);
          formData.append('docMeta', JSON.stringify({
            title: doc.title || doc.titleSi || doc.titleEn || '',
            titleSi: doc.titleSi || doc.title || '',
            titleEn: doc.titleEn || '',
            category: doc.category || doc.categorySi || doc.categoryEn || 'General',
            categorySi: doc.categorySi || doc.category || '',
            categoryEn: doc.categoryEn || ''
          }));
        }
      });

      const endpoint = `${API_BASE_URL}/institutions/${targetSector}${editingId ? `/${editingId}` : ''}`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers,
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save institution');
      }

      clearDraft(form.sector);
      setIsModalOpen(false);
      fetchInstitutions();
    } catch (err: any) {
      console.error('Error saving institution:', err);
      setValidationError(err.message || 'Error occurred while saving institution.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string | null | undefined) => {
    if (!confirm(`Are you sure you want to delete "${name || 'this institution'}"?`)) return;
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/institutions/${activeTab}/${id}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        fetchInstitutions();
      } else {
        alert('Failed to delete institution');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleAddService = () => {
    if (!newService.serviceSi.trim() && !newService.serviceEn?.trim()) return;
    setForm(prev => ({
      ...prev,
      services: [...prev.services, { ...newService }]
    }));
    setNewService({ serviceSi: '', serviceEn: '' });
  };

  const handleRemoveService = (idx: number) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== idx)
    }));
  };

  const handleAddCenter = () => {
    if (!newCenter.nameSi?.trim() && !newCenter.nameEn?.trim()) return;
    setForm(prev => ({
      ...prev,
      regionalCenters: [...prev.regionalCenters, { ...newCenter }]
    }));
    setNewCenter({ nameSi: '', nameEn: '', locationSi: '', locationEn: '', phone: '' });
  };

  const handleRemoveCenter = (idx: number) => {
    setForm(prev => ({
      ...prev,
      regionalCenters: prev.regionalCenters.filter((_, i) => i !== idx)
    }));
  };

  const handleRemoveDoc = (idx: number) => {
    setForm(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== idx)
    }));
  };

  const SECTIONS = [
    { id: 1, title: 'මූලික වර්ගීකරණය & නම්', subtitle: 'General & Names', icon: LandmarkIcon, count: null },
    { id: 2, title: 'සම්බන්ධතා & විස්තරය', subtitle: 'Contacts & Description', icon: PhoneIcon, count: null },
    { id: 3, title: 'අංශ විශේෂිත විස්තර', subtitle: 'Sector Specific', icon: BuildingIcon, count: null },
    { id: 4, title: 'සේවා & නිෂ්පාදන', subtitle: 'Services & Products', icon: CategoryIcon, count: form.services.length },
    { id: 5, title: 'ප්‍රාදේශීය මධ්‍යස්ථාන', subtitle: 'Regional Centers', icon: MapIcon, count: form.regionalCenters.length },
    { id: 6, title: 'ලියකියවිලි & Documents', subtitle: 'PDF & Files', icon: FileIcon, count: form.documents.length },
    { id: 7, title: 'ලාංඡනය & Social Links', subtitle: 'Logo & Media', icon: GlobeIcon, count: null }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── Top Page Bar ── */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Institutions Management
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Manage agricultural institutions, ministries, departments, and international bodies
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            bgcolor: '#16a34a',
            '&:hover': { bgcolor: '#15803d' },
            textTransform: 'none',
            borderRadius: 2,
            px: 2.5,
            py: 1,
            fontWeight: 700
          }}
        >
          Add Institution
        </Button>
      </Box>

      {/* ── Controls: Sector Tabs & Search Bar ── */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => handleTabChange(val)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 40, py: 0.5 },
            '& .Mui-selected': { color: '#16a34a' },
            '& .MuiTabs-indicator': { bgcolor: '#16a34a' }
          }}
        >
          <Tab icon={<LandmarkIcon fontSize="small" />} iconPosition="start" label="Government" value="gov" />
          <Tab icon={<BuildingIcon fontSize="small" />} iconPosition="start" label="Private Sector" value="pvt" />
          <Tab icon={<PublicIcon fontSize="small" />} iconPosition="start" label="International" value="intl" />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip label={`Total: ${totalCount}`} size="small" sx={{ fontWeight: 700, fontFamily: 'monospace' }} />
          <TextField
            placeholder="Search institutions, ministries..."
            size="small"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
        </Box>
      </Paper>

      {/* ── Main Data Table ── */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
            <CircularProgress size={32} sx={{ color: '#16a34a' }} />
            <Typography variant="body2">Loading institutions data...</Typography>
          </Box>
        ) : institutions.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
            <LandmarkIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>No institutions found.</Typography>
            <Typography variant="caption">Click the Add Institution button above to add one.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>INSTITUTION</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>CLASSIFICATION</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>CONTACT</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>SUMMARY</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>ORDER</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {institutions.map((inst) => {
                  const docCount = (inst.documents || inst.catalogues || inst.reportsAndBriefs || []).length;
                  const serviceCount = (inst.services || inst.productsAndServices || inst.interventions || []).length;
                  const centerCount = (inst.regionalCenters || inst.dealersAndShowrooms || inst.projectStations || []).length;

                  return (
                    <TableRow key={inst.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={inst.logoUrl || undefined} variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}>
                            <LandmarkIcon sx={{ color: 'text.disabled' }} fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{inst.nameSi || inst.nameEn || 'Untitled'}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{inst.nameEn || inst.nameSi || '-'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        {activeTab === 'gov' ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{inst.ministrySi || inst.ministry || inst.ministryEn || '-'}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{inst.institutionTypeSi || inst.institutionType || inst.institutionTypeEn || '-'}</Typography>
                          </Box>
                        ) : activeTab === 'pvt' ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{inst.parentConglomerateSi || inst.parentConglomerate || inst.parentConglomerateEn || '-'}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{inst.legalEntityTypeSi || inst.legalEntityType || inst.legalEntityTypeEn || '-'}</Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{inst.agencyCategorySi || inst.agencyCategory || inst.agencyCategoryEn || '-'}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{inst.globalHQSi || inst.globalHQ || inst.globalHQEn || '-'}</Typography>
                          </Box>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{inst.phone || '-'}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{inst.email || '-'}</Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          <Chip label={`${serviceCount} Services`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                          <Chip label={`${docCount} Docs`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                          {centerCount > 0 && <Chip label={`${centerCount} Centers`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />}
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{inst.order ?? 99}</Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          {inst.slug && (
                            <Tooltip title="View Public Page">
                              <IconButton size="small" component="a" href={`/institutions/${inst.slug}`} target="_blank">
                                <LaunchIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(inst)} sx={{ color: 'text.secondary', '&:hover': { color: '#16a34a' } }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(inst.id, inst.nameSi || inst.nameEn)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </Box>
        )}
      </Paper>

      {/* ================= BILINGUAL INSTITUTION DIALOG (MUI) ================= */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xl"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '92vh', width: '95vw' } } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editingId ? (form.nameSi || form.nameEn || 'Edit Institution') : 'Add New Institution'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Bilingual Sri Lanka Agricultural Institutions Enterprise Management Form
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!editingId && restoredDraftTime && (
              <Chip icon={<RestoreIcon fontSize="small" />} label="Draft Restored" size="small" color="success" variant="outlined" />
            )}
            <IconButton onClick={() => setIsModalOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <DialogContent sx={{ p: 0, display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Section Navigation List */}
            <Paper elevation={0} sx={{ width: 280, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', py: 1, shrink: 0 }}>
              <List>
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <ListItemButton
                      key={sec.id}
                      selected={isActive}
                      onClick={() => setActiveSection(sec.id)}
                      sx={{
                        py: 1.2,
                        px: 2,
                        my: 0.5,
                        mx: 1,
                        borderRadius: 2,
                        '&.Mui-selected': { bgcolor: '#f0fdf4', color: '#15803d', fontWeight: 700, borderLeft: '3px solid #16a34a' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: isActive ? '#16a34a' : 'text.secondary' }}>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={sec.title}
                        secondary={sec.subtitle}
                        slotProps={{
                          primary: { variant: 'body2', sx: { fontWeight: isActive ? 700 : 500 } },
                          secondary: { variant: 'caption' }
                        }}
                      />
                      {sec.count !== null && sec.count > 0 && (
                        <Chip label={sec.count} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                      )}
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>

            {/* Right Section Content Form */}
            <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {validationError && (
                <Alert severity="error" onClose={() => setValidationError(null)}>
                  {validationError}
                </Alert>
              )}

              {/* SECTION 1: CLASSIFICATION & GENERAL */}
              {activeSection === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    1. General & Classification (මූලික වර්ගීකරණය සහ නම්)
                  </Typography>

                  {/* Sector Choice */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
                    <Button
                      variant={form.sector === 'gov' ? 'contained' : 'outlined'}
                      startIcon={<LandmarkIcon />}
                      onClick={() => setForm({ ...form, sector: 'gov' })}
                      sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 1.5, bgcolor: form.sector === 'gov' ? '#16a34a' : undefined }}
                    >
                      Government (රාජ්‍ය අංශය)
                    </Button>
                    <Button
                      variant={form.sector === 'pvt' ? 'contained' : 'outlined'}
                      startIcon={<BuildingIcon />}
                      onClick={() => setForm({ ...form, sector: 'pvt' })}
                      sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 1.5, bgcolor: form.sector === 'pvt' ? '#16a34a' : undefined }}
                    >
                      Private Sector (පුද්ගලික අංශය)
                    </Button>
                    <Button
                      variant={form.sector === 'intl' ? 'contained' : 'outlined'}
                      startIcon={<PublicIcon />}
                      onClick={() => setForm({ ...form, sector: 'intl' })}
                      sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 1.5, bgcolor: form.sector === 'intl' ? '#16a34a' : undefined }}
                    >
                      International (ජාත්‍යන්තර)
                    </Button>
                  </Box>

                  {/* Gov Sector Classification */}
                  {form.sector === 'gov' && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Institution Type (Sinhala)</InputLabel>
                        <Select
                          value={form.institutionTypeSi || ''}
                          label="Institution Type (Sinhala)"
                          onChange={(e) => {
                            const val = e.target.value;
                            const match = GOV_INSTITUTION_TYPES.find(t => t.si === val);
                            setForm({ ...form, institutionTypeSi: val, institutionType: val, institutionTypeEn: match ? match.en : form.institutionTypeEn });
                          }}
                        >
                          {GOV_INSTITUTION_TYPES.map(t => (
                            <MenuItem key={t.si} value={t.si}>{t.si} ({t.en})</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel>Institution Type (English)</InputLabel>
                        <Select
                          value={form.institutionTypeEn || ''}
                          label="Institution Type (English)"
                          onChange={(e) => {
                            const val = e.target.value;
                            const match = GOV_INSTITUTION_TYPES.find(t => t.en === val);
                            setForm({ ...form, institutionTypeEn: val, institutionTypeSi: match ? match.si : form.institutionTypeSi, institutionType: match ? match.si : form.institutionType });
                          }}
                        >
                          {GOV_INSTITUTION_TYPES.map(t => (
                            <MenuItem key={t.en} value={t.en}>{t.en} ({t.si})</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TextField label="Ministry (Sinhala) - අයත් අමාත්‍යාංශය" size="small" value={form.ministrySi} onChange={e => setForm({ ...form, ministrySi: e.target.value, ministry: e.target.value })} fullWidth />
                      <TextField label="Ministry (English)" size="small" value={form.ministryEn} onChange={e => setForm({ ...form, ministryEn: e.target.value })} fullWidth />
                    </Box>
                  )}

                  {/* Pvt Sector Classification */}
                  {form.sector === 'pvt' && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      <TextField label="Legal Entity Type (Sinhala)" size="small" value={form.legalEntityTypeSi} onChange={e => setForm({ ...form, legalEntityTypeSi: e.target.value, legalEntityType: e.target.value })} fullWidth />
                      <TextField label="Legal Entity Type (English)" size="small" value={form.legalEntityTypeEn} onChange={e => setForm({ ...form, legalEntityTypeEn: e.target.value })} fullWidth />
                      <TextField label="Parent Conglomerate / Group (Sinhala)" size="small" value={form.parentConglomerateSi} onChange={e => setForm({ ...form, parentConglomerateSi: e.target.value, parentConglomerate: e.target.value })} fullWidth />
                      <TextField label="Parent Conglomerate / Group (English)" size="small" value={form.parentConglomerateEn} onChange={e => setForm({ ...form, parentConglomerateEn: e.target.value })} fullWidth />
                    </Box>
                  )}

                  {/* Intl Sector Classification */}
                  {form.sector === 'intl' && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Agency Category</InputLabel>
                        <Select
                          value={form.agencyCategorySi || ''}
                          label="Agency Category"
                          onChange={(e) => {
                            const val = e.target.value;
                            const match = INTL_AGENCY_CATEGORIES.find(t => t.si === val);
                            setForm({ ...form, agencyCategorySi: val, agencyCategory: val, agencyCategoryEn: match ? match.en : form.agencyCategoryEn });
                          }}
                        >
                          {INTL_AGENCY_CATEGORIES.map(t => (
                            <MenuItem key={t.si} value={t.si}>{t.si} ({t.en})</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField label="Global Headquarters (EN)" size="small" value={form.globalHQEn} onChange={e => setForm({ ...form, globalHQEn: e.target.value, globalHQ: e.target.value })} fullWidth />
                    </Box>
                  )}

                  {/* Names & Slug */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField label="Institution Name (Sinhala) - ආයතනයේ නම *" size="small" value={form.nameSi} onChange={e => setForm({ ...form, nameSi: e.target.value })} fullWidth />
                    <TextField label="Institution Name (English) *" size="small" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} fullWidth />
                    <TextField label="Short Code / Acronym (e.g. DOA, FAO, CIC)" size="small" value={form.shortCode} onChange={e => setForm({ ...form, shortCode: e.target.value })} fullWidth />
                    <TextField label="Custom URL Slug (Optional)" size="small" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="e.g. department-of-agriculture" fullWidth />
                  </Box>
                </Box>
              )}

              {/* SECTION 2: CONTACTS & DESCRIPTION */}
              {activeSection === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    2. Contacts & Description (සම්බන්ධතා සහ විස්තරය)
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                    <TextField label="General Telephone Number" size="small" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} fullWidth />
                    <TextField label="Official Email Address" type="email" size="small" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth />
                    <TextField label="Official Website URL" size="small" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} fullWidth />
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField label="Official Address (Sinhala)" multiline rows={2} size="small" value={form.addressSi} onChange={e => setForm({ ...form, addressSi: e.target.value, address: e.target.value })} fullWidth />
                    <TextField label="Official Address (English)" multiline rows={2} size="small" value={form.addressEn} onChange={e => setForm({ ...form, addressEn: e.target.value })} fullWidth />
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField label="Short Summary Description (Sinhala)" multiline rows={3} size="small" value={form.descriptionSi} onChange={e => setForm({ ...form, descriptionSi: e.target.value })} fullWidth />
                    <TextField label="Short Summary Description (English)" multiline rows={3} size="small" value={form.descriptionEn} onChange={e => setForm({ ...form, descriptionEn: e.target.value })} fullWidth />
                  </Box>
                </Box>
              )}

              {/* SECTION 3: SECTOR SPECIFIC */}
              {activeSection === 3 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    3. Sector Specific Details (අංශ විශේෂිත විස්තර)
                  </Typography>

                  {form.sector === 'intl' ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.hasSriLankaOffice}
                            onChange={e => setForm({ ...form, hasSriLankaOffice: e.target.checked })}
                            sx={{ color: '#16a34a', '&.Mui-checked': { color: '#16a34a' } }}
                          />
                        }
                        label="Has Resident Office / Mission in Sri Lanka (ශ්‍රී ලංකා නියෝජිත කාර්යාලයක් පවතී)"
                      />

                      {form.hasSriLankaOffice && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                          <TextField label="SL Office Location (Sinhala)" size="small" value={form.slOfficeLocationSi} onChange={e => setForm({ ...form, slOfficeLocationSi: e.target.value, slOfficeLocation: e.target.value })} fullWidth />
                          <TextField label="SL Office Location (English)" size="small" value={form.slOfficeLocationEn} onChange={e => setForm({ ...form, slOfficeLocationEn: e.target.value })} fullWidth />
                        </Box>
                      )}

                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Operating Countries (ක්‍රියාත්මක රටවල්):</Typography>
                        <CountryMultiSelect
                          valueSi={form.operatingCountriesSi || ''}
                          valueEn={form.operatingCountriesEn || ''}
                          onChange={(si, en) => setForm({ ...form, operatingCountriesSi: si, operatingCountriesEn: en, operatingCountries: en })}
                        />
                      </Box>
                    </Box>
                  ) : form.sector === 'pvt' ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      <TextField label="Headquarters Address (Sinhala)" multiline rows={2} size="small" value={form.headquartersAddressSi} onChange={e => setForm({ ...form, headquartersAddressSi: e.target.value, headquartersAddress: e.target.value })} fullWidth />
                      <TextField label="Headquarters Address (English)" multiline rows={2} size="small" value={form.headquartersAddressEn} onChange={e => setForm({ ...form, headquartersAddressEn: e.target.value })} fullWidth />
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      Government sector details are configured in Section 1.
                    </Typography>
                  )}
                </Box>
              )}

              {/* SECTION 4: SERVICES & PRODUCTS */}
              {activeSection === 4 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    4. Services & Products List (සේවා සහ නිෂ්පාදන)
                  </Typography>

                  {/* Add New Service Controls */}
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Add New Service / Product:</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 1.5, alignItems: 'center' }}>
                      <TextField label="Service Name (Sinhala)" size="small" value={newService.serviceSi} onChange={e => setNewService({ ...newService, serviceSi: e.target.value })} fullWidth />
                      <TextField label="Service Name (English)" size="small" value={newService.serviceEn} onChange={e => setNewService({ ...newService, serviceEn: e.target.value })} fullWidth />
                      <Button variant="contained" onClick={handleAddService} startIcon={<AddIcon />} sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, textTransform: 'none', height: 40 }}>
                        Add
                      </Button>
                    </Box>
                  </Paper>

                  {/* Services List */}
                  {form.services.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', py: 2 }}>No services added yet.</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {form.services.map((item, idx) => (
                        <Paper key={idx} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.serviceSi || item.serviceEn}</Typography>
                            {item.serviceEn && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.serviceEn}</Typography>}
                          </Box>
                          <IconButton size="small" onClick={() => handleRemoveService(idx)} sx={{ color: 'error.main' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {/* SECTION 5: REGIONAL CENTERS */}
              {activeSection === 5 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    5. Regional Centers / Showrooms (ප්‍රාදේශීය මධ්‍යස්ථාන)
                  </Typography>

                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Add Regional Center / Showroom:</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr auto' }, gap: 1.5, alignItems: 'center' }}>
                      <TextField label="Center Name (SI)" size="small" value={newCenter.nameSi} onChange={e => setNewCenter({ ...newCenter, nameSi: e.target.value })} fullWidth />
                      <TextField label="Center Name (EN)" size="small" value={newCenter.nameEn} onChange={e => setNewCenter({ ...newCenter, nameEn: e.target.value })} fullWidth />
                      <TextField label="Phone Number" size="small" value={newCenter.phone} onChange={e => setNewCenter({ ...newCenter, phone: e.target.value })} fullWidth />
                      <Button variant="contained" onClick={handleAddCenter} startIcon={<AddIcon />} sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, textTransform: 'none', height: 40 }}>
                        Add
                      </Button>
                    </Box>
                  </Paper>

                  {form.regionalCenters.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', py: 2 }}>No regional centers added yet.</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {form.regionalCenters.map((item, idx) => (
                        <Paper key={idx} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.nameSi || item.nameEn}</Typography>
                            {item.phone && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Phone: {item.phone}</Typography>}
                          </Box>
                          <IconButton size="small" onClick={() => handleRemoveCenter(idx)} sx={{ color: 'error.main' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {/* SECTION 6: DOCUMENTS */}
              {activeSection === 6 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    6. PDF Documents & Catalogues (ලියකියවිලි සහ වාර්තා)
                  </Typography>

                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Upload New Document / File:</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 1.5, alignItems: 'center' }}>
                      <TextField
                        label="Document Title (SI/EN) - Optional"
                        size="small"
                        value={newDoc.titleSi || newDoc.title || ''}
                        onChange={e => setNewDoc({ ...newDoc, titleSi: e.target.value, title: e.target.value })}
                        placeholder="e.g. Annual Report 2024 / වාර්ෂික වාර්තාව"
                        fullWidth
                      />
                      <Button
                        component="label"
                        variant="contained"
                        disabled={isUploadingDoc}
                        startIcon={isUploadingDoc ? <CircularProgress size={18} color="inherit" /> : <UploadIcon />}
                        sx={{
                          bgcolor: '#16a34a',
                          '&:hover': { bgcolor: '#15803d' },
                          textTransform: 'none',
                          shrink: 0,
                          whiteSpace: 'nowrap',
                          height: 40,
                          px: 2.5,
                          fontWeight: 700
                        }}
                      >
                        {isUploadingDoc ? 'Uploading...' : '+ Upload & Add Document'}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                          hidden
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadDocFile(file);
                              e.target.value = '';
                            }
                          }}
                        />
                      </Button>
                    </Box>
                  </Paper>

                  {form.documents.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                      No documents added yet.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {form.documents.map((item, idx) => (
                        <Paper key={idx} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                            <FileIcon sx={{ color: '#16a34a', flexShrink: 0 }} fontSize="small" />
                            <Box sx={{ overflow: 'hidden' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                {item.titleSi || item.title || item.titleEn || 'Untitled Document'}
                              </Typography>
                              {item.url && (
                                <Typography
                                  variant="caption"
                                  component="a"
                                  href={item.url.startsWith('http') ? item.url : `${API_BASE_URL.replace('/api', '')}${item.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ color: 'primary.main', display: 'block', textDecoration: 'underline' }}
                                  noWrap
                                >
                                  {item.url}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <IconButton size="small" onClick={() => handleRemoveDoc(idx)} sx={{ color: 'error.main' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {/* SECTION 7: MEDIA & LOGO */}
              {activeSection === 7 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    7. Logo & Social Media Links (ලාංඡනය සහ සමාජ මාධ්‍ය)
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar src={form.logoUrl || undefined} variant="rounded" sx={{ width: 64, height: 64, bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}>
                      <LandmarkIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
                    </Avatar>
                    <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField label="Logo Image URL" size="small" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} fullWidth />
                      <Button component="label" variant="outlined" startIcon={<UploadIcon />} sx={{ textTransform: 'none', shrink: 0, whiteSpace: 'nowrap' }}>
                        {isUploadingLogo ? '...' : 'Upload Logo'}
                        <input type="file" accept="image/*" hidden onChange={e => { const file = e.target.files?.[0]; if (file) handleUploadLogo(file); }} />
                      </Button>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField label="Facebook Page URL" size="small" value={form.facebookUrl} onChange={e => setForm({ ...form, facebookUrl: e.target.value })} fullWidth />
                    <TextField label="YouTube Channel URL" size="small" value={form.youtubeUrl} onChange={e => setForm({ ...form, youtubeUrl: e.target.value })} fullWidth />
                    <TextField label="TikTok Account URL" size="small" value={form.tiktokUrl} onChange={e => setForm({ ...form, tiktokUrl: e.target.value })} fullWidth />
                    <TextField label="LinkedIn Page URL" size="small" value={form.linkedinUrl} onChange={e => setForm({ ...form, linkedinUrl: e.target.value })} fullWidth />
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
            <Button onClick={() => setIsModalOpen(false)} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, flex: 1, borderColor: 'grey.300', color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} variant="contained" sx={{ textTransform: 'none', borderRadius: 2, flex: 1, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}>
              {isSaving ? <CircularProgress size={20} color="inherit" /> : (editingId ? 'Update Institution' : 'Save Institution')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
