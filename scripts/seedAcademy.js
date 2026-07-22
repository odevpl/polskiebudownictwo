require('dotenv').config({ quiet: true });

const pool = require('../config/database');

const courses = [
  {
    slug: 'bezpieczna-organizacja-budowy',
    title: 'Bezpieczna organizacja budowy',
    description: 'Praktyczne podstawy planowania prac, odpowiedzialności i komunikacji na budowie.',
    category: 'Bezpieczeństwo',
    level: 'Podstawowy',
    lessons: [
      ['Plan bezpieczeństwa budowy', 'text'],
      ['Odpowiedzialność uczestników procesu', 'text'],
      ['Codzienna komunikacja zespołu', 'video'],
    ],
  },
  {
    slug: 'dokumentacja-techniczna-w-praktyce',
    title: 'Dokumentacja techniczna w praktyce',
    description: 'Naucz się porządkować dokumenty i szybciej odnajdywać informacje potrzebne na inwestycji.',
    category: 'Dokumentacja',
    level: 'Średniozaawansowany',
    lessons: [
      ['Czytanie dokumentacji projektowej', 'text'],
      ['Rejestry i obieg dokumentów', 'material'],
      ['Najczęstsze błędy formalne', 'video'],
    ],
  },
  {
    slug: 'odbior-prac-budowlanych',
    title: 'Odbiór prac budowlanych',
    description: 'Przygotuj odbiór prac, dokumentuj ustalenia i ogranicz ryzyko sporów z wykonawcą.',
    category: 'Praktyka budowy',
    level: 'Podstawowy',
    lessons: [
      ['Przygotowanie do odbioru', 'text'],
      ['Lista kontrolna usterek', 'material'],
      ['Protokół odbioru i dalsze kroki', 'text'],
    ],
  },
];

async function seedAcademy() {
  const connection = await pool.getConnection();
  try {
    for (const [index, course] of courses.entries()) {
      await connection.execute(
        `INSERT INTO courses
           (slug, title, description, category, level, lesson_count, is_free, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title), description = VALUES(description), category = VALUES(category),
           level = VALUES(level), lesson_count = VALUES(lesson_count), is_active = 1,
           sort_order = VALUES(sort_order)`,
        [course.slug, course.title, course.description, course.category, course.level, course.lessons.length, index],
      );

      const [courseRows] = await connection.execute('SELECT id FROM courses WHERE slug = ? LIMIT 1', [course.slug]);
      const courseId = courseRows[0].id;

      for (const [lessonIndex, [title, contentType]] of course.lessons.entries()) {
        const lessonSlug = title
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        await connection.execute(
          `INSERT INTO course_lessons
             (course_id, slug, title, description, content_type, is_published, sort_order)
           VALUES (?, ?, ?, ?, ?, 1, ?)
           ON DUPLICATE KEY UPDATE
             title = VALUES(title), description = VALUES(description),
             content_type = VALUES(content_type), is_published = 1,
             sort_order = VALUES(sort_order)`,
          [courseId, lessonSlug, title, 'Materiał demonstracyjny do przygotowania w panelu Akademii.', contentType, lessonIndex],
        );
      }
    }
    console.log('Dane demonstracyjne Akademii zostały zapisane.');
  } finally {
    connection.release();
    await pool.end();
  }
}

seedAcademy().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
