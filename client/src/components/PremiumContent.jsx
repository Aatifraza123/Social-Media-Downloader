import React from 'react';
import {
  Cpu,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  Server,
  Workflow,
  Check,
  Flame,
  FileCode2,
} from 'lucide-react';

export default function PremiumContent() {
  const specs = [
    { label: 'Container Formats', value: 'MP4 (H.264 / AAC), WebM (VP9 / Opus), Pure MP3' },
    { label: 'Max Resolution', value: '3840 × 2160 (4K UHD) @ 60fps' },
    { label: 'Audio Ingestion', value: 'Up to 320 kbps CBR Stereo' },
    { label: 'Throughput', value: 'Gigabit NVMe scratch disk pipeline' },
    { label: 'Security Model', value: 'SSRF sandbox with RFC1918 private IP rejection' },
    { label: 'Deployment Target', value: 'Hostinger Ubuntu VPS with multi-core FFmpeg' },
  ];

  const highlights = [
    {
      title: 'Lossless Demuxing',
      category: 'MEDIA PIPELINE',
      desc: 'Streams are pulled directly from original CDN endpoints and merged using stream-copy without re-compression artifacts.',
    },
    {
      title: 'Zero User Tracking',
      category: 'PRIVACY',
      desc: 'No fingerprinting, no third-party telemetry scripts, and no persistent watch history logged to external ad brokers.',
    },
    {
      title: 'Batch Worker Queue',
      category: 'CONCURRENCY',
      desc: 'Up to 25 simultaneous URLs can be scheduled. The daemon distributes jobs with CPU-throttled concurrency limits.',
    },
    {
      title: 'Real-Time SSE Feedback',
      category: 'TELEMETRY',
      desc: 'Server-Sent Events (SSE) pipe instantaneous progress ticks directly from the transcoder process into the UI.',
    },
  ];

  return (
    <div className="space-y-16 pt-12 pb-6">
      {/* Section 1: Architecture Highlights */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-200/80 dark:border-white/[0.08] pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold">
              Architecture & Mechanics
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-950 dark:text-white mt-1">
              Engineered for developer-grade precision.
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400">
            Node.js • Express • FFmpeg • Mongoose
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="clean-card p-4 space-y-2.5 hover:border-gray-300 dark:hover:border-white/[0.15] transition-colors"
            >
              <div className="text-[10px] font-mono font-semibold tracking-wider text-gray-400 dark:text-gray-500">
                {item.category}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Technical Specification Sheet */}
      <div className="space-y-4">
        <div className="border-b border-gray-200/80 dark:border-white/[0.08] pb-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold">
            Technical Ledger
          </span>
          <h2 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white mt-1">
            Daemon Parameters & Codec Standards
          </h2>
        </div>

        <div className="clean-card overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {specs.map((s, idx) => (
              <div
                key={idx}
                className="py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-mono text-gray-500 dark:text-gray-400 sm:w-1/3">
                  {s.label}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-200 sm:w-2/3 text-left sm:text-right font-mono">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Clean Command Banner */}
      <div className="clean-card p-6 bg-gray-900 text-white dark:bg-[#0c0e15] border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PM2 Daemon: sm-downloader-api (Port 5000)</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Non-destructive Hostinger VPS configuration.
          </h3>
          <p className="text-xs text-gray-400">
            Runs isolated inside dedicated application paths with zero interference to other server daemons.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-black/50 p-2.5 rounded-lg border border-white/10 text-gray-300 whitespace-nowrap">
          <span className="text-emerald-400">$</span>
          <span>curl -X POST /api/media/analyze</span>
        </div>
      </div>
    </div>
  );
}
