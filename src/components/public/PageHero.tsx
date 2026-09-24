import React from 'react';

export interface PageHeroProps {
  title: string;
  subtitle?: string; // Small uppercase text above title
  description?: string; // Larger text below title
  image: string;
  gradientColor?: string; // e.g., 'var(--color-primary)' or '#0f4d30'
  icon?: React.ElementType | React.ReactNode;
  iconUrl?: string | null;
  badgeBg?: string; // e.g. 'bg-[#0f4d30]'
  waveColor?: string; // e.g. 'text-white' or 'text-[#fbfdfa]' or 'text-gray-50'
  showWave?: boolean;
  children?: React.ReactNode;
}

export default function PageHero({ 
  title, 
  subtitle, 
  description, 
  image, 
  gradientColor = 'var(--color-primary)',
  icon,
  iconUrl,
  badgeBg,
  waveColor = 'text-white',
  showWave = true,
  children
}: PageHeroProps) {
  const hasBadge = Boolean(iconUrl || icon);
  const resolvedBadgeBg = badgeBg || gradientColor || 'var(--color-primary)';
  const isTailwindClass = typeof resolvedBadgeBg === 'string' && (resolvedBadgeBg.startsWith('bg-') || resolvedBadgeBg.startsWith('from-'));

  const renderBadgeContent = () => {
    if (iconUrl) {
      return (
        <img
          src={iconUrl}
          alt={title}
          className="w-full h-full object-contain p-1 sm:p-2 md:p-2.5 bg-white"
        />
      );
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (icon) {
      const IconComp = icon as React.ElementType;
      return <IconComp className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white stroke-[2.2]" />;
    }
    return null;
  };

  return (
    <section className="relative z-30 w-full h-[24vh] sm:h-[34vh] md:h-[44vh] min-h-[160px] sm:min-h-[250px] md:min-h-[360px] flex flex-col justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div 
          className="absolute inset-0 mix-blend-multiply"
          style={{
            background: `linear-gradient(to right, ${gradientColor} 0%, ${gradientColor}dd 35%, transparent 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
      </div>

      {/* ── Bottom Wave & Floating Badge (Permanently Anchored) ── */}
      <div className="absolute -bottom-[1px] left-0 right-0 w-full pointer-events-none z-30">
        {/* Organic Wave Divider */}
        {showWave && (
          <svg
            className={`w-full h-10 sm:h-14 md:h-18 lg:h-22 ${waveColor} fill-current block pointer-events-none`}
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path d="M0,32 C240,65 480,80 720,45 C960,10 1200,55 1440,30 L1440,120 L0,120 Z" />
          </svg>
        )}

        {/* Circular Badge Icon / Logo */}
        {hasBadge && (
          <div className="container mx-auto px-4 lg:px-12 absolute inset-x-0 -bottom-1 sm:-bottom-0.5 md:bottom-0.5 lg:bottom-1 pointer-events-none">
            <div
              className={`pointer-events-auto ${isTailwindClass ? resolvedBadgeBg : ''} w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-white shadow-xl border-2 sm:border-[3px] md:border-4 border-white overflow-hidden transition-transform duration-300 hover:scale-105`}
              style={{
                background: !isTailwindClass ? resolvedBadgeBg : undefined,
                boxShadow: '0 14px 28px -4px rgba(0,0,0,0.35), 0 8px 16px -4px rgba(0,0,0,0.15)',
              }}
            >
              {renderBadgeContent()}
            </div>
          </div>
        )}
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 lg:px-12 relative z-10 flex flex-col justify-center h-full pt-10 sm:pt-16 md:pt-20 pb-6 sm:pb-12 lg:pb-16">
        <div className="max-w-4xl">
          {subtitle && (
            <p className="text-white/80 text-[10px] sm:text-sm font-medium uppercase tracking-[0.2em] mb-1 sm:mb-2">
              {subtitle}
            </p>
          )}
          <h1 className="text-white text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold uppercase mb-1.5 sm:mb-3 drop-shadow-md">
            {title}
          </h1>
          {description && (
            <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-3xl font-light drop-shadow-sm whitespace-pre-line mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-none">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

