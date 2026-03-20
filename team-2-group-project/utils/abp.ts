import { IAbpResponse } from "@/interfaces/abp";

const resolveErrorMessage = (response: IAbpResponse<unknown>) =>
  response.error?.message ||
  response.error?.details ||
  "The ABP backend did not return a valid result.";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const GENERIC_HTTP_ERROR_PATTERN = /^Request failed with status code (\d{3})$/i;

const resolveHttpStatusFallback = (
  statusCode: number,
  fallback: string,
): string => {
  if (statusCode === 400) {
    return "The request could not be completed. Please review the data and try again.";
  }

  if (statusCode === 401) {
    return "Your session has expired. Please sign in again and retry the request.";
  }

  if (statusCode === 403) {
    return "You do not have permission to perform this action.";
  }

  if (statusCode === 404) {
    return "The requested item could not be found.";
  }

  if (statusCode === 409) {
    return "This request could not be completed because the data is already in use or has changed.";
  }

  if (statusCode === 422) {
    return "The request could not be validated. Please review the form values and try again.";
  }

  if (statusCode >= 500) {
    return "Something went wrong on the server. Please try again in a moment.";
  }

  return fallback;
};

const extractResponseStatus = (error: unknown): number | null => {
  if (
    isRecord(error) &&
    isRecord(error.response) &&
    typeof error.response.status === "number"
  ) {
    return error.response.status;
  }

  return null;
};

const extractAbpMessage = (payload: unknown): string | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const error = isRecord(payload.error) ? payload.error : null;
  const message =
    (typeof error?.message === "string" && error.message) ||
    (typeof error?.details === "string" && error.details) ||
    (typeof payload.message === "string" && payload.message);

  return message || null;
};

export const resolveAbpErrorMessage = (
  error: unknown,
  fallback = "The request failed.",
): string => {
  const statusCode = extractResponseStatus(error);
  const responseMessage = extractAbpMessage(
    isRecord(error) && isRecord(error.response) ? error.response.data : undefined,
  );

  if (responseMessage) {
    return responseMessage;
  }

  if (error instanceof Error && error.message) {
    if (/network error/i.test(error.message)) {
      return "We couldn't reach the server. Check your connection and try again.";
    }

    if (/timeout/i.test(error.message)) {
      return "The request took too long to complete. Please try again.";
    }

    const genericHttpError = error.message.match(GENERIC_HTTP_ERROR_PATTERN);

    if (genericHttpError) {
      return resolveHttpStatusFallback(
        Number(genericHttpError[1]),
        fallback,
      );
    }

    return error.message;
  }

  if (statusCode !== null) {
    return resolveHttpStatusFallback(statusCode, fallback);
  }

  return fallback;
};

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
