import { Child, Command } from '@tauri-apps/api/shell';
import { EventEmitter } from './event';
import { useSettingsStore } from '../stores/settings';
import { getSystemProxy } from '../ipc/network';
import { systemProxyChangedEvent } from '../events/system-proxy';

class Aria2 {
  #ready = false;
  get ready() {
    return this.#ready;
  }
  #secret = crypto.randomUUID();
  #port = 6801;
  #ws?: WebSocket;
  #command?: Command;
  #child?: Child;
  #invokeId = 0;

  onReady = new EventEmitter();
  onDownloadStart = new EventEmitter<string>();
  onDownloadPause = new EventEmitter<string>();
  onDownloadStop = new EventEmitter<string>();
  onDownloadComplete = new EventEmitter<string>();
  onDownloadError = new EventEmitter<string>();

  constructor() {
    setTimeout(() => this.#initialize(), 0);
  }

  async #initialize() {
    log.info('Aria2c starting');
    this.#command = Command.sidecar('binaries/aria2c', [
      '--enable-rpc',
      '--rpc-secret',
      this.#secret,
      '--rpc-listen-port',
      this.#port.toString(),
    ]);

    this.#child = await this.#command.spawn();
    this.#command.stdout.on('data', this.#onStdout.bind(this));
    this.#command.stderr.on('data', this.#onStderr.bind(this));

    window.addEventListener('beforeunload', this.#kill.bind(this), {
      once: true,
    });

    useSettingsStore.subscribe(this.#onSettingsStoreChanged.bind(this));
    systemProxyChangedEvent.listen(this.#onSystemProxyChanged.bind(this));
  }

  async #updateProxy() {
    const resolved = await this.#resolveProxyValue();
    log.info('Aria2c proxy value', resolved);
    await this.invoke('aria2.changeGlobalOption', {
      'all-proxy': resolved,
    });
  }

  async #resolveProxyValue() {
    const settings = useSettingsStore.getState();
    if (!settings.proxy.enable) return '';
    if (settings.proxy.useSystem) {
      return await getSystemProxy();
    }
    return settings.proxy.url;
  }

  #onSettingsStoreChanged() {
    this.#updateProxy();
  }

  #onSystemProxyChanged() {
    this.#updateProxy();
  }

  #onStdout(message: string) {
    if (!this.ready && message.includes('IPv4 RPC: listening on TCP port')) {
      log.info('Aria2c start success');
      this.#connectWs();
    }
  }

  #onStderr(message: string) {
    log.error(`Aria2c start fail: ${message}`);
  }

  #onWsMessage(ev: MessageEvent) {
    const data = JSON.parse(ev.data);
    if (data.id) return;
    log.info('Aria2c received event:', data);

    const gid = () => data.params[0].gid;

    switch (data.method) {
      case 'aria2.onDownloadStart':
        this.onDownloadStart.emit(gid());
        break;
      case 'aria2.onDownloadPause':
        this.onDownloadPause.emit(gid());
        break;
      case 'aria2.onDownloadStop':
        this.onDownloadStop.emit(gid());
        break;
      case 'aria2.onDownloadComplete':
        this.onDownloadComplete.emit(gid());
        break;
      case 'aria2.onDownloadError':
        this.onDownloadError.emit(gid());
        break;
      default:
        break;
    }
  }

  #connectWs() {
    this.#ws = new WebSocket(`ws://127.0.0.1:${this.#port}/jsonrpc`);
    this.#ws.addEventListener('open', () => {
      log.info('Aria2c ws connected');
      this.#ready = true;
      this.onReady.emit();
    });
    this.#ws.addEventListener('error', (ev) => {
      log.error('Aria2c websocket error', ev);
    });
    this.#ws.addEventListener('message', this.#onWsMessage.bind(this));
  }

  #kill() {
    if (this.#ws) {
      this.#ws.close();
    }
    if (this.#child) {
      this.#child.kill();
    }
  }
  async waitForReady() {
    if (this.#ready) return;

    return new Promise<undefined>((resolve) => {
      const unlisten = this.onReady.listen(() => {
        resolve(undefined);
        unlisten();
      });
    });
  }

  async invoke(method: string, ...args: any[]): Promise<any> {
    await this.waitForReady();
    return new Promise((resolve, reject) => {
      const id = this.#invokeId++;
      const payload = {
        jsonrpc: '2.0',
        id: id.toString(),
        method,
        params:
          method === 'system.multicall'
            ? args
            : [`token:${this.#secret}`, ...args],
      };
      log.info(`Aria2c REQ id=${id}`, payload);
      this.#ws!.send(JSON.stringify(payload));

      const cb = (ev: MessageEvent) => {
        const data = JSON.parse(ev.data);
        if (data.id !== id.toString()) return;
        this.#ws!.removeEventListener('message', cb);
        log.info(`Aria2c RES id=${id}`, data);
        if (data.error) {
          const err = new Error(
            `Aria2 调用 ${method} 失败：${data.error.message}`,
          );
          log.error({ err, method, args });
          reject(err);
          return;
        }

        resolve(data.result);
      };

      this.#ws?.addEventListener('message', cb);
    });
  }

  async batchInvoke(
    payload: { methodName: string; params: any[] }[],
  ): Promise<any[]> {
    const token = `token:${this.#secret}`;
    return this.invoke(
      'system.multicall',
      payload.map((item) => ({
        methodName: item.methodName,
        params: [token, ...item.params],
      })),
    );
  }
}

export const aria2 = new Aria2();

export type Aria2Status =
  | 'waiting'
  | 'active'
  | 'paused'
  | 'error'
  | 'complete'
  | 'removed';
