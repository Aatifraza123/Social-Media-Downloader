import React, { useState } from 'react';
import {
  useDownloadsList, useDeleteDownload, useRetryDownload
} from '../hooks/useDownloads';
import { downloadsAPI } from '../services/api';
import {
  Download, Trash2, RotateCcw, Search, Filter, ExternalLink,
  CheckCircle2, AlertTriangle
} from 'lucide-react';

export default function History() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Download Records
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Access, redownload, or delete media saved to local server storage.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="minimal-card p-3 sm:p-4 flex flex-col md:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or URL..."
            className="input-field pl-8 py-1.5 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-zinc-400 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </div>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="input-field py-1.5 px-2.5 text-xs w-auto"
          >
            <option value="all">All Platforms</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">X (Twitter)</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field py-1.5 px-2.5 text-xs w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="downloading">Downloading</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="minimal-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
            <thead className="text-[11px] font-medium text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Title & Source</th>
                <th className="py-2.5 px-4 font-medium">Platform</th>
                <th className="py-2.5 px-4 font-medium">Format</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {downloads.map((item) => (
                <tr key={item._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.title}</div>
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1 mt-0.5 truncate max-w-xs font-mono"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{item.originalUrl}</span>
                    </a>
                  </td>

                  <td className="py-3 px-4 capitalize">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-mono">
                      {item.platform}
                    </span>
                  </td>

                  <td className="py-3 px-4 uppercase text-[11px] font-mono text-zinc-500">
                    {item.format} • {item.quality}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium inline-flex items-center gap-1 ${
                      item.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                        : item.status === 'failed'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                    }`}>
                      {item.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      {item.status === 'failed' && <AlertTriangle className="w-3 h-3 text-red-500" />}
                      <span className="capitalize">{item.status}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'completed' && (
                        <a
                          href={downloadsAPI.getFileUrl(item._id)}
                          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                          title="Save to local device"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {(item.status === 'failed' || item.status === 'cancelled') && (
                        <button
                          onClick={() => retryMutation.mutate(item._id)}
                          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                          title="Retry download"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(item._id)}
                        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors"
                        title="Delete record and media"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {downloads.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-zinc-400">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
            <span>Page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
