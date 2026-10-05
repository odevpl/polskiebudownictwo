const pool = require('../config/database');

function messageQuery(where, params) {
  return pool.execute(
    `SELECT m.id, m.chat_id, m.user_id, m.body, m.created_at,
            COALESCE(NULLIF(TRIM(CONCAT_WS(' ', p.first_name, p.last_name)), ''), u.email) AS author_name
       FROM chat_messages m
       INNER JOIN users u ON u.id = m.user_id
       LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE m.deleted_at IS NULL AND ${where}
      ORDER BY m.id DESC
      LIMIT 50`,
    params,
  );
}

async function findPage(chatId, beforeId = null) {
  const [rows] = beforeId
    ? await messageQuery('m.chat_id = ? AND m.id < ?', [chatId, beforeId])
    : await messageQuery('m.chat_id = ?', [chatId]);
  return rows.reverse();
}

async function create(chatId, userId, body) {
  const [result] = await pool.execute('INSERT INTO chat_messages (chat_id, user_id, body) VALUES (?, ?, ?)', [chatId, userId, body]);
  const [rows] = await pool.execute(
    `SELECT m.id, m.chat_id, m.user_id, m.body, m.created_at,
            COALESCE(NULLIF(TRIM(CONCAT_WS(' ', p.first_name, p.last_name)), ''), u.email) AS author_name
       FROM chat_messages m
       INNER JOIN users u ON u.id = m.user_id
       LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE m.id = ? LIMIT 1`,
    [result.insertId],
  );
  return rows[0];
}

async function findForAdmin(chatId) { return findPage(chatId); }

async function softDelete(chatId, id, adminId) {
  const [result] = await pool.execute('UPDATE chat_messages SET deleted_at = CURRENT_TIMESTAMP, deleted_by_admin_id = ? WHERE chat_id = ? AND id = ? AND deleted_at IS NULL', [adminId, chatId, id]);
  return result.affectedRows > 0;
}

module.exports = { create, findForAdmin, findPage, softDelete };
