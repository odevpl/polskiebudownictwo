param(
  [ValidateSet('all', 'main', 'mediacje')]
  [string]$Target = 'all'
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')
$distsDir = Join-Path $root 'dists'

function Copy-DeployItem {
  param(
    [Parameter(Mandatory = $true)]
    [string]$SourceRoot,
    [Parameter(Mandatory = $true)]
    [string]$DestinationRoot,
    [Parameter(Mandatory = $true)]
    [string]$Item
  )

  $source = Join-Path $SourceRoot $Item
  if (-not (Test-Path -LiteralPath $source)) {
    return
  }

  $destination = Join-Path $DestinationRoot $Item
  if (Test-Path -LiteralPath $source -PathType Container) {
    New-Item -ItemType Directory -Force -Path $destination | Out-Null
    Copy-Item -Path (Join-Path $source '*') -Destination $destination -Recurse -Force
  } else {
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force
  }
}

function Remove-BlockedItems {
  param(
    [Parameter(Mandatory = $true)]
    [string]$DestinationRoot
  )

  $blocked = @(
    '.env',
    '.git',
    'node_modules',
    'AGENTS.md',
    'polskiebudownictwo_spec.md',
    'deploy',
    'dist',
    'dists',
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
    $candidate = Join-Path $DestinationRoot $blockedItem
    if (Test-Path -LiteralPath $candidate) {
      Remove-Item -LiteralPath $candidate -Recurse -Force
    }
  }
}

function New-MainPackage {
  $destinationRoot = Join-Path $distsDir 'polskiebudownictwo.org'

  if (Test-Path -LiteralPath $destinationRoot) {
    Remove-Item -LiteralPath $destinationRoot -Recurse -Force
  }

  New-Item -ItemType Directory -Force -Path $destinationRoot | Out-Null

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

  foreach ($item in $items) {
    Copy-DeployItem -SourceRoot $root -DestinationRoot $destinationRoot -Item $item
  }

  Remove-BlockedItems -DestinationRoot $destinationRoot
  Write-Host "Main dist package created: $destinationRoot"
}

function New-MediationPackage {
  $destinationRoot = Join-Path $distsDir 'mediacje.polskiebudownictwo.org'

  if (Test-Path -LiteralPath $destinationRoot) {
    Remove-Item -LiteralPath $destinationRoot -Recurse -Force
  }

  New-Item -ItemType Directory -Force -Path $destinationRoot | Out-Null

  $items = @(
    'server.js',
    'package.json',
    'package-lock.json',
    '.env.example',
    'subdomain',
    'public'
  )

  foreach ($item in $items) {
    Copy-DeployItem -SourceRoot $root -DestinationRoot $destinationRoot -Item $item
  }

  Copy-Item -LiteralPath (Join-Path $root 'app-mediacje.js') -Destination (Join-Path $destinationRoot 'app.js') -Force

  Remove-BlockedItems -DestinationRoot $destinationRoot
  Write-Host "Mediation dist package created: $destinationRoot"
}

if ($Target -eq 'all' -or $Target -eq 'main') {
  New-MainPackage
}

if ($Target -eq 'all' -or $Target -eq 'mediacje') {
  New-MediationPackage
}
