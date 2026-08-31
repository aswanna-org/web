import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, Video, PlayCircle } from 'lucide-react';
import PageHero from '../../components/public/PageHero';

interface GalleryItem {
  id: string;
  title: string;
  sinhalaTitle?: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  description?: string;
}

export default function Gallery() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/gallery?limit=100`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch gallery items", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, [API_BASE_URL]);

  // Filter items based on active tab
  const filteredItems = items.filter((item) => item.type === activeTab);

  const getYoutubeThumbnail = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* ── Page Hero ── */}
      <PageHero
        title={t('galleryPage.title', 'GALLERY')}
        description={t('contact.desc')}
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#054a29"
      />

      {/* ── Main Content ── */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-12">

          {/* Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-full shadow-sm border border-gray-100 flex items-center">
              <button
                onClick={() => setActiveTab('IMAGE')}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold tracking-wider transition-all duration-300 ${activeTab === 'IMAGE'
                    ? 'bg-[var(--color-secondary)] text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <ImageIcon className="w-4 h-4" />
                {t('galleryPage.photos', 'Photos')}
              </button>
              <button
                onClick={() => setActiveTab('VIDEO')}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold tracking-wider transition-all duration-300 ${activeTab === 'VIDEO'
                    ? 'bg-[var(--color-secondary)] text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <Video className="w-4 h-4" />
                {t('galleryPage.videos', 'Videos')}
              </button>
            </div>
          </div>

          {/* Media Grid */}
          {isLoading ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <p className="text-xl font-bold text-gray-400">Loading...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-400">{t('galleryPage.noMedia', 'No media found.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 border border-gray-100 group p-2"
                >
                  <div className="relative h-64 w-full rounded-[24px] overflow-hidden bg-gray-100">
                    {item.type === 'IMAGE' ? (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative cursor-pointer group-hover:scale-110 transition-transform duration-700">
                        <img
                          src={getYoutubeThumbnail(item.url) || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800'}
                          alt={item.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg group-hover:bg-white transition-colors">
                            <PlayCircle className="w-12 h-12 text-red-600" />
                          </div>
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Optional Title under media */}
                  {(item.title || item.sinhalaTitle) && (
                    <div className="p-4 pt-4 text-center">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {isSinhala && item.sinhalaTitle ? item.sinhalaTitle : item.title}
                      </h3>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
