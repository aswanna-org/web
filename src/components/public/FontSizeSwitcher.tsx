import { useTranslation } from 'react-i18next';
import { useFontSize, type FontSize } from '../../context/FontSizeContext';

interface FontSizeSwitcherProps {
  className?: string;
  variant?: 'glass' | 'white' | 'transparent';
  showLabels?: boolean;
}

export default function FontSizeSwitcher({
  className = '',
  variant = 'glass',
  showLabels = false,
}: FontSizeSwitcherProps) {
  const { fontSize, setFontSize } = useFontSize();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const options: { size: FontSize; symbol: string; labelSi: string; labelEn: string; title: string }[] = [
    {
      size: 'small',
      symbol: 'A-',
      labelSi: 'කුඩා',
      labelEn: 'Small',
      title: isSinhala ? 'කුඩා අකුරු ප්‍රමාණය' : 'Small font size',
    },
    {
      size: 'normal',
      symbol: 'A',
      labelSi: 'සාමාන්‍ය',
      labelEn: 'Normal',
      title: isSinhala ? 'සාමාන්‍ය අකුරු ප්‍රමාණය' : 'Normal font size',
    },
    {
      size: 'large',
      symbol: 'A+',
      labelSi: 'විශාල',
      labelEn: 'Large',
      title: isSinhala ? 'විශාල අකුරු ප්‍රමාණය' : 'Large font size',
    },
  ];

  // Full-width card with labels (e.g., inside mobile drawer)
  if (showLabels) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
          {isSinhala ? 'අකුරු ප්‍රමාණය (Font Size)' : 'Font Size'}
        </span>
        <div className="grid grid-cols-3 gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/15 backdrop-blur-md">
          {options.map((opt) => {
            const isSelected = fontSize === opt.size;
            return (
              <button
                key={opt.size}
                type="button"
                onClick={() => setFontSize(opt.size)}
                title={opt.title}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600/90 text-white font-bold shadow-md shadow-emerald-900/30 border border-emerald-400/40 scale-102'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={`leading-none font-bold ${
                  opt.size === 'small' ? 'text-xs' : opt.size === 'normal' ? 'text-sm' : 'text-base font-extrabold'
                }`}>
                  {opt.symbol}
                </span>
                <span className="text-[10px] opacity-80 mt-1">
                  {isSinhala ? opt.labelSi : opt.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact segmented toggle for Header (Desktop and Mobile Top Bar)
  const isGlass = variant === 'glass';
  const isTransparent = variant === 'transparent';

  const containerStyle = isGlass
    ? 'glass-btn h-[38px] !p-1 flex items-center rounded-full'
    : isTransparent
    ? 'h-9 sm:h-10 flex items-center p-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xs'
    : 'h-[34px] flex items-center p-0.5 rounded-full bg-white text-gray-800 shadow-xs border border-gray-200/90';

  return (
    <div className={`inline-flex items-center ${containerStyle} ${className}`} role="group" aria-label="Font size switcher">
      {options.map((opt) => {
        const isSelected = fontSize === opt.size;

        const buttonStyle = isSelected
          ? isGlass || isTransparent
            ? 'bg-white/30 text-white font-extrabold shadow-2xs border border-white/30 scale-105'
            : 'bg-emerald-600 text-white font-bold shadow-xs'
          : isGlass || isTransparent
          ? 'text-white/75 hover:text-white hover:bg-white/10'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';

        return (
          <button
            key={opt.size}
            type="button"
            onClick={() => setFontSize(opt.size)}
            title={opt.title}
            aria-pressed={isSelected}
            className={`h-7 px-2 sm:px-2.5 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer select-none leading-none ${buttonStyle}`}
          >
            <span
              className={`font-sans tracking-tight ${
                opt.size === 'small'
                  ? 'text-[10px] sm:text-[11px]'
                  : opt.size === 'normal'
                  ? 'text-xs sm:text-[13px] font-semibold'
                  : 'text-xs sm:text-sm font-extrabold'
              }`}
            >
              {opt.symbol}
            </span>
          </button>
        );
      })}
    </div>
  );
}
