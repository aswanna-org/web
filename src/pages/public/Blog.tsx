import { useState, useEffect, useRef } from 'react';
import { Share2, Clock, User, Image as ImageIcon, Link as LinkIcon, MessageCircle, Check, BookOpen } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';
import Pagination from '../../components/admin/Pagination';

interface BlogItem {
  id: string;
  title?: string | null;
  sinhalaTitle?: string | null;
  slug?: string | null;
  content?: string | null;
  sinhalaContent?: string | null;
  image?: string | null;
  authorName?: string | null;
  authorEmail?: string | null;
  authorAvatar?: string | null;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Blog() {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [blogList, setBlogList] = useState<BlogItem[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/blogs?page=${currentPage}&limit=10`)
      .then(res => res.json())
      .then(data => {
        const items = data.data || data;
        setBlogList(items);
        if (items.length > 0) {
          const urlParams = new URLSearchParams(window.location.search);
          const slugFromUrl = urlParams.get('slug') || urlParams.get('id');
          const matchedItem = items.find((i: BlogItem) => i.slug === slugFromUrl || i.id === slugFromUrl);
          if (matchedItem) {
            setSelectedBlogId(matchedItem.id);
          } else {
            setSelectedBlogId(items[0].id);
          }
        }
        if (data.meta) {
          setTotalPages(data.meta.totalPages);
        }
      })
      .catch(err => console.error("Error fetching blogs:", err))
      .finally(() => setIsLoading(false));
  }, [currentPage]);

  const selectedBlog = blogList.find((n) => n.id === selectedBlogId) || blogList[0];

  const handleShare = (type: 'copy' | 'whatsapp' | 'facebook') => {
    if (!selectedBlog) return;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?slug=${selectedBlog.slug || selectedBlog.id}`;
    const title = isSinhala ? (selectedBlog.sinhalaTitle || selectedBlog.title || '') : (selectedBlog.title || selectedBlog.sinhalaTitle || '');

    if (type === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } else if (type === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' - ' + shareUrl)}`, '_blank');
      setShowShareMenu(false);
    } else if (type === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      setShowShareMenu(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">

      {/* ── Page Hero ── */}
      <PageHero
        title={t('blogPage.title', 'BLOG')}
        description={t('blogPage.desc', 'Read our latest articles, farming guides, and insights from industry experts.')}
        image="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1600&q=80"
        gradientColor="#7c2d12"
        icon={BookOpen}
        badgeBg="bg-[#c2410c]"
        waveColor="text-gray-50"
      />

      {/* ── Content ── */}
      <div className="container mx-auto px-4 lg:px-12 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* Column 1 on Mobile / Left Column on Desktop: Blog List */}
          <div className="w-full lg:w-1/3 flex flex-col order-2 lg:order-1">
            <div className="flex items-center gap-6 border-b border-gray-200 mb-4 sm:mb-6 pb-2 justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)] pb-2 -mb-[10px]">
                {t('blogPage.latestPosts', 'Latest Posts')}
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 overflow-y-auto max-h-[500px] sm:max-h-[600px] lg:max-h-[800px] pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {isLoading ? (
                <div className="p-8 sm:p-10 text-center text-sm text-gray-500">{t('blogPage.loading', 'Loading posts...')}</div>
              ) : blogList.length === 0 ? (
                <div className="p-8 sm:p-10 text-center text-sm text-gray-500">{t('blogPage.noPosts', 'No blog posts found.')}</div>
              ) : (
                blogList.map((blog, index) => (
                  <div
                    key={blog.id}
                    style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                    onClick={() => {
                      setSelectedBlogId(blog.id);
                      if (window.innerWidth < 1024) {
                        setTimeout(() => {
                          document.getElementById('blog-detail-section')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    className={`animate-card-pop flex gap-3 sm:gap-4 p-2 sm:p-2.5 lg:p-3 rounded-xl cursor-pointer transition-all duration-300 ${selectedBlogId === blog.id
                      ? 'bg-white shadow-md border border-[var(--color-secondary)]/20'
                      : 'hover:bg-white hover:shadow-sm border border-transparent'
                      }`}
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                      {blog.image ? (
                        <img src={blog.image} alt={blog.title || ''} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col justify-between py-0.5 sm:py-1">
                      <div>
                        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(blog.createdAt).toLocaleDateString()}
                        </p>
                        <h3 className={`font-bold text-xs sm:text-sm leading-snug line-clamp-2 ${selectedBlogId === blog.id ? 'text-[var(--color-secondary)]' : 'text-gray-800'
                          }`}>
                          {isSinhala ? (blog.sinhalaTitle || blog.title || 'Untitled') : (blog.title || blog.sinhalaTitle || 'Untitled')}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                        <span className="text-[10px] sm:text-xs font-medium text-gray-500">{blog.authorName || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="mt-4 sm:mt-6 pr-2">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </div>

          {/* Top on Mobile / Right Column on Desktop: Blog Details */}
          <div id="blog-detail-section" className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-10 xl:p-12 min-h-[350px] lg:min-h-[500px] order-1 lg:order-2">
            {selectedBlog ? (
              <>
                {/* Author and Share Row */}
                <div className="flex items-center justify-between mb-4 pb-3 sm:mb-6 sm:pb-5 lg:mb-8 lg:pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-2.5 sm:gap-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                      {selectedBlog.authorAvatar ? (
                        <img src={selectedBlog.authorAvatar} alt={selectedBlog.authorName || ''} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">{t('blogPage.by', 'By')} <span className="font-bold text-gray-800">{selectedBlog.authorName || '-'}</span></p>
                      <p className="text-[10px] sm:text-xs text-gray-400">{new Date(selectedBlog.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="relative" ref={shareMenuRef}>
                    <button 
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white rounded-full text-xs sm:text-sm font-bold transition-colors shadow-sm"
                    >
                      {t('blogPage.share', 'Share')} <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                        <button 
                          onClick={() => handleShare('copy')}
                          className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-xs sm:text-sm font-medium text-gray-700 transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4 text-gray-500" />}
                          {copied ? t('newsPage.copied', 'Copied!') : t('newsPage.copyLink', 'Copy Link')}
                        </button>
                        <button 
                          onClick={() => handleShare('whatsapp')}
                          className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-xs sm:text-sm font-medium text-gray-700 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-[#25D366]" />
                          {t('newsPage.shareWhatsApp', 'WhatsApp')}
                        </button>
                        <button 
                          onClick={() => handleShare('facebook')}
                          className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-xs sm:text-sm font-medium text-gray-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1877F2]">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                          </svg>
                          {t('newsPage.shareFacebook', 'Facebook')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold md:font-black text-gray-900 leading-snug sm:leading-tight mb-4 sm:mb-6">
                  {isSinhala ? (selectedBlog.sinhalaTitle || selectedBlog.title || 'Untitled') : (selectedBlog.title || selectedBlog.sinhalaTitle || 'Untitled')}
                </h1>

                {/* Main Image */}
                {selectedBlog.image && (
                  <div className="w-full h-48 sm:h-64 md:h-80 lg:h-[400px] rounded-xl overflow-hidden mb-5 sm:mb-8 shadow-sm">
                    <img src={selectedBlog.image} alt={selectedBlog.title || ''} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Content */}
                <div
                  className="w-full !max-w-full max-w-none lg:!max-w-none rich-content prose prose-sm sm:prose lg:prose-lg text-xs sm:text-sm md:text-base leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{ __html: ((isSinhala ? (selectedBlog.sinhalaContent || selectedBlog.content) : selectedBlog.content) || '').replace(/&nbsp;|\u00a0/g, ' ') }}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 font-medium text-sm">
                {t('blogPage.selectToRead', 'Select a post to read')}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
