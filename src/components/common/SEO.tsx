import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trackPageView } from '../../utils/analytics';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  breadcrumbs?: BreadcrumbItem[];
  noindex?: boolean;
}

const DEFAULT_TITLE = 'Aswanna - Digital Hub for Sri Lankan Agriculture | අස්වැන්න';
const DEFAULT_DESC = 'ශ්‍රී ලාංකේය කෘෂිකර්මාන්තයට නවීන තාක්ෂණයේ සවිය එක් කරමින්, බිම් මට්ටමේ ගොවියාගේ සිට වාණිජ ව්‍යවසායකයා දක්වා නිවැරදි දැනුමෙන් සන්නද්ධ කරන පුරෝගාමී ඩිජිටල් කේන්ද්‍රස්ථානය - Aswanna Ceylon Agro.';
const DEFAULT_IMAGE = 'https://aswanna.lk/images/aswanna_logo_square.png';
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

function cleanCanonicalUrl(inputUrl?: string, pathname: string = '/'): string {
  let target = inputUrl 
    ? (inputUrl.startsWith('http') ? inputUrl : `${BASE_URL}${inputUrl.startsWith('/') ? '' : '/'}${inputUrl}`)
    : `${BASE_URL}${pathname}`;

  // Strip query strings and hash for standard canonicals
  target = target.split('?')[0].split('#')[0];
  // Remove trailing slash if not root
  if (target.length > BASE_URL.length && target.endsWith('/')) {
    target = target.slice(0, -1);
  }
  return target;
}

export default function SEO({
  title,
  description = DEFAULT_DESC,
  keywords,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd,
  breadcrumbs,
  noindex = false
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

    // 3. Robots directive (noindex for private/auth/admin/error views)
    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // 4. Canonical URL
    const canonicalUrl = cleanCanonicalUrl(canonical, location.pathname);
    setCanonical(canonicalUrl);

    // 5. Meta Description & Keywords
    setMetaTag('name', 'description', description);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    // 6. OpenGraph Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', image.startsWith('http') ? image : `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', 'Aswanna Ceylon Agro');
    setMetaTag('property', 'og:locale', currentLang === 'si' ? 'si_LK' : 'en_US');

    // 7. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image.startsWith('http') ? image : `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`);

    // 8. JSON-LD Structured Data (combines custom schema & BreadcrumbList)
    const scriptId = 'dynamic-page-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;

    const schemasToInject: any[] = [];

    // Optional BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemasToInject.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: crumb.url.startsWith('http') ? crumb.url : `${BASE_URL}${crumb.url.startsWith('/') ? '' : '/'}${crumb.url}`
        }))
      });
    }

    // Custom Page-specific Schema
    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        schemasToInject.push(...jsonLd);
      } else {
        schemasToInject.push(jsonLd);
      }
    }

    if (schemasToInject.length > 0) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        scriptTag.id = scriptId;
        document.head.appendChild(scriptTag);
      }
      const payload = schemasToInject.length === 1 
        ? schemasToInject[0] 
        : { '@context': 'https://schema.org', '@graph': schemasToInject };
      scriptTag.text = JSON.stringify(payload);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // 9. Send GA Pageview with refreshed title
    trackPageView(location.pathname + location.search, fullTitle);

    return () => {
      // Cleanup custom JSON-LD when unmounting
      const cleanupTag = document.getElementById(scriptId);
      if (cleanupTag) cleanupTag.remove();
    };
  }, [title, description, keywords, canonical, image, type, jsonLd, breadcrumbs, noindex, location.pathname, location.search, i18n.language]);

  return null;
}
