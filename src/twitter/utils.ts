import MediaType from '../enums/MediaType';
import { TwitterMedia } from '../interfaces/TwitterMedia';

export function getDownloadUrl(media: TwitterMedia): string {
  if (media.type === MediaType.Photo) {
    if (!media.url) throw new Error('媒体没有下载链接');
    const url = new URL(media.url);
    url.searchParams.set('name', 'orig');
    return url.href;
  }

  if (media.type === MediaType.Video) {
    const variant = media.videoInfo?.variants
      ?.filter((i) => i.bitrate)
      ?.sort((a, b) => (a.bitrate || 0) - (b.bitrate || 0))
      ?.pop();
    if (!variant?.url) {
      throw new Error('视频没有下载链接');
    }
    return variant.url;
  }

  if (media.type === MediaType.Gif) {
    if (!media.videoInfo?.url) throw new Error('Gif 没有下载链接');
    return media.videoInfo?.url;
  }

  throw new Error(`无法获取该媒体类型的下载链接 ${media}`);
}
