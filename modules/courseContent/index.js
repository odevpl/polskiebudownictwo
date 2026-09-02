const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be']);
const ALLOWED_TAGS = new Set(['p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'blockquote', 'a']);

function youtubeVideoId(value) {
  let input = String(value || '').trim();
  if (!input) return null;
  if (/^[a-zA-Z0-9_-]{6,32}$/.test(input)) return input;
  if (!/^https?:\/\//i.test(input)) input = `https://${input}`;
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    if (!YOUTUBE_HOSTS.has(host)) return null;
    if (host.includes('youtu.be')) return cleanVideoId(url.pathname.slice(1));
    if (url.pathname === '/watch') return cleanVideoId(url.searchParams.get('v'));
    const parts = url.pathname.split('/').filter(Boolean);
    if (['embed', 'shorts', 'live'].includes(parts[0])) return cleanVideoId(parts[1]);
    return null;
  } catch {
    return null;
  }
}

function cleanVideoId(value) {
  return /^[a-zA-Z0-9_-]{6,32}$/.test(String(value || '')) ? String(value) : null;
}

function sanitizeRichText(value) {
  return String(value || '')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<\s*(script|style|iframe|object|embed|form|svg|math)[^>]*>[^]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*([a-z0-9]+)([^>]*)>/gi, (match, tagName, attributes) => {
      const tag = tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return '';
      if (tag === 'br') return '<br>';
      if (tag !== 'a') return `<${tag}>`;
      const hrefMatch = attributes.match(/\bhref\s*=\s*["']([^"']+)["']/i);
      const href = hrefMatch && safeHref(hrefMatch[1]);
      return href ? `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">` : '<a>';
    })
    .replace(/<\s*\/\s*([a-z0-9]+)\s*>/gi, (match, tagName) => {
      const tag = tagName.toLowerCase();
      return ALLOWED_TAGS.has(tag) && tag !== 'br' ? `</${tag}>` : '';
    })
    .trim();
}

function safeHref(value) {
  try {
    const url = new URL(value, 'https://polskiebudownictwo.org');
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? value : null;
  } catch {
    return null;
  }
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseBlocks(value, legacyContent = '') {
  let blocks = value;
  if (typeof value === 'string') {
    try { blocks = JSON.parse(value); } catch { blocks = []; }
  }
  if (!Array.isArray(blocks) || !blocks.length) {
    const legacy = sanitizeRichText(legacyContent);
    return legacy ? [{ type: 'richText', data: { html: legacy } }] : [];
  }
  return blocks.map(normalizeBlock).filter(Boolean);
}

function normalizeBlock(block) {
  if (!block || typeof block !== 'object') return null;
  if (block.type === 'richText') {
    const html = sanitizeRichText(block.data?.html || block.html || '');
    return html ? { type: 'richText', data: { html } } : null;
  }
  if (block.type === 'youtube') {
    const videoId = youtubeVideoId(block.data?.url || block.url || block.data?.videoId || block.videoId);
    if (!videoId) return null;
    const title = String(block.data?.title || block.title || '').trim().slice(0, 255);
    return { type: 'youtube', data: { videoId, title } };
  }
  return null;
}

function normalizeForStorage(value, legacyContent = '') {
  return parseBlocks(value, legacyContent);
}

module.exports = { normalizeForStorage, parseBlocks, sanitizeRichText, youtubeVideoId };
