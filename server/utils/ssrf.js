const { URL } = require('url');
const dns = require('dns');
const { promisify } = require('util');

const dnsLookup = promisify(dns.lookup);

const ALLOWED_DOMAINS = [
  'youtube.com', 'www.youtube.com', 'm.youtube.com',
  'youtu.be',
  'instagram.com', 'www.instagram.com',
  'twitter.com', 'www.twitter.com',
  'x.com', 'www.x.com',
  'i.ytimg.com', 'yt3.ggpht.com',
  'pbs.twimg.com', 'video.twimg.com',
  'scontent.cdninstagram.com',
];

const PRIVATE_IP_RANGES = [
  /^127\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./, /^0\./, /^169\.254\./,
  /^fc00:/, /^fe80:/, /^::1$/, /^::$/,
];

function isPrivateIP(ip) {
  return PRIVATE_IP_RANGES.some(range => range.test(ip));
}

async function validateUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS protocols are allowed');
  }

  const hostname = parsed.hostname.toLowerCase();
  const isAllowed = ALLOWED_DOMAINS.some(domain =>
    hostname === domain || hostname.endsWith('.' + domain)
  );

  if (!isAllowed) {
    throw new Error('Domain not supported. Allowed: YouTube, Instagram, X (Twitter)');
  }

  try {
    const lookup = await dnsLookup(hostname);
    if (isPrivateIP(lookup.address)) {
      throw new Error('URL resolves to a private IP address');
    }
  } catch (err) {
    if (err.message.includes('private IP')) throw err;
    // Allow if domain is strictly in allowed list even if DNS times out
  }

  return parsed;
}

module.exports = { validateUrl, ALLOWED_DOMAINS, isPrivateIP };
