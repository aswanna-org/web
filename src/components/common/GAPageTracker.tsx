/**
 * useGAPageTracking hook
 *
 * Automatically fires a GA4 page_view event on every URL path change.
 * Waits 150ms to allow page-level <SEO /> components to set document.title.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, initGA } from '../../utils/analytics';

let gaInitialised = false;

export function useGAPageTracking(): void {
  const location = useLocation();

  // Initialise GA once on mount
  useEffect(() => {
    if (!gaInitialised) {
      initGA();
      gaInitialised = true;
    }
  }, []);

  // Track every route change — delay allows dynamic SEO titles (e.g. product names) to load first
  useEffect(() => {
    const timer = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);
}

/**
 * Drop-in component version of useGAPageTracking.
 */
export default function GAPageTracker() {
  useGAPageTracking();
  return null;
}
