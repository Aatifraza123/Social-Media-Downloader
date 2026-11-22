import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Download, Layers, History, Settings, X, Sparkles,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/downloader', icon: Download, label: 'Downloader' },
  { path: '/batch', icon: Layers, label: 'Batch Queue' },
  { path: '/history', icon: History, label: 'Downloads' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, mobileOpen, onMobileClose }) {
  const location = useLocation();

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-navy-950/95 border-r border-white/10">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {(isOpen || mobile) && (
          <div className="flex-1 overflow-hidden">
            <h1 className="font-display font-bold text-white text-base leading-tight truncate">
              Downloader Pro
            </h1>
            <p className="text-[11px] text-indigo-400 font-medium uppercase tracking-wider">Hostinger VPS Node</p>
          </div>
        )}
        {mobile && (
          <button onClick={onMobileClose} className="p-1 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              onClick={mobile ? onMobileClose : undefined}
              className={`sidebar-link relative ${isActive ? 'active' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
              {(isOpen || mobile) && (
                <span className="font-medium text-sm truncate">{label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {(isOpen || mobile) && (
        <div className="p-4 border-t border-white/10 bg-navy-900/40">
          <div className="text-[11px] text-gray-500 text-center">
            Private Edition v1.0 • Hostinger VPS
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-screen z-40 transition-all duration-300
          ${isOpen ? 'w-64' : 'w-20'}`}
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
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 h-screen w-72 z-50"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
