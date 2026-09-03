import { useState, useEffect } from 'react';
import { Store, Sprout, Map, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SecondaryNav() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const links = [
    {
      id: 1,
      to: '/marketplace',
      icon: Store,
      titleSi: 'අලෙවිසැල',
      titleEn: 'Marketplace',
      descSi: 'බීජ, පොහොර, උපකරණ',
      descEn: 'Seeds, Fertilizers',
      // Glass effect classes
      bgColor: 'bg-[#f6a847]/40 backdrop-blur-xl bg-gradient-to-br from-white/30 to-transparent border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]',
      textColor: 'text-white drop-shadow-md'
    },
    {
      id: 2,
      to: '/plant-finder',
      icon: Sprout,
      titleSi: 'පැළයක් සොයාගමු',
      titleEn: 'Plant Finder',
      descSi: 'පසට ගැළපෙන බෝග',
      descEn: 'Suitable crops',
      bgColor: 'bg-[#5bc07c]/40 backdrop-blur-xl bg-gradient-to-br from-white/30 to-transparent border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]',
      textColor: 'text-white drop-shadow-md'
    },
    {
      id: 3,
      to: '/agro-lands',
      icon: Map,
      titleSi: 'කෘෂි ඉඩම්',
      titleEn: 'Agro Lands',
      descSi: 'විකිණීමට හා බද්දට',
      descEn: 'Sale and lease',
      bgColor: 'bg-[#679fe4]/40 backdrop-blur-xl bg-gradient-to-br from-white/30 to-transparent border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]',
      textColor: 'text-white drop-shadow-md'
    },
    {
      id: 5,
      to: '/govijana-sewa',
      icon: Building,
      titleEn: 'Govijana Sewa',
      titleSi: 'ගොවිජන සේවා',
      descEn: 'Find Agrarian Centers',
      descSi: 'මධ්‍යස්ථාන සොයන්න',
      bgColor: 'bg-[#0f5132]/50 backdrop-blur-xl bg-gradient-to-br from-white/20 to-transparent border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]',
      textColor: 'text-white drop-shadow-md'
    }
  ];

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`hidden lg:block fixed z-40 transition-all duration-700 ease-in-out
      top-[130px] right-2 w-auto
      lg:top-[110px] lg:left-0 lg:right-auto lg:w-full
      ${isScrolled ? 'lg:!top-[130px] lg:!right-6 lg:!left-auto lg:!w-[220px]' : ''}
    `}>
      <div className={`w-full ${!isScrolled ? 'lg:container lg:mx-auto lg:px-8 lg:py-4' : 'lg:py-4'}`}>
        <div className={`flex flex-col gap-3 ${!isScrolled ? 'lg:grid lg:grid-cols-4 lg:gap-4' : 'lg:flex lg:flex-col lg:gap-2'}`}>
          {links.map((link) => (
            <Link
              key={link.id}
              to={link.to}
              className={`relative overflow-hidden ${link.bgColor} rounded-xl lg:rounded-2xl p-3 lg:py-3 lg:px-4 transition-all duration-300 group hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] hover:-translate-y-1 flex items-center justify-center lg:justify-start w-full`}
            >
              {/* Background Decorative Icon - Opacity අඩු කර ඇත */}
              <link.icon className={`hidden lg:block absolute -bottom-3 -right-3 text-white opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 ${isScrolled ? 'w-12 h-12' : 'w-16 h-16'}`} />

              <div className="relative z-10 flex items-center gap-4 w-full">

                <div className="flex-shrink-0 flex items-center justify-center">
                  <link.icon className={`text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] ${isScrolled ? 'w-6 h-6 lg:w-7 lg:h-7' : 'w-7 h-7 lg:w-8 lg:h-8'}`} />
                </div>

                <div className="hidden lg:flex flex-col text-left">
                  <h3 className={`${link.textColor} font-bold leading-none mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${isScrolled ? 'text-xs' : 'text-[15px]'}`}>
                    {isSinhala ? link.titleSi : link.titleEn}
                  </h3>
                  <p className={`${link.textColor} opacity-90 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${isScrolled ? 'text-[10px]' : 'text-[12px]'} leading-tight`}>
                    {isSinhala ? link.descSi : link.descEn}
                  </p>
                </div>

              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}