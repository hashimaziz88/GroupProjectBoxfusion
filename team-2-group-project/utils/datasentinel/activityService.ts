import { axiosInstance } from "@/utils/axiosInstance";
import { unwrapAbpResponse } from "@/utils/abp";
import { IAbpResponse } from "@/interfaces/abp";
import { IPagedResult } from "@/interfaces/auth/adminService";
import {
  IActivityEventFilters,
  IActivityEventListItem,
} from "@/interfaces/datasentinel/activity";

export const getActivityEvents = async (filters: IActivityEventFilters) => {
  const response = await axiosInstance().get<
    IAbpResponse<IPagedResult<IActivityEventListItem>>
  >("/api/services/app/ActivityEvents/GetPagedActivityEvents", {
    params: filters,
  });

  return unwrapAbpResponse(response.data);
};
