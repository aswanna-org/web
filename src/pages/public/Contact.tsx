import { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  Smartphone, 
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHero from '../../components/public/PageHero';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Official Brand SVGs ---
function AppleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.63 1.34-.56.64-.99 1.7-.87 2.73 1.01.08 2.01-.5 2.58-1.2z" />
    </svg>
  );
}

function GooglePlayIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M3.6 2.4c-.2.2-.4.6-.4 1v17.2c0 .4.1.8.4 1l9.6-9.6-9.6-9.6z" />
      <path fill="#FBBC04" d="M16.6 15.4l-3.4-3.4 3.4-3.4 3.9 2.2c1.1.6 1.1 1.7 0 2.4l-3.9 2.2z" />
      <path fill="#EA4335" d="M13.2 12l-9.6 9.6c.4.4 1.1.4 1.7.1l11.3-6.4-3.4-3.3z" />
      <path fill="#34A853" d="M13.2 12l3.4-3.3-11.3-6.4c-.6-.3-1.3-.3-1.7.1l9.6 9.6z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.78 14.15c-.24.68-1.2 1.28-1.68 1.33-.46.05-.98.08-3.15-.81-2.42-1-3.95-3.49-4.07-3.65-.12-.16-.98-1.31-.98-2.5 0-1.19.62-1.78.84-2.02.22-.24.48-.3.64-.3.16 0 .32 0 .46.01.15.01.35-.06.54.4.2.49.68 1.66.74 1.78.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.25.25-.11.49.14.24.62 1.02 1.33 1.65.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.6-.18 1.28z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c0 1.83-.54 3.73-1.66 5.18-1.34 1.77-3.48 2.87-5.71 2.98-2.3.11-4.66-.75-6.24-2.42-1.84-1.92-2.61-4.73-2.03-7.33.56-2.52 2.38-4.69 4.82-5.69 1.47-.6 3.12-.76 4.69-.47v4.14c-.87-.27-1.82-.28-2.69-.02-1.02.3-1.87 1.05-2.26 2.03-.49 1.18-.32 2.61.43 3.63.74 1.03 2.01 1.61 3.28 1.49 1.25-.11 2.38-.89 2.89-2.03.35-.77.46-1.65.46-2.5V.02z" />
    </svg>
  );
}

function TelegramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

function PinterestIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

