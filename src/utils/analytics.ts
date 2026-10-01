/**
 * Google Analytics 4 (GA4) utility module for Aswanna
 *
 * Usage:
 *  - initGA()           → call once at app startup
 *  - trackPageView()    → call on every route change (handled by useGAPageTracking hook)
 *  - trackEvent(...)    → call for custom events anywhere in the app
 *
 * To activate: set VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX in your .env file.
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

/**
 * Initialise Google Analytics. Call once at app root.
 */
export const initGA = (): void => {
  if (!isGAEnabled()) {
    if (import.meta.env.DEV) {
      console.info('[Analytics] GA disabled – set VITE_GA_MEASUREMENT_ID in .env to enable.');
    }
    return;
  }

  ReactGA.initialize(GA_MEASUREMENT_ID, {
    gaOptions: {
      send_page_view: false, // We send page views manually on route changes
    },
  });

  if (import.meta.env.DEV) {
    console.info(`[Analytics] GA initialised with ID: ${GA_MEASUREMENT_ID}`);
  }
};

/**
 * Track a page view. Call on every route change.
 * @param path  The current route path (e.g. "/news")
 * @param title Optional page title
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!isGAEnabled()) return;

  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: title || document.title,
  });
};

/**
 * Track a custom GA4 event.
 * @param category Event category (e.g. 'User', 'Engagement')
 * @param action   Event action   (e.g. 'Login', 'Share')
 * @param label    Optional label (e.g. 'Blog Post Title')
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
};
