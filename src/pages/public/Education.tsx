import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Clock, BookOpen, DollarSign, Search, X, Sparkles, GraduationCap,
  ArrowUpRight, ArrowLeft, FileText, Layers, Landmark
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import Card from '../../components/ui/Card';
import Pagination from '../../components/admin/Pagination';
import CustomDropdown from '../../components/ui/CustomDropdown';
import AgroLoader from '../../components/common/AgroLoader';
import { QUALIFICATION_LEVELS } from '../../data/educationData';
import { formatQualificationLevel, formatDurationUnit } from './EducationDetail';
import SEO from '../../components/common/SEO';

interface DBLevel {
  id: string;
  name: string;
  nameSi?: string;
  slug: string;
  levelCode?: string;
  levelOrder?: number;
}

interface EducationTypeData {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  nameTa?: string | null;
  description?: string | null;
  image?: string | null;
  iconClass?: string | null;
  order: number;
  isActive: boolean;
  coursesCount?: number;
  _count?: { courses: number };
}

// Reusable SVG for wavy card divider matching reference UI
const CardWaveDivider = () => (
  <svg
    className="absolute -bottom-1 left-0 right-0 w-full h-8 text-white fill-current pointer-events-none z-10 translate-y-0.5"
    viewBox="0 0 500 62"
    preserveAspectRatio="none"
  >
    <path d="M0,25 C150,55 350,0 500,25 L500,62 L0,62 Z" />
  </svg>
);

