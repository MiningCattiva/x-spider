import { useUnmountedRef } from 'ahooks';
import { useEffect } from 'react';
import { getSystemProxy } from '../../ipc/network';
import { useAppStateStore } from '../../stores/app-state';

export function usePollSystemProxyUrl() {
  const { url, setUrl } = useAppStateStore((state) => ({
    url: state.systemProxyUrl,
    setUrl: state.setSystemProxyUrl,
  }));
  const unmountedRef = useUnmountedRef();

  useEffect(() => {
    let timeoutId: number;

    const poll = async () => {
      try {
        const newUrl = await getSystemProxy();
        if (!unmountedRef.current && newUrl !== url) {
          setUrl(newUrl);
        }
      } catch (err: any) {
        log.error('Get system proxy failed', err);
      }

      timeoutId = setTimeout(poll, 1000);
    };

    poll();
    return () => {
      clearTimeout(timeoutId);
    };
  }, [url, setUrl]);
}
