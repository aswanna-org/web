import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, X, ArrowUpRight, UserPlus } from 'lucide-react';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, openRegisterModal, login } = useAuth();
  const { i18n } = useTranslation();
  const isSi = i18n.language === 'si';

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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

    const identifier = loginMethod === 'email' ? email.trim() : phone.trim();
    if (!identifier) {
      setError(
        loginMethod === 'email'
          ? (isSi ? 'කරුණාකර ඊමේල් ලිපිනය ඇතුළත් කරන්න.' : 'Please enter your email address.')
          : (isSi ? 'කරුණාකර දුරකථන අංකය ඇතුළත් කරන්න.' : 'Please enter your phone number.')
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          email: loginMethod === 'email' ? email.trim() : undefined,
          phone: loginMethod === 'phone' ? phone.trim() : undefined,
          password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (isSi ? 'ඇතුළත් කළ තොරතුරු වැරදියි. කරුණාකර නැවත උත්සාහ කරන්න.' : 'Invalid credentials. Please try again.'));
      }

      login(data.user, data.token);
      closeLoginModal();
      setEmail('');
      setPhone('');
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
      setError(err.message || (isSi ? 'ඇතුළත් කළ තොරතුරු වැරදියි. කරුණාකර නැවත උත්සාහ කරන්න.' : 'Invalid credentials. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeLoginModal}
      />

      {/* Modal Dialog Card (Plain & Clean Payoneer Style) */}
      <div className="relative w-full max-w-[440px] bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl p-7 sm:p-9 border border-gray-100/80 z-10 animate-scaleUp">
        {/* Top Bar: Aswanna Brand Logo & Language Switcher */}
        <div className="flex items-center justify-between mb-8 sm:mb-9">
          <div className="flex items-center gap-2.5">
            <img 
              src="/images/aswanna_logo.png" 
              alt="Aswanna Logo" 
              className="h-10 sm:h-11 w-auto object-contain" 
            />
            <span className="text-xl font-bold tracking-tight text-[#2d4023]">
              Aswanna
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switcher */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-full text-xs font-medium">
              <button
                type="button"
                onClick={() => i18n.changeLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  !isSi
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => i18n.changeLanguage('si')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  isSi
                    ? 'bg-[#4d5938] text-white shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                සිංහල
              </button>
            </div>

            <button
              onClick={closeLoginModal}
              aria-label="Close login popup"
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Clean Large Heading */}
        <div className="mb-7 text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {isSi ? 'ඇතුල් වන්න' : 'Sign In'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {isSi ? 'ඔබගේ අස්වැන්න ගිණුමට පිවිසෙන්න' : 'Sign in to access your Aswanna account'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subtle Segmented Switcher for Email vs Phone */}
          <div className="flex bg-gray-100 p-1 rounded-full text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('email');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-full text-center transition-all cursor-pointer ${
                loginMethod === 'email'
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {isSi ? 'ඊමේල්' : 'Email'}
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('phone');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-full text-center transition-all cursor-pointer ${
                loginMethod === 'phone'
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {isSi ? 'දුරකථන' : 'Phone'}
            </button>
          </div>

          {/* Identifier Input */}
          {loginMethod === 'email' ? (
            <div>
              <input
                type="email"
                required={loginMethod === 'email'}
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isSi ? 'ඊමේල් ලිපිනය හෝ පරිශීලක නාමය' : 'Email or Username'}
                className="w-full px-5 py-3.5 rounded-full border border-gray-200 focus:border-[#4d5938] focus:outline-none focus:ring-1 focus:ring-[#4d5938]/30 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all"
              />
            </div>
          ) : (
            <div>
              <input
                type="tel"
                required={loginMethod === 'phone'}
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isSi ? '07X XXXXXXX / දුරකථන අංකය' : '07X XXXXXXX / Phone Number'}
                className="w-full px-5 py-3.5 rounded-full border border-gray-200 focus:border-[#4d5938] focus:outline-none focus:ring-1 focus:ring-[#4d5938]/30 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all"
              />
            </div>
          )}

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSi ? 'මුරපදය' : 'Password'}
              className="w-full pl-5 pr-12 py-3.5 rounded-full border border-gray-200 focus:border-[#4d5938] focus:outline-none focus:ring-1 focus:ring-[#4d5938]/30 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Forgot Password Link & Remember Me Switcher */}
          <div className="flex items-center justify-between pt-1 px-1 text-xs">
            <span className="text-[#4d5938] hover:text-[#384328] hover:underline cursor-pointer font-medium">
              {isSi ? 'මුරපදය අමතකද?' : 'Forgot password?'}
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-gray-600 select-none group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  rememberMe ? 'bg-[#4d5938]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    rememberMe ? 'translate-x-[19px]' : 'translate-x-[3px]'
                  }`}
                />
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-800 transition-colors">
                {isSi ? 'මතක තබාගන්න' : 'Remember me'}
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-600 font-medium animate-fadeIn flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button (Aswanna Signature Olive-Green Pill) */}
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full mt-3 py-3 px-6 rounded-full bg-[#4d5938] hover:bg-[#404b2e] border border-white/40 text-white font-bold text-sm shadow-[0_6px_20px_rgba(77,89,56,0.32)] hover:shadow-[0_8px_25px_rgba(77,89,56,0.42)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="font-semibold text-sm tracking-wide text-white">
              {isLoading
                ? (isSi ? 'ඇතුල් වෙමින් පවතී...' : 'Signing in...')
                : (isSi ? 'ඇතුල් වන්න' : 'Sign In')}
            </span>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white shrink-0 group-hover:rotate-45 transition-transform duration-300 shadow-2xs">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowUpRight size={17} className="stroke-[2.5]" />
              )}
            </div>
          </button>

          {/* Register Button */}
          <button
            type="button"
            id="login-modal-register-btn"
            onClick={openRegisterModal}
            className="w-full py-3 rounded-full border border-[#4d5938] text-[#4d5938] hover:bg-[#4d5938]/5 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <UserPlus size={16} />
            <span>{isSi ? 'ලියාපදිංචි වන්න' : 'Register'}</span>
          </button>
        </form>

        {/* Footer info (Payoneer style) */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>© 2026 Aswanna Inc.</span>
          <div className="flex items-center gap-3">
            <Link to="/pages/contact" onClick={closeLoginModal} className="hover:text-gray-600 transition-colors">
              {isSi ? 'අප අමතන්න' : 'Contact Us'}
            </Link>
            <span>{isSi ? 'සිංහල' : 'English'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
