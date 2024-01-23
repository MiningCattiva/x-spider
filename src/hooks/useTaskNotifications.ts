import { useEffect } from 'react';
import { aria2 } from '../utils/aria2';
import { useDownloadStore } from '../stores/download';
import { notification } from '@tauri-apps/api';
import { notification as antNotification } from 'antd';
import { useUpdateEffect } from 'ahooks';
import { useDownloadingItemCounts } from './useDownloadingItemCounts';

export function useTaskNotifications() {
  const inQueueTasksCount = useDownloadingItemCounts();
  useEffect(() => {
    return aria2.onDownloadError.listen((gid) => {
      const task = useDownloadStore
        .getState()
        .downloadTasks.find((task) => task.gid === gid);
      if (!task) return;
      const msg = '任务下载失败';
      const desc = `${task.fileName}\n${task.error}`;
      antNotification.error({
        message: msg,
        description: desc,
      });
      notification.sendNotification({
        title: msg,
        body: desc,
      });
    });
  }, []);
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
