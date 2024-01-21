export interface Settings_V1 {
  proxy: {
    enable: boolean;
    url: string;
  };
  download: {
    savePath: string;
    fileNameTemplate: string;
  };
}

export type Settings = Settings_V1;
