import type { ExtensionRequest, ExtensionResponse } from '../core/types';
import { ProxyCheckerService } from './ProxyCheckerService';
import { ProxyListService } from './ProxyListService';
import { ProxySourceService } from './ProxySourceService';

export class MessageRouter {
  constructor(
    private readonly proxies: ProxyListService,
    private readonly source: ProxySourceService,
    private readonly checker: ProxyCheckerService
  ) {}

  async handle(request: ExtensionRequest): Promise<ExtensionResponse> {
    switch (request.type) {
      case 'snapshot:get':
        return this.proxies.snapshot();
      case 'proxy:add':
        return this.proxies.add(request.proxy);
      case 'proxy:update':
        return this.proxies.update(request.proxy);
      case 'proxy:remove':
        return this.proxies.remove(request.proxyId);
      case 'proxy:connect':
        return this.proxies.connect(request.proxyId);
      case 'proxy:disconnect':
        return this.proxies.disconnect();
      case 'bypass:set':
        return this.proxies.setBypassRules(request.rules);
      case 'source:set':
        await this.source.setSource(request.source);
        return this.proxies.snapshot();
      case 'source:auto-sync':
        await this.source.autoSync();
        return this.proxies.snapshot();
      case 'source:sync':
        await this.source.sync();
        return this.proxies.snapshot();
      case 'checker:probe':
        await this.checker.probe();
        return this.proxies.snapshot();
      case 'checker:start': {
        const snapshot = await this.proxies.snapshot();
        await this.checker.start(snapshot.proxies);
        return this.proxies.snapshot();
      }
      case 'checker:stop':
        await this.checker.stop();
        return this.proxies.snapshot();
      case 'checker:settings':
        await this.checker.setSettings(request.settings);
        return this.proxies.snapshot();
      default:
        throw new Error('Unsupported extension message.');
    }
  }
}
