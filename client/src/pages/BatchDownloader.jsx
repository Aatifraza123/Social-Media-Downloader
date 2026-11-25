import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Layers, Plus, X, Trash2, Play, Loader2, CheckCircle2,
  AlertCircle, Download, RotateCcw, FileVideo, FileAudio, Image,
} from 'lucide-react';
import { mediaAPI, downloadsAPI } from '../services/api';
import { detectPlatform } from '../utils/platformDetector';
import toast from 'react-hot-toast';

const PLATFORM_COLORS = {
  youtube: 'text-red-500',
  instagram: 'text-pink-500',
  twitter: 'text-sky-500',
};

const PLATFORM_LABELS = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  twitter: 'X',
};

function StatusBadge({ status }) {
  const map = {
    queued: { label: 'Queued', cls: 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 dark:text-zinc-400' },
    analyzing: { label: 'Analyzing', cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    downloading: { label: 'Downloading', cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    completed: { label: 'Done', cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    failed: { label: 'Failed', cls: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' },
    unsupported: { label: 'Unsupported', cls: 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-400' },
  };
  const { label, cls } = map[status] || map.queued;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {status === 'downloading' && <Loader2 className="w-2.5 h-2.5 animate-spin mr-1" />}
      {label}
    </span>
  );
}

function QueueItem({ item, onRemove, onDownloadFile, onRetry }) {
  const platformColor = PLATFORM_COLORS[item.platform] || 'text-zinc-400';
  const platformLabel = PLATFORM_LABELS[item.platform] || 'Unknown';

  return (
    <div className="clean-card p-3.5 flex flex-col gap-2">
      {/* Row 1: URL + Platform + Status + Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {item.platform && (
              <span className={`text-[10px] font-bold uppercase tracking-wider ${platformColor}`}>
                {platformLabel}
              </span>
            )}
            <StatusBadge status={item.status} />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 font-mono truncate" title={item.url}>
            {item.title || item.url}
          </p>
          {item.title && item.title !== item.url && (
            <p className="text-[10px] text-zinc-400 font-mono truncate mt-0.5" title={item.url}>
              {item.url}
            </p>
          )}
          {item.error && (
            <p className="text-[10px] text-rose-500 mt-1">{item.error}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {item.status === 'completed' && (
            <button
              onClick={() => onDownloadFile(item)}
              className="btn-primary py-1 px-2.5 text-[10px] gap-1"
            >
              <Download className="w-3 h-3" />
              Save
            </button>
          )}
          {item.status === 'failed' && (
            <button
              onClick={() => onRetry(item)}
              className="btn-secondary py-1 px-2.5 text-[10px] gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          )}
          {(item.status === 'queued' || item.status === 'unsupported' || item.status === 'completed' || item.status === 'failed') && (
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar for active downloads */}
      {(item.status === 'downloading' || item.status === 'analyzing') && (
        <div className="w-full h-1 rounded-full bg-zinc-100 dark:bg-white/[0.06] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              item.status === 'analyzing' ? 'bg-amber-500' : 'bg-blue-500'
            }`}
            style={{ width: `${item.progress || (item.status === 'analyzing' ? 30 : 10)}%` }}
          />
        </div>
      )}
    </div>
  );
}

let nextId = 1;

export default function BatchDownloader() {
  const [inputText, setInputText] = useState('');
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const pollingRefs = useRef(new Map());

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      pollingRefs.current.forEach(clearInterval);
      pollingRefs.current.clear();
    };
  }, []);

  // Add URLs to queue
  const handleAddUrls = useCallback(() => {
    const rawList = inputText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (rawList.length === 0) return;

    const existingUrls = new Set(queue.map((q) => q.url));
    const newItems = [];

    for (const url of rawList) {
      if (existingUrls.has(url)) continue;
      existingUrls.add(url);

      const detected = detectPlatform(url);
      newItems.push({
        id: nextId++,
        url,
        platform: detected?.platform || null,
        status: detected ? 'queued' : 'unsupported',
        title: null,
        downloadId: null,
        progress: 0,
        error: null,
      });
    }

    if (newItems.length === 0) {
      toast('All URLs already in queue', { icon: '⚠️' });
      return;
    }

    setQueue((prev) => [...prev, ...newItems].slice(0, 25));
    setInputText('');
    toast.success(`${newItems.length} link${newItems.length > 1 ? 's' : ''} added`);
  }, [inputText, queue]);

  // Remove from queue
  const handleRemove = useCallback((id) => {
    // Clear any polling for this item
    if (pollingRefs.current.has(id)) {
      clearInterval(pollingRefs.current.get(id));
      pollingRefs.current.delete(id);
    }
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }, []);

  // Clear all
  const handleClearAll = useCallback(() => {
    pollingRefs.current.forEach(clearInterval);
    pollingRefs.current.clear();
    setQueue([]);
    setInputText('');
    setIsProcessing(false);
  }, []);

  // Update a single queue item
  const updateItem = useCallback((id, updates) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  }, []);

  // Start polling for a download's progress
  const startPolling = useCallback((itemId, downloadId) => {
    if (pollingRefs.current.has(itemId)) return;

    const sse = new EventSource(`/api/downloads/${downloadId}/progress`, { withCredentials: true });

    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.progress) {
          updateItem(itemId, { progress: payload.progress });
        }
        if (payload.status === 'completed') {
          sse.close();
          pollingRefs.current.delete(itemId);
          updateItem(itemId, { status: 'completed', progress: 100 });
          // Auto-trigger browser download
          setTimeout(async () => {
            try { await downloadsAPI.getFile(downloadId, 'media'); } catch {}
          }, 200);
        } else if (payload.status === 'failed') {
          sse.close();
          pollingRefs.current.delete(itemId);
          updateItem(itemId, { status: 'failed', error: payload.error || 'Download failed' });
        }
      } catch {}
    };

    sse.onerror = () => {
      sse.close();
      // Fallback to HTTP polling
      const poll = setInterval(async () => {
        try {
          const res = await downloadsAPI.getOne(downloadId);
          const data = res?.data;
          if (!data) return;
          if (data.progress) updateItem(itemId, { progress: data.progress });
          if (data.status === 'completed') {
            clearInterval(poll);
            pollingRefs.current.delete(itemId);
            updateItem(itemId, { status: 'completed', progress: 100 });
            setTimeout(async () => {
              try { await downloadsAPI.getFile(downloadId, 'media'); } catch {}
            }, 200);
          } else if (data.status === 'failed') {
            clearInterval(poll);
            pollingRefs.current.delete(itemId);
            updateItem(itemId, { status: 'failed', error: data.error || 'Download failed' });
          }
        } catch {}
      }, 1500);
      pollingRefs.current.set(itemId, poll);
    };

    pollingRefs.current.set(itemId, sse);
  }, [updateItem]);

  // Process a single item
  const processItem = useCallback(async (item) => {
    updateItem(item.id, { status: 'analyzing', progress: 10 });

    try {
      // 1. Analyze to get metadata/title
      const analyzeResult = await mediaAPI.analyze(item.url);
      const meta = analyzeResult?.data;
      const title = meta?.title || item.url;

      updateItem(item.id, { title, progress: 30 });

      // 2. Start download (best quality by default)
      const downloadResult = await mediaAPI.download({
        url: item.url,
        platform: item.platform,
        format: 'mp4',
        quality: 'best',
      });

      const downloadId = downloadResult?.data?.downloadId;
      if (!downloadId) throw new Error('No download ID received');

      updateItem(item.id, { status: 'downloading', downloadId, progress: 40 });

      // 3. Start SSE / polling to track progress
      startPolling(item.id, downloadId);
    } catch (err) {
      updateItem(item.id, {
        status: 'failed',
        error: err.message || 'Processing failed',
      });
    }
  }, [updateItem, startPolling]);

  // Start batch processing
  const handleStartBatch = useCallback(async () => {
    const validItems = queue.filter((q) => q.status === 'queued');
    if (validItems.length === 0) {
      toast.error('No queued items to process');
      return;
    }

    setIsProcessing(true);

    // Process sequentially with small delay to avoid overwhelming server
    for (const item of validItems) {
      await processItem(item);
      // Small stagger between starting items
      await new Promise((r) => setTimeout(r, 300));
    }

    setIsProcessing(false);
  }, [queue, processItem]);

  // Retry a failed item
  const handleRetry = useCallback(async (item) => {
    updateItem(item.id, { status: 'queued', error: null, progress: 0, downloadId: null });
    // Process immediately
    await processItem({ ...item, status: 'queued' });
  }, [updateItem, processItem]);

  // Download completed file
  const handleDownloadFile = useCallback(async (item) => {
    if (!item.downloadId) return;
    try {
      await downloadsAPI.getFile(item.downloadId, `${item.title || 'media'}.mp4`);
    } catch {
      toast.error('Failed to download file');
    }
  }, []);

  // Stats
  const queuedCount = queue.filter((q) => q.status === 'queued').length;
  const activeCount = queue.filter((q) => q.status === 'downloading' || q.status === 'analyzing').length;
  const doneCount = queue.filter((q) => q.status === 'completed').length;
  const failedCount = queue.filter((q) => q.status === 'failed').length;

  const stats = [
    { label: 'Queued', value: queuedCount, color: 'text-zinc-500 dark:text-zinc-400' },
    { label: 'Active', value: activeCount, color: 'text-blue-500' },
    { label: 'Done', value: doneCount, color: 'text-emerald-500' },
    { label: 'Failed', value: failedCount, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-5 max-w-3xl mx-auto py-2">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-zinc-400" />
          Batch Download
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Add up to 25 URLs — they'll be processed and downloaded automatically.
        </p>
      </div>

      {/* Add URLs Section */}
      <div className="clean-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Add Links
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            {queue.length}/25 slots used
          </span>
        </div>

        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleAddUrls();
            }
          }}
          placeholder={"Paste one URL per line…\nhttps://youtube.com/watch?v=...\nhttps://instagram.com/reel/...\nhttps://x.com/.../status/..."}
          className="input-field font-mono text-xs p-3 leading-relaxed resize-none"
          disabled={queue.length >= 25}
        />

        <div className="flex items-center justify-between">
          <button
            onClick={handleAddUrls}
            disabled={!inputText.trim() || queue.length >= 25}
            className="btn-primary py-1.5 px-3.5 text-xs font-semibold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add to Queue
          </button>

          <span className="text-[10px] text-zinc-400">
            Ctrl+Enter to add
          </span>
        </div>
      </div>

      {/* Stats Row */}
      {queue.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="clean-card p-2.5 text-center">
              <div className={`text-base font-bold font-mono ${s.color}`}>
                {s.value}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Queue Items */}
      {queue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Queue ({queue.length})
            </span>

            <div className="flex items-center gap-3">
              {doneCount > 0 && doneCount === queue.length && (
                <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All complete
                </span>
              )}

              <button
                onClick={handleClearAll}
                className="text-[11px] text-zinc-400 hover:text-rose-500 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
            {queue.map((item) => (
              <QueueItem
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onDownloadFile={handleDownloadFile}
                onRetry={handleRetry}
              />
            ))}
          </div>

          {/* Start Button */}
          {queuedCount > 0 && (
            <button
              onClick={handleStartBatch}
              disabled={isProcessing}
              className="btn-primary w-full py-2.5 text-xs font-semibold gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing {activeCount} of {queuedCount + activeCount}…
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Download {queuedCount} Item{queuedCount > 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {queue.length === 0 && (
        <div className="clean-card p-8 text-center space-y-2">
          <div className="flex justify-center gap-3 text-zinc-300 dark:text-zinc-600">
            <FileVideo className="w-6 h-6" />
            <FileAudio className="w-6 h-6" />
            <Image className="w-6 h-6" />
          </div>
          <p className="text-xs text-zinc-400">
            Paste YouTube, Instagram, or X links above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
