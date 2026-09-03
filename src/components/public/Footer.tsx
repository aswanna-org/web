import React from 'react';
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
            {/* Subtle overlay to make text more readable if the image is too bright/dark */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

            <div className="container mx-auto px-4 lg:px-8 py-12 md:py-20 relative z-10 max-w-[1400px]">
                
                {/* Glassy Box */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] rounded-3xl p-8 md:p-12">
                    {/* Top Section */}
                    <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-10">
                        {/* Left Column - Brand & Info */}
                        <div className="lg:w-1/3 flex flex-col items-start">
                            <Link to="/" className="mb-6 inline-block bg-white/40 p-3 rounded-xl backdrop-blur-sm border border-white/40 shadow-sm">
                               <img src="/images/aswanna_logo.png" alt="Aswanna Logo" className="h-10 w-auto object-contain" />
                            </Link>
                            <p className="text-gray-900 text-[15px] leading-relaxed mb-6 font-bold max-w-[320px] drop-shadow-sm">
                                {isSinhala 
                                    ? "අස්වැන්න කෘෂිකර්මාන්තය සරල කරයි. කිසිදු අතරමැදියෙකු හෝ සැඟවුණු ගාස්තු නොමැතිව, ඔබේ කෘෂිකාර්මික සිහිනයට පහසු මාවතක්. පළමු පියවර තැබීමට සූදානම්ද?"
                                    : "Aswanna makes agriculture simple, with no middlemen or hidden fees—just an easy path to your agricultural success. Ready to make the first move?"
                                }
                            </p>
                            <Link to="/pages/contact" className="bg-[#1c7454] hover:bg-[#145a40] text-white px-6 py-2.5 rounded-lg font-bold text-[15px] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                {t('header.contact', 'Contact Us')}
                            </Link>
                        </div>

                        {/* Right Column - Links Grid */}
                        <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                            {/* Column 1: Main Menu */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-extrabold text-gray-900 text-[16px] mb-1">{t('footer.mainMenu', 'Main Menu')}</h4>
                                <Link to="/" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{t('header.home', 'Home')}</Link>
                                <Link to="/about" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{t('header.about', 'About Us')}</Link>
                                <Link to="/agro" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{t('header.agroTechnology', 'Agro Technology')}</Link>
                                <Link to="/news" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{t('header.news', 'News')}</Link>
                                <Link to="/blog" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{t('header.blog', 'Blog')}</Link>
                            </div>

                            {/* Column 2: Resources */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-extrabold text-gray-900 text-[16px] mb-1">{t('footer.resources', 'Resources')}</h4>
                                <Link to="/careers" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{t('header.careers', 'Careers')}</Link>
                                <Link to="/education" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{t('header.education', 'Education')}</Link>
                                <Link to="/gallery" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{t('header.gallery', 'Gallery')}</Link>
                                <Link to="/pages/contact" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{t('header.contact', 'Contact Us')}</Link>
                            </div>

                            {/* Column 3: Services */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-extrabold text-gray-900 text-[16px] mb-1">{t('footer.services', 'Services')}</h4>
                                <Link to="/marketplace" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{isSinhala ? 'අලෙවිසැල' : 'Marketplace'}</Link>
                                <Link to="/plant-finder" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{isSinhala ? 'පැළයක් සොයාගමු' : 'Plant Finder'}</Link>
                                <Link to="/agro-lands" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{isSinhala ? 'කෘෂි ඉඩම්' : 'Agro Lands'}</Link>
                                <Link to="/govijana-sewa" className="text-gray-800 hover:text-[#1c7454] text-[14px] font-bold transition-colors">{isSinhala ? 'ගොවිජන සේවා' : 'Govijana Sewa'}</Link>
                            </div>

                            {/* Column 4: Location & Language */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-extrabold text-gray-900 text-[16px] mb-1">{t('footer.locationLanguage', 'Location and language')}</h4>
                                <div className="relative max-w-[150px]">
                                    <select 
                                        value={i18n.language}
                                        onChange={(e) => i18n.changeLanguage(e.target.value)}
                                        className="appearance-none w-full bg-white/70 backdrop-blur-md border border-white/50 text-gray-900 font-bold py-2 pl-3 pr-8 rounded-xl text-[14px] focus:outline-none focus:border-[#1c7454] focus:ring-1 focus:ring-[#1c7454] cursor-pointer shadow-sm transition-all"
                                    >
                                        <option value="en">English</option>
                                        <option value="si">සිංහල</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-900/10 my-8" />

                    {/* Bottom Links & Copyright */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-800 text-[13px] font-bold">
                            © 2024 Aswanna. {t('footer.allRightsReserved', 'All rights reserved.')}
                        </p>
                        <div className="flex items-center gap-6">
                            <Link to="/terms" className="text-gray-800 hover:text-[#1c7454] text-[13px] font-bold transition-colors">Terms of Service</Link>
                            <Link to="/privacy" className="text-gray-800 hover:text-[#1c7454] text-[13px] font-bold transition-colors">Privacy Policy</Link>
                            <Link to="/cookies" className="text-gray-800 hover:text-[#1c7454] text-[13px] font-bold transition-colors">Cookie Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
