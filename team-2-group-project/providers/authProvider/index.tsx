"use client";

import React, { useContext, useEffect, useEffectEvent, useReducer } from "react";
import { useRouter } from "next/navigation";
import { resolveAbpErrorMessage } from "@/utils/abp";
import {
  authenticate,
  clearAccessToken,
  extractRolesFromToken,
  getAccessToken,
  getTokenExpiry,
  register as registerAccount,
  storeAccessToken,
} from "@/utils/auth/authService";
import {
  clearTenantContext,
  getCurrentTenantContext,
  isTenantAvailable,
  setTenantContext,
  syncTenantFromLocation,
} from "@/utils/auth/tenantService";
import {
  extractGrantedPermissions,
  getCurrentLoginInformations,
  getUserConfiguration,
  isMultiTenancyEnabled,
} from "@/utils/auth/sessionService";
import {
  clearErrorMessage as clearErrorMessageAction,
  getMeError,
  getMePending,
  getMeSuccess,
  initializeComplete,
  loginError,
  loginPending,
  loginSuccess,
  logoutError,
  logoutPending,
  logoutSuccess,
  registerError,
  registerPending,
  registerSuccess,
  tenantContextCleared,
  tenantContextUpdated,
} from "./actions";
import {
  AuthActionContext,
  AuthStateContext,
  INITIAL_STATE,
  ITenantChangeResult,
  ITenantContext,
  IUserLoginRequest,
  IUserLoginResponse,
  IUserRegisterRequest,
} from "./context";
import { AuthReducer } from "./reducer";
import { selectBestAuthenticatedRoute } from "@/utils/auth/roles";
import { ICurrentLoginInformations } from "@/interfaces/auth/sesstionService";
import { TenantAvailabilityState } from "@/enums/auth/tenantService";
import { IAuthenticateResponse } from "@/interfaces/auth/authService";

