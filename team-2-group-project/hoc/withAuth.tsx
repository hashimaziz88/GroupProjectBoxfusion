"use client";

import type { ComponentType } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AccessDeniedState from "@/components/auth/AccessDeniedState";
import AppSpinner from "@/components/spinner/AppSpinner";
import { useAuthState } from "@/providers/authProvider";
import { hasPermission, selectBestAuthenticatedRoute } from "@/utils/auth/roles";

interface IWithAuthOptions {
  requiredPermission?: string;
  requiredPermissionsAny?: string[];
  requireTenantContext?: boolean;
  requireHostContext?: boolean;
  unauthorizedBehavior?: "redirect" | "inline";
  deniedTitle?: string;
  deniedMessage?: string;
}

const normalizeOptions = (
  config?: string | IWithAuthOptions,
): IWithAuthOptions => {
  if (!config) {
    return {};
  }

  if (typeof config === "string") {
    return { requiredPermission: config };
  }

  return config;
};

export const withAuth = <P extends object>(
  Component: ComponentType<P>,
  config?: string | IWithAuthOptions,
) => {
  return function WithAuth(props: P) {
    const router = useRouter();
    const { isReady, isAuthenticated, permissions, user, currentTenant } =
      useAuthState();
    const options = normalizeOptions(config);
    const hasTenantContext = Boolean(currentTenant?.tenantId);
    const violatesTenantContext =
      (options.requireTenantContext && !hasTenantContext) ||
      (options.requireHostContext && hasTenantContext);
    const lacksPermission =
      Boolean(options.requiredPermission) &&
      !hasPermission(permissions, options.requiredPermission!);
    const lacksAnyRequiredPermission =
      Boolean(options.requiredPermissionsAny?.length) &&
      !options.requiredPermissionsAny!.some((permission) =>
        hasPermission(permissions, permission),
      );
    const isUnauthorized =
      violatesTenantContext || lacksPermission || lacksAnyRequiredPermission;

    useEffect(() => {
      if (!isReady) {
        return;
      }

      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      if (
        options.unauthorizedBehavior !== "inline" &&
        isUnauthorized
      ) {
        router.replace(selectBestAuthenticatedRoute(user));
      }
    }, [isAuthenticated, isReady, isUnauthorized, options.unauthorizedBehavior, router, user]);

    if (!isReady) {
      return <AppSpinner label="Loading your session..." />;
    }

    if (!isAuthenticated) {
      return <AppSpinner label="Redirecting to login..." />;
    }

    if (isUnauthorized && options.unauthorizedBehavior !== "inline") {
      return <AppSpinner label="Redirecting to an allowed page..." />;
    }

    if (isUnauthorized) {
      return (
        <AccessDeniedState
          title={options.deniedTitle}
          subtitle={options.deniedMessage}
          redirectHref={selectBestAuthenticatedRoute(user)}
        />
      );
    }

    return <Component {...props} />;
  };
};
