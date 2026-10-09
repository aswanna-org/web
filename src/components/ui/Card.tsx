import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

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
  const content = (
    <div className="bg-white rounded-[20px] sm:rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden group">
      {/* Image Section with Padding */}
      <div className="p-1.5 sm:p-2 pb-0 relative">
        <div 
          className="relative h-32 xs:h-36 sm:h-56 lg:h-60 w-full rounded-[16px] sm:rounded-[22px] overflow-hidden flex items-center justify-center bg-gray-50"
          style={!image && color ? { backgroundColor: `${color}20` } : {}}
        >
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : FallbackIcon ? (
            <FallbackIcon className="w-12 h-12 sm:w-20 sm:h-20 transition-transform duration-700 group-hover:scale-110" style={{ color: color || '#111' }} />
          ) : null}
          {(badge || topRightBadge) && (
            <div className="absolute top-2 sm:top-3.5 left-2 sm:left-3.5 right-2 sm:right-3.5 flex flex-col items-start gap-1 sm:gap-1.5 z-10 pointer-events-none">
              {/* Row 1: Primary Badge */}
              {badge && (
                <div className="pointer-events-auto max-w-full flex">
                  {typeof badge === 'string' ? (
                    <div 
                      className="h-6 sm:h-7 inline-flex items-center bg-white/85 backdrop-blur-md text-gray-900 text-[10px] sm:text-xs font-bold px-2 sm:px-3 rounded-full shadow-xs border border-white/60 max-w-full"
                      title={badge}
                    >
                      <span className="truncate">{badge}</span>
                    </div>
                  ) : (
                    badge
                  )}
                </div>
              )}

              {/* Row 2: Secondary / Status Badge */}
              {topRightBadge && (
                <div className="pointer-events-auto max-w-full flex">
                  {topRightBadge}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2.5 sm:p-5 pt-2 sm:pt-3 pb-3 sm:pb-5 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-1.5 sm:mb-2.5">
          <h3 className={titleClassName || "text-xs sm:text-lg font-bold text-gray-900 leading-snug mb-0.5 sm:mb-1 line-clamp-2"}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] sm:text-sm text-gray-400 font-medium line-clamp-1 sm:line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Meta Info */}
        {meta && meta.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-4 mb-2.5 sm:mb-4 mt-auto">
            {meta.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-1 sm:gap-1.5 text-gray-600 font-medium text-[10px] sm:text-sm max-w-full min-w-0"
                  title={item.text}
                >
                  {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 stroke-[1.5] shrink-0" />}
                  <span className="truncate">{item.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-2 sm:gap-3 mt-auto pt-1 sm:pt-2">
            {primaryAction && (
              <button
                onClick={(e) => {
                  if (primaryAction.onClick) {
                    e.preventDefault();
                    primaryAction.onClick(e);
                  }
                }}
                className="inline-flex items-center justify-between gap-1.5 sm:gap-2.5 pl-2.5 sm:pl-5 pr-1 sm:pr-2 py-1 sm:py-2 rounded-full bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-gray-200/80 hover:border-emerald-300 text-gray-900 font-bold text-[11px] sm:text-sm shadow-[0_4px_16px_rgba(0,0,0,0.05),inset_0_1px_1.5px_rgba(255,255,255,1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer flex-1 min-w-0"
              >
                <span className="truncate">{primaryAction.text}</span>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/80 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300 shadow-2xs shrink-0">
                  {primaryAction.icon ? (
                    <primaryAction.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                  )}
                </div>
              </button>
            )}
            
            {secondaryAction && (
              <button
                onClick={(e) => {
                  if (secondaryAction.onClick) {
                    e.preventDefault();
                    secondaryAction.onClick(e);
                  }
                }}
                className="w-8 h-8 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md border border-gray-200/80 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all duration-300 shadow-2xs hover:shadow-md cursor-pointer"
              >
                <secondaryAction.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        )}
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
