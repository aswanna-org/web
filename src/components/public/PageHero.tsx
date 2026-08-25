

interface PageHeroProps {
  title: string;
  subtitle?: string; // Small uppercase text above title
  description?: string; // Larger text below title
  image: string;
  gradientColor?: string; // e.g., 'var(--color-primary)' or '#2d6a4f'
}

export default function PageHero({ 
  title, 
  subtitle, 
  description,
  image, 
  gradientColor = 'var(--color-primary)' 
}: PageHeroProps) {
  return (
    <section className="relative w-full h-[60vh] min-h-[400px] flex flex-col justify-center overflow-hidden">
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

      <div className="container mx-auto px-4 lg:px-12 relative z-10 flex flex-col justify-center h-full pt-16">
        <div className="max-w-3xl">
          {subtitle && (
            <p className="text-white/80 text-sm font-medium uppercase tracking-[0.2em] mb-3">
              {subtitle}
            </p>
          )}
          <h1 className="text-white text-5xl md:text-6xl font-bold uppercase mb-6 drop-shadow-md">
            {title}
          </h1>
          {description && (
            <p className="text-white/90 text-lg md:text-xl leading-relaxed max-w-2xl font-light drop-shadow-sm whitespace-pre-line">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
