import React, { useState } from 'react';
import {
  useDownloadsList, useDeleteDownload, useRetryDownload
} from '../hooks/useDownloads';
import { downloadsAPI } from '../services/api';
import {
  Download, Trash2, RotateCcw, Search, Filter, Play,
  Film, LayoutGrid, List, X, ExternalLink, HardDrive, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function History() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [status, setStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [page, setPage] = useState(1);
  const [previewMedia, setPreviewMedia] = useState(null);

  const { data: response, isLoading } = useDownloadsList({
    page,
    limit: 12,
    platform: platform !== 'all' ? platform : undefined,
    status: status !== 'all' ? status : undefined,
    search: search.trim() || undefined,
  });

  const deleteMutation = useDeleteDownload();
  const retryMutation = useRetryDownload();

  const downloads = response?.data || [];
  const pagination = response?.pagination || { page: 1, pages: 1, total: 0 };

  const handleDownloadFile = async (item) => {
    try {
      toast.loading('Streaming file to browser...', { id: 'stream-file' });
      await downloadsAPI.getFile(item._id, `${item.title}.${item.format}`);
      toast.success('Download complete', { id: 'stream-file' });
    } catch (err) {
      toast.error('File retrieval failed', { id: 'stream-file' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this media record from storage and database?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Media Ingestion Vault
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Browse, preview in-browser, stream, and manage your private media repository.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-card border border-surface-border rounded-xl self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="saas-card p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or URL..."
            className="input-field pl-9 py-2 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-zinc-400 mr-1">
            <Filter className="w-3.5 h-3.5 text-brand-400" />
            <span>Filter:</span>
          </div>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="input-field py-2 px-3 text-xs w-auto bg-surface-muted"
          >
            <option value="all">All Channels</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">X (Twitter)</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field py-2 px-3 text-xs w-auto bg-surface-muted"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="downloading">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Media Vault Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {downloads.map((item) => (
            <div
              key={item._id}
              className="saas-card group overflow-hidden flex flex-col justify-between border-surface-border hover:border-brand-500/50 transition-all duration-200"
            >
              {/* Media Card Thumbnail Preview */}
              <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-600 gap-2">
                    <Film className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-[11px] font-mono uppercase">{item.format}</span>
                  </div>
                )}

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-wider border border-white/10">
                    {item.platform}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-brand-300 text-[10px] font-mono uppercase border border-brand-500/30">
                    {item.quality}
                  </span>
                </div>

                {/* Quick Play Overlay Button */}
                <button
                  onClick={() => setPreviewMedia(item)}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-glow-indigo opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-200"
                >
                  <Play className="w-5 h-5 ml-0.5 fill-white" />
                </button>
              </div>

              {/* Card Meta Body */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1 group-hover:text-brand-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    {item.format.toUpperCase()} • {item.fileSizeFormatted || 'Calculating'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-surface-border flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                      item.status === 'completed'
                        ? 'text-emerald-400'
                        : item.status === 'failed'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {item.status}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {item.status === 'completed' && (
                      <button
                        onClick={() => handleDownloadFile(item)}
                        className="btn-primary py-1 px-2.5 text-xs gap-1"
                        title="Download file to device"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    )}
                    {item.status === 'failed' && (
                      <button
                        onClick={() => retryMutation.mutate(item._id)}
                        className="btn-secondary py-1 px-2 text-xs text-amber-400"
                        title="Retry processing"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-surface-muted/60 border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Quality</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {downloads.map((item) => (
                  <tr key={item._id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white max-w-sm truncate">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4 uppercase font-mono text-[11px] text-zinc-400">
                      {item.platform}
                    </td>
                    <td className="py-3.5 px-4 uppercase font-mono text-[11px] text-brand-300">
                      {item.quality} ({item.format})
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                      {item.fileSizeFormatted || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          item.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewMedia(item)}
                          className="p-1.5 rounded-lg bg-surface-muted hover:bg-zinc-800 text-brand-400 border border-surface-border"
                          title="Stream in-browser"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        {item.status === 'completed' && (
                          <button
                            onClick={() => handleDownloadFile(item)}
                            className="p-1.5 rounded-lg bg-surface-muted hover:bg-zinc-800 text-zinc-200 border border-surface-border"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {downloads.length === 0 && !isLoading && (
        <div className="saas-card p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center text-zinc-400 mb-3 border border-surface-border">
            <Film className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-semibold text-white">No media records found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mt-1">
            No downloads match your query or filters. Ingest a new video to populate your vault.
          </p>
        </div>
      )}

      {/* In-Browser Video Player Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="saas-card max-w-3xl w-full overflow-hidden border-surface-border shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-surface-border bg-surface-card">
              <div className="truncate pr-4">
                <h4 className="text-sm font-semibold text-white truncate">{previewMedia.title}</h4>
                <p className="text-[11px] text-zinc-400 uppercase font-mono">
                  {previewMedia.platform} • {previewMedia.quality} • {previewMedia.format}
                </p>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center">
              {previewMedia.format === 'mp3' ? (
                <div className="p-8 text-center space-y-4">
                  <Film className="w-12 h-12 text-brand-400 mx-auto" />
                  <audio controls className="w-80 max-w-full">
                    <source src={`/api/downloads/${previewMedia._id}/file`} type="audio/mpeg" />
                    Your browser does not support audio playback.
                  </audio>
                </div>
              ) : (
                <video
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  src={`/api/downloads/${previewMedia._id}/file`}
                >
                  Your browser does not support video playback.
                </video>
              )}
            </div>

            <div className="p-4 bg-surface-muted/40 border-t border-surface-border flex items-center justify-between">
              <span className="text-xs text-zinc-400">Direct streaming from Hostinger VPS</span>
              <button
                onClick={() => handleDownloadFile(previewMedia)}
                className="btn-primary py-2 px-4 text-xs gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Save to Device</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
