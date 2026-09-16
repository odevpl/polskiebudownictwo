const { randomUUID } = require('node:crypto');
const pool = require('../config/database');
const { config, FileError, audit } = require('../modules/files/config');
const files = require('../modules/files/repository');
const { parseBlocks } = require('../modules/courseContent');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function validateBlocks(raw) {
  let blocks;
  try { blocks = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw || []; } catch { throw new FileError('Nieprawidłowa treść lekcji.'); }
  if (!Array.isArray(blocks) || blocks.length > config().maxBlocks) throw new FileError('Przekroczono limit bloków lekcji.');
  const ids = new Set(); let count = 0;
  for (const block of blocks) {
    if (block?.type !== 'files') continue;
    if (!uuid.test(block.id) || ids.has(block.id) || !Array.isArray(block.data?.files)) throw new FileError('Nieprawidłowa sekcja plików.');
    ids.add(block.id);
    const refs = new Set();
    for (const file of block.data.files) {
      if (!uuid.test(file?.id) || refs.has(file.id) || typeof file.name !== 'string' || !file.name.trim() || file.name.length > 180 || /[\x00-\x1f\x7f\ufffd]/.test(file.name)) throw new FileError('Nieprawidłowy plik lub nazwa w sekcji.');
      refs.add(file.id); count++;
    }
  }
  if (count > config().lessonFiles) throw new FileError(`Lekcja może zawierać maksymalnie ${config().lessonFiles} plików.`);
}

async function sync(connection, lessonId, blocks, adminId) {
  validateBlocks(blocks);
  const [previous] = await connection.execute('SELECT * FROM lesson_attachments WHERE lesson_id = ?', [lessonId]);
  const allowed = new Set(previous.map(row => row.file_id));
  const desired = []; let bytes = 0;
  for (const block of blocks.filter(item => item.type === 'files')) {
    for (const reference of block.data.files) {
      const [rows] = await connection.execute('SELECT * FROM files WHERE id = ? FOR UPDATE', [reference.id]);
      const file = rows[0];
      const ownTemporary = file && file.attached_at === null && file.uploaded_by === adminId && Date.now() - new Date(file.created_at).getTime() < config().ttlHours * 3600000;
      if (!files.readable(file) || (!allowed.has(reference.id) && !ownTemporary)) throw new FileError('Plik jest niedostępny lub upload wygasł. Usuń go z sekcji i prześlij ponownie.');
      bytes += Number(file.size_bytes);
      const existing = previous.find(item => item.block_id === block.id && item.file_id === file.id);
      desired.push({ id: existing?.id || randomUUID(), blockId: block.id, fileId: file.id });
    }
  }
  if (bytes > config().lessonBytes) throw new FileError('Przekroczono łączny rozmiar plików w lekcji.');
  await connection.execute('DELETE FROM lesson_attachments WHERE lesson_id = ?', [lessonId]);
  for (const item of desired) {
    await connection.execute('INSERT INTO lesson_attachments (id, lesson_id, block_id, file_id) VALUES (?, ?, ?, ?)', [item.id, lessonId, item.blockId, item.fileId]);
    await connection.execute('UPDATE files SET attached_at = COALESCE(attached_at, NOW()) WHERE id = ?', [item.fileId]);
  }
  // Names and order live only in content_blocks. This table is the authorization/reference index.
  return desired.length;
}

async function hydrate(lesson, adminId = null, adminUrl = null) {
  const blocks = lesson.contentBlocks || parseBlocks(lesson.content_blocks, lesson.content);
  const ids = [...new Set(blocks.filter(block => block.type === 'files').flatMap(block => block.data.files.map(file => file.id)))];
  if (!ids.length) return blocks;
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.execute(`SELECT f.*, a.id AS attachment_id, a.block_id FROM files f LEFT JOIN lesson_attachments a ON a.file_id = f.id AND a.lesson_id = ? WHERE f.id IN (${placeholders})`, [lesson.id || 0, ...ids]);
  return blocks.map(block => {
    if (block.type !== 'files') return block;
    return { ...block, data: { files: block.data.files.flatMap(reference => {
      const file = rows.find(item => item.id === reference.id && (item.block_id === block.id || (adminId && (item.attachment_id || (item.uploaded_by === adminId && item.attached_at === null)))));
      if (!file || !files.readable(file)) return adminId ? [{ id: reference.id, name: reference.name, unavailable: true }] : [];
      const url = adminId ? adminUrl(`/files/${file.id}/download`) : `/api/academy/attachments/${file.attachment_id}/download`;
      return [{ ...files.metadata(file, url), name: reference.name, temporary: file.attached_at === null }];
    }) } };
  });
}

async function downloadRecord(id) {
  const [rows] = await pool.execute(`SELECT f.*, a.id AS attachment_id, a.lesson_id, a.block_id FROM lesson_attachments a INNER JOIN files f ON f.id = a.file_id WHERE a.id = ?`, [id]);
  return rows[0] || null;
}
function saved(lessonId, adminId, count) { audit('lesson_saved', { lessonId, adminId, count }); }
module.exports = { validateBlocks, sync, hydrate, downloadRecord, saved };
