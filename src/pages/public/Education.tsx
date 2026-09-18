import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, BookOpen, DollarSign, Search, Filter, X, Sparkles, ChevronDown, Check, GraduationCap } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import Card from '../../components/ui/Card';
import Pagination from '../../components/admin/Pagination';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        gradientColor="#054a29"
      />

      {/* ── Main Content Container ── */}
      <div className="container mx-auto px-4 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left Sidebar: Qualification Levels Filter Dropdown ── */}
          <div className="w-full lg:w-1/4 shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24 space-y-5">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Filter size={20} className="text-green-600" />
                <span>{isSinhala ? 'සුදුසුකම් මට්ටම්' : 'Qualification Levels'}</span>
              </h3>

              {/* Custom Styled Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>{isSinhala ? 'මට්ටම තෝරන්න' : 'Select Level'}</span>
                  {selectedLevel !== 'All' && (
                    <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      {isSinhala ? 'තෝරා ඇත' : 'Active'}
                    </span>
                  )}
                </label>

                {/* Custom Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer shadow-xs ${
                    isDropdownOpen
                      ? 'border-green-600 ring-2 ring-green-500/20 bg-white'
                      : 'border-gray-200 hover:border-green-400 bg-gray-50/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      selectedLevel !== 'All' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'
                    }`}>
                      <GraduationCap size={15} />
                    </div>
                    <span className={`text-sm font-semibold truncate ${
                      selectedLevel !== 'All' ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {selectedLevel === 'All'
                        ? (isSinhala ? 'සියලුම පාඨමාලා' : 'All Courses')
                        : formatQualificationLevel(selectedLevel, isSinhala)}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180 text-green-600' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu Popover */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-2 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* All Option */}
                    <button
                      type="button"
                      onClick={() => {
                        handleLevelSelect('All');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all mb-1 ${
                        selectedLevel === 'All'
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-800'
                      }`}
                    >
                      <span>{isSinhala ? 'සියලුම පාඨමාලා' : 'All Courses'}</span>
                      {selectedLevel === 'All' && <Check size={16} className="shrink-0 text-white" />}
                    </button>

                    <div className="h-px bg-gray-100 my-1.5" />

                    {/* Qualification Level Items */}
                    <div className="space-y-1">
                      {QUALIFICATION_LEVELS.map((level) => {
                        const isSelected = selectedLevel === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => {
                              handleLevelSelect(level);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-all ${
                              isSelected
                                ? 'bg-green-600 text-white font-bold shadow-sm'
                                : 'text-gray-700 hover:bg-green-50 hover:text-green-800 font-medium'
                            }`}
                          >
                            <span className="leading-snug pr-2">{formatQualificationLevel(level, isSinhala)}</span>
                            {isSelected && <Check size={16} className="shrink-0 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {selectedLevel !== 'All' && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs">
                    <span className="text-gray-500 block mb-1 font-medium">
                      {isSinhala ? 'තෝරාගත් මට්ටම:' : 'Selected Level:'}
                    </span>
                    <span className="font-bold text-green-900 block leading-snug">
                      {formatQualificationLevel(selectedLevel, isSinhala)}
                    </span>
                  </div>
                  <button
                    onClick={handleClearFilter}
                    className="mt-3 w-full py-2.5 px-4 text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100/80 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X size={14} />
                    {isSinhala ? 'පෙරහන ඉවත් කරන්න' : 'Clear Filter'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Content Area ── */}
          <div className="w-full lg:w-3/4">

            {/* Top Search Bar */}
            <div className="mb-6 relative">
              <input
                type="text"
                placeholder={isSinhala ? 'පාඨමාලා සොයන්න...' : 'Search courses...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 shadow-sm transition-shadow bg-white text-sm sm:text-base"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X size={16} />
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
                {courses.map((course) => {
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
                    <Card
                      key={course.id}
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


