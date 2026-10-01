import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HeroCarousel() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: '/images/hero_farm_1.jpg',
      tagKey: 'hero.slide1.tag',
      titleKey: 'hero.slide1.title',
      descKey: 'hero.slide1.desc',
      buttonKey: 'hero.slide1.button',
    },
    {
      id: 2,
      image: '/images/hero_farm_2.jpg',
      tagKey: 'hero.slide2.tag',
      titleKey: 'hero.slide2.title',
      descKey: 'hero.slide2.desc',
      buttonKey: 'hero.slide2.button',
    },
    {
      id: 3,
      image: '/images/hero_farm_3.jpg',
      tagKey: 'hero.slide3.tag',
      titleKey: 'hero.slide3.title',
      descKey: 'hero.slide3.desc',
      buttonKey: 'hero.slide3.button',
    }
  ];

  // Auto advance slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section className="relative w-full h-[55vh] min-h-[400px] sm:h-screen sm:min-h-[700px] overflow-hidden bg-[var(--color-secondary)] text-white pt-16 sm:pt-[88px]">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
        >
          {/* Overlay to darken image */}
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          {/* We add a green tint overlay similar to design */}
          <div className="absolute inset-0 bg-[#245b37]/30 mix-blend-multiply z-10"></div>

          <img
            src={slide.image}
            alt={t(slide.titleKey)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center sm:justify-start">
        <div className="w-full max-w-3xl lg:max-w-4xl mt-4 sm:mt-20 lg:mt-0 flex flex-col items-center sm:items-start text-center sm:text-left">
          <p className="uppercase tracking-widest text-[11px] sm:text-sm font-semibold mb-1.5 sm:mb-4 opacity-90 text-[var(--color-primary)]">
            {t(slides[currentSlide].tagKey)}
          </p>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 sm:mb-6 leading-tight relative">
            {t(slides[currentSlide].titleKey)}
            {/* Simple decoration */}
            <span className="absolute -top-4 -right-8 lg:-right-12 text-[var(--color-primary)] opacity-80 select-none hidden sm:block">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 lg:w-10 lg:h-10">
                <path d="M12 2L15 8L21 9L16 14L18 20L12 17L6 20L8 14L3 9L9 8L12 2Z" />
              </svg>
            </span>
          </h1>

          <p className="text-xs sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-10 opacity-90 max-w-2xl leading-relaxed line-clamp-3 sm:line-clamp-none mx-auto sm:mx-0">
            {t(slides[currentSlide].descKey)}
          </p>

          <button 
            onClick={() => window.location.href = '/agri-info-hub'}
            className="inline-flex items-center gap-3.5 pl-6 sm:pl-8 pr-2.5 sm:pr-3 py-2 sm:py-2.5 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-xl border border-white/50 hover:border-white/80 text-white font-bold text-xs sm:text-base shadow-[0_10px_35px_rgba(0,0,0,0.25),inset_0_1.5px_2px_rgba(255,255,255,0.7)] hover:shadow-[0_14px_45px_rgba(0,0,0,0.35),inset_0_2px_2.5px_rgba(255,255,255,0.9)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
          >
            <span>{t(slides[currentSlide].buttonKey)}</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/30 backdrop-blur-md border border-white/60 flex items-center justify-center text-white group-hover:rotate-45 transition-transform duration-300 shadow-2xs shrink-0">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
          </button>
        </div>
      </div>

      {/* Carousel Controls */}
      <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 sm:gap-4 hidden sm:flex">
        <button
          onClick={prevSlide}
          className="glass-btn w-11 h-11 sm:w-13 sm:h-13 !p-0"
          aria-label="Previous slide"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="glass-btn w-11 h-11 sm:w-13 sm:h-13 !p-0"
          aria-label="Next slide"
        >
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </section>
  );
}
