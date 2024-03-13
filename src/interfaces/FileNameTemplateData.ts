import { TwitterMedia } from './TwitterMedia';
import { TwitterPost } from './TwitterPost';

export interface FileNameTemplateData {
  post: TwitterPost;
  media: TwitterMedia;
}
