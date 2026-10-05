import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

interface CropItem {
  id: string;
  name: string;
  sinhalaName?: string;
  slug: string;
  image: string;
  detailUrl: string;
  status?: string;
}

// Fallback curated crops in case of offline, network delay, or empty categories
const FALLBACK_CROPS: CropItem[] = [
  {
    id: 'fb-mango',
    name: 'Mango',
    sinhalaName: 'අඹ',
    slug: 'mango',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&q=80',
    detailUrl: '/agro/crop-production'
  },
  {
    id: 'fb-banana',
    name: 'Banana',
    sinhalaName: 'කෙසෙල්',
    slug: 'banana',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&q=80',
    detailUrl: '/agro/crop-production'
  },
  {
    id: 'fb-sweet-potato',
    name: 'Sweet Potato',
    sinhalaName: 'බතල',
    slug: 'sweet-potato',
    image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=200&q=80',
    detailUrl: '/agro/crop-production'
  },
  {
    id: 'fb-potato',
    name: 'Potato',
    sinhalaName: 'අර්තාපල්',
    slug: 'potato',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&q=80',
    detailUrl: '/agro/crop-production'
  },
  {
    id: 'fb-chilli',
    name: 'Chilli',
    sinhalaName: 'මිරිස්',
    slug: 'chilli',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=200&q=80',
    detailUrl: '/agro/crop-production'
  },
  {
    id: 'fb-cabbage',
    name: 'Cabbage',
    sinhalaName: 'ගෝවා',
    slug: 'cabbage',
    image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=200&q=80',
    detailUrl: '/agro/crop-production'
  },
  {
    id: 'fb-tomato',
    name: 'Tomato',
    sinhalaName: 'තක්කාලි',
    slug: 'tomato',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80',
    detailUrl: '/agro/crop-production'
  },
  {
    id: 'fb-carrot',
    name: 'Carrot',
    sinhalaName: 'කැරට්',
    slug: 'carrot',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=200&q=80',
    detailUrl: '/agro/crop-production'
  }
];

