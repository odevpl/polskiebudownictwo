const lessonAttachments = require('../../services/lessonAttachmentService');
const { FileError, config: fileConfig } = require('../../modules/files/config');
const Course = require('../../models/Course');
const CourseAccess = require('../../models/CourseAccess');
const CourseLesson = require('../../models/CourseLesson');
const CourseModule = require('../../models/CourseModule');
const User = require('../../models/User');
const Order = require('../../models/Order');
const przelewy24Provider = require('../../services/przelewy24Provider');
const { normalizeForStorage, youtubeVideoId } = require('../../modules/courseContent');

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

async function modulesIndex(request, response) {
  try {
    const course = await Course.findById(request.params.courseId);
    if (!course) return response.status(404).send('Kurs nie istnieje.');
    const modules = await CourseModule.findByCourseId(course.id);
    return response.render('admin/academy/modules/index', { title: `Moduły: ${course.title}`, admin: request.session.admin, course, modules, error: null });
  } catch (error) {
    console.error('Admin academy modules error:', error);
    return response.status(500).send('Nie udało się pobrać modułów.');
  }
}

async function newModule(request, response) {
  try {
    const course = await Course.findById(request.params.courseId);
    if (!course) return response.status(404).send('Kurs nie istnieje.');
    return renderModuleForm(response, request, course, emptyModule(course.id), 'create', []);
  } catch (error) {
    console.error('Admin academy new module error:', error);
    return response.status(500).send('Nie udało się pobrać kursu.');
  }
}

async function editModule(request, response) {
  try {
    const module = await CourseModule.findById(request.params.id);
    if (!module) return response.status(404).send('Moduł nie istnieje.');
    const course = await Course.findById(module.course_id);
    return renderModuleForm(response, request, course, module, 'edit', []);
  } catch (error) { return response.status(500).send('Nie udało się pobrać modułu.'); }
}

async function createModule(request, response) {
  const course = await Course.findById(request.params.courseId);
  if (!course) return response.status(404).send('Kurs nie istnieje.');
  const data = moduleFromBody(request.body, course.id);
  const errors = validateModule(data);
  if (errors.length) return renderModuleForm(response, request, course, data, 'create', errors, 422);
  try {
    const module = await CourseModule.create(data);
    return response.redirect(request.app.locals.adminUrl(`/academy/modules/${module.id}/edit`));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return renderModuleForm(response, request, course, data, 'create', ['Slug modułu musi być unikalny w tym szkoleniu.'], 409);
    return response.status(500).send('Nie udało się dodać modułu.');
  }
}

async function updateModule(request, response) {
  const module = await CourseModule.findById(request.params.id);
  if (!module) return response.status(404).send('Moduł nie istnieje.');
  const course = await Course.findById(module.course_id);
  const data = moduleFromBody(request.body, module.course_id);
  const errors = validateModule(data);
  if (errors.length) return renderModuleForm(response, request, course, { id: module.id, ...data }, 'edit', errors, 422);
  try {
    const updated = await CourseModule.update(module.id, data);
    return response.redirect(request.app.locals.adminUrl(`/academy/modules/${updated.id}/edit`));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return renderModuleForm(response, request, course, { id: module.id, ...data }, 'edit', ['Slug modułu musi być unikalny w tym szkoleniu.'], 409);
    return response.status(500).send('Nie udało się zapisać modułu.');
  }
}

async function deleteModule(request, response) {
  const module = await CourseModule.findById(request.params.id);
  if (!module) return response.status(404).send('Moduł nie istnieje.');
  await CourseModule.remove(module.id);
  return response.redirect(request.app.locals.adminUrl(`/academy/courses/${module.course_id}/modules`));
}

async function lessonsIndex(request, response) {
  try {
    const course = await Course.findById(request.params.courseId);
    if (!course) return response.status(404).send('Kurs nie istnieje.');
    const lessons = await CourseLesson.findByCourseId(course.id);
    return response.render('admin/academy/lessons/index', { title: `Lekcje: ${course.title}`, admin: request.session.admin, course, module: null, lessons, error: null });
  } catch (error) {
    console.error('Admin academy lessons error:', error);
    return response.status(500).send('Nie udało się pobrać lekcji.');
  }
}

