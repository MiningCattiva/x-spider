import { TwitterMedia } from './TwitterMedia';

export interface TwitterPost {
  id: string;
  ownerId: number;
  createdAt: number;
  fullText: string;
  tags: string[];
  views: number;
  lang: string;
  retweeted: boolean;
  retweetCount: number;
  replyCount: number;
  possiblySensitive: boolean;
  favorited: boolean;
  favoriteCount: number;
  bookmarkCount: number;
  bookmarked: boolean;
  medias: TwitterMedia[];
}
