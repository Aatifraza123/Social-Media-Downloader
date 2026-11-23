import React, { useState } from 'react';
import { Layers, Play, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useBatchDownload } from '../hooks/useDownloads';
import { detectPlatform } from '../utils/platformDetector';
import toast from 'react-hot-toast';

export default function BatchDownloader() {
  const [text, setText] = useState('');
  const [urls, setUrls] = useState([]);
  const batchMutation = useBatchDownload();

  const handleParse = (e) => {
    e.preventDefault();
    const rawList = text
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const unique = Array.from(new Set(rawList)).slice(0, 20);
    const parsed = unique.map((u) => ({
      url: u,
      detected: detectPlatform(u),
    }));

    setUrls(parsed);
  };

  const handleRemove = (index) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleStartBatch = async () => {
    const validUrls = urls.filter((u) => u.detected).map((u) => u.url);
    if (validUrls.length === 0) {
      toast.error('No supported URLs detected');
      return;
    }
    await batchMutation.mutateAsync(validUrls);
    setText('');
    setUrls([]);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="minimal-card p-6">
        <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-1">
          <Layers className="w-4 h-4 text-zinc-500" />
          Batch Ingestion Queue
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Paste multiple URLs (one per line, up to 20 links). Supported: YouTube, Instagram, X.
        </p>

        <form onSubmit={handleParse} className="space-y-3">
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=...&#10;https://instagram.com/reel/...&#10;https://x.com/user/status/..."
            className="input-field font-mono text-xs p-3 leading-relaxed"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!text.trim()}
              className="btn-primary py-2 px-4 text-xs"
            >
              Parse Links
            </button>
            {urls.length > 0 && (
              <button
                type="button"
                onClick={() => setUrls([])}
                className="btn-secondary py-2 px-3 text-xs text-red-600 dark:text-red-400"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {urls.length > 0 && (
        <div className="minimal-card p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              Parsed Queue ({urls.length} items)
            </h3>
            <button
              onClick={handleStartBatch}
              disabled={batchMutation.isPending}
              className="btn-primary py-1.5 px-3.5 text-xs gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{batchMutation.isPending ? 'Queuing...' : 'Queue All Valid'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {urls.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden mr-2">
                  {item.detected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  )}
                  <span className="text-zinc-700 dark:text-zinc-300 font-mono truncate">{item.url}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.detected ? (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.detected.badgeClass}`}>
                      {item.detected.name}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                      Unsupported
                    </span>
                  )}
                  <button
                    onClick={() => handleRemove(idx)}
                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
