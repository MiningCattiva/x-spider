/* eslint-disable react/prop-types */
import { LoadingOutlined } from '@ant-design/icons';
import { Avatar, Button, Input, Space, message } from 'antd';
import dayjs from 'dayjs';
import React, { useRef } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useAppStateStore } from '../stores/app-state';
import { useHomepageStore } from '../stores/homepage';

export const Homepage: React.FC = () => {
  const {
    keyword,
    setKeyword,
    userInfo,
    clearUser,
    loadMediaList,
    loadMoreMediaList,
    loadUser,
    mediaList,
    clearMediaList,
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

  const onMediaListScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (mediaList.loading || !mediaList.cursor) return;
    const el = event.target as HTMLDivElement;
    const threshold = el.clientHeight;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + threshold) {
      loadMoreMediaList();
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
        aria-label="图片预览"
      >
        <div
          onScroll={onMediaListScroll}
          className="overflow-y-auto pb-10 overflow-hidden h-[inherit]"
        >
          {mediaList.loading ? (
            <div role="status">
              <LoadingOutlined
                className="text-ant-color-primary mr-2"
                aria-hidden
              />
              加载图片列表中...
            </div>
          ) : (
            <div role="status" className="sr-only">
              列表加载完成
            </div>
          )}
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-2">
            {mediaList.list?.map((item) => (
              <li
                aria-label={
                  item.type === 'photo'
                    ? '推文图片'
                    : `推文视频，时长${dayjs.duration(item.videoInfo.duration).format('mm分ss秒')}`
                }
                tabIndex={0}
                key={item.id}
                className="relative h-[15rem] overflow-hidden bg-white group"
              >
                <div className="h-full">
                  <img
                    alt="推文图片"
                    src={`${item.pic}?format=jpg&name=small`}
                    loading="lazy"
                    className="object-cover w-full h-full transform transition-transform group-hover:scale-105"
                  />
                  {item.type === 'video' && (
                    <span className="block absolute right-2 bottom-2 text-white bg-[rgba(0,0,0,0.6)] rounded-sm px-[0.3rem] text-sm">
                      <span className="sr-only">视频时长：</span>
                      {dayjs.duration(item.videoInfo.duration).format('mm:ss')}
                    </span>
                  )}
                  <div className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.7)] transition-opacity opacity-0 group-hover:opacity-100 has-[:focus]:opacity-100">
                    <ul className="w-full h-full flex flex-col items-center justify-center px-6 space-y-2">
                      <li className="w-full">
                        <button className="w-full bg-transparent border-[1px] rounded-full text-white py-1 text-center transition-colors hover:bg-white hover:text-black focus:bg-white focus:text-black">
                          打开推文
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            ))}
            {mediaList.loading && mediaList.list.length > 0 && (
              <li
                className="h-[15rem] flex items-center justify-center bg-white"
                tabIndex={0}
              >
                <LoadingOutlined
                  className="text-6xl text-ant-color-primary"
                  aria-hidden
                />
                <span className="sr-only">加载更多图片中</span>
              </li>
            )}
          </ul>
          {!mediaList.loading && userInfo.data && !mediaList.cursor && (
            <div
              className="mt-4 text-sm text-ant-color-text-secondary text-center"
              role="alert"
            >
              列表没有更多数据了
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
