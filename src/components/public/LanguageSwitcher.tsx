import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check } from 'lucide-react';

/**
 * High-definition SVG UK Flag for crisp cross-platform rendering
 */
export function UKFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 60 30" 
      className={`rounded-xs overflow-hidden shadow-2xs shrink-0 ${className}`} 
      preserveAspectRatio="none"
    >
      <clipPath id="uk-flag-clip">
        <path d="M0,0 v30 h60 v-30 z"/>
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#uk-flag-clip)"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  );
}

/**
 * High-definition SVG Sri Lanka Flag for crisp cross-platform rendering
 */
export function LKFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 60 30" 
      className={`rounded-xs overflow-hidden shadow-2xs shrink-0 ${className}`} 
      preserveAspectRatio="none"
    >
      {/* Outer Golden Border */}
      <rect width="60" height="30" fill="#FFBE29" />
      {/* Dark Crimson Main Panel */}
      <rect x="22" y="2" width="36" height="26" fill="#8D153A" />
      {/* Green Stripe */}
      <rect x="4" y="2" width="8" height="26" fill="#00534E" />
      {/* Orange Stripe */}
      <rect x="13" y="2" width="8" height="26" fill="#EB7B2B" />
      {/* Bo Leaves in corners */}
      <circle cx="26" cy="6" r="1.6" fill="#FFBE29" />
      <circle cx="54" cy="6" r="1.6" fill="#FFBE29" />
      <circle cx="26" cy="24" r="1.6" fill="#FFBE29" />
      <circle cx="54" cy="24" r="1.6" fill="#FFBE29" />
      {/* Stylized Golden Lion silhouette */}
      <path 
        d="M42,9 C39.5,9 37.5,10.5 36.5,12.5 C35.5,14 34.5,16 34.5,18 C34.5,20 36.5,22 39.5,22 C42.5,22 45,21 46,19 C47,17 48,14 47,12 C46,10 44,9 42,9 Z M41,12 C41.6,12 42,12.4 42,13 C42,13.6 41.6,14 41,14 C40.4,14 40,13.6 40,13 C40,12.4 40.4,12 41,12 Z M47,13 L51,10 L50,14 Z" 
        fill="#FFBE29" 
      />
    </svg>
  );
}

interface LanguageOption {
  code: 'en' | 'si';
  name: string;
  nativeName: string;
  FlagComponent: React.ComponentType<{ className?: string }>;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    FlagComponent: UKFlag,
  },
  {
    code: 'si',
    name: 'Sinhala',
    nativeName: 'සිංහල',
    FlagComponent: LKFlag,
  },
];

interface LanguageSwitcherProps {
  className?: string;
  dropUp?: boolean;
  variant?: 'glass' | 'white' | 'transparent';
}

export default function LanguageSwitcher({ 
  className = '', 
  dropUp = false, 
  variant = 'glass' 
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangCode = (i18n.language === 'si' ? 'si' : 'en') as 'en' | 'si';
  const currentLang = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];
  const CurrentFlag = currentLang.FlagComponent;

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: 'en' | 'si') => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  const isGlass = variant === 'glass';
  const isTransparent = variant === 'transparent';

  const getButtonClass = () => {
    if (isGlass) {
      return "glass-btn h-[38px] flex items-center justify-between gap-2 px-3 sm:px-3.5 rounded-full !text-white cursor-pointer select-none";
    }
    if (isTransparent) {
      return "h-[34px] flex items-center justify-between gap-1.5 px-2 py-1 rounded-full bg-transparent hover:bg-white/15 text-white transition-all duration-200 cursor-pointer select-none";
    }
    return "h-[34px] flex items-center justify-between gap-1.5 px-2.5 rounded-full bg-white hover:bg-gray-50 text-gray-800 shadow-xs border border-gray-200/90 transition-all duration-200 cursor-pointer select-none";
  };

  const isDarkMenu = isGlass || isTransparent;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`Change language (Current: ${currentLang.nativeName})`}
        className={getButtonClass()}
      >
        <div className="flex items-center">
          <CurrentFlag className="w-5 h-3.5 sm:w-5.5 sm:h-4" />
        </div>
        <ChevronDown 
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isDarkMenu ? 'text-white/80 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
          } ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
          } right-0 min-w-[140px] rounded-2xl p-1.5 z-50 animate-card-pop ${
            isDarkMenu
              ? "bg-[#0c291b]/95 backdrop-blur-2xl border border-white/20 shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
              : "bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_25px_rgba(0,0,0,0.12)]"
          }`}
          role="menu"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            const Flag = lang.FlagComponent;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                role="menuitem"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isDarkMenu
                    ? isSelected
                      ? 'bg-white/20 text-white font-bold border border-white/25 shadow-xs'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                    : isSelected
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flag className="w-5 h-3.5" />
                  <span>{lang.nativeName}</span>
                </div>
                {isSelected && (
                  <Check 
                    className={`w-3.5 h-3.5 stroke-[2.5] ${isDarkMenu ? 'text-emerald-400' : 'text-emerald-600'}`} 
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
