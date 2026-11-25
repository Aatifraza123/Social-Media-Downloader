import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowRight, Clipboard, Youtube, Instagram, Twitter, CheckCircle2 } from 'lucide-react';
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
        toast.success('Pasted link from clipboard');
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
    <div className="w-full space-y-6 pt-4 sm:pt-6 pb-2">
      {/* Editorial Headline — Sharp, understated, high-end */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/[0.05] border border-gray-200/80 dark:border-white/[0.08]">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Zero-loss stream extraction</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-[1.15]">
          High-bitrate media ingestion, on demand.
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
          Direct stream parsing from YouTube, Instagram Reels, and X (Twitter). Lossless 4K, 1080p, and MP3 audio.
        </p>
      </div>

      {/* Main Command-Line Style Input Box */}
      <div className="clean-card-elevated p-2 sm:p-2.5 max-w-2xl mx-auto transition-all focus-within:border-brand-500/50">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400">
              {getPlatformIcon() || <Search className="w-4 h-4" />}
            </div>

            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste social media video link..."
              className="w-full pl-10 pr-20 py-2.5 bg-transparent text-xs sm:text-sm text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none font-mono"
              required
            />

            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 px-2 py-1 text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded border border-gray-200/70 dark:border-white/[0.08] transition-colors"
            >
              Paste ⌘V
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="btn-primary py-2.5 px-4 sm:px-5 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Resolving...</span>
              </>
            ) : (
              <>
                <span>Extract</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {detected && (
          <div className="mt-2.5 pt-2 px-2 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Platform detected: {detected.name}</span>
            </span>
            <span className="text-gray-400">Ready to demux</span>
          </div>
        )}
      </div>

      {/* Supported Platform Chips */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 text-[11px] font-mono text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1.5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube 4K & Shorts
        </span>
        <span className="flex items-center gap-1.5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram Reels
        </span>
        <span className="flex items-center gap-1.5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <Twitter className="w-3.5 h-3.5 text-sky-400" /> X (Twitter) Streams
        </span>
      </div>
    </div>
  );
}
