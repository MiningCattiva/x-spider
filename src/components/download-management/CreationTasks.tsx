/* eslint-disable react/prop-types */
import React from 'react';
import { useDownloadStore } from '../../stores/download';
import { Avatar, Button, Tooltip } from 'antd';
import { buildUserUrl } from '../../twitter/url';
import { QuestionCircleOutlined } from '@ant-design/icons';

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
              href={
                t.user?.screenName
                  ? buildUserUrl(t.user.screenName)
                  : 'javascript:void(0);'
              }
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 overflow-hidden pr-4"
            >
              <Avatar size={20} src={t.user.avatar} className="shrink-0" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                {`${t.user?.name || '未知用户'} ${t.user?.screenName ? `@${t.user.screenName}` : ''}`}
              </span>
            </a>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="space-x-2">
                <span>已发送：{t.completeCount}</span>
                {t.skipCount > 0 && (
                  <span>
                    已跳过
                    <Tooltip title="以下几种情况会跳过：1. 已经有相同文件名存在并打开跳过相同文件开关；2. 爬取进程未到指定开始日期。">
                      <QuestionCircleOutlined className="ml-1 text-ant-color-primary" />
                    </Tooltip>
                    ：{t.skipCount}
                  </span>
                )}
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
