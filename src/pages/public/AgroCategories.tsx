import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  sinhalaName: string | null;
  slug: string;
  parentId: string | null;
  image?: string | null;
  images?: any;
  order: number;
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
      <section className="w-full py-16 bg-[#fbfdfa]">
        <div className="container mx-auto px-4 lg:px-12">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-2xl font-bold mb-2">{t('agro.noCategories', 'No categories found')}</p>
              <p>{t('agro.tryDifferent', 'Try a different search term.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {filtered.map((cat, index) => {
                const imageUrl = cat.image || (Array.isArray(cat.images)
                  ? cat.images[0]
                  : (typeof cat.images === 'object' && cat.images !== null ? Object.values(cat.images)[0] : cat.images));
                const title = isSinhala ? (cat.sinhalaName || cat.name) : cat.name;

                return (
                  <Link 
                    key={cat.id} 
                    to={`/agro/${cat.slug}`} 
                    className="group relative flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-200/80 hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Top: Illustration with large organic cloud pastel background shape */}
                    <div className="w-full aspect-square max-w-[135px] sm:max-w-[150px] flex items-center justify-center relative">
                      <CloudBackground index={index} />
                      <img
                        src={imageUrl || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80'}
                        alt={title}
                        className="w-full h-full max-w-[95%] max-h-[95%] object-contain relative z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    
                    {/* Middle: Title */}
                    <div className="w-full text-center my-0.5 px-1">
                      <h3 className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {title}
                      </h3>
                    </div>

                    {/* Bottom: Circular Green Chevron Button */}
                    <div className="mt-0.5 pb-0.5">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-700 group-hover:bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:shadow-emerald-600/30 group-hover:scale-110 transition-all duration-300">
                        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                      </div>
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
