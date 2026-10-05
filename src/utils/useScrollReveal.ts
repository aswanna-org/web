import { useEffect } from 'react';

/**
 * Lightweight, zero-dependency scroll reveal hook using native IntersectionObserver.
 * Triggers subtle CSS entrance animations when sections/cards scroll into view.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const revealSelectors =
      '.reveal-fade-up, .reveal-fade-down, .reveal-fade-left, .reveal-fade-right, .reveal-fade-in, .reveal-scale';

    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(revealSelectors).forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Unobserve once revealed for optimal performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05,
      }
    );

    const observeElements = () => {
      const elements = document.querySelectorAll(
        '.reveal-fade-up:not(.is-revealed), .reveal-fade-down:not(.is-revealed), .reveal-fade-left:not(.is-revealed), .reveal-fade-right:not(.is-revealed), .reveal-fade-in:not(.is-revealed), .reveal-scale:not(.is-revealed)'
      );
      elements.forEach((el) => {
        // If element is already visible in viewport, reveal immediately
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-revealed');
        } else {
          observer.observe(el);
        }
      });
    };

    // Initial observation
    observeElements();

    // Re-observe after dynamic async data may have rendered cards
    const timeoutId1 = setTimeout(observeElements, 100);
    const timeoutId2 = setTimeout(observeElements, 300);
    const timeoutId3 = setTimeout(observeElements, 800);

    // MutationObserver: dynamically observe any new elements rendered by React state updates / async fetches
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(observeElements, 30);
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      if (debounceTimer) clearTimeout(debounceTimer);
      mutationObserver?.disconnect();
      observer.disconnect();
    };
  }, []);
}

export default useScrollReveal;
