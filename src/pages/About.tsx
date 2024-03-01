/* eslint-disable react/prop-types */
import React from 'react';
import { PageHeader } from '../components/PageHeader';
import Logo from '../../src-tauri/icons/128x128.png';

export const About: React.FC = () => {
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
          <a
            href="https://github.com/MiningCattiva/x-spider/releases"
            target="_blank"
            rel="noreferrer"
          >
            {PACKAGE_JSON_VERSION}
          </a>
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
