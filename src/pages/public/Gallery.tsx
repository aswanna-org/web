import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Image as ImageIcon, Video, PlayCircle, Layers, X, 
  ChevronLeft, ChevronRight, Share2, Check, Download 
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';

interface GalleryItem {
  id: string;
  title: string;
  sinhalaTitle?: string;
  slug?: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  images?: string[];
  description?: string;
  sinhalaDescription?: string;
}

export default function Gallery() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Lightbox / Album Modal state
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryItem | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchGallery = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/gallery?page=${page}&limit=12&type=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages);
        }
      }
    } catch (err) {
      console.error("Failed to fetch gallery items", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery(currentPage);
  }, [API_BASE_URL, currentPage, activeTab]);

  // Handle direct navigation via slug e.g. /gallery/:slug
  useEffect(() => {
    if (!slug) return;
    const loadBySlug = async () => {
      // First check if already in loaded items
      const existing = items.find(i => i.slug === slug);
      if (existing) {
        setSelectedAlbum(existing);
        setActivePhotoIndex(0);
        return;
      }
      // Otherwise fetch by slug from API
      try {
        const res = await fetch(`${API_BASE_URL}/gallery/slug/${slug}`);
        if (res.ok) {
          const item = await res.json();
          setSelectedAlbum(item);
          setActivePhotoIndex(0);
        }
      } catch (e) {
        console.error("Failed to load gallery item by slug", e);
      }
    };
    loadBySlug();
  }, [slug, items, API_BASE_URL]);

  const openLightbox = (item: GalleryItem, startIndex = 0) => {
    setSelectedAlbum(item);
    setActivePhotoIndex(startIndex);
    if (item.slug && !slug) {
      // Update browser URL gently without full page reload
      window.history.pushState(null, '', `/gallery/${item.slug}`);
    }
  };

  const closeLightbox = () => {
    setSelectedAlbum(null);
    setActivePhotoIndex(0);
    if (slug) {
      navigate('/gallery', { replace: true });
    } else {
      window.history.pushState(null, '', '/gallery');
    }
  };

  const currentAlbumPhotos = useMemo(() => {
    if (!selectedAlbum) return [];
    if (selectedAlbum.images && selectedAlbum.images.length > 0) {
      return selectedAlbum.images;
    }
    return selectedAlbum.url ? [selectedAlbum.url] : [];
  }, [selectedAlbum]);

  const nextPhoto = useCallback(() => {
    if (currentAlbumPhotos.length <= 1) return;
    setActivePhotoIndex(prev => (prev + 1) % currentAlbumPhotos.length);
  }, [currentAlbumPhotos.length]);

  const prevPhoto = useCallback(() => {
    if (currentAlbumPhotos.length <= 1) return;
    setActivePhotoIndex(prev => (prev - 1 + currentAlbumPhotos.length) % currentAlbumPhotos.length);
  }, [currentAlbumPhotos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedAlbum) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAlbum, nextPhoto, prevPhoto]);

  const handleCopyLink = () => {
    if (!selectedAlbum) return;
    const url = `${window.location.origin}/gallery/${selectedAlbum.slug || selectedAlbum.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredItems = items.filter(item => item.type === activeTab);

  const getYoutubeThumbnail = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  };

  const pageKeywords = useMemo(() => {
    const list: string[] = [
      'Aswanna Gallery',
      'කෘෂි ඡායාරූප',
      'කෘෂි වීඩියෝ',
      'Sri Lanka Agriculture Gallery',
      'farming photos and videos Sri Lanka'
    ];
    items.forEach(i => {
      if (i.title) list.push(i.title);
      if (i.sinhalaTitle) list.push(i.sinhalaTitle);
    });
    return Array.from(new Set(list.filter(Boolean))).slice(0, 30).join(', ');
  }, [items]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <SEO 
        title={isSinhala ? "කෘෂි ඡායාරූප හා වීඩියෝ එකතුව | Gallery - Aswanna" : "Agri Photo & Video Gallery | Aswanna"}
        description={isSinhala ? "ශ්‍රී ලංකාවේ කෘෂිකාර්මික ව්‍යාපෘති, ක්ෂේත්‍ර චාරිකා සහ ප්‍රජා වැඩසටහන් වල ඡායාරූප සහ වීඩියෝ එකතුව." : "Explore photography and videos of agricultural projects, field visits, and farmer empowerment initiatives in Sri Lanka."}
        canonical="/gallery"
        keywords={pageKeywords}
      />

      {/* ── Page Hero ── */}
      <PageHero
        title={t('galleryPage.title', 'GALLERY')}
        description={t('contact.desc')}
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#9f1239"
        icon={ImageIcon}
        badgeBg="bg-[#e11d48]"
        waveColor="text-gray-50"
      />

      {/* ── Main Content ── */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-12">

          {/* Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-full shadow-sm border border-gray-100 flex items-center">
              <button
                onClick={() => { setActiveTab('IMAGE'); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold tracking-wider transition-all duration-300 ${activeTab === 'IMAGE'
                    ? 'bg-[var(--color-secondary)] text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <ImageIcon className="w-4 h-4" />
                {t('galleryPage.photos', 'Photos')}
              </button>
              <button
                onClick={() => { setActiveTab('VIDEO'); setCurrentPage(1); }}
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
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex justify-center">
              <AgroLoader message={t('galleryPage.loading', 'මාධ්‍ය තොරතුරු පූරණය වෙමින් පවතී...')} />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-400">{t('galleryPage.noMedia', 'No media found.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredItems.map((item, index) => {
                const photoCount = (item.images && item.images.length > 0) ? item.images.length : (item.url ? 1 : 0);
                const isBulkAlbum = item.type === 'IMAGE' && photoCount > 1;

                return (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                    className="animate-card-pop bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 border border-gray-100 group p-2.5 flex flex-col justify-between"
                  >
                    {/* Media Container */}
                    <div 
                      onClick={() => item.type === 'IMAGE' && openLightbox(item, 0)}
                      className={`relative h-64 w-full rounded-[20px] overflow-hidden bg-gray-100 ${
                        item.type === 'IMAGE' ? 'cursor-pointer' : ''
                      }`}
                    >
                      {item.type === 'IMAGE' ? (
                        <>
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {/* Album / Photo badge */}
                          {isBulkAlbum ? (
                            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md border border-white/20">
                              <Layers size={13} className="text-amber-400" />
                              <span>{photoCount} {isSinhala ? 'ඡායාරූප' : 'Photos'}</span>
                            </div>
                          ) : (
                            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <ImageIcon size={12} />
                            </div>
                          )}

                          {/* Hover action hint */}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white/95 text-gray-800 text-xs font-bold px-4 py-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform flex items-center gap-1.5">
                              {isBulkAlbum ? (
                                <>
                                  <Layers size={14} className="text-green-600" />
                                  {isSinhala ? `ඇල්බමය බලන්න (${photoCount})` : `View Album (${photoCount} photos)`}
                                </>
                              ) : (
                                <>
                                  <ImageIcon size={14} className="text-green-600" />
                                  {isSinhala ? 'ඡායාරූපය බලන්න' : 'View Photo'}
                                </>
                              )}
                            </span>
                          </div>
                        </>
                      ) : (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-full relative cursor-pointer group-hover:scale-105 transition-transform duration-700"
                        >
                          <img
                            src={getYoutubeThumbnail(item.url) || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800'}
                            alt={item.title}
                            className="w-full h-full object-cover opacity-85"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg group-hover:bg-white group-hover:scale-110 transition-all">
                              <PlayCircle className="w-12 h-12 text-red-600" />
                            </div>
                          </div>
                        </a>
                      )}
                    </div>

                    {/* Single unified title under media card */}
                    <div className="p-4 pt-3.5 text-center">
                      <h3 
                        onClick={() => item.type === 'IMAGE' && openLightbox(item, 0)}
                        className={`text-base font-bold text-gray-900 leading-snug line-clamp-2 ${
                          item.type === 'IMAGE' ? 'cursor-pointer hover:text-green-700 transition-colors' : ''
                        }`}
                      >
                        {isSinhala && item.sinhalaTitle ? item.sinhalaTitle : item.title}
                      </h3>
                      {(item.description || item.sinhalaDescription) && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-1 font-normal">
                          {isSinhala && item.sinhalaDescription ? item.sinhalaDescription : item.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Interactive Lightbox / Album Carousel Modal ── */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md select-none">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={closeLightbox} />

          {/* Top Bar with Album Title, counter, and actions */}
          <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white">
            <div className="max-w-xl">
              <h2 className="text-lg font-bold truncate">
                {isSinhala && selectedAlbum.sinhalaTitle ? selectedAlbum.sinhalaTitle : selectedAlbum.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-300 mt-0.5">
                {currentAlbumPhotos.length > 1 ? (
                  <span>
                    {isSinhala ? 'ඡායාරූපය' : 'Photo'} {activePhotoIndex + 1} / {currentAlbumPhotos.length}
                  </span>
                ) : (
                  <span>{isSinhala ? '1 ඡායාරූපයක්' : '1 Photo'}</span>
                )}
                {selectedAlbum.slug && (
                  <span className="font-mono text-gray-400">/gallery/{selectedAlbum.slug}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                title="Copy share link"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {copiedLink ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
              </button>
              <a
                href={currentAlbumPhotos[activePhotoIndex]}
                target="_blank"
                rel="noopener noreferrer"
                title="Open original photo"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Download size={18} />
              </a>
              <button
                onClick={closeLightbox}
                title="Close (Esc)"
                className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-colors ml-1"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main Photo Display Area */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 pt-20 pb-28">
            <div className="relative max-w-5xl max-h-[72vh] flex items-center justify-center">
              <img
                key={currentAlbumPhotos[activePhotoIndex]}
                src={currentAlbumPhotos[activePhotoIndex]}
                alt={`${selectedAlbum.title} - ${activePhotoIndex + 1}`}
                className="max-h-[72vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl transition-all duration-300"
              />

              {/* Prev button */}
              {currentAlbumPhotos.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                  className="absolute -left-4 sm:-left-12 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Next button */}
              {currentAlbumPhotos.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                  className="absolute -right-4 sm:-right-12 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Description if present */}
            {(selectedAlbum.description || selectedAlbum.sinhalaDescription) && (
              <div className="mt-3 max-w-2xl text-center px-4">
                <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">
                  {isSinhala && selectedAlbum.sinhalaDescription ? selectedAlbum.sinhalaDescription : selectedAlbum.description}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Thumbnail Strip for Albums with > 1 photos */}
          {currentAlbumPhotos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center px-4">
              <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-lg rounded-2xl max-w-full overflow-x-auto border border-white/10 shadow-2xl">
                {currentAlbumPhotos.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all duration-200 ${
                      activePhotoIndex === idx
                        ? 'ring-3 ring-green-500 scale-105 opacity-100'
                        : 'opacity-50 hover:opacity-85'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
