import { Child, Command } from '@tauri-apps/api/shell';
import { EventEmitter } from './event';
import { SettingsStore, useSettingsStore } from '../stores/settings';

class Aria2 {
  #ready = false;
  get ready() {
    return this.#ready;
  }
  #secret = crypto.randomUUID()
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
    this.#initialize();
  }

  async #initialize() {
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
  }

  #onSettingsStoreChanged(state: SettingsStore) {
    this.invoke('aria2.changeGlobalOption', {
      'all-proxy': state.proxy.enable ? state.proxy.url : '',
    })
  }

  #onStdout(message: string) {
    if (!this.ready && message.includes('IPv4 RPC: listening on TCP port')) {
      this.#connectWs();
    }
  }

  #onStderr(message: string) {
    console.error(message);
  }

  #onWsMessage(ev: MessageEvent) {
    const data = JSON.parse(ev.data);
    if (data.id) return;

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
      this.#ready = true;
      this.onReady.emit();
    });
    this.#ws.addEventListener('error', (ev) => {
      console.error('Aria websocket error', ev);
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
      this.#ws!.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id: id.toString(),
          method,
          params: method === 'system.multicall' ? args : [`token:${this.#secret}`, ...args],
        }),
      );

      const cb = (ev: MessageEvent) => {
        const data = JSON.parse(ev.data);
        if (data.id !== id.toString()) return;
        this.#ws!.removeEventListener('message', cb);
        if (data.error) {
          reject(data.error.message);
          return;
        }
        resolve(data.result);
      };

      this.#ws?.addEventListener('message', cb);
    });
  }

  async batchInvoke(payload: {methodName: string, params: any[]}[]): Promise<any[]> {
    const token = `token:${this.#secret}`;
    return this.invoke(
      'system.multicall',
      payload.map((item) => ({
        methodName: item.methodName,
        params: [
          token,
          ...item.params,
        ]
      }))
    )
  }
}

export const aria2 = new Aria2();

export type Aria2Status = 'waiting' | 'active' | 'paused' | 'error' | 'complete' | 'removed';
