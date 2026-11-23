import React, { useState } from 'react';
import UrlInput from '../components/UrlInput';
import MediaPreview from '../components/MediaPreview';
import QualitySelector from '../components/QualitySelector';
import DownloadProgress from '../components/DownloadProgress';
import { useAnalyzeUrl, useStartDownload } from '../hooks/useDownloads';
import { ShieldCheck, Zap, DownloadCloud, Sparkles } from 'lucide-react';

export default function Downloader() {
  const [metadata, setMetadata] = useState(null);
  const [activeDownloadId, setActiveDownloadId] = useState(null);

  const analyzeMutation = useAnalyzeUrl();
  const downloadMutation = useStartDownload();

  const handleAnalyze = async (url) => {
    setActiveDownloadId(null);
    const result = await analyzeMutation.mutateAsync(url);
    if (result?.success) {
      setMetadata(result.data);
    }
  };

  const handleDownload = async (formatOption) => {
    if (!metadata) return;
    const result = await downloadMutation.mutateAsync({
      url: metadata.originalUrl,
      platform: metadata.platform,
      format: formatOption.format,
      quality: formatOption.quality,
    });

    if (result?.success && result.data?.downloadId) {
      setActiveDownloadId(result.data.downloadId);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Main Input Component */}
      <UrlInput onAnalyze={handleAnalyze} isLoading={analyzeMutation.isPending} />

      {/* Media Preview Card */}
      {metadata && (
        <MediaPreview metadata={metadata} />
      )}

      {/* Quality Options */}
      {metadata && metadata.availableFormats?.length > 0 && !activeDownloadId && (
        <QualitySelector
          formats={metadata.availableFormats}
          onDownload={handleDownload}
          isDownloading={downloadMutation.isPending}
        />
      )}

      {/* Live Stream / Ingestion Progress */}
      {activeDownloadId && (
        <DownloadProgress
          downloadId={activeDownloadId}
          onComplete={() => {}}
        />
      )}

      {/* Feature Highlights Grid (Clean Minimal) */}
      {!metadata && !activeDownloadId && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-zinc-200/80 dark:border-white/[0.06]">
          <div className="clean-card p-4 sm:p-5 text-center sm:text-left">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 mx-auto sm:mx-0">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Instant Conversion</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Downloads and formats are prepared directly on the high-speed server without lag.
            </p>
          </div>

          <div className="clean-card p-4 sm:p-5 text-center sm:text-left">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 mx-auto sm:mx-0">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Multiple Resolutions</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Choose from 1080p Full HD, 720p, 480p, or extract pure high-bitrate MP3 audio.
            </p>
          </div>

          <div className="clean-card p-4 sm:p-5 text-center sm:text-left">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 mx-auto sm:mx-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">No Login Required</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Publicly accessible for everyone on any browser, phone, or desktop device.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
