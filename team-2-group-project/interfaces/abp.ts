export interface IAbpResponse<T> {
  result?: T | null;
  targetUrl?: string | null;
  success?: boolean;
  error?: {
    message?: string;
    details?: string;
  } | null;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}
