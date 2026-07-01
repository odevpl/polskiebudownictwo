$ErrorActionPreference = 'Stop'

$root = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')
$stagingDir = Join-Path $root 'dist'

$items = @(
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
  'views'
)

if (Test-Path -LiteralPath $stagingDir) {
  Remove-Item -LiteralPath $stagingDir -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $stagingDir | Out-Null

foreach ($item in $items) {
  $source = Join-Path $root $item
  if (-not (Test-Path -LiteralPath $source)) {
    continue
  }

  $destination = Join-Path $stagingDir $item
  if (Test-Path -LiteralPath $source -PathType Container) {
    New-Item -ItemType Directory -Force -Path $destination | Out-Null
    Copy-Item -Path (Join-Path $source '*') -Destination $destination -Recurse -Force
  } else {
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force
  }
}

$blocked = @(
  '.env',
  '.git',
  'node_modules',
  'AGENTS.md',
  'polskiebudownictwo_spec.md',
  'deploy',
  'scripts/buildDeployPackage.ps1',
  'controllers/admin/.gitkeep',
  'public/assets/.gitkeep',
  'public/css/.gitkeep',
  'public/js/.gitkeep',
  'views/admin/.gitkeep',
  'views/layouts/.gitkeep',
  'views/partials/.gitkeep',
  'views/public/.gitkeep'
)

foreach ($blockedItem in $blocked) {
  $candidate = Join-Path $stagingDir $blockedItem
  if (Test-Path -LiteralPath $candidate) {
    Remove-Item -LiteralPath $candidate -Recurse -Force
  }
}

Write-Host "Dist package created: $stagingDir"
