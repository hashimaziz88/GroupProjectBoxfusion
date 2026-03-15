import { createStyles } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  layout: {
    minHeight: "100vh",
    background: token.colorBgLayout,
    display: "flex",
    justifyContent: "center",
  },

  content: {
    width: "100%",
    maxWidth: 1100,
    padding: "80px 24px",
  },

  stack: {
    width: "100%",
  },

  eyebrow: {
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },

  intro: {
    maxWidth: 720,
  },

  title: {
    marginBottom: token.marginSM,
  },

  description: {
    color: token.colorTextSecondary,
  },

  card: {
    borderRadius: token.borderRadiusLG,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: token.marginXS,
  },

  cardLabel: {
    display: "block",
    fontWeight: 600,
    marginBottom: token.marginXS,
    color: token.colorPrimary,
  },
}));
