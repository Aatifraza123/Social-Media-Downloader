import React, { useState } from 'react';
import { ExternalLink, Copy, Clock, User, Film, Check, ShieldAlert, QrCode, Share2, Play, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MediaPreview({ metadata }) {
  const [copied, setCopied] = React.useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!metadata) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(metadata.originalUrl);
    setCopied(true);
    toast.success('Source URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(metadata.originalUrl)}`;

  return (
    <div className="saas-card p-6 sm:p-7 relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Media Thumbnail Container */}
        <div className="md:col-span-5 relative group overflow-hidden rounded-xl bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] aspect-video flex items-center justify-center shadow-md">
          {metadata.thumbnail ? (
            <img
              src={metadata.thumbnail}
              alt={metadata.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-500">
              <Film className="w-10 h-10 text-zinc-400" />
              <span className="text-xs">No Thumbnail Preview</span>
            </div>
          )}

          {/* Video duration badge */}
          {metadata.duration && (
            <span className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-xs text-white text-xs px-2 py-0.5 rounded-md font-mono flex items-center gap-1 border border-white/10 shadow-sm">
              <Clock className="w-3 h-3 text-indigo-400" /> {metadata.duration}
            </span>
          )}

          {/* Platform watermark */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[11px] font-bold text-white uppercase tracking-wider border border-white/10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            {metadata.platform}
          </div>
        </div>

        {/* Media Metadata Details */}
        <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                {metadata.type || 'STREAM READY'}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                ID: {metadata.videoId || metadata.contentId || metadata.tweetId || 'Verified'}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white leading-snug line-clamp-2">
              {metadata.title}
            </h3>

            {metadata.creator && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                  {metadata.creator.charAt(0)}
                </div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {metadata.creator}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">• Verified Source</span>
              </div>
            )}
          </div>

          {metadata.notice && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.08] text-xs text-zinc-600 dark:text-zinc-400">
              <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>{metadata.notice}</span>
            </div>
          )}

          {/* Actions toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-100 dark:border-white/[0.08]">
            <button
              onClick={handleCopy}
              className="btn-secondary py-1.5 px-3 text-xs gap-1.5 rounded-lg"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy URL'}</span>
            </button>

            <button
              onClick={() => setShowQr(!showQr)}
              className="btn-secondary py-1.5 px-3 text-xs gap-1.5 rounded-lg"
              title="Show QR Code to download on mobile"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-500" />
              <span>Send to Mobile</span>
            </button>

            <a
              href={metadata.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-1.5 px-3 text-xs gap-1.5 rounded-lg"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Post</span>
            </a>
          </div>
        </div>
      </div>

      {/* QR Code Popup Modal */}
      {showQr && (
        <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-black/60 border border-zinc-200 dark:border-white/[0.1] flex flex-col sm:flex-row items-center gap-4 animate-fade-in">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <img src={qrUrl} alt="QR Code" className="w-28 h-28" />
          </div>
          <div>
            <div className="font-bold text-sm text-zinc-900 dark:text-white">Scan with Phone Camera</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
              Open the media directly on your iOS or Android device without transferring files via cable.
            </p>
            <button
              onClick={() => setShowQr(false)}
              className="text-xs text-indigo-500 hover:underline mt-2 font-medium"
            >
              Dismiss QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
