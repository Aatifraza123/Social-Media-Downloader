import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Download, ExternalLink, Play, Sparkles } from 'lucide-react';
import { downloadsAPI } from '../services/api';

const SIMPLE_STEPS = ['Preparing', 'Processing', 'Downloading', 'Complete'];

export default function DownloadProgress({ downloadId, onComplete }) {
  const [data, setData] = useState({ status: 'pending', progress: 10, fileSize: 0, downloadedBytes: 0 });

  useEffect(() => {
    if (!downloadId) return;

    const eventSource = new EventSource(`/api/downloads/${downloadId}/progress`, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('Progress update:', payload); // Debug log
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

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending':
      case 'validating': return 0;
      case 'processing': return 1;
      case 'downloading': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Starting...';
      case 'validating': return 'Preparing';
      case 'processing': return 'Processing';
      case 'downloading': return 'Downloading';
      case 'completed': return 'Ready!';
      case 'failed': return 'Failed';
      default: return 'Processing';
    }
  };

  const currentStep = getStepIndex(data.status);
  const formatBytes = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="clean-card p-6 space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {data.status === 'completed' ? (
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : data.status === 'failed' ? (
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
          <div>
            <span className="text-base font-bold text-zinc-900 dark:text-white">
              {getStatusText(data.status)}
            </span>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {data.fileSize > 0 ? (
                `File size: ${formatBytes(data.fileSize)}`
              ) : data.status === 'completed' ? (
                'Download complete!'
              ) : (
                'Processing your download...'
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(data.progress || 0)}%
          </span>
          {data.downloadedBytes && data.fileSize && data.downloadedBytes > 0 && data.fileSize > 0 && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {formatBytes(data.downloadedBytes)} / {formatBytes(data.fileSize)}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${data.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Simple Stage Indicators */}
      <div className="grid grid-cols-4 gap-3 pt-2">
        {SIMPLE_STEPS.map((step, idx) => {
          const isPassed = currentStep > idx;
          const isCurrent = currentStep === idx;
          return (
            <div key={`step-${idx}`} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 font-bold ${
                isPassed
                  ? 'bg-emerald-500 text-white'
                  : isCurrent
                  ? 'bg-blue-500 text-white animate-pulse'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
              }`}>
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                ) : (
                  <span className="text-xs">{idx + 1}</span>
                )}
              </div>
              <span className={`text-xs font-medium text-center leading-tight ${
                isPassed 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : isCurrent 
                  ? 'text-blue-600 dark:text-blue-400 font-bold' 
                  : 'text-zinc-400'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {data.status === 'completed' && (
        <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-zinc-200/80 dark:border-white/[0.06]">
          <a
            href={downloadsAPI.getFileUrl(downloadId)}
            className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download File</span>
          </a>
        </div>
      )}

      {data.error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold mb-1">Download Failed</div>
            <div className="text-xs opacity-90">{data.error}</div>
          </div>
        </div>
      )}
    </div>
  );
}
