import React, { useState } from 'react';
import { Download, Film, Music, CheckCircle2 } from 'lucide-react';

export default function QualitySelector({ formats = [], onDownload, isDownloading }) {
  const [selectedFormat, setSelectedFormat] = useState(formats[0] || null);

  React.useEffect(() => {
    if (formats.length > 0 && !selectedFormat) {
      setSelectedFormat(formats[0]);
    }
  }, [formats, selectedFormat]);

  if (!formats || formats.length === 0) return null;

  return (
    <div className="glass-card p-6 border-white/15 bg-navy-900/50 shadow-xl space-y-4">
      <h4 className="text-base font-semibold text-white flex items-center gap-2">
        <Film className="w-5 h-5 text-indigo-400" />
        Select Format & Resolution
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {formats.map((fmt) => {
          const isSelected = selectedFormat?.formatId === fmt.formatId;
          const isAudio = fmt.mediaType === 'audio' || fmt.format === 'mp3';

          return (
            <button
              key={fmt.formatId}
              type="button"
              onClick={() => setSelectedFormat(fmt)}
              className={`p-4 rounded-xl border text-left transition-all relative flex items-center justify-between ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 text-white'
                  : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${isAudio ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  {isAudio ? <Music className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-semibold text-sm">{fmt.label || fmt.quality}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">{fmt.format}</div>
                </div>
              </div>

              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <button
          onClick={() => selectedFormat && onDownload(selectedFormat)}
          disabled={!selectedFormat || isDownloading}
          className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>{isDownloading ? 'Queuing Download...' : `Download ${selectedFormat?.label || 'Selected Format'}`}</span>
        </button>
      </div>
    </div>
  );
}
