import React, { useState } from 'react';
import { Menu, Moon, Sun, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onMenuClick, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Node Online
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User profile menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-left"
          >
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hidden sm:block max-w-[160px] truncate">
              {user?.email}
            </span>
            <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-semibold text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-1.5 w-56 minimal-card p-1.5 shadow-lg z-50">
              <div className="px-2.5 py-2 border-b border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Administrator
                </div>
                <div className="text-zinc-500 truncate mt-0.5">{user?.email}</div>
              </div>

              <button
                onClick={async () => {
                  setShowProfile(false);
                  await logout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 mt-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
