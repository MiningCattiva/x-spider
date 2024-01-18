import { path } from '@tauri-apps/api';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CURRENT_SETTINGS_VERSION,
  DEFAULT_SETTINGS,
} from '../constants/settings';
import { Settings } from '../interfaces/Settings';
import { createTauriFileStorage } from './persist-storage/tauri-file-storage';
import * as R from 'ramda';

export interface SettingsStore extends Settings {
  update: (settings: Settings) => void;
  updateOne: <T>(name: string, key: string, value: T) => Promise<void>;
}

export const useSettingsStore = create(
  persist<SettingsStore>(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      update: (settings) => {
        set(settings);
      },
      updateOne: async (name, key, value) => {
        const store = get();
        const newSettings = R.assocPath([name, key], value)(store) as Settings;
        store.update(newSettings);
      },
    }),
    {
      name: 'settings',
      version: CURRENT_SETTINGS_VERSION,
      storage: createTauriFileStorage(),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) return;

          // 如果没有默认保存路径，设置为系统 Downloads 文件夹所在地
          if (!state?.download.savePath) {
            path.downloadDir().then((dir) => {
              useSettingsStore.setState({
                download: R.mergeDeepRight(state!.download, {
                  savePath: dir,
                }),
              });
            });
          }
        };
      },
    },
  ),
);
