import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      id: 1,
      image: '/images/features/traditional_farming.jpg',
      titleKey: 'features.traditional',
      fallbackTitle: 'සම්ප්‍රදායික කෘෂිකර්මාන්තය',
      link: '/categories'
    },
    {
      id: 2,
      image: '/images/features/agri_advisory.jpg',
      titleKey: 'features.advisory',
      fallbackTitle: 'අස්වැන්න කෘෂි උපදේශන සේවය',
      link: '/contact'
    },
    {
      id: 3,
      image: '/images/features/smart_crop_guide.jpg',
      titleKey: 'features.smartGuide',
      fallbackTitle: 'ස්මාර්ට් බෝග මඟපෙන්වීම',
      link: '/plant-finder'
    },
    {
      id: 4,
      image: '/images/features/cost_calculator.jpg',
      titleKey: 'features.calculator',
      fallbackTitle: 'වගා වියදම් ගණකය',
      link: '/agri-info-hub'
    }
  ];

  return (
    <section className="relative w-full">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 relative z-10 -mt-6 sm:-mt-24 pb-8 sm:pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {features.map((feature, idx) => {
            const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400'];
            const delayClass = delays[idx % delays.length];

            return (
              <Link
                to={feature.link}
                key={feature.id}
                className={`reveal-fade-up ${delayClass} relative group cursor-pointer h-44 sm:h-72 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl block`}
              >
                <img
                  src={feature.image}
                  alt={t(feature.titleKey, feature.fallbackTitle)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gentle green gradient overlay (replaces heavy black) */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/45 via-black/10 to-transparent group-hover:from-emerald-950/60 transition-colors duration-300 pointer-events-none" />

                {/* Frosted Glass Pill Button - Strictly Single Row */}
                <div className="absolute bottom-0 inset-x-0 flex justify-center pb-2.5 sm:pb-4 px-1.5 sm:px-2.5">
                  <div className="relative overflow-hidden w-full bg-white/20 hover:bg-white/35 group-hover:bg-white/30 backdrop-blur-xl border border-white/50 group-hover:border-white/80 text-white font-bold py-1.5 sm:py-2.5 pl-2.5 sm:pl-3.5 pr-1 sm:pr-1.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.25),inset_0_1.5px_2px_rgba(255,255,255,0.7)] flex items-center justify-between transition-all duration-300 group-hover:scale-[1.02] select-none min-h-[36px] sm:min-h-[44px]">
                    {/* Top glass reflection sheen */}
                    <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none rounded-t-full"></div>

                    {/* Single-line text with balanced sizing so no translation hides */}
                    <span className="relative z-10 flex-1 min-w-0 text-[10px] min-[370px]:text-[11px] sm:text-xs md:text-sm lg:text-[11.5px] xl:text-[13px] 2xl:text-[14.5px] font-bold tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-left whitespace-nowrap leading-normal">
                      {t(feature.titleKey, feature.fallbackTitle)}
                    </span>

                    {/* Circular Arrow Badge */}
                    <div className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 xl:w-7 xl:h-7 rounded-full bg-white/30 backdrop-blur-md border border-white/70 flex items-center justify-center text-white group-hover:rotate-45 group-hover:bg-white/45 transition-all duration-300 shadow-sm shrink-0 ml-1 sm:ml-1.5">
                      <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 xl:w-4 xl:h-4 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
