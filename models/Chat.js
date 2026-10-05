const pool = require('../config/database');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT ch.*, c.title AS course_title,
            (SELECT COUNT(*) FROM chat_messages m WHERE m.chat_id = ch.id AND m.deleted_at IS NULL) AS message_count
       FROM chats ch
       LEFT JOIN courses c ON c.id = ch.course_id
      ORDER BY ch.created_at DESC, ch.id DESC`,
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ch.*, c.title AS course_title
       FROM chats ch
       LEFT JOIN courses c ON c.id = ch.course_id
      WHERE ch.id = ? LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

async function findActiveByUuid(uuid) {
  const [rows] = await pool.execute('SELECT * FROM chats WHERE uuid = ? AND is_active = 1 LIMIT 1', [uuid]);
  return rows[0] || null;
}

async function findActiveForCourse(courseId) {
  const [rows] = await pool.execute(
    `SELECT * FROM chats WHERE course_id = ? AND access_type = 'course' AND is_active = 1 ORDER BY id DESC LIMIT 1`,
    [courseId],
  );
  return rows[0] || null;
}

async function create({ uuid, title, accessType, courseId, adminId }) {
  const [result] = await pool.execute(
    'INSERT INTO chats (uuid, title, access_type, course_id, created_by_admin_id) VALUES (?, ?, ?, ?, ?)',
    [uuid, title, accessType, courseId || null, adminId || null],
  );
  return findById(result.insertId);
}

async function update(id, { title, accessType, courseId }) {
  await pool.execute('UPDATE chats SET title = ?, access_type = ?, course_id = ? WHERE id = ?', [title, accessType, courseId || null, id]);
  return findById(id);
}

async function setActive(id, isActive) {
  await pool.execute('UPDATE chats SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  return findById(id);
}

async function findMember(chatId, userId) {
  const [rows] = await pool.execute('SELECT * FROM chat_members WHERE chat_id = ? AND user_id = ? LIMIT 1', [chatId, userId]);
  return rows[0] || null;
}

async function addMember(chatId, userId) {
  await pool.execute(
    `INSERT INTO chat_members (chat_id, user_id, is_blocked) VALUES (?, ?, 0)
     ON DUPLICATE KEY UPDATE is_blocked = 0`,
    [chatId, userId],
  );
}

async function setMemberBlocked(chatId, userId, isBlocked) {
  await pool.execute(
    `INSERT INTO chat_members (chat_id, user_id, is_blocked) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE is_blocked = VALUES(is_blocked)`,
    [chatId, userId, isBlocked ? 1 : 0],
  );
}

async function findMembers(chatId) {
  const [rows] = await pool.execute(
    `SELECT cm.*, u.email, COALESCE(NULLIF(TRIM(CONCAT_WS(' ', p.first_name, p.last_name)), ''), u.email) AS display_name
       FROM chat_members cm
       INNER JOIN users u ON u.id = cm.user_id
       LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE cm.chat_id = ?
      ORDER BY cm.created_at DESC`,
    [chatId],
  );
  return rows;
}

module.exports = { addMember, create, findActiveByUuid, findActiveForCourse, findAll, findById, findMember, findMembers, setActive, setMemberBlocked, update };
