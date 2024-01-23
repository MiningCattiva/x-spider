import { DownloadFilter } from './DownloadFilter';
import { TwitterUser } from './TwitterUser';

export interface CreationTask {
  id: string;
  user: TwitterUser;
  filter: DownloadFilter;
  status: 'waiting' | 'active';
  completeCount: number;
  skipCount: number;
}
