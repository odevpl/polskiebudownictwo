require('dotenv').config({ quiet: true });

const pool = require('../config/database');

const courses = [
  {
    slug: 'bezpieczna-organizacja-budowy',
    title: 'Bezpieczna organizacja budowy',
    description: 'Praktyczne podstawy planowania prac, odpowiedzialności i komunikacji na budowie.',
    category: 'Bezpieczeństwo',
    level: 'Podstawowy',
    priceAmount: 0,
    isFree: true,
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
    priceAmount: 0,
    isFree: true,
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
    priceAmount: 0,
    isFree: true,
    lessons: [
      ['Przygotowanie do odbioru', 'text'],
      ['Lista kontrolna usterek', 'material'],
      ['Protokół odbioru i dalsze kroki', 'text'],
    ],
  },
  {
    slug: 'zarzadzanie-ryzykiem-kontraktowym',
    title: 'Zarządzanie ryzykiem kontraktowym',
    description: 'Szkolenie dla wykonawców, którzy chcą wcześniej wykrywać ryzyka umowne i chronić marżę inwestycji.',
    category: 'Kontrakty',
    level: 'Średniozaawansowany',
    priceAmount: 249,
    isFree: false,
    lessons: [
      ['Mapa ryzyk kontraktowych', 'text'],
      ['Zmiany zakresu i roszczenia', 'video'],
      ['Dokumentowanie stanowiska wykonawcy', 'material'],
      ['Negocjacje i zamknięcie ryzyka', 'text'],
    ],
  },
  {
    slug: 'koordynacja-prac-na-budowie',
    title: 'Koordynacja prac na budowie',
    description: 'Uporządkuj harmonogram, komunikację i odpowiedzialność zespołów pracujących równolegle na jednej inwestycji.',
    category: 'Zarządzanie budową',
    level: 'Podstawowy',
    priceAmount: 199,
    isFree: false,
    lessons: [
      ['Planowanie etapów i zależności', 'text'],
      ['Odprawa koordynacyjna', 'video'],
      ['Przekazywanie frontu robót', 'material'],
      ['Reagowanie na opóźnienia', 'text'],
    ],
  },
];

async function seedAcademy() {
  const connection = await pool.getConnection();
  try {
    for (const [index, course] of courses.entries()) {
      await connection.execute(
        `INSERT INTO courses
           (slug, title, description, category, level, price_amount, currency, lesson_count, is_free, is_active, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, 'PLN', ?, ?, 1, ?)
           ON DUPLICATE KEY UPDATE
           title = VALUES(title), description = VALUES(description), category = VALUES(category),
           level = VALUES(level), price_amount = VALUES(price_amount), currency = VALUES(currency),
           lesson_count = VALUES(lesson_count), is_free = VALUES(is_free), is_active = 1,
           sort_order = VALUES(sort_order)`,
        [course.slug, course.title, course.description, course.category, course.level, course.priceAmount, course.lessons.length, course.isFree ? 1 : 0, index],
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
