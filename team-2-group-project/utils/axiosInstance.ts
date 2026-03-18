import axios from "axios";
import { getAccessToken } from "@/utils/auth/authService";
import { getTenantId } from "@/utils/auth/tenantService";

interface IAxiosInstanceOptions {
  token?: string | null;
  tenantId?: string | number | null;
}

export const axiosInstance = (options?: IAxiosInstanceOptions) => {
  const token =
    options?.token !== undefined
      ? options.token
      : typeof window !== "undefined"
        ? getAccessToken()
        : null;
  const tenantId =
    options?.tenantId !== undefined
      ? options.tenantId
      : typeof window !== "undefined"
        ? getTenantId()
        : null;
  const baseURL = process.env.NEXT_PUBLIC_API_LINK;

  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { "Abp.TenantId": `${tenantId}` } : {}),
    },
  });
};
