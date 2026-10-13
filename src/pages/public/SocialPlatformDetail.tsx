import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ExternalLink,
  Search,
  Users,
  CheckCircle,
  Copy,
  ChevronRight,
  Filter,
  ArrowLeft,
  Share2,
  Check
} from 'lucide-react';
import { getBrandConfig } from '../../utils/socialPlatforms';
import PageHero from '../../components/public/PageHero';
import SEO from '../../components/common/SEO';
import AgroLoader from '../../components/common/AgroLoader';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
        {/* Navigation & Breadcrumb Bar (Matching ShortCourses / MarketplaceDetail standard) */}
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

        {/* Filter and Search Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* SubTypes Tab Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedSubType('all')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  selectedSubType === 'all'
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{isSinhala ? 'සියල්ල' : 'All Groups'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {totalGroupsCount}
                </span>
              </button>

              {(platform?.subTypes || []).map((subType) => {
                const count = platform?.socialLinks?.filter(l => l.subTypeId === subType.id).length || 0;

                return (
                  <button
                    key={subType.id}
                    onClick={() => setSelectedSubType(subType.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                      selectedSubType === subType.id
                        ? 'bg-gray-900 text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span>{subType.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-800">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isSinhala ? 'සමූහ හෝ ප්‍රජාවන් සොයන්න...' : 'Search groups or topics...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>
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
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              >
                {isSinhala ? 'සෙවුම ඉවත් කරන්න' : 'Clear search'}
              </button>
            )}
          </div>
        ) : (
          /* Social Groups & Communities Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredLinks.map((item) => {
              const itemIconSrc = item.imageUrl || item.icon;
              const hasCustomIcon = itemIconSrc && (itemIconSrc.startsWith('http://') || itemIconSrc.startsWith('https://') || itemIconSrc.startsWith('/'));

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl p-5 border border-gray-200/80 hover:border-gray-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top: Avatar, SubType & Copy button */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          {hasCustomIcon ? (
                            <img
                              src={itemIconSrc}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`p-2 rounded-lg ${brand.lightBg} ${brand.textColor}`}>
                              {brand.iconSvg}
                            </div>
                          )}
                        </div>

                        <div>
                          {item.subType?.name && (
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 mb-1">
                              {item.subType.name}
                            </span>
                          )}
                          <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      {/* Copy Link Button */}
                      <button
                        onClick={() => handleCopyLink(item)}
                        title={copiedId === item.id ? 'Copied!' : 'Copy Link'}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                      >
                        {copiedId === item.id ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    {item.description ? (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic mb-4">
                        {isSinhala ? 'නිල කෘෂිකාර්මික ප්‍රජා සමූහය' : 'Official community group and discussion channel.'}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom: Join CTA Button */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <a
                      href={item.hyperlink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-xs transition-all duration-200 cursor-pointer bg-gradient-to-r ${brand.bgHoverGradient} hover:shadow-md hover:scale-[1.01] active:scale-[0.99]`}
                    >
                      <span>{isSinhala ? brand.actionTextSi : brand.actionText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
