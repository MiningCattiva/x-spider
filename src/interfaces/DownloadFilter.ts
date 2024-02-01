import MediaType from '../enums/MediaType';

export interface DownloadFilter {
  dateRange?: [start: number, end: number];
  mediaTypes?: MediaType[];
}
