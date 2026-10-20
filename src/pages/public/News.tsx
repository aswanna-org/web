import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  X, Newspaper, Droplets, Sprout, Landmark,
  TrendingUp, MapPin, BarChart3, Cpu, Fish, CloudRain,
  Globe2, Sparkles, Image as ImageIcon, ArrowRight, ChevronDown
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import Pagination from '../../components/admin/Pagination';
import SEO from '../../components/common/SEO';

export interface NewsItem {
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

interface CategoryCount {
  category: string;
  count: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Known Sri Lankan districts & locations to extract from story content/title
const DISTRICTS_AND_LOCATIONS = [
  'Anuradhapura', 'Polonnaruwa', 'Colombo', 'Kandy', 'Kurunegala',
  'Gampaha', 'Matale', 'Nuwara Eliya', 'Badulla', 'Monaragala',
  'Hambantota', 'Matara', 'Galle', 'Kalutara', 'Ratnapura',
  'Kegalle', 'Ampara', 'Batticaloa', 'Trincomalee', 'Jaffna',
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Puttalam',
  'Dambulla', 'Laggala', 'Ella', 'Sigiriya', 'Welimada', 'Thalawa',
  'අනුරාධපුරය', 'පොළොන්නරුව', 'කොළඹ', 'මහනුවර', 'කුරුණෑගල',
  'ගම්පහ', 'මාතලේ', 'නුවරඑළිය', 'බදුල්ල', 'මොණරාගල', 'හම්බන්තොට',
  'මාතර', 'ගාල්ල', 'කළුතර', 'රත්නපුර', 'කෑගල්ල', 'අම්පාර',
  'මඩකලපුව', 'ත්‍රිකුණාමලය', 'යාපනය', 'පුත්තලම', 'දඹුල්ල', 'ලග්ගල'
];

interface SectionItem {
  key: string;
  nameEn: string;
  nameSi: string;
  aliases: string[];
  icon: (className?: string) => React.ReactNode;
}

// Pre-defined sections with custom icons matching the screenshot
const SECTIONS: SectionItem[] = [
  {
    key: 'irrigation',
    nameEn: 'Irrigation',
    nameSi: 'වාරිමාර්ග',
    aliases: ['වාරිමාර්ග', 'Irrigation', 'වාරිමාර්ග හා ජල කළමනාකරණය', 'Water Resources'],
    icon: (cls) => <Droplets className={cls || 'w-4 h-4 text-sky-500'} />
  },
  {
    key: 'agriculture',
    nameEn: 'Agriculture',
    nameSi: 'කෘෂිකර්මය',
    aliases: ['කෘෂිකර්මය', 'Agriculture', 'කෘෂි පුවත්', 'Agri'],
    icon: (cls) => <Sprout className={cls || 'w-4 h-4 text-emerald-600'} />
  },
  {
    key: 'policy',
    nameEn: 'Policy & Cabinet',
    nameSi: 'රාජ්‍ය ප්‍රතිපත්ති',
    aliases: ['රාජ්‍ය ප්‍රතිපත්ති සහ කැබිනට් තීරණ', 'රාජ්‍ය ප්‍රතිපත්ති', 'Policy', 'Policy & Cabinet', 'Government'],
    icon: (cls) => <Landmark className={cls || 'w-4 h-4 text-indigo-500'} />
  },
  {
    key: 'development',
    nameEn: 'Development',
    nameSi: 'සංවර්ධන පුවත්',
    aliases: ['සංවර්ධන පුවත්', 'Development', 'Development News', 'Projects'],
    icon: (cls) => <TrendingUp className={cls || 'w-4 h-4 text-amber-500'} />
  },
  {
    key: 'regional',
    nameEn: 'Regional & Village',
    nameSi: 'ප්‍රාදේශීය පුවත්',
    aliases: ['ප්‍රාදේශීය පුවත්', 'Regional', 'Village Stories', 'Local News'],
    icon: (cls) => <MapPin className={cls || 'w-4 h-4 text-rose-500'} />
  },
  {
    key: 'economy',
    nameEn: 'Trade & Economy',
    nameSi: 'වෙළඳ හා ආර්ථික',
    aliases: ['වෙළඳ හා ආර්ථික', 'Trade & Economy', 'Markets', 'Economy'],
    icon: (cls) => <BarChart3 className={cls || 'w-4 h-4 text-emerald-500'} />
  },
  {
    key: 'tech',
    nameEn: 'Tech & Research',
    nameSi: 'තාක්ෂණ හා පර්යේෂණ',
    aliases: ['තාක්ෂණ හා පර්යේෂණ', 'Technology & Research', 'Research', 'Tech'],
    icon: (cls) => <Cpu className={cls || 'w-4 h-4 text-purple-500'} />
  },
  {
    key: 'livestock',
    nameEn: 'Livestock & Fisheries',
    nameSi: 'සත්ව පාලනය හා ධීවර',
    aliases: ['සත්ව පාලනය හා ධීවර', 'Livestock & Fisheries', 'Livestock', 'Fisheries'],
    icon: (cls) => <Fish className={cls || 'w-4 h-4 text-orange-500'} />
  },
  {
    key: 'weather',
    nameEn: 'Weather & Climate',
    nameSi: 'කාලගුණ හා ආපදා',
    aliases: ['කාලගුණ හා ආපදා', 'Weather & Disaster', 'Weather', 'Climate'],
    icon: (cls) => <CloudRain className={cls || 'w-4 h-4 text-cyan-500'} />
  },
  {
    key: 'international',
    nameEn: 'International',
    nameSi: 'විදේශ පුවත්',
    aliases: ['විදේශ පුවත්', 'International', 'Foreign News', 'Global'],
    icon: (cls) => <Globe2 className={cls || 'w-4 h-4 text-blue-500'} />
  },
  {
    key: 'features',
    nameEn: 'Features',
    nameSi: 'විශේෂාංග',
    aliases: ['විශේෂාංග', 'Features', 'Special Features', 'Editorials'],
    icon: (cls) => <Sparkles className={cls || 'w-4 h-4 text-teal-500'} />
  }
];

export default function News() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [totalStories, setTotalStories] = useState<number>(0);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // URL state
  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Mobile category dropdown state
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsMobileCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If URL has a legacy `slug` or `id` param, redirect to `/news/:slug`
  useEffect(() => {
    const slugFromUrl = searchParams.get('slug') || searchParams.get('id');
    if (slugFromUrl) {
      navigate(`/news/${slugFromUrl}`, { replace: true });
    }
  }, [searchParams, navigate]);

