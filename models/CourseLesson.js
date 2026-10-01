const pool = require('../config/database');
const { transaction } = require('../modules/files/repository');
const attachments = require('../services/lessonAttachmentService');

async function findByCourseId(courseId, { publishedOnly = false } = {}) {
  const where = publishedOnly ? 'AND is_published = 1' : '';
  const [rows] = await pool.execute(
    `SELECT id, course_id, module_id, slug, title, content_type, content, content_blocks,
            sort_order, is_published, created_at, updated_at
     FROM course_lessons
     WHERE course_id = ? ${where}
     ORDER BY sort_order ASC, id ASC`,
    [courseId],
  );
  return rows;
}

async function findBySlug(courseId, slug, { publishedOnly = false } = {}) {
  const publishedCondition = publishedOnly ? 'AND is_published = 1' : '';
  const [rows] = await pool.execute(
    `SELECT id, course_id, module_id, slug, title, content_type, content, content_blocks,
            sort_order, is_published, created_at, updated_at
     FROM course_lessons
     WHERE course_id = ? AND slug = ? ${publishedCondition}
     LIMIT 1`,
    [courseId, slug],
  );
  return rows[0] || null;
}

async function findByModuleId(moduleId, { publishedOnly = false } = {}) {
  const where = publishedOnly ? 'AND is_published = 1' : '';
  const [rows] = await pool.execute(
    `SELECT id, course_id, module_id, slug, title, content_type, content, content_blocks,
            sort_order, is_published, created_at, updated_at
     FROM course_lessons WHERE module_id = ? ${where} ORDER BY sort_order ASC, id ASC`,
    [moduleId],
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT id, course_id, module_id, slug, title, content_type, content, content_blocks,
            sort_order, is_published, created_at, updated_at
     FROM course_lessons WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

async function create(data) {
  const id = await transaction(async connection => {
  const [result] = await connection.execute(
    `INSERT INTO course_lessons
       (course_id, module_id, slug, title, content_type, content, content_blocks, sort_order, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.courseId,
      data.moduleId || null,
      data.slug,
      data.title,
      data.contentType || 'text',
      data.content || null,
      data.contentBlocks ? JSON.stringify(data.contentBlocks) : null,
      data.sortOrder || 0,
      data.isPublished ? 1 : 0,
    ],
  );
  await attachments.sync(connection, result.insertId, data.contentBlocks || [], data.adminId);
  await syncLessonCount(data.courseId, connection);
  return result.insertId;
  });
  attachments.saved(id, data.adminId, (data.contentBlocks || []).filter(b => b.type === 'files').length);
  return findById(id);
}

async function update(id, data) {
  await transaction(async connection => {
  const [[existing]] = await connection.execute('SELECT id FROM course_lessons WHERE id = ? FOR UPDATE', [id]);
  if (!existing) throw new Error('Lesson no longer exists');
  await attachments.sync(connection, id, data.contentBlocks || [], data.adminId);
  await connection.execute(
    `UPDATE course_lessons
     SET module_id = ?, slug = ?, title = ?, content_type = ?, content = ?, content_blocks = ?, sort_order = ?, is_published = ?
     WHERE id = ?`,
    [data.moduleId || null, data.slug, data.title, data.contentType || 'text', data.content || null, data.contentBlocks ? JSON.stringify(data.contentBlocks) : null, data.sortOrder || 0, data.isPublished ? 1 : 0, id],
  );
  });
  attachments.saved(id, data.adminId, (data.contentBlocks || []).filter(b => b.type === 'files').length);
  return findById(id);
}

async function remove(id) {
  const lesson = await findById(id);
  if (!lesson) return false;
  const [result] = await pool.execute('DELETE FROM course_lessons WHERE id = ?', [id]);
  await syncLessonCount(lesson.course_id);
  return result.affectedRows > 0;
}

async function updateSortOrder(ids) {
  await Promise.all(ids.map((id, index) => pool.execute('UPDATE course_lessons SET sort_order = ? WHERE id = ?', [index, id])));
}

async function syncLessonCount(courseId, connection = pool) {
  await connection.execute(
    `UPDATE courses c
     SET lesson_count = (SELECT COUNT(*) FROM course_lessons l WHERE l.course_id = c.id)
     WHERE c.id = ?`,
    [courseId],
  );
}

module.exports = { create, findByCourseId, findById, findByModuleId, findBySlug, remove, syncLessonCount, update, updateSortOrder };
