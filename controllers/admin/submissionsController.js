const Submission = require('../../models/Submission');
const { allowedRoles } = require('../../middleware/validate');

const companySizes = ['1-2', '3-10', '11-50', '51-250', '250+'];
const statuses = ['new', 'contacted', 'member'];
const statusTags = ['Akademia'];
const internalGroups = [
  'Ambasador Polskiego Budownictwa',
  'Mediator Polskiego Budownictwa',
  'Partner',
  'Mecenas',
];
const exportColumns = [
  { key: 'id', label: 'ID', value: row => row.id },
  { key: 'first_name', label: 'Imie', value: row => row.first_name },
  { key: 'last_name', label: 'Nazwisko', value: row => row.last_name },
  { key: 'company_name', label: 'Nazwa firmy', value: row => row.company_name },
  { key: 'email', label: 'E-mail', value: row => row.email },
  { key: 'phone', label: 'Telefon', value: row => row.phone },
  { key: 'roles', label: 'Role w branzy', value: row => row.roles.join(', ') },
  { key: 'groups', label: 'Grupy', value: row => row.groups.join(', ') },
  { key: 'company_size', label: 'Wielkosc firmy', value: row => row.company_size },
  { key: 'status', label: 'Status', value: row => row.status },
  { key: 'status_tags', label: 'Statusy dodatkowe', value: row => row.status_tags.join(', ') },
  { key: 'notes', label: 'Notatki', value: row => row.notes },
  { key: 'consent_data', label: 'Zgoda dane', value: row => row.consent_data ? 'Tak' : 'Nie' },
  { key: 'consent_marketing', label: 'Zgoda marketing', value: row => row.consent_marketing ? 'Tak' : 'Nie' },
  { key: 'ip_address', label: 'IP', value: row => row.ip_address },
  { key: 'created_at', label: 'Data utworzenia', value: row => formatDate(row.created_at) },
  { key: 'updated_at', label: 'Data aktualizacji', value: row => formatDate(row.updated_at) },
];
const mailerLiteExportColumns = [
  { label: 'Email', value: row => row.email },
  { label: 'Name', value: row => row.first_name },
  { label: 'Last name', value: row => row.last_name },
  { label: 'Company', value: row => row.company_name },
  { label: 'Country', value: () => '' },
  { label: 'City', value: () => '' },
  { label: 'Phone', value: row => row.phone },
  { label: 'State', value: () => '' },
  { label: 'Zip', value: () => '' },
  { label: 'Group', value: row => row.roles.join(', ') },
];

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function submissionFromBody(body) {
  const roles = normalizeArray(body.roles).filter(role => allowedRoles.includes(role));
  const groups = normalizeArray(body.groups).filter(group => internalGroups.includes(group));
  const selectedStatusTags = normalizeArray(body.statusTags).filter(tag => statusTags.includes(tag));

  return {
    firstName: String(body.firstName || '').trim(),
    lastName: String(body.lastName || '').trim(),
    companyName: String(body.companyName || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    phone: String(body.phone || '').trim(),
    roles,
    groups,
    statusTags: selectedStatusTags,
    companySize: companySizes.includes(body.companySize) ? body.companySize : null,
    consentData: Boolean(body.consentData),
    consentMarketing: Boolean(body.consentMarketing),
    notes: String(body.notes || '').trim(),
    status: statuses.includes(body.status) ? body.status : 'new',
  };
}

function validateSubmission(data) {
  const errors = [];
  if (!data.firstName) errors.push('Podaj imie.');
  if (!data.lastName) errors.push('Podaj nazwisko.');
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
    internalGroups,
    statuses,
    statusTags,
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
    const totalPages = Math.max(Math.ceil(result.total / result.limit), 1);
    response.render('admin/submissions/index', {
      title: 'Zgloszenia',
      admin: request.session.admin,
      submissions: result.rows.map(row => ({
        ...row,
        submitted_date: formatDateOnly(row.created_at),
      })),
      filters,
      pagination: { ...result, totalPages },
      pageUrl: page => submissionsPageUrl(request, page),
      exportColumns,
      tableColumns: submissionTableColumns(request),
      error: null,
    });
  } catch (error) {
    console.error('Submissions list error:', error);
    response.status(500).render('admin/submissions/index', {
      title: 'Zgloszenia',
      admin: request.session.admin,
      submissions: [],
      filters,
      pagination: { total: 0, page: 1, limit: 25, totalPages: 1 },
      pageUrl: page => submissionsPageUrl(request, page),
      exportColumns,
      tableColumns: submissionTableColumns(request),
      error: 'Nie udalo sie pobrac zgloszen. Sprawdz konfiguracje bazy danych.',
    });
  }
}

function submissionsPageUrl(request, page) {
  const params = new URLSearchParams();
  if (request.query.search) params.set('search', request.query.search);
  if (request.query.status) params.set('status', request.query.status);
  params.set('page', String(page));
  return `${request.app.locals.adminUrl('/submissions')}?${params.toString()}`;
}

