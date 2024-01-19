import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createTauriFileStorage } from './persist/tauri-file-storage';
import { appStateLoadedEvent } from '../events/app-state-loaded';

export interface AppStateStore {
  cookieString: string;
  setCookieString: (cookieString: string) => void;

  searchHistory: string[];
  addSearchHistory: (keyword: string) => void;
  clearSearchHistory: () => void;
}

export const useAppStateStore = create(
  persist<AppStateStore>(
    (set, get) => ({
      cookieString: '',
      setCookieString: (cookieString) => set({ cookieString }),
      searchHistory: [],
      addSearchHistory: (keyword) => {
        const history = get().searchHistory;
        const existsIndex = history.findIndex(
          (v) => v === keyword.toLowerCase(),
        );

        if (existsIndex >= 0) {
          history.splice(existsIndex, 1);
        }

        history.unshift(keyword.toLowerCase());
        set({ searchHistory: history });
      },
      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: 'app-state',
      storage: createTauriFileStorage(),
      onRehydrateStorage() {
        return () => {
          appStateLoadedEvent.emit();
        };
      },
      version: 1,
    },
  ),
);
