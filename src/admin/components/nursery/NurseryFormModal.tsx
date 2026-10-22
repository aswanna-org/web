import { useState, useEffect, useRef, useMemo, type ChangeEvent, type FormEvent, type DragEvent } from 'react';
import {
  X,
  RotateCcw,
  Plus,
  Trash2,
  MapPin,
  Award,
  Truck,
  Image as ImageIcon,
  Sprout,
  Check,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Star,
  RefreshCw,
  FileText,
  Flame,
  Clock
} from 'lucide-react';
import type {
  NurseryItem,
  FormDropdownOptions,
  NurseryFormState,
  AssociateOption
} from './types';
import NurseryQuickAddModal, { type MasterDataType } from './NurseryQuickAddModal';
import {
  SRI_LANKA_PROVINCES,
  getDistrictsForProvince,
  getDSDsForDistrict,
  getGNDsForDSD
} from '../../../data/sriLankaLocations';

const STOCK_RANGES = [
  '50 - 100',
  '100 - 500',
  '500 - 1,000',
  '1,000 - 5,000',
  '5,000 - 10,000',
  '10,000+'
];

interface NurseryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem: NurseryItem | null;
  options: FormDropdownOptions;
  onOptionsRefresh?: () => Promise<void> | void;
}

const initialFormState: NurseryFormState = {
  nameSi: '',
  nameEn: '',
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
  isGovRegistered: false,
  certificateNo: '',
  gradeId: '',
  deliveryId: '',
  operatingHoursId: '',
  certificationId: '',
  photos: [],
  stocks: [],
  specialtyIds: [],
  fastSellingItems: [],
  googleMapsUrl: '',
  descriptionSi: '',
  descriptionEn: '',
  activeState: true
};

const ADMIN_DRAFT_KEY = 'aswanna_admin_nursery_draft';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type QuickAddContext =
  | 'grade'
  | 'delivery'
  | 'operatingHours'
  | 'certification'
  | 'fastCategory'
  | 'fastCrop'
  | 'fastVariety'
  | 'fastBadge'
  | 'stockCategory'
  | 'stockCrop'
  | 'stockVariety'
  | 'specialty';

