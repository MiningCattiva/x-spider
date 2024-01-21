import { TwitterMedia } from "./TwitterMedia";
import { TwitterPost } from "./TwitterPost";
import { TwitterUser } from "./TwitterUser";

export interface FileNameTemplateData {
  post: TwitterPost;
  user: TwitterUser;
  media: TwitterMedia;
}
