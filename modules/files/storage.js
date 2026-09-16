const fs = require('node:fs/promises');
const path = require('node:path');
const { config } = require('./config');
const keyPattern = /^[a-f0-9-]{36}$/;
function location(key) {
  if (!keyPattern.test(key)) throw new Error('Invalid storage key');
  return path.join(config().storage, key);
}
async function init() {
  await fs.mkdir(config().storage, { recursive: true, mode: 0o700 });
  const stat = await fs.lstat(config().storage);
  if (stat.isSymbolicLink()) throw new Error('Storage must not be a symbolic link');
  const real = await fs.realpath(config().storage);
  const appRoot = await fs.realpath(path.resolve(__dirname, '../..'));
  for (const directory of ['page', 'public', 'dists', 'dist', 'subdomain']) {
    const relative = path.relative(path.join(appRoot, directory), real);
    if (!relative || (!relative.startsWith('..') && !path.isAbsolute(relative))) throw new Error('Storage resolves into a public/deployment directory');
  }
}
async function remove(key) { await fs.rm(location(key), { force: true }); }
async function restrict(key) { await fs.chmod(location(key), 0o600); }
async function exists(key) { try { const stat = await fs.lstat(location(key)); return stat.isFile() && !stat.isSymbolicLink(); } catch (e) { if (e.code === 'ENOENT') return false; throw e; } }
module.exports = { location, init, remove, restrict, exists, keyPattern };
