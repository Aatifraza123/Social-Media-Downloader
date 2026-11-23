import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Download } from 'lucide-react';
import { downloadsAPI } from '../services/api';

export default function DownloadProgress({ downloadId, onComplete }) {
  const [data, setData] = useState({ status: 'pending', progress: 10 });

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

  return (
    <div className="minimal-card p-5 sm:p-6 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {data.status === 'completed' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : data.status === 'failed' ? (
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          ) : data.status === 'cancelled' ? (
            <XCircle className="w-4 h-4 text-zinc-500" />
          ) : (
            <Loader2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400 animate-spin" />
          )}
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
            {data.status === 'completed' ? 'Download Ready' : `Status: ${data.status}`}
          </span>
        </div>
        <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400">
          {data.progress || 0}%
        </span>
      </div>

      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 rounded-full"
          style={{ width: `${data.progress || 5}%` }}
        />
      </div>

      {data.status === 'completed' && (
        <a
          href={downloadsAPI.getFileUrl(downloadId)}
          className="btn-primary w-full py-2.5 gap-2 text-sm mt-2"
        >
          <Download className="w-4 h-4" />
          <span>Save File to Device</span>
        </a>
      )}

      {data.error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200 dark:border-red-900/50">
          {data.error}
        </p>
      )}
    </div>
  );
}
