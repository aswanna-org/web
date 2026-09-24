import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Search, ArrowLeft, ChevronRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAgroTheme } from '../../utils/agroTheme';

interface Category {
  id: string;
  name: string;
  sinhalaName: string | null;
  slug: string;
  parentId: string | null;
  image: string | null;
  headerImage?: string | null;
  order: number;
  children?: Category[];
}

const CLOUD_PALETTE = [
  { fill: '#e2f5dc' }, // 1. Soft Leaf Green
  { fill: '#fff1d6' }, // 2. Warm Peach
  { fill: '#daf0fc' }, // 3. Sky Blue
  { fill: '#f0def8' }, // 4. Soft Lavender
  { fill: '#fde2e6' }, // 5. Soft Rose Pink
  { fill: '#fde8d4' }, // 6. Soft Apricot Orange
  { fill: '#eef8ce' }, // 7. Fresh Lime
  { fill: '#d5f3ed' }, // 8. Mint Aqua
  { fill: '#fce4ec' }, // 9. Blush Rose
  { fill: '#e8f5e9' }, // 10. Pale Meadow Green
  { fill: '#ede7f6' }, // 11. Pale Lilac
  { fill: '#e0f7fa' }, // 12. Soft Cyan Ice
  { fill: '#fff8e1' }, // 13. Pale Amber Cream
  { fill: '#fbe9e7' }, // 14. Soft Coral Mist
  { fill: '#f3e5f5' }, // 15. Light Heather Purple
  { fill: '#e8eaf6' }, // 16. Periwinkle Mist
  { fill: '#e0f2f1' }, // 17. Seafoam Mint
  { fill: '#f9fbe7' }, // 18. Pale Chartreuse
  { fill: '#fff3e0' }, // 19. Honey Peach
  { fill: '#f1f8e9' }, // 20. Spring Sprout Green
  { fill: '#e1f5fe' }, // 21. Glacier Blue
  { fill: '#ffe0b2' }, // 22. Golden Wheat
  { fill: '#dcedc8' }, // 23. Pistachio Green
  { fill: '#f8bbd0' }, // 24. Cherry Blossom Pink
  { fill: '#e1bee7' }, // 25. Orchid Tint
  { fill: '#c8e6c9' }, // 26. Clover Green
  { fill: '#ffebee' }, // 27. Petal Pink
  { fill: '#d1c4e9' }, // 28. Soft Violet
  { fill: '#b2dfdb' }, // 29. Cool Sage Aqua
  { fill: '#ffecb3' }, // 30. Sunlight Yellow
  { fill: '#ffccbc' }, // 31. Papaya Tint
  { fill: '#d7ccc8' }, // 32. Warm Sandstone
  { fill: '#cfd8dc' }, // 33. Morning Mist
  { fill: '#c5cae9' }, // 34. Twilight Blue
  { fill: '#b3e5fc' }, // 35. Powder Blue
  { fill: '#b2ebf2' }, // 36. Lagoon Tint
  { fill: '#dcedc1' }, // 37. Olive Sprout
  { fill: '#ffd3b6' }, // 38. Cantaloupe Tint
  { fill: '#ffaaa5' }, // 39. Coral Tint
  { fill: '#a8e6cf' }, // 40. Sweet Pea Green
];

const CLOUD_PATHS = [
  "M 25,90 C 5,90 2,65 18,48 C 30,30 55,34 70,22 C 86,5 122,5 142,18 C 162,28 175,38 186,50 C 200,64 198,90 182,108 C 166,126 142,130 124,136 C 96,146 64,142 45,126 C 28,112 25,98 25,90 Z",
  "M 20,82 C 2,82 0,55 16,38 C 30,22 58,26 72,16 C 90,4 128,4 146,18 C 164,30 178,36 190,52 C 202,68 198,95 180,114 C 162,130 138,132 120,138 C 96,148 62,145 42,126 C 24,108 20,92 20,82 Z",
  "M 28,95 C 6,95 2,68 18,50 C 32,32 58,38 72,25 C 90,8 126,6 146,18 C 166,28 180,44 192,54 C 206,70 202,98 184,116 C 166,132 142,134 122,140 C 94,150 64,144 46,128 C 30,114 26,102 28,95 Z",
  "M 22,86 C 4,86 0,60 16,42 C 32,24 60,30 74,18 C 92,4 130,4 148,18 C 166,30 182,40 192,58 C 204,78 198,104 178,122 C 158,134 134,134 116,140 C 90,150 60,144 42,124 C 26,106 22,94 22,86 Z",
];

function CloudBackground({ index }: { index: number }) {
  const color = CLOUD_PALETTE[index % CLOUD_PALETTE.length];
  const path = CLOUD_PATHS[index % CLOUD_PATHS.length];

  return (
    <svg
      viewBox="0 0 200 150"
      className="absolute inset-0 w-full h-full -z-0 transition-transform duration-300 group-hover:scale-105 pointer-events-none"
      preserveAspectRatio="none"
    >
      <path d={path} fill={color.fill} />
    </svg>
  );
}

