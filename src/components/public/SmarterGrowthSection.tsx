import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SmarterGrowthSection() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cards = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=1000&auto=format&fit=crop&q=80',
      stat: 'Up to 45%',
      statSi: '45% දක්වා',
      label: 'Reduction in Crop Loss',
      labelSi: 'අස්වනු හානිය අවම කර ගැනීම',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1000&auto=format&fit=crop&q=80',
      stat: 'Up to 2x',
      statSi: '2 ගුණයක',
      label: 'Faster Crop Monitoring',
      labelSi: 'වේගවත් බෝග නිරීක්ෂණය',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1000&auto=format&fit=crop&q=80',
      stat: 'Up to 50%',
      statSi: '50% දක්වා',
      label: 'Improvement in Resource Efficiency',
      labelSi: 'සම්පත් භාවිතයේ ඉහළ කාර්යක්ෂමතාව',
    },
  ];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    const cardWidth = offsetWidth * 0.82;
    const index = Math.round(scrollLeft / (cardWidth || 1));
    setActiveIdx(Math.min(Math.max(index, 0), cards.length - 1));
  };

  const scrollToIndex = (idx: number) => {
    if (!scrollRef.current) return;
    const cardEl = scrollRef.current.children[idx] as HTMLElement;
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setActiveIdx(idx);
    }
  };

  return (
    <section className="w-full py-12 sm:py-16 lg:py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* ── Top Header Row ── */}
        <div className="reveal-fade-up flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
          
          {/* Left Column: Main Title */}
          <div className="max-w-2xl">
            {/* Main Heading */}
            <h2 className="text-2xl sm:text-4xl lg:text-[44px] xl:text-5xl font-black text-gray-900 tracking-tight leading-[1.18] sm:leading-[1.14]">
              {isSinhala
                ? 'ගොවීන් සහ කෘෂි ව්‍යවසායකයින් සඳහා වඩාත් සුහුරු වර්ධනයක්'
                : 'Supporting Smarter Growth for Farmers & Agri-Businesses'}
            </h2>
          </div>

          {/* Right Column: Description & Glass CTA Button */}
          <div className="flex flex-col items-start lg:items-start gap-4 sm:gap-5 lg:max-w-md">
            <p className="text-xs sm:text-base text-gray-500 font-normal leading-relaxed">
              {isSinhala
                ? 'ඩිජිටල් කාර්ය ප්‍රවාහයන්, පුරෝකථන තීක්ෂ්ණ බුද්ධිය සහ වඩා හොඳ අවදානම් කළමනාකරණය ඒකාබද්ධ කරමින් ගොවිපළවල් වඩාත් බුද්ධිමත්ව මෙහෙයවීමට සහාය වීම.'
                : 'Helping farms operate smarter by combining digital workflows, predictive insights, and better risk management.'}
            </p>

            <Link
              to="/agri-info-hub"
              className="inline-flex items-center gap-3.5 pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2 sm:py-2.5 rounded-full bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-white/80 hover:border-emerald-300 text-gray-900 font-bold text-xs sm:text-base shadow-[0_8px_30px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.12),inset_0_2px_2.5px_rgba(255,255,255,1)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
            >
              <span>{isSinhala ? 'දැන්ම අරඹන්න' : 'Get started'}</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 border border-white/90 shadow-xs flex items-center justify-center text-gray-900 group-hover:rotate-45 transition-transform duration-300 shrink-0">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </Link>
          </div>
        </div>

        {/* ── Metric Feature Cards Area (Mobile Touch-Swipe Snap Carousel / Desktop 3-Col Grid) ── */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-14 overflow-x-auto md:overflow-visible snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-2 scroll-smooth"
        >
          {cards.map((card, idx) => {
            const delayClass = idx === 0 ? 'delay-100' : idx === 1 ? 'delay-200' : 'delay-300';
            const statText = isSinhala ? card.statSi : card.stat;
            const labelText = isSinhala ? card.labelSi : card.label;

            return (
              <div
                key={card.id}
                className={`reveal-fade-up ${delayClass} relative rounded-[24px] sm:rounded-[32px] overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.18)] transition-all duration-500 h-[330px] sm:h-[400px] md:h-[430px] lg:h-[470px] hover:-translate-y-1.5 w-[84vw] sm:w-[70vw] md:w-auto shrink-0 snap-center`}
              >
                {/* Background Image with Zoom on Hover */}
                <img
                  src={card.image}
                  alt={labelText}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 pointer-events-none" />

                {/* Glass Rim Border */}
                <div className="absolute inset-0 rounded-[24px] sm:rounded-[32px] border border-white/15 group-hover:border-white/30 transition-colors pointer-events-none" />

                {/* Bottom Content Area (With Frosted Glass Backdrop on Mobile) */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-end text-white">
                  <div className="bg-black/35 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border border-white/20 md:border-0 rounded-2xl md:rounded-none p-4 md:p-0">
                    <h3 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-white tracking-tight leading-none drop-shadow-sm">
                      {statText}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-white/90 mt-1.5 sm:mt-2 leading-snug drop-shadow-sm">
                      {labelText}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Mobile-Only Interactive Carousel Controls (Pagination Pills + Navigation Arrows) ── */}
        <div className="flex md:hidden items-center justify-between mt-4 px-1">
          {/* Active Dot / Pill Indicators */}
          <div className="flex items-center gap-1.5">
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIdx === i ? 'w-7 bg-[#006837]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Touch / Click Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToIndex(Math.max(activeIdx - 1, 0))}
              disabled={activeIdx === 0}
              className="w-8 h-8 rounded-full bg-white border border-gray-200/90 shadow-2xs flex items-center justify-center text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
              aria-label="Previous card"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToIndex(Math.min(activeIdx + 1, cards.length - 1))}
              disabled={activeIdx === cards.length - 1}
              className="w-8 h-8 rounded-full bg-white border border-gray-200/90 shadow-2xs flex items-center justify-center text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
              aria-label="Next card"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
