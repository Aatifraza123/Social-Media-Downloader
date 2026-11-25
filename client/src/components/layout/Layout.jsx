import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { Terminal, Shield, CheckCircle2 } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#07080b] text-[#111827] dark:text-[#f3f4f6] flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        <Outlet />
      </main>

      {/* Senior Architectural Footer */}
      <footer className="border-t border-gray-200/70 dark:border-white/[0.06] bg-white/60 dark:bg-[#0a0c12]/60 backdrop-blur-md py-8 text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-gray-900 dark:text-white font-mono text-xs">Vector Engine</span>
            <span>•</span>
            <span className="text-[11px] text-gray-500">Autonomous media extraction & remuxing daemon</span>
          </div>

          <div className="flex items-center gap-5 text-xs text-gray-600 dark:text-gray-400">
            <Link to="/downloader" className="hover:text-gray-950 dark:hover:text-white transition-colors">
              Ingest Studio
            </Link>
            <Link to="/batch" className="hover:text-gray-950 dark:hover:text-white transition-colors">
              Batch Pipeline
            </Link>
            <Link to="/history" className="hover:text-gray-950 dark:hover:text-white transition-colors">
              Vault
            </Link>
            <Link to="/login" className="hover:text-gray-950 dark:hover:text-white transition-colors">
              Admin Console
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
