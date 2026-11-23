import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowRight, Youtube, Instagram, Twitter, AlertCircle, Clipboard, Zap } from 'lucide-react';
import { detectPlatform } from '../utils/platformDetector';
import toast from 'react-hot-toast';

const PRESETS = [
  { label: 'YouTube 1080p Full HD', icon: Youtube, color: 'text-red-500', sample: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { label: 'Instagram Reel', icon: Instagram, color: 'text-pink-500', sample: 'https://www.instagram.com/reel/C2xyzABC123/' },
  { label: 'X (Twitter) Media', icon: Twitter, color: 'text-sky-400', sample: 'https://x.com/jack/status/20' },
];

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
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'twitter': return <Twitter className="w-5 h-5 text-sky-400" />;
      default: return null;
    }
  };

  return (
    <div className="saas-card p-6 sm:p-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-500">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Ingest Social Media
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Automated metadata resolution, thumbnail preview, and stream ripping from YouTube, Instagram, and X.
          </p>
        </div>

        {/* Quick Presets Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESETS.map((p, i) => {
            const Icon = p.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setUrl(p.sample)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.06] transition-colors"
                title={`Try sample: ${p.label}`}
              >
                <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex flex-col sm:flex-row gap-2.5 items-stretch">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {detected ? getPlatformIcon() : <Search className="w-4 h-4 text-zinc-400" />}
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste social media URL (e.g., https://youtube.com/watch?v=... or https://instagram.com/reel/...)"
              className="input-field pl-11 pr-32 py-3.5 text-sm sm:text-base font-medium"
              required
            />

            {/* Right side controls in input */}
            <div className="absolute inset-y-0 right-3 flex items-center gap-2">
              {detected ? (
                <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold tracking-wide ${detected.badgeClass}`}>
                  {detected.name}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-white/[0.06] transition-colors"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="btn-primary py-3.5 px-6 gap-2 text-sm whitespace-nowrap justify-center shadow-lg shadow-indigo-500/10"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resolving Streams...</span>
              </>
            ) : (
              <>
                <span>Inspect Media</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Status notice */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Direct FFmpeg & yt-dlp pipeline enabled
          </span>
          <span className="font-mono text-[10px]">Max Resolution: 1080p FHD</span>
        </div>
      </form>
    </div>
  );
}
