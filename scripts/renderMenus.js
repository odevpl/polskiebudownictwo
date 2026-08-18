const fs = require('node:fs');
const path = require('node:path');
const { renderMenu } = require('../modules/menu');

function htmlFiles(root) {
  const result = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...htmlFiles(entryPath));
    else if (entry.isFile() && entry.name.endsWith('.html')) result.push(entryPath);
  }
  return result;
}

function menuOptions(relativePath, scope) {
  const normalized = relativePath.split(path.sep).join('/');

  if (scope === 'mediation') {
    const currentPath = normalized === 'index.html' ? '/' : `/${normalized.replace(/\.html$/, '')}`;
    return { variant: 'mediation', currentPath };
  }

  const currentPath = normalized === 'index.html'
    ? '/'
    : `/${normalized.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`;
  return { variant: 'public', currentPath };
}

function renderFile(filePath, root, scope) {
  const source = fs.readFileSync(filePath, 'utf8');
  if (source.includes('<!-- MENU_MODULE -->')) {
    const relativePath = path.relative(root, filePath);
    const menu = renderMenu(menuOptions(relativePath, scope));
    fs.writeFileSync(filePath, source.replace('<!-- MENU_MODULE -->', menu), 'utf8');
    return true;
  }
  if (!source.includes('site-menu-toggle')) return false;
  const relativePath = path.relative(root, filePath);
  const menu = renderMenu(menuOptions(relativePath, scope));
  const pattern = /(?:\s*<!-- Menu rendered by modules\/menu -->)*\s*<button class="site-menu-toggle"[\s\S]*?<\/nav>(?:\s*<a class="button button--nav site-header__mobile-cta"[\s\S]*?<\/a>)?/;
  if (!pattern.test(source)) throw new Error(`Menu block not found in ${filePath}`);
  const next = source.replace(pattern, `<!-- Menu rendered by modules/menu -->\n${menu}`);
  if (next === source) return false;
  fs.writeFileSync(filePath, next, 'utf8');
  return true;
}

function renderDirectory(root, scope) {
  let count = 0;
  for (const filePath of htmlFiles(root)) {
    if (renderFile(filePath, root, scope)) count += 1;
  }
  return count;
}

if (require.main === module) {
  const root = path.resolve(process.argv[2] || 'page');
  const scope = process.argv[3] || 'main';
  console.log(`Rendered ${renderDirectory(root, scope)} menu(s) in ${root}`);
}

module.exports = { renderDirectory };
