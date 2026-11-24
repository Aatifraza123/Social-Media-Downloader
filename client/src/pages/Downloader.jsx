import React, { useState } from 'react';
import UrlInput from '../components/UrlInput';
import MediaPreview from '../components/MediaPreview';
import QualitySelector from '../components/QualitySelector';
import DownloadProgress from '../components/DownloadProgress';
import SubtitleDownloader from '../components/SubtitleDownloader';
import PlaylistAnalyzer from '../components/PlaylistAnalyzer';
import PlaylistProgress from '../components/PlaylistProgress';
import FeaturesShowcase from '../components/FeaturesShowcase';
import { useAnalyzeUrl, useStartDownload } from '../hooks/useDownloads';
import { ShieldCheck, Zap, DownloadCloud, Sparkles } from 'lucide-react';

export default function Downloader() {
  const [metadata, setMetadata] = useState(null);
  const [activeDownloadId, setActiveDownloadId] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isPlaylist, setIsPlaylist] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState(null);

  const analyzeMutation = useAnalyzeUrl();
  const downloadMutation = useStartDownload();

  const handleAnalyze = async (url) => {
    setActiveDownloadId(null);
    setActivePlaylistId(null);
    setCurrentUrl(url);
    
    // Check if it's a playlist
    const playlistPattern = /[?&]list=([^&]+)/i;
    if (playlistPattern.test(url)) {
      setIsPlaylist(true);
      setMetadata(null);
      return;
    }
    
    setIsPlaylist(false);
    const result = await analyzeMutation.mutateAsync(url);
    if (result?.success) {
      setMetadata(result.data);
    }
  };

  const handleDownload = async (formatOption) => {
    if (!metadata) return;
    
    console.log('Download request:', {
      url: metadata.originalUrl,
      platform: metadata.platform,
      format: formatOption.format,
      quality: formatOption.quality,
      formatOption: formatOption
    });
    
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

  const handlePlaylistDownload = (playlistId) => {
    setActivePlaylistId(playlistId);
    setMetadata(null);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Main Input Component */}
      <UrlInput onAnalyze={handleAnalyze} isLoading={analyzeMutation.isPending} />

      {/* Playlist Analyzer */}
      {isPlaylist && !activePlaylistId && (
        <PlaylistAnalyzer url={currentUrl} onPlaylistDownload={handlePlaylistDownload} />
      )}

      {/* Playlist Progress */}
      {activePlaylistId && (
        <PlaylistProgress playlistId={activePlaylistId} onComplete={() => {}} />
      )}

      {/* Media Preview Card */}
      {metadata && !isPlaylist && (
        <MediaPreview metadata={metadata} />
      )}

      {/* Quality Options */}
      {metadata && metadata.availableFormats?.length > 0 && !activeDownloadId && !isPlaylist && (
        <>
          <QualitySelector
            formats={metadata.availableFormats}
            onDownload={handleDownload}
            isDownloading={downloadMutation.isPending}
          />
          
          {/* Subtitle Downloader (only for YouTube videos) */}
          {metadata.platform === 'youtube' && (
            <SubtitleDownloader videoUrl={metadata.originalUrl} />
          )}
        </>
      )}

      {/* Live Stream / Ingestion Progress */}
      {activeDownloadId && !activePlaylistId && (
        <DownloadProgress
          downloadId={activeDownloadId}
          onComplete={() => {}}
        />
      )}

      {/* Features Showcase - Comprehensive Features List */}
      {!metadata && !activeDownloadId && !isPlaylist && !activePlaylistId && (
        <div className="pt-6 border-t border-zinc-200/80 dark:border-white/[0.06]">
          <FeaturesShowcase />
        </div>
      )}
    </div>
  );
}