// Reusable stylized leaf watermark badge matching reference UI
const AswannaLeafBadge = () => (
  <div className="w-7 h-7 flex items-center justify-center text-emerald-500/80 group-hover:text-emerald-600 transition-colors shrink-0">
    <svg viewBox="0 0 32 32" className="w-7 h-7 fill-current">
      <path d="M16 28c0-7.7 6.3-14 14-14 0 7.7-6.3 14-14 14z" opacity="0.9" />
      <path d="M16 28C16 19.2 8.8 12 0 12c0 8.8 7.2 16 16 16z" opacity="0.6" />
      <path d="M16 28v-8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

// Icon resolver for Education Types
const getEducationIcon = (iconClass?: string | null, slug?: string) => {
  const str = (iconClass || slug || '').toLowerCase();
  if (str.includes('graduation') || str.includes('academic')) return GraduationCap;
  if (str.includes('clock') || str.includes('short') || str.includes('workshop')) return Clock;
  if (str.includes('file') || str.includes('research') || str.includes('paper')) return FileText;
  if (str.includes('book') || str.includes('publication') || str.includes('manual')) return BookOpen;
  if (str.includes('layer') || str.includes('learning') || str.includes('material') || str.includes('extension')) return Layers;
  if (str.includes('landmark') || str.includes('institute') || str.includes('institution')) return Landmark;
  return BookOpen;
};

export default function Education() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type');

  // Navigation State: null = Categories Overview (the 6 cards); string = inside category view (slug or id)
  const [activeTypeView, setActiveTypeView] = useState<string | null>(typeParam || null);

  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [educationTypes, setEducationTypes] = useState<EducationTypeData[]>([]);
  const [dbLevels, setDbLevels] = useState<DBLevel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Seeded defaults for the 6 types in case network call is loading
  const defaultTypes: EducationTypeData[] = useMemo(() => [
    {
      id: 'academic-courses',
      slug: 'academic-courses',
      nameSi: 'අධ්‍යයන පාඨමාලා',
      nameEn: 'Academic Courses',
      description: 'ඩිප්ලෝමා, උපාධි සහ පශ්චාත් උපාධි මට්ටමේ විධිමත් කෘෂිකාර්මික පාඨමාලා.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
      iconClass: 'GraduationCap',
      order: 1,
      isActive: true
    },
    {
      id: 'short-courses',
      slug: 'short-courses',
      nameSi: 'කෙටිකාලීන හා ප්‍රායෝගික පුහුණු',
      nameEn: 'Short Courses & Workshops',
      description: 'කෙටිකාලීන වෘත්තීය නිපුණතා, ප්‍රායෝගික වැඩමුළු සහ ක්ෂේත්‍ර පුහුණු වැඩසටහන්.',
      image: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=800&q=80',
      iconClass: 'Clock',
      order: 2,
      isActive: true
    },
    {
      id: 'research-papers',
      slug: 'research-papers',
      nameSi: 'පර්යේෂණ පත්‍රිකා',
      nameEn: 'Research Papers',
      description: 'කෘෂිකාර්මික පර්යේෂණ සොයාගැනීම්, විද්‍යාත්මක වාර්තා සහ විශ්ලේෂණ පත්‍රිකා.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
      iconClass: 'FileText',
      order: 3,
      isActive: true
    },
    {
      id: 'publications-manuals',
      slug: 'publications-manuals',
      nameSi: 'කෘෂි ප්‍රකාශන සහ අත්පොත්',
      nameEn: 'Publications & Manuals',
      description: 'ගොවි අත්පොත්, මාර්ගෝපදේශ සංග්‍රහ සහ කෘෂිකාර්මික තාක්ෂණික ප්‍රකාශන.',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      iconClass: 'BookOpen',
      order: 4,
      isActive: true
    },
    {
      id: 'learning-materials',
      slug: 'learning-materials',
      nameSi: 'කෘෂි ව්‍යාප්ති ඉගෙනුම් ද්‍රව්‍ය',
      nameEn: 'Agri Extension & Learning Materials',
      description: 'කෘෂි ව්‍යාප්ති ද්‍රව්‍ය, ශ්‍රව්‍ය දෘශ්‍ය ඉගෙනුම් මෙවලම් සහ පාඩම් මාලා.',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
      iconClass: 'Layers',
      order: 5,
      isActive: true
    },
    {
      id: 'educational-institutes',
      slug: 'educational-institutes',
      nameSi: 'කෘෂිකාර්මික අධ්‍යාපන ආයතන',
      nameEn: 'Agricultural Educational Institutes',
      description: 'ශ්‍රී ලංකාවේ පිළිගත් රජයේ හා පෞද්ගලික කෘෂිකාර්මික අධ්‍යාපන හා පුහුණු ආයතන නාමාවලිය.',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
      iconClass: 'Landmark',
      order: 6,
      isActive: true
    }
  ], []);

  // Fetch education types and qualification levels
  useEffect(() => {
    // Fetch Education Types
    fetch(`${API_BASE_URL}/courses/types`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEducationTypes(data);
        }
      })
      .catch(err => console.error('Failed to fetch education types:', err));

    // Fetch DB Qualification Levels
    fetch(`${API_BASE_URL}/courses/levels`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDbLevels(data);
        }
      })
      .catch(() => {});
  }, [API_BASE_URL]);

  const displayTypes = useMemo(() => {
    if (educationTypes.length > 0) {
      return educationTypes;
    }
    return defaultTypes;
  }, [educationTypes, defaultTypes]);

  // Synchronize URL param with state
  useEffect(() => {
    if (typeParam) {
      setActiveTypeView(typeParam);
    }
  }, [typeParam]);

  const qualificationOptions = useMemo(() => {
    if (dbLevels.length > 0) {
      return dbLevels.map(lvl => ({
        value: lvl.name,
        label: isSinhala && lvl.nameSi ? lvl.nameSi : formatQualificationLevel(lvl.name, isSinhala)
      }));
    }
    return QUALIFICATION_LEVELS.map(level => ({
      value: level,
      label: formatQualificationLevel(level, isSinhala)
    }));
  }, [dbLevels, isSinhala]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch courses when inside an education type or searching
  useEffect(() => {
    let url = `${API_BASE_URL}/courses?page=${currentPage}&limit=12`;
    if (activeTypeView && activeTypeView !== 'ALL') {
      url += `&educationTypeId=${encodeURIComponent(activeTypeView)}`;
    }
    if (selectedLevel !== 'All') {
      url += `&courseLevel=${encodeURIComponent(selectedLevel)}`;
    }
    if (debouncedSearch.trim()) {
      url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
    }

    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setCourses(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setTotalCount(data.meta.total || 0);
        } else {
          setTotalPages(1);
          setTotalCount(Array.isArray(data) ? data.length : 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching courses:', err);
        setLoading(false);
      });
  }, [API_BASE_URL, activeTypeView, selectedLevel, debouncedSearch, currentPage]);

  const handleSelectTypeCard = (typeItem: EducationTypeData) => {
    const selectedKey = typeItem.slug || typeItem.id;
    setActiveTypeView(selectedKey);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('type', selectedKey);
      return next;
    });
    setCurrentPage(1);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleBackToOverview = () => {
    setActiveTypeView(null);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('type');
      return next;
    });
    setSearchQuery('');
    setSelectedLevel('All');
    setCurrentPage(1);
    window.scrollTo({ top: 250, behavior: 'smooth' });
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setSelectedLevel('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Find currently active type object
  const activeTypeObj = useMemo(() => {
    if (!activeTypeView || activeTypeView === 'ALL') return null;
    return displayTypes.find(t => t.id === activeTypeView || t.slug === activeTypeView);
  }, [activeTypeView, displayTypes]);

  const activeCategoryTitle = useMemo(() => {
    if (!activeTypeView || activeTypeView === 'ALL') {
      return isSinhala ? 'සියලුම පාඨමාලා සහ සම්පත්' : 'All Courses & Resources';
    }
    if (activeTypeObj) {
      return isSinhala ? activeTypeObj.nameSi : activeTypeObj.nameEn;
    }
    return isSinhala ? 'අධ්‍යාපනික පාඨමාලා' : 'Agro Courses';
  }, [activeTypeView, activeTypeObj, isSinhala]);

  const pageKeywords = useMemo(() => {
    const list: string[] = [
      'Agri courses Sri Lanka',
      'Agriculture diploma',
      'කෘෂි පාඨමාලා',
      'farming education Sri Lanka',
      'NVQ agriculture courses',
      'Aswanna Agro Education'
    ];

    if (activeTypeObj) {
      list.push(activeTypeObj.nameEn, activeTypeObj.nameSi);
    }
    if (selectedLevel !== 'All') {
      list.push(selectedLevel);
    }
    if (debouncedSearch.trim()) {
      list.push(debouncedSearch.trim());
    }

    courses.forEach(c => {
      if (c.title) list.push(c.title);
      if (c.courseCode) list.push(c.courseCode);
      if (c.courseLevel) list.push(c.courseLevel);
      if (c.category?.categoryNameEn) list.push(c.category.categoryNameEn);
    });

    return Array.from(new Set(list.filter(Boolean))).slice(0, 30).join(', ');
  }, [courses, activeTypeObj, selectedLevel, debouncedSearch]);

  const pageTitle = debouncedSearch.trim()
    ? `${debouncedSearch.trim()} | කෘෂි අධ්‍යාපනය - Aswanna`
    : activeTypeObj
    ? `${isSinhala ? activeTypeObj.nameSi : activeTypeObj.nameEn} | Aswanna`
    : (isSinhala ? 'කෘෂි අධ්‍යාපනය හා පාඨමාලා | Agro Education' : 'Agro Education & Courses | Aswanna');

  const pageDesc = activeTypeObj?.description
    ? activeTypeObj.description
    : (isSinhala 
        ? 'නවීන කෘෂිකාර්මික කුසලතා, වෘත්තීය පුහුණු පාඨමාලා සහ ඩිප්ලෝමා තොරතුරු. Aswanna Agro Education.' 
        : 'Explore professional courses and vocational training designed to equip you with modern agricultural skills in Sri Lanka.');

  return (
    <div className="w-full min-h-screen bg-gray-50/50">
      <SEO 
        title={pageTitle}
        description={pageDesc}
        canonical={activeTypeView ? `/education?type=${encodeURIComponent(activeTypeView)}` : '/education'}
        keywords={pageKeywords}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": courses.slice(0, 10).map((c, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": c.title,
            "description": c.description || undefined
          }))
        }}
      />

      {/* ── Page Hero ── */}
      <PageHero
        title={t('educationPage.title', isSinhala ? 'කෘෂි අධ්‍යාපනය' : 'AGRO EDUCATION')}
        description={t('educationPage.desc', isSinhala ? 'නවීන කෘෂිකාර්මික කුසලතා සහ වෘත්තීය දැනුමෙන් ඔබව සන්නද්ධ කිරීම සඳහා වන පාඨමාලා ගවේෂණය කරන්න.' : 'Explore professional courses designed to equip you with modern agricultural skills.')}
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#4c1d95"
        icon={GraduationCap}
        badgeBg="bg-[#7c3aed]"
        waveColor="text-gray-50"
      />

      {/* ── Main Content Container ── */}
      <div className="container mx-auto px-2.5 sm:px-4 lg:px-12 py-6 sm:py-10">

        {/* VIEW 1: Categories Overview (The 6 Category Cards - 2 per row on mobile, 3 on desktop) */}
        {activeTypeView === null && !searchQuery.trim() ? (
          <div className="space-y-6">
            {/* Top Bar: Search Input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700" />
                <input
                  type="text"
                  placeholder={isSinhala ? 'පාඨමාලා හා අධ්‍යාපනික සම්පත් සොයන්න...' : 'Search courses & resources...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white hover:border-emerald-500 focus:border-[#006837] focus:ring-3 focus:ring-[#006837]/15 outline-none transition-all text-xs sm:text-sm text-gray-800 shadow-xs"
                />
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {isSinhala ? `ප්‍රධාන අංශ 6 කින් සමන්විතයි` : `6 Educational Categories`}
              </div>
            </div>

            {/* 6 Cards Grid: 2 cards per row on mobile, 4 cards per row on large screens */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {displayTypes.map((cat, idx) => {
                const IconComponent = getEducationIcon(cat.iconClass, cat.slug);
                const title = isSinhala ? cat.nameSi : cat.nameEn;
                const subtitle = isSinhala ? cat.nameEn : cat.nameSi;

                return (
                  <div
                    key={cat.id || cat.slug}
                    onClick={() => handleSelectTypeCard(cat)}
                    style={{ animationDelay: `${idx * 80}ms` }}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.05)] sm:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 cursor-pointer"
                  >
                    {/* Top Media Wrapper */}
                    <div className="relative">
                      {/* Image & Gradient */}
                      <div className="h-28 xs:h-32 sm:h-44 lg:h-48 w-full relative overflow-hidden bg-gray-100">
                        <img
                          src={cat.image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80'}
                          alt={title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      </div>

                      {/* Smooth Wave Divider */}
                      <CardWaveDivider />

                      {/* Floating Round Icon Badge */}
                      <div className="absolute -bottom-3.5 sm:-bottom-4 left-2.5 sm:left-5 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-[#006837] text-white flex items-center justify-center border-[2px] sm:border-[3px] border-white shadow-md sm:shadow-lg group-hover:scale-110 transition-transform">
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>

                    {/* Card Content Area */}
                    <div className="pt-4 sm:pt-6 px-2.5 sm:px-5 pb-2.5 sm:pb-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs sm:text-base lg:text-lg font-bold text-[#143d4d] leading-snug group-hover:text-[#006837] transition-colors mb-0.5 sm:mb-1.5 min-h-[1.8rem] sm:min-h-[2.8rem] line-clamp-2">
                          {title}
                        </h3>
                        {subtitle && (
                          <p className="text-[10px] sm:text-xs text-gray-400 font-sans font-medium line-clamp-1 mb-1 sm:mb-1.5">
                            {subtitle}
                          </p>
                        )}
                        {cat.description && (
                          <p className="hidden sm:line-clamp-2 text-xs text-gray-500 leading-relaxed mb-3">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      {/* Card Footer: Button & Leaf Watermark */}
                      <div className="flex items-center justify-between pt-2 sm:pt-2.5 border-t border-gray-50 mt-auto">
                        <button
                          type="button"
                          className="bg-[#006837] hover:bg-[#00532c] text-white text-[11px] sm:text-xs lg:text-sm font-semibold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 transition-all shadow-xs group-hover:shadow cursor-pointer"
                        >
                          <span>{isSinhala ? 'පිවිසෙන්න' : 'Explore'}</span>
                          <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>

                        <div className="hidden sm:block">
                          <AswannaLeafBadge />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* VIEW 2: Inside Education Type View (Courses & Resources inside the selected category) */
          <div>
            {/* Top Navigation & Filters: Back Button & Category Title on Left, Search & Qualification Filter on Right */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-5 border-b border-gray-200">
              {/* Left: Back Button & Title & Count */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <button
                  onClick={handleBackToOverview}
                  className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{isSinhala ? 'සියලු අංශ වෙත' : 'All Categories'}</span>
                </button>
                <div className="flex items-center gap-2 truncate">
                  <h2 className="text-base sm:text-2xl font-bold text-[#143d4d] truncate">
                    {activeCategoryTitle}
                  </h2>
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 sm:px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
                    {totalCount}
                  </span>
                </div>
              </div>

              {/* Right: Search & Qualification Filter */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0">
                {/* Search Bar */}
                <div className="relative w-full sm:w-60 lg:w-64 group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder={isSinhala ? 'පාඨමාලා සොයන්න...' : 'Search courses...'}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-9 py-2 sm:py-2.5 rounded-full border border-gray-200/90 bg-gray-50/70 hover:bg-white focus:bg-white hover:border-emerald-500/60 focus:border-[#006837] focus:ring-2 focus:ring-[#006837]/15 outline-none transition-all duration-200 text-xs sm:text-sm text-gray-800 shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Qualification Filter Dropdown */}
                <div className="w-full sm:w-52 lg:w-56 relative z-30">
                  <CustomDropdown
                    value={selectedLevel}
                    onChange={(val) => handleLevelSelect(val)}
                    options={[
                      { value: 'All', label: isSinhala ? 'සියලුම මට්ටම්' : 'All Levels' },
                      ...qualificationOptions
                    ]}
                  />
                </div>

                {/* Clear Filter Button */}
                {(selectedLevel !== 'All' || searchQuery) && (
                  <button
                    type="button"
                    onClick={handleClearFilter}
                    title={isSinhala ? 'පෙරහන් ඉවත් කරන්න' : 'Clear Filters'}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-full border border-emerald-200/80 transition-all cursor-pointer shrink-0 shadow-2xs"
                  >
                    <X size={14} />
                    <span className="hidden md:inline">{isSinhala ? 'පෙරහන් ඉවත් කරන්න' : 'Clear'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active filter badge if selectedLevel !== 'All' */}
            {selectedLevel !== 'All' && (
              <div className="flex items-center gap-2 mb-6 px-1">
                <span className="text-xs text-gray-500 font-medium">
                  {isSinhala ? 'තෝරාගත් මට්ටම:' : 'Selected Level:'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                  {formatQualificationLevel(selectedLevel, isSinhala)}
                  <button
                    type="button"
                    onClick={() => handleLevelSelect('All')}
                    className="text-emerald-700 hover:text-emerald-950 cursor-pointer ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              </div>
            )}

            {/* Courses Grid: 2 per row on mobile, 4 per row on desktop */}
            {loading ? (
              <div className="py-12 flex justify-center">
                <AgroLoader message={isSinhala ? 'පාඨමාලා තොරතුරු පූරණය වෙමින් පවතී...' : 'Loading courses...'} />
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  {isSinhala ? 'පාඨමාලා හමු නොවීය' : 'No courses found'}
                </h3>
                <p className="text-gray-500 mb-6 text-xs sm:text-sm">
                  {isSinhala
                    ? 'මෙම අංශය සඳහා හෝ පෙරහන් සඳහා දැනට පාඨමාලා නොමැත. ඉක්මනින් නව පාඨමාලා එක් කරනු ඇත.'
                    : 'No courses available in this category or matching filters at the moment.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleClearFilter}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  >
                    {isSinhala ? 'පෙරහන් ඉවත් කරන්න' : 'Clear Filters'}
                  </button>
                  <button
                    onClick={handleBackToOverview}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    {isSinhala ? 'සියලු අංශ වෙත' : 'Back to Categories'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {courses.map((course, index) => {
                  const categoryLabel = isSinhala
                    ? (course.category?.categoryNameSi || course.category?.categoryNameEn)
                    : (course.category?.categoryNameEn || course.category?.categoryNameSi);

                  const feeLabel = course.courseFee === 0
                    ? (isSinhala ? 'නොමිලේ' : 'Free')
                    : `Rs. ${Number(course.courseFee).toLocaleString()}`;

                  const durationLabel = course.durationValue
                    ? `${course.durationValue} ${formatDurationUnit(course.durationUnit, isSinhala)}`.trim()
                    : '';

                  return (
                    <div
                      key={course.id}
                      style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                      className="animate-card-pop h-full"
                    >
                      <Card
                        to={`/education/${course.slug || course.id}`}
                        image={course.bannerImageUrl || 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&q=80'}
                        badge={formatQualificationLevel(course.courseLevel, isSinhala)}
                        topRightBadge={course.applicationCalled ? (
                          <div className="h-6 sm:h-7 inline-flex items-center gap-1 sm:gap-1.5 bg-amber-500/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 rounded-full shadow-xs border border-amber-300/40 max-w-full">
                            <Sparkles size={11} className="shrink-0 text-amber-100" />
                            <span className="truncate">{isSinhala ? 'අයදුම්පත් කැඳවා ඇත' : 'Application Called'}</span>
                          </div>
                        ) : null}
                        title={course.title}
                        subtitle={categoryLabel}
                        titleClassName="text-xs sm:text-base font-bold text-gray-900 leading-snug mb-1 line-clamp-2"
                        meta={[
                          { icon: DollarSign, text: feeLabel },
                          ...(durationLabel ? [{ icon: Clock, text: durationLabel }] : [])
                        ]}
                        primaryAction={{
                          text: isSinhala ? 'විස්තර බලන්න' : 'View Details',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}


            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
