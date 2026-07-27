#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cargoTomlPath = 'native/firex-native/Cargo.toml';
const cargoLockPath = 'native/firex-native/Cargo.lock';
const manifestPath = 'native-manifest.json';
const releaseFiles = [cargoTomlPath, cargoLockPath, manifestPath];
const version = parseVersion(process.argv.slice(2));
const tagName = `native-v${version}`;

await ensureVersionFilesAreSafeToEdit();
await updateCargoVersion(version);
run('cargo', ['check', '--manifest-path', cargoTomlPath]);
run('npm', ['run', 'native:manifest']);
ensureTagDoesNotExist(tagName);
ensureReleaseFilesChanged();

run('git', ['add', ...releaseFiles]);
run('git', ['commit', '-m', `chore: release firex-native ${version}`]);
run('git', ['tag', tagName]);
run('git', ['push', 'origin', 'HEAD']);
run('git', ['push', 'origin', tagName]);

console.error(`firex-native ${version} pushed with tag ${tagName}.`);

function parseVersion(args) {
  const value = args[0] || process.env.VERSION;

  if (!value || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value)) {
    fail('Usage: npm run native:release -- <version>');
  }

  return value;
}

async function ensureVersionFilesAreSafeToEdit() {
  const status = commandOutput('git', ['status', '--porcelain', '--', ...releaseFiles]);
  const dirtyFiles = status
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.slice(3));

  if (dirtyFiles.length > 0) {
    fail(`Release files already have local changes:\n${dirtyFiles.map(file => `  ${file}`).join('\n')}`);
  }
}

async function updateCargoVersion(nextVersion) {
  const cargoToml = await readFile(resolve(root, cargoTomlPath), 'utf8');
  const updated = cargoToml.replace(
    /^version\s*=\s*"[^"]+"/m,
    `version = "${nextVersion}"`
  );

  if (updated === cargoToml) {
    fail('Could not update firex-native version in Cargo.toml.');
  }

  await writeFile(resolve(root, cargoTomlPath), updated, 'utf8');
}

function ensureTagDoesNotExist(tag) {
  const localTag = spawnSync('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], {
    cwd: root,
    stdio: 'ignore'
  });

  if (localTag.status === 0) {
    fail(`Tag already exists locally: ${tag}`);
  }

  const remoteTag = commandOutput('git', ['ls-remote', '--tags', 'origin', tag]);

  if (remoteTag.trim()) {
    fail(`Tag already exists on origin: ${tag}`);
  }
}

function ensureReleaseFilesChanged() {
  const diff = commandOutput('git', ['status', '--porcelain', '--', ...releaseFiles]);

  if (!diff.trim()) {
    fail(`firex-native is already at ${version}.`);
  }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    fail(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function commandOutput(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    fail(`Command failed: ${command} ${args.join(' ')}\n${result.stderr || ''}`.trim());
  }

  return result.stdout;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
