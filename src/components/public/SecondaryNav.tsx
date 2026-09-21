import { useState, useEffect } from 'react';
import { Store, Sprout, Map, Building } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SecondaryNav() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isSinhala = i18n.language === 'si';
  const isHomePage = location.pathname === '/';

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

  const isFloating = isScrolled || !isHomePage;

  return (
    <div className={`fixed z-40 transition-all duration-500 ease-in-out
      top-[90px] right-2.5 w-auto flex flex-col gap-2
      lg:top-[110px] xl:top-[125px] lg:left-0 lg:right-auto lg:w-full lg:block
      ${isFloating ? 'lg:!top-[130px] lg:!right-4 lg:!left-auto lg:!w-[185px]' : ''}
    `}>
      <div className={`w-full ${!isFloating ? 'lg:container lg:mx-auto lg:px-6 xl:px-8 lg:py-4' : 'lg:py-2'}`}>
        <div className={`flex flex-col gap-2 ${!isFloating ? 'lg:grid lg:grid-cols-4 lg:gap-4 xl:gap-5' : 'lg:flex lg:flex-col lg:gap-1.5'}`}>
          {links.map((link) => (
            <Link
              key={link.id}
              to={link.to}
              title={isSinhala ? `${link.titleSi} - ${link.descSi}` : `${link.titleEn} - ${link.descEn}`}
              className={`relative overflow-hidden ${link.bgColor} rounded-full transition-all duration-300 group hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.25)] hover:-translate-y-0.5 flex items-center justify-center lg:justify-start ${
                isFloating
                  ? 'w-10 h-10 lg:w-full lg:py-2.5 lg:px-3.5'
                  : 'w-10 h-10 lg:w-full lg:py-4 lg:px-5 xl:py-5 xl:px-6 lg:min-h-[68px] xl:min-h-[76px]'
              }`}
            >
              {/* Background Decorative Icon */}
              <link.icon className={`hidden lg:block absolute -bottom-4 -right-4 text-white opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 ${isFloating ? 'w-10 h-10' : 'w-20 h-20 xl:w-24 xl:h-24'}`} />

              <div className={`relative z-10 flex items-center justify-center lg:justify-start ${isFloating ? 'lg:gap-2.5' : 'lg:gap-4 xl:gap-5'} w-full`}>

                <div className="flex-shrink-0 flex items-center justify-center">
                  <link.icon className={`text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] w-5 h-5 ${!isFloating ? 'lg:w-9 lg:h-9 xl:w-10 xl:h-10' : 'lg:w-5 lg:h-5'}`} />
                </div>

                <div className="hidden lg:flex flex-col text-left min-w-0">
                  <h3 className={`${link.textColor} font-bold leading-tight ${isFloating ? 'text-xs mb-0.5' : 'text-[16px] xl:text-[17px] mb-1'} drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] truncate`}>
                    {isSinhala ? link.titleSi : link.titleEn}
                  </h3>
                  <p className={`${link.textColor} opacity-90 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${isFloating ? 'text-[10px]' : 'text-[12.5px] xl:text-[13.5px]'} leading-tight truncate`}>
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
