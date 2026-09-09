import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AgroCategoryDetail() {
  const { mainSlug, subSlug } = useParams<{ mainSlug: string; subSlug: string }>();
  const { t, i18n } = useTranslation();
  
  const [mainCategory, setMainCategory] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/categories/${mainSlug}`).then(res => {
        if (!res.ok) throw new Error('Main category not found');
        return res.json();
      }),
      fetch(`${API_BASE_URL}/categories/${subSlug}`).then(res => {
        if (!res.ok) throw new Error('Sub category not found');
        return res.json();
      })
    ])
      .then(([mainData, subData]) => {
        setMainCategory(mainData);
        setCategory(subData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mainSlug, subSlug, API_BASE_URL]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!mainCategory || !category) return <Navigate to="/agro" replace />;
  const isSinhala = i18n.language === 'si';

  const items = (category.items || []).sort((a: any, b: any) => a.order - b.order);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <section className="relative w-full h-[50vh] min-h-[350px] flex flex-col justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-gray-900"
          style={{
            backgroundImage: category.image ? `url(${category.image})` : 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, #2E7D32dd 0%, rgba(0,0,0,0.5) 55%, transparent 100%)`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 lg:px-12 relative z-10 pt-20">
          {/* Breadcrumb */}
          <Link
            to={`/agro/${mainCategory.slug}`}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {isSinhala ? (mainCategory.sinhalaName || mainCategory.name) : mainCategory.name}
          </Link>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
                {isSinhala ? (mainCategory.sinhalaName || mainCategory.name) : mainCategory.name}
              </p>
              <h1 className="text-white text-4xl sm:text-5xl font-black uppercase tracking-tight drop-shadow-xl">
                {isSinhala ? (category.sinhalaName || category.name) : category.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="w-full py-16">
        <div className="container mx-auto px-4 lg:px-12">
          <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-8">
            {items.length} {t('agro.productsInCategory', 'Products in this category')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {items.map((product: any, index: number) => {
              const CARD_COLORS = [
                { bg: 'bg-[#f1f8eb]', border: 'border-[#c5e1b8]' }, // Green
                { bg: 'bg-[#fef2e6]', border: 'border-[#f6d7be]' }, // Orange
                { bg: 'bg-[#f4eef9]', border: 'border-[#d8c3e8]' }, // Purple
                { bg: 'bg-[#fff9e6]', border: 'border-[#f4e2b0]' }, // Yellow
                { bg: 'bg-[#f0f7fb]', border: 'border-[#c0dceb]' }, // Blue
                { bg: 'bg-[#fdeef0]', border: 'border-[#f4c8d1]' }, // Pink
              ];
              const color = CARD_COLORS[index % CARD_COLORS.length];
              
              const imageUrl = Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : (typeof product.images === 'object' && product.images !== null
                    ? Object.values(product.images)[0] as string
                    : (product.images as string) || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80');
                    
              const title = isSinhala ? (product.sinhalaName || product.name) : product.name;

              const isUnavailable = product.status === 'UNAVAILABLE';
              const cardBg = isUnavailable ? 'bg-slate-100/90' : color.bg;
              const cardBorder = isUnavailable ? 'border-gray-300/80' : color.border;
              const titleColor = isUnavailable ? 'text-gray-500' : 'text-[#0A2647]';

              const cardContent = (
                <>
                  {/* Left side: Image (Popping out top & bottom) */}
                  <img
                    src={imageUrl}
                    alt={title}
                    className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-[100px] h-[140px] sm:w-[125px] sm:h-[160px] object-contain drop-shadow-xl transition-all duration-300 mix-blend-multiply ${
                      isUnavailable 
                        ? 'grayscale opacity-65' 
                        : 'group-hover:scale-110 group-hover:rotate-3'
                    }`}
                  />
                  
                  {/* Right side: Content */}
                  <div className="flex flex-col justify-center items-end h-full gap-2.5 w-full text-right">
                    <h3 className={`text-[20px] sm:text-[22px] font-black ${titleColor} leading-tight tracking-tight`}>
                      {title}
                    </h3>
                    
                    <div className="flex justify-end items-center gap-2">
                      {isUnavailable ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-amber-300/80 bg-amber-50 text-[11px] font-extrabold text-amber-800 tracking-wide shadow-xs select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          {t('agro.comingSoon', 'Coming Soon')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-5 py-1.5 rounded-full border border-white/50 bg-white/40 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-xs font-bold text-gray-800 group-hover:bg-white/60 group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all">
                          {isSinhala ? 'බලන්න' : 'View'}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              );

              if (isUnavailable) {
                return (
                  <div
                    key={product.id}
                    className={`relative flex flex-row items-center p-6 pl-[110px] sm:pl-[140px] min-h-[130px] rounded-[24px] border ${cardBg} ${cardBorder} shadow-xs select-none cursor-not-allowed opacity-80`}
                    title={t('agro.comingSoon', 'Coming Soon')}
                  >
                    {cardContent}
                  </div>
                );
              }

              return (
                <Link 
                  key={product.id}
                  to={`/agro/${mainCategory.slug}/${category.slug}/${product.slug}`}
                  className={`group relative flex flex-row items-center p-6 pl-[110px] sm:pl-[140px] min-h-[130px] rounded-[24px] border ${cardBg} ${cardBorder} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                >
                  {cardContent}
                </Link>
              );
            })}
            
            {items.length === 0 && (
              <div className="col-span-full py-10 text-center text-gray-400">
                <p>{t('agro.noItemsFound', 'No items found in this category.')}</p>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
