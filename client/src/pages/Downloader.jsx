import React, { useState } from 'react';
import UrlInput from '../components/UrlInput';
import MediaPreview from '../components/MediaPreview';
import QualitySelector from '../components/QualitySelector';
import DownloadProgress from '../components/DownloadProgress';
import { useAnalyzeUrl, useStartDownload } from '../hooks/useDownloads';

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
    <div className="space-y-6 max-w-2xl mx-auto py-4">
      {/* Search Input Bar */}
      <UrlInput onAnalyze={handleAnalyze} isLoading={analyzeMutation.isPending} />

      {/* Progress / Success State */}
      {activeDownloadId && (
        <DownloadProgress
          downloadId={activeDownloadId}
          onComplete={() => {}}
        />
      )}

      {/* Preview Card */}
      {metadata && !activeDownloadId && (
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
    </div>
  );
}
