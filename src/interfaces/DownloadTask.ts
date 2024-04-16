import { Aria2Status } from '../utils/aria2';
import { TwitterMedia } from './TwitterMedia';
import { TwitterPost } from './TwitterPost';

export interface DownloadTask {
  gid: string;
  post: TwitterPost;
  media: TwitterMedia;
  fileName: string;
  dir: string;
  totalSize: number;
  completeSize: number;
  status: Aria2Status;
  error?: string;
  updatedAt: number;
  downloadUrl: string;
  ariaRetryCountRemains: number;
}
