import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiInterceptor } from '../services/apiInterceptor';
import AgroLoader from '../components/common/AgroLoader';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
});

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize fetch interceptor
    apiInterceptor.init();

    // Subscribe to HTTP request lifecycle
    const unsubscribe = apiInterceptor.subscribe((loading) => {
      setIsLoading(loading);
    });

    return unsubscribe;
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}

      {/* Global Glassmorphic AgroLoader Overlay driven automatically by HTTP Interceptor */}
      <div 
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white/50 backdrop-blur-xl transition-opacity duration-300 ${
          isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-live="polite"
        aria-busy={isLoading}
      >
        {/* Subtle Ambient Emerald Glass Reflection in Center */}
        <div className="absolute w-[500px] h-[350px] rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        {/* Pure Icons & Magnifier Loading Animation */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <AgroLoader />
        </div>
      </div>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
export default LoadingProvider;
