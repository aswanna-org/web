import { useState, useEffect } from 'react';
import { Store, Sprout, Map, Briefcase, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SecondaryNav() {
  const { t, i18n } = useTranslation();
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
      bgColor: 'bg-[#f6a847]/60 backdrop-blur-md border border-white/20',
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
      bgColor: 'bg-[#5bc07c]/60 backdrop-blur-md border border-white/20',
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
      bgColor: 'bg-[#679fe4]/60 backdrop-blur-md border border-white/20',
      textColor: 'text-white drop-shadow-md'
    },
    {
      id: 4,
      to: '/pages/careers',
      icon: Briefcase,
      titleSi: 'රැකියා',
      titleEn: 'Careers',
      descSi: 'කෘෂි ක්ෂේත්‍රයේ රැකියා',
      descEn: 'Agro vacancies',
      bgColor: 'bg-[#b678db]/60 backdrop-blur-md border border-white/20',
      textColor: 'text-white drop-shadow-md'
    },
    {
      id: 5,
      to: '#',
      icon: Plus,
      titleSi: 'නව සේවාව',
      titleEn: 'New Service',
      descSi: 'ළඟදීම...',
      descEn: 'Coming soon',
      bgColor: 'bg-[#ed6b7b]/60 backdrop-blur-md border border-white/20',
      textColor: 'text-white drop-shadow-md'
    }
  ];

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 400px is roughly where the hero content ends and the next section starts
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
    <div className={`fixed z-40 transition-all duration-700 ease-in-out
      top-[130px] right-2 w-auto
      lg:top-[110px] lg:left-0 lg:right-auto lg:w-full
      ${isScrolled ? 'lg:!top-[130px] lg:!right-6 lg:!left-auto lg:!w-[220px]' : ''}
    `}>
      <div className={`w-full ${!isScrolled ? 'lg:container lg:mx-auto lg:px-8 lg:py-4' : 'lg:py-2'}`}>
        <div className={`flex flex-col gap-3 ${!isScrolled ? 'lg:grid lg:grid-cols-5 lg:gap-5' : 'lg:flex lg:flex-col lg:gap-3'}`}>
          {links.map((link) => (
            <Link
              key={link.id}
              to={link.to}
              className={`relative overflow-hidden ${link.bgColor} rounded-xl lg:rounded-2xl p-3 lg:p-4 transition-all duration-300 group shadow-lg hover:shadow-xl hover:-translate-y-1 flex flex-col items-center lg:items-start lg:block`}
            >
              {/* Large Background Icon (Desktop only) */}
              <link.icon className={`hidden lg:block absolute -bottom-3 -right-3 text-white opacity-10 group-hover:scale-110 transition-transform duration-500 ${isScrolled ? 'w-12 h-12' : 'w-16 h-16'}`} />
              
              {/* Top Row: Simple Icon */}
              <div className={`flex justify-center items-center ${!isScrolled ? 'lg:mb-2' : 'lg:mb-1'}`}>
                <link.icon className={`w-5 h-5 lg:w-6 lg:h-6 text-white drop-shadow-md`} />
              </div>

              {/* Bottom Row: Text (Hidden on Mobile) */}
              <div className="hidden lg:block relative z-10 w-full text-left">
                <h3 className={`${link.textColor} font-bold leading-tight mb-0.5 ${isScrolled ? 'text-sm' : 'text-[15px]'}`}>
                  {isSinhala ? link.titleSi : link.titleEn}
                </h3>
                <p className={`${link.textColor} opacity-90 font-medium ${isScrolled ? 'text-[10px]' : 'text-xs'}`}>
                  {isSinhala ? link.descSi : link.descEn}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
