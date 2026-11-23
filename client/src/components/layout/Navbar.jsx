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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Public Links (Visible for Everyone)
  const publicLinks = [
    { to: '/', label: 'Downloader', icon: Download },
    { to: '/batch', label: 'Batch Queue', icon: Layers },
  ];

  // Admin-Only Links
  const adminLinks = [
    { to: '/history', label: 'Recent Downloads', icon: Clock },
    { to: '/dashboard', label: 'Analytics', icon: LayoutDashboard },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const visibleLinks = user ? [...publicLinks, ...adminLinks] : publicLinks;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#090a0d]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
            <Download className="w-4 h-4 stroke-[2.4]" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              MediaGrab
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Free
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {visibleLinks.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to || (item.to === '/' && location.pathname === '/downloader');
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  active
                    ? 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Admin
              </span>
              <button
                onClick={logout}
                className="btn-ghost text-xs p-2 text-zinc-500 hover:text-rose-500"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-secondary py-1.5 px-3 text-xs gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              <span>Admin Login</span>
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#090a0d] px-4 py-3 space-y-1">
          {visibleLinks.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to || (item.to === '/' && location.pathname === '/downloader');
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  active
                    ? 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.06]">
            {!user ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400"
              >
                <LogIn className="w-4 h-4" />
                <span>Admin Login</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-rose-500"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
