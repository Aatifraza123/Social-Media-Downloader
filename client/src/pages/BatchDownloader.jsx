import React, { useState } from 'react';
import { Layers, Play, CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-react';
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
      toast.error('No valid supported URLs detected in batch');
      return;
    }
    await batchMutation.mutateAsync(validUrls);
    setText('');
    setUrls([]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-card p-6 sm:p-8 border-white/15 shadow-2xl">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2 mb-2">
          <Layers className="w-6 h-6 text-indigo-400" />
          Batch Ingestion Queue
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Paste multiple URLs (one per line, up to 20 links). Supported: YouTube, Instagram, X.
        </p>

        <form onSubmit={handleParse} className="space-y-4">
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=...&#10;https://instagram.com/reel/...&#10;https://x.com/user/status/..."
            className="input-field font-mono text-xs sm:text-sm bg-black/40 border-white/20 p-4"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!text.trim()}
              className="btn-secondary py-2.5 px-5 text-sm"
            >
              Parse Links
            </button>
            {urls.length > 0 && (
              <button
                type="button"
                onClick={() => setUrls([])}
                className="btn-secondary py-2.5 px-4 text-xs text-rose-400 hover:text-rose-300"
              >
                Clear List
              </button>
            )}
          </div>
        </form>
      </div>

      {urls.length > 0 && (
        <div className="glass-card p-6 border-white/15 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-base">
              Parsed Media Queue ({urls.length} items)
            </h3>
            <button
              onClick={handleStartBatch}
              disabled={batchMutation.isPending}
              className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>{batchMutation.isPending ? 'Queuing Batch...' : 'Queue All Valid Links'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {urls.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden mr-3">
                  {item.detected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  <span className="text-gray-200 font-mono truncate">{item.url}</span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {item.detected ? (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${item.detected.bgColor}`}>
                      {item.detected.name}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                      Unsupported
                    </span>
                  )}
                  <button
                    onClick={() => handleRemove(idx)}
                    className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400 transition-colors"
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
