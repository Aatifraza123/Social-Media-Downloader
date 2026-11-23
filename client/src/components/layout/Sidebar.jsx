import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Download,
  Layers,
  History,
  Settings,
  X,
  ArrowDownToLine,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { path: '/downloader', icon: Download, label: 'Downloader' },
  { path: '/batch', icon: Layers, label: 'Batch Queue' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, mobileOpen, onMobileClose }) {
  const location = useLocation();

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
      {/* Brand header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center flex-shrink-0">
            <ArrowDownToLine className="w-4 h-4 stroke-[2.2]" />
          </div>
          {(isOpen || mobile) && (
            <div className="truncate">
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
                Downloader
              </span>
              <span className="ml-1 text-[11px] font-mono text-zinc-400">PRO</span>
            </div>
          )}
        </div>

        {mobile && (
          <button
            onClick={onMobileClose}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              onClick={mobile ? onMobileClose : undefined}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={!isOpen && !mobile ? label : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`} />
              {(isOpen || mobile) && (
                <span className="truncate">{label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      {(isOpen || mobile) && (
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
            <span>Private Node</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              v1.0
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-screen z-40 transition-all duration-200
          ${isOpen ? 'w-56' : 'w-16'}`}
      >
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 h-screen w-60 z-50 shadow-xl"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
