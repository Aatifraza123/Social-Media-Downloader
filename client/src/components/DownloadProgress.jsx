import React, { useEffect, useState, useRef } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { downloadsAPI } from '../services/api';
import toast from 'react-hot-toast';

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

      toast.success('Download started');

      setTimeout(async () => {
        try {
          await downloadsAPI.getFile(downloadId, 'media');
        } catch (err) {
          console.error(err);
        }
      }, 100);

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

  // If completed, do not render any "Download Ready / Save to Device" prompt
  if (status === 'completed') {
    return null;
  }

  return (
    <div className="clean-card p-4 text-center space-y-2.5">
      {status !== 'failed' ? (
        <div className="space-y-2 py-1">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
            <span>Downloading... ({progress}%)</span>
          </div>

          <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-zinc-100 dark:bg-white/[0.08] overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1 py-1">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{errorMessage || 'Failed to download'}</span>
          </div>
          <p className="text-[11px] text-zinc-400">Please verify the link and try again</p>
        </div>
      )}
    </div>
  );
}
