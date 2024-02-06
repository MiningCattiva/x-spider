/* eslint-disable react/prop-types */
import React from 'react';
import { PageHeader } from '../components/PageHeader';
import Logo from '../../src-tauri/icons/128x128.png';

export const About: React.FC = () => {
  return (
    <>
      <PageHeader />
      <article className="space-y-2">
        <p className="flex items-center">
          <img src={Logo} className="w-28" />
          <span className="text-5xl ml-4 font-bold">X-Spider</span>
        </p>
        <p>
          <strong>版本号：</strong>
          {PACKAGE_JSON_VERSION}
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
      </article>
    </>
  );
};
