import { useState } from 'react';
import { NEWS_ARTICLES } from '../../data/newsData';
import { Share2, Clock, User } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';


export default function News() {
  const { t } = useTranslation();
  const [selectedNewsId, setSelectedNewsId] = useState(NEWS_ARTICLES[0].id);

  const selectedNews = NEWS_ARTICLES.find((n) => n.id === selectedNewsId) || NEWS_ARTICLES[0];

  return (
    <div className="w-full min-h-screen bg-gray-50">

      {/* ── Page Hero ── */}
      <PageHero
        title={t('newsPage.title', 'NEWS')}
        subtitle={t('newsPage.subtitle', 'LATEST UPDATES')}
        description={t('newsPage.desc')}
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#28b41bff"
      />

      {/* ── Content ── */}
      <div className="container mx-auto px-4 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left Column: News List (approx 1/3 width) */}
          <div className="w-full lg:w-1/3 flex flex-col">
            <div className="flex items-center gap-6 border-b border-gray-200 mb-6 pb-2">
              <h2 className="text-xl font-bold text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary)] pb-2 -mb-[10px]">
                Latest
              </h2>
              <h2 className="text-xl font-bold text-gray-400 pb-2 cursor-pointer hover:text-gray-600 transition-colors">
                Popular
              </h2>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto max-h-[800px] pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {NEWS_ARTICLES.map((news) => (
                <div
                  key={news.id}
                  onClick={() => setSelectedNewsId(news.id)}
                  className={`flex gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 ${selectedNewsId === news.id
                      ? 'bg-white shadow-md border border-[var(--color-secondary)]/20'
                      : 'hover:bg-white hover:shadow-sm border border-transparent'
                    }`}
                >
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                    <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {news.date}
                      </p>
                      <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${selectedNewsId === news.id ? 'text-[var(--color-secondary)]' : 'text-gray-800'
                        }`}>
                        {news.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-gray-500">{news.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: News Details (approx 2/3 width) */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12">

            {/* Author and Share Row */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">By <span className="font-bold text-gray-800">{selectedNews.author}</span></p>
                  <p className="text-xs text-gray-400">{selectedNews.date}</p>
                </div>
                <div className="hidden sm:flex gap-2 ml-6">
                  {selectedNews.category.map((cat, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-600">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white rounded-full text-sm font-bold transition-colors shadow-sm">
                Share <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-8">
              {selectedNews.title}
            </h1>

            {/* Main Image */}
            <div className="w-full h-[400px] rounded-xl overflow-hidden mb-10 shadow-sm">
              <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none prose-p:text-gray-600 prose-p:leading-relaxed">
              {selectedNews.content.map((paragraph, index) => (
                <p key={index} className="mb-6">{paragraph}</p>
              ))}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
