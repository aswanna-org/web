import { useState, useEffect } from 'react';
import { Share2, Clock, User, Image as ImageIcon } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';

interface BlogItem {
  id: string;
  title: string;
  sinhalaTitle: string | null;
  slug: string;
  content: string;
  sinhalaContent: string | null;
  image: string | null;
  authorName: string;
  authorEmail: string | null;
  authorAvatar: string | null;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Blog() {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [blogList, setBlogList] = useState<BlogItem[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/blogs`)
      .then(res => res.json())
      .then(data => {
        const items = data.data || data;
        setBlogList(items);
        if (items.length > 0) {
          setSelectedBlogId(items[0].id);
        }
      })
      .catch(err => console.error("Error fetching blogs:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const selectedBlog = blogList.find((n) => n.id === selectedBlogId) || blogList[0];

  return (
    <div className="w-full min-h-screen bg-gray-50">

      {/* ── Page Hero ── */}
      <PageHero
        title={t('blogPage.title', 'BLOG')}
        description={t('blogPage.desc', 'Read our latest articles, farming guides, and insights from industry experts.')}
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#28b41bff"
      />

      {/* ── Content ── */}
      <div className="container mx-auto px-4 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left Column: Blog List (approx 1/3 width) */}
          <div className="w-full lg:w-1/3 flex flex-col">
            <div className="flex items-center gap-6 border-b border-gray-200 mb-6 pb-2">
              <h2 className="text-xl font-bold text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)] pb-2 -mb-[10px]">
                {t('blogPage.latestPosts', 'Latest Posts')}
              </h2>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto max-h-[800px] pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {isLoading ? (
                <div className="p-10 text-center text-gray-500">{t('blogPage.loading', 'Loading posts...')}</div>
              ) : blogList.length === 0 ? (
                <div className="p-10 text-center text-gray-500">{t('blogPage.noPosts', 'No blog posts found.')}</div>
              ) : (
                blogList.map((blog) => (
                  <div
                    key={blog.id}
                    onClick={() => setSelectedBlogId(blog.id)}
                    className={`flex gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 ${selectedBlogId === blog.id
                      ? 'bg-white shadow-md border border-[var(--color-secondary)]/20'
                      : 'hover:bg-white hover:shadow-sm border border-transparent'
                      }`}
                  >
                    <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                      {blog.image ? (
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(blog.createdAt).toLocaleDateString()}
                        </p>
                        <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${selectedBlogId === blog.id ? 'text-[var(--color-secondary)]' : 'text-gray-800'
                          }`}>
                          {isSinhala ? (blog.sinhalaTitle || blog.title) : blog.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-gray-500">{blog.authorName}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Blog Details (approx 2/3 width) */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12 min-h-[500px]">
            {selectedBlog ? (
              <>
                {/* Author and Share Row */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                      {selectedBlog.authorAvatar ? (
                        <img src={selectedBlog.authorAvatar} alt={selectedBlog.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('blogPage.by', 'By')} <span className="font-bold text-gray-800">{selectedBlog.authorName}</span></p>
                      <p className="text-xs text-gray-400">{new Date(selectedBlog.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white rounded-full text-sm font-bold transition-colors shadow-sm">
                    {t('blogPage.share', 'Share')} <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-8">
                  {isSinhala ? (selectedBlog.sinhalaTitle || selectedBlog.title) : selectedBlog.title}
                </h1>

                {/* Main Image */}
                {selectedBlog.image && (
                  <div className="w-full h-[400px] rounded-xl overflow-hidden mb-10 shadow-sm">
                    <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Content */}
                <div
                  className="prose prose-lg max-w-none break-words"
                  dangerouslySetInnerHTML={{ __html: isSinhala ? (selectedBlog.sinhalaContent || selectedBlog.content) : selectedBlog.content }}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 font-medium">
                {t('blogPage.selectToRead', 'Select a post to read')}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
