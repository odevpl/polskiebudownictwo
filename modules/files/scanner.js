const net = require('node:net');
const fs = require('node:fs');
const { once } = require('node:events');
const { config, FileError } = require('./config');

async function scan(filename) {
  const settings = config();
  if (!settings.scannerHost) {
    if (settings.scanRequired) throw new FileError('Skaner plików jest niedostępny. Spróbuj później.', 503);
    return 'skipped';
  }
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: settings.scannerHost, port: settings.scannerPort });
    const source = fs.createReadStream(filename, { highWaterMark: 65536 });
    let answer = '', settled = false;
    const finish = (error, result) => {
      if (settled) return;
      settled = true; clearTimeout(timer); source.destroy(); socket.destroy();
      error ? reject(error) : resolve(result);
    };
    const unavailable = () => finish(new FileError('Nie udało się przeskanować pliku. Spróbuj później.', 503));
    const timer = setTimeout(unavailable, settings.scanTimeoutMs);
    socket.on('error', unavailable);
    source.on('error', unavailable);
    socket.on('close', () => { if (!settled) unavailable(); });
    socket.on('data', chunk => {
      answer += chunk.toString('utf8');
      if (answer.length > 4096) return unavailable();
      if (!answer.includes('\0') && !answer.includes('\n')) return;
      const result = answer.replace(/[\0\r\n]+$/, '');
      if (result === 'stream: OK') finish(null, 'clean');
      else if (/ FOUND$/.test(result)) finish(new FileError('Plik został odrzucony przez skaner.'));
      else unavailable();
    });
    socket.on('connect', async () => {
      try {
        socket.write('zINSTREAM\0');
        for await (const chunk of source) {
          const size = Buffer.alloc(4); size.writeUInt32BE(chunk.length);
          socket.write(size);
          if (!socket.write(chunk)) await once(socket, 'drain');
        }
        socket.write(Buffer.alloc(4));
      } catch { unavailable(); }
    });
  });
}
module.exports = { scan };
