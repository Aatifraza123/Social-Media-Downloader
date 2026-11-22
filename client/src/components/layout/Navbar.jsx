import React, { useState } from 'react';
import { Menu, Moon, Sun, LogOut, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onMenuClick, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="sticky top-0 z-30 h-16 glass-card dark:glass-card glass-card-light border-b border-white/10 rounded-none flex items-center justify-between px-4 lg:px-8 bg-navy-950/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-300" />
        </button>
        <button
          onClick={onToggleSidebar}
          className="hidden lg:block p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-300" />
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h2 className="text-sm font-semibold text-gray-200 hidden sm:block">
            Private Node Online
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-white/10 transition-colors text-gray-300"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
        </motion.button>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="text-sm text-gray-300 hidden sm:block">
              {user?.email}
            </span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-52 glass-card p-2 shadow-2xl z-50 bg-navy-900 border border-white/15">
              <div className="px-3 py-2 border-b border-white/10 text-xs text-gray-400">
                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Admin
                </div>
                {user?.email}
              </div>
              <button
                onClick={async () => {
                  setShowProfile(false);
                  await logout();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
