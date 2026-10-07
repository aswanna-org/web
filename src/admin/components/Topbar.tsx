import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  LogOut,
  Users,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RouteMeta {
  title: string;
  category: string;
}

const ROUTE_CONFIG: Record<string, RouteMeta> = {
  '/admin': { title: 'Dashboard Overview', category: 'Main' },
  '/admin/analytics': { title: 'Analytics Management', category: 'Main' },
  '/admin/categories': { title: 'Category Management', category: 'Agro & Services' },
  '/admin/items': { title: 'Item Management', category: 'Agro & Services' },
  '/admin/institutions': { title: 'Institution Management', category: 'Agro & Services' },
  '/admin/asc': { title: 'Govijana Sewa Management', category: 'Agro & Services' },
  '/admin/plants': { title: 'Plant Management', category: 'Agro & Services' },
  '/admin/agrolands': { title: 'Agro Land Management', category: 'Agro & Services' },
  '/admin/products': { title: 'Product Management', category: 'Market & Courses' },
  '/admin/orders': { title: 'Order Management', category: 'Market & Courses' },
  '/admin/courses': { title: 'Course Management', category: 'Market & Courses' },
  '/admin/short-courses': { title: 'Short Course Management', category: 'Market & Courses' },
  '/admin/shortcourses': { title: 'Short Course Management', category: 'Market & Courses' },
  '/admin/news': { title: 'News Management', category: 'Content & Media' },
  '/admin/blogs': { title: 'Blog Management', category: 'Content & Media' },
  '/admin/careers': { title: 'Career Management', category: 'Content & Media' },
  '/admin/gallery': { title: 'Gallery Management', category: 'Content & Media' },
  '/admin/users': { title: 'User Management', category: 'Management' },
  '/admin/contacts': { title: 'Contact Management', category: 'Management' },
};

const Topbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine current route metadata
  const currentPath = location.pathname.replace(/\/$/, '') || '/admin';
  const routeInfo = ROUTE_CONFIG[currentPath] || {
    title: (() => {
      const parts = currentPath.split('/').filter(Boolean);
      const last = parts[parts.length - 1] || 'Dashboard';
      return last.charAt(0).toUpperCase() + last.slice(1) + ' Management';
    })(),
    category: 'Admin'
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/admin/login');
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'A';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md shadow-xs sm:px-6">
      {/* Left: Mobile Menu Toggle & Breadcrumbs / Title */}
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
            <span>Admin</span>
            <ChevronRight size={10} className="text-slate-300 shrink-0" />
            <span className="text-slate-500 font-medium">{routeInfo.category}</span>
          </div>
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
            {routeInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Actions, Live Site, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        {/* View Live Website Button */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Open public website in a new tab"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all duration-150 shadow-xs hover:shadow-sm"
        >
          <ExternalLink size={13} className="text-emerald-600 shrink-0" />
          <span className="hidden sm:inline">View Live Website</span>
          <span className="sm:hidden">Live Site</span>
        </a>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>

        {/* Subtle Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile Dropdown */}
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
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold tracking-wide uppercase">
                {user?.role || 'Admin'}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                isProfileOpen ? 'rotate-180 text-emerald-600' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-900/10 border border-slate-100 z-50">
              {/* Profile Card Header */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-xs shrink-0">
                    {userInitial}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user?.name || 'System Administrator'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate" title={user?.email || 'admin@aswanna.lk'}>
                      {user?.email || 'admin@aswanna.lk'}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <ShieldCheck size={11} />
                    {user?.role || 'ADMIN'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active Session
                  </span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="space-y-0.5">
                <Link
                  to="/admin/users"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg transition-colors"
                >
                  <Users size={14} className="text-slate-400 group-hover:text-emerald-600" />
                  <span>User Management</span>
                </Link>

                <Link
                  to="/admin/analytics"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg transition-colors"
                >
                  <BarChart3 size={14} className="text-slate-400" />
                  <span>Analytics Management</span>
                </Link>

                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg transition-colors"
                >
                  <ExternalLink size={14} className="text-slate-400" />
                  <span>Live Website</span>
                </a>
              </div>

              {/* Sign Out Divider & Button */}
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

export default Topbar;
