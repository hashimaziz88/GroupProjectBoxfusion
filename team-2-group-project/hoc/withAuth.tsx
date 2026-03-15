"use client";

import type { ComponentType } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppSpinner from "@/components/spinner/AppSpinner";
import { useAuthState } from "@/providers/authProvider";
import { hasPermission, selectBestAuthenticatedRoute } from "@/utils/auth/roles";

export const withAuth = <P extends object>(
  Component: ComponentType<P>,
  requiredPermission?: string,
) => {
  return function WithAuth(props: P) {
    const router = useRouter();
    const { isReady, isAuthenticated, permissions, user } = useAuthState();

    useEffect(() => {
      if (!isReady) {
        return;
      }

      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      if (
        requiredPermission &&
        !hasPermission(permissions, requiredPermission)
      ) {
        router.replace(selectBestAuthenticatedRoute(user));
      }
    }, [isAuthenticated, isReady, permissions, router, user]);

    if (!isReady) {
      return <AppSpinner label="Loading your session..." />;
    }

    if (!isAuthenticated) {
      return <AppSpinner label="Redirecting to login..." />;
    }

    if (requiredPermission && !hasPermission(permissions, requiredPermission)) {
      return <AppSpinner label="Redirecting to an allowed page..." />;
    }

    return <Component {...props} />;
  };
};
