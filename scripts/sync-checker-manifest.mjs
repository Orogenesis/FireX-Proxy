#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cargoTomlPath = resolve(root, 'native', 'firex-checker', 'Cargo.toml');
const manifestPath = resolve(root, 'checker-manifest.json');
const releaseUrl = 'https://github.com/Orogenesis/FireX-Proxy/releases/latest';

const cargoToml = await readFile(cargoTomlPath, 'utf8');
const version = readCheckerVersion(cargoToml);
const currentManifest = await readCurrentManifest();

const manifest = {
  schemaVersion: 1,
  checker: {
    latestVersion: version,
    minimumVersion: currentManifest?.checker.minimumVersion || version,
    protocolVersion: currentManifest?.checker.protocolVersion || 1,
    releaseUrl: currentManifest?.checker.releaseUrl || releaseUrl
  }
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.error(`checker-manifest.json synced to firex-checker ${version}.`);

function readCheckerVersion(cargoToml) {
  const match = cargoToml.match(/^version\s*=\s*"([^"]+)"/m);

  if (!match?.[1]) {
    throw new Error('Could not read checker version from native/firex-checker/Cargo.toml.');
  }

  return match[1];
}

async function readCurrentManifest() {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

    if (
      manifest?.schemaVersion !== 1
      || typeof manifest.checker?.minimumVersion !== 'string'
      || !Number.isInteger(manifest.checker?.protocolVersion)
      || typeof manifest.checker?.releaseUrl !== 'string'
    ) {
      return undefined;
    }

    return manifest;
  } catch {
    return undefined;
  }
}