const buildResolvedUser = (
  authResult: IAuthenticateResponse | null,
  currentLoginInformations: ICurrentLoginInformations,
  tenant: ITenantContext | null,
  permissions: string[],
): IUserLoginResponse => {
  const accessToken = authResult?.accessToken ?? getAccessToken();
  const roles = extractRolesFromToken(accessToken);

  return {
    accessToken: accessToken ?? null,
    encryptedAccessToken: authResult?.encryptedAccessToken ?? null,
    expireInSeconds: authResult?.expireInSeconds ?? null,
    expiresAt: getTokenExpiry(accessToken),
    userId:
      authResult?.userId !== undefined
        ? `${authResult.userId}`
        : currentLoginInformations.user?.id !== undefined
          ? `${currentLoginInformations.user.id}`
          : undefined,
    userName: currentLoginInformations.user?.userName ?? null,
    emailAddress: currentLoginInformations.user?.emailAddress ?? null,
    name: currentLoginInformations.user?.name ?? null,
    surname: currentLoginInformations.user?.surname ?? null,
    roles,
    permissions,
    tenantId:
      currentLoginInformations.tenant?.id !== undefined
        ? `${currentLoginInformations.tenant.id}`
        : tenant?.tenantId !== undefined && tenant?.tenantId !== null
          ? `${tenant.tenantId}`
          : null,
    tenancyName:
      currentLoginInformations.tenant?.tenancyName ??
      tenant?.tenancyName ??
      null,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  const router = useRouter();

  const getMe = async () => {
    const token = getAccessToken();
    const currentTenant = getCurrentTenantContext();

    if (!token) {
      dispatch(initializeComplete(undefined));
      return;
    }

    dispatch(getMePending());

    await Promise.all([
      getCurrentLoginInformations(currentTenant?.tenantId),
      getUserConfiguration(currentTenant?.tenantId),
    ])
      .then(([currentLoginInformations, userConfiguration]) => {
        const permissions = extractGrantedPermissions(userConfiguration);
        const resolvedUser = buildResolvedUser(
          null,
          currentLoginInformations,
          currentTenant,
          permissions,
        );

        dispatch(getMeSuccess(resolvedUser));
      })
      .catch((error: unknown) => {
        clearAccessToken();
        dispatch(
          getMeError(
            resolveAbpErrorMessage(error, "Failed to load session."),
          ),
        );
      });
  };

  const initialize = async () => {
    const resolvedTenant = await syncTenantFromLocation().catch(() => null);

    if (resolvedTenant) {
      dispatch(tenantContextUpdated(resolvedTenant));
    } else {
      dispatch(tenantContextCleared());
    }

    const userConfiguration = await getUserConfiguration(
      resolvedTenant?.tenantId,
    ).catch(() => null);
    const permissions = extractGrantedPermissions(userConfiguration);
    const multiTenancyEnabled =
      userConfiguration === null
        ? true
        : isMultiTenancyEnabled(userConfiguration);

    if (getAccessToken()) {
      dispatch(
        initializeComplete({
          permissions,
          multiTenancyEnabled,
        }),
      );
      await getMe();
      return;
    }

    dispatch(
      initializeComplete({
        permissions,
        multiTenancyEnabled,
      }),
    );
  };

  const login = async (payload: IUserLoginRequest) => {
    dispatch(loginPending());
    const currentTenant = getCurrentTenantContext();

    await authenticate(payload, currentTenant?.tenantId)
      .then(async (authResult) => {
        storeAccessToken(authResult, Boolean(payload.rememberClient));

        const [currentLoginInformations, userConfiguration] = await Promise.all([
          getCurrentLoginInformations(currentTenant?.tenantId),
          getUserConfiguration(currentTenant?.tenantId),
        ]);

        const permissions = extractGrantedPermissions(userConfiguration);
        const resolvedUser = buildResolvedUser(
          authResult,
          currentLoginInformations,
          currentTenant,
          permissions,
        );

        dispatch(loginSuccess(resolvedUser));
        router.replace(selectBestAuthenticatedRoute(resolvedUser));
      })
      .catch((error: unknown) => {
        dispatch(
          loginError(
            resolveAbpErrorMessage(error, "Login request failed."),
          ),
        );
      });
  };

  const register = async (payload: IUserRegisterRequest) => {
    dispatch(registerPending());
    const currentTenant = getCurrentTenantContext();

    await registerAccount(payload)
      .then(async (registerResult) => {
        if (!registerResult.canLogin) {
          dispatch(registerSuccess(null));
          router.replace("/login?registered=1");
          return;
        }

        const authResult = await authenticate({
          userNameOrEmailAddress: payload.userName,
          password: payload.password,
          rememberClient: false,
        }, currentTenant?.tenantId);

        storeAccessToken(authResult, false);

        const [currentLoginInformations, userConfiguration] = await Promise.all([
          getCurrentLoginInformations(currentTenant?.tenantId),
          getUserConfiguration(currentTenant?.tenantId),
        ]);

        const permissions = extractGrantedPermissions(userConfiguration);
        const resolvedUser = buildResolvedUser(
          authResult,
          currentLoginInformations,
          currentTenant,
          permissions,
        );

        dispatch(registerSuccess(resolvedUser));
        router.replace(selectBestAuthenticatedRoute(resolvedUser));
      })
      .catch((error: unknown) => {
        dispatch(
          registerError(
            resolveAbpErrorMessage(error, "Registration request failed."),
          ),
        );
      });
  };

  const logout = async () => {
    dispatch(logoutPending());

    await Promise.resolve()
      .then(() => {
        clearAccessToken();
        dispatch(logoutSuccess());
        router.replace("/login");
      })
      .catch((error: unknown) => {
        dispatch(
          logoutError(
            resolveAbpErrorMessage(error, "Logout request failed."),
          ),
        );
      });
  };

  const changeTenant = async (
    tenancyName?: string | null,
  ): Promise<ITenantChangeResult> => {
    if (!tenancyName) {
      clearTenantContext();
      clearAccessToken();
      dispatch(tenantContextCleared());
      dispatch(initializeComplete(undefined));
      router.replace("/login");

      return {
        state: "host",
      };
    }

    const tenantAvailability = await isTenantAvailable(tenancyName);

    if (
      tenantAvailability.state === TenantAvailabilityState.Available &&
      tenantAvailability.tenantId
    ) {
      const tenantContext = {
        tenantId: tenantAvailability.tenantId,
        tenancyName,
      };

      setTenantContext(tenantContext);
      clearAccessToken();
      dispatch(tenantContextUpdated(tenantContext));
      dispatch(initializeComplete(undefined));
      router.replace("/login");

      return {
        state: "available",
        tenantId: tenantAvailability.tenantId,
        tenancyName,
      };
    }

    return {
      state:
        tenantAvailability.state === TenantAvailabilityState.InActive
          ? "inactive"
          : "not-found",
      tenancyName,
    };
  };

  const initializeOnMount = useEffectEvent(async () => {
    await initialize();
  });

  useEffect(() => {
    void initializeOnMount();
  }, []);

  const clearErrorMessage = () => {
    dispatch(clearErrorMessageAction());
  };

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionContext.Provider
        value={{
          initialize,
          login,
          register,
          logout,
          getMe,
          changeTenant,
          clearErrorMessage,
        }}
      >
        {children}
      </AuthActionContext.Provider>
    </AuthStateContext.Provider>
  );
};

export const useAuthState = () => {
  const context = useContext(AuthStateContext);

  if (context === undefined) {
    throw new Error("useAuthState must be used within an AuthProvider");
  }

  return context;
};

export const useAuthActions = () => {
  const context = useContext(AuthActionContext);

  if (context === undefined) {
    throw new Error("useAuthActions must be used within an AuthProvider");
  }

  return context;
};
