const fs = require('node:fs');
const path = require('node:path');

const target = process.argv[2] || 'all';
const allowedTargets = new Set(['all', 'main', 'mediacje']);

if (!allowedTargets.has(target)) {
  console.error(`Unknown target: ${target}`);
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const distsDir = path.join(root, 'dists');

function copyDeployItem(sourceRoot, destinationRoot, item) {
  const source = path.join(sourceRoot, item);

  if (!fs.existsSync(source)) return;

  const destination = path.join(destinationRoot, item);
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    fs.cpSync(source, destination, { recursive: true, force: true });
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function removeBlockedItems(destinationRoot) {
  const blocked = [
    '.env',
    '.git',
    'node_modules',
    'AGENTS.md',
    'polskiebudownictwo_spec.md',
    'deploy',
    'dist',
    'dists',
    'scripts/buildDeployPackage.ps1',
    'scripts/buildDeployPackage.js',
    'controllers/admin/.gitkeep',
    'public/assets/.gitkeep',
    'public/css/.gitkeep',
    'public/js/.gitkeep',
    'views/admin/.gitkeep',
    'views/layouts/.gitkeep',
    'views/partials/.gitkeep',
    'views/public/.gitkeep',
  ];

  for (const item of blocked) {
    fs.rmSync(path.join(destinationRoot, item), { recursive: true, force: true });
  }
}

function newMainPackage() {
  const destinationRoot = path.join(distsDir, 'polskiebudownictwo.org');
  fs.rmSync(destinationRoot, { recursive: true, force: true });
  fs.mkdirSync(destinationRoot, { recursive: true });

  const items = [
    'app.js',
    'server.js',
    'package.json',
    'package-lock.json',
    '.env.example',
    'config',
    'controllers',
    'middleware',
    'models',
    'page',
    'public',
    'routes',
    'scripts',
    'services',
    'sql',
    'views',
  ];

  for (const item of items) copyDeployItem(root, destinationRoot, item);

  removeBlockedItems(destinationRoot);
  console.log(`Main dist package created: ${destinationRoot}`);
}

function newMediationPackage() {
  const destinationRoot = path.join(distsDir, 'mediacje.polskiebudownictwo.org');
  fs.rmSync(destinationRoot, { recursive: true, force: true });
  fs.mkdirSync(destinationRoot, { recursive: true });

  const items = [
    'server.js',
    'package.json',
    'package-lock.json',
    '.env.example',
    'subdomain',
    'public',
  ];

  for (const item of items) copyDeployItem(root, destinationRoot, item);

  fs.copyFileSync(path.join(root, 'app-mediacje.js'), path.join(destinationRoot, 'app.js'));

  removeBlockedItems(destinationRoot);
  console.log(`Mediation dist package created: ${destinationRoot}`);
}

if (target === 'all' || target === 'main') newMainPackage();
if (target === 'all' || target === 'mediacje') newMediationPackage();
