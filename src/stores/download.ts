import { fs, path } from '@tauri-apps/api';
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
import { getTwitterPosts } from '../twitter/api';
import { useSettingsStore } from './settings';
import { getDownloadUrl } from '../twitter/utils';
import { resolveVariables } from '../utils/file-name-template';
import { FileNameTemplateData } from '../interfaces/FileNameTemplateData';

export interface CreateDownloadTaskParams {
  post: TwitterPost;
  media: TwitterMedia;
}

async function mergeAriaStatusToDownloadTask(
  ariaStatus: any,
  oldTask: DownloadTask,
  now = Date.now(),
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
    updatedAt: now,
  };
}

async function prepareDownloadTask({
  post,
  media,
}: CreateDownloadTaskParams): Promise<DownloadTask> {
  const settings = useSettingsStore.getState();
  const downloadUrl = getDownloadUrl(media);
  const templateData: FileNameTemplateData = {
    media,
    post,
  };
  let dir: string;

  try {
    dir = await path.join(
      settings.download.saveDirBase,
      resolveVariables(settings.download.dirTemplate, templateData),
    );
  } catch (err: any) {
    console.error({ err });
    throw new Error('保存路径解析失败');
  }

  const fileName = resolveVariables(
    settings.download.fileNameTemplate,
    templateData,
  );

  const task: DownloadTask = {
    gid: '',
    status: 'waiting',
    completeSize: 0,
    totalSize: Infinity,
    fileName,
    media,
    post,
    error: '',
    dir,
    updatedAt: Date.now(),
    downloadUrl,
  };

  return task;
}

