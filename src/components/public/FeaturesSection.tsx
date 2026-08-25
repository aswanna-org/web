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
            <div key={feature.id} className="relative group cursor-pointer h-64 sm:h-72 rounded-lg overflow-hidden shadow-lg transition-transform hover:-translate-y-2">
              <img
                src={feature.image}
                alt={t(feature.titleKey)}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* White label box overlapping the bottom edge of the image */}
              <div className="absolute bottom-0 left-0 w-full flex justify-center pb-4">
                <div className="bg-white text-[var(--color-secondary)] font-bold py-3 px-6 rounded-md shadow-md text-center min-w-[80%] max-w-[90%] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
                  {t(feature.titleKey)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