export default function NurseryFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
  options,
  onOptionsRefresh
}: NurseryFormModalProps) {
  const [formData, setFormData] = useState<NurseryFormState>(initialFormState);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  // Local synced options so that in-line quick-added masters appear immediately
  const [localOptions, setLocalOptions] = useState<FormDropdownOptions>(options);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  // Quick-Add Modal State
  const [quickAddType, setQuickAddType] = useState<MasterDataType | null>(null);
  const [quickAddContext, setQuickAddContext] = useState<QuickAddContext | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Custom text toggles if DSD or GND needs manual input
  const [isCustomDsd, setIsCustomDsd] = useState(false);
  const [isCustomGnd, setIsCustomGnd] = useState(false);

  // New stock entry temp state
  const [newStockCategory, setNewStockCategory] = useState('');
  const [newStockCrop, setNewStockCrop] = useState('');
  const [newStockVariety, setNewStockVariety] = useState('');
  const [newStockRange, setNewStockRange] = useState('500 - 1,000');

  // Fast selling entry temp state
  const [newFastCategory, setNewFastCategory] = useState('');
  const [newFastCrop, setNewFastCrop] = useState('');
  const [newFastVariety, setNewFastVariety] = useState('');
  const [newFastPrice, setNewFastPrice] = useState('');
  const [newFastPriceSi, setNewFastPriceSi] = useState('');
  const [newFastPhoto, setNewFastPhoto] = useState('');
  const [newFastBadge, setNewFastBadge] = useState('');
  const [isUploadingFastPhoto, setIsUploadingFastPhoto] = useState(false);
  const [isDraggingFast, setIsDraggingFast] = useState(false);
  const fastPhotoInputRef = useRef<HTMLInputElement | null>(null);

  // Filter crops based on selected category
  const availableFastCrops = useMemo(() => {
    if (!newFastCategory) return localOptions.crops;
    return localOptions.crops.filter((c) => !c.categoryId || c.categoryId === newFastCategory);
  }, [localOptions.crops, newFastCategory]);

  // Filter varieties based on selected crop (Crop -> Variety hierarchy)
  const availableFastVarieties = useMemo(() => {
    if (!newFastCrop) {
      if (!newFastCategory) return localOptions.varieties;
      return localOptions.varieties.filter((v) => !v.crop?.categoryId || v.crop.categoryId === newFastCategory);
    }
    return localOptions.varieties.filter((v) => v.cropId === newFastCrop);
  }, [localOptions.varieties, newFastCrop, newFastCategory]);

  const availableStockCrops = useMemo(() => {
    if (!newStockCategory) return localOptions.crops;
    return localOptions.crops.filter((c) => !c.categoryId || c.categoryId === newStockCategory);
  }, [localOptions.crops, newStockCategory]);

  // Filter stock varieties based on selected crop (Crop -> Variety hierarchy)
  const availableStockVarieties = useMemo(() => {
    if (!newStockCrop) {
      if (!newStockCategory) return localOptions.varieties;
      return localOptions.varieties.filter((v) => !v.crop?.categoryId || v.crop.categoryId === newStockCategory);
    }
    return localOptions.varieties.filter((v) => v.cropId === newStockCrop);
  }, [localOptions.varieties, newStockCrop, newStockCategory]);

  const openQuickAdd = (type: MasterDataType, context: QuickAddContext) => {
    setQuickAddType(type);
    setQuickAddContext(context);
  };

  const handleQuickAddSuccess = (createdItem: AssociateOption, type: MasterDataType) => {
    // 1. Optimistically append into localOptions so it's instantly available in selects
    setLocalOptions((prev) => {
      const copy = { ...prev };
      if (type === 'grade') copy.grades = [...copy.grades.filter((i) => i.id !== createdItem.id), createdItem];
      else if (type === 'delivery') copy.deliveries = [...copy.deliveries.filter((i) => i.id !== createdItem.id), createdItem];
      else if (type === 'operatingHours') copy.operatingHours = [...copy.operatingHours.filter((i) => i.id !== createdItem.id), createdItem];
      else if (type === 'certification') copy.certifications = [...copy.certifications.filter((i) => i.id !== createdItem.id), createdItem];
      else if (type === 'category') copy.categories = [...copy.categories.filter((i) => i.id !== createdItem.id), createdItem];
      else if (type === 'crop') copy.crops = [...copy.crops.filter((i) => i.id !== createdItem.id), createdItem];
      else if (type === 'variety') copy.varieties = [...copy.varieties.filter((i) => i.id !== createdItem.id), createdItem];
      else if (type === 'specialty') copy.specialties = [...copy.specialties.filter((i) => i.id !== createdItem.id), createdItem];
      else if (type === 'badge') copy.badges = [...copy.badges.filter((i) => i.id !== createdItem.id), createdItem];
      return copy;
    });

    // 2. Auto-select created item into relevant state without disturbing any other nursery form data
    if (quickAddContext === 'grade') {
      setFormData((prev) => ({ ...prev, gradeId: createdItem.id }));
    } else if (quickAddContext === 'delivery') {
      setFormData((prev) => ({ ...prev, deliveryId: createdItem.id }));
    } else if (quickAddContext === 'operatingHours') {
      setFormData((prev) => ({ ...prev, operatingHoursId: createdItem.id }));
    } else if (quickAddContext === 'certification') {
      setFormData((prev) => ({ ...prev, certificationId: createdItem.id }));
    } else if (quickAddContext === 'fastCategory') {
      setNewFastCategory(createdItem.id);
    } else if (quickAddContext === 'fastCrop') {
      setNewFastCrop(createdItem.id);
      if (createdItem.categoryId) setNewFastCategory(createdItem.categoryId);
    } else if (quickAddContext === 'fastVariety') {
      setNewFastVariety(createdItem.id);
      if (createdItem.cropId) setNewFastCrop(createdItem.cropId);
      if (createdItem.crop?.categoryId) setNewFastCategory(createdItem.crop.categoryId);
    } else if (quickAddContext === 'fastBadge') {
      setNewFastBadge(createdItem.id);
    } else if (quickAddContext === 'stockCategory') {
      setNewStockCategory(createdItem.id);
    } else if (quickAddContext === 'stockCrop') {
      setNewStockCrop(createdItem.id);
      if (createdItem.categoryId) setNewStockCategory(createdItem.categoryId);
    } else if (quickAddContext === 'stockVariety') {
      setNewStockVariety(createdItem.id);
      if (createdItem.cropId) setNewStockCrop(createdItem.cropId);
      if (createdItem.crop?.categoryId) setNewStockCategory(createdItem.crop.categoryId);
    } else if (quickAddContext === 'specialty') {
      setFormData((prev) => ({
        ...prev,
        specialtyIds: prev.specialtyIds.includes(createdItem.id)
          ? prev.specialtyIds
          : [...prev.specialtyIds, createdItem.id]
      }));
    }

    // 3. Trigger options refresh in background
    onOptionsRefresh?.();
  };

  const initialCategoryIdForQuickAdd =
    quickAddContext === 'fastCrop' || quickAddContext === 'fastVariety'
      ? newFastCategory
      : quickAddContext === 'stockCrop' || quickAddContext === 'stockVariety'
      ? newStockCategory
      : '';

  const initialCropIdForQuickAdd =
    quickAddContext === 'fastVariety'
      ? newFastCrop
      : quickAddContext === 'stockVariety'
      ? newStockCrop
      : '';

  useEffect(() => {
    if (editingItem) {
      setDraftRestored(false);
      const loc = editingItem.location || {};
      const photos = (editingItem.images || []).map((img) => img.imageUrl).filter(Boolean);

      setFormData({
        nameSi: editingItem.nameSi || '',
        nameEn: editingItem.nameEn || '',
        ownerNameSi: editingItem.ownerNameSi || '',
        ownerNameEn: editingItem.ownerNameEn || '',
        whatsappNumber: editingItem.whatsappNumber || '',
        provinceEn: loc.provinceEn || '',
        provinceSi: loc.provinceSi || '',
        districtEn: loc.districtEn || '',
        districtSi: loc.districtSi || '',
        divisionalSecretariatSi: loc.divisionalSecretariatSi || '',
        divisionalSecretariatEn: loc.divisionalSecretariatEn || '',
        gramaNiladhariDivisionSi: loc.gramaNiladhariDivisionSi || '',
        gramaNiladhariDivisionEn: loc.gramaNiladhariDivisionEn || '',
        fullAddressSi: loc.fullAddressSi || '',
        fullAddressEn: loc.fullAddressEn || '',
        isGovRegistered: Boolean(editingItem.isGovRegistered),
        certificateNo: editingItem.certificateNo || '',
        gradeId: editingItem.gradeId || '',
        deliveryId: editingItem.deliveryId || '',
        operatingHoursId: editingItem.operatingHoursId || '',
        certificationId: editingItem.certificationId || '',
        photos,
        stocks: (editingItem.stocks || []).map((s) => ({
          categoryId: s.categoryId || '',
          cropId: s.cropId || '',
          varietyId: s.varietyId || '',
          stockRangeSi: s.stockRangeSi || '500 - 1,000',
          stockRangeEn: s.stockRangeEn || '500 - 1,000'
        })),
        specialtyIds: (editingItem.specialties || []).map((sp: any) => sp.id || sp.specialtyId),
        fastSellingItems: (editingItem.fastSellingItems || []).map((f) => ({
          categoryId: f.categoryId || '',
          cropId: f.cropId || '',
          varietyId: f.varietyId || '',
          priceEn: f.priceEn || f.priceSi || '',
          priceSi: f.priceSi || f.priceEn || '',
          imageUrl: f.imageUrl || '',
          badgeId: f.badgeId || ''
        })),
        googleMapsUrl: editingItem.googleMapsUrl || '',
        descriptionSi: editingItem.descriptionSi || '',
        descriptionEn: editingItem.descriptionEn || '',
        activeState: editingItem.activeState !== false
      });
      setUploadedImages(photos);
      setIsCustomDsd(false);
      setIsCustomGnd(false);
    } else {
      // Check for 7-day draft
      let restored = false;
      try {
        const raw = localStorage.getItem(ADMIN_DRAFT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.savedAt && (Date.now() - parsed.savedAt <= DRAFT_TTL_MS)) {
            if (parsed.formData) setFormData(parsed.formData);
            if (Array.isArray(parsed.uploadedImages)) setUploadedImages(parsed.uploadedImages);
            setDraftRestored(true);
            restored = true;
          } else {
            localStorage.removeItem(ADMIN_DRAFT_KEY);
          }
        }
      } catch {
        localStorage.removeItem(ADMIN_DRAFT_KEY);
      }

      if (!restored) {
        setDraftRestored(false);
        setFormData(initialFormState);
        setUploadedImages([]);
      }
      setIsCustomDsd(false);
      setIsCustomGnd(false);
    }
    setErrorMsg(null);
  }, [editingItem, isOpen]);

  // Persist draft for 7 days when creating a new nursery
  useEffect(() => {
    if (!isOpen || editingItem) return;
    const hasData =
      Boolean(formData.nameEn || formData.nameSi || formData.whatsappNumber || uploadedImages.length > 0 || formData.fastSellingItems.length > 0 || formData.stocks.length > 0);
    if (!hasData) return;

    try {
      localStorage.setItem(
        ADMIN_DRAFT_KEY,
        JSON.stringify({
          savedAt: Date.now(),
          formData,
          uploadedImages
        })
      );
    } catch {}
  }, [formData, uploadedImages, isOpen, editingItem]);

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(ADMIN_DRAFT_KEY);
    } catch {}
    setDraftRestored(false);
    setFormData(initialFormState);
    setUploadedImages([]);
    setNewFastCrop('');
    setNewFastVariety('');
    setNewFastPrice('');
    setNewFastPhoto('');
    setNewFastBadge('');
  };

  if (!isOpen) return null;

  // Cascading options using sl-gnd-dsd-districts helpers
  const availableDistricts = getDistrictsForProvince(formData.provinceEn);
  const availableDsds = getDSDsForDistrict(formData.districtEn);
  const availableGnds = getGNDsForDSD(formData.divisionalSecretariatEn, formData.districtEn);

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

  const handleDsdChange = (e: ChangeEvent<HTMLSelectElement>) => {
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
    const dsd = availableDsds.find((d) => d.nameEn === val);
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

  const handleGndChange = (e: ChangeEvent<HTMLSelectElement>) => {
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
    const gnd = availableGnds.find((g) => g.nameEn === val);
    setFormData((prev) => ({
      ...prev,
      gramaNiladhariDivisionEn: val,
      gramaNiladhariDivisionSi: gnd?.nameSi || val
    }));
    setIsCustomGnd(false);
  };

  // Image Upload Handler (Supports drag-and-drop & multi-select up to 5 files at once, max 50MB)
  const uploadFiles = async (files: File[]) => {
    const remainingSlots = 5 - uploadedImages.length;
    if (remainingSlots <= 0) {
      setErrorMsg('You can upload a maximum of 5 photos.');
      return;
    }

    // 50MB max file size check
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setErrorMsg(`File "${file.name}" exceeds the maximum 50MB limit.`);
        return;
      }
    }

    const filesToUpload = files.slice(0, remainingSlots);
    setIsUploading(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const uploadFormData = new FormData();
      filesToUpload.forEach((file) => uploadFormData.append('images', file));

      const authHeaders: Record<string, string> = {};
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/nurseries/upload-images`, {
        method: 'POST',
        headers: authHeaders,
        body: uploadFormData
      });

      if (res.ok) {
        const json = await res.json();
        if (json.urls && Array.isArray(json.urls)) {
          setUploadedImages((prev) => [...prev, ...json.urls].slice(0, 5));
          return;
        }
      }

      let backendError = '';
      try {
        const errJson = await res.json();
        backendError = errJson.error || '';
      } catch {
        backendError = `HTTP ${res.status}`;
      }

      // Fallback: sequential single upload to /upload/image
      const fallbackUrls: string[] = [];
      for (const file of filesToUpload) {
        const singleData = new FormData();
        singleData.append('image', file);
        const singleRes = await fetch(`${API_BASE}/upload/image`, {
          method: 'POST',
          headers: authHeaders,
          body: singleData
        });
        if (singleRes.ok) {
          const sJson = await singleRes.json();
          if (sJson.url) fallbackUrls.push(sJson.url);
        } else {
          try {
            const sErr = await singleRes.json();
            if (sErr.error) backendError = sErr.error;
          } catch {}
        }
      }

      if (fallbackUrls.length > 0) {
        setUploadedImages((prev) => [...prev, ...fallbackUrls].slice(0, 5));
      } else {
        throw new Error(backendError || 'Failed to upload image(s). Please verify file format and size (max 50MB).');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMsg(err.message || 'Failed to upload image(s).');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (imageFiles.length > 0) {
        await uploadFiles(imageFiles);
      }
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageFiles = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (imageFiles.length > 0) {
        await uploadFiles(imageFiles);
      }
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setUploadedImages((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
  };

  // Stock Handlers
  const handleAddStock = () => {
    if (!newStockCategory && !newStockCrop) return;

    setFormData((prev) => ({
      ...prev,
      stocks: [
        ...prev.stocks,
        {
          categoryId: newStockCategory || null,
          cropId: newStockCrop || null,
          varietyId: newStockVariety || null,
          stockRangeSi: newStockRange,
          stockRangeEn: newStockRange
        }
      ]
    }));

    setNewStockCrop('');
    setNewStockVariety('');
  };

  const handleRemoveStock = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      stocks: prev.stocks.filter((_, idx) => idx !== index)
    }));
  };

  const handleToggleSpecialty = (specialtyId: string) => {
    setFormData((prev) => {
      const exists = prev.specialtyIds.includes(specialtyId);
      return {
        ...prev,
        specialtyIds: exists
          ? prev.specialtyIds.filter((id) => id !== specialtyId)
          : [...prev.specialtyIds, specialtyId]
      };
    });
  };

  // Fast Selling Handlers
  const handleAddFastSellingItem = () => {
    if (formData.fastSellingItems.length >= 4) {
      setErrorMsg('Maximum 4 fast-selling items can be added.');
      return;
    }
    if (!newFastCategory && !newFastCrop && !newFastVariety && !newFastPrice.trim()) {
      setErrorMsg('Please specify at least Category, Crop or Variety and Price for the fast-selling item.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      fastSellingItems: [
        ...prev.fastSellingItems,
        {
          categoryId: newFastCategory,
          cropId: newFastCrop,
          varietyId: newFastVariety,
          priceEn: newFastPrice.trim(),
          priceSi: newFastPriceSi.trim() || newFastPrice.trim(),
          imageUrl: newFastPhoto.trim(),
          badgeId: newFastBadge
        }
      ]
    }));
    setNewFastCategory('');
    setNewFastCrop('');
    setNewFastVariety('');
    setNewFastPrice('');
    setNewFastPriceSi('');
    setNewFastPhoto('');
    setNewFastBadge('');
    setErrorMsg(null);
  };

  const handleRemoveFastSellingItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fastSellingItems: prev.fastSellingItems.filter((_, idx) => idx !== index)
    }));
  };

  const handleFastPhotoUpload = async (file: File) => {
    if (!file) return;

    // Check size limit: max 50MB
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(`Photo "${file.name}" exceeds the maximum 50MB file size limit.`);
      return;
    }

    setIsUploadingFastPhoto(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      uploadFormData.append('images', file);

      const authHeaders: Record<string, string> = {};
      if (token && token !== 'null' && token !== 'undefined') {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      let uploadedUrl = '';

      // Try /nurseries/upload-image first
      try {
        const res = await fetch(`${API_BASE}/nurseries/upload-image`, {
          method: 'POST',
          headers: authHeaders,
          body: uploadFormData
        });

        if (res.ok) {
          const json = await res.json();
          uploadedUrl = json.url || json.urls?.[0] || json.data?.url || (Array.isArray(json.data) ? json.data[0] : '');
        }
      } catch (err) {
        console.warn('Nursery direct upload failed, trying general upload:', err);
      }

      // Fallback to /upload/image
      if (!uploadedUrl) {
        const fallbackRes = await fetch(`${API_BASE}/upload/image`, {
          method: 'POST',
          headers: authHeaders,
          body: uploadFormData
        });

        if (fallbackRes.ok) {
          const fJson = await fallbackRes.json();
          uploadedUrl = fJson.url || fJson.urls?.[0] || fJson.data?.url || (Array.isArray(fJson.data) ? fJson.data[0] : '');
        }
      }

      if (uploadedUrl) {
        setNewFastPhoto(uploadedUrl);
        setErrorMsg(null);
      } else {
        throw new Error('Failed to upload plant photo. Please check format and network connection.');
      }
    } catch (err: any) {
      console.error('Failed to upload fast photo:', err);
      setErrorMsg(err.message || 'Failed to upload plant photo.');
    } finally {
      setIsUploadingFastPhoto(false);
      if (fastPhotoInputRef.current) fastPhotoInputRef.current.value = '';
    }
  };

  const handleFastDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFast(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'));
      if (file) {
        await handleFastPhotoUpload(file);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const name = formData.nameEn.trim() || formData.nameSi.trim();
    if (!name) {
      setErrorMsg('Please enter the Nursery Name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const payload = {
        nameEn: formData.nameEn.trim() || formData.nameSi.trim(),
        nameSi: formData.nameSi.trim() || formData.nameEn.trim(),
        ownerNameEn: formData.ownerNameEn.trim() || formData.ownerNameSi.trim() || null,
        ownerNameSi: formData.ownerNameSi.trim() || formData.ownerNameEn.trim() || null,
        whatsappNumber: formData.whatsappNumber.trim() || null,
        isGovRegistered: formData.isGovRegistered,
        certificateNo: formData.certificateNo.trim() || null,
        gradeId: formData.gradeId || null,
        deliveryId: formData.deliveryId || null,
        operatingHoursId: formData.operatingHoursId || null,
        certificationId: formData.certificationId || null,
        googleMapsUrl: formData.googleMapsUrl.trim() || null,
        descriptionEn: formData.descriptionEn.trim() || formData.descriptionSi.trim() || null,
        descriptionSi: formData.descriptionSi.trim() || formData.descriptionEn.trim() || null,
        activeState: formData.activeState,
        location: {
          provinceEn: formData.provinceEn || null,
          provinceSi: formData.provinceSi || null,
          districtEn: formData.districtEn || null,
          districtSi: formData.districtSi || null,
          divisionalSecretariatEn: formData.divisionalSecretariatEn.trim() || null,
          divisionalSecretariatSi: formData.divisionalSecretariatSi.trim() || null,
          gramaNiladhariDivisionEn: formData.gramaNiladhariDivisionEn.trim() || null,
          gramaNiladhariDivisionSi: formData.gramaNiladhariDivisionSi.trim() || null,
          fullAddressEn: formData.fullAddressEn.trim() || formData.fullAddressSi.trim() || null,
          fullAddressSi: formData.fullAddressSi.trim() || formData.fullAddressEn.trim() || null
        },
        images: uploadedImages.map((url, idx) => ({
          imageUrl: url,
          isPrimary: idx === 0
        })),
        stocks: formData.stocks.map((s) => ({
          categoryId: s.categoryId || null,
          cropId: s.cropId || null,
          varietyId: s.varietyId || null,
          stockRangeEn: s.stockRangeEn || '500 - 1,000',
          stockRangeSi: s.stockRangeSi || '500 - 1,000'
        })),
        specialtyIds: formData.specialtyIds,
        fastSellingItems: formData.fastSellingItems.map((f) => ({
          categoryId: f.categoryId || null,
          cropId: f.cropId || null,
          varietyId: f.varietyId || null,
          priceEn: f.priceEn.trim() || null,
          priceSi: f.priceSi.trim() || f.priceEn.trim() || null,
          imageUrl: f.imageUrl.trim() || null,
          badgeId: f.badgeId || null
        }))
      };

      const url = editingItem
        ? `${API_BASE}/nurseries/${editingItem.id}`
        : `${API_BASE}/nurseries`;

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
        throw new Error(json.error || 'Failed to save nursery.');
      }

      try {
        localStorage.removeItem(ADMIN_DRAFT_KEY);
      } catch {}

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving nursery:', err);
      setErrorMsg(err.message || 'An error occurred while saving the nursery.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-6xl xl:max-w-7xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {editingItem ? 'Edit Nursery' : 'Add New Nursery'}
              </h2>
              <p className="text-[11px] text-gray-500">
                Manage location, certificates, photo gallery, available crops, varieties and stock ranges.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDiscardDraft}
              title="Reset Form"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body - Unified Consistent Neutral Theme (NO rainbow colored boxes) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {draftRestored && !editingItem && (
            <div className="flex items-center justify-between p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Restored unsubmitted draft. Your work is saved automatically for 7 days.</span>
              </div>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="text-amber-700 hover:text-amber-900 font-semibold underline text-xs cursor-pointer ml-3 shrink-0"
              >
                Discard Draft
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section: Basic Info (Name, Owner, Phone) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <FileText size={15} />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                Basic Nursery Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nursery Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value, nameSi: formData.nameSi || e.target.value })}
                  placeholder="e.g. Sarabima Plant Nursery & Agri Center"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  තවානේ නම (Sinhala / සිංහලෙන්)
                </label>
                <input
                  type="text"
                  value={formData.nameSi}
                  onChange={(e) => setFormData({ ...formData, nameSi: e.target.value })}
                  placeholder="උදා: සරබිම පැළ තවාන සහ කෘෂි මධ්‍යස්ථානය"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Owner's Name (English)
                </label>
                <input
                  type="text"
                  value={formData.ownerNameEn}
                  onChange={(e) => setFormData({ ...formData, ownerNameEn: e.target.value, ownerNameSi: formData.ownerNameSi || e.target.value })}
                  placeholder="e.g. Mr. K. R. Gunasekara"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  හිමිකරුගේ නම (Sinhala / සිංහලෙන්)
                </label>
                <input
                  type="text"
                  value={formData.ownerNameSi}
                  onChange={(e) => setFormData({ ...formData, ownerNameSi: e.target.value })}
                  placeholder="උදා: කේ. ආර්. ගුණසේකර මහතා"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="07X XXXXXXX"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-gray-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Location Details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <MapPin size={15} />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                1. Location Details *
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Province */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Province *
                </label>
                <select
                  value={formData.provinceEn}
                  onChange={handleProvinceChange}
                  className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all cursor-pointer"
                >
                  <option value="">Select Province</option>
                  {SRI_LANKA_PROVINCES.map((prov) => (
                    <option key={prov.en} value={prov.en}>
                      {prov.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  District *
                </label>
                <select
                  value={formData.districtEn}
                  onChange={handleDistrictChange}
                  disabled={!formData.provinceEn}
                  className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{formData.provinceEn ? 'Select District' : 'Select Province First'}</option>
                  {availableDistricts.map((dist) => (
                    <option key={dist.en} value={dist.en}>
                      {dist.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divisional Secretariat Division (DSD) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    Divisional Secretariat (DSD) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomDsd(!isCustomDsd);
                      setFormData((prev) => ({ ...prev, divisionalSecretariatEn: '', divisionalSecretariatSi: '' }));
                    }}
                    className="text-[10px] text-emerald-700 hover:underline cursor-pointer"
                  >
                    {isCustomDsd ? 'List' : 'Custom'}
                  </button>
                </div>
                {isCustomDsd ? (
                  <input
                    type="text"
                    value={formData.divisionalSecretariatEn}
                    onChange={(e) => setFormData({
                      ...formData,
                      divisionalSecretariatEn: e.target.value,
                      divisionalSecretariatSi: formData.divisionalSecretariatSi || e.target.value
                    })}
                    placeholder="e.g. Narammala"
                    className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                ) : (
                  <select
                    value={formData.divisionalSecretariatEn}
                    onChange={handleDsdChange}
                    disabled={!formData.districtEn}
                    className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{formData.districtEn ? 'Select DSD' : 'Select District First'}</option>
                    {availableDsds.map((dsd) => (
                      <option key={dsd.nameEn} value={dsd.nameEn}>
                        {dsd.nameEn}
                      </option>
                    ))}
                    <option value="__custom__">+ Custom DSD...</option>
                  </select>
                )}
              </div>

              {/* Grama Niladhari Division (GND) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    Grama Niladhari Division (GND) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomGnd(!isCustomGnd);
                      setFormData((prev) => ({ ...prev, gramaNiladhariDivisionEn: '', gramaNiladhariDivisionSi: '' }));
                    }}
                    className="text-[10px] text-emerald-700 hover:underline cursor-pointer"
                  >
                    {isCustomGnd ? 'List' : 'Custom'}
                  </button>
                </div>
                {isCustomGnd ? (
                  <input
                    type="text"
                    value={formData.gramaNiladhariDivisionEn}
                    onChange={(e) => setFormData({
                      ...formData,
                      gramaNiladhariDivisionEn: e.target.value,
                      gramaNiladhariDivisionSi: formData.gramaNiladhariDivisionSi || e.target.value
                    })}
                    placeholder="e.g. 512-Dambehera"
                    className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                ) : (
                  <select
                    value={formData.gramaNiladhariDivisionEn}
                    onChange={handleGndChange}
                    disabled={!formData.divisionalSecretariatEn}
                    className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{formData.divisionalSecretariatEn ? 'Select GND' : 'Select DSD First'}</option>
                    {availableGnds.map((gnd) => (
                      <option key={gnd.nameEn + (gnd.gnCode || '')} value={gnd.nameEn}>
                        {gnd.nameEn} {gnd.gnCode ? `(${gnd.gnCode})` : ''}
                      </option>
                    ))}
                    <option value="__custom__">+ Custom GND...</option>
                  </select>
                )}
              </div>
            </div>

            {/* Full Physical Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Full Physical Address (English) *
                </label>
                <input
                  type="text"
                  value={formData.fullAddressEn}
                  onChange={(e) => setFormData({
                    ...formData,
                    fullAddressEn: e.target.value,
                    fullAddressSi: formData.fullAddressSi || e.target.value
                  })}
                  placeholder="e.g. No. 45, Kurunegala Road, Narammala."
                  className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  සම්පූර්ණ ලිපිනය (Sinhala / සිංහලෙන්)
                </label>
                <input
                  type="text"
                  value={formData.fullAddressSi}
                  onChange={(e) => setFormData({
                    ...formData,
                    fullAddressSi: e.target.value
                  })}
                  placeholder="උදා: නො. 45, කුරුණෑගල පාර, නාරම්මල."
                  className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Registration & Grade */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <Award size={15} />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                2. Government Registration & Nursery Grade *
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Is Government Registered? *
                </label>
                <select
                  value={formData.isGovRegistered ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isGovRegistered: e.target.value === 'true' })}
                  className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all cursor-pointer font-medium"
                >
                  <option value="true">Yes - Government Certified Nursery</option>
                  <option value="false">No - Standard / Private Nursery</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Registration / Certificate No
                </label>
                <input
                  type="text"
                  value={formData.certificateNo}
                  onChange={(e) => setFormData({ ...formData, certificateNo: e.target.value })}
                  placeholder="e.g. DOA/NUR/NW/2024/118"
                  className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-mono placeholder:text-gray-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    Nursery Grade *
                  </label>
                  <button
                    type="button"
                    onClick={() => openQuickAdd('grade', 'grade')}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    title="Add New Grade Preset"
                  >
                    <Plus size={11} />
                    <span>New</span>
                  </button>
                </div>
                <select
                  value={formData.gradeId}
                  onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all cursor-pointer font-bold text-gray-800"
                >
                  <option value="">Select Grade</option>
                  {localOptions.grades.map((gr) => (
                    <option key={gr.id} value={gr.id}>
                      {gr.nameEn || gr.nameSi}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Delivery, Hours & Certifications */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <Truck size={15} />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                3. Delivery Facility, Operating Hours & Certifications *
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    Delivery Facility *
                  </label>
                  <button
                    type="button"
                    onClick={() => openQuickAdd('delivery', 'delivery')}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    title="Add New Delivery Option"
                  >
                    <Plus size={11} />
                    <span>New</span>
                  </button>
                </div>
                <select
                  value={formData.deliveryId}
                  onChange={(e) => setFormData({ ...formData, deliveryId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all cursor-pointer"
                >
                  <option value="">Select Delivery Option</option>
                  {localOptions.deliveries.map((del) => (
                    <option key={del.id} value={del.id}>
                      {del.nameEn || del.nameSi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    Operating Hours & Days *
                  </label>
                  <button
                    type="button"
                    onClick={() => openQuickAdd('operatingHours', 'operatingHours')}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    title="Add New Operating Hours Preset"
                  >
                    <Plus size={11} />
                    <span>New</span>
                  </button>
                </div>
                <select
                  value={formData.operatingHoursId}
                  onChange={(e) => setFormData({ ...formData, operatingHoursId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all cursor-pointer"
                >
                  <option value="">Select Operating Hours</option>
                  {localOptions.operatingHours.map((oh) => (
                    <option key={oh.id} value={oh.id}>
                      {oh.nameEn || oh.nameSi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    Quality Certification (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => openQuickAdd('certification', 'certification')}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    title="Add New Certification Preset"
                  >
                    <Plus size={11} />
                    <span>New</span>
                  </button>
                </div>
                <select
                  value={formData.certificationId}
                  onChange={(e) => setFormData({ ...formData, certificationId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all cursor-pointer"
                >
                  <option value="">Select Certification</option>
                  {localOptions.certifications.map((cert) => (
                    <option key={cert.id} value={cert.id}>
                      {cert.nameEn || cert.nameSi}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Nursery Photos - Instant Drag & Drop / File Select (Up to 5) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                  <ImageIcon size={15} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                    4. Nursery Photos (Upload up to 5) *
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Drag and drop up to 5 photos together, or click to browse. First photo will be Primary.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {uploadedImages.length} of 5 photos uploaded
              </span>
            </div>

            {/* Hidden native multi-file input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Drag & Drop Zone */}
            {uploadedImages.length < 5 && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-600 bg-emerald-50/60 scale-[1.005]'
                    : 'border-gray-300 hover:border-emerald-500 hover:bg-gray-50/70 bg-gray-50/40'
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 text-emerald-800 py-3">
                    <RefreshCw className="w-7 h-7 animate-spin" />
                    <span className="text-xs font-semibold">Uploading photos to cloud storage...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center py-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center shadow-2xs">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        Drop up to 5 photos here, or <span className="text-emerald-700 underline">browse files</span>
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Supports multiple selection • JPG, PNG, WEBP, SVG up to 50MB each
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Uploaded Images Preview Grid */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {uploadedImages.map((url, idx) => {
                  const isPrimary = idx === 0;

                  return (
                    <div
                      key={idx}
                      className="group relative rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-2xs flex flex-col"
                    >
                      <div className="h-28 w-full relative overflow-hidden bg-gray-100">
                        <img
                          src={url}
                          alt={`Uploaded Photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />

                        {/* Primary Badge or Set Primary Button */}
                        {isPrimary ? (
                          <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                            <Star size={10} className="fill-current" />
                            Primary
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrimaryImage(idx);
                            }}
                            title="Set as Primary Cover Photo"
                            className="absolute top-1.5 left-1.5 bg-black/60 hover:bg-emerald-700 text-white text-[9px] font-semibold px-2 py-0.5 rounded transition-colors opacity-90 hover:opacity-100 cursor-pointer"
                          >
                            Set Primary
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          title="Remove Photo"
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="px-2.5 py-1.5 bg-white border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                        <span className="font-semibold text-gray-700">Photo {idx + 1}</span>
                        {isPrimary && <span className="text-emerald-700 font-bold">Cover</span>}
                      </div>
                    </div>
                  );
                })}

                {/* Add More button if under 5 */}
                {uploadedImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-28 rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <Plus size={20} />
                    <span className="text-[11px] font-semibold">Add More</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Fast-Selling / New Arrivals (Max 4) */}
          <div className="bg-white border border-rose-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-rose-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Flame size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span>Fast-Selling / New Arrivals</span>
                    <span className="text-[11px] font-normal text-rose-600">(Max 4)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Highlight up to 4 fast-selling or new arrival plants with crop, variety, unit price, photo, and badge.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70 shrink-0 self-start sm:self-auto">
                <Flame size={12} className="text-rose-500" />
                <span>{formData.fastSellingItems.length} / 4 Added</span>
              </div>
            </div>

            {/* Input Form Bar */}
            {formData.fastSellingItems.length < 4 ? (
              <div className="p-4 sm:p-5 bg-gray-50/70 border border-gray-200 rounded-xl space-y-4">
                {/* 1. Fields Row: Category, Crop, Variety, Unit Price, Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-gray-700">
                        Crop Category
                      </label>
                      <button
                        type="button"
                        onClick={() => openQuickAdd('category', 'fastCategory')}
                        className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                        title="Add New Crop Category"
                      >
                        <Plus size={11} />
                        <span>New</span>
                      </button>
                    </div>
                    <select
                      value={newFastCategory}
                      onChange={(e) => {
                        const catId = e.target.value;
                        setNewFastCategory(catId);
                        if (newFastCrop) {
                          const selectedCrop = localOptions.crops.find((c) => c.id === newFastCrop);
                          if (selectedCrop && selectedCrop.categoryId && selectedCrop.categoryId !== catId) {
                            setNewFastCrop('');
                            setNewFastVariety('');
                          }
                        }
                      }}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="">Select Category...</option>
                      {localOptions.categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nameEn || cat.nameSi}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-gray-700">
                        Crop Name
                      </label>
                      <button
                        type="button"
                        onClick={() => openQuickAdd('crop', 'fastCrop')}
                        className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                        title="Add New Crop"
                      >
                        <Plus size={11} />
                        <span>New</span>
                      </button>
                    </div>
                    <select
                      value={newFastCrop}
                      onChange={(e) => {
                        const cropId = e.target.value;
                        setNewFastCrop(cropId);
                        if (cropId && !newFastCategory) {
                          const cr = localOptions.crops.find((c) => c.id === cropId);
                          if (cr?.categoryId) setNewFastCategory(cr.categoryId);
                        }
                        if (newFastVariety) {
                          const vr = localOptions.varieties.find((v) => v.id === newFastVariety);
                          if (vr && vr.cropId && vr.cropId !== cropId) {
                            setNewFastVariety('');
                          }
                        }
                      }}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="">
                        {!newFastCategory ? 'Select Crop...' : 'Select Crop...'}
                      </option>
                      {availableFastCrops.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameEn || c.nameSi}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-gray-700">
                        Plant Variety
                      </label>
                      <button
                        type="button"
                        onClick={() => openQuickAdd('variety', 'fastVariety')}
                        className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                        title="Add New Plant Variety"
                      >
                        <Plus size={11} />
                        <span>New</span>
                      </button>
                    </div>
                    <select
                      value={newFastVariety}
                      onChange={(e) => {
                        const vId = e.target.value;
                        setNewFastVariety(vId);
                        if (vId && !newFastCrop) {
                          const vr = localOptions.varieties.find((v) => v.id === vId);
                          if (vr?.cropId) {
                            setNewFastCrop(vr.cropId);
                            const cr = localOptions.crops.find((c) => c.id === vr.cropId);
                            if (cr?.categoryId && !newFastCategory) setNewFastCategory(cr.categoryId);
                          }
                        }
                      }}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="">
                        {newFastCrop ? 'Select Variety...' : 'Select Variety (All / Filtered)...'}
                      </option>
                      {availableFastVarieties.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nameEn || v.nameSi}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Unit Price
                    </label>
                    <input
                      type="text"
                      value={newFastPrice}
                      onChange={(e) => {
                        setNewFastPrice(e.target.value);
                        if (!newFastPriceSi) setNewFastPriceSi(e.target.value);
                      }}
                      placeholder="e.g. Rs. 750 (per plant)"
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-gray-700">
                        Promotion Badge
                      </label>
                      <button
                        type="button"
                        onClick={() => openQuickAdd('badge', 'fastBadge')}
                        className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                        title="Add New Promotion Badge"
                      >
                        <Plus size={11} />
                        <span>New</span>
                      </button>
                    </div>
                    <select
                      value={newFastBadge}
                      onChange={(e) => setNewFastBadge(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="">Select Badge...</option>
                      {localOptions.badges?.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nameEn || b.nameSi}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Full-Width Horizontal Upload Dropzone Area (digata danna, left side podiwata nemei) */}
                <div className="w-full">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                    Plant Variety Photo (Upload)
                  </label>

                  {newFastPhoto ? (
                    <div className="w-full flex flex-col sm:flex-row items-center justify-between p-3.5 bg-white border border-rose-200 rounded-xl shadow-2xs gap-3">
                      <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                        <img
                          src={newFastPhoto}
                          alt="Plant Preview"
                          className="w-16 h-16 rounded-xl object-cover border border-rose-200 shadow-2xs shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 size={13} />
                              Photo Uploaded Successfully
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate max-w-sm sm:max-w-xl mt-1 font-mono">
                            {newFastPhoto}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => fastPhotoInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewFastPhoto('')}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Photo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fastPhotoInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFast(true);
                      }}
                      onDragLeave={() => setIsDraggingFast(false)}
                      onDrop={handleFastDrop}
                      className={`w-full py-6 px-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isDraggingFast
                          ? 'border-rose-500 bg-rose-50 scale-[1.005]'
                          : 'border-rose-200 hover:border-rose-400 bg-white hover:bg-rose-50/30 shadow-2xs'
                      }`}
                    >
                      {isUploadingFastPhoto ? (
                        <div className="flex flex-col items-center gap-2 text-rose-600 py-2">
                          <RefreshCw className="w-6 h-6 animate-spin" />
                          <span className="text-xs font-bold">Uploading plant photo to cloud storage...</span>
                          <span className="text-[11px] text-gray-400">Please wait a moment</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center py-1">
                          <div className="w-10 h-10 rounded-full bg-rose-100/80 text-rose-600 flex items-center justify-center shadow-2xs">
                            <UploadCloud size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">
                              Drop plant photo here, or <span className="text-rose-600 underline">browse file</span>
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Supports JPG, PNG, WEBP, SVG • Maximum file size 50MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <input
                    ref={fastPhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFastPhotoUpload(file);
                    }}
                  />
                </div>

                {/* 3. Action Row: Add Button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddFastSellingItem}
                    className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
                  >
                    <Plus size={15} />
                    <span>Add Fast-Selling Plant ({formData.fastSellingItems.length}/4)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-200/60 text-center text-xs text-rose-700 font-medium">
                Maximum limit of 4 featured / fast-selling plant varieties reached.
              </div>
            )}

            {/* Added Fast-Selling Items Display */}
            {formData.fastSellingItems.length === 0 ? (
              <div className="p-4 border border-dashed border-rose-200 rounded-xl text-center text-xs text-rose-500/80 bg-rose-50/20">
                No featured or fast-selling plant varieties added yet (maximum 4 can be added).
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {formData.fastSellingItems.map((item, idx) => {
                  const catObj = localOptions.categories?.find((c) => c.id === item.categoryId);
                  const cropObj = localOptions.crops.find((c) => c.id === item.cropId);
                  const varietyObj = localOptions.varieties.find((v) => v.id === item.varietyId);
                  const badgeObj = localOptions.badges?.find((b) => b.id === item.badgeId);

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl shadow-2xs hover:border-rose-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={varietyObj?.nameEn || cropObj?.nameEn || 'Item'}
                            className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100 font-bold text-xs">
                            <Flame size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {catObj && (
                              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded truncate">
                                {catObj.nameEn || catObj.nameSi}
                              </span>
                            )}
                            <span className="text-xs font-bold text-gray-900 truncate">
                              {cropObj?.nameEn || cropObj?.nameSi || 'Crop'}
                            </span>
                            {varietyObj && (
                              <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.2 rounded truncate">
                                {varietyObj.nameEn || varietyObj.nameSi}
                              </span>
                            )}
                            {badgeObj && (
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-full">
                                {badgeObj.nameEn || badgeObj.nameSi}
                              </span>
                            )}
                          </div>
                          {item.priceEn && (
                            <p className="text-[11px] font-medium text-emerald-700 mt-0.5">
                              {item.priceEn}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFastSellingItem(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                        title="Remove Item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 6: Crops, Varieties & Available Stock Ranges */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <Sprout size={15} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                  5. Crops, Varieties & Available Stock Ranges *
                </h3>
                <p className="text-[11px] text-gray-500">
                  e.g. Vegetables -&gt; Chili -&gt; MI-2 / Fruits -&gt; Mango -&gt; TEJC
                </p>
              </div>
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 items-end bg-gray-50/70 p-3 rounded-xl border border-gray-200">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-gray-600">
                    Crop Category:
                  </label>
                  <button
                    type="button"
                    onClick={() => openQuickAdd('category', 'stockCategory')}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    title="Add New Crop Category"
                  >
                    <Plus size={11} />
                    <span>New</span>
                  </button>
                </div>
                <select
                  value={newStockCategory}
                  onChange={(e) => {
                    const catId = e.target.value;
                    setNewStockCategory(catId);
                    if (newStockCrop) {
                      const selectedCrop = localOptions.crops.find((c) => c.id === newStockCrop);
                      if (selectedCrop && selectedCrop.categoryId && selectedCrop.categoryId !== catId) {
                        setNewStockCrop('');
                        setNewStockVariety('');
                      }
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="">Select Category</option>
                  {localOptions.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn || c.nameSi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-gray-600">
                    Crop Name:
                  </label>
                  <button
                    type="button"
                    onClick={() => openQuickAdd('crop', 'stockCrop')}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    title="Add New Crop"
                  >
                    <Plus size={11} />
                    <span>New</span>
                  </button>
                </div>
                <select
                  value={newStockCrop}
                  onChange={(e) => {
                    const cropId = e.target.value;
                    setNewStockCrop(cropId);
                    if (cropId && !newStockCategory) {
                      const cr = localOptions.crops.find((c) => c.id === cropId);
                      if (cr?.categoryId) setNewStockCategory(cr.categoryId);
                    }
                    if (newStockVariety) {
                      const vr = localOptions.varieties.find((v) => v.id === newStockVariety);
                      if (vr && vr.cropId && vr.cropId !== cropId) {
                        setNewStockVariety('');
                      }
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="">
                    {!newStockCategory ? 'Select Crop...' : 'Select Crop...'}
                  </option>
                  {availableStockCrops.map((cr) => (
                    <option key={cr.id} value={cr.id}>
                      {cr.nameEn || cr.nameSi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-gray-600">
                    Specific Variety:
                  </label>
                  <button
                    type="button"
                    onClick={() => openQuickAdd('variety', 'stockVariety')}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    title="Add New Plant Variety"
                  >
                    <Plus size={11} />
                    <span>New</span>
                  </button>
                </div>
                <select
                  value={newStockVariety}
                  onChange={(e) => {
                    const vId = e.target.value;
                    setNewStockVariety(vId);
                    if (vId && !newStockCrop) {
                      const vr = localOptions.varieties.find((v) => v.id === vId);
                      if (vr?.cropId) {
                        setNewStockCrop(vr.cropId);
                        const cr = localOptions.crops.find((c) => c.id === vr.cropId);
                        if (cr?.categoryId && !newStockCategory) setNewStockCategory(cr.categoryId);
                      }
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="">
                    {newStockCrop ? 'Select Variety (Optional)' : 'Select Variety (All / Filtered)'}
                  </option>
                  {availableStockVarieties.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nameEn || v.nameSi}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    Stock Range:
                  </label>
                  <select
                    value={newStockRange}
                    onChange={(e) => setNewStockRange(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {STOCK_RANGES.map((sr) => (
                      <option key={sr} value={sr}>
                        {sr}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddStock}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs cursor-pointer shrink-0 mt-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Added Stocks Ultra-Compact Table */}
            {formData.stocks.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/90 border-b border-gray-200 text-[10px] text-gray-600 font-bold uppercase">
                      <th className="px-3 py-1.5">Category</th>
                      <th className="px-3 py-1.5">Crop</th>
                      <th className="px-3 py-1.5">Variety</th>
                      <th className="px-3 py-1.5">Stock Range</th>
                      <th className="px-3 py-1.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {formData.stocks.map((st, idx) => {
                      const cat = localOptions.categories.find((c) => c.id === st.categoryId);
                      const crp = localOptions.crops.find((c) => c.id === st.cropId);
                      const vr = localOptions.varieties.find((v) => v.id === st.varietyId);

                      return (
                        <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="px-3 py-1.5 text-gray-800 font-medium">
                            {cat?.nameEn || cat?.nameSi || '—'}
                          </td>
                          <td className="px-3 py-1.5 text-gray-800 font-semibold">
                            {crp?.nameEn || crp?.nameSi || '—'}
                          </td>
                          <td className="px-3 py-1.5 text-gray-700">
                            {vr?.nameEn || vr?.nameSi || '—'}
                          </td>
                          <td className="px-3 py-1.5">
                            <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {st.stockRangeEn || st.stockRangeSi}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveStock(idx)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 6: Specialties & Plant Materials */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                  <Award size={15} />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                  6. Specialties & Plant Materials *
                </h3>
              </div>
              <button
                type="button"
                onClick={() => openQuickAdd('specialty', 'specialty')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title="Add New Specialty Option"
              >
                <Plus size={13} />
                <span>Add Specialty</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {localOptions.specialties.map((spec) => {
                const isChecked = formData.specialtyIds.includes(spec.id);

                return (
                  <div
                    key={spec.id}
                    onClick={() => handleToggleSpecialty(spec.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50/60 border-emerald-500 shadow-2xs ring-1 ring-emerald-500/20'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-emerald-700 text-white' : 'border border-gray-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 leading-snug">
                        {spec.nameEn || spec.nameSi}
                      </h4>
                      {spec.nameSi && spec.nameEn && (
                        <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                          {spec.nameSi}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 7: Location URL & Description */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <MapPin size={15} />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                7. Additional Information & Google Maps
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=7.4345,80.2185"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-mono placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nursery Description & Overview (English) *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({
                      ...formData,
                      descriptionEn: e.target.value,
                      descriptionSi: formData.descriptionSi || e.target.value
                    })}
                    placeholder="e.g. Registered with the Department of Agriculture with over 18 years of experience..."
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    තවාන පිළිබඳ විස්තරය (Sinhala / සිංහලෙන්)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descriptionSi}
                    onChange={(e) => setFormData({
                      ...formData,
                      descriptionSi: e.target.value
                    })}
                    placeholder="උදා: කෘෂිකර්ම දෙපාර්තමේන්තුවේ ලියාපදිංචි වසර 18 කට අධික පළපුරුද්ද සහිත උසස් ප්‍රමිතියේ පැළ සපයන්නා..."
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white/95 backdrop-blur-md py-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl transition-all shadow-md shadow-emerald-800/20 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingItem ? 'Update Nursery' : 'Save Nursery'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Add In-line Master Data Modal */}
      <NurseryQuickAddModal
        isOpen={Boolean(quickAddType)}
        onClose={() => {
          setQuickAddType(null);
          setQuickAddContext(null);
        }}
        type={quickAddType}
        categories={localOptions.categories}
        crops={localOptions.crops}
        initialCategoryId={initialCategoryIdForQuickAdd}
        initialCropId={initialCropIdForQuickAdd}
        onSuccess={handleQuickAddSuccess}
      />
    </div>
  );
}
