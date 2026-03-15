import axios from "axios";
import { IAbpResponse, unwrapAbpResponse } from "@/utils/abp";

const TENANT_COOKIE_KEY = "Abp.TenantId";
const TENANT_ID_STORAGE_KEY = "abp_tenant_id";
const TENANCY_NAME_STORAGE_KEY = "abp_tenancy_name";
const TENANCY_NAME_QUERY_KEY = "abp_tenancy_name";

export enum TenantAvailabilityState {
  Available = 1,
  InActive = 2,
  NotFound = 3,
}

export interface ITenantContext {
  tenantId?: number | null;
  tenancyName?: string | null;
}

export interface IIsTenantAvailableResponse {
  state: TenantAvailabilityState;
  tenantId?: number | null;
}

const canUseDom = () => typeof window !== "undefined";

const getCookieValue = (name: string) => {
  if (!canUseDom()) {
    return null;
  }

  const prefix = `${encodeURIComponent(name)}=`;

  for (const cookie of document.cookie.split(";")) {
    const trimmedCookie = cookie.trim();

    if (trimmedCookie.startsWith(prefix)) {
      return decodeURIComponent(trimmedCookie.slice(prefix.length));
    }
  }

  return null;
};

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

export const getTenantId = () => {
  if (!canUseDom()) {
    return null;
  }

  const storedTenantId = window.sessionStorage.getItem(TENANT_ID_STORAGE_KEY);

  if (storedTenantId) {
    return Number(storedTenantId);
  }

  const cookieTenantId = getCookieValue(TENANT_COOKIE_KEY);
  return cookieTenantId ? Number(cookieTenantId) : null;
};

export const getTenancyName = () => {
  if (!canUseDom()) {
    return null;
  }

  return window.sessionStorage.getItem(TENANCY_NAME_STORAGE_KEY);
};

export const getCurrentTenantContext = (): ITenantContext | null => {
  const tenantId = getTenantId();
  const tenancyName = getTenancyName();

  if (!tenantId && !tenancyName) {
    return null;
  }

  return {
    tenantId,
    tenancyName,
  };
};

export const setTenantContext = (tenant: ITenantContext) => {
  if (!canUseDom()) {
    return;
  }

  if (tenant.tenantId) {
    setCookieValue(TENANT_COOKIE_KEY, `${tenant.tenantId}`, 60 * 60 * 24 * 30);
    window.sessionStorage.setItem(TENANT_ID_STORAGE_KEY, `${tenant.tenantId}`);
  } else {
    window.sessionStorage.removeItem(TENANT_ID_STORAGE_KEY);
    deleteCookieValue(TENANT_COOKIE_KEY);
  }

  if (tenant.tenancyName) {
    window.sessionStorage.setItem(TENANCY_NAME_STORAGE_KEY, tenant.tenancyName);
  } else {
    window.sessionStorage.removeItem(TENANCY_NAME_STORAGE_KEY);
  }
};

export const clearTenantContext = () => {
  if (!canUseDom()) {
    return;
  }

  window.sessionStorage.removeItem(TENANT_ID_STORAGE_KEY);
  window.sessionStorage.removeItem(TENANCY_NAME_STORAGE_KEY);
  deleteCookieValue(TENANT_COOKIE_KEY);
};

export const resolveTenantNameFromLocation = () => {
  if (!canUseDom()) {
    return null;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const queryStringTenant = searchParams.get(TENANCY_NAME_QUERY_KEY);

  if (queryStringTenant) {
    return queryStringTenant;
  }

  const hostname = window.location.hostname;
  const isLocalHost =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  if (isLocalHost) {
    return null;
  }

  const hostnameSegments = hostname.split(".");

  if (hostnameSegments.length < 3) {
    return null;
  }

  return hostnameSegments[0] ?? null;
};

export const isTenantAvailable = async (tenancyName: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_LINK;
  const response = await axios.post<IAbpResponse<IIsTenantAvailableResponse>>(
    `${baseURL}api/services/app/Account/IsTenantAvailable`,
    {
      tenancyName,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return unwrapAbpResponse(response.data);
};

export const syncTenantFromLocation = async () => {
  const resolvedTenancyName = resolveTenantNameFromLocation();

  if (!resolvedTenancyName) {
    return getCurrentTenantContext();
  }

  const tenantAvailability = await isTenantAvailable(resolvedTenancyName);

  if (
    tenantAvailability.state === TenantAvailabilityState.Available &&
    tenantAvailability.tenantId
  ) {
    const resolvedTenant = {
      tenantId: tenantAvailability.tenantId,
      tenancyName: resolvedTenancyName,
    };

    setTenantContext(resolvedTenant);
    return resolvedTenant;
  }

  clearTenantContext();
  return null;
};
