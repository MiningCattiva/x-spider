import { useEffect } from 'react';
import { useResolvedProxyUrl } from '../useResolvedProxyUrl';
import { aria2 } from '../../utils/aria2';

export function useSyncSettingsToAria() {
  const proxyUrl = useResolvedProxyUrl();

  useEffect(() => {
    aria2.updateProxy(proxyUrl);
  }, [proxyUrl]);
}
