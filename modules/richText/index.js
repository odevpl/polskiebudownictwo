const allowedTags = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li']);

function plainTextToHtml(value) {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map(paragraph => `<p>${paragraph.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function sanitizeRichText(value) {
  const source = String(value || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*\/?\s*([a-z0-9]+)(?:\s[^>]*)?>/gi, (match, tagName) => {
      const tag = tagName.toLowerCase();
      if (!allowedTags.has(tag)) return '';
      if (match.startsWith('</')) return `</${tag}>`;
      if (tag === 'br') return '<br>';
      if (tag === 'li') {
        const listType = /data-list\s*=\s*["'](ordered|bullet)["']/i.exec(match)?.[1]?.toLowerCase();
        return listType ? `<li data-list="${listType}">` : '<li>';
      }
      return `<${tag}>`;
    })
    .trim();
  return /<\/?(?:p|br|strong|b|em|i|ul|ol|li)>/i.test(source) ? source : plainTextToHtml(source);
}

module.exports = { sanitizeRichText };
