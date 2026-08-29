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
    <div className="bg-white rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden group">
      {/* Image Section with Padding */}
      <div className="p-2 pb-0 relative">
        <div 
          className="relative h-64 w-full rounded-[24px] overflow-hidden flex items-center justify-center"
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
      <div className="p-6 pt-5 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[15px] text-gray-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Meta Info */}
        {meta && meta.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 mb-6 mt-auto">
            {meta.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-1.5 text-gray-900 font-semibold text-sm">
                  {Icon && <Icon className="w-4 h-4 text-gray-400 stroke-[1.5]" />}
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-3 mt-auto">
            {primaryAction && (
              <button
                onClick={(e) => {
                  if (primaryAction.onClick) {
                    e.preventDefault();
                    primaryAction.onClick(e);
                  }
                }}
                className="flex-1 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white py-3.5 px-6 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
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
                className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors bg-white"
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
