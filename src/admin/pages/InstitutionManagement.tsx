import { useState, useEffect, useRef } from 'react';
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
  Check,
  Trash,
  Image as ImageIcon,
  FileText,
  Globe,
  Clock,
  RotateCcw,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  Layers,
  FileUp,
  AlertCircle,
  Eye,
  Languages
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import type { InstitutionDocument, RegionalCenter } from '../../data/agriInstitutionsData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface FormDocument extends InstitutionDocument {
  nameSi?: string;
  nameEn?: string;
  categorySi?: string;
  categoryEn?: string;
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
  logoUrl: '',
  order: 99,
  isActive: true,

  // Gov
  institutionType: 'රජයේ දෙපාර්තමේන්තුව',
  institutionTypeSi: 'රජයේ දෙපාර්තමේන්තුව',
  institutionTypeEn: 'Government Department',
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
  agencyCategory: 'එක්සත් ජාතීන්ගේ සංවිධානය (UN)',
  agencyCategorySi: 'එක්සත් ජාතීන්ගේ සංවිධානය (UN)',
  agencyCategoryEn: 'United Nations Agency (UN)',
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [form, setForm] = useState(defaultFormData);
  const [restoredDraftTime, setRestoredDraftTime] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Logo & Doc helpers
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogoFlag, setRemoveLogoFlag] = useState<boolean>(false);

  // New item inputs
  const [newServiceSi, setNewServiceSi] = useState<string>('');
  const [newServiceEn, setNewServiceEn] = useState<string>('');

  const [newCenter, setNewCenter] = useState<FormRegionalCenter>({
    nameSi: '',
    nameEn: '',
    locationSi: '',
    locationEn: '',
    phone: ''
  });

  const [newDoc, setNewDoc] = useState<{
    nameSi: string;
    nameEn: string;
    categorySi: string;
    categoryEn: string;
    year: string;
    file: File | null;
  }>({
    nameSi: '',
    nameEn: '',
    categorySi: 'අයදුම්පත්',
    categoryEn: 'Applications',
    year: '2026',
    file: null
  });

  const docFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const PAGE_SIZE = 12;

  // Auto-save form draft for 7 days when creating a new institution
  useEffect(() => {
    if (isModalOpen && !editingId) {
      const isNotEmpty =
        form.nameSi.trim() ||
        form.nameEn.trim() ||
        form.phone.trim() ||
        form.email.trim() ||
        form.descriptionSi.trim() ||
        form.descriptionEn.trim() ||
        form.addressSi.trim() ||
        form.headquartersAddressSi.trim() ||
        form.slMissionAddressSi.trim() ||
        form.services.length > 0 ||
        form.documents.length > 0;

      if (isNotEmpty) {
        saveDraft(form.sector, form);
      }
    }
  }, [form, isModalOpen, editingId]);

  // Fetch Institutions based on active tab
  const fetchInstitutions = () => {
    setIsLoading(true);
    const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : '';
    const url = `${API_BASE_URL}/institutions/${activeTab}?page=${currentPage}&limit=${PAGE_SIZE}${searchParam}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        const items = data.data || data;
        setInstitutions(Array.isArray(items) ? items : []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setTotalCount(data.meta.total || 0);
        } else {
          setTotalPages(1);
          setTotalCount(Array.isArray(items) ? items.length : 0);
        }
      })
      .catch((err) => {
        console.error('Error fetching institutions:', err);
        setInstitutions([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchInstitutions();
  }, [activeTab, currentPage, searchQuery]);

  const handleTabChange = (tab: SectorType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const openCreate = () => {
    setEditingId(null);
    setActiveSection(1);
    setValidationError(null);
    const existingDraft = loadDraft(activeTab);
    if (existingDraft && existingDraft.form) {
      setForm({
        ...defaultFormData,
        ...existingDraft.form,
        sector: activeTab
      });
      setRestoredDraftTime(existingDraft.savedAt);
    } else {
      setForm({
        ...defaultFormData,
        sector: activeTab,
        iconClass: activeTab === 'gov' ? 'fa-landmark' : activeTab === 'pvt' ? 'fa-building' : 'fa-earth-americas',
        colorTheme: activeTab === 'gov' ? 'emerald' : activeTab === 'pvt' ? 'blue' : 'purple',
        services: [],
        regionalCenters: [],
        documents: []
      });
      setRestoredDraftTime(null);
    }
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogoFlag(false);
    setIsModalOpen(true);
  };

  const handleSectorChange = (newSector: SectorType) => {
    if (!editingId) {
      saveDraft(form.sector, form);
      const targetDraft = loadDraft(newSector);
      if (targetDraft && targetDraft.form) {
        setForm({
          ...defaultFormData,
          ...targetDraft.form,
          sector: newSector
        });
        setRestoredDraftTime(targetDraft.savedAt);
      } else {
        setForm({
          ...defaultFormData,
          sector: newSector,
          iconClass: newSector === 'gov' ? 'fa-landmark' : newSector === 'pvt' ? 'fa-building' : 'fa-earth-americas',
          colorTheme: newSector === 'gov' ? 'emerald' : newSector === 'pvt' ? 'blue' : 'purple',
          services: [],
          regionalCenters: [],
          documents: []
        });
        setRestoredDraftTime(null);
      }
    } else {
      setForm({ ...form, sector: newSector });
    }
  };

  const openEdit = (inst: BaseInstitution) => {
    setEditingId(inst.id);
    setActiveSection(1);
    setValidationError(null);
    setRestoredDraftTime(null);

    const rawServices = inst.services || inst.productsAndServices || inst.interventions || [];
    const parsedServices: ServiceItem[] = rawServices.map((s: any) => {
      if (typeof s === 'string') return { serviceSi: s, serviceEn: '' };
      return { serviceSi: s.serviceSi || s.serviceEn || '', serviceEn: s.serviceEn || '' };
    });

    const rawCenters: FormRegionalCenter[] = (inst.regionalCenters || inst.dealersAndShowrooms || inst.projectStations || []).map((c: any) => ({
      nameSi: c.nameSi || '',
      nameEn: c.nameEn || '',
      locationSi: c.locationSi || '',
      locationEn: c.locationEn || '',
      phone: c.phone || ''
    }));

    const rawDocs: FormDocument[] = (inst.documents || inst.catalogues || inst.reportsAndBriefs || []).map((d: any) => ({
      ...d,
      name: d.name || d.nameSi || d.nameEn || 'ලේඛනය',
      nameSi: d.nameSi || d.name || '',
      nameEn: d.nameEn || '',
      category: d.category || d.categorySi || 'නිල ලේඛන',
      categorySi: d.categorySi || d.category || 'නිල ලේඛන',
      categoryEn: d.categoryEn || '',
      year: d.year || '2026'
    }));

    setForm({
      ...defaultFormData,
      sector: (inst.sector === 'pvt' || inst.sector === 'intl' ? inst.sector : 'gov') as SectorType,
      slug: inst.slug || '',
      nameSi: inst.nameSi || '',
      nameEn: inst.nameEn || '',
      badgeText: inst.badgeText || inst.badgeTextSi || '',
      badgeTextSi: inst.badgeTextSi || inst.badgeText || '',
      badgeTextEn: inst.badgeTextEn || '',
      iconClass: inst.iconClass || (activeTab === 'gov' ? 'fa-landmark' : activeTab === 'pvt' ? 'fa-building' : 'fa-earth-americas'),
      colorTheme: inst.colorTheme || (activeTab === 'gov' ? 'emerald' : activeTab === 'pvt' ? 'blue' : 'purple'),
      phone: inst.phone || '',
      shortCode: inst.shortCode || '',
      email: inst.email || '',
      descriptionSi: inst.descriptionSi || '',
      descriptionEn: inst.descriptionEn || '',
      fullDescriptionSi: inst.fullDescriptionSi || inst.descriptionSi || '',
      fullDescriptionEn: inst.fullDescriptionEn || inst.descriptionEn || '',
      website: inst.website || '',
      facebookUrl: inst.facebookUrl || '',
      youtubeUrl: inst.youtubeUrl || '',
      tiktokUrl: inst.tiktokUrl || '',
      logoUrl: inst.logoUrl || '',
      order: inst.order !== undefined ? inst.order : 99,
      isActive: inst.isActive !== undefined ? inst.isActive : true,

      // Gov
      institutionType: inst.institutionType || inst.institutionTypeSi || 'රජයේ දෙපාර්තමේන්තුව',
      institutionTypeSi: inst.institutionTypeSi || inst.institutionType || 'රජයේ දෙපාර්තමේන්තුව',
      institutionTypeEn: inst.institutionTypeEn || '',
      ministry: inst.ministry || inst.ministrySi || 'කෘෂිකර්ම, පශු සම්පත්, ඉඩම් සහ වාරිමාර්ග අමාත්‍යාංශය',
      ministrySi: inst.ministrySi || inst.ministry || 'කෘෂිකර්ම, පශු සම්පත්, ඉඩම් සහ වාරිමාර්ග අමාත්‍යාංශය',
      ministryEn: inst.ministryEn || '',
      address: inst.address || inst.addressSi || '',
      addressSi: inst.addressSi || inst.address || '',
      addressEn: inst.addressEn || '',

      // Pvt
      legalEntityType: inst.legalEntityType || inst.legalEntityTypeSi || 'සීමාසහිත පුද්ගලික සමාගම (Pvt Ltd)',
      legalEntityTypeSi: inst.legalEntityTypeSi || inst.legalEntityType || 'සීමාසහිත පුද්ගලික සමාගම (Pvt Ltd)',
      legalEntityTypeEn: inst.legalEntityTypeEn || '',
      parentConglomerate: inst.parentConglomerate || inst.parentConglomerateSi || '',
      parentConglomerateSi: inst.parentConglomerateSi || inst.parentConglomerate || '',
      parentConglomerateEn: inst.parentConglomerateEn || '',
      headquartersAddress: inst.headquartersAddress || inst.headquartersAddressSi || inst.address || '',
      headquartersAddressSi: inst.headquartersAddressSi || inst.headquartersAddress || '',
      headquartersAddressEn: inst.headquartersAddressEn || '',

      // Intl
      agencyCategory: inst.agencyCategory || inst.agencyCategorySi || 'එක්සත් ජාතීන්ගේ සංවිධානය (UN)',
      agencyCategorySi: inst.agencyCategorySi || inst.agencyCategory || 'එක්සත් ජාතීන්ගේ සංවිධානය (UN)',
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
      hasSriLankaOffice: inst.hasSriLankaOffice !== undefined ? inst.hasSriLankaOffice : true,
      slOfficeLocation: inst.slOfficeLocation || inst.slOfficeLocationSi || 'කොළඹ 07',
      slOfficeLocationSi: inst.slOfficeLocationSi || inst.slOfficeLocation || 'කොළඹ 07',
      slOfficeLocationEn: inst.slOfficeLocationEn || '',
      slOfficeAddress: inst.slOfficeAddress || inst.slOfficeAddressSi || '',
      slOfficeAddressSi: inst.slOfficeAddressSi || inst.slOfficeAddress || '',
      slOfficeAddressEn: inst.slOfficeAddressEn || '',
      slMissionAddress: inst.slMissionAddress || inst.slMissionAddressSi || inst.address || '',
      slMissionAddressSi: inst.slMissionAddressSi || inst.slMissionAddress || '',
      slMissionAddressEn: inst.slMissionAddressEn || '',

      // Lists
      services: parsedServices,
      regionalCenters: rawCenters,
      documents: rawDocs
    });

    setLogoFile(null);
    setLogoPreview(inst.logoUrl || null);
    setRemoveLogoFlag(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    // Non-compulsory rule: If both names are empty, provide a gentle fallback
    const effectiveNameSi = form.nameSi?.trim() || form.nameEn?.trim() || '';
    const effectiveNameEn = form.nameEn?.trim() || form.nameSi?.trim() || '';

    setIsSaving(true);
    try {
      const generatedSlug =
        form.slug?.trim() ||
        generateSlug(effectiveNameEn || effectiveNameSi || `institution-${Date.now().toString().slice(-4)}`);

      const formData = new FormData();
      formData.append('sector', form.sector);
      formData.append('slug', generatedSlug);
      formData.append('nameSi', form.nameSi || '');
      formData.append('nameEn', form.nameEn || '');
      formData.append('badgeText', form.badgeText || form.badgeTextSi || form.badgeTextEn || '');
      formData.append('badgeTextSi', form.badgeTextSi || form.badgeText || '');
      formData.append('badgeTextEn', form.badgeTextEn || '');
      formData.append('iconClass', form.iconClass || '');
      formData.append('colorTheme', form.colorTheme || '');
      formData.append('phone', form.phone || '');
      formData.append('shortCode', form.shortCode || '');
      formData.append('email', form.email || '');
      formData.append('descriptionSi', form.descriptionSi || '');
      formData.append('descriptionEn', form.descriptionEn || '');
      formData.append('fullDescriptionSi', form.fullDescriptionSi || form.descriptionSi || '');
      formData.append('fullDescriptionEn', form.fullDescriptionEn || form.descriptionEn || '');
      formData.append('website', form.website || '');
      formData.append('facebookUrl', form.facebookUrl || '');
      formData.append('youtubeUrl', form.youtubeUrl || '');
      formData.append('tiktokUrl', form.tiktokUrl || '');
      formData.append('order', String(form.order ?? 99));
      formData.append('isActive', String(form.isActive));

      if (form.sector === 'gov') {
        formData.append('institutionType', form.institutionType || form.institutionTypeSi || form.institutionTypeEn || '');
        formData.append('institutionTypeSi', form.institutionTypeSi || form.institutionType || '');
        formData.append('institutionTypeEn', form.institutionTypeEn || '');
        formData.append('ministry', form.ministry || form.ministrySi || form.ministryEn || '');
        formData.append('ministrySi', form.ministrySi || form.ministry || '');
        formData.append('ministryEn', form.ministryEn || '');
        formData.append('address', form.address || form.addressSi || form.addressEn || '');
        formData.append('addressSi', form.addressSi || form.address || '');
        formData.append('addressEn', form.addressEn || '');
        formData.append('services', JSON.stringify(form.services));
        formData.append('regionalCenters', JSON.stringify(form.regionalCenters));
      } else if (form.sector === 'pvt') {
        formData.append('legalEntityType', form.legalEntityType || form.legalEntityTypeSi || form.legalEntityTypeEn || '');
        formData.append('legalEntityTypeSi', form.legalEntityTypeSi || form.legalEntityType || '');
        formData.append('legalEntityTypeEn', form.legalEntityTypeEn || '');
        formData.append('parentConglomerate', form.parentConglomerate || form.parentConglomerateSi || form.parentConglomerateEn || '');
        formData.append('parentConglomerateSi', form.parentConglomerateSi || form.parentConglomerate || '');
        formData.append('parentConglomerateEn', form.parentConglomerateEn || '');
        formData.append('headquartersAddress', form.headquartersAddress || form.headquartersAddressSi || form.headquartersAddressEn || form.address || '');
        formData.append('headquartersAddressSi', form.headquartersAddressSi || form.headquartersAddress || '');
        formData.append('headquartersAddressEn', form.headquartersAddressEn || '');
        formData.append('productsAndServices', JSON.stringify(form.services));
        formData.append('dealersAndShowrooms', JSON.stringify(form.regionalCenters));
      } else if (form.sector === 'intl') {
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
        formData.append('slMissionAddress', form.slMissionAddress || form.slMissionAddressSi || form.slMissionAddressEn || form.address || '');
        formData.append('slMissionAddressSi', form.slMissionAddressSi || form.slMissionAddress || '');
        formData.append('slMissionAddressEn', form.slMissionAddressEn || '');
        formData.append('interventions', JSON.stringify(form.services));
        formData.append('projectStations', JSON.stringify(form.regionalCenters));
      }

      // Logo handling
      if (logoFile) {
        formData.append('logo', logoFile);
      } else if (removeLogoFlag) {
        formData.append('removeLogo', 'true');
      } else if (form.logoUrl) {
        formData.append('logoUrl', form.logoUrl);
      }

      // Documents & File uploads
      const docMetadata = form.documents.map((d) => ({
        id: d.id || d.tempId,
        name: d.name || d.nameSi || d.nameEn || 'ලේඛනය',
        nameSi: d.nameSi || d.name || '',
        nameEn: d.nameEn || '',
        category: d.category || d.categorySi || 'නිල ලේඛන',
        categorySi: d.categorySi || d.category || '',
        categoryEn: d.categoryEn || '',
        year: d.year || '2026',
        fileUrl: d.fileUrl || '',
        fileSize: d.fileSize || '',
        fileType: d.fileType || ''
      }));

      if (form.sector === 'gov') {
        formData.append('documents', JSON.stringify(docMetadata));
      } else if (form.sector === 'pvt') {
        formData.append('catalogues', JSON.stringify(docMetadata));
      } else {
        formData.append('reportsAndBriefs', JSON.stringify(docMetadata));
      }

      form.documents.forEach((d) => {
        if (d.file && (d.id || d.tempId)) {
          formData.append(`docFile_${d.id || d.tempId}`, d.file);
        }
      });

      const endpoint = `${API_BASE_URL}/institutions/${form.sector}${editingId ? `/${editingId}` : ''}`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save institution');
      }

      if (!editingId) {
        clearDraft(form.sector);
      }
      setRestoredDraftTime(null);
      setIsModalOpen(false);
      fetchInstitutions();
    } catch (err: any) {
      console.error('Save error:', err);
      setValidationError(err.message || 'දත්ත සුරැකීමේදී දෝෂයක් සිදුවිය.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name?: string | null) => {
    const displayName = name || 'මෙම ආයතනය';
    if (!window.confirm(`ඔබට "${displayName}" ආයතනය මකා දැමීමට අවශ්‍ය බව සහතිකද?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/institutions/${activeTab}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchInstitutions();
    } catch (err) {
      console.error('Delete error:', err);
      alert('ආයතනය මකා දැමීම අසාර්ථක විය.');
    }
  };

  // Add Helpers for lists
  const addService = () => {
    if (!newServiceSi.trim() && !newServiceEn.trim()) return;
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, { serviceSi: newServiceSi.trim(), serviceEn: newServiceEn.trim() }]
    }));
    setNewServiceSi('');
    setNewServiceEn('');
  };

  const removeService = (idx: number) => {
    setForm((prev) => ({ ...prev, services: prev.services.filter((_, i) => i !== idx) }));
  };

  const addRegionalCenter = () => {
    if (!newCenter.nameSi?.trim() && !newCenter.nameEn?.trim() && !newCenter.locationSi?.trim() && !newCenter.locationEn?.trim() && !newCenter.phone?.trim()) return;
    setForm((prev) => ({
      ...prev,
      regionalCenters: [...prev.regionalCenters, { ...newCenter }]
    }));
    setNewCenter({ nameSi: '', nameEn: '', locationSi: '', locationEn: '', phone: '' });
  };

  const removeRegionalCenter = (idx: number) => {
    setForm((prev) => ({ ...prev, regionalCenters: prev.regionalCenters.filter((_, i) => i !== idx) }));
  };

  const addDocument = () => {
    let docNameSi = newDoc.nameSi.trim();
    let docNameEn = newDoc.nameEn.trim();
    if (!docNameSi && !docNameEn && newDoc.file) {
      docNameSi = newDoc.file.name.replace(/\.[^/.]+$/, '');
      docNameEn = docNameSi;
    }
    if (!docNameSi && !docNameEn && !newDoc.file) {
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const formattedSize = newDoc.file
      ? newDoc.file.size > 1024 * 1024
        ? `${(newDoc.file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(newDoc.file.size / 1024))} KB`
      : '1.5 MB';
    const ext = newDoc.file?.name.split('.').pop()?.toLowerCase() || 'pdf';

    const docItem: FormDocument = {
      id: tempId,
      tempId,
      name: docNameSi || docNameEn || 'නිල ලේඛනය',
      nameSi: docNameSi || docNameEn,
      nameEn: docNameEn || docNameSi,
      category: newDoc.categorySi || newDoc.categoryEn || 'අයදුම්පත්',
      categorySi: newDoc.categorySi || 'අයදුම්පත්',
      categoryEn: newDoc.categoryEn || 'Applications',
      year: newDoc.year || '2026',
      fileUrl: newDoc.file ? URL.createObjectURL(newDoc.file) : '',
      fileSize: formattedSize,
      fileType: ext,
      file: newDoc.file || undefined
    };

    setForm((prev) => ({ ...prev, documents: [...prev.documents, docItem] }));
    setNewDoc({ nameSi: '', nameEn: '', categorySi: 'අයදුම්පත්', categoryEn: 'Applications', year: '2026', file: null });
    if (docFileInputRef.current) {
      docFileInputRef.current.value = '';
    }
  };

  const removeDocument = (idx: number) => {
    setForm((prev) => ({ ...prev, documents: prev.documents.filter((_, i) => i !== idx) }));
  };

  // Clean Navigation Structure
  const SECTIONS = [
    { id: 1, title: 'මූලික විස්තර', subtitle: 'General & Classification', icon: Landmark, count: null },
    { id: 2, title: 'සම්බන්ධතා & ලිපිනය', subtitle: 'Contact & Addresses', icon: Phone, count: null },
    { id: 3, title: 'හැඳින්වීම', subtitle: 'Descriptions', icon: FileText, count: null },
    {
      id: 4,
      title: form.sector === 'gov' ? 'සේවාවන්' : form.sector === 'pvt' ? 'නිෂ්පාදන & සේවා' : 'මැදිහත්වීම්',
      subtitle: 'Mandates & Services',
      icon: Layers,
      count: form.services.length
    },
    {
      id: 5,
      title: form.sector === 'gov' ? 'ප්‍රාදේශීය මධ්‍යස්ථාන' : form.sector === 'pvt' ? 'නියෝජිත ශාඛා' : 'ව්‍යාපෘති කලාප',
      subtitle: 'Regional Centers',
      icon: MapPin,
      count: form.regionalCenters.length
    },
    {
      id: 6,
      title: form.sector === 'gov' ? 'PDF ලේඛන' : form.sector === 'pvt' ? 'නාමාවලි' : 'වාර්තා & Briefs',
      subtitle: 'Documents & Files',
      icon: FileUp,
      count: form.documents.length
    },
    { id: 7, title: 'ලාංඡනය & Media', subtitle: 'Logo & Social Links', icon: Globe, count: null }
  ];

  return (
    <div className="p-6 md:p-8 w-full mx-auto min-h-screen font-sans text-zinc-900 bg-zinc-50/40">
      {/* ── Top Page Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">
            ආයතන කළමනාකරණය (Institutions Management)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Agricultural Institutions Registry & Bilingual Information System
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>නව ආයතනයක් එක් කරන්න (Add Institution)</span>
        </button>
      </div>

      {/* ── Segmented Sector Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="inline-flex bg-zinc-200/70 p-1 rounded-xl border border-zinc-200 text-xs font-medium">
          <button
            onClick={() => handleTabChange('gov')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'gov'
                ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-zinc-600" />
            <span>රාජ්‍ය අංශය (Government)</span>
          </button>
          <button
            onClick={() => handleTabChange('pvt')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'pvt'
                ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-zinc-600" />
            <span>පුද්ගලික අංශය (Private)</span>
          </button>
          <button
            onClick={() => handleTabChange('intl')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'intl'
                ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-zinc-600" />
            <span>ජාත්‍යන්තර සංවිධාන (International)</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="text-xs text-zinc-500 font-medium whitespace-nowrap hidden sm:block">
            මුළු එකතුව: <span className="font-semibold text-zinc-900 font-mono">{totalCount}</span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="නම හෝ අමාත්‍යාංශය සොයන්න..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-2 text-zinc-400">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
            <p className="text-xs">දත්ත පූරණය වෙමින් පවතී...</p>
          </div>
        ) : institutions.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            <Landmark className="w-10 h-10 mx-auto text-zinc-300 mb-2 stroke-[1.5]" />
            <p className="font-medium text-xs text-zinc-700">ආයතන කිසිවක් හමු නොවීය.</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">ඉහත බොත්තම ක්ලික් කර නව ආයතනයක් එක් කරන්න.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600">
              <thead className="bg-zinc-50/80 text-zinc-600 font-semibold border-b border-zinc-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">ආයතනය (Institution)</th>
                  <th className="py-3 px-4">වර්ගීකරණය (Classification)</th>
                  <th className="py-3 px-4">සම්බන්ධතා (Contact)</th>
                  <th className="py-3 px-4">දත්ත (Data)</th>
                  <th className="py-3 px-4 text-center">පිළිවෙල</th>
                  <th className="py-3 px-4 text-right">ක්‍රියාමාර්ග</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {institutions.map((inst) => {
                  const docCount = (inst.documents || inst.catalogues || inst.reportsAndBriefs || []).length;
                  const serviceCount = (inst.services || inst.productsAndServices || inst.interventions || []).length;
                  const centerCount = (inst.regionalCenters || inst.dealersAndShowrooms || inst.projectStations || []).length;

                  return (
                    <tr key={inst.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 overflow-hidden">
                            {inst.logoUrl ? (
                              <img src={inst.logoUrl} alt="" className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <Landmark className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 truncate">{inst.nameSi || inst.nameEn || 'නමක් නැත'}</p>
                            <p className="text-[11px] text-zinc-400 truncate">{inst.nameEn || inst.nameSi || '-'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-700">
                        {activeTab === 'gov' ? (
                          <div>
                            <p className="font-medium text-zinc-900 truncate max-w-xs">{inst.ministrySi || inst.ministry || inst.ministryEn || '-'}</p>
                            <p className="text-[11px] text-zinc-400">{inst.institutionTypeSi || inst.institutionType || inst.institutionTypeEn || '-'}</p>
                          </div>
                        ) : activeTab === 'pvt' ? (
                          <div>
                            <p className="font-medium text-zinc-900 truncate max-w-xs">{inst.parentConglomerateSi || inst.parentConglomerate || inst.parentConglomerateEn || '-'}</p>
                            <p className="text-[11px] text-zinc-400">{inst.legalEntityTypeSi || inst.legalEntityType || inst.legalEntityTypeEn || '-'}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-zinc-900 truncate max-w-xs">{inst.agencyCategorySi || inst.agencyCategory || inst.agencyCategoryEn || '-'}</p>
                            <p className="text-[11px] text-zinc-400">{inst.globalHQSi || inst.globalHQ || inst.globalHQEn || '-'}</p>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600">
                        <p className="font-medium text-zinc-900">{inst.phone || '-'}</p>
                        <p className="text-[11px] text-zinc-400 truncate max-w-[180px]">{inst.email || '-'}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                          <span>{serviceCount} සේවා</span>
                          <span>•</span>
                          <span>{docCount} ලේඛන</span>
                          {centerCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{centerCount} ශාඛා</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-zinc-400 text-xs">
                        {inst.order ?? 99}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {inst.slug && (
                            <a
                              href={`/institutions/${inst.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                              title="නරඹන්න"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => openEdit(inst)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                            title="සංස්කරණය"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(inst.id, inst.nameSi || inst.nameEn)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="මකා දමන්න"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-3 border-t border-zinc-100 flex justify-end">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* ── BILINGUAL ENTERPRISE FORM MODAL ── */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-zinc-900/60 backdrop-blur-xs overflow-hidden">
          <div className="bg-white w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] rounded-2xl shadow-2xl border border-zinc-200 flex flex-col h-[94vh] max-h-[950px] overflow-hidden animate-in fade-in zoom-in-98 duration-150">

            {/* Modal Top Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between shrink-0 bg-white">
              <div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-0.5">
                  <span>ආයතන කළමනාකරණය</span>
                  <span>/</span>
                  <span className="text-emerald-700 font-medium">
                    {editingId ? 'සංස්කරණය (Edit)' : 'නව ලියාපදිංචිය (New Entry)'}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                  <span>{editingId ? (form.nameSi || form.nameEn || 'ආයතන තොරතුරු සංස්කරණය') : 'නව ආයතනයක් එක් කිරීම'}</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 font-normal rounded-full border border-emerald-200 flex items-center gap-1">
                    <Languages className="w-3 h-3" />
                    <span>සිංහල / English</span>
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Draft Badge */}
                {!editingId && restoredDraftTime && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>කෙටුම්පත ප්‍රතිසාධනය විය</span>
                  </span>
                )}

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                  title="වසන්න (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Left Sidebar + Right Content */}
            <div className="flex flex-1 overflow-hidden">

              {/* Left Navigation Sidebar */}
              <div className="w-72 border-r border-zinc-200 bg-zinc-50/60 p-3.5 flex flex-col justify-between shrink-0 overflow-y-auto hidden sm:flex">
                <div className="space-y-1">
                  <div className="px-3 py-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    පෝරමයේ අංශ (Sections)
                  </div>
                  {SECTIONS.map((sec) => {
                    const Icon = sec.icon;
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setActiveSection(sec.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-950 font-semibold border-l-2 border-emerald-600 shadow-2xs'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-zinc-400'}`} />
                          <span className="truncate">{sec.title}</span>
                        </div>
                        {sec.count !== null && sec.count > 0 && (
                          <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200/70 text-zinc-700'
                          }`}>
                            {sec.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Draft reset helper if draft exists */}
                {!editingId && restoredDraftTime && (
                  <div className="p-3 bg-zinc-100/80 rounded-xl border border-zinc-200 text-[11px] text-zinc-600 space-y-2">
                    <p className="leading-tight text-zinc-500">
                      ඔබේ පෙර දත්ත ස්වයංක්‍රීයව සුරැකී ඇත.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('සුරකින ලද කෙටුම්පත ඉවත් කිරීමට අවශ්‍යද?')) {
                          clearDraft(form.sector);
                          setForm({ ...defaultFormData, sector: activeTab });
                          setRestoredDraftTime(null);
                        }
                      }}
                      className="text-zinc-800 hover:text-red-600 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>කෙටුම්පත ඉවත් කරන්න</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Content Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">

                {/* Error Banner */}
                {validationError && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                    <button onClick={() => setValidationError(null)} className="text-red-400 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Mobile Section Dropdown */}
                <div className="sm:hidden mb-6">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    අංශය තෝරන්න (Select Section)
                  </label>
                  <select
                    value={activeSection}
                    onChange={(e) => setActiveSection(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium"
                  >
                    {SECTIONS.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.id}. {sec.title} {sec.count !== null ? `(${sec.count})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleSave} className="space-y-6">

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* SECTION 1: CLASSIFICATION & GENERAL */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  {activeSection === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-100">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          මූලික ආයතනික වර්ගීකරණය සහ නම් (General & Classification)
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          සිංහල හෝ ඉංග්‍රීසි භාෂාවලින් තොරතුරු ඇතුළත් කළ හැක. කිසිඳු ක්ෂේත්‍රයක් අනිවාර්ය නොවේ.
                        </p>
                      </div>

                      {/* Sector Switcher */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                          ආයතන අංශය (Sector)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSectorChange('gov')}
                            className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                              form.sector === 'gov'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                            }`}
                          >
                            <Landmark className="w-4 h-4 shrink-0" />
                            <div>
                              <p className="text-xs font-medium">රාජ්‍ය අංශය</p>
                              <p className={`text-[10px] ${form.sector === 'gov' ? 'text-emerald-100' : 'text-zinc-400'}`}>Government</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSectorChange('pvt')}
                            className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                              form.sector === 'pvt'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                            }`}
                          >
                            <Building2 className="w-4 h-4 shrink-0" />
                            <div>
                              <p className="text-xs font-medium">පුද්ගලික අංශය</p>
                              <p className={`text-[10px] ${form.sector === 'pvt' ? 'text-emerald-100' : 'text-zinc-400'}`}>Private Company</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSectorChange('intl')}
                            className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                              form.sector === 'intl'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                            }`}
                          >
                            <Globe2 className="w-4 h-4 shrink-0" />
                            <div>
                              <p className="text-xs font-medium">ජාත්‍යන්තර සංවිධාන</p>
                              <p className={`text-[10px] ${form.sector === 'intl' ? 'text-emerald-100' : 'text-zinc-400'}`}>International Bodies</p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Sector Specific Bilingual Properties */}
                      <div className="p-4 bg-zinc-50/70 rounded-xl border border-zinc-200/80 space-y-4">
                        {form.sector === 'gov' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  ආයතන වර්ගය (සිංහලෙන්)
                                </label>
                                <input
                                  type="text"
                                  value={form.institutionTypeSi}
                                  onChange={(e) => setForm({ ...form, institutionTypeSi: e.target.value, institutionType: e.target.value })}
                                  placeholder="උදා: රජයේ දෙපාර්තමේන්තුව / මණ්ඩලය"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  Institution Type (English)
                                </label>
                                <input
                                  type="text"
                                  value={form.institutionTypeEn}
                                  onChange={(e) => setForm({ ...form, institutionTypeEn: e.target.value })}
                                  placeholder="e.g. Government Department / Statutory Board"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  අයත් අමාත්‍යාංශය (සිංහලෙන්)
                                </label>
                                <input
                                  type="text"
                                  value={form.ministrySi}
                                  onChange={(e) => setForm({ ...form, ministrySi: e.target.value, ministry: e.target.value })}
                                  placeholder="උදා: කෘෂිකර්ම, පශු සම්පත්, ඉඩම් සහ වාරිමාර්ග අමාත්‍යාංශය"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  Ministry (English)
                                </label>
                                <input
                                  type="text"
                                  value={form.ministryEn}
                                  onChange={(e) => setForm({ ...form, ministryEn: e.target.value })}
                                  placeholder="e.g. Ministry of Agriculture, Livestock, Land and Irrigation"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {form.sector === 'pvt' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  සමාගම් වර්ගය (සිංහලෙන්)
                                </label>
                                <input
                                  type="text"
                                  value={form.legalEntityTypeSi}
                                  onChange={(e) => setForm({ ...form, legalEntityTypeSi: e.target.value, legalEntityType: e.target.value })}
                                  placeholder="උදා: සීමාසහිත පුද්ගලික සමාගම (Pvt Ltd)"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  Entity Type (English)
                                </label>
                                <input
                                  type="text"
                                  value={form.legalEntityTypeEn}
                                  onChange={(e) => setForm({ ...form, legalEntityTypeEn: e.target.value })}
                                  placeholder="e.g. Private Limited Company (Pvt Ltd) / Public PLC"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  මව් සමාගම / සමූහය (සිංහලෙන්)
                                </label>
                                <input
                                  type="text"
                                  value={form.parentConglomerateSi}
                                  onChange={(e) => setForm({ ...form, parentConglomerateSi: e.target.value, parentConglomerate: e.target.value })}
                                  placeholder="උදා: හේලීස් සමූහය / CIC Holdings"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  Parent Conglomerate (English)
                                </label>
                                <input
                                  type="text"
                                  value={form.parentConglomerateEn}
                                  onChange={(e) => setForm({ ...form, parentConglomerateEn: e.target.value })}
                                  placeholder="e.g. Hayleys Group / CIC Holdings"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {form.sector === 'intl' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  නියෝජිතායතන වර්ගය (සිංහලෙන්)
                                </label>
                                <input
                                  type="text"
                                  value={form.agencyCategorySi}
                                  onChange={(e) => setForm({ ...form, agencyCategorySi: e.target.value, agencyCategory: e.target.value })}
                                  placeholder="උදා: එක්සත් ජාතීන්ගේ සංවිධානය (UN)"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  Agency Category (English)
                                </label>
                                <input
                                  type="text"
                                  value={form.agencyCategoryEn}
                                  onChange={(e) => setForm({ ...form, agencyCategoryEn: e.target.value })}
                                  placeholder="e.g. United Nations Agency (UN) / Multilateral Development Bank"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  ගෝලීය මූලස්ථානය (සිංහලෙන්)
                                </label>
                                <input
                                  type="text"
                                  value={form.globalHQSi}
                                  onChange={(e) => setForm({ ...form, globalHQSi: e.target.value, globalHQ: e.target.value })}
                                  placeholder="උදා: රෝමය, ඉතාලිය"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  Global Headquarters (English)
                                </label>
                                <input
                                  type="text"
                                  value={form.globalHQEn}
                                  onChange={(e) => setForm({ ...form, globalHQEn: e.target.value })}
                                  placeholder="e.g. Rome, Italy / Geneva, Switzerland"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  ක්‍රියාත්මක වන රටවල් (සිංහලෙන්)
                                </label>
                                <input
                                  type="text"
                                  value={form.operatingCountriesSi}
                                  onChange={(e) => setForm({ ...form, operatingCountriesSi: e.target.value, operatingCountries: e.target.value })}
                                  placeholder="උදා: ලොව පුරා රටවල් 195 කට අධික"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  Operating Countries (English)
                                </label>
                                <input
                                  type="text"
                                  value={form.operatingCountriesEn}
                                  onChange={(e) => setForm({ ...form, operatingCountriesEn: e.target.value })}
                                  placeholder="e.g. In over 195 member countries worldwide"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  විෂය පථය (සිංහලෙන්)
                                </label>
                                <input
                                  type="text"
                                  value={form.thematicScopeSi}
                                  onChange={(e) => setForm({ ...form, thematicScopeSi: e.target.value, thematicScope: e.target.value })}
                                  placeholder="උදා: ආහාර සුරක්ෂිතතාව සහ පෝෂණය"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">
                                  Thematic Scope (English)
                                </label>
                                <input
                                  type="text"
                                  value={form.thematicScopeEn}
                                  onChange={(e) => setForm({ ...form, thematicScopeEn: e.target.value })}
                                  placeholder="e.g. Food security, nutrition & sustainable agriculture"
                                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bilingual Names */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            ආයතනයේ නම (සිංහලෙන්)
                          </label>
                          <input
                            type="text"
                            value={form.nameSi}
                            onChange={(e) => {
                              const newName = e.target.value;
                              if (!editingId && !form.nameEn && (!form.slug || form.slug === generateSlug(form.nameSi))) {
                                setForm({ ...form, nameSi: newName, slug: generateSlug(newName) });
                              } else {
                                setForm({ ...form, nameSi: newName });
                              }
                            }}
                            placeholder="උදා: ගොවිජන සංවර්ධන දෙපාර්තමේන්තුව"
                            className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            Institution Name (in English)
                          </label>
                          <input
                            type="text"
                            value={form.nameEn}
                            onChange={(e) => {
                              const newName = e.target.value;
                              if (!editingId && (!form.slug || form.slug === generateSlug(form.nameEn) || form.slug === generateSlug(form.nameSi))) {
                                setForm({ ...form, nameEn: newName, slug: generateSlug(newName || form.nameSi) });
                              } else {
                                setForm({ ...form, nameEn: newName });
                              }
                            }}
                            placeholder="e.g. Department of Agrarian Development"
                            className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                          />
                        </div>
                      </div>

                      {/* Bilingual Badge Text */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            ලාංඡන කෙටි පාඨය (සිංහලෙන්)
                          </label>
                          <input
                            type="text"
                            value={form.badgeTextSi}
                            onChange={(e) => setForm({ ...form, badgeTextSi: e.target.value, badgeText: e.target.value })}
                            placeholder="උදා: ජාතික කෘෂිකාර්මික අධිකාරිය"
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            Badge Text (English)
                          </label>
                          <input
                            type="text"
                            value={form.badgeTextEn}
                            onChange={(e) => setForm({ ...form, badgeTextEn: e.target.value })}
                            placeholder="e.g. National Agricultural Authority"
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                          />
                        </div>
                      </div>

                      {/* Slug & Order */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-zinc-700">
                              URL හැඳුනුම්කාරකය (Slug)
                            </label>
                            {(form.nameEn || form.nameSi) && (
                              <button
                                type="button"
                                onClick={() => setForm({ ...form, slug: generateSlug(form.nameEn || form.nameSi) })}
                                className="text-[10px] text-zinc-600 hover:text-zinc-900 font-medium underline cursor-pointer"
                              >
                                Auto Fill
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: generateSlug(e.target.value) })}
                            placeholder="e.g. agrarian-development"
                            className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-800"
                          />
                          <p className="text-[10px] text-zinc-400 mt-1 truncate">
                            URL: /institutions/{form.slug || 'slug'}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            පිළිවෙල (Display Order)
                          </label>
                          <input
                            type="number"
                            value={form.order}
                            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* SECTION 2: CONTACTS & ADDRESS */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  {activeSection === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-100">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          සම්බන්ධතා සහ ලිපින තොරතුරු (Contact & Addresses)
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          දුරකථන, විද්‍යුත් ලිපින සහ සිංහල/ඉංග්‍රීසි ලිපින ඇතුළත් කරන්න.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            ප්‍රධාන දුරකථන අංකය (Phone)
                          </label>
                          <div className="relative">
                            <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={form.phone}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                              placeholder="+94 11 258 0790"
                              className="w-full pl-8 pr-3 p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            ක්ෂණික ඇමතුම් / Hotline
                          </label>
                          <input
                            type="text"
                            value={form.shortCode || ''}
                            onChange={(e) => setForm({ ...form, shortCode: e.target.value })}
                            placeholder="උදා: 1920"
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            විද්‍යුත් ලිපිනය (Email)
                          </label>
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              placeholder="info@institution.gov.lk"
                              className="w-full pl-8 pr-3 p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bilingual Address Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            {form.sector === 'gov'
                              ? 'කාර්යාල ලිපිනය (සිංහලෙන්)'
                              : form.sector === 'pvt'
                                ? 'මූලස්ථාන ලිපිනය (සිංහලෙන්)'
                                : 'ශ්‍රී ලංකා මෙහෙයුම් ලිපිනය (සිංහලෙන්)'}
                          </label>
                          <div className="relative">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              value={
                                form.sector === 'gov'
                                  ? form.addressSi
                                  : form.sector === 'pvt'
                                    ? form.headquartersAddressSi
                                    : form.slMissionAddressSi
                              }
                              onChange={(e) => {
                                if (form.sector === 'gov') setForm({ ...form, addressSi: e.target.value, address: e.target.value });
                                else if (form.sector === 'pvt') setForm({ ...form, headquartersAddressSi: e.target.value, headquartersAddress: e.target.value });
                                else setForm({ ...form, slMissionAddressSi: e.target.value, slMissionAddress: e.target.value });
                              }}
                              placeholder="අංක 42, ශ්‍රීමත් මාකස් ප්‍රනාන්දු මාවත, කොළඹ 07"
                              className="w-full pl-8 pr-3 p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            {form.sector === 'gov'
                              ? 'Office Address (English)'
                              : form.sector === 'pvt'
                                ? 'Headquarters Address (English)'
                                : 'Sri Lanka Mission Address (English)'}
                          </label>
                          <div className="relative">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              value={
                                form.sector === 'gov'
                                  ? form.addressEn
                                  : form.sector === 'pvt'
                                    ? form.headquartersAddressEn
                                    : form.slMissionAddressEn
                              }
                              onChange={(e) => {
                                if (form.sector === 'gov') setForm({ ...form, addressEn: e.target.value });
                                else if (form.sector === 'pvt') setForm({ ...form, headquartersAddressEn: e.target.value });
                                else setForm({ ...form, slMissionAddressEn: e.target.value });
                              }}
                              placeholder="No. 42, Sir Marcus Fernando Mawatha, Colombo 07"
                              className="w-full pl-8 pr-3 p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* SECTION 3: DESCRIPTIONS */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  {activeSection === 3 && (
                    <div className="space-y-6 animate-in fade-in duration-100">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          හැඳින්වීම සහ සවිස්තර තොරතුරු (Descriptions)
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          සිංහල හෝ ඉංග්‍රීසි භාෂාවලින් ආයතන සාරාංශය සහ සම්පූර්ණ විස්තරය ඇතුළත් කරන්න.
                        </p>
                      </div>

                      {/* Bilingual Short Descriptions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            කෙටි හැඳින්වීම (සිංහලෙන් - Card Summary)
                          </label>
                          <textarea
                            rows={3}
                            value={form.descriptionSi}
                            onChange={(e) => setForm({ ...form, descriptionSi: e.target.value })}
                            placeholder="ආයතනය හෝ සංවිධානය පිළිබඳ ප්‍රධාන කාර්යය වචන 20-30කින් කෙටියෙන්..."
                            className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            Short Summary (in English - Card Summary)
                          </label>
                          <textarea
                            rows={3}
                            value={form.descriptionEn}
                            onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                            placeholder="Brief 20-30 words summary describing the key mandate of the organization..."
                            className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                          />
                        </div>
                      </div>

                      {/* Bilingual Full Descriptions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            සවිස්තර හැඳින්වීම (සිංහලෙන් - Full Profile)
                          </label>
                          <textarea
                            rows={7}
                            value={form.fullDescriptionSi}
                            onChange={(e) => setForm({ ...form, fullDescriptionSi: e.target.value })}
                            placeholder="ආයතනයේ මෙහෙවර, කාර්යභාරය, සහ ශ්‍රී ලංකාවේ ක්‍රියාත්මක වන ප්‍රධාන වැඩසටහන් පිළිබඳ සම්පූර්ණ විස්තරය..."
                            className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            Full Detailed Description (English Profile)
                          </label>
                          <textarea
                            rows={7}
                            value={form.fullDescriptionEn}
                            onChange={(e) => setForm({ ...form, fullDescriptionEn: e.target.value })}
                            placeholder="Full detailed profile of the organization, core agricultural programs, initiatives, and mandate in Sri Lanka..."
                            className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* SECTION 4: SERVICES & MANDATES */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  {activeSection === 4 && (
                    <div className="space-y-6 animate-in fade-in duration-100">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          {form.sector === 'gov'
                            ? 'ප්‍රධාන කාර්යභාරය සහ සේවාවන් (Mandates & Services)'
                            : form.sector === 'pvt'
                              ? 'නිෂ්පාදන විසඳුම් සහ සේවාවන් (Products & Services)'
                              : 'ප්‍රධාන ව්‍යාපෘති හා මැදිහත්වීම් (Interventions & Projects)'}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          ආයතනය විසින් සපයනු ලබන ප්‍රධාන සේවාවන් සිංහල සහ ඉංග්‍රීසි භාෂාවලින් එක් කරන්න.
                        </p>
                      </div>

                      <div className="p-3.5 bg-zinc-50/80 rounded-xl border border-zinc-200 space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={newServiceSi}
                            onChange={(e) => setNewServiceSi(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addService();
                              }
                            }}
                            placeholder="සේවාව (සිංහලෙන්)..."
                            className="p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900"
                          />
                          <input
                            type="text"
                            value={newServiceEn}
                            onChange={(e) => setNewServiceEn(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addService();
                              }
                            }}
                            placeholder="Service Title (English)..."
                            className="p-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={addService}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shrink-0 cursor-pointer transition-colors shadow-xs"
                          >
                            සේවාව එක් කරන්න (Add Service)
                          </button>
                        </div>
                      </div>

                      {form.services.length === 0 ? (
                        <div className="py-8 text-center border border-dashed border-zinc-200 rounded-lg text-zinc-400">
                          <p className="text-xs">තවමත් සේවාවන් කිසිවක් ඇතුළත් කර නොමැත.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg overflow-hidden bg-white">
                          {form.services.map((item, idx) => (
                            <div key={idx} className="p-2.5 px-3.5 flex items-center justify-between text-xs hover:bg-zinc-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-zinc-400 text-[11px] w-4">{idx + 1}.</span>
                                <div>
                                  <p className="font-medium text-zinc-900">{item.serviceSi || item.serviceEn}</p>
                                  {item.serviceEn && item.serviceSi && (
                                    <p className="text-[11px] text-zinc-400">{item.serviceEn}</p>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeService(idx)}
                                className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="ඉවත් කරන්න"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* SECTION 5: REGIONAL CENTERS */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  {activeSection === 5 && (
                    <div className="space-y-6 animate-in fade-in duration-100">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          {form.sector === 'gov'
                            ? 'ප්‍රාදේශීය කාර්යාල හා සේවා මධ්‍යස්ථාන'
                            : form.sector === 'pvt'
                              ? 'නියෝජිත හා අලෙවි ශාඛා ජාලය'
                              : 'ව්‍යාපෘති කලාපීය මධ්‍යස්ථාන'}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          දිස්ත්‍රික් කාර්යාල හෝ නියෝජිත මධ්‍යස්ථාන තොරතුරු ඇතුළත් කරන්න.
                        </p>
                      </div>

                      <div className="p-3.5 bg-zinc-50/80 rounded-xl border border-zinc-200 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={newCenter.nameSi}
                            onChange={(e) => setNewCenter({ ...newCenter, nameSi: e.target.value })}
                            placeholder="මධ්‍යස්ථානයේ නම (සිංහලෙන්)"
                            className="p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            value={newCenter.nameEn}
                            onChange={(e) => setNewCenter({ ...newCenter, nameEn: e.target.value })}
                            placeholder="Center Name (English)"
                            className="p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={newCenter.locationSi}
                            onChange={(e) => setNewCenter({ ...newCenter, locationSi: e.target.value })}
                            placeholder="ස්ථානය (උදා: මහනුවර)"
                            className="p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            value={newCenter.locationEn}
                            onChange={(e) => setNewCenter({ ...newCenter, locationEn: e.target.value })}
                            placeholder="Location (e.g. Kandy)"
                            className="p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            value={newCenter.phone}
                            onChange={(e) => setNewCenter({ ...newCenter, phone: e.target.value })}
                            placeholder="දුරකථන අංකය (Phone)"
                            className="p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={addRegionalCenter}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs"
                          >
                            මධ්‍යස්ථානය එක් කරන්න
                          </button>
                        </div>
                      </div>

                      {form.regionalCenters.length === 0 ? (
                        <div className="py-8 text-center border border-dashed border-zinc-200 rounded-lg text-zinc-400">
                          <p className="text-xs">ප්‍රාදේශීය මධ්‍යස්ථාන කිසිවක් ඇතුළත් කර නොමැත.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg overflow-hidden bg-white">
                          {form.regionalCenters.map((center, idx) => (
                            <div key={idx} className="p-2.5 px-3.5 flex items-center justify-between text-xs hover:bg-zinc-50 transition-colors">
                              <div className="grid grid-cols-3 gap-4 flex-1 text-zinc-800">
                                <div>
                                  <p className="font-medium text-zinc-900">{center.nameSi || center.nameEn || '-'}</p>
                                  {center.nameEn && center.nameSi && (
                                    <p className="text-[10px] text-zinc-400">{center.nameEn}</p>
                                  )}
                                </div>
                                <span className="text-zinc-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-zinc-400" />
                                  {center.locationSi || center.locationEn || '-'}
                                </span>
                                <span className="text-zinc-500 font-mono text-[11px]">{center.phone || '-'}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeRegionalCenter(idx)}
                                className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="ඉවත් කරන්න"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* SECTION 6: DOCUMENTS & FILES */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  {activeSection === 6 && (
                    <div className="space-y-6 animate-in fade-in duration-100">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          {form.sector === 'gov'
                            ? 'නිල PDF චක්‍රලේඛ, අයදුම්පත් හා මාර්ගෝපදේශ'
                            : form.sector === 'pvt'
                              ? 'නිෂ්පාදන නාමාවලි සහ තාක්ෂණික පත්‍රිකා'
                              : 'ජාත්‍යන්තර වාර්තා සහ ප්‍රතිපත්ති ලේඛන'}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          ගොවි ජනතාවට බාගත කරගත හැකි PDF ලේඛන මෙහි එක් කරන්න.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-50/80 rounded-xl border border-zinc-200 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-zinc-700 mb-1">
                              ලේඛනයේ නම (සිංහලෙන්)
                            </label>
                            <input
                              type="text"
                              value={newDoc.nameSi}
                              onChange={(e) => setNewDoc({ ...newDoc, nameSi: e.target.value })}
                              placeholder="ලේඛනයේ නම (සිංහලෙන්)"
                              className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-zinc-700 mb-1">
                              Document Title (English)
                            </label>
                            <input
                              type="text"
                              value={newDoc.nameEn}
                              onChange={(e) => setNewDoc({ ...newDoc, nameEn: e.target.value })}
                              placeholder="Document Title (English)"
                              className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-zinc-700 mb-1">
                              වර්ගීකරණය (Category)
                            </label>
                            <select
                              value={newDoc.categorySi}
                              onChange={(e) => setNewDoc({ ...newDoc, categorySi: e.target.value })}
                              className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                            >
                              <option value="අයදුම්පත්">අයදුම්පත් (Applications)</option>
                              <option value="චක්‍රලේඛ">චක්‍රලේඛ (Circulars)</option>
                              <option value="මාර්ගෝපදේශ">මාර්ගෝපදේශ (Guidelines)</option>
                              <option value="නාමාවලි">නාමාවලි (Catalogues)</option>
                              <option value="වාර්තා">වාර්තා (Reports)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-zinc-700 mb-1">
                              වර්ෂය (Year)
                            </label>
                            <input
                              type="text"
                              value={newDoc.year}
                              onChange={(e) => setNewDoc({ ...newDoc, year: e.target.value })}
                              placeholder="2026"
                              className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                          <input
                            ref={docFileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const autoName = file.name.replace(/\.[^/.]+$/, '');
                                setNewDoc((prev) => ({
                                  ...prev,
                                  file,
                                  nameSi: prev.nameSi.trim() ? prev.nameSi : autoName,
                                  nameEn: prev.nameEn.trim() ? prev.nameEn : autoName
                                }));
                              }
                            }}
                            className="text-xs w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-200 file:text-zinc-800 hover:file:bg-zinc-300 cursor-pointer"
                          />

                          <button
                            type="button"
                            onClick={addDocument}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shrink-0 cursor-pointer transition-colors shadow-xs"
                          >
                            ලේඛනය එක් කරන්න
                          </button>
                        </div>
                      </div>

                      {form.documents.length === 0 ? (
                        <div className="py-8 text-center border border-dashed border-zinc-200 rounded-lg text-zinc-400">
                          <p className="text-xs">තවමත් PDF ලේඛන කිසිවක් ඇතුළත් කර නොමැත.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg overflow-hidden bg-white">
                          {form.documents.map((doc, idx) => (
                            <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-zinc-50 transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                                <div className="truncate">
                                  <p className="font-medium text-zinc-900 truncate">{doc.nameSi || doc.nameEn || doc.name}</p>
                                  <p className="text-[11px] text-zinc-400">
                                    {doc.categorySi || doc.category || 'ලේඛනය'} • {doc.fileSize || 'PDF'}
                                    {doc.file && <span className="ml-2 text-emerald-700 font-medium">(Ready to upload)</span>}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {doc.fileUrl && !doc.file && (
                                  <a
                                    href={doc.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded transition-colors"
                                    title="View"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeDocument(idx)}
                                  className="p-1.5 text-zinc-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                                  title="Remove"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* SECTION 7: LOGO & MEDIA LINKS */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  {activeSection === 7 && (
                    <div className="space-y-6 animate-in fade-in duration-100">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          ආයතනික ලාංඡනය සහ ඩිජිටල් සබැඳි (Logo & Media)
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          නිල ලාංඡනය (Logo) සහ සමාජ මාධ්‍ය සබැඳි ඇතුළත් කරන්න.
                        </p>
                      </div>

                      {/* Logo Box */}
                      <div className="p-4 bg-zinc-50/80 rounded-xl border border-zinc-200">
                        <label className="block text-xs font-medium text-zinc-700 mb-2">
                          ආයතනික ලාංඡනය (Logo)
                        </label>
                        <div className="flex items-center gap-4">
                          {logoPreview ? (
                            <div className="relative w-16 h-16 rounded-lg border border-zinc-200 bg-white p-1 overflow-hidden shrink-0">
                              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => {
                                  setLogoFile(null);
                                  setLogoPreview(null);
                                  setRemoveLogoFlag(true);
                                  if (logoFileInputRef.current) logoFileInputRef.current.value = '';
                                }}
                                className="absolute top-0.5 right-0.5 bg-zinc-800 text-white rounded p-0.5 hover:bg-red-600 transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg border border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 bg-white shrink-0">
                              <ImageIcon className="w-5 h-5 text-zinc-300" />
                            </div>
                          )}

                          <input
                            ref={logoFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setLogoFile(file);
                                setLogoPreview(URL.createObjectURL(file));
                                setRemoveLogoFlag(false);
                              }
                            }}
                            className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-200 file:text-zinc-800 hover:file:bg-zinc-300 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Social Links Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            නිල වෙබ් අඩවිය (Website URL)
                          </label>
                          <input
                            type="url"
                            value={form.website || ''}
                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                            placeholder="https://www.example.gov.lk"
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            Facebook පිටුව
                          </label>
                          <input
                            type="url"
                            value={form.facebookUrl || ''}
                            onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                            placeholder="https://www.facebook.com/example"
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            YouTube චැනලය
                          </label>
                          <input
                            type="url"
                            value={form.youtubeUrl || ''}
                            onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                            placeholder="https://www.youtube.com/@example"
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-1">
                            TikTok ගිණුම
                          </label>
                          <input
                            type="url"
                            value={form.tiktokUrl || ''}
                            onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
                            placeholder="https://www.tiktok.com/@example"
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="px-6 py-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
              <div className="text-xs text-zinc-500 font-medium">
                {activeSection > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveSection((prev) => Math.max(1, prev - 1))}
                    className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 font-medium cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>පෙර පියවර</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {activeSection < 7 && (
                  <button
                    type="button"
                    onClick={() => setActiveSection((prev) => Math.min(7, prev + 1))}
                    className="px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-medium transition-colors text-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>ඊළඟ පියවර</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors text-xs cursor-pointer"
                >
                  අවලංගු කරන්න
                </button>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all shadow-sm inline-flex items-center gap-2 text-xs disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>සුරැකෙමින් පවතී...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingId ? 'වෙනස්කම් සුරකින්න' : 'ආයතනය සුරකින්න'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
