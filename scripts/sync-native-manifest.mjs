#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cargoTomlPath = resolve(root, 'native', 'firex-native', 'Cargo.toml');
const manifestPath = resolve(root, 'native-manifest.json');
const releaseUrl = 'https://github.com/Orogenesis/FireX-Proxy/releases/latest';

const cargoToml = await readFile(cargoTomlPath, 'utf8');
const version = readNativeVersion(cargoToml);
const currentManifest = await readCurrentManifest();

const manifest = {
  schemaVersion: 1,
  native: {
    latestVersion: version,
    minimumVersion: currentManifest?.native.minimumVersion || version,
    protocolVersion: currentManifest?.native.protocolVersion || 1,
    releaseUrl: currentManifest?.native.releaseUrl || releaseUrl
  }
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.error(`native-manifest.json synced to firex-native ${version}.`);

function readNativeVersion(cargoToml) {
  const match = cargoToml.match(/^version\s*=\s*"([^"]+)"/m);

  if (!match?.[1]) {
    throw new Error('Could not read native app version from native/firex-native/Cargo.toml.');
  }

  return match[1];
}

async function readCurrentManifest() {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

    if (
      manifest?.schemaVersion !== 1
      || typeof manifest.native?.minimumVersion !== 'string'
      || !Number.isInteger(manifest.native?.protocolVersion)
      || typeof manifest.native?.releaseUrl !== 'string'
    ) {
      return undefined;
    }

    return manifest;
  } catch {
    return undefined;
  }
}
