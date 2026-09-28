import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Automatically scrolls the window (and any nested main scroll containers)
 * to the top whenever the route / pathname changes.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Disable automatic browser scroll restoration to prevent landing at previous scroll coordinates
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // If URL has a hash target (e.g. #section-id), scroll to that specific element
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Scroll main window to top immediately
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Reset scroll for any admin panel or scrollable container
    const scrollContainers = document.querySelectorAll('main, .overflow-y-auto');
    scrollContainers.forEach((container) => {
      container.scrollTop = 0;
    });

    // Run again on the next animation frame in case elements rendered asynchronously
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, hash]);

  return null;
}
