import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  sinhalaName: string | null;
  slug: string;
  parentId: string | null;
  images: any;
  order: number;
}

export default function AgroCategories() {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories/tree`)
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : (data.data || []));
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, [API_BASE_URL]);

  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const mainCategories = categories
    .filter(cat => !cat.parentId)
    .sort((a, b) => a.order - b.order);

  const filtered = mainCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.sinhalaName && c.sinhalaName.includes(search))
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
              {t('agro.brandName', 'Aswanna')}
            </span>
            <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-black uppercase mb-6 drop-shadow-xl tracking-tight">
              {t('agro.title', 'Agro Technology')}
            </h1>
            <p className="text-gray-100 text-lg sm:text-xl leading-relaxed max-w-2xl font-light drop-shadow-md">
              {t('agro.desc', 'Browse all farming categories — from paddy fields to flower farms — and explore the produce that powers Sri Lanka.')}
            </p>
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
              placeholder={t('agro.searchPlaceholder', 'Search categories... (e.g. Vegetable, Flower)')}
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
              <p className="text-2xl font-bold mb-2">{t('agro.noCategories', 'No categories found')}</p>
              <p>{t('agro.tryDifferent', 'Try a different search term.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((cat) => {
                const imageUrl = Array.isArray(cat.images)
                  ? cat.images[0]
                  : (typeof cat.images === 'object' && cat.images !== null ? Object.values(cat.images)[0] : cat.images);

                return (
                  <Link 
                    key={cat.id} 
                    to={`/agro/${cat.slug}`} 
                    className="group relative block w-full aspect-square rounded-full-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 bg-gray-100"
                  >
                    <img
                      src={imageUrl || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80'}
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
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}