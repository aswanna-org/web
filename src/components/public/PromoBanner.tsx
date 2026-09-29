import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function PromoBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 lg:px-8 py-4 sm:py-6 my-4 sm:my-8 font-roboto">
      <div className="reveal-scale relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[var(--color-secondary)] shadow-lg">
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
            <div className="reveal-fade-right delay-100 relative h-[170px] sm:h-[210px] lg:h-[230px] flex items-center justify-center lg:justify-start">
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
            <div className="reveal-fade-left delay-200 flex flex-col items-start lg:pl-6 relative z-20 mt-2 lg:mt-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-snug mb-3 sm:mb-4 drop-shadow-md max-w-lg">
                {t('promo.title')}
              </h2>
              <button 
                onClick={() => navigate('/agri-info-hub')}
                className="inline-flex items-center gap-3.5 pl-5 sm:pl-7 pr-2 sm:pr-2.5 py-1.5 sm:py-2 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-xl border border-white/50 text-white font-bold text-xs sm:text-sm shadow-[0_8px_30px_rgba(0,0,0,0.2),inset_0_1.5px_2px_rgba(255,255,255,0.7)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <span>{t('promo.button')}</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/30 backdrop-blur-md border border-white/60 flex items-center justify-center text-white group-hover:rotate-45 transition-transform duration-300 shadow-2xs shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}

