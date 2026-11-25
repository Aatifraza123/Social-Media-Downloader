export const PLATFORMS = {
  youtube: {
    name: 'YouTube',
    icon: 'youtube',
    color: '#ef4444',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40',
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
    color: '#ec4899',
    badgeClass: 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-200 dark:border-pink-900/40',
    patterns: [
      /^https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/i,
      /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+/i,
      /^https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/i,
    ],
  },
  twitter: {
    name: 'X (Twitter)',
    icon: 'twitter',
    color: '#0ea5e9',
    badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-900/40',
    patterns: [
      /^https?:\/\/(www\.)?twitter\.com\/\w+\/status\/\d+/i,
      /^https?:\/\/(www\.)?x\.com\/\w+\/status\/\d+/i,
    ],
  },
  tiktok: {
    name: 'TikTok',
    icon: 'music',
    color: '#000000',
    badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    patterns: [
      /^https?:\/\/(www\.|vm\.|m\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i,
      /^https?:\/\/(www\.|vm\.|m\.)?tiktok\.com\/v\/\d+/i,
      /^https?:\/\/vm\.tiktok\.com\/[\w-]+/i,
      /^https?:\/\/(www\.)?tiktok\.com\/t\/[\w-]+/i,
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
