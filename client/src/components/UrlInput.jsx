import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowRight, Youtube, Instagram, Twitter, Clipboard } from 'lucide-react';
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
      toast.error('Could not access clipboard');
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
    <div className="w-full space-y-4">
      {/* Simple Headline */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Video Downloader
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Paste YouTube, Instagram, or X link to download
        </p>
      </div>

      {/* Clean Input Box */}
      <div className="clean-card p-2 sm:p-2.5">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3 flex items-center pointer-events-none text-zinc-400">
              {getPlatformIcon() || <Search className="w-4 h-4" />}
            </div>

            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste media link here..."
              className="w-full pl-9 pr-16 py-2.5 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              required
            />

            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-1.5 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-md transition-colors"
            >
              Paste
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="btn-primary py-2.5 px-5 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading</span>
              </>
            ) : (
              <>
                <span>Get</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Simple Platform Badges */}
      <div className="flex items-center justify-center gap-5 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1">
          <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube
        </span>
        <span className="flex items-center gap-1">
          <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram
        </span>
        <span className="flex items-center gap-1">
          <Twitter className="w-3.5 h-3.5 text-sky-400" /> X
        </span>
      </div>
    </div>
  );
}
