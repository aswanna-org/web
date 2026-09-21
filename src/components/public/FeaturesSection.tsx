import { useTranslation } from 'react-i18next';

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      id: 1,
      image: '/images/feature_carrots.jpg',
      titleKey: 'features.leader'
    },
    {
      id: 2,
      image: '/images/feature_sunflower.jpg',
      titleKey: 'features.quality'
    },
    {
      id: 3,
      image: '/images/feature_tractor.jpg',
      titleKey: 'features.services'
    },
    {
      id: 4,
      image: '/images/feature_basket.jpg',
      titleKey: 'features.fresh'
    }
  ];

  return (
    <section className="relative w-full">

      <div className="container mx-auto px-4 lg:px-8 relative z-10 -mt-16 sm:-mt-24 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.id} className="relative group cursor-pointer h-64 sm:h-72 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <img
                src={feature.image}
                alt={t(feature.titleKey)}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Liquid Glassmorphism label box overlapping the bottom edge of the image */}
              <div className="absolute bottom-0 left-0 w-full flex justify-center pb-4 px-3">
                <div className="relative overflow-hidden w-full max-w-[88%] bg-white/25 group-hover:bg-white/35 backdrop-blur-xl border border-white/70 text-white font-bold py-3 px-4 sm:px-5 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.25),inset_0_1.5px_2px_rgba(255,255,255,0.85),inset_0_-1.5px_2px_rgba(0,0,0,0.15)] text-center transition-all duration-300 group-hover:scale-[1.02] select-none">
                  {/* Top glass reflection sheen */}
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none rounded-t-full"></div>
                  <span className="relative z-10 text-xs sm:text-sm md:text-base font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    {t(feature.titleKey)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
