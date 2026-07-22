const Course = require('../../models/Course');
const CourseAccess = require('../../models/CourseAccess');
const CourseLesson = require('../../models/CourseLesson');
const User = require('../../models/User');

async function coursesIndex(request, response) {
  try {
    const courses = await Course.findAll();
    return response.render('admin/academy/courses/index', { title: 'Akademia', admin: request.session.admin, courses, error: null });
  } catch (error) {
    console.error('Admin academy courses error:', error);
    return response.status(500).render('admin/academy/courses/index', { title: 'Akademia', admin: request.session.admin, courses: [], error: 'Nie udało się pobrać kursów.' });
  }
}

function newCourse(request, response) {
  renderCourseForm(response, request, emptyCourse(), 'create', []);
}

async function editCourse(request, response) {
  try {
    const course = await Course.findById(request.params.id);
    if (!course) return response.status(404).send('Kurs nie istnieje.');
    return renderCourseForm(response, request, course, 'edit', []);
  } catch (error) {
    console.error('Admin academy course edit error:', error);
    return response.status(500).send('Nie udało się pobrać kursu.');
  }
}

async function createCourse(request, response) {
  const data = courseFromBody(request.body);
  const errors = validateCourse(data);
  if (errors.length) return renderCourseForm(response, request, data, 'create', errors, 422);
  try {
    const course = await Course.create(data);
    return response.redirect(request.app.locals.adminUrl(`/academy/courses/${course.id}/edit`));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return renderCourseForm(response, request, data, 'create', ['Slug kursu musi być unikalny.'], 409);
    console.error('Admin academy course create error:', error);
    return response.status(500).send('Nie udało się dodać kursu.');
  }
}

async function updateCourse(request, response) {
  const data = courseFromBody(request.body);
  const errors = validateCourse(data);
  if (errors.length) return renderCourseForm(response, request, { id: request.params.id, ...data }, 'edit', errors, 422);
  try {
    const course = await Course.update(request.params.id, data);
    if (!course) return response.status(404).send('Kurs nie istnieje.');
    return response.redirect(request.app.locals.adminUrl(`/academy/courses/${course.id}/edit`));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return renderCourseForm(response, request, { id: request.params.id, ...data }, 'edit', ['Slug kursu musi być unikalny.'], 409);
    console.error('Admin academy course update error:', error);
    return response.status(500).send('Nie udało się zapisać kursu.');
  }
}

async function deleteCourse(request, response) {
  try {
    await Course.remove(request.params.id);
    return response.redirect(request.app.locals.adminUrl('/academy/courses'));
  } catch (error) {
    console.error('Admin academy course delete error:', error);
    return response.status(500).send('Nie udało się usunąć kursu.');
  }
}

async function lessonsIndex(request, response) {
  try {
    const course = await Course.findById(request.params.courseId);
    if (!course) return response.status(404).send('Kurs nie istnieje.');
    const lessons = await CourseLesson.findByCourseId(course.id);
    return response.render('admin/academy/lessons/index', { title: `Lekcje: ${course.title}`, admin: request.session.admin, course, lessons, error: null });
  } catch (error) {
    console.error('Admin academy lessons error:', error);
    return response.status(500).send('Nie udało się pobrać lekcji.');
  }
}

async function newLesson(request, response) {
  const course = await Course.findById(request.params.courseId);
  if (!course) return response.status(404).send('Kurs nie istnieje.');
  renderLessonForm(response, request, course, emptyLesson(course.id), 'create', []);
}

async function editLesson(request, response) {
  try {
    const lesson = await CourseLesson.findById(request.params.id);
    if (!lesson) return response.status(404).send('Lekcja nie istnieje.');
    const course = await Course.findById(lesson.course_id);
    return renderLessonForm(response, request, course, lesson, 'edit', []);
  } catch (error) {
    console.error('Admin academy lesson edit error:', error);
    return response.status(500).send('Nie udało się pobrać lekcji.');
  }
}

async function createLesson(request, response) {
  const course = await Course.findById(request.params.courseId);
  if (!course) return response.status(404).send('Kurs nie istnieje.');
  const data = lessonFromBody(request.body, course.id);
  const errors = validateLesson(data);
  if (errors.length) return renderLessonForm(response, request, course, data, 'create', errors, 422);
  try {
    const lesson = await CourseLesson.create(data);
    return response.redirect(request.app.locals.adminUrl(`/academy/lessons/${lesson.id}/edit`));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return renderLessonForm(response, request, course, data, 'create', ['Slug lekcji musi być unikalny w tym kursie.'], 409);
    console.error('Admin academy lesson create error:', error);
    return response.status(500).send('Nie udało się dodać lekcji.');
  }
}

