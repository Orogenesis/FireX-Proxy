import { browser } from 'wxt/browser';

type PermissionRequest = Parameters<typeof browser.permissions.contains>[0];

export async function ensureSourceHostPermissions(urls: string[]): Promise<boolean> {
  for (const url of urls) {
    const permission = { origins: [toOriginPattern(url)] } as PermissionRequest;

    if (await browser.permissions.contains(permission)) {
      continue;
    }

    if (!await browser.permissions.request(permission)) {
      return false;
    }
  }

  return true;
}

export async function hasSourceHostPermissions(urls: string[]): Promise<boolean> {
  for (const url of urls) {
    const permission = { origins: [toOriginPattern(url)] } as PermissionRequest;

    if (!await browser.permissions.contains(permission)) {
      return false;
    }
  }

  return true;
}

function toOriginPattern(value: string): string {
  const url = new URL(value.trim());

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Source URL must use HTTP or HTTPS.');
  }

  return `${url.protocol}//${url.host}/*`;
}