const creationTaskAbortControllerMap = new Map<string, AbortController>();

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
  updateDownloadTask: (task: DownloadTask, now?: number) => void;
  batchUpdateDownloadTasks: (tasks: DownloadTask[]) => void;
  redownloadTask: (gid: string) => Promise<void>;
  batchRedownloadTask: (gid: string[]) => Promise<void>;

  creationTasks: CreationTask[];
  createCreationTask: (user: TwitterUser, filter: DownloadFilter) => void;
  removeCreationTask: (id: string) => void;
  updateCreationTask: (task: CreationTask) => void;
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  currentTab: '',
  setCurrentTab: (tab) => set({ currentTab: tab }),

  autoSyncTaskIds: [],
  setAutoSyncTaskIds: (ids) => set({ autoSyncTaskIds: ids }),

  downloadTasks: [],
  createDownloadTask: async (params) => {
    let task: DownloadTask;
    try {
      task = await prepareDownloadTask(params);
    } catch (err: any) {
      console.error({ params, err });
      throw new Error(`准备下载任务失败：${params.media.url}`);
    }

    try {
      const gid = await aria2.invoke('aria2.addUri', [task.downloadUrl], {
        dir: task.dir,
        out: task.fileName,
      });
      task.gid = gid;
    } catch (err: any) {
      console.error({ params, err });
      throw new Error(`Aria2 创建任务失败：${err.message}`);
    }

    try {
      const status = await aria2.invoke('aria2.tellStatus', task.gid);
      task.status = status.status;
    } catch (err: any) {
      console.error({ params, err });
      throw new Error(`Aria2 获取任务状态失败：${task.gid}`);
      return;
    }

    set({
      downloadTasks: get().downloadTasks.concat(task),
    });
  },
  updateDownloadTask: (task, now = Date.now()) => {
    const oldTasks = get().downloadTasks;
    const oldTaskIndex = get().downloadTasks.findIndex(
      (t) => t.gid === task.gid,
    );
    if (oldTaskIndex === -1) return;
    const oldTask = oldTasks[oldTaskIndex];
    if (oldTask.updatedAt > now) return;
    const newTasks = R.adjust(oldTaskIndex, R.always(task))(oldTasks);
    set({
      downloadTasks: newTasks,
    });
  },
  batchUpdateDownloadTasks: (tasks) => {
    const { downloadTasks: oldTasks } = get();
    const newTaskMap = R.pipe<
      [DownloadTask[]],
      [DownloadTask['gid'], DownloadTask][],
      Record<string, DownloadTask>
    >(
      R.map((t: DownloadTask) => [t.gid, t]),
      R.fromPairs,
    )(tasks);

    const newTasks = oldTasks.map((oldTask) => {
      const newTask = newTaskMap[oldTask.gid];
      if (!newTask) return oldTask;
      if (newTask.updatedAt < oldTask.updatedAt) {
        return oldTask;
      }
      return newTask;
    });

    set({
      downloadTasks: newTasks,
    });
  },
  batchCreateDownloadTask: async (paramsList) => {
    const tasks: DownloadTask[] = [];

    for (const params of paramsList) {
      const task = await prepareDownloadTask(params);
      tasks.push(task);
    }

    if (tasks.length === 0) {
      return;
    }

    const gids: string[] = (
      await aria2.batchInvoke(
        tasks.map((task) => ({
          methodName: 'aria2.addUri',
          params: [
            [task.downloadUrl],
            {
              dir: task.dir,
              out: task.fileName,
            },
          ],
        })),
      )
    ).flat();

    const statusList: any[] = await aria2.batchInvoke(
      gids.map((gid) => ({
        methodName: 'aria2.tellStatus',
        params: [gid],
      })),
    );

    tasks.forEach((task, index) => {
      task.gid = gids[index];
      task.status = statusList[index].status;
    });

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
      console.error({ gid, err });
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
        console.error({ gids, err });
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
      throw new Error('找不到旧的下载任务');
    }
    await store.removeDownloadTask(oldTask.gid);
    await store.createDownloadTask({
      post: oldTask.post,
      media: oldTask.media,
    });
  },
  batchRedownloadTask: async (gids) => {
    const store = get();
    const oldTasks = store.downloadTasks.filter((t) => gids.includes(t.gid));
    if (oldTasks.length === 0) {
      throw new Error('找不到旧的下载任务');
    }

    await store.batchRemoveDownloadTasks(gids);
    await store.batchCreateDownloadTask(
      oldTasks.map((task) => ({
        media: task.media,
        post: task.post,
      })),
    );
  },
  syncDownloadTaskStatus: async (gid) => {
    const { downloadTasks, updateDownloadTask } = get();
    const index = downloadTasks.findIndex((v) => v.gid === gid);
    if (index === -1) {
      return;
    }
    const now = Date.now();
    const status = await aria2.invoke('aria2.tellStatus', gid);
    const newTask = await mergeAriaStatusToDownloadTask(
      status,
      downloadTasks[index],
    );
    updateDownloadTask(newTask, now);
  },

  creationTasks: [],
  createCreationTask: (user, filter) => {
    const id = nanoid();
    const abortController = new AbortController();
    creationTaskAbortControllerMap.set(id, abortController);
    set({
      creationTasks: [
        ...get().creationTasks,
        {
          id,
          user,
          filter,
          status: 'waiting',
          completeCount: 0,
          skipCount: 0,
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
      creationTasks: get().creationTasks.filter((v) => v.id !== id),
    });
  },
  updateCreationTask: (task) => {
    set({
      creationTasks: get().creationTasks.map((oldTask) => {
        if (oldTask.id === task.id) return task;
        return oldTask;
      }),
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
  const { filter, user } = task;

  if (!user.id) {
    throw new Error('用户 ID 未定义');
  }

  const { batchCreateDownloadTask, updateCreationTask } =
    useDownloadStore.getState();
  const settings = useSettingsStore.getState();
  const filterPosts = R.filter<TwitterPost>(
    R.allPass([
      // Filter dateRange
      (post) => {
        if (!filter.dateRange) return true;
        if (!post?.createdAt) return false;
        return (
          filter.dateRange[0] <= post.createdAt &&
          filter.dateRange[1] >= post.createdAt
        );
      },
    ]),
  );

  const filterMedias = R.filter<TwitterMedia>(
    R.allPass([
      (media) => {
        if (!filter.mediaTypes) return false;
        return filter.mediaTypes.includes(media.type);
      },
    ]),
  );

  let cursor: string | undefined;
  let completeCount = 0;
  let skipCount = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { twitterPosts, cursor: nextCursor } = await getTwitterPosts(
      user.id,
      cursor,
    );
    cursor = nextCursor || undefined;
    if (abortSignal.aborted) {
      return;
    }

    const posts = filterPosts(twitterPosts);

    if (posts.length === 0) {
      return;
    }

    const paramsList: CreateDownloadTaskParams[] = [];

    for (const post of twitterPosts) {
      if (!post.medias || post.medias.length === 0) continue;

      for (const media of filterMedias(post.medias)) {
        const task = await prepareDownloadTask({ post, media });
        const filePath = await path.join(task.dir, task.fileName);
        if (settings.download.sameFileSkip && (await fs.exists(filePath))) {
          skipCount++;
          continue;
        }
        paramsList.push({
          media,
          post,
        });
      }
    }

    if (paramsList.length === 0) continue;

    await batchCreateDownloadTask(paramsList);
    completeCount += paramsList.length;
    updateCreationTask({
      ...task,
      completeCount,
      skipCount,
    });

    if (abortSignal.aborted) return;

    if (!cursor) return;
  }
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
  if (creationTasks.find((task) => task.status === 'active')) {
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
    throw new Error('创建任务失败');
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

  const now = Date.now();

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
  const { downloadTasks, batchUpdateDownloadTasks } =
    useDownloadStore.getState();
  const newTasks = await Promise.all(
    downloadTasks.map<Promise<DownloadTask>>(async (oldTask) => {
      // Do not update status after someone updated it during query
      if (oldTask.updatedAt > now) return oldTask;
      if (!resultMap[oldTask.gid]) return oldTask;
      return mergeAriaStatusToDownloadTask(
        resultMap[oldTask.gid],
        oldTask,
        now,
      );
    }),
  );

  batchUpdateDownloadTasks(newTasks);

  setTimeout(scheduleAutoSyncTasks, INTERVAL);
}

scheduleAutoSyncTasks();
