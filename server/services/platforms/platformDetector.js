class PlatformDetector {
  static PLATFORMS = {
    youtube: {
      name: 'YouTube',
      icon: 'youtube',
      color: '#FF0000',
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
      patterns: [
        /^https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/i,
        /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+/i,
        /^https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/i,
      ],
    },
    twitter: {
      name: 'X (Twitter)',
      icon: 'twitter',
      color: '#000000',
      patterns: [
        /^https?:\/\/(www\.)?twitter\.com\/\w+\/status\/\d+/i,
        /^https?:\/\/(www\.)?x\.com\/\w+\/status\/\d+/i,
      ],
    },
  };

  static detect(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmedUrl = url.trim();
    for (const [key, platform] of Object.entries(this.PLATFORMS)) {
      for (const pattern of platform.patterns) {
        if (pattern.test(trimmedUrl)) {
          return {
            platform: key,
            name: platform.name,
            icon: platform.icon,
            color: platform.color,
          };
        }
      }
    }
    return null;
  }

  static isSupported(url) {
    return this.detect(url) !== null;
  }

  static getSupportedPlatforms() {
    return Object.entries(this.PLATFORMS).map(([key, p]) => ({
      id: key,
      name: p.name,
      icon: p.icon,
      color: p.color,
    }));
  }

  static extractVideoId(url, platform) {
    switch (platform) {
      case 'youtube': {
        const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
        if (shortMatch) return shortMatch[1];
        const watchMatch = url.match(/[?&]v=([\w-]+)/);
        if (watchMatch) return watchMatch[1];
        const shortsMatch = url.match(/\/shorts\/([\w-]+)/);
        if (shortsMatch) return shortsMatch[1];
        return null;
      }
      case 'instagram': {
        const match = url.match(/\/(p|reel|tv)\/([\w-]+)/);
        return match ? match[2] : null;
      }
      case 'twitter': {
        const match = url.match(/\/status\/(\d+)/);
        return match ? match[1] : null;
      }
      default:
        return null;
    }
  }
}

module.exports = PlatformDetector;
