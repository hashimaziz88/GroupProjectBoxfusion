import type { ThemeConfig } from "antd";

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: "#0891b2",
    colorInfo: "#0891b2",
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
      headerBg: "#0c1a2e",
      siderBg: "#0c1a2e",
      triggerBg: "#0c1a2e",
    },
    Card: {
      borderRadiusLG: 20,
    },
    Table: {
      headerBg: "#e4f0f5",
      rowHoverBg: "#f4fbfd",
    },
    Menu: {
      darkItemBg: "#0c1a2e",
      darkSubMenuItemBg: "#0c1a2e",
      darkItemSelectedBg: "#0e3347",
      darkItemHoverBg: "#122840",
    },
  },
};
