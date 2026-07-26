import { browser } from 'wxt/browser';
import type { ExtensionRequest, ExtensionResponse } from '../core/types';

export class ExtensionClient {
  async send<T extends ExtensionResponse>(request: ExtensionRequest): Promise<T> {
    return browser.runtime.sendMessage(request) as Promise<T>;
  }
}
