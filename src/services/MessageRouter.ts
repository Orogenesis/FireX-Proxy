import type { ExtensionRequest, ExtensionResponse } from '../core/types';
import { ProxyListService } from './ProxyListService';
import { ProxySourceService } from './ProxySourceService';

export class MessageRouter {
  constructor(
    private readonly proxies: ProxyListService,
    private readonly source: ProxySourceService
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
      case 'source:sync':
        await this.source.sync();
        return this.proxies.snapshot();
      default:
        throw new Error('Unsupported extension message.');
    }
  }
}
