import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CONTACT_INFO } from '../../data/contactInfo';

// --- Brand SVG Icons for Footer ---
function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c0 1.83-.54 3.73-1.66 5.18-1.34 1.77-3.48 2.87-5.71 2.98-2.3.11-4.66-.75-6.24-2.42-1.84-1.92-2.61-4.73-2.03-7.33.56-2.52 2.38-4.69 4.82-5.69 1.47-.6 3.12-.76 4.69-.47v4.14c-.87-.27-1.82-.28-2.69-.02-1.02.3-1.87 1.05-2.26 2.03-.49 1.18-.32 2.61.43 3.63.74 1.03 2.01 1.61 3.28 1.49 1.25-.11 2.38-.89 2.89-2.03.35-.77.46-1.65.46-2.5V.02z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.78 14.15c-.24.68-1.2 1.28-1.68 1.33-.46.05-.98.08-3.15-.81-2.42-1-3.95-3.49-4.07-3.65-.12-.16-.98-1.31-.98-2.5 0-1.19.62-1.78.84-2.02.22-.24.48-.3.64-.3.16 0 .32 0 .46.01.15.01.35-.06.54.4.2.49.68 1.66.74 1.78.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.25.25-.11.49.14.24.62 1.02 1.33 1.65.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.6-.18 1.28z" />
    </svg>
  );
}

function TelegramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

function PinterestIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

export default function Footer() {
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language === 'si';
    const currentYear = new Date().getFullYear();

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const footerSocials = [
        { name: 'Facebook', url: CONTACT_INFO.social.facebook, icon: FacebookIcon, color: 'hover:text-[#1877F2]' },
        { name: 'WhatsApp', url: CONTACT_INFO.social.whatsappDirect, icon: WhatsAppIcon, color: 'hover:text-[#25D366]' },
        { name: 'YouTube', url: CONTACT_INFO.social.youtube, icon: YouTubeIcon, color: 'hover:text-[#FF0000]' },
        { name: 'TikTok', url: CONTACT_INFO.social.tiktok, icon: TikTokIcon, color: 'hover:text-black' },
        { name: 'Instagram', url: CONTACT_INFO.social.instagram, icon: InstagramIcon, color: 'hover:text-[#E4405F]' },
        { name: 'Telegram', url: CONTACT_INFO.social.telegram, icon: TelegramIcon, color: 'hover:text-[#229ED9]' },
        { name: 'LinkedIn', url: CONTACT_INFO.social.linkedin, icon: LinkedInIcon, color: 'hover:text-[#0A66C2]' },
        { name: 'Pinterest', url: CONTACT_INFO.social.pinterest, icon: PinterestIcon, color: 'hover:text-[#BD081C]' },
    ];

    return (
        <footer 
            className="w-full relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('/images/footer_image.jpeg')` }}
        >
            {/* Subtle gradient overlay to enhance depth & glass contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/30 pointer-events-none"></div>

            <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-14 relative z-10 max-w-[1400px]">
                
                {/* Ultra-Frosted Glassmorphism Box */}
                <div className="reveal-fade-up relative overflow-hidden bg-white/65 hover:bg-white/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/70 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 transition-all duration-300">
                    {/* Specular glass sheen highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-white/10 pointer-events-none rounded-2xl sm:rounded-3xl"></div>

                    {/* Top Section */}
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center lg:items-center gap-6 sm:gap-8 lg:gap-12 mb-6 sm:mb-8">
                        {/* Left Column - Brand & Socials */}
                        <div className="lg:w-2/5 flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
                            <Link to="/" onClick={scrollToTop} className="inline-flex items-center justify-center transition-transform hover:scale-105 duration-200">
                               <img 
                                 src="/images/aswanna_logo.png" 
                                 alt="Aswanna Logo" 
                                 className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto object-contain drop-shadow-md hover:drop-shadow-lg transition-all duration-300" 
                               />
                            </Link>

                            {/* Social Media Links */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
                                {footerSocials.map((soc) => {
                                    const Icon = soc.icon;
                                    return (
                                        <a
                                            key={soc.name}
                                            href={soc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={soc.name}
                                            className={`w-9 h-9 rounded-full bg-white/75 hover:bg-white text-gray-700 ${soc.color} border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(28,116,84,0.25)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Column - Links Grid (3 columns) */}
                        <div className="lg:w-3/5 grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8 pt-2 lg:pt-0 w-full sm:w-auto">
                            {/* Column 1: Main Menu */}
                            <div className="flex flex-col gap-1 sm:gap-2">
                                <h4 className="font-extrabold text-gray-900 text-[11px] sm:text-sm mb-0.5 truncate">{t('footer.mainMenu', 'Main Menu')}</h4>
                                <Link to="/" onClick={scrollToTop} className="text-gray-800 hover:text-[#1c7454] text-[10px] sm:text-[13px] font-semibold transition-colors truncate">{t('header.home', 'Home')}</Link>
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
                        </div>
                    </div>

                    <hr className="border-gray-900/10 my-3 sm:my-5" />

                    {/* Bottom Legal Notice & Copyright */}
                    <div className="flex flex-col items-center gap-2.5 pt-1 pb-16 lg:pb-0 text-center">
                        <p className="text-gray-700 text-[9px] sm:text-[10px] leading-relaxed font-normal opacity-85 max-w-6xl mx-auto">
                            &quot;අස්වැන්න&quot; (Aswanna) ලියාපදිංචි වෙළඳ නාමය, නිල ලාංඡනය මෙන්ම මෙම වෙබ් අඩවිය තුළ පළ කර ඇති සියලුම ලිපි, ඡායාරූප, වීඩියෝ දර්ශන, ග්රැෆික් නිර්මාණ සහ අනෙකුත් බහුමාධ්ය අන්තර්ගතයන් ශ්රී ලංකාවේ 2003 අංක 36 දරන බුද්ධිමය දේපළ පනත යටතේ නීත්යානුකූලව ආරක්ෂා කර ඇති නෛතික දේපළ වේ. පූර්ව ලිඛිත නිල අනුමැතියකින් තොරව මෙහි අන්තර්ගත කිසිවක් සම්පූර්ණයෙන්ම හෝ කොටස් වශයෙන් පිටපත් කිරීම, බාගත කර නැවත පළ කිරීම, විකෘති කිරීම හෝ වාණිජමය හා ප්රවර්ධන කටයුතු සඳහා භාවිත කිරීම සපුරා තහනම් වන අතර, එවැනි අනවසර භාවිතයන්ට එරෙහිව දැඩි නීතිමය පියවර ගනු ලැබේ.
                        </p>
                        <p className="text-gray-800 text-[10px] sm:text-xs font-semibold">
                            © {currentYear} Aswanna. All rights reserved. | සියලුම හිමිකම් ඇවිරිණි.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
