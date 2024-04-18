import { useEffect } from 'react';
import { useResolvedProxyUrl } from '../useResolvedProxyUrl';
import { aria2 } from '../../utils/aria2';
import { useDownloadStore } from '../../stores/download';

/**
 * Aria 和 Store 双向绑定
 */
export function useAriaBinding() {
  /**
   * 代理地址同步
   */
  const proxyUrl = useResolvedProxyUrl();
  useEffect(() => {
    aria2.updateProxy(proxyUrl);
  }, [proxyUrl]);

  /**
   * 任务状态事件同步
   */
  const { syncDownloadTaskStatus } = useDownloadStore((state) => ({
    syncDownloadTaskStatus: state.syncDownloadTaskStatus,
  }));
  useEffect(() => {
    async function onAria2StatusChanged(gid: string) {
      await syncDownloadTaskStatus(gid);
    }

    aria2.onDownloadComplete.listen(onAria2StatusChanged);
    aria2.onDownloadError.listen(onAria2StatusChanged);
    aria2.onDownloadPause.listen(onAria2StatusChanged);
    aria2.onDownloadStart.listen(onAria2StatusChanged);
    aria2.onDownloadStop.listen(onAria2StatusChanged);
  }, []);
}
