import React from 'react';
import {
  X,
  MapPin,
  ExternalLink,
  Phone,
  CheckCircle2,
  XCircle,
  Building,
  Zap,
  Droplets,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  User,
  Sprout,
  Compass,
  Check,
  Clock
} from 'lucide-react';
import type { AgriLand } from './types';

interface AgriLandViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  land: AgriLand | null;
  onUpdateApprovalStatus?: (land: AgriLand, status: 'APPROVED' | 'REJECTED' | 'PENDING', reason?: string) => void;
}

export const AgriLandViewModal: React.FC<AgriLandViewModalProps> = ({ isOpen, onClose, land, onUpdateApprovalStatus }) => {
  if (!isOpen || !land) return null;

  const primaryImage = land.images?.find((img) => img.isPrimary) || land.images?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-6xl xl:max-w-7xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {land.dealType?.nameEn || 'Deal'}
              </span>

              {/* Approval status pill */}
              {land.approvalStatus === 'PENDING' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  <span>Pending Approval (අනුමැතිය අපේක්ෂිතයි)</span>
                </span>
              ) : land.approvalStatus === 'REJECTED' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  <span>Rejected (ප්‍රතික්ෂේපිතයි)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Approved & Live (අනුමතයි)</span>
                </span>
              )}

              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  land.activeState
                    ? 'bg-emerald-500/10 text-emerald-300'
                    : 'bg-red-500/10 text-red-300'
                }`}
              >
                {land.activeState ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h3 className="text-lg font-bold mt-1 text-white">{land.titleEn}</h3>
            {land.titleSi && <p className="text-xs text-slate-300">{land.titleSi}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Pending Approval Banner */}
          {land.approvalStatus === 'PENDING' && (
            <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Review Required: User Submission (අනුමැතිය සඳහා පරීක්ෂා කරන්න)
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    This land was submitted by {land.user?.name ? `${land.user.name} (${land.user.email})` : (land.user?.email || 'a registered user')}. It is currently hidden from public visitors.
                  </p>
                  <p className="text-[11px] text-amber-700 font-sinhala mt-0.5">
                    මෙම ඉඩම Public වෙබ් අඩවියේ දිස්වන්නේ ඔබ Approve කළ පසුව පමණි.
                  </p>
                </div>
              </div>
              {onUpdateApprovalStatus && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateApprovalStatus(land, 'APPROVED')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve (අනුමත කරන්න)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateApprovalStatus(land, 'REJECTED')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject (ප්‍රතික්ෂේප කරන්න)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Rejected Banner */}
          {land.approvalStatus === 'REJECTED' && (
            <div className="p-4 bg-rose-50 border border-rose-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900">Listing Rejected (ප්‍රතික්ෂේප කරන ලද ඉඩමකි)</h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    {land.rejectionReason ? `Reason: ${land.rejectionReason}` : 'This listing is rejected and not visible to public visitors.'}
                  </p>
                </div>
              </div>
              {onUpdateApprovalStatus && (
                <button
                  type="button"
                  onClick={() => onUpdateApprovalStatus(land, 'APPROVED')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Re-Approve Listing
                </button>
              )}
            </div>
          )}
          {/* Photos Showcase */}
          {land.images && land.images.length > 0 && (
            <div className="space-y-3">
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={primaryImage?.imageUrl}
                  alt={land.titleEn}
                  className="w-full h-full object-cover"
                />
                {primaryImage?.isPrimary && (
                  <span className="absolute top-3 left-3 bg-slate-900/80 text-white backdrop-blur-xs text-xs font-semibold px-2.5 py-1 rounded-lg">
                    Cover Photo
                  </span>
                )}
              </div>
              {land.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {land.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      alt="Thumbnail"
                      className="w-20 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Land Size
              </span>
              <span className="text-base font-bold text-slate-800">
                {land.acres ? `${land.acres} A ` : ''}
                {land.roods ? `${land.roods} R ` : ''}
                {land.perches ? `${land.perches} P` : ''}
                {!land.acres && !land.roods && !land.perches ? 'N/A' : ''}
              </span>
              {land.totalPerches ? (
                <span className="block text-[10px] text-slate-500 font-medium">
                  ({land.totalPerches} Total Perches)
                </span>
              ) : null}
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Price
              </span>
              <span className="text-base font-bold text-emerald-700">
                {land.priceEn || land.priceSi || 'Contact for Price'}
              </span>
              {land.priceSi && land.priceEn && (
                <span className="block text-[10px] text-slate-500">{land.priceSi}</span>
              )}
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Category
              </span>
              <span className="text-base font-bold text-slate-800">
                {land.landCategory?.nameEn || 'N/A'}
              </span>
              {land.landCategory?.nameSi && (
                <span className="block text-[10px] text-slate-500">{land.landCategory.nameSi}</span>
              )}
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Deed Type
              </span>
              <span className="text-base font-bold text-slate-800">
                {land.deedType?.nameEn || 'N/A'}
              </span>
              {land.deedType?.nameSi && (
                <span className="block text-[10px] text-slate-500">{land.deedType.nameSi}</span>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {land.location
                    ? `${land.location.districtEn}, ${land.location.provinceEn} Province`
                    : 'Location unspecified'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {land.location?.divisionalSecretariatEn && `DS: ${land.location.divisionalSecretariatEn} | `}
                  {land.location?.gramaNiladhariDivisionEn && `GN: ${land.location.gramaNiladhariDivisionEn}`}
                </p>
                {land.location?.districtSi && (
                  <p className="text-xs text-slate-400">
                    {land.location.districtSi} දිස්ත්‍රික්කය, {land.location.provinceSi} පළාත
                  </p>
                )}
              </div>
            </div>

            {land.locationUrl && (
              <a
                href={land.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Maps</span>
              </a>
            )}
          </div>

          {/* Specifications Matrix */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Infrastructure & Environmental Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Terrain</span>
                  <span className="font-semibold text-slate-800">{land.terrain?.nameEn || 'Unspecified'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Electricity</span>
                  <span className="font-semibold text-slate-800">{land.electricity?.nameEn || 'Unspecified'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <Droplets className="w-4 h-4 text-sky-500" />
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Water Source</span>
                  <span className="font-semibold text-slate-800">{land.waterSource?.nameEn || 'Unspecified'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Irrigation Tech</span>
                  <span className="font-semibold text-slate-800">{land.irrigationTech?.nameEn || 'Unspecified'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <Building className="w-4 h-4 text-slate-600" />
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Farm Building</span>
                  <span className="font-semibold text-slate-800">{land.farmBuilding?.nameEn || 'None'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Boundary Fencing</span>
                  <span className="font-semibold text-slate-800">{land.boundaryFencing?.nameEn || 'None'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Elephant Fence</span>
                  <span className="font-semibold text-slate-800">{land.elephantFence?.nameEn || 'None'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Wildlife Threat</span>
                  <span className="font-semibold text-slate-800">{land.wildlifeThreat?.nameEn || 'None'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Access Road</span>
                  <span className="font-semibold text-slate-800">{land.accessRoad?.nameEn || 'Unspecified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cultivated Crops */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Cultivation Status & Crops
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  land.isCultivated
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {land.isCultivated ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                <span>{land.isCultivated ? 'Cultivated Land (වගා කළ ඉඩමකි)' : 'Uncultivated (වගා නොකළ ඉඩමකි)'}</span>
              </span>

              {land.cultivatedCrops?.map((crop) => (
                <span
                  key={crop.id}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <Sprout className="w-3 h-3 text-emerald-600" />
                  <span>{crop.nameEn} ({crop.nameSi})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Owner & Contacts */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Land Owner / Contact
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  {land.ownerNameEn || land.ownerNameSi || 'Private Owner'}
                </h4>
                {land.ownerNameSi && land.ownerNameEn && (
                  <p className="text-xs text-slate-500">{land.ownerNameSi}</p>
                )}
              </div>
            </div>

            {land.whatsappNumber && (
              <a
                href={`https://wa.me/${land.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp: {land.whatsappNumber}</span>
              </a>
            )}
          </div>

          {/* Submitter User Info */}
          {land.user && (
            <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    Submitted By User (ලැයිස්තුගත කළ පරිශීලකයා)
                  </span>
                  <h4 className="text-sm font-bold text-slate-800">
                    {land.user.name || 'Registered User'}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">{land.user.email} &bull; Role: {land.user.role || 'USER'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Details */}
          {(land.additionalDetailsEn || land.additionalDetailsSi) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Additional Description
              </h4>
              {land.additionalDetailsEn && (
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                  {land.additionalDetailsEn}
                </p>
              )}
              {land.additionalDetailsSi && (
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed font-sinhala">
                  {land.additionalDetailsSi}
                </p>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created: {new Date(land.createdAt).toLocaleDateString()}</span>
            </span>
            <span>Slug: {land.slug}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {onUpdateApprovalStatus && (
              <>
                {land.approvalStatus === 'PENDING' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onUpdateApprovalStatus(land, 'APPROVED')}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Listing (අනුමත කරන්න)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateApprovalStatus(land, 'REJECTED')}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject (ප්‍රතික්ෂේප කරන්න)</span>
                    </button>
                  </>
                ) : land.approvalStatus === 'REJECTED' ? (
                  <button
                    type="button"
                    onClick={() => onUpdateApprovalStatus(land, 'APPROVED')}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Re-Approve Listing</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onUpdateApprovalStatus(land, 'REJECTED')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Revoke Approval</span>
                  </button>
                )}
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
