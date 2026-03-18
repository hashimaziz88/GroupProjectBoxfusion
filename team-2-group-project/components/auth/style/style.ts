import { createStyles, css } from "antd-style";

export const useStyles = createStyles(() => ({
  shell: css`
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(8, 145, 178, 0.10) 0%, transparent 30%),
      linear-gradient(180deg, #f3f7fa 0%, #eaf4f8 100%);
  `,

  sider: css`
    &.ant-layout-sider {
      background: #0c1a2e;
      border-right: 1px solid rgba(8, 145, 178, 0.18);
    }

    .ant-layout-sider-children {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  `,

  brandBlock: css`
    padding: 28px 22px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,

  brandLogo: css`
    filter: brightness(0) invert(1);
    opacity: 0.92;
  `,

  brandEyebrow: css`
    color: rgba(8, 145, 178, 0.9);
    font-size: 11px;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    font-weight: 700;
  `,

  brandTitle: css`
    &.ant-typography {
      margin: 0;
      color: white;
      letter-spacing: -0.01em;
    }
  `,

  brandText: css`
    &.ant-typography {
      margin: 0;
      color: rgba(186, 218, 230, 0.72);
      font-size: 13px;
      line-height: 1.6;
    }
  `,

  tenantBadge: css`
    &.ant-tag {
      width: fit-content;
      margin: 0;
      border-radius: 999px;
      border: 1px solid rgba(8, 145, 178, 0.32);
      background: rgba(8, 145, 178, 0.12);
      color: #7dd3e8;
      padding: 6px 12px;
    }
  `,

  menu: css`
    &.ant-menu {
      flex: 1;
      background: transparent;
      border-inline-end: none;
      padding: 8px 12px 24px;
    }

    .ant-menu-item {
      border-radius: 14px;
      margin-block: 6px;
    }
  `,

  innerLayout: css`
    &.ant-layout {
      background: transparent;
    }
  `,

  header: css`
    &.ant-layout-header {
      height: auto;
      min-height: 108px;
      padding: 24px 28px 16px;
      background: transparent;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 18px;
      align-items: flex-start;
    }
  `,

  headerCopy: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,

  pageTitle: css`
    &.ant-typography {
      margin: 0;
      color: #0c1a2e;
    }
  `,

  pageSubtitle: css`
    &.ant-typography {
      margin: 0;
      color: #4a6a7c;
      max-width: 760px;
    }
  `,

  headerActions: css`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
    align-items: center;
  `,

  headerTag: css`
    &.ant-tag {
      margin: 0;
      border-radius: 999px;
      border: none;
      background: rgba(8, 145, 178, 0.10);
      color: #0c4a58;
      padding: 7px 12px;
      font-weight: 600;
    }
  `,

  primaryButton: css`
    &.ant-btn {
      height: 42px;
      border: none;
      border-radius: 999px;
      padding-inline: 18px;
      color: white;
      font-weight: 600;
      background: linear-gradient(135deg, #0891b2 0%, #0e4f6b 100%);
    }

    &.ant-btn:hover,
    &.ant-btn:focus {
      color: white !important;
      background: linear-gradient(135deg, #0e9fc3 0%, #0f5a7a 100%) !important;
    }
  `,

  secondaryButton: css`
    &.ant-btn {
      height: 42px;
      border-radius: 999px;
      border-color: #b0cfd8;
      color: #0c1a2e;
      font-weight: 600;
      background: white;
    }
  `,

  content: css`
    padding: 0 28px 28px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  `,
}));
