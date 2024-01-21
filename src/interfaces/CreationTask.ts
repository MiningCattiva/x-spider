import { DownloadFilter } from "./DownloadFilter";

export interface CreationTask {
  id: string;
  userId: string;
  filter: DownloadFilter;
  status: 'waiting' | 'active';
}
