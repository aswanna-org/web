import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { getBrandConfig } from '../../utils/socialPlatforms';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface PlatformItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  imageUrl?: string | null;
  _count?: {
    subTypes: number;
    socialLinks: number;
  };
}

// Fallback platforms matching the user screenshot for instant preview if DB is empty
const DEFAULT_PLATFORMS: PlatformItem[] = [
  { id: '1', name: 'Instagram', slug: 'instagram' },
  { id: '2', name: 'LinkedIn', slug: 'linkedin' },
  { id: '3', name: 'YouTube', slug: 'youtube' },
  { id: '4', name: 'Facebook', slug: 'facebook' },
  { id: '5', name: 'WhatsApp', slug: 'whatsapp' }
];

export default function SocialPlatformsSection() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  // Initially null so NO card shows the watermark or expanded height until hovered
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPlatforms = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/platforms?includeSubTypes=true`);
        if (!res.ok) return;
        const json = await res.json();
        const list = json?.data || json?.items || (Array.isArray(json) ? json : []);

        if (isMounted && Array.isArray(list) && list.length > 0) {
          setPlatforms(list);
        } else if (isMounted) {
          setPlatforms(DEFAULT_PLATFORMS);
        }
      } catch {
        if (isMounted) {
          setPlatforms(DEFAULT_PLATFORMS);
        }
      }
    };

    fetchPlatforms();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayPlatforms = platforms.length > 0 ? platforms : DEFAULT_PLATFORMS;

  return (
    <section className="w-full py-8 sm:py-16 lg:py-20 bg-gray-50/70 font-roboto relative overflow-hidden">
      {/* Frosted ambient colored background orbs for true Glassmorphism light refraction */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-14">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] tracking-tight mb-2 sm:mb-3">
            {isSinhala ? 'අන්තර්ජාලය ඔස්සේ අප හා එක්වන්න' : 'Connect with us online'}
          </h2>
        </div>

        {/* Mobile View: Pure Icons in a Row (No Background) */}
        <div className="sm:hidden flex items-center justify-center px-2">
          <div className="grid grid-cols-5 gap-2.5 sm:gap-4 w-full max-w-[360px] mx-auto justify-items-center items-center">
            {displayPlatforms.map((platform) => {
              const brand = getBrandConfig(platform.slug || platform.name);
              const iconSource = platform.icon || platform.imageUrl;
              const isUrl = iconSource && (iconSource.startsWith('http://') || iconSource.startsWith('https://') || iconSource.startsWith('/'));

              return (
                <Link
                  key={`mobile-${platform.id || platform.slug}`}
                  to={`/social/${platform.slug}`}
                  title={platform.name}
                  aria-label={platform.name}
                  style={{ color: brand.color }}
                  className="p-1 transition-transform duration-200 hover:scale-120 active:scale-90 flex items-center justify-center cursor-pointer"
                >
                  {isUrl ? (
                    <img
                      src={iconSource}
                      alt={platform.name}
                      className="w-12 h-12 object-contain drop-shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center [&_svg]:!w-12 [&_svg]:!h-12 drop-shadow-xs">
                      {brand.iconSvg}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop/Tablet View: Glassmorphic Cards Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6 items-start">
          {displayPlatforms.map((platform) => {
            const brand = getBrandConfig(platform.slug || platform.name);
            const isHovered = hoveredSlug === (platform.slug || platform.id);

            // Icon renderer: either uploaded image URL or brand SVG
            const renderIcon = () => {
              const iconSource = platform.icon || platform.imageUrl;
              const isUrl = iconSource && (iconSource.startsWith('http://') || iconSource.startsWith('https://') || iconSource.startsWith('/'));

              if (isUrl) {
                return (
                  <img
                    src={iconSource}
                    alt={platform.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded"
                  />
                );
              }

              return brand.iconSvg;
            };

            return (
              <Link
                key={platform.id || platform.slug}
                to={`/social/${platform.slug}`}
                onMouseEnter={() => setHoveredSlug(platform.slug || platform.id)}
                onMouseLeave={() => setHoveredSlug(null)}
                className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl transition-all duration-500 ease-out cursor-pointer overflow-hidden backdrop-blur-xl border ${isHovered
                    ? `min-h-[300px] sm:min-h-[320px] bg-gradient-to-br ${brand.bgHoverGradient} text-white border-white/40 shadow-[0_20px_45px_rgba(0,0,0,0.18)] scale-[1.02]`
                    : `min-h-[200px] sm:min-h-[210px] bg-white/65 border-white/80 text-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:shadow-lg`
                  }`}
              >
                {/* Top Section: Icon, Arrow, Title, Tagline */}
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    {/* Glassmorphic Icon Badge */}
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isHovered
                          ? 'bg-white/20 text-white backdrop-blur-md shadow-inner scale-105'
                          : `bg-white/85 backdrop-blur-sm ${brand.textColor} shadow-2xs border border-white`
                        }`}
                    >
                      {renderIcon()}
                    </div>

                    {/* Top-Right Arrow Badge */}
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-500 ${isHovered
                          ? 'bg-white/15 text-white translate-x-0.5 -translate-y-0.5 backdrop-blur-xs'
                          : 'bg-white/50 text-gray-400 group-hover:text-gray-700'
                        }`}
                    >
                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-1.5 transition-colors duration-300">
                    {platform.name}
                  </h3>

                  {/* Tagline */}
                  <p
                    className={`text-xs leading-relaxed transition-colors duration-300 line-clamp-3 ${isHovered ? 'text-white/90' : 'text-gray-500'
                      }`}
                  >
                    {isSinhala ? brand.taglineSi : brand.tagline}
                  </p>
                </div>

                {/* Bottom Section: ONLY revealed when hovered! Smoothly expands height and displays 'Follow' watermark */}
                <div
                  className={`relative overflow-hidden transition-all duration-500 ease-out flex items-end ${isHovered
                      ? 'max-h-24 opacity-100 mt-6 pt-3 border-t border-white/20 translate-y-0 pointer-events-auto'
                      : 'max-h-0 opacity-0 mt-0 pt-0 border-t-0 translate-y-4 pointer-events-none'
                    }`}
                >
                  {/* Big Watermark text (Follow, Join, Connect, Subscribe, etc.) */}
                  <span className="text-3xl sm:text-4xl font-black tracking-tight select-none text-white/40 leading-none transition-transform duration-500">
                    {brand.watermark}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
