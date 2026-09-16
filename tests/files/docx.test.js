const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { inspect } = require('../../modules/files/validate');

// Minimal ZIP fixture writer (stored entries), independent of the reader under test.
function zip(entries) {
  const local = [], central = []; let offset = 0;
  for (const [filename, input] of entries) {
    const name = Buffer.from(filename), data = Buffer.from(input); let crc = 0xffffffff;
    for (const byte of data) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); } crc = (crc ^ 0xffffffff) >>> 0;
    const header = Buffer.alloc(30); header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt32LE(crc, 14); header.writeUInt32LE(data.length, 18); header.writeUInt32LE(data.length, 22); header.writeUInt16LE(name.length, 26);
    local.push(header, name, data);
    const item = Buffer.alloc(46); item.writeUInt32LE(0x02014b50); item.writeUInt16LE(20, 4); item.writeUInt16LE(20, 6); item.writeUInt32LE(crc, 16); item.writeUInt32LE(data.length, 20); item.writeUInt32LE(data.length, 24); item.writeUInt16LE(name.length, 28); item.writeUInt32LE(offset, 42);
    central.push(item, name); offset += header.length + name.length + data.length;
  }
  const directory = Buffer.concat(central); const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}
test('DOCX opt-in: valid OOXML; reject fake ZIP, macros, external references, traversal, DTD and malformed XML', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-files-docx-')); const filename = path.join(directory, 'input');
  const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const entries = [
    ['[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
    ['_rels/.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
    ['word/document.xml', '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p/></w:body></w:document>'],
  ];
  try {
    process.env.UPLOAD_DOCX_ENABLED = '0'; await fs.writeFile(filename, zip(entries)); await assert.rejects(inspect(filename, 'Materiały.docx', mime));
    process.env.UPLOAD_DOCX_ENABLED = '1'; assert.equal((await inspect(filename, 'Materiały.docx', mime)).mime, mime);
    const bad = [
      [['random.txt', 'not a document']],
      [...entries, ['word/vbaProject.bin', 'macro']],
      [...entries, ['../escape', 'path']],
      [...entries, ['word/_rels/document.xml.rels', '<Relationships><Relationship TargetMode="External" Target="https://example.test"/></Relationships>']],
      [...entries, ['word/_rels/document.xml.rels', '<Relationships><Relationship TargetMode="&#69;xternal"/></Relationships>']],
      [...entries.slice(0, 2), ['word/document.xml', '<!DOCTYPE doc [<!ENTITY e "x">]><document>&e;</document>']],
      [...entries.slice(0, 2), ['word/document.xml', '<document><broken></document>']],
      [...entries, ['huge.bin', Buffer.alloc(10 * 1024 * 1024 + 1)]],
      [...entries, ...Array.from({ length: 1000 }, (_, i) => [`file${i}`, 'x'])],
    ];
    for (const fixture of bad) { await fs.writeFile(filename, zip(fixture)); await assert.rejects(inspect(filename, 'Bad.docx', mime)); }
  } finally { delete process.env.UPLOAD_DOCX_ENABLED; await fs.rm(directory, { recursive: true, force: true }); }
});
