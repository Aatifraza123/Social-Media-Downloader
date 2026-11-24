import React, { useEffect, useState } from 'react';
import { List, Loader2, CheckCircle2, AlertTriangle, XCircle, Pause, X as CloseIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PlaylistProgress({ playlistId, onComplete }) {
  const [data, setData] = useState({
    status: 'pending',
    progress: 0,
    completedCount: 0,
    failedCount: 0,
    videoCount: 0,
  });

  useEffect(() => {
    if (!playlistId) return;

    const eventSource = new EventSource(`/api/playlists/${playlistId}/progress`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setData(payload);
        
        if (payload.status === 'completed') {
          eventSource.close();
          toast.success('Playlist download completed!');
          if (onComplete) onComplete();
        } else if (payload.status === 'failed') {
          eventSource.close();
          toast.error('Playlist download failed');
        }
      } catch (err) {
        console.error('SSE JSON error', err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [playlistId, onComplete]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel playlist download? Downloaded videos will be kept.')) {
      return;
    }

    try {
      const response = await fetch(`/api/playlists/${playlistId}/cancel`, {
        method: 'POST',
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Playlist download cancelled');
      }
    } catch (error) {
      toast.error('Failed to cancel');
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-zinc-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'completed':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'cancelled':
        return 'text-zinc-500';
      default:
        return 'text-purple-600 dark:text-purple-400';
    }
  };

  const getStatusLabel = () => {
    switch (data.status) {
      case 'completed':
        return 'Playlist Download Complete';
      case 'failed':
        return 'Playlist Download Failed';
      case 'cancelled':
        return 'Playlist Download Cancelled';
      case 'processing':
        return 'Downloading Playlist...';
      default:
        return 'Preparing Playlist...';
    }
  };

  return (
    <div className="minimal-card p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h4 className={`text-sm font-semibold ${getStatusColor()}`}>
              {getStatusLabel()}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {data.completedCount} of {data.videoCount} videos downloaded
              {data.failedCount > 0 && ` • ${data.failedCount} failed`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
            {data.progress}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 rounded-full"
          style={{ width: `${data.progress || 0}%` }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {data.videoCount}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
            Total
          </div>
        </div>

        <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50">
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {data.completedCount}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
            Done
          </div>
        </div>

        {data.failedCount > 0 && (
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50">
            <div className="text-lg font-bold text-red-700 dark:text-red-400">
              {data.failedCount}
            </div>
            <div className="text-[10px] text-red-600 dark:text-red-500 uppercase tracking-wider">
              Failed
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {data.status !== 'completed' && data.status !== 'failed' && data.status !== 'cancelled' && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleCancel}
            className="btn-secondary flex-1 py-2 gap-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <CloseIcon className="w-4 h-4" />
            <span>Cancel Download</span>
          </button>
        </div>
      )}

      {/* Completion Message */}
      {data.status === 'completed' && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
          <p className="text-sm text-emerald-700 dark:text-emerald-400 text-center">
            🎉 All videos have been downloaded successfully!
          </p>
        </div>
      )}

      {/* Failed Message */}
      {data.status === 'failed' && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
          <p className="text-sm text-red-700 dark:text-red-400 text-center">
            ⚠️ Playlist download failed. Check individual videos in history.
          </p>
        </div>
      )}
    </div>
  );
}
