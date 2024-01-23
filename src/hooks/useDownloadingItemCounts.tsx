import { useDownloadStore } from '../stores/download';

export function useDownloadingItemCounts() {
  return useDownloadStore(
    (s) =>
      s.downloadTasks.filter((t) =>
        ['active', 'waiting', 'paused'].includes(t.status),
      ).length + s.creationTasks.length,
  );
}
