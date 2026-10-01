/**
 * useGAPageTracking hook
 *
 * Automatically fires a GA4 page_view event every time the URL path changes.
 * Drop <GAPageTracker /> inside your BrowserRouter (after AuthProvider) to activate.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, initGA } from '../../utils/analytics';

let gaInitialised = false;

export function useGAPageTracking(): void {
  const location = useLocation();

  // Initialise GA once
  useEffect(() => {
    if (!gaInitialised) {
      initGA();
      gaInitialised = true;
    }
  }, []);

  // Track every route change
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);
}

/**
 * Drop-in component version of useGAPageTracking.
 * Renders nothing – just activates the hook.
 */
export default function GAPageTracker() {
  useGAPageTracking();
  return null;
}
