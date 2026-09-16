const lessonAttachments = require('../../services/lessonAttachmentService');
const Course = require('../../models/Course');
const CourseModule = require('../../models/CourseModule');
const CourseLesson = require('../../models/CourseLesson');
const LessonProgress = require('../../models/LessonProgress');
const courseAccessService = require('../../services/courseAccessService');
const { parseBlocks } = require('../../modules/courseContent');

async function course(request, response) {
  try {
    const record = await Course.findBySlug(request.params.slug);
    if (!record || !record.is_active) return response.status(404).send('Szkolenie nie istnieje.');
    if (!await courseAccessService.hasActiveAccess(request.session.user.id, record.id)) return response.status(403).send('Nie masz dostępu do tego szkolenia.');
    const modules = await CourseModule.findByCourseId(record.id, { publishedOnly: true });
    return response.render('public/academy/course', { title: record.title, course: record, modules });
  } catch (error) {
    console.error('Academy course page error:', error);
    return response.status(500).send('Nie udało się pobrać szkolenia.');
  }
}

async function modulePage(request, response) {
  try {
    const courseRecord = await getAccessibleCourse(request);
    if (!courseRecord) return response.status(404).send('Szkolenie nie istnieje.');
    const moduleRecord = await CourseModule.findBySlug(courseRecord.id, request.params.moduleSlug, { publishedOnly: true });
    if (!moduleRecord) return response.status(404).send('Moduł nie istnieje.');
    const lessons = await CourseLesson.findByModuleId(moduleRecord.id, { publishedOnly: true });
    return response.render('public/academy/module', { title: `${moduleRecord.title} | ${courseRecord.title}`, course: courseRecord, module: moduleRecord, lessons });
  } catch (error) {
    console.error('Academy module page error:', error);
    return response.status(500).send('Nie udało się pobrać modułu.');
  }
}

async function lesson(request, response) {
  try {
    const courseRecord = await getAccessibleCourse(request);
    if (!courseRecord) return response.status(404).send('Szkolenie nie istnieje.');
    const moduleRecord = await CourseModule.findBySlug(courseRecord.id, request.params.moduleSlug, { publishedOnly: true });
    if (!moduleRecord) return response.status(404).send('Moduł nie istnieje.');
    const [lessons, progress] = await Promise.all([
      CourseLesson.findByModuleId(moduleRecord.id, { publishedOnly: true }),
      LessonProgress.findByUserAndCourse(request.session.user.id, courseRecord.id),
    ]);
    const lessonRecord = lessons.find(item => item.slug === request.params.lessonSlug);
    if (!lessonRecord) return response.status(404).send('Lekcja nie istnieje.');
    const progressByLesson = new Map(progress.map(item => [item.lesson_id, item]));
    return response.render('public/academy/lesson', {
      title: lessonRecord.title,
      course: courseRecord,
      module: moduleRecord,
      lesson: { ...lessonRecord, contentBlocks: await lessonAttachments.hydrate(lessonRecord) },
      lessons: lessons.map(item => ({ ...item, progress: progressByLesson.get(item.id) || null })),
      progress: progressByLesson.get(lessonRecord.id) || null,
    });
  } catch (error) {
    console.error('Academy lesson page error:', error);
    return response.status(500).send('Nie udało się pobrać lekcji.');
  }
}

async function legacyLesson(request, response) {
  const courseRecord = await Course.findBySlug(request.params.slug);
  if (!courseRecord || !courseRecord.is_active || !await courseAccessService.hasActiveAccess(request.session.user.id, courseRecord.id)) return response.status(404).send('Lekcja nie istnieje.');
  const lessonRecord = await CourseLesson.findBySlug(courseRecord.id, request.params.lessonSlug, { publishedOnly: true });
  if (!lessonRecord || !lessonRecord.module_id) return response.status(404).send('Lekcja nie istnieje.');
  const moduleRecord = await CourseModule.findById(lessonRecord.module_id);
  return response.redirect(`/akademia/kurs/${encodeURIComponent(courseRecord.slug)}/modul/${encodeURIComponent(moduleRecord.slug)}/lekcja/${encodeURIComponent(lessonRecord.slug)}`);
}

async function checkout(request, response) {
  try {
    const record = await Course.findBySlug(request.params.slug);
    if (!record || !record.is_active) return response.status(404).send('Szkolenie nie istnieje.');
    if (record.is_free || Number(record.price_amount) <= 0) return response.redirect(`/akademia/kurs/${encodeURIComponent(record.slug)}`);
    if (await courseAccessService.hasActiveAccess(request.session.user.id, record.id)) return response.redirect(`/akademia/kurs/${encodeURIComponent(record.slug)}`);
    return response.render('public/academy/checkout', { title: `Kup szkolenie — ${record.title}`, course: record });
  } catch (error) { return response.status(500).send('Nie udało się przygotować zakupu.'); }
}

function paymentResult(request, response) { return response.render('public/academy/payment-result', { title: 'Status płatności', orderNumber: String(request.query.order || '') }); }

async function getAccessibleCourse(request) {
  const record = await Course.findBySlug(request.params.slug);
  if (!record || !record.is_active || !await courseAccessService.hasActiveAccess(request.session.user.id, record.id)) return null;
  return record;
}

module.exports = { checkout, course, legacyLesson, lesson, module: modulePage, paymentResult };
