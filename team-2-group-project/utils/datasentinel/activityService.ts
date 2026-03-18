import { axiosInstance } from "@/utils/axiosInstance";
import { unwrapAbpResponse } from "@/utils/abp";
import { IAbpResponse } from "@/interfaces/abp";
import { IPagedResult } from "@/interfaces/auth/adminService";
import {
  IActivityFilterOptions,
  IActivityEventFilters,
  IActivityEventListItem,
  IActivitySummary,
} from "@/interfaces/datasentinel/activity";

export const getActivityEvents = async (filters: IActivityEventFilters) => {
  const response = await axiosInstance().get<
    IAbpResponse<IPagedResult<IActivityEventListItem>>
  >("/api/services/app/ActivityEvent/GetPaged", {
    params: filters,
  });

  return unwrapAbpResponse(response.data);
};

export const getActivitySummary = async () => {
  const response = await axiosInstance().get<IAbpResponse<IActivitySummary>>(
    "/api/services/app/ActivityEvent/GetSummary",
  );

  return unwrapAbpResponse(response.data);
};

export const getActivityFilterOptions = async () => {
  const response = await axiosInstance().get<
    IAbpResponse<IActivityFilterOptions>
  >("/api/services/app/ActivityEvent/GetFilterOptions");

  return unwrapAbpResponse(response.data);
};
