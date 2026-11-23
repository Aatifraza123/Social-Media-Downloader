import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowRight, Youtube, Instagram, Twitter, Clipboard, Check, Sparkles } from 'lucide-react';
import { detectPlatform } from '../utils/platformDetector';
import toast from 'react-hot-toast';

export default function UrlInput({ onAnalyze, isLoading }) {
  const [url, setUrl] = useState('');
  const [detected, setDetected] = useState(null);

  useEffect(() => {
    if (url.trim()) {
      setDetected(detectPlatform(url));
    } else {
      setDetected(null);
    }
  }, [url]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setUrl(text.trim());
        toast.success('Pasted from clipboard');
      }
    } catch {
      toast.error('Could not access clipboard. Please paste manually.');
    }
  };

  const getPlatformIcon = () => {
    if (!detected) return null;
    switch (detected.id) {
      case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'twitter': return <Twitter className="w-4 h-4 text-sky-400" />;
      default: return null;
    }
  };

  return (
    <div className="w-full">
      {/* Hero Headline */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
          Download Videos & Music in Seconds
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Paste any link from YouTube, Instagram, or X (Twitter). High quality, fast, and 100% free.
        </p>
      </div>

      {/* Clean Minimal Search Input Card */}
      <div className="clean-card p-3 sm:p-4 shadow-sm mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none">
              {getPlatformIcon() || (
                <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              )}
            </div>

            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube, Instagram, or X link here..."
              className="w-full pl-10 pr-24 py-3 rounded-xl bg-zinc-50 dark:bg-[#16171d] border border-transparent focus:border-zinc-300 dark:focus:border-white/[0.2] focus:bg-white dark:focus:bg-[#1a1b22] text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-all"
              required
            />

            {/* Quick paste button inside input */}
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] transition-colors flex items-center gap-1"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="btn-primary w-full sm:w-auto py-3 px-6 text-sm font-semibold whitespace-nowrap flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <span>Download</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {detected && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              {detected.name} detected
            </span>
            <span>Ready to convert</span>
          </div>
        )}
      </div>

      {/* Supported Platforms Strip */}
      <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-400 dark:text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Youtube className="w-4 h-4 text-red-500" /> YouTube 4K & Shorts
        </span>
        <span className="flex items-center gap-1.5">
          <Instagram className="w-4 h-4 text-pink-500" /> Instagram Reels
        </span>
        <span className="flex items-center gap-1.5">
          <Twitter className="w-4 h-4 text-sky-400" /> X (Twitter) Video
        </span>
      </div>
    </div>
  );
}
