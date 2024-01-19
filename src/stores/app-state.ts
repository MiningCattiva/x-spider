import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createTauriFileStorage } from './persist/tauri-file-storage';
import { appStateLoadedEvent } from '../events/app-state-loaded';

export interface AppStateStore {
  cookieString: string;
  setCookieString: (cookieString: string) => void;
}

export const useAppStateStore = create(
  persist<AppStateStore>(
    (set) => ({
      cookieString: '',
      setCookieString: (cookieString) => set({ cookieString }),
    }),
    {
      name: 'app-state',
      storage: createTauriFileStorage(),
      onRehydrateStorage() {
        return () => {
          appStateLoadedEvent.emit();
        };
      },
    },
  ),
);
