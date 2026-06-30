const Submission = require('../../models/Submission');
const { allowedRoles } = require('../../middleware/validate');

const companySizes = ['1-2', '3-10', '11-50', '51-250', '250+'];
const statuses = ['new', 'contacted', 'member'];
const exportColumns = [
  { key: 'id', label: 'ID', value: row => row.id },
  { key: 'full_name', label: 'Imie i nazwisko', value: row => row.full_name },
  { key: 'company_name', label: 'Nazwa firmy', value: row => row.company_name },
  { key: 'email', label: 'E-mail', value: row => row.email },
  { key: 'phone', label: 'Telefon', value: row => row.phone },
  { key: 'roles', label: 'Role w branzy', value: row => row.roles.join(', ') },
  { key: 'company_size', label: 'Wielkosc firmy', value: row => row.company_size },
  { key: 'status', label: 'Status', value: row => row.status },
  { key: 'notes', label: 'Notatki', value: row => row.notes },
  { key: 'consent_data', label: 'Zgoda dane', value: row => row.consent_data ? 'Tak' : 'Nie' },
  { key: 'consent_marketing', label: 'Zgoda marketing', value: row => row.consent_marketing ? 'Tak' : 'Nie' },
  { key: 'ip_address', label: 'IP', value: row => row.ip_address },
  { key: 'created_at', label: 'Data utworzenia', value: row => formatDate(row.created_at) },
  { key: 'updated_at', label: 'Data aktualizacji', value: row => formatDate(row.updated_at) },
];

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function submissionFromBody(body) {
  const roles = normalizeArray(body.roles).filter(role => allowedRoles.includes(role));

  return {
    fullName: String(body.fullName || '').trim(),
    companyName: String(body.companyName || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    phone: String(body.phone || '').trim(),
    roles,
    companySize: companySizes.includes(body.companySize) ? body.companySize : null,
    consentData: Boolean(body.consentData),
    consentMarketing: Boolean(body.consentMarketing),
    notes: String(body.notes || '').trim(),
    status: statuses.includes(body.status) ? body.status : 'new',
  };
}

function validateSubmission(data) {
  const errors = [];
  if (!data.fullName) errors.push('Podaj imie i nazwisko.');
  if (!data.companyName) errors.push('Podaj nazwe firmy.');
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Podaj poprawny adres e-mail.');
  if (!data.roles.length) errors.push('Wybierz co najmniej jedna role.');
  if (!data.companySize) errors.push('Wybierz wielkosc firmy.');
  if (!data.consentData) errors.push('Zgoda na obsluge danych jest wymagana.');
  if (!data.consentMarketing) errors.push('Zgoda marketingowa jest wymagana.');
  return errors;
}

function formOptions() {
  return {
    allowedRoles,
    companySizes,
    statuses,
  };
}

async function index(request, response) {
  const filters = {
    search: String(request.query.search || '').trim(),
    status: String(request.query.status || '').trim(),
    page: request.query.page,
  };

  try {
    const result = await Submission.findAll(filters);
    response.render('admin/submissions/index', {
      title: 'Zgloszenia',
      admin: request.session.admin,
      submissions: result.rows,
      filters,
      pagination: result,
      exportColumns,
      error: null,
    });
  } catch (error) {
    console.error('Submissions list error:', error);
    response.status(500).render('admin/submissions/index', {
      title: 'Zgloszenia',
      admin: request.session.admin,
      submissions: [],
      filters,
      pagination: { total: 0, page: 1, limit: 25 },
      exportColumns,
      error: 'Nie udalo sie pobrac zgloszen. Sprawdz konfiguracje bazy danych.',
    });
  }
}

function newForm(request, response) {
  response.render('admin/submissions/form', {
    title: 'Nowe zgloszenie',
    admin: request.session.admin,
    mode: 'create',
    action: request.app.locals.adminUrl('/submissions/new'),
    submission: {
      full_name: '',
      company_name: '',
      email: '',
      phone: '',
      roles: [],
      company_size: '',
      consent_data: 1,
      consent_marketing: 1,
      notes: '',
      status: 'new',
    },
    errors: [],
    ...formOptions(),
  });
}

async function create(request, response) {
  const data = submissionFromBody(request.body);
  const errors = validateSubmission(data);

  if (errors.length) {
    response.status(422).render('admin/submissions/form', {
      title: 'Nowe zgloszenie',
      admin: request.session.admin,
      mode: 'create',
      action: request.app.locals.adminUrl('/submissions/new'),
      submission: bodyToView(data),
      errors,
      ...formOptions(),
    });
    return;
  }

  try {
    const submission = await Submission.create({
      ...data,
      ipAddress: request.ip,
    });
    response.redirect(request.app.locals.adminUrl(`/submissions/${submission.id}`));
  } catch (error) {
    console.error('Submission create error:', error);
    response.status(500).send('Nie udalo sie dodac zgloszenia.');
  }
}

function redirectToEdit(request, response) {
  response.redirect(request.app.locals.adminUrl(`/submissions/${request.params.id}/edit`));
}

async function editForm(request, response) {
  try {
    const submission = await Submission.findById(request.params.id);
    if (!submission) {
      response.status(404).send('Zgloszenie nie istnieje.');
      return;
    }

    response.render('admin/submissions/form', {
      title: `Edycja #${submission.id}`,
      admin: request.session.admin,
      mode: 'edit',
      action: request.app.locals.adminUrl(`/submissions/${submission.id}/edit`),
      submission,
      errors: [],
      ...formOptions(),
    });
  } catch (error) {
    console.error('Submission edit error:', error);
    response.status(500).send('Nie udalo sie pobrac zgloszenia.');
  }
}

async function update(request, response) {
  const data = submissionFromBody(request.body);
  const errors = validateSubmission(data);
  const id = request.params.id;

  if (errors.length) {
    response.status(422).render('admin/submissions/form', {
      title: `Edycja #${id}`,
      admin: request.session.admin,
      mode: 'edit',
      action: request.app.locals.adminUrl(`/submissions/${id}/edit`),
      submission: { id, ...bodyToView(data) },
      errors,
      ...formOptions(),
    });
    return;
  }

  try {
    const submission = await Submission.update(id, data);
    if (!submission) {
      response.status(404).send('Zgloszenie nie istnieje.');
      return;
    }

    response.redirect(request.app.locals.adminUrl(`/submissions/${id}`));
  } catch (error) {
    console.error('Submission update error:', error);
    response.status(500).send('Nie udalo sie zapisac zgloszenia.');
  }
}

async function destroy(request, response) {
  try {
    await Submission.remove(request.params.id);
    response.redirect(request.app.locals.adminUrl('/submissions'));
  } catch (error) {
    console.error('Submission delete error:', error);
    response.status(500).send('Nie udalo sie usunac zgloszenia.');
  }
}

async function exportCsv(request, response) {
  const selectedKeys = normalizeArray(request.body.columns);
  const selectedColumns = exportColumns.filter(column => selectedKeys.includes(column.key));

  if (!selectedColumns.length) {
    response.status(422).send('Wybierz co najmniej jedna kolumne.');
    return;
  }

  try {
    const submissions = await Submission.findForExport();
    const csv = buildCsv(submissions, selectedColumns);
    const stamp = new Date().toISOString().slice(0, 10);

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename=\"zgloszenia-${stamp}.csv\"`);
    response.send(`\uFEFF${csv}`);
  } catch (error) {
    console.error('Submission export error:', error);
    response.status(500).send('Nie udalo sie wygenerowac pliku CSV.');
  }
}

function bodyToView(data) {
  return {
    full_name: data.fullName,
    company_name: data.companyName,
    email: data.email,
    phone: data.phone,
    roles: data.roles,
    company_size: data.companySize,
    consent_data: data.consentData ? 1 : 0,
    consent_marketing: data.consentMarketing ? 1 : 0,
    notes: data.notes,
    status: data.status,
  };
}

function buildCsv(rows, columns) {
  const header = columns.map(column => csvCell(column.label)).join(';');
  const body = rows.map(row => (
    columns.map(column => csvCell(column.value(row) ?? '')).join(';')
  ));

  return [header, ...body].join('\r\n');
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('pl-PL');
}

module.exports = {
  create,
  destroy,
  editForm,
  exportCsv,
  index,
  newForm,
  redirectToEdit,
  update,
};
