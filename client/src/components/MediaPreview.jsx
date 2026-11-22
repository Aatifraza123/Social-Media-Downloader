import React from 'react';
import { ExternalLink, Copy, Clock, User, Film, Check, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MediaPreview({ metadata }) {
  const [copied, setCopied] = React.useState(false);

  if (!metadata) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(metadata.originalUrl);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-6 border-white/15 bg-navy-900/60 overflow-hidden shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Thumbnail preview */}
        <div className="md:col-span-5 relative group overflow-hidden rounded-xl bg-black/60 aspect-video flex items-center justify-center border border-white/10">
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
            <Film className="w-12 h-12 text-indigo-400/60" />
          )}
          {metadata.duration && (
            <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded font-mono border border-white/20 flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" /> {metadata.duration}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {metadata.platform}
              </span>
              <span className="text-xs text-gray-400">
                {metadata.type || 'Media Item'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug line-clamp-2">
              {metadata.title}
            </h3>
            {metadata.creator && (
              <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-2">
                <User className="w-4 h-4 text-purple-400" />
                <span>{metadata.creator}</span>
              </p>
            )}
          </div>

          {metadata.notice && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-indigo-400 mt-0.5" />
              <span>{metadata.notice}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5 rounded-lg"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy URL'}</span>
            </button>
            <a
              href={metadata.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5 rounded-lg text-gray-300 hover:text-white"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Source</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
