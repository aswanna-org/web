import { ShoppingCart, Menu, X, ChevronDown, ChevronRight, Sprout, Store, Map, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';



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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

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
          : 'bg-transparent py-4'
        }`}>
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/aswanna_logo.png" alt="Aswanna Logo" className="h-16 xl:h-24 w-auto object-contain" />
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

          <Link to="/about" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.about', 'About Us')}</Link>
          <Link to="/news" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.news', 'News')}</Link>
          <Link to="/blog" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.blog', 'Blog')}</Link>
          <Link to="/careers" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.careers', 'Careers')}</Link>
          <Link to="/education" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.education', 'Education')}</Link>
          <Link to="/gallery" className="text-white text-[15px] font-medium hover:text-white/80 transition-colors">{t('header.gallery', 'Gallery')}</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden xl:flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-2 text-sm font-bold tracking-wider mr-2">
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`transition-colors ${i18n.language === 'en' ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              EN
            </button>
            <span className="text-white/30">|</span>
            <button
              onClick={() => i18n.changeLanguage('si')}
              className={`transition-colors ${i18n.language === 'si' ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              SI
            </button>
          </div>

          <Link 
            to="/pages/contact" 
            className="border border-white/50 hover:border-white text-white rounded-full px-5 py-2 text-[14px] font-medium transition-all hover:bg-white/10"
          >
            {t('header.contact', 'Contact Us')}
          </Link>

          <Link 
            to="/admin/login" 
            className="bg-white text-gray-900 hover:text-green-800 rounded-full px-6 py-2 text-[14px] font-bold transition-all hover:bg-gray-100 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Toggle & Mini Actions */}
        <div className="flex xl:hidden items-center gap-5">
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
                    return (
                      <div key={cat.id} className="flex flex-col">
                        <Link
                          to={`/agro/${cat.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2 text-gray-200 text-sm font-bold hover:text-white transition-colors mb-2"
                        >
                          <Sprout className="w-4 h-4" /> {isSinhala ? (cat.sinhalaName || cat.name) : cat.name}
                        </Link>
                        {subCats.length > 0 && (
                          <div className="flex flex-col pl-6 space-y-3 border-l border-white/10 ml-2">
                            {subCats.map((subCat) => (
                              <Link
                                key={subCat.id}
                                to={`/agro/${cat.slug}/${subCat.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-gray-400 text-xs hover:text-white transition-colors"
                              >
                                {isSinhala ? (subCat.sinhalaName || subCat.name) : subCat.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.about', 'About Us')}</Link>
            <Link to="/news" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.news', 'News')}</Link>
            <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.blog', 'Blog')}</Link>
            <Link to="/careers" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.careers', 'Careers')}</Link>
            <Link to="/education" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.education', 'Education')}</Link>
            <Link to="/gallery" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">{t('header.gallery', 'Gallery')}</Link>
            
            {/* Mobile Quick Links */}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
              <span className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">Quick Access</span>
              <Link to="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-[#f6a847]/10 border border-[#f6a847]/30 rounded-xl hover:bg-[#f6a847]/20 transition-colors">
                <Store className="w-6 h-6 text-[#f6a847]" />
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white">{isSinhala ? 'අලෙවිසැල' : 'Marketplace'}</span>
                  <span className="text-[11px] text-gray-400">{isSinhala ? 'බීජ, පොහොර, උපකරණ' : 'Seeds, Fertilizers'}</span>
                </div>
              </Link>
              <Link to="/plant-finder" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-[#5bc07c]/10 border border-[#5bc07c]/30 rounded-xl hover:bg-[#5bc07c]/20 transition-colors">
                <Sprout className="w-6 h-6 text-[#5bc07c]" />
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white">{isSinhala ? 'පැළයක් සොයාගමු' : 'Plant Finder'}</span>
                  <span className="text-[11px] text-gray-400">{isSinhala ? 'පසට ගැළපෙන බෝග' : 'Suitable crops'}</span>
                </div>
              </Link>
              <Link to="/agro-lands" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-[#679fe4]/10 border border-[#679fe4]/30 rounded-xl hover:bg-[#679fe4]/20 transition-colors">
                <Map className="w-6 h-6 text-[#679fe4]" />
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white">{isSinhala ? 'කෘෂි ඉඩම්' : 'Agro Lands'}</span>
                  <span className="text-[11px] text-gray-400">{isSinhala ? 'විකිණීමට හා බද්දට' : 'Sale and lease'}</span>
                </div>
              </Link>
              <Link to="/govijana-sewa" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors">
                <Building className="w-6 h-6 text-emerald-400" />
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white">{isSinhala ? 'ගොවිජන සේවා' : 'Govijana Sewa'}</span>
                  <span className="text-[11px] text-gray-400">{isSinhala ? 'මධ්‍යස්ථාන සොයන්න' : 'Find Agrarian Centers'}</span>
                </div>
              </Link>
            </div>

            {/* Contact & Login for mobile */}
            <div className="flex flex-col gap-4 mt-2 pt-6 border-t border-white/10">
              <Link 
                to="/pages/contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center border border-[var(--color-primary)] text-[var(--color-primary)] rounded-full px-5 py-3 font-medium transition-all hover:bg-[var(--color-primary)] hover:text-white"
              >
                {t('header.contact', 'Contact Us')}
              </Link>
              <Link 
                to="/admin/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center bg-white text-gray-900 hover:text-[var(--color-primary)] rounded-full px-6 py-3 font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                Login
              </Link>
            </div>
          </nav>

          {/* Mobile menu content ends */}
        </div>
      </div>
    </>
  );
}
