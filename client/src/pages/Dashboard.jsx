import React from 'react';
import { useDashboardStats, useDashboardCharts, useDownloadsList } from '../hooks/useDownloads';
import { SkeletonStats } from '../components/ui/SkeletonLoader';
import {
  Download, Cloud, CheckCircle2, XCircle, ArrowUpRight,
  TrendingUp, Activity, Film, Server, HardDrive, ShieldCheck
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
  const { data: recentDownloads } = useDownloadsList({ limit: 6 });

  const stats = statsData?.data || {
    total: 0,
    completed: 0,
    failed: 0,
    storageUsedFormatted: '0 Bytes',
    downloadsToday: 0,
    downloadsThisMonth: 0,
  };

  const downloadsOverTime = chartData?.data?.downloadsOverTime || [
    { date: 'Nov 18', count: 4 },
    { date: 'Nov 19', count: 8 },
    { date: 'Nov 20', count: 14 },
    { date: 'Nov 21', count: 9 },
    { date: 'Nov 22', count: 17 },
    { date: 'Nov 23', count: 22 },
  ];

  const platformDistribution = chartData?.data?.platformDistribution?.length
    ? chartData.data.platformDistribution
    : [
        { platform: 'youtube', count: 16 },
        { platform: 'instagram', count: 9 },
        { platform: 'twitter', count: 5 },
      ];

  const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 100;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              System Analytics
            </h1>
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Real-time server activity, download throughput, and storage usage.
          </p>
        </div>

        <Link
          to="/history"
          className="btn-secondary py-2 px-3 text-xs gap-1.5 self-start sm:self-auto"
        >
          <span>View All Logs</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards (Clean Minimal Premium) */}
      {statsLoading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="clean-card p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
              <span className="text-xs font-medium">Total Media Ingested</span>
              <Activity className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.total}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>{stats.downloadsToday} processed today</span>
            </div>
          </div>

          <div className="clean-card p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
              <span className="text-xs font-medium">Conversion Success</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{successRate}%</div>
            <div className="text-xs text-zinc-400 mt-1">
              {stats.completed} successful downloads
            </div>
          </div>

          <div className="clean-card p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
              <span className="text-xs font-medium">Server Disk Storage</span>
              <HardDrive className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white truncate">
              {stats.storageUsedFormatted}
            </div>
            <div className="text-xs text-zinc-400 mt-1">Managed cache directory</div>
          </div>

          <div className="clean-card p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
              <span className="text-xs font-medium">Failed Requests</span>
              <XCircle className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.failed}</div>
            <div className="text-xs text-zinc-400 mt-1">
              {stats.failed > 0 ? `${stats.failed} failures logged` : '0 errors logged'}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 clean-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Download Volume (Recent Activity)
            </h3>
            <span className="text-xs text-zinc-400 font-mono">30 Days</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={downloadsOverTime}>
                <defs>
                  <linearGradient id="cleanMinimalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f4f4f5',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cleanMinimalGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 clean-card p-5 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
            Platform Breakdown
          </h3>
          <div className="h-44 w-full flex items-center justify-center">
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
                  strokeWidth={2}
                  stroke="#121318"
                >
                  {platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.platform] || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f4f4f5',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs text-zinc-500 pt-3 border-t border-zinc-100 dark:border-white/[0.06]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> YouTube
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span> Instagram
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span> X
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
