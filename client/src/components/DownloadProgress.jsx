import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Download, ExternalLink, Play, Sparkles } from 'lucide-react';
import { downloadsAPI } from '../services/api';

const STEPS = ['Pending', 'Validating', 'Processing', 'Downloading', 'Completed'];

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

  const getStepIndex = (status) => {
    switch (status) {
      case 'validating': return 1;
      case 'processing': return 2;
      case 'downloading': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(data.status);

  return (
    <div className="saas-card p-6 sm:p-7 space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {data.status === 'completed' ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : data.status === 'failed' ? (
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
          <div>
            <span className="text-sm font-bold text-zinc-900 dark:text-white capitalize">
              {data.status === 'completed' ? 'Processing Complete' : `Pipeline Status: ${data.status}`}
            </span>
            <div className="text-xs text-zinc-500">
              Job ID: <span className="font-mono text-[11px]">{downloadId.slice(-8)}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-mono font-bold text-indigo-500">
            {data.progress || 0}%
          </span>
          <div className="text-[10px] text-zinc-400 font-mono">Realtime SSE</div>
        </div>
      </div>

      {/* Pipeline Stage Indicators */}
      <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
        {['Validating', 'Transcoding', 'Ingesting', 'Ready'].map((step, idx) => {
          const isPassed = currentStep >= idx + 1;
          const isCurrent = currentStep === idx;
          return (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${
                isPassed
                  ? 'bg-emerald-500'
                  : isCurrent
                  ? 'bg-indigo-500 animate-pulse'
                  : 'bg-zinc-200 dark:bg-white/[0.08]'
              }`} />
              <span className={`font-medium truncate ${
                isPassed ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? 'text-indigo-500 font-bold' : 'text-zinc-400'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {data.status === 'completed' && (
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <a
            href={downloadsAPI.getFileUrl(downloadId)}
            className="btn-primary flex-1 py-3 gap-2 text-sm justify-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
          >
            <Download className="w-4 h-4" />
            <span>Save Media File to Device</span>
          </a>
        </div>
      )}

      {data.error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{data.error}</span>
        </div>
      )}
    </div>
  );
}
