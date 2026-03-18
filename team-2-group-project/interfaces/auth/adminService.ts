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

export interface ICreateUserDto {
  userName: string;
  name: string;
  surname: string;
  emailAddress: string;
  password: string;
  isActive: boolean;
  roleNames?: string[] | null;
}

export interface IUserDto {
  id: number;
  userName: string;
  name: string;
  surname: string;
  emailAddress: string;
  isActive: boolean;
  fullName?: string | null;
  lastLoginTime?: string | null;
  creationTime?: string | null;
  roleNames?: string[] | null;
}

export interface IResetPasswordDto {
  adminPassword: string;
  userId: number;
  newPassword: string;
}

export interface IChangeUserLanguageDto {
  languageName: string;
}

export interface ICreateRoleDto {
  name: string;
  displayName: string;
  normalizedName?: string | null;
  description?: string | null;
  grantedPermissions?: string[] | null;
}

export interface IRoleDto {
  id: number;
  name: string;
  displayName: string;
  normalizedName?: string | null;
  description?: string | null;
  grantedPermissions?: string[] | null;
}

export interface IRoleEditDto {
  id: number;
  name: string;
  displayName: string;
  description?: string | null;
  isStatic: boolean;
}

export interface IFlatPermissionDto {
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
}

export interface IGetRoleForEditOutput {
  role?: IRoleEditDto | null;
  permissions?: IFlatPermissionDto[] | null;
  grantedPermissionNames?: string[] | null;
}

export interface IPermissionDto {
  id: number;
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
}

export interface ICreateTenantDto {
  tenancyName: string;
  name: string;
  adminEmailAddress: string;
  connectionString?: string | null;
  isActive: boolean;
}

export interface ITenantDto {
  id: number;
  tenancyName: string;
  name: string;
  isActive: boolean;
}

export interface IRoleListDto {
  id: number;
  name?: string | null;
  displayName?: string | null;
  isStatic: boolean;
  isDefault: boolean;
  creationTime?: string | null;
}
