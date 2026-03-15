import { createContext } from "react";

export interface IUserLoginRequest {
  userNameOrEmailAddress?: string | null;
  password?: string | null;
  rememberClient?: boolean | null;
}

export interface IUserRegisterRequest {
  name?: string | null;
  surname?: string | null;
  userName?: string | null;
  emailAddress?: string | null;
  password?: string | null;
}

export interface IUserLoginResponse {
  accessToken?: string | null;
  encryptedAccessToken?: string | null;
  expireInSeconds?: number | null;
  expiresAt?: string | null;
  userId?: string;
  userName?: string | null;
  emailAddress?: string | null;
  name?: string | null;
  surname?: string | null;
  roles?: string[] | null;
  permissions?: string[] | null;
  tenantId?: string | null;
  tenancyName?: string | null;
}

export interface ITenantContext {
  tenantId?: number | null;
  tenancyName?: string | null;
}

export interface ITenantChangeResult {
  state: "available" | "inactive" | "not-found" | "host";
  tenantId?: number | null;
  tenancyName?: string | null;
}

export interface IAuthStateContext {
  isSuccess: boolean;
  isPending: boolean;
  isError: boolean;
  isReady: boolean;
  isAuthenticated: boolean;
  multiTenancyEnabled: boolean;
  permissions?: string[] | null;
  currentTenant?: ITenantContext | null;
  user?: IUserLoginResponse | null;
  errorMessage?: string | null;
}

export interface IAuthActionContext {
  initialize: () => Promise<void>;
  login: (payload: IUserLoginRequest) => Promise<void>;
  register: (payload: IUserRegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getMe: () => Promise<void>;
  changeTenant: (tenancyName?: string | null) => Promise<ITenantChangeResult>;
}

export const INITIAL_STATE: IAuthStateContext = {
  isSuccess: false,
  isPending: false,
  isError: false,
  isReady: false,
  isAuthenticated: false,
  multiTenancyEnabled: true,
  permissions: [],
  currentTenant: null,
  user: null,
  errorMessage: null,
};

export const AuthStateContext = createContext<IAuthStateContext>(INITIAL_STATE);
export const AuthActionContext = createContext<IAuthActionContext>(undefined!);
