import React, { useState } from 'react';
import {
  useDownloadsList, useDeleteDownload, useRetryDownload
} from '../hooks/useDownloads';
import { downloadsAPI } from '../services/api';
import {
  Download, Trash2, RotateCcw, Search, Film, Music, CheckCircle2,
  AlertTriangle, Clock, Filter, ExternalLink
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Download History
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your past and active media download jobs stored on the server.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or URL..."
            className="input-field pl-9 py-2 text-sm bg-black/40 border-white/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="input-field py-2 px-3 text-xs w-auto bg-navy-900 border-white/15"
          >
            <option value="all">All Platforms</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">X (Twitter)</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field py-2 px-3 text-xs w-auto bg-navy-900 border-white/15"
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
      <div className="glass-card border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Title & Source</th>
                <th className="py-3.5 px-4">Platform</th>
                <th className="py-3.5 px-4">Format</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {downloads.map((item) => (
                <tr key={item._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-semibold text-white truncate">{item.title}</div>
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5 truncate max-w-xs"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{item.originalUrl}</span>
                    </a>
                  </td>

                  <td className="py-3 px-4 capitalize text-xs">
                    <span className="px-2 py-0.5 rounded bg-white/10 font-mono">
                      {item.platform}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-xs font-mono text-gray-300 uppercase">
                    {item.format} • {item.quality}
                  </td>

                  <td className="py-3 px-4 text-xs">
                    <span className={`px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 ${
                      item.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'failed'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}>
                      {item.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      {item.status === 'failed' && <AlertTriangle className="w-3 h-3" />}
                      <span className="capitalize">{item.status}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status === 'completed' && (
                        <a
                          href={downloadsAPI.getFileUrl(item._id)}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Save to local device"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      {(item.status === 'failed' || item.status === 'cancelled') && (
                        <button
                          onClick={() => retryMutation.mutate(item._id)}
                          className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                          title="Retry download"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(item._id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Delete record and media"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {downloads.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                    No media downloads found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10 text-xs text-gray-400">
            <span>Page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30"
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
