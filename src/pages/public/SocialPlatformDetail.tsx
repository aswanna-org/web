import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Users,
  CheckCircle,
  Copy,
  ChevronRight,
  ArrowLeft,
  Share2,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { getBrandConfig } from '../../utils/socialPlatforms';
import PageHero from '../../components/public/PageHero';
import SEO from '../../components/common/SEO';
import AgroLoader from '../../components/common/AgroLoader';
import CustomDropdown, { type DropdownOption } from '../../components/ui/CustomDropdown';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  { fill: '#c8e6c9' }, // 26. Clover Green
  { fill: '#ffebee' }, // 27. Petal Pink
  { fill: '#d1c4e9' }, // 28. Soft Violet
  { fill: '#b2dfdb' }, // 29. Cool Sage Aqua
  { fill: '#ffecb3' }, // 30. Sunlight Yellow
  { fill: '#ffccbc' }, // 31. Papaya Tint
  { fill: '#d7ccc8' }, // 32. Warm Sandstone
  { fill: '#cfd8dc' }, // 33. Morning Mist
  { fill: '#c5cae9' }, // 34. Twilight Blue
  { fill: '#b3e5fc' }, // 35. Powder Blue
  { fill: '#b2ebf2' }, // 36. Lagoon Tint
  { fill: '#dcedc1' }, // 37. Olive Sprout
  { fill: '#ffd3b6' }, // 38. Cantaloupe Tint
  { fill: '#ffaaa5' }, // 39. Coral Tint
  { fill: '#a8e6cf' }, // 40. Sweet Pea Green
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

