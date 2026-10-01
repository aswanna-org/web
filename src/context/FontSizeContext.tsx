import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type FontSize = 'small' | 'normal' | 'large';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  cycleFontSize: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const STORAGE_KEY = 'aswanna_font_size';

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'small' || saved === 'normal' || saved === 'large') {
        return saved;
      }
    } catch (e) {
      console.warn('Unable to access localStorage for font size', e);
    }
    return 'normal';
  });

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    try {
      localStorage.setItem(STORAGE_KEY, size);
    } catch (e) {
      // Ignore storage errors in private browsing
    }
    document.documentElement.setAttribute('data-font-size', size);
  };

  const cycleFontSize = () => {
    if (fontSize === 'small') setFontSize('normal');
    else if (fontSize === 'normal') setFontSize('large');
    else setFontSize('small');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize, cycleFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize(): FontSizeContextType {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}
