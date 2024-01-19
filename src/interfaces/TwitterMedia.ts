export interface TwitterMediaBase {
  id: string;
  url: string;
  pic: string;
  createAt: number;
}

export interface TwitterMediaPhoto extends TwitterMediaBase {
  type: 'photo';
}

export interface TwitterMediaVideo extends TwitterMediaBase {
  type: 'video';
  videoInfo: {
    duration: number;
    variants: {
      bitrate: number;
      contentType: string;
      url: string;
    }[];
  };
}

export type TwitterMedia = TwitterMediaPhoto | TwitterMediaVideo;
