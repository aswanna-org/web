import { useState, useRef, useEffect, type FC } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  count?: number | string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
}

const CustomDropdown: FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  menuClassName = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`relative w-full group ${isOpen ? 'z-50' : 'z-10'}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between pl-4 sm:pl-5 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-full border text-left transition-all duration-200 cursor-pointer text-xs sm:text-sm font-semibold shadow-xs ${
          isOpen
            ? 'border-[#006837] bg-white ring-3 ring-[#006837]/15 shadow-sm text-gray-900'
            : 'border-gray-200/90 bg-gray-50/70 hover:bg-white hover:border-emerald-500/60 text-gray-800'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate pr-2">{selectedLabel}</span>
        <ChevronDown
          className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700 pointer-events-none transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'group-hover:translate-y-[1px]'
          }`}
        />
      </button>

      {/* Styled Dropdown Menu Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-[calc(100%+6px)] z-[100] min-w-full bg-white border border-gray-200/90 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.06)] p-1.5 max-h-60 overflow-y-auto dropdown-scrollbar animate-in fade-in-0 zoom-in-95 duration-150 ${menuClassName}`}
          role="listbox"
        >
          {options.length === 0 ? (
            <div className="py-3 px-4 text-center text-xs text-gray-400 font-medium">
              No options available
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-950 font-medium'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="truncate pr-2">{opt.label}</span>
                  {opt.count !== undefined && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100/70 text-emerald-800'
                      }`}
                    >
                      {opt.count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
