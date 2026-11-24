import React, { useState } from 'react';
import { Download, Film, Music, Check, Sparkles, HardDrive, ArrowDownToLine, Video, Headphones } from 'lucide-react';

export default function QualitySelector({ formats = [], onDownload, isDownloading }) {
  const [selectedFormat, setSelectedFormat] = useState(formats[0] || null);

  React.useEffect(() => {
    if (formats.length > 0 && !selectedFormat) {
      setSelectedFormat(formats[0]);
    }
  }, [formats, selectedFormat]);

  if (!formats || formats.length === 0) return null;

  const formatBytes = (bytes) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const estimateSize = (fmt) => {
    // Check both filesize and fileSize (backend might send either)
    const size = fmt.fileSize || fmt.filesize;
    if (size) {
      return formatBytes(size);
    }
    
    // Fallback: Show approximate size estimates
    if (fmt.mediaType === 'audio' || fmt.format === 'mp3' || fmt.format === 'm4a') {
      return '~5-8 MB';
    }
    
    // Video size estimates based on quality
    const quality = fmt.quality || fmt.label || '';
    if (quality.includes('4320') || quality.includes('8K')) return '~800 MB';
    if (quality.includes('2160') || quality.includes('4K')) return '~400 MB';
    if (quality.includes('1440') || quality.includes('2K')) return '~250 MB';
    if (quality.includes('1080')) return '~150 MB';
    if (quality.includes('720')) return '~85 MB';
    if (quality.includes('480')) return '~45 MB';
    if (quality.includes('360')) return '~25 MB';
    if (quality.includes('240')) return '~15 MB';
    if (quality.includes('144')) return '~8 MB';
    
    return '~50 MB';
  };

  const getQualityBadge = (fmt) => {
    const isAudio = fmt.mediaType === 'audio' || fmt.format === 'mp3';
    
    if (isAudio) {
      // Audio quality badges
      if (fmt.quality && fmt.quality.includes('192')) return '192kbps';
      if (fmt.quality && fmt.quality.includes('256')) return '256kbps';
      if (fmt.quality && fmt.quality.includes('320')) return '320kbps';
      return '128kbps';
    }
    
    // Video quality badges
    const quality = fmt.quality || fmt.label || '';
    if (quality.includes('8K') || quality.includes('4320')) return '8K UHD';
    if (quality.includes('4K') || quality.includes('2160')) return '4K UHD';
    if (quality.includes('1440')) return '2K QHD';
    if (quality.includes('1080')) return 'Full HD';
    if (quality.includes('720')) return 'HD Ready';
    if (quality.includes('480')) return 'SD';
    if (quality.includes('360')) return 'Low';
    if (quality.includes('240')) return 'Mobile';
    if (quality.includes('144')) return 'Minimal';
    return 'Standard';
  };

  const getFormatLabel = (fmt) => {
    const isAudio = fmt.mediaType === 'audio' || fmt.format === 'mp3';
    
    if (isAudio) {
      return fmt.label || `MP3 Audio`;
    }
    
    return fmt.label || fmt.quality || 'Video';
  };

  // Separate formats into video and audio
  const videoFormats = formats.filter(fmt => fmt.mediaType !== 'audio' && fmt.format !== 'mp3');
  const audioFormats = formats.filter(fmt => fmt.mediaType === 'audio' || fmt.format === 'mp3');

  return (
    <div className="clean-card p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Select Quality & Format
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Choose your preferred quality and format - all files processed on high-speed servers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
            {formats.length} Available
          </span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Video Formats Column */}
        {videoFormats.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/80 dark:border-white/[0.06]">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h5 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Video Formats
              </h5>
              <span className="text-xs text-zinc-400 ml-auto">
                {videoFormats.length} options
              </span>
            </div>
            
            <div className="space-y-2">
              {videoFormats.map((fmt) => {
                const isSelected = selectedFormat?.formatId === fmt.formatId;
                const sizeInfo = estimateSize(fmt);
                
                return (
                  <button
                    key={fmt.formatId}
                    type="button"
                    onClick={() => setSelectedFormat(fmt)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all relative group ${
                      isSelected
                        ? 'border-blue-500 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-zinc-200 dark:border-white/[0.08] bg-white/50 dark:bg-zinc-900/50 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-sm text-zinc-900 dark:text-white">
                            {getFormatLabel(fmt)}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide ${
                            isSelected 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-zinc-200 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {getQualityBadge(fmt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span className="uppercase font-mono">{fmt.format || 'mp4'}</span>
                          {sizeInfo && (
                            <>
                              <span className="text-zinc-300 dark:text-zinc-700">•</span>
                              <span className="font-semibold">{sizeInfo}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Audio Formats Column */}
        {audioFormats.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/80 dark:border-white/[0.06]">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h5 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Audio Only
              </h5>
              <span className="text-xs text-zinc-400 ml-auto">
                {audioFormats.length} options
              </span>
            </div>
            
            <div className="space-y-2">
              {audioFormats.map((fmt) => {
                const isSelected = selectedFormat?.formatId === fmt.formatId;
                const sizeInfo = estimateSize(fmt);
                
                return (
                  <button
                    key={fmt.formatId}
                    type="button"
                    onClick={() => setSelectedFormat(fmt)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all relative group ${
                      isSelected
                        ? 'border-purple-500 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-500/10 ring-2 ring-purple-500/20 shadow-sm'
                        : 'border-zinc-200 dark:border-white/[0.08] bg-white/50 dark:bg-zinc-900/50 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/30 dark:hover:bg-purple-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-sm text-zinc-900 dark:text-white">
                            {getFormatLabel(fmt)}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide ${
                            isSelected 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-zinc-200 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {getQualityBadge(fmt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span className="uppercase font-mono">{fmt.format || 'mp3'}</span>
                          {sizeInfo && (
                            <>
                              <span className="text-zinc-300 dark:text-zinc-700">•</span>
                              <span className="font-semibold">{sizeInfo}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Download Button */}
      <div className="pt-3 border-t border-zinc-200/80 dark:border-white/[0.06]">
        <button
          onClick={() => selectedFormat && onDownload(selectedFormat)}
          disabled={!selectedFormat || isDownloading}
          className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            selectedFormat?.mediaType === 'audio' || selectedFormat?.format === 'mp3'
              ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25 disabled:from-zinc-400 disabled:to-zinc-400 disabled:shadow-none'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 disabled:from-zinc-400 disabled:to-zinc-400 disabled:shadow-none'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>
            {isDownloading 
              ? 'Processing on Server...' 
              : `Download ${selectedFormat?.label || selectedFormat?.quality || 'File'}`
            }
          </span>
        </button>
        
        {selectedFormat && estimateSize(selectedFormat) && (
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Estimated file size: <span className="font-semibold">{estimateSize(selectedFormat)}</span>
          </p>
        )}
      </div>
    </div>
  );
}
