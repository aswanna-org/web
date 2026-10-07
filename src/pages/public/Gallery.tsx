import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Image as ImageIcon, Video, PlayCircle, X, 
  ChevronLeft, ChevronRight, Share2, Check, Download,
  Maximize2, Sparkles 
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
  const [isCurvedMode, setIsCurvedMode] = useState(true);
  const [dragStartX, setDragStartX] = useState<number | null>(null);

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

  // 3D Curved calculation for each photo in the album
  const getCardStyle = useCallback((diff: number): React.CSSProperties => {
    if (!isCurvedMode || currentAlbumPhotos.length <= 1) {
      if (diff === 0) {
        return {
          transform: 'translate3d(0, 0, 0) scale(1)',
          zIndex: 40,
          opacity: 1,
          pointerEvents: 'auto',
          filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.85))'
        };
      }
      return {
        transform: 'translate3d(0, 0, 0) scale(0.8)',
        zIndex: 10,
        opacity: 0,
        pointerEvents: 'none',
      };
    }

    // Center active photo
    if (diff === 0) {
      return {
        transform: 'translate3d(0, 0, 0) rotateY(0deg) scale(1)',
        zIndex: 40,
        opacity: 1,
        filter: 'brightness(1) drop-shadow(0 25px 40px rgba(0,0,0,0.9))',
        pointerEvents: 'auto',
      };
    }

    // Immediate Right: curves in towards center
    if (diff === 1) {
      return {
        transform: 'translate3d(clamp(200px, 34vw, 520px), 0, -180px) rotateY(-36deg) scale(0.82)',
        zIndex: 30,
        opacity: 0.75,
        filter: 'brightness(0.68) drop-shadow(0 15px 30px rgba(0,0,0,0.8))',
        pointerEvents: 'auto',
        cursor: 'pointer',
      };
    }

    // Immediate Left: curves in towards center
    if (diff === -1) {
      return {
        transform: 'translate3d(calc(-1 * clamp(200px, 34vw, 520px)), 0, -180px) rotateY(36deg) scale(0.82)',
        zIndex: 30,
        opacity: 0.75,
        filter: 'brightness(0.68) drop-shadow(0 15px 30px rgba(0,0,0,0.8))',
        pointerEvents: 'auto',
        cursor: 'pointer',
      };
    }

    // Far Right: near right screen border
    if (diff === 2) {
      return {
        transform: 'translate3d(clamp(420px, 64vw, 980px), 0, -360px) rotateY(-52deg) scale(0.66)',
        zIndex: 20,
        opacity: 0.45,
        filter: 'brightness(0.45) drop-shadow(0 10px 20px rgba(0,0,0,0.7))',
        pointerEvents: 'auto',
        cursor: 'pointer',
      };
    }

    // Far Left: near left screen border
    if (diff === -2) {
      return {
        transform: 'translate3d(calc(-1 * clamp(420px, 64vw, 980px)), 0, -360px) rotateY(52deg) scale(0.66)',
        zIndex: 20,
        opacity: 0.45,
        filter: 'brightness(0.45) drop-shadow(0 10px 20px rgba(0,0,0,0.7))',
        pointerEvents: 'auto',
        cursor: 'pointer',
      };
    }

    // Hidden in back arc
    const isRight = diff > 0;
    return {
      transform: `translate3d(${isRight ? '85vw' : '-85vw'}, 0, -600px) rotateY(${isRight ? '-70deg' : '70deg'}) scale(0.5)`,
      zIndex: 10,
      opacity: 0,
      pointerEvents: 'none',
    };
  }, [isCurvedMode, currentAlbumPhotos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX === null) return;
    const delta = e.changedTouches[0].clientX - dragStartX;
    if (delta > 45) {
      prevPhoto();
    } else if (delta < -45) {
      nextPhoto();
    }
    setDragStartX(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStartX === null) return;
    const delta = e.clientX - dragStartX;
    if (delta > 55) {
      prevPhoto();
    } else if (delta < -55) {
      nextPhoto();
    }
    setDragStartX(null);
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
                return (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                    onClick={() => {
                      if (item.type === 'IMAGE') {
                        openLightbox(item, 0);
                      }
                    }}
                    className="animate-card-pop relative h-72 sm:h-80 w-full rounded-[24px] overflow-hidden group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 select-none bg-gray-900"
                  >
                    {item.type === 'IMAGE' ? (
                      <>
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />

                        {/* Subtle dark gradient overlay at bottom for clear text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

                        {/* Bottom Left Title & Description (box-less, no button, no count badge) */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-left z-10 pointer-events-none">
                          <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-md line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                            {isSinhala && item.sinhalaTitle ? item.sinhalaTitle : item.title}
                          </h3>
                          {(item.description || item.sinhalaDescription) && (
                            <p className="text-xs text-gray-200/90 line-clamp-1 mt-1.5 font-normal drop-shadow-sm">
                              {isSinhala && item.sinhalaDescription ? item.sinhalaDescription : item.description}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full relative"
                      >
                        <img
                          src={getYoutubeThumbnail(item.url) || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800'}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        
                        {/* Play Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-600/90 backdrop-blur-sm p-4 rounded-full shadow-xl group-hover:bg-red-600 group-hover:scale-110 transition-all text-white">
                            <PlayCircle className="w-10 h-10" />
                          </div>
                        </div>

                        {/* Bottom Left Title */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-left z-10">
                          <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-md line-clamp-2 leading-snug">
                            {isSinhala && item.sinhalaTitle ? item.sinhalaTitle : item.title}
                          </h3>
                          {(item.description || item.sinhalaDescription) && (
                            <p className="text-xs text-gray-200/90 line-clamp-1 mt-1.5 font-normal drop-shadow-sm">
                              {isSinhala && item.sinhalaDescription ? item.sinhalaDescription : item.description}
                            </p>
                          )}
                        </div>
                      </a>
                    )}
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

      {/* ── Interactive 3D Curved Lightbox / Album Carousel Modal ── */}
      {selectedAlbum && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {/* Ambient dynamic backdrop glow derived from current photo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            <img
              src={currentAlbumPhotos[activePhotoIndex]}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover blur-3xl opacity-25 scale-125 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />
          </div>

          {/* Backdrop click to close (clicks on empty gaps) */}
          <div className="absolute inset-0 z-0" onClick={closeLightbox} />

          {/* Top Bar with Album Title, counter, mode switcher, and actions */}
          <div className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent text-white pointer-events-auto">
            <div className="max-w-md sm:max-w-xl">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold truncate">
                  {isSinhala && selectedAlbum.sinhalaTitle ? selectedAlbum.sinhalaTitle : selectedAlbum.title}
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-300 mt-0.5">
                {currentAlbumPhotos.length > 1 ? (
                  <span>
                    {isSinhala ? 'ඡායාරූපය' : 'Photo'} {activePhotoIndex + 1} / {currentAlbumPhotos.length}
                  </span>
                ) : (
                  <span>{isSinhala ? '1 ඡායාරූපයක්' : '1 Photo'}</span>
                )}
                {selectedAlbum.slug && (
                  <span className="hidden sm:inline font-mono text-gray-400">/gallery/{selectedAlbum.slug}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentAlbumPhotos.length > 1 && (
                <button
                  onClick={() => setIsCurvedMode(prev => !prev)}
                  title={isCurvedMode ? (isSinhala ? 'සාමාන්‍ය දසුන' : 'Flat Focus View') : (isSinhala ? '3D වක්‍ර දසුන' : '3D Curved View')}
                  className={`p-2.5 rounded-full transition-all ${
                    isCurvedMode 
                      ? 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-400/40' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {isCurvedMode ? <Sparkles size={18} /> : <Maximize2 size={18} />}
                </button>
              )}
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

          {/* 3D Curved Theater Stage */}
          <div 
            className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-16 pb-28 sm:pb-32 overflow-hidden pointer-events-none"
            style={{
              perspective: '1400px',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Multi-Photo 3D Arc */}
            {currentAlbumPhotos.length > 1 ? (
              <div 
                className="relative w-full h-full flex items-center justify-center pointer-events-none"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {currentAlbumPhotos.map((imgUrl, idx) => {
                  let diff = idx - activePhotoIndex;
                  const total = currentAlbumPhotos.length;
                  if (total > 2) {
                    if (diff > total / 2) diff -= total;
                    if (diff < -total / 2) diff += total;
                  }
                  const cardStyle = getCardStyle(diff);
                  const isActive = diff === 0;

                  return (
                    <div
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isActive) setActivePhotoIndex(idx);
                      }}
                      style={{
                        ...cardStyle,
                        transition: 'all 650ms cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                      className={`absolute will-change-transform flex items-center justify-center select-none ${
                        isActive ? 'pointer-events-auto cursor-default' : 'pointer-events-auto cursor-pointer group'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${selectedAlbum.title} - ${idx + 1}`}
                        className={`max-h-[62vh] sm:max-h-[68vh] md:max-h-[74vh] max-w-[85vw] sm:max-w-[70vw] md:max-w-[58vw] w-auto h-auto object-contain rounded-2xl select-none transition-all duration-300 pointer-events-none ${
                          isActive
                            ? 'shadow-[0_25px_60px_-10px_rgba(0,0,0,0.95)]'
                            : 'shadow-[0_15px_35px_rgba(0,0,0,0.85)] group-hover:scale-[1.03]'
                        }`}
                        draggable={false}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Single photo fallback view */
              <div className="relative max-w-5xl max-h-[76vh] flex items-center justify-center pointer-events-auto p-4">
                <img
                  src={currentAlbumPhotos[0]}
                  alt={selectedAlbum.title}
                  className="max-h-[76vh] max-w-full w-auto h-auto object-contain rounded-2xl shadow-2xl"
                />
              </div>
            )}

            {/* Description if present */}
            {(selectedAlbum.description || selectedAlbum.sinhalaDescription) && (
              <div className="relative z-30 mt-2 max-w-2xl text-center px-6 pointer-events-auto">
                <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 drop-shadow-md bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                  {isSinhala && selectedAlbum.sinhalaDescription ? selectedAlbum.sinhalaDescription : selectedAlbum.description}
                </p>
              </div>
            )}
          </div>

          {/* Floating Next/Prev Side Navigation Chevrons */}
          {currentAlbumPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-40 p-3 sm:p-4 rounded-full bg-black/50 hover:bg-white/25 active:scale-95 text-white backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-200 hover:scale-110 group pointer-events-auto"
                title="Previous (Left Arrow / Swipe Right)"
              >
                <ChevronLeft size={28} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-40 p-3 sm:p-4 rounded-full bg-black/50 hover:bg-white/25 active:scale-95 text-white backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-200 hover:scale-110 group pointer-events-auto"
                title="Next (Right Arrow / Swipe Left)"
              >
                <ChevronRight size={28} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* Bottom Thumbnail Strip for Albums with > 1 photos */}
          {currentAlbumPhotos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 z-40 flex flex-col items-center justify-center px-4 pointer-events-auto">
              <div className="flex items-center gap-2 p-2 bg-black/75 backdrop-blur-xl rounded-2xl max-w-full overflow-x-auto border border-white/15 shadow-2xl">
                {currentAlbumPhotos.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden transition-all duration-300 ${
                      activePhotoIndex === idx
                        ? 'ring-2 ring-emerald-400 scale-105 opacity-100 shadow-lg'
                        : 'opacity-40 hover:opacity-85'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400 mt-1.5 select-none">
                <span>{isSinhala ? 'ඡායාරූප මාරු කිරීමට ක්ලික් කරන්න හෝ ස්වයිප් කරන්න (← →)' : 'Drag or click side photos or use Arrow keys (← →)'}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
