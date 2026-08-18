const config = require('./config');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderJoinCta() {
  return `<!-- Join CTA rendered by modules/joinCta -->
      <section class="section section--primary join-cta" aria-labelledby="join-cta-title">
        <div class="container join-cta__inner">
          <div>
            <p class="eyebrow">${escapeHtml(config.eyebrow)}</p>
            <h2 id="join-cta-title">${escapeHtml(config.title)}</h2>
            <p>${escapeHtml(config.description)}</p>
          </div>
          <a class="button button--light" href="${escapeHtml(config.link)}">${escapeHtml(config.linkLabel)}</a>
        </div>
      </section>`;
}

module.exports = { config, renderJoinCta };
