import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';

interface MarketplaceCategory {
  id: string;
  nameEn: string;
  nameSi: string;
  slug: string;
  imageUrl?: string | null;
  activeState: boolean;
  _count?: { marketplaces: number };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit: MarketplaceCategory | null;
  onSuccess: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MarketplaceCategoryModal({
  isOpen,
  onClose,
  categoryToEdit,
  onSuccess
}: Props) {
  const [nameEn, setNameEn] = useState('');
  const [nameSi, setNameSi] = useState('');
  const [slug, setSlug] = useState('');
  const [activeState, setActiveState] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setNameEn(categoryToEdit.nameEn || '');
      setNameSi(categoryToEdit.nameSi || '');
      setSlug(categoryToEdit.slug || '');
      setActiveState(categoryToEdit.activeState ?? true);
      setImagePreview(categoryToEdit.imageUrl || null);
      setImageFile(null);
    } else {
      setNameEn('');
      setNameSi('');
      setSlug('');
      setActiveState(true);
      setImagePreview(null);
      setImageFile(null);
    }
    setError(null);
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameSi.trim()) {
      setError('Both English and Sinhala category names are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const formData = new FormData();
      formData.append('nameEn', nameEn.trim());
      formData.append('nameSi', nameSi.trim());
      if (slug.trim()) formData.append('slug', slug.trim());
      formData.append('activeState', String(activeState));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const url = categoryToEdit
        ? `${API_BASE_URL}/marketplace/categories/${categoryToEdit.id}`
        : `${API_BASE_URL}/marketplace/categories`;
      const method = categoryToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || 'Failed to save category');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {categoryToEdit ? 'Edit Marketplace Category' : 'Add Marketplace Category'}
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              {categoryToEdit ? 'කාණ්ඩය යාවත්කාලීන කරන්න' : 'නව වෙළඳපොළ කාණ්ඩයක් එක් කරන්න'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Category Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => {
                const val = e.target.value;
                setNameEn(val);
                if (!categoryToEdit) {
                  const autoSlug = val
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                  setSlug(autoSlug);
                }
              }}
              placeholder="e.g. Agricultural Machinery"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Category Name (Sinhala) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nameSi}
              onChange={(e) => setNameSi(e.target.value)}
              placeholder="උදා: කෘෂිකාර්මික යන්ත්‍රෝපකරණ"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Slug (Optional - auto generated if empty)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. agricultural-machinery"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          {/* Category Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Category Icon / Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="category-image-input"
            />

            {imagePreview ? (
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300 bg-white shrink-0 flex items-center justify-center">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {imageFile ? imageFile.name : 'Category Image Uploaded'}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      Change
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label
                htmlFor="category-image-input"
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-xl cursor-pointer bg-gray-50/50 hover:bg-emerald-50/20 transition-all text-center"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 shadow-inner">
                  <Upload size={18} />
                </div>
                <span className="text-xs font-semibold text-gray-700">Click to upload category icon</span>
                <span className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, or SVG up to 5MB</span>
              </label>
            )}
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs font-semibold text-gray-800">Active Status</span>
              <p className="text-[11px] text-gray-500">Enable this category on the marketplace</p>
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

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
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
              <span>{categoryToEdit ? 'Update Category' : 'Save Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
