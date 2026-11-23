import React, { useState } from 'react';
import { Menu, Moon, Sun, LogOut, ShieldCheck, Clipboard, Activity, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar({ onMenuClick, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard Overview';
      case '/downloader': return 'Single Media Ingestion';
      case '/batch': return 'Batch Download Manager';
      case '/history': return 'Media Library & History';
      case '/settings': return 'System Preferences';
      default: return 'Overview';
    }
  };

  const handleQuickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.startsWith('http')) {
        navigate('/downloader');
        toast.success('Pasting URL to downloader...');
        setTimeout(() => {
          const input = document.querySelector('input[type="url"]');
          if (input) {
            input.value = text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
          }
        }, 150);
      } else {
        toast('Clipboard does not contain a valid URL', { icon: '📋' });
      }
    } catch {
      toast.error('Unable to read clipboard. Please paste manually.');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#090a0c]/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-between px-4 sm:px-6 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Breadcrumb navigation */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-500">
          <span>App</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{getPageTitle()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Quick Paste Button */}
        <button
          onClick={handleQuickPaste}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.08] transition-colors"
          title="Paste link from clipboard"
        >
          <Clipboard className="w-3.5 h-3.5 text-indigo-500" />
          <span>Quick Paste</span>
          <kbd className="hidden lg:inline-block px-1 py-0.2 bg-zinc-200 dark:bg-white/10 rounded font-mono text-[10px]">⌘V</kbd>
        </button>

        {/* Live Server Node Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Hostinger VPS • 24ms</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1 pl-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-zinc-200 dark:hover:border-white/[0.08] transition-all"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">Admin User</div>
              <div className="text-[10px] text-zinc-500 font-mono">Single Tenant</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 saas-card p-2 shadow-xl z-50 animate-fade-in">
              <div className="p-3 border-b border-zinc-100 dark:border-white/[0.08]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Administrator Session
                </div>
                <div className="text-xs text-zinc-500 truncate">{user?.email}</div>
                <div className="mt-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 inline-block font-semibold">
                  Dedicated VPS License
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={async () => {
                    setShowProfile(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out of Console
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
