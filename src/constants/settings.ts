import { Settings } from '../interfaces/Settings';

export const DEFAULT_SETTINGS: Settings = {
  proxy: {
    enable: false,
    url: '',
  },
  download: {
    savePath: '',
  },
};

export const CURRENT_SETTINGS_VERSION = 1;
