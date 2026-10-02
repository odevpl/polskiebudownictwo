const AffiliateLink = require('../../models/AffiliateLink');

function registrationUrl(request, link) {
  const base = process.env.PUBLIC_BASE_URL || `${request.protocol}://${request.get('host')}`;
  const url = new URL('/rejestracja.html', base);
  url.searchParams.set('afiliation', link.alias || link.code);
  return url.href;
}

async function index(request, response) {
  try {
    const links = await AffiliateLink.findAll(request.query.search || '');
    links.forEach(link => { link.registrationUrl = registrationUrl(request, link); });
    return response.render('admin/affiliate-links/index', {
      title: 'Linki afiliacyjne',
      admin: request.session.admin,
      links,
      search: request.query.search || '',
    });
  } catch (error) {
    console.error('Affiliate links list error:', error);
    return response.status(500).send('Nie udało się pobrać linków afiliacyjnych.');
  }
}

function newForm(request, response) {
  return renderForm(response, request, { ownerName: '', ownerEmail: '', alias: '' }, [], 200);
}

async function create(request, response) {
  const data = linkFromBody(request.body);
  const errors = validateLink(data);
  if (errors.length) return renderForm(response, request, data, errors, 422);
  try {
    const link = await AffiliateLink.create({ ...data, adminId: request.session.admin.id });
    return response.redirect(request.app.locals.adminUrl(`/affiliate-links/${link.id}`));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return renderForm(response, request, data, ['Taki alias jest już zajęty.'], 409);
    console.error('Affiliate link create error:', error);
    return renderForm(response, request, data, ['Nie udało się utworzyć linku afiliacyjnego.'], 500);
  }
}

async function detail(request, response) {
  try {
    const link = await AffiliateLink.findById(request.params.id);
    if (!link) return response.status(404).send('Link afiliacyjny nie istnieje.');
    const registrations = await AffiliateLink.findRegistrations(link.id);
    return response.render('admin/affiliate-links/detail', {
      title: `Link afiliacyjny #${link.id}`,
      admin: request.session.admin,
      link,
      registrations,
      registrationUrl: registrationUrl(request, link),
    });
  } catch (error) {
    console.error('Affiliate link detail error:', error);
    return response.status(500).send('Nie udało się pobrać linku afiliacyjnego.');
  }
}

async function deactivate(request, response) {
  try {
    const changed = await AffiliateLink.deactivate(request.params.id);
    if (!changed) return response.status(404).send('Link afiliacyjny nie istnieje.');
    return response.redirect(request.app.locals.adminUrl(`/affiliate-links/${request.params.id}`));
  } catch (error) {
    console.error('Affiliate link deactivate error:', error);
    return response.status(500).send('Nie udało się wyłączyć linku afiliacyjnego.');
  }
}

function linkFromBody(body) {
  return {
    ownerName: String(body.ownerName || '').trim(),
    ownerEmail: String(body.ownerEmail || '').trim().toLowerCase(),
    alias: AffiliateLink.normalizeAlias(body.alias),
  };
}

function validateLink(data) {
  const errors = [];
  if (!data.ownerName || data.ownerName.length > 160) errors.push('Podaj imię i nazwisko właściciela (maksymalnie 160 znaków).');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ownerEmail) || data.ownerEmail.length > 254) errors.push('Podaj poprawny e-mail właściciela.');
  if (data.alias && (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.alias) || data.alias.length > 80)) errors.push('Alias może zawierać małe litery, cyfry i myślniki (maksymalnie 80 znaków).');
  return errors;
}

function renderForm(response, request, link, errors, status) {
  return response.status(status).render('admin/affiliate-links/form', {
    title: 'Nowy link afiliacyjny',
    admin: request.session.admin,
    link,
    errors,
    action: request.app.locals.adminUrl('/affiliate-links/new'),
  });
}

module.exports = { create, deactivate, detail, index, newForm };
