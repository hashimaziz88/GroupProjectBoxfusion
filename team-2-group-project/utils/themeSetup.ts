import type { ThemeConfig } from "antd";

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: "#1f6feb",
    colorInfo: "#1f6feb",
    colorSuccess: "#2f9e44",
    colorWarning: "#f08c00",
    colorError: "#d6336c",
    borderRadius: 16,
    fontFamily: "var(--font-geist-sans), sans-serif",
    colorBgBase: "#f3f6fb",
  },
  components: {
    Layout: {
      bodyBg: "#f3f6fb",
      headerBg: "#0f172a",
      siderBg: "#0f172a",
      triggerBg: "#0f172a",
    },
    Card: {
      borderRadiusLG: 20,
    },
    Table: {
      headerBg: "#e8eef8",
      rowHoverBg: "#f6f9ff",
    },
    Menu: {
      darkItemBg: "#0f172a",
      darkSubMenuItemBg: "#0f172a",
      darkItemSelectedBg: "#1f2937",
      darkItemHoverBg: "#172036",
    },
  },
};
