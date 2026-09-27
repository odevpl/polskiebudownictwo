const fs = require('node:fs/promises');
const path = require('node:path');
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');
const { config, FileError } = require('./config');

function safeName(input) {
  const name = String(input || '').normalize('NFC');
  if (!name || name.length > 180 || /[\\/:"|?*\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/u.test(name) || name.startsWith('.') || name.includes('..') || /[. ]$/.test(name) || /\ufffd/.test(name)) throw new FileError('Nazwa pliku jest nieprawidłowa (maksymalnie 180 znaków, bez znaków specjalnych).');
  return name;
}

const types = {
  '.pdf': { mime: 'application/pdf' },
  '.jpg': { mime: 'image/jpeg' },
  '.jpeg': { mime: 'image/jpeg' },
  '.webp': { mime: 'image/webp' },
  '.docx': { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  '.xlsx': { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  '.xlsm': { mime: 'application/vnd.ms-excel.sheet.macroEnabled.12' },
  '.csv': { mime: 'text/csv', declared: new Set(['text/csv', 'application/vnd.ms-excel']) },
};

function allowedFormats() {
  return 'Dozwolone formaty: PDF, JPG, WebP, XLSX, XLSM, CSV' + (config().docx ? ', DOCX.' : '.');
}

async function inspect(filename, originalName, declaredMime) {
  const name = safeName(originalName);
  const extension = path.extname(name).toLowerCase();
  const type = types[extension];
  if (!type || (extension === '.docx' && !config().docx)) throw new FileError(allowedFormats());
  if (declaredMime !== type.mime && !type.declared?.has(declaredMime) && declaredMime !== 'application/octet-stream') throw new FileError('Typ pliku nie zgadza się z rozszerzeniem.');
  const stat = await fs.stat(filename);
  if (!stat.size || stat.size > config().maxBytes) throw new FileError('Plik jest pusty lub przekracza limit rozmiaru.');
  await new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: { filename, extension, maxPixels: config().maxPixels }, resourceLimits: { maxOldGenerationSizeMb: 192 } });
    let settled = false;
    const finish = async error => { if (settled) return; settled = true; clearTimeout(timer); await worker.terminate(); error ? reject(error) : resolve(); };
    const timer = setTimeout(() => finish(new FileError('Weryfikacja pliku przekroczyła limit czasu.')), 15000);
    worker.once('message', ok => finish(ok ? null : new FileError('Plik jest uszkodzony lub ma niedozwoloną zawartość.')));
    worker.once('error', () => finish(new FileError('Nie udało się zweryfikować pliku.')));
    worker.once('exit', () => { if (!settled) finish(new FileError('Nie udało się zweryfikować pliku.')); });
  });
  return { name, mime: type.mime, size: stat.size };
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
    await validateOoxml(filename, { mainPart: 'word/document.xml', mainContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml', mainTag: 'document' });
  } else if (extension === '.xlsx') {
    await validateOoxml(filename, { mainPart: 'xl/workbook.xml', mainContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml', mainTag: 'workbook' });
  } else if (extension === '.xlsm') {
    await validateOoxml(filename, { mainPart: 'xl/workbook.xml', mainContentType: 'application/vnd.ms-excel.sheet.macroEnabled.main+xml', mainTag: 'workbook', allowVba: true });
  } else if (extension === '.csv') {
    await validateCsv(filename);
  } else {
    const sharp = require('sharp');
    sharp.cache(false);
    const image = sharp(filename, { limitInputPixels: maxPixels, failOn: 'warning' });
    const metadata = await image.metadata();
    if (metadata.format !== (extension === '.webp' ? 'webp' : 'jpeg') || (metadata.pages || 1) !== 1) throw new Error('Not supported image');
    await image.stats();
  }
}

async function validateOoxml(filename, { mainPart, mainContentType, mainTag, allowVba = false }) {
  const yauzl = require('yauzl');
  await new Promise((resolve, reject) => {
    yauzl.open(filename, { lazyEntries: true, validateEntrySizes: true, strictFileNames: true }, (error, zip) => {
      if (error) return reject(error);
      let count = 0;
      let total = 0;
      const entries = new Set();
      const fail = error => { zip.close(); reject(error); };
      zip.on('error', fail);
      zip.on('end', () => entries.has('[Content_Types].xml') && entries.has(mainPart) && entries.has('_rels/.rels') ? resolve() : reject(new Error('Not OOXML')));
      zip.on('entry', entry => {
        const name = entry.fileName;
        total += entry.uncompressedSize;
        const forbiddenPath = allowVba
          ? /(^\/|\.\.|:|\\|activex|embeddings|macrosheets|dialogsheet|connections|externalLinks)/i
          : /(^\/|\.\.|:|\\|vba|activex|embeddings|macrosheets|dialogsheet|connections|externalLinks)/i;
        if (++count > 1000 || total > 50 * 1024 * 1024 || entry.uncompressedSize > 10 * 1024 * 1024 || entries.has(name) || forbiddenPath.test(name) || (entry.generalPurposeBitFlag & 1)) return fail(new Error('Unsafe ZIP'));
        entries.add(name);
        if (name.endsWith('/')) return zip.readEntry();
        zip.openReadStream(entry, (error, stream) => {
          if (error) return fail(error);
          const chunks = [];
          let bytes = 0;
          stream.on('error', fail);
          stream.on('data', chunk => {
            bytes += chunk.length;
            if (bytes > 10 * 1024 * 1024) { stream.destroy(); fail(new Error('ZIP limit')); }
            else if (/\.(xml|rels)$/i.test(name)) chunks.push(chunk);
          });
          stream.on('end', () => {
            const xml = Buffer.concat(chunks).toString('utf8');
            if (/<!DOCTYPE|<!ENTITY|TargetMode\s*=\s*["']External/i.test(xml) || (!allowVba && /macroEnabled|vbaProject/i.test(xml)) || xml.includes('\0')) return fail(new Error('Unsafe XML'));
            if (name === '[Content_Types].xml' && !xml.includes(mainContentType)) return fail(new Error('Not OOXML document'));
            if (name === mainPart && !new RegExp(`<(?:\\w+:)?${mainTag}\\b`).test(xml)) return fail(new Error('Not OOXML document'));
            if (/\.(xml|rels)$/i.test(name)) {
              try {
                const { SaxesParser } = require('saxes');
                const parser = new SaxesParser({ xmlns: true });
                parser.on('doctype', () => { throw new Error('DTD forbidden'); });
                parser.on('opentag', tag => {
                  for (const attribute of Object.values(tag.attributes)) {
                    if ((attribute.local === 'TargetMode' && attribute.value === 'External') || (!allowVba && /macroEnabled|vbaProject/i.test(attribute.value))) throw new Error('Active document');
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

async function validateCsv(filename) {
  const bytes = await fs.readFile(filename);
  const offset = bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])) ? 3 : 0;
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(offset)); } catch { throw new Error('CSV encoding'); }
  if (!text || text.includes('\0')) throw new Error('Unsafe CSV');
  let quoted = false;
  let field = '';
  const checkField = () => {
    const value = field.trimStart();
    field = '';
    if (!value) return;
    if (/^[=+@]/.test(value) || (/^-/.test(value) && !/^-\d+(?:[.,]\d+)?(?:e[+-]?\d+)?$/i.test(value))) throw new Error('CSV formula');
  };
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { field += character; index += 1; } else quoted = !quoted;
    } else if (!quoted && (character === ',' || character === ';' || character === '\t' || character === '\n' || character === '\r')) {
      checkField();
      if (character === '\r' && text[index + 1] === '\n') index += 1;
    } else {
      field += character;
      if (field.length > 1024 * 1024) throw new Error('CSV field limit');
    }
  }
  if (quoted) throw new Error('CSV quotes');
  checkField();
}

if (!isMainThread) validateDocument(workerData).then(() => parentPort.postMessage(true)).catch(() => parentPort.postMessage(false));

module.exports = { inspect, safeName };
