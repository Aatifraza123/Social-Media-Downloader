import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Download,
  Layers,
  Clock,
  LayoutDashboard,
  Moon,
  Sun,
  Menu,
  X,
  LogIn,
  LogOut,
  Shield,
  Settings as SettingsIcon,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const publicLinks = [
    { to: '/', label: 'Ingest Studio', icon: Download },
    { to: '/batch', label: 'Batch Queue', icon: Layers },
  ];

  const adminLinks = [
    { to: '/history', label: 'Audit Vault', icon: Clock },
    { to: '/dashboard', label: 'Node Metrics', icon: LayoutDashboard },
    { to: '/settings', label: 'Daemon Settings', icon: SettingsIcon },
  ];

  const visibleLinks = user ? [...publicLinks, ...adminLinks] : publicLinks;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 dark:border-white/[0.07] bg-white/75 dark:bg-[#07080b]/75 backdrop-blur-xl transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand identity - subtle, professional, high-end */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gray-950 dark:bg-white text-white dark:text-gray-950 flex items-center justify-center font-mono font-bold text-xs tracking-tight shadow-sm transition-transform group-hover:scale-105">
            <span className="font-extrabold text-[13px]">V</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">
              Vector
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-white/[0.06]">
              v2.4
            </span>
          </div>
        </Link>

        {/* Center Navigation Links with active pill highlight */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-100/70 dark:bg-white/[0.04] p-1 rounded-lg border border-gray-200/50 dark:border-white/[0.05]">
          {visibleLinks.map((item) => {
            const active = location.pathname === item.to || (item.to === '/' && location.pathname === '/downloader');
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  active
                    ? 'bg-white dark:bg-white/[0.08] text-gray-950 dark:text-white shadow-xs font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right actions: theme + node ping + admin */}
        <div className="flex items-center gap-2">
          {/* Subtle latency pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100/60 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.05]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Node: Hostinger Ubuntu</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                admin
              </span>
              <button
                onClick={logout}
                className="btn-ghost text-xs p-1.5 text-gray-500 hover:text-rose-500"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-secondary py-1 px-2.5 text-[11px] font-medium gap-1"
            >
              <Terminal className="w-3 h-3 text-gray-400" />
              <span>Console</span>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drop menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#07080b] px-4 py-3 space-y-1">
          {visibleLinks.map((item) => {
            const active = location.pathname === item.to || (item.to === '/' && location.pathname === '/downloader');
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-gray-100 dark:bg-white/[0.08] text-gray-950 dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gray-100 dark:border-white/[0.06]">
            {!user ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-400"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Console Login</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-rose-500"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
