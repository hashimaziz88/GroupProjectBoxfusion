import { createAction } from "redux-actions";
import {
  IAuthStateContext,
  ITenantContext,
  IUserLoginResponse,
} from "./context";

export enum AuthActionEnums {
  initializeComplete = "INITIALIZE_COMPLETE",
  loginPending = "LOGIN_PENDING",
  loginSuccess = "LOGIN_SUCCESS",
  loginError = "LOGIN_ERROR",
  registerPending = "REGISTER_PENDING",
  registerSuccess = "REGISTER_SUCCESS",
  registerError = "REGISTER_ERROR",
  logoutPending = "LOGOUT_PENDING",
  logoutError = "LOGOUT_ERROR",
  logoutSuccess = "LOGOUT_SUCCESS",
  getMePending = "GET_ME_PENDING",
  getMeSuccess = "GET_ME_SUCCESS",
  getMeError = "GET_ME_ERROR",
  clearErrorMessage = "CLEAR_ERROR_MESSAGE",
  tenantContextUpdated = "TENANT_CONTEXT_UPDATED",
  tenantContextCleared = "TENANT_CONTEXT_CLEARED",
}

export const initializeComplete = createAction<
  Partial<IAuthStateContext>,
  Partial<IAuthStateContext> | undefined
>(
  AuthActionEnums.initializeComplete,
  (payload) => ({
    isReady: true,
    ...payload,
  }),
);

export const loginPending = createAction<Partial<IAuthStateContext>>(
  AuthActionEnums.loginPending,
  () => ({
    isPending: true,
    isError: false,
    isSuccess: false,
    isAuthenticated: false,
    errorMessage: null,
  }),
);

export const loginSuccess = createAction<
  Partial<IAuthStateContext>,
  IUserLoginResponse
>(
  AuthActionEnums.loginSuccess,
  (user) => ({
    isPending: false,
    isError: false,
    isSuccess: true,
    isReady: true,
    user,
    permissions: user.permissions ?? [],
    currentTenant: {
      tenantId: user.tenantId ? Number(user.tenantId) : null,
      tenancyName: user.tenancyName ?? null,
    },
    isAuthenticated: true,
    errorMessage: null,
  }),
);

export const loginError = createAction<
  Partial<IAuthStateContext>,
  string | undefined
>(
  AuthActionEnums.loginError,
  (message) => ({
    isPending: false,
    isError: true,
    isReady: true,
    user: null,
    permissions: [],
    isSuccess: false,
    isAuthenticated: false,
    errorMessage: message ?? "Login failed.",
  }),
);

export const registerPending = createAction<Partial<IAuthStateContext>>(
  AuthActionEnums.registerPending,
  () => ({
    isPending: true,
    isError: false,
    isSuccess: false,
    isAuthenticated: false,
    errorMessage: null,
  }),
);

export const registerSuccess = createAction<
  Partial<IAuthStateContext>,
  IUserLoginResponse | null
>(
  AuthActionEnums.registerSuccess,
  (user) => ({
    isPending: false,
    isError: false,
    isSuccess: true,
    isReady: true,
    user,
    permissions: user?.permissions ?? [],
    currentTenant: user
      ? {
          tenantId: user.tenantId ? Number(user.tenantId) : null,
          tenancyName: user.tenancyName ?? null,
        }
      : undefined,
    isAuthenticated: Boolean(user?.accessToken),
    errorMessage: null,
  }),
);

export const registerError = createAction<
  Partial<IAuthStateContext>,
  string | undefined
>(
  AuthActionEnums.registerError,
  (message) => ({
    isPending: false,
    isError: true,
    isReady: true,
    user: null,
    permissions: [],
    isSuccess: false,
    isAuthenticated: false,
    errorMessage: message ?? "Registration failed.",
  }),
);

export const logoutPending = createAction<Partial<IAuthStateContext>>(
  AuthActionEnums.logoutPending,
  () => ({
    isPending: true,
    isError: false,
    isSuccess: false,
    errorMessage: null,
  }),
);

export const logoutError = createAction<
  Partial<IAuthStateContext>,
  string | undefined
>(
  AuthActionEnums.logoutError,
  (message) => ({
    isPending: false,
    isError: true,
    isReady: true,
    isSuccess: false,
    user: null,
    permissions: [],
    isAuthenticated: false,
    errorMessage: message ?? "Logout failed.",
  }),
);

export const logoutSuccess = createAction<Partial<IAuthStateContext>>(
  AuthActionEnums.logoutSuccess,
  () => ({
    isSuccess: false,
    isPending: false,
    isError: false,
    isReady: true,
    user: null,
    permissions: [],
    isAuthenticated: false,
    errorMessage: null,
  }),
);

export const getMePending = createAction<Partial<IAuthStateContext>>(
  AuthActionEnums.getMePending,
  () => ({
    isPending: true,
    isError: false,
    isSuccess: false,
    isAuthenticated: false,
    errorMessage: null,
  }),
);

export const getMeSuccess = createAction<
  Partial<IAuthStateContext>,
  IUserLoginResponse
>(
  AuthActionEnums.getMeSuccess,
  (user) => ({
    isPending: false,
    isError: false,
    isSuccess: true,
    isReady: true,
    user,
    permissions: user.permissions ?? [],
    currentTenant: {
      tenantId: user.tenantId ? Number(user.tenantId) : null,
      tenancyName: user.tenancyName ?? null,
    },
    isAuthenticated: true,
    errorMessage: null,
  }),
);

export const getMeError = createAction<
  Partial<IAuthStateContext>,
  string | undefined
>(
  AuthActionEnums.getMeError,
  (message) => ({
    isPending: false,
    isError: true,
    isReady: true,
    isSuccess: false,
    user: null,
    permissions: [],
    isAuthenticated: false,
    errorMessage: message ?? "Failed to load the current session.",
  }),
);

export const clearErrorMessage = createAction<Partial<IAuthStateContext>>(
  AuthActionEnums.clearErrorMessage,
  () => ({
    isError: false,
    errorMessage: null,
  }),
);

export const tenantContextUpdated = createAction<
  Partial<IAuthStateContext>,
  ITenantContext | null
>(
  AuthActionEnums.tenantContextUpdated,
  (tenant) => ({
    currentTenant: tenant,
    multiTenancyEnabled: true,
    errorMessage: null,
  }),
);

export const tenantContextCleared = createAction<Partial<IAuthStateContext>>(
  AuthActionEnums.tenantContextCleared,
  () => ({
    currentTenant: null,
    multiTenancyEnabled: true,
    errorMessage: null,
  }),
);
