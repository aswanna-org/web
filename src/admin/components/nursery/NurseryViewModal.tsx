import {
  X,
  MapPin,
  Award,
  Truck,
  Phone,
  ExternalLink,
  Sprout,
  Flame
} from 'lucide-react';
import type { NurseryItem } from './types';

interface NurseryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  nursery: NurseryItem | null;
}

export default function NurseryViewModal({
  isOpen,
  onClose,
  nursery
}: NurseryViewModalProps) {
  if (!isOpen || !nursery) return null;

  const loc = nursery.location;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {nursery.nameEn || nursery.nameSi}
              </h2>
              {nursery.nameSi && nursery.nameEn && (
                <p className="text-[11px] text-gray-500 font-medium">{nursery.nameSi}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Photos Grid */}
          {nursery.images && nursery.images.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2">Photos Gallery</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {nursery.images.map((img, idx) => (
                  <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={img.imageUrl}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {img.isPrimary && (
                      <span className="absolute bottom-1 right-1 bg-emerald-700 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 font-medium block">Owner</span>
              <span className="font-semibold text-gray-800">{nursery.ownerNameEn || nursery.ownerNameSi || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-medium block">Phone / WhatsApp</span>
              <span className="font-semibold text-gray-800 font-mono flex items-center gap-1">
                <Phone size={12} className="text-emerald-600" />
                {nursery.whatsappNumber || '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-medium block">Nursery Grade</span>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {nursery.grade?.nameEn || nursery.grade?.nameSi || 'Grade N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-medium block">Gov Registration</span>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                nursery.isGovRegistered ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-600'
              }`}>
                {nursery.isGovRegistered ? `Yes (${nursery.certificateNo || 'Registered'})` : 'No'}
              </span>
            </div>
          </div>

          {/* Location & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-gray-800 mb-1">
                <MapPin size={14} className="text-emerald-600" />
                <span>Location Details</span>
              </div>
              <p className="text-gray-600">
                <strong className="text-gray-700">Province:</strong> {loc?.provinceEn || loc?.provinceSi || '—'}
              </p>
              <p className="text-gray-600">
                <strong className="text-gray-700">District:</strong> {loc?.districtEn || loc?.districtSi || '—'}
              </p>
              <p className="text-gray-600">
                <strong className="text-gray-700">DSD / GND:</strong> {loc?.divisionalSecretariatEn || loc?.divisionalSecretariatSi || '—'} / {loc?.gramaNiladhariDivisionEn || loc?.gramaNiladhariDivisionSi || '—'}
              </p>
              <p className="text-gray-600 leading-snug">
                <strong className="text-gray-700">Address:</strong> {loc?.fullAddressEn || loc?.fullAddressSi || '—'}
              </p>
              {nursery.googleMapsUrl && (
                <div className="pt-1">
                  <a
                    href={nursery.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-gray-800 mb-1">
                <Truck size={14} className="text-cyan-600" />
                <span>Services & Badges</span>
              </div>
              <p className="text-gray-600">
                <strong className="text-gray-700">Delivery:</strong> {nursery.delivery?.nameEn || nursery.delivery?.nameSi || '—'}
              </p>
              <p className="text-gray-600">
                <strong className="text-gray-700">Operating Hours:</strong> {nursery.operatingHours?.nameEn || nursery.operatingHours?.nameSi || '—'}
              </p>
              <p className="text-gray-600">
                <strong className="text-gray-700">Certification:</strong> {nursery.certification?.nameEn || nursery.certification?.nameSi || 'None'}
              </p>
              <p className="text-gray-600">
                <strong className="text-gray-700">Status:</strong>{' '}
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  nursery.activeState ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                }`}>
                  {nursery.activeState ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>

          {/* Fast-Selling / Featured Plants */}
          {nursery.fastSellingItems && nursery.fastSellingItems.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-2">
                <Flame size={14} className="text-rose-500" />
                <span>Fast-Selling / New Arrivals ({nursery.fastSellingItems.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nursery.fastSellingItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 bg-rose-50/30 border border-rose-100 rounded-xl"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt="Plant"
                        className="w-10 h-10 rounded-lg object-cover border border-rose-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-rose-100/60 text-rose-600 flex items-center justify-center shrink-0 font-bold text-xs">
                        <Flame size={15} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.category && (
                          <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded truncate">
                            {item.category.nameEn || item.category.nameSi}
                          </span>
                        )}
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {item.crop?.nameEn || item.crop?.nameSi || 'Crop'}
                        </span>
                        {item.variety && (
                          <span className="text-[10px] text-gray-600 font-semibold bg-white border border-gray-200 px-1.5 py-0.2 rounded">
                            {item.variety.nameEn || item.variety.nameSi}
                          </span>
                        )}
                        {item.badge && (
                          <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-full">
                            {item.badge.nameEn || item.badge.nameSi}
                          </span>
                        )}
                      </div>
                      {item.priceEn && (
                        <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                          {item.priceEn}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plant Stocks Ultra-Compact Table */}
          {nursery.stocks && nursery.stocks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2">Available Crops & Stocks</h4>
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] text-gray-600 font-bold uppercase">
                      <th className="px-3 py-1.5">Category</th>
                      <th className="px-3 py-1.5">Crop</th>
                      <th className="px-3 py-1.5">Variety</th>
                      <th className="px-3 py-1.5">Stock Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {nursery.stocks.map((st, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-1.5 text-gray-800 font-medium">
                          {st.category?.nameEn || st.category?.nameSi || '—'}
                        </td>
                        <td className="px-3 py-1.5 text-gray-900 font-semibold">
                          {st.crop?.nameEn || st.crop?.nameSi || '—'}
                        </td>
                        <td className="px-3 py-1.5 text-gray-700">
                          {st.variety?.nameEn || st.variety?.nameSi || '—'}
                        </td>
                        <td className="px-3 py-1.5 font-bold text-emerald-800">
                          {st.stockRangeEn || st.stockRangeSi || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Specialties Badges */}
          {nursery.specialties && nursery.specialties.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2">Specialties & Plant Materials</h4>
              <div className="flex flex-wrap gap-1.5">
                {nursery.specialties.map((sp) => (
                  <span
                    key={sp.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200"
                  >
                    <Award size={12} className="text-blue-600" />
                    <span>{sp.nameEn || sp.nameSi}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {(nursery.descriptionEn || nursery.descriptionSi) && (
            <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/80">
              <h4 className="text-xs font-bold text-gray-800 mb-1">Description & Overview</h4>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                {nursery.descriptionEn || nursery.descriptionSi}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-gray-50/80 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200/80 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
