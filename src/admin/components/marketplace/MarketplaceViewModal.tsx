import { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Edit,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Tag
} from 'lucide-react';

interface MarketplaceImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  slug: string;
  activeState: boolean;
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
  createdAt: string;
  categoryId: string;
  category?: {
    id: string;
    nameEn: string;
    nameSi: string;
    slug: string;
    imageUrl?: string | null;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  } | null;
  images?: MarketplaceImage[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: Marketplace | null;
  onEdit: (item: Marketplace) => void;
  onTogglePublish: (id: string, currentPublished: boolean) => Promise<void>;
}

export default function MarketplaceViewModal({
  isOpen,
  onClose,
  item,
  onEdit,
  onTogglePublish
}: Props) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen || !item) return null;

  const images = item.images && item.images.length > 0
    ? item.images
    : [{ id: 'placeholder', imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80', isPrimary: true, slug: 'default', activeState: true }];

  const currentImage = images[selectedImageIndex] || images[0];

  const handlePublishClick = async () => {
    setIsPublishing(true);
    try {
      await onTogglePublish(item.id, item.isPublished);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-300" />
            <div>
              <h2 className="text-base sm:text-lg font-bold line-clamp-1">{item.titleEn}</h2>
              <p className="text-xs text-white/80 line-clamp-1">{item.titleSi}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Image Showcase */}
          <div className="space-y-3">
            <div className="relative w-full h-56 sm:h-72 rounded-xl bg-gray-900 overflow-hidden flex items-center justify-center">
              <img
                src={currentImage.imageUrl}
                alt={item.titleEn}
                className="w-full h-full object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              {currentImage.isPrimary && (
                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                  Primary Cover
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImageIndex === idx ? 'border-emerald-600 scale-105 shadow-xs' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status & Approval Bar */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                item.isPublished
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {item.isPublished ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                <span>{item.isPublished ? 'Published & Approved' : 'Pending Admin Approval'}</span>
              </span>

              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                item.activeState ? 'bg-blue-50 text-blue-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {item.activeState ? 'Active' : 'Inactive'}
              </span>
            </div>

            <button
              onClick={handlePublishClick}
              disabled={isPublishing}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                item.isPublished
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <ShieldCheck size={16} />
              <span>{item.isPublished ? 'Unpublish' : 'Approve & Publish'}</span>
            </button>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2.5">
              <span className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Classification & Location</span>
              <div className="flex items-center gap-2 text-sm text-gray-800 font-semibold">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{item.category?.nameEn || 'Category N/A'} ({item.category?.nameSi})</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{item.districtEn} ({item.districtSi}) {item.locationEn ? `• ${item.locationEn}` : ''}</span>
              </div>
              {item.priceEn && (
                <div className="text-base font-extrabold text-emerald-700 pt-1">
                  {item.priceEn} {item.priceSi ? `(${item.priceSi})` : ''}
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2.5">
              <span className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Seller & Contact</span>
              <div className="flex items-center gap-2 text-sm text-gray-800 font-semibold">
                <UserIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{item.ownerNameEn || item.user?.name || 'Anonymous Seller'} {item.ownerNameSi ? `(${item.ownerNameSi})` : ''}</span>
              </div>
              {item.phoneNumber && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a href={`tel:${item.phoneNumber}`} className="text-emerald-700 hover:underline font-semibold">
                    {item.phoneNumber}
                  </a>
                </div>
              )}
              {item.user && (
                <p className="text-xs text-gray-500 pt-1">
                  Creator Account: <span className="font-medium text-gray-700">{item.user.email}</span> ({item.user.role})
                </p>
              )}
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Listing Description</span>
            {item.descriptionEn && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                <strong className="block text-gray-900 mb-1">English:</strong>
                {item.descriptionEn}
              </div>
            )}
            {item.descriptionSi && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                <strong className="block text-gray-900 mb-1">සිංහල:</strong>
                {item.descriptionSi}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-400">
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Edit size={14} className="text-emerald-700" />
              <span>Edit Listing</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
