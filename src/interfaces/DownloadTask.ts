import { Aria2Status } from "../utils/aria2";
import { TwitterMedia } from "./TwitterMedia";
import { TwitterPost } from "./TwitterPost";
import { TwitterUser } from "./TwitterUser";

export interface DownloadTask {
  gid: string;
  post: TwitterPost,
  user: TwitterUser,
  media: TwitterMedia;
  fileName: string;
  dir: string;
  totalSize: number;
  completeSize: number;
  status: Aria2Status;
  error?: string;
  updatedAt: number;
}
