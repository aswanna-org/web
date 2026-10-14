import React from 'react';

export interface PlatformBrandConfig {
  name: string;
  slug: string;
  color: string;
  bgHoverGradient: string;
  lightBg: string;
  borderColor: string;
  textColor: string;
  tagline: string;
  taglineSi: string;
  watermark: string;
  actionText: string;
  actionTextSi: string;
  iconSvg: React.ReactNode;
  defaultUrl?: string;
}

export const PLATFORM_BRANDS: Record<string, PlatformBrandConfig> = {
  instagram: {
    name: 'Instagram',
    slug: 'instagram',
    color: '#E1306C',
    bgHoverGradient: 'from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
    lightBg: 'bg-pink-50/70',
    borderColor: 'border-pink-100 hover:border-pink-300',
    textColor: 'text-pink-600',
    tagline: 'Follow us for insights, stories, and a peek behind the scenes',
    taglineSi: 'නවතම කෘෂිකාර්මික තොරතුරු සහ නව සොයාගැනීම් ඡායාරූප සමඟින්',
    watermark: 'Follow',
    actionText: 'Follow on Instagram',
    actionTextSi: 'ඉන්ස්ටග්‍රෑම් ඔස්සේ සම්බන්ධ වන්න',
    defaultUrl: 'https://www.instagram.com/aswanna.lk',
    iconSvg: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    )
  },
  whatsapp: {
    name: 'WhatsApp',
    slug: 'whatsapp',
    color: '#25D366',
    bgHoverGradient: 'from-[#25D366] to-[#128C7E]',
    lightBg: 'bg-emerald-50/70',
    borderColor: 'border-emerald-100 hover:border-emerald-300',
    textColor: 'text-emerald-600',
    tagline: 'Join our farmer community groups & channels for instant updates',
    taglineSi: 'ක්ෂණික උපදෙස් සහ වෙළඳපල මිල ගණන් සඳහා අපගේ වට්ස්ඇප් සමූහ හා එක්වන්න',
    watermark: 'Join',
    actionText: 'Join WhatsApp Group',
    actionTextSi: 'වට්ස්ඇප් සමූහයට එක්වන්න',
    iconSvg: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
      </svg>
    )
  },
  linkedin: {
    name: 'LinkedIn',
    slug: 'linkedin',
    color: '#0A66C2',
    bgHoverGradient: 'from-[#0A66C2] to-[#004182]',
    lightBg: 'bg-sky-50/70',
    borderColor: 'border-sky-100 hover:border-sky-300',
    textColor: 'text-sky-600',
    tagline: 'Industry news & insights — connect with agricultural leaders',
    taglineSi: 'කෘෂිකාර්මික ව්‍යවසායකත්වය සහ ක්ෂේත්‍රයේ නව ප්‍රවණතා දැනගන්න',
    watermark: 'Connect',
    actionText: 'Connect on LinkedIn',
    actionTextSi: 'ලින්ක්ඩ්ඉන් ඔස්සේ සම්බන්ධ වන්න',
    defaultUrl: 'https://www.linkedin.com/company/aswanna',
    iconSvg: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    )
  },
  youtube: {
    name: 'YouTube',
    slug: 'youtube',
    color: '#FF0000',
    bgHoverGradient: 'from-[#FF0000] to-[#B30000]',
    lightBg: 'bg-red-50/70',
    borderColor: 'border-red-100 hover:border-red-300',
    textColor: 'text-red-600',
    tagline: 'Subscribe for fresh content, tutorials, and practical video guides',
    taglineSi: 'වගා උපදෙස් සහ නවීන තාක්ෂණික වීඩියෝ නැරඹීමට සබ්ස්ක්‍රයිබ් කරන්න',
    watermark: 'Subscribe',
    actionText: 'Subscribe on YouTube',
    actionTextSi: 'යූටියුබ් නාලිකාවට එක්වන්න',
    defaultUrl: 'https://www.youtube.com/@aswanna',
    iconSvg: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
      </svg>
    )
  },
  facebook: {
    name: 'Facebook',
    slug: 'facebook',
    color: '#1877F2',
    bgHoverGradient: 'from-[#1877F2] to-[#0D5AC4]',
    lightBg: 'bg-blue-50/70',
    borderColor: 'border-blue-100 hover:border-blue-300',
    textColor: 'text-blue-600',
    tagline: 'Follow us for community updates, news, and farmer discussions',
    taglineSi: 'නවතම පුවත් සහ ගොවි ප්‍රජාවේ අදහස් හුවමාරුව සඳහා ෆේස්බුක් පිටුව',
    watermark: 'Follow',
    actionText: 'Follow on Facebook',
    actionTextSi: 'ෆේස්බුක් ඔස්සේ සම්බන්ධ වන්න',
    defaultUrl: 'https://www.facebook.com/aswanna',
    iconSvg: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    )
  },
  telegram: {
    name: 'Telegram',
    slug: 'telegram',
    color: '#229ED9',
    bgHoverGradient: 'from-[#2AABEE] to-[#229ED9]',
    lightBg: 'bg-sky-50/70',
    borderColor: 'border-sky-100 hover:border-sky-300',
    textColor: 'text-sky-500',
    tagline: 'Get instant official notifications, price alerts & broadcasts',
    taglineSi: 'ක්ෂණික නිල නිවේදන සහ වැදගත් තොරතුරු ටෙලිග්‍රෑම් ඔස්සේ',
    watermark: 'Channel',
    actionText: 'Join Telegram Channel',
    actionTextSi: 'ටෙලිග්‍රෑම් නාලිකාවට එක්වන්න',
    defaultUrl: 'https://t.me/aswanna',
    iconSvg: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    )
  },
  tiktok: {
    name: 'TikTok',
    slug: 'tiktok',
    color: '#000000',
    bgHoverGradient: 'from-[#000000] via-[#010101] to-[#25F4EE]',
    lightBg: 'bg-neutral-50/80',
    borderColor: 'border-neutral-200 hover:border-neutral-400',
    textColor: 'text-neutral-900',
    tagline: 'Quick farming tips, field stories, and short agricultural clips',
    taglineSi: 'කෙටි කෘෂි උපදෙස් සහ අපූරු ගොවි තොරතුරු නැරඹීමට',
    watermark: 'Watch',
    actionText: 'Watch on TikTok',
    actionTextSi: 'ටික්ටොක් ඔස්සේ නරඹන්න',
    defaultUrl: 'https://www.tiktok.com/@aswanna',
    iconSvg: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    )
  },
  x: {
    name: 'X (Twitter)',
    slug: 'x',
    color: '#000000',
    bgHoverGradient: 'from-[#111111] to-[#000000]',
    lightBg: 'bg-neutral-50/80',
    borderColor: 'border-neutral-200 hover:border-neutral-400',
    textColor: 'text-neutral-900',
    tagline: 'Breaking news, live updates, and official agricultural releases',
    taglineSi: 'ක්ෂණික පුවත් සහ වැදගත් නිවේදන දැනගන්න',
    watermark: 'Follow',
    actionText: 'Follow on X',
    actionTextSi: 'X ඔස්සේ සම්බන්ධ වන්න',
    defaultUrl: 'https://x.com/aswanna',
    iconSvg: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
      </svg>
    )
  }
};

export const getBrandConfig = (nameOrSlug?: string | null): PlatformBrandConfig => {
  if (!nameOrSlug) return getDefaultBrandConfig('Community');
  const normalized = nameOrSlug.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  for (const [key, config] of Object.entries(PLATFORM_BRANDS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return config;
    }
  }

  return getDefaultBrandConfig(nameOrSlug);
};

export const getDefaultBrandConfig = (name: string): PlatformBrandConfig => ({
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  color: '#059669',
  bgHoverGradient: 'from-emerald-600 to-teal-700',
  lightBg: 'bg-emerald-50/60',
  borderColor: 'border-emerald-100 hover:border-emerald-300',
  textColor: 'text-emerald-700',
  tagline: 'Connect with our community, discussions and official updates',
  taglineSi: 'අපගේ නිල ප්‍රජාව සහ සාකච්ඡා සමූහ සමඟ අත්වැල් බැඳගන්න',
  watermark: 'Connect',
  actionText: `Connect on ${name}`,
  actionTextSi: `${name} හරහා සම්බන්ධ වන්න`,
  iconSvg: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
});
