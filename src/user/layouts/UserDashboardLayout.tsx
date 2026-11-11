import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import UserTopbar from '../components/UserTopbar';
import { ConfirmProvider } from '../../admin/components/ConfirmDialog';

export const UserDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ConfirmProvider>
      <div className="flex h-screen w-full bg-gray-50 font-sans overflow-hidden">
        {/* Sidebar */}
        <UserSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Topbar */}
          <UserTopbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          {/* Scrollable Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-3 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ConfirmProvider>
  );
};

export default UserDashboardLayout;

