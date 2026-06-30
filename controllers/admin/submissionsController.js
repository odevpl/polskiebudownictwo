const Submission = require('../../models/Submission');

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
      error: 'Nie udalo sie pobrac zgloszen. Sprawdz konfiguracje bazy danych.',
    });
  }
}

async function show(request, response) {
  try {
    const submission = await Submission.findById(request.params.id);
    if (!submission) {
      response.status(404).send('Zgloszenie nie istnieje.');
      return;
    }

    response.render('admin/submissions/show', {
      title: `Zgloszenie #${submission.id}`,
      admin: request.session.admin,
      submission,
    });
  } catch (error) {
    console.error('Submission show error:', error);
    response.status(500).send('Nie udalo sie pobrac zgloszenia.');
  }
}

module.exports = {
  index,
  show,
};
