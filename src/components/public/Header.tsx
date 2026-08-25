import { Search, ShoppingCart, Phone, Menu, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function Header() {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSubmenu = (menu: string) => {
    if (openSubmenu === menu) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(menu);
    }
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[var(--color-secondary)]/70 backdrop-blur-lg shadow-xl border-b border-white/20 py-1'
        : 'bg-white/10 backdrop-blur-md border-b border-white/20 py-2 lg:py-3'
    }`}>
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/aswanna_logo.png" alt="Aswanna Logo" className="h-16 lg:h-24 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-white font-medium hover:text-[var(--color-primary)] border-b-2 border-transparent hover:border-[var(--color-primary)] pb-1 transition-colors">{t('header.home')}</Link>
          <Link to="/about" className="text-white font-medium hover:text-[var(--color-primary)] pb-1 transition-colors">{t('header.about')}</Link>

          {/* Dropdown 1: Pages */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-white font-medium hover:text-[var(--color-primary)] pb-1 transition-colors">
              {t('header.pages')} <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block pt-4 w-48">
              <div className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden border border-gray-100">
                <Link to="/pages/team" className="px-4 py-3 text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors text-sm font-medium">{t('header.team')}</Link>
                <Link to="/pages/careers" className="px-4 py-3 text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors text-sm font-medium">{t('header.careers')}</Link>
                <Link to="/pages/faq" className="px-4 py-3 text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors text-sm font-medium">{t('header.faq')}</Link>
                <Link to="/pages/contact" className="px-4 py-3 text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors text-sm font-medium">{t('header.contact')}</Link>
              </div>
            </div>
          </div>

          {/* Dropdown 2: Projects */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-white font-medium hover:text-[var(--color-primary)] pb-1 transition-colors">
              {t('header.projects')} <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block pt-4 w-48">
              <div className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden border border-gray-100">
                <Link to="/projects/ongoing" className="px-4 py-3 text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors text-sm font-medium">Ongoing Projects</Link>
                <Link to="/projects/completed" className="px-4 py-3 text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors text-sm font-medium">Completed Projects</Link>
              </div>
            </div>
          </div>

          <Link to="/news" className="text-white font-medium hover:text-[var(--color-primary)] pb-1 transition-colors">{t('header.news')}</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Sleek Language Switcher */}
          <div className="flex items-center gap-2 text-sm font-bold tracking-wider">
            <button 
              onClick={() => i18n.changeLanguage('en')}
              className={`transition-colors ${i18n.language === 'en' ? 'text-[var(--color-primary)]' : 'text-white hover:text-[var(--color-primary)]'}`}
            >
              EN
            </button>
            <span className="text-white/30">|</span>
            <button 
              onClick={() => i18n.changeLanguage('si')}
              className={`transition-colors ${i18n.language === 'si' ? 'text-[var(--color-primary)]' : 'text-white hover:text-[var(--color-primary)]'}`}
            >
              SI
            </button>
          </div>

          <button className="text-white hover:text-[var(--color-primary)] transition-colors ml-4">
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu Toggle & Mini Actions */}
        <div className="flex lg:hidden items-center gap-5">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
            <button 
              onClick={() => i18n.changeLanguage('en')}
              className={`transition-colors ${i18n.language === 'en' ? 'text-[var(--color-primary)]' : 'text-white hover:text-[var(--color-primary)]'}`}
            >
              EN
            </button>
            <span className="text-white/30">|</span>
            <button 
              onClick={() => i18n.changeLanguage('si')}
              className={`transition-colors ${i18n.language === 'si' ? 'text-[var(--color-primary)]' : 'text-white hover:text-[var(--color-primary)]'}`}
            >
              SI
            </button>
          </div>
          <button className="text-white hover:text-[var(--color-primary)]">
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button
            className="text-white hover:text-[var(--color-primary)] ml-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-0 z-40 bg-black/90 backdrop-blur-xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ top: '88px' }}>
        <div className="flex flex-col p-6 h-full overflow-y-auto pb-24">
          <nav className="flex flex-col gap-6 text-white text-xl">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.home')}</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.about')}</Link>

            {/* Mobile Dropdown 1 */}
            <div className="flex flex-col border-b border-white/10 pb-4">
              <button
                onClick={() => toggleSubmenu('pages')}
                className="flex items-center justify-between hover:text-[var(--color-primary)] transition-colors"
              >
                <span>{t('header.pages')}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${openSubmenu === 'pages' ? 'rotate-180' : ''}`} />
              </button>
              {openSubmenu === 'pages' && (
                  <div className="flex flex-col pl-4 border-l-2 border-[var(--color-primary)]/30 space-y-3 mt-2">
                    <Link to="/pages/team" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 text-sm hover:text-white transition-colors">{t('header.team')}</Link>
                    <Link to="/pages/careers" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 text-sm hover:text-white transition-colors">{t('header.careers')}</Link>
                    <Link to="/pages/faq" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 text-sm hover:text-white transition-colors">{t('header.faq')}</Link>
                    <Link to="/pages/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 text-sm hover:text-white transition-colors">{t('header.contact')}</Link>
                  </div>
              )}
            </div>

            {/* Mobile Dropdown 2 */}
            <div className="flex flex-col border-b border-white/10 pb-4">
              <button
                onClick={() => toggleSubmenu('projects')}
                className="flex items-center justify-between hover:text-[var(--color-primary)] transition-colors"
              >
                <span>{t('header.projects')}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${openSubmenu === 'projects' ? 'rotate-180' : ''}`} />
              </button>
              {openSubmenu === 'projects' && (
                <div className="flex flex-col gap-4 mt-4 pl-4 text-gray-300 text-lg">
                  <Link to="/projects/ongoing" onClick={() => setIsMobileMenuOpen(false)}>Ongoing Projects</Link>
                  <Link to="/projects/completed" onClick={() => setIsMobileMenuOpen(false)}>Completed Projects</Link>
                </div>
              )}
            </div>

            <Link to="/news" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.news')}</Link>
          </nav>

          <div className="mt-8">
            <div className="bg-[var(--color-primary)] text-black p-4 rounded-md flex items-center justify-center gap-3">
              <Phone className="w-6 h-6" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{t('header.callAnytime')}</span>
                <span className="font-bold text-lg">92 666 888 0000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
