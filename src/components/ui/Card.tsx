import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';

export interface CardMetaItem {
  icon?: React.ElementType;
  text: string;
}

export interface CardProps {
  image?: string;
  icon?: React.ElementType;
  color?: string;
  title: string;
  subtitle?: string;
  meta?: CardMetaItem[];
  primaryAction?: {
    text: string;
    icon?: React.ElementType;
    onClick?: (e: React.MouseEvent) => void;
  };
  secondaryAction?: {
    icon: React.ElementType;
    onClick?: (e: React.MouseEvent) => void;
  };
  badge?: string | React.ReactNode;
  topRightBadge?: React.ReactNode;
  to?: string;
  titleClassName?: string;
}

// Reusable SVG for wavy card divider matching reference Careers UI
export const CardWaveDivider = () => (
  <svg
    className="absolute -bottom-1 left-0 right-0 w-full h-8 sm:h-9 text-white fill-white pointer-events-none z-10 translate-y-1"
    viewBox="0 0 500 70"
    preserveAspectRatio="none"
  >
    <path d="M0,25 C150,55 350,0 500,25 L500,70 L0,70 Z" />
  </svg>
);

// Reusable stylized leaf watermark badge matching reference Careers UI
export const AswannaLeafBadge = () => (
  <div className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center text-emerald-500/80 group-hover:text-emerald-600 transition-colors shrink-0">
    <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-7 sm:h-7 fill-current">
      <path d="M16 28c0-7.7 6.3-14 14-14 0 7.7-6.3 14-14 14z" opacity="0.9" />
      <path d="M16 28C16 19.2 8.8 12 0 12c0 8.8 7.2 16 16 16z" opacity="0.6" />
      <path d="M16 28v-8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

export default function Card({
  image,
  icon: FallbackIcon,
  color,
  title,
  subtitle,
  meta,
  primaryAction,
  secondaryAction,
  badge,
  topRightBadge,
  to,
  titleClassName,
}: CardProps) {
  const FloatingIcon = FallbackIcon || MapPin;

  const content = (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] sm:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden group hover:-translate-y-1.5 cursor-pointer">
      {/* Top Media Section */}
      <div className="relative">
        <div 
          className="relative h-28 xs:h-36 sm:h-48 lg:h-52 w-full overflow-hidden flex items-center justify-center bg-gray-50"
          style={!image && color ? { backgroundColor: `${color}20` } : {}}
        >
          {image ? (
            <img
              src={image}
              alt={title}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.fallbackTried) {
                  target.dataset.fallbackTried = 'true';
                  target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80';
                }
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : FallbackIcon ? (
            <FallbackIcon className="w-10 h-10 sm:w-20 sm:h-20 transition-transform duration-500 group-hover:scale-110" style={{ color: color || '#111' }} />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Badges on Top Corners */}
          {(badge || topRightBadge) && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3.5 right-2 sm:right-3.5 flex flex-wrap items-center justify-between gap-1 z-10 pointer-events-none">
              {badge && (
                <div className="pointer-events-auto max-w-full flex">
                  {typeof badge === 'string' ? (
                    <div 
                      className="h-5 sm:h-7 inline-flex items-center bg-white/90 backdrop-blur-md text-gray-900 text-[9px] sm:text-xs font-bold px-2 sm:px-3 rounded-full shadow-xs border border-white/60 max-w-full"
                      title={badge}
                    >
                      <span className="truncate">{badge}</span>
                    </div>
                  ) : (
                    badge
                  )}
                </div>
              )}
              {topRightBadge && (
                <div className="pointer-events-auto max-w-full flex ml-auto">
                  {topRightBadge}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Smooth Organic Wave Divider */}
        <CardWaveDivider />

        {/* Floating Round Icon Badge */}
        {FloatingIcon && (
          <div className="absolute -bottom-3 sm:-bottom-5 left-2.5 sm:left-6 z-20 w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-[#006837] text-white flex items-center justify-center border-[2px] sm:border-[3.5px] border-white shadow-md sm:shadow-lg group-hover:scale-110 transition-transform">
            <FloatingIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="pt-4 sm:pt-7 px-2.5 sm:px-5 pb-2.5 sm:pb-5 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-1.5 sm:mb-2">
          <h3 className={titleClassName || "text-xs sm:text-base font-bold text-[#143d4d] group-hover:text-[#006837] transition-colors leading-snug mb-1 line-clamp-2"}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Meta Info */}
        {meta && meta.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 my-2 text-xs">
            {meta.map((item, index) => {
              const MetaIcon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-1 text-gray-600 font-medium text-[11px] sm:text-xs max-w-full min-w-0"
                  title={item.text}
                >
                  {MetaIcon && <MetaIcon className="w-3.5 h-3.5 text-emerald-700 stroke-[2] shrink-0" />}
                  <span className="truncate">{item.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer: Button & Leaf Watermark */}
        <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-100 mt-auto">
          {primaryAction ? (
            <button
              onClick={(e) => {
                if (primaryAction.onClick) {
                  e.preventDefault();
                  primaryAction.onClick(e);
                }
              }}
              className="bg-[#006837] hover:bg-[#00532c] text-white text-[10px] sm:text-xs font-semibold px-2.5 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-1 transition-all shadow-xs group-hover:shadow cursor-pointer"
            >
              <span className="truncate">{primaryAction.text}</span>
              {primaryAction.icon ? (
                <primaryAction.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
              )}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {secondaryAction && (
              <button
                onClick={(e) => {
                  if (secondaryAction.onClick) {
                    e.preventDefault();
                    secondaryAction.onClick(e);
                  }
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
              >
                <secondaryAction.icon className="w-3.5 h-3.5" />
              </button>
            )}
            <AswannaLeafBadge />
          </div>
        </div>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
