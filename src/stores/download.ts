import { path } from '@tauri-apps/api';
import { message } from 'antd';
import { nanoid } from 'nanoid';
import * as R from 'ramda';
import { create } from 'zustand';
import { CreationTask } from '../interfaces/CreationTask';
import { DownloadFilter } from '../interfaces/DownloadFilter';
import { DownloadTask } from '../interfaces/DownloadTask';
import { TwitterMedia } from '../interfaces/TwitterMedia';
import { TwitterPost } from '../interfaces/TwitterPost';
import { TwitterUser } from '../interfaces/TwitterUser';
import { aria2 } from '../utils/aria2';

async function mergeAriaStatusToDownloadTask(
  ariaStatus: any,
  oldTask: DownloadTask,
): Promise<DownloadTask> {
  return {
    ...oldTask,
    gid: ariaStatus.gid,
    status: ariaStatus.status,
    completeSize: Number(ariaStatus.completedLength),
    totalSize: Number(ariaStatus.totalLength),
    fileName: await path.basename(ariaStatus.files[0].path),
    error: ariaStatus.errorMessage,
    dir: ariaStatus.dir,
    updatedAt: Date.now(),
  };
}

const creationTaskAbortControllerMap = new Map<string, AbortController>();

export interface CreateDownloadTaskParams {
  post: TwitterPost;
  user: TwitterUser;
  media: TwitterMedia;
  fileName: string;
  dir: string;
  downloadUrl: string;
}

export interface DownloadStore {
  currentTab: string;
  setCurrentTab: (tab: string) => void;

  downloadTasks: DownloadTask[];
  autoSyncTaskIds: string[];
  setAutoSyncTaskIds: (ids: string[]) => void;
  createDownloadTask: (params: CreateDownloadTaskParams) => Promise<void>;
  batchCreateDownloadTask: (
    paramsList: CreateDownloadTaskParams[],
  ) => Promise<void>;
  pauseDownloadTask: (gid: string) => Promise<void>;
  pauseAllDownloadTask: () => Promise<void>;
  unpauseDownloadTask: (gid: string) => Promise<void>;
  unpauseAllDownloadTask: () => Promise<void>;
  removeDownloadTask: (gid: string) => Promise<void>;
  batchRemoveDownloadTasks: (gids: string[]) => Promise<void>;
  syncDownloadTaskStatus: (gid: string) => Promise<void>;
  redownloadTask: (gid: string) => Promise<void>;
  batchRedownloadTask: (gid: string[]) => Promise<void>;

  creationTasks: CreationTask[];
  createCreationTask: (userId: string, filter: DownloadFilter) => void;
  removeCreationTask: (id: string) => void;
  updateCreationTask: (task: CreationTask) => void;
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  currentTab: '',
  setCurrentTab: (tab) => set({ currentTab: tab }),

  autoSyncTaskIds: [],
  setAutoSyncTaskIds: (ids) => set({ autoSyncTaskIds: ids }),

  downloadTasks: [],
  createDownloadTask: async ({
    post,
    user,
    media,
    fileName,
    dir,
    downloadUrl,
  }) => {
    const gid = await aria2.invoke('aria2.addUri', [downloadUrl], {
      dir: dir,
      out: fileName,
    });
    const status = await aria2.invoke('aria2.tellStatus', gid);
    const task: DownloadTask = {
      gid: status.gid,
      status: status.status,
      completeSize: Number(status.completedLength),
      totalSize: Number(status.totalLength),
      fileName: await path.basename(status.files[0].path),
      media,
      post,
      error: status.errorMessage,
      dir,
      user,
      updatedAt: Date.now(),
      downloadUrl,
    };
    set({
      downloadTasks: get().downloadTasks.concat(task),
    });
  },
  batchCreateDownloadTask: async (paramsList) => {
    const gids = (
      await aria2.batchInvoke(
        paramsList.map((p) => ({
          methodName: 'aria2.addUri',
          params: [[p.media.url]],
        })),
      )
    ).flat();
    const statusList = await aria2.batchInvoke(
      gids.map((gid) => ({
        methodName: 'aria2.tellStatus',
        params: [gid],
      })),
    );

    const tasks: DownloadTask[] = await Promise.all(
      statusList.map<Promise<DownloadTask>>(async (status, index) => ({
        gid: status.gid,
        status: status.status,
        completeSize: Number(status.completedLength),
        totalSize: Number(status.totalLength),
        fileName: await path.basename(status.files[0].path),
        media: paramsList[index].media,
        post: paramsList[index].post,
        error: status.errorMessage,
        dir: status.dir,
        user: paramsList[index].user,
        updatedAt: Date.now(),
        downloadUrl: paramsList[index].downloadUrl,
      })),
    );

    set({
      downloadTasks: get().downloadTasks.concat(...tasks),
    });
  },
  pauseDownloadTask: async (gid) => {
    await aria2.invoke('aria2.pause', gid);
  },
  pauseAllDownloadTask: async () => {
    await aria2.invoke('aria2.pauseAll');
  },
  unpauseDownloadTask: async (gid) => {
    await aria2.invoke('aria2.unpause', gid);
  },
  unpauseAllDownloadTask: async () => {
    await aria2.invoke('aria2.unpauseAll');
  },
  removeDownloadTask: async (gid) => {
    aria2.invoke('aria2.remove', gid).catch((err) => {
      console.error(err);
    });
    set({
      downloadTasks: R.filter((v: DownloadTask) => v.gid !== gid)(
        get().downloadTasks,
      ),
    });
  },
  batchRemoveDownloadTasks: async (gids) => {
    aria2
      .batchInvoke(
        gids.map((gid) => ({
          methodName: 'aria2.remove',
          params: [gid],
        })),
      )
      .catch((err) => {
        console.error(err);
      });
    set({
      downloadTasks: R.filter((v: DownloadTask) => !gids.includes(v.gid))(
        get().downloadTasks,
      ),
    });
  },
  redownloadTask: async (gid) => {
    const store = get();
    const oldTask = store.downloadTasks.find((t) => t.gid === gid);
    if (!oldTask) {
      throw new Error(`Cannot find task ${gid}`);
    }
    await store.removeDownloadTask(oldTask.gid);
    await store.createDownloadTask({
      post: oldTask.post,
      user: oldTask.user,
      media: oldTask.media,
      fileName: oldTask.fileName,
      dir: oldTask.dir,
      downloadUrl: oldTask.downloadUrl,
    });
  },
  batchRedownloadTask: async (gids) => {
    const store = get();
    const oldTasks = store.downloadTasks.filter((t) => gids.includes(t.gid));
    if (oldTasks.length === 0) {
      throw new Error('No task gid matched');
    }

    await store.batchRemoveDownloadTasks(gids);
    await store.batchCreateDownloadTask(
      oldTasks.map((task) => ({
        dir: task.dir,
        downloadUrl: task.downloadUrl,
        fileName: task.fileName,
        media: task.media,
        post: task.post,
        user: task.user,
      })),
    );
  },
  syncDownloadTaskStatus: async (gid) => {
    const tasks = get().downloadTasks;
    const index = tasks.findIndex((v) => v.gid === gid);
    if (index === -1) {
      return;
    }
    const status = await aria2.invoke('aria2.tellStatus', gid);
    const newTask = await mergeAriaStatusToDownloadTask(status, tasks[index]);
    const newTasks = R.adjust(index, R.always(newTask))(tasks);
    set({
      downloadTasks: newTasks,
    });
  },

