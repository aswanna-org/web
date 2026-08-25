import { ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { AGRO_CATEGORIES } from '../../data/agroData';

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
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
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

          {/* Dropdown: Pages */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-white font-medium hover:text-[var(--color-primary)] pb-1 transition-colors">
              {t('header.pages')} <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 duration-200" />
            </button>
            <div className="absolute top-full left-0 hidden group-hover:flex pt-3 w-64">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden w-full">
                <div className="flex flex-col p-2 gap-0.5">
                  <Link to="/pages/careers" className="px-3 py-2.5 rounded-lg hover:bg-[var(--color-secondary)]/8 text-sm font-medium text-gray-700 hover:text-[var(--color-secondary)] transition-colors">
                    {t('header.careers')}
                  </Link>
                  <Link to="/pages/contact" className="px-3 py-2.5 rounded-lg hover:bg-[var(--color-secondary)]/8 text-sm font-medium text-gray-700 hover:text-[var(--color-secondary)] transition-colors">
                    {t('header.contact')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Agro Technology Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-white font-medium hover:text-[var(--color-primary)] pb-1 transition-colors">
              Agro Technology <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 duration-200" />
            </button>
            <div className="absolute top-full left-0 hidden group-hover:flex pt-3 w-64">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden w-full">
                {/* Two-column category list */}
                <div className="flex flex-col p-2 gap-0.5">
                  {AGRO_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/agro/${cat.slug}`}
                      className="px-3 py-2.5 rounded-lg hover:bg-[var(--color-secondary)]/8 text-sm font-medium text-gray-700 hover:text-[var(--color-secondary)] transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                {/* Footer */}
                <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between bg-gray-50/50">
                  <span className="text-xs text-gray-400">{AGRO_CATEGORIES.length} categories available</span>
                  <Link to="/agro" className="text-xs font-semibold text-[var(--color-secondary)] hover:underline flex items-center gap-1">
                    View all →
                  </Link>
                </div>
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

            {/* Mobile Agro Technology */}
            <div className="flex flex-col border-b border-white/10 pb-4">
              <button
                onClick={() => toggleSubmenu('agro')}
                className="flex items-center justify-between hover:text-[var(--color-primary)] transition-colors"
              >
                <span>Agro Technology</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${openSubmenu === 'agro' ? 'rotate-180' : ''}`} />
              </button>
              {openSubmenu === 'agro' && (
                <div className="flex flex-col pl-4 border-l-2 border-[var(--color-primary)]/30 space-y-3 mt-2">
                  <Link to="/agro" onClick={() => setIsMobileMenuOpen(false)} className="text-[var(--color-primary)] text-sm font-bold hover:text-white transition-colors">All Categories</Link>
                  {AGRO_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/agro/${cat.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-gray-300 text-sm hover:text-white transition-colors"
                    >
                      <span>{cat.icon}</span> {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/news" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.news')}</Link>
          </nav>

          {/* Mobile menu content ends */}
        </div>
      </div>
    </header>
  );
}