export default function AgroMainCategoryDetail() {
  const { mainSlug } = useParams<{ mainSlug: string }>();
  const { t, i18n } = useTranslation();
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [mainCategoryWithItems, setMainCategoryWithItems] = useState<any>(null);
  const [search, setSearch] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories/tree`)
      .then(res => res.json())
      .then(data => setDbCategories(Array.isArray(data) ? data : (data.data || [])))
      .catch(console.error);
  }, [API_BASE_URL]);

  useEffect(() => {
    if (mainSlug) {
      fetch(`${API_BASE_URL}/categories/${mainSlug}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => setMainCategoryWithItems(data))
        .catch(console.error);
    }
  }, [mainSlug, API_BASE_URL]);

  const mainCategory = dbCategories.find(c => c.slug === mainSlug);
  const subCategories = (mainCategory?.children || [])
    .sort((a: any, b: any) => a.order - b.order);

  const isSinhala = i18n.language === 'si';

  const filtered = subCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.sinhalaName && c.sinhalaName.includes(search))
  );

  // Wait for fetch to complete before redirecting
  if (dbCategories.length > 0 && !mainCategory) {
    return <Navigate to="/agro" replace />;
  }

  // Don't render until we have the main category loaded
  if (!mainCategory) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const heroImage = mainCategory.headerImage || mainCategory.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80';
  const theme = getAgroTheme(mainCategory.slug || mainSlug, mainCategory.name);

  return (
    <div className="w-full min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative z-20 w-full h-[24vh] sm:h-[34vh] md:h-[44vh] min-h-[160px] sm:min-h-[250px] md:min-h-[360px] flex flex-col justify-center">
        {/* Background - clipped */}
        <div className="absolute inset-0 z-0 bg-gray-900 overflow-hidden">
          <img
            src={heroImage}
            alt={mainCategory.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${theme.primary}ee 0%, rgba(0,0,0,0.45) 55%, transparent 100%)`,
            }}
          />
        </div>

        {/* ── Bottom Wave & Floating Badge (Permanently Anchored) ── */}
        <div className="absolute -bottom-[1px] left-0 right-0 w-full pointer-events-none z-30">
          {/* Wave SVG */}
          <svg
            className="w-full h-10 sm:h-14 md:h-18 lg:h-22 text-white fill-current block pointer-events-none"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path d="M0,32 C240,65 480,80 720,45 C960,10 1200,55 1440,30 L1440,120 L0,120 Z" />
          </svg>

          {/* Circular Badge Icon with Main Category Image from Backend */}
          <div className="container mx-auto px-4 lg:px-12 absolute inset-x-0 -bottom-1 sm:-bottom-0.5 md:bottom-0.5 lg:bottom-1 pointer-events-none">
            <div
              className="pointer-events-auto bg-white w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-white shadow-xl border-2 sm:border-[3px] md:border-4 border-white overflow-hidden transition-transform duration-300 hover:scale-105"
              style={{ boxShadow: `0 14px 28px -4px ${theme.primary}50, 0 8px 16px -4px rgba(0,0,0,0.12)` }}
            >
              {mainCategory.image ? (
                <img
                  src={mainCategory.image}
                  alt={mainCategory.name}
                  className="w-full h-full object-contain p-1.5 sm:p-2.5 md:p-3"
                />
              ) : (
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full" style={{ backgroundColor: theme.secondary }} />
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-12 relative z-10 flex flex-col justify-center h-full pt-10 sm:pt-16 md:pt-20 pb-6 sm:pb-12 lg:pb-16">
          {/* Breadcrumb */}
          <Link
            to="/agro"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-white text-xs sm:text-sm mb-1 sm:mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t('agro.allMainCategories', 'All Main Categories')}
          </Link>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-white text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight drop-shadow-xl">
                {isSinhala ? (mainCategory.sinhalaName || mainCategory.name) : mainCategory.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search Bar (Sleek, Modern, Right-Aligned) ── */}
      <section className="animate-fade-smooth w-full py-4 sm:py-6 bg-white border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="container mx-auto px-4 lg:px-12 flex justify-end">
          <div className="relative w-full sm:w-80 md:w-96 group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={subCategories.length > 0 ? t('agro.searchSubPlaceholder', 'Search sub-categories... (e.g. Vegetable, Fruit)') : t('agro.searchPlaceholder', 'Search...')}
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-full border border-gray-200/90 bg-gray-50/70 hover:bg-white focus:bg-white hover:border-emerald-500/60 focus:border-[#006837] focus:ring-3 focus:ring-[#006837]/15 outline-none transition-all duration-200 text-xs sm:text-sm text-gray-800 shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Category / Product Grid ── */}
      <section className="w-full py-16 bg-[#fbfdfa]">
        <div className="container mx-auto px-2 sm:px-4 lg:px-12">
          {subCategories.length > 0 ? (
            filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-2xl font-bold mb-2">{t('agro.noCategories', 'No categories found')}</p>
                <p>{t('agro.tryDifferent', 'Try a different search term.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-5">
                {filtered.map((cat, index) => {
                  const title = isSinhala ? (cat.sinhalaName || cat.name) : cat.name;
                  const imageUrl = cat.image || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80';

                  return (
                    <Link
                      key={cat.id}
                      to={`/agro/${mainCategory.slug}/${cat.slug}`}
                      style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                      className="animate-card-pop group relative flex flex-col items-center justify-between p-1.5 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-200/80 hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Top: Illustration with large organic cloud pastel background shape */}
                      <div className="w-full aspect-square max-w-[95px] sm:max-w-[135px] md:max-w-[150px] flex items-center justify-center relative">
                        <CloudBackground index={index} />
                        <img
                          src={imageUrl}
                          alt={title}
                          className="w-full h-full max-w-[95%] max-h-[95%] object-contain relative z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>

                      {/* Middle: Title */}
                      <div className="w-full text-center my-0.5 px-0.5 sm:px-1">
                        <h3 className="font-bold text-[10.5px] sm:text-xs md:text-sm text-gray-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
                          {title}
                        </h3>
                      </div>

                      {/* Bottom: Circular Green Chevron Button */}
                      <div className="mt-0.5 pb-0.5">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-emerald-700 group-hover:bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:shadow-emerald-600/30 group-hover:scale-110 transition-all duration-300">
                          <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )
          ) : (
            (() => {
              const items = (mainCategoryWithItems?.items || []).sort((a: any, b: any) => a.order - b.order).filter((product: any) => {
                const title = isSinhala ? (product.sinhalaName || product.name) : product.name;
                return title.toLowerCase().includes(search.toLowerCase());
              });

              return (
                <div>
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-5">
                    {items.map((product: any, index: number) => {
                      const imageUrl = Array.isArray(product.images) && product.images.length > 0
                        ? product.images[0]
                        : (typeof product.images === 'object' && product.images !== null
                            ? Object.values(product.images)[0] as string
                            : (product.images as string) || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80');
                            
                      const title = isSinhala ? (product.sinhalaName || product.name) : product.name;
                      const isUnavailable = product.status === 'UNAVAILABLE';

                      const cardContent = (
                        <>
                          {/* Top: Illustration with large organic cloud pastel background shape */}
                          <div className="w-full aspect-square max-w-[95px] sm:max-w-[135px] md:max-w-[150px] flex items-center justify-center relative">
                            <CloudBackground index={index} />
                            <img
                              src={imageUrl}
                              alt={title}
                              className={`w-full h-full max-w-[95%] max-h-[95%] object-contain relative z-10 drop-shadow-md transition-transform duration-300 ${
                                isUnavailable ? 'grayscale opacity-60' : 'group-hover:scale-110'
                              }`}
                            />
                          </div>

                          {/* Middle: Title */}
                          <div className="w-full text-center my-0.5 px-0.5 sm:px-1">
                            <h3 className={`font-bold text-[10.5px] sm:text-xs md:text-sm transition-colors line-clamp-2 leading-tight ${
                              isUnavailable ? 'text-gray-400' : 'text-gray-800 group-hover:text-emerald-700'
                            }`}>
                              {title}
                            </h3>
                            
                            {isUnavailable && (
                              <div className="mt-0.5 flex justify-center items-center">
                                <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 rounded-full border border-amber-300/80 bg-amber-50 text-[7.5px] sm:text-[9px] font-extrabold text-amber-800 tracking-tight sm:tracking-wide select-none">
                                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  {t('agro.comingSoon', 'Coming Soon')}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Bottom: Circular Green Chevron Button */}
                          <div className="mt-0.5 pb-0.5">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                              isUnavailable
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-emerald-700 group-hover:bg-emerald-600 text-white shadow-emerald-700/20 group-hover:shadow-emerald-600/30 group-hover:scale-110'
                            }`}>
                              <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 stroke-[2.5]" />
                            </div>
                          </div>
                        </>
                      );

                      if (isUnavailable) {
                        return (
                          <div
                            key={product.id}
                            style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                            className="animate-card-pop relative flex flex-col items-center justify-between p-1.5 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] opacity-75 cursor-not-allowed select-none"
                            title={t('agro.comingSoon', 'Coming Soon')}
                          >
                            {cardContent}
                          </div>
                        );
                      }

                      return (
                        <Link 
                          key={product.id}
                          to={`/agro/${mainCategory.slug}/${mainCategory.slug}/${product.slug}`}
                          style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                          className="animate-card-pop group relative flex flex-col items-center justify-between p-1.5 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-200/80 hover:-translate-y-1 transition-all duration-300"
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
              );
            })()
          )}
        </div>
      </section>
    </div>
  );
}
