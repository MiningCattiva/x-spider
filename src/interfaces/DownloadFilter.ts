import { Dayjs } from 'dayjs';
import MediaType from '../enums/MediaType';

export interface DownloadFilter {
  dateRange?: [start: Dayjs, end: Dayjs];
  mediaTypes?: MediaType[];
}
