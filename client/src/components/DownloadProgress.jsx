import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { downloadsAPI } from '../services/api';

export default function DownloadProgress({ downloadId, onComplete }) {
  const [data, setData] = useState({ status: 'pending', progress: 0, fileSize: 0, downloadedBytes: 0 });

  useEffect(() => {
    if (!downloadId) return;

    const eventSource = new EventSource(`/api/downloads/${downloadId}/progress`, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setData(payload);
        if (payload.status === 'completed' || payload.status === 'failed') {
          eventSource.close();
          if (payload.status === 'completed' && onComplete) {
            onComplete();
          }
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
  }, [downloadId, onComplete]);

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Starting download...';
      case 'validating': return 'Preparing download...';
      case 'processing': return 'Processing video...';
      case 'downloading': return 'Downloading...';
      case 'completed': return 'Download complete!';
      case 'failed': return 'Download failed';
      default: return 'Processing...';
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const percentage = Math.round(data.progress || 0);

  return (
    <div className="clean-card p-6 space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {data.status === 'completed' ? (
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : data.status === 'failed' ? (
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {getStatusText(data.status)}
            </h3>
            {data.fileSize > 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatBytes(data.downloadedBytes)} / {formatBytes(data.fileSize)}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Download Button (when complete) */}
      {data.status === 'completed' && (
        <button
          onClick={() => downloadsAPI.getFile(downloadId, 'video.mp4')}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
        >
          <Download className="w-5 h-5" />
          Download File
        </button>
      )}

      {/* Error Message */}
      {data.status === 'failed' && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            Download failed. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}
