const Course = require('../../models/Course');
const CourseLesson = require('../../models/CourseLesson');
const LessonProgress = require('../../models/LessonProgress');
const courseAccessService = require('../../services/courseAccessService');

async function course(request, response) {
  try {
    const record = await Course.findBySlug(request.params.slug);
    if (!record || !record.is_active) return response.status(404).send('Kurs nie istnieje.');
    if (!await courseAccessService.hasActiveAccess(request.session.user.id, record.id)) {
      return response.status(403).send('Nie masz dostępu do tego kursu.');
    }
    const [lessons, progress] = await Promise.all([
      CourseLesson.findByCourseId(record.id, { publishedOnly: true }),
      LessonProgress.findByUserAndCourse(request.session.user.id, record.id),
    ]);
    const progressByLesson = new Map(progress.map(item => [item.lesson_id, item]));
    if (lessons.length > 0) {
      return response.redirect(`/akademia/kurs/${encodeURIComponent(record.slug)}/lekcja/${encodeURIComponent(lessons[0].slug)}`);
    }
    return response.render('public/academy/course', {
      title: record.title,
      course: record,
      lessons: [],
    });
  } catch (error) {
    console.error('Academy course page error:', error);
    return response.status(500).send('Nie udało się pobrać kursu.');
  }
}

async function lesson(request, response) {
  try {
    const record = await Course.findBySlug(request.params.slug);
    if (!record || !record.is_active) return response.status(404).send('Kurs nie istnieje.');
    if (!await courseAccessService.hasActiveAccess(request.session.user.id, record.id)) {
      return response.status(403).send('Nie masz dostępu do tego kursu.');
    }
    const [lessons, progress] = await Promise.all([
      CourseLesson.findByCourseId(record.id, { publishedOnly: true }),
      LessonProgress.findByUserAndCourse(request.session.user.id, record.id),
    ]);
    const lessonRecord = lessons.find(item => item.slug === request.params.lessonSlug);
    if (!lessonRecord) return response.status(404).send('Lekcja nie istnieje.');
    const progressByLesson = new Map(progress.map(item => [item.lesson_id, item]));
    return response.render('public/academy/lesson', {
      title: lessonRecord.title,
      course: record,
      lesson: lessonRecord,
      lessons: lessons.map(item => ({ ...item, progress: progressByLesson.get(item.id) || null })),
      progress: progressByLesson.get(lessonRecord.id) || null,
    });
  } catch (error) {
    console.error('Academy lesson page error:', error);
    return response.status(500).send('Nie udało się pobrać lekcji.');
  }
}

async function checkout(request, response) {
  try {
    const record = await Course.findBySlug(request.params.slug);
    if (!record || !record.is_active) return response.status(404).send('Szkolenie nie istnieje.');
    if (record.is_free || Number(record.price_amount) <= 0) return response.redirect(`/akademia/kurs/${encodeURIComponent(record.slug)}`);
    if (await courseAccessService.hasActiveAccess(request.session.user.id, record.id)) return response.redirect(`/akademia/kurs/${encodeURIComponent(record.slug)}`);
    return response.render('public/academy/checkout', { title: `Kup szkolenie — ${record.title}`, course: record });
  } catch (error) {
    console.error('Academy checkout page error:', error);
    return response.status(500).send('Nie udało się przygotować zakupu.');
  }
}

function paymentResult(request, response) {
  return response.render('public/academy/payment-result', { title: 'Status płatności', orderNumber: String(request.query.order || '') });
}

module.exports = { checkout, course, lesson, paymentResult };