async function moduleLessonsIndex(request, response) {
  try {
    const module = await CourseModule.findById(request.params.moduleId);
    if (!module) return response.status(404).send('Moduł nie istnieje.');
    const course = await Course.findById(module.course_id);
    const lessons = await CourseLesson.findByModuleId(module.id);
    return response.render('admin/academy/lessons/index', { title: `Lekcje: ${module.title}`, admin: request.session.admin, course, module, lessons, error: null });
  } catch (error) { return response.status(500).send('Nie udało się pobrać lekcji.'); }
}

async function newLesson(request, response) {
  const course = await Course.findById(request.params.courseId);
  if (!course) return response.status(404).send('Kurs nie istnieje.');
  const module = request.params.moduleId ? await CourseModule.findById(request.params.moduleId) : null;
  if (request.params.moduleId && (!module || module.course_id !== course.id)) return response.status(404).send('Moduł nie istnieje.');
  renderLessonForm(response, request, course, emptyLesson(course.id, module?.id), 'create', [], 200, module);
}

async function newModuleLesson(request, response) {
  request.params.courseId = String((await CourseModule.findById(request.params.moduleId))?.course_id || '');
  return newLesson(request, response);
}

async function editLesson(request, response) {
  try {
    const lesson = await CourseLesson.findById(request.params.id);
    if (!lesson) return response.status(404).send('Lekcja nie istnieje.');
    const course = await Course.findById(lesson.course_id);
    const module = lesson.module_id ? await CourseModule.findById(lesson.module_id) : null;
    return renderLessonForm(response, request, course, lessonForForm(lesson), 'edit', [], 200, module);
  } catch (error) {
    console.error('Admin academy lesson edit error:', error);
    return response.status(500).send('Nie udało się pobrać lekcji.');
  }
}

async function createLesson(request, response) {
  const course = await Course.findById(request.params.courseId);
  if (!course) return response.status(404).send('Kurs nie istnieje.');
  const module = request.params.moduleId ? await CourseModule.findById(request.params.moduleId) : null;
  if (request.params.moduleId && (!module || module.course_id !== course.id)) return response.status(404).send('Moduł nie istnieje.');
  const data = lessonFromBody(request.body, course.id, module?.id);
  data.adminId = request.session.admin.id;
  const errors = [...validateLesson(data), ...validateContentBlocks(data)];
  if (errors.length) return renderLessonForm(response, request, course, data, 'create', errors, 422, module);
  try {
    const lesson = await CourseLesson.create(data);
    return response.redirect(request.app.locals.adminUrl(`/academy/lessons/${lesson.id}/edit`));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return renderLessonForm(response, request, course, data, 'create', ['Slug lekcji musi być unikalny w tym kursie.'], 409, module);
    if (error instanceof FileError) return renderLessonForm(response, request, course, data, 'create', [error.message], error.status, module);
    console.error('Admin academy lesson create error:', error);
    return response.status(500).send('Nie udało się dodać lekcji.');
  }
}

async function createModuleLesson(request, response) {
  request.params.courseId = String((await CourseModule.findById(request.params.moduleId))?.course_id || '');
  return createLesson(request, response);
}

async function updateLesson(request, response) {
  const lesson = await CourseLesson.findById(request.params.id);
  if (!lesson) return response.status(404).send('Lekcja nie istnieje.');
  const course = await Course.findById(lesson.course_id);
  const data = lessonFromBody(request.body, lesson.course_id, lesson.module_id);
  data.adminId = request.session.admin.id;
  const errors = [...validateLesson(data), ...validateContentBlocks(data)];
  if (errors.length) return renderLessonForm(response, request, course, { id: lesson.id, ...data }, 'edit', errors, 422, lesson.module_id ? await CourseModule.findById(lesson.module_id) : null);
  try {
    const updated = await CourseLesson.update(lesson.id, data);
    return response.redirect(request.app.locals.adminUrl(`/academy/lessons/${updated.id}/edit`));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return renderLessonForm(response, request, course, { id: lesson.id, ...data }, 'edit', ['Slug lekcji musi być unikalny w tym kursie.'], 409, lesson.module_id ? await CourseModule.findById(lesson.module_id) : null);
    if (error instanceof FileError) return renderLessonForm(response, request, course, { id: lesson.id, ...data }, 'edit', [error.message], error.status, lesson.module_id ? await CourseModule.findById(lesson.module_id) : null);
    console.error('Admin academy lesson update error:', error);
    return response.status(500).send('Nie udało się zapisać lekcji.');
  }
}

