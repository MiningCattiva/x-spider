/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import Logo from '../../src-tauri/icons/128x128.png';
import { useCheckUpdate } from '../hooks/useCheckUpdate';
import { useAppStateStore } from '../stores/app-state';
import { isVersionGt } from '../utils/version';
import { dialog } from '@tauri-apps/api';

export const About: React.FC = () => {
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const checkForUpdate = useCheckUpdate();
  const { latestVersion, latestUrl } = useAppStateStore((s) => ({
    latestVersion: s.latestVersion,
    latestUrl: s.latestUrl,
  }));

  return (
    <>
      <PageHeader />
      <article className="space-y-2 [&_a]:underline">
        <p className="flex items-center">
          <img src={Logo} className="w-28" />
          <span className="text-5xl ml-4 font-bold">X-Spider</span>
        </p>
        <p>
          <strong>版本号：</strong>
          <span>{PACKAGE_JSON_VERSION}</span>
          {isVersionGt(latestVersion, PACKAGE_JSON_VERSION) && (
            <span>
              &nbsp;→&nbsp;
              <a
                className="text-green-500"
                href={latestUrl}
                target="_blank"
                rel="noreferrer"
                title="前往下载"
              >
                {latestVersion}
              </a>
            </span>
          )}
          （
          <button
            onClick={async () => {
              setIsCheckingUpdate(true);
              const hasUpdate = await checkForUpdate();
              setIsCheckingUpdate(false);

              if (!hasUpdate) {
                dialog.message('软件已是最新版本', {
                  title: '软件已是最新版本',
                });
              }
            }}
            className="bg-transparent text-blue-500 disabled:text-gray-400"
            disabled={isCheckingUpdate}
          >
            {isCheckingUpdate ? '请稍候...' : '检查更新'}
          </button>
          ）
        </p>
        <p>
          <strong>作者：</strong>
          <a
            href="https://github.com/MiningCattiva"
            target="_blank"
            rel="noreferrer"
          >
            MiningCattiva
          </a>
        </p>
        <p>
          <strong>仓库地址：</strong>
          <a
            href="https://github.com/MiningCattiva/x-spider"
            target="_blank"
            rel="noreferrer"
          >
            https://github.com/MiningCattiva/x-spider
          </a>
        </p>
        <p>
          <strong>开源协议：</strong>
          <a
            href="https://github.com/MiningCattiva/x-spider/blob/master/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            {PACKAGE_JSON_LICENSE}
          </a>
        </p>
        <p>
          <strong>赞助：</strong>
          <a
            href="https://afdian.net/a/moyuscript"
            target="_blank"
            rel="noreferrer"
          >
            爱发电
          </a>
        </p>
      </article>
    </>
  );
};
