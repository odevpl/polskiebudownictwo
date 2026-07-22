const { validationResult } = require('express-validator');
const Course = require('../../models/Course');
const CourseLesson = require('../../models/CourseLesson');
const LessonProgress = require('../../models/LessonProgress');
const courseAccessService = require('../../services/courseAccessService');

function sendValidationError(request, response) {
  const errors = validationResult(request);
  if (errors.isEmpty()) return false;
  response.status(422).json({ success: false, message: errors.array()[0].msg });
  return true;
}

function currentUserId(request) {
  return request.session.user.id;
}

async function listCourses(request, response) {
  try {
    const courses = await courseAccessService.findAvailableCourses(currentUserId(request));
    response.setHeader('Cache-Control', 'private, no-store');
    return response.json({ success: true, courses });
  } catch (error) {
    console.error('Academy courses error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się pobrać kursów.' });
  }
}

async function showCourse(request, response) {
  try {
    const course = await Course.findBySlug(request.params.slug);
    if (!course || !course.is_active) {
      return response.status(404).json({ success: false, message: 'Kurs nie istnieje.' });
    }
    if (!await courseAccessService.hasActiveAccess(currentUserId(request), course.id)) {
      return response.status(403).json({ success: false, message: 'Nie masz dostępu do tego kursu.' });
    }
    const [lessons, progress] = await Promise.all([
      CourseLesson.findByCourseId(course.id, { publishedOnly: true }),
      LessonProgress.findByUserAndCourse(currentUserId(request), course.id),
    ]);
    const progressByLesson = new Map(progress.map(item => [item.lesson_id, item]));
    return response.json({
      success: true,
      course: {
        ...course,
        lessons: lessons.map(lesson => ({
          ...lesson,
          progress: progressByLesson.get(lesson.id) || null,
        })),
      },
    });
  } catch (error) {
    console.error('Academy course error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się pobrać kursu.' });
  }
}

async function showLesson(request, response) {
  try {
    const course = await Course.findBySlug(request.params.slug);
    if (!course || !course.is_active) {
      return response.status(404).json({ success: false, message: 'Kurs nie istnieje.' });
    }
    if (!await courseAccessService.hasActiveAccess(currentUserId(request), course.id)) {
      return response.status(403).json({ success: false, message: 'Nie masz dostępu do tego kursu.' });
    }
    const lesson = await CourseLesson.findBySlug(course.id, request.params.lessonSlug, { publishedOnly: true });
    if (!lesson) {
      return response.status(404).json({ success: false, message: 'Lekcja nie istnieje.' });
    }
    const progress = await LessonProgress.findByUserAndLesson(currentUserId(request), lesson.id);
    response.setHeader('Cache-Control', 'private, no-store');
    return response.json({ success: true, course: { id: course.id, slug: course.slug, title: course.title }, lesson, progress });
  } catch (error) {
    console.error('Academy lesson error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się pobrać lekcji.' });
  }
}

async function updateLessonProgress(request, response) {
  if (sendValidationError(request, response)) return;
  const lessonId = Number(request.params.id);
  if (!Number.isSafeInteger(lessonId) || lessonId < 1) {
    return response.status(422).json({ success: false, message: 'Nieprawidłowy identyfikator lekcji.' });
  }

  try {
    const lesson = await CourseLesson.findById(lessonId);
    if (!lesson || !lesson.is_published) {
      return response.status(404).json({ success: false, message: 'Lekcja nie istnieje.' });
    }
    if (!await courseAccessService.hasLessonAccess(currentUserId(request), lessonId)) {
      return response.status(403).json({ success: false, message: 'Nie masz dostępu do tej lekcji.' });
    }
    const progress = request.body.completed === true
      ? await LessonProgress.markCompleted(currentUserId(request), lessonId)
      : await LessonProgress.markViewed(currentUserId(request), lessonId);
    return response.json({ success: true, progress });
  } catch (error) {
    console.error('Academy progress error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się zapisać postępu.' });
  }
}

module.exports = { listCourses, showCourse, showLesson, updateLessonProgress };
