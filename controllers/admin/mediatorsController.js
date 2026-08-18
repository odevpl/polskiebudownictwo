const Mediator = require('../../models/Mediator');
const { sanitizeRichText } = require('../../modules/richText');

async function index(request, response) {
  try {
    const mediators = await Mediator.findAll();
    response.render('admin/mediators/index', {
      title: 'Mediatorzy',
      admin: request.session.admin,
      mediators,
      error: null,
    });
  } catch (error) {
    console.error('Mediators list error:', error);
    response.status(500).render('admin/mediators/index', {
      title: 'Mediatorzy',
      admin: request.session.admin,
      mediators: [],
      error: 'Nie udalo sie pobrac mediatorow. Tabela mediators nie jest jeszcze dostepna w bazie danych.',
    });
  }
}

function newForm(request, response) {
  renderForm(response, request, 'create', emptyMediator(), [], request.app.locals.adminUrl('/mediators/new'));
}

async function create(request, response) {
  const data = mediatorFromBody(request.body);
  const errors = validateMediator(data);
  if (errors.length) {
    renderForm(response, request, 'create', data, errors, request.app.locals.adminUrl('/mediators/new'), 422);
    return;
  }

  try {
    const mediator = await Mediator.create(data);
    response.redirect(request.app.locals.adminUrl(`/mediators/${mediator.id}/edit`));
  } catch (error) {
    console.error('Mediator create error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      renderForm(response, request, 'create', data, ['Slug mediatora musi byc unikalny.'], request.app.locals.adminUrl('/mediators/new'), 422);
      return;
    }
    response.status(500).send('Nie udalo sie dodac mediatora.');
  }
}

async function editForm(request, response) {
  try {
    const mediator = await Mediator.findById(request.params.id);
    if (!mediator) return response.status(404).send('Mediator nie istnieje.');
    renderForm(response, request, 'edit', mediator, [], request.app.locals.adminUrl(`/mediators/${mediator.id}/edit`));
  } catch (error) {
    console.error('Mediator edit error:', error);
    response.status(500).send('Nie udalo sie pobrac mediatora.');
  }
}

async function update(request, response) {
  const id = request.params.id;
  const data = mediatorFromBody(request.body);
  const errors = validateMediator(data);
  if (errors.length) {
    renderForm(response, request, 'edit', { id, ...data }, errors, request.app.locals.adminUrl(`/mediators/${id}/edit`), 422);
    return;
  }

  try {
    const mediator = await Mediator.update(id, data);
    if (!mediator) return response.status(404).send('Mediator nie istnieje.');
    response.redirect(request.app.locals.adminUrl(`/mediators/${id}/edit`));
  } catch (error) {
    console.error('Mediator update error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      renderForm(response, request, 'edit', { id, ...data }, ['Slug mediatora musi byc unikalny.'], request.app.locals.adminUrl(`/mediators/${id}/edit`), 422);
      return;
    }
    response.status(500).send('Nie udalo sie zapisac mediatora.');
  }
}

async function destroy(request, response) {
  try {
    await Mediator.remove(request.params.id);
    response.redirect(request.app.locals.adminUrl('/mediators'));
  } catch (error) {
    console.error('Mediator delete error:', error);
    response.status(500).send('Nie udalo sie usunac mediatora.');
  }
}

function mediatorFromBody(body) {
  return {
    name: String(body.name || '').trim(),
    slug: String(body.slug || '').trim().toLowerCase(),
    shortDescription: String(body.shortDescription || '').trim(),
    fullDescription: sanitizeRichText(body.fullDescription),
    keyExperience: sanitizeRichText(body.keyExperience),
    qualifications: String(body.qualifications || '').trim(),
    specializations: String(body.specializations || '').trim(),
    mediationModes: String(body.mediationModes || '').trim(),
    isPublished: Boolean(body.isPublished),
    sortOrder: Number.isInteger(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
  };
}

function validateMediator(data) {
  const errors = [];
  if (!data.name) errors.push('Podaj imie i nazwisko mediatora.');
  if (data.name.length > 200) errors.push('Imie i nazwisko mediatora jest zbyt dlugie.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug) || data.slug.length > 160) errors.push('Slug musi zawierac male litery, cyfry i laczniki.');
  if (!data.shortDescription) errors.push('Podaj opis skrocony.');
  if (!data.fullDescription) errors.push('Podaj opis pelny.');
  if (data.sortOrder < 0) errors.push('Kolejnosc nie moze byc ujemna.');
  return errors;
}

function emptyMediator() {
  return {
    name: '', slug: '', shortDescription: '', fullDescription: '', keyExperience: '',
    qualifications: '', specializations: '', mediationModes: '', isPublished: false, sortOrder: 0,
  };
}

function renderForm(response, request, mode, mediator, errors, action, status = 200) {
  response.status(status).render('admin/mediators/form', {
    title: mode === 'edit' ? `Edycja mediatora #${mediator.id}` : 'Nowy mediator',
    admin: request.session.admin,
    mode,
    mediator,
    errors,
    action,
  });
}

module.exports = { create, destroy, editForm, index, newForm, update };
