import MediaType from '../enums/MediaType';
import { TwitterMedia } from '../interfaces/TwitterMedia';

export function getDownloadUrl(media: TwitterMedia): string | undefined {
  if (media.type === MediaType.Photo) {
    if (!media.url) return undefined;
    const url = new URL(media.url);
    url.searchParams.set('name', '4096x4096');
    return url.href;
  }

  if (media.type === MediaType.Video) {
    const variant = media.videoInfo?.variants
      ?.filter((i) => i.bitrate)
      ?.sort((a, b) => (a.bitrate || 0) - (b.bitrate || 0))
      ?.pop();
    return variant?.url;
  }

  if (media.type === MediaType.Gif) {
    if (!media.videoInfo?.url) return undefined;
    return media.videoInfo?.url;
  }
}
