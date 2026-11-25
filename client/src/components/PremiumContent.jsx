import React from 'react';
import {
  Zap,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  Cpu,
  Globe,
  HardDrive,
  FileVideo,
  Music,
  ArrowRight,
  Gauge,
  Lock,
  Smartphone,
} from 'lucide-react';

export default function PremiumContent() {
  const features = [
    {
      icon: Zap,
      title: 'Lossless High-Bitrate Ingestion',
      desc: 'Native stream ripping up to 4K UHD 60fps & 320kbps pure MP3 audio without double-compression or quality loss.',
      tag: 'Fast & Pure',
    },
    {
      icon: Shield,
      title: 'Zero Logs & Sandboxed Privacy',
      desc: 'End-to-end SSRF-guarded media conversion. No persistent tracking, no ad trackers, and 100% private retrieval.',
      tag: 'Secure',
    },
    {
      icon: Layers,
      title: 'Multi-Stream Batch Pipeline',
      desc: 'Queue up to 25 URLs simultaneously. Autonomous backend worker transcodes media with auto-deduplication.',
      tag: 'Batch Ingest',
    },
    {
      icon: Cpu,
      title: 'Hardware-Accelerated FFmpeg',
      desc: 'Hostinger Ubuntu VPS engine optimized with multi-threaded codec remuxing for instant sub-second conversions.',
      tag: 'Server Accelerated',
    },
    {
      icon: Smartphone,
      title: 'Cross-Device Responsiveness',
      desc: 'Optimized touch-friendly UI for iOS Safari, Android Chrome, tablet, and desktop with instant clipboard paste.',
      tag: 'Mobile Ready',
    },
    {
      icon: HardDrive,
      title: 'Automated Retention & Storage',
      desc: 'Intelligent temporary file purging with configurable retention policies and cloud storage synchronization.',
      tag: 'Auto Clean',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Paste Any Supported Link',
      desc: 'Input any URL from YouTube, Instagram Reels/Posts, or X (Twitter). The engine identifies the platform instantly.',
    },
    {
      num: '02',
      title: 'Select Precision Format',
      desc: 'Choose between 4K UHD, 1080p Full HD, 720p HD, or pure 320kbps MP3 audio with instant file size estimations.',
    },
    {
      num: '03',
      title: 'Direct 1-Click Save',
      desc: 'Click download and the file is transcoded on high-speed NVMe storage and saved directly to your device.',
    },
  ];

  const platforms = [
    {
      name: 'YouTube',
      badge: '4K • 1080p • Shorts • MP3',
      desc: 'Standard videos, Shorts, high-framerate 60fps, and uncompressed studio audio extractions.',
      color: 'from-red-500/10 to-red-600/5 border-red-500/20 text-red-500',
    },
    {
      name: 'Instagram',
      badge: 'Reels • Posts • Stories',
      desc: 'Full-resolution Reels, multi-slide video carousels, and high-definition IGTV streams.',
      color: 'from-pink-500/10 to-pink-600/5 border-pink-500/20 text-pink-500',
    },
    {
      name: 'X (formerly Twitter)',
      badge: 'HD Video • Audio Clips',
      desc: 'Direct media stream scraping from public tweets, video threads, and high-bitrate clips.',
      color: 'from-sky-500/10 to-sky-600/5 border-sky-500/20 text-sky-400',
    },
  ];

  return (
    <div className="space-y-16 pt-12 pb-6">
      {/* Platform Capabilities Cards */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Multi-Platform Integration
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Engineered for Modern Social Media
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map((p, idx) => (
            <div
              key={idx}
              className={`clean-card p-5 bg-gradient-to-br ${p.color} border transition-all hover:-translate-y-0.5 duration-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{p.name}</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/40 border border-current">
                  {p.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works - 3 Step Flow */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Streamlined Ingestion
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            How Media Ingestion Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((s, idx) => (
            <div key={idx} className="clean-card p-5 relative overflow-hidden">
              <span className="text-2xl font-extrabold text-zinc-200 dark:text-zinc-800 font-mono block mb-2">
                {s.num}
              </span>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                {s.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SaaS Feature Matrix Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Core Architecture
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Enterprise-Grade Ingestion Suite
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Built from the ground up on modern Node.js, Express, and dedicated Ubuntu server infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="clean-card p-5 space-y-2 hover:border-zinc-300 dark:hover:border-white/[0.15] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold font-mono text-zinc-400 dark:text-zinc-500 px-2 py-0.5 rounded bg-zinc-50 dark:bg-white/[0.03]">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {f.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust & Architecture Banner */}
      <div className="clean-card p-6 sm:p-8 bg-zinc-900 text-white dark:bg-[#121318] border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-semibold mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Hostinger VPS Node Active</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Ready to download media without limits?
          </h3>
          <p className="text-xs text-zinc-400 max-w-md">
            No registration needed for single downloads. Paste your URL above and enjoy lossless streams.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No Ads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