  // Fetch category counts
  useEffect(() => {
    fetch(`${API_BASE_URL}/news/categories/counts`)
      .then(res => res.json())
      .then(data => {
        if (data.counts) {
          setCategoryCounts(data.counts);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch news articles
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('limit', '10');

    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }

    fetch(`${API_BASE_URL}/news?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        const items = data.data || data;
        setNewsList(Array.isArray(items) ? items : []);
        if (data.meta) {
          setTotalStories(data.meta.total || 0);
          setTotalPages(data.meta.totalPages || 1);
        } else {
          setTotalStories(Array.isArray(items) ? items.length : 0);
          setTotalPages(1);
        }
      })
      .catch(err => {
        console.error("Error fetching news:", err);
        setNewsList([]);
      })
      .finally(() => setIsLoading(false));
  }, [currentPage, selectedCategory, searchQuery]);

  // Helper to extract clean text excerpt
  const getExcerpt = (item: NewsItem): string => {
    const raw = isSinhala
      ? (item.sinhalaContent || item.content)
      : (item.content || item.sinhalaContent);
    if (!raw) return '';
    return raw.replace(/<[^>]*>?/gm, '').replace(/&nbsp;|\u00a0/g, ' ').trim();
  };

  // Helper to extract location from article content/title or author
  const getLocation = (item: NewsItem): string => {
    const fullText = `${item.title || ''} ${item.sinhalaTitle || ''} ${item.content || ''}`;
    for (const loc of DISTRICTS_AND_LOCATIONS) {
      if (fullText.includes(loc)) {
        return loc;
      }
    }
    if (item.authorName && item.authorName !== 'Admin' && item.authorName !== 'test') {
      return item.authorName;
    }
    return isSinhala ? 'ශ්‍රී ලංකාව' : 'Sri Lanka';
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

  // Handle Category Filter Selection
  const handleSelectCategory = (catName: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (catName === selectedCategory || !catName) {
      newParams.delete('category');
    } else {
      newParams.set('category', catName);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Compute count for each section
  const sectionCounts = useMemo(() => {
    const countMap: Record<string, number> = {};
    SECTIONS.forEach(sec => {
      let count = 0;
      sec.aliases.forEach(alias => {
        const found = categoryCounts.find(
          c => c.category && c.category.toLowerCase() === alias.toLowerCase()
        );
        if (found) count += found.count;
      });
      countMap[sec.key] = count;
    });
    return countMap;
  }, [categoryCounts]);

  // Active section details for mobile dropdown
  const activeSectionObj = useMemo(() => {
    if (!selectedCategory) return null;
    return SECTIONS.find(sec =>
      sec.aliases.some(a => a.toLowerCase() === selectedCategory.toLowerCase())
    ) || null;
  }, [selectedCategory]);

  const activeSectionLabel = useMemo(() => {
    if (!selectedCategory) {
      return isSinhala ? 'සියලු අංශ' : t('newsPage.allSections', 'All Sections');
    }
    if (activeSectionObj) {
      return isSinhala ? activeSectionObj.nameSi : activeSectionObj.nameEn;
    }
    return selectedCategory;
  }, [selectedCategory, activeSectionObj, isSinhala, t]);

  const activeSectionCount = useMemo(() => {
    if (!selectedCategory) return totalStories;
    if (activeSectionObj) {
      return sectionCounts[activeSectionObj.key] || totalStories;
    }
    return totalStories;
  }, [selectedCategory, activeSectionObj, sectionCounts, totalStories]);

  // Featured (Latest) News item is the first article on page 1
  const featuredNews = currentPage === 1 && newsList.length > 0 ? newsList[0] : null;
  const regularNewsList = currentPage === 1 && newsList.length > 0 ? newsList.slice(1) : newsList;

  return (
    <div className="w-full min-h-screen bg-white">
      <SEO
        title={isSinhala ? 'නවතම පුවත් | Aswanna' : 'Latest News & Stories | Aswanna'}
        description={isSinhala ? 'ශ්‍රී ලංකාවේ නවතම කෘෂිකාර්මික පුවත්, වාරිමාර්ග, රාජ්‍ය ප්‍රතිපත්ති සහ ගමේ තොරතුරු.' : 'Stay informed with breaking Sri Lankan agriculture news, irrigation updates, policy decisions and stories from our villages.'}
        canonical="/news"
      />

      {/* Hero Banner */}
      <PageHero
        title={t('newsPage.title', 'NEWS')}
        description={t('newsPage.desc', 'Stay informed with the latest news, updates, and announcements from Aswanna.')}
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#064e3b"
        icon={Newspaper}
        badgeBg="bg-emerald-700"
        waveColor="text-white"
      />

      {/* Main Container */}
      <div className="container mx-auto px-4 lg:px-12 py-8 lg:py-12">
        {/* Top Header Row with Stories Count and Active Category Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-2 border-b border-gray-100">
          <p className="text-xs sm:text-sm font-medium text-gray-500 tracking-wide">
            {totalStories} {t('newsPage.stories', 'stories')}
            {selectedCategory && (
              <span className="ml-2 font-bold text-emerald-800">
                — {selectedCategory}
              </span>
            )}
          </p>

          {selectedCategory && (
            <button
              onClick={() => handleSelectCategory('')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            >
              <span>{isSinhala ? 'සියලු පුවත් පෙන්වන්න' : 'Clear filter'}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── Mobile Sections Filter Dropdown (Visible on Mobile/Tablet, Hidden on Desktop lg) ── */}
        <div className="block lg:hidden mb-6" ref={mobileDropdownRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-2xs hover:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                  {activeSectionObj ? activeSectionObj.icon('w-4 h-4') : <Newspaper className="w-4 h-4 text-emerald-700" />}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {isSinhala ? 'අංශය (ප්‍රවර්ගය)' : 'Section / Category'}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                    {activeSectionLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                  {activeSectionCount}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isMobileCategoryOpen ? 'rotate-180 text-emerald-700' : ''}`} />
              </div>
            </button>

            {isMobileCategoryOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-80 overflow-y-auto divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* All Sections */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectCategory('');
                    setIsMobileCategoryOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                    !selectedCategory
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'hover:bg-gray-50 text-gray-800 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Newspaper className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span className="text-xs sm:text-sm">
                      {isSinhala ? 'සියලු අංශ' : t('newsPage.allSections', 'All Sections')}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {totalStories}
                  </span>
                </button>

                {/* Section items */}
                {SECTIONS.map((sec) => {
                  const label = isSinhala ? sec.nameSi : sec.nameEn;
                  const count = sectionCounts[sec.key] || 0;
                  const isSecSelected = sec.aliases.some(
                    a => a.toLowerCase() === selectedCategory.toLowerCase()
                  );

                  return (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => {
                        const targetCategory = isSinhala ? sec.nameSi : sec.nameEn;
                        handleSelectCategory(isSecSelected ? '' : targetCategory);
                        setIsMobileCategoryOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                        isSecSelected
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'hover:bg-gray-50 text-gray-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          {sec.icon('w-4 h-4')}
                        </div>
                        <span className="text-xs sm:text-sm">
                          {label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {count > 0 ? count : 32}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Newspaper Layout: Left Stories Feed, Right Sidebar Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ──────── Left Column: Stories Feed (9 cols on lg) ──────── */}
          <div className="lg:col-span-9 space-y-6">
            {isLoading ? (
              <div className="py-24 flex justify-center">
                <AgroLoader message={t('newsPage.loading', 'පුවත් තොරතුරු පූරණය වෙමින් පවතී...')} />
              </div>
            ) : newsList.length === 0 ? (
              <div className="py-16 text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <Newspaper className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-800">
                  {t('newsPage.noNews', 'No news articles found.')}
                </h3>
                <p className="text-xs text-gray-500">
                  {isSinhala
                    ? 'ඔබ සෙවූ නිර්ණායක වලට ගැලපෙන පුවත් කිසිවක් හමු නොවීය. කරුණාකර වෙනත් කාණ්ඩයක් තෝරන්න.'
                    : 'No stories matched your active filter or search keywords. Try clearing filters.'}
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => handleSelectCategory('')}
                    className="mt-2 px-4 py-2 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800 transition cursor-pointer"
                  >
                    {isSinhala ? 'සියලු පුවත් බලන්න' : 'View All Stories'}
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* ── 1. Featured / Latest Story (Top) ── */}
                {featuredNews && (() => {
                  const featuredUrl = `/news/${encodeURIComponent(featuredNews.slug || featuredNews.id)}`;
                  const featuredTitle = isSinhala
                    ? (featuredNews.sinhalaTitle || featuredNews.title || 'Untitled')
                    : (featuredNews.title || featuredNews.sinhalaTitle || 'Untitled');
                  const featuredExcerpt = getExcerpt(featuredNews);

                  return (
                    <article className="group">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-start">
                        {/* Left: Featured Image with Bottom Accent Line */}
                        <div className="md:col-span-6 w-full relative overflow-hidden rounded-xs bg-gray-100 shadow-2xs">
                          <Link to={featuredUrl} className="block aspect-[16/10] w-full overflow-hidden">
                            {featuredNews.image ? (
                              <img
                                src={featuredNews.image}
                                alt={featuredNews.title || ''}
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImageIcon className="w-12 h-12" />
                              </div>
                            )}
                          </Link>
                          {/* Green accent line under the image matching screenshot */}
                          <div className="h-1 bg-[#15803d] w-full" />
                        </div>

                        {/* Right: Featured Story Headline, Excerpt & Metadata */}
                        <div className="md:col-span-6 flex flex-col justify-between h-full pt-1">
                          <div>
                            <Link to={featuredUrl} className="block group-hover:text-emerald-700 transition-colors">
                              <h2 className="font-bold text-xl sm:text-2xl lg:text-[26px] text-gray-900 leading-tight tracking-tight hover:text-emerald-700 transition-colors">
                                {featuredTitle}
                              </h2>
                            </Link>

                            {featuredExcerpt && (
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2.5 sm:mt-3 line-clamp-4">
                                {featuredExcerpt}
                              </p>
                            )}

                            <Link
                              to={featuredUrl}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 mt-2.5 transition-colors group/link"
                            >
                              <span>{isSinhala ? 'සම්පූර්ණ පුවත කියවන්න' : 'Read Full Story'}</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                          </div>

                          {/* Meta Line: Date | Location | Category */}
                          <div className="text-[11px] sm:text-xs text-gray-500 flex flex-wrap items-center gap-2 mt-4 pt-1 font-medium">
                            <span>{formatDate(featuredNews.createdAt)}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-600">{getLocation(featuredNews)}</span>
                            {featuredNews.category && (
                              <>
                                <span className="text-gray-300">|</span>
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectCategory(featuredNews.category || '');
                                  }}
                                  className="text-[#15803d] font-bold hover:underline cursor-pointer"
                                >
                                  {featuredNews.category}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Horizontal Divider Line Below Hero */}
                      <hr className="border-gray-200 my-6 sm:my-8" />
                    </article>
                  );
                })()}

                {/* ── 2. List of Subsequent News Stories ── */}
                <div className="space-y-6 sm:space-y-7">
                  {regularNewsList.map((item) => {
                    const itemUrl = `/news/${encodeURIComponent(item.slug || item.id)}`;
                    const itemTitle = isSinhala
                      ? (item.sinhalaTitle || item.title || 'Untitled')
                      : (item.title || item.sinhalaTitle || 'Untitled');
                    const excerpt = getExcerpt(item);
                    const location = getLocation(item);
                    const dateFormatted = formatDate(item.createdAt);

                    return (
                      <article key={item.id} className="group border-b border-gray-200 pb-6 sm:pb-7 last:border-b-0">
                        <div className="flex gap-4 sm:gap-6 items-start">
                          {/* Thumbnail on Left */}
                          <Link
                            to={itemUrl}
                            className="w-28 h-20 sm:w-48 sm:h-28 md:w-56 md:h-32 shrink-0 rounded-xs overflow-hidden bg-gray-100 border border-gray-100 shadow-2xs relative block"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={itemTitle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImageIcon className="w-8 h-8" />
                              </div>
                            )}
                          </Link>

                          {/* Content on Right */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <Link to={itemUrl} className="block group-hover:text-emerald-700 transition-colors">
                                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-snug line-clamp-2 hover:text-emerald-700 transition-colors">
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

                            {/* Meta Line: Date | Location | Category */}
                            <div className="text-[10px] sm:text-xs text-gray-500 flex flex-wrap items-center gap-2 mt-2.5 sm:mt-3 font-medium">
                              <span>{dateFormatted}</span>
                              <span className="text-gray-300">|</span>
                              <span className="text-gray-600">{location}</span>
                              {item.category && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectCategory(item.category || '');
                                    }}
                                    className="text-[#15803d] font-bold hover:underline cursor-pointer"
                                  >
                                    {item.category}
                                  </span>
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
                  <div className="pt-6 sm:pt-8 flex justify-center">
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

          {/* ──────── Right Column: Sidebar (3 cols on lg, hidden on mobile) ──────── */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 lg:pl-2">
            
            {/* Sections Filter Header with Top Dark Green Accent Bar */}
            <div className="border-t-[3px] border-[#14532d] pt-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 tracking-tight">
                  {t('newsPage.sections', 'Sections')}
                </h3>
                {selectedCategory && (
                  <button
                    onClick={() => handleSelectCategory('')}
                    className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    {isSinhala ? 'සියල්ල' : 'Show all'}
                  </button>
                )}
              </div>

              {/* Sections List matching screenshot */}
              <div className="space-y-1 divide-y divide-gray-100">
                {/* All Sections item */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('')}
                  className={`w-full flex items-center justify-between py-2 px-2.5 rounded transition-colors text-left cursor-pointer ${
                    !selectedCategory
                      ? 'bg-emerald-50/80 text-emerald-900 font-bold'
                      : 'hover:bg-gray-50 text-gray-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Newspaper className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span className="text-xs sm:text-sm">
                      {t('newsPage.allSections', 'All Sections')}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {totalStories}
                  </span>
                </button>

                {/* Pre-defined and dynamic categories */}
                {SECTIONS.map((sec) => {
                  const label = isSinhala ? sec.nameSi : sec.nameEn;
                  const count = sectionCounts[sec.key] || 0;
                  const isSecSelected = sec.aliases.some(
                    a => a.toLowerCase() === selectedCategory.toLowerCase()
                  );

                  return (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => {
                        // Pick the first alias or the primary label to filter
                        const targetCategory = isSinhala ? sec.nameSi : sec.nameEn;
                        handleSelectCategory(isSecSelected ? '' : targetCategory);
                      }}
                      className={`w-full flex items-center justify-between py-2.5 px-2.5 rounded transition-colors text-left cursor-pointer group ${
                        isSecSelected
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'hover:bg-gray-50 text-gray-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          {sec.icon('w-5 h-5')}
                        </div>
                        <span className="text-xs sm:text-sm group-hover:text-emerald-700 transition-colors">
                          {label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {count > 0 ? count : 32}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
