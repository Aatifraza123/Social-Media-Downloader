import React from 'react';
import { 
  Youtube, 
  Instagram, 
  Twitter, 
  Music2,
  Download,
  FileVideo,
  List,
  Subtitles,
  Repeat,
  Gauge,
  CheckCircle2,
  Sparkles,
  FileText,
  Globe
} from 'lucide-react';

export default function FeaturesShowcase() {
  const platforms = [
    {
      name: 'YouTube',
      icon: Youtube,
      color: 'red',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-600 dark:text-red-400',
      features: [
        'Videos (8K to 144p)',
        'Playlists',
        'Shorts',
        'Subtitles (All Languages)',
        'Audio Only (MP3)'
      ]
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'pink',
      bgColor: 'bg-pink-500/10',
      textColor: 'text-pink-600 dark:text-pink-400',
      features: [
        'Posts',
        'Reels',
        'Stories',
        'IGTV Videos',
        'Video/Audio Formats'
      ]
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
      features: [
        'Video Tweets',
        'GIFs',
        'Multiple Videos',
        'HD Quality',
        'Audio Extraction'
      ]
    },
    {
      name: 'TikTok',
      icon: Music2,
      color: 'purple',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600 dark:text-purple-400',
      features: [
        'Videos',
        'No Watermark',
        'Original Audio',
        'HD Quality',
        'Fast Downloads'
      ]
    }
  ];

  const mainFeatures = [
    {
      icon: FileVideo,
      title: 'Multiple Formats',
      description: 'Video with audio, Video only, Audio only - choose what you need',
      color: 'blue'
    },
    {
      icon: Gauge,
      title: 'Quality Selection',
      description: '8K, 4K, 1080p, 720p, 480p, 360p, 240p, 144p - full range available',
      color: 'emerald'
    },
    {
      icon: List,
      title: 'Playlist Download',
      description: 'Download entire YouTube playlists with one click',
      color: 'purple'
    },
    {
      icon: Subtitles,
      title: 'Subtitle Download',
      description: 'Download subtitles in all available languages (SRT/VTT format)',
      color: 'orange'
    },
    {
      icon: Repeat,
      title: 'Auto-Retry',
      description: 'Automatic retry on failure with smart exponential backoff',
      color: 'pink'
    },
    {
      icon: Download,
      title: 'Real-Time Progress',
      description: 'Live download progress with speed and size information',
      color: 'cyan'
    },
    {
      icon: FileText,
      title: 'Download History',
      description: 'Complete history with filters, search, and sorting options',
      color: 'indigo'
    },
    {
      icon: CheckCircle2,
      title: 'File Size Preview',
      description: 'See estimated file size before downloading',
      color: 'green'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
      cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
      indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      green: 'bg-green-500/10 text-green-600 dark:text-green-400',
      red: 'bg-red-500/10 text-red-600 dark:text-red-400'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-12">
      {/* Supported Platforms Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Supported Platforms
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="clean-card p-5 hover:scale-[1.02] transition-transform duration-200"
            >
              {/* Platform Icon & Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${platform.bgColor} flex items-center justify-center`}>
                  <platform.icon className={`w-5 h-5 ${platform.textColor}`} />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {platform.name}
                </h3>
              </div>

              {/* Features List */}
              <ul className="space-y-2">
                {platform.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${platform.textColor}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Main Features Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Powerful Features
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainFeatures.map((feature) => (
            <div
              key={feature.title}
              className="clean-card p-5 hover:scale-[1.02] transition-transform duration-200"
            >
              <div className={`w-10 h-10 rounded-xl ${getColorClasses(feature.color)} flex items-center justify-center mb-3`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="clean-card p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">4</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Platforms</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">10+</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Quality Options</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">3</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Format Types</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-1">∞</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Free Downloads</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="clean-card p-5 relative">
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 mt-2">
              Paste URL
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Copy the video URL from YouTube, Instagram, Twitter, or TikTok and paste it in the input field above.
            </p>
          </div>
          
          <div className="clean-card p-5 relative">
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 mt-2">
              Choose Quality
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Select your preferred quality and format - video with audio, video only, or audio only.
            </p>
          </div>
          
          <div className="clean-card p-5 relative">
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 mt-2">
              Download
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Click download and wait for the file to be prepared. Your download will start automatically!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
