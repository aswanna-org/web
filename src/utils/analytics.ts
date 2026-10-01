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
    return;
  }

  ReactGA.initialize(GA_MEASUREMENT_ID, {
    gaOptions: {
      send_page_view: false,
    },
  });

  isInitialized = true;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getOrCreateSessionId(): string {
  try {
    let sid = sessionStorage.getItem('aswanna_sid');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      sessionStorage.setItem('aswanna_sid', sid);
    }
    return sid;
  } catch {
    return 'sid_anon_' + Date.now();
  }
}

interface QueuedPageView {
  path: string;
  title: string;
  sessionId: string;
  referrer: string | null;
  device: string;
  browser: string;
  timestamp: number;
}

// Client-side batch queue to minimize HTTP requests and DB load
const eventQueue: QueuedPageView[] = [];
let batchTimer: any = null;
const BATCH_INTERVAL_MS = 4000; // Flush micro-batch every 4s
const MAX_BATCH_SIZE = 8;       // Flush immediately when reaching 8 events

let lastTrackedPath = '';
let lastTrackedTime = 0;

/**
 * Flush all queued page views to the server in a single batch request
 */
export const flushEventQueue = (): void => {
  if (batchTimer) {
    clearTimeout(batchTimer);
    batchTimer = null;
  }

  if (eventQueue.length === 0) return;

  const events = eventQueue.splice(0, eventQueue.length);
  const payload = JSON.stringify({ events });
  const endpoint = `${API_BASE_URL}/analytics/track-batch`;

  try {
    // 1. Try modern navigator.sendBeacon (ideal for unload, non-blocking)
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) return;
    }
  } catch {}

  try {
    // 2. Fallback to fetch with keepalive: true
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
      mode: 'cors'
    }).catch(() => {});
  } catch {}
};

// Guarantee queued events are sent when user switches tab or leaves the page
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEventQueue();
    }
  });
  window.addEventListener('pagehide', () => {
    flushEventQueue();
  });
}

export const trackInHousePageView = (path: string, title?: string): void => {
  if (path.startsWith('/admin')) return;

  const currentTitle = title || document.title;
  const sessionId = getOrCreateSessionId();
  const referrer = document.referrer || null;
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
  const isTablet = /iPad|Tablet/i.test(navigator.userAgent);
  const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

  let browser = 'Other';
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  // Check if an event for this path is already waiting in the queue
  const existing = eventQueue.find(item => item.path === path);
  if (existing) {
    // If the new title is richer / more descriptive than previous placeholder, update it
    if (currentTitle && currentTitle.length > existing.title.length) {
      existing.title = currentTitle;
    }
    return;
  }

  eventQueue.push({
    path,
    title: currentTitle,
    sessionId,
    referrer,
    device,
    browser,
    timestamp: Date.now()
  });

  if (eventQueue.length >= MAX_BATCH_SIZE) {
    flushEventQueue();
  } else if (!batchTimer) {
    batchTimer = setTimeout(() => {
      batchTimer = null;
      flushEventQueue();
    }, BATCH_INTERVAL_MS);
  }
};

/**
 * Track a page view. Call on route change or when dynamic title updates.
 * Deduplicates rapid calls within 8s for the same path to prevent request spam.
 */
export const trackPageView = (path: string, title?: string): void => {
  const currentTitle = title || document.title;
  const now = Date.now();

  // Deduplicate: same path within 8 seconds is part of the same route visit
  if (lastTrackedPath === path && now - lastTrackedTime < 8000) {
    // If title has updated to a richer dynamic title, update the queued item
    const pending = eventQueue.find(item => item.path === path);
    if (pending && currentTitle && currentTitle.length > pending.title.length) {
      pending.title = currentTitle;
    }
    return;
  }

  lastTrackedPath = path;
  lastTrackedTime = now;

  // 1. In-House Micro-Batched Database Analytics
  trackInHousePageView(path, currentTitle);

  // 2. Google Analytics (if enabled)
  if (isGAEnabled()) {
    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: currentTitle,
    });
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
