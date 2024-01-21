/* eslint-disable react/prop-types */
import {
  CaretRightFilled,
  DeleteFilled,
  DownloadOutlined,
  FileFilled,
  FolderFilled,
  PauseOutlined,
} from '@ant-design/icons';
import { Avatar, Progress, message } from 'antd';
import * as R from 'ramda';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { DownloadTask } from '../../interfaces/DownloadTask';
import { useDownloadStore } from '../../stores/download';
import { buildPostUrl, buildUserUrl } from '../../twitter/url';
import { TaskAction, TaskActions } from './TaskActions';
import { showInFolder } from '../../utils/shell';
import { dialog, fs, path, shell } from '@tauri-apps/api';
import { StatusText } from './StatusText';

export interface DownloadListProps {
  filter: (task: DownloadTask) => boolean;
  sort?: (taskA: DownloadTask, taskB: DownloadTask) => number;
  onInScreenTasksChanged?: (tasks: DownloadTask[]) => void;
}
const ITEM_CLIENT_HEIGHT = 144;
const ITEM_GAP = 16;
const ITEM_HEIGHT = ITEM_CLIENT_HEIGHT + ITEM_GAP;

export const DownloadList: React.FC<DownloadListProps> = ({
  filter,
  sort,
  onInScreenTasksChanged,
}) => {
  const {
    downloadTasks,
    createDownloadTask,
    removeDownloadTask,
    pauseDownloadTask,
    unpauseDownloadTask,
  } = useDownloadStore((s) => ({
    downloadTasks: s.downloadTasks,
    createDownloadTask: s.createDownloadTask,
    removeDownloadTask: s.removeDownloadTask,
    pauseDownloadTask: s.pauseDownloadTask,
    unpauseDownloadTask: s.unpauseDownloadTask,
  }));
  const scrollingRef = useRef<HTMLUListElement>(null);

  const tasks = useMemo(() => {
    return R.pipe<[DownloadTask[]], DownloadTask[], DownloadTask[]>(
      R.filter(filter),
      sort ? R.sort(sort) : R.identity,
    )(downloadTasks)
  }, [downloadTasks]);

  const calculateInViewTasks = useCallback(() => {
    const el = scrollingRef.current;
    if (!el) return;
    if (tasks.length === 0) return [];

    const clientHeight = el.clientHeight;
    const scrollTop = el.scrollTop;
    const itemCountInView = Math.ceil(clientHeight / ITEM_HEIGHT);
    const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    const inViewTasks = tasks.slice(startIndex, startIndex + itemCountInView);
    return inViewTasks;
  }, [tasks]);

  useEffect(() => {
    return () => {
      onInScreenTasksChanged?.([]);
    }
  }, [onInScreenTasksChanged])

  useEffect(() => {
    if (!onInScreenTasksChanged) return;

    const inViewTasks = calculateInViewTasks();
    if (!inViewTasks) return;
    onInScreenTasksChanged(inViewTasks);
  }, [tasks, onInScreenTasksChanged, calculateInViewTasks]);

  useEffect(() => {
    const el = scrollingRef.current;
    if (!el) return;
    if (!onInScreenTasksChanged) return;

    const onScroll = () => {
      const tasks = calculateInViewTasks();
      if (!tasks) return;
      onInScreenTasksChanged(tasks);
    };

    el.addEventListener('scroll', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, [onInScreenTasksChanged, calculateInViewTasks]);

  return (
    <div className="flex flex-col grow h-full overflow-hidden pb-4">
      <section>
        <span>共 {tasks.length} 个下载任务。</span>
      </section>
      <div className="grow pr-4 overflow-hidden relative h-full mt-4">
        <ul className="overflow-y-auto h-full" ref={scrollingRef}>
          {tasks.map((t) => {
            const actionRedownload: TaskAction = {
              name: '重新下载',
              onClick: async () => {
                try {
                  await createDownloadTask(
                    t.post,
                    t.user,
                    t.media,
                    t.fileName,
                    t.dir,
                  );
                  await removeDownloadTask(t.gid);
                  message.success('已开始重新下载该任务');
                } catch (err) {
                  console.error(err);
                  dialog.confirm('无法重新下载文件', {
                    type: 'error',
                  });
                }
              },
              icon: <DownloadOutlined />,
              primary: false,
            };

            const actionPause: TaskAction = {
              name: '暂停',
              onClick: async () => {
                await pauseDownloadTask(t.gid);
              },
              icon: <PauseOutlined />,
              primary: true,
            };

            const actionUnpause: TaskAction = {
              name: '继续',
              onClick: async () => {
                await unpauseDownloadTask(t.gid);
              },
              icon: <CaretRightFilled />,
              primary: true,
            };

            const actionDelete: TaskAction = {
              name: '删除',
              onClick: async () => {
                if (
                  await dialog.confirm('确认删除该任务？', {
                    okLabel: '删除',
                    cancelLabel: '取消',
                    type: 'warning',
                    title: '删除任务',
                  })
                ) {
                  await removeDownloadTask(t.gid);
                }
              },
              icon: <DeleteFilled />,
              danger: true,
            };

            const actionOpen: TaskAction = {
              name: '打开',
              onClick: async () => {
                const filePath = await path.join(t.dir, t.fileName);
                if (!(await fs.exists(filePath))) {
                  dialog.message('文件不存在', {
                    type: 'error',
                    title: '错误',
                  });
                  return;
                }
                await shell.open(filePath);
              },
              icon: <FileFilled />,
              primary: true,
            };

            const actionOpenDir: TaskAction = {
              name: '打开目录',
              onClick: async () => {
                const filePath = await path.join(t.dir, t.fileName);
                if (!(await fs.exists(filePath))) {
                  dialog.message('文件不存在', {
                    type: 'error',
                    title: '错误',
                  });
                  return;
                }
                await showInFolder(filePath, true);
              },
              icon: <FolderFilled />,
            };

            return (
              <li
                key={t.gid}
                style={{
                  height: ITEM_CLIENT_HEIGHT,
                  marginBottom: ITEM_GAP,
                }}
                className="bg-white border-[1px] border-gray-300 rounded-md flex overflow-hidden"
              >
                <a
                  href={buildPostUrl(t.user.screenName, t.post.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 w-36  overflow-hidden"
                  title="打开推文页"
                >
                  <img
                    src={`${t.media.url}?format=jpg&name=thumb`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform transform hover:scale-105"
                  />
                </a>
                <div className="ml-4 overflow-y-auto pr-4 w-full h-full">
                  <p
                    title={t.fileName}
                    className="text-ellipsis overflow-hidden whitespace-nowrap font-bold mt-2"
                  >
                    {t.fileName}
                  </p>
                  <a
                    href={buildUserUrl(t.user.screenName)}
                    title={`跳转到 ${t.user.name} 的主页`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs flex items-center space-x-1 w-fit text-ant-color-text-secondary bg-gray-100 p-1 rounded-full pr-2 overflow-hidden"
                  >
                    <Avatar src={t.user.avatar} size={20} />
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap shrink">
                      <span>{t.user.name}</span>
                      <span>@{t.user.screenName}</span>
                    </span>
                  </a>
                  <div className="mt-2">
                    <TaskActions
                      actions={R.cond([
                        [
                          R.equals('active'),
                          R.always([actionPause, actionDelete]),
                        ],
                        [
                          R.equals('paused'),
                          R.always([actionUnpause, actionDelete]),
                        ],
                        [
                          R.equals('error'),
                          R.always([actionRedownload, actionDelete]),
                        ],
                        [
                          R.equals('complete'),
                          R.always([
                            actionOpen,
                            actionOpenDir,
                            actionRedownload,
                            actionDelete,
                          ]),
                        ],
                        [R.T, R.always([])],
                      ])(t.status)}
                    />
                  </div>
                  <div className="mt-0">
                    <Progress
                      percent={(t.completeSize / t.totalSize) * 100}
                      className="mb-0 mr-0"
                    />
                  </div>
                  <div>
                    <StatusText task={t} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
