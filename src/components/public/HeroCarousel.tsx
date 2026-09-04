import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HeroCarousel() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: '/images/hero_farm_1.jpg',
      titleKey: 'hero.slide1.title',
      descKey: 'hero.slide1.desc',
    },
    {
      id: 2,
      image: '/images/hero_farm_2.jpg',
      titleKey: 'hero.slide2.title',
      descKey: 'hero.slide2.desc',
    },
    {
      id: 3,
      image: '/images/hero_farm_3.jpg',
      titleKey: 'hero.slide3.title',
      descKey: 'hero.slide3.desc',
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
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-[var(--color-secondary)] text-white pt-[88px]">
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
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl mt-20 lg:mt-0">
          <p className="uppercase tracking-widest text-xs sm:text-sm font-semibold mb-2 sm:mb-4 opacity-90">
            {t('hero.welcome')}
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight relative">
            {t(slides[currentSlide].titleKey)}
            {/* Simple decoration */}
            <span className="absolute -top-4 -right-8 lg:-right-12 text-[var(--color-primary)] opacity-80 select-none hidden sm:block">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 lg:w-10 lg:h-10">
                <path d="M12 2L15 8L21 9L16 14L18 20L12 17L6 20L8 14L3 9L9 8L12 2Z" />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 opacity-90 max-w-lg leading-relaxed">
            {t(slides[currentSlide].descKey)}
          </p>

          <button className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 uppercase tracking-wider">
            {t('hero.discoverMore')}
          </button>
        </div>
      </div>

      {/* Carousel Controls */}
      <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 sm:gap-4 hidden sm:flex">
        <button
          onClick={prevSlide}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/50 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/50 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </section>
  );
}
