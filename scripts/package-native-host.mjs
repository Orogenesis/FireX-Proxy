#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const HostName = 'com.firexproxy.native';
const root = resolve(import.meta.dirname, '..');
const extensionIdentity = readExtensionIdentity();
const FirefoxExtensionId = process.env.FIREX_FIREFOX_EXTENSION_ID || extensionIdentity.firefox.id;
const ChromeExtensionId = process.env.FIREX_CHROME_EXTENSION_ID || extensionIdentity.chromium.id;

const options = parseArgs(process.argv.slice(2));
const version = options.version || readNativeVersion();
const os = requiredOption('os');
const arch = requiredOption('arch');
const binary = resolve(requiredOption('binary'));
const outDir = resolve(options.out || join(root, 'dist', 'native'));
const workDir = resolve(options.work || join(root, '.native-package', `${os}-${arch}`));
const packageBaseName = `firex-native-${version}-${os}-${arch}`;

if (!existsSync(binary)) {
  fail(`Native app binary does not exist: ${binary}`);
}

rmSync(workDir, { force: true, recursive: true });
mkdirSync(outDir, { recursive: true });

switch (os) {
  case 'macos':
    packageMacos();
    break;
  case 'linux':
    packageLinux();
    break;
  case 'windows':
    packageWindows();
    break;
  default:
    fail(`Unsupported package OS: ${os}`);
}

function packageMacos() {
  const rootDir = join(workDir, 'root');
  const binPath = '/usr/local/bin/firex-native';
  const binaryTarget = join(rootDir, binPath);

  copyExecutable(binary, binaryTarget);
  writeJsonManifest(
    join(rootDir, 'Library', 'Application Support', 'Mozilla', 'NativeMessagingHosts', `${HostName}.json`),
    firefoxManifest(binPath)
  );

  if (ChromeExtensionId) {
    for (const manifestDir of macosChromiumNativeHostDirs()) {
      writeJsonManifest(join(rootDir, manifestDir, `${HostName}.json`), chromeManifest(binPath));
    }
  }

  const pkgPath = join(outDir, `${packageBaseName}.pkg`);
  run('pkgbuild', [
    '--root',
    rootDir,
    '--identifier',
    'com.firexproxy.native',
    '--version',
    version,
    '--install-location',
    '/',
    pkgPath
  ]);
  tarGz(rootDir, join(outDir, `${packageBaseName}.tar.gz`));
}

function macosChromiumNativeHostDirs() {
  return [
    join('Library', 'Google', 'Chrome', 'NativeMessagingHosts'),
    join('Library', 'Application Support', 'Chromium', 'NativeMessagingHosts'),
    join('Library', 'Application Support', 'BraveSoftware', 'Brave-Browser', 'NativeMessagingHosts'),
    join('Library', 'Application Support', 'Microsoft Edge', 'NativeMessagingHosts'),
    join('Library', 'Application Support', 'Vivaldi', 'NativeMessagingHosts'),
    join('Library', 'Application Support', 'com.operasoftware.Opera', 'NativeMessagingHosts'),
    join('Library', 'Application Support', 'Arc', 'User Data', 'NativeMessagingHosts')
  ];
}

function packageLinux() {
  const rootDir = join(workDir, 'deb');
  const binPath = '/usr/bin/firex-native';
  const binaryTarget = join(rootDir, binPath);

  copyExecutable(binary, binaryTarget);
  writeJsonManifest(
    join(rootDir, 'usr', 'lib', 'mozilla', 'native-messaging-hosts', `${HostName}.json`),
    firefoxManifest(binPath)
  );

  if (ChromeExtensionId) {
    writeJsonManifest(
      join(rootDir, 'etc', 'opt', 'chrome', 'native-messaging-hosts', `${HostName}.json`),
      chromeManifest(binPath)
    );
    writeJsonManifest(
      join(rootDir, 'etc', 'chromium', 'native-messaging-hosts', `${HostName}.json`),
      chromeManifest(binPath)
    );
  }

  const debianDir = join(rootDir, 'DEBIAN');
  mkdirSync(debianDir, { recursive: true });
  writeFileSync(
    join(debianDir, 'control'),
    [
      'Package: firex-native',
      `Version: ${version}`,
      'Section: net',
      'Priority: optional',
      `Architecture: ${debianArchitecture(arch)}`,
      'Maintainer: FireX Proxy <noreply@github.com>',
      'Description: FireX Proxy native companion app',
      ''
    ].join('\n')
  );

  const debPath = join(outDir, `${packageBaseName}.deb`);
  run('dpkg-deb', ['--build', '--root-owner-group', rootDir, debPath]);
  tarGz(rootDir, join(outDir, `${packageBaseName}.tar.gz`));
}

function packageWindows() {
  const zipRoot = join(workDir, packageBaseName);
  mkdirSync(zipRoot, { recursive: true });
  cpSync(binary, join(zipRoot, 'firex-native.exe'));
  writeFileSync(join(zipRoot, 'install.ps1'), windowsInstallScript());
  writeFileSync(join(zipRoot, 'uninstall.ps1'), windowsUninstallScript());
  writeFileSync(join(zipRoot, 'README.txt'), windowsReadme());

  const zipPath = join(outDir, `${packageBaseName}.zip`);
  run('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    `Compress-Archive -Path '${escapePowerShell(join(zipRoot, '*'))}' -DestinationPath '${escapePowerShell(zipPath)}' -Force`
  ]);
}

function firefoxManifest(path) {
  return {
    name: HostName,
    description: 'FireX Proxy native companion app',
    path,
    type: 'stdio',
    allowed_extensions: [FirefoxExtensionId]
  };
}

