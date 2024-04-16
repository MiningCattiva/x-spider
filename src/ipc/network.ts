import { invoke } from '@tauri-apps/api';
import { Response } from '../interfaces/Response';
import { RequestOptions } from '../interfaces/RequestOptions';
import * as R from 'ramda';
import { useSettingsStore } from '../stores/settings';
import { delay } from '../utils';

const MAX_RETRY_COUNT = 7;

export async function request(options: RequestOptions) {
  const url = new URL(options.url);

  if (options.query) {
    Object.entries(options.query).forEach(([k, v]) => {
      url.searchParams.append(k, v);
    });
  }

  const settings = useSettingsStore.getState();
  let remainingRetryCount = MAX_RETRY_COUNT;
  let retryDelay = 100;
  let lastErr: any;

  while (remainingRetryCount > 0) {
    try {
      return await requestInternal(
        R.defaultTo('GET', options.method),
        url.href,
        R.defaultTo('', options.body),
        settings.proxy.enable,
        settings.proxy.useSystem ? '' : settings.proxy.url,
        R.defaultTo({}, options.headers),
        options.responseType,
      );
    } catch (err: any) {
      lastErr = err;
      log.warn(
        `Request failed, retry after ${retryDelay}ms, remaining retry count: ${remainingRetryCount}`,
        err,
      );
      await delay(retryDelay);
      remainingRetryCount--;
      retryDelay *= 2;
    }
  }

  log.error('Max retry count reached, last error:', lastErr);
  throw lastErr;
}

async function requestInternal(
  method: string,
  url: string,
  body: string,
  enableProxy: boolean,
  proxyUrl: string,
  headers: Record<string, string>,
  responseType: string,
): Promise<Response> {
  const reqTs = Date.now();
  log.info(`REQ_${reqTs}`, method, url, {
    body,
    enableProxy,
    proxyUrl,
    headers: {
      ...headers,
      Cookie: headers.Cookie ? '******' : undefined,
    },
    responseType,
  });

  const res = await invoke<Response>('network_fetch', {
    method,
    url,
    body,
    enableProxy,
    proxyUrl,
    headers,
    responseType,
  });

  log.info(`RES_${reqTs}`, res.status, url, res);

  return res;
}

export async function getSystemProxy(): Promise<string> {
  const map: Record<string, string> = await invoke(
    'network_get_system_proxy_url',
  );
  const value = map.https || map.http;
  if (value) {
    return `http://${value}`;
  }
  return '';
}
