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

const resolveErrorMessage = (response: IAbpResponse<unknown>) =>
  response.error?.details ||
  response.error?.message ||
  "The ABP backend did not return a valid result.";

export const unwrapAbpResponse = <T>(payload: T | IAbpResponse<T>) => {
  if (!payload || typeof payload !== "object" || !("__abp" in payload)) {
    return payload as T;
  }

  const abpPayload = payload as IAbpResponse<T>;

  if (abpPayload.success === false) {
    throw new Error(resolveErrorMessage(abpPayload));
  }

  if (abpPayload.result === undefined) {
    throw new Error(resolveErrorMessage(abpPayload));
  }

  return abpPayload.result as T;
};
