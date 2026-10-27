import { useState, useEffect, useRef, useMemo, type ChangeEvent, type FormEvent } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  UploadCloud,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';
import type {
  MushroomSupplierItem,
  MushroomFormDropdownOptions,
  MushroomFormState,
  MushroomAssociateOption
} from './types';
import MushroomQuickAddModal, { type MushroomMasterDataType } from './MushroomQuickAddModal';
import {
  SRI_LANKA_PROVINCES,
  getDistrictsForProvince,
  getDSDsForDistrict,
  getGNDsForDSD
} from '../../../data/sriLankaLocations';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface MushroomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem: MushroomSupplierItem | null;
  options: MushroomFormDropdownOptions;
  onOptionsRefresh?: () => Promise<void> | void;
  isAdmin?: boolean;
}

const DRAFT_KEY = 'aswanna_mushroom_supplier_draft';
const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const TABS = [
  { id: 'basic', step: 1, labelSi: 'මූලික & පිහිටීම', labelEn: 'Basic & Location' },
  { id: 'inventory', step: 2, labelSi: 'අමුද්‍රව්‍ය ලැයිස්තුව', labelEn: 'Inventory' },
  { id: 'featured', step: 3, labelSi: 'විශේෂිත නිෂ්පාදන', labelEn: 'Featured' },
  { id: 'categories', step: 4, labelSi: 'කාණ්ඩ & පහසුකම්', labelEn: 'Categories & Ops' },
  { id: 'photos', step: 5, labelSi: 'ඡායාරූප & විස්තරය', labelEn: 'Photos & About' }
];

const initialFormState: MushroomFormState = {
  businessNameSi: '',
  businessNameEn: '',
  ownerNameSi: '',
  ownerNameEn: '',
  whatsappNumber: '',

  provinceEn: '',
  provinceSi: '',
  districtEn: '',
  districtSi: '',
  divisionalSecretariatSi: '',
  divisionalSecretariatEn: '',
  gramaNiladhariDivisionSi: '',
  gramaNiladhariDivisionEn: '',
  fullAddressSi: '',
  fullAddressEn: '',

  inventoryItems: [],
  featuredItems: [],
  categoryIds: [],

  deliveryId: '',
  operatingHoursId: '',
  googleMapsUrl: '',
  descriptionSi: '',
  descriptionEn: '',

  primaryImageUrl: '',
  photos: [],

  activeState: true
};

