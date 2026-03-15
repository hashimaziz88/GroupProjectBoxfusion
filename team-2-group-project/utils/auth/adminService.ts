import { axiosInstance } from "@/utils/axiosInstance";
import { unwrapAbpResponse } from "@/utils/abp";
import { IAbpResponse } from "@/interfaces/abp";
import { IChangePasswordRequest, IPagedResult, IRoleListItem, ITenantListItem, IUserListItem } from "@/interfaces/auth/adminService";



export const getUsers = async () => {
  const response = await axiosInstance().get<
    IAbpResponse<IPagedResult<IUserListItem>>
  >("/api/services/app/User/GetAll", {
    params: {
      keyword: "",
      isActive: undefined,
      skipCount: 0,
      maxResultCount: 100,
    },
  });

  return unwrapAbpResponse(response.data);
};

export const getRoles = async () => {
  const response = await axiosInstance().get<
    IAbpResponse<IPagedResult<IRoleListItem>>
  >("/api/services/app/Role/GetAll", {
    params: {
      keyword: "",
      skipCount: 0,
      maxResultCount: 100,
    },
  });

  return unwrapAbpResponse(response.data);
};

export const getTenants = async () => {
  const response = await axiosInstance().get<
    IAbpResponse<IPagedResult<ITenantListItem>>
  >("/api/services/app/Tenant/GetAll", {
    params: {
      keyword: "",
      isActive: undefined,
      skipCount: 0,
      maxResultCount: 100,
    },
  });

  return unwrapAbpResponse(response.data);
};

export const changePassword = async (payload: IChangePasswordRequest) => {
  const response = await axiosInstance().post<IAbpResponse<boolean>>(
    "/api/services/app/User/ChangePassword",
    payload,
  );

  return unwrapAbpResponse(response.data);
};
