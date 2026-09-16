const fs = require('node:fs/promises');
const path = require('node:path');
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');
const { config, FileError } = require('./config');

function safeName(input) {
  const name = String(input || '').normalize('NFC');
  if (!name || name.length > 180 || /[\\/<>:"|?*\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/u.test(name) || name.startsWith('.') || name.includes('..') || /[. ]$/.test(name) || /\ufffd/.test(name)) throw new FileError('Nazwa pliku jest nieprawidłowa (maksymalnie 180 znaków, bez znaków specjalnych).');
  return name;
}
const types = { '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
async function inspect(filename, originalName, declaredMime) {
  const name = safeName(originalName);
  const extension = path.extname(name).toLowerCase();
  const mime = types[extension];
  if (!mime || (extension === '.docx' && !config().docx)) throw new FileError('Dozwolone formaty: PDF, JPG, WebP' + (config().docx ? ', DOCX.' : '.'));
  if (declaredMime !== mime && declaredMime !== 'application/octet-stream') throw new FileError('Typ pliku nie zgadza się z rozszerzeniem.');
  const stat = await fs.stat(filename);
  if (!stat.size || stat.size > config().maxBytes) throw new FileError('Plik jest pusty lub przekracza limit rozmiaru.');
  // Parse untrusted documents off the HTTP event loop with a hard execution deadline.
  await new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: { filename, extension, maxPixels: config().maxPixels }, resourceLimits: { maxOldGenerationSizeMb: 192 } });
    let settled = false;
    const finish = async error => { if (settled) return; settled = true; clearTimeout(timer); await worker.terminate(); error ? reject(error) : resolve(); };
    const timer = setTimeout(() => finish(new FileError('Weryfikacja pliku przekroczyła limit czasu.')), 15000);
    worker.once('message', ok => finish(ok ? null : new FileError('Plik jest uszkodzony lub ma niedozwoloną zawartość.')));
    worker.once('error', () => finish(new FileError('Nie udało się zweryfikować pliku.')));
    worker.once('exit', () => { if (!settled) finish(new FileError('Nie udało się zweryfikować pliku.')); });
  });
  return { name, mime, size: stat.size };
}

async function validateDocument({ filename, extension, maxPixels }) {
  if (extension === '.pdf') {
    const bytes = await fs.readFile(filename);
    if (!bytes.subarray(0, 8).toString('ascii').startsWith('%PDF-') || !bytes.subarray(-1024).includes(Buffer.from('%%EOF'))) throw new Error('Not PDF');
    const { PDFDocument, PDFName, PDFDict } = require('pdf-lib');
    const doc = await PDFDocument.load(bytes, { throwOnInvalidObject: true });
    if (!doc.getPageCount()) throw new Error('No pages');
    const forbidden = ['JavaScript', 'JS', 'AA', 'OpenAction', 'Launch', 'EmbeddedFiles', 'RichMedia', 'XFA'];
    for (const [, object] of doc.context.enumerateIndirectObjects()) {
      if (object instanceof PDFDict && forbidden.some(key => object.has(PDFName.of(key)))) throw new Error('Active PDF');
    }
  } else if (extension === '.docx') {
    await validateDocx(filename);
  } else {
    const sharp = require('sharp');
    sharp.cache(false);
    const image = sharp(filename, { limitInputPixels: maxPixels, failOn: 'warning' });
    const metadata = await image.metadata();
    if (metadata.format !== (extension === '.webp' ? 'webp' : 'jpeg') || (metadata.pages || 1) !== 1) throw new Error('Not supported image');
    await image.stats(); // Decode pixels as well as the header; no public thumbnail is created.
  }
}
async function validateDocx(filename) {
  const yauzl = require('yauzl');
  await new Promise((resolve, reject) => {
    yauzl.open(filename, { lazyEntries: true, validateEntrySizes: true, strictFileNames: true }, (error, zip) => {
      if (error) return reject(error);
      let count = 0, total = 0; const entries = new Set();
      const fail = error => { zip.close(); reject(error); };
      zip.on('error', fail);
      zip.on('end', () => entries.has('[Content_Types].xml') && entries.has('word/document.xml') && entries.has('_rels/.rels') ? resolve() : reject(new Error('Not OOXML')));
      zip.on('entry', entry => {
        const name = entry.fileName;
        total += entry.uncompressedSize;
        if (++count > 1000 || total > 50 * 1024 * 1024 || entry.uncompressedSize > 10 * 1024 * 1024 || entries.has(name) || /(^\/|\.\.|:|\\|vba|activex|embeddings)/i.test(name) || (entry.generalPurposeBitFlag & 1)) return fail(new Error('Unsafe ZIP'));
        entries.add(name);
        if (name.endsWith('/')) return zip.readEntry();
        zip.openReadStream(entry, (error, stream) => {
          if (error) return fail(error);
          const chunks = []; let bytes = 0;
          stream.on('error', fail);
          stream.on('data', chunk => { bytes += chunk.length; if (bytes > 10 * 1024 * 1024) { stream.destroy(); fail(new Error('ZIP limit')); } else if (/\.(xml|rels)$/i.test(name)) chunks.push(chunk); });
          stream.on('end', () => {
            const xml = Buffer.concat(chunks).toString('utf8');
            if (/<!DOCTYPE|<!ENTITY|macroEnabled|vbaProject|TargetMode\s*=\s*["']External/i.test(xml) || xml.includes('\0')) return fail(new Error('Unsafe XML'));
            if (name === '[Content_Types].xml' && !xml.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml')) return fail(new Error('Not DOCX'));
            if (name === 'word/document.xml' && !/<(?:\w+:)?document\b/.test(xml)) return fail(new Error('Not document'));
            if (/\.(xml|rels)$/i.test(name)) {
              try {
                const { SaxesParser } = require('saxes');
                const parser = new SaxesParser({ xmlns: true });
                parser.on('doctype', () => { throw new Error('DTD forbidden'); });
                parser.on('opentag', tag => {
                  for (const attribute of Object.values(tag.attributes)) {
                    if ((attribute.local === 'TargetMode' && attribute.value === 'External') || /macroEnabled|vbaProject/i.test(attribute.value)) throw new Error('Active document');
                  }
                });
                parser.write(xml).close();
              } catch (error) { return fail(error); }
            }
            zip.readEntry();
          });
        });
      });
      zip.readEntry();
    });
  });
}
if (!isMainThread) validateDocument(workerData).then(() => parentPort.postMessage(true)).catch(() => parentPort.postMessage(false));
module.exports = { inspect, safeName };
