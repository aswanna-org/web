import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Upload,
  Loader2,
  Trash2,
  Tag,
  MapPin,
  Phone,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDistricts, type District } from 'sl-gnd-dsd-districts';

interface MarketplaceCategory {
  id: string;
  nameEn: string;
  nameSi: string;
  slug: string;
  imageUrl?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: MarketplaceCategory[];
  defaultCategorySlug?: string;
  onSuccess: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MarketplacePublicPostModal({
  isOpen,
  onClose,
  categories,
  defaultCategorySlug,
  onSuccess
}: Props) {
  const { i18n } = useTranslation();
  const isSi = i18n.language === 'si';
  const { user, token, isAuthenticated, openLoginModal } = useAuth();

  const [categoryId, setCategoryId] = useState('');
  const [titleSi, setTitleSi] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [districtEn, setDistrictEn] = useState('Colombo');
  const [districtSi, setDistrictSi] = useState('කොළඹ');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [description, setDescription] = useState('');

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const districts: District[] = React.useMemo(() => {
    try {
      return getDistricts();
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Find category matching defaultCategorySlug or fallback to first
      if (defaultCategorySlug) {
        const found = categories.find((c) => c.slug === defaultCategorySlug);
        if (found) setCategoryId(found.id);
        else if (categories.length > 0) setCategoryId(categories[0].id);
      } else if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }

      setTitleSi('');
      setTitleEn('');
      setDistrictEn('Colombo');
      setDistrictSi('කොළඹ');
      setLocation('');
      setPrice('');
      setPhoneNumber('');
      setOwnerName(user?.name || '');
      setDescription('');
      setImageFiles([]);
      setImagePreviews([]);
      setError(null);
    }
  }, [isOpen, defaultCategorySlug, categories, user]);

