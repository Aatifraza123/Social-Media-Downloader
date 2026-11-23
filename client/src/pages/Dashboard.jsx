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
  youtube: '#ef4444',
  instagram: '#ec4899',
  twitter: '#0ea5e9',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time analytics and storage telemetry for this private downloader instance.
          </p>
        </div>
        <Link to="/downloader" className="btn-primary py-2 px-3.5 text-xs gap-1.5 self-start sm:self-auto">
          <Download className="w-3.5 h-3.5" />
          <span>New Download</span>
        </Link>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="minimal-card p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">Total Media</span>
              <Activity className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{stats.total}</div>
            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>{stats.downloadsToday} today</span>
            </div>
          </div>

          <div className="minimal-card p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{stats.completed}</div>
            <div className="text-xs text-zinc-500 mt-1">
              {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% success rate` : 'All systems operational'}
            </div>
          </div>

          <div className="minimal-card p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">Storage Consumed</span>
              <HardDrive className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{stats.storageUsedFormatted}</div>
            <div className="text-xs text-zinc-500 mt-1">Local disk usage</div>
          </div>

          <div className="minimal-card p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">Failed / Cancelled</span>
              <XCircle className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{stats.failed}</div>
            <div className="text-xs text-zinc-500 mt-1">Restricted or timed out</div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 minimal-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Download Volume (Last 30 Days)
            </h3>
            <span className="text-[11px] text-zinc-400">Total jobs per day</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={downloadsOverTime}>
                <defs>
                  <linearGradient id="minimalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#f4f4f5' }}
                />
                <Area type="monotone" dataKey="count" stroke="#71717a" strokeWidth={1.5} fillOpacity={1} fill="url(#minimalGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 minimal-card p-5 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Platform Distribution</h3>
          <div className="h-44 w-full flex items-center justify-center">
            {platformDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformDistribution}
                    dataKey="count"
                    nameKey="platform"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={36}
                    strokeWidth={2}
                  >
                    {platformDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.platform] || '#71717a'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#f4f4f5' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-zinc-400">No platform activity yet</div>
            )}
          </div>
          <div className="flex justify-around text-xs text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> YouTube</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Instagram</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500"></span> X</span>
          </div>
        </div>
      </div>

      {/* Recent Downloads Table */}
      <div className="minimal-card overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Film className="w-4 h-4 text-zinc-400" />
            Recent Activity
          </h3>
          <Link to="/history" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 font-medium">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
            <thead className="text-[11px] font-medium text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Media Title</th>
                <th className="py-2.5 px-4 font-medium">Platform</th>
                <th className="py-2.5 px-4 font-medium">Format</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {(recentDownloads?.data || []).slice(0, 5).map((item) => (
                <tr key={item._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                    {item.title}
                  </td>
                  <td className="py-3 px-4 capitalize">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-mono">
                      {item.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4 uppercase text-[11px] font-mono text-zinc-500">
                    {item.format} ({item.quality})
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      item.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                        : item.status === 'failed'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-400 font-mono text-[11px]">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!recentDownloads?.data || recentDownloads?.data?.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-zinc-400">
                    No download records yet.
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
