import {
  X,
  MapPin,
  Truck,
  Phone,
  ExternalLink,
  Sparkles,
  Flame,
  Package,
  Layers,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import type { MushroomSupplierItem } from './types';

interface MushroomViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: MushroomSupplierItem | null;
}

export default function MushroomViewModal({
  isOpen,
  onClose,
  supplier
}: MushroomViewModalProps) {
  if (!isOpen || !supplier) return null;

  const loc = supplier.location;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {supplier.businessNameEn || supplier.businessNameSi}
              </h2>
              {supplier.businessNameSi && supplier.businessNameEn && (
                <p className="text-[11px] text-gray-500 font-medium">{supplier.businessNameSi}</p>
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
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          {/* Photos Grid */}
          {supplier.images && supplier.images.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-emerald-600" />
                <span>Photos Gallery</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {supplier.images.map((img, idx) => (
                  <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={img.imageUrl}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
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
              <span className="font-semibold text-gray-800">{supplier.ownerNameEn || supplier.ownerNameSi || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-medium block">Phone / WhatsApp</span>
              <span className="font-semibold text-gray-800 font-mono flex items-center gap-1">
                <Phone size={12} className="text-emerald-600" />
                {supplier.whatsappNumber || '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-medium block">Delivery Service</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1">
                <Truck size={12} className="text-emerald-600" />
                {supplier.delivery?.nameSi || supplier.delivery?.nameEn || '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-medium block">Operating Hours</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1">
                <Clock size={12} className="text-emerald-600" />
                {supplier.operatingHours?.nameSi || supplier.operatingHours?.nameEn || '—'}
              </span>
            </div>
          </div>

          {/* Location Details */}
          {loc && (
            <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
              <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-600" />
                <span>Location & Address</span>
              </h4>
              <p className="text-xs text-gray-700 font-medium">
                {loc.fullAddressSi || loc.fullAddressEn || '—'}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 pt-1">
                {loc.districtEn && (
                  <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                    District: <strong>{loc.districtSi || loc.districtEn}</strong>
                  </span>
                )}
                {loc.provinceEn && (
                  <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                    Province: <strong>{loc.provinceSi || loc.provinceEn}</strong>
                  </span>
                )}
                {loc.divisionalSecretariatEn && (
                  <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                    DSD: <strong>{loc.divisionalSecretariatSi || loc.divisionalSecretariatEn}</strong>
                  </span>
                )}
                {loc.gramaNiladhariDivisionEn && (
                  <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                    GND: <strong>{loc.gramaNiladhariDivisionSi || loc.gramaNiladhariDivisionEn}</strong>
                  </span>
                )}
              </div>
              {supplier.googleMapsUrl && (
                <div className="pt-1">
                  <a
                    href={supplier.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Categories Available */}
          {supplier.categories && supplier.categories.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <Layers size={14} className="text-emerald-600" />
                <span>Categories Available</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {supplier.categories.map((c) => (
                  <span
                    key={c.id}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    {c.nameSi || c.nameEn}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top 5 Featured Items */}
          {supplier.featuredItems && supplier.featuredItems.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <Flame size={14} className="text-amber-500" />
                <span>Top Featured Items ({supplier.featuredItems.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {supplier.featuredItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.itemTypeSi || ''}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                        <ImageIcon size={18} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-gray-900 text-xs truncate">
                        {item.itemTypeSi || item.itemTypeEn}
                      </h5>
                      <p className="text-[10px] text-gray-500 truncate">{item.varietySi || item.varietyEn}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-xs font-bold text-emerald-700">
                          {item.priceSi || item.priceEn || '—'}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                            {item.badge.nameSi || item.badge.nameEn}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specific Inventory Items Table */}
          {supplier.inventoryItems && supplier.inventoryItems.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <Package size={14} className="text-emerald-600" />
                <span>Inventory Items ({supplier.inventoryItems.length})</span>
              </h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-600">Category</th>
                      <th className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-600">Item Name</th>
                      <th className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-600">Spec / Pack</th>
                      <th className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-600">Unit Price</th>
                      <th className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-600">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {supplier.inventoryItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-3 py-1.5 text-gray-600">{item.category?.nameSi || item.category?.nameEn || '—'}</td>
                        <td className="px-3 py-1.5 font-semibold text-gray-900">{item.itemNameSi || item.itemNameEn || '—'}</td>
                        <td className="px-3 py-1.5 text-gray-600">{item.specificationSi || item.specificationEn || '—'}</td>
                        <td className="px-3 py-1.5 font-mono text-emerald-800 font-semibold">{item.priceSi || item.priceEn || '—'}</td>
                        <td className="px-3 py-1.5 text-gray-600">{item.stockSi || item.stockEn || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Description */}
          {(supplier.descriptionSi || supplier.descriptionEn) && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <h4 className="text-xs font-bold text-gray-800">About Business</h4>
              <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                {supplier.descriptionSi || supplier.descriptionEn}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
