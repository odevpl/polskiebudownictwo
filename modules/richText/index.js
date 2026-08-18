const allowedTags = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li']);

function sanitizeRichText(value) {
  return String(value || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*\/?\s*([a-z0-9]+)(?:\s[^>]*)?>/gi, (match, tagName) => {
      const tag = tagName.toLowerCase();
      if (!allowedTags.has(tag)) return '';
      return match.startsWith('</') ? `</${tag}>` : tag === 'br' ? '<br>' : `<${tag}>`;
    })
    .trim();
}

module.exports = { sanitizeRichText };