export default function Contact() {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [appAlert, setAppAlert] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorAlert(null);
    setSubmitted(false);

    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit contact message');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
      setTimeout(() => setSubmitted(false), 8000);
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setErrorAlert(err.message || (isSinhala ? 'පණිවිඩය යැවීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.' : 'Failed to send message. Please try again.'));
      setTimeout(() => setErrorAlert(null), 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppDownload = (platform: 'apple' | 'google') => {
    const msg = platform === 'apple'
      ? (isSinhala ? 'Aswanna iOS යෙදුම App Store වෙතින් බාගත කිරීමට සූදානම් කෙරේ...' : 'Preparing Aswanna iOS App download on the App Store...')
      : (isSinhala ? 'Aswanna Android යෙදුම Google Play Store වෙතින් බාගත කිරීමට සූදානම් කෙරේ...' : 'Preparing Aswanna Android App download on Google Play...');
    setAppAlert(msg);
    setTimeout(() => setAppAlert(null), 4000);
  };

  const socialLinks = [
    {
      id: 'facebook',
      name: isSinhala ? 'ෆේස්බුක් නිල පිටුව' : 'Facebook Page',
      desc: isSinhala ? 'දෛනික කෘෂි පුවත් සහ අස්වනු කතා' : 'Daily agriculture news & stories',
      icon: FacebookIcon,
      link: 'https://web.facebook.com/Aswanna.page'
    },
    {
      id: 'whatsapp_chat',
      name: isSinhala ? 'වට්ස්ඇප් සෘජු සබඳතාව' : 'WhatsApp Chat',
      desc: isSinhala ? '+94 70 530 0999 වෙත ක්ෂණික පණිවිඩයක්' : 'Direct chat: +94 70 530 0999',
      icon: WhatsAppIcon,
      link: 'https://wa.me/94705300999'
    },
    {
      id: 'whatsapp_channel',
      name: isSinhala ? 'වට්ස්ඇප් නිල නාලිකාව' : 'WhatsApp Channel',
      desc: isSinhala ? 'දෛනික කෘෂි තොරතුරු සහ යාවත්කාලීන' : 'Official channel updates & alerts',
      icon: WhatsAppIcon,
      link: 'https://whatsapp.com/channel/0029VaehoqNCcW4kwbNDZD2o'
    },
    {
      id: 'youtube',
      name: isSinhala ? 'යූටියුබ් නාලිකාව' : 'YouTube Channel',
      desc: isSinhala ? 'ප්‍රායෝගික වගා වීඩියෝ මඟපෙන්වීම්' : 'Field video guides & tutorials',
      icon: YouTubeIcon,
      link: 'https://www.youtube.com/@Aswanna'
    },
    {
      id: 'tiktok',
      name: isSinhala ? 'ටික්ටොක් (TikTok)' : 'TikTok',
      desc: isSinhala ? 'තත්පර 60 ක්ෂණික ගොවි රහස්' : '60-second smart farming tips',
      icon: TikTokIcon,
      link: 'https://www.tiktok.com/@aswanna.lk?_r=1&_t=ZS-9A9ubC8L69t'
    },
    {
      id: 'instagram',
      name: isSinhala ? 'ඉන්ස්ටග්‍රෑම් (Instagram)' : 'Instagram',
      desc: isSinhala ? 'නැවුම් අස්වනු ඡායාරූප සහ කතා' : 'Fresh farm harvest captures',
      icon: InstagramIcon,
      link: 'https://www.instagram.com/aswanna.agri?stkn=MTBkODM0YzdkeXcw'
    },
    {
      id: 'telegram',
      name: isSinhala ? 'ටෙලිග්‍රෑම් නාලිකාව' : 'Telegram Channel',
      desc: isSinhala ? 'දෛනික තොග වෙළඳපොළ මිල ඇඟවීම්' : 'Daily wholesale market alerts',
      icon: TelegramIcon,
      link: 'https://t.me/aswanna2'
    },
    {
      id: 'linkedin',
      name: isSinhala ? 'ලින්ක්ඩ්ඉන් (LinkedIn)' : 'LinkedIn',
      desc: isSinhala ? 'වෘත්තීය හා ව්‍යවසායක කතිකාවත' : 'Professional & business network',
      icon: LinkedInIcon,
      link: 'https://www.linkedin.com/pulse/aswanna-gihan-buddhika'
    },
    {
      id: 'pinterest',
      name: isSinhala ? 'පින්ටරස්ට් (Pinterest)' : 'Pinterest',
      desc: isSinhala ? 'නවීන කෘෂි නිර්මාණ සහ සැලසුම්' : 'Agricultural ideas & visuals',
      icon: PinterestIcon,
      link: 'https://pin.it/4TDHcXd8n'
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#faf9f6] font-roboto">
      {/* Hero Section */}
      <PageHero 
        title={t('contact.title', 'අප හා සම්බන්ධ වන්න')} 
        description={t('contact.desc', 'කෘෂි ගැටලුවකට පිළිතුරු ලබාගැනීමට පහත සබඳතා ඔස්සේ "අස්වැන්න" හා සම්බන්ධ වන්න. දිනපතා කෘෂි දැනුම ලබන්න අපගේ සමාජ මාධ්‍ය සහ ඩිජිටල් ජාලය හා එක්වන්න.')} 
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#054a29"
        icon={Phone}
        badgeBg="bg-[#054a29]"
        waveColor="text-[#faf9f6]"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 pt-14 sm:pt-20 pb-16 sm:pb-24">

        {/* ── 1. The Two-Card Side-by-Side Section with Glassmorphism & Emerald Palette ── */}
        <div className="relative mb-16 sm:mb-24 z-10">
          {/* Ambient Glassmorphic Background Blur Orbs */}
          <div className="absolute -top-12 left-1/4 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute top-1/3 -right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* ── Left Card: Contact Information (5 columns) with Glassmorphism ── */}
            <div className="lg:col-span-5 bg-white/75 backdrop-blur-2xl rounded-[32px] p-8 sm:p-12 lg:p-14 border border-white/90 shadow-[0_20px_50px_rgba(5,74,41,0.06)] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                  {t('contact.infoTitle', 'Contact Information')}
                </h2>
                <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed mb-8 sm:mb-10">
                  {t('contact.infoDesc', 'Have questions or need help with your agricultural project? Our team is always ready to assist you with professional solutions and reliable support. Feel free to contact us anytime and we will respond as quickly as possible.')}
                </p>

                {/* Items List with Subtle Dividers */}
                <div className="divide-y divide-emerald-900/10">
                  
                  {/* Phone Number */}
                  <div className="py-6 first:pt-0 flex items-start gap-4 sm:gap-5 group/item">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-800 shrink-0 group-hover/item:scale-110 group-hover/item:bg-[#054a29] group-hover/item:text-white transition-all duration-300 shadow-xs">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                        {t('contact.phoneTitle', 'Phone Number')}
                      </h3>
                      <div className="space-y-1.5">
                        <a 
                          href="tel:+94705300999" 
                          className="text-base sm:text-lg font-bold text-gray-800 hover:text-[#054a29] transition-colors block"
                        >
                          +94 70 530 0999
                        </a>
                        <div className="flex items-center gap-2">
                          <a
                            href="https://wa.me/94705300999"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200/80 transition-colors"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                            <span>WhatsApp Chat</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="py-6 flex items-start gap-4 sm:gap-5 group/item">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-800 shrink-0 group-hover/item:scale-110 group-hover/item:bg-[#054a29] group-hover/item:text-white transition-all duration-300 shadow-xs">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                        {t('contact.emailTitle', 'Email Address')}
                      </h3>
                      <div className="space-y-1">
                        <a 
                          href="mailto:aswanna.agri@gmail.com" 
                          className="text-sm sm:text-base font-semibold text-gray-700 hover:text-[#054a29] transition-colors block break-all"
                        >
                          aswanna.agri@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Opening Hour */}
                  <div className="py-6 flex items-start gap-4 sm:gap-5 group/item">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-800 shrink-0 group-hover/item:scale-110 group-hover/item:bg-[#054a29] group-hover/item:text-white transition-all duration-300 shadow-xs">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                        {t('contact.hoursTitle', 'Opening Hour')}
                      </h3>
                      <p className="text-sm sm:text-base font-semibold text-gray-600 leading-relaxed">
                        {isSinhala ? 'සඳුදා - සිකුරාදා: පෙ.ව. 8:30 - ප.ව. 5:00' : 'Mon - Fri: 8:30 AM - 5:00 PM'}
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-gray-500 leading-relaxed">
                        {isSinhala ? 'සෙනසුරාදා: පෙ.ව. 8:30 - ප.ව. 1:00' : 'Sat: 8:30 AM - 1:00 PM'}
                      </p>
                    </div>
                  </div>

                  {/* Our Location */}
                  <div className="py-6 last:pb-0 flex items-start gap-4 sm:gap-5 group/item">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-800 shrink-0 group-hover/item:scale-110 group-hover/item:bg-[#054a29] group-hover/item:text-white transition-all duration-300 shadow-xs">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                        {t('contact.locationTitle', 'Our Location')}
                      </h3>
                      <p className={`text-sm sm:text-base font-semibold text-gray-700 leading-relaxed ${isSinhala ? 'font-noto' : ''}`}>
                        {t('contact.addressValue', isSinhala ? 'අංක 326/A, කොස්හින්න, ගනේමුල්ල' : 'No. 326/A, Koshinna, Ganemulla')}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ── Right Card: Get In Touch (7 columns) with Glassmorphism ── */}
            <div className="lg:col-span-7 bg-white/70 backdrop-blur-2xl border border-white/90 rounded-[32px] p-8 sm:p-12 lg:p-14 shadow-[0_20px_50px_rgba(5,74,41,0.06)] relative overflow-hidden flex flex-col justify-between">
              {/* Subtle glass reflection effect */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-emerald-200/60 shadow-xs text-xs sm:text-sm font-semibold text-emerald-950 mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('contact.getInTouchBadge', 'Get In Touch')}</span>
                </div>

                {/* Main Title */}
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                  {isSinhala ? 'අප හා සම්බන්ධ වන්න' : 'Get In Touch'}
                </h2>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed mb-8 sm:mb-10 max-w-2xl">
                  {t('contact.desc', 'කෘෂි ගැටලුවකට පිළිතුරු ලබාගැනීමට පහත සබඳතා ඔස්සේ "අස්වැන්න" හා සම්බන්ධ වන්න. දිනපතා කෘෂි දැනුම ලබන්න අපගේ සමාජ මාධ්‍ය සහ ඩිජිටල් ජාලය හා එක්වන්න.')}
                </p>

                {/* Success Notification */}
                {submitted && (
                  <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-300 shadow-sm flex items-start gap-3.5 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed">
                      {t('contact.messageSent', 'ඔබගේ පණිවිඩය සාර්ථකව ලැබිණි! අපගේ කෘෂි උපදේශක කණ්ඩායම කඩිනමින් ඔබව සම්බන්ධ කරගනු ඇත.')}
                    </div>
                  </div>
                )}

                {/* Error Notification */}
                {errorAlert && (
                  <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-red-50/90 backdrop-blur-md border border-red-200 shadow-sm flex items-start gap-3.5 animate-fadeIn">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-red-800 font-medium leading-relaxed">
                      {errorAlert}
                    </div>
                  </div>
                )}

                {/* The Form with matching Mockup Inputs & Frosted Glass Styling */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Row 1: Name & Email Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isSinhala ? "ඔබගේ නම (Name)" : "Name"}
                        className="w-full bg-white/65 hover:bg-white/85 focus:bg-white border border-emerald-900/10 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 rounded-2xl px-5 py-4 text-sm font-medium text-gray-800 placeholder-gray-400 outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.015)] backdrop-blur-md"
                      />
                    </div>
                    <div>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={isSinhala ? "විද්‍යුත් තැපෑල (Email Address)" : "Email Address"}
                        className="w-full bg-white/65 hover:bg-white/85 focus:bg-white border border-emerald-900/10 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 rounded-2xl px-5 py-4 text-sm font-medium text-gray-800 placeholder-gray-400 outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.015)] backdrop-blur-md"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone Number & Service Dropdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={isSinhala ? "දුරකථන අංකය (Phone Number)" : "Phone Number"}
                        className="w-full bg-white/65 hover:bg-white/85 focus:bg-white border border-emerald-900/10 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 rounded-2xl px-5 py-4 text-sm font-medium text-gray-800 placeholder-gray-400 outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.015)] backdrop-blur-md"
                      />
                    </div>
                    <div className="relative">
                      <select 
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full bg-white/65 hover:bg-white/85 focus:bg-white border border-emerald-900/10 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 rounded-2xl px-5 py-4 text-sm font-medium text-gray-700 outline-none transition-all appearance-none cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.015)] backdrop-blur-md"
                      >
                        <option value="">{t('contact.servicePlaceholder', "Service You're Interested")}</option>
                        <option value="crop">{isSinhala ? 'බෝග වගා තාක්ෂණය සහ උපදෙස්' : 'Crop Farming Advisory'}</option>
                        <option value="pest">{isSinhala ? 'පළිබෝධ සහ රෝග පාලන ගැටලු' : 'Pest & Disease Control'}</option>
                        <option value="market">{isSinhala ? 'කෘෂි අලෙවිසැල හා නිෂ්පාදන' : 'Marketplace & Products'}</option>
                        <option value="govijana">{isSinhala ? 'ගොවිජන සේවා මධ්‍යස්ථාන තොරතුරු' : 'Agrarian Service Centers'}</option>
                        <option value="education">{isSinhala ? 'කෘෂි අධ්‍යාපනය සහ පාඨමාලා' : 'Agro Education & Courses'}</option>
                        <option value="other">{isSinhala ? 'වෙනත් කරුණු (General Inquiries)' : 'General Inquiries'}</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-emerald-700 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Row 3: Message Textarea */}
                  <div>
                    <textarea 
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={isSinhala ? "ඔබගේ පණිවිඩය මෙහි සටහන් කරන්න... (Message)" : "Message"}
                      className="w-full min-h-[140px] bg-white/65 hover:bg-white/85 focus:bg-white border border-emerald-900/10 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 rounded-2xl p-5 text-sm font-medium text-gray-800 placeholder-gray-400 outline-none transition-all resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.015)] backdrop-blur-md"
                    ></textarea>
                  </div>

                  {/* Signature Emerald Green Pill Button with White Circular Arrow Badge */}
                  <div className="pt-3">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-4 bg-[#054a29] hover:bg-[#075f35] active:scale-[0.98] text-white pl-8 pr-2.5 py-2.5 sm:py-3 rounded-full font-bold text-sm shadow-[0_10px_25px_rgba(5,74,41,0.28)] hover:shadow-[0_14px_32px_rgba(5,74,41,0.38)] transition-all duration-300 cursor-pointer group"
                    >
                      <span>
                        {isSubmitting 
                          ? (isSinhala ? 'යවමින් පවතී...' : 'Sending...') 
                          : (isSinhala ? 'පණිවිඩය යවන්න' : 'Send Message')}
                      </span>
                      <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#054a29] group-hover:rotate-45 group-hover:scale-105 transition-all duration-300 shadow-xs shrink-0">
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>

        {/* ── 2. Unified Premium Social Media Hub Section ── */}
        <div className="mb-16 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isSinhala ? 'ඩිජිටල් ජාලය' : 'Social Network'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              {t('contact.socialTitle', 'අපගේ ඩිජිටල් ජාලය හා එක්වන්න')}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed font-normal">
              {t('contact.socialDesc', 'නවතම කෘෂි දැනුම, නව සොයාගැනීම්, වීඩියෝ මඟපෙන්වීම් සහ පුවත් දිනපතා ලබාගැනීමට අස්වැන්න නිල සමාජ මාධ්‍ය පිටු සමඟ අත්වැල් බැඳගන්න.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-2xl sm:rounded-3xl p-5 border border-gray-100 hover:border-emerald-600/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(5,74,41,0.08)] transition-all duration-300 hover:-translate-y-1 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 group-hover:bg-[#054a29] group-hover:text-white group-hover:border-[#054a29] flex items-center justify-center shrink-0 transition-all duration-300 shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 leading-tight truncate group-hover:text-[#054a29] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-[#054a29] text-gray-400 group-hover:text-white flex items-center justify-center shrink-0 group-hover:rotate-45 transition-all duration-300 ml-2">
                    <ArrowUpRight className="w-4 h-4 stroke-[2]" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* ── 3. App Download Showcase Banner (App Store & Google Play) ── */}
        <div className="relative rounded-[36px] overflow-hidden bg-gradient-to-br from-[#042f1a] via-[#094828] to-[#042716] text-white p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-emerald-700/40">
          
          {/* Background Ambient Orbs */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {appAlert && (
            <div className="fixed bottom-6 right-6 z-50 bg-emerald-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-xl flex items-center gap-3 text-xs sm:text-sm animate-bounce">
              <Smartphone className="w-5 h-5 text-emerald-300" />
              <span>{appAlert}</span>
            </div>
          )}

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content (8 cols) */}
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                <Smartphone className="w-4 h-4" />
                <span>{isSinhala ? 'ජංගම යෙදුම (Mobile App)' : 'Mobile Application'}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
                {t('contact.appTitle', 'අස්වැන්න ජංගම යෙදුම දැන්ම බාගත කරගන්න')}
              </h2>

              <p className="text-xs sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl mb-8 font-normal">
                {t('contact.appDesc', 'නවීන බෝග උපදෙස්, වෙළඳපොළ තොරතුරු, රෝග හඳුනාගැනීම සහ විශේෂඥ මඟපෙන්වීම් දැන් ඔබගේ ස්මාර්ට් ජංගම දුරකථනයෙන්ම පහසුවෙන් ලබාගන්න.')}
              </p>

              {/* ── App Store & Google Play Store Download Buttons ── */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Apple App Store */}
                <button
                  onClick={() => handleAppDownload('apple')}
                  className="bg-black/90 hover:bg-black text-white px-5 sm:px-6 py-3 rounded-2xl border border-white/20 shadow-[0_8px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex items-center gap-3.5 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer group"
                >
                  <AppleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="text-[10px] text-gray-300 uppercase tracking-widest leading-none font-medium mb-1">
                      {isSinhala ? 'බාගත කරගන්න' : 'Download on the'}
                    </p>
                    <p className="text-sm sm:text-base font-bold leading-none font-sans text-white">
                      App Store
                    </p>
                  </div>
                </button>

                {/* Google Play Store */}
                <button
                  onClick={() => handleAppDownload('google')}
                  className="bg-black/90 hover:bg-black text-white px-5 sm:px-6 py-3 rounded-2xl border border-white/20 shadow-[0_8px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex items-center gap-3.5 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer group"
                >
                  <GooglePlayIcon className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="text-[10px] text-gray-300 uppercase tracking-widest leading-none font-medium mb-1">
                      {isSinhala ? 'ලබාගන්න' : 'GET IT ON'}
                    </p>
                    <p className="text-sm sm:text-base font-bold leading-none font-sans text-white">
                      Google Play
                    </p>
                  </div>
                </button>
              </div>

            </div>

            {/* Right Visual (4 cols) - Pure Aswanna Logo */}
            <div className="lg:col-span-4 flex justify-center items-center">
              <div className="relative flex items-center justify-center p-4">
                <img 
                  src="/images/aswanna_logo.png" 
                  alt="Aswanna Logo" 
                  className="w-48 sm:w-60 md:w-64 h-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform duration-500" 
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
