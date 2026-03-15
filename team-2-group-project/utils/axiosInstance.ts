import axios from "axios";
import { getAccessToken } from "@/utils/auth/authService";
import { getTenantId } from "@/utils/auth/tenantService";

export const axiosInstance = () => {
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  const tenantId = typeof window !== "undefined" ? getTenantId() : null;
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
