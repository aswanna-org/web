/**
 * Google Analytics 4 (GA4) utility module for Aswanna
 *
 * Usage:
 *  - initGA()           → call once at app startup
 *  - trackPageView()    → call on every route change (handled by useGAPageTracking hook / <SEO />)
 *  - trackEvent(...)    → call for custom events anywhere in the app
 *
 * To activate: set VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX in your .env file or GitHub Secrets.
 */

import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string;

// Only initialise if a real GA ID is provided (not placeholder)
export const isGAEnabled = (): boolean => {
  return (
    !!GA_MEASUREMENT_ID &&
    GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX' &&
    GA_MEASUREMENT_ID.startsWith('G-')
  );
};

let isInitialized = false;

/**
 * Initialise Google Analytics. Call once at app root.
 */
export const initGA = (): void => {
  if (isInitialized) return;

  if (!isGAEnabled()) {
    if (import.meta.env.DEV) {
      console.info('[Analytics] GA disabled – set VITE_GA_MEASUREMENT_ID in .env to enable.');
    }
    return;
  }

  ReactGA.initialize(GA_MEASUREMENT_ID, {
    gaOptions: {
      send_page_view: false, // We send page views manually on route changes with accurate titles
    },
  });

  isInitialized = true;

  if (import.meta.env.DEV) {
    console.info(`[Analytics] GA4 initialised successfully with ID: ${GA_MEASUREMENT_ID}`);
  }
};

let lastTrackedPath = '';
let lastTrackedTitle = '';
let lastTrackedTime = 0;

/**
 * Track a page view. Call on route change or when dynamic title updates.
 * Deduplicates rapid calls within 500ms to avoid double counting.
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!isGAEnabled()) return;

  const currentTitle = title || document.title;
  const now = Date.now();

  if (lastTrackedPath === path && lastTrackedTitle === currentTitle && now - lastTrackedTime < 500) {
    return;
  }

  lastTrackedPath = path;
  lastTrackedTitle = currentTitle;
  lastTrackedTime = now;

  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: currentTitle,
  });

  if (import.meta.env.DEV) {
    console.info(`[Analytics] Pageview: ${path} ("${currentTitle}")`);
  }
};

/**
 * Track a custom GA4 event.
 * @param category Event category (e.g. 'Lead', 'Ecommerce', 'Engagement')
 * @param action   Event action   (e.g. 'Submit Form', 'Click Button')
 * @param label    Optional label (e.g. 'Crop Advisory')
 * @param value    Optional numeric value
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
): void => {
  if (!isGAEnabled()) return;

  ReactGA.event({
    category,
    action,
    label,
    value,
  });

  if (import.meta.env.DEV) {
    console.info(`[Analytics] Event: [${category}] ${action} ${label ? `(${label})` : ''}`);
  }
};

// ── Common Pre-built Event Trackers ──

/**
 * Track contact form inquiry submissions
 */
export const trackContactSubmit = (service?: string): void => {
  trackEvent('Lead', 'Contact Form Submission', service || 'General Inquiry');
};

/**
 * Track product added to cart
 */
export const trackAddToCart = (productName: string, price?: number): void => {
  trackEvent('Ecommerce', 'Add to Cart', productName, price);
};

/**
 * Track clicks on social media links
 */
export const trackSocialClick = (platform: string): void => {
  trackEvent('Engagement', 'Click Social Link', platform);
};

/**
 * Track mobile app download button clicks
 */
export const trackAppDownload = (platform: 'iOS' | 'Android'): void => {
  trackEvent('Conversion', 'Click App Download', platform);
};

/**
 * Track search queries across marketplace / plants / institutions
 */
export const trackSearch = (query: string, moduleName: string): void => {
  if (!query || query.trim().length === 0) return;
  trackEvent('Search', moduleName, query.trim());
};