function chromeManifest(path) {
  return {
    name: HostName,
    description: 'FireX Proxy native companion app',
    path,
    type: 'stdio',
    allowed_origins: [`chrome-extension://${ChromeExtensionId}/`]
  };
}

function windowsInstallScript() {
  return String.raw`param(
  [string]$ChromeExtensionId = "__CHROME_EXTENSION_ID__",
  [string]$FirefoxExtensionId = "__FIREFOX_EXTENSION_ID__"
)

$ErrorActionPreference = "Stop"
$HostName = "__HOST_NAME__"
$InstallDir = Join-Path $env:LOCALAPPDATA "FireX Proxy\Native"
$BinaryPath = Join-Path $InstallDir "firex-native.exe"

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Copy-Item -Force -Path (Join-Path $PSScriptRoot "firex-native.exe") -Destination $BinaryPath

function Write-Manifest {
  param([string]$Path, [hashtable]$Manifest)
  New-Item -ItemType Directory -Force -Path (Split-Path $Path) | Out-Null
  $Manifest | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 -Path $Path
}

function Set-NativeHostRegistry {
  param([string]$KeyPath, [string]$ManifestPath)
  New-Item -Force -Path $KeyPath | Out-Null
  Set-Item -Path $KeyPath -Value $ManifestPath
}

$FirefoxManifestPath = Join-Path $InstallDir "$HostName.firefox.json"
Write-Manifest -Path $FirefoxManifestPath -Manifest @{
  name = $HostName
  description = "FireX Proxy native companion app"
  path = $BinaryPath
  type = "stdio"
  allowed_extensions = @($FirefoxExtensionId)
}
Set-NativeHostRegistry -KeyPath "HKCU:\Software\Mozilla\NativeMessagingHosts\$HostName" -ManifestPath $FirefoxManifestPath

if ($ChromeExtensionId -and $ChromeExtensionId -ne "__CHROME_EXTENSION_ID__") {
  $ChromeManifestPath = Join-Path $InstallDir "$HostName.chrome.json"
  Write-Manifest -Path $ChromeManifestPath -Manifest @{
    name = $HostName
    description = "FireX Proxy native companion app"
    path = $BinaryPath
    type = "stdio"
    allowed_origins = @("chrome-extension://$ChromeExtensionId/")
  }
  Set-NativeHostRegistry -KeyPath "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$HostName" -ManifestPath $ChromeManifestPath
  Set-NativeHostRegistry -KeyPath "HKCU:\Software\Chromium\NativeMessagingHosts\$HostName" -ManifestPath $ChromeManifestPath
}

Write-Host "FireX Native installed."
Write-Host "Restart the browser or reload the extension."
`
    .replaceAll('__HOST_NAME__', HostName)
    .replaceAll('__FIREFOX_EXTENSION_ID__', FirefoxExtensionId)
    .replaceAll('__CHROME_EXTENSION_ID__', ChromeExtensionId || '__CHROME_EXTENSION_ID__');
}

function windowsUninstallScript() {
  return String.raw`$ErrorActionPreference = "Stop"
$HostName = "__HOST_NAME__"
$InstallDir = Join-Path $env:LOCALAPPDATA "FireX Proxy\Native"

Remove-Item -Recurse -Force -ErrorAction SilentlyContinue -Path $InstallDir
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue -Path "HKCU:\Software\Mozilla\NativeMessagingHosts\$HostName"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue -Path "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$HostName"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue -Path "HKCU:\Software\Chromium\NativeMessagingHosts\$HostName"

Write-Host "FireX Native removed."
`.replaceAll('__HOST_NAME__', HostName);
}

function windowsReadme() {
  return [
    'FireX Native',
    '',
    'Install for Firefox:',
    '  powershell -ExecutionPolicy Bypass -File .\\install.ps1',
    '',
    'Install for Chrome/Chromium with a published or unpacked extension ID:',
    '  powershell -ExecutionPolicy Bypass -File .\\install.ps1 -ChromeExtensionId <extension-id>',
    '',
    'Uninstall:',
    '  powershell -ExecutionPolicy Bypass -File .\\uninstall.ps1',
    ''
  ].join('\r\n');
}

function copyExecutable(source, target) {
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target);

  if (process.platform !== 'win32') {
    run('chmod', ['755', target]);
  }
}

function writeJsonManifest(path, manifest) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

function tarGz(sourceDir, destination) {
  run('tar', ['-czf', destination, '-C', sourceDir, '.']);
}

function debianArchitecture(value) {
  if (value === 'x64') {
    return 'amd64';
  }

  if (value === 'arm64') {
    return 'arm64';
  }

  return value;
}

function readNativeVersion() {
  const cargoToml = readFileSync(join(root, 'native', 'firex-native', 'Cargo.toml'), 'utf8');
  const match = cargoToml.match(/^version\s*=\s*"([^"]+)"/m);

  if (!match?.[1]) {
    fail('Could not read native app version from Cargo.toml');
  }

  return match[1];
}

function readExtensionIdentity() {
  return JSON.parse(readFileSync(join(root, 'config', 'extension-identity.json'), 'utf8'));
}

function requiredOption(name) {
  const value = options[name];

  if (!value) {
    fail(`Missing required option: --${name}`);
  }

  return value;
}

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    const value = args[index + 1];

    if (!key?.startsWith('--') || !value) {
      fail(`Invalid argument near ${key || '<empty>'}`);
    }

    parsed[key.slice(2)] = value;
    index += 1;
  }

  return parsed;
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });

  if (result.status !== 0) {
    fail(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function escapePowerShell(value) {
  return value.replaceAll("'", "''");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
