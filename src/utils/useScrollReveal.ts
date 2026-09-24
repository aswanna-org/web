import { useEffect } from 'react';

/**
 * Lightweight, zero-dependency scroll reveal hook using native IntersectionObserver.
 * Triggers subtle CSS entrance animations when sections/cards scroll into view.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(
        '.reveal-fade-up, .reveal-fade-down, .reveal-fade-left, .reveal-fade-right, .reveal-fade-in, .reveal-scale'
      ).forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Unobserve once revealed for optimal performance and preventing awkward re-animations
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1,
      }
    );

    const observeElements = () => {
      const elements = document.querySelectorAll(
        '.reveal-fade-up:not(.is-revealed), .reveal-fade-down:not(.is-revealed), .reveal-fade-left:not(.is-revealed), .reveal-fade-right:not(.is-revealed), .reveal-fade-in:not(.is-revealed), .reveal-scale:not(.is-revealed)'
      );
      elements.forEach((el) => observer.observe(el));
    };

    // Initial observation
    observeElements();

    // Re-observe after dynamic async data may have rendered cards
    const timeoutId1 = setTimeout(observeElements, 250);
    const timeoutId2 = setTimeout(observeElements, 800);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      observer.disconnect();
    };
  }, []);
}

export default useScrollReveal;
