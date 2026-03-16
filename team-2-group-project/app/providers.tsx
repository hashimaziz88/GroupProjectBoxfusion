"use client";

import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import { AuthProvider } from "@/providers/authProvider";
import { DataSentinelProvider } from "@/providers/dataSentinelProvider";
import { appTheme } from "@/utils/themeSetup";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={appTheme}>
      <AuthProvider>
        <DataSentinelProvider>{children}</DataSentinelProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}
