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

  const fontCycle: FontSize[] = ['normal', 'large', 'small'];

  const handleCycleFontSize = () => {
    const currentIndex = fontCycle.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % fontCycle.length;
    setFontSize(fontCycle[nextIndex]);
  };

  const getDisplaySymbol = (size: FontSize) => {
    switch (size) {
      case 'small':
        return 'A-';
      case 'normal':
        return 'A';
      case 'large':
        return 'A+';
      default:
        return 'A';
    }
  };

  const getTitleText = (size: FontSize) => {
    const label = size === 'small' ? (isSinhala ? 'කුඩා' : 'Small') : size === 'large' ? (isSinhala ? 'විශාල' : 'Large') : (isSinhala ? 'සාමාන්‍ය' : 'Normal');
    return isSinhala ? `අකුරු ප්‍රමාණය: ${label} (වෙනස් කිරීමට ක්ලික් කරන්න)` : `Font Size: ${label} (Click to change)`;
  };

  // Full-width card with labels (e.g., inside mobile drawer)
  if (showLabels) {
    const options: { size: FontSize; symbol: string; labelSi: string; labelEn: string }[] = [
      { size: 'small', symbol: 'A-', labelSi: 'කුඩා', labelEn: 'Small' },
      { size: 'normal', symbol: 'A', labelSi: 'සාමාන්‍ය', labelEn: 'Normal' },
      { size: 'large', symbol: 'A+', labelSi: 'විශාල', labelEn: 'Large' },
    ];

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
                title={getTitleText(opt.size)}
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

  // Single round icon button for Header that cycles on click
  const isGlass = variant === 'glass';
  const isTransparent = variant === 'transparent';

  const buttonStyle = isGlass
    ? 'glass-btn h-[38px] w-[38px] p-0 flex items-center justify-center rounded-full hover:scale-105 transition-all text-white font-extrabold text-xs cursor-pointer select-none shadow-xs'
    : isTransparent
    ? 'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all duration-200 cursor-pointer select-none font-extrabold text-xs shadow-2xs'
    : 'h-[34px] w-[34px] flex items-center justify-center rounded-full bg-white hover:bg-gray-50 text-gray-800 shadow-xs border border-gray-200/90 font-bold text-xs transition-all duration-200 cursor-pointer select-none';

  return (
    <button
      type="button"
      onClick={handleCycleFontSize}
      title={getTitleText(fontSize)}
      aria-label={getTitleText(fontSize)}
      className={`${buttonStyle} ${className}`}
    >
      <span className={`leading-none tracking-tight font-sans ${
        fontSize === 'small' ? 'text-[11px]' : fontSize === 'large' ? 'text-sm font-black' : 'text-xs font-bold'
      }`}>
        {getDisplaySymbol(fontSize)}
      </span>
    </button>
  );
}
