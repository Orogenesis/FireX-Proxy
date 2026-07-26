import { browser } from 'wxt/browser';
import type { ExtensionRequest } from '../src/core/types';
import { ProxySourceParser } from '../src/domain/source/ProxySourceParser';
import { HostPermissionService } from '../src/services/HostPermissionService';
import { MessageRouter } from '../src/services/MessageRouter';
import { ProxyListService } from '../src/services/ProxyListService';
import { ProxyRoutingService } from '../src/services/ProxyRoutingService';
import { ProxySourceService } from '../src/services/ProxySourceService';
import { StorageRepository } from '../src/services/StorageRepository';

export default defineBackground(() => {
  const storage = new StorageRepository();
  const routing = new ProxyRoutingService();
  const proxies = new ProxyListService(storage, routing);
  const source = new ProxySourceService(storage, new HostPermissionService(), new ProxySourceParser());
  const router = new MessageRouter(proxies, source);

  browser.runtime.onInstalled.addListener(() => {
    storage.markInstalled().catch(console.error);
  });

  browser.runtime.onStartup?.addListener(() => {
    proxies.restore().catch(console.error);
  });

  browser.runtime.onMessage.addListener((message: unknown) => router.handle(message as ExtensionRequest));

  proxies.restore().catch(console.error);
});
