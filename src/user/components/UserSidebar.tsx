import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Trees,
  Sparkles,
  MapPin,
  Briefcase,
  X,
  Leaf,
  Globe,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserSidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'My Nurseries', path: '/dashboard/nurseries', icon: Trees },
  { name: 'My Mushrooms', path: '/dashboard/mushrooms', icon: Sparkles },
  { name: 'My Lands', path: '/dashboard/lands', icon: MapPin },
  { name: 'My Jobs', path: '/dashboard/jobs', icon: Briefcase },
];

export const UserSidebar = ({ isOpen, setIsOpen }: UserSidebarProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showExpanded = isMobile || isHovered;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 z-40 bg-[#09151e] text-slate-200 flex flex-col border-r border-slate-800/80 transition-[width,transform] duration-300 ease-in-out lg:static lg:z-auto lg:shrink-0 lg:translate-x-0 overflow-hidden ${
          isHovered ? 'w-72 lg:w-72' : 'w-72 lg:w-[72px]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center border-b border-slate-800 shrink-0 bg-[#061017] overflow-hidden">
          {showExpanded ? (
            <div className="w-full flex items-center justify-between px-4 transition-all duration-300">
              <Link to="/dashboard" className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/30 shrink-0 hover:scale-105 transition-transform">
                  <Leaf className="w-5 h-5 fill-white/20" />
                </div>
                <div className="overflow-hidden whitespace-nowrap">
                  <span className="font-extrabold text-base tracking-wide text-white block leading-none">
                    Aswanna<span className="text-emerald-400">Portal</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                    User Dashboard
                  </span>
                </div>
              </Link>
              <button
                type="button"
                className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <Link to="/dashboard" className="flex items-center justify-center">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/30 hover:scale-105 transition-transform">
                  <Leaf className="w-5 h-5 fill-white/20" />
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            showExpanded ? 'px-3' : 'px-0'
          }`}
        >
          {showExpanded && (
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap overflow-hidden">
              My Modules
            </div>
          )}

          <div className="space-y-1 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.exact}
                  title={item.name}
                  className={({ isActive }) =>
                    `flex items-center transition-all duration-200 group ${
                      showExpanded
                        ? 'w-full gap-3 px-3.5 py-2.5 rounded-xl justify-start'
                        : 'w-11 h-11 mx-auto justify-center rounded-xl p-0 gap-0'
                    } ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={19} className="shrink-0 transition-transform group-hover:scale-110" />
                  {showExpanded && (
                    <span className="text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-200">
                      {item.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800/70 my-2" />

          {/* Quick links & shortcuts */}
          <div className="space-y-1 w-full">
            <Link
              to="/"
              title="Public Website"
              className={`flex items-center transition-all duration-200 group text-slate-400 hover:bg-slate-800/80 hover:text-emerald-300 ${
                showExpanded
                  ? 'w-full gap-3 px-3.5 py-2.5 rounded-xl justify-start'
                  : 'w-11 h-11 mx-auto justify-center rounded-xl p-0 gap-0'
              }`}
            >
              <Globe size={19} className="shrink-0 transition-transform group-hover:scale-110" />
              {showExpanded && (
                <span className="text-xs font-medium whitespace-nowrap overflow-hidden">
                  Public Website
                </span>
              )}
            </Link>

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                title="Admin Control Panel"
                className={`flex items-center transition-all duration-200 group text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 ${
                  showExpanded
                    ? 'w-full gap-3 px-3.5 py-2.5 rounded-xl justify-start'
                    : 'w-11 h-11 mx-auto justify-center rounded-xl p-0 gap-0'
                }`}
              >
                <ShieldCheck size={19} className="shrink-0 transition-transform group-hover:scale-110" />
                {showExpanded && (
                  <span className="text-xs font-semibold whitespace-nowrap overflow-hidden">
                    Admin Control Panel
                  </span>
                )}
              </Link>
            )}
          </div>
        </nav>

        {/* User Card at Bottom */}
        <div className="p-3 border-t border-slate-800/80 bg-[#061017]">
          {showExpanded ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email || user?.phone || 'Member'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="w-11 h-11 mx-auto flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;

