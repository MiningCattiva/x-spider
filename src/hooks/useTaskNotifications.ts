import { notification } from '@tauri-apps/api';
import { useUpdateEffect } from 'ahooks';
import { notification as antNotification } from 'antd';
import { useDownloadingItemCounts } from './useDownloadingItemCounts';

export function useTaskNotifications() {
  const inQueueTasksCount = useDownloadingItemCounts();
  useUpdateEffect(() => {
    if (inQueueTasksCount === 0) {
      const msg = '任务下载完成';
      antNotification.success({
        message: msg,
      });
      notification.sendNotification({
        title: msg,
      });
    }
  }, [inQueueTasksCount]);
}
