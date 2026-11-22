export const PLATFORMS = {
  youtube: {
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    bgColor: 'bg-red-500/10 text-red-400 border-red-500/30',
    patterns: [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/i,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/i,
      /^https?:\/\/youtu\.be\/[\w-]+/i,
      /^https?:\/\/m\.youtube\.com\/watch\?v=[\w-]+/i,
    ],
  },
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    bgColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    patterns: [
      /^https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/i,
      /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+/i,
      /^https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/i,
    ],
  },
  twitter: {
    name: 'X (Twitter)',
    icon: 'twitter',
    color: '#38bdf8',
    bgColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    patterns: [
      /^https?:\/\/(www\.)?twitter\.com\/\w+\/status\/\d+/i,
      /^https?:\/\/(www\.)?x\.com\/\w+\/status\/\d+/i,
    ],
  },
};

export function detectPlatform(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  for (const [key, platform] of Object.entries(PLATFORMS)) {
    for (const pattern of platform.patterns) {
      if (pattern.test(trimmed)) {
        return { id: key, ...platform };
      }
    }
  }
  return null;
}
