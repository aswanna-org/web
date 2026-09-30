import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
      fallbackTitle: 'ස්මාර්ට් බෝග මඟපෙන්වුම් පද්ධතිය',
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
      <div className="container mx-auto px-4 lg:px-8 relative z-10 -mt-6 sm:-mt-24 pb-8 sm:pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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

                {/* Subtle dark gradient overlay so text and glass badge are crystal clear */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-300 pointer-events-none" />

                {/* Liquid Glassmorphism label box with full text display */}
                <div className="absolute bottom-0 left-0 w-full flex justify-center pb-2.5 sm:pb-4 px-2 sm:px-3">
                  <div className="relative overflow-hidden w-full max-w-[96%] sm:max-w-[92%] bg-black/45 group-hover:bg-emerald-950/75 backdrop-blur-xl border border-white/40 group-hover:border-emerald-400/60 text-white font-bold py-1.5 sm:py-2.5 px-2 sm:px-3.5 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] flex items-center justify-center transition-all duration-300 group-hover:scale-[1.02] select-none min-h-[36px] sm:min-h-[44px]">
                    {/* Top glass reflection sheen */}
                    <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none rounded-t-full"></div>

                    <span className="relative z-10 text-[11px] sm:text-xs md:text-[13px] lg:text-sm font-semibold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] text-center leading-tight whitespace-normal break-words">
                      {t(feature.titleKey, feature.fallbackTitle)}
                    </span>
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

