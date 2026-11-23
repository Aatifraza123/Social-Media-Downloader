import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowRight, Youtube, Instagram, Twitter, AlertCircle } from 'lucide-react';
import { detectPlatform } from '../utils/platformDetector';

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
    <div className="minimal-card p-6 sm:p-7">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Inspect Media URL
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Paste a link from YouTube, Instagram, or X (Twitter) to preview and download available formats.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {detected ? getPlatformIcon() : <Search className="w-4 h-4 text-zinc-400" />}
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or https://instagram.com/reel/..."
            className="input-field pl-10 pr-24"
            required
          />
          {detected && (
            <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
              <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${detected.badgeClass}`}>
                {detected.name}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="btn-primary gap-2 min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Inspecting</span>
            </>
          ) : (
            <>
              <span>Fetch Media</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {url && !detected && (
        <div className="flex items-center gap-2 mt-3 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
          <span>Platform will be automatically identified once a supported YouTube, Instagram, or X URL is pasted.</span>
        </div>
      )}
    </div>
  );
}
