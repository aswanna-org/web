import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Sprout, Tractor, Image as ImageIcon, Bug, FlaskConical, ChevronRight } from 'lucide-react';
import { AGRO_MAIN_CATEGORIES } from '../../data/agroData';
import Card from '../../components/ui/Card';

const IconMap: Record<string, React.ElementType> = {
  Sprout,
  Tractor,
  Image: ImageIcon,
  Bug,
  FlaskConical
};

export default function AgroCategories() {
  const [search, setSearch] = useState('');

  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const filtered = AGRO_MAIN_CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameSi.includes(search) || 
      c.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      c.subtitleSi.includes(search)
  );

  return (
    <div className="w-full min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex flex-col justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-secondary)]/90 via-black/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 lg:px-12 relative z-10 pt-40 md:pt-32">
          <div className="max-w-3xl">
            <span className="text-white font-thin text-xl sm:text-2xl uppercase tracking-[0.3em] block mb-2 opacity-80">
              Aswanna
            </span>
            <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-black uppercase mb-6 drop-shadow-xl tracking-tight">
              Agro Technology
            </h1>
            <p className="text-gray-100 text-lg sm:text-xl leading-relaxed max-w-2xl font-light drop-shadow-md">
              Browse all farming categories — from paddy fields to flower farms — and explore the produce that powers Sri Lanka.
            </p>
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
              placeholder="Search categories... (e.g. Vegetable, Flower)"
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
              <p className="text-2xl font-bold mb-2">No categories found</p>
              <p>Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((cat) => {
                const Icon = IconMap[cat.icon] || Sprout;
                return (
                  <Card
                    key={cat.id}
                    to={`/agro/${cat.slug}`}
                    icon={Icon}
                    color={cat.color}
                    badge={`${cat.subCategories.length} categories`}
                    title={isSinhala ? cat.nameSi : cat.name}
                    subtitle={isSinhala ? cat.subtitleSi : cat.subtitle}
                    primaryAction={{ text: "View Sub-categories", icon: ChevronRight }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