async function deleteLesson(request, response) {
  try {
    const lesson = await CourseLesson.findById(request.params.id);
    if (!lesson) return response.status(404).send('Lekcja nie istnieje.');
    await CourseLesson.remove(lesson.id);
    const target = lesson.module_id
      ? `/academy/modules/${lesson.module_id}/lessons`
      : `/academy/courses/${lesson.course_id}/lessons`;
    return response.redirect(request.app.locals.adminUrl(target));
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

async function ordersIndex(request, response) {
  try {
    const filters = { status: String(request.query.status || ''), search: String(request.query.search || '') };
    const orders = await Order.findAdminAll(filters);
    return response.render('admin/academy/orders/index', { title: 'Zamówienia Akademii', admin: request.session.admin, orders, ...filters });
  } catch (error) { console.error('Admin academy orders error:', error); return response.status(500).send('Nie udało się pobrać zamówień.'); }
}

async function orderDetail(request, response) {
  try {
    const order = await Order.findById(request.params.id);
    if (!order) return response.status(404).send('Zamówienie nie istnieje.');
    const events = await Order.findPaymentEvents(order.order_number);
    return response.render('admin/academy/orders/detail', { title: `Zamówienie #${order.order_number}`, admin: request.session.admin, order, events });
  } catch (error) { console.error('Admin academy order detail error:', error); return response.status(500).send('Nie udało się pobrać zamówienia.'); }
}

async function requestOrderRefund(request, response) {
  try {
    const order = await Order.findById(request.params.id);
    if (!order || order.status !== 'paid' || order.payment_provider !== 'przelewy24' || !order.provider_payment_id || order.refund_requested_at) {
      return response.status(409).send('Zwrot nie może zostać rozpoczęty dla tego zamówienia.');
    }
    const refund = await przelewy24Provider.requestRefund(order, request);
    await Order.markRefundRequested(order.id, refund.requestId);
    return response.redirect(request.app.locals.adminUrl(`/academy/orders/${order.id}`));
  } catch (error) { console.error('Admin academy refund request error:', error); return response.status(502).send('Nie udało się rozpocząć zwrotu w Przelewy24.'); }
}

function renderCourseForm(response, request, course, mode, errors, status = 200) {
  return response.status(status).render('admin/academy/courses/form', { title: mode === 'edit' ? `Edycja kursu #${course.id}` : 'Nowy kurs', admin: request.session.admin, course, mode, errors, action: request.app.locals.adminUrl(mode === 'edit' ? `/academy/courses/${course.id}/edit` : '/academy/courses/new') });
}

function renderModuleForm(response, request, course, module, mode, errors, status = 200) {
  return response.status(status).render('admin/academy/modules/form', { title: mode === 'edit' ? `Edycja modułu #${module.id}` : 'Nowy moduł', admin: request.session.admin, course, module, mode, errors, action: request.app.locals.adminUrl(mode === 'edit' ? `/academy/modules/${module.id}/edit` : `/academy/courses/${course.id}/modules/new`) });
}

async function renderLessonForm(response, request, course, lesson, mode, errors, status = 200, module = null) {
  try {
  lesson = { ...lesson, contentBlocks: await lessonAttachments.hydrate(lesson, request.session.admin.id, request.app.locals.adminUrl) };
  const settings = fileConfig();
  const fileManagerConfig = { uploadUrl: request.app.locals.adminUrl('/files'), maxBytes: settings.maxBytes, lessonFiles: settings.lessonFiles, lessonBytes: settings.lessonBytes, maxBlocks: settings.maxBlocks, accept: settings.docx ? '.pdf,.jpg,.jpeg,.webp,.docx' : '.pdf,.jpg,.jpeg,.webp' };
  return response.status(status).render('admin/academy/lessons/form', { fileManagerConfig, title: mode === 'edit' ? `Edycja lekcji #${lesson.id}` : 'Nowa lekcja', admin: request.session.admin, course, module, lesson, mode, errors, action: request.app.locals.adminUrl(mode === 'edit' ? `/academy/lessons/${lesson.id}/edit` : module ? `/academy/modules/${module.id}/lessons/new` : `/academy/courses/${course.id}/lessons/new`) });
  } catch (error) {
    console.error('Lesson file metadata error:', error.code || error.name);
    return response.status(500).send('Nie udało się wczytać materiałów lekcji.');
  }
}

async function renderAccessWithErrors(request, response, errors, status) {
  const [courses, access, audit, users] = await Promise.all([Course.findAll(), CourseAccess.findAll(), CourseAccess.findAudit(), User.findAcademyUsers(request.body.email || '')]);
  return response.status(status).render('admin/academy/access/index', { title: 'Dostępy Akademii', admin: request.session.admin, courses, access, audit, users, search: request.body.email || '', errors });
}

function courseFromBody(body) {
  return { slug: String(body.slug || '').trim().toLowerCase(), title: String(body.title || '').trim(), description: String(body.description || '').trim(), category: String(body.category || '').trim(), level: String(body.level || '').trim(), priceAmount: body.priceAmount === undefined ? null : Number(body.priceAmount || 0), currency: String(body.currency || 'PLN').trim().toUpperCase(), lessonCount: body.lessonCount === undefined ? null : Number(body.lessonCount || 0), isFree: Boolean(body.isFree), isActive: Boolean(body.isActive), sortOrder: Number(body.sortOrder || 0) };
}

function lessonFromBody(body, courseId, moduleId = null) {
  const contentBlocks = normalizeForStorage(body.contentBlocks, body.content);
  return { courseId, moduleId, slug: String(body.slug || '').trim().toLowerCase(), title: String(body.title || '').trim(), description: String(body.description || '').trim(), contentType: String(body.contentType || 'text'), content: String(body.content || ''), rawContentBlocks: body.contentBlocks, contentBlocks, sortOrder: Number(body.sortOrder || 0), isPublished: Boolean(body.isPublished) };
}

function validateCourse(data) {
  const errors = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) errors.push('Slug może zawierać małe litery, cyfry i myślniki.');
  if (!data.title || data.title.length > 255) errors.push('Podaj tytuł kursu (maksymalnie 255 znaków).');
  if (!data.description) errors.push('Podaj opis kursu.');
  if (data.priceAmount !== null && (!Number.isFinite(data.priceAmount) || data.priceAmount < 0)) errors.push('Cena musi być liczbą nieujemną.');
  if (!/^[A-Z]{3}$/.test(data.currency)) errors.push('Waluta musi mieć 3 wielkie litery.');
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
function emptyModule(courseId) { return { course_id: courseId, slug: '', title: '', description: '', image_url: '', sort_order: 0, is_published: 0 }; }
function emptyLesson(courseId, moduleId = null) { return { course_id: courseId, module_id: moduleId, slug: '', title: '', description: '', content_type: 'text', content: '', contentBlocks: [], sort_order: 0, is_published: 0 }; }

function moduleFromBody(body, courseId) {
  return { courseId, slug: String(body.slug || '').trim().toLowerCase(), title: String(body.title || '').trim(), description: String(body.description || '').trim(), imageUrl: String(body.imageUrl || '').trim(), sortOrder: Number(body.sortOrder || 0), isPublished: Boolean(body.isPublished) };
}

function validateModule(data) {
  const errors = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) errors.push('Slug może zawierać małe litery, cyfry i myślniki.');
  if (!data.title || data.title.length > 255) errors.push('Podaj tytuł modułu.');
  if (!Number.isSafeInteger(data.sortOrder) || data.sortOrder < 0) errors.push('Kolejność musi być liczbą nieujemną.');
  return errors;
}

function lessonForForm(lesson) {
  return { ...lesson, contentBlocks: normalizeForStorage(lesson.content_blocks, lesson.content) };
}

function validateContentBlocks(data) {
  const errors = [];
  let blocks;
  try { blocks = Array.isArray(data.rawContentBlocks) ? data.rawContentBlocks : JSON.parse(String(data.rawContentBlocks || '[]')); } catch { return ['Treść modułu ma nieprawidłowy format.']; }
  if (!Array.isArray(blocks)) return ['Treść modułu ma nieprawidłowy format.'];
  try { lessonAttachments.validateBlocks(blocks); } catch (error) { errors.push(error.message); }
  blocks.filter(block => block?.type === 'youtube').forEach(block => {
    const url = block.data?.url || block.url || block.data?.videoId || block.videoId;
    if (!youtubeVideoId(url)) errors.push('Podaj poprawny adres filmu YouTube w bloku wideo.');
  });
  return errors;
}

module.exports = { accessIndex, coursesIndex, createCourse, createLesson, createModule, createModuleLesson, deactivateUser, deleteCourse, deleteLesson, deleteModule, editCourse, editLesson, editModule, grantAccess, lessonsIndex, moduleLessonsIndex, modulesIndex, newCourse, newLesson, newModule, newModuleLesson, orderDetail, ordersIndex, requestOrderRefund, revokeAccess, updateCourse, updateLesson, usersIndex, updateModule };
