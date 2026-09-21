import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language === 'si';

    return (
        <footer 
            className="w-full relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('/images/footer_image.jpeg')` }}
        >
            {/* Subtle overlay to make text more readable */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

            <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-16 relative z-10 max-w-[1400px]">
                
                {/* Glassy Box */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-10">
                    {/* Top Section */}
                    <div className="flex flex-col lg:flex-row justify-between gap-6 sm:gap-8 lg:gap-16 mb-4 sm:mb-8">
                        {/* Left Column - Brand & Info */}
                        <div className="lg:w-1/3 flex flex-col items-start">
                            <Link to="/" className="mb-3 sm:mb-4 inline-block bg-white/50 p-2 sm:p-2.5 rounded-2xl backdrop-blur-sm border border-white/40 shadow-2xs">
                               <img src="/images/aswanna_logo.png" alt="Aswanna Logo" className="h-7 sm:h-9 w-auto object-contain" />
                            </Link>
                            <p className="text-gray-900 text-xs sm:text-sm leading-relaxed font-medium sm:font-bold max-w-sm">
                                {isSinhala 
                                    ? "අස්වැන්න කෘෂිකර්මාන්තය සරල කරයි. කිසිදු අතරමැදියෙකු නොමැතිව ඔබේ කෘෂිකාර්මික සිහිනයට පහසු මාවතක්."
                                    : "Aswanna makes agriculture simple, with no middlemen—just an easy path to your agricultural success."
                                }
                            </p>
                        </div>

                        {/* Right Column - Links Grid (3 columns on mobile, 4 on desktop) */}
                        <div className="lg:w-2/3 grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-6 lg:gap-8">
                            {/* Column 1: Main Menu */}
                            <div className="flex flex-col gap-1 sm:gap-2">
                                <h4 className="font-extrabold text-gray-900 text-[11px] sm:text-sm mb-0.5 truncate">{t('footer.mainMenu', 'Main Menu')}</h4>
                                <Link to="/" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{t('header.home', 'Home')}</Link>
                                <Link to="/about" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{t('header.about', 'About Us')}</Link>
                                <Link to="/agro" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{t('header.agroTechnology', 'Agro Tech')}</Link>
                                <Link to="/news" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{t('header.news', 'News')}</Link>
                                <Link to="/blog" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{t('header.blog', 'Blog')}</Link>
                            </div>

                            {/* Column 2: Resources */}
                            <div className="flex flex-col gap-1 sm:gap-2">
                                <h4 className="font-extrabold text-gray-900 text-[11px] sm:text-sm mb-0.5 truncate">{t('footer.resources', 'Resources')}</h4>
                                <Link to="/careers" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{t('header.careers', 'Careers')}</Link>
                                <Link to="/education" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{t('header.education', 'Education')}</Link>
                                <Link to="/gallery" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{t('header.gallery', 'Gallery')}</Link>
                                <Link to="/pages/contact" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{t('header.contact', 'Contact Us')}</Link>
                            </div>

                            {/* Column 3: Services */}
                            <div className="flex flex-col gap-1 sm:gap-2">
                                <h4 className="font-extrabold text-gray-900 text-[11px] sm:text-sm mb-0.5 truncate">{t('footer.services', 'Services')}</h4>
                                <Link to="/marketplace" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{isSinhala ? 'අලෙවිසැල' : 'Market'}</Link>
                                <Link to="/plant-finder" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{isSinhala ? 'පැළ සොයන්න' : 'Plants'}</Link>
                                <Link to="/agro-lands" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{isSinhala ? 'කෘෂි ඉඩම්' : 'Agro Lands'}</Link>
                                <Link to="/govijana-sewa" className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{isSinhala ? 'ගොවිජන සේවා' : 'Govijana'}</Link>
                            </div>

                            {/* Column 4: Location & Language (Hidden on mobile, visible on desktop) */}
                            <div className="hidden md:flex flex-col gap-1.5 sm:gap-2.5">
                                <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm mb-0.5">{t('footer.locationLanguage', 'Language')}</h4>
                                <div className="relative max-w-[130px]">
                                    <select 
                                        value={i18n.language}
                                        onChange={(e) => i18n.changeLanguage(e.target.value)}
                                        className="appearance-none w-full bg-white/80 backdrop-blur-md border border-gray-200 text-gray-900 font-bold py-1.5 pl-2.5 pr-7 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#1c7454] focus:ring-1 focus:ring-[#1c7454] cursor-pointer shadow-2xs transition-all"
                                    >
                                        <option value="en">English</option>
                                        <option value="si">සිංහල</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800">
                                        <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-900/10 my-3 sm:my-5" />

                    {/* Bottom Links & Copyright */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 text-center sm:text-left">
                        <p className="text-gray-800 text-[10px] sm:text-xs font-semibold">
                            © 2024 Aswanna. {t('footer.allRightsReserved', 'All rights reserved.')}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs font-semibold">
                            <Link to="/terms" className="text-gray-700 hover:text-[#1c7454] transition-colors">Terms</Link>
                            <Link to="/privacy" className="text-gray-700 hover:text-[#1c7454] transition-colors">Privacy</Link>
                            <Link to="/cookies" className="text-gray-700 hover:text-[#1c7454] transition-colors">Cookies</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
