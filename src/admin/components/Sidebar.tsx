import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Leaf,
  Landmark,
  Building2,
  Sprout,
  MapPin,
  Package,
  ShoppingCart,
  GraduationCap,
  Newspaper,
  BookOpen,
  Image as ImageIcon,
  Briefcase,
  Users,
  ExternalLink,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavGroup {
  title: string;
  items: {
    name: string;
    path: string;
    icon: any;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard }
    ]
  },
  {
    title: 'AGRO & SERVICES',
    items: [
      { name: 'Agro Categories', path: '/admin/categories', icon: Layers },
      { name: 'Agro Items', path: '/admin/items', icon: Leaf },
      { name: 'Institutions Hub', path: '/admin/institutions', icon: Landmark },
      { name: 'Govijana Sewa', path: '/admin/asc', icon: Building2 },
      { name: 'Plant Finder', path: '/admin/plants', icon: Sprout },
      { name: 'Agro Lands', path: '/admin/agrolands', icon: MapPin }
    ]
  },
  {
    title: 'MARKET & COURSES',
    items: [
      { name: 'Products', path: '/admin/products', icon: Package },
      { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
      { name: 'Courses', path: '/admin/courses', icon: GraduationCap }
    ]
  },
  {
    title: 'CONTENT & MEDIA',
    items: [
      { name: 'News', path: '/admin/news', icon: Newspaper },
      { name: 'Blogs', path: '/admin/blogs', icon: BookOpen },
      { name: 'Careers', path: '/admin/careers', icon: Briefcase },
      { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon }
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { name: 'User Management', path: '/admin/users', icon: Users }
    ]
  }
];

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

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
        className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-[#0b1324] text-slate-200 flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800 shrink-0 bg-[#090f1d]">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/30 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wide text-white block leading-none">
                Aswanna<span className="text-emerald-400">Admin</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Control Panel
              </span>
            </div>
          </Link>
          <button
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={item.path === '/admin'}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-bold'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="shrink-0 transition-transform group-hover:scale-110" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-500/20 text-emerald-300">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#090f1d] shrink-0 space-y-2">
          {/* View Live Website Button */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors border border-slate-700/50"
          >
            <ExternalLink size={14} className="text-emerald-400" />
            <span>View Live Website</span>
          </a>

          {/* User Account / Logout */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                {(user?.name || 'A')[0].toUpperCase()}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@aswanna.lk'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
