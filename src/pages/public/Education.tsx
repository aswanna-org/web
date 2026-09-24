import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, BookOpen, DollarSign, Search, X, Sparkles, GraduationCap } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import Card from '../../components/ui/Card';
import Pagination from '../../components/admin/Pagination';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { QUALIFICATION_LEVELS } from '../../data/educationData';
import { formatQualificationLevel, formatDurationUnit } from './EducationDetail';

export default function Education() {
  const { t, i18n } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Fetch Courses filtered by courseLevel and search
    let url = `${API_BASE_URL}/courses?page=${currentPage}&limit=12`;
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
  }, [API_BASE_URL, selectedLevel, debouncedSearch, currentPage]);

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setSelectedLevel('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50">
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
      <div className="container mx-auto px-4 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left Sidebar: Qualification Levels Filter Dropdown ── */}
          <div className="w-full lg:w-1/4 shrink-0 relative z-30">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24 space-y-5">
              <h3 className="text-lg font-bold text-gray-800 pb-4 border-b border-gray-100">
                {isSinhala ? 'සුදුසුකම් මට්ටම්' : 'Qualification Levels'}
              </h3>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  {isSinhala ? 'මට්ටම තෝරන්න' : 'Select Level'}
                </label>
                <CustomDropdown
                  value={selectedLevel}
                  onChange={(val) => handleLevelSelect(val)}
                  options={[
                    { value: 'All', label: isSinhala ? 'සියලුම පාඨමාලා' : 'All Courses' },
                    ...QUALIFICATION_LEVELS.map((level) => ({
                      value: level,
                      label: formatQualificationLevel(level, isSinhala),
                    }))
                  ]}
                />
              </div>

              {(selectedLevel !== 'All' || searchQuery) && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="w-full py-2.5 text-emerald-700 font-medium hover:bg-emerald-50 rounded-xl transition-colors text-xs sm:text-sm border border-emerald-100 cursor-pointer"
                >
                  {isSinhala ? 'පෙරහන් ඉවත් කරන්න' : 'Clear Filters'}
                </button>
              )}
            </div>
          </div>

          {/* ── Right Content Area ── */}
          <div className="w-full lg:w-3/4">

            {/* Top Search Bar */}
            <div className="mb-6 relative group">
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
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-full border border-gray-200/90 bg-gray-50/70 hover:bg-white focus:bg-white hover:border-emerald-500/60 focus:border-[#006837] focus:ring-3 focus:ring-[#006837]/15 outline-none transition-all duration-200 text-xs sm:text-sm text-gray-800 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results count & Active filter tag */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-1 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>
                  {isSinhala ? 'මුළු පාඨමාලා ගණන:' : 'Total courses:'}
                </span>
                <span className="font-bold text-gray-900 bg-white px-2.5 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                  {totalCount}
                </span>
                {selectedLevel !== 'All' && (
                  <span className="text-green-700 font-medium">
                    • {formatQualificationLevel(selectedLevel, isSinhala)}
                  </span>
                )}
              </div>

              {(selectedLevel !== 'All' || searchQuery) && (
                <button
                  onClick={handleClearFilter}
                  className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-semibold underline underline-offset-2"
                >
                  <X size={14} />
                  {isSinhala ? 'පෙරහන් ඉවත් කරන්න' : 'Clear filters'}
                </button>
              )}
            </div>

            {/* Courses Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  {isSinhala ? 'පාඨමාලා හමු නොවීය' : 'No courses found'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isSinhala
                    ? 'තෝරාගත් සුදුසුකම් මට්ටම හෝ සෙවුම සඳහා පාඨමාලා කිසිවක් නැත.'
                    : 'Try adjusting your search or qualification level filter.'}
                </p>
                <button
                  onClick={handleClearFilter}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  {isSinhala ? 'සියලුම පාඨමාලා බලන්න' : 'View All Courses'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                          <div className="h-7 inline-flex items-center gap-1.5 bg-amber-500/85 backdrop-blur-md text-white text-xs font-bold px-3 rounded-full shadow-xs border border-amber-300/40 max-w-full">
                            <Sparkles size={12} className="shrink-0 text-amber-100" />
                            <span className="truncate">{isSinhala ? 'අයදුම්පත් කැඳවා ඇත' : 'Application Called'}</span>
                          </div>
                        ) : null}
                        title={course.title}
                        subtitle={categoryLabel}
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
        </div>
      </div>
    </div>
  );
}


