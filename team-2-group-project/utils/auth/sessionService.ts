import { axiosInstance } from "@/utils/axiosInstance";
import { IAbpResponse, unwrapAbpResponse } from "@/utils/abp";

export interface IApplicationInfo {
  version?: string;
  releaseDate?: string;
  features?: Record<string, boolean>;
}

export interface IUserLoginInfo {
  id?: number;
  name?: string | null;
  surname?: string | null;
  userName?: string | null;
  emailAddress?: string | null;
}

export interface ITenantLoginInfo {
  id?: number;
  tenancyName?: string | null;
  name?: string | null;
}

export interface ICurrentLoginInformations {
  application?: IApplicationInfo | null;
  user?: IUserLoginInfo | null;
  tenant?: ITenantLoginInfo | null;
}

export interface IUserConfiguration {
  auth?: {
    grantedPermissions?: Record<string, boolean>;
  };
  multiTenancy?: {
    isEnabled?: boolean;
  };
}

export const getCurrentLoginInformations = async () => {
  const response = await axiosInstance().get<
    IAbpResponse<ICurrentLoginInformations>
  >(
    "/api/services/app/Session/GetCurrentLoginInformations",
  );

  return unwrapAbpResponse(response.data);
};

export const getUserConfiguration = async () => {
  const response = await axiosInstance().get<
    IUserConfiguration | IAbpResponse<IUserConfiguration>
  >(
    "/AbpUserConfiguration/GetAll",
  );

  return unwrapAbpResponse(response.data);
};

export const extractGrantedPermissions = (
  configuration?: IUserConfiguration | null,
) => {
  const grantedPermissions = configuration?.auth?.grantedPermissions ?? {};

  return Object.keys(grantedPermissions).filter(
    (permissionName) => Boolean(grantedPermissions[permissionName]),
  );
};

export const isMultiTenancyEnabled = (
  configuration?: IUserConfiguration | null,
) => Boolean(configuration?.multiTenancy?.isEnabled);
