/* eslint-disable react/prop-types */
import { Avatar, Button, Input, Space, message } from 'antd';
import React, { useRef } from 'react';
import { PageHeader } from '../components/PageHeader';
import { PostListGridView } from '../components/homepage/PostListGridView';
import { useAppStateStore } from '../stores/app-state';
import { useHomepageStore } from '../stores/homepage';

export const Homepage: React.FC = () => {
  const {
    keyword,
    setKeyword,
    userInfo,
    clearUser,
    loadPostList: loadMediaList,
    loadUser,
    clearPostList: clearMediaList,
  } = useHomepageStore();
  const [searchHistory, addSearchHistory, clearSearchHistory] =
    useAppStateStore((s) => [
      s.searchHistory,
      s.addSearchHistory,
      s.clearSearchHistory,
    ]);
  const searchAbortControllerRef = useRef<AbortController>();

  const startSearch = async (sn: string) => {
    if (!sn) return;
    sn = sn.trim();
    setKeyword(sn);
    addSearchHistory(sn);

    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort('Another search');
    }

    clearUser();
    clearMediaList();

    const abortion = (searchAbortControllerRef.current = new AbortController());
    try {
      await loadUser(sn, searchAbortControllerRef.current);
      await loadMediaList(searchAbortControllerRef.current);
    } catch (err: any) {
      if (abortion.signal.aborted) return;
      console.error(err);
      message.error(err);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div>
        <PageHeader />
        <div className="shrink-0">
          <section aria-label="搜索用户">
            <Space.Compact block>
              <Input
                type="search"
                autoComplete="search"
                disabled={userInfo.loading}
                onPressEnter={() => startSearch(keyword)}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入账号 ID，如：shiratamacaron"
                className="text-center"
              />
              <Button
                disabled={!keyword}
                loading={userInfo.loading}
                onClick={() => startSearch(keyword)}
                type="primary"
              >
                加载
              </Button>
              {userInfo.loading && (
                <span className="sr-only" role="status">
                  加载用户信息中
                </span>
              )}
            </Space.Compact>
            {searchHistory.length > 0 && (
              <section
                aria-label="搜索历史"
                className="text-sm mt-2"
                tabIndex={0}
              >
                <span>
                  搜索历史（
                  <Button
                    type="link"
                    size="small"
                    onClick={clearSearchHistory}
                    className="!p-0"
                  >
                    清空
                    <span className="sr-only">历史记录</span>
                  </Button>
                  ） ：
                </span>
                <ul className="inline">
                  {searchHistory.map((sn) => (
                    <li key={sn} className="inline">
                      <Button
                        disabled={userInfo.loading}
                        type="link"
                        size="small"
                        onClick={() => {
                          setKeyword(sn);
                          startSearch(sn);
                        }}
                      >
                        <span className="sr-only">搜索</span>
                        {sn}
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </section>
          {userInfo.data && (
            <section
              aria-label="用户信息"
              className="bg-white border-[1px] border-gray-300 rounded-md mt-4"
            >
              <span className="sr-only" role="status">
                用户信息加载完成，当前搜索用户：{userInfo.data.name}
              </span>
              <a
                title="跳转到主页"
                aria-label={`跳转到 ${userInfo.data.name} 的主页`}
                className="flex items-center p-4 focus:outline !outline-4 !outline-cyan-200"
                href={`https://twitter.com/${userInfo.data.screenName}`}
                target="_blank"
                rel="noreferrer"
              >
                <div>
                  <Avatar src={userInfo.data.avatar} size={50} alt="头像" />
                </div>
                <div className="ml-2">
                  <p>{userInfo.data.name}</p>
                  <p className="text-ant-color-text-secondary text-sm mt-1">
                    @{userInfo.data.screenName}
                  </p>
                </div>
              </a>
            </section>
          )}
        </div>
      </div>
      <section
        className="relative grow mt-4 pb-4 overflow-hidden h-full"
        aria-label="内容预览"
      >
        <PostListGridView />
      </section>
    </div>
  );
};
