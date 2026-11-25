import React, { useEffect, useState, useRef } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { downloadsAPI } from '../services/api';

export default function DownloadProgress({ downloadId, onComplete }) {
  const [status, setStatus] = useState('downloading');
  const [progress, setProgress] = useState(25);
  const [errorMessage, setErrorMessage] = useState(null);
  const hasTriggeredDownload = useRef(false);

  useEffect(() => {
    if (!downloadId) return;

    let isClosed = false;

    const triggerFileDownload = () => {
      if (hasTriggeredDownload.current) return;
      hasTriggeredDownload.current = true;
      setStatus('completed');
      setProgress(100);

      setTimeout(async () => {
        try {
          await downloadsAPI.getFile(downloadId, 'media');
        } catch (err) {
          console.error(err);
        }
      }, 200);

      if (onComplete) onComplete();
    };

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
          setErrorMessage(payload.error || 'Download failed');
        } else if (payload.status) {
          setStatus(payload.status);
        }
      } catch (err) {
        console.error(err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

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
            setErrorMessage(data.error || 'Download failed');
          }
        }
      } catch {}
    }, 1000);

    return () => {
      isClosed = true;
      clearInterval(pollInterval);
      eventSource.close();
    };
  }, [downloadId, onComplete]);

  const handleManualDownload = async () => {
    try {
      await downloadsAPI.getFile(downloadId, 'media');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="clean-card p-5 text-center space-y-3">
      {status !== 'completed' && status !== 'failed' && (
        <div className="space-y-3 py-2">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span>Downloading... ({progress}%)</span>
          </div>

          <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-zinc-100 dark:bg-white/[0.08] overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div className="space-y-3 py-2">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Download Ready!</span>
          </div>

          <button
            onClick={handleManualDownload}
            className="btn-primary py-2 px-4 text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save to Device</span>
          </button>
        </div>
      )}

      {status === 'failed' && (
        <div className="space-y-2 py-2">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-rose-500">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMessage || 'Failed to download'}</span>
          </div>
          <p className="text-xs text-zinc-400">Please verify the link and try again</p>
        </div>
      )}
    </div>
  );
}
