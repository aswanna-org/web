import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { ConfirmProvider } from '../components/ConfirmDialog';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ConfirmProvider>
      <div className="flex h-screen w-full bg-gray-50 font-sans overflow-hidden">
        {/* Sidebar - flex item that pushes content */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Topbar */}
          <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          {/* Scrollable Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ConfirmProvider>
  );
};

export default AdminLayout;
