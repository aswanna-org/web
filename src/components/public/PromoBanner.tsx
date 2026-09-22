import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function PromoBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 lg:px-8 py-4 sm:py-6 my-4 sm:my-8 font-roboto">
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[var(--color-secondary)] shadow-lg">
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1595841696677-6479c04c0e15?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%) blur(2px)'
          }}
        ></div>
        
        <div className="relative z-10 px-5 sm:px-8 lg:px-12 py-5 sm:py-7 lg:py-9">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
            
            {/* Left Side: Images */}
            <div className="relative h-[170px] sm:h-[210px] lg:h-[230px] flex items-center justify-center lg:justify-start">
              <div className="absolute left-4 sm:left-8 lg:left-6 top-0 w-[140px] sm:w-[180px] lg:w-[200px] h-[160px] sm:h-[200px] lg:h-[220px] shadow-xl z-20">
                <img
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80"
                  alt="Agriculture Watering"
                  className="w-full h-full object-cover rounded-xl border-2 sm:border-3 border-white/25"
                />
              </div>
              
              <div className="absolute left-[125px] sm:left-[170px] lg:left-[185px] top-4 sm:top-6 w-[110px] sm:w-[140px] lg:w-[155px] h-[130px] sm:h-[165px] lg:h-[180px] shadow-lg z-10">
                <img
                  src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80"
                  alt="Fresh Vegetables"
                  className="w-full h-full object-cover rounded-xl border-2 sm:border-3 border-white/25"
                />
              </div>
            </div>

            {/* Right Side: Text and Button */}
            <div className="flex flex-col items-start lg:pl-6 relative z-20 mt-2 lg:mt-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-snug mb-3 sm:mb-4 drop-shadow-md max-w-lg">
                {t('promo.title')}
              </h2>
              <button 
                onClick={() => navigate('/about')}
                className="glass-btn px-6 py-2.5 sm:px-8 sm:py-3 tracking-wider text-xs sm:text-sm font-semibold cursor-pointer"
              >
                {t('promo.button')}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}

