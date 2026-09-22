import { useTranslation } from 'react-i18next';

export default function ProductsSection() {
  const { t } = useTranslation();

  const products = [
    { name: t('products.blueberry'), emoji: '🫐' },
    { name: t('products.strawberry'), emoji: '🍓' },
    { name: t('products.apples'), emoji: '🍎' },
    { name: t('products.orange'), emoji: '🍊' },
    { name: t('products.carrot'), emoji: '🥕' },
    { name: t('products.cabbage'), emoji: '🥬' },
    { name: t('products.potato'), emoji: '🥔' },
    { name: t('products.eggplant'), emoji: '🍆' },
  ];

  return (
    <section className="relative w-full py-8 sm:py-24 bg-white overflow-hidden font-roboto">

      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span className="text-[7rem] sm:text-[20rem] lg:text-[35rem] font-extrabold text-gray-50 tracking-tighter opacity-70 whitespace-nowrap -translate-y-12 sm:-translate-y-24">
          AGRO
        </span>
      </div>

      <div className="container mx-auto px-4 lg:px-12 relative z-10">

        {/* Top Half: Left Title + Right Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center mb-8 sm:mb-32">

          {/* Left Title Area */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-lg mx-auto lg:mx-0">
            {/* Custom 3-leaf icon */}
            <div className="text-[var(--color-primary)] mb-2 sm:mb-6 flex justify-center lg:justify-start w-full">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-12 sm:h-12 opacity-80">
                <path d="M12 22c0-4-3-8-3-11 0-3 3-5 3-5s3 2 3 5c0 3-3 7-3 11z" />
                <path d="M12 11c-2-2-6-3-8-1 0 0 1 4 4 5" />
                <path d="M12 11c2-2 6-3 8-1 0 0-1 4-4 5" />
              </svg>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-[3.5rem] font-extrabold text-gray-800 leading-tight mb-1 sm:mb-2 uppercase tracking-tight">
              {t('products.title1')}<br />{t('products.title2')}
            </h2>
            <h3 className="text-base sm:text-3xl lg:text-[3rem] font-light text-gray-400/80 leading-tight mb-4 sm:mb-10 uppercase tracking-tight" style={{ fontFamily: 'sans-serif' }}>
              {t('products.subtitle')}
            </h3>

            <button 
              onClick={() => window.location.href = '/marketplace'}
              className="glass-btn-light px-6 py-2.5 sm:px-9 sm:py-4 uppercase tracking-wider text-xs sm:text-base"
            >
              {t('products.more')}
            </button>
          </div>

          {/* Right Grid Area */}
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 sm:gap-y-12 sm:gap-x-6 w-full max-w-2xl mx-auto lg:mr-0 pt-2 lg:pt-0">
            {products.map((item, index) => (
              <div key={index} className="flex flex-col items-center justify-center group cursor-pointer">
                <div className="text-3xl sm:text-6xl mb-1.5 sm:mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                  {item.emoji}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors text-center">
                  {item.name}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Half: Handwritten Typography */}
        <div className="flex justify-center text-center mt-6 sm:mt-12 w-full relative z-10">
          <h2 className="font-caveat text-[2.2rem] sm:text-[6rem] lg:text-[8rem] leading-[1] drop-shadow-sm w-full">
            <span className="text-[#6c6742] inline-block hover:scale-105 transition-transform">{t('products.healthy')}</span>
            <span className="text-[#ff535c] inline-block hover:scale-105 transition-transform ml-2">{t('products.life')}</span>
            <span className="text-[#fbb140] inline-block hover:scale-105 transition-transform ml-2 sm:ml-5">{t('products.with')}</span>
            <br />
            <span className="text-[#fbd245] inline-block hover:scale-105 transition-transform mt-1 sm:mt-2">{t('products.fresh')}</span>
            <span className="text-[#5b9e54] inline-block hover:scale-105 transition-transform ml-2 sm:ml-5">{t('products.productsTxt')}</span>
          </h2>
        </div>

      </div>
    </section>
  );
}
