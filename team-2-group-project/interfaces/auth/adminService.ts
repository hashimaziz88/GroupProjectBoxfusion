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
