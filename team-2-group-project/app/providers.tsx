"use client";

import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import { AuthProvider } from "@/providers/authProvider";
import { AdminProvider } from "@/providers/adminProvider";
import { appTheme } from "@/utils/themeSetup";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={appTheme}>
      <AuthProvider>
        <AdminProvider>
          {children}
        </AdminProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}
