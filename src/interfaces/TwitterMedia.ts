import MediaType from '../enums/MediaType';

export interface TwitterMediaBase {
  id?: string;
  url?: string;
  width?: number;
  height?: number;
}

export interface TwitterMediaPhoto extends TwitterMediaBase {
  type: MediaType.Photo;
}

export interface TwitterMediaVideo extends TwitterMediaBase {
  type: MediaType.Video;
  videoInfo?: {
    duration: number;
    variants?: {
      bitrate?: number;
      contentType?: string;
      url?: string;
    }[];
    aspectRatio?: [number, number];
  };
}

export interface TwitterMediaGif extends TwitterMediaBase {
  type: MediaType.Gif;
  videoInfo?: {
    url?: string;
    aspectRatio?: [number, number];
  };
}

export type TwitterMedia =
  | TwitterMediaPhoto
  | TwitterMediaVideo
  | TwitterMediaGif;
