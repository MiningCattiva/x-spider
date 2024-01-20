/* eslint-disable react/prop-types */
import React, { useMemo } from 'react';
import { InfiniteScroll } from '../InfiniteScroll';
import { LoadingOutlined } from '@ant-design/icons';
import { useHomepageStore } from '../../stores/homepage';
import dayjs from 'dayjs';
import * as R from 'ramda';
import { TwitterPost } from '../../interfaces/TwitterPost';
import { TwitterMedia } from '../../interfaces/TwitterMedia';
import { GridViewItemActions } from './GridViewItemActions';
import { buildPostUrl } from '../../twitter/url';

export const PostListGridView: React.FC = () => {
  const { userInfo, loadMorePostList, postList } = useHomepageStore(
    (state) => ({
      loadMorePostList: state.loadMorePostList,
      postList: state.postList,
      userInfo: state.userInfo,
    }),
  );

  const mediaList = useMemo<(TwitterMedia & { postId: string })[]>(
    () =>
      R.pipe(
        R.map<TwitterPost, (TwitterMedia & { postId: string })[]>((postItem) =>
          R.pipe(
            R.prop('medias'),
            R.map<TwitterMedia, TwitterMedia & { postId: string }>(
              R.assoc('postId', postItem.id),
            ),
          )(postItem),
        ),
        R.flatten,
      )(postList.list),
    [postList.list],
  );

  return (
    <InfiniteScroll
      onLoadMore={() => {
        if (postList.loading || userInfo.loading) {
          return;
        }
        loadMorePostList();
      }}
      className="overflow-y-auto pb-10 overflow-hidden h-[inherit]"
    >
      {postList.loading ? (
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
        {mediaList.map((item) => (
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
                src={`${item.url}?format=jpg&name=small`}
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
                <GridViewItemActions
                  actions={[
                    {
                      name: '打开推文',
                      href: buildPostUrl(
                        userInfo.data!.screenName,
                        item.postId,
                      ),
                    },
                    {
                      name: '下载图片',
                      onClick() {
                        // TODO download
                      },
                    },
                  ]}
                />
              </div>
            </div>
          </li>
        ))}
        {postList.loading && mediaList.length > 0 && (
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
      {!postList.loading && userInfo.data && !postList.cursor && (
        <div
          className="mt-4 text-sm text-ant-color-text-secondary text-center"
          role="alert"
        >
          列表没有更多数据了
        </div>
      )}
    </InfiniteScroll>
  );
};
