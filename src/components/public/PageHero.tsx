

import React from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string; // Small uppercase text above title
  description?: string; // Larger text below title
  image: string;
  gradientColor?: string; // e.g., 'var(--color-primary)' or '#2d6a4f'
  children?: React.ReactNode;
}

export default function PageHero({ 
  title, 
  subtitle, 
  description, 
  image, 
  gradientColor = 'var(--color-primary)',
  children
}: PageHeroProps) {
  return (
    <section className="relative w-full h-[28vh] sm:h-[36vh] md:h-[44vh] min-h-[200px] sm:min-h-[260px] md:min-h-[340px] flex flex-col justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div 
          className="absolute inset-0 mix-blend-multiply"
          style={{
            background: `linear-gradient(to right, ${gradientColor} 0%, ${gradientColor}dd 30%, transparent 100%)`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-12 relative z-10 flex flex-col justify-center h-full pt-16 sm:pt-24 pb-4 sm:pb-8">
        <div className="max-w-4xl">
          {subtitle && (
            <p className="text-white/80 text-[10px] sm:text-sm font-medium uppercase tracking-[0.2em] mb-1.5 sm:mb-2.5">
              {subtitle}
            </p>
          )}
          <h1 className="text-white text-2xl sm:text-4xl md:text-5xl font-bold uppercase mb-2 sm:mb-3 drop-shadow-md">
            {title}
          </h1>
          {description && (
            <p className="text-white/90 text-xs sm:text-base md:text-xl leading-relaxed max-w-3xl font-light drop-shadow-sm whitespace-pre-line mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-none">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

