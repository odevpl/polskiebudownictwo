const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const sharp = require('sharp');
const { PDFDocument, PDFName, PDFString } = require('pdf-lib');
const { inspect, safeName } = require('../../modules/files/validate');
const { validateBlocks } = require('../../services/lessonAttachmentService');
const { normalizeForStorage } = require('../../modules/courseContent');
const { randomUUID } = require('node:crypto');

test('file formats: valid PDF/JPEG/WebP; reject forged, broken, active, empty and oversized files', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-files-validation-'));
  const filename = path.join(directory, 'input');
  try {
    for (const [format, name, mime] of [['jpeg', 'Zażółć.jpg', 'image/jpeg'], ['webp', 'Zdjęcie.webp', 'image/webp']]) {
      const bytes = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#fff' } }).toFormat(format).toBuffer();
      await fs.writeFile(filename, bytes);
      assert.equal((await inspect(filename, name, mime)).name, name);
      await assert.rejects(inspect(filename, 'fake.pdf', 'application/pdf'));
      await fs.writeFile(filename, bytes.subarray(0, 32));
      await assert.rejects(inspect(filename, name, mime));
    }
    const pdf = await PDFDocument.create(); pdf.addPage();
    await fs.writeFile(filename, await pdf.save());
    assert.equal((await inspect(filename, 'Materiały.pdf', 'application/pdf')).mime, 'application/pdf');
    await assert.rejects(inspect(filename, 'Materiały.pdf', 'image/jpeg'));
    pdf.catalog.set(PDFName.of('OpenAction'), PDFString.of('unsafe'));
    await fs.writeFile(filename, await pdf.save());
    await assert.rejects(inspect(filename, 'active.pdf', 'application/pdf'));
    await fs.writeFile(filename, ''); await assert.rejects(inspect(filename, 'empty.pdf', 'application/pdf'));
    await fs.writeFile(filename, '<script>bad</script>'); await assert.rejects(inspect(filename, 'fake.jpg', 'image/jpeg'));
    await assert.rejects(inspect(filename, 'file.svg', 'image/svg+xml'));
    process.env.UPLOAD_MAX_BYTES = '1'; await assert.rejects(inspect(filename, 'big.pdf', 'application/pdf')); delete process.env.UPLOAD_MAX_BYTES;
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
test('names and sections cannot inject paths, duplicate identifiers or bypass lesson-wide count', () => {
  for (const name of ['../a.pdf', 'a/b.pdf', 'a\\b.pdf', '<img>.jpg', 'a\r\n.pdf', 'a\0.pdf', 'a..pdf', '.hidden.pdf']) assert.throws(() => safeName(name));
  assert.equal(safeName('Zażółć gęślą.pdf'), 'Zażółć gęślą.pdf');
  const block = { type: 'files', id: randomUUID(), data: { files: [{ id: randomUUID(), name: 'Materiał' }] } };
  validateBlocks([block]); assert.deepEqual(normalizeForStorage([block]), [block]);
  assert.throws(() => validateBlocks([block, block]));
  assert.throws(() => validateBlocks([{ ...block, data: { files: [{ id: '../../path', name: 'x' }] } }]));
  assert.throws(() => validateBlocks(Array.from({ length: 11 }, () => ({ ...block, id: randomUUID() }))));
});
