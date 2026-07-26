import { browser } from 'wxt/browser';
import type { ExtensionRequest } from '../src/core/types';
import { ProxySourceParser } from '../src/domain/source/ProxySourceParser';
import { HostPermissionService } from '../src/services/HostPermissionService';
import { MessageRouter } from '../src/services/MessageRouter';
import { CheckerManifestService } from '../src/services/CheckerManifestService';
import { NativeCheckerClient } from '../src/services/NativeCheckerClient';
import { ProxyCheckerService } from '../src/services/ProxyCheckerService';
import { ProxyListService } from '../src/services/ProxyListService';
import { ProxyRoutingService } from '../src/services/ProxyRoutingService';
import { ProxySourceService } from '../src/services/ProxySourceService';
import { StorageRepository } from '../src/services/StorageRepository';

const CheckerAlarmName = 'firex-proxy-checker';

export default defineBackground(() => {
  const storage = new StorageRepository();
  const routing = new ProxyRoutingService();
  const proxies = new ProxyListService(storage, routing);
  const source = new ProxySourceService(storage, new HostPermissionService(), new ProxySourceParser());
  const checker = new ProxyCheckerService(storage, new NativeCheckerClient(), new CheckerManifestService(storage));
  const router = new MessageRouter(proxies, source, checker);

  const scheduleCheckerAlarm = () => {
    browser.alarms.create(CheckerAlarmName, { periodInMinutes: 5 }).catch(console.error);
  };

  const runScheduledCheck = async () => {
    const snapshot = await proxies.snapshot();
    await checker.startIfDue(snapshot.proxies);
  };

  browser.runtime.onInstalled.addListener(() => {
    storage.markInstalled().catch(console.error);
    scheduleCheckerAlarm();
  });

  browser.runtime.onStartup?.addListener(() => {
    proxies.restore().catch(console.error);
    scheduleCheckerAlarm();
    runScheduledCheck().catch(console.error);
  });

  browser.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === CheckerAlarmName) {
      runScheduledCheck().catch(console.error);
    }
  });

  browser.runtime.onMessage.addListener((message: unknown) => router.handle(message as ExtensionRequest));

  scheduleCheckerAlarm();
  proxies.restore().catch(console.error);
});
