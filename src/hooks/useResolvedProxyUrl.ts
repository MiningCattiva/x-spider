import { useAppStateStore } from '../stores/app-state';
import { useSettingsStore } from '../stores/settings';

export function useResolvedProxyUrl() {
  const systemProxyUrl = useAppStateStore((state) => state.systemProxyUrl);
  const proxyConfig = useSettingsStore((state) => state.proxy);

  if (!proxyConfig.enable) return '';
  if (proxyConfig.useSystem) return systemProxyUrl;
  return proxyConfig.url;
}
