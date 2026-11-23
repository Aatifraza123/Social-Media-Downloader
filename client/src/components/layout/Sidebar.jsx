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
  Sparkles,
  HardDrive,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDownloads';

const navSections = [
  {
    title: 'CORE',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    ],
  },
  {
    title: 'INGESTION ENGINE',
    items: [
      { path: '/downloader', icon: Download, label: 'Single Ingestion' },
      { path: '/batch', icon: Layers, label: 'Batch Queue' },
      { path: '/history', icon: History, label: 'Media Library' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { path: '/settings', icon: Settings, label: 'Settings & VPS' },
    ],
  },
];

export default function Sidebar({ isOpen, mobileOpen, onMobileClose }) {
  const location = useLocation();
  const { data: statsData } = useDashboardStats();
  const stats = statsData?.data;

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-[#0c0d0f] border-r border-zinc-200/80 dark:border-white/[0.08]">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200/80 dark:border-white/[0.08]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          {(isOpen || mobile) && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-zinc-900 dark:text-white tracking-tight">
                  Downloader
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  PRO
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">Enterprise Media Suite</div>
            </div>
          )}
        </div>

        {mobile && (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            {(isOpen || mobile) && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {section.title}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={mobile ? onMobileClose : undefined}
                    className={`sidebar-link relative ${isActive ? 'active' : ''}`}
                    title={!isOpen && !mobile ? label : undefined}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                    {(isOpen || mobile) && (
                      <span className="truncate flex-1">{label}</span>
                    )}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 flex-shrink-0" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Storage & Node telemetry widget */}
      {(isOpen || mobile) && (
        <div className="p-3 m-3 rounded-xl bg-white dark:bg-[#141519] border border-zinc-200/80 dark:border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
              VPS Storage
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {stats?.storageUsedFormatted || '0 B'} / 50 GB
            </span>
          </div>

          <div className="w-full bg-zinc-100 dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full w-[12%]" />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Encrypted
            </span>
            <NavLink to="/settings" className="text-zinc-500 hover:text-indigo-500 transition-colors font-medium">
              Manage
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-screen z-40 transition-all duration-200
          ${isOpen ? 'w-64' : 'w-18'}`}
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
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 h-screen w-72 z-50 shadow-2xl"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
