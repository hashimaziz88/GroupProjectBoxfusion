"use client";

import React, { useCallback, useContext, useReducer } from "react";
import { toArray } from "@/utils/helpers";
import {
  getAllPermissions,
  getRoles,
  getTenants,
  getUserRoles,
  getUsers,
} from "@/utils/auth/adminService";
import {
  AdminActionContext,
  AdminStateContext,
  INITIAL_STATE,
} from "./context";
import { setAdminState } from "./actions";
import { AdminReducer } from "./reducer";

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(AdminReducer, INITIAL_STATE);

  const fetchUsers = useCallback(async () => {
    dispatch(setAdminState({ isLoadingUsers: true, errorMessage: null }));

    try {
      const result = await getUsers();
      dispatch(
        setAdminState({
          users: toArray(result.items),
          totalUsersCount: result.totalCount ?? 0,
        }),
      );
    } catch (error: unknown) {
      dispatch(
        setAdminState({
          errorMessage:
            error instanceof Error ? error.message : "Failed to load users.",
        }),
      );
    } finally {
      dispatch(setAdminState({ isLoadingUsers: false }));
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    dispatch(setAdminState({ isLoadingRoles: true, errorMessage: null }));

    try {
      const result = await getRoles();
      dispatch(setAdminState({ roles: toArray(result.items) }));
    } catch (error: unknown) {
      dispatch(
        setAdminState({
          errorMessage:
            error instanceof Error ? error.message : "Failed to load roles.",
        }),
      );
    } finally {
      dispatch(setAdminState({ isLoadingRoles: false }));
    }
  }, []);

  const fetchAssignableRoles = useCallback(async () => {
    dispatch(setAdminState({ isLoadingRoles: true, errorMessage: null }));

    try {
      const result = await getUserRoles();
      dispatch(setAdminState({ assignableRoles: toArray(result.items) }));
    } catch (error: unknown) {
      dispatch(
        setAdminState({
          errorMessage:
            error instanceof Error
              ? error.message
              : "Failed to load assignable roles.",
        }),
      );
    } finally {
      dispatch(setAdminState({ isLoadingRoles: false }));
    }
  }, []);

  const fetchAllPermissions = useCallback(async () => {
    try {
      const result = await getAllPermissions();
      dispatch(setAdminState({ allPermissions: toArray(result.items) }));
    } catch {
      // non-fatal — permissions list just won't populate
    }
  }, []);

  const fetchTenants = useCallback(async () => {
    dispatch(setAdminState({ isLoadingTenants: true, errorMessage: null }));

    try {
      const result = await getTenants();
      dispatch(
        setAdminState({
          tenants: toArray(result.items),
          totalTenantsCount: result.totalCount ?? 0,
        }),
      );
    } catch (error: unknown) {
      dispatch(
        setAdminState({
          errorMessage:
            error instanceof Error ? error.message : "Failed to load tenants.",
        }),
      );
    } finally {
      dispatch(setAdminState({ isLoadingTenants: false }));
    }
  }, []);

  const setActionMessage = useCallback(
    (msg: { type: "success" | "error"; text: string } | null) => {
      dispatch(setAdminState({ actionMessage: msg }));
    },
    [],
  );

  return (
    <AdminStateContext.Provider
      value={{
        users: state.users,
        isLoadingUsers: state.isLoadingUsers,
        totalUsersCount: state.totalUsersCount,
        roles: state.roles,
        assignableRoles: state.assignableRoles,
        isLoadingRoles: state.isLoadingRoles,
        allPermissions: state.allPermissions,
        tenants: state.tenants,
        isLoadingTenants: state.isLoadingTenants,
        totalTenantsCount: state.totalTenantsCount,
        errorMessage: state.errorMessage,
        actionMessage: state.actionMessage,
      }}
    >
      <AdminActionContext.Provider
        value={{
          fetchUsers,
          fetchRoles,
          fetchAssignableRoles,
          fetchTenants,
          fetchAllPermissions,
          setActionMessage,
        }}
      >
        {children}
      </AdminActionContext.Provider>
    </AdminStateContext.Provider>
  );
};

export const useAdminState = () => {
  const context = useContext(AdminStateContext);

  if (context === undefined) {
    throw new Error("useAdminState must be used within an AdminProvider");
  }

  return context;
};

export const useAdminActions = () => {
  const context = useContext(AdminActionContext);

  if (context === undefined) {
    throw new Error("useAdminActions must be used within an AdminProvider");
  }

  return context;
};
