import React, { useEffect, useState, useRef } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Download, Sparkles } from 'lucide-react';
import { downloadsAPI } from '../services/api';

export default function DownloadProgress({ downloadId, onComplete }) {
  const [status, setStatus] = useState('downloading');
  const [progress, setProgress] = useState(15);
  const [errorMessage, setErrorMessage] = useState(null);
  const hasTriggeredDownload = useRef(false);

  useEffect(() => {
    if (!downloadId) return;

    let isClosed = false;

    // Helper: Trigger the actual file download via browser save
    const triggerFileDownload = () => {
      if (hasTriggeredDownload.current) return;
      hasTriggeredDownload.current = true;
      setStatus('completed');
      setProgress(100);

      // Trigger automatic file download
      setTimeout(async () => {
        try {
          await downloadsAPI.getFile(downloadId, 'downloaded-media');
        } catch (err) {
          console.error('Direct file trigger error:', err);
        }
      }, 300);

      if (onComplete) onComplete();
    };

    // 1. Live Server-Sent Events (SSE)
    const eventSource = new EventSource(`/api/downloads/${downloadId}/progress`, { withCredentials: true });

    eventSource.onmessage = (event) => {
      if (isClosed) return;
      try {
        const payload = JSON.parse(event.data);
        if (payload.progress) setProgress(payload.progress);

        if (payload.status === 'completed') {
          isClosed = true;
          eventSource.close();
          triggerFileDownload();
        } else if (payload.status === 'failed') {
          isClosed = true;
          eventSource.close();
          setStatus('failed');
          setErrorMessage(payload.error || 'Media conversion failed');
        } else if (payload.status) {
          setStatus(payload.status);
        }
      } catch (err) {
        console.error('SSE parsing error:', err);
      }
    };

    eventSource.onerror = () => {
      // If SSE disconnects, fallback polling will seamlessly take over
      eventSource.close();
    };

    // 2. Active Fallback Polling (Checks every 1 second in case SSE is blocked by proxy or completes fast)
    const pollInterval = setInterval(async () => {
      if (isClosed) {
        clearInterval(pollInterval);
        return;
      }
      try {
        const res = await downloadsAPI.getOne(downloadId);
        const data = res?.data;
        if (data) {
          if (data.progress) setProgress(data.progress);
          if (data.status === 'completed') {
            isClosed = true;
            clearInterval(pollInterval);
            eventSource.close();
            triggerFileDownload();
          } else if (data.status === 'failed') {
            isClosed = true;
            clearInterval(pollInterval);
            eventSource.close();
            setStatus('failed');
            setErrorMessage(data.error || 'Media conversion failed');
          }
        }
      } catch {
        // Continue polling
      }
    }, 1000);

    return () => {
      isClosed = true;
      clearInterval(pollInterval);
      eventSource.close();
    };
  }, [downloadId, onComplete]);

  const handleManualDownload = async () => {
    try {
      await downloadsAPI.getFile(downloadId, 'downloaded-media');
    } catch (err) {
      console.error('Manual download error:', err);
    }
  };

  return (
    <div className="clean-card p-6 sm:p-8 space-y-4 animate-slide-up">
      {/* Downloading / Transcoding State */}
      {status !== 'completed' && status !== 'failed' && (
        <div className="flex flex-col items-center justify-center gap-4 py-2">
          <div className="relative w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="absolute text-[11px] font-mono font-bold">{progress}%</span>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Preparing Your Download...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Extracting stream from platform and converting media. File will download automatically once ready.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md h-2 rounded-full bg-zinc-100 dark:bg-white/[0.06] overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success State */}
      {status === 'completed' && (
        <div className="flex flex-col items-center justify-center gap-4 py-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              Download Ready!
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Your file conversion completed successfully.
            </p>
          </div>

          <button
            onClick={handleManualDownload}
            className="btn-primary py-2.5 px-6 text-xs font-semibold gap-2 shadow-sm mt-2"
          >
            <Download className="w-4 h-4" />
            <span>Save to Device</span>
          </button>
        </div>
      )}

      {/* Failed State */}
      {status === 'failed' && (
        <div className="flex flex-col items-center justify-center gap-4 py-2">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">
              Download Failed
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {errorMessage || 'The server could not download this content. Please verify the URL.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
