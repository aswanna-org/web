import { useTranslation } from 'react-i18next';
import { Users, Leaf } from 'lucide-react';

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full py-16 lg:py-24 bg-white font-roboto overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Images */}
          <div className="relative max-w-lg mx-auto lg:mx-0 w-full lg:w-11/12 mt-8 lg:mt-0">
            {/* Main Image */}
            <div className="relative rounded-lg overflow-hidden shadow-xl aspect-[3/4] w-full sm:w-[85%] ml-auto">
              <img 
                src="/images/about_main.jpg" 
                alt="Windmill" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Small Overlapping Image */}
            <div className="absolute -bottom-8 -left-4 sm:left-0 sm:-bottom-12 w-2/3 sm:w-1/2 aspect-[4/3] rounded-lg overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="/images/about_small.jpg" 
                alt="Hay bale" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Badge */}
            <div className="absolute top-12 -left-2 sm:-left-8 bg-[var(--color-primary)] text-white w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-lg animate-pulse-slow z-10" style={{ animationDuration: '4s' }}>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Trusted By</span>
              <span className="text-3xl sm:text-4xl font-extrabold">8900</span>
              {/* Little speech bubble tail */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[var(--color-primary)] rotate-45 transform origin-top-left"></div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="flex flex-col pt-12 lg:pt-0 lg:pl-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 text-[var(--color-primary)]">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                 </svg>
              </div>
              <span className="text-[var(--color-secondary)] uppercase font-bold tracking-widest text-xs sm:text-sm">
                {t('about.subtitle')}
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-secondary)] leading-tight mb-6">
              {t('about.title')}
            </h2>

            <p className="text-xl sm:text-2xl text-[var(--color-primary)] mb-6 font-medium italic">
              {t('about.experience')}
            </p>

            <p className="text-gray-500 mb-8 leading-relaxed text-sm sm:text-base">
              {t('about.desc')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 border-t border-b border-gray-100 py-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0 text-[var(--color-primary)]">
                  <Users strokeWidth={1.5} className="w-full h-full" />
                </div>
                <span className="font-bold text-[var(--color-secondary)] text-lg leading-tight">
                  {t('about.professional')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0 text-[var(--color-primary)]">
                  <Leaf strokeWidth={1.5} className="w-full h-full" />
                </div>
                <span className="font-bold text-[var(--color-secondary)] text-lg leading-tight">
                  {t('about.organic')}
                </span>
              </div>
            </div>

            <div>
              <button className="mt-8 px-8 py-4 bg-black/5 backdrop-blur-md hover:bg-black/10 text-gray-800 font-bold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 uppercase tracking-wider">
            {t('about.button')}
          </button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
