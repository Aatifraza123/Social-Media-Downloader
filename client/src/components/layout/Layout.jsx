import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#07080b] text-[#111827] dark:text-[#f3f4f6] flex flex-col antialiased overflow-x-hidden">
      {/* Premium Ambient Linear Mesh & Subtle Particle Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle mesh grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Top center indigo orb */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-indigo-500/15 via-blue-500/10 to-transparent blur-[120px] rounded-full" />

        {/* Accent violet side flare */}
        <div className="absolute top-[250px] right-[-120px] w-[500px] h-[500px] bg-gradient-to-bl from-purple-500/10 via-indigo-500/5 to-transparent blur-[140px] rounded-full" />

        {/* Ambient cyan counter-glow */}
        <div className="absolute top-[400px] left-[-150px] w-[550px] h-[500px] bg-gradient-to-tr from-sky-500/10 via-blue-500/5 to-transparent blur-[140px] rounded-full" />
      </div>

      {/* Main App Content on relative layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
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
    </div>
  );
}
