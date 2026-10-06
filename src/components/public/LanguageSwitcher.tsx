import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  dropUp?: boolean;
  variant?: 'glass' | 'white' | 'transparent' | 'globe';
}

export default function LanguageSwitcher({
  className = '',
  dropUp = false,
  variant = 'glass',
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangCode = (i18n.language === 'si' ? 'si' : 'en') as 'en' | 'si';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleLanguage = () => {
    const nextLang = currentLangCode === 'si' ? 'en' : 'si';
    i18n.changeLanguage(nextLang);
  };

  const handleSelectLanguage = (code: 'en' | 'si') => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  const isGlass = variant === 'glass';
  const isTransparent = variant === 'transparent';
  const isGlobe = variant === 'globe';

  const getButtonClass = () => {
    if (isGlobe || isTransparent) {
      return "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all duration-200 cursor-pointer select-none shadow-2xs";
    }
    if (isGlass) {
      return "glass-btn h-[38px] w-[38px] p-0 flex items-center justify-center rounded-full hover:scale-105 transition-all text-white cursor-pointer select-none shadow-xs";
    }
    return "h-[34px] w-[34px] flex items-center justify-center rounded-full bg-white hover:bg-gray-50 text-gray-800 shadow-xs border border-gray-200/90 transition-all duration-200 cursor-pointer select-none";
  };

  const titleText = currentLangCode === 'si' ? 'භාෂාව වෙනස් කරන්න (ඉංග්‍රීසි)' : 'Change language (Sinhala)';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Single Globe Icon Button */}
      <button
        type="button"
        onClick={handleToggleLanguage}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-label={titleText}
        title={titleText}
        className={getButtonClass()}
      >
        <Globe className="w-4.5 h-4.5 text-white stroke-[2]" />
      </button>

      {/* Floating Dropdown Menu (If user right-clicks or opens options) */}
      {isOpen && (
        <div
          className={`absolute ${
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
          } right-0 min-w-[130px] rounded-2xl p-1.5 z-50 animate-card-pop bg-[#0c291b]/95 backdrop-blur-2xl border border-white/20 shadow-[0_12px_32px_rgba(0,0,0,0.4)]`}
          role="menu"
        >
          {[
            { code: 'en', name: 'English' },
            { code: 'si', name: 'සිංහල' },
          ].map((lang) => {
            const isSelected = lang.code === currentLangCode;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code as 'en' | 'si')}
                role="menuitem"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-white/20 text-white font-bold border border-white/25 shadow-xs'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{lang.name}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 stroke-[2.5] text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
