import { browser } from 'wxt/browser';

type PermissionRequest = Parameters<typeof browser.permissions.contains>[0];

export class HostPermissionService {
  async hasUrlAccess(url: string): Promise<boolean> {
    const origin = this.toOriginPattern(url);
    const permission = { origins: [origin] } as PermissionRequest;

    return Boolean(await browser.permissions.contains(permission));
  }

  private toOriginPattern(url: string): string {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('Source URL must use HTTP or HTTPS.');
    }

    return `${parsed.protocol}//${parsed.host}/*`;
  }
}
