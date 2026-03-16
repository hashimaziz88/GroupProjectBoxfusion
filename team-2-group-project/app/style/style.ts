import { createStyles, css } from "antd-style";

export const useStyles = createStyles(() => ({
  shell: css`
    min-height: 100vh;
    background:
      radial-gradient(
        circle at top left,
        rgba(31, 111, 235, 0.12) 0%,
        transparent 28%
      ),
      linear-gradient(180deg, #f4f7fb 0%, #edf3fb 100%);
  `,

  sider: css`
    &.ant-layout-sider {
      background: #0f172a;
      border-right: 1px solid rgba(148, 163, 184, 0.14);
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

  brandEyebrow: css`
    color: rgba(255, 255, 255, 0.72);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
  `,

  brandTitle: css`
    &.ant-typography {
      margin: 0;
      color: white;
    }
  `,

  brandText: css`
    &.ant-typography {
      margin: 0;
      color: rgba(226, 232, 240, 0.72);
      font-size: 13px;
      line-height: 1.6;
    }
  `,

  tenantBadge: css`
    &.ant-tag {
      width: fit-content;
      margin: 0;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.22);
      background: rgba(255, 255, 255, 0.08);
      color: white;
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
      color: #0f172a;
    }
  `,

  pageSubtitle: css`
    &.ant-typography {
      margin: 0;
      color: #64748b;
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
      background: rgba(15, 23, 42, 0.08);
      color: #0f172a;
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
      background: linear-gradient(135deg, #1f6feb 0%, #3251a8 100%);
    }
  `,

  secondaryButton: css`
    &.ant-btn {
      height: 42px;
      border-radius: 999px;
      border-color: #cbd5e1;
      color: #0f172a;
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

  pageCard: css`
    &.ant-card {
      border-radius: 24px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.07);
    }
  `,

  statGrid: css`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  `,

  statCard: css`
    border-radius: 20px;
    padding: 20px;
    background: linear-gradient(180deg, #fbfdff 0%, #f4f8ff 100%);
    border: 1px solid #dbe5f4;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  statLabel: css`
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  `,

  statValue: css`
    color: #0f172a;
    font-size: 28px;
    font-weight: 700;
  `,

  statHint: css`
    color: #475569;
    font-size: 14px;
  `,

  tagRow: css`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  `,

  infoTag: css`
    &.ant-tag {
      margin: 0;
      border-radius: 999px;
      padding: 7px 12px;
      border: 1px solid #d6e3f8;
      background: #f7faff;
      color: #214a84;
    }
  `,

  sectionTitle: css`
    &.ant-typography {
      margin: 0 0 12px;
      color: #0f172a;
    }
  `,

  sectionLead: css`
    &.ant-typography {
      margin: 0 0 16px;
      color: #64748b;
    }
  `,

  table: css`
    .ant-table-container {
      border-radius: 18px !important;
      overflow: hidden;
    }
  `,

  alert: css`
    &.ant-alert {
      border-radius: 18px;
    }
  `,

  formStack: css`
    display: flex;
    flex-direction: column;
    gap: 18px;
  `,

  formActions: css`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  `,
}));