async function updateLesson(request, response) {
  const lesson = await CourseLesson.findById(request.params.id);
  if (!lesson) return response.status(404).send('Lekcja nie istnieje.');
  const course = await Course.findById(lesson.course_id);
  const data = lessonFromBody(request.body, lesson.course_id);
  const errors = validateLesson(data);
  if (errors.length) return renderLessonForm(response, request, course, { id: lesson.id, ...data }, 'edit', errors, 422);
  try {
    const updated = await CourseLesson.update(lesson.id, data);
    return response.redirect(request.app.locals.adminUrl(`/academy/lessons/${updated.id}/edit`));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return renderLessonForm(response, request, course, { id: lesson.id, ...data }, 'edit', ['Slug lekcji musi być unikalny w tym kursie.'], 409);
    console.error('Admin academy lesson update error:', error);
    return response.status(500).send('Nie udało się zapisać lekcji.');
  }
}

async function deleteLesson(request, response) {
  try {
    const lesson = await CourseLesson.findById(request.params.id);
    if (!lesson) return response.status(404).send('Lekcja nie istnieje.');
    await CourseLesson.remove(lesson.id);
    return response.redirect(request.app.locals.adminUrl(`/academy/courses/${lesson.course_id}/lessons`));
  } catch (error) {
    console.error('Admin academy lesson delete error:', error);
    return response.status(500).send('Nie udało się usunąć lekcji.');
  }
}

async function accessIndex(request, response) {
  try {
    const [courses, access, audit, users] = await Promise.all([Course.findAll(), CourseAccess.findAll(), CourseAccess.findAudit(), User.findAcademyUsers(request.query.search || '')]);
    return response.render('admin/academy/access/index', { title: 'Dostępy Akademii', admin: request.session.admin, courses, access, audit, users, search: request.query.search || '', errors: [] });
  } catch (error) {
    console.error('Admin academy access error:', error);
    return response.status(500).send('Nie udało się pobrać dostępów.');
  }
}

async function usersIndex(request, response) {
  try {
    const users = await User.findAcademySummary(request.query.search || '');
    if (request.session.admin.role !== 'superadmin') {
      users.forEach(user => {
        user.billing_type = null;
        user.company_name = null;
        user.nip = null;
        user.billing_email = null;
      });
    }
    return response.render('admin/academy/users/index', { title: 'Użytkownicy Akademii', admin: request.session.admin, users, search: request.query.search || '', error: null });
  } catch (error) {
    console.error('Admin academy users error:', error);
    return response.status(500).send('Nie udało się pobrać użytkowników.');
  }
}

async function grantAccess(request, response) {
  const email = String(request.body.email || '').trim().toLowerCase();
  const courseId = Number(request.body.courseId);
  const accessType = String(request.body.accessType || 'grant');
  const expiresAt = String(request.body.expiresAt || '').trim() || null;
  const errors = [];
  if (!email || !email.includes('@')) errors.push('Podaj poprawny e-mail użytkownika.');
  if (!Number.isSafeInteger(courseId) || courseId < 1) errors.push('Wybierz kurs.');
  if (!['free', 'purchase', 'grant', 'code'].includes(accessType)) errors.push('Nieprawidłowy typ dostępu.');
  if (errors.length) return renderAccessWithErrors(request, response, errors, 422);
  try {
    const [user, course] = await Promise.all([User.findByEmail(email), Course.findById(courseId)]);
    if (!user) return renderAccessWithErrors(request, response, ['Nie znaleziono użytkownika o tym adresie.'], 404);
    if (!course) return renderAccessWithErrors(request, response, ['Wybrany kurs nie istnieje.'], 404);
    await CourseAccess.grant(user.id, course.id, { accessType, expiresAt, grantedByAdminId: request.session.admin.id });
    return response.redirect(request.app.locals.adminUrl('/academy/access'));
  } catch (error) {
    console.error('Admin academy grant access error:', error);
    return response.status(500).send('Nie udało się nadać dostępu.');
  }
}

