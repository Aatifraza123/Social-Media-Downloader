import React, { useState } from 'react';
import { Download, Film, Music, Check, Sparkles, HardDrive, ArrowDownToLine } from 'lucide-react';

export default function QualitySelector({ formats = [], onDownload, isDownloading }) {
  const [selectedFormat, setSelectedFormat] = useState(formats[0] || null);

  React.useEffect(() => {
    if (formats.length > 0 && !selectedFormat) {
      setSelectedFormat(formats[0]);
    }
  }, [formats, selectedFormat]);

  if (!formats || formats.length === 0) return null;

  const estimateSize = (fmt) => {
    if (fmt.filesize) {
      const mb = (fmt.filesize / (1024 * 1024)).toFixed(1);
      return `~${mb} MB`;
    }
    if (fmt.quality === '1080p') return '~42 MB';
    if (fmt.quality === '720p') return '~24 MB';
    if (fmt.quality === '480p') return '~14 MB';
    if (fmt.quality === '360p') return '~8 MB';
    if (fmt.format === 'mp3') return '~6 MB';
    return '~18 MB';
  };

  return (
    <div className="saas-card p-6 sm:p-7 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-indigo-500" />
            Select Output Stream & Quality
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Choose an available bitrate and container for direct VPS processing.
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.04] text-zinc-500 border border-zinc-200 dark:border-white/[0.08] self-start sm:self-auto">
          {formats.length} streams available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {formats.map((fmt) => {
          const isSelected = selectedFormat?.formatId === fmt.formatId;
          const isAudio = fmt.mediaType === 'audio' || fmt.format === 'mp3';

          return (
            <button
              key={fmt.formatId}
              type="button"
              onClick={() => setSelectedFormat(fmt)}
              className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'border-indigo-500 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20 text-zinc-900 dark:text-white shadow-sm'
                  : 'border-zinc-200 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-[#141519] hover:border-zinc-300 dark:hover:border-white/[0.16] text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isAudio
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                  }`}>
                    {isAudio ? <Music className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm leading-tight">{fmt.label || fmt.quality}</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5 uppercase tracking-wider">{fmt.format}</div>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {estimateSize(fmt)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-200/60 dark:border-white/[0.06] w-full text-zinc-400">
                <span>{isAudio ? '320kbps Audio' : (fmt.quality === '1080p' ? '60fps FHD' : 'Standard 30fps')}</span>
                <span className="font-mono text-[10px] text-indigo-500 font-semibold">{estimateSize(fmt)}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <button
          onClick={() => selectedFormat && onDownload(selectedFormat)}
          disabled={!selectedFormat || isDownloading}
          className="btn-primary w-full py-3.5 gap-2 text-sm font-semibold shadow-md shadow-indigo-500/15"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>{isDownloading ? 'Queuing on VPS...' : `Download ${selectedFormat?.label || 'Selected Stream'}`}</span>
        </button>
      </div>
    </div>
  );
}
