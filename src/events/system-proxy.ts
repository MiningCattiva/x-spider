import { getSystemProxy } from '../ipc/network';
import { EventEmitter } from '../utils/event';

let value = '';
export const systemProxyChangedEvent = new EventEmitter<string>();

async function poll() {
  const newValue = await getSystemProxy();
  if (value !== newValue) {
    value = newValue;
    log.info('System proxy changed', newValue);
    systemProxyChangedEvent.emit(newValue);
  }
  setTimeout(poll, 1000);
}

poll();
