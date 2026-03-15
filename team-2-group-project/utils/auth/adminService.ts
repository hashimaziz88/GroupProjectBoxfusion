import { axiosInstance } from "@/utils/axiosInstance";
import { IAbpResponse, unwrapAbpResponse } from "@/utils/abp";

export interface IPagedResult<T> {
  items?: T[] | null;
  totalCount?: number;
}

export interface IUserListItem {
  id: number;
  userName: string;
  name: string;
  surname: string;
  fullName?: string | null;
  emailAddress: string;
  isActive: boolean;
  creationTime?: string | null;
  lastLoginTime?: string | null;
  roleNames?: string[] | null;
}

export interface IRoleListItem {
  id: number;
  name: string;
  displayName: string;
  normalizedName?: string | null;
  description?: string | null;
  grantedPermissions?: string[] | null;
  isStatic?: boolean;
  isDefault?: boolean;
  creationTime?: string | null;
}

export interface ITenantListItem {
  id: number;
  tenancyName: string;
  name: string;
  isActive: boolean;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const getUsers = async () => {
  const response = await axiosInstance().get<
    IAbpResponse<IPagedResult<IUserListItem>>
  >(
    "/api/services/app/User/GetAll",
    {
      params: {
        keyword: "",
        isActive: undefined,
        skipCount: 0,
        maxResultCount: 100,
      },
    },
  );

  return unwrapAbpResponse(response.data);
};

export const getRoles = async () => {
  const response = await axiosInstance().get<
    IAbpResponse<IPagedResult<IRoleListItem>>
  >(
    "/api/services/app/Role/GetAll",
    {
      params: {
        keyword: "",
        skipCount: 0,
        maxResultCount: 100,
      },
    },
  );

  return unwrapAbpResponse(response.data);
};

export const getTenants = async () => {
  const response = await axiosInstance().get<
    IAbpResponse<IPagedResult<ITenantListItem>>
  >(
    "/api/services/app/Tenant/GetAll",
    {
      params: {
        keyword: "",
        isActive: undefined,
        skipCount: 0,
        maxResultCount: 100,
      },
    },
  );

  return unwrapAbpResponse(response.data);
};

export const changePassword = async (payload: IChangePasswordRequest) => {
  const response = await axiosInstance().post<IAbpResponse<boolean>>(
    "/api/services/app/User/ChangePassword",
    payload,
  );

  return unwrapAbpResponse(response.data);
};