  creationTasks: [],
  createCreationTask: (userId, filter) => {
    const id = nanoid();
    const abortController = new AbortController();
    creationTaskAbortControllerMap.set(id, abortController);
    set({
      creationTasks: [
        ...get().creationTasks,
        {
          id,
          userId,
          filter,
          status: 'waiting',
        },
      ],
    });
  },
  removeCreationTask: (id) => {
    const abortController = creationTaskAbortControllerMap.get(id);
    if (!abortController) {
      return;
    }
    abortController.abort();
    creationTaskAbortControllerMap.delete(id);
    set({
      creationTasks: get().creationTasks.filter((v) => v.id === id),
    });
  },
  updateCreationTask: (task) => {
    set({
      // @ts-ignore
      creationTasks: R.map(
        R.ifElse(R.propEq(task.id, 'id'), R.always(task), R.identity),
      ),
    });
  },
}));

// Watch for aria2c notifications
async function onAria2StatusChanged(gid: string) {
  await useDownloadStore.getState().syncDownloadTaskStatus(gid);
}

aria2.onDownloadComplete.listen(onAria2StatusChanged);
aria2.onDownloadError.listen(onAria2StatusChanged);
aria2.onDownloadPause.listen(onAria2StatusChanged);
aria2.onDownloadStart.listen(onAria2StatusChanged);
aria2.onDownloadStop.listen(onAria2StatusChanged);

async function runCreationTask(task: CreationTask, abortSignal: AbortSignal) {
  const { createDownloadTask } = useDownloadStore.getState();
}

// Schedules creation tasks
async function scheduleCreationTasks() {
  const { creationTasks, removeCreationTask, updateCreationTask } =
    useDownloadStore.getState();

  if (R.isEmpty(creationTasks)) {
    requestIdleCallback(scheduleCreationTasks);
    return;
  }

  // Check if there was a creation task running
  // @ts-ignore
  if (R.includes({ status: 'active' }, creationTasks)) {
    requestIdleCallback(scheduleCreationTasks);
    return;
  }

  // Pick one waiting task from head
  const task = R.head(creationTasks) as CreationTask;
  const abortController = creationTaskAbortControllerMap.get(
    task.id,
  ) as AbortController;

  if (abortController.signal.aborted) {
    removeCreationTask(task.id);
    requestIdleCallback(scheduleCreationTasks);
    return;
  }

  task.status = 'active';
  updateCreationTask(task);

  try {
    await runCreationTask(task, abortController.signal);
  } catch (err: any) {
    console.error(err);
    message.error('创建任务失败');
  }
  removeCreationTask(task.id);
  requestIdleCallback(scheduleCreationTasks);
}

scheduleCreationTasks();

const INTERVAL = 500;
// Auto sync tasks
async function scheduleAutoSyncTasks() {
  const ids = useDownloadStore.getState().autoSyncTaskIds;
  if (ids.length === 0) {
    setTimeout(scheduleAutoSyncTasks, INTERVAL);
    return;
  }

  const startTime = Date.now();

  const results = await aria2.batchInvoke(
    ids.map((id) => ({
      methodName: 'aria2.tellStatus',
      params: [id],
    })),
  );

  const resultMap = R.pipe(
    R.flatten,
    R.map<any, [string, any]>((r: any) => [r.gid, r]),
    R.fromPairs,
  )(results);
  const { downloadTasks } = useDownloadStore.getState();
  const newTasks = await Promise.all(
    downloadTasks.map<Promise<DownloadTask>>(async (oldTask) => {
      // Do not update status after someone updated it during query
      if (oldTask.updatedAt > startTime) return oldTask;
      return mergeAriaStatusToDownloadTask(resultMap[oldTask.gid], oldTask);
    }),
  );

  useDownloadStore.setState({
    downloadTasks: newTasks,
  });

  setTimeout(scheduleAutoSyncTasks, INTERVAL);
}

scheduleAutoSyncTasks();
