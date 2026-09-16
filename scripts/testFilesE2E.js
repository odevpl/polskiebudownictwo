// Creates an isolated local database. Never runs migrations against the configured application database.
require('dotenv').config({ quiet: true });
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { chromium, expect } = require('@playwright/test');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const net = require('node:net');

async function main() {
  if (!['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST)) throw new Error('E2E requires a local database server.');
  const database = `pb_files_test_${randomUUID().replaceAll('-', '')}`;
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-files-e2e-'));
  const db = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, charset: 'utf8mb4' });
  let browser, server; let serverLog = '';
  try {
    await db.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4`);
    await db.changeUser({ database });
    const probe = net.createServer(); await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
    const port = probe.address().port; await new Promise(resolve => probe.close(resolve));
    const env = { ...process.env, DB_NAME: database, NODE_ENV: 'test', PORT: String(port), ADMIN_PATH: 'admin', MAILERLITE_API_TOKEN: '', UPLOAD_STORAGE_PATH: path.join(directory, 'storage'), UPLOAD_DOCX_ENABLED: '0', SESSION_SECRET: randomUUID(), UPLOAD_MAX_BYTES: '1048576', UPLOAD_LESSON_BYTES: '5242880', UPLOAD_TEMP_FILES: '30', UPLOAD_TEMP_BYTES: '31457280', UPLOAD_STORAGE_BYTES: '104857600', UPLOAD_TIMEOUT_MS: '2000' };
    const run = script => { const result = spawnSync(process.execPath, [script], { env, encoding: 'utf8', windowsHide: true }); if (result.status !== 0) throw new Error(`${script}: ${result.stdout}\n${result.stderr}`); return result.stdout; };
    run('scripts/migrate.js'); run('scripts/migrate.js');
    console.log('PASS isolated database migration, including second run');
    const password = randomUUID(); const hash = await bcrypt.hash(password, 4);
    await db.execute("INSERT INTO admins (email,password_hash,full_name,role) VALUES ('admin@example.test',?,'Test Admin','superadmin'),('other@example.test',?,'Other Admin','admin')", [hash, hash]);
    await db.execute("INSERT INTO users (email,password_hash,email_verified_at,is_active) VALUES ('student@example.test',?,NOW(),1)", [hash]);
    await db.query("INSERT INTO courses (slug,title,description,is_free,is_active) VALUES ('files-test','Kurs testowy','Opis',1,1)");
    await db.query("INSERT INTO course_modules (course_id,slug,title,is_published) VALUES (1,'module-test','Moduł testowy',1)");
    const doc = await PDFDocument.create(); doc.addPage(); const pdf = Buffer.from(await doc.save());
    const jpg = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#aaa' } }).jpeg().toBuffer();
    const webp = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#aaa' } }).webp().toBuffer();
    server = spawn(process.execPath, ['server.js'], { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    server.stdout.on('data', chunk => { serverLog += chunk; }); server.stderr.on('data', chunk => { serverLog += chunk; });
    const base = `http://127.0.0.1:${port}`;
    for (let tries = 0; ; tries++) {
      try { if ((await fetch(`${base}/health`)).ok) break; } catch { /* starting */ }
      if (tries > 300 || server.exitCode !== null) throw new Error(`Server did not start: ${serverLog}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ baseURL: base, viewport: { width: 1365, height: 1000 } });
    const page = await context.newPage();
    const browserErrors = []; page.on('pageerror', error => browserErrors.push(error.message));
    await page.goto('/admin/login');
    await page.locator('[name=email]').fill('admin@example.test'); await page.locator('[name=password]').fill(password);
    await Promise.all([page.waitForURL('**/admin/submissions'), page.locator('button[type=submit]').click()]);
    const request = context.request;
    const headers = { Origin: base };
    const upload = (name, buffer, mimeType, client = request, extraHeaders = {}) => client.post('/admin/files', { headers: { ...headers, ...extraHeaders }, multipart: { file: { name, mimeType, buffer } } });
    const guest = await browser.newContext({ baseURL: base });
    assert.equal((await upload('file.pdf', pdf, 'application/pdf', guest.request)).status(), 401);
    assert.equal((await upload('file.pdf', pdf, 'application/pdf', request, { Origin: 'https://mediacje.polskiebudownictwo.org' })).status(), 403);
    assert.equal((await upload('file.pdf', pdf, 'application/pdf', request, { Origin: 'https://foreign.example' })).status(), 403);
    assert.equal((await upload('fake.jpg', pdf, 'image/jpeg')).status(), 422);
    assert.equal((await upload('file.svg', Buffer.from('<svg/>'), 'image/svg+xml')).status(), 422);
    assert.equal((await upload('../escape.pdf', pdf, 'application/pdf')).status(), 422);
    assert.equal((await upload('empty.pdf', Buffer.alloc(0), 'application/pdf')).status(), 422);
    assert.equal((await upload('big.pdf', Buffer.alloc(1048577), 'application/pdf')).status(), 413);
    assert.equal((await request.post('/admin/files', { headers, multipart: { file: { name: 'file.pdf', mimeType: 'application/pdf', buffer: pdf }, unexpected: 'field' } })).status(), 422);
    assert.equal((await request.post('/admin/files', { headers, data: 'invalid' })).status(), 422);
    console.log('PASS upload authentication, CSRF, forged formats, paths, size and multipart limits');

    await page.goto('/admin/academy/modules/1/lessons/new');
    await page.locator('[name=slug]').fill('lesson-test'); await page.locator('[name=title]').fill('Lekcja testowa');
    await page.getByRole('button', { name: 'Dodaj tekst', exact: true }).click();
    await page.locator('[contenteditable]').fill('Tekst przed plikami — zażółć gęślą jaźń.');
    await page.getByRole('button', { name: 'Dodaj pliki', exact: true }).click();
    const blocks = page.locator('[data-content-blocks] > section');
    let section = page.locator('[data-content-blocks] [data-block-type=files]').first();
    async function addFile(section, name, buffer, mimeType) {
      const response = page.waitForResponse(response => response.url() === `${base}/admin/files` && response.request().method() === 'POST');
      await section.locator('[data-file-input]').setInputFiles({ name, mimeType, buffer });
      assert.equal((await response).status(), 201);
      await section.locator('.file-manager__card').last().getByText('Gotowy', { exact: false }).waitFor();
    }
    let simulateFailure = true;
    await page.route('**/admin/files', route => {
      if (simulateFailure) { simulateFailure = false; return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Test: spróbuj ponownie.' }) }); }
      return route.continue();
    });
    await section.locator('[data-file-input]').setInputFiles({ name: 'Retry.pdf', mimeType: 'application/pdf', buffer: pdf });
    await section.getByRole('button', { name: 'Ponów', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Zapisz lekcję', exact: true }).click();
    await expect(page.locator('[data-editor-status]')).toContainText('Poczekaj');
    await section.getByRole('button', { name: 'Ponów', exact: true }).click();
    await section.getByText('Gotowy', { exact: false }).waitFor();
    await section.getByRole('button', { name: 'Usuń', exact: true }).click();
    await page.unroute('**/admin/files');
    await addFile(section, 'Zażółć gęślą.pdf', pdf, 'application/pdf');
    await addFile(section, 'Zdjęcie.jpg', jpg, 'image/jpeg');
    await section.locator('.file-manager__card').last().getByRole('button', { name: 'Wcześniej', exact: true }).click();
    await section.locator('.file-manager__card').first().locator('input').fill('Zdjęcie budowy');
    await page.getByRole('button', { name: 'Dodaj YouTube', exact: true }).click();
    await page.locator('[data-youtube-url]').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.getByRole('button', { name: 'Dodaj pliki', exact: true }).click();
    section = page.locator('[data-content-blocks] [data-block-type=files]').last();
    await addFile(section, 'Schemat.webp', webp, 'image/webp');
    await section.getByRole('button', { name: 'Sekcja wyżej', exact: true }).click();
    await page.locator('[name=isPublished]').check();
    await Promise.all([page.waitForURL('**/admin/academy/lessons/*/edit'), page.getByRole('button', { name: 'Zapisz lekcję', exact: true }).click()]);
    const editUrl = page.url();
    assert.equal(await page.locator('.file-manager__card').count(), 3);
    assert.deepEqual(await blocks.evaluateAll(items => items.map(item => item.dataset.blockType)), ['richText', 'files', 'files', 'youtube']);
    assert.equal(await page.locator('.file-manager__card input').first().inputValue(), 'Zdjęcie budowy');
    assert.equal(await page.locator('[contenteditable]').innerText(), 'Tekst przed plikami — zażółć gęślą jaźń.');
    assert.equal(await page.locator('[data-youtube-url]').inputValue(), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log('PASS new lesson, iterative uploads, multiple sections, names, ordering, text and YouTube persistence');

    const [[lesson]] = await db.query('SELECT * FROM course_lessons LIMIT 1');
    const [attachmentRows] = await db.query('SELECT * FROM lesson_attachments ORDER BY id');
    let downloadUrl = `/api/academy/attachments/${attachmentRows[0].id}/download`;
    assert.equal((await guest.request.get(downloadUrl)).status(), 401);
    const student = await browser.newContext({ baseURL: base });
    const login = await student.request.post('/api/auth/login', { headers, data: { email: 'student@example.test', password } });
    assert.equal(login.status(), 200);
    let download = await student.request.get(downloadUrl); assert.equal(download.status(), 200);
    assert.match(download.headers()['content-disposition'], /^attachment;/); assert.match(download.headers()['cache-control'], /no-store/); assert.equal(download.headers()['x-content-type-options'], 'nosniff');
    const lessonUrl = '/akademia/kurs/files-test/modul/module-test/lekcja/lesson-test';
    const studentPage = await student.newPage(); await studentPage.goto(lessonUrl);
    assert.equal(await studentPage.locator('.lesson-files').count(), 2); assert.equal(await studentPage.locator('.lesson-files__card').count(), 3);
    assert.ok((await studentPage.locator('.lesson-view-module__body').innerText()).includes('Zażółć gęślą.pdf'));
    let api = await (await student.request.get('/api/academy/courses/files-test/lessons/lesson-test')).json();
    assert.equal(api.lesson.contentBlocks.filter(b => b.type === 'files').length, 2); assert.equal(api.lesson.content_blocks, undefined);
    assert.ok(!JSON.stringify(api).includes('storage_key'));
    for (const [table, flag] of [['course_modules', 'is_published'], ['course_lessons', 'is_published'], ['courses', 'is_active'], ['users', 'is_active']]) {
      await db.query(`UPDATE ${table} SET ${flag} = 0 WHERE id = 1`);
      assert.notEqual((await student.request.get(downloadUrl)).status(), 200);
      if (table === 'course_modules') assert.equal((await student.request.get('/api/academy/courses/files-test/lessons/lesson-test')).status(), 404);
      await db.query(`UPDATE ${table} SET ${flag} = 1 WHERE id = 1`);
    }
    await db.query('UPDATE courses SET is_free = 0 WHERE id = 1'); assert.equal((await student.request.get(downloadUrl)).status(), 404);
    await db.query("INSERT INTO user_course_access (user_id,course_id,status) VALUES (1,1,'active')"); assert.equal((await student.request.get(downloadUrl)).status(), 200);
    await db.query("UPDATE user_course_access SET expires_at = DATE_SUB(NOW(), INTERVAL 1 DAY)"); assert.equal((await student.request.get(downloadUrl)).status(), 404);
    await db.query("UPDATE user_course_access SET expires_at = NULL, status = 'revoked'"); assert.equal((await student.request.get(downloadUrl)).status(), 404);
    await db.query('UPDATE courses SET is_free = 1 WHERE id = 1');
    console.log('PASS participant page/API/download, headers, hidden hierarchy, inactive account, free/paid/expired/revoked access');

    const temporary = await (await upload('Temporary.pdf', pdf, 'application/pdf')).json();
    const other = await browser.newContext({ baseURL: base });
    assert.equal((await other.request.post('/admin/login', { headers, form: { email: 'other@example.test', password }, maxRedirects: 0 })).status(), 302);
    assert.equal((await other.request.get(temporary.file.url)).status(), 404);
    assert.equal((await other.request.delete(`/admin/files/${temporary.file.id}`, { headers })).status(), 404);
    let originalBlocks = typeof lesson.content_blocks === 'string' ? JSON.parse(lesson.content_blocks) : lesson.content_blocks;
    const forged = [...originalBlocks, { type: 'files', id: randomUUID(), data: { files: [{ id: temporary.file.id, name: 'Stolen' }] } }];
    assert.equal((await other.request.post(`/admin/academy/lessons/${lesson.id}/edit`, { headers, form: { slug: 'lesson-test', title: 'Lekcja testowa', contentType: 'text', sortOrder: '0', isPublished: '1', contentBlocks: JSON.stringify(forged) } })).status(), 422);
    assert.equal((await request.get(`/storage/files/${temporary.file.id}`)).status(), 404);
    await page.goto(editUrl);
    section = page.locator('[data-content-blocks] [data-block-type=files]').first();
    await addFile(section, 'Dodatkowy.pdf', pdf, 'application/pdf');
    // Server-side validation must preserve already uploaded cards.
    await page.locator('[name=slug]').fill('BAD SLUG');
    await Promise.all([page.waitForResponse(response => response.url() === editUrl && response.status() === 422), page.getByRole('button', { name: 'Zapisz lekcję', exact: true }).click()]);
    await expect(page.locator('.file-manager__card')).toHaveCount(4);
    await page.goto(editUrl); assert.equal(await page.locator('.file-manager__card').count(), 3);
    await page.locator('[data-content-blocks] [data-block-type=files]').first().getByRole('button', { name: 'Usuń sekcję' }).click();
    await page.goto(editUrl); assert.equal(await page.locator('.file-manager__card').count(), 3);
    console.log('PASS temporary ownership, forged references, validation recovery and cancelled edits');

    const artifacts = path.resolve(__dirname, '../test-results/files'); await fs.mkdir(artifacts, { recursive: true });
    await page.screenshot({ path: path.join(artifacts, 'admin-desktop.png'), fullPage: true });
    await studentPage.screenshot({ path: path.join(artifacts, 'lesson-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(artifacts, 'admin-mobile.png'), fullPage: true });
    assert.ok(await page.locator('.file-manager').first().evaluate(element => element.scrollWidth <= element.clientWidth + 1));
    await studentPage.setViewportSize({ width: 390, height: 844 });
    await studentPage.screenshot({ path: path.join(artifacts, 'lesson-mobile.png'), fullPage: true });
    assert.ok(await studentPage.locator('.lesson-files').first().evaluate(element => element.scrollWidth <= element.clientWidth + 1));
    assert.deepEqual(browserErrors, []);
    console.log('PASS mobile gallery layout and browser JavaScript');

    // Quota reservations cannot be bypassed by concurrent requests.
    await db.query('DELETE FROM file_upload_attempts');
    const [[usage]] = await db.query('SELECT COALESCE(SUM(size_bytes),0) AS bytes FROM files WHERE uploaded_by=1 AND attached_at IS NULL');
    const reserveId = randomUUID();
    await db.execute("INSERT INTO files (id,storage_key,original_name,mime_type,size_bytes,status,uploaded_by) VALUES (?,?,'quota','application/pdf',?,'uploading',1)", [reserveId, reserveId, 31457280 - Number(usage.bytes)]);
    const concurrent = await Promise.all([upload('a.pdf', pdf, 'application/pdf'), upload('b.pdf', pdf, 'application/pdf')]);
    assert.deepEqual(concurrent.map(response => response.status()), [429, 429]);
    await db.execute('DELETE FROM files WHERE id = ?', [reserveId]);
    await db.query('UPDATE admins SET is_active = 0 WHERE id = 1'); assert.equal((await upload('a.pdf', pdf, 'application/pdf')).status(), 403); await db.query('UPDATE admins SET is_active = 1 WHERE id = 1');
    // A rejected transactional save must not change JSON or attachment rows.
    const [[before]] = await db.query('SELECT content_blocks FROM course_lessons WHERE id=1');
    const bad = [{ type: 'files', id: randomUUID(), data: { files: [{ id: randomUUID(), name: 'Missing' }] } }];
    assert.equal((await request.post(editUrl, { headers, form: { slug: 'lesson-test', title: 'Changed', contentType: 'text', sortOrder: '0', contentBlocks: JSON.stringify(bad) } })).status(), 422);
    const [[after]] = await db.query('SELECT content_blocks FROM course_lessons WHERE id=1'); assert.deepEqual(after, before);
    await page.goto(editUrl);
    await page.locator('.file-manager__card').first().getByRole('button', { name: 'Usuń', exact: true }).click();
    await Promise.all([page.waitForNavigation(), page.getByRole('button', { name: 'Zapisz lekcję', exact: true }).click()]);
    await expect(page.locator('.file-manager__card')).toHaveCount(2);
    const [[kept]] = await db.query('SELECT * FROM lesson_attachments WHERE lesson_id=1 LIMIT 1');
    downloadUrl = `/api/academy/attachments/${kept.id}/download`;
    await db.query('UPDATE files SET created_at = DATE_SUB(NOW(), INTERVAL 2 DAY) WHERE attached_at IS NULL');
    run('scripts/cleanupFiles.js');
    assert.equal((await student.request.get(downloadUrl)).status(), 200);
    const [[keptCount]] = await db.query('SELECT COUNT(*) AS count FROM files'); assert.equal(keptCount.count, 2);
    // A second reference must keep the physical file alive after a lesson is removed.
    await db.query("INSERT INTO course_modules (course_id,slug,title,is_published) VALUES (1,'shared','Shared',1)");
    const sharedBlock = randomUUID(), sharedAttachment = randomUUID();
    await db.execute("INSERT INTO course_lessons (course_id,module_id,slug,title,is_published,content_blocks) VALUES (1,2,'shared','Shared',1,?)", [JSON.stringify([{ type: 'files', id: sharedBlock, data: { files: [{ id: kept.file_id, name: 'Shared' }] } }])]);
    await db.execute('INSERT INTO lesson_attachments (id,lesson_id,block_id,file_id) VALUES (?,2,?,?)', [sharedAttachment, sharedBlock, kept.file_id]);
    await db.query('DELETE FROM course_lessons WHERE id=1'); run('scripts/cleanupFiles.js');
    assert.equal((await student.request.get(`/api/academy/attachments/${sharedAttachment}/download`)).status(), 200);
    const [[sharedCount]] = await db.query('SELECT COUNT(*) AS count FROM files'); assert.equal(sharedCount.count, 1);
    await db.query('DELETE FROM course_modules WHERE id=2'); run('scripts/cleanupFiles.js');
    assert.equal((await student.request.get(`/api/academy/attachments/${sharedAttachment}/download`)).status(), 404);
    // Restore one synthetic lesson/file binding to exercise the course cascade independently.
    const lastUpload = await (await upload('Last.pdf', pdf, 'application/pdf')).json();
    await db.query("INSERT INTO course_lessons (course_id,module_id,slug,title,is_published) VALUES (1,1,'last','Last',1)");
    await db.execute('INSERT INTO lesson_attachments (id,lesson_id,block_id,file_id) VALUES (?,3,?,?)', [randomUUID(), randomUUID(), lastUpload.file.id]);
    await db.execute('UPDATE files SET attached_at=NOW() WHERE id=?', [lastUpload.file.id]);
    await db.query('DELETE FROM courses WHERE id = 1');
    assert.equal((await student.request.get(downloadUrl)).status(), 404);
    run('scripts/cleanupFiles.js');
    const [[remaining]] = await db.query('SELECT COUNT(*) AS count FROM files'); assert.equal(remaining.count, 0);
    assert.equal((await fs.readdir(env.UPLOAD_STORAGE_PATH)).length, 0);
    console.log('PASS concurrent quota, inactive administrator, SQL rollback, stale upload cleanup and course cascade cleanup');
    console.log('All file E2E scenarios passed.');
  } catch (error) {
    console.error(serverLog.slice(-12000)); throw error;
  } finally {
    await browser?.close();
    if (server && server.exitCode === null) { server.kill(); await new Promise(resolve => server.once('exit', resolve)); }
    if (/^pb_files_test_[a-f0-9]{32}$/.test(database)) await db.query(`DROP DATABASE IF EXISTS \`${database}\``);
    await db.end();
    const resolved = path.resolve(directory);
    if (path.dirname(resolved) === path.resolve(os.tmpdir()) && path.basename(resolved).startsWith('pb-files-e2e-')) await fs.rm(resolved, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