  if (!isOpen) return null;

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEn = e.target.value;
    const found = districts.find((d) => d.nameEn === selectedEn);
    setDistrictEn(selectedEn);
    setDistrictSi(found ? found.nameSi : selectedEn);
  };

  const handleFilesAdded = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    if (imageFiles.length + validFiles.length > 8) {
      setError(isSi ? 'උපරිම ඡායාරූප 8ක් පමණක් එකතු කළ හැක.' : 'You can upload a maximum of 8 images.');
      return;
    }

    const newFiles = [...imageFiles, ...validFiles];
    setImageFiles(newFiles);
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      openLoginModal();
      return;
    }

    if (!categoryId) {
      setError(isSi ? 'කරුණාකර ප්‍රවර්ගයක් තෝරන්න.' : 'Please select a category.');
      return;
    }

    if (!titleSi.trim() && !titleEn.trim()) {
      setError(isSi ? 'කරුණාකර දැන්වීමේ මාතෘකාව ඇතුළත් කරන්න.' : 'Please enter an item title.');
      return;
    }

    if (!phoneNumber.trim()) {
      setError(isSi ? 'ගැණුම්කරුවන්ට සම්බන්ධ කරගත හැකි දුරකථන අංකයක් ඇතුළත් කරන්න.' : 'Please enter a contact phone number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const finalTitleSi = titleSi.trim() || titleEn.trim();
      const finalTitleEn = titleEn.trim() || titleSi.trim();

      // Clean slug from English title
      const cleanSlug = finalTitleEn
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const formData = new FormData();
      formData.append('categoryId', categoryId);
      formData.append('titleSi', finalTitleSi);
      formData.append('titleEn', finalTitleEn);
      if (cleanSlug) formData.append('slug', cleanSlug);
      formData.append('districtSi', districtSi);
      formData.append('districtEn', districtEn);
      if (location.trim()) {
        formData.append('locationSi', location.trim());
        formData.append('locationEn', location.trim());
      }
      if (price.trim()) {
        formData.append('priceSi', price.trim());
        formData.append('priceEn', price.trim());
      }
      formData.append('phoneNumber', phoneNumber.trim());
      const seller = ownerName.trim() || user?.name || '';
      if (seller) {
        formData.append('ownerNameSi', seller);
        formData.append('ownerNameEn', seller);
      }
      if (description.trim()) {
        formData.append('descriptionSi', description.trim());
        formData.append('descriptionEn', description.trim());
      }
      formData.append('activeState', 'true');
      // Public users default to pending approval
      formData.append('isPublished', 'false');

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await fetch(`${API_BASE_URL}/marketplace`, {
        method: 'POST',
        headers: {
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || (isSi ? 'දැන්වීම පළ කිරීමට නොහැකි විය.' : 'Failed to post listing.'));
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating marketplace item:', err);
      setError(err.message || (isSi ? 'දෝෂයක් ඇති විය.' : 'An unexpected error occurred.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-fade-smooth">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold tracking-wide text-emerald-100 mb-1">
              <Tag size={12} />
              <span>{isSi ? 'කෘෂි වෙළඳපොල' : 'Agricultural Marketplace'}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold">
              {isSi ? 'නව දැන්වීමක් පළ කරන්න' : 'Post a Marketplace Ad'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Category Selector (Strictly Select existing categories only) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {isSi ? 'ප්‍රවර්ගය (කාණ්ඩය තෝරන්න)' : 'Category (Select Category)'} <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-800 focus:outline-emerald-600 focus:border-emerald-600 cursor-pointer shadow-2xs font-medium"
            >
              <option value="">{isSi ? '-- ප්‍රවර්ගයක් තෝරන්න --' : '-- Select a Category --'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {isSi ? c.nameSi : c.nameEn} {c.nameSi !== c.nameEn ? `(${c.nameEn})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isSi ? 'දැන්වීමේ නම (සිංහලෙන්)' : 'Item Title (Sinhala)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={titleSi}
                onChange={(e) => {
                  setTitleSi(e.target.value);
                  if (!titleEn) setTitleEn(e.target.value);
                }}
                placeholder={isSi ? 'උදා: කුබෝටා ට්‍රැක්ටරය 45HP' : 'e.g. Kubota Tractor 45HP'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isSi ? 'දැන්වීමේ නම (English)' : 'Item Title (English)'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Kubota Tractor 45HP"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          {/* 3. District & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isSi ? 'දිස්ත්‍රික්කය' : 'District'} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={districtEn}
                onChange={handleDistrictChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-800 focus:outline-emerald-600 focus:border-emerald-600 cursor-pointer shadow-2xs"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.nameEn}>
                    {isSi ? d.nameSi : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isSi ? 'නගරය / ප්‍රදේශය (Location)' : 'Town / Area'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={isSi ? 'උදා: හෝමාගම, මීගමුව' : 'e.g. Homagama, Negombo'}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* 4. Price & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isSi ? 'මිල (රුපියල් වලින්)' : 'Price (LKR)'}
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={isSi ? 'උදා: 25,000 හෝ සාකච්ඡා කළ හැක' : 'e.g. 25,000 or Negotiable'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isSi ? 'දුරකථන අංකය (Contact)' : 'Phone Number'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 077 123 4567"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* 5. Seller Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {isSi ? 'ඔබගේ නම (Seller Name)' : 'Seller Name'}
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder={user?.name || (isSi ? 'නම ඇතුළත් කරන්න' : 'Enter your name')}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          {/* 6. Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {isSi ? 'අයිතමය පිළිබඳ විස්තරය' : 'Item Description'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isSi ? 'තත්වය, භාවිත කළ කාලය සහ වෙනත් විශේෂ විස්තර ඇතුළත් කරන්න...' : 'Condition, usage, and any other relevant details...'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:outline-emerald-600 focus:border-emerald-600 shadow-2xs resize-none"
            />
          </div>

          {/* 7. Image Upload Box */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {isSi ? 'ඡායාරූප (උපරිම 8ක්)' : 'Photos (Max 8)'}
            </label>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-gray-200 hover:border-emerald-400 bg-gray-50/50'
              }`}
            >
              <Upload size={24} className="mx-auto text-emerald-700 mb-1.5" />
              <p className="text-xs font-bold text-gray-800">
                {isSi ? 'ඡායාරූප තෝරන්න හෝ මෙතැනට ඇදගෙන එන්න' : 'Choose images or drag & drop here'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WEBP (Max 5MB each)</p>
            </div>

            {/* Thumbnail previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 mt-3">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 bg-gray-100">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notice: Pending admin review */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-[11px] sm:text-xs text-emerald-900 leading-relaxed">
            {isSi
              ? 'දැන්වීම ඉදිරිපත් කළ පසු අපගේ පරිපාලක (Admin) කණ්ඩායම විසින් පරීක්ෂා කර අනුමත කළ පසුව එය වෙළඳපොලෙහි ප්‍රසිද්ධ කෙරේ.'
              : 'Once submitted, your listing will be reviewed by our administration and published to the marketplace.'}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 font-semibold text-xs transition cursor-pointer"
            >
              {isSi ? 'අවලංගු කරන්න' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#006837] hover:bg-[#00532c] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              <span>
                {isSubmitting
                  ? (isSi ? 'සුරකිමින් පවතී...' : 'Submitting...')
                  : (isSi ? 'දැන්වීම පළ කරන්න' : 'Submit Listing')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
