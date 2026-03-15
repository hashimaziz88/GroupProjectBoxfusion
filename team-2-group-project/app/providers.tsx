"use client";

import { ConfigProvider } from "antd";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider>
      {children}
    </ConfigProvider>);
}
