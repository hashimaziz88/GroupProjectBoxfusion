import { axiosInstance } from "@/utils/axiosInstance";
import { unwrapAbpResponse } from "@/utils/abp";
import { IAbpResponse } from "@/interfaces/abp";
import {
  IChangePasswordRequest,
  IChangeUserLanguageDto,
  ICreateRoleDto,
  ICreateTenantDto,
  ICreateUserDto,
  IFlatPermissionDto,
  IGetRoleForEditOutput,
  IPagedResult,
  IRoleDto,
  IRoleListDto,
  IRoleListItem,
  ITenantDto,
  ITenantListItem,
  IUserDto,
  IUserListItem,
  IResetPasswordDto,
} from "@/interfaces/auth/adminService";

// ─── Users ───────────────────────────────────────────────────────────────────

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

export const getUser = async (id: number) => {
  const response = await axiosInstance().get<IAbpResponse<IUserDto>>(
    "/api/services/app/User/Get",
    { params: { Id: id } },
  );

  return unwrapAbpResponse(response.data);
};

export const createUser = async (dto: ICreateUserDto) => {
  const response = await axiosInstance().post<IAbpResponse<IUserDto>>(
    "/api/services/app/User/Create",
    dto,
  );

  return unwrapAbpResponse(response.data);
};

export const updateUser = async (dto: IUserDto) => {
  const response = await axiosInstance().put<IAbpResponse<IUserDto>>(
    "/api/services/app/User/Update",
    dto,
  );

  return unwrapAbpResponse(response.data);
};

export const deleteUser = async (id: number) => {
  await axiosInstance().delete("/api/services/app/User/Delete", {
    params: { Id: id },
  });
};

export const activateUser = async (id: number) => {
  await axiosInstance().post("/api/services/app/User/Activate", { id });
};

export const deActivateUser = async (id: number) => {
  await axiosInstance().post("/api/services/app/User/DeActivate", { id });
};

export const getUserRoles = async () => {
  const response = await axiosInstance().get<
    IAbpResponse<{ items?: IRoleListDto[] | null }>
  >("/api/services/app/User/GetRoles");

  return unwrapAbpResponse(response.data);
};

export const changeLanguage = async (dto: IChangeUserLanguageDto) => {
  await axiosInstance().post("/api/services/app/User/ChangeLanguage", dto);
};

export const resetPassword = async (dto: IResetPasswordDto) => {
  const response = await axiosInstance().post<IAbpResponse<boolean>>(
    "/api/services/app/User/ResetPassword",
    dto,
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

// ─── Roles ───────────────────────────────────────────────────────────────────

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

export const getRole = async (id: number) => {
  const response = await axiosInstance().get<IAbpResponse<IRoleDto>>(
    "/api/services/app/Role/Get",
    { params: { Id: id } },
  );

  return unwrapAbpResponse(response.data);
};

export const getRolesByPermission = async (permission?: string) => {
  const response = await axiosInstance().get<
    IAbpResponse<{ items?: IRoleListDto[] | null }>
  >("/api/services/app/Role/GetRoles", {
    params: permission ? { Permission: permission } : undefined,
  });

  return unwrapAbpResponse(response.data);
};

export const getRoleForEdit = async (id: number) => {
  const response = await axiosInstance().get<IAbpResponse<IGetRoleForEditOutput>>(
    "/api/services/app/Role/GetRoleForEdit",
    { params: { Id: id } },
  );

  return unwrapAbpResponse(response.data);
};

export const getAllPermissions = async () => {
  const response = await axiosInstance().get<
    IAbpResponse<{ items?: IFlatPermissionDto[] | null }>
  >("/api/services/app/Role/GetAllPermissions");

  return unwrapAbpResponse(response.data);
};

export const createRole = async (dto: ICreateRoleDto) => {
  const response = await axiosInstance().post<IAbpResponse<IRoleDto>>(
    "/api/services/app/Role/Create",
    dto,
  );

  return unwrapAbpResponse(response.data);
};

export const updateRole = async (dto: IRoleDto) => {
  const response = await axiosInstance().put<IAbpResponse<IRoleDto>>(
    "/api/services/app/Role/Update",
    dto,
  );

  return unwrapAbpResponse(response.data);
};

export const deleteRole = async (id: number) => {
  await axiosInstance().delete("/api/services/app/Role/Delete", {
    params: { Id: id },
  });
};

// ─── Tenants ─────────────────────────────────────────────────────────────────

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

export const getTenant = async (id: number) => {
  const response = await axiosInstance().get<IAbpResponse<ITenantDto>>(
    "/api/services/app/Tenant/Get",
    { params: { Id: id } },
  );

  return unwrapAbpResponse(response.data);
};

export const createTenant = async (dto: ICreateTenantDto) => {
  const response = await axiosInstance().post<IAbpResponse<ITenantDto>>(
    "/api/services/app/Tenant/Create",
    dto,
  );

  return unwrapAbpResponse(response.data);
};

export const updateTenant = async (dto: ITenantDto) => {
  const response = await axiosInstance().put<IAbpResponse<ITenantDto>>(
    "/api/services/app/Tenant/Update",
    dto,
  );

  return unwrapAbpResponse(response.data);
};

export const deleteTenant = async (id: number) => {
  await axiosInstance().delete("/api/services/app/Tenant/Delete", {
    params: { Id: id },
  });
};
