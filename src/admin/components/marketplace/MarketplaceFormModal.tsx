import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Loader2,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  Layers
} from 'lucide-react';
import { SRI_LANKA_PROVINCES, type DistrictOption } from '../../../data/sriLankaLocations';

interface MarketplaceImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  slug: string;
  activeState: boolean;
}

interface MarketplaceCategory {
  id: string;
  nameEn: string;
  nameSi: string;
  slug: string;
}

interface Marketplace {
  id: string;
  slug: string;
  titleEn: string;
  titleSi: string;
  districtEn: string;
  districtSi: string;
  locationEn?: string | null;
  locationSi?: string | null;
  priceEn?: string | null;
  priceSi?: string | null;
  phoneNumber?: string | null;
  ownerNameEn?: string | null;
  ownerNameSi?: string | null;
  descriptionEn?: string | null;
  descriptionSi?: string | null;
  activeState: boolean;
  isPublished: boolean;
  categoryId: string;
  images?: MarketplaceImage[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: Marketplace | null;
  categories: MarketplaceCategory[];
  onSuccess: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MarketplaceFormModal({
  isOpen,
  onClose,
  itemToEdit,
  categories,
  onSuccess
}: Props) {
  const [categoryId, setCategoryId] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleSi, setTitleSi] = useState('');
  const [districtEn, setDistrictEn] = useState('Colombo');
  const [districtSi, setDistrictSi] = useState('කොළඹ');
  const [locationEn, setLocationEn] = useState('');
  const [locationSi, setLocationSi] = useState('');
  const [priceEn, setPriceEn] = useState('');
  const [priceSi, setPriceSi] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ownerNameEn, setOwnerNameEn] = useState('');
  const [ownerNameSi, setOwnerNameSi] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionSi, setDescriptionSi] = useState('');
  const [slug, setSlug] = useState('');
  const [activeState, setActiveState] = useState(true);
  const [isPublished, setIsPublished] = useState(true);

  // Existing uploaded images (when editing)
  const [existingImages, setExistingImages] = useState<MarketplaceImage[]>([]);

  // Newly selected files to upload
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flattened all Sri Lanka districts
  const allDistricts = React.useMemo(() => {
    const list: DistrictOption[] = [];
    SRI_LANKA_PROVINCES.forEach((p) => {
      p.districts.forEach((d) => {
        if (!list.some((existing) => existing.en.toLowerCase() === d.en.toLowerCase())) {
          list.push(d);
        }
      });
    });
    return list;
  }, []);

  useEffect(() => {
    if (itemToEdit) {
      setCategoryId(itemToEdit.categoryId || (categories.length > 0 ? categories[0].id : ''));
      setTitleEn(itemToEdit.titleEn || '');
      setTitleSi(itemToEdit.titleSi || '');
      setSlug(itemToEdit.slug || '');
      setDistrictEn(itemToEdit.districtEn || '');
      setDistrictSi(itemToEdit.districtSi || '');
      setLocationEn(itemToEdit.locationEn || '');
      setLocationSi(itemToEdit.locationSi || '');
      setPriceEn(itemToEdit.priceEn || '');
      setPriceSi(itemToEdit.priceSi || '');
      setPhoneNumber(itemToEdit.phoneNumber || '');
      setOwnerNameEn(itemToEdit.ownerNameEn || '');
      setOwnerNameSi(itemToEdit.ownerNameSi || '');
      setDescriptionEn(itemToEdit.descriptionEn || '');
      setDescriptionSi(itemToEdit.descriptionSi || '');
      setActiveState(itemToEdit.activeState ?? true);
      setIsPublished(itemToEdit.isPublished ?? true);
      setExistingImages(itemToEdit.images || []);
    } else {
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setTitleEn('');
      setTitleSi('');
      setSlug('');
      setDistrictEn('Colombo');
      setDistrictSi('කොළඹ');
      setLocationEn('');
      setLocationSi('');
      setPriceEn('');
      setPriceSi('');
      setPhoneNumber('');
      setOwnerNameEn('');
      setOwnerNameSi('');
      setDescriptionEn('');
      setDescriptionSi('');
      setActiveState(true);
      setIsPublished(true);
      setExistingImages([]);
    }
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setError(null);
  }, [itemToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selEn = e.target.value;
    const found = allDistricts.find((d) => d.en === selEn);
    setDistrictEn(selEn);
    setDistrictSi(found ? found.si : selEn);
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const addedFiles = Array.from(e.target.files);
      setNewImageFiles((prev) => [...prev, ...addedFiles]);
      const addedPreviews = addedFiles.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...addedPreviews]);
    }
  };

  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      if (droppedFiles.length > 0) {
        setNewImageFiles((prev) => [...prev, ...droppedFiles]);
        const addedPreviews = droppedFiles.map((file) => URL.createObjectURL(file));
        setNewImagePreviews((prev) => [...prev, ...addedPreviews]);
      }
    }
  };

  const removeNewFile = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId: string) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''
        }
      });
      if (res.ok) {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete image');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/images/${imageId}/primary`, {
        method: 'PATCH',
        headers: {
          Authorization: token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''
        }
      });
      if (res.ok) {
        setExistingImages((prev) =>
          prev.map((img) => ({
            ...img,
            isPrimary: img.id === imageId
          }))
        );
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to set primary image');
      }
    } catch (err) {
      console.error('Error setting primary image:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    if (!titleEn.trim() || !titleSi.trim()) {
      setError('Title in both English and Sinhala is required');
      return;
    }
    if (!districtEn || !districtSi) {
      setError('District is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const formData = new FormData();
      formData.append('categoryId', categoryId);
      formData.append('titleEn', titleEn.trim());
      formData.append('titleSi', titleSi.trim());
      if (slug.trim()) formData.append('slug', slug.trim());
      formData.append('districtEn', districtEn.trim());
      formData.append('districtSi', districtSi.trim());
      if (locationEn) formData.append('locationEn', locationEn.trim());
      if (locationSi) formData.append('locationSi', locationSi.trim());
      if (priceEn) formData.append('priceEn', priceEn.trim());
      if (priceSi) formData.append('priceSi', priceSi.trim());
      if (phoneNumber) formData.append('phoneNumber', phoneNumber.trim());
      if (ownerNameEn) formData.append('ownerNameEn', ownerNameEn.trim());
      if (ownerNameSi) formData.append('ownerNameSi', ownerNameSi.trim());
      if (descriptionEn) formData.append('descriptionEn', descriptionEn.trim());
      if (descriptionSi) formData.append('descriptionSi', descriptionSi.trim());
      formData.append('activeState', String(activeState));
      formData.append('isPublished', String(isPublished));

      newImageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const url = itemToEdit
        ? `${API_BASE_URL}/marketplace/${itemToEdit.id}`
        : `${API_BASE_URL}/marketplace`;
      const method = itemToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || 'Failed to save listing');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold">
              {itemToEdit ? 'Edit Marketplace Listing' : 'Post New Marketplace Listing'}
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              {itemToEdit ? 'වෙළඳපොල දැන්වීම් විස්තර යාවත්කාලීන කරන්න' : 'නව වෙළඳපල අයිතමයක් පල කරන්න'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-4">
            <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider block">
              1. Basic Information (මූලික තොරතුරු)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category (කාණ්ඩය) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600 cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameSi})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  District (දිස්ත්‍රික්කය) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={districtEn}
                  onChange={handleDistrictChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600 cursor-pointer"
                >
                  {allDistricts.map((d) => (
                    <option key={d.en} value={d.en}>
                      {d.en} ({d.si})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Item Title (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTitleEn(val);
                    if (!itemToEdit) {
                      const autoSlug = val
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      setSlug(autoSlug);
                    }
                  }}
                  placeholder="e.g. Kubota 4-Wheel Tractor 45HP"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Item Title (Sinhala) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titleSi}
                  onChange={(e) => setTitleSi(e.target.value)}
                  placeholder="උදා: කුබෝටා රෝද 4 ට්‍රැක්ටරය"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Slug (Optional - auto generated from English title)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. kubota-4-wheel-tractor-45hp"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Specific Location (English)
                </label>
                <input
                  type="text"
                  value={locationEn}
                  onChange={(e) => setLocationEn(e.target.value)}
                  placeholder="e.g. Homagama Town, Near Clock Tower"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Specific Location (Sinhala)
                </label>
                <input
                  type="text"
                  value={locationSi}
                  onChange={(e) => setLocationSi(e.target.value)}
                  placeholder="උදා: හෝමාගම නගරය, ඔරලෝසු කණුව අසල"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Contact Details */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-4">
            <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider block">
              2. Price & Contact Details (මිල සහ සබඳතා)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Price Display (මිල)
                </label>
                <input
                  type="text"
                  value={priceEn}
                  onChange={(e) => setPriceEn(e.target.value)}
                  placeholder="e.g. Rs. 2,450,000 or Negotiable"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number (දුරකථන අංකය)
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0771234567"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Seller / Owner Name (විකුණුම්කරු)
                </label>
                <input
                  type="text"
                  value={ownerNameEn}
                  onChange={(e) => setOwnerNameEn(e.target.value)}
                  placeholder="e.g. Sunimal Perera"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Descriptions */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-4">
            <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider block">
              3. Description (විස්තරය)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description (English)
                </label>
                <textarea
                  rows={4}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Detailed information regarding the product, condition, warranty..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description (Sinhala)
                </label>
                <textarea
                  rows={4}
                  value={descriptionSi}
                  onChange={(e) => setDescriptionSi(e.target.value)}
                  placeholder="භාණ්ඩයේ තත්ත්වය, වගකීම් සහ අමතර විස්තර..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: RICH IMAGE UPLOAD SECTION */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider block">
                4. Listing Images (ඡායාරූප උඩුගත කිරීම)
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Upload clear photos of the product or agricultural item. Up to 10 photos supported.
              </p>
            </div>

            {/* Large Dashed Drag & Drop File Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragOver(false);
              }}
              onDrop={handleDropFiles}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-gray-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20'
              }`}
            >
              <input
                type="file"
                id="marketplace-image-dropzone"
                multiple
                accept="image/*"
                onChange={handleFilesChange}
                className="hidden"
              />
              <label htmlFor="marketplace-image-dropzone" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                  <Upload size={22} />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Click to select images (or drag and drop)
                </span>
                <span className="text-xs text-gray-500 mt-1 max-w-sm">
                  JPG, PNG, WEBP files up to 10MB each. High resolution recommended.
                </span>
                <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 shadow-2xs">
                  <Layers size={13} className="text-emerald-600" /> Multi-select enabled
                </span>
              </label>
            </div>

            {/* Existing Uploaded Images */}
            {existingImages.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Existing Album Images ({existingImages.length})
                  </span>
                  <span className="text-[11px] text-gray-400">First image serves as the cover photo</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-2.5 bg-white rounded-xl border border-gray-200">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100 border border-gray-200"
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                      {img.isPrimary && (
                        <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-xs">
                          Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(img.id)}
                            title="Set as Cover"
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
                          >
                            <Star size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingImage(img.id)}
                          title="Delete photo"
                          className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Newly Selected Images to Upload */}
            {newImageFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={13} /> Newly Selected Images to Upload ({newImageFiles.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewImageFiles([]);
                      setNewImagePreviews([]);
                    }}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Clear all new
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-2.5 bg-emerald-50/40 rounded-xl border border-emerald-200">
                  {newImagePreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100 border border-emerald-300"
                    >
                      <img src={preview} alt={`New preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewFile(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700 cursor-pointer"
                        title="Remove from upload list"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Status & Approval Switches */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800">Admin Approved / Published</span>
                <p className="text-[11px] text-gray-500">Only approved listings are publicly visible</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  isPublished ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isPublished ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800">Active State</span>
                <p className="text-[11px] text-gray-500">Enable or temporarily disable listing</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveState(!activeState)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  activeState ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    activeState ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              <span>{itemToEdit ? 'Update Listing' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
