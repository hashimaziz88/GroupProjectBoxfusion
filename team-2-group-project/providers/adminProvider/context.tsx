"use client";

import { createContext } from "react";
import {
  IFlatPermissionDto,
  IRoleListItem,
  ITenantListItem,
  IUserListItem,
} from "@/interfaces/auth/adminService";

export interface IAdminStateContext {
  // Users
  users: IUserListItem[];
  isLoadingUsers: boolean;
  totalUsersCount: number;
  // Roles
  roles: IRoleListItem[];
  isLoadingRoles: boolean;
  allPermissions: IFlatPermissionDto[];
  // Tenants
  tenants: ITenantListItem[];
  isLoadingTenants: boolean;
  totalTenantsCount: number;
  // Feedback
  errorMessage: string | null;
  actionMessage: { type: "success" | "error"; text: string } | null;
}

export interface IAdminActionContext {
  fetchUsers: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchTenants: () => Promise<void>;
  fetchAllPermissions: () => Promise<void>;
  setActionMessage: (msg: { type: "success" | "error"; text: string } | null) => void;
}

export const INITIAL_STATE: IAdminStateContext = {
  users: [],
  isLoadingUsers: false,
  totalUsersCount: 0,
  roles: [],
  isLoadingRoles: false,
  allPermissions: [],
  tenants: [],
  isLoadingTenants: false,
  totalTenantsCount: 0,
  errorMessage: null,
  actionMessage: null,
};

export const AdminStateContext =
  createContext<IAdminStateContext>(INITIAL_STATE);
export const AdminActionContext =
  createContext<IAdminActionContext>(undefined!);
