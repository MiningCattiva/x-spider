import { Settings } from '../interfaces/Settings';

export const DEFAULT_SETTINGS: Settings = {
  proxy: {
    enable: true,
    url: 'http://127.0.0.1:7890',
  },
  download: {
    savePath: '',
    fileNameTemplate: '%POST_TIME% %USER_SCREEN_NAME% %MEDIA_ID%%EXT%',
    sameFileSkip: false,
  },
};

export const CURRENT_SETTINGS_VERSION = 1;
