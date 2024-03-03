/* eslint-disable react/prop-types */
import React, { useMemo } from 'react';
import { InfiniteScroll } from '../InfiniteScroll';
import { LoadingOutlined } from '@ant-design/icons';
import { useHomepageStore } from '../../stores/homepage';
import dayjs from 'dayjs';
import * as R from 'ramda';
import { TwitterPost } from '../../interfaces/TwitterPost';
import { TwitterMedia } from '../../interfaces/TwitterMedia';
import { GridViewItemAction, GridViewItemActions } from './GridViewItemActions';
import { buildPostUrl } from '../../twitter/url';
import { buildFileName } from '../../utils/file-name-template';
import { useSettings } from '../../hooks/useSettings';
import { useDownloadStore } from '../../stores/download';
import { message } from 'antd';
import { getDownloadUrl } from '../../twitter/utils';
import MediaType from '../../enums/MediaType';

export const PostListGridView: React.FC = () => {
  const { userInfo, loadMorePostList, postList } = useHomepageStore(
    (state) => ({
      loadMorePostList: state.loadMorePostList,
      postList: state.postList,
      userInfo: state.userInfo,
    }),
  );
  const { value: fileNameTemplate } = useSettings<string>(
    'download',
    'fileNameTemplate',
  );
  const { value: savePath } = useSettings<string>('download', 'savePath');
  const createDownloadTask = useDownloadStore(
    (state) => state.createDownloadTask,
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
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-2">
        {mediaList.map((media) => {
          const actionOpen: GridViewItemAction | undefined = userInfo.data
            ?.screenName
            ? {
                name: '打开推文',
                href: buildPostUrl(userInfo.data.screenName, media.postId),
              }
            : undefined;

          const actionDownloadImage: GridViewItemAction = {
            name: '下载图片',
            async onClick() {
              const post = postList.list.find(
                (post) => post.id === media.postId,
              )!;
              try {
                const downloadUrl = getDownloadUrl(media);
                if (!downloadUrl) {
                  message.error('无法获取下载链接');
                  return;
                }
                const fileName = buildFileName(fileNameTemplate, {
                  media,
                  post,
                  user: userInfo.data!,
                  downloadUrl,
                });
                await createDownloadTask({
                  post,
                  user: userInfo.data!,
                  media,
                  fileName,
                  dir: savePath,
                  downloadUrl,
                });
                message.success('已添加到下载队列');
              } catch (err: any) {
                console.error(err);
                message.error('创建下载任务失败');
              }
            },
          };

          const actionDownloadVideo: GridViewItemAction = {
            name: '下载视频',
            async onClick() {
              const post = postList.list.find(
                (post) => post.id === media.postId,
              )!;
              try {
                const downloadUrl = getDownloadUrl(media);
                if (!downloadUrl) {
                  message.error('无法获取下载链接');
                  return;
                }
                const fileName = buildFileName(fileNameTemplate, {
                  media,
                  post,
                  user: userInfo.data!,
                  downloadUrl,
                });
                await createDownloadTask({
                  post,
                  user: userInfo.data!,
                  media,
                  fileName,
                  dir: savePath,
                  downloadUrl,
                });
                message.success('已添加到下载队列');
              } catch (err: any) {
                console.error(err);
                message.error('创建下载任务失败');
              }
            },
          };

          const actionDownloadGif: GridViewItemAction = {
            name: '下载 GIF（视频）',
            async onClick() {
              const post = postList.list.find(
                (post) => post.id === media.postId,
              )!;
              try {
                const downloadUrl = getDownloadUrl(media);
                if (!downloadUrl) {
                  message.error('无法获取下载链接');
                  return;
                }
                const fileName = buildFileName(fileNameTemplate, {
                  media,
                  post,
                  user: userInfo.data!,
                  downloadUrl,
                });
                await createDownloadTask({
                  post,
                  user: userInfo.data!,
                  media,
                  fileName,
                  dir: savePath,
                  downloadUrl,
                });
                message.success('已添加到下载队列');
              } catch (err: any) {
                console.error(err);
                message.error('创建下载任务失败');
              }
            },
          };

          return (
            <li
              tabIndex={0}
              key={media.id}
              className="relative h-[12rem] overflow-hidden bg-white group"
            >
              <div className="h-full">
                <img
                  alt="推文图片"
                  src={`${media.url}?format=jpg&name=small`}
                  loading="lazy"
                  className="object-cover w-full h-full transform transition-transform group-hover:scale-105"
                />
                {media.type === MediaType.Video && (
                  <span className="block absolute right-2 bottom-2 text-white bg-[rgba(0,0,0,0.6)] rounded-sm px-[0.3rem] text-sm">
                    <span className="sr-only">视频时长：</span>
                    {media.videoInfo?.duration
                      ? dayjs.duration(media.videoInfo.duration).format('mm:ss')
                      : '视频'}
                  </span>
                )}
                {media.type === MediaType.Gif && (
                  <span className="block absolute right-2 bottom-2 text-white bg-[rgba(0,0,0,0.6)] rounded-sm px-[0.3rem] text-sm">
                    GIF
                  </span>
                )}
                <div className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.7)] transition-opacity opacity-0 group-hover:opacity-100 has-[:focus]:opacity-100">
                  <GridViewItemActions
                    actions={R.cond([
                      [
                        R.equals(MediaType.Photo),
                        R.always([actionOpen, actionDownloadImage]),
                      ],
                      [
                        R.equals(MediaType.Video),
                        R.always([actionOpen, actionDownloadVideo]),
                      ],
                      [
                        R.equals(MediaType.Gif),
                        R.always([actionOpen, actionDownloadGif]),
                      ],
                      [R.T, R.always([])],
                    ])(media.type).filter(R.isNotNil)}
                  />
                </div>
              </div>
            </li>
          );
        })}
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
