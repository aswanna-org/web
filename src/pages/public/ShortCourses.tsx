import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Clock, DollarSign, Search, X, Sparkles,
  ArrowLeft, MapPin, Calendar, RotateCcw
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import Card from '../../components/ui/Card';
import Pagination from '../../components/admin/Pagination';
import CustomDropdown from '../../components/ui/CustomDropdown';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import { getDistricts } from 'sl-gnd-dsd-districts';

interface ShortCourseSubjectItem {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  _count?: { shortCourses: number };
}

interface ShortCourseCenterItem {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  district?: string;
  _count?: { shortCourses: number };
}

interface ShortCourseTrainerItem {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
  positionSi?: string;
  positionEn?: string;
  _count?: { shortCourses: number };
}

interface ShortCourseListItem {
  id: string;
  slug: string;
  titleSi: string;
  titleEn: string;
  overviewSi?: string | null;
  overviewEn?: string | null;
  duration?: string | null;
  fee?: string | null;
  district?: string | null;
  schedule?: string | null;
  imageUrl?: string | null;
  closingDate?: string | null;
  expiryDate?: string | null;
  activeState: boolean;
  shortCourseSubject?: ShortCourseSubjectItem | null;
  shortCourseCenter?: ShortCourseCenterItem | null;
  shortCourseTrainer?: ShortCourseTrainerItem | null;
}

export const formatFee = (fee?: string | null, isSinhala = false): string => {
  if (!fee || !fee.trim() || fee === '0' || fee.toLowerCase() === 'free' || fee === 'නොමිලේ') {
    return isSinhala ? 'නොමිලේ' : 'Free';
  }
  const numeric = parseFloat(fee.replace(/[^0-9.]/g, ''));
  if (!isNaN(numeric) && numeric > 0) {
    return `Rs. ${numeric.toLocaleString()} LKR`;
  }
  return fee;
};

export const stripHtml = (html?: string | null): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

export const getDistrictLabel = (districtName?: string | null, isSinhala = false): string => {
  if (!districtName || !districtName.trim()) return '';
  try {
    const dList = getDistricts();
    const found = dList.find(
      (d) =>
        d.nameEn.toLowerCase() === districtName.trim().toLowerCase() ||
        d.nameSi === districtName.trim()
    );
    if (found) {
      return isSinhala ? found.nameSi : found.nameEn;
    }
  } catch {}
  return districtName.trim();
};

export const formatSchedule = (schedule?: string | null): string => {
  if (!schedule || !schedule.trim()) return '';
  const trimmed = schedule.trim();
  if (/^\d{4}-\d{2}-\d{2}(T[\d:.]*Z?)?$/.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }
  return trimmed;
};

