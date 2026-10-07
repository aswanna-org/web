import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
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
  Mail,
  X
} from 'lucide-react';

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
      { name: 'Dashboard Management', path: '/admin', icon: LayoutDashboard },
      { name: 'Analytics Management', path: '/admin/analytics', icon: BarChart3 }
    ]
  },
  {
    title: 'AGRO & SERVICES',
    items: [
      { name: 'Category Management', path: '/admin/categories', icon: Layers },
      { name: 'Item Management', path: '/admin/items', icon: Leaf },
      { name: 'Institution Management', path: '/admin/institutions', icon: Landmark },
      { name: 'Govijana Sewa Management', path: '/admin/asc', icon: Building2 },
      { name: 'Plant Management', path: '/admin/plants', icon: Sprout },
      { name: 'Agro Land Management', path: '/admin/agrolands', icon: MapPin }
    ]
  },
  {
    title: 'MARKET & COURSES',
    items: [
      { name: 'Product Management', path: '/admin/products', icon: Package },
      { name: 'Order Management', path: '/admin/orders', icon: ShoppingCart },
      { name: 'Course Management', path: '/admin/courses', icon: GraduationCap },
      { name: 'Short Course Management', path: '/admin/short-courses', icon: BookOpen }
    ]
  },
  {
    title: 'CONTENT & MEDIA',
    items: [
      { name: 'News Management', path: '/admin/news', icon: Newspaper },
      { name: 'Blog Management', path: '/admin/blogs', icon: BookOpen },
      { name: 'Career Management', path: '/admin/careers', icon: Briefcase },
      { name: 'Gallery Management', path: '/admin/gallery', icon: ImageIcon }
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { name: 'User Management', path: '/admin/users', icon: Users },
      { name: 'Contact Management', path: '/admin/contacts', icon: Mail }
    ]
  }
];

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container (In-flow on desktop so it smoothly pushes main content; drawer on mobile) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 z-40 bg-[#0b1324] text-slate-200 flex flex-col border-r border-slate-800/80 transition-[width,transform] duration-300 ease-in-out lg:static lg:z-auto lg:shrink-0 lg:translate-x-0 overflow-hidden ${
          isHovered ? 'w-72 lg:w-72' : 'w-72 lg:w-[72px]'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center border-b border-slate-800 shrink-0 bg-[#090f1d] overflow-hidden">
          {isHovered ? (
            <div className="w-full flex items-center justify-between px-4 transition-all duration-300">
              <Link to="/admin" className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/30 shrink-0 hover:scale-105 transition-transform">
                  <Leaf className="w-5 h-5 fill-white/20" />
                </div>
                <div className="overflow-hidden whitespace-nowrap">
                  <span className="font-extrabold text-base tracking-wide text-white block leading-none">
                    Aswanna<span className="text-emerald-400">Admin</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                    Control Panel
                  </span>
                </div>
              </Link>
              <button
                className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <Link to="/admin" className="flex items-center justify-center">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/30 hover:scale-105 transition-transform">
                  <Leaf className="w-5 h-5 fill-white/20" />
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Area */}
        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isHovered ? 'px-3' : 'px-0'
          }`}
        >
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1 w-full">
              {/* Group Title or subtle divider */}
              {isHovered ? (
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap overflow-hidden">
                  {group.title}
                </div>
              ) : (
                <div className="w-8 mx-auto h-px bg-slate-800/80 my-2" />
              )}

              <div className="space-y-1 w-full">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={item.path === '/admin'}
                      title={item.name}
                      className={({ isActive }) =>
                        `flex items-center transition-all duration-200 group ${
                          isHovered
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
                      {isHovered && (
                        <>
                          <span className="text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-200">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 whitespace-nowrap">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
