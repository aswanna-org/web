import { NavLink } from 'react-router-dom';
import { Home, Users, Settings, FileText, BarChart3, X, Leaf, Layers, Image as ImageIcon, ShoppingCart, Sprout, Map } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: Home },
    { name: 'Agro Categories', path: '/admin/categories', icon: Layers },
    { name: 'Agro Items', path: '/admin/items', icon: Leaf },
    { name: 'Products', path: '/admin/products', icon: FileText },
    { name: 'Plant Finder', path: '/admin/plants', icon: Sprout },
    { name: 'Agro Lands', path: '/admin/agrolands', icon: Map },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'News', path: '/admin/news', icon: FileText },
    { name: 'Blogs', path: '/admin/blogs', icon: FileText },
    { name: 'Careers', path: '/admin/careers', icon: FileText },
    { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <Leaf className="text-green-500" />
            <span>Aswanna Admin</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-green-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
