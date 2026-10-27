import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

export default function MushroomSection() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language.startsWith('si');

  return (
    <section className="py-6 sm:py-10 bg-transparent font-roboto">
      <div className="container mx-auto px-4 lg:px-8">
        <Link
          to="/mushrooms"
          className="reveal-scale group relative block w-full transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-4 sm:gap-8 md:gap-12">
            
            {/* Left Content (Title & ↗ LEARN MORE Link) */}
            <div className="flex flex-col justify-center space-y-2 sm:space-y-4 max-w-[60%] sm:max-w-[65%]">
              
              {/* Stacked Clean Title */}
              <div className="space-y-0.5 sm:space-y-1">
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.08]">
                  {isSinhala ? 'බිම්මල්' : 'Mushroom'}
                </h2>
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.08]">
                  {isSinhala ? 'ගැන දැනගන්න' : 'Cultivation'}
                </h2>
              </div>

              {/* ↗ LEARN MORE Action Link */}
              <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-emerald-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                  <ArrowUpRight size={22} className="stroke-[2.5]" />
                </div>
                <span className="text-emerald-600 group-hover:text-emerald-700 font-bold uppercase tracking-wider text-xs sm:text-sm md:text-base transition-colors">
                  {isSinhala ? 'බිම්මල් ගැන දැනගන්න' : 'LEARN MORE'}
                </span>
              </div>

            </div>

            {/* Right Side: Mushroom GIF at full size */}
            <div className="flex items-center justify-center shrink-0">
              <img
                src="/images/manual_added/mushroom.gif"
                alt="Aswanna Organic Mushrooms"
                className="w-auto h-auto max-h-[160px] sm:max-h-[240px] md:max-h-[290px] lg:max-h-[330px]
                  object-contain select-none transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>

          </div>
        </Link>
      </div>
    </section>
  );
}