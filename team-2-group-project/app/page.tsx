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

    if (isAuthenticated) {
      router.replace(selectBestAuthenticatedRoute(user));
      return;
    }

    router.replace("/landing");
  }, [isAuthenticated, isReady, router, user]);

  return <AppSpinner label="Loading DataSentinel..." />;
}
