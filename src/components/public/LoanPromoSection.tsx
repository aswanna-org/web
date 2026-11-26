import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

export default function LoanPromoSection() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language.startsWith('si');
  const navigate = useNavigate();

  return (
    // Extra top padding gives the 3D coin & sprout image room to pop out above the card
    <section className="pt-12 sm:pt-16 md:pt-20 pb-3 sm:pb-5 bg-transparent font-roboto">
      <div className="container mx-auto px-4 lg:px-8">
        {/* No overflow-hidden so the 3D loan image can pop out cleanly */}
        <Link
          to="/loans"
          className="reveal-scale group relative block w-full h-[155px] sm:h-[175px] md:h-[190px] rounded-2xl sm:rounded-3xl border border-gray-200/70 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
          {/* Left: 3D Loan Sprout & Coins Image sticking out */}
          <img
            src="/images/manual_added/loan_promo.png"
            alt="Aswanna Agricultural Loans"
            className="absolute left-0 -top-8 h-[130px] w-auto sm:top-auto sm:-bottom-2 sm:left-6 sm:h-[220px] md:left-10 md:h-[250px] lg:h-[270px] origin-bottom object-contain select-none pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Right content: title, subtitle, compact pill button */}
          <div className="relative z-10 flex h-full flex-col justify-between items-end text-right p-4 sm:p-6 md:px-8 ml-auto max-w-[70%] sm:max-w-[62%]">
            <div className="space-y-0.5 sm:space-y-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-[1.15]">
                {isSinhala ? 'ණය යෝජනා' : 'Agricultural Loans'}
              </h2>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-500 tracking-tight leading-[1.15]">
                {isSinhala ? 'අත්වැලක්' : 'Financial Support'}
              </h3>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/loans');
                }}
                className="inline-flex items-center gap-2.5 sm:gap-3 pl-4 sm:pl-6 pr-2 sm:pr-2.5 py-1.5 sm:py-2 rounded-full bg-[#f1e3c8] hover:bg-[#e8d6b3] border border-[#c8a574]/70 hover:border-[#c8a574] text-black font-bold text-xs sm:text-sm md:text-base shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <span>
                  {isSinhala
                    ? 'ගොවීන් සහ ව්‍යවසායකයින් සැමට'
                    : 'For all farmers & entrepreneurs'}
                </span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-[#c8a574]/40 border border-[#c8a574] flex items-center justify-center text-black group-hover:rotate-45 transition-transform duration-300 shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </button>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
