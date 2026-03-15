"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppSpinner from "@/components/spinner/AppSpinner";
import { useAuthState } from "@/providers/authProvider";
import { selectBestAuthenticatedRoute } from "@/utils/auth/roles";

export default function EntryPage() {
  const router = useRouter();
  const { isAuthenticated, isReady, user } = useAuthState();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    router.replace(selectBestAuthenticatedRoute(user));
  }, [isAuthenticated, isReady, router, user]);

  return <AppSpinner label="Preparing your workspace..." />;
}
