import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, X, ArrowUpRight, LogIn } from 'lucide-react';

export default function RegisterModal() {
  const { isRegisterModalOpen, closeRegisterModal, openLoginModal, login } = useAuth();
  const { i18n } = useTranslation();
  const isSi = i18n.language === 'si';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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

    if (!firstName.trim()) {
      setError(isSi ? 'කරුණාකර මුල් නම ඇතුළත් කරන්න.' : 'Please enter your first name.');
      return;
    }

    if (!lastName.trim()) {
      setError(isSi ? 'කරුණාකර අවසාන නම ඇතුළත් කරන්න.' : 'Please enter your last name.');
      return;
    }

    if (registerMethod === 'email' && !email.trim()) {
      setError(isSi ? 'කරුණාකර වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.' : 'Please enter a valid email address.');
      return;
    }

    if (registerMethod === 'phone' && !phone.trim()) {
      setError(isSi ? 'කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න.' : 'Please enter a valid phone number.');
      return;
    }

    if (password !== confirmPassword) {
      setError(isSi ? 'මුරපද එකිනෙකට නොගැලපේ. කරුණාකර නැවත පරීක්ෂා කරන්න.' : 'Passwords do not match. Please check and try again.');
      return;
    }

    if (password.length < 6) {
      setError(isSi ? 'මුරපදය අවම වශයෙන් අකුරු 6කින් සමන්විත විය යුතුය.' : 'Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setError(isSi ? 'කරුණාකර සේවා කොන්දේසිවලට එකඟ වන්න.' : 'Please agree to the Terms of Service.');
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const payload: any = {
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
        ...(registerMethod === 'email' ? { email: email.trim() } : { phone: phone.trim() })
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (isSi ? 'ලියාපදිංචි වීම අසාර්ථක විය. නැවත උත්සාහ කරන්න.' : 'Registration failed. Please try again.'));
      }

      if (data.token && data.user) {
        login(data.user, data.token);
      }

      closeRegisterModal();
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');

      // Regular registered users do not have access to admin dashboard. If currently on an admin route, send to home page.
      if (location.pathname.startsWith('/admin')) {
        navigate('/');
      }
      // Otherwise stay on current public page to proceed seamlessly
    } catch (err: any) {
      setError(err.message || (isSi ? 'ලියාපදිංචි වීම අසාර්ථක විය. නැවත උත්සාහ කරන්න.' : 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeRegisterModal}
      />

      {/* Modal Dialog Card (Plain & Clean Payoneer Style) */}
      <div className="relative w-full max-w-[440px] bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl p-7 sm:p-9 border border-gray-100/80 z-10 animate-scaleUp my-6 max-h-[95vh] overflow-y-auto">
        {/* Top Bar: Aswanna Brand Logo & Language Switcher */}
        <div className="flex items-center justify-between mb-7 sm:mb-8">
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
              onClick={closeRegisterModal}
              aria-label="Close register popup"
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Clean Large Heading */}
        <div className="mb-6 text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {isSi ? 'ලියාපදිංචි වන්න' : 'Sign Up'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {isSi ? 'ආරම්භ කිරීමට ඔබගේ අස්වැන්න ගිණුම සාදන්න' : 'Create your Aswanna account to get started'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <input
                type="text"
                required
                autoFocus
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={isSi ? 'මුල් නම *' : 'First Name *'}
                className="w-full px-4 sm:px-5 py-3 rounded-full border border-gray-200 focus:border-[#4d5938] focus:outline-none focus:ring-1 focus:ring-[#4d5938]/30 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all"
              />
            </div>
            <div>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={isSi ? 'වාසගම *' : 'Last Name *'}
                className="w-full px-4 sm:px-5 py-3 rounded-full border border-gray-200 focus:border-[#4d5938] focus:outline-none focus:ring-1 focus:ring-[#4d5938]/30 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all"
              />
            </div>
          </div>

          {/* Subtle Segmented Switcher for Email vs Phone */}
          <div className="flex bg-gray-100 p-1 rounded-full text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setRegisterMethod('email');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-full text-center transition-all cursor-pointer ${
                registerMethod === 'email'
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {isSi ? 'ඊමේල්' : 'Email'}
            </button>
            <button
              type="button"
              onClick={() => {
                setRegisterMethod('phone');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-full text-center transition-all cursor-pointer ${
                registerMethod === 'phone'
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {isSi ? 'දුරකථන' : 'Phone'}
            </button>
          </div>

          {/* Email Field or Phone Field */}
          {registerMethod === 'email' ? (
            <div>
              <input
                type="email"
                required={registerMethod === 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isSi ? 'ඊමේල් ලිපිනය *' : 'Email Address *'}
                className="w-full px-5 py-3 rounded-full border border-gray-200 focus:border-[#4d5938] focus:outline-none focus:ring-1 focus:ring-[#4d5938]/30 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all"
              />
            </div>
          ) : (
            <div>
              <input
                type="tel"
                required={registerMethod === 'phone'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isSi ? '07X XXXXXXX / දුරකථන අංකය *' : '07X XXXXXXX / Phone Number *'}
                className="w-full px-5 py-3 rounded-full border border-gray-200 focus:border-[#4d5938] focus:outline-none focus:ring-1 focus:ring-[#4d5938]/30 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all"
              />
            </div>
          )}

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSi ? 'මුරපදය (අවම අකුරු 6ක්) *' : 'Password (min 6 characters) *'}
              className="w-full pl-5 pr-12 py-3 rounded-full border border-gray-200 focus:border-[#4d5938] focus:outline-none focus:ring-1 focus:ring-[#4d5938]/30 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={isSi ? 'මුරපදය නැවත ඇතුළත් කරන්න *' : 'Confirm Password *'}
              className="w-full pl-5 pr-12 py-3 rounded-full border border-gray-200 focus:border-[#4d5938] focus:outline-none focus:ring-1 focus:ring-[#4d5938]/30 text-sm text-gray-900 placeholder:text-gray-400 bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Terms Agree Switcher */}
          <div className="pt-1 px-1">
            <div className="flex items-center gap-2.5 select-none">
              <button
                type="button"
                role="switch"
                aria-checked={agreeTerms}
                onClick={() => setAgreeTerms(!agreeTerms)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${
                  agreeTerms ? 'bg-[#4d5938]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    agreeTerms ? 'translate-x-[19px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
              <span className="text-xs text-gray-500 leading-tight">
                <span onClick={() => setAgreeTerms(!agreeTerms)} className="cursor-pointer hover:text-gray-800 transition-colors">
                  {isSi ? 'මම ' : 'I agree to the '}
                </span>
                <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="text-[#4d5938] hover:underline font-medium">
                  {isSi ? 'සේවා කොන්දේසි' : 'Terms of Service'}
                </a>
                {' & '}
                <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="text-[#4d5938] hover:underline font-medium">
                  {isSi ? 'රහස්‍යතා ප්‍රතිපත්තියට එකඟ වෙමි' : 'Privacy Policy'}
                </a>
              </span>
            </div>
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
                ? (isSi ? 'ගිණුම සාදමින් පවතී...' : 'Creating Account...')
                : (isSi ? 'ලියාපදිංචි වන්න' : 'Sign Up')}
            </span>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white shrink-0 group-hover:rotate-45 transition-transform duration-300 shadow-2xs">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowUpRight size={17} className="stroke-[2.5]" />
              )}
            </div>
          </button>

          {/* Sign In Button */}
          <button
            type="button"
            id="register-modal-signin-btn"
            onClick={openLoginModal}
            className="w-full py-3 rounded-full border border-[#4d5938] text-[#4d5938] hover:bg-[#4d5938]/5 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <LogIn size={16} />
            <span>{isSi ? 'ඇතුල් වන්න' : 'Sign In'}</span>
          </button>
        </form>

        {/* Footer info (Payoneer style) */}
        <div className="mt-7 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>© 2026 Aswanna Inc.</span>
          <div className="flex items-center gap-3">
            <Link to="/pages/contact" onClick={closeRegisterModal} className="hover:text-gray-600 transition-colors">
              {isSi ? 'අප අමතන්න' : 'Contact Us'}
            </Link>
            <span>{isSi ? 'සිංහල' : 'English'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
