const fs = require('node:fs');
const path = require('node:path');
const { renderJoinCta } = require('../modules/joinCta');

const targets = [
  'akademia.html',
  'o_fundacji.html',
  'raport-mimira-2025/index.html',
  'wydarzenia.html',
];

function renderDirectory(root) {
  let count = 0;
  for (const relativePath of targets) {
    const filePath = path.join(root, relativePath);
    if (!fs.existsSync(filePath)) continue;
    const source = fs.readFileSync(filePath, 'utf8');
    const pattern = /(?:\s*<!-- Join CTA rendered by modules\/joinCta -->)?\s*<section class="section section--primary join-cta"[\s\S]*?<\/section>(?=\s*<\/main>)/;
    if (source.includes('join-cta') && !pattern.test(source)) {
      throw new Error(`Join CTA block not found in ${filePath}`);
    }
    const next = source.includes('join-cta')
      ? source.replace(pattern, `\n${renderJoinCta()}`)
      : source.replace(/\s*<\/main>/, `\n${renderJoinCta()}\n    </main>`);
    if (next === source) continue;
    fs.writeFileSync(filePath, next, 'utf8');
    count += 1;
  }
  return count;
}

if (require.main === module) {
  const root = path.resolve(process.argv[2] || 'page');
  console.log(`Rendered ${renderDirectory(root)} join CTA(s) in ${root}`);
}

module.exports = { renderDirectory };
