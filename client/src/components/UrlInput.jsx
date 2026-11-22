import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, Youtube, Instagram, Twitter, AlertCircle } from 'lucide-react';
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
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'twitter': return <Twitter className="w-5 h-5 text-sky-400" />;
      default: return null;
    }
  };

  return (
    <div className="w-full glass-card p-6 md:p-8 bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/15 shadow-2xl">
      <div className="mb-4 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2 justify-center sm:justify-start">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          Smart Media Ingestion
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Paste any authorized YouTube, Instagram, or X (Twitter) URL to preview and download.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {detected ? getPlatformIcon() : <Search className="w-5 h-5 text-gray-400" />}
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or https://instagram.com/reel/..."
            className="input-field pl-12 pr-24 py-3.5 bg-black/40 border-white/20 text-white placeholder-gray-500 text-sm sm:text-base focus:border-indigo-400 focus:ring-indigo-500/30"
            required
          />
          {detected && (
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${detected.bgColor}`}>
                {detected.name}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="btn-primary py-3.5 px-8 flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Inspect Media</span>
            </>
          )}
        </button>
      </form>

      {url && !detected && (
        <div className="flex items-center gap-2 mt-3 text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Platform not recognized yet. Ensure it matches supported formats for YouTube, Instagram, or X.</span>
        </div>
      )}
    </div>
  );
}
