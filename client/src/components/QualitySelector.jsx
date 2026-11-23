import React, { useState } from 'react';
import { Download, Film, Music, Check } from 'lucide-react';

export default function QualitySelector({ formats = [], onDownload, isDownloading }) {
  const [selectedFormat, setSelectedFormat] = useState(formats[0] || null);

  React.useEffect(() => {
    if (formats.length > 0 && !selectedFormat) {
      setSelectedFormat(formats[0]);
    }
  }, [formats, selectedFormat]);

  if (!formats || formats.length === 0) return null;

  return (
    <div className="minimal-card p-5 sm:p-6 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Film className="w-4 h-4 text-zinc-500" />
          Available Formats & Resolutions
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Select an available media stream to download to your device.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {formats.map((fmt) => {
          const isSelected = selectedFormat?.formatId === fmt.formatId;
          const isAudio = fmt.mediaType === 'audio' || fmt.format === 'mp3';

          return (
            <button
              key={fmt.formatId}
              type="button"
              onClick={() => setSelectedFormat(fmt)}
              className={`p-3.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 ring-1 ring-zinc-900 dark:ring-zinc-100 text-zinc-900 dark:text-zinc-100'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center flex-shrink-0">
                  {isAudio ? <Music className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-medium text-xs sm:text-sm">{fmt.label || fmt.quality}</div>
                  <div className="text-[11px] text-zinc-500 uppercase tracking-wider">{fmt.format}</div>
                </div>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <button
          onClick={() => selectedFormat && onDownload(selectedFormat)}
          disabled={!selectedFormat || isDownloading}
          className="btn-primary w-full py-3 gap-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Processing...' : `Download ${selectedFormat?.label || 'Selected Media'}`}</span>
        </button>
      </div>
    </div>
  );
}
