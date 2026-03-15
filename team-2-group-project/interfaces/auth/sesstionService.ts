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