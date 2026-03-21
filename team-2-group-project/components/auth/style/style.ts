import { createStyles, css } from "antd-style";

export const useStyles = createStyles(() => ({
  shell: css`
    height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(8, 145, 178, 0.10) 0%, transparent 30%),
      linear-gradient(180deg, #f3f7fa 0%, #eaf4f8 100%);
  `,

  sider: css`
    &.ant-layout-sider {
      background: #0c1a2e;
      border-right: 1px solid rgba(8, 145, 178, 0.18);
      height: 100vh !important;
      overflow: visible !important;
    }

    &.ant-layout-sider-zero-width {
      .ant-layout-sider-children {
        display: none;
      }
    }

    .ant-layout-sider-children {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  `,

  brandBlock: css`
    padding: 14px 14px 8px;
    display: flex;
    flex-direction: column;
    gap: 5px;
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
      font-size: 11px;
      line-height: 1.5;
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
      font-size: 11px;
      padding: 2px 10px;
    }
  `,

  menu: css`
    &.ant-menu {
      flex: 1;
      background: transparent;
      border-inline-end: none;
      padding: 4px 8px 12px;
    }

    .ant-menu-item {
      border-radius: 8px;
      margin-block: 2px;
    }
  `,

  innerLayout: css`
    &.ant-layout {
      background: transparent;
      min-width: 0;
      overflow-y: auto;
      height: 100vh;
    }
  `,

  header: css`
    &.ant-layout-header {
      height: auto;
      width: min(100%, 1440px);
      margin: 0 auto;
      padding: 12px 18px 8px;
      background: transparent;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
      align-items: center;
    }
  `,

  headerCopy: css`
    display: flex;
    flex-direction: column;
    gap: 2px;
  `,

  pageTitle: css`
    &.ant-typography {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #0c1a2e;
    }
  `,

  pageSubtitle: css`
    &.ant-typography {
      margin: 0;
      font-size: 12px;
      color: #4a6a7c;
      max-width: 560px;
    }
  `,

  headerActions: css`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 6px;
    align-items: center;
  `,

  headerTag: css`
    &.ant-tag {
      margin: 0;
      border-radius: 999px;
      border: none;
      background: rgba(8, 145, 178, 0.10);
      color: #0c4a58;
      font-size: 12px;
      padding: 3px 10px;
      font-weight: 600;
    }
  `,

  primaryButton: css`
    &.ant-btn {
      height: 32px;
      border: none;
      border-radius: 999px;
      padding-inline: 16px;
      font-size: 13px;
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
      height: 32px;
      border-radius: 999px;
      border-color: #b0cfd8;
      font-size: 13px;
      color: #0c1a2e;
      font-weight: 600;
      background: white;
    }
  `,

  content: css`
    width: min(100%, 1440px);
    margin: 0 auto;
    padding: 0 18px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,
}));
