export interface Response {
  status: number;
  body: any;
  headers: Record<string, string[]>;
}
