import { browser } from 'wxt/browser';
import { NativeCheckerHostName } from '../core/constants';
import type { ProxyCheckerSettings, ProxyEndpoint, ProxyHealthResult } from '../core/types';

interface NativePong {
  type: 'pong';
  version: string;
  protocolVersion: number;
}

interface NativeCheckStarted {
  type: 'check_started';
  requestId: string;
  total: number;
  maxWorking: number;
  concurrency: number;
}

interface NativeProxyChecked {
  type: 'proxy_checked';
  requestId: string;
  result: ProxyHealthResult;
}

interface NativeProgress {
  type: 'progress';
  requestId: string;
  checked: number;
  working: number;
  failed: number;
  queued: number;
  total: number;
}

interface NativeCheckFinished {
  type: 'check_finished';
  requestId: string;
  checked: number;
  working: number;
  failed: number;
  total: number;
  stoppedAfterGoal: boolean;
}

interface NativeError {
  type: 'error';
  message: string;
}

export type NativeCheckerMessage =
  | NativePong
  | NativeCheckStarted
  | NativeProxyChecked
  | NativeProgress
  | NativeCheckFinished
  | NativeError;

export interface NativeCheckerSession {
  requestId: string;
  done: Promise<void>;
  stop(): void;
}

export class NativeCheckerClient {
  ping(timeoutMs = 1500): Promise<NativePong> {
    return new Promise((resolve, reject) => {
      let settled = false;
      let port: Browser.runtime.Port | undefined;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          port?.disconnect();
          reject(new Error('FireX Native did not respond.'));
        }
      }, timeoutMs);

      try {
        port = browser.runtime.connectNative(NativeCheckerHostName);
      } catch (cause) {
        clearTimeout(timer);
        reject(this.toError(cause));
        return;
      }

      port.onMessage.addListener(message => {
        if (settled) {
          return;
        }

        const nativeMessage = message as NativeCheckerMessage;
        if (nativeMessage.type === 'pong') {
          settled = true;
          clearTimeout(timer);
          port?.disconnect();
          resolve(nativeMessage);
          return;
        }

        if (nativeMessage.type === 'error') {
          settled = true;
          clearTimeout(timer);
          port?.disconnect();
          reject(new Error(nativeMessage.message));
        }
      });

      port.onDisconnect.addListener(() => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timer);
        reject(new Error(this.runtimeErrorMessage() || 'FireX Native is not installed.'));
      });

      port.postMessage({ type: 'ping' });
    });
  }

  check(
    proxies: ProxyEndpoint[],
    settings: ProxyCheckerSettings,
    onMessage: (message: NativeCheckerMessage) => void
  ): NativeCheckerSession {
    const requestId = crypto.randomUUID();
    const port = browser.runtime.connectNative(NativeCheckerHostName);

    let stopped = false;
    let finished = false;
    const done = new Promise<void>((resolve, reject) => {
      port.onMessage.addListener(message => {
        const nativeMessage = message as NativeCheckerMessage;
        onMessage(nativeMessage);

        if (nativeMessage.type === 'error') {
          finished = true;
          port.disconnect();
          reject(new Error(nativeMessage.message));
          return;
        }

        if (nativeMessage.type === 'check_finished' && nativeMessage.requestId === requestId) {
          finished = true;
          port.disconnect();
          resolve();
        }
      });

      port.onDisconnect.addListener(() => {
        if (finished) {
          resolve();
          return;
        }

        reject(new Error(stopped ? 'Checker stopped.' : this.runtimeErrorMessage() || 'FireX Native disconnected.'));
      });
    });

    port.postMessage({
      type: 'check',
      requestId,
      proxies: proxies.map(proxy => ({
        id: proxy.id,
        protocol: proxy.protocol,
        host: proxy.host,
        port: proxy.port
      })),
      settings: {
        maxWorking: settings.maxWorking,
        maxCandidates: settings.maxCandidates,
        concurrency: settings.concurrency,
        timeoutMs: settings.timeoutMs,
        targets: settings.targets
      }
    });

    return {
      requestId,
      done,
      stop: () => {
        stopped = true;
        port.disconnect();
      }
    };
  }

  private runtimeErrorMessage(): string | undefined {
    const runtime = browser.runtime as typeof browser.runtime & { lastError?: { message?: string } };
    return runtime.lastError?.message;
  }

  private toError(cause: unknown): Error {
    if (cause instanceof Error) {
      return cause;
    }

    return new Error(typeof cause === 'string' ? cause : 'FireX Native is not installed.');
  }
}
