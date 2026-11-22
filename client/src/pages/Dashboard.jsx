import React from 'react';
import { useDashboardStats, useDashboardCharts, useDownloadsList } from '../hooks/useDownloads';
import { SkeletonStats } from '../components/ui/SkeletonLoader';
import {
  Download, HardDrive, CheckCircle2, XCircle, ArrowUpRight,
  TrendingUp, Activity, Film
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Link } from 'react-router-dom';

const PLATFORM_COLORS = {
  youtube: '#EF4444',
  instagram: '#EC4899',
  twitter: '#38BDF8',
};

export default function Dashboard() {
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: chartData } = useDashboardCharts();
  const { data: recentDownloads } = useDownloadsList({ limit: 5 });

  const stats = statsData?.data || {
    total: 0,
    completed: 0,
    failed: 0,
    storageUsedFormatted: '0 Bytes',
    downloadsToday: 0,
    downloadsThisMonth: 0,
  };

  const downloadsOverTime = chartData?.data?.downloadsOverTime || [];
  const platformDistribution = chartData?.data?.platformDistribution || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
            System Overview
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time analytics and storage telemetry for this private downloader instance.
          </p>
        </div>
        <Link to="/downloader" className="btn-primary py-2.5 px-5 flex items-center gap-2 text-sm self-start sm:self-auto">
          <Download className="w-4 h-4" />
          <span>New Download</span>
        </Link>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 border-white/10 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between text-gray-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Ingested</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-display">{stats.total}</div>
            <div className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats.downloadsToday} processed today</span>
            </div>
          </div>

          <div className="glass-card p-5 border-white/10 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between text-gray-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-display">{stats.completed}</div>
            <div className="text-xs text-emerald-400 mt-1">
              {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% success rate` : '100% operational'}
            </div>
          </div>

          <div className="glass-card p-5 border-white/10 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between text-gray-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Disk Storage</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-display">{stats.storageUsedFormatted}</div>
            <div className="text-xs text-purple-400 mt-1">Local VPS storage</div>
          </div>

          <div className="glass-card p-5 border-white/10 hover:border-rose-500/30 transition-all">
            <div className="flex items-center justify-between text-gray-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Failed / Cancelled</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-display">{stats.failed}</div>
            <div className="text-xs text-rose-400 mt-1">Rate limits or restrictions</div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card p-6 border-white/10">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Downloads Timeline (30 Days)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={downloadsOverTime}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f0d2e', borderColor: '#3730a3', borderRadius: '8px' }}
                  itemStyle={{ color: '#e0e7ff' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-6 border-white/10 flex flex-col justify-between">
          <h3 className="text-base font-semibold text-white mb-4">Platform Distribution</h3>
          <div className="h-48 w-full flex items-center justify-center">
            {platformDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformDistribution}
                    dataKey="count"
                    nameKey="platform"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={40}
                  >
                    {platformDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.platform] || '#818cf8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f0d2e', borderColor: '#3730a3', borderRadius: '8px' }}
                    itemStyle={{ color: '#e0e7ff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-gray-500">No platform activity recorded yet</div>
            )}
          </div>
          <div className="flex justify-around text-xs text-gray-400 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> YouTube</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Instagram</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> X (Twitter)</span>
          </div>
        </div>
      </div>

      {/* Recent Downloads Table */}
      <div className="glass-card p-6 border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-indigo-400" />
            Recent Activity
          </h3>
          <Link to="/history" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold">
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Media</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(recentDownloads?.data || []).slice(0, 5).map((item) => (
                <tr key={item._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-medium text-white truncate max-w-xs">
                    {item.title}
                  </td>
                  <td className="py-3 px-4 capitalize text-xs">
                    <span className="px-2 py-0.5 rounded bg-white/10 font-mono">
                      {item.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4 uppercase text-xs font-mono text-gray-400">
                    {item.format} ({item.quality})
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      item.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : item.status === 'failed'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!recentDownloads?.data || recentDownloads?.data?.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                    No download jobs yet. Paste your first URL in the Downloader tab!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
