"use client";

import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import { AuthProvider } from "@/providers/authProvider";
import { appTheme } from "@/utils/themeSetup";
import { MonitoringInfrastructureProvider } from "@/providers/monitoringInfrastructureProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={appTheme}>
      <AuthProvider>
        <MonitoringInfrastructureProvider>{children}</MonitoringInfrastructureProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}
