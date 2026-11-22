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

  const getStatusColor = () => {
    switch (data.status) {
      case 'completed': return 'from-emerald-500 to-teal-500';
      case 'failed': return 'from-red-500 to-rose-600';
      case 'cancelled': return 'from-gray-500 to-slate-600';
      default: return 'from-indigo-500 via-purple-500 to-pink-500';
    }
  };

  return (
    <div className="glass-card p-6 border-white/20 bg-navy-900/80 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {data.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : data.status === 'failed' ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : data.status === 'cancelled' ? (
            <XCircle className="w-5 h-5 text-gray-400" />
          ) : (
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          )}
          <span className="font-semibold text-white capitalize">Status: {data.status}</span>
        </div>
        <span className="text-sm font-mono text-indigo-300 font-bold">{data.progress || 0}%</span>
      </div>

      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getStatusColor()} transition-all duration-300`}
          style={{ width: `${data.progress || 5}%` }}
        />
      </div>

      {data.status === 'completed' && (
        <a
          href={downloadsAPI.getFileUrl(downloadId)}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
        >
          <Download className="w-4 h-4" /> Save File to Device
        </a>
      )}

      {data.error && (
        <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
          {data.error}
        </p>
      )}
    </div>
  );
}
