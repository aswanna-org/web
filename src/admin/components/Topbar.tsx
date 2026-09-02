
import { Search, Bell, Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Topbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Create a simple breadcrumb from the pathname
  const pathnames = location.pathname.split('/').filter(x => x);
  const title = pathnames.length > 1 
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <Menu size={24} />
        </button>
        
        <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search size={16} />
          </span>
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full rounded-full border border-gray-300 bg-gray-50 py-1.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-1 text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* User Profile */}
        <div className="relative group ml-2 z-50">
          <button className="flex items-center gap-2 focus:outline-none py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
              <User size={16} />
            </div>
            <span className="hidden text-sm font-medium text-gray-700 md:block">
              {user?.name || 'Admin User'}
            </span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-0 hidden w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block border border-gray-100">
            <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
            <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
            <div className="border-t border-gray-100 my-1"></div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
