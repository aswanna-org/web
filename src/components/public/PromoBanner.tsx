import { useTranslation } from 'react-i18next';

export default function PromoBanner() {
  const { t } = useTranslation();

  return (
    <section className="relative w-full py-3 mt-32 mb-20 font-roboto">

      {/* Green Background & Pattern Wrapper */}
      <div className="absolute inset-0 bg-[var(--color-secondary)]">
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1595841696677-6479c04c0e15?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%) blur(2px)'
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[150px]">

          {/* Left Side: Overlapping Images Breaking Out */}
          <div className="relative h-[400px] lg:h-[350px] flex items-center justify-center lg:justify-start">

            {/* Main Tall Image (Breaks out top and bottom) */}
            <div className="absolute left-4 sm:left-12 lg:left-0 -top-16 lg:-top-24 w-[220px] sm:w-[280px] h-[450px] lg:h-[500px] shadow-2xl z-20">
              <img
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80"
                alt="Agriculture Watering"
                className="w-full h-full object-cover rounded-sm border-4 border-white/20"
              />
            </div>

            {/* Secondary Smaller Image */}
            <div className="absolute left-[180px] sm:left-[280px] lg:left-[240px] top-4 w-[180px] sm:w-[240px] h-[280px] lg:h-[320px] shadow-xl z-10">
              <img
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80"
                alt="Windmill Farm"
                className="w-full h-full object-cover rounded-sm border-4 border-white/20"
              />
            </div>

          </div>

          {/* Right Side: Text and Button */}
          <div className="flex flex-col items-start lg:pl-16 relative z-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-8 drop-shadow-md max-w-lg">
              {t('promo.title')}
            </h2>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 tracking-wider">
              {t('promo.button')}
            </button>
          </div>

        </div>
      </div>

    </section>
  );
}
