import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
        throw new Error(data.error || 'Invalid credentials');
      }
      
      await login(data.user, data.token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8E9E4] p-4 lg:p-8 font-sans">
      <div className="w-full max-w-5xl lg:min-h-[700px] flex flex-col lg:flex-row rounded-[2.5rem] shadow-2xl bg-gradient-to-br from-[#F6F5F0] to-[#EBE9DB] relative overflow-hidden">
        
        {/* Left Column - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col relative z-10">
          
          <div className="flex-1 flex flex-col justify-center max-w-[340px] mx-auto w-full py-12 lg:py-0">
            <div className="flex justify-center mb-8">
              <img src="/images/aswanna_logo.png" alt="Aswanna Logo" className="h-14 object-contain" />
            </div>
            <h1 className="text-4xl font-semibold text-[#1a202c] mb-3 text-center">Welcome back</h1>
            <p className="text-[15px] text-gray-500 mb-10 text-center">Sign in to access your admin dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-[13px] font-medium text-gray-600 ml-4 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@aswanna.lk"
                  className="w-full px-5 py-3.5 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#FAD058]/50 transition-all text-[15px] text-gray-700 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-transparent focus:border-[#FAD058]/30"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-600 ml-4 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-5 pr-12 py-3.5 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#FAD058]/50 transition-all text-[15px] text-gray-700 shadow-[0_2px_15px_rgba(0,0,0,0.03)] tracking-widest placeholder:tracking-normal border border-transparent focus:border-[#FAD058]/30"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center ml-4 mt-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#FAD058] focus:ring-[#FAD058] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-[13px] text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#F3C546] hover:bg-[#EABA3B] disabled:opacity-70 text-gray-900 font-medium py-3.5 rounded-full transition-all duration-200 mt-4 flex items-center justify-center gap-2 text-[15px] shadow-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  'Submit'
                )}
              </button>
            </form>
            
            <div className="mt-auto pt-16 lg:pt-0 pb-4 text-xs text-gray-400 flex justify-between items-center px-2">
              <p>Secure Admin Portal</p>
              <a href="#" className="underline underline-offset-2 hover:text-gray-600">Terms & Conditions</a>
            </div>
          </div>
        </div>

        {/* Right Column - Image & Glassmorphism */}
        <div className="hidden lg:block lg:w-1/2 p-3 pl-0 relative z-10">
          <div className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-inner">
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80" 
              alt="Team working" 
              className="w-full h-full object-cover"
            />
            
            {/* Glassmorphism Floating Cards */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[280px] bg-[#FAD058] backdrop-blur-md rounded-xl p-4 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-900 text-sm font-semibold">Agro Status Review</p>
                  <p className="text-gray-800/80 text-xs mt-0.5">09:30am-10:00am</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-gray-900 mt-1" />
              </div>
            </div>

            <div className="absolute top-28 left-1/2 -translate-x-1/2 translate-x-4 w-[280px] bg-black/40 backdrop-blur-md rounded-xl p-4 shadow-xl z-[-1]">
              <div className="h-10"></div>
            </div>
            
            <div className="absolute bottom-12 left-10 right-10 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between text-white mb-4 px-2">
                <div className="text-center"><p className="text-xs opacity-70">Sun</p><p className="font-medium mt-1">22</p></div>
                <div className="text-center"><p className="text-xs opacity-70">Mon</p><p className="font-medium mt-1">23</p></div>
                <div className="text-center"><p className="text-xs opacity-70">Tue</p><p className="font-medium mt-1">24</p></div>
                <div className="text-center"><p className="text-xs opacity-70">Wed</p><p className="font-medium mt-1">25</p></div>
                <div className="text-center"><p className="text-xs opacity-70">Thu</p><p className="font-medium mt-1">26</p></div>
                <div className="text-center"><p className="text-xs opacity-70">Fri</p><p className="font-medium mt-1">27</p></div>
                <div className="text-center"><p className="text-xs opacity-70">Sat</p><p className="font-medium mt-1">28</p></div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm relative">
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#FAD058]" />
                <p className="text-gray-800 text-sm font-semibold">System Update</p>
                <p className="text-gray-400 text-xs mt-0.5">12:00pm-01:00pm</p>
                <div className="flex -space-x-2 mt-3">
                   <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">A</div>
                   <div className="w-6 h-6 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-green-700">M</div>
                   <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-700">K</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
