import { create } from 'zustand';
import { TwitterUser } from '../interfaces/TwitterUser';
import { getUser, getTwitterPosts } from '../twitter/api';
import { TwitterPost } from '../interfaces/TwitterPost';

export interface PostListRequest {
  list: TwitterPost[];
  cursor: string | null;
  loading: boolean;
}

export interface UserInfoRequest {
  data?: TwitterUser;
  loading: boolean;
}

export interface HomepageStore {
  keyword: string;
  setKeyword: (kw: string) => void;

  userInfo: UserInfoRequest;
  loadUser: (
    screenName: string,
    abortController?: AbortController,
  ) => Promise<void>;
  clearUser: () => void;

  postList: PostListRequest;
  clearPostList: () => void;
  loadPostList: (abortController?: AbortController) => Promise<void>;
  loadMorePostList: (abortController?: AbortController) => Promise<void>;
}

export const useHomepageStore = create<HomepageStore>((set, get) => ({
  keyword: '',
  setKeyword: (kw: string) => set({ keyword: kw }),

  userInfo: {
    loading: false,
    data: undefined,
  },
  loadUser: async (screenName: string, abortController) => {
    set({
      userInfo: {
        data: undefined,
        loading: true,
      },
    });

    try {
      const value = await getUser(screenName);

      if (abortController) {
        abortController.signal.throwIfAborted();
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
    cursor: null,
    list: [],
    loading: false,
  },
  clearPostList: () => {
    set({
      postList: {
        cursor: null,
        list: [],
        loading: false,
      },
    });
  },
  loadPostList: async (abortController) => {
    const userId = get().userInfo.data?.id;

    if (!userId) {
      throw new Error('No userId');
    }

    set({
      postList: {
        cursor: null,
        list: [],
        loading: true,
      },
    });

    try {
      const { twitterPosts, cursor: nextCursor } =
        await getTwitterPosts(userId);

      if (abortController) {
        abortController.signal.throwIfAborted();
      }

      set({
        postList: {
          cursor: nextCursor,
          list: twitterPosts,
          loading: false,
        },
      });
    } catch (err: any) {
      set({
        postList: {
          cursor: null,
          list: [],
          loading: false,
        },
      });
      throw err;
    }
  },
  loadMorePostList: async (abortController) => {
    const postList = get().postList;

    if (postList.loading) {
      throw new Error('Media list is already loading');
    }
    if (!postList.cursor) {
      throw new Error('No more data');
    }

    const userId = get().userInfo.data?.id;

    if (!userId) {
      throw new Error('No userId');
    }

    set({
      postList: {
        ...postList,
        loading: true,
      },
    });

    const { twitterPosts, cursor: nextCursor } = await getTwitterPosts(
      userId,
      postList.cursor,
    );

    if (abortController) {
      abortController.signal.throwIfAborted();
    }

    set({
      postList: {
        loading: false,
        cursor: nextCursor,
        list: postList.list.concat(twitterPosts),
      },
    });
  },
}));
