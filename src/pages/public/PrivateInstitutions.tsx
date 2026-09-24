import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Building2,
  X,
  Info,
  Globe
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import Pagination from '../../components/admin/Pagination';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { type AgriInstitution } from '../../data/agriInstitutionsData';

const CLOUD_PALETTE = [
  { fill: '#e2f5dc' }, // 1. Soft Leaf Green
  { fill: '#fff1d6' }, // 2. Warm Peach
  { fill: '#daf0fc' }, // 3. Sky Blue
  { fill: '#f0def8' }, // 4. Soft Lavender
  { fill: '#fde2e6' }, // 5. Soft Rose Pink
  { fill: '#fde8d4' }, // 6. Soft Apricot Orange
  { fill: '#eef8ce' }, // 7. Fresh Lime
  { fill: '#d5f3ed' }, // 8. Mint Aqua
  { fill: '#fce4ec' }, // 9. Blush Rose
  { fill: '#e8f5e9' }, // 10. Pale Meadow Green
  { fill: '#ede7f6' }, // 11. Pale Lilac
  { fill: '#e0f7fa' }, // 12. Soft Cyan Ice
  { fill: '#fff8e1' }, // 13. Pale Amber Cream
  { fill: '#fbe9e7' }, // 14. Soft Coral Mist
  { fill: '#f3e5f5' }, // 15. Light Heather Purple
  { fill: '#e8eaf6' }, // 16. Periwinkle Mist
  { fill: '#e0f2f1' }, // 17. Seafoam Mint
  { fill: '#f9fbe7' }, // 18. Pale Chartreuse
  { fill: '#fff3e0' }, // 19. Honey Peach
  { fill: '#f1f8e9' }, // 20. Spring Sprout Green
  { fill: '#e1f5fe' }, // 21. Glacier Blue
  { fill: '#ffe0b2' }, // 22. Golden Wheat
  { fill: '#dcedc8' }, // 23. Pistachio Green
  { fill: '#f8bbd0' }, // 24. Cherry Blossom Pink
  { fill: '#e1bee7' }, // 25. Orchid Tint
  { fill: '#d5f3ed' }, // 6. Mint Aqua
  { fill: '#fde8d4' }, // 7. Soft Apricot Orange
  { fill: '#ede7f6' }, // 8. Pale Lilac
  { fill: '#e0f7fa' }, // 9. Soft Cyan Ice
  { fill: '#fff8e1' }, // 10. Pale Amber Cream
  { fill: '#e8f5e9' }, // 11. Pale Meadow Green
  { fill: '#e1f5fe' }, // 12. Glacier Blue
];

const CLOUD_PATHS = [
  "M 25,90 C 5,90 2,65 18,48 C 30,30 55,34 70,22 C 86,5 122,5 142,18 C 162,28 175,38 186,50 C 200,64 198,90 182,108 C 166,126 142,130 124,136 C 96,146 64,142 45,126 C 28,112 25,98 25,90 Z",
  "M 20,82 C 2,82 0,55 16,38 C 30,22 58,26 72,16 C 90,4 128,4 146,18 C 164,30 178,36 190,52 C 202,68 198,95 180,114 C 162,130 138,132 120,138 C 96,148 62,145 42,126 C 24,108 20,92 20,82 Z",
  "M 28,95 C 6,95 2,68 18,50 C 32,32 58,38 72,25 C 90,8 126,6 146,18 C 166,28 180,44 192,54 C 206,70 202,98 184,116 C 166,132 142,134 122,140 C 94,150 64,144 46,128 C 30,114 26,102 28,95 Z",
  "M 22,86 C 4,86 0,60 16,42 C 32,24 60,30 74,18 C 92,4 130,4 148,18 C 166,30 182,40 192,58 C 204,78 198,104 178,122 C 158,134 134,134 116,140 C 90,150 60,144 42,124 C 26,106 22,94 22,86 Z",
];

function CloudBackground({ index }: { index: number }) {
  const color = CLOUD_PALETTE[index % CLOUD_PALETTE.length];
  const path = CLOUD_PATHS[index % CLOUD_PATHS.length];

  return (
    <svg
      viewBox="0 0 200 150"
      className="absolute inset-0 w-full h-full -z-0 transition-transform duration-300 group-hover:scale-105 pointer-events-none"
      preserveAspectRatio="none"
    >
      <path d={path} fill={color.fill} />
    </svg>
  );
}

