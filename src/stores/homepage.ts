import { create } from 'zustand';
import { TwitterUser } from '../interfaces/TwitterUser';
import { TwitterMedia } from '../interfaces/TwitterMedia';
import { getUser, getUserMedia } from '../twitter/api';

export interface MediaListRequest {
  list: TwitterMedia[];
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

  mediaList: MediaListRequest;
  clearMediaList: () => void;
  loadMediaList: (abortController?: AbortController) => Promise<void>;
  loadMoreMediaList: (abortController?: AbortController) => Promise<void>;
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
  },
  clearUser: () =>
    set({
      userInfo: {
        loading: false,
        data: undefined,
      },
    }),

  mediaList: {
    cursor: null,
    list: [],
    loading: false,
  },
  clearMediaList: () => {
    set({
      mediaList: {
        cursor: null,
        list: [],
        loading: false,
      },
    });
  },
  loadMediaList: async (abortController) => {
    const userId = get().userInfo.data?.id;

    if (!userId) {
      throw new Error('No userId');
    }

    set({
      mediaList: {
        cursor: null,
        list: [],
        loading: true,
      },
    });

    const [list, nextCursor] = await getUserMedia(userId);

    if (abortController) {
      abortController.signal.throwIfAborted();
    }

    set({
      mediaList: {
        cursor: nextCursor,
        list,
        loading: false,
      },
    });
  },
  loadMoreMediaList: async (abortController) => {
    const mediaList = get().mediaList;

    if (mediaList.loading) {
      throw new Error('Media list is already loading');
    }
    if (!mediaList.cursor) {
      throw new Error('No more data');
    }

    const userId = get().userInfo.data?.id;

    if (!userId) {
      throw new Error('No userId');
    }

    set({
      mediaList: {
        ...mediaList,
        loading: true,
      },
    });

    const [list, nextCursor] = await getUserMedia(userId, mediaList.cursor);

    if (abortController) {
      abortController.signal.throwIfAborted();
    }

    set({
      mediaList: {
        loading: false,
        cursor: nextCursor,
        list: mediaList.list.concat(list),
      },
    });
  },
}));
