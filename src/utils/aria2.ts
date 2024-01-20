import { Child, Command } from '@tauri-apps/api/shell';
import { EventEmitter } from './event';

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

  constructor() {
    this.#initiate();
  }

  async #initiate() {
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
  }

  #onStdout(message: string) {
    if (!this.ready && message.includes('IPv4 RPC: listening on TCP port')) {
      this.#connectWs();
    }
  }

  #onStderr(message: string) {
    console.error(message);
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
    return new Promise((resolve) => {
      const id = this.#invokeId++;
      this.#ws!.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id: id.toString(),
          method,
          params: [`token:${this.#secret}`, ...args],
        }),
      );

      const cb = (ev: MessageEvent) => {
        const data = JSON.parse(ev.data);
        if (data.id !== id.toString()) return;
        this.#ws!.removeEventListener('message', cb);
        resolve(data.result);
      };

      this.#ws?.addEventListener('message', cb);
    });
  }
}

export const aria2 = new Aria2();
