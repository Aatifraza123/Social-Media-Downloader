import React, { useState } from 'react';
import { Layers, Play, CheckCircle2, AlertCircle, Trash2, Cpu, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useBatchDownload } from '../hooks/useDownloads';
import { detectPlatform } from '../utils/platformDetector';
import toast from 'react-hot-toast';

export default function BatchDownloader() {
  const [text, setText] = useState('');
  const [urls, setUrls] = useState([]);
  const [concurrency, setConcurrency] = useState(3);
  const batchMutation = useBatchDownload();

  const handleParse = (e) => {
    e.preventDefault();
    const rawList = text
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const unique = Array.from(new Set(rawList)).slice(0, 25);
    const parsed = unique.map((u) => ({
      url: u,
      detected: detectPlatform(u),
    }));

    setUrls(parsed);
  };

  const handleRemove = (index) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setUrls([]);
    setText('');
  };

  const handleStartBatch = async () => {
    const validUrls = urls.filter((u) => u.detected).map((u) => u.url);
    if (validUrls.length === 0) {
      toast.error('No supported platform URLs detected in queue');
      return;
    }
    await batchMutation.mutateAsync(validUrls);
    setText('');
    setUrls([]);
  };

  const youtubeCount = urls.filter((u) => u.detected?.platform === 'youtube').length;
  const instagramCount = urls.filter((u) => u.detected?.platform === 'instagram').length;
  const twitterCount = urls.filter((u) => u.detected?.platform === 'twitter').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* SaaS Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-brand-400" />
          Batch Ingestion Queue
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Queue up to 25 simultaneous video links. The VPS worker will transcode and store them autonomously.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Paste Media URLs
              </span>
              <span className="text-[11px] font-mono text-zinc-400">One URL per line</span>
            </div>

            <form onSubmit={handleParse} className="space-y-4">
              <textarea
                rows={7}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=...&#10;https://www.instagram.com/reel/...&#10;https://x.com/user/status/..."
                className="input-field font-mono text-xs p-3 leading-relaxed resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="btn-primary py-2 px-4 text-xs font-semibold gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Parse & Verify Links</span>
                </button>

                {text && (
                  <button
                    type="button"
                    onClick={() => setText('')}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Clear Text
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Concurrency Settings Tile */}
          <div className="saas-card p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-semibold text-white">VPS Worker Concurrency</span>
              </div>
              <span className="font-mono text-xs font-bold text-brand-300">
                {concurrency} Active Jobs
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3">
              Balanced for Hostinger VPS 2-core CPU without thermal or memory throttling.
            </p>
            <input
              type="range"
              min={1}
              max={5}
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
              <span>1 (Conservative)</span>
              <span>3 (Optimal)</span>
              <span>5 (Aggressive)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Queue Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="saas-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Parsed Queue ({urls.length})
              </h3>
              {urls.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-rose-400 hover:text-rose-300"
                >
                  Clear Queue
                </button>
              )}
            </div>

            {/* Platform breakdown badges */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="p-2 rounded-lg bg-surface-muted border border-surface-border">
                <span className="text-[10px] text-zinc-400 block">YouTube</span>
                <span className="text-sm font-bold text-white font-mono">{youtubeCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-surface-muted border border-surface-border">
                <span className="text-[10px] text-zinc-400 block">Instagram</span>
                <span className="text-sm font-bold text-white font-mono">{instagramCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-surface-muted border border-surface-border">
                <span className="text-[10px] text-zinc-400 block">X / Twitter</span>
                <span className="text-sm font-bold text-white font-mono">{twitterCount}</span>
              </div>
            </div>

            {/* URLs List */}
            {urls.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {urls.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-surface-muted border border-surface-border flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {item.detected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      )}
                      <span className="font-mono text-[11px] text-zinc-200 truncate">
                        {item.url}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemove(idx)}
                      className="text-zinc-500 hover:text-rose-400 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-surface-border rounded-lg">
                Queue is empty. Paste links on the left to begin.
              </div>
            )}

            <button
              onClick={handleStartBatch}
              disabled={urls.length === 0 || batchMutation.isPending}
              className="btn-primary w-full py-2.5 px-4 text-xs font-semibold gap-2 mt-4 shadow-glow-indigo disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>
                {batchMutation.isPending
                  ? 'Scheduling Worker Jobs...'
                  : `Ingest ${urls.length} Items to Vault`}
              </span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-surface-muted/40 border border-surface-border flex items-center gap-2.5 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Smart deduplication prevents redundant processing.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
