import React, { useState } from 'react';
import { List, Download, Loader2, AlertCircle, Play, Clock, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PlaylistAnalyzer({ url, onPlaylistDownload }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [playlistData, setPlaylistData] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState('720p');
  const [selectedFormat, setSelectedFormat] = useState('mp4');

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/playlists/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPlaylistData(result.data);
        toast.success(`Found ${result.data.videoCount} videos in playlist`);
      } else {
        toast.error(result.message || 'Failed to analyze playlist');
      }
    } catch (error) {
      toast.error('Error analyzing playlist');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadPlaylist = async () => {
    if (!playlistData) return;

    try {
      const response = await fetch('/api/playlists/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          format: selectedFormat,
          quality: selectedQuality,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Playlist download started!');
        onPlaylistDownload(result.data.playlistId);
      } else {
        toast.error(result.message || 'Failed to start playlist download');
      }
    } catch (error) {
      toast.error('Error starting playlist download');
      console.error(error);
    }
  };

  const qualityOptions = [
    { value: '2160p', label: '4K (2160p)', size: '~350 MB/video' },
    { value: '1440p', label: '2K (1440p)', size: '~150 MB/video' },
    { value: '1080p', label: 'Full HD (1080p)', size: '~80 MB/video' },
    { value: '720p', label: 'HD (720p)', size: '~25 MB/video' },
    { value: '480p', label: 'SD (480p)', size: '~15 MB/video' },
    { value: '360p', label: 'Low (360p)', size: '~8 MB/video' },
  ];

  if (!playlistData) {
    return (
      <div className="minimal-card p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <List className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Playlist Detected
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              This appears to be a playlist URL. Click below to analyze and download all videos.
            </p>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="btn-primary w-full py-2.5 gap-2 text-sm"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Playlist...</span>
            </>
          ) : (
            <>
              <List className="w-4 h-4" />
              <span>Analyze Playlist</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Playlist Info Card */}
      <div className="minimal-card p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <List className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
              {playlistData.title}
            </h3>
            {playlistData.uploader && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                by {playlistData.uploader}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                <span>{playlistData.videoCount} videos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>{playlistData.estimatedSizeFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5" />
            Select Video Quality
          </label>
          <select
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value)}
            className="input-field py-2.5 text-sm"
          >
            {qualityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.size}
              </option>
            ))}
          </select>
        </div>

        {/* Format Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedFormat('mp4')}
            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
              selectedFormat === 'mp4'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Video (MP4)
          </button>
          <button
            onClick={() => setSelectedFormat('mp3')}
            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
              selectedFormat === 'mp3'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Audio Only (MP3)
          </button>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownloadPlaylist}
          className="btn-primary w-full py-3 gap-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Download All {playlistData.videoCount} Videos</span>
        </button>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Large playlists may take significant time and storage space. Estimated size: <strong>{playlistData.estimatedSizeFormatted}</strong>
          </p>
        </div>
      </div>

      {/* Video List Preview */}
      <div className="minimal-card p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Videos in Playlist
          </h4>
          <span className="text-xs text-zinc-500">
            Showing first 5 of {playlistData.videoCount}
          </span>
        </div>

        <div className="space-y-2">
          {playlistData.videos.slice(0, 5).map((video, index) => (
            <div
              key={video.id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50"
            >
              <span className="text-xs font-mono text-zinc-400 w-6 text-center">
                {index + 1}
              </span>
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt=""
                  className="w-16 h-9 rounded object-cover bg-zinc-200 dark:bg-zinc-800"
                />
              ) : (
                <div className="w-16 h-9 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                  <Play className="w-4 h-4 text-zinc-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {video.title}
                </p>
                {video.duration && (
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {playlistData.videoCount > 5 && (
          <p className="text-xs text-center text-zinc-500 pt-2">
            + {playlistData.videoCount - 5} more videos
          </p>
        )}
      </div>
    </div>
  );
}
