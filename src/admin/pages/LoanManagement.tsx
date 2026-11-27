import { useState, useEffect, useRef } from 'react';
import {
  Landmark,
  Layers,
  Users,
  GitBranch,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  X,
  Upload,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Paperclip,
  Check,
  Building,
  Coins,
  Image as ImageIcon
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import { useConfirm } from '../components/ConfirmDialog';
import SEO from '../../components/common/SEO';
import RichTextEditor from '../components/RichTextEditor';
import { sanitizeHtml } from '../../utils/sanitize';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
  return {
    Authorization: `Bearer ${token}`,
  };
};

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

// ==========================================
// TYPES
// ==========================================

export interface LoanSector {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  imageUrl?: string | null;
  _count?: { loans: number };
}

export interface LoanTargetBeneficiary {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  imageUrl?: string | null;
  _count?: { loans: number };
}

export interface LoanMainBranch {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  imageUrl?: string | null;
  subCategories?: LoanSubCategory[];
  _count?: { loans: number; subCategories: number };
}

export interface LoanSubCategory {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  imageUrl?: string | null;
  mainBranchId: string;
  mainBranch?: LoanMainBranch;
  _count?: { loans: number };
}

export interface LoanPdfType {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  imageUrl?: string | null;
  _count?: { attachments: number };
}

export interface LoanPdfAttachment {
  id: string;
  slug: string;
  loanId: string;
  pdfTypeId: string;
  name: string;
  fileSize?: string | null;
  fileUrl: string;
  pdfType?: LoanPdfType;
  createdAt?: string;
}

export interface StagedAttachment {
  id: string;
  name: string;
  pdfTypeId: string;
  pdfTypeName: string;
  file: File | null;
  fileUrl: string;
  fileSize?: string;
}

export interface Loan {
  id: string;
  slug: string;
  institutionName: string;
  ministryOrParentOrg?: string | null;
  programNameSi: string;
  programNameEn?: string | null;
  sectorId: string;
  targetBeneficiaryId: string;
  mainBranchId: string;
  subCategoryId: string;
  maxLoanAmount?: string | null;
  annualInterestRate?: string | null;
  repaymentPeriod?: string | null;
  gracePeriod?: string | null;
  benefitOrValue?: string | null;
  benefitOrValueSi?: string | null;
  benefitOrValueEn?: string | null;
  institutionContribution?: number | null;
  farmerContribution?: number | null;
  logoBadgeUrl?: string | null;
  coverBannerUrl?: string | null;
  closingDate?: string | null;
  isOngoing: boolean;
  isActive: boolean;
  eligibilityCriteria?: string | null;
  eligibilityCriteriaSi?: string | null;
  eligibilityCriteriaEn?: string | null;
  requiredDocuments?: string | null;
  requiredDocumentsSi?: string | null;
  requiredDocumentsEn?: string | null;
  howToApply?: string | null;
  howToApplySi?: string | null;
  howToApplyEn?: string | null;
  hotline?: string | null;
  email?: string | null;
  website?: string | null;
  authorityAddress?: string | null;
  userId?: string | null;
  sector?: LoanSector;
  targetBeneficiary?: LoanTargetBeneficiary;
  mainBranch?: LoanMainBranch;
  subCategory?: LoanSubCategory;
  pdfAttachments?: LoanPdfAttachment[];
  createdAt?: string;
  updatedAt?: string;
}

type ViewTab = 'loans' | 'sectors' | 'beneficiaries' | 'branches' | 'pdfTypes';