export default function ShortCourses() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Filters state from URL or defaults
  const initialSubject = searchParams.get('subject') || 'all';
  const initialDistrict = searchParams.get('district') || 'all';
  const initialCenter = searchParams.get('center') || 'all';
  const initialTrainer = searchParams.get('trainer') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [selectedCenter, setSelectedCenter] = useState(initialCenter);
  const [selectedTrainer, setSelectedTrainer] = useState(initialTrainer);

  // Data state
  const [courses, setCourses] = useState<ShortCourseListItem[]>([]);
  const [subjects, setSubjects] = useState<ShortCourseSubjectItem[]>([]);
  const [centers, setCenters] = useState<ShortCourseCenterItem[]>([]);
  const [trainers, setTrainers] = useState<ShortCourseTrainerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sri Lanka districts list
  const districtOptions = useMemo(() => {
    try {
      const dList = getDistricts();
      return [
        { value: 'all', label: isSinhala ? 'සියලු දිස්ත්‍රික්ක' : 'All Districts' },
        ...dList.map((d) => ({
          value: d.nameEn,
          label: isSinhala ? d.nameSi : d.nameEn,
        })),
      ];
    } catch {
      return [{ value: 'all', label: isSinhala ? 'සියලු දිස්ත්‍රික්ක' : 'All Districts' }];
    }
  }, [isSinhala]);

  // Fetch Filter Master Data (Subjects, Centers, Trainers)
  useEffect(() => {
    // 1. Subjects
    fetch(`${API_BASE_URL}/short-courses/subjects?limit=100`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && Array.isArray(json.data)) setSubjects(json.data);
      })
      .catch((err) => console.error('Error fetching subjects:', err));

    // 2. Centers
    fetch(`${API_BASE_URL}/short-courses/centers?limit=100`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && Array.isArray(json.data)) setCenters(json.data);
      })
      .catch((err) => console.error('Error fetching centers:', err));

    // 3. Trainers
    fetch(`${API_BASE_URL}/short-courses/trainers?limit=100`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && Array.isArray(json.data)) setTrainers(json.data);
      })
      .catch((err) => console.error('Error fetching trainers:', err));
  }, [API_BASE_URL]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Synchronize filter changes with URL
  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (selectedSubject && selectedSubject !== 'all') {
      nextParams.set('subject', selectedSubject);
    }
    if (selectedDistrict && selectedDistrict !== 'all') {
      nextParams.set('district', selectedDistrict);
    }
    if (selectedCenter && selectedCenter !== 'all') {
      nextParams.set('center', selectedCenter);
    }
    if (selectedTrainer && selectedTrainer !== 'all') {
      nextParams.set('trainer', selectedTrainer);
    }
    if (debouncedSearch.trim()) {
      nextParams.set('search', debouncedSearch.trim());
    }
    setSearchParams(nextParams, { replace: true });
  }, [selectedSubject, selectedDistrict, selectedCenter, selectedTrainer, debouncedSearch, setSearchParams]);

  // Fetch Short Courses with all 4 filters + search
  useEffect(() => {
    const query = new URLSearchParams();
    query.set('page', String(currentPage));
    query.set('limit', '12');

    if (selectedSubject && selectedSubject !== 'all') {
      query.set('subject', selectedSubject);
    }
    if (selectedDistrict && selectedDistrict !== 'all') {
      query.set('district', selectedDistrict);
    }
    if (selectedCenter && selectedCenter !== 'all') {
      query.set('center', selectedCenter);
    }
    if (selectedTrainer && selectedTrainer !== 'all') {
      query.set('trainer', selectedTrainer);
    }
    if (debouncedSearch.trim()) {
      query.set('search', debouncedSearch.trim());
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/short-courses?${query.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch short courses');
        return res.json();
      })
      .then((json) => {
        if (json && Array.isArray(json.data)) {
          setCourses(json.data);
          setTotalCount(json.meta?.total || 0);
          setTotalPages(json.meta?.totalPages || 1);
        } else {
          setCourses([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      })
      .catch((err) => {
        console.error('Error fetching short courses:', err);
        setCourses([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    API_BASE_URL,
    currentPage,
    selectedSubject,
    selectedDistrict,
    selectedCenter,
    selectedTrainer,
    debouncedSearch,
  ]);

  // Dropdown Options
  const subjectOptions = useMemo(() => {
    return [
      { value: 'all', label: isSinhala ? 'සියලු විෂය ක්ෂේත්‍ර' : 'All Subjects' },
      ...subjects.map((s) => ({
        value: s.slug || s.id,
        label: isSinhala ? s.nameSi : s.nameEn,
        count: s._count?.shortCourses,
      })),
    ];
  }, [subjects, isSinhala]);

  const centerOptions = useMemo(() => {
    return [
      { value: 'all', label: isSinhala ? 'සියලු මධ්‍යස්ථාන' : 'All Centers' },
      ...centers.map((c) => ({
        value: c.slug || c.id,
        label: isSinhala ? c.nameSi : c.nameEn,
        count: c._count?.shortCourses,
      })),
    ];
  }, [centers, isSinhala]);

  const trainerOptions = useMemo(() => {
    return [
      { value: 'all', label: isSinhala ? 'සියලු පුහුණුකරුවන්' : 'All Trainers' },
      ...trainers.map((t) => ({
        value: t.slug || t.id,
        label: isSinhala ? t.nameSi : t.nameEn,
        count: t._count?.shortCourses,
      })),
    ];
  }, [trainers, isSinhala]);

  const handleClearFilters = () => {
    setSelectedSubject('all');
    setSelectedDistrict('all');
    setSelectedCenter('all');
    setSelectedTrainer('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedSubject !== 'all' ||
    selectedDistrict !== 'all' ||
    selectedCenter !== 'all' ||
    selectedTrainer !== 'all' ||
    Boolean(searchQuery.trim());

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-16">
      <SEO
        title={isSinhala ? 'කෙටිකාලීන හා ප්‍රායෝගික පුහුණු වැඩමුළු | Aswanna' : 'Short Courses & Practical Workshops | Aswanna'}
        description={
          isSinhala
            ? 'කෘෂිකාර්මික ක්ෂේත්‍රයේ ප්‍රායෝගික කුසලතා වර්ධනය, නවීන තාක්ෂණික දැනුම සහ ව්‍යවසායකත්ව කෙටිකාලීන පාඨමාලා.'
            : 'Explore practical agricultural workshops, vocational short courses, and farmer skill development programs in Sri Lanka.'
        }
        canonical="/short-courses"
        keywords={[
          'Short Courses',
          'Agri Workshops',
          'Agriculture Training',
          'Sri Lanka Agriculture Courses',
          'Aswanna Short Courses',
          'කෙටිකාලීන පාඨමාලා',
          'කෘෂි පුහුණු වැඩමුළු',
        ].join(', ')}
      />

      {/* Page Hero */}
      <PageHero
        title={isSinhala ? 'කෙටිකාලීන හා ප්‍රායෝගික පුහුණු' : 'SHORT COURSES & WORKSHOPS'}
        description={
          isSinhala
            ? 'කෘෂිකාර්මික ක්ෂේත්‍රයේ ප්‍රායෝගික කුසලතා, නවීන වගා ක්‍රමවේද සහ ව්‍යවසායකත්ව දැනුම ලබාදෙන කෙටිකාලීන වැඩසටහන්.'
            : 'Hands-on practical training workshops and short vocational courses designed for modern farmers, youth, and agri-entrepreneurs.'
        }
        image="https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=1600&q=80"
        gradientColor="#047857"
        icon={Clock}
        badgeBg="bg-emerald-600"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-2.5 sm:px-4 lg:px-12 py-6 sm:py-10">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/education')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isSinhala ? 'සියලු අධ්‍යාපන අංශ වෙත' : 'Back to Agro Education'}</span>
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-lg font-bold text-[#143d4d]">
                {isSinhala ? 'කෙටිකාලීන පාඨමාලා' : 'Short Courses'}
              </h2>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                {totalCount}
              </span>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-full border border-red-200/80 transition-all cursor-pointer shadow-2xs"
            >
              <X size={14} />
              <span>{isSinhala ? 'පෙරහන් ඉවත් කරන්න' : 'Clear Filters'}</span>
            </button>
          )}
        </div>

        {/* ── Seamless Filters Area (Unboxed, direct on page background, mobile responsive) ── */}
        <div className="space-y-3 mb-8">
          {/* Main Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-2.5 sm:gap-3">
            {/* 1. Search Bar */}
            <div className="sm:col-span-2 md:col-span-4 lg:col-span-4 relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={
                  isSinhala
                    ? 'පාඨමාලා නම, විෂය හෝ මධ්‍යස්ථානය සොයන්න...'
                    : 'Search course title, subject or center...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl sm:rounded-full border border-gray-200/90 bg-white hover:border-emerald-500/60 focus:border-[#006837] focus:ring-2 focus:ring-[#006837]/15 outline-none transition-all text-xs sm:text-sm text-gray-800 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 2. Subject Dropdown */}
            <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
              <CustomDropdown
                value={selectedSubject}
                onChange={(val) => {
                  setSelectedSubject(val);
                  setCurrentPage(1);
                }}
                options={subjectOptions}
                placeholder={isSinhala ? 'සියලු විෂය ක්ෂේත්‍ර' : 'All Subjects'}
              />
            </div>

            {/* 3. District Dropdown */}
            <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
              <CustomDropdown
                value={selectedDistrict}
                onChange={(val) => {
                  setSelectedDistrict(val);
                  setCurrentPage(1);
                }}
                options={districtOptions}
                placeholder={isSinhala ? 'සියලු දිස්ත්‍රික්ක' : 'All Districts'}
              />
            </div>

            {/* 4. Center Dropdown */}
            <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
              <CustomDropdown
                value={selectedCenter}
                onChange={(val) => {
                  setSelectedCenter(val);
                  setCurrentPage(1);
                }}
                options={centerOptions}
                placeholder={isSinhala ? 'සියලු මධ්‍යස්ථාන' : 'All Centers'}
              />
            </div>

            {/* 5. Trainer Dropdown */}
            <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
              <CustomDropdown
                value={selectedTrainer}
                onChange={(val) => {
                  setSelectedTrainer(val);
                  setCurrentPage(1);
                }}
                options={trainerOptions}
                placeholder={isSinhala ? 'සියලු පුහුණුකරුවන්' : 'All Trainers'}
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <AgroLoader
              message={
                isSinhala
                  ? 'කෙටිකාලීන පාඨමාලා තොරතුරු පූරණය වෙමින් පවතී...'
                  : 'Loading short courses & workshops...'
              }
            />
          </div>
        ) : courses.length === 0 ? (
          <div className="py-12 sm:py-16 text-center max-w-lg mx-auto space-y-4">
            {/* Signature animated AgroLoader */}
            <AgroLoader message="" className="scale-90 sm:scale-100" />
            <div className="space-y-1.5 pt-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {isSinhala ? 'පාඨමාලා හමු නොවීය' : 'No courses found'}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                {isSinhala
                  ? 'ඔබ සෙවූ නිර්ණායකවලට ගැළපෙන කෙටිකාලීන පාඨමාලා හෝ වැඩමුළු මේ මොහොතේ නොමැත. පෙරහන් ඉවත් කර හෝ වෙනත් සෙවුම් වචනයක් යොදා නැවත උත්සාහ කරන්න.'
                  : 'No short courses or practical workshops match your selected filters. Try clearing filters or using another keyword.'}
              </p>
            </div>
            {hasActiveFilters && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>{isSinhala ? 'සියලු පෙරහන් ඉවත් කරන්න' : 'Clear All Filters'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Grid: 2 cols on mobile, 3 on md, 4 on lg */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {courses.map((course, index) => {
                const courseTitle = isSinhala ? course.titleSi : (course.titleEn || course.titleSi);
                const subjectName = course.shortCourseSubject
                  ? (isSinhala ? course.shortCourseSubject.nameSi : course.shortCourseSubject.nameEn)
                  : '';
                const centerName = course.shortCourseCenter
                  ? (isSinhala ? course.shortCourseCenter.nameSi : course.shortCourseCenter.nameEn)
                  : '';
                const rawDistrict = course.district || course.shortCourseCenter?.district || '';
                const districtName = getDistrictLabel(rawDistrict, isSinhala);
                const subtitle =
                  centerName ||
                  (districtName
                    ? (isSinhala ? `${districtName} දිස්ත්‍රික්කය` : `${districtName} District`)
                    : '');
                const feeText = formatFee(course.fee, isSinhala);
                const durationText = course.duration || '';
                const scheduleText = formatSchedule(course.schedule);

                // Status Badge logic
                let topRightBadge = null;
                if (course.closingDate) {
                  const closingDateObj = new Date(course.closingDate);
                  const isPast = closingDateObj.getTime() < Date.now();
                  if (!isPast) {
                    topRightBadge = (
                      <div className="h-6 sm:h-7 inline-flex items-center gap-1 sm:gap-1.5 bg-amber-500/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 rounded-full shadow-xs border border-amber-300/40 max-w-full">
                        <Sparkles size={11} className="shrink-0 text-amber-100" />
                        <span className="truncate">{isSinhala ? 'අයදුම්පත් විවෘතයි' : 'Open for Application'}</span>
                      </div>
                    );
                  }
                }

                return (
                  <div
                    key={course.id}
                    style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                    className="animate-card-pop h-full"
                  >
                    <Card
                      to={`/short-courses/${course.slug || course.id}`}
                      image={course.imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=800&q=80'}
                      badge={subjectName}
                      topRightBadge={topRightBadge}
                      title={courseTitle}
                      subtitle={subtitle}
                      titleClassName="text-xs sm:text-base font-bold text-gray-900 leading-snug mb-1 line-clamp-2"
                      meta={[
                        { icon: DollarSign, text: feeText },
                        ...(durationText ? [{ icon: Clock, text: durationText }] : []),
                        ...(districtName ? [{ icon: MapPin, text: districtName }] : []),
                        ...(scheduleText ? [{ icon: Calendar, text: scheduleText }] : []),
                      ]}
                      primaryAction={{
                        text: isSinhala ? 'විස්තර බලන්න' : 'View Details',
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  pageSize={12}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
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
