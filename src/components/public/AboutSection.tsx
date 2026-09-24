import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Users, Leaf } from 'lucide-react';

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full py-10 lg:py-24 bg-white font-roboto overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 items-center">
          
          {/* Left Side: Images */}
          <div className="reveal-fade-right relative max-w-lg mx-auto lg:mx-0 w-full lg:w-11/12 mt-4 lg:mt-0">
            {/* Main Image */}
            <div className="relative rounded-lg overflow-hidden shadow-xl aspect-[4/3] sm:aspect-[3/4] w-full sm:w-[85%] ml-auto">
              <img 
                src="/images/about_main.jpg" 
                alt="Windmill" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Small Overlapping Image */}
            <div className="absolute -bottom-4 -left-2 sm:left-0 sm:-bottom-12 w-1/2 sm:w-1/2 aspect-[4/3] rounded-lg overflow-hidden shadow-2xl border-4 sm:border-8 border-white">
              <img 
                src="/images/about_small.jpg" 
                alt="Hay bale" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Badge */}
            <div className="absolute top-4 -left-2 sm:-left-8 bg-[var(--color-primary)] text-white w-20 h-20 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-lg animate-pulse-slow z-10" style={{ animationDuration: '4s' }}>
              <span className="text-[8px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">Trusted By</span>
              <span className="text-xl sm:text-4xl font-extrabold">8900</span>
              {/* Little speech bubble tail */}
              <div className="absolute -bottom-1.5 right-4 sm:right-6 w-3 h-3 sm:w-4 sm:h-4 bg-[var(--color-primary)] rotate-45 transform origin-top-left"></div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="reveal-fade-left delay-150 flex flex-col pt-6 lg:pt-0 lg:pl-12">
            <div className="flex items-center gap-2 mb-2 sm:mb-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-primary)]">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                 </svg>
              </div>
              <span className="text-[var(--color-secondary)] uppercase font-bold tracking-widest text-[11px] sm:text-sm">
                {t('about.subtitle')}
              </span>
            </div>

            <h2 className="text-2xl sm:text-5xl font-extrabold text-[var(--color-secondary)] leading-tight mb-3 sm:mb-6">
              {t('about.title')}
            </h2>

            <p className="text-base sm:text-2xl text-[var(--color-primary)] mb-3 sm:mb-6 font-medium italic">
              {t('about.experience')}
            </p>

            <p className="text-gray-500 mb-6 sm:mb-8 leading-relaxed text-xs sm:text-base">
              {t('about.desc')}
            </p>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10 border-t border-b border-gray-100 py-4 sm:py-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 text-[var(--color-primary)]">
                  <Users strokeWidth={1.5} className="w-full h-full" />
                </div>
                <span className="font-bold text-[var(--color-secondary)] text-xs sm:text-lg leading-tight">
                  {t('about.professional')}
                </span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 text-[var(--color-primary)]">
                  <Leaf strokeWidth={1.5} className="w-full h-full" />
                </div>
                <span className="font-bold text-[var(--color-secondary)] text-xs sm:text-lg leading-tight">
                  {t('about.organic')}
                </span>
              </div>
            </div>

            <div>
              <Link 
                to="/about"
                className="glass-btn-light mt-2 sm:mt-8 px-6 py-2.5 sm:px-9 sm:py-4 uppercase tracking-wider text-xs sm:text-base inline-flex"
              >
                {t('about.button', 'Discover More')}
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