export default function LoanManagement() {
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<ViewTab>('loans');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ── DATA LISTS ──
  const [loans, setLoans] = useState<Loan[]>([]);
  const [sectors, setSectors] = useState<LoanSector[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<LoanTargetBeneficiary[]>([]);
  const [mainBranches, setMainBranches] = useState<LoanMainBranch[]>([]);
  const [subCategories, setSubCategories] = useState<LoanSubCategory[]>([]);
  const [pdfTypes, setPdfTypes] = useState<LoanPdfType[]>([]);

  // ── LOAN FILTERS & PAGINATION ──
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [beneficiaryFilter, setBeneficiaryFilter] = useState('all');
  const [mainBranchFilter, setMainBranchFilter] = useState('all');
  const [ongoingFilter, setOngoingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ── MODAL STATES ──
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [viewingLoan, setViewingLoan] = useState<Loan | null>(null);

  // ── PDF ATTACHMENTS MODAL ──
  const [attachmentLoan, setAttachmentLoan] = useState<Loan | null>(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentPdfTypeId, setAttachmentPdfTypeId] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentFileUrl, setAttachmentFileUrl] = useState('');
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  // ── TAXONOMY MODAL STATE ──
  const [taxonomyModalType, setTaxonomyModalType] = useState<'sector' | 'beneficiary' | 'branch' | 'subCategory' | 'pdfType' | null>(null);
  const [editingTaxonomyItem, setEditingTaxonomyItem] = useState<any>(null);
  const [taxonomyNameSi, setTaxonomyNameSi] = useState('');
  const [taxonomyNameEn, setTaxonomyNameEn] = useState('');
  const [taxonomySlug, setTaxonomySlug] = useState('');
  const [taxonomyParentBranchId, setTaxonomyParentBranchId] = useState('');
  const [taxonomyImageUrl, setTaxonomyImageUrl] = useState('');
  const [taxonomyImageFile, setTaxonomyImageFile] = useState<File | null>(null);
  const [taxonomyRemoveImage, setTaxonomyRemoveImage] = useState(false);
  const fileInputRefTaxonomyImage = useRef<HTMLInputElement>(null);

  // ── LOAN FORM STATE ──
  const [formInstitutionName, setFormInstitutionName] = useState('');
  const [formMinistryOrParentOrg, setFormMinistryOrParentOrg] = useState('');
  const [formProgramNameSi, setFormProgramNameSi] = useState('');
  const [formProgramNameEn, setFormProgramNameEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSectorId, setFormSectorId] = useState('');
  const [formTargetBeneficiaryId, setFormTargetBeneficiaryId] = useState('');
  const [formMainBranchId, setFormMainBranchId] = useState('');
  const [formSubCategoryId, setFormSubCategoryId] = useState('');
  const [formMaxLoanAmount, setFormMaxLoanAmount] = useState('');
  const [formAnnualInterestRate, setFormAnnualInterestRate] = useState('');
  const [formRepaymentPeriod, setFormRepaymentPeriod] = useState('');
  const [formGracePeriod, setFormGracePeriod] = useState('');
  const [formBenefitOrValue, setFormBenefitOrValue] = useState('');
  const [formInstitutionContribution, setFormInstitutionContribution] = useState('100');
  const [formFarmerContribution, setFormFarmerContribution] = useState('0');
  const [formClosingDate, setFormClosingDate] = useState('');
  const [formIsOngoing, setFormIsOngoing] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formEligibilityCriteriaSi, setFormEligibilityCriteriaSi] = useState('');
  const [formEligibilityCriteriaEn, setFormEligibilityCriteriaEn] = useState('');
  const [formRequiredDocumentsSi, setFormRequiredDocumentsSi] = useState('');
  const [formRequiredDocumentsEn, setFormRequiredDocumentsEn] = useState('');
  const [formHowToApplySi, setFormHowToApplySi] = useState('');
  const [formHowToApplyEn, setFormHowToApplyEn] = useState('');
  const [activeGuidelineLang, setActiveGuidelineLang] = useState<'si' | 'en' | 'all'>('si');
  const [formHotline, setFormHotline] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formAuthorityAddress, setFormAuthorityAddress] = useState('');
  const [formLogoBadgeUrl, setFormLogoBadgeUrl] = useState('');
  const [formCoverBannerUrl, setFormCoverBannerUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── INLINE & STAGED PDF ATTACHMENTS STATE (INSIDE LOAN MODAL) ──
  const [stagedAttachments, setStagedAttachments] = useState<StagedAttachment[]>([]);
  const [inlineAttName, setInlineAttName] = useState('');
  const [inlineAttPdfTypeId, setInlineAttPdfTypeId] = useState('');
  const [inlineAttFile, setInlineAttFile] = useState<File | null>(null);
  const [inlineAttFileUrl, setInlineAttFileUrl] = useState('');
  const [isUploadingInlineAtt, setIsUploadingInlineAtt] = useState(false);
  const fileInputRefInlineAtt = useRef<HTMLInputElement>(null);

  const fileInputRefLogo = useRef<HTMLInputElement>(null);
  const fileInputRefBanner = useRef<HTMLInputElement>(null);
  const fileInputRefAttachment = useRef<HTMLInputElement>(null);

  // Auto-hide alerts
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Load all lookups once
  useEffect(() => {
    fetchLookups();
  }, []);

  // Fetch loans when filters or page changes
  useEffect(() => {
    if (activeTab === 'loans') {
      fetchLoans();
    }
  }, [activeTab, currentPage, search, sectorFilter, beneficiaryFilter, mainBranchFilter, ongoingFilter]);

  const fetchLookups = async () => {
    try {
      const [secRes, benRes, branchRes, subRes, pdfRes] = await Promise.all([
        fetch(`${API_BASE_URL}/loans/sectors`),
        fetch(`${API_BASE_URL}/loans/target-beneficiaries`),
        fetch(`${API_BASE_URL}/loans/main-branches`),
        fetch(`${API_BASE_URL}/loans/sub-categories`),
        fetch(`${API_BASE_URL}/loans/pdf-types`)
      ]);

      if (secRes.ok) {
        const d = await secRes.json();
        setSectors(d.data || d.items || []);
      }
      if (benRes.ok) {
        const d = await benRes.json();
        setBeneficiaries(d.data || d.items || []);
      }
      if (branchRes.ok) {
        const d = await branchRes.json();
        setMainBranches(d.data || d.items || []);
      }
      if (subRes.ok) {
        const d = await subRes.json();
        setSubCategories(d.data || d.items || []);
      }
      if (pdfRes.ok) {
        const d = await pdfRes.json();
        setPdfTypes(d.data || d.items || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch loan taxonomy:', err);
    }
  };

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '15',
        sort: 'createdAt',
        order: 'desc'
      });
      if (search.trim()) params.append('search', search.trim());
      if (sectorFilter !== 'all') params.append('sectorId', sectorFilter);
      if (beneficiaryFilter !== 'all') params.append('targetBeneficiaryId', beneficiaryFilter);
      if (mainBranchFilter !== 'all') params.append('mainBranchId', mainBranchFilter);
      if (ongoingFilter !== 'all') params.append('isOngoing', ongoingFilter);

      const res = await fetch(`${API_BASE_URL}/loans?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch loans');
      const json = await res.json();
      const list = json.data || json.items || [];
      setLoans(list);
      if (json.pagination) {
        setTotalPages(json.pagination.totalPages || 1);
        setTotalCount(json.pagination.total || 0);
      } else {
        setTotalCount(list.length);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading loan schemes');
    } finally {
      setIsLoading(false);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingLoan(null);
    setFormInstitutionName('');
    setFormMinistryOrParentOrg('');
    setFormProgramNameSi('');
    setFormProgramNameEn('');
    setFormSlug('');
    setFormSectorId(sectors[0]?.id || '');
    setFormTargetBeneficiaryId(beneficiaries[0]?.id || '');
    setFormMainBranchId(mainBranches[0]?.id || '');
    const firstSub = subCategories.find(s => s.mainBranchId === (mainBranches[0]?.id || ''));
    setFormSubCategoryId(firstSub?.id || subCategories[0]?.id || '');
    setFormMaxLoanAmount('');
    setFormAnnualInterestRate('');
    setFormRepaymentPeriod('');
    setFormGracePeriod('');
    setFormBenefitOrValue('');
    setFormInstitutionContribution('100');
    setFormFarmerContribution('0');
    setFormClosingDate('');
    setFormIsOngoing(false);
    setFormIsActive(true);
    setFormEligibilityCriteriaSi('');
    setFormEligibilityCriteriaEn('');
    setFormRequiredDocumentsSi('');
    setFormRequiredDocumentsEn('');
    setFormHowToApplySi('');
    setFormHowToApplyEn('');
    setActiveGuidelineLang('si');
    setFormHotline('');
    setFormEmail('');
    setFormWebsite('');
    setFormAuthorityAddress('');
    setFormLogoBadgeUrl('');
    setFormCoverBannerUrl('');
    setLogoFile(null);
    setBannerFile(null);
    setRemoveLogo(false);
    setRemoveBanner(false);
    if (fileInputRefLogo.current) fileInputRefLogo.current.value = '';
    if (fileInputRefBanner.current) fileInputRefBanner.current.value = '';
    setStagedAttachments([]);
    setInlineAttName('');
    setInlineAttPdfTypeId(pdfTypes[0]?.id || '');
    setInlineAttFile(null);
    setInlineAttFileUrl('');
    if (fileInputRefInlineAtt.current) fileInputRefInlineAtt.current.value = '';
    setShowLoanModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (loan: Loan) => {
    setEditingLoan(loan);
    setFormInstitutionName(loan.institutionName || '');
    setFormMinistryOrParentOrg(loan.ministryOrParentOrg || '');
    setFormProgramNameSi(loan.programNameSi || '');
    setFormProgramNameEn(loan.programNameEn || '');
    setFormSlug(loan.slug || '');
    setFormSectorId(loan.sectorId || '');
    setFormTargetBeneficiaryId(loan.targetBeneficiaryId || '');
    setFormMainBranchId(loan.mainBranchId || '');
    setFormSubCategoryId(loan.subCategoryId || '');
    setFormMaxLoanAmount(loan.maxLoanAmount || '');
    setFormAnnualInterestRate(loan.annualInterestRate || '');
    setFormRepaymentPeriod(loan.repaymentPeriod || '');
    setFormGracePeriod(loan.gracePeriod || '');
    setFormBenefitOrValue(loan.benefitOrValue || loan.benefitOrValueSi || loan.benefitOrValueEn || '');
    setFormInstitutionContribution(loan.institutionContribution !== undefined && loan.institutionContribution !== null ? String(loan.institutionContribution) : '100');
    setFormFarmerContribution(loan.farmerContribution !== undefined && loan.farmerContribution !== null ? String(loan.farmerContribution) : '0');
    setFormClosingDate(loan.closingDate ? loan.closingDate.substring(0, 10) : '');
    setFormIsOngoing(Boolean(loan.isOngoing));
    setFormIsActive(loan.isActive !== undefined ? Boolean(loan.isActive) : true);
    setFormEligibilityCriteriaSi(loan.eligibilityCriteriaSi || loan.eligibilityCriteria || '');
    setFormEligibilityCriteriaEn(loan.eligibilityCriteriaEn || '');
    setFormRequiredDocumentsSi(loan.requiredDocumentsSi || loan.requiredDocuments || '');
    setFormRequiredDocumentsEn(loan.requiredDocumentsEn || '');
    setFormHowToApplySi(loan.howToApplySi || loan.howToApply || '');
    setFormHowToApplyEn(loan.howToApplyEn || '');
    setActiveGuidelineLang(loan.eligibilityCriteriaSi || loan.requiredDocumentsSi || loan.howToApplySi ? 'si' : (loan.eligibilityCriteriaEn || loan.requiredDocumentsEn || loan.howToApplyEn ? 'en' : 'si'));
    setFormHotline(loan.hotline || '');
    setFormEmail(loan.email || '');
    setFormWebsite(loan.website || '');
    setFormAuthorityAddress(loan.authorityAddress || '');
    setFormLogoBadgeUrl(loan.logoBadgeUrl || '');
    setFormCoverBannerUrl(loan.coverBannerUrl || '');
    setLogoFile(null);
    setBannerFile(null);
    setRemoveLogo(false);
    setRemoveBanner(false);
    if (fileInputRefLogo.current) fileInputRefLogo.current.value = '';
    if (fileInputRefBanner.current) fileInputRefBanner.current.value = '';
    setStagedAttachments([]);
    setInlineAttName('');
    setInlineAttPdfTypeId(pdfTypes[0]?.id || '');
    setInlineAttFile(null);
    setInlineAttFileUrl('');
    if (fileInputRefInlineAtt.current) fileInputRefInlineAtt.current.value = '';
    setShowLoanModal(true);
  };

  // Image remove handlers
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setFormLogoBadgeUrl('');
    setRemoveLogo(true);
    if (fileInputRefLogo.current) fileInputRefLogo.current.value = '';
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setFormCoverBannerUrl('');
    setRemoveBanner(true);
    if (fileInputRefBanner.current) fileInputRefBanner.current.value = '';
  };

  // ── INLINE ATTACHMENT HANDLERS (INSIDE LOAN CREATE/EDIT MODAL) ──
  const handleAddInlineDocument = async () => {
    if (!inlineAttName.trim()) {
      setErrorMsg('Please enter a title for the PDF document');
      return;
    }
    if (!inlineAttFile && !inlineAttFileUrl.trim()) {
      setErrorMsg('Please select a PDF file or provide a direct file URL');
      return;
    }

    const typeId = inlineAttPdfTypeId || (pdfTypes[0]?.id || '');

    if (editingLoan) {
      setIsUploadingInlineAtt(true);
      try {
        const formData = new FormData();
        formData.append('name', inlineAttName.trim());
        formData.append('pdfTypeId', typeId);
        if (inlineAttFile) formData.append('file', inlineAttFile);
        if (inlineAttFileUrl) formData.append('fileUrl', inlineAttFileUrl.trim());

        const res = await fetch(`${API_BASE_URL}/loans/${editingLoan.id}/attachments`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to attach document');

        const newAtt: LoanPdfAttachment = data.data || data.attachment;
        const updatedAttachments = [...(editingLoan.pdfAttachments || []), newAtt];
        const updatedLoan = { ...editingLoan, pdfAttachments: updatedAttachments };
        setEditingLoan(updatedLoan);
        setLoans(prev => prev.map(l => l.id === updatedLoan.id ? updatedLoan : l));
        setSuccessMsg('PDF document attached successfully');

        setInlineAttName('');
        setInlineAttFile(null);
        setInlineAttFileUrl('');
        if (fileInputRefInlineAtt.current) fileInputRefInlineAtt.current.value = '';
      } catch (err: any) {
        setErrorMsg(err.message || 'Error attaching document');
      } finally {
        setIsUploadingInlineAtt(false);
      }
    } else {
      const selectedType = pdfTypes.find(t => t.id === typeId);
      const newStaged: StagedAttachment = {
        id: `staged-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: inlineAttName.trim(),
        pdfTypeId: typeId,
        pdfTypeName: selectedType?.nameEn || selectedType?.nameSi || 'Document',
        file: inlineAttFile,
        fileUrl: inlineAttFileUrl.trim(),
        fileSize: inlineAttFile ? `${(inlineAttFile.size / 1024).toFixed(1)} KB` : (inlineAttFileUrl ? 'Link' : '—')
      };
      setStagedAttachments(prev => [...prev, newStaged]);
      setInlineAttName('');
      setInlineAttFile(null);
      setInlineAttFileUrl('');
      if (fileInputRefInlineAtt.current) fileInputRefInlineAtt.current.value = '';
    }
  };

  const handleRemoveStagedDocument = (tempId: string) => {
    setStagedAttachments(prev => prev.filter(a => a.id !== tempId));
  };

  const handleDeleteInlineAttachment = async (attachmentId: string, name: string) => {
    const confirmed = await confirm({
      title: 'Delete Document?',
      message: `Are you sure you want to delete "${name}"?`,
      confirmText: 'Delete File',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/loans/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete attachment');

      setSuccessMsg('Document deleted successfully');
      if (editingLoan) {
        const updatedAttachments = editingLoan.pdfAttachments?.filter(a => a.id !== attachmentId) || [];
        const updated = { ...editingLoan, pdfAttachments: updatedAttachments };
        setEditingLoan(updated);
        setLoans(prev => prev.map(l => l.id === updated.id ? updated : l));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting file');
    }
  };

  // Submit Loan (Create or Edit)
  const handleSubmitLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const slugToSend = formSlug.trim() || generateSlug(formProgramNameEn || formProgramNameSi);
    if (!slugToSend) {
      setErrorMsg('Slug is required. Please provide a slug.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('institutionName', formInstitutionName.trim());
      formData.append('ministryOrParentOrg', formMinistryOrParentOrg.trim());
      formData.append('programNameSi', formProgramNameSi.trim());
      formData.append('programNameEn', formProgramNameEn.trim());
      formData.append('slug', slugToSend);
      formData.append('sectorId', formSectorId);
      formData.append('targetBeneficiaryId', formTargetBeneficiaryId);
      formData.append('mainBranchId', formMainBranchId);
      formData.append('subCategoryId', formSubCategoryId);
      formData.append('maxLoanAmount', formMaxLoanAmount.trim());
      formData.append('annualInterestRate', formAnnualInterestRate.trim());
      formData.append('repaymentPeriod', formRepaymentPeriod.trim());
      formData.append('gracePeriod', formGracePeriod.trim());
      formData.append('benefitOrValue', formBenefitOrValue.trim());
      formData.append('benefitOrValueSi', formBenefitOrValue.trim());
      formData.append('institutionContribution', formInstitutionContribution.trim());
      formData.append('farmerContribution', formFarmerContribution.trim());
      if (formClosingDate) formData.append('closingDate', formClosingDate);
      formData.append('isOngoing', String(formIsOngoing));
      formData.append('isActive', String(formIsActive));
      formData.append('eligibilityCriteriaSi', formEligibilityCriteriaSi);
      formData.append('eligibilityCriteriaEn', formEligibilityCriteriaEn);
      formData.append('eligibilityCriteria', formEligibilityCriteriaSi || formEligibilityCriteriaEn);
      formData.append('requiredDocumentsSi', formRequiredDocumentsSi);
      formData.append('requiredDocumentsEn', formRequiredDocumentsEn);
      formData.append('requiredDocuments', formRequiredDocumentsSi || formRequiredDocumentsEn);
      formData.append('howToApplySi', formHowToApplySi);
      formData.append('howToApplyEn', formHowToApplyEn);
      formData.append('howToApply', formHowToApplySi || formHowToApplyEn);
      formData.append('hotline', formHotline.trim());
      formData.append('email', formEmail.trim());
      formData.append('website', formWebsite.trim());
      formData.append('authorityAddress', formAuthorityAddress.trim());

      if (removeLogo || (!formLogoBadgeUrl && !logoFile)) {
        formData.append('removeLogo', 'true');
      } else if (formLogoBadgeUrl) {
        formData.append('logoBadgeUrl', formLogoBadgeUrl);
      }
      if (logoFile) formData.append('logoBadge', logoFile);

      if (removeBanner || (!formCoverBannerUrl && !bannerFile)) {
        formData.append('removeBanner', 'true');
      } else if (formCoverBannerUrl) {
        formData.append('coverBannerUrl', formCoverBannerUrl);
      }
      if (bannerFile) formData.append('coverBanner', bannerFile);

      const url = editingLoan ? `${API_BASE_URL}/loans/${editingLoan.id}` : `${API_BASE_URL}/loans`;
      const method = editingLoan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save loan scheme');

      const createdLoan = data.loan || data.data;
      if (!editingLoan && createdLoan?.id && stagedAttachments.length > 0) {
        for (const att of stagedAttachments) {
          try {
            const attFormData = new FormData();
            attFormData.append('name', att.name);
            attFormData.append('pdfTypeId', att.pdfTypeId);
            if (att.file) attFormData.append('file', att.file);
            if (att.fileUrl) attFormData.append('fileUrl', att.fileUrl);

            await fetch(`${API_BASE_URL}/loans/${createdLoan.id}/attachments`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: attFormData
            });
          } catch (attErr) {
            console.error('Error uploading staged PDF attachment:', attErr);
          }
        }
      }

      setSuccessMsg(editingLoan ? 'Loan scheme updated successfully' : 'Loan scheme created successfully');
      setShowLoanModal(false);
      fetchLoans();
      fetchLookups();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving loan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (loan: Loan) => {
    try {
      const res = await fetch(`${API_BASE_URL}/loans/${loan.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      setLoans(prev => prev.map(l => l.id === loan.id ? { ...l, isActive: !l.isActive } : l));
      setSuccessMsg(`Status updated for ${loan.programNameEn || loan.programNameSi}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating status');
    }
  };

  // Delete Loan
  const handleDeleteLoan = async (loan: Loan) => {
    const confirmed = await confirm({
      title: 'Delete Loan Scheme?',
      message: `Are you sure you want to permanently delete "${loan.programNameEn || loan.programNameSi}"? All attached PDFs will also be deleted.`,
      confirmText: 'Delete Loan',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/loans/${loan.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete loan scheme');
      setSuccessMsg('Loan scheme deleted successfully');
      fetchLoans();
      fetchLookups();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting loan scheme');
    }
  };

  // ── ATTACHMENT MANAGEMENT ──
  const handleOpenAttachments = (loan: Loan) => {
    setAttachmentLoan(loan);
    setAttachmentName('');
    setAttachmentPdfTypeId(pdfTypes[0]?.id || '');
    setAttachmentFile(null);
    setAttachmentFileUrl('');
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentLoan) return;
    if (!attachmentName.trim() || !attachmentPdfTypeId) {
      setErrorMsg('Attachment title and document type are required');
      return;
    }
    if (!attachmentFile && !attachmentFileUrl.trim()) {
      setErrorMsg('Please select a file or provide a file URL');
      return;
    }

    setIsUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append('name', attachmentName.trim());
      formData.append('pdfTypeId', attachmentPdfTypeId);
      if (attachmentFile) formData.append('file', attachmentFile);
      if (attachmentFileUrl.trim()) formData.append('fileUrl', attachmentFileUrl.trim());

      const res = await fetch(`${API_BASE_URL}/loans/${attachmentLoan.id}/attachments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add attachment');

      setSuccessMsg('PDF attachment added successfully');
      setAttachmentName('');
      setAttachmentFile(null);
      setAttachmentFileUrl('');
      if (fileInputRefAttachment.current) fileInputRefAttachment.current.value = '';

      // Refresh single loan attachments
      const refreshRes = await fetch(`${API_BASE_URL}/loans/${attachmentLoan.id}`);
      if (refreshRes.ok) {
        const fresh = await refreshRes.json();
        const freshLoan = fresh.data || fresh.loan;
        setAttachmentLoan(freshLoan);
        setLoans(prev => prev.map(l => l.id === freshLoan.id ? freshLoan : l));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading attachment');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!attachmentLoan) return;
    const confirmed = await confirm({
      title: 'Delete Attachment?',
      message: 'Are you sure you want to delete this PDF document?',
      confirmText: 'Delete Document',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/loans/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete attachment');
      setSuccessMsg('Attachment removed');

      // Refresh
      const refreshRes = await fetch(`${API_BASE_URL}/loans/${attachmentLoan.id}`);
      if (refreshRes.ok) {
        const fresh = await refreshRes.json();
        const freshLoan = fresh.data || fresh.loan;
        setAttachmentLoan(freshLoan);
        setLoans(prev => prev.map(l => l.id === freshLoan.id ? freshLoan : l));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting attachment');
    }
  };

  // ── TAXONOMY CRUD HANDLERS ──
  const handleOpenCreateTaxonomy = (type: 'sector' | 'beneficiary' | 'branch' | 'subCategory' | 'pdfType') => {
    setTaxonomyModalType(type);
    setEditingTaxonomyItem(null);
    setTaxonomyNameSi('');
    setTaxonomyNameEn('');
    setTaxonomySlug('');
    setTaxonomyParentBranchId(mainBranches[0]?.id || '');
    setTaxonomyImageUrl('');
    setTaxonomyImageFile(null);
    setTaxonomyRemoveImage(false);
    if (fileInputRefTaxonomyImage.current) fileInputRefTaxonomyImage.current.value = '';
  };

  const handleOpenEditTaxonomy = (type: 'sector' | 'beneficiary' | 'branch' | 'subCategory' | 'pdfType', item: any) => {
    setTaxonomyModalType(type);
    setEditingTaxonomyItem(item);
    setTaxonomyNameSi(item.nameSi || '');
    setTaxonomyNameEn(item.nameEn || '');
    setTaxonomySlug(item.slug || '');
    setTaxonomyParentBranchId(item.mainBranchId || mainBranches[0]?.id || '');
    setTaxonomyImageUrl(item.imageUrl || '');
    setTaxonomyImageFile(null);
    setTaxonomyRemoveImage(false);
    if (fileInputRefTaxonomyImage.current) fileInputRefTaxonomyImage.current.value = '';
  };

  const handleSaveTaxonomy = async (e: React.FormEvent) => {
    e.preventDefault();
    const slugToSend = taxonomySlug.trim() || generateSlug(taxonomyNameEn || taxonomyNameSi);
    if (!slugToSend) {
      setErrorMsg('Slug is required. Please provide a slug.');
      return;
    }

    let endpoint = '';
    if (taxonomyModalType === 'sector') endpoint = 'sectors';
    else if (taxonomyModalType === 'beneficiary') endpoint = 'target-beneficiaries';
    else if (taxonomyModalType === 'branch') endpoint = 'main-branches';
    else if (taxonomyModalType === 'subCategory') endpoint = 'sub-categories';
    else if (taxonomyModalType === 'pdfType') endpoint = 'pdf-types';

    const formData = new FormData();
    formData.append('slug', slugToSend);
    if (taxonomyNameSi.trim()) formData.append('nameSi', taxonomyNameSi.trim());
    if (taxonomyNameEn.trim()) formData.append('nameEn', taxonomyNameEn.trim());
    if (taxonomyModalType === 'subCategory' && taxonomyParentBranchId) {
      formData.append('mainBranchId', taxonomyParentBranchId);
    }

    if (taxonomyImageFile) {
      formData.append('image', taxonomyImageFile);
    } else if (taxonomyRemoveImage || (!taxonomyImageUrl && editingTaxonomyItem?.imageUrl)) {
      formData.append('removeImage', 'true');
    } else if (taxonomyImageUrl.trim()) {
      formData.append('imageUrl', taxonomyImageUrl.trim());
    }

    const url = editingTaxonomyItem
      ? `${API_BASE_URL}/loans/${endpoint}/${editingTaxonomyItem.id}`
      : `${API_BASE_URL}/loans/${endpoint}`;
    const method = editingTaxonomyItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save item');

      setSuccessMsg('Record saved successfully');
      setTaxonomyModalType(null);
      fetchLookups();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving taxonomy');
    }
  };

  const handleDeleteTaxonomy = async (type: 'sector' | 'beneficiary' | 'branch' | 'subCategory' | 'pdfType', item: any) => {
    let endpoint = '';
    if (type === 'sector') endpoint = 'sectors';
    else if (type === 'beneficiary') endpoint = 'target-beneficiaries';
    else if (type === 'branch') endpoint = 'main-branches';
    else if (type === 'subCategory') endpoint = 'sub-categories';
    else if (type === 'pdfType') endpoint = 'pdf-types';

    const confirmed = await confirm({
      title: 'Delete Category / Record?',
      message: `Are you sure you want to delete "${item.nameEn}" (${item.nameSi})?`,
      confirmText: 'Delete',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/loans/${endpoint}/${item.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete record');
      setSuccessMsg('Record deleted successfully');
      fetchLookups();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting record');
    }
  };

  // Filtered sub-categories when mainBranch is chosen in loan modal
  const modalAvailableSubCategories = subCategories.filter(s => s.mainBranchId === formMainBranchId);

  return (
    <div className="space-y-4">
      <SEO title="Loan Schemes Management | Aswanna Admin" noindex={true} />

      {/* ── ALERTS ── */}
      {successMsg && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs shadow-xs animate-in fade-in">
          <CheckCircle size={15} className="text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs shadow-xs animate-in fade-in">
          <AlertCircle size={15} className="text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* ── TOP HEADER & ACTIONS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Landmark size={18} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Agricultural Loan Schemes
              </h1>
              <p className="text-[11px] text-gray-500 font-medium">
                Manage bank loans, interest concessions, grants, and credit facilities
              </p>
            </div>
          </div>
        </div>

        {/* Action Button depending on Active Tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'loans' && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006837] hover:bg-[#00532c] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Loan Scheme</span>
            </button>
          )}
          {activeTab === 'sectors' && (
            <button
              onClick={() => handleOpenCreateTaxonomy('sector')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006837] hover:bg-[#00532c] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Sector</span>
            </button>
          )}
          {activeTab === 'beneficiaries' && (
            <button
              onClick={() => handleOpenCreateTaxonomy('beneficiary')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006837] hover:bg-[#00532c] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Target Beneficiary</span>
            </button>
          )}
          {activeTab === 'branches' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenCreateTaxonomy('branch')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#006837] hover:bg-[#00532c] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>New Main Branch</span>
              </button>
              <button
                onClick={() => handleOpenCreateTaxonomy('subCategory')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>New Sub Category</span>
              </button>
            </div>
          )}
          {activeTab === 'pdfTypes' && (
            <button
              onClick={() => handleOpenCreateTaxonomy('pdfType')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006837] hover:bg-[#00532c] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add PDF Type</span>
            </button>
          )}
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-2 py-1 rounded-lg text-xs overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('loans')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${activeTab === 'loans'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <Landmark size={14} />
          <span>Loan Schemes</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-gray-200/80 rounded-full font-mono text-gray-700">
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sectors')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${activeTab === 'sectors'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <Layers size={14} />
          <span>Sectors</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-gray-200/80 rounded-full font-mono text-gray-700">
            {sectors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('beneficiaries')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${activeTab === 'beneficiaries'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <Users size={14} />
          <span>Target Beneficiaries</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-gray-200/80 rounded-full font-mono text-gray-700">
            {beneficiaries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${activeTab === 'branches'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <GitBranch size={14} />
          <span>Branches & Sub Categories</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-gray-200/80 rounded-full font-mono text-gray-700">
            {mainBranches.length} / {subCategories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pdfTypes')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${activeTab === 'pdfTypes'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <FileText size={14} />
          <span>PDF Doc Types</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-gray-200/80 rounded-full font-mono text-gray-700">
            {pdfTypes.length}
          </span>
        </button>
      </div>


      {/* ── TAB 1: LOAN SCHEMES (MAIN ULTRA-COMPACT TABLE) ── */}

      {activeTab === 'loans' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-xs">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search program, bank, or limit..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-800 focus:outline-emerald-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sectorFilter}
                onChange={e => setSectorFilter(e.target.value)}
                className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-700 focus:outline-emerald-500 cursor-pointer"
              >
                <option value="all">All Sectors</option>
                {sectors.map(s => (
                  <option key={s.id} value={s.id}>{s.nameEn}</option>
                ))}
              </select>

              <select
                value={beneficiaryFilter}
                onChange={e => setBeneficiaryFilter(e.target.value)}
                className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-700 focus:outline-emerald-500 cursor-pointer"
              >
                <option value="all">All Beneficiaries</option>
                {beneficiaries.map(b => (
                  <option key={b.id} value={b.id}>{b.nameEn}</option>
                ))}
              </select>

              <select
                value={mainBranchFilter}
                onChange={e => setMainBranchFilter(e.target.value)}
                className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-700 focus:outline-emerald-500 cursor-pointer"
              >
                <option value="all">All Branches</option>
                {mainBranches.map(mb => (
                  <option key={mb.id} value={mb.id}>{mb.nameEn}</option>
                ))}
              </select>

              <select
                value={ongoingFilter}
                onChange={e => setOngoingFilter(e.target.value)}
                className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-700 focus:outline-emerald-500 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="true">Ongoing</option>
                <option value="false">Has Deadline</option>
              </select>

              {(search || sectorFilter !== 'all' || beneficiaryFilter !== 'all' || mainBranchFilter !== 'all' || ongoingFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSectorFilter('all');
                    setBeneficiaryFilter('all');
                    setMainBranchFilter('all');
                    setOngoingFilter('all');
                  }}
                  className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded"
                  title="Reset filters"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Table Container - Ultra-Compact Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Scheme / Program
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Institution / Authority
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Sector & Beneficiary
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Max Amount & Rate
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Docs
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Status
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span>Loading loan schemes...</span>
                      </div>
                    </td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                      No loan schemes found matching criteria.
                    </td>
                  </tr>
                ) : (
                  loans.map(loan => (
                    <tr key={loan.id} className="hover:bg-emerald-50/30 transition-colors">
                      {/* Scheme / Program with Thumbnail */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-2 max-w-[280px]">
                          {loan.logoBadgeUrl ? (
                            <img
                              src={loan.logoBadgeUrl}
                              alt=""
                              className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                              <Coins size={14} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate text-xs" title={loan.programNameEn || loan.programNameSi}>
                              {loan.programNameSi}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono truncate" title={loan.slug}>
                              {loan.programNameEn || loan.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Institution / Authority */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="max-w-[200px]">
                          <div className="font-semibold text-gray-800 truncate text-xs" title={loan.institutionName}>
                            {loan.institutionName}
                          </div>
                          {loan.ministryOrParentOrg && (
                            <div className="text-[10px] text-gray-400 truncate" title={loan.ministryOrParentOrg}>
                              {loan.ministryOrParentOrg}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Sector & Beneficiary */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5 max-w-[160px]">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 truncate inline-block">
                            {loan.sector?.nameEn || 'Sector'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700 truncate inline-block">
                            {loan.targetBeneficiary?.nameEn || 'Beneficiary'}
                          </span>
                        </div>
                      </td>

                      {/* Max Amount & Rate */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div>
                          <div className="font-semibold text-gray-900 text-xs font-mono">
                            {loan.maxLoanAmount || 'N/A'}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-medium">
                            {loan.annualInterestRate ? `Rate: ${loan.annualInterestRate}` : (loan.repaymentPeriod ? `Period: ${loan.repaymentPeriod}` : '—')}
                          </div>
                        </div>
                      </td>

                      {/* Attachments */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenAttachments(loan)}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                          title="Click to view/add attachments"
                        >
                          <Paperclip size={11} />
                          <span>{loan.pdfAttachments?.length || 0} PDFs</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(loan)}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 cursor-pointer transition-colors ${loan.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                              }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${loan.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            {loan.isActive ? 'Active' : 'Draft'}
                          </button>
                          {loan.isOngoing ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200">
                              Ongoing
                            </span>
                          ) : loan.closingDate ? (
                            <span className="text-[10px] text-gray-400 font-mono">
                              Till {new Date(loan.closingDate).toLocaleDateString()}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setViewingLoan(loan)}
                            className="p-1 hover:bg-gray-100 text-gray-600 rounded transition-colors cursor-pointer"
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(loan)}
                            className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition-colors cursor-pointer"
                            title="Edit loan"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteLoan(loan)}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                            title="Delete loan"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-gray-200 flex justify-end">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={p => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}


      {/* ── TAB 2: SECTORS ── */}

      {activeTab === 'sectors' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200 w-10">
                    Image
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Sector Name (English)
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Sector Name (Sinhala)
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Slug
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Linked Schemes
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sectors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                      No loan sectors added yet.
                    </td>
                  </tr>
                ) : (
                  sectors.map(sec => (
                    <tr key={sec.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {sec.imageUrl ? (
                          <img
                            src={sec.imageUrl}
                            alt=""
                            className="w-6 h-6 rounded object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                            <ImageIcon size={12} />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-1.5 font-semibold text-gray-900 truncate">
                        {sec.nameEn}
                      </td>
                      <td className="px-3 py-1.5 text-gray-700 truncate">
                        {sec.nameSi}
                      </td>
                      <td className="px-3 py-1.5 text-[10px] text-gray-400 font-mono truncate">
                        {sec.slug}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800">
                          {sec._count?.loans || 0} schemes
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditTaxonomy('sector', sec)}
                          className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition-colors cursor-pointer mr-1"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTaxonomy('sector', sec)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* ── TAB 3: TARGET BENEFICIARIES ── */}

      {activeTab === 'beneficiaries' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200 w-10">
                    Image
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Beneficiary Name (English)
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Beneficiary Name (Sinhala)
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Slug
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Linked Schemes
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {beneficiaries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                      No target beneficiaries added yet.
                    </td>
                  </tr>
                ) : (
                  beneficiaries.map(ben => (
                    <tr key={ben.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {ben.imageUrl ? (
                          <img
                            src={ben.imageUrl}
                            alt=""
                            className="w-6 h-6 rounded object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                            <ImageIcon size={12} />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-1.5 font-semibold text-gray-900 truncate">
                        {ben.nameEn}
                      </td>
                      <td className="px-3 py-1.5 text-gray-700 truncate">
                        {ben.nameSi}
                      </td>
                      <td className="px-3 py-1.5 text-[10px] text-gray-400 font-mono truncate">
                        {ben.slug}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800">
                          {ben._count?.loans || 0} schemes
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditTaxonomy('beneficiary', ben)}
                          className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition-colors cursor-pointer mr-1"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTaxonomy('beneficiary', ben)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* ── TAB 4: BRANCHES & SUB CATEGORIES ── */}

      {activeTab === 'branches' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Main Branches Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
              <span className="font-bold text-xs text-gray-800">Main Branches</span>
              <span className="text-[10px] text-gray-400">{mainBranches.length} Total</span>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200 w-10">Image</th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">Name (EN / SI)</th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">Subs</th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mainBranches.map(branch => (
                    <tr key={branch.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {branch.imageUrl ? (
                          <img
                            src={branch.imageUrl}
                            alt=""
                            className="w-6 h-6 rounded object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                            <ImageIcon size={12} />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="font-semibold text-gray-900 truncate text-xs">{branch.nameEn}</div>
                        <div className="text-[10px] text-gray-400 truncate">{branch.nameSi}</div>
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-700">
                          {branch.subCategories?.length || branch._count?.subCategories || 0}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleOpenEditTaxonomy('branch', branch)}
                          className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition-colors cursor-pointer mr-1"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTaxonomy('branch', branch)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub Categories Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
              <span className="font-bold text-xs text-gray-800">Sub Categories</span>
              <span className="text-[10px] text-gray-400">{subCategories.length} Total</span>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200 w-10">Image</th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">Sub Category</th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">Main Branch</th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subCategories.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {sub.imageUrl ? (
                          <img
                            src={sub.imageUrl}
                            alt=""
                            className="w-6 h-6 rounded object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                            <ImageIcon size={12} />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="font-semibold text-gray-900 truncate text-xs">{sub.nameEn}</div>
                        <div className="text-[10px] text-gray-400 truncate">{sub.nameSi}</div>
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-800">
                          {sub.mainBranch?.nameEn || 'Branch'}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleOpenEditTaxonomy('subCategory', sub)}
                          className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition-colors cursor-pointer mr-1"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTaxonomy('subCategory', sub)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ── TAB 5: PDF DOC TYPES ── */}

      {activeTab === 'pdfTypes' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200 w-10">
                    Image
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    PDF Type Name (English)
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    PDF Type Name (Sinhala)
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Slug
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200">
                    Attached Files
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap bg-gray-50/90 border-b border-gray-200 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pdfTypes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                      No PDF types added yet (e.g. "Application Form", "Concession Gazette", "Guideline Booklet").
                    </td>
                  </tr>
                ) : (
                  pdfTypes.map(pt => (
                    <tr key={pt.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {pt.imageUrl ? (
                          <img
                            src={pt.imageUrl}
                            alt=""
                            className="w-6 h-6 rounded object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                            <ImageIcon size={12} />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-1.5 font-semibold text-gray-900 truncate">
                        {pt.nameEn}
                      </td>
                      <td className="px-3 py-1.5 text-gray-700 truncate">
                        {pt.nameSi}
                      </td>
                      <td className="px-3 py-1.5 text-[10px] text-gray-400 font-mono truncate">
                        {pt.slug}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700">
                          {pt._count?.attachments || 0} files
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditTaxonomy('pdfType', pt)}
                          className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition-colors cursor-pointer mr-1"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTaxonomy('pdfType', pt)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* ── MODAL: CREATE / EDIT LOAN SCHEME ── */}

      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Landmark size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    {editingLoan ? 'Edit Loan Scheme' : 'Add New Agricultural Loan Scheme'}
                  </h2>
                  <p className="text-[10px] text-gray-500 font-medium">
                    Configure loan facility details, categories, interest rates, and application guidelines
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLoanModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200/60"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitLoan} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Section 1: Basic Scheme & Institution Info */}
              <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50/40 space-y-3">
                <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                  <Building size={14} className="text-emerald-600" />
                  <span>1. Institution & Program Identity</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Bank / Institution Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bank of Ceylon / People's Bank / Regional Development Bank"
                      value={formInstitutionName}
                      onChange={e => setFormInstitutionName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Ministry or Parent Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ministry of Agriculture / Central Bank of Sri Lanka"
                      value={formMinistryOrParentOrg}
                      onChange={e => setFormMinistryOrParentOrg(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Program Name (Sinhala)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. නව කෘෂිකාර්මික ණය යෝජනා ක්‍රමය"
                      value={formProgramNameSi}
                      onChange={e => setFormProgramNameSi(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Program Name (English)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. New Comprehensive Rural Credit Scheme (NCRCS)"
                      value={formProgramNameEn}
                      onChange={e => {
                        const englishName = e.target.value;
                        setFormProgramNameEn(englishName);
                        // Auto-generate slug from English name on the frontend
                        setFormSlug(generateSlug(englishName));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                      URL Slug (Auto-generated from English Name - Editable) <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[10px] text-gray-500 mb-1">
                      Slug is generated from the English name above. You can customize or change it anytime.
                    </p>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ncrcs-agricultural-loan"
                      value={formSlug}
                      onChange={e => setFormSlug(generateSlug(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-800 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Taxonomy & Categories */}
              <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50/40 space-y-3">
                <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                  <Layers size={14} className="text-emerald-600" />
                  <span>2. Sector & Target Beneficiary Mapping</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Sector
                    </label>
                    <select
                      value={formSectorId}
                      onChange={e => setFormSectorId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">Select Sector (Optional)</option>
                      {sectors.map(s => (
                        <option key={s.id} value={s.id}>{s.nameEn} ({s.nameSi})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Target Beneficiary
                    </label>
                    <select
                      value={formTargetBeneficiaryId}
                      onChange={e => setFormTargetBeneficiaryId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">Select Beneficiary (Optional)</option>
                      {beneficiaries.map(b => (
                        <option key={b.id} value={b.id}>{b.nameEn} ({b.nameSi})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      1. ප්‍රධාන අංශය (Main Branch) *
                    </label>
                    <select
                      value={formMainBranchId}
                      onChange={e => {
                        const newBranch = e.target.value;
                        setFormMainBranchId(newBranch);
                        const firstSub = subCategories.find(s => s.mainBranchId === newBranch);
                        setFormSubCategoryId(firstSub?.id || '');
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">ප්‍රධාන අංශය තෝරන්න (Select Main Branch)</option>
                      {mainBranches.map((mb, idx) => (
                        <option key={mb.id} value={mb.id}>
                          {mb.nameSi ? `${idx + 1}. ${mb.nameSi} (${mb.nameEn})` : mb.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      2. උප වර්ගීකරණය (Sub-Category) *
                    </label>
                    <select
                      value={formSubCategoryId}
                      onChange={e => setFormSubCategoryId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">උප වර්ගීකරණය තෝරන්න (Select Sub Category)</option>
                      {modalAvailableSubCategories.map(sc => (
                        <option key={sc.id} value={sc.id}>
                          {sc.nameSi ? `${sc.nameSi} (${sc.nameEn})` : sc.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Section 3: Loans vs Material Support / Grants */}
              {(() => {
                const currentSubCat = subCategories.find(s => s.id === formSubCategoryId);
                const isLoanSection = !currentSubCat || currentSubCat.slug === 'loans' || currentSubCat.nameEn?.toLowerCase() === 'loans';

                return isLoanSection ? (
                  <div className="border border-blue-200 rounded-xl p-3.5 bg-blue-50/20 space-y-3">
                    <div className="font-bold text-blue-900 text-xs flex items-center gap-1.5 border-b border-blue-100 pb-1.5">
                      <Building size={14} className="text-blue-700" />
                      <span>🏛️ ණය පහසුකම් සතු විස්තර</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          උපරිම ණය මුදල (Max Loan)
                        </label>
                        <input
                          type="text"
                          placeholder="උදා: රු. 5,000,000"
                          value={formMaxLoanAmount}
                          onChange={e => setFormMaxLoanAmount(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          වාර්ෂික පොලී අනුපාතිකය
                        </label>
                        <input
                          type="text"
                          placeholder="උදා: 6.5%"
                          value={formAnnualInterestRate}
                          onChange={e => setFormAnnualInterestRate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          ආපසු ගෙවීමේ කාලය
                        </label>
                        <input
                          type="text"
                          placeholder="උදා: වසර 5ක්"
                          value={formRepaymentPeriod}
                          onChange={e => setFormRepaymentPeriod(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          සහන කාලය (Grace Period)
                        </label>
                        <input
                          type="text"
                          placeholder="උදා: මාස 6ක්"
                          value={formGracePeriod}
                          onChange={e => setFormGracePeriod(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-amber-200 rounded-xl p-3.5 bg-amber-50/20 space-y-3">
                    <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5 border-b border-amber-100 pb-1.5">
                      <span>🎁 ආධාර / ප්‍රදාන සහ ද්‍රව්‍යමය පංගු විස්තර</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          ලබා දෙන ප්‍රතිලාභය / වටිනාකම
                        </label>
                        <input
                          type="text"
                          placeholder="උදා: නොමිලේ පැල 50ක් / රු. ලක්ෂ 25 ප්‍රදානය"
                          value={formBenefitOrValue}
                          onChange={e => setFormBenefitOrValue(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          ආයතනයේ දායකත්වය (%)
                        </label>
                        <input
                          type="number"
                          placeholder="100"
                          value={formInstitutionContribution}
                          onChange={e => setFormInstitutionContribution(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          ගොවියාගේ දායකත්වය (%)
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={formFarmerContribution}
                          onChange={e => setFormFarmerContribution(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Deadlines & Status */}
              <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/40">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Closing Date
                    </label>
                    <input
                      type="date"
                      value={formClosingDate}
                      onChange={e => setFormClosingDate(e.target.value)}
                      disabled={formIsOngoing}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>

                  <div className="flex items-center gap-4 sm:col-span-2 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formIsOngoing}
                        onChange={e => {
                          setFormIsOngoing(e.target.checked);
                          if (e.target.checked) setFormClosingDate('');
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-gray-800">
                        Ongoing Facility (නොකඩවා ක්‍රියාත්මක වන වැඩසටහනකි)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={e => setFormIsActive(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-gray-800">
                        Publish / Active Status
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 4: Imagery & Badges (Multipart Uploads or URLs) */}
              <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50/40 space-y-3">
                <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                  <Upload size={14} className="text-emerald-600" />
                  <span>4. Imagery, Institution Logo & Cover Banner</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Logo Badge */}
                  <div className="border border-gray-200 bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-gray-700">
                        Bank / Scheme Logo Badge
                      </label>
                      {(logoFile || formLogoBadgeUrl) && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="inline-flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 transition-colors cursor-pointer"
                          title="Remove logo image"
                        >
                          <Trash2 size={11} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {logoFile ? (
                        <div className="w-12 h-12 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center font-bold text-[9px] shrink-0 text-center p-1">
                          <span className="truncate max-w-[44px]">{logoFile.name}</span>
                          <span className="text-[8px] text-emerald-600">Selected</span>
                        </div>
                      ) : formLogoBadgeUrl ? (
                        <img
                          src={formLogoBadgeUrl}
                          alt=""
                          className="w-12 h-12 rounded object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                          <Coins size={20} />
                        </div>
                      )}
                      <div className="flex-1 space-y-1.5">
                        <input
                          ref={fileInputRefLogo}
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setLogoFile(e.target.files[0]);
                              setRemoveLogo(false);
                            }
                          }}
                          className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder="Or direct Logo URL..."
                          value={formLogoBadgeUrl}
                          onChange={e => {
                            setFormLogoBadgeUrl(e.target.value);
                            if (e.target.value) setRemoveLogo(false);
                          }}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-[11px] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cover Banner */}
                  <div className="border border-gray-200 bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-gray-700">
                        Cover Banner Image
                      </label>
                      {(bannerFile || formCoverBannerUrl) && (
                        <button
                          type="button"
                          onClick={handleRemoveBanner}
                          className="inline-flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 transition-colors cursor-pointer"
                          title="Remove cover banner"
                        >
                          <Trash2 size={11} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {bannerFile ? (
                        <div className="w-12 h-12 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center font-bold text-[9px] shrink-0 text-center p-1">
                          <span className="truncate max-w-[44px]">{bannerFile.name}</span>
                          <span className="text-[8px] text-emerald-600">Selected</span>
                        </div>
                      ) : formCoverBannerUrl ? (
                        <img
                          src={formCoverBannerUrl}
                          alt=""
                          className="w-12 h-12 rounded object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                          <Upload size={20} />
                        </div>
                      )}
                      <div className="flex-1 space-y-1.5">
                        <input
                          ref={fileInputRefBanner}
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setBannerFile(e.target.files[0]);
                              setRemoveBanner(false);
                            }
                          }}
                          className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder="Or direct Banner URL..."
                          value={formCoverBannerUrl}
                          onChange={e => {
                            setFormCoverBannerUrl(e.target.value);
                            if (e.target.value) setRemoveBanner(false);
                          }}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-[11px] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Guidelines, Eligibility & Application */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/40 space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-2.5 gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs">
                    <FileText size={15} className="text-emerald-600" />
                    <span>5. Eligibility Criteria, Required Documents & How to Apply</span>
                  </div>

                  {/* Language Tab Switcher */}
                  <div className="flex items-center gap-1 bg-gray-200/70 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setActiveGuidelineLang('si')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeGuidelineLang === 'si'
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span>🇱🇰 සිංහල (Sinhala)</span>
                      {(formEligibilityCriteriaSi || formRequiredDocumentsSi || formHowToApplySi) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveGuidelineLang('en')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeGuidelineLang === 'en'
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span>🇬🇧 English</span>
                      {(formEligibilityCriteriaEn || formRequiredDocumentsEn || formHowToApplyEn) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveGuidelineLang('all')}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        activeGuidelineLang === 'all'
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="View both Sinhala and English editors"
                    >
                      <span>Both (දෙකම)</span>
                    </button>
                  </div>
                </div>

                {/* 1. Eligibility Criteria */}
                <div className="space-y-3">
                  {(activeGuidelineLang === 'si' || activeGuidelineLang === 'all') && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                          <span>Eligibility Criteria (සුදුසුකම්)</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">සිංහල</span>
                        </label>
                      </div>
                      <RichTextEditor
                        value={formEligibilityCriteriaSi}
                        onChange={setFormEligibilityCriteriaSi}
                        placeholder="e.g. ශ්‍රී ලාංකික පුරවැසියෙකු වීම, වයස අවුරුදු 18 සම්පූර්ණ වී තිබීම, කෘෂිකාර්මික ඉඩමක් සතුව පැවතීම..."
                        minHeight="140px"
                      />
                    </div>
                  )}

                  {(activeGuidelineLang === 'en' || activeGuidelineLang === 'all') && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                          <span>Eligibility Criteria</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">English</span>
                        </label>
                      </div>
                      <RichTextEditor
                        value={formEligibilityCriteriaEn}
                        onChange={setFormEligibilityCriteriaEn}
                        placeholder="e.g. Must be a citizen of Sri Lanka, aged 18 or above, possessing agricultural land..."
                        minHeight="140px"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Required Documents */}
                <div className="space-y-3 pt-1">
                  {(activeGuidelineLang === 'si' || activeGuidelineLang === 'all') && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                          <span>Required Documents (අවශ්‍ය ලියකියවිලි)</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">සිංහල</span>
                        </label>
                      </div>
                      <RichTextEditor
                        value={formRequiredDocumentsSi}
                        onChange={setFormRequiredDocumentsSi}
                        placeholder="e.g. ජාතික හැඳුනුම්පත් පිටපතක්, ඉඩම් ඔප්පුවේ සහතික කළ පිටපතක්, වගා සැලැස්ම හෝ ව්‍යාපාර වාර්තාව..."
                        minHeight="140px"
                      />
                    </div>
                  )}

                  {(activeGuidelineLang === 'en' || activeGuidelineLang === 'all') && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                          <span>Required Documents</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">English</span>
                        </label>
                      </div>
                      <RichTextEditor
                        value={formRequiredDocumentsEn}
                        onChange={setFormRequiredDocumentsEn}
                        placeholder="e.g. Copy of National Identity Card (NIC), certified land deed copy, crop cultivation plan or business report..."
                        minHeight="140px"
                      />
                    </div>
                  )}
                </div>

                {/* 3. How to Apply */}
                <div className="space-y-3 pt-1">
                  {(activeGuidelineLang === 'si' || activeGuidelineLang === 'all') && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                          <span>How to Apply (අයදුම් කරන ආකාරය)</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">සිංහල</span>
                        </label>
                      </div>
                      <RichTextEditor
                        value={formHowToApplySi}
                        onChange={setFormHowToApplySi}
                        placeholder="e.g. ළඟම පිහිටි ලංකා බැංකු ශාඛාවට හෝ ගොවිජන සේවා මධ්‍යස්ථානයේ කෘෂිකර්ම පර්යේෂණ නිෂ්පාදන සහකාර මුණගැසෙන්න..."
                        minHeight="140px"
                      />
                    </div>
                  )}

                  {(activeGuidelineLang === 'en' || activeGuidelineLang === 'all') && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                          <span>How to Apply</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">English</span>
                        </label>
                      </div>
                      <RichTextEditor
                        value={formHowToApplyEn}
                        onChange={setFormHowToApplyEn}
                        placeholder="e.g. Visit the nearest Bank of Ceylon branch or contact the Agricultural Research & Production Assistant at your Agrarian Services Centre..."
                        minHeight="140px"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 6: Official Contacts & Authority */}
              <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50/40 space-y-3">
                <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                  <Users size={14} className="text-emerald-600" />
                  <span>6. Official Contacts & Location Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Hotline / Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1920 / 011-2868920"
                      value={formHotline}
                      onChange={e => setFormHotline(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. loans@agrimin.gov.lk"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Official Website / Portal Link
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://www.boc.lk/agricultural-credit"
                      value={formWebsite}
                      onChange={e => setFormWebsite(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Authority Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 'Govijana Mandiraya', Rajamalwatta Road, Battaramulla"
                      value={formAuthorityAddress}
                      onChange={e => setFormAuthorityAddress(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 7: Associated PDF Documents (Creation & Editing) */}
              <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50/40 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                  <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                    <Paperclip size={14} className="text-emerald-600" />
                    <span>
                      7. අදාළ PDF ලේඛන සහ බාගැනීම් (PDF Documents & Attachments)
                      {editingLoan 
                        ? ` (${editingLoan.pdfAttachments?.length || 0})` 
                        : ` (${stagedAttachments.length})`}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-normal">
                    {editingLoan 
                      ? 'වෙනම ස්ථාන වලට නොගොස් මෙතැනින්ම PDF එකතු කරන්න හෝ ඉවත් කරන්න' 
                      : 'ණය ක්‍රමය Create කිරීමත් සමඟම මෙම PDF ගොනු එක් වේ'}
                  </span>
                </div>

                {/* Inline Add Document Form */}
                <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2.5">
                  <div className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                    <Plus size={13} className="text-emerald-600" />
                    <span>අලුත් PDF ලේඛනයක් එක් කරන්න (Add New PDF Document)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">
                        ලේඛනයේ නම (Document Title) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. අයදුම්පත / Application Form (Sinhala)"
                        value={inlineAttName}
                        onChange={e => setInlineAttName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">
                        ලේඛන වර්ගය (Document Category) *
                      </label>
                      <select
                        value={inlineAttPdfTypeId || (pdfTypes[0]?.id || '')}
                        onChange={e => setInlineAttPdfTypeId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                      >
                        {pdfTypes.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.nameEn} {t.nameSi ? `(${t.nameSi})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">
                        PDF ගොනුව තෝරන්න (Select PDF File)
                      </label>
                      <input
                        type="file"
                        ref={fileInputRefInlineAtt}
                        accept="application/pdf,.pdf"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setInlineAttFile(e.target.files[0]);
                            if (!inlineAttName.trim()) {
                              const cleanName = e.target.files[0].name.replace(/\.[^/.]+$/, '');
                              setInlineAttName(cleanName);
                            }
                          }
                        }}
                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">
                        හෝ Direct File URL (විකල්ප)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://example.com/document.pdf"
                          value={inlineAttFileUrl}
                          onChange={e => setInlineAttFileUrl(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={handleAddInlineDocument}
                          disabled={isUploadingInlineAtt}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-xs transition-colors"
                        >
                          {isUploadingInlineAtt ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Plus size={13} />
                          )}
                          <span>{editingLoan ? 'Upload & Add' : '+ Add to Loan'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table of PDF Documents */}
                {editingLoan ? (
                  /* Editing mode: show real attachments */
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-50/90 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">Document Title</th>
                          <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">Category</th>
                          <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">Size</th>
                          <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {!editingLoan.pdfAttachments || editingLoan.pdfAttachments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-3 py-4 text-center text-gray-400 text-xs">
                              තවමත් PDF ලේඛන එකතු කර නොමැත.
                            </td>
                          </tr>
                        ) : (
                          editingLoan.pdfAttachments.map(att => (
                            <tr key={att.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="px-3 py-1.5 font-semibold text-gray-900 truncate max-w-[220px]" title={att.name}>
                                {att.name}
                              </td>
                              <td className="px-3 py-1.5 whitespace-nowrap">
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  {att.pdfType?.nameEn || 'Document'}
                                </span>
                              </td>
                              <td className="px-3 py-1.5 text-gray-500 font-mono text-[10px] whitespace-nowrap">
                                {att.fileSize || '—'}
                              </td>
                              <td className="px-3 py-1.5 text-right whitespace-nowrap">
                                <a
                                  href={att.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-gray-100 text-blue-600 rounded transition-colors inline-block mr-1"
                                  title="Open PDF"
                                >
                                  <ExternalLink size={14} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInlineAttachment(att.id, att.name)}
                                  className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                                  title="Delete document"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Create mode: show staged attachments */
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-50/90 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">Document Title</th>
                          <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">Category</th>
                          <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">File / Source</th>
                          <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {stagedAttachments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-3 py-4 text-center text-gray-400 text-xs">
                              තවමත් PDF ලේඛන එකතු කර නොමැත. ඉහතින් Document Title එක සහ PDF file එක තෝරා "+ Add to Loan" ක්ලික් කරන්න.
                            </td>
                          </tr>
                        ) : (
                          stagedAttachments.map(staged => (
                            <tr key={staged.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="px-3 py-1.5 font-semibold text-gray-900 truncate max-w-[220px]" title={staged.name}>
                                {staged.name}
                              </td>
                              <td className="px-3 py-1.5 whitespace-nowrap">
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {staged.pdfTypeName}
                                </span>
                              </td>
                              <td className="px-3 py-1.5 text-gray-500 font-mono text-[10px] whitespace-nowrap truncate max-w-[150px]">
                                {staged.file?.name || staged.fileUrl || 'File attached'} ({staged.fileSize})
                              </td>
                              <td className="px-3 py-1.5 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStagedDocument(staged.id)}
                                  className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                                  title="Remove document"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-1.5 rounded-lg bg-[#006837] hover:bg-[#00532c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingLoan ? 'Update Loan Scheme' : 'Publish Loan Scheme'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ── MODAL: MANAGE PDF ATTACHMENTS ── */}

      {attachmentLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Paperclip size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    PDF Documents & Attachments
                  </h2>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {attachmentLoan.programNameEn || attachmentLoan.programNameSi}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAttachmentLoan(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200/60"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Form to add attachment */}
              <form onSubmit={handleAddAttachment} className="border border-blue-200 bg-blue-50/40 rounded-xl p-3.5 space-y-3">
                <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                  <Plus size={14} className="text-blue-700" />
                  <span>Upload or Attach PDF Document</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Document Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Loan Application Form (English)"
                      value={attachmentName}
                      onChange={e => setAttachmentName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Document Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={attachmentPdfTypeId}
                      onChange={e => setAttachmentPdfTypeId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">Select Document Type</option>
                      {pdfTypes.map(pt => (
                        <option key={pt.id} value={pt.id}>{pt.nameEn} ({pt.nameSi})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-gray-700">
                        Choose PDF File
                      </label>
                      {attachmentFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentFile(null);
                            if (fileInputRefAttachment.current) fileInputRefAttachment.current.value = '';
                          }}
                          className="text-rose-600 hover:text-rose-700 text-[10px] flex items-center gap-0.5 font-medium cursor-pointer"
                        >
                          <X size={11} />
                          <span>Clear file</span>
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRefAttachment}
                      type="file"
                      accept="application/pdf"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachmentFile(e.target.files[0]);
                        }
                      }}
                      className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Or Direct File URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={attachmentFileUrl}
                      onChange={e => setAttachmentFileUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isUploadingAttachment}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {isUploadingAttachment ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading Document...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>Upload & Attach</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* List of existing attachments */}
              <div>
                <span className="font-bold text-xs text-gray-800 mb-2 block">
                  Current Attachments ({attachmentLoan.pdfAttachments?.length || 0})
                </span>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500">Document</th>
                        <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500">Type</th>
                        <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500">Size</th>
                        <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {!attachmentLoan.pdfAttachments || attachmentLoan.pdfAttachments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-gray-400">
                            No PDF documents attached yet.
                          </td>
                        </tr>
                      ) : (
                        attachmentLoan.pdfAttachments.map(att => (
                          <tr key={att.id} className="hover:bg-gray-50/60">
                            <td className="px-3 py-1.5 font-medium text-gray-900 truncate max-w-[200px]" title={att.name}>
                              {att.name}
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                                {att.pdfType?.nameEn || 'Document'}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-gray-500 font-mono text-[10px] whitespace-nowrap">
                              {att.fileSize || '—'}
                            </td>
                            <td className="px-3 py-1.5 text-right whitespace-nowrap">
                              <a
                                href={att.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-gray-100 text-blue-600 rounded transition-colors inline-block mr-1"
                                title="Open / Download PDF"
                              >
                                <ExternalLink size={14} />
                              </a>
                              <button
                                onClick={() => handleDeleteAttachment(att.id)}
                                className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                                title="Delete document"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setAttachmentLoan(null)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── MODAL: VIEW LOAN DETAILS ── */}

      {viewingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header with Cover or Gradient */}
            <div className="relative h-28 bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-4 flex items-end">
              {viewingLoan.coverBannerUrl && (
                <img
                  src={viewingLoan.coverBannerUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
              )}
              <div className="relative z-10 flex items-center gap-3">
                {viewingLoan.logoBadgeUrl && (
                  <img
                    src={viewingLoan.logoBadgeUrl}
                    alt=""
                    className="w-12 h-12 rounded-lg bg-white p-1 object-contain shadow-md"
                  />
                )}
                <div>
                  <h2 className="text-base font-bold text-white drop-shadow-sm">
                    {viewingLoan.programNameSi}
                  </h2>
                  <p className="text-xs text-white/80">
                    {viewingLoan.programNameEn || viewingLoan.institutionName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingLoan(null)}
                className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full bg-black/30 hover:bg-black/50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Institution</span>
                  <span className="font-semibold text-gray-800">{viewingLoan.institutionName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Max Amount</span>
                  <span className="font-semibold text-emerald-700">{viewingLoan.maxLoanAmount || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Interest Rate</span>
                  <span className="font-semibold text-gray-800">{viewingLoan.annualInterestRate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Repayment Period</span>
                  <span className="font-semibold text-gray-800">{viewingLoan.repaymentPeriod || 'N/A'}</span>
                </div>
              </div>

              {/* Eligibility Criteria */}
              {(viewingLoan.eligibilityCriteriaSi || viewingLoan.eligibilityCriteriaEn || viewingLoan.eligibilityCriteria) && (
                <div>
                  <span className="font-bold text-gray-900 block mb-1">Eligibility Criteria (සුදුසුකම්)</span>
                  <div className={(viewingLoan.eligibilityCriteriaSi || viewingLoan.eligibilityCriteria) && viewingLoan.eligibilityCriteriaEn ? 'grid grid-cols-1 md:grid-cols-2 gap-2' : 'space-y-2'}>
                    {(viewingLoan.eligibilityCriteriaSi || (!viewingLoan.eligibilityCriteriaEn && viewingLoan.eligibilityCriteria)) && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-1">🇱🇰 Sinhala (සිංහල)</span>
                        <div
                          className="text-gray-700 leading-relaxed prose prose-xs max-w-none text-xs"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(viewingLoan.eligibilityCriteriaSi || viewingLoan.eligibilityCriteria || '') }}
                        />
                      </div>
                    )}
                    {viewingLoan.eligibilityCriteriaEn && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block mb-1">🇬🇧 English</span>
                        <div
                          className="text-gray-700 leading-relaxed prose prose-xs max-w-none text-xs"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(viewingLoan.eligibilityCriteriaEn) }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Required Documents */}
              {(viewingLoan.requiredDocumentsSi || viewingLoan.requiredDocumentsEn || viewingLoan.requiredDocuments) && (
                <div>
                  <span className="font-bold text-gray-900 block mb-1">Required Documents (අවශ්‍ය ලියකියවිලි)</span>
                  <div className={(viewingLoan.requiredDocumentsSi || viewingLoan.requiredDocuments) && viewingLoan.requiredDocumentsEn ? 'grid grid-cols-1 md:grid-cols-2 gap-2' : 'space-y-2'}>
                    {(viewingLoan.requiredDocumentsSi || (!viewingLoan.requiredDocumentsEn && viewingLoan.requiredDocuments)) && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-1">🇱🇰 Sinhala (සිංහල)</span>
                        <div
                          className="text-gray-700 leading-relaxed prose prose-xs max-w-none text-xs"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(viewingLoan.requiredDocumentsSi || viewingLoan.requiredDocuments || '') }}
                        />
                      </div>
                    )}
                    {viewingLoan.requiredDocumentsEn && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block mb-1">🇬🇧 English</span>
                        <div
                          className="text-gray-700 leading-relaxed prose prose-xs max-w-none text-xs"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(viewingLoan.requiredDocumentsEn) }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* How to Apply */}
              {(viewingLoan.howToApplySi || viewingLoan.howToApplyEn || viewingLoan.howToApply) && (
                <div>
                  <span className="font-bold text-gray-900 block mb-1">How to Apply (අයදුම් කරන ආකාරය)</span>
                  <div className={(viewingLoan.howToApplySi || viewingLoan.howToApply) && viewingLoan.howToApplyEn ? 'grid grid-cols-1 md:grid-cols-2 gap-2' : 'space-y-2'}>
                    {(viewingLoan.howToApplySi || (!viewingLoan.howToApplyEn && viewingLoan.howToApply)) && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-1">🇱🇰 Sinhala (සිංහල)</span>
                        <div
                          className="text-gray-700 leading-relaxed prose prose-xs max-w-none text-xs"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(viewingLoan.howToApplySi || viewingLoan.howToApply || '') }}
                        />
                      </div>
                    )}
                    {viewingLoan.howToApplyEn && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block mb-1">🇬🇧 English</span>
                        <div
                          className="text-gray-700 leading-relaxed prose prose-xs max-w-none text-xs"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(viewingLoan.howToApplyEn) }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Official Contacts</span>
                  <div className="text-gray-700 space-y-0.5">
                    {viewingLoan.hotline && <div>Hotline: {viewingLoan.hotline}</div>}
                    {viewingLoan.email && <div>Email: {viewingLoan.email}</div>}
                    {viewingLoan.website && (
                      <a href={viewingLoan.website} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline flex items-center gap-1">
                        <span>Visit Website</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Attached Documents</span>
                  <div className="text-gray-700">
                    {viewingLoan.pdfAttachments && viewingLoan.pdfAttachments.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {viewingLoan.pdfAttachments.map(att => (
                          <a
                            key={att.id}
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100"
                          >
                            <Paperclip size={10} />
                            <span>{att.name}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">None attached</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  const l = viewingLoan;
                  setViewingLoan(null);
                  handleOpenEditModal(l);
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
              >
                Edit Scheme
              </button>
              <button
                onClick={() => setViewingLoan(null)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── MODAL: TAXONOMY (CREATE / EDIT) ── */}

      {taxonomyModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-sm font-bold text-gray-900 capitalize">
                {editingTaxonomyItem ? `Edit ${taxonomyModalType}` : `Add New ${taxonomyModalType}`}
              </h2>
              <button
                onClick={() => setTaxonomyModalType(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200/60"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTaxonomy} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Name in English
                </label>
                <input
                  type="text"
                  placeholder="e.g. Micro Enterprises / Commercial Farming"
                  value={taxonomyNameEn}
                  onChange={e => {
                    setTaxonomyNameEn(e.target.value);
                    if (!editingTaxonomyItem) {
                      setTaxonomySlug(generateSlug(e.target.value));
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Name in Sinhala
                </label>
                <input
                  type="text"
                  placeholder="e.g. ක්ෂුද්‍ර ව්‍යවසාය / වාණිජ වගා"
                  value={taxonomyNameSi}
                  onChange={e => setTaxonomyNameSi(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {taxonomyModalType === 'subCategory' && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Parent Main Branch
                  </label>
                  <select
                    value={taxonomyParentBranchId}
                    onChange={e => setTaxonomyParentBranchId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="">Select Main Branch (Optional)</option>
                    {mainBranches.map(mb => (
                      <option key={mb.id} value={mb.id}>{mb.nameEn}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                  Slug (Generated from English Name - Editable) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. micro-enterprises"
                  value={taxonomySlug}
                  onChange={e => setTaxonomySlug(generateSlug(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-800 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Card Cover Image / Thumbnail (Optional)
                </label>
                <div className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 bg-gray-50/60">
                  <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                    {taxonomyImageFile ? (
                      <img
                        src={URL.createObjectURL(taxonomyImageFile)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : taxonomyImageUrl ? (
                      <img
                        src={taxonomyImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRefTaxonomyImage.current?.click()}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-2xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <Upload size={12} />
                        <span>Upload Image File</span>
                      </button>
                      {(taxonomyImageFile || taxonomyImageUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            setTaxonomyImageFile(null);
                            setTaxonomyImageUrl('');
                            setTaxonomyRemoveImage(true);
                            if (fileInputRefTaxonomyImage.current) fileInputRefTaxonomyImage.current.value = '';
                          }}
                          className="px-2 py-1 text-xs font-semibold rounded-md text-rose-600 hover:bg-rose-50 cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRefTaxonomyImage}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setTaxonomyImageFile(file);
                          setTaxonomyRemoveImage(false);
                        }
                      }}
                    />
                    <input
                      type="url"
                      placeholder="Or enter image URL (https://...)"
                      value={taxonomyImageUrl}
                      onChange={e => {
                        setTaxonomyImageUrl(e.target.value);
                        setTaxonomyRemoveImage(false);
                      }}
                      className="mt-1.5 w-full px-2 py-1 bg-white border border-gray-200 rounded text-[11px] focus:ring-1 focus:ring-emerald-500 font-mono text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setTaxonomyModalType(null)}
                  className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-[#006837] hover:bg-[#00532c] text-white text-xs font-semibold shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
