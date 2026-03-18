import { axiosInstance } from "@/utils/axiosInstance";
import { unwrapAbpResponse } from "@/utils/abp";
import { IAbpResponse } from "@/interfaces/abp";
import { ICurrentLoginInformations, IUserConfiguration } from "@/interfaces/auth/sesstionService";



export const getCurrentLoginInformations = async (
  tenantId?: string | number | null,
) => {
  const response = await axiosInstance({ tenantId }).get<
    IAbpResponse<ICurrentLoginInformations>
  >(
    "/api/services/app/Session/GetCurrentLoginInformations",
  );

  return unwrapAbpResponse(response.data);
};

export const getUserConfiguration = async (
  tenantId?: string | number | null,
) => {
  const response = await axiosInstance({ tenantId }).get<
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
