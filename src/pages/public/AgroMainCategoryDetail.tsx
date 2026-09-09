import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Category {
  id: string;
  name: string;
  sinhalaName: string | null;
  slug: string;
  parentId: string | null;
  image: string | null;
  order: number;
  children?: Category[];
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

  return (
    <div className="w-full min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative w-full h-[50vh] min-h-[350px] flex flex-col justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-gray-900"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{
              background: `linear-gradient(to right, #2E7D32 0%, #2E7D32dd 30%, transparent 100%)`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 lg:px-12 relative z-10 pt-20">
          {/* Breadcrumb */}
          <Link
            to="/agro"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t('agro.allMainCategories', 'All Main Categories')}
          </Link>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-white text-4xl sm:text-5xl font-black uppercase tracking-tight drop-shadow-xl">
                {isSinhala ? (mainCategory.sinhalaName || mainCategory.name) : mainCategory.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search ── */}
      <section className="w-full py-10 bg-white border-b border-gray-100 shadow-sm z-20">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="max-w-xl ml-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={subCategories.length > 0 ? t('agro.searchSubPlaceholder', 'Search sub-categories... (e.g. Vegetable, Fruit)') : t('agro.searchPlaceholder', 'Search...')}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20 outline-none transition-all shadow-sm text-gray-700"
            />
          </div>
        </div>
      </section>

      {/* ── Category / Product Grid ── */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-12">
          {subCategories.length > 0 ? (
            filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-2xl font-bold mb-2">{t('agro.noSubCategories', 'No sub-categories found')}</p>
                <p>{t('agro.tryDifferent', 'Try a different search term.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/agro/${mainCategory.slug}/${cat.slug}`}
                    className="group relative block w-full aspect-square rounded-full-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 bg-gray-100"
                  >
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80'}
                      alt={isSinhala ? (cat.sinhalaName || cat.name) : cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 backdrop-blur-[2px]">
                      <h3 className="text-white text-2xl font-bold text-center drop-shadow-md translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        {isSinhala ? (cat.sinhalaName || cat.name) : cat.name}
                      </h3>
                    </div>
                  </Link>
                ))}
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

                      return (
                      <Link 
                        key={product.id}
                        to={`/agro/${mainCategory.slug}/${mainCategory.slug}/${product.slug}`}
                        className={`group relative flex flex-row items-center p-6 pl-[110px] sm:pl-[140px] min-h-[130px] rounded-[24px] border ${color.bg} ${color.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                      >
                        {/* Left side: Image */}
                        <img
                          src={imageUrl}
                          alt={title}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-[100px] h-[140px] sm:w-[125px] sm:h-[160px] object-contain drop-shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 mix-blend-multiply"
                        />
                        
                        {/* Right side: Content */}
                        <div className="flex flex-col justify-center items-end h-full gap-3 w-full text-right">
                          <h3 className="text-[20px] sm:text-[22px] font-black text-[#0A2647] leading-tight tracking-tight">
                            {title}
                          </h3>
                          
                          <div className="flex justify-end">
                            <span className="inline-flex items-center justify-center px-5 py-1.5 rounded-full border border-white/50 bg-white/40 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-xs font-bold text-gray-800 group-hover:bg-white/60 group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all">
                              {isSinhala ? 'බලන්න' : 'View'}
                            </span>
                          </div>
                        </div>
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
