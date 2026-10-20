import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Clock, Share2, Link as LinkIcon, Check,
  MessageCircle, ChevronRight, Calendar, BookOpen
} from 'lucide-react';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/public/PageHero';
import CommentSection from '../../components/public/CommentSection';

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

// Helper to strip HTML and test if there is real text inside
const cleanHtmlText = (html?: string | null): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;|\u00a0/g, ' ').trim();
};

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Scroll to top whenever the slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Close share menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Blog Item by Slug or ID
  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(false);

    // Try fetching by primary route, with fallback to slug route
    fetch(`${API_BASE_URL}/blogs/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (res.ok) return res.json();
        // Fallback to /slug/:slug endpoint if needed
        const slugRes = await fetch(`${API_BASE_URL}/blogs/slug/${encodeURIComponent(slug)}`);
        if (slugRes.ok) return slugRes.json();
        throw new Error('Not found');
      })
      .then(data => {
        setBlog(data);
      })
      .catch(err => {
        console.error("Error fetching blog detail:", err);
        setError(true);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  const handleShare = (type: 'copy' | 'whatsapp' | 'facebook') => {
    if (!blog) return;
    const itemSlug = blog.slug || blog.id;
    const socialShareUrl = `${API_BASE_URL}/share/blog/${encodeURIComponent(itemSlug)}`;
    const shareTitle = isSinhala ? (blog.sinhalaTitle || blog.title || '') : (blog.title || blog.sinhalaTitle || '');

    if (type === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } else if (type === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' - ' + socialShareUrl)}`, '_blank');
      setShowShareMenu(false);
    } else if (type === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(socialShareUrl)}`, '_blank');
      setShowShareMenu(false);
    }
  };

  // Resolve Title with intelligent fallback
  const title = useMemo(() => {
    if (!blog) return isSinhala ? 'ලිපි විස්තරය' : 'Blog Article';
    if (isSinhala) {
      return blog.sinhalaTitle || blog.title || 'බ්ලොග් ලිපිය';
    } else {
      return blog.title || blog.sinhalaTitle || 'Blog Article';
    }
  }, [blog, isSinhala]);

  // Resolve Content with robust fallback so content is never blank
  const contentHtml = useMemo(() => {
    if (!blog) return '';
    const enClean = cleanHtmlText(blog.content);
    const siClean = cleanHtmlText(blog.sinhalaContent);

    if (isSinhala) {
      return (siClean ? blog.sinhalaContent : blog.content) || '';
    } else {
      return (enClean ? blog.content : blog.sinhalaContent) || '';
    }
  }, [blog, isSinhala]);

  const cleanDescription = useMemo(() => {
    return cleanHtmlText(contentHtml).slice(0, 160) || 'Aswanna Blog Article';
  }, [contentHtml]);

  const formattedDate = useMemo(() => {
    if (!blog?.createdAt) return '';
    try {
      const d = new Date(blog.createdAt);
      return d.toLocaleDateString(isSinhala ? 'si-LK' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  }, [blog?.createdAt, isSinhala]);

  // Estimated reading time
  const readingTime = useMemo(() => {
    const text = cleanHtmlText(contentHtml);
    const words = text.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return isSinhala ? `විනාඩි ${minutes}ක කියවීමක්` : `${minutes} min read`;
  }, [contentHtml, isSinhala]);

  return (
    <div className="w-full min-h-screen bg-white pb-20">
      <SEO
        title={`${title} | Aswanna Blog`}
        description={cleanDescription}
        image={blog?.image || undefined}
        canonical={`/blog/${blog?.slug || slug}`}
        type="article"
      />

      {/* ── Page Hero Banner (Title Only, Compact Mobile Sizing) ── */}
      <PageHero
        title={blog ? title : (isSinhala ? 'ලිපි විස්තරය' : 'Blog Article')}
        titleClassName="text-white text-xs sm:text-sm md:text-lg lg:text-xl font-bold normal-case leading-snug drop-shadow-md max-w-4xl"
        image={blog?.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1600&q=80'}
        gradientColor="#064e3b"
        icon={BookOpen}
        badgeBg="bg-emerald-700"
        waveColor="text-white"
      />

      <div className="container mx-auto px-4 lg:px-12 pt-6 sm:pt-8">
        
        {/* ── Breadcrumbs Bar ── */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-emerald-700 transition-colors font-medium">
            {isSinhala ? 'මුල් පිටුව' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link to="/blog" className="hover:text-emerald-700 transition-colors font-medium">
            {isSinhala ? 'බ්ලොග් ලිපි' : 'Blog'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700 font-semibold truncate max-w-xs sm:max-w-md">
            {title}
          </span>
        </nav>

        {/* ── Top Back Navigation & Share Button Bar ── */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <button
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/blog');
              }
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isSinhala ? 'සියලු ලිපි වෙත ආපසු' : 'Back to All Blogs'}</span>
          </button>

          {/* Share Button (Right side of back button) */}
          <div className="relative" ref={shareMenuRef}>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#14532d] hover:bg-[#0e432a] text-white rounded-full text-xs sm:text-sm font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('newsPage.share', 'Share')}</span>
            </button>

            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4 text-gray-500" />}
                  {copied ? t('newsPage.copied', 'Copied!') : t('newsPage.copyLink', 'Copy Link')}
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>{t('newsPage.shareWhatsApp', 'WhatsApp')}</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1877F2]">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  <span>{t('newsPage.shareFacebook', 'Facebook')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Content Area: Full Width Without Card ── */}
        {isLoading ? (
          <div className="py-24 flex justify-center">
            <AgroLoader message={isSinhala ? 'ලිපි තොරතුරු පූරණය වෙමින් පවතී...' : 'Loading blog article...'} />
          </div>
        ) : error || !blog ? (
          <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white rounded-xl p-8 border border-gray-100 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isSinhala ? 'ලිපිය සොයාගත නොහැකි විය' : 'Blog Article Not Found'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              {isSinhala ? 'මෙම ලිපිය ඉවත් කර හෝ වෙනත් ලිපිනයකට මාරු කර ඇත.' : 'The requested article could not be found or may have been moved.'}
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14532d] text-white font-bold text-xs sm:text-sm rounded-lg hover:bg-[#0f3f22] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isSinhala ? 'බ්ලොග් ප්‍රධාන පිටුවට' : 'Return to Blog'}</span>
            </Link>
          </div>
        ) : (
          <article className="w-full">
            
            {/* Metadata Bar (Date, Reading Time, Author) */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 pb-3.5 mb-6 border-b border-gray-100 text-xs text-gray-500 font-medium">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{formattedDate}</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{readingTime}</span>
              </span>
              {blog.authorName && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-700 font-semibold whitespace-nowrap">{blog.authorName}</span>
                </>
              )}
            </div>

            {/* Article Content Container with Floated Featured Image */}
            <div className="w-full clearfix">
              {blog.image && (
                <div className="float-none md:float-left w-full md:w-[48%] lg:w-[46%] md:mr-8 lg:mr-10 mb-6">
                  <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative">
                    <img
                      src={blog.image}
                      alt={title}
                      className="w-full h-auto max-h-[520px] object-cover"
                    />
                    <div className="h-1 bg-[#15803d] w-full" />
                  </div>
                </div>
              )}

              {/* Rich Article Body Content: Automatically wraps around image! */}
              <div
                className="rich-content prose prose-emerald prose-base sm:prose-lg text-gray-800 leading-relaxed font-sans text-justify font-normal [&_p]:!w-auto [&_p]:!max-w-none"
                dangerouslySetInnerHTML={{
                  __html: contentHtml.replace(/&nbsp;|\u00a0/g, ' ')
                }}
              />
            </div>

            {/* Bottom Social Share Bar */}
            <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-gray-600">
                {isSinhala ? 'මෙම ලිපිය බෙදාගන්න:' : 'Share this story:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded text-xs font-bold transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded text-xs font-bold transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-bold transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  <span>{copied ? (isSinhala ? 'කොපි විය!' : 'Copied!') : (isSinhala ? 'ලින්ක් එක' : 'Copy Link')}</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <CommentSection
                targetId={blog.id}
                targetType="blogs"
                title={isSinhala ? 'ලිපි අදහස් හා සාකච්ඡා' : 'Blog Comments & Discussions'}
              />
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
