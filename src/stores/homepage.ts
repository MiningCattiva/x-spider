import { create } from 'zustand';
import { TwitterUser } from '../interfaces/TwitterUser';
import { getUser, getUserMedias } from '../twitter/api';
import { TwitterPost } from '../interfaces/TwitterPost';
import { DownloadFilter } from '../interfaces/DownloadFilter';
import MediaType from '../enums/MediaType';
import { produce } from 'immer';
import { message } from 'antd';

export interface PostListRequest {
  list?: TwitterPost[];
  loading: boolean;
  cursor: string | null;
}

export interface UserInfoRequest {
  data?: TwitterUser;
  loading: boolean;
}

export interface HomepageStore {
  keyword: string;
  setKeyword: (kw: string) => void;
  filter: DownloadFilter;
  setFilter: (filter: DownloadFilter) => void;

  userInfo: UserInfoRequest;
  loadUser: (screenName: string) => Promise<void>;
  clearUser: () => void;

  postList: PostListRequest;
  clearPostList: () => void;
  loadPostList: () => Promise<void>;
  loadMorePostList: () => Promise<void>;
}

let loadPostListAbortController = new AbortController();
let loadUserAbortController = new AbortController();

export const useHomepageStore = create<HomepageStore>((set, get) => ({
  keyword: '',
  setKeyword: (kw: string) => set({ keyword: kw }),
  filter: {
    mediaTypes: [MediaType.Photo, MediaType.Video, MediaType.Gif],
  },
  setFilter: (filter) => set({ filter }),

  userInfo: {
    loading: false,
    data: undefined,
  },
  loadUser: async (screenName: string) => {
    set({
      userInfo: {
        data: undefined,
        loading: true,
      },
    });

    loadUserAbortController.abort();
    loadUserAbortController = new AbortController();

    try {
      const value = await getUser(screenName);

      if (loadUserAbortController.signal.aborted) {
        return;
      }

      set({
        userInfo: {
          loading: false,
          data: value,
        },
      });
    } catch (err: any) {
      set({
        userInfo: {
          data: undefined,
          loading: false,
        },
      });
      throw err;
    }
  },
  clearUser: () =>
    set({
      userInfo: {
        loading: false,
        data: undefined,
      },
    }),

  postList: {
    list: undefined,
    loading: false,
    cursor: null,
  },
  postListGenerator: undefined,
  clearPostList: () => {
    set({
      postList: {
        cursor: null,
        list: undefined,
        loading: false,
      },
    });
  },
  loadPostList: async () => {
    loadPostListAbortController.abort();
    loadPostListAbortController = new AbortController();
    const state = get();
    const userInfo = state.userInfo.data;

    if (!userInfo) {
      throw new Error('No userInfo');
    }

    set({
      postList: {
        cursor: null,
        list: undefined,
        loading: true,
      },
    });

    try {
      const { cursor, twitterPosts } = await getUserMedias(userInfo.id);

      if (loadPostListAbortController.signal.aborted) {
        return;
      }

      set({
        postList: {
          list: twitterPosts,
          loading: false,
          cursor,
        },
      });
    } catch (err: any) {
      log.error('Failed to load post list', err);
      message.error(`加载图片列表失败：${err?.message || '未知原因'}`);
      set({
        postList: {
          cursor: null,
          list: [],
          loading: false,
        },
      });
    }
  },
  loadMorePostList: async () => {
    const state = get();
    const postList = state.postList;
    const userInfo = state.userInfo.data;

    if (!postList.list) {
      throw new Error('未初始化列表');
    }
    if (postList.loading) {
      throw new Error('已正在加载中');
    }
    if (!postList.cursor) {
      throw new Error('没有更多数据了');
    }
    if (!userInfo) {
      throw new Error('未加载用户信息');
    }

    set(
      produce(state, (draft) => {
        draft.postList.loading = true;
      }),
    );

    loadPostListAbortController.abort();
    loadPostListAbortController = new AbortController();

    try {
      const { twitterPosts, cursor } = await getUserMedias(
        userInfo.id,
        postList.cursor,
      );

      if (loadPostListAbortController.signal.aborted) {
        return;
      }

      set({
        postList: {
          loading: false,
          list: (postList.list || []).concat(twitterPosts),
          cursor,
        },
      });
    } catch (err: any) {
      set(
        produce(state, (draft) => {
          draft.postList.loading = false;
        }),
      );
      throw err;
    }
  },
}));
