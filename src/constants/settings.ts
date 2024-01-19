import { Settings } from '../interfaces/Settings';

export const DEFAULT_SETTINGS: Settings = {
  proxy: {
    enable: true,
    url: '',
  },
  download: {
    savePath: '',
  },
};

export const CURRENT_SETTINGS_VERSION = 1;
