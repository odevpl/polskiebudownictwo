const configs = require('./config');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function isCurrent(item, currentPath) {
  return item.currentPath && item.currentPath === currentPath;
}

function renderLink(item, currentPath) {
  const current = isCurrent(item, currentPath) ? ' aria-current="page"' : '';
  const className = item.className ? ` class="${escapeHtml(item.className)}"` : '';
  return `<a${className} href="${escapeHtml(item.href)}"${current}>${escapeHtml(item.label)}</a>`;
}

function renderItems(items, currentPath) {
  return items.map(item => renderLink(item, currentPath)).join('\n          ');
}

function renderMenu({ variant = 'public', currentPath = '/' } = {}) {
  const config = configs[variant];
  if (!config) throw new Error(`Unknown menu variant: ${variant}`);

  const groups = (config.groups || []).map(group => `          <div class="site-nav__dropdown">
            <button class="site-nav__dropdown-trigger" type="button" aria-expanded="false" aria-haspopup="true">${escapeHtml(group.label)}</button>
            <div class="site-nav__dropdown-menu">
              ${renderItems(group.items, currentPath)}
            </div>
          </div>`).join('\n');
  const links = config.links?.length ? `${groups}${groups ? '\n          ' : ''}${renderItems(config.links, currentPath)}` : groups;
  const account = config.account
    ? `\n          <span class="site-nav__account" data-auth-menu><a href="/logowanie.html">Zaloguj się</a></span>`
    : '';
  const newsletter = config.newsletter
    ? `\n          <a class="social-link social-link--icon" href="https://www.linkedin.com/newsletters/polskie-budownictwo-7446992061150584832/" target="_blank" rel="noopener noreferrer" aria-label="Newsletter Polskie Budownictwo na LinkedIn"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6.5 8.25H3V21h3.5V8.25ZM4.75 3A2.06 2.06 0 1 0 4.75 7.12 2.06 2.06 0 0 0 4.75 3ZM21 13.69c0-3.84-2.05-5.63-4.79-5.63a4.15 4.15 0 0 0-3.77 2.07h-.05V8.25H9.03V21h3.5v-6.31c0-1.66.31-3.28 2.38-3.28 2.04 0 2.06 1.91 2.06 3.39V21H21v-7.31Z" /></svg></a>`
    : '';
  const cta = config.cta
    ? `\n          <a class="button button--nav" href="/#dolacz">Dołącz bezpłatnie</a>`
    : '';
  const mobileCta = config.mobileCta
    ? `\n\n        <a class="button button--nav site-header__mobile-cta" href="/#dolacz">Dołącz</a>`
    : '';

  return `        <button class="site-menu-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Otwórz menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav class="site-nav" id="site-nav" aria-label="Główna nawigacja">
          ${links}${account}${newsletter}${cta}
        </nav>${mobileCta}`;
}

module.exports = { configs, renderMenu };
