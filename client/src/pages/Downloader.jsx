import React, { useState } from 'react';
import UrlInput from '../components/UrlInput';
import MediaPreview from '../components/MediaPreview';
import QualitySelector from '../components/QualitySelector';
import DownloadProgress from '../components/DownloadProgress';
import PremiumContent from '../components/PremiumContent';
import { useAnalyzeUrl, useStartDownload } from '../hooks/useDownloads';

export default function Downloader() {
  const [metadata, setMetadata] = useState(null);
  const [activeDownloadId, setActiveDownloadId] = useState(null);
  const [activeFormatKey, setActiveFormatKey] = useState(null);

  const analyzeMutation = useAnalyzeUrl();
  const downloadMutation = useStartDownload();

  const handleAnalyze = async (url) => {
    setActiveDownloadId(null);
    setActiveFormatKey(null);
    const result = await analyzeMutation.mutateAsync(url);
    if (result?.success) {
      setMetadata(result.data);
    }
  };

  const handleDownload = async (formatOption) => {
    if (!metadata) return;

    const key = formatOption.formatId || `${formatOption.quality}-${formatOption.format}`;
    setActiveFormatKey(key);

    try {
      const result = await downloadMutation.mutateAsync({
        url: metadata.originalUrl,
        platform: metadata.platform,
        format: formatOption.format,
        quality: formatOption.quality,
      });

      if (result?.success && result.data?.downloadId) {
        setActiveDownloadId(result.data.downloadId);
      }
    } finally {
      setActiveFormatKey(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Search Input Bar (Centered & prominent) */}
      <div className="max-w-2xl mx-auto">
        <UrlInput onAnalyze={handleAnalyze} isLoading={analyzeMutation.isPending} />
      </div>

      {/* Progress State */}
      {activeDownloadId && (
        <div className="max-w-2xl mx-auto">
          <DownloadProgress
            downloadId={activeDownloadId}
            onComplete={() => {
              setActiveDownloadId(null);
            }}
          />
        </div>
      )}

      {/* Preview Card */}
      {metadata && !activeDownloadId && (
        <div className="max-w-2xl mx-auto">
          <MediaPreview metadata={metadata} />
        </div>
      )}

      {/* Quality Options */}
      {metadata && metadata.availableFormats?.length > 0 && !activeDownloadId && (
        <div className="max-w-2xl mx-auto">
          <QualitySelector
            formats={metadata.availableFormats}
            onDownload={handleDownload}
            isDownloading={downloadMutation.isPending}
            activeFormatKey={activeFormatKey}
          />
        </div>
      )}

      {/* Premium SaaS Landing Features & Showcase Content */}
      <PremiumContent />
    </div>
  );
}