function PrivateBadgeLogo({ institution, index }: { institution: AgriInstitution; index: number }) {
  if (institution.logoUrl) {
    return (
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shadow-md border-2 border-white bg-white group-hover:scale-110 transition-transform duration-300 p-2 overflow-hidden">
        <img
          src={institution.logoUrl}
          alt={institution.nameEn || institution.nameSi}
          className="w-full h-full object-contain rounded-xl"
        />
      </div>
    );
  }

  const badgeColor = ['#0e7490', '#0369a1', '#1d4ed8', '#1e40af', '#0284c7'][index % 5];

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shadow-md border-2 border-white bg-white/90 group-hover:scale-110 transition-transform duration-300">
      <div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex flex-col items-center justify-center p-2 text-white shadow-inner relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${badgeColor}, #0f172a)` }}
      >
        <div className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none"></div>
        <div className="mb-0.5 opacity-90">
          <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-center leading-tight line-clamp-1 drop-shadow-sm px-1">
          {institution.shortName}
        </span>
      </div>
    </div>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PAGE_SIZE = 12;

export default function PrivateInstitutions() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isSinhala = i18n.language === 'si';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDetail, setSelectedDetail] = useState<AgriInstitution | null>(null);

  const [institutions, setInstitutions] = useState<AgriInstitution[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch private institutions from API with pagination, category filter & search
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const catParam = selectedCategory !== 'all' ? `&categoryKey=${encodeURIComponent(selectedCategory)}` : '';
    const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : '';
    const queryUrl = `${API_BASE_URL}/institutions/pvt?page=${currentPage}&limit=${PAGE_SIZE}${catParam}${searchParam}`;

    fetch(queryUrl)
      .then((res) => {
        if (!res.ok) throw new Error('API fetch failed');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          const items = data.data || data;
          if (Array.isArray(items)) {
            setInstitutions(items);
            if (data.meta) {
              setTotalPages(data.meta.totalPages || 1);
              setTotalCount(data.meta.total || 0);
            } else {
              setTotalPages(1);
              setTotalCount(items.length);
            }
          } else {
            throw new Error('Unexpected data format');
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch private institutions from API:', err);
        if (isMounted) {
          setInstitutions([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, selectedCategory, searchQuery]);

  const categoryFilters = [
    { key: 'all', labelSi: 'සියල්ල', labelEn: 'All Agribusinesses' },
    { key: 'inputs', labelSi: 'කෘෂි යෙදවුම් හා තාක්ෂණ', labelEn: 'Inputs & Technology' },
    { key: 'seeds', labelSi: 'බීජ සහ රෝපණ ද්‍රව්‍ය', labelEn: 'Seeds & Planting Materials' },
    { key: 'fertilizer', labelSi: 'පොහොර සහ ශාක පෝෂණය', labelEn: 'Fertilizers & Nutrition' },
    { key: 'machinery', labelSi: 'යන්ත්‍රෝපකරණ', labelEn: 'Agri Machinery' }
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const element = document.getElementById('private-institutions-grid-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const pageTitle = isSinhala ? 'පුද්ගලික ආයතන තොරතුරු කේන්ද්‍රය' : 'PRIVATE AGRIBUSINESS DIRECTORY';
  const pageSubtitle = isSinhala
    ? 'ශ්‍රී ලංකාවේ ලියාපදිංචි කෘෂි යෙදවුම්, බීජ, පොහොර, යන්ත්‍රෝපකරණ සහ තාක්ෂණික විසඳුම් සපයන ප්‍රමුඛ පෙළේ සමාගම්.'
    : 'Verified directory of private agribusiness companies providing seeds, fertilizer, machinery, greenhouses, and precision tools.';

  const handleCardClick = (item: any) => {
    const slug = item.slug || item.id;
    navigate(`/agri-info-hub/institutions/${slug}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#fbfdfa] font-roboto">
      {/* ── Page Hero ── */}
      <PageHero
        title={pageTitle}
        description={pageSubtitle}
        image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80"
        gradientColor="#034e7b"
        icon={Building2}
        badgeBg="bg-[#0284c7]"
        waveColor="text-[#fbfdfa]"
      />

      {/* ── Search & Filter Controls (Sleek, Modern, Right-Aligned) ── */}
      <section className="w-full py-4 sm:py-6 bg-white border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="container mx-auto px-4 lg:px-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3.5">
          {/* Category Dropdown */}
          <div className="w-full sm:w-64 md:w-72">
            <CustomDropdown
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setCurrentPage(1);
              }}
              options={categoryFilters.map((cat) => ({
                value: cat.key,
                label: isSinhala ? cat.labelSi : cat.labelEn,
              }))}
            />
          </div>

          {/* Search Input Box */}
          <div className="relative w-full sm:w-72 md:w-80 group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                isSinhala
                  ? 'නම, සමාගම හෝ සේවාව සොයන්න...'
                  : 'Search company, seed brand, service...'
              }
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-full border border-gray-200/90 bg-gray-50/70 hover:bg-white focus:bg-white hover:border-emerald-500/60 focus:border-[#006837] focus:ring-3 focus:ring-[#006837]/15 outline-none transition-all duration-200 text-xs sm:text-sm text-gray-800 shadow-xs"
            />
            {searchQuery && (
              <button
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
        </div>
      </section>

      {/* ── Main Institution Item Cards Grid ── */}
      <section id="private-institutions-grid-section" className="w-full py-12">
        <div className="container mx-auto px-4 lg:px-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
            </div>
          ) : institutions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {isSinhala ? 'ආයතනයක් හමු නොවීය' : 'No agribusinesses found'}
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                {isSinhala
                  ? 'ඔබගේ සෙවුම් පදය වෙනස් කර නැවත උත්සාහ කරන්න.'
                  : 'Please check your search keyword or clear active category filters.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setCurrentPage(1);
                }}
                className="px-6 py-2.5 bg-[#006837]/15 hover:bg-[#006837]/25 text-[#006837] border border-[#006837]/30 backdrop-blur-md rounded-full font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                {isSinhala ? 'සියලු ආයතන පෙන්වන්න' : 'Show All Agribusinesses'}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                {institutions.map((item, index) => {
                  const title = isSinhala ? item.nameSi : item.nameEn;
                  const subtitle = isSinhala ? item.nameEn : item.nameSi;
                  const categoryBadge = isSinhala ? item.categorySi : item.categoryEn;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleCardClick(item)}
                      style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                      className="animate-card-pop group relative flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-left"
                      title={isSinhala ? `${title} තොරතුරු බලන්න` : `View ${title} Details`}
                    >
                      {/* Top: Logo on Organic Cloud Background */}
                      <div className="w-full aspect-square max-w-[135px] sm:max-w-[150px] flex items-center justify-center relative">
                        <CloudBackground index={index} />
                        <PrivateBadgeLogo institution={item} index={index} />
                      </div>

                      {/* Category Pill */}
                      <div className="w-full flex items-center justify-center gap-1 mt-2">
                        <span className="inline-block bg-[#006837]/10 text-[#006837] text-[9.5px] font-extrabold px-2 py-0.5 rounded-full truncate max-w-[120px]">
                          {categoryBadge}
                        </span>
                      </div>

                      {/* Middle: Title */}
                      <div className="w-full text-center my-1.5 px-1 flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                          {title}
                        </h3>
                        <p className="text-[10.5px] text-gray-400 font-medium line-clamp-1 mt-0.5">
                          {subtitle}
                        </p>
                      </div>

                      {/* Bottom Action */}
                      <div className="w-full pt-1.5 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetail(item);
                          }}
                          className="text-[10px] font-bold text-gray-600 hover:text-[#006837] bg-gray-100/70 hover:bg-emerald-50/80 border border-gray-200/60 hover:border-emerald-300/60 backdrop-blur-xs px-2.5 py-1 rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                          title={isSinhala ? 'තොරතුරු බලන්න' : 'View Contact Details'}
                        >
                          <Info className="w-3 h-3" />
                          <span>{isSinhala ? 'තොරතුරු' : 'Details'}</span>
                        </button>

                        <a
                          href={item.website || '#'}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600/15 hover:bg-emerald-600 text-[#006837] hover:text-white border border-emerald-600/25 backdrop-blur-md flex items-center justify-center shadow-2xs hover:shadow-md hover:scale-110 transition-all duration-300"
                          title={isSinhala ? 'නිල වෙබ් අඩවියට පිවිසෙන්න' : 'Open Official Website'}
                        >
                          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 pt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalCount}
                    pageSize={PAGE_SIZE}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Contact Details Modal ── */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[28px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
            <div className="bg-gradient-to-r from-[#0f4d30] to-[#186a43] p-6 text-white flex items-start justify-between relative">
              <div className="flex items-center gap-4">
                <PrivateBadgeLogo institution={selectedDetail} index={0} />
                <div>
                  <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
                    {isSinhala ? selectedDetail.categorySi : selectedDetail.categoryEn}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold leading-snug">
                    {isSinhala ? selectedDetail.nameSi : selectedDetail.nameEn}
                  </h3>
                  <p className="text-xs text-white/80 font-medium">
                    {isSinhala ? selectedDetail.nameEn : selectedDetail.nameSi}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetail(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 text-white border border-white/30 backdrop-blur-md flex items-center justify-center transition-all shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-sm text-gray-700">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {isSinhala ? 'ආයතන විස්තරය' : 'About Institution'}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {isSinhala ? selectedDetail.descriptionSi : selectedDetail.descriptionEn}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {isSinhala ? 'සම්බන්ධතා තොරතුරු' : 'Contact Information'}
                </h4>

                {selectedDetail.addressSi && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#006837] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {isSinhala ? selectedDetail.addressSi : selectedDetail.addressEn}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isSinhala ? selectedDetail.addressEn : selectedDetail.addressSi}
                      </p>
                    </div>
                  </div>
                )}

                {selectedDetail.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#006837] shrink-0" />
                    <a href={`tel:${selectedDetail.phone}`} className="text-[#006837] hover:underline font-bold">
                      {selectedDetail.phone}
                    </a>
                  </div>
                )}

                {selectedDetail.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#006837] shrink-0" />
                    <a href={`mailto:${selectedDetail.email}`} className="text-gray-700 hover:text-[#006837] hover:underline">
                      {selectedDetail.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-5 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-200/60 hover:bg-gray-300/80 border border-gray-300/50 rounded-full backdrop-blur-xs transition-all cursor-pointer"
              >
                {t('agriInfoHub.modalClose', 'වසන්න')}
              </button>

              <a
                href={selectedDetail.website || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#006837]/90 hover:bg-[#006837] text-white border border-white/30 backdrop-blur-md px-6 py-2.5 rounded-full font-bold text-xs shadow-sm hover:shadow-md transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{t('agriInfoHub.website', 'වෙබ් අඩවියට පිවිසෙන්න')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
