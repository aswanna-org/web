import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SmarterGrowthSection() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

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

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* ── Top Header Row ── */}
        <div className="reveal-fade-up flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
          
          {/* Left Column: Pill Badge & Main Title */}
          <div className="max-w-2xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b381e] text-[#4ade80] text-xs font-semibold mb-4 border border-[#166534]/50 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></span>
              <span>{isSinhala ? 'අපගේ මූලික විශේෂාංග' : 'Our Core Features'}</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-5xl font-black text-gray-900 tracking-tight leading-[1.14]">
              {isSinhala
                ? 'ගොවීන් සහ කෘෂි ව්‍යවසායකයින් සඳහා වඩාත් සුහුරු වර්ධනයක්'
                : 'Supporting Smarter Growth for Farmers & Agri-Businesses'}
            </h2>
          </div>

          {/* Right Column: Description & Pill CTA Button */}
          <div className="flex flex-col items-start lg:items-start gap-4 sm:gap-5 lg:max-w-md">
            <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
              {isSinhala
                ? 'ඩිජිටල් කාර්ය ප්‍රවාහයන්, පුරෝකථන තීක්ෂ්ණ බුද්ධිය සහ වඩා හොඳ අවදානම් කළමනාකරණය ඒකාබද්ධ කරමින් ගොවිපළවල් වඩාත් බුද්ධිමත්ව මෙහෙයවීමට සහාය වීම.'
                : 'Helping farms operate smarter by combining digital workflows, predictive insights, and better risk management.'}
            </p>

            <Link
              to="/agri-info-hub"
              className="inline-flex items-center gap-3.5 pl-5 pr-2 py-2 rounded-full bg-[#c6f24d] hover:bg-[#b7eb3b] text-gray-950 font-bold text-sm sm:text-base shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
            >
              <span>{isSinhala ? 'දැන්ම අරඹන්න' : 'Get started'}</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center text-gray-900 group-hover:rotate-45 transition-transform duration-300 shadow-2xs">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </Link>
          </div>
        </div>

        {/* ── 3 Metric Feature Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12 sm:mt-16">
          {cards.map((card, idx) => {
            const delayClass = idx === 0 ? 'delay-100' : idx === 1 ? 'delay-200' : 'delay-300';
            const statText = isSinhala ? card.statSi : card.stat;
            const labelText = isSinhala ? card.labelSi : card.label;

            return (
              <div
                key={card.id}
                className={`reveal-fade-up ${delayClass} relative rounded-[28px] sm:rounded-[32px] overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.18)] transition-all duration-500 h-[380px] sm:h-[430px] lg:h-[470px] hover:-translate-y-1.5`}
              >
                {/* Background Image with Zoom on Hover */}
                <img
                  src={card.image}
                  alt={labelText}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Dark Gradient Overlay for optimal legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                {/* Glass Rim Border */}
                <div className="absolute inset-0 rounded-[28px] sm:rounded-[32px] border border-white/10 group-hover:border-white/25 transition-colors pointer-events-none" />

                {/* Bottom Content Area */}
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 flex flex-col justify-end text-white">
                  <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-none drop-shadow-sm">
                    {statText}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-white/90 mt-2 leading-snug drop-shadow-sm">
                    {labelText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
