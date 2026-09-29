import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

export default function GovijanaSewaPromo() {
  const { t } = useTranslation();

  return (
    <section className="w-full py-10 sm:py-14 bg-gray-50/50 relative overflow-hidden font-roboto flex justify-center items-center">
      <div className="container mx-auto px-4 lg:px-8 relative z-10 flex justify-center">

        {/* Outer Banner Card */}
        <div className="reveal-scale relative w-full rounded-[24px] sm:rounded-[44px] overflow-hidden shadow-[0_16px_45px_rgba(0,0,0,0.12)] border border-white/60 min-h-[260px] sm:min-h-[400px] lg:min-h-[460px] flex items-center">
          
          {/* 100% Sharp and Clear Background Image */}
          <img
            src="/images/agri_hub_bg.jpg"
            alt="Agricultural Information Center"
            className="absolute inset-0 w-full h-full object-cover object-right lg:object-center transition-transform duration-1000 group-hover:scale-105"
          />

          {/* Subtle natural vignette shadow on left only for depth without obscuring image */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none"></div>

          {/* Floating High-Transparency Liquid Glass Panel */}
          <div className="reveal-fade-left delay-150 relative z-10 m-3 sm:m-8 lg:m-12 max-w-xl">
            <div className="relative overflow-hidden bg-white/25 hover:bg-white/30 backdrop-blur-xl border border-white/60 rounded-[20px] sm:rounded-[36px] p-4 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.22),inset_0_1.5px_2px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(0,0,0,0.15)] transition-all duration-300">
              
              {/* Specular glass reflection overlay */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none rounded-t-[20px] sm:rounded-t-[36px]"></div>

              <div className="relative z-10">
                <h2 className="text-lg sm:text-3xl lg:text-[2.5rem] font-bold text-[#032412] leading-[1.2] tracking-tight mb-2 sm:mb-3 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                  {t('agriHubPromo.subtitle', 'කෘෂි තොරතුරු කේන්ද්‍රය')}
                </h2>

                <p className="text-xs sm:text-base text-[#0a2f1a] mb-3 sm:mb-8 font-normal leading-relaxed drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] line-clamp-2 sm:line-clamp-none">
                  {t('agriHubPromo.desc', 'කෘෂිකර්මාන්තය සම්බන්ධ සියලු තොරතුරු ඔබට එක්තැනින් පහසුවෙන් ලබා ගැනීම.')}
                </p>

                <div className="pt-2">
                  <Link
                    to="/agri-info-hub"
                    className="inline-flex items-center gap-3.5 pl-6 sm:pl-8 pr-2.5 sm:pr-3 py-2 sm:py-2.5 rounded-full bg-[#c6f24d] hover:bg-[#b7eb3b] text-gray-950 font-bold text-xs sm:text-base shadow-[0_8px_25px_rgba(198,242,77,0.35)] hover:shadow-[0_12px_32px_rgba(198,242,77,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
                  >
                    <span>{t('agriHubPromo.button', 'පිවිසෙන්න')}</span>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center text-gray-900 group-hover:rotate-45 transition-transform duration-300 shadow-2xs shrink-0">
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
