/* eslint-disable react/prop-types */
import React from 'react';
import { useDownloadStore } from '../../stores/download';
import { Avatar, Button } from 'antd';
import { buildUserUrl } from '../../twitter/url';

export const CreationTasks: React.FC = () => {
  const { creationTasks, removeCreationTask } = useDownloadStore((s) => ({
    creationTasks: s.creationTasks,
    removeCreationTask: s.removeCreationTask,
  }));

  if (creationTasks.length === 0) return null;

  return (
    <section className="bg-white p-4 rounded-md border-[1px] mb-3">
      <h2 className="text-sm">{`共 ${creationTasks.length} 个任务创建中`}</h2>
      <ul className="mt-2 text-sm space-y-4 max-h-40 overflow-y-auto">
        {creationTasks.map((t) => (
          <li className="flex items-center justify-between" key={t.id}>
            <a
              href={buildUserUrl(t.user.screenName)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 overflow-hidden pr-4"
            >
              <Avatar size={20} src={t.user.avatar} className="shrink-0" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                {`${t.user.name} @${t.user.screenName}`}
              </span>
            </a>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="space-x-2">
                <span>已发送：{t.completeCount}</span>
                {t.skipCount > 0 && <span>已跳过：{t.skipCount}</span>}
              </span>
              <Button
                onClick={async () => {
                  removeCreationTask(t.id);
                }}
                size="small"
                danger
              >
                取消
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
