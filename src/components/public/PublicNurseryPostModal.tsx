import React, { useState, useEffect, useRef, type ChangeEvent, type DragEvent } from 'react';
import { X, ChevronLeft, ChevronRight, UploadCloud, RefreshCw, Trash2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  SRI_LANKA_PROVINCES,
  getDistrictsForProvince,
  getDSDsForDistrict,
  getGNDsForDSD
} from '../../data/sriLankaLocations';
import type { FormDropdownOptions, NurseryFastSellingItem, NurseryStockItem } from '../../admin/components/nursery/types';

interface PublicNurseryPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  options?: FormDropdownOptions;
}

type StepNumber = 1 | 2 | 3 | 4 | 5 | 6;

const DRAFT_PREFIX = 'aswanna_public_nursery_draft_';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function PublicNurseryPostModal({
  isOpen,
  onClose,
  onSuccess,
  options: externalOptions
}: PublicNurseryPostModalProps) {
  const { i18n } = useTranslation();
  const isSi = i18n.language === 'si';
  const { user, token } = useAuth();

  const [internalOptions, setInternalOptions] = useState<FormDropdownOptions>({
    grades: [],
    deliveries: [],
    operatingHours: [],
    certifications: [],
    categories: [],
    crops: [],
    varieties: [],
    specialties: [],
    badges: []
  });

  const options = (externalOptions && (externalOptions.grades?.length > 0 || externalOptions.crops?.length > 0))
    ? externalOptions
    : internalOptions;

  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successSubmitted, setSuccessSubmitted] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Form State - Bilingual
  const [nameEn, setNameEn] = useState('');
  const [nameSi, setNameSi] = useState('');
  const [ownerNameEn, setOwnerNameEn] = useState('');
  const [ownerNameSi, setOwnerNameSi] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionSi, setDescriptionSi] = useState('');

  // Location
  const [provinceEn, setProvinceEn] = useState('Western');
  const [provinceSi, setProvinceSi] = useState('බස්නාහිර');
  const [districtEn, setDistrictEn] = useState('Colombo');
  const [districtSi, setDistrictSi] = useState('කොළඹ');
  const [dsdEn, setDsdEn] = useState('');
  const [dsdSi, setDsdSi] = useState('');
  const [gndEn, setGndEn] = useState('');
  const [gndSi, setGndSi] = useState('');
  const [fullAddressEn, setFullAddressEn] = useState('');
  const [fullAddressSi, setFullAddressSi] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Facilities / Operations
  const [isGovRegistered, setIsGovRegistered] = useState(false);
  const [certificateNo, setCertificateNo] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [deliveryId, setDeliveryId] = useState('');
  const [operatingHoursId, setOperatingHoursId] = useState('');
  const [certificationId, setCertificationId] = useState('');

  // Photos (up to 5)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false);
  const photosInputRef = useRef<HTMLInputElement | null>(null);

  // Featured / Fast-Selling Plants (max 4)
  const [fastSellingItems, setFastSellingItems] = useState<NurseryFastSellingItem[]>([]);
  const [newFastCategory, setNewFastCategory] = useState('');
  const [newFastCrop, setNewFastCrop] = useState('');
  const [newFastVariety, setNewFastVariety] = useState('');
  const [newFastPrice, setNewFastPrice] = useState('');
  const [newFastPriceSi, setNewFastPriceSi] = useState('');
  const [newFastBadge, setNewFastBadge] = useState('');
  const [newFastPhoto, setNewFastPhoto] = useState('');
  const [isUploadingFastPhoto, setIsUploadingFastPhoto] = useState(false);
  const [isDraggingFastPhoto, setIsDraggingFastPhoto] = useState(false);
  const fastPhotoInputRef = useRef<HTMLInputElement | null>(null);

  // Stocks & Specialties
  const [stocks, setStocks] = useState<NurseryStockItem[]>([]);
  const [newStockCategory, setNewStockCategory] = useState('');
  const [newStockCrop, setNewStockCrop] = useState('');
  const [newStockVariety, setNewStockVariety] = useState('');
  const [newStockRange, setNewStockRange] = useState('500 - 1,000');
  const [specialtyIds, setSpecialtyIds] = useState<string[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const draftKey = `${DRAFT_PREFIX}${user?.id || 'anonymous'}`;

  const stepsList: { num: StepNumber; label: string }[] = [
    { num: 1, label: isSi ? 'මූලික තොරතුරු' : 'Basic Info' },
    { num: 2, label: isSi ? 'පිහිටීම' : 'Location' },
    { num: 3, label: isSi ? 'පහසුකම්' : 'Facilities' },
    { num: 4, label: isSi ? 'ඡායාරූප' : 'Photos' },
    { num: 5, label: isSi ? 'විශේෂ පැළ' : 'Featured Plants' },
    { num: 6, label: isSi ? 'තොග සහ ඉදිරිපත් කිරීම' : 'Stocks & Submit' }
  ];

  // Fetch form options fallback if not passed
  useEffect(() => {
    if (!isOpen) return;
    if (externalOptions && (externalOptions.grades?.length > 0 || externalOptions.crops?.length > 0)) {
      return;
    }
    fetch(`${API_BASE}/nurseries/form-options`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setInternalOptions(json.data);
      })
      .catch((err) => console.error('Error fetching nursery options:', err));
  }, [isOpen, externalOptions]);

  // Restore draft on open if within 7 days
  useEffect(() => {
    if (!isOpen) return;
    setSuccessSubmitted(false);
    setErrorMsg(null);

    try {
      const rawDraft = localStorage.getItem(draftKey) || localStorage.getItem(`${DRAFT_PREFIX}anonymous`);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        const now = Date.now();
        if (parsed && parsed.savedAt && now - parsed.savedAt <= DRAFT_TTL_MS) {
          const d = parsed.data || {};
          setNameEn(d.nameEn || d.name || '');
          setNameSi(d.nameSi || d.name || '');
          setOwnerNameEn(d.ownerNameEn || d.ownerName || '');
          setOwnerNameSi(d.ownerNameSi || d.ownerName || '');
          setWhatsappNumber(d.whatsappNumber || '');
          setDescriptionEn(d.descriptionEn || d.description || '');
          setDescriptionSi(d.descriptionSi || d.description || '');
          setProvinceEn(d.provinceEn || 'Western');
          setProvinceSi(d.provinceSi || 'බස්නාහිර');
          setDistrictEn(d.districtEn || 'Colombo');
          setDistrictSi(d.districtSi || 'කොළඹ');
          setDsdEn(d.dsdEn || '');
          setDsdSi(d.dsdSi || '');
          setGndEn(d.gndEn || '');
          setGndSi(d.gndSi || '');
          setFullAddressEn(d.fullAddressEn || d.fullAddress || '');
          setFullAddressSi(d.fullAddressSi || d.fullAddress || '');
          setGoogleMapsUrl(d.googleMapsUrl || '');
          setIsGovRegistered(Boolean(d.isGovRegistered));
          setCertificateNo(d.certificateNo || '');
          setGradeId(d.gradeId || '');
          setDeliveryId(d.deliveryId || '');
          setOperatingHoursId(d.operatingHoursId || '');
          setCertificationId(d.certificationId || '');
          if (Array.isArray(d.uploadedPhotos)) setUploadedPhotos(d.uploadedPhotos);
          if (Array.isArray(d.fastSellingItems)) setFastSellingItems(d.fastSellingItems);
          if (Array.isArray(d.stocks)) setStocks(d.stocks);
          if (Array.isArray(d.specialtyIds)) setSpecialtyIds(d.specialtyIds);
          if (d.currentStep && [1, 2, 3, 4, 5, 6].includes(d.currentStep)) {
            setCurrentStep(d.currentStep as StepNumber);
          }
          setDraftRestored(true);
        } else {
          localStorage.removeItem(draftKey);
        }
      }
    } catch {
      localStorage.removeItem(draftKey);
    }
  }, [isOpen, draftKey]);

  // Auto-persist draft for 7 days
  useEffect(() => {
    if (!isOpen || successSubmitted) return;
    const hasData = Boolean(nameEn || nameSi || whatsappNumber || uploadedPhotos.length > 0);
    if (!hasData) return;

    try {
      const payload = {
        savedAt: Date.now(),
        data: {
          nameEn,
          nameSi,
          ownerNameEn,
          ownerNameSi,
          whatsappNumber,
          descriptionEn,
          descriptionSi,
          provinceEn,
          provinceSi,
          districtEn,
          districtSi,
          dsdEn,
          dsdSi,
          gndEn,
          gndSi,
          fullAddressEn,
          fullAddressSi,
          googleMapsUrl,
          isGovRegistered,
          certificateNo,
          gradeId,
          deliveryId,
          operatingHoursId,
          certificationId,
          uploadedPhotos,
          fastSellingItems,
          stocks,
          specialtyIds,
          currentStep
        }
      };
      localStorage.setItem(draftKey, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save nursery draft:', e);
    }
  }, [
    isOpen,
    successSubmitted,
    nameEn,
    nameSi,
    ownerNameEn,
    ownerNameSi,
    whatsappNumber,
    descriptionEn,
    descriptionSi,
    provinceEn,
    provinceSi,
    districtEn,
    districtSi,
    dsdEn,
    dsdSi,
    gndEn,
    gndSi,
    fullAddressEn,
    fullAddressSi,
    googleMapsUrl,
    isGovRegistered,
    certificateNo,
    gradeId,
    deliveryId,
    operatingHoursId,
    certificationId,
    uploadedPhotos,
    fastSellingItems,
    stocks,
    specialtyIds,
    currentStep,
    draftKey
  ]);

  const handleDiscardDraft = () => {
    localStorage.removeItem(draftKey);
    localStorage.removeItem(`${DRAFT_PREFIX}anonymous`);
    setNameEn('');
    setNameSi('');
    setOwnerNameEn('');
    setOwnerNameSi('');
    setWhatsappNumber('');
    setDescriptionEn('');
    setDescriptionSi('');
    setFullAddressEn('');
    setFullAddressSi('');
    setGoogleMapsUrl('');
    setIsGovRegistered(false);
    setCertificateNo('');
    setGradeId('');
    setDeliveryId('');
    setOperatingHoursId('');
    setCertificationId('');
    setUploadedPhotos([]);
    setFastSellingItems([]);
    setStocks([]);
    setNewStockVariety('');
    setSpecialtyIds([]);
    setCurrentStep(1);
    setDraftRestored(false);
  };

  const availableDistricts = getDistrictsForProvince(provinceEn);
  const availableDsds = getDSDsForDistrict(districtEn);
  const availableGnds = getGNDsForDSD(dsdEn, districtEn);

  // Photo Upload Handler (50MB check)
  const handlePhotoUpload = async (files: File[]) => {
    const remainingSlots = 5 - uploadedPhotos.length;
    if (remainingSlots <= 0) return;

    const filesToUpload = files.slice(0, remainingSlots);
    const MAX_SIZE = 50 * 1024 * 1024;
    for (const file of filesToUpload) {
      if (file.size > MAX_SIZE) {
        setErrorMsg(
          isSi
            ? `"${file.name}" ඡායාරූපය උපරිම 50MB සීමාව ඉක්මවයි.`
            : `Photo "${file.name}" exceeds the 50MB maximum limit.`
        );
        return;
      }
    }

    setIsUploadingPhotos(true);
    setErrorMsg(null);
    try {
      const uploadFormData = new FormData();
      filesToUpload.forEach((file) => uploadFormData.append('image', file));
      filesToUpload.forEach((file) => uploadFormData.append('images', file));

      const authHeaders: Record<string, string> = {};
      const authToken = token || localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (authToken) authHeaders['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${API_BASE}/nurseries/upload-image`, {
        method: 'POST',
        headers: authHeaders,
        body: uploadFormData
      });

      if (res.ok) {
        const json = await res.json();
        const urls = json.urls || (json.url ? [json.url] : []) || json.data?.urls || [];
        if (urls.length > 0) {
          setUploadedPhotos((prev) => [...prev, ...urls].slice(0, 5));
          return;
        }
      }

      const fallbackRes = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers: authHeaders,
        body: uploadFormData
      });
      if (fallbackRes.ok) {
        const fJson = await fallbackRes.json();
        const fUrl = fJson.url || fJson.urls?.[0];
        if (fUrl) {
          setUploadedPhotos((prev) => [...prev, fUrl].slice(0, 5));
          return;
        }
      }

      throw new Error(isSi ? 'ඡායාරූප උඩුගත කිරීම අසාර්ථක විය.' : 'Image upload failed. Please verify format and size.');
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setErrorMsg(err.message || (isSi ? 'ඡායාරූප උඩුගත කිරීම අසාර්ථක විය.' : 'Image upload failed.'));
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  // Plant Photo Upload Handler (50MB check)
  const handleFastPhotoUpload = async (file: File) => {
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(
        isSi
          ? `"${file.name}" ඡායාරූපය උපරිම 50MB සීමාව ඉක්මවයි.`
          : `Photo "${file.name}" exceeds 50MB limit.`
      );
      return;
    }

    setIsUploadingFastPhoto(true);
    setErrorMsg(null);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      uploadFormData.append('images', file);

      const authHeaders: Record<string, string> = {};
      const authToken = token || localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (authToken) authHeaders['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${API_BASE}/nurseries/upload-image`, {
        method: 'POST',
        headers: authHeaders,
        body: uploadFormData
      });

      if (res.ok) {
        const json = await res.json();
        const u = json.url || json.urls?.[0] || json.data?.url;
        if (u) {
          setNewFastPhoto(u);
          return;
        }
      }

      const fb = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers: authHeaders,
        body: uploadFormData
      });
      if (fb.ok) {
        const fj = await fb.json();
        const fu = fj.url || fj.urls?.[0];
        if (fu) {
          setNewFastPhoto(fu);
          return;
        }
      }
      throw new Error(isSi ? 'පැළයේ ඡායාරූපය උඩුගත කිරීම අසාර්ථක විය.' : 'Plant photo upload failed.');
    } catch (err: any) {
      setErrorMsg(err.message || (isSi ? 'පැළයේ ඡායාරූපය උඩුගත කිරීම අසාර්ථක විය.' : 'Plant photo upload failed.'));
    } finally {
      setIsUploadingFastPhoto(false);
    }
  };

  const handleAddFastItem = () => {
    if (!newFastCategory && !newFastCrop) {
      setErrorMsg(
        isSi
          ? 'කරුණාකර අවම වශයෙන් බෝග ප්‍රවර්ගය හෝ බෝගය තෝරන්න.'
          : 'Please select at least Crop Category or Crop Name for the featured plant.'
      );
      return;
    }
    if (fastSellingItems.length >= 4) {
      setErrorMsg(isSi ? 'උපරිම විශේෂ පැළ වර්ග 4ක් පමණි.' : 'Maximum 4 featured plants allowed.');
      return;
    }

    setFastSellingItems((prev) => [
      ...prev,
      {
        id: `temp_${Date.now()}`,
        categoryId: newFastCategory || null,
        cropId: newFastCrop || null,
        varietyId: newFastVariety || null,
        priceEn: newFastPrice.trim() || null,
        priceSi: newFastPriceSi.trim() || newFastPrice.trim() || null,
        imageUrl: newFastPhoto || null,
        badgeId: newFastBadge || null
      }
    ]);

    setNewFastCategory('');
    setNewFastCrop('');
    setNewFastVariety('');
    setNewFastPrice('');
    setNewFastPriceSi('');
    setNewFastBadge('');
    setNewFastPhoto('');
    setErrorMsg(null);
  };

  const handleAddStock = () => {
    if (!newStockCategory && !newStockCrop) {
      setErrorMsg(isSi ? 'කරුණාකර තොග සඳහා බෝගය හෝ ප්‍රවර්ගය තෝරන්න.' : 'Please select a crop or category for the available stock.');
      return;
    }

    setStocks((prev) => [
      ...prev,
      {
        id: `temp_stock_${Date.now()}`,
        categoryId: newStockCategory || null,
        cropId: newStockCrop || null,
        varietyId: newStockVariety || null,
        stockRangeEn: newStockRange,
        stockRangeSi: newStockRange
      }
    ]);

    setNewStockVariety('');
    setNewStockCrop('');
    setErrorMsg(null);
  };

  const validateStep = (step: StepNumber): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!nameEn.trim() && !nameSi.trim()) {
        setErrorMsg(isSi ? 'තවානේ නම ඇතුළත් කිරීම අනිවාර්ය වේ.' : 'Nursery name is required.');
        return false;
      }
      if (!whatsappNumber.trim()) {
        setErrorMsg(isSi ? 'WhatsApp හෝ දුරකථන අංකය ඇතුළත් කිරීම අනිවාර්ය වේ.' : 'WhatsApp or phone number is required.');
        return false;
      }
    }
    if (step === 2) {
      if (!provinceEn || !districtEn) {
        setErrorMsg(isSi ? 'පළාත සහ දිස්ත්‍රික්කය තෝරාගැනීම අනිවාර්ය වේ.' : 'Province and district are required.');
        return false;
      }
      if (!fullAddressEn.trim() && !fullAddressSi.trim()) {
        setErrorMsg(isSi ? 'තවානේ ලිපිනය ඇතුළත් කිරීම අනිවාර්ය වේ.' : 'Physical address is required.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6) as StepNumber);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentStep < 6) {
      handleNext();
      return;
    }
    setErrorMsg(null);

    const activeToken = token || localStorage.getItem('token') || localStorage.getItem('admin_token');
    if (!activeToken) {
      setErrorMsg(isSi ? 'තවාන ඉදිරිපත් කිරීමට කරුණාකර පළමුව ලොග් වන්න.' : 'You must be signed in to submit a plant nursery.');
      return;
    }

    const finalNameEn = nameEn.trim() || nameSi.trim();
    const finalNameSi = nameSi.trim() || nameEn.trim();

    if (!finalNameEn || !whatsappNumber.trim()) {
      setCurrentStep(1);
      setErrorMsg(isSi ? 'තවානේ නම සහ දුරකථන අංකය ඇතුළත් කිරීම අනිවාර්ය වේ.' : 'Nursery name and phone number are required.');
      return;
    }

    const finalAddressEn = fullAddressEn.trim() || fullAddressSi.trim();
    const finalAddressSi = fullAddressSi.trim() || fullAddressEn.trim();

    if (!finalAddressEn) {
      setCurrentStep(2);
      setErrorMsg(isSi ? 'තවානේ ලිපිනය ඇතුළත් කිරීම අනිවාර්ය වේ.' : 'Physical address is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nameEn: finalNameEn,
        nameSi: finalNameSi,
        ownerNameEn: ownerNameEn.trim() || ownerNameSi.trim() || null,
        ownerNameSi: ownerNameSi.trim() || ownerNameEn.trim() || null,
        whatsappNumber: whatsappNumber.trim(),
        isGovRegistered,
        certificateNo: certificateNo.trim() || null,
        gradeId: gradeId || null,
        deliveryId: deliveryId || null,
        operatingHoursId: operatingHoursId || null,
        certificationId: certificationId || null,
        googleMapsUrl: googleMapsUrl.trim() || null,
        descriptionEn: descriptionEn.trim() || descriptionSi.trim() || null,
        descriptionSi: descriptionSi.trim() || descriptionEn.trim() || null,
        location: {
          provinceEn,
          provinceSi,
          districtEn,
          districtSi,
          divisionalSecretariatEn: dsdEn.trim() || null,
          divisionalSecretariatSi: dsdSi.trim() || null,
          gramaNiladhariDivisionEn: gndEn.trim() || null,
          gramaNiladhariDivisionSi: gndSi.trim() || null,
          fullAddressEn: finalAddressEn,
          fullAddressSi: finalAddressSi
        },
        images: uploadedPhotos.map((url, idx) => ({
          imageUrl: url,
          isPrimary: idx === 0
        })),
        stocks: stocks.map((s) => ({
          categoryId: s.categoryId || null,
          cropId: s.cropId || null,
          varietyId: s.varietyId || null,
          stockRangeEn: s.stockRangeEn || '500 - 1,000',
          stockRangeSi: s.stockRangeSi || '500 - 1,000'
        })),
        specialtyIds,
        fastSellingItems: fastSellingItems.map((f) => ({
          categoryId: f.categoryId || null,
          cropId: f.cropId || null,
          varietyId: f.varietyId || null,
          priceEn: f.priceEn?.trim() || null,
          priceSi: f.priceSi?.trim() || f.priceEn?.trim() || null,
          imageUrl: f.imageUrl?.trim() || null,
          badgeId: f.badgeId || null
        }))
      };

      const res = await fetch(`${API_BASE}/nurseries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.message || (isSi ? 'තවාන ලියාපදිංචි කිරීම අසාර්ථක විය.' : 'Failed to submit nursery.'));
      }

      localStorage.removeItem(draftKey);
      localStorage.removeItem(`${DRAFT_PREFIX}anonymous`);

      setSuccessSubmitted(true);
      onSuccess();
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || (isSi ? 'තවාන ඉදිරිපත් කිරීම අසාර්ථක විය. නැවත උත්සාහ කරන්න.' : 'Failed to submit nursery. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-5xl max-h-[95vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
        
        {/* Header - Minimal & Professional with Language Toggle */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              {isSi ? 'පැළ තවානක් ලියාපදිංචි කිරීම' : 'Register Plant Nursery'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isSi
                ? 'ඔබගේ පැළ තවාන අස්වැන්න (Aswanna) හි ලැයිස්තුගත කිරීමට තොරතුරු ඇතුළත් කරන්න.'
                : 'Submit your nursery profile for review and listing on Aswanna.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher Badge */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => i18n.changeLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  !isSi
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => i18n.changeLanguage('si')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  isSi
                    ? 'bg-[#006837] text-white shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                සිංහල
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="bg-white border-b border-gray-200 px-6 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-6 sm:gap-8 min-w-max">
            {stepsList.map((s) => {
              const isCurrent = currentStep === s.num;
              const isDone = currentStep > s.num;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (isDone || isCurrent) setCurrentStep(s.num);
                    else if (validateStep(currentStep)) setCurrentStep(s.num);
                  }}
                  className={`relative py-3.5 px-0.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    isCurrent
                      ? 'text-[#006837]'
                      : isDone
                      ? 'text-gray-700 hover:text-gray-900'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span
                    className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#006837] text-white'
                        : isDone
                        ? 'bg-emerald-100 text-[#006837]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isDone ? <Check size={11} strokeWidth={2.5} /> : s.num}
                  </span>
                  <span>{s.label}</span>

                  {/* Active indicator underline */}
                  {isCurrent && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#006837] rounded-t-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 grow overflow-y-auto">
          {/* Draft Restored Banner */}
          {draftRestored && (
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-xs">
              <span>{isSi ? 'ඔබගේ පෙර සුරකින ලද කෙටුම්පත ප්‍රතිස්ථාපනය කෙරිණි (දින 7ක් වලංගුයි).' : 'Restored your saved draft (valid for 7 days).'}</span>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="text-gray-900 font-semibold underline text-xs cursor-pointer ml-3"
              >
                {isSi ? 'කෙටුම්පත ඉවත් කරන්න' : 'Discard Draft'}
              </button>
            </div>
          )}

          {/* Login prompt if anonymous */}
          {!user && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-xs">
              {isSi
                ? 'ඔබට දැන් මෙම තොරතුරු පිරවිය හැක. අවසන් ඉදිරිපත් කිරීමේදී ලොග් වීමට අවශ්‍ය වනු ඇත.'
                : 'You can complete these fields now. You will be prompted to log in when submitting.'}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Success Screen */}
          {successSubmitted ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#006837] flex items-center justify-center mx-auto">
                <Check size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {isSi ? 'තවාන සාර්ථකව ඉදිරිපත් කරන ලදී' : 'Nursery Submitted Successfully'}
              </h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                {isSi
                  ? 'ඔබගේ තවාන් විස්තර අපගේ පරිපාලන අංශය වෙත යොමු කර ඇත. තහවුරු කිරීමෙන් පසු අස්වැන්න (Aswanna) වෙබ් අඩවියේ ප්‍රදර්ශනය වනු ඇත.'
                  : 'Your nursery listing has been submitted for administrative verification. It will appear publicly on the Aswanna Plant Finder portal once approved.'}
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-xs font-bold text-white bg-[#006837] hover:bg-[#00522c] rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  {isSi ? 'සම්පූර්ණයි' : 'Done'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 6) { handleSubmit(e); } else { handleNext(); } }} className="space-y-5">
              
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-bold text-gray-900">
                      {isSi ? '1. මූලික තවාන් තොරතුරු' : '1. Basic Nursery Information'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isSi
                        ? 'තවානේ නම, හිමිකරුගේ නම සහ සෘජු දුරකථන අංක ලබාදෙන්න.'
                        : 'Provide official nursery name and direct contact numbers.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'තවානේ නම (English)' : 'Nursery Name (English) *'}
                      </label>
                      <input
                        type="text"
                        value={nameEn}
                        onChange={(e) => {
                          setNameEn(e.target.value);
                          if (!nameSi) setNameSi(e.target.value);
                        }}
                        placeholder="e.g. Green Meadows Plant Nursery"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'තවානේ නම (සිංහලෙන්) *' : 'Nursery Name (Sinhala / සිංහලෙන්)'}
                      </label>
                      <input
                        type="text"
                        value={nameSi}
                        onChange={(e) => {
                          setNameSi(e.target.value);
                          if (!nameEn) setNameEn(e.target.value);
                        }}
                        placeholder="උදා: ග්‍රීන් මෙඩෝස් පැළ තවාන"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'හිමිකරු / කළමනාකරු නම (English)' : 'Owner / Manager Name (English)'}
                      </label>
                      <input
                        type="text"
                        value={ownerNameEn}
                        onChange={(e) => {
                          setOwnerNameEn(e.target.value);
                          if (!ownerNameSi) setOwnerNameSi(e.target.value);
                        }}
                        placeholder="e.g. K. R. Gunasekara"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'හිමිකරු / කළමනාකරු නම (සිංහලෙන්)' : 'Owner / Manager Name (Sinhala)'}
                      </label>
                      <input
                        type="text"
                        value={ownerNameSi}
                        onChange={(e) => {
                          setOwnerNameSi(e.target.value);
                          if (!ownerNameEn) setOwnerNameEn(e.target.value);
                        }}
                        placeholder="උදා: කේ. ආර්. ගුණසේකර"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'WhatsApp / සබඳතා දුරකථන අංකය *' : 'WhatsApp / Contact Number *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="e.g. 0771234567"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'තවාන පිළිබඳ විස්තරය (English)' : 'Nursery Description (English)'}
                      </label>
                      <textarea
                        rows={3}
                        value={descriptionEn}
                        onChange={(e) => {
                          setDescriptionEn(e.target.value);
                          if (!descriptionSi) setDescriptionSi(e.target.value);
                        }}
                        placeholder="Brief overview about your plant varieties, nursery services, or plant propagation..."
                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'තවාන පිළිබඳ විස්තරය (සිංහලෙන්)' : 'Nursery Description (Sinhala / සිංහලෙන්)'}
                      </label>
                      <textarea
                        rows={3}
                        value={descriptionSi}
                        onChange={(e) => {
                          setDescriptionSi(e.target.value);
                          if (!descriptionEn) setDescriptionEn(e.target.value);
                        }}
                        placeholder="ඔබගේ තවානේ පැළ වර්ග, සේවාවන් පිළිබඳ කෙටි හැඳින්වීමක්..."
                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Location */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-bold text-gray-900">
                      {isSi ? '2. පිහිටීම සහ පරිපාලන කොට්ඨාසය' : '2. Physical Location & Administrative Division'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isSi ? 'තවාන පිහිටි නිල ප්‍රදේශය සහ ලිපිනය තෝරන්න.' : 'Official geographical location of the nursery premises.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'පළාත *' : 'Province *'}
                      </label>
                      <select
                        value={provinceEn}
                        onChange={(e) => {
                          const p = SRI_LANKA_PROVINCES.find((x) => x.en === e.target.value);
                          setProvinceEn(e.target.value);
                          setProvinceSi(p?.si || e.target.value);
                          setDistrictEn('');
                          setDsdEn('');
                          setGndEn('');
                        }}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      >
                        {SRI_LANKA_PROVINCES.map((p) => (
                          <option key={p.en} value={p.en}>
                            {isSi ? p.si : p.en} {isSi ? `(${p.en})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'දිස්ත්‍රික්කය *' : 'District *'}
                      </label>
                      <select
                        value={districtEn}
                        onChange={(e) => {
                          const d = availableDistricts.find((x) => x.en === e.target.value);
                          setDistrictEn(e.target.value);
                          setDistrictSi(d?.si || e.target.value);
                          setDsdEn('');
                          setGndEn('');
                        }}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      >
                        <option value="">{isSi ? 'දිස්ත්‍රික්කය තෝරන්න' : 'Select District'}</option>
                        {availableDistricts.map((d) => (
                          <option key={d.en} value={d.en}>
                            {isSi ? d.si : d.en} {isSi ? `(${d.en})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'ප්‍රා. ලේ. කොට්ඨාසය (DSD)' : 'DS Division (DSD)'}
                      </label>
                      <select
                        value={dsdEn}
                        onChange={(e) => {
                          const dsd = availableDsds.find((x) => x.nameEn === e.target.value);
                          setDsdEn(e.target.value);
                          setDsdSi(dsd?.nameSi || e.target.value);
                          setGndEn('');
                        }}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      >
                        <option value="">{isSi ? 'ප්‍රා. ලේ. කොට්ඨාසය තෝරන්න' : 'Select DSD'}</option>
                        {availableDsds.map((dsd) => (
                          <option key={dsd.nameEn} value={dsd.nameEn}>
                            {isSi ? (dsd.nameSi || dsd.nameEn) : dsd.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'ග්‍රාම නිලධාරී වසම (GND)' : 'GN Division (GND)'}
                      </label>
                      <select
                        value={gndEn}
                        onChange={(e) => {
                          const gnd = availableGnds.find((x) => x.nameEn === e.target.value);
                          setGndEn(e.target.value);
                          setGndSi(gnd?.nameSi || e.target.value);
                        }}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      >
                        <option value="">{isSi ? 'ග්‍රාම නිලධාරී වසම තෝරන්න' : 'Select GND'}</option>
                        {availableGnds.map((gnd) => (
                          <option key={gnd.nameEn} value={gnd.nameEn}>
                            {isSi ? (gnd.nameSi || gnd.nameEn) : gnd.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'සම්පූර්ණ ලිපිනය (English) *' : 'Full Physical Address (English) *'}
                      </label>
                      <input
                        type="text"
                        value={fullAddressEn}
                        onChange={(e) => {
                          setFullAddressEn(e.target.value);
                          if (!fullAddressSi) setFullAddressSi(e.target.value);
                        }}
                        placeholder="e.g. No. 45, Kurunegala Road, Narammala."
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'සම්පූර්ණ ලිපිනය (සිංහලෙන්)' : 'Physical Address (Sinhala / සිංහලෙන්)'}
                      </label>
                      <input
                        type="text"
                        value={fullAddressSi}
                        onChange={(e) => {
                          setFullAddressSi(e.target.value);
                          if (!fullAddressEn) setFullAddressEn(e.target.value);
                        }}
                        placeholder="උදා: නො. 45, කුරුණෑගල පාර, නාරම්මල."
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'Google Maps සබැඳිය (විකල්ප)' : 'Google Maps Link (Optional)'}
                      </label>
                      <input
                        type="url"
                        value={googleMapsUrl}
                        onChange={(e) => setGoogleMapsUrl(e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Facilities */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-bold text-gray-900">
                      {isSi ? '3. ලියාපදිංචිය සහ මෙහෙයුම් පහසුකම්' : '3. Registration & Operational Facilities'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isSi ? 'රාජ්‍ය ලියාපදිංචිය සහ පාරිභෝගික සේවා පහසුකම් විස්තර.' : 'Government certification and customer service facilities.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="isGovRegPublic"
                        checked={isGovRegistered}
                        onChange={(e) => setIsGovRegistered(e.target.checked)}
                        className="w-4 h-4 text-[#006837] rounded cursor-pointer"
                      />
                      <label htmlFor="isGovRegPublic" className="text-xs font-bold text-gray-800 cursor-pointer">
                        {isSi
                          ? 'කෘෂිකර්ම දෙපාර්තමේන්තුවේ (DOA) ලියාපදිංචි තවානකි'
                          : 'Government Department of Agriculture (DOA) Registered'}
                      </label>
                    </div>

                    {isGovRegistered && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {isSi ? 'ලියාපදිංචි / සහතික අංකය' : 'Registration / Certificate Number'}
                        </label>
                        <input
                          type="text"
                          value={certificateNo}
                          onChange={(e) => setCertificateNo(e.target.value)}
                          placeholder="e.g. DOA/NUR/2026/894"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white font-mono focus:outline-none focus:border-[#006837]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'තවාන් ශ්‍රේණිය' : 'Nursery Grade'}
                      </label>
                      <select
                        value={gradeId}
                        onChange={(e) => setGradeId(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                      >
                        <option value="">{isSi ? 'ශ්‍රේණිය තෝරන්න' : 'Select Grade'}</option>
                        {options.grades.map((g) => (
                          <option key={g.id} value={g.id}>
                            {isSi ? (g.nameSi || g.nameEn) : (g.nameEn || g.nameSi)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'බෙදාහැරීමේ ක්‍රම' : 'Delivery Service'}
                      </label>
                      <select
                        value={deliveryId}
                        onChange={(e) => setDeliveryId(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                      >
                        <option value="">{isSi ? 'බෙදාහැරීමේ ක්‍රමය තෝරන්න' : 'Select Delivery Option'}</option>
                        {options.deliveries.map((d) => (
                          <option key={d.id} value={d.id}>
                            {isSi ? (d.nameSi || d.nameEn) : (d.nameEn || d.nameSi)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'විවෘත වේලාවන්' : 'Operating Hours'}
                      </label>
                      <select
                        value={operatingHoursId}
                        onChange={(e) => setOperatingHoursId(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                      >
                        <option value="">{isSi ? 'විවෘත වේලාවන් තෝරන්න' : 'Select Operating Hours'}</option>
                        {options.operatingHours.map((h) => (
                          <option key={h.id} value={h.id}>
                            {isSi ? (h.nameSi || h.nameEn) : (h.nameEn || h.nameSi)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isSi ? 'සහතිකකරණ වර්ගය' : 'Certification Type'}
                      </label>
                      <select
                        value={certificationId}
                        onChange={(e) => setCertificationId(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                      >
                        <option value="">{isSi ? 'සහතිකකරණය තෝරන්න' : 'Select Certification'}</option>
                        {options.certifications?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {isSi ? (c.nameSi || c.nameEn) : (c.nameEn || c.nameSi)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Photos */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {isSi ? '4. තවාන් ඡායාරූප (උපරිම 5)' : '4. Nursery Photos (Max 5)'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {isSi
                          ? 'ඔබගේ තවානේ පිවිසුම, පැළ තවාන් පාත්ති සහ ගොඩනැගිලි ඡායාරූප ඇතුළත් කරන්න.'
                          : 'Upload photos of your nursery beds, premises, or entrance.'}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {uploadedPhotos.length} / 5 {isSi ? 'ඡායාරූප' : 'Photos'}
                    </span>
                  </div>

                  {uploadedPhotos.length < 5 && (
                    <div
                      onClick={() => photosInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingPhotos(true);
                      }}
                      onDragLeave={() => setIsDraggingPhotos(false)}
                      onDrop={(e: DragEvent<HTMLDivElement>) => {
                        e.preventDefault();
                        setIsDraggingPhotos(false);
                        if (e.dataTransfer.files?.length) {
                          handlePhotoUpload(Array.from(e.dataTransfer.files));
                        }
                      }}
                      className={`w-full py-8 px-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isDraggingPhotos
                          ? 'border-[#006837] bg-emerald-50/30'
                          : 'border-gray-300 hover:border-[#006837] bg-white'
                      }`}
                    >
                      {isUploadingPhotos ? (
                        <div className="flex flex-col items-center gap-2 text-[#006837] py-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span className="text-xs font-bold">
                            {isSi ? 'ඡායාරූප උඩුගත වෙමින් පවතී...' : 'Uploading photos...'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                            <UploadCloud size={18} />
                          </div>
                          <p className="text-xs font-semibold text-gray-800">
                            {isSi
                              ? 'ඡායාරූප මෙහි ඇද දමන්න හෝ ක්ලික් කරන්න (එකක් 50MB දක්වා)'
                              : 'Click or drag photos here (Up to 50MB each)'}
                          </p>
                          <p className="text-[11px] text-gray-400">JPG, PNG, WEBP supported</p>
                        </div>
                      )}
                    </div>
                  )}

                  <input
                    ref={photosInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files?.length) {
                        handlePhotoUpload(Array.from(e.target.files));
                      }
                    }}
                  />

                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                      {uploadedPhotos.map((url, idx) => (
                        <div key={idx} className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-100 group">
                          <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-24 object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-[#006837] text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                              {isSi ? 'ප්‍රධාන' : 'Cover'}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/90 text-white rounded cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Featured Plants */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {isSi ? '5. විශේෂයෙන් අලෙවි වන පැළ (උපරිම 4)' : '5. Featured / Fast-Selling Plants (Max 4)'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {isSi
                          ? 'ඔබගේ ජනප්‍රියම හෝ අලුතින් ලැබුණු පැළ වර්ග, මිල ගණන් සහ ඡායාරූප සමඟ එක් කරන්න.'
                          : 'Showcase your signature plant varieties and current pricing.'}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {fastSellingItems.length} / 4 {isSi ? 'එක් කර ඇත' : 'Added'}
                    </span>
                  </div>

                  {fastSellingItems.length < 4 && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* 1. Crop Category */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            {isSi ? 'බෝග ප්‍රවර්ගය' : 'Crop Category'}
                          </label>
                          <select
                            value={newFastCategory}
                            onChange={(e) => setNewFastCategory(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                          >
                            <option value="">{isSi ? 'ප්‍රවර්ගය තෝරන්න...' : 'Select Category...'}</option>
                            {options.categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {isSi ? (c.nameSi || c.nameEn) : (c.nameEn || c.nameSi)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Crop Name */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            {isSi ? 'බෝගය' : 'Crop Name'}
                          </label>
                          <select
                            value={newFastCrop}
                            onChange={(e) => setNewFastCrop(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                          >
                            <option value="">{isSi ? 'බෝගය තෝරන්න...' : 'Select Crop...'}</option>
                            {options.crops.map((c) => (
                              <option key={c.id} value={c.id}>
                                {isSi ? (c.nameSi || c.nameEn) : (c.nameEn || c.nameSi)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Variety */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            {isSi ? 'පැළ ප්‍රභේදය' : 'Plant Variety'}
                          </label>
                          <select
                            value={newFastVariety}
                            onChange={(e) => setNewFastVariety(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                          >
                            <option value="">{isSi ? 'ප්‍රභේදය තෝරන්න...' : 'Select Variety...'}</option>
                            {options.varieties.map((v) => (
                              <option key={v.id} value={v.id}>
                                {isSi ? (v.nameSi || v.nameEn) : (v.nameEn || v.nameSi)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 4. Unit Price */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            {isSi ? 'ඒකක මිල' : 'Unit Price'}
                          </label>
                          <input
                            type="text"
                            value={newFastPrice}
                            onChange={(e) => {
                              setNewFastPrice(e.target.value);
                              if (!newFastPriceSi) setNewFastPriceSi(e.target.value);
                            }}
                            placeholder={isSi ? 'උදා: රු. 750' : 'e.g. Rs. 750'}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                          />
                        </div>

                        {/* 5. Promotion Badge */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            {isSi ? 'ප්‍රවර්ධන ලාංඡනය' : 'Badge'}
                          </label>
                          <select
                            value={newFastBadge}
                            onChange={(e) => setNewFastBadge(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                          >
                            <option value="">{isSi ? 'ලාංඡනය තෝරන්න...' : 'Select Badge...'}</option>
                            {options.badges?.map((b) => (
                              <option key={b.id} value={b.id}>
                                {isSi ? (b.nameSi || b.nameEn) : (b.nameEn || b.nameSi)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Plant Photo Upload */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {isSi ? 'පැළයේ ඡායාරූපය' : 'Plant Photo'}
                        </label>
                        {newFastPhoto ? (
                          <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={newFastPhoto} alt="Plant" className="w-10 h-10 rounded object-cover border border-gray-200 shrink-0" />
                              <span className="text-xs text-gray-600 truncate font-mono">{newFastPhoto}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNewFastPhoto('')}
                              className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fastPhotoInputRef.current?.click()}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingFastPhoto(true);
                            }}
                            onDragLeave={() => setIsDraggingFastPhoto(false)}
                            onDrop={(e: DragEvent<HTMLDivElement>) => {
                              e.preventDefault();
                              setIsDraggingFastPhoto(false);
                              const f = Array.from(e.dataTransfer.files).find((x) => x.type.startsWith('image/'));
                              if (f) handleFastPhotoUpload(f);
                            }}
                            className={`w-full py-4 px-4 border border-dashed rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                              isDraggingFastPhoto ? 'border-[#006837] bg-emerald-50/20' : 'border-gray-300 bg-white hover:border-[#006837]'
                            }`}
                          >
                            {isUploadingFastPhoto ? (
                              <span className="text-xs text-[#006837] flex items-center gap-1.5">
                                <RefreshCw className="w-4 h-4 animate-spin" /> {isSi ? 'උඩුගත වෙමින් පවතී...' : 'Uploading...'}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-600">
                                {isSi
                                  ? 'පැළයේ ඡායාරූපය මෙතැනට ඇද දමන්න හෝ ක්ලික් කරන්න (50MB දක්වා)'
                                  : 'Click or drop plant photo here (Up to 50MB)'}
                              </span>
                            )}
                          </div>
                        )}

                        <input
                          ref={fastPhotoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const f = e.target.files?.[0];
                            if (f) handleFastPhotoUpload(f);
                          }}
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleAddFastItem}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#006837] hover:bg-[#00522c] rounded-lg cursor-pointer"
                        >
                          {isSi ? '+ විශේෂ පැළයක් එක් කරන්න' : '+ Add Plant Variety'}
                        </button>
                      </div>
                    </div>
                  )}

                  {fastSellingItems.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {fastSellingItems.map((item, idx) => {
                        const catObj = options.categories.find((c) => c.id === item.categoryId);
                        const cropObj = options.crops.find((c) => c.id === item.cropId);
                        const varObj = options.varieties.find((v) => v.id === item.varietyId);
                        const badgeObj = options.badges?.find((b) => b.id === item.badgeId);

                        return (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt="" className="w-9 h-9 rounded object-cover border border-gray-200 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {catObj && (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-medium truncate">
                                      {isSi ? catObj.nameSi || catObj.nameEn : catObj.nameEn || catObj.nameSi}
                                    </span>
                                  )}
                                  <span className="text-xs font-bold text-gray-900 truncate">
                                    {isSi ? (cropObj?.nameSi || cropObj?.nameEn || 'බෝගය') : (cropObj?.nameEn || cropObj?.nameSi || 'Crop')}
                                  </span>
                                  {varObj && (
                                    <span className="text-[10px] text-gray-500 truncate">
                                      ({isSi ? (varObj.nameSi || varObj.nameEn) : (varObj.nameEn || varObj.nameSi)})
                                    </span>
                                  )}
                                  {badgeObj && (
                                    <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
                                      {isSi ? (badgeObj.nameSi || badgeObj.nameEn) : (badgeObj.nameEn || badgeObj.nameSi)}
                                    </span>
                                  )}
                                </div>
                                {(item.priceEn || item.priceSi) && (
                                  <span className="text-xs font-semibold text-[#006837] block mt-0.5">
                                    {isSi ? (item.priceSi || item.priceEn) : (item.priceEn || item.priceSi)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setFastSellingItems((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer shrink-0 ml-2"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6: Stocks & Final Submission */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-bold text-gray-900">
                      {isSi ? '6. පවතින තොග සහ විශේෂතා' : '6. Current Plant Stocks & Specialties'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isSi
                        ? 'ඔබ සතුව ඇති පැළ තොග ප්‍රමාණ සහ විශේෂිත ක්ෂේත්‍ර තෝරන්න.'
                        : 'Specify available inventory ranges and plant specializations.'}
                    </p>
                  </div>

                  {/* Stock Controls */}
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-gray-800 block">
                      {isSi ? 'පවතින පැළ සහ තොග ප්‍රමාණ එක් කරන්න' : 'Add Available Crops & Volume'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-end">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          {isSi ? 'ප්‍රවර්ගය' : 'Category'}
                        </label>
                        <select
                          value={newStockCategory}
                          onChange={(e) => setNewStockCategory(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                        >
                          <option value="">{isSi ? 'සියලු ප්‍රවර්ග' : 'All Categories'}</option>
                          {options.categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {isSi ? (c.nameSi || c.nameEn) : (c.nameEn || c.nameSi)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          {isSi ? 'බෝගය *' : 'Crop *'}
                        </label>
                        <select
                          value={newStockCrop}
                          onChange={(e) => setNewStockCrop(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                        >
                          <option value="">{isSi ? 'බෝගය තෝරන්න' : 'Select Crop'}</option>
                          {options.crops.map((c) => (
                            <option key={c.id} value={c.id}>
                              {isSi ? (c.nameSi || c.nameEn) : (c.nameEn || c.nameSi)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          {isSi ? 'පැළ ප්‍රභේදය' : 'Plant Variety'}
                        </label>
                        <select
                          value={newStockVariety}
                          onChange={(e) => setNewStockVariety(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                        >
                          <option value="">{isSi ? 'ප්‍රභේදය තෝරන්න (විකල්ප)' : 'Select Variety (Optional)'}</option>
                          {options.varieties.map((v) => (
                            <option key={v.id} value={v.id}>
                              {isSi ? (v.nameSi || v.nameEn) : (v.nameEn || v.nameSi)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          {isSi ? 'තොග ප්‍රමාණය' : 'Stock Range'}
                        </label>
                        <select
                          value={newStockRange}
                          onChange={(e) => setNewStockRange(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-mono"
                        >
                          <option value="100 - 500">100 - 500</option>
                          <option value="500 - 1,000">500 - 1,000</option>
                          <option value="1,000 - 5,000">1,000 - 5,000</option>
                          <option value="5,000 - 10,000">5,000 - 10,000</option>
                          <option value="10,000+">10,000+</option>
                        </select>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={handleAddStock}
                          className="w-full px-3 py-1.5 text-xs font-bold text-white bg-[#006837] hover:bg-[#00522c] rounded-lg cursor-pointer"
                        >
                          {isSi ? '+ තොගය එක් කරන්න' : '+ Add Stock'}
                        </button>
                      </div>
                    </div>

                    {stocks.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                        {stocks.map((st, idx) => {
                          const cat = options.categories.find((x) => x.id === st.categoryId);
                          const c = options.crops.find((x) => x.id === st.cropId);
                          const v = options.varieties.find((x) => x.id === st.varietyId);
                          return (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800">
                              {cat && (
                                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1 rounded font-semibold">
                                  {isSi ? cat.nameSi || cat.nameEn : cat.nameEn || cat.nameSi}
                                </span>
                              )}
                              <span>
                                {isSi ? (c?.nameSi || c?.nameEn || 'බෝගය') : (c?.nameEn || c?.nameSi || 'Crop')}
                                {v ? ` - ${isSi ? v.nameSi || v.nameEn : v.nameEn || v.nameSi}` : ''}
                              </span>
                              <span className="text-gray-500 font-mono text-[11px]">({st.stockRangeEn})</span>
                              <button type="button" onClick={() => setStocks((prev) => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-600 cursor-pointer">
                                <X size={12} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Specialties Multi-select */}
                  {options.specialties.length > 0 && (
                    <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-gray-800 block">
                        {isSi ? 'තවාන් විශේෂතා' : 'Nursery Specialties'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {options.specialties.map((sp) => {
                          const isSelected = specialtyIds.includes(sp.id);
                          return (
                            <button
                              key={sp.id}
                              type="button"
                              onClick={() => {
                                setSpecialtyIds((prev) =>
                                  isSelected ? prev.filter((id) => id !== sp.id) : [...prev, sp.id]
                                );
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-[#006837] text-white border-[#006837]'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {isSi ? (sp.nameSi || sp.nameEn) : (sp.nameEn || sp.nameSi)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-xs leading-relaxed">
                    {isSi
                      ? 'මෙම පෝරමය ඉදිරිපත් කිරීමෙන්, ඔබ විසින් සපයන ලද තොරතුරු සත්‍ය හා නිවැරදි බව තහවුරු කරනු ලබයි. අපගේ පරිපාලන අනුමැතියෙන් පසු මෙම තවාන Aswanna වෙබ් අඩවියේ ප්‍රසිද්ධ කරනු ඇත.'
                      : 'By submitting this form, you certify that the nursery details provided are authentic. Your listing will appear on the public Plant Finder once approved by our verification team.'}
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => (prev - 1) as StepNumber)}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>{isSi ? 'පෙර' : 'Previous'}</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 6 ? (
                  <button
                    key="next-step-btn"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="inline-flex items-center gap-1 px-5 py-2 text-xs font-bold text-white bg-[#006837] hover:bg-[#00522c] rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <span>{isSi ? 'ඊළඟ' : 'Next'}</span>
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    key="submit-nursery-btn"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSubmit(e);
                    }}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#006837] hover:bg-[#00522c] rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>{isSi ? 'ඉදිරිපත් වෙමින් පවතී...' : 'Submitting...'}</span>
                      </>
                    ) : (
                      <span>{isSi ? 'තවාන ඉදිරිපත් කරන්න' : 'Submit Plant Nursery'}</span>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
