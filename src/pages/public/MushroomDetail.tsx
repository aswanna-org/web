import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Phone, MessageSquare, ExternalLink, Share2, ArrowLeft,
  ChevronLeft, ChevronRight, Truck,
  Clock, Check, Sparkles, Flame,
  User, Navigation, Package, Layers, Info, Image as ImageIcon
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import type { MushroomSupplierItem } from '../../admin/components/mushroom/types';

export default function MushroomDetail() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [supplier, setSupplier] = useState<MushroomSupplierItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const targetIdentifier = slug || id;

  useEffect(() => {
    if (!targetIdentifier) return;
    fetchSupplierDetail();
  }, [targetIdentifier]);

  const fetchSupplierDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      setActiveImageIndex(0);

      // Try slug endpoint first
      let res = await fetch(`${API_BASE_URL}/mushroom-suppliers/slug/${encodeURIComponent(targetIdentifier!)}`);

      // Fallback by ID if needed
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/mushroom-suppliers/${encodeURIComponent(targetIdentifier!)}`);
      }

      if (!res.ok) {
        throw new Error('බිම්මල් ව්‍යාපාරයේ තොරතුරු සොයාගත නොහැක (Mushroom supplier not found)');
      }

      const json = await res.json();
      const data = json.data || json;

      if (!data) {
        throw new Error('තොරතුරු ලබා ගැනීමට නොහැකි විය');
      }

      setSupplier(data);
    } catch (err: any) {
      console.error('Error fetching mushroom supplier detail:', err);
      setError(err.message || 'තොරතුරු ලබා ගැනීමට නොහැකි විය');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = supplier
      ? (isSinhala ? supplier.businessNameSi || supplier.businessNameEn : supplier.businessNameEn || supplier.businessNameSi) || 'Aswanna Mushroom Supplier'
      : 'Aswanna Mushroom Supplier';

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out ${title} on Aswanna!`,
          url
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const cleanPhone = (phone?: string | null) => {
    if (!phone) return '';
    return phone.replace(/[^0-9+]/g, '');
  };

  const getWhatsAppLink = (number?: string | null, name?: string) => {
    const raw = cleanPhone(number);
    if (!raw) return '#';
    let formatted = raw.replace('+', '');
    if (formatted.startsWith('0')) {
      formatted = '94' + formatted.slice(1);
    }
    const message = encodeURIComponent(
      `ආයුබෝවන්, මම අස්වැන්න (Aswanna) මගින් ${name || 'ඔබගේ බිම්මල් ව්‍යාපාරය'} දුටුවෙමි. බීජ හා නිෂ්පාදන පිළිබඳ වැඩි විස්තර දැනගැනීමට කැමැත්තෙමි.`
    );
    return `https://wa.me/${formatted}?text=${message}`;
  };

  const formatPrice = (val?: string | null) => {
    if (!val) return '—';
    const trimmed = val.trim();
    if (!trimmed) return '—';
    if (/^(rs|රු|\$)/i.test(trimmed)) return trimmed;
    return `Rs. ${trimmed}`;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <AgroLoader
          message={isSinhala ? 'බිම්මල් ව්‍යාපාරයේ විස්තර පූරණය වෙමින් පවතී...' : 'Loading mushroom supplier details...'}
          subMessage="Aswanna Mushroom Network"
        />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <Info size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isSinhala ? 'සොයාගත නොහැකි විය' : 'Supplier Not Found'}
        </h2>
        <p className="text-gray-500 text-sm max-w-md mb-6">
          {error || (isSinhala ? 'ඔබ සොයන බිම්මල් ව්‍යාපාරය සොයාගත නොහැක.' : 'The requested mushroom supplier could not be found.')}
        </p>
        <Link
          to="/mushrooms"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{isSinhala ? 'නැවත බිම්මල් ලැයිස්තුවට' : 'Back to Mushroom Directory'}</span>
        </Link>
      </div>
    );
  }

  const primaryName = (isSinhala
    ? supplier.businessNameSi || supplier.businessNameEn
    : supplier.businessNameEn || supplier.businessNameSi) || 'Mushroom Supplier';
  const secondaryName = isSinhala ? supplier.businessNameEn : supplier.businessNameSi;
  const owner = isSinhala
    ? supplier.ownerNameSi || supplier.ownerNameEn
    : supplier.ownerNameEn || supplier.ownerNameSi;

  const loc = supplier.location;
  const images = supplier.images && supplier.images.length > 0
    ? supplier.images
    : [{ imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80', isPrimary: true }];

  const activePhoto = images[activeImageIndex]?.imageUrl || images[0]?.imageUrl;

  const pageTitle = `${primaryName} | Aswanna Mushroom Directory`;
  const pageDesc = supplier.descriptionSi || supplier.descriptionEn || `${primaryName} - Mushroom Grower & Spawn supplier in Sri Lanka.`;

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-28 sm:pb-32 lg:pb-16 font-sans">
      <SEO
        title={pageTitle}
        description={pageDesc}
        canonical={`/mushrooms/${supplier.slug}`}
      />

      {/* Hero Header */}
      <PageHero
        title={primaryName}
        description={secondaryName && secondaryName !== primaryName ? secondaryName : (isSinhala ? 'ලියාපදිංචි බිම්මල් හා බීජ නිෂ්පාදන මධ්‍යස්ථානය' : 'Verified Mushroom & Spawn Cultivation Center')}
        image={activePhoto}
        gradientColor="#006837"
        icon={Sparkles}
        badgeBg="bg-[#006837]"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 mt-6 sm:mt-8">
        {/* Navigation Breadcrumb / Back Button */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/mushrooms')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-50 text-gray-700 hover:text-emerald-800 text-xs font-bold border border-gray-200 transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>{isSinhala ? 'සියලු බිම්මල් ව්‍යාපාර' : 'All Mushroom Suppliers'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 text-xs font-bold border border-gray-200 hover:border-emerald-200 transition shadow-2xs cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700">{isSinhala ? 'ලින්ක් එක කොපි විය!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span>{isSinhala ? 'බෙදාහරින්න' : 'Share'}</span>
              </>
            )}
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column (8 cols): Media Gallery, Featured Products, Inventory Table, Description */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            
            {/* Gallery Box */}
            <div className="bg-white rounded-3xl p-3 sm:p-5 border border-gray-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.04)] space-y-3">
              {/* Main Active Photo */}
              <div className="relative h-64 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden bg-gray-100 group">
                <img
                  src={activePhoto}
                  alt={primaryName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />

                {/* Floating Arrows if Multiple Photos */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-md transition cursor-pointer"
                      title="Previous"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-md transition cursor-pointer"
                      title="Next"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Image counter tag */}
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 scale-102'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Top 5 Featured Items Showcase */}
            {supplier.featuredItems && supplier.featuredItems.length > 0 && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.04)] space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Flame size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                        {isSinhala ? 'ප්‍රධාන අලෙවි වන නිෂ්පාදන (Top Featured Items)' : 'Top Featured Products'}
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        {isSinhala
                          ? 'මෙම සපයන්නා විසින් සෘජුවම ලබාගත හැකි ප්‍රමුඛ බීජ හා බිම්මල් වර්ග'
                          : 'Top featured varieties and mushroom spawns available from this supplier'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {supplier.featuredItems.length} {isSinhala ? 'නිෂ්පාදන' : 'Items'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {supplier.featuredItems.map((item, idx) => {
                    const title = isSinhala
                      ? item.itemTypeSi || item.itemTypeEn
                      : item.itemTypeEn || item.itemTypeSi;
                    const variety = isSinhala
                      ? item.varietySi || item.varietyEn
                      : item.varietyEn || item.varietySi;
                    const price = isSinhala
                      ? item.priceSi || item.priceEn
                      : item.priceEn || item.priceSi;
                    const badgeText = item.badge
                      ? (isSinhala ? item.badge.nameSi || item.badge.nameEn : item.badge.nameEn || item.badge.nameSi)
                      : null;

                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-300 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(0,104,55,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
                      >
                        {/* Top: Full-bleed product image */}
                        <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-gray-100">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={title || ''}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50/40 text-emerald-700/60 gap-1.5">
                              <Package size={26} className="stroke-[1.75]" />
                              <span className="text-[11px] font-medium text-gray-400">
                                {isSinhala ? 'ඡායාරූපයක් නැත' : 'No photo'}
                              </span>
                            </div>
                          )}

                          {/* Gradient overlay for contrast */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                          {/* Floating Badge */}
                          {badgeText && (
                            <div className="absolute top-2.5 left-2.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-amber-900 border border-amber-200/80 text-[10px] font-bold shadow-xs flex items-center gap-1">
                                <Sparkles size={11} className="text-amber-600" />
                                <span>{badgeText}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Content Body */}
                        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-[#006837] transition-colors leading-snug line-clamp-1">
                              {title || (isSinhala ? 'බිම්මල් නිෂ්පාදනය' : 'Mushroom Product')}
                            </h4>
                            {variety && (
                              <p className="text-xs text-gray-500 font-medium line-clamp-1 mt-0.5">
                                {variety}
                              </p>
                            )}
                          </div>

                          {/* Price Footer */}
                          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-gray-500 font-medium">
                              {isSinhala ? 'ඒකක මිල' : 'Unit Price'}
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 font-mono font-bold text-xs sm:text-sm text-[#006837] shadow-2xs">
                              {formatPrice(price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Complete Specific Inventory Table */}
            {supplier.inventoryItems && supplier.inventoryItems.length > 0 && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.04)] space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Package size={18} className="text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                        {isSinhala ? 'විශේෂිත අමුද්‍රව්‍ය & තොග මිල ගණන්' : 'Available Inventory & Pricing Table'}
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        {isSinhala
                          ? 'ලබාගත හැකි සියලුම බීජ, වගා මලු, පැකේජ හා අමුද්‍රව්‍ය ලැයිස්තුව'
                          : 'Full pricing breakdown for spawn bottles, growing bags, substrates, and accessories'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {supplier.inventoryItems.length} {isSinhala ? 'වර්ග' : 'Items'}
                  </span>
                </div>

                <div className="overflow-x-auto border border-gray-200/80 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                        <th className="px-3.5 py-2.5">{isSinhala ? 'කාණ්ඩය' : 'Category'}</th>
                        <th className="px-3.5 py-2.5">{isSinhala ? 'නිෂ්පාදනය' : 'Item Name'}</th>
                        <th className="px-3.5 py-2.5">{isSinhala ? 'පිරිවිතර / ඇසුරුම' : 'Specification / Pack'}</th>
                        <th className="px-3.5 py-2.5">{isSinhala ? 'ඒකක මිල' : 'Unit Price'}</th>
                        <th className="px-3.5 py-2.5 text-right">{isSinhala ? 'පවතින තොගය' : 'Stock'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {supplier.inventoryItems.map((item, idx) => {
                        const cat = isSinhala
                          ? item.category?.nameSi || item.category?.nameEn
                          : item.category?.nameEn || item.category?.nameSi;
                        const itemName = isSinhala
                          ? item.itemNameSi || item.itemNameEn
                          : item.itemNameEn || item.itemNameSi;
                        const spec = isSinhala
                          ? item.specificationSi || item.specificationEn
                          : item.specificationEn || item.specificationSi;
                        const price = isSinhala
                          ? item.priceSi || item.priceEn
                          : item.priceEn || item.priceSi;
                        const stock = isSinhala
                          ? item.stockSi || item.stockEn
                          : item.stockEn || item.stockSi;

                        return (
                          <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-3.5 py-2 font-medium text-emerald-800 whitespace-nowrap">
                              {cat || '—'}
                            </td>
                            <td className="px-3.5 py-2 font-bold text-gray-900 whitespace-nowrap">
                              {itemName || '—'}
                            </td>
                            <td className="px-3.5 py-2 text-gray-600 whitespace-nowrap">
                              {spec || '—'}
                            </td>
                            <td className="px-3.5 py-2 font-mono font-bold text-emerald-800 whitespace-nowrap">
                              {price || '—'}
                            </td>
                            <td className="px-3.5 py-2 text-right font-medium text-gray-700 whitespace-nowrap">
                              {stock || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Description Card */}
            {(supplier.descriptionSi || supplier.descriptionEn) && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.04)] space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <Info size={16} className="text-emerald-700" />
                  <span>{isSinhala ? 'ව්‍යාපාරය පිළිබඳ විස්තරය' : 'About Mushroom Farm & Services'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {isSinhala
                    ? supplier.descriptionSi || supplier.descriptionEn
                    : supplier.descriptionEn || supplier.descriptionSi}
                </p>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Sticky Contact Card, Specs, Working Hours, Location */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            
            {/* Direct Connect Box */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  {isSinhala ? 'සෘජු සබඳතා' : 'Direct Contact'}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-2 leading-snug">
                  {primaryName}
                </h2>
                {owner && (
                  <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1.5">
                    <User size={13} className="text-gray-400" />
                    <span>{owner}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {supplier.whatsappNumber && (
                  <a
                    href={getWhatsAppLink(supplier.whatsappNumber, primaryName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <MessageSquare size={16} />
                    <span>{isSinhala ? 'WhatsApp මගින් විමසන්න' : 'Chat on WhatsApp'}</span>
                  </a>
                )}

                {supplier.whatsappNumber && (
                  <a
                    href={`tel:${cleanPhone(supplier.whatsappNumber)}`}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Phone size={16} />
                    <span>{isSinhala ? 'දුරකථනයෙන් අමතන්න' : 'Call Phone'}</span>
                  </a>
                )}

                {supplier.googleMapsUrl && (
                  <a
                    href={supplier.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-2xl text-xs font-semibold border border-gray-200 transition cursor-pointer"
                  >
                    <Navigation size={14} className="text-blue-600" />
                    <span>{isSinhala ? 'Google Maps හි බලන්න' : 'Open in Google Maps'}</span>
                    <ExternalLink size={12} className="text-gray-400" />
                  </a>
                )}
              </div>

              {/* Key Highlights Grid */}
              <div className="pt-4 border-t border-gray-100 space-y-3 text-xs">
                {/* Operating Hours */}
                {supplier.operatingHours && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={14} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        {isSinhala ? 'විවෘත වේලාවන්' : 'Operating Hours'}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {isSinhala
                          ? supplier.operatingHours.nameSi || supplier.operatingHours.nameEn
                          : supplier.operatingHours.nameEn || supplier.operatingHours.nameSi}
                      </span>
                    </div>
                  </div>
                )}

                {/* Delivery Option */}
                {supplier.delivery && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Truck size={14} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        {isSinhala ? 'බෙදාහැරීමේ සේවාව' : 'Delivery Service'}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {isSinhala
                          ? supplier.delivery.nameSi || supplier.delivery.nameEn
                          : supplier.delivery.nameEn || supplier.delivery.nameSi}
                      </span>
                    </div>
                  </div>
                )}

                {/* Categories */}
                {supplier.categories && supplier.categories.length > 0 && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Layers size={14} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                        {isSinhala ? 'සපයන කාණ්ඩ' : 'Categories Available'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {supplier.categories.map((c) => (
                          <span
                            key={c.id}
                            className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-medium"
                          >
                            {isSinhala ? c.nameSi || c.nameEn : c.nameEn || c.nameSi}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address & Geographical Location Card */}
            {loc && (
              <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.04)] space-y-3 text-xs">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <MapPin size={15} className="text-emerald-700" />
                  <span>{isSinhala ? 'ස්ථානය සහ ලිපිනය' : 'Location & Address'}</span>
                </h4>

                <div className="space-y-2 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                  {(loc.fullAddressSi || loc.fullAddressEn) && (
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        {isSinhala ? 'සම්පූර්ණ ලිපිනය' : 'Full Address'}
                      </span>
                      <p className="font-medium text-gray-800">
                        {isSinhala ? loc.fullAddressSi || loc.fullAddressEn : loc.fullAddressEn || loc.fullAddressSi}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/60 text-[11px]">
                    <div>
                      <span className="text-gray-400 block">{isSinhala ? 'දිස්ත්‍රික්කය' : 'District'}</span>
                      <span className="font-bold text-gray-800">
                        {isSinhala ? loc.districtSi || loc.districtEn : loc.districtEn || loc.districtSi || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block">{isSinhala ? 'පළාත' : 'Province'}</span>
                      <span className="font-bold text-gray-800">
                        {isSinhala ? loc.provinceSi || loc.provinceEn : loc.provinceEn || loc.provinceSi || '—'}
                      </span>
                    </div>

                    {(loc.divisionalSecretariatSi || loc.divisionalSecretariatEn) && (
                      <div>
                        <span className="text-gray-400 block">{isSinhala ? 'ප්‍රා. ලේ. කොට්ඨාසය' : 'DSD'}</span>
                        <span className="font-semibold text-gray-800">
                          {isSinhala
                            ? loc.divisionalSecretariatSi || loc.divisionalSecretariatEn
                            : loc.divisionalSecretariatEn || loc.divisionalSecretariatSi}
                        </span>
                      </div>
                    )}

                    {(loc.gramaNiladhariDivisionSi || loc.gramaNiladhariDivisionEn) && (
                      <div>
                        <span className="text-gray-400 block">{isSinhala ? 'ග්‍රාම නිලධාරී වසම' : 'GND'}</span>
                        <span className="font-semibold text-gray-800">
                          {isSinhala
                            ? loc.gramaNiladhariDivisionSi || loc.gramaNiladhariDivisionEn
                            : loc.gramaNiladhariDivisionEn || loc.gramaNiladhariDivisionSi}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
