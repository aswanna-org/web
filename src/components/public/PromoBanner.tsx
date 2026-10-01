import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function PromoBanner() {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 lg:px-8 py-4 sm:py-6 my-4 sm:my-8 font-roboto">
      {/* Outer Card with Refined Rounded Border matching Reference Design */}
      <div className="reveal-scale relative w-full min-h-[250px] sm:min-h-[300px] md:min-h-[340px] rounded-[26px] sm:rounded-[36px] overflow-hidden border-2 sm:border-[3px] border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.18)] group">
        
        {/* Cinematic Agricultural Scenery Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-right md:bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
          style={{ backgroundImage: "url('/images/promo_banner_bg.jpg')" }}
        />

        {/* Smooth Dark Emerald Gradient Overlay Fading into the Scenery */}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#0d2218]/95 via-[#0d2218]/80 sm:via-[#0d2218]/70 via-55% to-transparent" />

        {/* Specular Top Rim Highlight */}
        <div className="absolute inset-0 pointer-events-none rounded-[24px] sm:rounded-[33px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]" />

        {/* Content Area */}
        <div className="relative z-10 h-full min-h-[250px] sm:min-h-[300px] md:min-h-[340px] flex flex-col justify-between p-6 sm:p-9 md:p-12 max-w-xl lg:max-w-2xl">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-black text-white leading-tight drop-shadow-md tracking-tight">
              {t('promo.title')}
            </h2>
            <p className="text-white/85 text-xs sm:text-sm md:text-base font-normal leading-relaxed mt-2 sm:mt-3 max-w-lg drop-shadow-sm">
              {isSinhala 
                ? 'ශ්‍රී ලාංකේය ගොවිබිමේ සිට ඉහළම ගුණාත්මක ප්‍රමිතියෙන් යුත් නැවුම් කෘෂි අස්වැන්න.' 
                : 'High-quality, freshly harvested agricultural produce directly from Sri Lankan farms.'}
            </p>
          </div>

          {/* Liquid Glass Pill Button matching Hero Carousel Signature */}
          <div className="mt-5 sm:mt-7 pt-1">
            <button 
              onClick={() => navigate('/agri-info-hub')}
              className="inline-flex items-center gap-3.5 pl-6 sm:pl-8 pr-2.5 sm:pr-3 py-2 sm:py-2.5 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-xl border border-white/50 hover:border-white/80 text-white font-bold text-xs sm:text-base shadow-[0_10px_35px_rgba(0,0,0,0.25),inset_0_1.5px_2px_rgba(255,255,255,0.7)] hover:shadow-[0_14px_45px_rgba(0,0,0,0.35),inset_0_2px_2.5px_rgba(255,255,255,0.9)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
            >
              <span>{t('promo.button')}</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/30 backdrop-blur-md border border-white/60 flex items-center justify-center text-white group-hover:rotate-45 transition-transform duration-300 shadow-2xs shrink-0">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}


