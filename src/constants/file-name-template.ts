import dayjs, { Dayjs } from 'dayjs';
import { TwitterMedia } from '../interfaces/TwitterMedia';
import { TwitterPost } from '../interfaces/TwitterPost';
import { TwitterUser } from '../interfaces/TwitterUser';
import * as R from 'ramda';
import { FileNameTemplateData } from '../interfaces/FileNameTemplateData';
import MediaType from '../enums/MediaType';
import { getDownloadUrl } from '../twitter/utils';

export const EXAMPLE_USER: Required<TwitterUser> = {
  avatar:
    'https://pbs.twimg.com/profile_images/1440258619912585220/KiYN-52Z_normal.jpg',
  name: '这是用户昵称',
  screenName: 'userscreenname',
  id: '1145141919',
  mediaCount: 8888,
  registerTime: dayjs('2024-01-01'),
};

export const EXAMPLE_POST: Required<TwitterPost> = {
  id: '1145141919810',
  views: 13496,
  createdAt: dayjs(1705756536000),
  bookmarkCount: 1,
  bookmarked: false,
  favoriteCount: 228,
  favorited: false,
  fullText: 'This is test post text',
  lang: 'ja',
  possiblySensitive: false,
  replyCount: 21,
  retweeted: false,
  retweetCount: 24,
  medias: [
    {
      id: '1748695771262889984',
      url: 'https://pbs.twimg.com/media/GESdifpaMAA6rth.jpg',
      width: 1323,
      height: 1136,
      type: MediaType.Photo,
    },
  ],
  tags: ['标签1', '标签2'],
  user: EXAMPLE_USER,
};

export const EXAMPLE_MEDIA: Required<TwitterMedia> = EXAMPLE_POST
  .medias[0] as Required<TwitterMedia>;

export const EXAMPLE_FILE_NAME_TEMPLATE_DATA: FileNameTemplateData = {
  media: EXAMPLE_MEDIA,
  post: EXAMPLE_POST,
};

export const REPLACER_MAP: Record<
  string,
  {
    desc: string;
    replacer: (data: FileNameTemplateData) => string | undefined;
  }
> = {
  POST_ID: {
    desc: '推文 ID',
    replacer: R.path(['post', 'id']),
  },
  POST_TIME: {
    desc: '推文发布时间',
    replacer: R.pipe(R.path(['post', 'createdAt']), (ts?: Dayjs) =>
      ts!.format('YYYY-MM-DD HH-mm-ss'),
    ),
  },
  USER_ID: {
    desc: '用户 ID',
    replacer: R.path(['post', 'user', 'id']),
  },
  USER_NAME: {
    desc: '用户昵称',
    replacer: R.path(['post', 'user', 'name']),
  },
  USER_SCREEN_NAME: {
    desc: '用户名',
    replacer: R.path(['post', 'user', 'screenName']),
  },
  MEDIA_ID: {
    desc: '资源 ID',
    replacer: R.path(['post', 'media', 'id']),
  },
  MEDIA_WIDTH: {
    desc: '资源宽度',
    replacer: R.path(['post', 'media', 'width']),
  },
  MEDIA_HEIGHT: {
    desc: '资源高度',
    replacer: R.path(['post', 'media', 'height']),
  },
  MEDIA_INDEX: {
    desc: '资源索引',
    replacer: (data) =>
      (
        data.post.medias!.findIndex((media) => media.id === data.media.id) + 1
      ).toString(),
  },
  MEDIA_TYPE: {
    desc: '媒体类型',
    replacer: (data) => data.media.type,
  },
  EXT: {
    desc: '扩展名',
    replacer: R.pipe(
      (data) => getDownloadUrl(data.media),
      R.split('.'),
      R.last,
      R.split('?'),
      R.head,
      (s) => `.${s}`,
    ),
  },
  TAGS: {
    desc: '推文标签',
    replacer: R.pipe(
      // @ts-ignore
      R.path(['post', 'tags']),
      R.join(','),
    ),
  },
};
