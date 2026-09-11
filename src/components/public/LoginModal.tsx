import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, X, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, openRegisterModal, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isLoginModalOpen) {
      setError('');
    }
  }, [isLoginModalOpen]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLoginModalOpen) {
        closeLoginModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginModalOpen, closeLoginModal]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password. Please try again.');
      }

      login(data.user, data.token);
      closeLoginModal();
      setEmail('');
      setPassword('');

      // If the logged-in user is an ADMIN, always direct them to the admin dashboard
      if (data.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        // All other users (non-admin) have NO access to the dashboard
        if (location.pathname.startsWith('/admin')) {
          navigate('/');
        }
        // If logged in from a public page, stay on the public page
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={closeLoginModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 animate-scaleUp">
        {/* Top Header Background Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 pt-8 pb-7 px-8 text-white relative">
          {/* Close button */}
          <button
            onClick={closeLoginModal}
            aria-label="Close login popup"
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all focus:outline-none"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-sm">
              <img src="/images/aswanna_logo.png" alt="Aswanna Logo" className="h-8 object-contain brightness-0 invert" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Aswanna Portal</h2>
              <p className="text-xs text-emerald-100/80 font-medium">Agricultural Management System</p>
            </div>
          </div>
          <p className="text-xs text-white/70 mt-1">Sign in with your credentials to access your administrative dashboard.</p>
        </div>

        {/* Form Body */}
        <div className="p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aswanna.lk"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/80 hover:bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm text-gray-800 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-gray-50/80 hover:bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm text-gray-800 transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                Remember this device
              </label>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                256-bit SSL
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-600 font-medium animate-fadeIn flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register Link */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            Don't have an account? (ගිණුමක් නැද්ද?){' '}
            <button
              type="button"
              onClick={openRegisterModal}
              className="text-emerald-700 font-bold hover:underline ml-1 cursor-pointer"
            >
              Register here (ලියාපදිංචි වන්න)
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Official Aswanna Agri Platform</span>
            <span>v2.4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
