import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, ArrowLeft, Search, X, FileText,
  Eye, User, RotateCcw
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import Pagination from '../../components/admin/Pagination';
import CustomDropdown from '../../components/ui/CustomDropdown';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';

const BookFlipPdfReader = lazy(() => import('../../components/common/BookFlipPdfReader'));

interface PublicSubject {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
}

interface PublicPublication {
  id: string;
  slug: string;
  titleSi: string;
  titleEn: string;
  typeSi?: string | null;
  typeEn?: string | null;
  publisherSi?: string | null;
  publisherEn?: string | null;
  authorSi?: string | null;
  authorEn?: string | null;
  subjectId?: string | null;
  subject?: PublicSubject | null;
  subjectSi?: string | null;
  subjectEn?: string | null;
  pdfUrl?: string | null;
  thumbnail?: string | null;
  activeState: boolean;
  publishedState: boolean;
  createdAt: string;
}

export default function PublicationsManuals() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Filters from URL query params
  const initialSearch = searchParams.get('search') || '';
  const initialType = searchParams.get('type') || 'all';
  const initialSubject = searchParams.get('subject') || 'all';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Data states
  const [publications, setPublications] = useState<PublicPublication[]>([]);
  const [subjects, setSubjects] = useState<PublicSubject[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // PDF Popup Modal state
  const [viewingPdfPub, setViewingPdfPub] = useState<PublicPublication | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync state to URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedType !== 'all') params.type = selectedType;
    if (selectedSubject !== 'all') params.subject = selectedSubject;
    if (currentPage > 1) params.page = String(currentPage);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedType, selectedSubject, currentPage, setSearchParams]);

  // Fetch subjects for filter
  useEffect(() => {
    fetch(`${API_BASE_URL}/publications-handbooks/subjects?activeState=true`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSubjects(data);
        }
      })
      .catch(err => {
        console.error('Error fetching publication subjects:', err);
      });
  }, [API_BASE_URL]);

  // Fetch publications
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', String(currentPage));
    params.append('limit', '12');
    if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
    if (selectedType !== 'all') params.append('type', selectedType);
    if (selectedSubject !== 'all') params.append('subjectId', selectedSubject);

    fetch(`${API_BASE_URL}/publications-handbooks?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.data)) {
          setPublications(data.data);
          setTotalPages(data.meta?.totalPages || 1);
          setTotalCount(data.meta?.total || data.data.length);
        } else if (data && Array.isArray(data.items)) {
          setPublications(data.items);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.total || data.items.length);
        } else if (Array.isArray(data)) {
          setPublications(data);
          setTotalPages(1);
          setTotalCount(data.length);
        } else {
          setPublications([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      })
      .catch(err => {
        console.error('Error fetching publications:', err);
        setPublications([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API_BASE_URL, currentPage, debouncedSearch, selectedType, selectedSubject]);

  // Filter options for dropdowns
  const typeOptions = useMemo(() => [
    { value: 'all', label: isSinhala ? 'සියලු වර්ග (All Types)' : 'All Types' },
    { value: 'Publication', label: isSinhala ? 'ප්‍රකාශන (Publications)' : 'Publications' },
    { value: 'Handbook', label: isSinhala ? 'අත්පොත් (Handbooks)' : 'Handbooks' },
  ], [isSinhala]);

  const subjectOptions = useMemo(() => [
    { value: 'all', label: isSinhala ? 'සියලු විෂය ක්ෂේත්‍ර (All Subjects)' : 'All Subjects' },
    ...subjects.map(s => ({
      value: s.id,
      label: isSinhala ? `${s.nameSi} (${s.nameEn})` : s.nameEn,
    })),
  ], [subjects, isSinhala]);

  const hasActiveFilters = Boolean(
    debouncedSearch.trim() || selectedType !== 'all' || selectedSubject !== 'all'
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedType('all');
    setSelectedSubject('all');
    setCurrentPage(1);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-16">
      <SEO
        title={isSinhala ? 'කෘෂි ප්‍රකාශන සහ අත්පොත් | Aswanna' : 'Publications & Manuals | Aswanna'}
        description={
          isSinhala
            ? 'ගොවි අත්පොත්, තාක්ෂණික මාර්ගෝපදේශ සංග්‍රහ සහ නිල කෘෂිකාර්මික ප්‍රකාශන කියවන්න හා බාගත කරන්න.'
            : 'Explore official farmer handbooks, crop protection manuals, and agricultural technical guides.'
        }
        canonical="/publications-manuals"
      />

      <PageHero
        title={isSinhala ? 'කෘෂි ප්‍රකාශන සහ අත්පොත්' : 'PUBLICATIONS & MANUALS'}
        description={
          isSinhala
            ? 'ගොවි අත්පොත්, තාක්ෂණික මාර්ගෝපදේශ සංග්‍රහ සහ නිල කෘෂිකාර්මික ප්‍රකාශන නොමිලේ කියවන්න සහ බාගත කරන්න.'
            : 'Download official farmer handbooks, crop protection guides, technical standards, and field reference manuals.'
        }
        image="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&q=80"
        gradientColor="#854d0e"
        icon={BookOpen}
        badgeBg="bg-amber-600"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 py-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4">
          <button
            onClick={() => navigate('/education')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border-0 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isSinhala ? 'සියලු අධ්‍යාපන අංශ වෙත' : 'Back to Agro Education'}</span>
          </button>

          <span className="text-xs font-semibold text-gray-500 hidden sm:inline-block">
            {isSinhala ? `ප්‍රකාශන ${totalCount} ක් හමු විය` : `${totalCount} publications available`}
          </span>
        </div>

        {/* ── Filters Section ── */}
        <div className="space-y-3 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-2 lg:col-span-6 relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={
                  isSinhala
                    ? 'ප්‍රකාශන නම, කතුවරයා හෝ මාතෘකාව සොයන්න...'
                    : 'Search publication title, author, publisher...'
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl sm:rounded-full border-0 bg-white shadow-xs focus:ring-2 focus:ring-emerald-700/20 outline-none transition-all text-xs sm:text-sm text-gray-800"
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

            {/* Type Dropdown */}
            <div className="sm:col-span-1 lg:col-span-3">
              <CustomDropdown
                value={selectedType}
                onChange={val => {
                  setSelectedType(val);
                  setCurrentPage(1);
                }}
                options={typeOptions}
                placeholder={isSinhala ? 'සියලු වර්ග' : 'All Types'}
              />
            </div>

            {/* Subject Dropdown */}
            <div className="sm:col-span-1 lg:col-span-3">
              <CustomDropdown
                value={selectedSubject}
                onChange={val => {
                  setSelectedSubject(val);
                  setCurrentPage(1);
                }}
                options={subjectOptions}
                placeholder={isSinhala ? 'සියලු විෂය ක්ෂේත්‍ර' : 'All Subjects'}
              />
            </div>
          </div>


        </div>

        {/* ── Content Section ── */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <AgroLoader
              message={
                isSinhala
                  ? 'කෘෂි ප්‍රකාශන සහ අත්පොත් තොරතුරු පූරණය වෙමින් පවතී...'
                  : 'Loading agricultural publications & manuals...'
              }
            />
          </div>
        ) : publications.length === 0 ? (
          <div className="py-12 sm:py-16 text-center max-w-lg mx-auto space-y-4">
            {/* Signature animated AgroLoader */}
            <AgroLoader message="" className="scale-90 sm:scale-100" />
            <div className="space-y-1.5 pt-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {isSinhala ? 'ප්‍රකාශන හමු නොවීය' : 'No publications found'}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                {isSinhala
                  ? 'ඔබ සෙවූ නිර්ණායකවලට ගැළපෙන ප්‍රකාශන හෝ අත්පොත් මේ මොහොතේ නොමැත. වෙනත් සෙවුම් වචනයක් යොදා බලන්න.'
                  : 'No agricultural publications match your selected filter criteria. Try clearing filters or using another keyword.'}
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
            {/* Direct Thumbnail Cards Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {publications.map((pub, index) => {
                const pubTitle = isSinhala ? pub.titleSi : (pub.titleEn || pub.titleSi);
                const pubAuthor = isSinhala
                  ? (pub.authorSi || pub.authorEn || '')
                  : (pub.authorEn || pub.authorSi || '');
                return (
                  <div
                    key={pub.id}
                    style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                    onClick={() => {
                      if (pub.pdfUrl) {
                        setViewingPdfPub(pub);
                      }
                    }}
                    className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-0 bg-gray-900 aspect-[3/4.2] flex flex-col justify-between ${
                      pub.pdfUrl ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {/* Full Background Thumbnail Image */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      {pub.thumbnail ? (
                        <img
                          src={pub.thumbnail}
                          alt={pub.titleEn}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 flex items-center justify-center p-4 sm:p-6 text-center">
                          <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-white/20" />
                        </div>
                      )}

                      {/* Dark Gradient Overlay for optimal text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 group-hover:from-black/95 group-hover:via-black/50 transition-colors" />
                    </div>

                    {/* Top Overlay: PDF Document Indicator (Glassmorphic) */}
                    {pub.pdfUrl && (
                      <div className="relative z-10 p-2 sm:p-3.5 flex justify-end">
                        <div
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-md border-0 flex items-center justify-center text-white shrink-0 group-hover:bg-white/30 transition-all duration-300 shadow-md"
                          title="PDF Document"
                        >
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-xs" />
                        </div>
                      </div>
                    )}

                    {/* Center Hover Quick Indicator - Borderless Transparent Glassy Look with White Eye Icon */}
                    <div className="relative z-10 my-auto flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 pointer-events-none">
                      {pub.pdfUrl ? (
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/25 backdrop-blur-xl border-0 flex items-center justify-center text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] group-hover:bg-white/35 transition-all duration-300">
                          <Eye className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md text-white" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-md border-0 flex items-center justify-center text-white/70 shadow-lg">
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      )}
                    </div>

                    {/* Bottom Overlay: Title & Author Directly on Thumbnail (Clean White Text) */}
                    <div className="relative z-10 p-2.5 sm:p-4 space-y-1 sm:space-y-1.5">
                      <div>
                        {/* PDF Name / Title */}
                        <h3 className="text-white font-extrabold text-[11px] sm:text-base leading-snug line-clamp-2 drop-shadow-md">
                          {pubTitle}
                        </h3>
                        {isSinhala && pub.titleEn && pub.titleEn !== pub.titleSi && (
                          <p className="text-white/80 text-[9px] sm:text-xs truncate font-medium mt-0.5 drop-shadow-xs">
                            {pub.titleEn}
                          </p>
                        )}
                      </div>

                      {/* Author */}
                      {pubAuthor && (
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-white/90 truncate font-medium drop-shadow-xs">
                          <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 text-white/80" />
                          <span className="truncate">{pubAuthor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={page => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PDF POPUP MODAL (Book Flip Viewer) ── */}
      {viewingPdfPub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-2 md:p-3 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-stone-950 rounded-xl sm:rounded-2xl w-[98vw] max-w-[1600px] h-[97vh] shadow-2xl border border-stone-800/80 overflow-hidden flex flex-col">
            {viewingPdfPub.pdfUrl ? (
              <Suspense
                fallback={
                  <div className="h-full flex flex-col items-center justify-center bg-stone-900 gap-3 text-stone-300">
                    <AgroLoader />
                    <span className="text-xs text-stone-400">පොත සූදානම් වෙමින් පවතී...</span>
                  </div>
                }
              >
                <BookFlipPdfReader
                  pdfUrl={viewingPdfPub.pdfUrl}
                  title={isSinhala ? viewingPdfPub.titleSi : viewingPdfPub.titleEn}
                  author={viewingPdfPub.authorEn || viewingPdfPub.authorSi || undefined}
                  onClose={() => setViewingPdfPub(null)}
                  allowDownload={true}
                />
              </Suspense>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center bg-stone-900 text-stone-300">
                <div className="max-w-md space-y-4">
                  <FileText size={48} className="mx-auto text-stone-500" />
                  <h4 className="text-base font-bold text-stone-100">
                    {isSinhala ? 'PDF ලේඛනයක් නොමැත' : 'No PDF Document Attached'}
                  </h4>
                  <p className="text-xs text-stone-400">
                    {isSinhala
                      ? 'මෙම ප්‍රකාශනය සඳහා ඩිජිටල් PDF ගොනුවක් උඩුගත කර නොමැත.'
                      : 'This publication currently has no digital PDF document uploaded.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewingPdfPub(null)}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {isSinhala ? 'වසන්න (Close)' : 'Close'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
