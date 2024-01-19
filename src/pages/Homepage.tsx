/* eslint-disable react/prop-types */
import { LoadingOutlined } from '@ant-design/icons';
import { useInfiniteScroll, useRequest } from 'ahooks';
import { Avatar, Button, Input, Space, message } from 'antd';
import React, { useRef, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { TwitterMedia } from '../interfaces/TwitterMedia';
import { useAppStateStore } from '../stores/app-state';
import { getUser, getUserMedia } from '../twitter/api';
import dayjs from 'dayjs';

export const Homepage: React.FC = () => {
  const [screenName, setTargetScreenName] = useState('');
  const [searchHistory, addSearchHistory, clearSearchHistory] =
    useAppStateStore((s) => [
      s.searchHistory,
      s.addSearchHistory,
      s.clearSearchHistory,
    ]);
  const scrollingRef = useRef(null);

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
  const mediaReq = useInfiniteScroll<{
    list: TwitterMedia[];
    cursor: string | null;
  }>(
    async (data) => {
      if (!userReq.data?.id) {
        return {
          list: [],
          cursor: null,
        };
      }
      const cursor = data?.cursor || undefined;
      const [list, nextCursor] = await getUserMedia(userReq.data?.id, cursor);
      return {
        list,
        cursor: nextCursor,
      };
    },
    {
      reloadDeps: [userReq.data?.id],
      isNoMore(data) {
        return data?.cursor === null;
      },
      target: scrollingRef,
      onError(e) {
        console.error(e);
        message.error(e.message);
      },
    },
  );

  const startSearch = (sn: string) => {
    if (!sn) return;
    sn = sn.trim();
    setTargetScreenName(sn);
    addSearchHistory(sn);
    mediaReq.mutate({
      list: [],
      cursor: null,
    });
    userReq.mutate(undefined);
    userReq.run(sn);
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
              {userReq.loading && (
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
                        type="link"
                        size="small"
                        onClick={() => {
                          setTargetScreenName(sn);
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
          {!userReq.loading && userReq.data && (
            <section
              aria-label="用户信息"
              className="bg-white border-[1px] border-gray-300 rounded-md mt-4"
            >
              <span className="sr-only" role="status">
                用户信息加载完成，当前搜索用户：{userReq.data.name}
              </span>
              <a
                title="跳转到主页"
                aria-label={`跳转到 ${userReq.data.name} 的主页`}
                className="flex items-center p-4 focus:outline !outline-4 !outline-cyan-200"
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
        </div>
      </div>
      <section
        className="relative grow mt-4 pb-4 overflow-hidden h-full"
        aria-label="图片预览"
      >
        <div
          className="overflow-y-auto pb-10 overflow-hidden h-[inherit]"
          ref={scrollingRef}
        >
          {mediaReq.loading ? (
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
            {mediaReq.data?.list?.map((item) => (
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
            {!mediaReq.loading && mediaReq.loadingMore && (
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
          {userReq.data?.id && !mediaReq.loading && mediaReq.noMore && (
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
