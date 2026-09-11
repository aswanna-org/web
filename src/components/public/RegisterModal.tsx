import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, X, Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';

export default function RegisterModal() {
  const { isRegisterModalOpen, closeRegisterModal, openLoginModal, login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isRegisterModalOpen) {
      setError('');
    }
  }, [isRegisterModalOpen]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRegisterModalOpen) {
        closeRegisterModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRegisterModalOpen, closeRegisterModal]);

  if (!isRegisterModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('මුරපද නොගැලපේ (Passwords do not match). Please check and try again.');
      return;
    }

    if (password.length < 6) {
      setError('මුරපදයට අවම වශයෙන් අකුරු/ඉලක්කම් 6ක් අඩංගු විය යුතුය (Password must be at least 6 characters).');
      return;
    }

    if (!agreeTerms) {
      setError('කරුණාකර සේවා කොන්දේසිවලට එකඟ වන්න (Please agree to the Terms of Service).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      if (data.token && data.user) {
        login(data.user, data.token);
      }

      closeRegisterModal();
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Regular registered users do not have access to admin dashboard. If currently on an admin route, send to home page.
      if (location.pathname.startsWith('/admin')) {
        navigate('/');
      }
      // Otherwise stay on current public page to proceed seamlessly
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={closeRegisterModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 animate-scaleUp my-8">
        {/* Top Header Background Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 pt-7 pb-6 px-8 text-white relative">
          {/* Close button */}
          <button
            onClick={closeRegisterModal}
            aria-label="Close register popup"
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all focus:outline-none cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-sm shrink-0">
              <img src="/images/aswanna_logo.png" alt="Aswanna Logo" className="h-7 object-contain brightness-0 invert" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Create Account</h2>
              <p className="text-xs text-emerald-100/80 font-medium">නව ගිණුමක් සාදා ලියාපදිංචි වන්න</p>
            </div>
          </div>
          <p className="text-xs text-white/70">Join Aswanna Agri Platform to enroll in courses, access marketplace & manage services.</p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 ml-1">
                Full Name (සම්පූර්ණ නම) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ඔබගේ සම්පූර්ණ නම (e.g. Kasun Perera)"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-xs sm:text-sm text-gray-800 transition-all placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 ml-1">
                Email Address (විද්‍යුත් තැපෑල) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-xs sm:text-sm text-gray-800 transition-all placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 ml-1">
                Password (මුරපදය) *
              </label>
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
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-xs sm:text-sm text-gray-800 transition-all placeholder:text-gray-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 ml-1">
                Confirm Password (මුරපදය නැවත ඇතුළත් කරන්න) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <ShieldCheck size={16} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-xs sm:text-sm text-gray-800 transition-all placeholder:text-gray-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms Agree */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-600 select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 mt-0.5"
                />
                <span>
                  I agree to the <a href="#" className="text-emerald-700 font-semibold hover:underline">Terms of Service</a> & <a href="#" className="text-emerald-700 font-semibold hover:underline">Privacy Policy</a>
                </span>
              </label>
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
              className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register Account (ලියාපදිංචි වන්න)</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login Link */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            දැනටමත් ගිණුමක් තිබේද?{' '}
            <button
              type="button"
              onClick={openLoginModal}
              className="text-emerald-700 font-bold hover:underline ml-1 cursor-pointer"
            >
              Log in here (පිවිසෙන්න)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