// Clean text helper for clean slugs
export function slugifyText(text: string): string {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Frontend Supplier Slug Generator strictly combining businessNameEn + ownerNameEn (e.g. "Tashele Bimmal" + "tasheela" -> "tashele-bimmal-tasheela")
export function generateSupplierSlug(businessName: string, ownerName: string): string {
  const b = slugifyText(businessName);
  const o = slugifyText(ownerName);

  if (b && o) return `${b}-${o}`;
  if (b) return b;
  if (o) return o;
  return 'mushroom-supplier';
}

// General frontend slug generator without random text
export function generateFrontendSlug(text: string, prefix = 'mushroom'): string {
  const clean = slugifyText(text);
  return clean || prefix;
}

export default function MushroomFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
  options,
  onOptionsRefresh,
  isAdmin = false
}: MushroomFormModalProps) {
  const [formData, setFormData] = useState<MushroomFormState>({
    ...initialFormState,
    activeState: isAdmin
  });
  const [localOptions, setLocalOptions] = useState<MushroomFormDropdownOptions>(options);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab Wizard & 7-Day Draft State
  const [activeTab, setActiveTab] = useState(0);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);

  // Quick Add Modal state
  const [quickAddType, setQuickAddType] = useState<MushroomMasterDataType | null>(null);

  // Custom location toggle
  const [isCustomDsd, setIsCustomDsd] = useState(false);
  const [isCustomGnd, setIsCustomGnd] = useState(false);

  // Gallery Photos state
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ url: string; isPrimary: boolean }>>([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Specific Inventory Item input temp row state
  const [invCategoryId, setInvCategoryId] = useState('');
  const [invItemName, setInvItemName] = useState('');
  const [invSpec, setInvSpec] = useState('');
  const [invPrice, setInvPrice] = useState('');
  const [invStock, setInvStock] = useState('');

  // Top 5 Featured Item input temp row state
  const [featItemType, setFeatItemType] = useState('');
  const [featVariety, setFeatVariety] = useState('');
  const [featPrice, setFeatPrice] = useState('');
  const [featImageUrl, setFeatImageUrl] = useState('');
  const [featBadgeId, setFeatBadgeId] = useState('');
  const [isUploadingFeatImg, setIsUploadingFeatImg] = useState(false);
  const featImgInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Synchronize options
  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  // Reset or Populate form when editingItem changes or restore 7-day draft
  useEffect(() => {
    if (editingItem) {
      const loc = editingItem.location;
      const images = editingItem.images || [];
      const primaryImg = images.find((img) => img.isPrimary)?.imageUrl || images[0]?.imageUrl || '';

      setFormData({
        businessNameSi: editingItem.businessNameSi || '',
        businessNameEn: editingItem.businessNameEn || '',
        ownerNameSi: editingItem.ownerNameSi || '',
        ownerNameEn: editingItem.ownerNameEn || '',
        whatsappNumber: editingItem.whatsappNumber || '',

        provinceEn: loc?.provinceEn || '',
        provinceSi: loc?.provinceSi || '',
        districtEn: loc?.districtEn || '',
        districtSi: loc?.districtSi || '',
        divisionalSecretariatSi: loc?.divisionalSecretariatSi || '',
        divisionalSecretariatEn: loc?.divisionalSecretariatEn || '',
        gramaNiladhariDivisionSi: loc?.gramaNiladhariDivisionSi || '',
        gramaNiladhariDivisionEn: loc?.gramaNiladhariDivisionEn || '',
        fullAddressSi: loc?.fullAddressSi || '',
        fullAddressEn: loc?.fullAddressEn || '',

        inventoryItems: (editingItem.inventoryItems || []).map((item) => ({
          id: item.id,
          slug: item.slug,
          categoryId: item.categoryId || '',
          categoryName: item.category?.nameSi || item.category?.nameEn || '',
          itemNameSi: item.itemNameSi || '',
          itemNameEn: item.itemNameEn || '',
          specificationSi: item.specificationSi || '',
          specificationEn: item.specificationEn || '',
          priceSi: item.priceSi || '',
          priceEn: item.priceEn || '',
          stockSi: item.stockSi || '',
          stockEn: item.stockEn || ''
        })),

        featuredItems: (editingItem.featuredItems || []).map((item) => ({
          id: item.id,
          slug: item.slug,
          itemTypeSi: item.itemTypeSi || '',
          itemTypeEn: item.itemTypeEn || '',
          varietySi: item.varietySi || '',
          varietyEn: item.varietyEn || '',
          priceSi: item.priceSi || '',
          priceEn: item.priceEn || '',
          imageUrl: item.imageUrl || '',
          badgeId: item.badgeId || '',
          badgeName: item.badge?.nameSi || item.badge?.nameEn || ''
        })),

        categoryIds: (editingItem.categories || []).map((c) => c.id),

        deliveryId: editingItem.deliveryId || '',
        operatingHoursId: editingItem.operatingHoursId || '',
        googleMapsUrl: editingItem.googleMapsUrl || '',
        descriptionSi: editingItem.descriptionSi || '',
        descriptionEn: editingItem.descriptionEn || '',

        primaryImageUrl: primaryImg,
        photos: images.map((img) => img.imageUrl),

        activeState: editingItem.activeState ?? true
      });

      setUploadedPhotos(
        images.map((img, idx) => ({
          url: img.imageUrl,
          isPrimary: img.isPrimary || idx === 0
        }))
      );
      setActiveTab(0);
      setDraftNotice(null);
    } else {
      // Check 7-day draft in localStorage for new supplier entry
      try {
        const rawDraft = localStorage.getItem(DRAFT_KEY);
        if (rawDraft) {
          const draft = JSON.parse(rawDraft);
          const age = Date.now() - (draft.savedAt || 0);
          if (draft && draft.formData && age < DRAFT_EXPIRY_MS) {
            setFormData({
              ...draft.formData,
              activeState: isAdmin ? (draft.formData.activeState ?? true) : false
            });
            setUploadedPhotos(draft.uploadedPhotos || []);
            setActiveTab(draft.activeTab || 0);
            const daysRemaining = Math.max(1, Math.ceil((DRAFT_EXPIRY_MS - age) / (24 * 60 * 60 * 1000)));
            setDraftNotice(`කලින් ඇතුළත් කළ කෙටුම්පත (Draft) සාර්ථකව ලබා ගන්නා ලදී. (තවත් දින ${daysRemaining}ක් වලංගුයි)`);
          } else {
            localStorage.removeItem(DRAFT_KEY);
            setFormData({ ...initialFormState, activeState: isAdmin });
            setUploadedPhotos([]);
            setActiveTab(0);
            setDraftNotice(null);
          }
        } else {
          setFormData({ ...initialFormState, activeState: isAdmin });
          setUploadedPhotos([]);
          setActiveTab(0);
          setDraftNotice(null);
        }
      } catch {
        setFormData({ ...initialFormState, activeState: isAdmin });
        setUploadedPhotos([]);
        setActiveTab(0);
        setDraftNotice(null);
      }
    }
    setErrorMsg(null);
  }, [editingItem, isOpen]);

  // Auto-save draft for 7 days (debounce 400ms)
  useEffect(() => {
    if (editingItem || !isOpen) return;

    const hasData = Boolean(
      formData.businessNameSi.trim() ||
      formData.businessNameEn.trim() ||
      formData.ownerNameSi.trim() ||
      formData.ownerNameEn.trim() ||
      formData.whatsappNumber.trim() ||
      formData.provinceEn ||
      formData.districtEn ||
      formData.fullAddressSi.trim() ||
      formData.inventoryItems.length > 0 ||
      formData.featuredItems.length > 0 ||
      uploadedPhotos.length > 0 ||
      formData.descriptionSi.trim()
    );

    if (!hasData) return;

    const timer = setTimeout(() => {
      try {
        const draft = {
          formData,
          uploadedPhotos,
          activeTab,
          savedAt: Date.now()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch (e) {
        console.warn('Failed to auto-save mushroom supplier draft', e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData, uploadedPhotos, activeTab, editingItem, isOpen]);

  // Clear 7-day draft
  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch { }
    setFormData(initialFormState);
    setUploadedPhotos([]);
    setActiveTab(0);
    setDraftNotice(null);
    setErrorMsg(null);
  };

  // Cascading location options using sl-gnd-dsd-districts
  // 1. Districts for selected province
  const availableDistricts = useMemo(() => {
    if (!formData.provinceEn) return [];
    return getDistrictsForProvince(formData.provinceEn);
  }, [formData.provinceEn]);

  // 2. DSDs for selected district
  const availableDSDs = useMemo(() => {
    if (!formData.districtEn) return [];
    return getDSDsForDistrict(formData.districtEn);
  }, [formData.districtEn]);

  // 3. GNDs for selected DSD & District (DSD first, District second)
  const availableGNDs = useMemo(() => {
    if (!formData.divisionalSecretariatEn || !formData.districtEn) return [];
    return getGNDsForDSD(formData.divisionalSecretariatEn, formData.districtEn);
  }, [formData.divisionalSecretariatEn, formData.districtEn]);

  if (!isOpen) return null;

  // Handle province change
  const handleProvinceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const provEn = e.target.value;
    const prov = SRI_LANKA_PROVINCES.find((p) => p.en === provEn);
    setFormData((prev) => ({
      ...prev,
      provinceEn: provEn,
      provinceSi: prov?.si || provEn,
      districtEn: '',
      districtSi: '',
      divisionalSecretariatEn: '',
      divisionalSecretariatSi: '',
      gramaNiladhariDivisionEn: '',
      gramaNiladhariDivisionSi: ''
    }));
    setIsCustomDsd(false);
    setIsCustomGnd(false);
  };

  // Handle district change
  const handleDistrictChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const distEn = e.target.value;
    const dist = availableDistricts.find((d) => d.en === distEn);
    setFormData((prev) => ({
      ...prev,
      districtEn: distEn,
      districtSi: dist?.si || distEn,
      divisionalSecretariatEn: '',
      divisionalSecretariatSi: '',
      gramaNiladhariDivisionEn: '',
      gramaNiladhariDivisionSi: ''
    }));
    setIsCustomDsd(false);
    setIsCustomGnd(false);
  };

  // Handle DSD change
  const handleDSDChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomDsd(true);
      setFormData((prev) => ({
        ...prev,
        divisionalSecretariatEn: '',
        divisionalSecretariatSi: '',
        gramaNiladhariDivisionEn: '',
        gramaNiladhariDivisionSi: ''
      }));
      return;
    }

    const dsd = availableDSDs.find((d) => d.nameEn === val);
    setFormData((prev) => ({
      ...prev,
      divisionalSecretariatEn: val,
      divisionalSecretariatSi: dsd?.nameSi || val,
      gramaNiladhariDivisionEn: '',
      gramaNiladhariDivisionSi: ''
    }));
    setIsCustomDsd(false);
    setIsCustomGnd(false);
  };

  // Handle GND change
  const handleGNDChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomGnd(true);
      setFormData((prev) => ({
        ...prev,
        gramaNiladhariDivisionEn: '',
        gramaNiladhariDivisionSi: ''
      }));
      return;
    }

    const gnd = availableGNDs.find((g) => g.nameEn === val);
    setFormData((prev) => ({
      ...prev,
      gramaNiladhariDivisionEn: val,
      gramaNiladhariDivisionSi: gnd?.nameSi || val
    }));
    setIsCustomGnd(false);
  };

  // Quick Add Item callback
  const handleMasterCreated = (newItem: MushroomAssociateOption) => {
    if (quickAddType === 'category') {
      setLocalOptions((prev) => ({ ...prev, categories: [...prev.categories, newItem] }));
      setInvCategoryId(newItem.id);
    } else if (quickAddType === 'badge') {
      setLocalOptions((prev) => ({ ...prev, badges: [...prev.badges, newItem] }));
      setFeatBadgeId(newItem.id);
    } else if (quickAddType === 'delivery') {
      setLocalOptions((prev) => ({ ...prev, deliveries: [...prev.deliveries, newItem] }));
      setFormData((prev) => ({ ...prev, deliveryId: newItem.id }));
    } else if (quickAddType === 'operatingHours') {
      setLocalOptions((prev) => ({ ...prev, operatingHours: [...prev.operatingHours, newItem] }));
      setFormData((prev) => ({ ...prev, operatingHoursId: newItem.id }));
    }
    onOptionsRefresh?.();
  };

  // Generic Image Uploader via /api/mushroom-suppliers/upload-images
  const uploadImageFile = async (file: File): Promise<string> => {
    const uploadData = new FormData();
    uploadData.append('images', file);
    uploadData.append('image', file);

    const res = await fetch(`${API_BASE}/mushroom-suppliers/upload-images`, {
      method: 'POST',
      body: uploadData
    });

    if (!res.ok) {
      throw new Error('Image upload failed');
    }
    const json = await res.json();
    return json.url || (Array.isArray(json.urls) ? json.urls[0] : json.data?.url);
  };

  // Upload Featured Item image
  const handleFeaturedImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingFeatImg(true);
      setErrorMsg(null);
      const url = await uploadImageFile(file);
      if (url) {
        setFeatImageUrl(url);
      }
    } catch (err: any) {
      console.error('Featured image upload error:', err);
      setErrorMsg('Featured item image upload failed. Please try again.');
    } finally {
      setIsUploadingFeatImg(false);
      if (featImgInputRef.current) featImgInputRef.current.value = '';
    }
  };

  // Upload Gallery Photos
  const handleGalleryFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    try {
      setIsUploadingGallery(true);
      setErrorMsg(null);

      const uploadedUrls: string[] = [];
      for (const file of validFiles) {
        const url = await uploadImageFile(file);
        if (url) uploadedUrls.push(url);
      }

      setUploadedPhotos((prev) => {
        const updated = [...prev];
        uploadedUrls.forEach((u) => {
          if (!updated.some((p) => p.url === u)) {
            updated.push({ url: u, isPrimary: updated.length === 0 });
          }
        });
        return updated;
      });
    } catch (err: any) {
      console.error('Gallery upload error:', err);
      setErrorMsg('Failed to upload one or more gallery photos.');
    } finally {
      setIsUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // Add Inventory Item
  const handleAddInventoryItem = () => {
    if (!invItemName.trim() && !invSpec.trim()) {
      setErrorMsg('Please enter at least Item Name or Specification for inventory item.');
      return;
    }

    const catObj = localOptions.categories.find((c) => c.id === invCategoryId);
    const newItem = {
      categoryId: invCategoryId,
      categoryName: catObj?.nameSi || catObj?.nameEn || '',
      itemNameSi: invItemName.trim(),
      itemNameEn: invItemName.trim(),
      specificationSi: invSpec.trim(),
      specificationEn: invSpec.trim(),
      priceSi: invPrice.trim(),
      priceEn: invPrice.trim(),
      stockSi: invStock.trim(),
      stockEn: invStock.trim()
    };

    setFormData((prev) => ({
      ...prev,
      inventoryItems: [...prev.inventoryItems, newItem]
    }));

    // Reset inputs
    setInvCategoryId('');
    setInvItemName('');
    setInvSpec('');
    setInvPrice('');
    setInvStock('');
    setErrorMsg(null);
  };

  const handleRemoveInventoryItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      inventoryItems: prev.inventoryItems.filter((_, i) => i !== index)
    }));
  };

  // Add Featured Item (max 5)
  const handleAddFeaturedItem = () => {
    if (formData.featuredItems.length >= 5) {
      setErrorMsg('Maximum 5 top featured items allowed.');
      return;
    }
    if (!featItemType.trim() && !featVariety.trim()) {
      setErrorMsg('Please provide Item Type or Variety for featured item.');
      return;
    }

    const badgeObj = localOptions.badges.find((b) => b.id === featBadgeId);
    const newItem = {
      itemTypeSi: featItemType.trim(),
      itemTypeEn: featItemType.trim(),
      varietySi: featVariety.trim(),
      varietyEn: featVariety.trim(),
      priceSi: featPrice.trim(),
      priceEn: featPrice.trim(),
      imageUrl: featImageUrl.trim(),
      badgeId: featBadgeId,
      badgeName: badgeObj?.nameSi || badgeObj?.nameEn || ''
    };

    setFormData((prev) => ({
      ...prev,
      featuredItems: [...prev.featuredItems, newItem]
    }));

    // Reset inputs
    setFeatItemType('');
    setFeatVariety('');
    setFeatPrice('');
    setFeatImageUrl('');
    setFeatBadgeId('');
    setErrorMsg(null);
  };

  const handleRemoveFeaturedItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      featuredItems: prev.featuredItems.filter((_, i) => i !== index)
    }));
  };

  // Toggle Category Checkbox
  const handleToggleCategory = (catId: string) => {
    setFormData((prev) => {
      const exists = prev.categoryIds.includes(catId);
      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((id) => id !== catId)
          : [...prev.categoryIds, catId]
      };
    });
  };

  // Tab Navigation Handlers
  const handleNextTab = () => {
    // Basic validations when leaving Tab 0
    if (activeTab === 0) {
      if (!formData.businessNameSi.trim() && !formData.businessNameEn.trim()) {
        setErrorMsg('කරුණාකර ව්‍යාපාරයේ නම (Business Name) ඇතුළත් කරන්න.');
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!formData.ownerNameSi.trim() && !formData.ownerNameEn.trim()) {
        setErrorMsg('කරුණාකර හිමිකරුගේ නම (Owner Name) ඇතුළත් කරන්න.');
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!formData.whatsappNumber.trim()) {
        setErrorMsg('කරුණාකර දුරකථන අංකය / WhatsApp (Phone Number) ඇතුළත් කරන්න.');
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Auto-commit typed inventory row if user didn't click "+"
    if (activeTab === 1 && (invItemName.trim() || invSpec.trim())) {
      handleAddInventoryItem();
    }

    // Auto-commit typed featured row if user didn't click "+"
    if (activeTab === 2 && (featItemType.trim() || featVariety.trim())) {
      handleAddFeaturedItem();
    }

    setErrorMsg(null);
    if (activeTab < TABS.length - 1) {
      setActiveTab((prev) => prev + 1);
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevTab = () => {
    setErrorMsg(null);
    if (activeTab > 0) {
      setActiveTab((prev) => prev - 1);
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTabClick = (targetIndex: number) => {
    if (activeTab === 0 && targetIndex > 0) {
      if (!formData.businessNameSi.trim() && !formData.businessNameEn.trim()) {
        setErrorMsg('කරුණාකර ව්‍යාපාරයේ නම (Business Name) ඇතුළත් කරන්න.');
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!formData.ownerNameSi.trim() && !formData.ownerNameEn.trim()) {
        setErrorMsg('කරුණාකර හිමිකරුගේ නම (Owner Name) ඇතුළත් කරන්න.');
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!formData.whatsappNumber.trim()) {
        setErrorMsg('කරුණාකර දුරකථන අංකය / WhatsApp (Phone Number) ඇතුළත් කරන්න.');
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (activeTab === 1 && (invItemName.trim() || invSpec.trim())) {
      handleAddInventoryItem();
    }
    if (activeTab === 2 && (featItemType.trim() || featVariety.trim())) {
      handleAddFeaturedItem();
    }

    setErrorMsg(null);
    setActiveTab(targetIndex);
    formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Handler
  const handleSubmit = async (e?: FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg(null);

    // CRITICAL GUARD: Never submit unless explicitly on the final step (Photos & About)
    if (activeTab < TABS.length - 1) {
      handleNextTab();
      return;
    }

    if (!formData.businessNameEn.trim() && !formData.businessNameSi.trim()) {
      setErrorMsg('කරුණාකර ව්‍යාපාරයේ නම (Business Name) ඇතුළත් කරන්න.');
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.ownerNameEn.trim() && !formData.ownerNameSi.trim()) {
      setErrorMsg('කරුණාකර හිමිකරුගේ නම (Owner Name) ඇතුළත් කරන්න.');
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.whatsappNumber.trim()) {
      setErrorMsg('කරුණාකර දුරකථන අංකය / WhatsApp (Phone Number) ඇතුළත් කරන්න.');
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');

      // Auto-commit pending inventory item if user filled the input without clicking "+ එක්කරන්න"
      let allInventoryItems = [...formData.inventoryItems];
      if (invItemName.trim() || invSpec.trim()) {
        const catObj = localOptions.categories.find((c) => c.id === invCategoryId);
        allInventoryItems.push({
          categoryId: invCategoryId || '',
          categoryName: catObj?.nameSi || catObj?.nameEn || '',
          itemNameSi: invItemName.trim(),
          itemNameEn: invItemName.trim(),
          specificationSi: invSpec.trim(),
          specificationEn: invSpec.trim(),
          priceSi: invPrice.trim(),
          priceEn: invPrice.trim(),
          stockSi: invStock.trim(),
          stockEn: invStock.trim()
        });
      }

      // Auto-commit pending featured item if user filled the input without clicking "+ එක්කරන්න"
      let allFeaturedItems = [...formData.featuredItems];
      if ((featItemType.trim() || featVariety.trim()) && allFeaturedItems.length < 5) {
        const badgeObj = localOptions.badges.find((b) => b.id === featBadgeId);
        allFeaturedItems.push({
          itemTypeSi: featItemType.trim(),
          itemTypeEn: featItemType.trim(),
          varietySi: featVariety.trim(),
          varietyEn: featVariety.trim(),
          priceSi: featPrice.trim(),
          priceEn: featPrice.trim(),
          imageUrl: featImageUrl.trim(),
          badgeId: featBadgeId || '',
          badgeName: badgeObj?.nameSi || badgeObj?.nameEn || ''
        });
      }

      // Generate frontend slug strictly as businessNameEn + ownerNameEn (e.g. "Tashele Bimmal" + "tasheela" -> "tashele-bimmal-tasheela")
      const primarySlug = editingItem
        ? editingItem.slug
        : generateSupplierSlug(
          formData.businessNameEn || formData.businessNameSi,
          formData.ownerNameEn || formData.ownerNameSi
        );

      // Construct Location
      const locationPayload = {
        slug: `loc-${primarySlug}`,
        provinceEn: formData.provinceEn || null,
        provinceSi: formData.provinceSi || null,
        districtEn: formData.districtEn || null,
        districtSi: formData.districtSi || null,
        divisionalSecretariatEn: formData.divisionalSecretariatEn || null,
        divisionalSecretariatSi: formData.divisionalSecretariatSi || null,
        gramaNiladhariDivisionEn: formData.gramaNiladhariDivisionEn || null,
        gramaNiladhariDivisionSi: formData.gramaNiladhariDivisionSi || null,
        fullAddressSi: formData.fullAddressSi || null,
        fullAddressEn: formData.fullAddressEn || null
      };

      // Construct Images with clean slugs
      const imagesPayload = uploadedPhotos.map((p, idx) => ({
        slug: `${primarySlug}-img-${idx + 1}`,
        imageUrl: p.url,
        isPrimary: p.isPrimary,
        activeState: true
      }));

      // Construct Inventory Items with clean slugs
      const inventoryItemsPayload = allInventoryItems.map((item, idx) => ({
        slug: item.slug || `${primarySlug}-inv-${idx + 1}`,
        categoryId: item.categoryId || null,
        itemNameSi: item.itemNameSi || null,
        itemNameEn: item.itemNameEn || null,
        specificationSi: item.specificationSi || null,
        specificationEn: item.specificationEn || null,
        priceSi: item.priceSi || null,
        priceEn: item.priceEn || null,
        stockSi: item.stockSi || null,
        stockEn: item.stockEn || null,
        activeState: true
      }));

      // Construct Featured Items with clean slugs
      const featuredItemsPayload = allFeaturedItems.map((item, idx) => ({
        slug: item.slug || `${primarySlug}-feat-${idx + 1}`,
        itemTypeSi: item.itemTypeSi || null,
        itemTypeEn: item.itemTypeEn || null,
        varietySi: item.varietySi || null,
        varietyEn: item.varietyEn || null,
        priceSi: item.priceSi || null,
        priceEn: item.priceEn || null,
        imageUrl: item.imageUrl || null,
        badgeId: item.badgeId || null,
        activeState: true
      }));

      const payload = {
        slug: primarySlug,
        businessNameEn: formData.businessNameEn.trim() || formData.businessNameSi.trim(),
        businessNameSi: formData.businessNameSi.trim() || formData.businessNameEn.trim(),
        ownerNameEn: formData.ownerNameEn.trim() || formData.ownerNameSi.trim(),
        ownerNameSi: formData.ownerNameSi.trim() || formData.ownerNameEn.trim(),
        whatsappNumber: formData.whatsappNumber.trim(),
        location: locationPayload,
        deliveryId: formData.deliveryId || null,
        operatingHoursId: formData.operatingHoursId || null,
        googleMapsUrl: formData.googleMapsUrl.trim() || null,
        descriptionEn: formData.descriptionEn.trim() || formData.descriptionSi.trim() || null,
        descriptionSi: formData.descriptionSi.trim() || formData.descriptionEn.trim() || null,
        categoryIds: formData.categoryIds,
        images: imagesPayload,
        inventoryItems: inventoryItemsPayload,
        featuredItems: featuredItemsPayload,
        activeState: isAdmin ? Boolean(formData.activeState) : false
      };

      const url = editingItem
        ? `${API_BASE}/mushroom-suppliers/${editingItem.id}`
        : `${API_BASE}/mushroom-suppliers`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save mushroom supplier');
      }

      // Clear 7-day draft upon successful submit
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch { }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Submit error:', err);
      setErrorMsg(err.message || 'An error occurred while saving the supplier.');
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
        {/* Increased Width: max-w-6xl xl:max-w-7xl for generous, spacious layout */}
        <div className="relative w-full max-w-6xl xl:max-w-7xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[94vh] flex flex-col my-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/90 shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {editingItem ? 'Edit Mushroom Supplier' : 'Add New Mushroom Supplier'}
              </h2>
              <p className="text-[11px] text-gray-500 font-medium">
                {editingItem ? 'Update mushroom supplier details & inventory' : 'Enter complete mushroom supplier information'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Wizard Tab Bar */}
          <div className="px-4 sm:px-6 py-2.5 bg-white border-b border-gray-200 shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === idx;
                const isPast = activeTab > idx;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${isActive
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                      : isPast
                        ? 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                        : 'bg-white border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive
                        ? 'bg-emerald-600 text-white'
                        : isPast
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                      {isPast ? <Check size={11} /> : tab.step}
                    </span>
                    <span className="truncate">{tab.labelSi}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Scroll Area */}
          <form
            ref={formRef}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (activeTab < TABS.length - 1) {
                handleNextTab();
              } else {
                handleSubmit(e);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if ((e.target as HTMLElement).tagName !== 'TEXTAREA') {
                  e.preventDefault();
                  e.stopPropagation();
                  if (activeTab < TABS.length - 1) {
                    handleNextTab();
                  }
                }
              }
            }}
            className="overflow-y-auto p-6 sm:p-7 space-y-6 text-xs text-gray-700 flex-1 bg-slate-50/40"
          >
            {draftNotice && !editingItem && (
              <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-800 text-xs">
                <span>{draftNotice}</span>
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-white px-2.5 py-1 rounded-lg border border-red-200 hover:border-red-300 transition shrink-0 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>කෙටුම්පත මකන්න (Clear)</span>
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 0: Basic Info & Location */}
            {activeTab === 0 && (
              <>
                {/* Top Row: Business Name, Owner Name, WhatsApp Number */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-2xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        ව්‍යාපාරයේ / නවාතැන් නම *
                      </label>
                      <input
                        type="text"
                        value={formData.businessNameSi}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            businessNameSi: e.target.value,
                            businessNameEn: prev.businessNameEn || e.target.value
                          }))
                        }
                        placeholder="උදා: රන්දෙණිය බිම්මල් ව්‍යාපාරය & බීජ මධ්‍යස්ථානය"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        හිමිකරුගේ නම *
                      </label>
                      <input
                        type="text"
                        value={formData.ownerNameSi}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            ownerNameSi: e.target.value,
                            ownerNameEn: prev.ownerNameEn || e.target.value
                          }))
                        }
                        placeholder="උදා: ඩී. එම්. සමන් කුමාර මහතා"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        දුරකථන අංකය (WhatsApp සහිත) *
                      </label>
                      <input
                        type="text"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                        placeholder="07X XXXXXXX"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 1: Location (Powered by sl-gnd-dsd-districts) */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-wide">
                      1. පිහිටීම (පළාත, දිස්ත්‍රික්කය, ප්‍රා.ලේ සහ ග්‍රාම නිලධාරි වසම) *
                    </h3>
                    <span className="text-[10px] text-gray-400 font-medium">Powered by sl-gnd-dsd-districts</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                    {/* 1. Province */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                        පළාත (Province) *
                      </label>
                      <select
                        value={formData.provinceEn}
                        onChange={handleProvinceChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      >
                        <option value="">තෝරන්න</option>
                        {SRI_LANKA_PROVINCES.map((prov) => (
                          <option key={prov.en} value={prov.en}>
                            {prov.si} ({prov.en})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. District */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                        දිස්ත්‍රික්කය (District) *
                      </label>
                      <select
                        value={formData.districtEn}
                        onChange={handleDistrictChange}
                        disabled={!formData.provinceEn}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      >
                        <option value="">{formData.provinceEn ? 'දිස්ත්‍රික්කය තෝරන්න' : 'පළාත තෝරන්න'}</option>
                        {availableDistricts.map((dist) => (
                          <option key={dist.en} value={dist.en}>
                            {dist.si} ({dist.en})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Divisional Secretariat Division (DSD) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] uppercase font-bold text-gray-500">
                          ප්‍රාදේශීය ලේකම් කොට්ඨාසය *
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomDsd(!isCustomDsd)}
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                          {isCustomDsd ? 'Dropdown' : 'Type custom'}
                        </button>
                      </div>
                      {isCustomDsd || availableDSDs.length === 0 ? (
                        <input
                          type="text"
                          value={formData.divisionalSecretariatSi || formData.divisionalSecretariatEn}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              divisionalSecretariatSi: e.target.value,
                              divisionalSecretariatEn: e.target.value
                            }))
                          }
                          placeholder="උදා: මීරිගම / කඩවත"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                      ) : (
                        <select
                          value={formData.divisionalSecretariatEn}
                          onChange={handleDSDChange}
                          disabled={!formData.districtEn}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        >
                          <option value="">{formData.districtEn ? 'තෝරන්න' : 'දිස්ත්‍රික්කය තෝරන්න'}</option>
                          {availableDSDs.map((dsd) => (
                            <option key={dsd.nameEn} value={dsd.nameEn}>
                              {dsd.nameSi || dsd.nameEn} ({dsd.nameEn})
                            </option>
                          ))}
                          <option value="__custom__">+ වෙනත් එකක් ටයිප් කරන්න...</option>
                        </select>
                      )}
                    </div>

                    {/* 4. Grama Niladhari Division (GND) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] uppercase font-bold text-gray-500">
                          ග්‍රාම නිලධාරී වසම *
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomGnd(!isCustomGnd)}
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                          {isCustomGnd ? 'Dropdown' : 'Type custom'}
                        </button>
                      </div>
                      {isCustomGnd || availableGNDs.length === 0 ? (
                        <input
                          type="text"
                          value={formData.gramaNiladhariDivisionSi || formData.gramaNiladhariDivisionEn}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              gramaNiladhariDivisionSi: e.target.value,
                              gramaNiladhariDivisionEn: e.target.value
                            }))
                          }
                          placeholder="උදා: 220-බෝතලේ"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                      ) : (
                        <select
                          value={formData.gramaNiladhariDivisionEn}
                          onChange={handleGNDChange}
                          disabled={!formData.divisionalSecretariatEn}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        >
                          <option value="">{formData.divisionalSecretariatEn ? 'තෝරන්න' : 'ප්‍රා.ලේ තෝරන්න'}</option>
                          {availableGNDs.map((gnd) => (
                            <option key={gnd.nameEn} value={gnd.nameEn}>
                              {gnd.nameSi || gnd.nameEn} {gnd.gnCode ? `(${gnd.gnCode})` : ''}
                            </option>
                          ))}
                          <option value="__custom__">+ වෙනත් එකක් ටයිප් කරන්න...</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                      සම්පූර්ණ භෞතික ලිපිනය *
                    </label>
                    <input
                      type="text"
                      value={formData.fullAddressSi}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fullAddressSi: e.target.value,
                          fullAddressEn: prev.fullAddressEn || e.target.value
                        }))
                      }
                      placeholder="උදා: අංක 12, වේයන්ගොඩ පාර, මීරිගම."
                      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* TAB 1: Specific Inventory Items */}
            {activeTab === 1 && (
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-wide">
                      2. විකිණීමට ඇති සියලුම අමුද්‍රව්‍ය සහ භාණ්ඩ වෙන වෙනම ඇතුළත් කරන්න (ADD SPECIFIC INVENTORY ITEMS) *
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      බිම්මල් බීජ, වගා මලු, ලී කුඩු, PP පොලිතින්, පුළුන්, රබර් පටි සහ PVC කරපටි එකින් එක නිශ්චිත මිල සහ තොග ප්‍රමාණ සමග මෙහි එක් කරන්න.
                    </p>
                  </div>
                  <span className="text-[10px] px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    භාණ්ඩ {formData.inventoryItems.length} ක් ඇත
                  </span>
                </div>

                {/* Input Row for Inventory Item */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 bg-slate-50 p-3 rounded-xl border border-gray-200 items-end">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-gray-600">අමුද්‍රව්‍ය කාණ්ඩය</label>
                      {/* Quick Add Button for Category (Admin Only) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setQuickAddType('category')}
                          className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                          title="Quick Add Category"
                        >
                          <Plus size={10} />
                          <span>New</span>
                        </button>
                      )}
                    </div>
                    <select
                      value={invCategoryId}
                      onChange={(e) => setInvCategoryId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                    >
                      <option value="">තෝරන්න</option>
                      {localOptions.categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nameSi || cat.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">නිෂ්පාදනයේ නම</label>
                    <input
                      type="text"
                      value={invItemName}
                      onChange={(e) => setInvItemName(e.target.value)}
                      placeholder="උදා: ඇමරිකන් ඔයිස්ටර්"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">පිරිවිතර / ඇසුරුම</label>
                    <input
                      type="text"
                      value={invSpec}
                      onChange={(e) => setInvSpec(e.target.value)}
                      placeholder="උදා: 750ml බෝතලය"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">ඒකක මිල</label>
                    <input
                      type="text"
                      value={invPrice}
                      onChange={(e) => setInvPrice(e.target.value)}
                      placeholder="උදා: රු. 240 / බෝතලය"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">පවතින තොගය</label>
                    <input
                      type="text"
                      value={invStock}
                      onChange={(e) => setInvStock(e.target.value)}
                      placeholder="උදා: බෝතල් 300ක්"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleAddInventoryItem}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs"
                    >
                      <Plus size={13} />
                      <span>එක්කරන්න</span>
                    </button>
                  </div>
                </div>

                {/* Table of items */}
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100/80 border-b border-gray-200">
                        <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-600">කාණ්ඩය</th>
                        <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-600">නිෂ්පාදනය (Item Name)</th>
                        <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-600">පිරිවිතර / ඇසුරුම</th>
                        <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-600">ඒකක මිල</th>
                        <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-600">පවතින තොගය</th>
                        <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-600 text-right">ක්‍රියා</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {formData.inventoryItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-5 text-center text-gray-400 text-xs italic">
                            තවමත් අමුද්‍රව්‍ය කිසිවක් එක්කර නැත. ඉහත පේළියෙන් බීජ, වගා මලු, ලී කුඩු, PP පොලිතින් හෝ පුළුන්/කරපටි වෙන වෙනම එක්කරන්න.
                          </td>
                        </tr>
                      ) : (
                        formData.inventoryItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-3 py-1.5 text-xs text-gray-700 font-medium">
                              {item.categoryName || '—'}
                            </td>
                            <td className="px-3 py-1.5 text-xs text-gray-900 font-semibold truncate max-w-[180px]">
                              {item.itemNameSi || item.itemNameEn || '—'}
                            </td>
                            <td className="px-3 py-1.5 text-xs text-gray-600">
                              {item.specificationSi || item.specificationEn || '—'}
                            </td>
                            <td className="px-3 py-1.5 text-xs font-mono text-emerald-800 font-semibold">
                              {item.priceSi || item.priceEn || '—'}
                            </td>
                            <td className="px-3 py-1.5 text-xs text-gray-600">
                              {item.stockSi || item.stockEn || '—'}
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveInventoryItem(idx)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={13} />
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

            {/* TAB 2: Top 5 Featured Items */}
            {activeTab === 2 && (
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-wide">
                      3. ප්‍රධාන අලෙවි වන භාණ්ඩ 5 (TOP 5 FEATURED ITEMS) *
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      පැල තවාන් ආකෘතියට අනුව මෙම සපයන්නාගේ ප්‍රධාන වශයෙන් අලෙවි වන නිෂ්පාදන 5 ක් ඡායාරූපය, මිල සහ ප්‍රභේදය සමග එක් කරන්න.
                    </p>
                  </div>
                  <span className="text-[10px] px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    {formData.featuredItems.length} / 5 ක් එක්කර ඇත
                  </span>
                </div>

                {/* Input Row for Featured Item with Image Upload Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 bg-slate-50 p-3 rounded-xl border border-gray-200 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">භාණ්ඩ වර්ගය</label>
                    <input
                      type="text"
                      value={featItemType}
                      onChange={(e) => setFeatItemType(e.target.value)}
                      placeholder="උදා: ඔයිස්ටර් බිම්මල් බීජ"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">ප්‍රභේදය / පිරිවිතර</label>
                    <input
                      type="text"
                      value={featVariety}
                      onChange={(e) => setFeatVariety(e.target.value)}
                      placeholder="උදා: ඇමරිකන් ඔයිස්ටර්"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">ඒකක මිල</label>
                    <input
                      type="text"
                      value={featPrice}
                      onChange={(e) => setFeatPrice(e.target.value)}
                      placeholder="උදා: රු. 240 (බෝතලයක්)"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                    />
                  </div>

                  {/* Direct Image Upload Box */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">ඡායාරූපය (Upload Photo)</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="file"
                        ref={featImgInputRef}
                        accept="image/*"
                        onChange={handleFeaturedImageUpload}
                        className="hidden"
                      />
                      {featImageUrl ? (
                        <div className="relative w-8 h-8 rounded border border-gray-300 overflow-hidden shrink-0 group">
                          <img src={featImageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFeatImageUrl('')}
                            className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            title="Remove Photo"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => featImgInputRef.current?.click()}
                        disabled={isUploadingFeatImg}
                        className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-[11px] text-gray-700 font-medium cursor-pointer transition truncate shadow-2xs"
                      >
                        {isUploadingFeatImg ? (
                          <RefreshCw size={12} className="animate-spin text-emerald-600" />
                        ) : (
                          <UploadCloud size={13} className="text-gray-500" />
                        )}
                        <span>{featImageUrl ? 'Change' : 'Upload'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-gray-600">ප්‍රවර්ධන ලේබලය</label>
                      {/* Quick Add Button for Badge (Admin Only) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setQuickAddType('badge')}
                          className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                          title="Quick Add Badge"
                        >
                          <Plus size={10} />
                          <span>New</span>
                        </button>
                      )}
                    </div>
                    <select
                      value={featBadgeId}
                      onChange={(e) => setFeatBadgeId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                    >
                      <option value="">තෝරන්න</option>
                      {localOptions.badges.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nameSi || b.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleAddFeaturedItem}
                      disabled={formData.featuredItems.length >= 5}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:cursor-not-allowed transition shadow-xs"
                    >
                      <Plus size={13} />
                      <span>එක්කරන්න</span>
                    </button>
                  </div>
                </div>

                {/* Table of featured items */}
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100/80 border-b border-gray-200">
                        <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-600">ඡායාරූපය</th>
                        <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-600">භාණ්ඩ වර්ගය</th>
                        <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-600">ප්‍රභේදය / පිරිවිතර</th>
                        <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-600">ඒකක මිල</th>
                        <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-600">ලේබලය</th>
                        <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-600 text-right">ක්‍රියා</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {formData.featuredItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-5 text-center text-gray-400 text-xs italic">
                            තවමත් ප්‍රධාන අලෙවි වන භාණ්ඩ එක්කර නැත (උපරිම 5ක් එක් කළ හැක).
                          </td>
                        </tr>
                      ) : (
                        formData.featuredItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-3 py-1.5">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.itemTypeSi}
                                  className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                                  <ImageIcon size={13} />
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-xs text-gray-900 font-semibold">
                              {item.itemTypeSi || item.itemTypeEn || '—'}
                            </td>
                            <td className="px-3 py-1.5 text-xs text-gray-600">
                              {item.varietySi || item.varietyEn || '—'}
                            </td>
                            <td className="px-3 py-1.5 text-xs font-mono text-emerald-800 font-semibold">
                              {item.priceSi || item.priceEn || '—'}
                            </td>
                            <td className="px-3 py-1.5">
                              {item.badgeName ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  {item.badgeName}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveFeaturedItem(idx)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={13} />
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

            {/* TAB 3: Categories & Delivery / Operating Hours */}
            {activeTab === 3 && (
              <>
                {/* Section 4: Available Categories Checkboxes */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-wide">
                      4. සපයනු ලබන සියලුම ප්‍රධාන අමුද්‍රව්‍ය කාණ්ඩ සලකුණු කරන්න (CATEGORIES AVAILABLE) *
                    </h3>
                    {/* Quick Add Button for Category (Admin Only) */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setQuickAddType('category')}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 cursor-pointer transition"
                      >
                        <Plus size={12} />
                        <span>New Category</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {localOptions.categories.map((cat) => {
                      const isSelected = formData.categoryIds.includes(cat.id);
                      return (
                        <div
                          key={cat.id}
                          onClick={() => handleToggleCategory(cat.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${isSelected
                            ? 'bg-emerald-50/90 border-emerald-400 shadow-2xs'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { }}
                            className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 pointer-events-none"
                          />
                          <div>
                            <span className="font-semibold text-gray-900 block text-xs">
                              {cat.nameSi || cat.nameEn}
                            </span>
                            {cat.nameEn && cat.nameSi && (
                              <span className="text-[10px] text-gray-400 block font-sans">
                                {cat.nameEn}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 5: Delivery, Hours, Photos & Business Description */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Delivery */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-gray-700">
                          ප්‍රවාහන පහසුකම් (Delivery) *
                        </label>
                        {/* Quick Add Button for Delivery (Admin Only) */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setQuickAddType('delivery')}
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                          >
                            <Plus size={11} />
                            <span>Add Option</span>
                          </button>
                        )}
                      </div>
                      <select
                        value={formData.deliveryId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, deliveryId: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                      >
                        <option value="">තෝරන්න</option>
                        {localOptions.deliveries.map((del) => (
                          <option key={del.id} value={del.id}>
                            {del.nameSi || del.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operating Hours */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-gray-700">
                          විවෘත වේලාවන් (Operating Hours) *
                        </label>
                        {/* Quick Add Button for Operating Hours (Admin Only) */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setQuickAddType('operatingHours')}
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                          >
                            <Plus size={11} />
                            <span>Add Preset</span>
                          </button>
                        )}
                      </div>
                      <select
                        value={formData.operatingHoursId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, operatingHoursId: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                      >
                        <option value="">තෝරන්න</option>
                        {localOptions.operatingHours.map((hrs) => (
                          <option key={hrs.id} value={hrs.id}>
                            {hrs.nameSi || hrs.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 4: Photos, Maps & Business Description */}
            {activeTab === 4 && (
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-wide">
                    5. ඡායාරූප, Google Maps සහ සවිස්තර හැඳින්වීම (PHOTOS & ABOUT)
                  </h3>
                </div>

                {/* Photos Upload Box (Replacing URL text input as requested) */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                    ඡායාරූප (Supplier Photos & Gallery)
                  </label>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingGallery(true);
                    }}
                    onDragLeave={() => setIsDraggingGallery(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingGallery(false);
                      if (e.dataTransfer.files) handleGalleryFiles(e.dataTransfer.files);
                    }}
                    onClick={() => galleryInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${isDraggingGallery
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                  >
                    <input
                      type="file"
                      ref={galleryInputRef}
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) handleGalleryFiles(e.target.files);
                      }}
                      className="hidden"
                    />

                    <div className="flex flex-col items-center justify-center gap-1.5">
                      {isUploadingGallery ? (
                        <RefreshCw size={22} className="animate-spin text-emerald-600" />
                      ) : (
                        <UploadCloud size={24} className="text-gray-400" />
                      )}
                      <p className="text-xs font-semibold text-gray-700">
                        {isUploadingGallery ? 'Uploading photos...' : 'Click or drag photos here to upload directly'}
                      </p>
                      <p className="text-[10px] text-gray-400">PNG, JPG, WebP supported</p>
                    </div>
                  </div>

                  {/* Uploaded Photos Grid */}
                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 mt-3">
                      {uploadedPhotos.map((photo, idx) => (
                        <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50 shadow-2xs">
                          <img src={photo.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setUploadedPhotos((prev) =>
                                  prev.map((p, i) => ({ ...p, isPrimary: i === idx }))
                                );
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${photo.isPrimary ? 'bg-emerald-600 text-white' : 'bg-white/80 text-gray-800 hover:bg-white'
                                }`}
                            >
                              {photo.isPrimary ? 'Primary' : 'Set Primary'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-1 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          {photo.isPrimary && (
                            <span className="absolute bottom-1 right-1 bg-emerald-700 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                    Google Maps සබැඳිය (Location URL)
                  </label>
                  <input
                    type="text"
                    value={formData.googleMapsUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, googleMapsUrl: e.target.value }))}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                    ව්‍යාපාරය පිළිබඳ සවිස්තර හැඳින්වීම
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descriptionSi}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        descriptionSi: e.target.value,
                        descriptionEn: prev.descriptionEn || e.target.value
                      }))
                    }
                    placeholder="බිම්මල් වගාව, බීජ නිෂ්පාදනය, ලී කුඩු, PP පොලිතින් සහ පුළුන්/කරපටි සැපයීම පිළිබඳ විස්තරය..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                  />
                </div>

                {/* Active Status Toggle (Admin Only) or Approval Notice (Public Users) */}
                {isAdmin ? (
                  <div className="flex items-center gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="activeStateToggle"
                      checked={formData.activeState}
                      onChange={(e) => setFormData((prev) => ({ ...prev, activeState: e.target.checked }))}
                      className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                    />
                    <label htmlFor="activeStateToggle" className="text-xs font-semibold text-gray-800 cursor-pointer">
                      සක්‍රීය තත්ත්වය (Active State)
                    </label>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-amber-950">පරිපාලක අනුමැතිය අවශ්‍යයි (Pending Admin Approval)</p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        ඔබගේ බිම්මල් ව්‍යාපාර තොරතුරු අපගේ පරිපාලක මණ්ඩලය (Admin) විසින් පරීක්ෂා කර අනුමත කළ පසු වෙබ් අඩවියේ සක්‍රීයව ප්‍රදර්ශනය වේ.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sticky Modal Footer Actions */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3.5 pb-1 border-t border-gray-200 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  {!editingItem && (
                    <span className="hidden sm:inline-flex items-center text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-medium">
                      <span>දත්ත දින 7ක් auto-saved</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeTab > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevTab}
                      disabled={isSubmitting}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                    >
                      <ChevronLeft size={14} />
                      <span>පෙර පියවර</span>
                    </button>
                  )}

                  {activeTab < TABS.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextTab}
                      className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs"
                    >
                      <span>මීළඟ පියවර</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-6 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          <span>
                            {editingItem
                              ? 'Update Supplier'
                              : isAdmin
                                ? 'Save Supplier'
                                : 'යොමු කරන්න (Submit for Approval)'}
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Quick Add Modal (Admin Only) */}
      {isAdmin && quickAddType && (
        <MushroomQuickAddModal
          isOpen={Boolean(quickAddType)}
          onClose={() => setQuickAddType(null)}
          type={quickAddType}
          onCreated={handleMasterCreated}
        />
      )}
    </>
  );
}
