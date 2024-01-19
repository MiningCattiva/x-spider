/* eslint-disable react/prop-types */
import { useRequest } from 'ahooks';
import { Avatar, Button, Input, Space, message } from 'antd';
import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useAppStateStore } from '../stores/app-state';
import { getUser } from '../twitter/api';

export const Homepage: React.FC = () => {
  const [screenName, setTargetScreenName] = useState('');
  const [searchHistory, addSearchHistory, clearSearchHistory] =
    useAppStateStore((s) => [
      s.searchHistory,
      s.addSearchHistory,
      s.clearSearchHistory,
    ]);

  const userReq = useRequest(
    async (screenName: string) => {
      return getUser(screenName);
    },
    {
      manual: true,
      onError(e) {
        message.error(e.message);
      },
    },
  );

  const startSearch = (sn: string) => {
    if (!sn) return;
    sn = sn.trim();
    setTargetScreenName(sn);
    addSearchHistory(sn);
    userReq.run(sn);
  };

  return (
    <>
      <PageHeader />
      <main>
        <section aria-label="搜索用户">
          <Space.Compact block>
            <Input
              type="search"
              autoComplete="search"
              onPressEnter={() => startSearch(screenName)}
              value={screenName}
              onChange={(e) => setTargetScreenName(e.target.value)}
              placeholder="请输入账号 ID，如：shiratamacaron"
              className="text-center"
            />
            <Button
              disabled={!screenName}
              loading={userReq.loading}
              onClick={() => startSearch(screenName)}
              type="primary"
            >
              加载
            </Button>
          </Space.Compact>
          {searchHistory.length > 0 && (
            <section aria-label="搜索历史" className="text-sm mt-2">
              <span>
                搜索历史
                <Button
                  type="link"
                  size="small"
                  onClick={clearSearchHistory}
                  className="!p-0"
                >
                  （清空）
                </Button>
                ：
              </span>
              <ul className="inline">
                {searchHistory.map((sn) => (
                  <li key={sn} className="inline">
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setTargetScreenName(sn);
                        startSearch(sn);
                      }}
                    >
                      {sn}
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
        {userReq.data && (
          <section
            aria-label="用户信息"
            className="bg-white border-[1px] border-gray-300 rounded-md mt-4"
          >
            <a
              title="跳转到主页"
              className="flex items-center p-4"
              href={`https://twitter.com/${userReq.data.screenName}`}
              target="_blank"
              rel="noreferrer"
            >
              <div>
                <Avatar src={userReq.data.avatar} size={50} alt="头像" />
              </div>
              <div className="ml-2">
                <p>{userReq.data.name}</p>
                <p className="text-ant-color-text-secondary text-sm mt-1">
                  @{userReq.data.screenName}
                </p>
              </div>
            </a>
          </section>
        )}
      </main>
    </>
  );
};
