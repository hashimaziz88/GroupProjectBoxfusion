import { axiosInstance } from "@/utils/axiosInstance";
import { unwrapAbpResponse } from "@/utils/abp";
import { IAbpResponse } from "@/interfaces/abp";
import { IAuthenticateRequest, IAuthenticateResponse, IRegisterRequest, IRegisterResponse } from "@/interfaces/auth/authService";
import { ENCRYPTED_TOKEN_COOKIE_KEY, REMEMBERED_TOKEN_STORAGE_KEY, TOKEN_STORAGE_KEY } from "@/enums/auth/authService";


const canUseDom = () => typeof window !== "undefined";

const setCookieValue = (
  name: string,
  value: string,
  maxAgeSeconds?: number,
) => {
  if (!canUseDom()) {
    return;
  }

  const maxAge = maxAgeSeconds ? `; max-age=${maxAgeSeconds}` : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/${maxAge}`;
};

const deleteCookieValue = (name: string) => {
  if (!canUseDom()) {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0`;
};

export const authenticate = async (payload: IAuthenticateRequest) => {
  const response = await axiosInstance().post<
    IAbpResponse<IAuthenticateResponse>
  >("/api/TokenAuth/Authenticate", payload);

  return unwrapAbpResponse(response.data);
};

export const register = async (payload: IRegisterRequest) => {
  const response = await axiosInstance().post<IAbpResponse<IRegisterResponse>>(
    "/api/services/app/Account/Register",
    payload,
  );

  return unwrapAbpResponse(response.data);
};

export const storeAccessToken = (
  authResult: IAuthenticateResponse,
  rememberClient: boolean,
) => {
  if (!canUseDom()) {
    return;
  }

  if (!authResult.accessToken) {
    throw new Error("Authentication did not return an access token.");
  }

  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(REMEMBERED_TOKEN_STORAGE_KEY);

  if (rememberClient) {
    window.localStorage.setItem(
      REMEMBERED_TOKEN_STORAGE_KEY,
      authResult.accessToken,
    );
  } else {
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, authResult.accessToken);
  }

  if (authResult.encryptedAccessToken) {
    const maxAge = rememberClient ? authResult.expireInSeconds : undefined;
    setCookieValue(
      ENCRYPTED_TOKEN_COOKIE_KEY,
      authResult.encryptedAccessToken,
      maxAge,
    );
  }
};

export const clearAccessToken = () => {
  if (!canUseDom()) {
    return;
  }

  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(REMEMBERED_TOKEN_STORAGE_KEY);
  deleteCookieValue(ENCRYPTED_TOKEN_COOKIE_KEY);
};

export const getAccessToken = () => {
  if (!canUseDom()) {
    return null;
  }

  const resolvedToken =
    window.sessionStorage.getItem(TOKEN_STORAGE_KEY) ??
    window.localStorage.getItem(REMEMBERED_TOKEN_STORAGE_KEY);

  if (!resolvedToken || resolvedToken === "undefined") {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(REMEMBERED_TOKEN_STORAGE_KEY);
    return null;
  }

  return resolvedToken;
};

const decodeBase64 = (value: string) => {
  if (!canUseDom()) {
    return null;
  }

  const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedValue = normalizedValue.padEnd(
    normalizedValue.length + ((4 - (normalizedValue.length % 4)) % 4),
    "=",
  );

  return window.atob(paddedValue);
};

export const decodeTokenPayload = (token?: string | null) => {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  const decodedPayload = decodeBase64(payload);

  if (!decodedPayload) {
    return null;
  }

  try {
    return JSON.parse(decodedPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const extractRolesFromToken = (token?: string | null) => {
  const payload = decodeTokenPayload(token);

  if (!payload) {
    return [];
  }

  const roleClaimKeys = [
    "role",
    "roles",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  ];

  const resolvedRoles = roleClaimKeys.flatMap((claimKey) => {
    const claimValue = payload[claimKey];

    if (Array.isArray(claimValue)) {
      return claimValue.map((value) => `${value}`);
    }

    if (typeof claimValue === "string") {
      return [claimValue];
    }

    return [];
  });

  return Array.from(new Set(resolvedRoles));
};

export const getTokenExpiry = (token?: string | null) => {
  const payload = decodeTokenPayload(token);
  const expiryClaim = payload?.exp;

  if (typeof expiryClaim !== "number") {
    return null;
  }

  return new Date(expiryClaim * 1000).toISOString();
};
