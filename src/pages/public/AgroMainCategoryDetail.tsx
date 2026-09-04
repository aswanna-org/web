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
}

export default function AgroMainCategoryDetail() {
  const { mainSlug } = useParams<{ mainSlug: string }>();
  const { t, i18n } = useTranslation();
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => setDbCategories(data))
      .catch(console.error);
  }, [API_BASE_URL]);

  const mainCategory = dbCategories.find(c => c.slug === mainSlug && !c.parentId);
  const subCategories = dbCategories
    .filter(cat => cat.parentId === mainCategory?.id)
    .sort((a, b) => a.order - b.order);

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
              placeholder={t('agro.searchSubPlaceholder', 'Search sub-categories... (e.g. Vegetable, Fruit)')}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20 outline-none transition-all shadow-sm text-gray-700"
            />
          </div>
        </div>
      </section>

      {/* ── Category Grid ── */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-12">
          {filtered.length === 0 ? (
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
                  className="group relative block w-full aspect-square rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 bg-gray-100"
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
          )}
        </div>
      </section>
    </div>
  );
}
