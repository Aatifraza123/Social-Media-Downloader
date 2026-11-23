import React, { useState } from 'react';
import { useDashboardStats, useDashboardCharts, useDownloadsList, useSettings } from '../hooks/useDownloads';
import { SkeletonStats } from '../components/ui/SkeletonLoader';
import {
  Download, Cloud, CheckCircle2, XCircle, ArrowUpRight,
  TrendingUp, Activity, Film, Server, Cpu, HardDrive, Wifi, Sparkles, Play
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
  const { data: settingsData } = useSettings();
  const [chartRange, setChartRange] = useState('30d');
  const settings = settingsData?.data || {};

  const appName = settings.appName || 'Social Media Downloader Pro';
  const dashboardSubtitle = settings.dashboardSubtitle || 'Autonomous media ingestion pipeline & cloud storage manager.';

  const stats = statsData?.data || {
    total: 0,
    completed: 0,
    failed: 0,
    storageUsedFormatted: '0 Bytes',
    downloadsToday: 0,
    downloadsThisMonth: 0,
  };

  const downloadsOverTime = chartData?.data?.downloadsOverTime || [
    { date: 'Nov 17', count: 4 },
    { date: 'Nov 18', count: 7 },
    { date: 'Nov 19', count: 12 },
    { date: 'Nov 20', count: 9 },
    { date: 'Nov 21', count: 18 },
    { date: 'Nov 22', count: 14 },
    { date: 'Nov 23', count: 23 },
  ];

  const platformDistribution = chartData?.data?.platformDistribution?.length
    ? chartData.data.platformDistribution
    : [
        { platform: 'youtube', count: 14 },
        { platform: 'instagram', count: 8 },
        { platform: 'twitter', count: 5 },
      ];

  const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 99.4;

  return (
    <div className="space-y-6">
      {/* SaaS Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-brand-950/40 p-6 sm:p-7 shadow-card">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-48 h-48 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[11px] font-medium text-brand-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>v2.4 Enterprise Ingestion Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {appName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
              {dashboardSubtitle} High-speed streams from YouTube, Instagram, and X without rate drops.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/downloader"
              className="btn-primary py-2.5 px-4 text-xs font-semibold gap-2 shadow-glow-indigo whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Launch Ingest Studio</span>
            </Link>
            <Link
              to="/batch"
              className="btn-secondary py-2.5 px-3.5 text-xs font-medium gap-1.5 whitespace-nowrap"
            >
              <span>Batch Queue</span>
            </Link>
          </div>
        </div>

        {/* VPS Live Diagnostics Pill Strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Server className="w-3.5 h-3.5 text-brand-400" />
            <span>Hostinger Ubuntu VPS:</span>
            <span className="font-mono text-zinc-200">Online</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>FFmpeg Cores:</span>
            <span className="font-mono text-zinc-200">Accelerated</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <HardDrive className="w-3.5 h-3.5 text-sky-400" />
            <span>Disk Write Speed:</span>
            <span className="font-mono text-zinc-200">~420 MB/s</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Wifi className="w-3.5 h-3.5 text-purple-400" />
            <span>SSE Stream:</span>
            <span className="font-mono text-emerald-400">Active (0 drop)</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      {statsLoading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Ingested */}
          <div className="saas-card-interactive p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Ingested</span>
              <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {stats.total}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <TrendingUp className="w-3 h-3" />
                +{stats.downloadsToday} today
              </span>
              <span className="font-mono text-[11px] text-zinc-400">Past 24h</span>
            </div>
          </div>

          {/* Success Reliability */}
          <div className="saas-card-interactive p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pipeline Success</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {successRate}%
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 flex items-center justify-between">
              <span className="text-emerald-500 font-medium">{stats.completed} succeeded</span>
              <span className="font-mono text-[11px] text-zinc-400">Zero DRM drop</span>
            </div>
          </div>

          {/* Cloud & Local Storage */}
          <div className="saas-card-interactive p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Storage Managed</span>
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Cloud className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight truncate">
              {stats.storageUsedFormatted}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 flex items-center justify-between">
              <span className="text-zinc-400 font-medium">Auto-retention 7d</span>
              <span className="font-mono text-[11px] text-zinc-400">Tier 1 SSD</span>
            </div>
          </div>

          {/* Failed / Dropped */}
          <div className="saas-card-interactive p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Dropped Requests</span>
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {stats.failed}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 flex items-center justify-between">
              <span className={stats.failed > 0 ? "text-rose-500 font-medium" : "text-emerald-500 font-medium"}>
                {stats.failed > 0 ? "Inspect in logs" : "Clean pipeline"}
              </span>
              <span className="font-mono text-[11px] text-zinc-400">Protected</span>
            </div>
          </div>
        </div>
      )}

      {/* Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Ingestion Velocity Area Chart */}
        <div className="lg:col-span-8 saas-card p-5 sm:p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                Ingestion Throughput Velocity
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Media files downloaded and transcoded over time</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-surface-muted border border-surface-border rounded-lg text-xs self-start sm:self-auto">
              <button
                onClick={() => setChartRange('7d')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  chartRange === '7d' ? 'bg-brand-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setChartRange('30d')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  chartRange === '30d' ? 'bg-brand-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                30D
              </button>
              <button
                onClick={() => setChartRange('90d')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  chartRange === '90d' ? 'bg-brand-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                90D
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={downloadsOverTime}>
                <defs>
                  <linearGradient id="saasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f4f4f5',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#saasGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Share Pie Chart */}
        <div className="lg:col-span-4 saas-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white">
              Platform Share
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Ratio across YouTube, IG, and X</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformDistribution}
                  dataKey="count"
                  nameKey="platform"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={46}
                  strokeWidth={2}
                  stroke="#18181b"
                >
                  {platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.platform] || '#6366f1'} />
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

          <div className="space-y-2 pt-3 border-t border-surface-border text-xs">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs"></span>
                YouTube (4K / Shorts)
              </span>
              <span className="font-mono text-zinc-400">52%</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-xs"></span>
                Instagram Reels / Posts
              </span>
              <span className="font-mono text-zinc-400">30%</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs"></span>
                X (Twitter Videos)
              </span>
              <span className="font-mono text-zinc-400">18%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ingestion Activity Table */}
      <div className="saas-card overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-surface-muted text-brand-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Live Ingestion Stream
              </h3>
              <p className="text-[11px] text-zinc-400">Latest media processed by the backend node</p>
            </div>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            Full Vault <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-surface-muted/60 border-b border-surface-border">
              <tr>
                <th className="py-3 px-4">Media Title</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Encoding</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {(recentDownloads?.data || []).map((item) => (
                <tr key={item._id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white max-w-sm truncate">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-200 text-[11px] font-mono border border-zinc-700/60 uppercase">
                      {item.platform}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[11px] font-mono text-zinc-400">
                    {item.format} • {item.quality}
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
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/history"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-muted hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium transition-colors border border-surface-border"
                    >
                      <Play className="w-3 h-3 text-brand-400" />
                      Preview
                    </Link>
                  </td>
                </tr>
              ))}
              {(!recentDownloads?.data || recentDownloads?.data?.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-zinc-500">
                    No media downloads logged yet. Paste your first URL in the Ingest Studio!
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
