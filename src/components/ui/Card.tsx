import React from 'react';
import { Link } from 'react-router-dom';

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
  to?: string;
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
  to,
}: CardProps) {
  const content = (
    <div className="bg-white rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden group">
      {/* Image Section with Padding */}
      <div className="p-2 pb-0 relative">
        <div 
          className="relative h-56 sm:h-60 w-full rounded-[22px] overflow-hidden flex items-center justify-center bg-gray-50"
          style={!image && color ? { backgroundColor: `${color}20` } : {}}
        >
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : FallbackIcon ? (
            <FallbackIcon className="w-20 h-20 transition-transform duration-700 group-hover:scale-110" style={{ color: color || '#111' }} />
          ) : null}
          {badge && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {badge}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 sm:p-6 pt-4 pb-6 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-1 line-clamp-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-400 font-medium line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Meta Info */}
        {meta && meta.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 mb-4 mt-auto">
            {meta.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-1.5 text-gray-600 font-medium text-xs sm:text-sm">
                  {Icon && <Icon className="w-4 h-4 text-gray-400 stroke-[1.5]" />}
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-3 mt-auto pt-2">
            {primaryAction && (
              <button
                onClick={(e) => {
                  if (primaryAction.onClick) {
                    e.preventDefault();
                    primaryAction.onClick(e);
                  }
                }}
                className="flex-1 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white py-3 px-5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
                {primaryAction.text}
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
                className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors bg-white"
              >
                <secondaryAction.icon className="w-5 h-5" />
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