function newForm(request, response) {
  response.render('admin/submissions/form', {
    title: 'Nowe zgloszenie',
    admin: request.session.admin,
    mode: 'create',
    action: request.app.locals.adminUrl('/submissions/new'),
    submission: {
      first_name: '',
      last_name: '',
      company_name: '',
      email: '',
      phone: '',
      roles: [],
      groups: [],
      status_tags: [],
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
    const existingSubmission = await Submission.findByEmail(data.email);
    if (existingSubmission) {
      response.status(409).render('admin/submissions/form', {
        title: 'Nowe zgloszenie',
        admin: request.session.admin,
        mode: 'create',
        action: request.app.locals.adminUrl('/submissions/new'),
        submission: bodyToView(data),
        errors: ['Ten adres e-mail jest juz zapisany.'],
        ...formOptions(),
      });
      return;
    }

    const submission = await Submission.create({
      ...data,
      ipAddress: request.ip,
    });
    response.redirect(request.app.locals.adminUrl(`/submissions/${submission.id}`));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      response.status(409).render('admin/submissions/form', {
        title: 'Nowe zgloszenie',
        admin: request.session.admin,
        mode: 'create',
        action: request.app.locals.adminUrl('/submissions/new'),
        submission: bodyToView(data),
        errors: ['Ten adres e-mail jest juz zapisany.'],
        ...formOptions(),
      });
      return;
    }

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
    const existingSubmission = await Submission.findByEmail(data.email, id);
    if (existingSubmission) {
      response.status(409).render('admin/submissions/form', {
        title: `Edycja #${id}`,
        admin: request.session.admin,
        mode: 'edit',
        action: request.app.locals.adminUrl(`/submissions/${id}/edit`),
        submission: { id, ...bodyToView(data) },
        errors: ['Ten adres e-mail jest juz przypisany do innego zgloszenia.'],
        ...formOptions(),
      });
      return;
    }

    const submission = await Submission.update(id, data);
    if (!submission) {
      response.status(404).send('Zgloszenie nie istnieje.');
      return;
    }

    response.redirect(request.app.locals.adminUrl(`/submissions/${id}`));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      response.status(409).render('admin/submissions/form', {
        title: `Edycja #${id}`,
        admin: request.session.admin,
        mode: 'edit',
        action: request.app.locals.adminUrl(`/submissions/${id}/edit`),
        submission: { id, ...bodyToView(data) },
        errors: ['Ten adres e-mail jest juz przypisany do innego zgloszenia.'],
        ...formOptions(),
      });
      return;
    }

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
    const filename = `zgloszenia-${stamp}.csv`;

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);
    response.send(`\uFEFF${csv}`);
  } catch (error) {
    console.error('Submission export error:', error);
    response.status(500).send('Nie udalo sie wygenerowac pliku CSV.');
  }
}

async function exportMailerLiteCsv(request, response) {
  try {
    const submissions = await Submission.findForMailerLiteExport();
    const csv = buildCsv(submissions, mailerLiteExportColumns, ',');
    const stamp = new Date().toISOString().slice(0, 10);
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="zgloszenia-mailerlite-${stamp}.csv"`);
    response.send(`\uFEFF${csv}`);
  } catch (error) {
    console.error('MailerLite export error:', error);
    response.status(500).send('Nie udalo sie wygenerowac pliku CSV dla MailerLite.');
  }
}

function bodyToView(data) {
  return {
    first_name: data.firstName,
    last_name: data.lastName,
    company_name: data.companyName,
    email: data.email,
    phone: data.phone,
    roles: data.roles,
    groups: data.groups,
    status_tags: data.statusTags,
    company_size: data.companySize,
    consent_data: data.consentData ? 1 : 0,
    consent_marketing: data.consentMarketing ? 1 : 0,
    notes: data.notes,
    status: data.status,
  };
}

function buildCsv(rows, columns, separator = ';') {
  const header = columns.map(column => csvCell(column.label)).join(separator);
  const body = rows.map(row => (
    columns.map(column => csvCell(column.value(row) ?? '')).join(separator)
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

function formatDateOnly(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('pl-PL');
}

function submissionTableColumns(request) {
  return [
    { label: 'Imie', value: row => row.first_name || '-' },
    { label: 'Nazwisko', value: row => row.last_name || '-' },
    { label: 'Firma', value: row => row.company_name || '-' },
    { label: 'Data zapisania', value: row => row.submitted_date || '-' },
    { label: 'Role', value: row => row.roles.join(', ') || '-' },
    { label: 'Grupy', value: row => row.groups.join(', ') || '-' },
    { label: 'Statusy dodatkowe', value: row => row.status_tags.join(', ') || '-' },
    {
      label: 'Akcje',
      html: true,
      value: row => `<a class="button button--ghost" href="${request.app.locals.adminUrl(`/submissions/${row.id}/edit`)}">Edytuj</a>`,
    },
  ];
}

module.exports = {
  create,
  destroy,
  editForm,
  exportCsv,
  exportMailerLiteCsv,
  index,
  newForm,
  redirectToEdit,
  update,
};