export default function ProductsSection() {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [crops, setCrops] = useState<CropItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`${API_BASE_URL}/items/random?categorySlug=crop-production&limit=8`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: CropItem[]) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          // Strictly exclude coming soon / unavailable items
          const activeOnly = data.filter(item => {
            const s = (item.status || '').toUpperCase().trim();
            return s !== 'UNAVAILABLE' && s !== 'COMING_SOON';
          });
          setCrops(activeOnly.length > 0 ? activeOnly : FALLBACK_CROPS);
        } else {
          setCrops(FALLBACK_CROPS);
        }
      })
      .catch(err => {
        console.warn('Could not load dynamic crops, using fallback list:', err);
        if (isMounted) setCrops(FALLBACK_CROPS);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL]);

  return (
    <section className="relative w-full py-8 sm:py-24 bg-white overflow-hidden font-roboto">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span className="text-[5rem] sm:text-[14rem] lg:text-[24rem] font-extrabold text-gray-50 tracking-tighter opacity-75 whitespace-nowrap -translate-y-12 sm:-translate-y-24">
          ASWANNA
        </span>
      </div>

      <div className="container mx-auto px-4 lg:px-12 relative z-10">
        {/* Top Half: Left Title + Right Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center mb-8 sm:mb-32">
          {/* Left Title Area */}
          <div className="reveal-fade-right flex flex-col items-center lg:items-start text-center lg:text-left max-w-lg mx-auto lg:mx-0">
            {/* Custom 3-leaf icon */}
            <div className="text-[var(--color-primary)] mb-2 sm:mb-6 flex justify-center lg:justify-start w-full">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-12 sm:h-12 opacity-80">
                <path d="M12 22c0-4-3-8-3-11 0-3 3-5 3-5s3 2 3 5c0 3-3 7-3 11z" />
                <path d="M12 11c-2-2-6-3-8-1 0 0 1 4 4 5" />
                <path d="M12 11c2-2 6-3 8-1 0 0-1 4-4 5" />
              </svg>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-[3.5rem] font-extrabold text-gray-800 leading-tight mb-1 sm:mb-2 uppercase tracking-tight">
              {t('products.title1')}<br />{t('products.title2')}
            </h2>
            <h3 className="text-base sm:text-3xl lg:text-[3rem] font-light text-gray-400/80 leading-tight mb-4 sm:mb-10 uppercase tracking-tight" style={{ fontFamily: 'sans-serif' }}>
              {t('products.subtitle')}
            </h3>

            <Link
              to="/agro"
              className="inline-flex items-center gap-3.5 pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2 sm:py-2.5 rounded-full bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-white/90 hover:border-emerald-300 text-gray-900 font-bold text-xs sm:text-base shadow-[0_8px_30px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,1)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
            >
              <span>{t('products.more')}</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 border border-white shadow-xs flex items-center justify-center text-gray-900 group-hover:rotate-45 transition-transform duration-300 shrink-0">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </Link>
          </div>

          {/* Right Grid Area: 8 Dynamic Random Crops / Skeletons */}
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 sm:gap-y-10 sm:gap-x-4 md:gap-x-6 w-full max-w-2xl mx-auto lg:mr-0 pt-2 lg:pt-0 min-h-[170px] sm:min-h-[220px]">
            {loading ? (
              // Enhanced Premium Pulsing Shimmer Skeletons
              Array.from({ length: 8 }).map((_, i) => (
                <div key={`crop-skeleton-${i}`} className="flex flex-col items-center justify-center p-2 animate-pulse">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-50 via-gray-100 to-gray-50 border border-gray-100 mb-2 shadow-xs flex items-center justify-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-100/50"></div>
                  </div>
                  <div className="w-12 sm:w-16 h-3 bg-gray-200/80 rounded-full"></div>
                </div>
              ))
            ) : (
              crops.map((crop, index) => {
                const title = isSinhala ? (crop.sinhalaName || crop.name) : crop.name;
                const delays = ['delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-200', 'delay-250', 'delay-300', 'delay-350'];
                const cropKey = crop.id || `crop-${index}`;
                const hasFailedImg = failedImages[cropKey];

                return (
                  <Link
                    key={cropKey}
                    to={crop.detailUrl || `/agro/crop-production`}
                    className={`reveal-fade-up is-revealed ${delays[index % delays.length]} flex flex-col items-center justify-center group cursor-pointer p-1 transition-all duration-300 hover:-translate-y-1`}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center mb-1.5 sm:mb-2.5 relative">
                      {!hasFailedImg && crop.image ? (
                        <img
                          src={crop.image}
                          alt={title}
                          onError={() => setFailedImages(prev => ({ ...prev, [cropKey]: true }))}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-110 transition-transform duration-300">
                          <span className="text-2xl sm:text-4xl select-none">🌱</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors text-center line-clamp-1 max-w-[85px] sm:max-w-[120px]">
                      {title}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Half: Handwritten Typography */}
        <div className="reveal-fade-up is-revealed delay-200 flex justify-center text-center mt-6 sm:mt-12 w-full relative z-10">
          <h2 className="font-caveat text-xl sm:text-3xl md:text-5xl lg:text-[3.4rem] xl:text-[3.8rem] leading-snug sm:leading-tight drop-shadow-sm w-full max-w-6xl mx-auto px-4 font-bold">
            <span className="text-[#6c6742] inline-block hover:scale-105 transition-transform">{t('products.healthy')}</span>
            <span className="text-[#ff535c] inline-block hover:scale-105 transition-transform ml-1.5 sm:ml-2">{t('products.life')}</span>
            <span className="text-[#fbb140] inline-block hover:scale-105 transition-transform ml-1.5 sm:ml-3">{t('products.with')}</span>
            <br />
            <span className="text-[#fbd245] inline-block hover:scale-105 transition-transform mt-1 sm:mt-2">{t('products.fresh')}</span>
            <span className="text-[#5b9e54] inline-block hover:scale-105 transition-transform ml-1.5 sm:ml-3">{t('products.productsTxt')}</span>
          </h2>
        </div>
      </div>
    </section>
  );
}
