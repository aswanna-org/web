import { useState, useEffect, useRef, type ChangeEvent, type DragEvent } from 'react';
import { X, ChevronLeft, ChevronRight, UploadCloud, RefreshCw, Trash2, Check } from 'lucide-react';
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

const STEPS: { num: StepNumber; label: string }[] = [
  { num: 1, label: 'Basic Info' },
  { num: 2, label: 'Location' },
  { num: 3, label: 'Facilities' },
  { num: 4, label: 'Photos' },
  { num: 5, label: 'Featured Plants' },
  { num: 6, label: 'Stocks & Submit' }
];

const DRAFT_PREFIX = 'aswanna_public_nursery_draft_';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function PublicNurseryPostModal({
  isOpen,
  onClose,
  onSuccess,
  options: externalOptions
}: PublicNurseryPostModalProps) {
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

  // Form State - Single Language, Professional
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [description, setDescription] = useState('');

  // Location
  const [provinceEn, setProvinceEn] = useState('Western');
  const [provinceSi, setProvinceSi] = useState('බස්නාහිර');
  const [districtEn, setDistrictEn] = useState('Colombo');
  const [districtSi, setDistrictSi] = useState('කොළඹ');
  const [dsdEn, setDsdEn] = useState('');
  const [dsdSi, setDsdSi] = useState('');
  const [gndEn, setGndEn] = useState('');
  const [gndSi, setGndSi] = useState('');
  const [fullAddress, setFullAddress] = useState('');
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

  // Featured Plants (max 4)
  const [fastSellingItems, setFastSellingItems] = useState<NurseryFastSellingItem[]>([]);
  const [newFastCrop, setNewFastCrop] = useState('');
  const [newFastVariety, setNewFastVariety] = useState('');
  const [newFastPrice, setNewFastPrice] = useState('');
  const [newFastBadge, setNewFastBadge] = useState('');
  const [newFastPhoto, setNewFastPhoto] = useState('');
  const [isUploadingFastPhoto, setIsUploadingFastPhoto] = useState(false);
  const [isDraggingFastPhoto, setIsDraggingFastPhoto] = useState(false);
  const fastPhotoInputRef = useRef<HTMLInputElement | null>(null);

  // Stocks & Specialties
  const [stocks, setStocks] = useState<NurseryStockItem[]>([]);
  const [newStockCategory, setNewStockCategory] = useState('');
  const [newStockCrop, setNewStockCrop] = useState('');
  const [newStockRange, setNewStockRange] = useState('500 - 1,000');
  const [specialtyIds, setSpecialtyIds] = useState<string[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const draftKey = `${DRAFT_PREFIX}${user?.id || 'anonymous'}`;

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
          setName(d.name || d.nameEn || d.nameSi || '');
          setOwnerName(d.ownerName || d.ownerNameEn || d.ownerNameSi || '');
          setWhatsappNumber(d.whatsappNumber || '');
          setDescription(d.description || d.descriptionEn || d.descriptionSi || '');
          setProvinceEn(d.provinceEn || 'Western');
          setProvinceSi(d.provinceSi || 'බස්නාහිර');
          setDistrictEn(d.districtEn || 'Colombo');
          setDistrictSi(d.districtSi || 'කොළඹ');
          setDsdEn(d.dsdEn || '');
          setDsdSi(d.dsdSi || '');
          setGndEn(d.gndEn || '');
          setGndSi(d.gndSi || '');
          setFullAddress(d.fullAddress || d.fullAddressEn || d.fullAddressSi || '');
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
    const hasData = Boolean(name || whatsappNumber || uploadedPhotos.length > 0);
    if (!hasData) return;

    try {
      const payload = {
        savedAt: Date.now(),
        data: {
          name,
          ownerName,
          whatsappNumber,
          description,
          provinceEn,
          provinceSi,
          districtEn,
          districtSi,
          dsdEn,
          dsdSi,
          gndEn,
          gndSi,
          fullAddress,
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
    name,
    ownerName,
    whatsappNumber,
    description,
    provinceEn,
    provinceSi,
    districtEn,
    districtSi,
    dsdEn,
    dsdSi,
    gndEn,
    gndSi,
    fullAddress,
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
    setName('');
    setOwnerName('');
    setWhatsappNumber('');
    setDescription('');
    setFullAddress('');
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
        setErrorMsg(`Photo "${file.name}" exceeds the 50MB maximum limit.`);
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

      throw new Error('Image upload failed. Please verify format and size.');
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setErrorMsg(err.message || 'Image upload failed.');
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  // Plant Photo Upload Handler (50MB check)
  const handleFastPhotoUpload = async (file: File) => {
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(`Photo "${file.name}" exceeds 50MB limit.`);
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
      throw new Error('Plant photo upload failed.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Plant photo upload failed.');
    } finally {
      setIsUploadingFastPhoto(false);
    }
  };

  const handleAddFastItem = () => {
    if (!newFastCrop) {
      setErrorMsg('Please select a crop for the featured plant.');
      return;
    }
    if (fastSellingItems.length >= 4) {
      setErrorMsg('Maximum 4 featured plants allowed.');
      return;
    }

    setFastSellingItems((prev) => [
      ...prev,
      {
        id: `temp_${Date.now()}`,
        cropId: newFastCrop,
        varietyId: newFastVariety || null,
        priceEn: newFastPrice.trim() || null,
        priceSi: newFastPrice.trim() || null,
        imageUrl: newFastPhoto || null,
        badgeId: newFastBadge || null
      }
    ]);

    setNewFastCrop('');
    setNewFastVariety('');
    setNewFastPrice('');
    setNewFastBadge('');
    setNewFastPhoto('');
    setErrorMsg(null);
  };

  const handleAddStock = () => {
    if (!newStockCrop) {
      setErrorMsg('Please select a crop for the available stock.');
      return;
    }

    setStocks((prev) => [
      ...prev,
      {
        id: `temp_stock_${Date.now()}`,
        categoryId: newStockCategory || null,
        cropId: newStockCrop,
        varietyId: null,
        stockRangeEn: newStockRange,
        stockRangeSi: newStockRange
      }
    ]);

    setNewStockCrop('');
    setErrorMsg(null);
  };

  const validateStep = (step: StepNumber): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg('Nursery name is required.');
        return false;
      }
      if (!whatsappNumber.trim()) {
        setErrorMsg('WhatsApp or phone number is required.');
        return false;
      }
    }
    if (step === 2) {
      if (!provinceEn || !districtEn) {
        setErrorMsg('Province and district are required.');
        return false;
      }
      if (!fullAddress.trim()) {
        setErrorMsg('Physical address is required.');
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
      setErrorMsg('You must be signed in to submit a plant nursery.');
      return;
    }

    if (!name.trim() || !whatsappNumber.trim()) {
      setCurrentStep(1);
      setErrorMsg('Nursery name and phone number are required.');
      return;
    }

    if (!fullAddress.trim()) {
      setCurrentStep(2);
      setErrorMsg('Physical address is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nameEn: name.trim(),
        nameSi: name.trim(),
        ownerNameEn: ownerName.trim() || null,
        ownerNameSi: ownerName.trim() || null,
        whatsappNumber: whatsappNumber.trim(),
        isGovRegistered,
        certificateNo: certificateNo.trim() || null,
        gradeId: gradeId || null,
        deliveryId: deliveryId || null,
        operatingHoursId: operatingHoursId || null,
        certificationId: certificationId || null,
        googleMapsUrl: googleMapsUrl.trim() || null,
        descriptionEn: description.trim() || null,
        descriptionSi: description.trim() || null,
        location: {
          provinceEn,
          provinceSi,
          districtEn,
          districtSi,
          divisionalSecretariatEn: dsdEn.trim() || null,
          divisionalSecretariatSi: dsdSi.trim() || null,
          gramaNiladhariDivisionEn: gndEn.trim() || null,
          gramaNiladhariDivisionSi: gndSi.trim() || null,
          fullAddressEn: fullAddress.trim(),
          fullAddressSi: fullAddress.trim()
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
        throw new Error(json.error || json.message || 'Failed to submit nursery.');
      }

      localStorage.removeItem(draftKey);
      localStorage.removeItem(`${DRAFT_PREFIX}anonymous`);

      setSuccessSubmitted(true);
      onSuccess();
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'Failed to submit nursery. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-5xl max-h-[95vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
        
        {/* Header - Minimal & Professional */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Register Plant Nursery
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Submit your nursery profile for review and listing on Aswanna.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Material UI Styled Tabs Bar */}
        <div className="bg-white border-b border-gray-200 px-6 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-6 sm:gap-8 min-w-max">
            {STEPS.map((s) => {
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

                  {/* Material UI active indicator underline */}
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
              <span>Restored your saved draft (valid for 7 days).</span>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="text-gray-900 font-semibold underline text-xs cursor-pointer ml-3"
              >
                Discard Draft
              </button>
            </div>
          )}

          {/* Login prompt if anonymous */}
          {!user && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-xs">
              You can complete these fields now. You will be prompted to log in when submitting.
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
                Nursery Submitted Successfully
              </h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                Your nursery listing has been submitted for administrative verification. It will appear publicly on the Aswanna Plant Finder portal once approved.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-xs font-bold text-white bg-[#006837] hover:bg-[#00522c] rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 6) { handleSubmit(e); } else { handleNext(); } }} className="space-y-5">
              
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-bold text-gray-900">1. Basic Nursery Information</h3>
                    <p className="text-xs text-gray-500">Provide official nursery name and direct contact numbers.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nursery Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Green Meadows Plant Nursery"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Owner / Manager Name
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. K. R. Gunasekara"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        WhatsApp / Contact Number *
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

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nursery Description & Overview
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief overview about your plant varieties, nursery services, or plant propagation..."
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
                    <h3 className="text-sm font-bold text-gray-900">2. Physical Location & Administrative Division</h3>
                    <p className="text-xs text-gray-500">Official geographical location of the nursery premises.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Province *</label>
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
                            {p.en}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">District *</label>
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
                        <option value="">Select District</option>
                        {availableDistricts.map((d) => (
                          <option key={d.en} value={d.en}>
                            {d.en}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">DS Division (DSD)</label>
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
                        <option value="">Select DSD</option>
                        {availableDsds.map((dsd) => (
                          <option key={dsd.nameEn} value={dsd.nameEn}>
                            {dsd.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">GN Division (GND)</label>
                      <select
                        value={gndEn}
                        onChange={(e) => {
                          const gnd = availableGnds.find((x) => x.nameEn === e.target.value);
                          setGndEn(e.target.value);
                          setGndSi(gnd?.nameSi || e.target.value);
                        }}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      >
                        <option value="">Select GND</option>
                        {availableGnds.map((gnd) => (
                          <option key={gnd.nameEn} value={gnd.nameEn}>
                            {gnd.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Full Physical Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullAddress}
                        onChange={(e) => setFullAddress(e.target.value)}
                        placeholder="e.g. No. 45, Kurunegala Road, Narammala."
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837] focus:ring-1 focus:ring-[#006837]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Google Maps Link (Optional)
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
                    <h3 className="text-sm font-bold text-gray-900">3. Registration & Operational Facilities</h3>
                    <p className="text-xs text-gray-500">Government certification and customer service facilities.</p>
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
                        Government Department of Agriculture (DOA) Registered
                      </label>
                    </div>

                    {isGovRegistered && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Registration / Certificate Number
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
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Nursery Grade</label>
                      <select
                        value={gradeId}
                        onChange={(e) => setGradeId(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                      >
                        <option value="">Select Grade</option>
                        {options.grades.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.nameEn || g.nameSi}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Service</label>
                      <select
                        value={deliveryId}
                        onChange={(e) => setDeliveryId(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                      >
                        <option value="">Select Delivery Option</option>
                        {options.deliveries.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nameEn || d.nameSi}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Operating Hours</label>
                      <select
                        value={operatingHoursId}
                        onChange={(e) => setOperatingHoursId(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                      >
                        <option value="">Select Operating Hours</option>
                        {options.operatingHours.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.nameEn || h.nameSi}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Certification Type</label>
                      <select
                        value={certificationId}
                        onChange={(e) => setCertificationId(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                      >
                        <option value="">Select Certification</option>
                        {options.certifications?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameEn || c.nameSi}
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
                      <h3 className="text-sm font-bold text-gray-900">4. Nursery Photos (Max 5)</h3>
                      <p className="text-xs text-gray-500">Upload photos of your nursery beds, premises, or entrance.</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {uploadedPhotos.length} / 5 Photos
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
                          <span className="text-xs font-bold">Uploading photos...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                            <UploadCloud size={18} />
                          </div>
                          <p className="text-xs font-semibold text-gray-800">
                            Click or drag photos here (Up to 50MB each)
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
                              Cover
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
                      <h3 className="text-sm font-bold text-gray-900">5. Featured / Fast-Selling Plants (Max 4)</h3>
                      <p className="text-xs text-gray-500">Showcase your signature plant varieties and current pricing.</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {fastSellingItems.length} / 4 Added
                    </span>
                  </div>

                  {fastSellingItems.length < 4 && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Crop *</label>
                          <select
                            value={newFastCrop}
                            onChange={(e) => setNewFastCrop(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                          >
                            <option value="">Select Crop</option>
                            {options.crops.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.nameEn || c.nameSi}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Variety</label>
                          <select
                            value={newFastVariety}
                            onChange={(e) => setNewFastVariety(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                          >
                            <option value="">Select Variety</option>
                            {options.varieties.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.nameEn || v.nameSi}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Unit Price</label>
                          <input
                            type="text"
                            value={newFastPrice}
                            onChange={(e) => setNewFastPrice(e.target.value)}
                            placeholder="e.g. Rs. 750"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Badge</label>
                          <select
                            value={newFastBadge}
                            onChange={(e) => setNewFastBadge(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#006837]"
                          >
                            <option value="">Select Badge</option>
                            {options.badges?.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.nameEn || b.nameSi}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Plant Photo Upload */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Plant Photo</label>
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
                                <RefreshCw className="w-4 h-4 animate-spin" /> Uploading...
                              </span>
                            ) : (
                              <span className="text-xs text-gray-600">
                                Click or drop plant photo here (Up to 50MB)
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
                          + Add Plant Variety
                        </button>
                      </div>
                    </div>
                  )}

                  {fastSellingItems.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {fastSellingItems.map((item, idx) => {
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
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-xs font-bold text-gray-900 truncate">
                                    {cropObj?.nameEn || cropObj?.nameSi || 'Crop'}
                                  </span>
                                  {varObj && (
                                    <span className="text-[10px] text-gray-500 truncate">
                                      ({varObj.nameEn || varObj.nameSi})
                                    </span>
                                  )}
                                  {badgeObj && (
                                    <span className="text-[9px] bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded font-medium">
                                      {badgeObj.nameEn || badgeObj.nameSi}
                                    </span>
                                  )}
                                </div>
                                {item.priceEn && (
                                  <span className="text-xs font-semibold text-[#006837] block mt-0.5">
                                    {item.priceEn}
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
                    <h3 className="text-sm font-bold text-gray-900">6. Current Plant Stocks & Specialties</h3>
                    <p className="text-xs text-gray-500">Specify available inventory ranges and plant specializations.</p>
                  </div>

                  {/* Stock Controls */}
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-gray-800 block">Add Available Crops & Volume</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Category</label>
                        <select
                          value={newStockCategory}
                          onChange={(e) => setNewStockCategory(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                        >
                          <option value="">All Categories</option>
                          {options.categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.nameEn || c.nameSi}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Crop *</label>
                        <select
                          value={newStockCrop}
                          onChange={(e) => setNewStockCrop(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                        >
                          <option value="">Select Crop</option>
                          {options.crops.map((cr) => (
                            <option key={cr.id} value={cr.id}>{cr.nameEn || cr.nameSi}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Stock Range</label>
                        <select
                          value={newStockRange}
                          onChange={(e) => setNewStockRange(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                        >
                          <option value="100 - 500">100 - 500 Plants</option>
                          <option value="500 - 1,000">500 - 1,000 Plants</option>
                          <option value="1,000 - 5,000">1,000 - 5,000 Plants</option>
                          <option value="5,000+">5,000+ Plants</option>
                        </select>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={handleAddStock}
                          className="w-full px-3 py-1.5 text-xs font-bold text-white bg-[#006837] hover:bg-[#00522c] rounded-lg cursor-pointer"
                        >
                          + Add Stock
                        </button>
                      </div>
                    </div>

                    {stocks.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                        {stocks.map((st, idx) => {
                          const c = options.crops.find((x) => x.id === st.cropId);
                          return (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800">
                              <span>{c?.nameEn || c?.nameSi || 'Crop'} ({st.stockRangeEn})</span>
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
                      <span className="text-xs font-bold text-gray-800 block">Nursery Specialties</span>
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
                              {sp.nameEn || sp.nameSi}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-xs leading-relaxed">
                    By submitting this form, you certify that the nursery details provided are authentic. Your listing will appear on the public Plant Finder once approved by our verification team.
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
                    <span>Previous</span>
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
                    <span>Next</span>
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
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Plant Nursery</span>
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
