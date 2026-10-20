import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, ArrowRight, Image as ImageIcon
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import Pagination from '../../components/admin/Pagination';
import SEO from '../../components/common/SEO';

export interface BlogItem {
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

// Helper to strip HTML and test if there is real text inside
const cleanHtmlText = (html?: string | null): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;|\u00a0/g, ' ').trim();
};

export default function Blog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [blogList, setBlogList] = useState<BlogItem[]>([]);
  const [totalBlogs, setTotalBlogs] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // If URL has a legacy `slug` or `id` param, redirect to `/blog/:slug`
  useEffect(() => {
    const slugFromUrl = searchParams.get('slug') || searchParams.get('id');
    if (slugFromUrl) {
      navigate(`/blog/${slugFromUrl}`, { replace: true });
    }
  }, [searchParams, navigate]);

  // Fetch paginated blog posts
  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/blogs?page=${currentPage}&limit=10`)
      .then(res => res.json())
      .then(data => {
        const items = data.data || data;
        setBlogList(Array.isArray(items) ? items : []);
        if (data.meta) {
          setTotalBlogs(data.meta.total || 0);
          setTotalPages(data.meta.totalPages || 1);
        } else {
          setTotalBlogs(Array.isArray(items) ? items.length : 0);
          setTotalPages(1);
        }
      })
      .catch(err => {
        console.error("Error fetching blogs:", err);
        setBlogList([]);
      })
      .finally(() => setIsLoading(false));
  }, [currentPage]);

  // Helper to extract clean text excerpt
  const getExcerpt = (item: BlogItem): string => {
    const enClean = cleanHtmlText(item.content);
    const siClean = cleanHtmlText(item.sinhalaContent);
    const raw = isSinhala
      ? (siClean ? item.sinhalaContent : item.content)
      : (enClean ? item.content : item.sinhalaContent);
    return cleanHtmlText(raw);
  };

  // Helper to format date
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isSinhala ? 'si-LK' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Featured (Latest) Blog item is the first article on page 1
  const featuredBlog = currentPage === 1 && blogList.length > 0 ? blogList[0] : null;
  const regularBlogList = currentPage === 1 && blogList.length > 0 ? blogList.slice(1) : blogList;

  return (
    <div className="w-full min-h-screen bg-white">
      <SEO
        title={isSinhala ? 'කෘෂි ලිපි හා උපදෙස් | Aswanna' : 'Agri Blog & Farming Guides | Aswanna'}
        description={isSinhala ? 'නවතම වගා උපදෙස්, පළිබෝධ පාලනය, සහ කෘෂි ව්‍යවසායකත්ව ලිපි සහ මඟපෙන්වීම්.' : 'Read our latest articles, farming guides, and insights from industry experts.'}
        canonical="/blog"
      />

      {/* Hero Banner */}
      <PageHero
        title={t('blogPage.title', 'BLOG')}
        description={t('blogPage.desc', 'Read our latest articles, farming guides, and insights from industry experts.')}
        image="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1600&q=80"
        gradientColor="#064e3b"
        icon={BookOpen}
        badgeBg="bg-emerald-700"
        waveColor="text-white"
      />

      {/* Main Container */}
      <div className="container mx-auto px-4 lg:px-12 py-8 lg:py-12">
        {/* Top Header Row with Articles Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-2 border-b border-gray-100">
          <p className="text-xs sm:text-sm font-medium text-gray-500 tracking-wide">
            {totalBlogs} {isSinhala ? 'ලිපි' : t('blogPage.articles', 'articles')}
          </p>
        </div>

        {/* Full-width Articles Feed */}
        <div className="w-full space-y-6">
          {isLoading ? (
            <div className="py-24 flex justify-center">
              <AgroLoader message={t('blogPage.loading', 'ලිපි තොරතුරු පූරණය වෙමින් පවතී...')} />
            </div>
          ) : blogList.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                {t('blogPage.noPosts', 'No blog posts found.')}
              </h3>
              <p className="text-xs text-gray-500">
                {isSinhala
                  ? 'ලිපි කිසිවක් හමු නොවීය.'
                  : 'No articles found at the moment.'}
              </p>
            </div>
          ) : (
            <>
              {/* ── 1. Featured / Latest Blog Post (Top) ── */}
              {featuredBlog && (() => {
                const featuredUrl = `/blog/${encodeURIComponent(featuredBlog.slug || featuredBlog.id)}`;
                const featuredTitle = isSinhala
                  ? (featuredBlog.sinhalaTitle || featuredBlog.title || 'Untitled')
                  : (featuredBlog.title || featuredBlog.sinhalaTitle || 'Untitled');
                const featuredExcerpt = getExcerpt(featuredBlog);

                return (
                  <article className="group">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
                      {/* Left: Featured Image with Bottom Accent Line */}
                      <div className="md:col-span-5 lg:col-span-5 w-full relative overflow-hidden rounded-xs bg-gray-100 shadow-2xs">
                        <Link to={featuredUrl} className="block aspect-[16/10] w-full overflow-hidden">
                          {featuredBlog.image ? (
                            <img
                              src={featuredBlog.image}
                              alt={featuredBlog.title || ''}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon className="w-12 h-12" />
                            </div>
                          )}
                        </Link>
                        {/* Green accent line under the image */}
                        <div className="h-1 bg-[#15803d] w-full" />
                      </div>

                      {/* Right: Featured Story Headline, Excerpt & Metadata */}
                      <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-between h-full pt-1">
                        <div>
                          <Link to={featuredUrl} className="block group-hover:text-emerald-700 transition-colors">
                            <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl text-gray-900 leading-tight tracking-tight hover:text-emerald-700 transition-colors">
                              {featuredTitle}
                            </h2>
                          </Link>

                          {featuredExcerpt && (
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mt-3 sm:mt-4 line-clamp-4">
                              {featuredExcerpt}
                            </p>
                          )}

                          <Link
                            to={featuredUrl}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-900 mt-3.5 transition-colors group/link"
                          >
                            <span>{isSinhala ? 'සම්පූර්ණ ලිපිය කියවන්න' : 'Read Full Story'}</span>
                            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        </div>

                        {/* Meta Line: Date | Author */}
                        <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-2 mt-5 pt-1 font-medium">
                          <span>{formatDate(featuredBlog.createdAt)}</span>
                          {featuredBlog.authorName && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="text-gray-700 font-semibold">{featuredBlog.authorName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Horizontal Divider Line Below Hero */}
                    <hr className="border-gray-200 my-8 sm:my-10" />
                  </article>
                );
              })()}

              {/* ── 2. List of Subsequent Blog Stories (2 blogs per row) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-8 sm:gap-y-10">
                {regularBlogList.map((item) => {
                  const itemUrl = `/blog/${encodeURIComponent(item.slug || item.id)}`;
                  const itemTitle = isSinhala
                    ? (item.sinhalaTitle || item.title || 'Untitled')
                    : (item.title || item.sinhalaTitle || 'Untitled');
                  const excerpt = getExcerpt(item);
                  const dateFormatted = formatDate(item.createdAt);

                  return (
                    <article key={item.id} className="group border-b border-gray-200 pb-6 sm:pb-8 flex flex-col justify-between">
                      <div className="flex gap-4 sm:gap-5 items-start">
                        {/* Thumbnail on Left */}
                        <Link
                          to={itemUrl}
                          className="w-28 h-20 sm:w-36 sm:h-26 md:w-40 md:h-28 lg:w-44 lg:h-30 shrink-0 rounded-xs overflow-hidden bg-gray-100 border border-gray-100 shadow-2xs relative block"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={itemTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon className="w-7 h-7" />
                            </div>
                          )}
                        </Link>

                        {/* Content on Right */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                          <div>
                            <Link to={itemUrl} className="block group-hover:text-emerald-700 transition-colors">
                              <h3 className="text-sm sm:text-base md:text-[17px] font-bold text-gray-900 leading-snug line-clamp-2 hover:text-emerald-700 transition-colors">
                                {itemTitle}
                              </h3>
                            </Link>

                            {excerpt && (
                              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1 sm:mt-1.5 leading-relaxed">
                                {excerpt}
                              </p>
                            )}

                            <Link
                              to={itemUrl}
                              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-700 hover:text-emerald-900 mt-2 transition-colors group/read"
                            >
                              <span>{isSinhala ? 'තව කියවන්න' : 'Read More'}</span>
                              <ArrowRight className="w-3 h-3 group-hover/read:translate-x-1 transition-transform" />
                            </Link>
                          </div>

                          {/* Meta Line: Date | Author */}
                          <div className="text-[10px] sm:text-xs text-gray-500 flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5 font-medium">
                            <span>{dateFormatted}</span>
                            {item.authorName && (
                              <>
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-700 font-semibold truncate max-w-[140px] sm:max-w-[180px]">{item.authorName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="pt-8 sm:pt-10 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('page', page.toString());
                      setSearchParams(newParams);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
