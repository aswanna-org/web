import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trackPageView } from '../../utils/analytics';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any>;
}

const DEFAULT_TITLE = 'Aswanna - Digital Hub for Sri Lankan Agriculture | අස්වැන්න';
const DEFAULT_DESC = 'ශ්‍රී ලාංකේය කෘෂිකර්මාන්තයට නවීන තාක්ෂණයේ සවිය එක් කරමින්, බිම් මට්ටමේ ගොවියාගේ සිට වාණිජ ව්‍යවසායකයා දක්වා නිවැරදි දැනුමෙන් සන්නද්ධ කරන පුරෝගාමී ඩිජිටල් කේන්ද්‍රස්ථානය - Aswanna Ceylon Agro.';
const DEFAULT_IMAGE = 'https://aswanna.lk/images/aswanna_logo.png';
const BASE_URL = 'https://aswanna.lk';

function setMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string) {
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export default function SEO({
  title,
  description = DEFAULT_DESC,
  keywords,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd
}: SEOProps) {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    // 1. Title
    const fullTitle = title 
      ? (title.includes('Aswanna') ? title : `${title} | Aswanna`) 
      : DEFAULT_TITLE;
    document.title = fullTitle;

    // 2. Language attribute on <html>
    const currentLang = i18n.language || 'si';
    document.documentElement.lang = currentLang;

    // 3. Canonical URL
    const canonicalUrl = canonical 
      ? (canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical}`)
      : `${BASE_URL}${location.pathname}`;
    setCanonical(canonicalUrl);

    // 4. Meta Description & Keywords
    setMetaTag('name', 'description', description);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    // 5. OpenGraph Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', image.startsWith('http') ? image : `${BASE_URL}${image}`);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', 'Aswanna Ceylon Agro');
    setMetaTag('property', 'og:locale', currentLang === 'si' ? 'si_LK' : 'en_US');

    // 6. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image.startsWith('http') ? image : `${BASE_URL}${image}`);

    // 7. Optional JSON-LD Structured Data for this specific page
    const scriptId = 'dynamic-page-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        scriptTag.id = scriptId;
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // 8. Log / Send GA Pageview with refreshed title
    trackPageView(location.pathname + location.search, fullTitle);

    return () => {
      // Cleanup custom JSON-LD when unmounting
      const cleanupTag = document.getElementById(scriptId);
      if (cleanupTag) cleanupTag.remove();
    };
  }, [title, description, keywords, canonical, image, type, jsonLd, location.pathname, location.search, i18n.language]);

  return null;
}
