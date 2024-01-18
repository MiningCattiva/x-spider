import { os } from '@tauri-apps/api';
import { CrossPlatformInvoker } from '../interfaces/CrossPlatformInvoker';
import { UnavailableInCurrentOsError } from '../errors/UnavailableInCurrentOsError';

const osType = os.type();

export function createCrossPlatformInvoker<
  T extends (...args: any[]) => Promise<any>,
>(config: CrossPlatformInvoker<T>) {
  return (async (...args: any[]) => {
    switch (await osType) {
      case 'Windows_NT':
        if (config.windows == null) throw new UnavailableInCurrentOsError();
        return config.windows(...args);
      case 'Darwin':
        if (config.macos == null) throw new UnavailableInCurrentOsError();
        return config.macos(...args);
      case 'Linux':
        if (config.linux == null) throw new UnavailableInCurrentOsError();
        return config.linux(...args);
    }
  }) as T;
}
