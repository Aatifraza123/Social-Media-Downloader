import React, { useState } from 'react';
import {
  useDownloadsList, useDeleteDownload, useRetryDownload
} from '../hooks/useDownloads';
import { downloadsAPI } from '../services/api';
import {
  Download, Trash2, RotateCcw, Search, Filter, Play,
  Film, X, CheckCircle2, ShieldCheck, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function History() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [previewMedia, setPreviewMedia] = useState(null);

  const { data: response, isLoading } = useDownloadsList({
    page,
    limit: 15,
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
      toast.loading('Downloading file to device...', { id: 'stream-file' });
      await downloadsAPI.getFile(item._id, `${item.title}.${item.format}`);
      toast.success('Download ready', { id: 'stream-file' });
    } catch {
      toast.error('File retrieval failed', { id: 'stream-file' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this download log from database?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Recent Downloads
            </h1>
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Audit logs, preview streams, and manage media history.
          </p>
        </div>

        <div className="text-xs text-zinc-400 font-mono self-start sm:self-auto">
          Total items: <span className="font-bold text-zinc-900 dark:text-zinc-100">{pagination.total || 0}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="clean-card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="input-field pl-9 py-2 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-xs text-zinc-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="input-field py-2 px-3 text-xs w-auto bg-zinc-50 dark:bg-[#16171d]"
          >
            <option value="all">All Platforms</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">X (Twitter)</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field py-2 px-3 text-xs w-auto bg-zinc-50 dark:bg-[#16171d]"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="downloading">In Progress</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Clean Minimal List Only */}
      <div className="clean-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-[#15161d] border-b border-zinc-200/80 dark:border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Media</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Quality / Format</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-white/[0.06]">
              {downloads.map((item) => (
                <tr key={item._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 max-w-xs sm:max-w-md truncate">
                    <div className="flex items-center gap-3">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt=""
                          className="w-10 h-7 rounded object-cover flex-shrink-0 bg-zinc-800"
                        />
                      ) : (
                        <div className="w-10 h-7 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <Film className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                      )}
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 uppercase font-mono text-[11px] text-zinc-500">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/[0.06]">
                      {item.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                    {item.quality} • {item.format?.toUpperCase()}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                    {item.fileSizeFormatted || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        item.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : item.status === 'failed'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewMedia(item)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors"
                        title="Stream media"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>

                      {item.status === 'completed' && (
                        <button
                          onClick={() => handleDownloadFile(item)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors"
                          title="Save file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {item.status === 'failed' && (
                        <button
                          onClick={() => retryMutation.mutate(item._id)}
                          className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors"
                          title="Retry"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {downloads.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-zinc-400">
                    No download records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Simple Pagination */}
        {pagination.pages > 1 && (
          <div className="p-3 border-t border-zinc-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Video Streaming Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="clean-card max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-zinc-200/80 dark:border-white/[0.08]">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate pr-4">
                {previewMedia.title}
              </h4>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                controls
                autoPlay
                className="w-full h-full object-contain"
                src={`/api/downloads/${previewMedia._id}/file`}
              >
                Your browser does not support video playback.
              </video>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-[#15161c] flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">
                {previewMedia.format?.toUpperCase()} • {previewMedia.quality}
              </span>
              <button
                onClick={() => handleDownloadFile(previewMedia)}
                className="btn-primary py-1.5 px-3 text-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
