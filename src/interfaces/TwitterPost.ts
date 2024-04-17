import { Dayjs } from 'dayjs';
import { TwitterMedia } from './TwitterMedia';
import { TwitterUser } from './TwitterUser';

export interface TwitterPost {
  id: string;
  user: TwitterUser;
  createdAt?: Dayjs;
  fullText?: string;
  tags?: string[];
  views?: number;
  lang?: string;
  retweeted?: boolean;
  retweetCount?: number;
  replyCount?: number;
  possiblySensitive?: boolean;
  favorited?: boolean;
  favoriteCount?: number;
  bookmarkCount?: number;
  bookmarked?: boolean;
  medias?: TwitterMedia[];
}
