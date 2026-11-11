import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ChevronDown,
  ExternalLink,
  LogOut,
  ShieldCheck,
  ChevronRight,
  User as UserIcon,
  Trees,
  Sparkles,
  MapPin,
  Briefcase
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const USER_ROUTES: Record<string, { title: string; subtitle: string; icon: any }> = {
  '/dashboard': { title: 'User Dashboard', subtitle: 'Overview & Statistics', icon: UserIcon },
  '/dashboard/nurseries': { title: 'My Plant Nurseries', subtitle: 'Manage your added nurseries', icon: Trees },
  '/dashboard/mushrooms': { title: 'My Mushroom Businesses', subtitle: 'Manage mushroom suppliers & stocks', icon: Sparkles },
  '/dashboard/lands': { title: 'My Agri Lands', subtitle: 'Manage agricultural land listings', icon: MapPin },
  '/dashboard/jobs': { title: 'My Job Postings', subtitle: 'Manage vacancies & career posts', icon: Briefcase },
};

export const UserTopbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPath = location.pathname.replace(/\/$/, '') || '/dashboard';
  const routeMeta = USER_ROUTES[currentPath] || {
    title: 'User Portal',
    subtitle: 'Manage your listings',
    icon: UserIcon
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/');
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md shadow-xs sm:px-6">
      {/* Left: Mobile Toggle & Route Info */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Menu"
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col justify-center min-w-0">
          <div className="hidden xs:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <span>Dashboard</span>
            <ChevronRight size={10} className="text-slate-300 shrink-0" />
            <span className="text-emerald-600 font-medium">{routeMeta.subtitle}</span>
          </div>
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
            {routeMeta.title}
          </h1>
        </div>
      </div>

      {/* Right: Actions & User Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        {/* Live Website Button */}
        <Link
          to="/"
          title="Go to public website"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all duration-150 shadow-xs hover:shadow-sm"
        >
          <ExternalLink size={13} className="text-emerald-600 shrink-0" />
          <span className="hidden sm:inline">View Public Website</span>
          <span className="sm:hidden">Website</span>
        </Link>

        {user?.role === 'ADMIN' && (
          <Link
            to="/admin"
            title="Open Admin Control Panel"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all shadow-xs"
          >
            <ShieldCheck size={13} className="text-amber-600" />
            <span>Admin Panel</span>
          </Link>
        )}

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
            aria-expanded={isProfileOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-xs shrink-0">
              {userInitial}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                {user?.name || 'Member'}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold tracking-wide uppercase">
                {user?.role || 'User'}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                isProfileOpen ? 'rotate-180 text-emerald-600' : ''
              }`}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-900/10 border border-slate-100 z-50">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-xs shrink-0">
                    {userInitial}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-slate-500 truncate" title={user?.email || user?.phone || ''}>
                      {user?.email || user?.phone || 'Aswanna Member'}
                    </p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    {user?.role || 'USER'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">Logged In</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  to="/dashboard/nurseries"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg transition-colors"
                >
                  <Trees size={14} className="text-slate-400" />
                  <span>My Nurseries</span>
                </Link>
                <Link
                  to="/dashboard/mushrooms"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg transition-colors"
                >
                  <Sparkles size={14} className="text-slate-400" />
                  <span>My Mushrooms</span>
                </Link>
                <Link
                  to="/dashboard/lands"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg transition-colors"
                >
                  <MapPin size={14} className="text-slate-400" />
                  <span>My Lands</span>
                </Link>
                <Link
                  to="/dashboard/jobs"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg transition-colors"
                >
                  <Briefcase size={14} className="text-slate-400" />
                  <span>My Jobs</span>
                </Link>

                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <ShieldCheck size={14} className="text-amber-600" />
                    <span>Admin Control Panel</span>
                  </Link>
                )}
              </div>

              <div className="border-t border-slate-100 my-1 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={14} className="shrink-0" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default UserTopbar;

