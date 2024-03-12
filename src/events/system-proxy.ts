import { getSystemProxy } from '../ipc/network';
import { EventEmitter } from '../utils/event';

let value = '';
export const systemProxyChangedEvent = new EventEmitter<string>();

async function poll() {
  const newValue = await getSystemProxy();
  if (value !== newValue) {
    value = newValue;
    systemProxyChangedEvent.emit(newValue);
  }
  setTimeout(poll, 1000);
}

poll();
