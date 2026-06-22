export interface BackendResponse<T = unknown> {
  status: number;
  message: string;
  data?: T;
}
