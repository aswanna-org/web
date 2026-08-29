import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Search, ArrowLeft, ChevronRight } from 'lucide-react';
import { getMainCategoryBySlug, getCategoryBySlug, type AgroCategory } from '../../data/agroData';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';

export default function AgroMainCategoryDetail() {
  const { mainSlug } = useParams<{ mainSlug: string }>();
  const { i18n } = useTranslation();
  const mainCategory = getMainCategoryBySlug(mainSlug ?? '');
  const [search, setSearch] = useState('');

  if (!mainCategory) return <Navigate to="/agro" replace />;

  const isSinhala = i18n.language === 'si';

  // Get the actual AgroCategory objects for the slugs in mainCategory.subCategories
  const subCategories: AgroCategory[] = mainCategory.subCategories
    .map(slug => getCategoryBySlug(slug))
    .filter((c): c is AgroCategory => c !== undefined);

  const filtered = subCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameSi.includes(search)
  );

  return (
    <div className="w-full min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative w-full h-[50vh] min-h-[350px] flex flex-col justify-end pb-10 overflow-hidden">
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
              background: `linear-gradient(to right, ${mainCategory.color} 0%, ${mainCategory.color}dd 30%, transparent 100%)`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 lg:px-12 relative z-10 pt-32">
          {/* Breadcrumb */}
          <Link
            to="/agro"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Main Categories
          </Link>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
                {isSinhala ? mainCategory.subtitleSi : mainCategory.subtitle}
              </p>
              <h1 className="text-white text-4xl sm:text-5xl font-black uppercase tracking-tight drop-shadow-xl">
                {isSinhala ? mainCategory.nameSi : mainCategory.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search ── */}
      <section className="w-full py-10 bg-white border-b border-gray-100 shadow-sm sticky top-[64px] z-20">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sub-categories... (e.g. Vegetable, Fruit)"
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
              <p className="text-2xl font-bold mb-2">No sub-categories found</p>
              <p>Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((cat) => (
                <Card
                  key={cat.id}
                  to={`/agro/${mainCategory.slug}/${cat.slug}`}
                  image={cat.image}
                  badge={`${cat.products.length} products`}
                  title={cat.name}
                  subtitle={isSinhala ? cat.nameSi : cat.nameSi}
                  primaryAction={{ text: "Explore", icon: ChevronRight }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
