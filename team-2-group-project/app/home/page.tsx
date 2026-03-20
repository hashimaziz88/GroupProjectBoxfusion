"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppSpinner from "@/components/spinner/AppSpinner";
import { useAuthState } from "@/providers/authProvider";
import { selectBestAuthenticatedRoute } from "@/utils/auth/roles";

export default function HomePageRedirect() {
  const router = useRouter();
  const { user } = useAuthState();

  useEffect(() => {
    const destination = selectBestAuthenticatedRoute(user);
    router.replace(destination === "/home" ? "/profile" : destination);
  }, [router, user]);

  return <AppSpinner label="Redirecting..." />;
}
