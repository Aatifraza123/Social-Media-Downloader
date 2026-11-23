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
    <div className="minimal-card p-5 sm:p-6 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Thumbnail preview */}
        <div className="md:col-span-5 relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 aspect-video flex items-center justify-center">
          {metadata.thumbnail ? (
            <img
              src={metadata.thumbnail}
              alt={metadata.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <Film className="w-8 h-8 text-zinc-400" />
          )}
          {metadata.duration && (
            <span className="absolute bottom-2 right-2 bg-zinc-900/80 text-white text-[11px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" /> {metadata.duration}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="md:col-span-7 flex flex-col justify-between h-full space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {metadata.platform}
              </span>
              <span className="text-xs text-zinc-500">
                {metadata.type || 'Media Item'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
              {metadata.title}
            </h3>
            {metadata.creator && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{metadata.creator}</span>
              </p>
            )}
          </div>

          {metadata.notice && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-zinc-500 mt-0.5" />
              <span>{metadata.notice}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
            <a
              href={metadata.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
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
