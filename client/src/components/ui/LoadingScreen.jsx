import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-gray-400 font-medium tracking-wide">Loading Social Media Downloader Pro...</p>
      </motion.div>
    </div>
  );
}
