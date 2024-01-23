import { TwitterMedia } from '../interfaces/TwitterMedia';

export function getDownloadUrl(media: TwitterMedia): string | undefined {
  if (media.type === 'photo') {
    return media.url;
  }

  if (media.type === 'video') {
    const variant = media.videoInfo.variants
      .filter((i) => i.bitrate)
      .sort((a, b) => a.bitrate - b.bitrate)
      .pop();
    return variant?.url;
  }
}
