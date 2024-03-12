/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import Logo from '../../src-tauri/icons/128x128.png';
import { useCheckUpdate } from '../hooks/useCheckUpdate';
import { useAppStateStore } from '../stores/app-state';
import { isVersionGt } from '../utils/version';
import { dialog } from '@tauri-apps/api';
import { Sponsors } from '../components/about/Sponsors';

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
      <section className="flex items-center">
        <img src={Logo} className="w-28" alt="logo" />
        <span className="text-5xl ml-4 font-bold">X-Spider</span>
      </section>
      <ul className="space-y-2 [&_a]:underline">
        <li>
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
              try {
                const hasUpdate = await checkForUpdate();
                if (!hasUpdate) {
                  dialog.message('软件已是最新版本', {
                    title: '软件已是最新版本',
                  });
                }
              } catch (err) {
                console.error(err);
                dialog.message('无法获取最新更新，请稍后再试', {
                  title: '获取更新错误',
                });
              } finally {
                setIsCheckingUpdate(false);
              }
            }}
            className="bg-transparent text-blue-500 disabled:text-gray-400"
            disabled={isCheckingUpdate}
          >
            {isCheckingUpdate ? '请稍候...' : '检查更新'}
          </button>
          ）
        </li>
        <li>
          <strong>作者：</strong>
          <a
            href="https://github.com/MiningCattiva"
            target="_blank"
            rel="noreferrer"
          >
            MiningCattiva
          </a>
        </li>
        <li>
          <strong>仓库地址：</strong>
          <a
            href="https://github.com/MiningCattiva/x-spider"
            target="_blank"
            rel="noreferrer"
          >
            https://github.com/MiningCattiva/x-spider
          </a>
        </li>
        <li>
          <strong>开源协议：</strong>
          <a
            href="https://github.com/MiningCattiva/x-spider/blob/master/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            {PACKAGE_JSON_LICENSE}
          </a>
        </li>
        <li>
          <strong>赞助：</strong>
          <a
            href="https://afdian.net/a/moyuscript"
            target="_blank"
            rel="noreferrer"
          >
            爱发电
          </a>
        </li>
        <li>
          <strong>赞助名单：</strong>
          <Sponsors />
        </li>
      </ul>
    </>
  );
};
