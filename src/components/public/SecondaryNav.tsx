import { useState, useEffect } from 'react';
import { Store, Sprout, Map, Building, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';

export default function SecondaryNav() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const { isCartOpen, setIsCartOpen, itemCount } = useCart();
  const isSinhala = i18n.language === 'si';
  const isHomePage = location.pathname === '/';

  // Desktop 4 main services
  const desktopLinks = [
    {
      id: 1,
      to: '/marketplace',
      icon: Store,
      titleSi: 'අලෙවිසැල',
      titleEn: 'Marketplace',
      descSi: 'බීජ, පොහොර, උපකරණ',
      descEn: 'Seeds, Fertilizers',
      bgColor: 'bg-[#f6a847]/40 backdrop-blur-xl bg-gradient-to-br from-white/30 to-transparent border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]',
      textColor: 'text-white drop-shadow-md',
    },
    {
      id: 2,
      to: '/plant-finder',
      icon: Sprout,
      titleSi: 'පැළ සොයන්න',
      titleEn: 'Plant Finder',
      descSi: 'පසට ගැළපෙන බෝග',
      descEn: 'Suitable crops',
      bgColor: 'bg-[#5bc07c]/40 backdrop-blur-xl bg-gradient-to-br from-white/30 to-transparent border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]',
      textColor: 'text-white drop-shadow-md',
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
      textColor: 'text-white drop-shadow-md',
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
      textColor: 'text-white drop-shadow-md',
    }
  ];

  // Mobile 5 navigation tabs including the Cart
  const mobileTabs = [
    {
      id: 'marketplace',
      to: '/marketplace',
      icon: Store,
      titleSi: 'අලෙවිසැල',
      titleEn: 'Market',
      isCart: false,
    },
    {
      id: 'plant-finder',
      to: '/plant-finder',
      icon: Sprout,
      titleSi: 'පැළ',
      titleEn: 'Plants',
      isCart: false,
    },
    {
      id: 'agro-lands',
      to: '/agro-lands',
      icon: Map,
      titleSi: 'ඉඩම්',
      titleEn: 'Lands',
      isCart: false,
    },
    {
      id: 'govijana-sewa',
      to: '/govijana-sewa',
      icon: Building,
      titleSi: 'ගොවිජන',
      titleEn: 'Govijana',
      isCart: false,
    },
    {
      id: 'cart',
      to: '#cart',
      icon: ShoppingBag,
      titleSi: 'කූඩය',
      titleEn: 'Cart',
      isCart: true,
    }
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);

      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
      );
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

      // When within 70px of the very bottom of the document
      const atBottom = windowHeight + scrollTop >= documentHeight - 70;
      setIsAtBottom(atBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname]);

  const isFloating = isScrolled || !isHomePage;

  // Active Index: if cart drawer is open, highlight Cart tab; otherwise match current route
  const getActiveIndex = () => {
    if (isCartOpen) return 4;
    return mobileTabs.findIndex(
      (tab) => !tab.isCart && (location.pathname === tab.to || (tab.to !== '/' && location.pathname.startsWith(tab.to)))
    );
  };

  const activeIndex = getActiveIndex();

  return (
    <>
      {/* Desktop Navigation (Hero Grid on Home Top, or Floating Right Sidebar when scrolled / inner pages) */}
      <div className={`hidden lg:block fixed z-40 transition-all duration-500 ease-in-out
        lg:top-[110px] xl:top-[125px] lg:left-0 lg:right-auto lg:w-full
        ${isFloating ? 'lg:!top-[130px] lg:!right-4 lg:!left-auto lg:!w-[185px]' : ''}
      `}>
        <div className={`w-full ${!isFloating ? 'lg:container lg:mx-auto lg:px-6 xl:px-8 lg:py-4' : 'lg:py-2'}`}>
          <div className={`flex flex-col gap-2 ${!isFloating ? 'lg:grid lg:grid-cols-4 lg:gap-4 xl:gap-5' : 'lg:flex lg:flex-col lg:gap-1.5'}`}>
            {desktopLinks.map((link) => (
              <Link
                key={link.id}
                to={link.to}
                title={isSinhala ? `${link.titleSi} - ${link.descSi}` : `${link.titleEn} - ${link.descEn}`}
                className={`relative overflow-hidden ${link.bgColor} rounded-full transition-all duration-300 group hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.25)] hover:-translate-y-0.5 flex items-center justify-start ${
                  isFloating
                    ? 'lg:w-full lg:py-2.5 lg:px-3.5'
                    : 'lg:w-full lg:py-4 lg:px-5 xl:py-5 xl:px-6 lg:min-h-[68px] xl:min-h-[76px]'
                }`}
              >
                {/* Background Decorative Icon */}
                <link.icon className={`absolute -bottom-4 -right-4 text-white opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 ${isFloating ? 'w-10 h-10' : 'w-20 h-20 xl:w-24 xl:h-24'}`} />

                <div className={`relative z-10 flex items-center justify-start ${isFloating ? 'lg:gap-2.5' : 'lg:gap-4 xl:gap-5'} w-full`}>
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <link.icon className={`text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] ${!isFloating ? 'lg:w-9 lg:h-9 xl:w-10 xl:h-10' : 'lg:w-5 lg:h-5'}`} />
                  </div>

                  <div className="flex flex-col text-left min-w-0">
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

      {/* Mobile Apple Liquid Glass Floating Pill Navigation Bar (Aswanna Emerald Theme + Magnifier Effect) */}
      <nav
        aria-label="Mobile Navigation"
        className={`block lg:hidden fixed z-40 pointer-events-auto select-none transition-all duration-300 ease-out ${
          isAtBottom
            ? 'bottom-0 inset-x-0 w-full max-w-none'
            : 'bottom-2.5 sm:bottom-4 inset-x-2 sm:inset-x-3 max-w-xl mx-auto'
        }`}
      >
        {/* Liquid Glass Shell - Unrounds at bottom when at the very end of page */}
        <div
          className={`relative w-full backdrop-blur-2xl transition-all duration-300 ease-out bg-gradient-to-r from-[#0c2f24]/96 via-[#0e3d2f]/96 to-[#0c2f24]/96 border border-emerald-400/35 shadow-[0_12px_36px_rgba(4,32,22,0.45),inset_0_1.5px_2px_rgba(255,255,255,0.25)] ${
            isAtBottom
              ? 'rounded-t-[24px] sm:rounded-t-[28px] rounded-b-none border-b-0 pt-2 pb-2.5 sm:pb-3 px-1.5 sm:px-3'
              : 'rounded-full p-1.5'
          }`}
        >
          {/* Liquid Glass Prismatic Refraction Sheen */}
          <div
            className={`absolute inset-0 overflow-hidden pointer-events-none transition-all duration-300 ${
              isAtBottom ? 'rounded-t-[24px] sm:rounded-t-[28px] rounded-b-none' : 'rounded-full'
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_140%_at_15%_-20%,rgba(167,243,208,0.35)_0%,rgba(255,255,255,0.2)_35%,transparent_75%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent" />
          </div>

          {/* 5 Navigation Tabs with Green & White Theme */}
          <div className="relative z-10 grid grid-cols-5 items-center w-full gap-0.5 sm:gap-1">
            {mobileTabs.map((tab, idx) => {
              const isActive = idx === activeIndex;
              const Icon = tab.icon;

              const tabContent = (
                <div
                  className={`w-full flex flex-col items-center justify-center transition-all duration-200 relative ${
                    isActive
                      ? 'py-1 px-1 rounded-full bg-white/20 border-2 border-white shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_0_1px_1.5px_rgba(255,255,255,0.6)]'
                      : 'py-1 px-0.5 rounded-full hover:bg-white/10 active:scale-95'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon
                      className={`transition-all duration-200 ${
                        isActive
                          ? 'w-7 h-7 xs:w-[30px] xs:h-[30px] text-white stroke-[2.2]'
                          : 'w-6 h-6 xs:w-[26px] xs:h-[26px] text-white/75 group-hover:text-white stroke-[1.8]'
                      }`}
                    />

                    {/* Live Cart Item Count Badge (Green & White) */}
                    {tab.isCart && itemCount > 0 && (
                      <span className="absolute -top-1 -right-2.5 bg-emerald-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </div>

                  {/* Single-word localized label (Green & White only) */}
                  <span
                    className={`text-center whitespace-nowrap leading-tight tracking-tight transition-all duration-200 ${
                      isActive
                        ? 'text-[10px] xs:text-[11px] font-bold text-white mt-0.5'
                        : 'text-[9px] xs:text-[10px] font-medium text-white/75 group-hover:text-white mt-0.5'
                    }`}
                  >
                    {isSinhala ? tab.titleSi : tab.titleEn}
                  </span>
                </div>
              );

              if (tab.isCart) {
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="flex items-center justify-center w-full focus:outline-none"
                    aria-label="Open Cart"
                  >
                    {tabContent}
                  </button>
                );
              }

              return (
                <Link
                  key={tab.id}
                  to={tab.to}
                  className="flex items-center justify-center w-full focus:outline-none"
                >
                  {tabContent}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
