import { useState, useEffect, useRef } from 'react';
import { Share2, Clock, User, Image as ImageIcon, Link as LinkIcon, MessageCircle, Check } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';
import Pagination from '../../components/admin/Pagination';

interface NewsItem {
  id: string;
  title?: string | null;
  sinhalaTitle?: string | null;
  slug?: string | null;
  content?: string | null;
  sinhalaContent?: string | null;
  category?: string | null;
  image?: string | null;
  authorName?: string | null;
  authorEmail?: string | null;
  authorAvatar?: string | null;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NEWS_CATEGORIES = [
  'රාජ්‍ය ප්‍රතිපත්ති සහ කැබිනට් තීරණ',
  'සංවර්ධන පුවත්',
  'ප්‍රාදේශීය පුවත්',
  'වෙළඳ හා ආර්ථික',
  'තාක්ෂණ හා පර්යේෂණ',
  'සත්ව පාලනය හා ධීවර',
  'කාලගුණ හා ආපදා',
  'විදේශ පුවත්',
  'විශේෂාංග'
];

export default function News() {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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
    const categoryParam = selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : '';
    fetch(`${API_BASE_URL}/news?page=${currentPage}&limit=10${categoryParam}`)
      .then(res => res.json())
      .then(data => {
        const items = data.data || data;
        setNewsList(items);
        if (items.length > 0) {
          const urlParams = new URLSearchParams(window.location.search);
          const slugFromUrl = urlParams.get('slug') || urlParams.get('id');
          const matchedItem = items.find((i: NewsItem) => i.slug === slugFromUrl || i.id === slugFromUrl);
          if (matchedItem) {
            setSelectedNewsId(matchedItem.id);
          } else {
            setSelectedNewsId(items[0].id);
          }
        }
        if (data.meta) {
          setTotalPages(data.meta.totalPages);
        }
      })
      .catch(err => console.error("Error fetching news:", err))
      .finally(() => setIsLoading(false));
  }, [currentPage, selectedCategory]);

  const selectedNews = newsList.find((n) => n.id === selectedNewsId) || newsList[0];

  const handleShare = (type: 'copy' | 'whatsapp' | 'facebook') => {
    if (!selectedNews) return;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?slug=${selectedNews.slug || selectedNews.id}`;
    const title = isSinhala ? (selectedNews.sinhalaTitle || selectedNews.title || '') : (selectedNews.title || selectedNews.sinhalaTitle || '');

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
        title={t('newsPage.title', 'NEWS')}
        description={t('newsPage.desc', 'Stay informed with the latest news, updates, and announcements from Aswanna.')}
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#28b41bff"
      />

      {/* ── Content ── */}
      <div className="container mx-auto px-4 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left Column: News List (approx 1/3 width) */}
          <div className="w-full lg:w-1/3 flex flex-col">
            <div className="flex items-center gap-6 border-b border-gray-200 mb-6 pb-2 justify-between">
              <h2 className="text-xl font-bold text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)] pb-2 -mb-[10px]">
                {t('newsPage.latest', 'Latest')}
              </h2>
            </div>

            <div className="mb-6">
              <select 
                value={selectedCategory} 
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/50 bg-white shadow-sm text-sm font-medium text-gray-700"
              >
                <option value="">{t('newsPage.allCategories', 'All Categories')}</option>
                {NEWS_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto max-h-[800px] pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {isLoading ? (
                <div className="p-10 text-center text-gray-500">{t('newsPage.loading', 'Loading news...')}</div>
              ) : newsList.length === 0 ? (
                <div className="p-10 text-center text-gray-500">{t('newsPage.noNews', 'No news articles found.')}</div>
              ) : (
                newsList.map((news) => (
                  <div
                    key={news.id}
                    onClick={() => {
                      setSelectedNewsId(news.id);
                      if (window.innerWidth < 1024) {
                        setTimeout(() => {
                          document.getElementById('news-detail-section')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    className={`flex gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 ${selectedNewsId === news.id
                        ? 'bg-white shadow-md border border-[var(--color-secondary)]/20'
                        : 'hover:bg-white hover:shadow-sm border border-transparent'
                      }`}
                  >
                    <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                      {news.image ? (
                        <img src={news.image} alt={news.title || ''} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(news.createdAt).toLocaleDateString()}
                        </p>
                        <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${selectedNewsId === news.id ? 'text-[var(--color-secondary)]' : 'text-gray-800'
                          }`}>
                          {isSinhala ? (news.sinhalaTitle || news.title || 'Untitled') : (news.title || news.sinhalaTitle || 'Untitled')}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-gray-500">{news.authorName || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="mt-6 pr-2">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </div>

          {/* Right Column: News Details (approx 2/3 width) */}
          <div id="news-detail-section" className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12 min-h-[500px]">
            {selectedNews ? (
              <>
                {/* Author and Share Row */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                      {selectedNews.authorAvatar ? (
                        <img src={selectedNews.authorAvatar} alt={selectedNews.authorName || ''} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('blogPage.by', 'By')} <span className="font-bold text-gray-800">{selectedNews.authorName || '-'}</span></p>
                      <p className="text-xs text-gray-400">{new Date(selectedNews.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="relative" ref={shareMenuRef}>
                    <button 
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white rounded-full text-sm font-bold transition-colors shadow-sm"
                    >
                      {t('blogPage.share', 'Share')} <Share2 className="w-4 h-4" />
                    </button>
                    
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                        <button 
                          onClick={() => handleShare('copy')}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4 text-gray-500" />}
                          {copied ? t('newsPage.copied', 'Copied!') : t('newsPage.copyLink', 'Copy Link')}
                        </button>
                        <button 
                          onClick={() => handleShare('whatsapp')}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-[#25D366]" />
                          {t('newsPage.shareWhatsApp', 'WhatsApp')}
                        </button>
                        <button 
                          onClick={() => handleShare('facebook')}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1877F2]">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                          </svg>
                          {t('newsPage.shareFacebook', 'Facebook')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-8">
                  {isSinhala ? (selectedNews.sinhalaTitle || selectedNews.title || 'Untitled') : (selectedNews.title || selectedNews.sinhalaTitle || 'Untitled')}
                </h1>

                {/* Main Image */}
                {selectedNews.image && (
                  <div className="w-full h-[400px] rounded-xl overflow-hidden mb-10 shadow-sm">
                    <img src={selectedNews.image} alt={selectedNews.title || ''} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none rich-content"
                  dangerouslySetInnerHTML={{ __html: ((isSinhala ? (selectedNews.sinhalaContent || selectedNews.content) : selectedNews.content) || '').replace(/&nbsp;|\u00a0/g, ' ') }}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 font-medium">
                {t('newsPage.selectToRead', 'Select an article to read')}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
