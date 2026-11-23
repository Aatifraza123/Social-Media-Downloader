import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Sidebar
        isOpen={sidebarOpen}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className={`transition-all duration-200 flex-1 flex flex-col ${sidebarOpen ? 'lg:ml-56' : 'lg:ml-16'}`}>
        <Navbar
          onMenuClick={() => setMobileSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
