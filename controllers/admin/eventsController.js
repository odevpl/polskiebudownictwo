const Event = require('../../models/Event');

async function index(request, response) {
  try {
    const events = await Event.findAll();
    response.render('admin/events/index', {
      title: 'Wydarzenia',
      admin: request.session.admin,
      events,
      columns: eventColumns(request),
      error: null,
    });
  } catch (error) {
    console.error('Events list error:', error);
    response.status(500).render('admin/events/index', {
      title: 'Wydarzenia',
      admin: request.session.admin,
      events: [],
      columns: eventColumns(request),
      error: 'Nie udalo sie pobrac wydarzen. Tabela events nie jest jeszcze dostepna w bazie danych.',
    });
  }
}

function newForm(request, response) {
  renderForm(response, request, 'create', emptyEvent(), [], request.app.locals.adminUrl('/events/new'));
}

async function create(request, response) {
  const data = eventFromBody(request.body);
  const errors = validateEvent(data);
  if (errors.length) {
    renderForm(response, request, 'create', data, errors, request.app.locals.adminUrl('/events/new'), 422);
    return;
  }

  try {
    const event = await Event.create(data);
    response.redirect(request.app.locals.adminUrl(`/events/${event.id}/edit`));
  } catch (error) {
    console.error('Event create error:', error);
    response.status(500).send('Nie udalo sie dodac wydarzenia.');
  }
}

async function editForm(request, response) {
  try {
    const event = await Event.findById(request.params.id);
    if (!event) return response.status(404).send('Wydarzenie nie istnieje.');
    renderForm(response, request, 'edit', event, [], request.app.locals.adminUrl(`/events/${event.id}/edit`));
  } catch (error) {
    console.error('Event edit error:', error);
    response.status(500).send('Nie udalo sie pobrac wydarzenia.');
  }
}

async function update(request, response) {
  const id = request.params.id;
  const data = eventFromBody(request.body);
  const errors = validateEvent(data);
  if (errors.length) {
    renderForm(response, request, 'edit', { id, ...data }, errors, request.app.locals.adminUrl(`/events/${id}/edit`), 422);
    return;
  }

  try {
    const event = await Event.update(id, data);
    if (!event) return response.status(404).send('Wydarzenie nie istnieje.');
    response.redirect(request.app.locals.adminUrl(`/events/${id}/edit`));
  } catch (error) {
    console.error('Event update error:', error);
    response.status(500).send('Nie udalo sie zapisac wydarzenia.');
  }
}

async function destroy(request, response) {
  try {
    await Event.remove(request.params.id);
    response.redirect(request.app.locals.adminUrl('/events'));
  } catch (error) {
    console.error('Event delete error:', error);
    response.status(500).send('Nie udalo sie usunac wydarzenia.');
  }
}

function eventFromBody(body) {
  return {
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    upcoming: Boolean(body.upcoming),
    eventDate: String(body.eventDate || '').trim(),
    eventTime: String(body.eventTime || '').trim(),
  };
}

function validateEvent(data) {
  const errors = [];
  if (!data.title) errors.push('Podaj tytul wydarzenia.');
  if (data.title.length > 255) errors.push('Tytul wydarzenia moze miec maksymalnie 255 znakow.');
  if (!data.description) errors.push('Podaj opis wydarzenia.');
  if (data.upcoming) return errors;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.eventDate)) errors.push('Podaj poprawna date wydarzenia.');
  if (!/^\d{2}:\d{2}$/.test(data.eventTime)) {
    errors.push('Podaj poprawna godzine wydarzenia.');
  } else {
    const hour = Number(data.eventTime.slice(0, 2));
    const minute = Number(data.eventTime.slice(3, 5));
    if (hour < 6 || hour > 21 || minute > 59) errors.push('Godzina wydarzenia musi byc pomiedzy 06:00 a 21:59.');
  }
  return errors;
}

function emptyEvent() {
  return { title: '', description: '', event_date: '', event_time: '' };
}

function renderForm(response, request, mode, event, errors, action, status = 200) {
  response.status(status).render('admin/events/form', {
    title: mode === 'edit' ? `Edycja wydarzenia #${event.id}` : 'Nowe wydarzenie',
    admin: request.session.admin,
    mode,
    event,
    errors,
    action,
  });
}

function eventColumns(request) {
  return [
    { label: 'Tytul', value: event => truncate(event.title, 120) },
    { label: 'Data', value: event => formatDate(event.event_date) },
    { label: 'Godzina', value: event => formatTime(event.event_time) },
    {
      label: 'Akcje',
      html: true,
      value: event => `<a class="button button--ghost" href="${request.app.locals.adminUrl(`/events/${event.id}/edit`)}">Edytuj</a>`,
    },
  ];
}

function truncate(value, maxLength) {
  const text = String(value || '');
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pl-PL');
}

function formatTime(value) {
  if (!value) return '-';
  return String(value).slice(0, 5);
}

module.exports = { create, destroy, editForm, index, newForm, update };
