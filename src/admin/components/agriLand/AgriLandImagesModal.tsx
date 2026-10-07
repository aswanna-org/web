import React, { useState } from 'react';
import { X, Upload, Star, Trash2, Image as ImageIcon, AlertCircle, Plus, Check } from 'lucide-react';
import type { AgriLand } from './types';
import AgroLoader from '../../../components/common/AgroLoader';

interface AgriLandImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  land: AgriLand | null;
  onSuccess: () => void;
  apiBaseUrl: string;
  token: string | null;
}

export const AgriLandImagesModal: React.FC<AgriLandImagesModalProps> = ({
  isOpen,
  onClose,
  land,
  onSuccess,
  apiBaseUrl,
  token
}) => {
  const [uploading, setUploading] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !land) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);
        formData.append('agriLandId', land.id);
        if (land.images.length === 0 && i === 0) {
          formData.append('isPrimary', 'true');
        }

        const res = await fetch(`${apiBaseUrl}/agri-land-images/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || `Failed to upload ${files[i].name}`);
        }
      }

      setSuccessMsg('Images uploaded successfully!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddDirectUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${apiBaseUrl}/agri-land-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          agriLandId: land.id,
          imageUrl: directUrl.trim(),
          isPrimary: land.images.length === 0
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add image URL');
      }

      setDirectUrl('');
      setSuccessMsg('Image added successfully!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add image');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/agri-land-images/${imageId}/set-primary`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to set primary image:', err);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    try {
      const res = await fetch(`${apiBaseUrl}/agri-land-images/${imageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold">Manage Photos - {land.titleEn}</h3>
            <p className="text-xs text-slate-300 mt-0.5">{land.titleSi || 'ඉඩමේ ඡායාරූප කළමනාකරණය'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 p-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
              <Check className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Upload Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            {/* Direct File Upload */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 bg-white transition cursor-pointer relative group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 mb-2 transition" />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">
                Click or Drop Images Here
              </span>
              <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP (Encrypted S3 Upload)</span>
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleAddDirectUrl} className="flex flex-col justify-center space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Or Add Image via URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  disabled={uploading}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={uploading || !directUrl.trim()}
                  className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </form>
          </div>

          {/* Photos Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Existing Photos ({land.images?.length || 0})
            </h4>

            {uploading && (
              <div className="py-6 flex justify-center">
                <AgroLoader />
              </div>
            )}

            {(!land.images || land.images.length === 0) && !uploading ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No photos added to this listing yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {land.images?.map((img) => (
                  <div
                    key={img.id}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3 shadow-xs"
                  >
                    <img
                      src={img.imageUrl}
                      alt={land.titleEn}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Preview';
                      }}
                    />

                    {/* Primary Badge */}
                    {img.isPrimary && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        <Star className="w-3 h-3 fill-white" />
                        <span>Primary</span>
                      </span>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(img.id)}
                          title="Set as Primary Cover Photo"
                          className="p-1.5 bg-white hover:bg-amber-50 text-amber-600 rounded-lg transition shadow-sm"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        title="Delete photo"
                        className="p-1.5 bg-white hover:bg-red-50 text-red-600 rounded-lg transition shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
