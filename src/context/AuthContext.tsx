import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    const lastActive = localStorage.getItem('admin_last_active');

    if (storedToken && storedUser) {
      // Check if session expired due to inactivity (1 hour = 3600000 ms)
      const now = Date.now();
      if (lastActive && now - parseInt(lastActive) > 3600000) {
        // Session expired
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_last_active');
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        localStorage.setItem('admin_last_active', now.toString());
      }
    }
    setIsLoading(false);
  }, []);

  // Inactivity monitor
  useEffect(() => {
    if (!token) return;

    let inactivityTimer: number;

    const resetInactivityTimer = () => {
      localStorage.setItem('admin_last_active', Date.now().toString());
    };

    const checkInactivity = () => {
      const lastActive = localStorage.getItem('admin_last_active');
      if (lastActive && Date.now() - parseInt(lastActive) > 3600000) {
        logout();
        alert('Your session has expired due to 1 hour of inactivity. Please log in again.');
        window.location.href = '/admin/login';
      }
    };

    // Events that count as "activity"
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Check inactivity every minute
    inactivityTimer = setInterval(checkInactivity, 60000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      clearInterval(inactivityTimer);
    };
  }, [token]);

  const login = (userData: User, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    localStorage.setItem('admin_last_active', Date.now().toString());
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_last_active');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
