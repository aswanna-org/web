import { ShoppingCart, Menu, X, ChevronDown, ChevronRight, LogOut, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import FontSizeSwitcher from './FontSizeSwitcher';

interface Category {
  id: string;
  name: string;
  sinhalaName: string | null;
  slug: string;
  parentId: string | null;
  order: number;
}

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout, openLoginModal, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [openMobileCategories, setOpenMobileCategories] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  const toggleMobileCategory = (catId: string) => {
    setOpenMobileCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const isSinhala = i18n.language === 'si';

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/tree`);
        if (res.ok) {
          const data = await res.json();
          // /tree returns a nested structure; flatten it for the nav
          const flatten = (items: any[]): any[] => items.flatMap((c: any) => [c, ...(c.children ? flatten(c.children) : [])]);
          setDbCategories(Array.isArray(data) ? flatten(data) : []);
        }
      } catch (err) {
        console.error("Failed to fetch categories for navbar", err);
      }
    };
    fetchCategories();
  }, [API_BASE_URL]);

  const toggleSubmenu = (menu: string) => {
    if (openSubmenu === menu) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(menu);
    }
  };

  const mainCategories = useMemo(() => dbCategories.filter(c => !c.parentId).sort((a, b) => a.order - b.order), [dbCategories]);
  const getSubCategories = (parentId: string) => dbCategories.filter(c => c.parentId === parentId).sort((a, b) => a.order - b.order);

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? 'bg-black/40 backdrop-blur-md shadow-xl py-2'
        : 'bg-transparent py-2.5 sm:py-4'
        }`}>
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/aswanna_logo.png" alt="Aswanna Logo" className="h-12 sm:h-16 xl:h-24 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-5 2xl:gap-8">
            <Link to="/" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.home')}</Link>
            <Link to="/about" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.about')}</Link>

            {/* Agro Technology Dropdown */}
            <div className="relative group">
              <Link to="/agro" className="flex items-center gap-1 text-white text-[15px] font-medium hover:text-white/80 transition-colors py-2">
                {t('header.agroTechnology', 'Agro Technology')} <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 duration-200" />
              </Link>
              <div className="absolute top-full left-0 hidden group-hover:flex pt-2 w-64">
                <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 overflow-visible w-full">
                  <div className="flex flex-col p-2 gap-0.5">
                    {mainCategories.map((cat) => {
                      const subCats = getSubCategories(cat.id);
                      return (
                        <div key={cat.id} className="relative group/sub">
                          <Link
                            to={`/agro/${cat.slug}`}
                            className="flex items-center justify-between px-3 py-2.5 rounded-full hover:bg-green-50 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors w-full text-left"
                          >
                            {isSinhala ? (cat.sinhalaName || cat.name) : cat.name}
                            {subCats.length > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                          </Link>

                          {/* Nested Flyout Menu */}
                          {subCats.length > 0 && (
                            <div className="absolute -top-2 left-full pl-1 hidden group-hover/sub:flex w-56 z-50">
                              <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 overflow-hidden w-full">
                                <div className="flex flex-col p-2 gap-0.5">
                                  {subCats.map((subCat) => {
                                    return (
                                      <Link
                                        key={subCat.id}
                                        to={`/agro/${cat.slug}/${subCat.slug}`}
                                        className="px-3 py-2.5 rounded-full hover:bg-green-50 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors"
                                      >
                                        {isSinhala ? (subCat.sinhalaName || subCat.name) : subCat.name}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>


            <Link to="/news" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.news', 'News')}</Link>
            <Link to="/blog" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.blog', 'Blog')}</Link>
            <Link to="/careers" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.careers', 'Careers')}</Link>
            <Link to="/education" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.education', 'Education')}</Link>
            <Link to="/gallery" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.gallery', 'Gallery')}</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden xl:flex items-center gap-3">
            {/* Font Size Switcher */}
            <FontSizeSwitcher variant="glass" />

            {/* Language Switcher Pill */}
            <LanguageSwitcher />

            {/* Contact Us Glass Icon Pill */}
            <Link
              to="/pages/contact"
              className="glass-btn h-[38px] w-[38px] px-0 flex items-center justify-center rounded-full hover:scale-105 transition-all"
              title={t('header.contact', 'Contact Us')}
              aria-label={t('header.contact', 'Contact Us')}
            >
              <PhoneCall className="w-4 h-4 text-white" />
            </Link>

            {/* Login / Logout Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="glass-btn h-[38px] px-5 text-xs sm:text-sm font-bold"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="glass-btn h-[38px] px-6 text-xs sm:text-sm tracking-wide font-bold flex items-center gap-1.5 cursor-pointer text-white hover:text-white/90"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="glass-btn h-[38px] px-6 text-xs sm:text-sm tracking-wide font-bold cursor-pointer"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle & Mini Actions */}
          <div className="flex xl:hidden items-center gap-1.5 sm:gap-2">
            <FontSizeSwitcher variant="transparent" />
            <LanguageSwitcher variant="globe" />
            <Link
              to="/marketplace"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all duration-200 cursor-pointer select-none"
              title="Marketplace Cart"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
            </Link>
            <button
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all duration-200 cursor-pointer select-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

      </header>

      {/* Mobile Menu Overlay */}
      <div className={`xl:hidden fixed inset-0 z-40 bg-black/90 backdrop-blur-xl transition-transform duration-300 pt-[100px] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col p-6 h-full overflow-y-auto pb-24">
          <nav className="flex flex-col gap-6 text-white text-xl">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.home')}</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.about')}</Link>

            {/* Mobile Agro Technology */}
            <div className="flex flex-col">
              <button
                onClick={() => toggleSubmenu('agro')}
                className="flex items-center justify-between hover:text-[var(--color-primary)] transition-colors"
              >
                <span>{t('header.agroTechnology', 'Agro Technology')}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${openSubmenu === 'agro' ? 'rotate-180' : ''}`} />
              </button>
              {openSubmenu === 'agro' && (
                <div className="flex flex-col pl-4 border-l-2 border-[var(--color-primary)]/30 space-y-4 mt-4">
                  <Link to="/agro" onClick={() => setIsMobileMenuOpen(false)} className="text-[var(--color-primary)] text-base font-bold hover:text-white transition-colors">
                    {t('agro.allMainCategories', 'All Categories')}
                  </Link>
                  {mainCategories.map((cat) => {
                    const subCats = getSubCategories(cat.id);
                    const isCatOpen = !!openMobileCategories[cat.id];
                    return (
                      <div key={cat.id} className="flex flex-col border-b border-white/5 pb-2">
                        <div className="flex items-center justify-between py-1">
                          <Link
                            to={`/agro/${cat.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 text-gray-200 text-sm font-bold hover:text-emerald-400 transition-colors flex-1"
                          >
                            {/* <Sprout className="w-4 h-4 text-emerald-400 shrink-0" /> */}
                            <span>{isSinhala ? (cat.sinhalaName || cat.name) : cat.name}</span>
                          </Link>
                          {subCats.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleMobileCategory(cat.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                              aria-label="Toggle subcategories"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCatOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                            </button>
                          )}
                        </div>

                        {subCats.length > 0 && isCatOpen && (
                          <div className="flex flex-col pl-6 space-y-2.5 pt-2 pb-1 border-l border-white/10 ml-3">
                            {subCats.map((subCat) => (
                              <Link
                                key={subCat.id}
                                to={`/agro/${cat.slug}/${subCat.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-gray-300 text-xs hover:text-emerald-300 transition-colors"
                              >
                                {isSinhala ? (subCat.sinhalaName || subCat.name) : subCat.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>


            <Link to="/news" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.news', 'News')}</Link>
            <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.blog', 'Blog')}</Link>
            <Link to="/careers" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.careers', 'Careers')}</Link>
            <Link to="/education" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.education', 'Education')}</Link>
            <Link to="/gallery" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.gallery', 'Gallery')}</Link>


            {/* Contact & Login for mobile */}
            <div className="flex flex-col gap-4 mt-2 pt-6 border-t border-white/10">
              <Link
                to="/pages/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="glass-btn w-full py-3.5 text-base"
              >
                {t('header.contact', 'Contact Us')}
              </Link>
              {isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="glass-btn-green w-full py-3.5 text-base font-bold text-center"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="glass-btn-light w-full py-3.5 text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="glass-btn-light w-full py-3.5 text-base font-bold cursor-pointer"
                >
                  Login
                </button>
              )}
            </div>
          </nav>

          {/* Mobile menu content ends */}
        </div>
      </div>
    </>
  );
}