interface SocialLinkItem {
  id: string;
  title: string;
  slug: string;
  hyperlink: string;
  imageUrl?: string | null;
  icon?: string | null;
  description?: string | null;
  activeState: boolean;
  order: number;
  subTypeId?: string | null;
  subType?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface PlatformData {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  imageUrl?: string | null;
  subTypes?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  socialLinks?: SocialLinkItem[];
  _count?: {
    subTypes: number;
    socialLinks: number;
  };
}

export default function SocialPlatformDetail() {
  const { platformSlug } = useParams<{ platformSlug: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [platform, setPlatform] = useState<PlatformData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSubType, setSelectedSubType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Fetch platform details & its social links
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchPlatform = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/platforms/${platformSlug}`);
        if (!res.ok) {
          // If not in DB, create placeholder from brand definition
          if (isMounted) {
            const brand = getBrandConfig(platformSlug);
            setPlatform({
              id: platformSlug || 'platform',
              name: brand.name,
              slug: brand.slug,
              subTypes: [
                { id: '1', name: isSinhala ? 'ප්‍රධාන සමූහ' : 'Discussion Groups', slug: 'groups' },
                { id: '2', name: isSinhala ? 'නිල නාලිකා' : 'Official Channels', slug: 'channels' },
                { id: '3', name: isSinhala ? 'දිස්ත්‍රික් ප්‍රජාවන්' : 'District Communities', slug: 'communities' }
              ],
              socialLinks: []
            });
          }
          return;
        }

        const json = await res.json();
        const data = json?.data || json;

        if (isMounted && data) {
          setPlatform(data);
        }
      } catch (err) {
        console.error('Failed to load platform:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (platformSlug) {
      fetchPlatform();
    }

    return () => {
      isMounted = false;
    };
  }, [platformSlug, isSinhala]);

  const brand = getBrandConfig(platform?.slug || platformSlug);

  // Filter links by search query and subtype
  const filteredLinks = useMemo(() => {
    if (!platform?.socialLinks) return [];

    return platform.socialLinks.filter((link) => {
      if (selectedSubType !== 'all' && link.subTypeId !== selectedSubType) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = link.title.toLowerCase().includes(q);
        const matchesDesc = link.description?.toLowerCase().includes(q);
        const matchesSubType = link.subType?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSubType) return false;
      }

      return true;
    });
  }, [platform?.socialLinks, selectedSubType, searchQuery]);

  // Handle copy hyperlink
  const handleCopyLink = (link: SocialLinkItem) => {
    navigator.clipboard.writeText(link.hyperlink);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${brand.name} Groups & Communities | Aswanna`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const iconSource = platform?.icon || platform?.imageUrl;
  const isCustomIconUrl = Boolean(
    iconSource &&
    (iconSource.startsWith('http://') || iconSource.startsWith('https://') || iconSource.startsWith('/'))
  );

  const totalGroupsCount = platform?.socialLinks?.length || 0;

  const subTypeOptions = useMemo<DropdownOption[]>(() => {
    const opts: DropdownOption[] = [
      {
        value: 'all',
        label: isSinhala ? 'සියලු සමූහ හා ප්‍රජාවන්' : 'All Groups & Communities',
        count: totalGroupsCount,
      },
    ];

    (platform?.subTypes || []).forEach((st) => {
      const count = platform?.socialLinks?.filter((l) => l.subTypeId === st.id).length || 0;
      opts.push({
        value: st.id,
        label: st.name,
        count,
      });
    });

    return opts;
  }, [platform?.subTypes, platform?.socialLinks, isSinhala, totalGroupsCount]);

  const hasActiveFilters = selectedSubType !== 'all' || Boolean(searchQuery.trim());

  const handleClearFilters = () => {
    setSelectedSubType('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-roboto">
      <SEO
        title={`${brand.name} Groups & Communities | Aswanna Ceylon Agro`}
        description={`Connect with Aswanna Ceylon Agro on ${brand.name}. Join official discussion groups, district community circles, and agricultural updates.`}
        canonical={`/social/${brand.slug}`}
      />

      {/* Page Hero Header - Standardized across Aswanna Detail Pages */}
      <PageHero
        title={`${brand.name} ${isSinhala ? 'සමූහ සහ ප්‍රජාවන්' : 'Communities & Groups'}`}
        subtitle={isSinhala ? 'නිල සමාජ මාධ්‍ය ජාල' : 'OFFICIAL COMMUNITY DIRECTORY'}
        description={
          isSinhala
            ? `අස්වැන්න කෘෂිකාර්මික උපදෙස්, ගොවි ප්‍රජා සාකච්ඡා සහ වෙළඳපල මිල තොරතුරු සඳහා අපගේ ${brand.name} සමූහ හා එක්වන්න.`
            : `Join our official ${brand.name} discussion groups, farmer circles, and broadcast channels to receive direct agricultural advice and market updates.`
        }
        image={platform?.imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=1600&q=80'}
        gradientColor={brand.color || '#047857'}
        iconUrl={isCustomIconUrl ? iconSource : null}
        icon={
          !isCustomIconUrl ? (
            <div className="flex items-center justify-center text-white scale-125 sm:scale-150">
              {brand.iconSvg}
            </div>
          ) : undefined
        }
        badgeBg={brand.color || 'bg-emerald-700'}
        waveColor="text-gray-50"
      />

      {/* Main Container */}
      <main className="container mx-auto px-3 sm:px-4 lg:px-12 py-6 sm:py-8 space-y-6 flex-grow">
        {/* Navigation & Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-emerald-800 transition-colors">
              {isSinhala ? 'මුල් පිටුව' : 'Home'}
            </Link>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <Link to="/" className="hover:text-emerald-800 transition-colors">
              {isSinhala ? 'සමාජ මාධ්‍ය ජාල' : 'Social Platforms'}
            </Link>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-[320px]">
              {brand.name}
            </span>
            <span className="ml-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full shadow-2xs">
              {filteredLinks.length}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={14} />
              <span>{isSinhala ? 'ආපසු' : 'Back'}</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition-all cursor-pointer shadow-2xs"
            >
              {copiedShare ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copiedShare ? (isSinhala ? 'පිටපත් විය' : 'Copied!') : (isSinhala ? 'බෙදාහරින්න' : 'Share')}</span>
            </button>
          </div>
        </div>

        {/* ── Seamless Filters Area (Standardized across Aswanna Public Pages) ── */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 items-center">
            {/* 1. Search Bar - LEFT SIDE */}
            <div className={`relative group ${hasActiveFilters ? 'sm:col-span-7 lg:col-span-8' : 'sm:col-span-8 lg:col-span-8'}`}>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={
                  isSinhala
                    ? 'සමූහ හෝ ප්‍රජාවන් සොයන්න...'
                    : 'Search groups or topics...'
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

            {/* 2. SubType Filter Dropdown (CustomDropdown matching ShortCourses & site standard) */}
            <div className={hasActiveFilters ? 'sm:col-span-3 lg:col-span-3' : 'sm:col-span-4 lg:col-span-4'}>
              <CustomDropdown
                value={selectedSubType}
                onChange={(val) => setSelectedSubType(val)}
                options={subTypeOptions}
                placeholder={isSinhala ? 'සියලු සමූහ හා ප්‍රජාවන්' : 'All Groups & Communities'}
              />
            </div>

            {/* 3. Clear Filters Button (When active) */}
            {hasActiveFilters && (
              <div className="sm:col-span-2 lg:col-span-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-3 text-xs font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-xl sm:rounded-full border border-red-200/80 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                  title={isSinhala ? 'පෙරහන් ඉවත් කරන්න' : 'Clear Filters'}
                >
                  <X size={14} />
                  <span className="hidden lg:inline">{isSinhala ? 'ඉවත් කරන්න' : 'Clear'}</span>
                  <span className="lg:hidden">{isSinhala ? 'පෙරහන් ඉවත් කරන්න' : 'Clear Filters'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Loading State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <AgroLoader />
            <p className="text-xs text-gray-500 mt-3">
              {isSinhala ? 'සමූහ ලැයිස්තුව පූරණය වෙමින් පවතී...' : 'Loading community groups...'}
            </p>
          </div>
        ) : filteredLinks.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-gray-200/80 p-10 sm:p-14 text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {searchQuery
                ? isSinhala ? 'සෙවුමට ගැළපෙන සමූහ හමු නොවීය' : 'No matching groups found'
                : isSinhala ? `තවමත් ${brand.name} සමූහ එක් කර නොමැත` : `No groups added for ${brand.name} yet`}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? isSinhala ? 'කරුණාකර වෙනත් සෙවුම් වචනයක් යොදා නැවත උත්සාහ කරන්න.' : 'Try adjusting your search query or switching filters.'
                : isSinhala ? 'නව සමූහ සහ ප්‍රජාවන් ඉතා ඉක්මනින් මෙහි එක් කරනු ඇත. අපගේ අනෙකුත් සමාජ මාධ්‍ය ජාලයන් නරඹන්න.' : 'Community groups and channels will be published here soon. Explore our other platforms below.'}
            </p>
            {/* Direct Official Account CTA if no community groups yet */}
            {!searchQuery && (platform?.socialLinks?.[0]?.hyperlink || brand.defaultUrl) && (
              <div className="mt-5 flex justify-center">
                <a
                  href={platform?.socialLinks?.[0]?.hyperlink || brand.defaultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 transition-all shadow-md shadow-emerald-700/20 hover:scale-105 cursor-pointer"
                >
                  <span>{isSinhala ? brand.actionTextSi : brand.actionText}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            {hasActiveFilters && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                >
                  <X size={14} />
                  <span>{isSinhala ? 'සියලු පෙරහන් ඉවත් කරන්න' : 'Clear all filters'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Social Groups & Communities Grid - 6 cards per row on desktop, 2 on mobile */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5">
            {filteredLinks.map((item, index) => {
              const itemIconSrc = item.imageUrl || item.icon;
              const hasCustomIcon = Boolean(
                itemIconSrc &&
                (itemIconSrc.startsWith('http://') || itemIconSrc.startsWith('https://') || itemIconSrc.startsWith('/'))
              );

              return (
                <a
                  key={item.id}
                  href={item.hyperlink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.description || item.title}
                  className="group relative flex flex-col items-center justify-between p-2.5 sm:p-3.5 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-200/80 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {/* Top-Right Copy Link Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCopyLink(item);
                    }}
                    title={copiedId === item.id ? (isSinhala ? 'පිටපත් විය!' : 'Copied!') : (isSinhala ? 'සබැඳිය පිටපත් කරන්න' : 'Copy link')}
                    className="absolute top-2 right-2 z-20 p-1.5 rounded-full text-gray-300 hover:text-emerald-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Top: Organic Pastel Cloud Shape with Icon/Illustration */}
                  <div className="w-full aspect-square max-w-[95px] sm:max-w-[125px] md:max-w-[140px] flex items-center justify-center relative my-1">
                    <CloudBackground index={index} />
                    {hasCustomIcon ? (
                      <img
                        src={itemIconSrc!}
                        alt={item.title}
                        className="w-full h-full max-w-[80%] max-h-[80%] object-contain relative z-10 drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="relative z-10 p-2 sm:p-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {brand.slug === 'whatsapp' ? (
                          <svg className="w-10 h-10 sm:w-12 sm:h-12 fill-[#25D366] drop-shadow-xs" viewBox="0 0 24 24">
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.7C7.02 10.92 7.91 12.09 8.03 12.26C8.16 12.43 9.77 14.92 12.25 15.99C12.84 16.24 13.3 16.39 13.66 16.51C14.25 16.7 14.79 16.67 15.22 16.61C15.7 16.54 16.7 16 16.91 15.42C17.12 14.84 17.12 14.34 17.06 14.24C17 14.14 16.83 14.08 16.58 13.96C16.33 13.84 15.09 13.23 14.86 13.15C14.63 13.07 14.47 13.03 14.3 13.28C14.14 13.53 13.66 14.08 13.52 14.24C13.38 14.4 13.24 14.42 12.99 14.3C12.74 14.18 11.95 13.92 11.01 13.08C10.28 12.43 9.78 11.62 9.64 11.38C9.5 11.13 9.63 11 9.75 10.88C9.86 10.77 10 10.58 10.12 10.44C10.25 10.3 10.29 10.2 10.37 10.04C10.45 9.88 10.41 9.73 10.35 9.61C10.29 9.49 9.82 8.33 9.62 7.86C9.43 7.4 9.24 7.46 9.09 7.45C8.95 7.45 8.78 7.44 8.62 7.44L8.53 7.33Z" />
                          </svg>
                        ) : (
                          <div className="scale-125 sm:scale-150" style={{ color: brand.color }}>
                            {brand.iconSvg}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Middle: Title & Subtype Badge */}
                  <div className="w-full text-center my-1 px-1 flex flex-col items-center">
                    {item.subType?.name && (
                      <span className="inline-block text-[9px] sm:text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 mb-1 max-w-full truncate">
                        {item.subType.name}
                      </span>
                    )}
                    <h3 className="font-bold text-[11px] sm:text-xs md:text-sm text-gray-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  {/* Bottom: Circular Green Chevron Button */}
                  <div className="mt-1 sm:mt-2 pb-0.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-700 group-hover:bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:shadow-emerald-600/30 group-hover:scale-110 transition-all duration-300">
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
