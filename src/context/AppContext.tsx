import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of our context state
interface AppState {
  isCartOpen: boolean;
  toggleCart: () => void;
  // Placeholder for user authentication state (useful for your Admin section later)
  user: { name: string; role: string } | null;
  login: (name: string, role: string) => void;
  logout: () => void;
}

// Create the context with a default undefined value
const AppContext = createContext<AppState | undefined>(undefined);

// Create a Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const login = (name: string, role: string) => setUser({ name, role });
  const logout = () => setUser(null);

  const value = {
    isCartOpen,
    toggleCart,
    user,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the AppContext
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
