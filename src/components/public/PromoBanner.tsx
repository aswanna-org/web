import { useTranslation } from 'react-i18next';

export default function PromoBanner() {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 lg:px-8 py-10 mt-16 mb-16 font-roboto">
      <div className="relative w-full rounded-3xl overflow-hidden bg-[var(--color-secondary)] shadow-xl">
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1595841696677-6479c04c0e15?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%) blur(2px)'
          }}
        ></div>
        
        <div className="relative z-10 px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[250px]">
            
            {/* Left Side: Images */}
            <div className="relative h-[300px] flex items-center justify-center lg:justify-start">
              <div className="absolute left-4 lg:left-12 top-0 w-[200px] sm:w-[240px] h-[280px] lg:h-[300px] shadow-2xl z-20">
                <img
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80"
                  alt="Agriculture Watering"
                  className="w-full h-full object-cover rounded-xl border-4 border-white/20"
                />
              </div>
              
              <div className="absolute left-[160px] sm:left-[220px] lg:left-[240px] top-12 w-[150px] sm:w-[180px] h-[200px] lg:h-[220px] shadow-xl z-10">
                <img
                  src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80"
                  alt="Windmill Farm"
                  className="w-full h-full object-cover rounded-xl border-4 border-white/20"
                />
              </div>
            </div>

            {/* Right Side: Text and Button */}
            <div className="flex flex-col items-start lg:pl-16 relative z-20 mt-8 lg:mt-0">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-snug mb-6 drop-shadow-md max-w-lg">
                {t('promo.title')}
              </h2>
              <button className="px-8 py-3.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 tracking-wider">
                {t('promo.button')}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