async function revokeAccess(request, response) {
  try {
    await CourseAccess.revoke(request.params.userId, request.params.courseId, String(request.body.reason || '').trim() || null, request.session.admin.id);
    return response.redirect(request.app.locals.adminUrl('/academy/access'));
  } catch (error) {
    console.error('Admin academy revoke access error:', error);
    return response.status(500).send('Nie udało się odebrać dostępu.');
  }
}

async function deactivateUser(request, response) {
  try {
    await User.deactivate(request.params.id);
    return response.redirect(request.app.locals.adminUrl('/academy/users'));
  } catch (error) {
    console.error('Admin academy user deactivation error:', error);
    return response.status(500).send('Nie udało się dezaktywować konta.');
  }
}

function renderCourseForm(response, request, course, mode, errors, status = 200) {
  return response.status(status).render('admin/academy/courses/form', { title: mode === 'edit' ? `Edycja kursu #${course.id}` : 'Nowy kurs', admin: request.session.admin, course, mode, errors, action: request.app.locals.adminUrl(mode === 'edit' ? `/academy/courses/${course.id}/edit` : '/academy/courses/new') });
}

function renderLessonForm(response, request, course, lesson, mode, errors, status = 200) {
  return response.status(status).render('admin/academy/lessons/form', { title: mode === 'edit' ? `Edycja lekcji #${lesson.id}` : 'Nowa lekcja', admin: request.session.admin, course, lesson, mode, errors, action: request.app.locals.adminUrl(mode === 'edit' ? `/academy/lessons/${lesson.id}/edit` : `/academy/courses/${course.id}/lessons/new`) });
}

async function renderAccessWithErrors(request, response, errors, status) {
  const [courses, access, audit, users] = await Promise.all([Course.findAll(), CourseAccess.findAll(), CourseAccess.findAudit(), User.findAcademyUsers(request.body.email || '')]);
  return response.status(status).render('admin/academy/access/index', { title: 'Dostępy Akademii', admin: request.session.admin, courses, access, audit, users, search: request.body.email || '', errors });
}

function courseFromBody(body) {
  return { slug: String(body.slug || '').trim().toLowerCase(), title: String(body.title || '').trim(), description: String(body.description || '').trim(), category: String(body.category || '').trim(), level: String(body.level || '').trim(), lessonCount: body.lessonCount === undefined ? null : Number(body.lessonCount || 0), isFree: Boolean(body.isFree), isActive: Boolean(body.isActive), sortOrder: Number(body.sortOrder || 0) };
}

function lessonFromBody(body, courseId) {
  return { courseId, slug: String(body.slug || '').trim().toLowerCase(), title: String(body.title || '').trim(), description: String(body.description || '').trim(), contentType: String(body.contentType || 'text'), content: String(body.content || ''), sortOrder: Number(body.sortOrder || 0), isPublished: Boolean(body.isPublished) };
}

function validateCourse(data) {
  const errors = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) errors.push('Slug może zawierać małe litery, cyfry i myślniki.');
  if (!data.title || data.title.length > 255) errors.push('Podaj tytuł kursu (maksymalnie 255 znaków).');
  if (!data.description) errors.push('Podaj opis kursu.');
  if (!Number.isSafeInteger(data.sortOrder) || data.sortOrder < 0) errors.push('Kolejność musi być liczbą nieujemną.');
  return errors;
}

function validateLesson(data) {
  const errors = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) errors.push('Slug może zawierać małe litery, cyfry i myślniki.');
  if (!data.title || data.title.length > 255) errors.push('Podaj tytuł lekcji.');
  if (!['text', 'video', 'material'].includes(data.contentType)) errors.push('Wybierz typ treści.');
  if (!Number.isSafeInteger(data.sortOrder) || data.sortOrder < 0) errors.push('Kolejność musi być liczbą nieujemną.');
  return errors;
}

function emptyCourse() { return { slug: '', title: '', description: '', category: '', level: '', lesson_count: 0, is_free: 0, is_active: 0, sort_order: 0 }; }
function emptyLesson(courseId) { return { course_id: courseId, slug: '', title: '', description: '', content_type: 'text', content: '', sort_order: 0, is_published: 0 }; }

module.exports = { accessIndex, coursesIndex, createCourse, createLesson, deactivateUser, deleteCourse, deleteLesson, editCourse, editLesson, grantAccess, lessonsIndex, newCourse, newLesson, revokeAccess, updateCourse, updateLesson, usersIndex };
