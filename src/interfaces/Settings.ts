export interface Settings_V1 {
  proxy: {
    enable: boolean;
    url: string;
  };
  download: {
    savePath: string;
    fileNameTemplate: string;
    sameFileSkip: boolean;
  };
}

export type Settings = Settings_V1;
