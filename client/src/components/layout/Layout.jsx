import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { ShieldCheck, Zap, Heart } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#090a0d] text-zinc-900 dark:text-zinc-100 flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <Outlet />
      </main>

      {/* Clean Minimal Public Footer */}
      <footer className="border-t border-zinc-200/70 dark:border-white/[0.06] bg-white dark:bg-[#0c0d10] py-8 text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <span>Free online video & audio downloader</span>
            <span>•</span>
            <span>Fast, safe, zero installation</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            <Link to="/downloader" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              Downloader
            </Link>
            <Link to="/batch" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              Batch Queue
            </Link>
            <Link to="/history" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              Recent Vault
            </Link>
            <Link to="/login" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
