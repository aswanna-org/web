// src/services/apiInterceptor.ts
type LoadingCallback = (isLoading: boolean) => void;

class ApiInterceptorService {
  private activeRequests = 0;
  private listeners: Set<LoadingCallback> = new Set();
  private isInitialized = false;
  private minDisplayTimer: any = null;
  private showTimestamp = 0;
  private isShowing = false;

  /**
   * Subscribe to loading state changes
   */
  public subscribe(callback: LoadingCallback) {
    this.listeners.add(callback);
    callback(this.isShowing);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(isLoading: boolean) {
    this.isShowing = isLoading;
    this.listeners.forEach((cb) => {
      try {
        cb(isLoading);
      } catch (err) {
        console.error('Loading listener error:', err);
      }
    });
  }

  public requestStarted() {
    this.activeRequests++;

    if (this.minDisplayTimer) {
      clearTimeout(this.minDisplayTimer);
      this.minDisplayTimer = null;
    }

    if (!this.isShowing) {
      this.showTimestamp = Date.now();
      this.notify(true);
    }
  }

  public requestFinished() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);

    if (this.activeRequests === 0) {
      // Ensure the loader remains visible for at least 450ms so user experiences smooth animation
      const elapsed = Date.now() - this.showTimestamp;
      const minDuration = 450;
      const remainingTime = Math.max(0, minDuration - elapsed);

      if (this.minDisplayTimer) clearTimeout(this.minDisplayTimer);
      this.minDisplayTimer = setTimeout(() => {
        if (this.activeRequests === 0) {
          this.notify(false);
        }
      }, remainingTime);
    }
  }

  /**
   * Initialize Global Fetch Interceptor
   */
  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const [resource, config] = args;
      const url =
        typeof resource === 'string'
          ? resource
          : resource instanceof Request
          ? resource.url
          : '';

      // Intercept API calls to backend, ignoring static assets or silent calls
      const isApiUrl =
        url.includes('/api') ||
        url.includes('localhost:5000') ||
        url.includes(':5000');

      const isSilent =
        config?.headers &&
        ((config.headers as Record<string, string>)['x-silent'] ||
          (config.headers as Record<string, string>)['X-Silent']);

      const shouldIntercept = isApiUrl && !isSilent;

      if (shouldIntercept) {
        this.requestStarted();
      }

      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        if (shouldIntercept) {
          this.requestFinished();
        }
      }
    };
  }
}

export const apiInterceptor = new ApiInterceptorService();
